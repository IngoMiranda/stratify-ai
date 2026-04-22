import React, { useState, useEffect } from 'react';
import { Plus, Globe, Instagram, MessageCircle, MoreVertical, Trash2, Search, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Competitor {
  id: string;
  name: string;
  website: string;
  social_media: string;
  positioning: string;
  offerings: string;
}

export default function Competitors() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    social_media: '',
    positioning: '',
    offerings: ''
  });

  const fetchCompetitors = async () => {
    const res = await fetch('/api/competitors');
    setCompetitors(await res.json());
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/competitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ name: '', website: '', social_media: '', positioning: '', offerings: '' });
    setIsAdding(false);
    setLoading(false);
    fetchCompetitors();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Concorrentes</h1>
          <p className="text-xs text-slate-500">Monitoramento e análise de posicionamento.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={16} />
          Novo Registro
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 geo-shadow"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Nome da Empresa" value={formData.name} onChange={v => setFormData({...formData, name: v})} required />
                <Input label="Website" placeholder="https://..." value={formData.website} onChange={v => setFormData({...formData, website: v})} />
                <Input label="Redes Sociais" placeholder="Instagram, LinkedIn..." value={formData.social_media} onChange={v => setFormData({...formData, social_media: v})} />
              </div>
              <div className="space-y-4">
                <Textarea label="Posicionamento Atual" placeholder="Como eles se vendem?" value={formData.positioning} onChange={v => setFormData({...formData, positioning: v})} />
                <Textarea label="Principais Ofertas" placeholder="Produtos ou serviços chave" value={formData.offerings} onChange={v => setFormData({...formData, offerings: v})} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">Cancelar</button>
                <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Salvando...' : 'Salvar Concorrente'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {competitors.map((comp) => (
          <CompetitorCard key={comp.id} competitor={comp} />
        ))}
      </div>

      {competitors.length === 0 && !isAdding && (
         <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <Users className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 font-medium">Nenhum concorrente cadastrado ainda.</p>
         </div>
      )}
    </div>
  );
}

const CompetitorCard = ({ competitor }: { competitor: Competitor }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const runQuickAnalysis = async () => {
    setAnalyzing(true);
    try {
      const type = 'SWOT e Diferenciação';
      const res = await fetch('/api/ai/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorData: competitor })
      });
      const data = await res.json();
      
      if (res.ok && data.result) {
        setAnalysis(data.result);
        await fetch('/api/analyses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ competitorId: competitor.id, type, content: data.result })
        });
      } else {
        setAnalysis(data.error || data.result || "Falha ao gerar análise.");
      }
    } catch (e) {
      console.error(e);
      setAnalysis("Erro na comunicação com o servidor.");
    }
    setAnalyzing(false);
  };

  return (
    <motion.div 
      layout
      className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col geo-shadow hover:border-blue-100 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
          <Globe size={20} />
        </div>
        <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={18}/></button>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-1">{competitor.name}</h3>
      <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold mb-4">
        <Globe size={12} />
        <a href={competitor.website} target="_blank" rel="noreferrer" className="hover:underline opacity-80">{competitor.website.replace('https://', '')}</a>
      </div>

      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 flex-1 mb-6">
        {competitor.positioning || "Sem posicionamento cadastrado."}
      </p>

      <div className="pt-4 border-t border-slate-50 flex gap-2">
        <button 
           onClick={runQuickAnalysis}
           disabled={analyzing}
           className="flex-1 bg-[#0F172A] text-white text-[10px] uppercase tracking-wider font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
        >
          {analyzing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <BrainCircuit size={14} />
          )}
          Análise AI
        </button>
      </div>

      {analysis && (
        <div className="mt-4 p-4 bg-blue-50 rounded-2xl text-[10px] text-slate-700 max-h-40 overflow-y-auto font-mono whitespace-pre-wrap border border-blue-100">
          {analysis}
        </div>
      )}
    </motion.div>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-500 uppercase ml-1">{label}</label>
    <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm" />
  </div>
);

const Textarea = ({ label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-500 uppercase ml-1">{label}</label>
    <textarea {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm min-h-24" />
  </div>
);

const Users = ({ className, size }: any) => <Globe className={className} size={size} />;
