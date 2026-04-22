import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Zap, Lightbulb, MessageSquare, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './pages/Dashboard';
import Competitors from './pages/Competitors';
import Strategies from './pages/Strategies';
import Prompts from './pages/Prompts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, to }: { icon: any, label: string, to: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group mb-1",
        isActive 
          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
      )}
    >
      <Icon size={18} className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [aiStatus, setAiStatus] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/ai/status');
        setAiStatus(await res.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-[#0F172A] text-white border-r border-slate-800 p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg text-white">S</div>
            <h1 className="text-xl font-bold tracking-tight">STRATOS.AI</h1>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
            <SidebarItem icon={Users} label="Concorrentes" to="/competitors" />
            <SidebarItem icon={Zap} label="Estratégias" to="/strategies" />
            <SidebarItem icon={MessageSquare} label="Templates" to="/prompts" />
          </nav>

          <div className="mt-auto">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Gemini Status</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn("w-2 h-2 rounded-full", aiStatus ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-slate-500")}></div>
                  <span className="text-xs font-semibold text-slate-300">{aiStatus ? 'Conectada' : 'Conectando...'}</span>
                </div>
                {aiStatus && aiStatus.queueLength > 0 && (
                  <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">Fila: {aiStatus.queueLength}</span>
                )}
              </div>
              {aiStatus && (
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  Req/Dia: {aiStatus.rpd?.used}/{aiStatus.rpd?.max}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F172A] text-white border-b border-slate-800 px-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center font-bold text-xs">S</div>
            <span className="font-bold tracking-tight">STRATOS.AI</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              className="fixed inset-0 z-40 md:hidden"
            >
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <aside className="relative w-64 bg-[#0F172A] h-full p-6 space-y-8 shadow-2xl flex flex-col">
                <nav className="space-y-1 pt-12 flex-1">
                   <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
                   <SidebarItem icon={Users} label="Concorrentes" to="/competitors" />
                   <SidebarItem icon={Zap} label="Estratégias" to="/strategies" />
                   <SidebarItem icon={MessageSquare} label="Templates" to="/prompts" />
                </nav>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Gemini Status</p>
                  <div className="flex items-center space-x-2">
                    <div className={cn("w-2 h-2 rounded-full", aiStatus ? "bg-green-500 animate-pulse" : "bg-slate-500")}></div>
                    <span className="text-xs font-semibold text-slate-300">{aiStatus ? 'Conectada' : 'Conectando...'}</span>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 transition-all duration-300">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/competitors" element={<Competitors />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/prompts" element={<Prompts />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
