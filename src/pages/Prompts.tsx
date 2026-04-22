import React from 'react';
import { MessageSquare, Copy, Check, Star, Info } from 'lucide-react';
import { motion } from 'motion/react';

const PROMPT_TEMPLATES = [
  {
    title: "Análise SWOT Premium",
    description: "Gera força, fraqueza, oportunidade e ameaça com foco em diferenciação.",
    category: "Análise",
    prompt: "Aja como um consultor de marketing sênior. Faça uma análise SWOT completa do concorrente {NOME}, baseando-se em sua comunicação e oferta. Identifique brechas de mercado que possamos explorar."
  },
  {
    title: "Script de Abordagem",
    description: "Cria scripts de vendas focados em converter clientes do concorrente.",
    category: "Vendas",
    prompt: "Crie 3 scripts de abordagem para clientes que atualmente usam o concorrente {NOME}. Foque em destacar como somos melhores em [DIFERENCIAL]."
  },
  {
    title: "Estratégia de Conteúdo",
    description: "Sugere linha editorial baseada nas falhas do concorrente.",
    category: "Marketing",
    prompt: "Analise o posicionamento de {NOME}. Sugira uma linha editorial de 7 dias para Instagram que ataque as principais fraquezas deles sem citar nomes."
  },
  {
    title: "Benchmark de Preços",
    description: "Ajuda a estruturar uma oferta mais competitiva.",
    category: "Produto",
    prompt: "Baseado na oferta de {NOME}, sugira uma estrutura de bônus ou garantia que torne nossa oferta [PRODUTO] irresistível em comparação."
  }
];

export default function Prompts() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Templates de Prompt</h1>
          <p className="text-xs text-slate-500">Prompts pré-configurados para melhores resultados.</p>
        </div>
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
          <Star size={14} fill="currentColor" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Variáveis: {`{NOME}`}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROMPT_TEMPLATES.map((template, idx) => (
          <PromptCard key={idx} template={template} />
        ))}
      </div>

      <div className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-blue-900/20">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">Precisa de um prompt sob medida?</h3>
          <p className="text-blue-100 text-xs font-medium">Nossa equipe pode ajudar você a criar automações customizadas.</p>
        </div>
        <button className="bg-white text-blue-600 px-6 py-2 rounded-lg text-xs font-bold hover:bg-white/90 transition-all w-full md:w-auto">
          Solicitar agora
        </button>
      </div>
    </div>
  );
}

const PromptCard = ({ template }: { template: typeof PROMPT_TEMPLATES[0] }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(template.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 geo-shadow flex flex-col relative overflow-hidden group hover:border-blue-100 transition-all"
    >
      <div className="absolute top-0 right-0 py-1 px-3 bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest rounded-bl-lg border-l border-b border-slate-50">
        {template.category}
      </div>
      
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        <MessageSquare size={18} />
      </div>

      <h4 className="text-base font-bold text-slate-800 mb-1">{template.title}</h4>
      <p className="text-xs text-slate-500 mb-4 flex-1 leading-relaxed">{template.description}</p>

      <div className="bg-slate-50 p-4 rounded-xl mb-4 relative">
        <p className="text-[10px] text-slate-600 font-mono italic line-clamp-3">
          "{template.prompt}"
        </p>
      </div>

      <button 
        onClick={copyToClipboard}
        className={cn(
          "w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all",
          copied ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-black"
        )}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copiado!' : 'Copiar Prompt'}
      </button>
    </motion.div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
