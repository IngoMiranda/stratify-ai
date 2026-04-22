import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, Target, ArrowRight, UserPlus, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    competitors: 0,
    strategies: 0,
    analyses: 0
  });
  const [competitorsList, setCompetitorsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, stratRes] = await Promise.all([
          fetch('/api/competitors'),
          fetch('/api/strategies')
        ]);
        const comps = await compRes.json();
        const strats = await stratRes.json();
        setStats({
          competitors: comps.length,
          strategies: strats.length,
          analyses: 0
        });
        setCompetitorsList(comps.slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-xl font-bold text-slate-800">Dashboard Estratégico</h1>
        <p className="text-xs text-slate-500">Visão consolidada do mercado • {new Date().toLocaleDateString('pt-BR')}</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3 bg-white p-5 rounded-2xl geo-shadow border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Concorrentes Monitorados</p>
          <h3 className="text-3xl font-bold text-slate-900">{stats.competitors}</h3>
          <div className="mt-2 text-xs text-green-600 font-medium flex items-center">
            <TrendingUp size={12} className="mr-1" />
            +3 este mês
          </div>
        </div>

        <div className="col-span-12 md:col-span-3 bg-white p-5 rounded-2xl geo-shadow border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Planos Ativos</p>
          <h3 className="text-3xl font-bold text-slate-900">{stats.strategies}</h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4">
            <div className="bg-blue-500 h-1.5 rounded-full w-[45%]"></div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 bg-blue-600 p-6 rounded-2xl shadow-lg text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium">Sugestão da Gemini AI</p>
            <h4 className="text-lg font-bold mt-1 tracking-tight">Expandir presença no LinkedIn</h4>
            <p className="text-blue-200 text-xs mt-2 leading-relaxed opacity-90 max-w-xs">
              Identificamos um gap estratégico na comunicação B2B dos seus principais concorrentes.
            </p>
          </div>
          <Link to="/strategies" className="bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-white/90 transition-colors z-10">
            Gerar Agora
          </Link>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap size={100} />
          </div>
        </div>

        {/* Action Table Section Mockup Area in HTML style */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl geo-shadow border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="font-bold text-slate-800">Principais Players</h2>
            <div className="flex gap-2">
              <Link to="/competitors" className="text-xs font-bold text-blue-600 hover:underline">Ver todos</Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-3">Concorrente</th>
                  <th className="px-6 py-3">Website</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Tendência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {competitorsList.length > 0 ? competitorsList.map(comp => (
                  <tr key={comp.id} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-4 font-semibold">{comp.name}</td>
                    <td className="px-6 py-4 text-blue-600">
                      <a href={comp.website} target="_blank" rel="noreferrer" className="hover:underline">{comp.website?.replace('https://', '')}</a>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">MONITORADO</span></td>
                    <td className="px-6 py-4 text-slate-500">-</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Nenhum player cadastrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel Recommendation */}
        <div className="col-span-12 lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl geo-shadow border border-slate-100 p-5">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center justify-between text-sm">
              <span>Alertas do Mercado</span>
              <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full">NOVOS</span>
            </h2>
            <div className="space-y-4">
               <div className="flex space-x-3">
                  <div className="w-1 h-10 bg-orange-400 rounded-full"></div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">Nova página de preços detectada</h5>
                    <p className="text-[11px] text-slate-500 mt-1">Player principal mudou foco para anual.</p>
                  </div>
               </div>
               <div className="flex space-x-3">
                  <div className="w-1 h-10 bg-blue-400 rounded-full"></div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-tight">Campanha LinkedIn ativa</h5>
                    <p className="text-[11px] text-slate-500 mt-1">Aumento de 20% em menções sociais.</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-2xl p-6 flex-1 relative overflow-hidden text-white min-h-[160px]">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <Target size={80} />
             </div>
             <h4 className="font-bold text-white mb-3 text-sm">Próximo Passo Recomendado</h4>
             <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-slate-300">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Atualizar landing page comparativa</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-300">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span>Revisar oferta de Black Friday</span>
                </li>
             </ul>
             <button className="w-full mt-6 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-[10px] font-bold hover:bg-slate-700 transition-colors uppercase tracking-wider">
               Ver Plano Detalhado
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, color, description }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", colors[color])}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
        <p className="text-slate-400 text-xs mt-2 font-medium">{description}</p>
      </div>
    </motion.div>
  );
};

const QuickActionButton = ({ to, icon: Icon, title, subtitle }: any) => {
  return (
    <Link to={to} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      </div>
      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
    </Link>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
