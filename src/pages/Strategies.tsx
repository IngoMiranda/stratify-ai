import React, { useState, useEffect } from 'react';
import { Zap, Target, BookOpen, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface Strategy {
  id: string;
  title: string;
  goal: string;
  plan: string;
  created_at: string;
}

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    context: ''
  });

  const fetchStrategies = async () => {
    const res = await fetch('/api/strategies');
    setStrategies(await res.json());
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: formData.goal + " " + formData.context })
      });
      const data = await res.json();
      
      if (res.ok && data.result) {
        await fetch('/api/strategies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            goal: formData.goal,
            plan: data.result
          })
        });
        setIsCreating(false);
        setFormData({ title: '', goal: '', context: '' });
        fetchStrategies();
      } else {
        console.error("Failed to generate:", data.error || data.result);
        alert(data.error || "Falha ao gerar a estratégia. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na comunicação com o servidor.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Estratégias de Crescimento</h1>
          <p className="text-xs text-slate-500">Planos de ação gerados por inteligência artificial.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Zap size={16} />
          Novo Plano
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 geo-shadow"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <Input 
                    label="Título do Plano" 
                    placeholder="Ex: Expansão Instagram 2024"
                    value={formData.title} 
                    onChange={v => setFormData({...formData, title: v})}
                    required 
                   />
                   <Input 
                    label="Objetivo Principal" 
                    placeholder="O que você quer alcançar?"
                    value={formData.goal} 
                    onChange={v => setFormData({...formData, goal: v})}
                    required 
                   />
                </div>
                <div className="space-y-4">
                  <Textarea 
                    label="Contexto Adicional" 
                    placeholder="Fale sobre seu negócio, orçamento, limitações..."
                    value={formData.context} 
                    onChange={v => setFormData({...formData, context: v})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  {loading ? 'Gerando Plano...' : 'Gerar Estratégia com IA'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {strategies.map((strat) => (
          <StrategyItem key={strat.id} strategy={strat} />
        ))}
      </div>

      {strategies.length === 0 && !isCreating && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-medium">Nenhuma estratégia gerada ainda.</p>
        </div>
      )}
    </div>
  );
}

const StrategyItem = ({ strategy }: { strategy: Strategy }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden geo-shadow hover:border-blue-100 transition-all"
    >
      <div 
        className="p-5 cursor-pointer flex items-center justify-between group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Target size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{strategy.title}</h3>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{strategy.goal}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-medium">
            {new Date(strategy.created_at).toLocaleDateString()}
          </span>
          <button className={cn("text-slate-400 transition-transform", expanded && "rotate-180")}>
            <Send size={20} className="rotate-90" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/30"
          >
            <div className="p-8 prose prose-slate prose-blue max-w-none">
              <div className="markdown-body text-slate-700 leading-relaxed">
                 <ReactMarkdown>{strategy.plan}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-500 uppercase ml-1">{label}</label>
    <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm" />
  </div>
);

const Textarea = ({ label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-500 uppercase ml-1">{label}</label>
    <textarea {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm min-h-[160px]" />
  </div>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
