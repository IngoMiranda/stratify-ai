import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import db from './db.ts';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_RPM = parseInt(process.env.MAX_RPM || '8', 10);
const MAX_RPD = parseInt(process.env.MAX_RPD || '200', 10);
const RETRY_DELAY_MS = 10000; // 10s wait on 429
const MAX_RETRIES = 3;

interface QueueItem {
  prompt: string;
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
  retries: number;
}

class GeminiService {
  private queue: QueueItem[] = [];
  private isProcessing = false;

  private hashPrompt(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }

  private getCachedResponse(hash: string): string | null {
    const stmt = db.prepare('SELECT response_text FROM gemini_cache WHERE prompt_hash = ?');
    const row = stmt.get(hash) as { response_text: string } | undefined;
    return row ? row.response_text : null;
  }

  private saveCachedResponse(hash: string, prompt: string, response: string) {
    const stmt = db.prepare('INSERT OR IGNORE INTO gemini_cache (prompt_hash, prompt_text, response_text) VALUES (?, ?, ?)');
    stmt.run(hash, prompt, response);
  }

  private checkRateLimits(): { canProceed: boolean; reason?: string; isDailyLimit?: boolean } {
    const now = new Date();
    
    // Check RPD (Requests per Day)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const rpdCount = (db.prepare('SELECT COUNT(*) as count FROM api_usage WHERE created_at >= ?').get(startOfDay) as any).count;
    
    if (rpdCount >= MAX_RPD) {
      return { canProceed: false, reason: 'Daily limit reached', isDailyLimit: true };
    }

    // Check RPM (Requests per Minute)
    const oneMinAgo = new Date(now.getTime() - 60000).toISOString();
    const rpmCount = (db.prepare('SELECT COUNT(*) as count FROM api_usage WHERE created_at >= ?').get(oneMinAgo) as any).count;
    
    if (rpmCount >= MAX_RPM) {
      return { canProceed: false, reason: 'Minute limit reached', isDailyLimit: false };
    }

    return { canProceed: true };
  }

  private logApiUsage(requestType: string) {
    db.prepare('INSERT INTO api_usage (request_type) VALUES (?)').run(requestType);
  }

  private compactPrompt(prompt: string): string {
    // Basic token reduction strategy: trim excess whitespace, limit max length if insanely huge
    // Assuming ~4 chars per token, 8000 tokens ~ 32000 chars. Let's hardcap at 30k chars for safety.
    let compacted = prompt.replace(/\s+/g, ' ').trim();
    if (compacted.length > 30000) {
      compacted = compacted.substring(0, 30000) + '... [TRUNCATED]';
    }
    return compacted;
  }

  public async generateContent(prompt: string): Promise<string> {
    const compactedPrompt = this.compactPrompt(prompt);
    const hash = this.hashPrompt(compactedPrompt);

    // 1. Check Cache First
    const cached = this.getCachedResponse(hash);
    if (cached) {
      return cached;
    }

    // 2. Add to Queue
    return new Promise((resolve, reject) => {
      this.queue.push({ prompt: compactedPrompt, resolve, reject, retries: 0 });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const item = this.queue[0];
    const hash = this.hashPrompt(item.prompt);

    const limitCheck = this.checkRateLimits();

    if (!limitCheck.canProceed) {
      if (limitCheck.isDailyLimit) {
        // Degraded Mode
        item.resolve("[DEGRADED MODE] Daily limit reached. Cached response not available for this new prompt.");
        this.queue.shift();
      } else {
        // Wait and retry for RPM limit
        setTimeout(() => {
          this.isProcessing = false;
          this.processQueue();
        }, 10000); // Wait 10 seconds and try again
        return;
      }
    } else {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: item.prompt,
        });

        const text = response.text || '';
        this.saveCachedResponse(hash, item.prompt, text);
        this.logApiUsage('generateContent');
        
        item.resolve(text);
        this.queue.shift();
      } catch (error: any) {
        if (error.status === 429 && item.retries < MAX_RETRIES) {
          item.retries++;
          setTimeout(() => {
            this.isProcessing = false;
            this.processQueue();
          }, RETRY_DELAY_MS * item.retries);
          return;
        } else {
          item.reject(error);
          this.queue.shift();
        }
      }
    }

    this.isProcessing = false;
    
    // Slight delay between queue items to prevent sudden bursts
    setTimeout(() => {
      this.processQueue();
    }, 2000);
  }

  public getStatus() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const oneMinAgo = new Date(now.getTime() - 60000).toISOString();
    
    const rpdCount = (db.prepare('SELECT COUNT(*) as count FROM api_usage WHERE created_at >= ?').get(startOfDay) as any).count;
    const rpmCount = (db.prepare('SELECT COUNT(*) as count FROM api_usage WHERE created_at >= ?').get(oneMinAgo) as any).count;

    return {
      rpd: { used: rpdCount, max: MAX_RPD },
      rpm: { used: rpmCount, max: MAX_RPM },
      queueLength: this.queue.length
    };
  }
}

export const geminiService = new GeminiService();
