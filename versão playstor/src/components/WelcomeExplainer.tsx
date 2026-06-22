import React from "react";
import { 
  Sparkles, CheckCircle, ShieldCheck, Flame, TrendingUp, Users, DollarSign, ArrowRight, Info, HelpCircle
} from "lucide-react";
import { AuthUser } from "../types";

interface WelcomeExplainerProps {
  currentUser: AuthUser;
  onDismiss: () => void;
}

export default function WelcomeExplainer({ currentUser, onDismiss }: WelcomeExplainerProps) {
  return (
    <div 
      id="welcome-explainer-backdrop" 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in"
    >
      <div 
        id="welcome-explainer-modal" 
        className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col justify-between transition-colors duration-300 max-h-[92vh] overflow-y-auto scrollbar-thin"
      >
        {/* Background glow flares */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-650/10 dark:bg-red-650/20 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 dark:bg-amber-600/10 blur-[80px] pointer-events-none" />

        {/* Header Block */}
        <div className="relative mb-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black text-lg tracking-tight shadow-lg shadow-red-500/30 mb-4 animate-bounce">
            BP
          </div>
          <span className="text-xs font-black tracking-widest text-red-600 dark:text-red-400 uppercase bg-red-50 dark:bg-red-950/45 px-3 py-1 rounded-full border border-red-250/20">
            Acesso Confirmado 🎉
          </span>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-3">
            Bem-vindo ao BurguerPrime, <span className="text-red-600">{currentUser.name}</span>!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 max-w-lg leading-relaxed">
            Aqui está uma breve e poderosa introdução de como esta plataforma inovadora vai turbinar a sua hamburgueria daqui em diante.
          </p>
        </div>

        {/* Explanations & Benefits Grid */}
        <div className="space-y-4 mb-8 relative">
          
          {/* Section 1: What is the App */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
            <div className="flex gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-950 text-red-600 rounded-lg shrink-0 flex items-center justify-center h-9 w-9">
                <Flame className="w-5 h-5 fill-red-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">O que é o BurguerPrime?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  É um <strong>Sistema CRM Comercial + Simulador Financeiro inteligente</strong> completo, concebido especialmente para Hamburguerias em Angola. O BurguerPrime ajuda-o a gerir o funil de clientes e estimar seus ganhos e lucros sem complicação.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Core Benefits */}
          <div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3 px-1">Como você será beneficiado(a)?</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Benefit 1 */}
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 bg-white dark:bg-slate-900/30 flex gap-3 hover:border-slate-200 dark:hover:border-slate-750 transition-all">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg shrink-0 h-7 w-7 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-[11px] font-black uppercase text-slate-855 dark:text-slate-200">Margem e CMV Real</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                    Ajuste o Custo de Mercadoria Vendida (CMV) e calcule os seus lucros reais com exatidão matemática.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 bg-white dark:bg-slate-900/30 flex gap-3 hover:border-slate-200 dark:hover:border-slate-750 transition-all">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg shrink-0 h-7 w-7 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-[11px] font-black uppercase text-slate-855 dark:text-slate-200">CRM de Vendas no WhatsApp</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                    Use scripts comerciais pré-definidos para chamar e reativar clientes que estão há dias sem pedir.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 bg-white dark:bg-slate-900/30 flex gap-3 hover:border-slate-200 dark:hover:border-slate-750 transition-all">
                <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-500 rounded-lg shrink-0 h-7 w-7 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-[11px] font-black uppercase text-slate-855 dark:text-slate-200">Ponto de Equilíbrio Diário</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                    Saiba exatamente quantos hambúrgueres precisa grelhar por dia para cobrir os seus custos fixos e variáveis.
                  </p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3.5 bg-white dark:bg-slate-900/30 flex gap-3 hover:border-slate-200 dark:hover:border-slate-750 transition-all">
                <div className="p-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-650 rounded-lg shrink-0 h-7 w-7 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-[11px] font-black uppercase text-slate-855 dark:text-slate-200">Emissão de Pedidos Reais</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                    Os clientes podem aceder ao painel público com um clique para ver o cardápio e submeter pedidos na hora!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Admin Note */}
          <div className="bg-red-50/20 dark:bg-slate-905 border border-red-200/20 px-3.5 py-2 rounded-xl text-[10px] text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-red-650 shrink-0" />
            <span>Podes rever e aceder a estas informações e gerir o teu perfil a qualquer momento no menu <strong>Dono & Regras</strong>!</span>
          </div>
        </div>

        {/* Action Call Button */}
        <button
          type="button"
          onClick={onDismiss}
          id="btn-dismiss-explainer"
          className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white py-3 border border-red-550 dark:border-none rounded-xl text-xs font-black transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer mt-auto"
        >
          <span>Estou Pronto, Entrar no Sistema BurguerPrime!</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
