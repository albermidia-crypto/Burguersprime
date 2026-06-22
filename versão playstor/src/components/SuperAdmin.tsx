import React, { useState, useEffect } from "react";
import { Empresa, AuthUser, ClientProfile } from "../types";
import { 
  Users, TrendingUp, ShieldAlert, Zap, HelpCircle, UserCheck, 
  ToggleLeft, Lock, Edit3, DollarSign, Crown, RefreshCw, AlertTriangle, 
  Layers, CheckCircle, Smartphone, Sliders, Globe, ShoppingBag
} from "lucide-react";

interface SuperAdminProps {
  currentUser: AuthUser;
  onInheritSession: (companyId: string) => void;
  onExitSupportMode?: () => void;
  isSupportModeActive?: boolean;
}

export default function SuperAdmin({ 
  currentUser, 
  onInheritSession,
  onExitSupportMode,
  isSupportModeActive 
}: SuperAdminProps) {
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Load data from LocalStorage
  const loadData = () => {
    setIsLoading(true);
    try {
      const savedCos = localStorage.getItem("burguersprime_companies");
      const savedUsers = localStorage.getItem("burguersprime_registered_users");

      if (savedCos) {
        setCompanies(JSON.parse(savedCos));
      }
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }
    } catch (e) {
      console.error("Erro ao carregar dados do Super-Admin:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4500);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4500);
    }
  };

  // 1. Calculate SaaS KPIs
  const totalCompaniesCount = companies.length;
  const betaCount = companies.filter(c => c.fase_sistema === "beta").length;
  const paidCount = companies.filter(c => c.fase_sistema === "pago").length;

  // Growth = 15.000 Kz, Prime = 35.000 Kz, Free/Beta = 0 Kz
  const mrrTotal = companies.reduce((sum, c) => {
    if (c.fase_sistema === "beta") return sum;
    if (c.plano === "growth") return sum + 15000;
    if (c.plano === "prime") return sum + 35000;
    return sum;
  }, 0);

  // 2. Terminate Beta for ALL companies
  const handleTerminateBetaForAll = () => {
    if (window.confirm("Aviso de Alta Temperatura!\nTem a certeza de que deseja Encerrar a Fase Beta de TODAS as hamburguerias? Isto ativará os limites rígidos dos planos individuais.")) {
      const updated = companies.map(c => ({
        ...c,
        fase_sistema: "pago" as const
      }));
      setCompanies(updated);
      localStorage.setItem("burguersprime_companies", JSON.stringify(updated));
      triggerToast("Fase Beta de todas as empresas encerrada com sucesso! Limites dos planos ativados.");
    }
  };

  // 3. Toggle company status (activo / suspenso)
  const handleToggleStatus = (companyId: string) => {
    const updated = companies.map(c => {
      if (c.id === companyId) {
        const nextStatus = c.status === "activo" ? "suspenso" : "activo";
        triggerToast(`Hamburgueria '${c.nome_negocio}' foi ${nextStatus === "suspenso" ? "suspensa" : "ativada"} com sucesso!`);
        return { ...c, status: nextStatus as any };
      }
      return c;
    });
    setCompanies(updated);
    localStorage.setItem("burguersprime_companies", JSON.stringify(updated));
  };

  // 4. Transform company into paid plan
  const handleDefinePaidPlan = (companyId: string, plan: "growth" | "prime") => {
    const updated = companies.map(c => {
      if (c.id === companyId) {
        triggerToast(`Empresa '${c.nome_negocio}' migrada para o plano Pago ${plan.toUpperCase()}!`);
        return { 
          ...c, 
          fase_sistema: "pago" as const, 
          plano: plan 
        };
      }
      return c;
    });
    setCompanies(updated);
    localStorage.setItem("burguersprime_companies", JSON.stringify(updated));
  };

  // Helper: Get registered clients count for a specific company
  const getCompanyClientsCount = (companyId: string): number => {
    try {
      const clientsStr = localStorage.getItem(`burguersprime_clients_${companyId}`);
      if (clientsStr) {
        const parsed = JSON.parse(clientsStr);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch (e) {}
    
    // Fallback estimate based on static data
    if (companyId === "grelha-real-luanda") return 36;
    if (companyId === "vapor-brasa-benguela") return 12;
    return 0;
  };

  return (
    <div id="super-admin-root" className="space-y-6">
      
      {/* Banner de Indicação Super-Administrador */}
      <div className="bg-[#3D2817] text-[#F4EBD9] border-2 border-[#1A1410] rounded-sm p-4 relative shadow-[2px_2.5px_0_rgba(26,20,16,0.95)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 bg-[#E8A33D] rounded-sm border-2 border-[#1A1410] flex items-center justify-center text-[#3D2817] shrink-0 rotate-[-1deg]">
            <Crown className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-black text-[#E8A33D] tracking-widest bg-[#1A1410]/40 px-2 py-0.5 rounded">
              MODO ADMIN DE CONTROLO SAAS
            </span>
            <h2 className="font-display font-bold text-lg leading-tight uppercase tracking-wide mt-1">
              Consola de Grelha Central do BURGUERSPRIME
            </h2>
            <p className="text-xs text-[#F4EBD9]/80 font-sans">
              Bem-vindo, Administrador <strong className="text-[#E8A33D]">{currentUser.name}</strong>. Gere o faturamento, planos e status das hamburguerias registadas em Angola.
            </p>
          </div>
        </div>

        {isSupportModeActive && onExitSupportMode && (
          <button
            onClick={onExitSupportMode}
            className="btn-brasa bg-red-600 border-red-800 hover:bg-red-700 text-xs px-4 py-2 uppercase tracking-wider flex items-center gap-1.5 shrink-0"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>Sair do Modo de Suporte Simulado</span>
          </button>
        )}
      </div>

      {toastFeedback(successMsg, errorMsg)}

      {/* 1. KPIs SaaS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI: Total Hamburguerias */}
        <div className="bg-[#F4EBD9] text-[#3D2817] border-2 border-[#3D2817] p-4 rounded-sm shadow-[1.5px_2px_0_rgba(26,20,16,0.9)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black text-[#3D2817]/60 uppercase tracking-widest block">Total Hamburguerias</span>
            <h3 className="font-display font-black text-4xl text-[#3D2817]">{totalCompaniesCount}</h3>
            <span className="text-[9.5px] font-semibold text-[#C44119] block">Empresas registadas</span>
          </div>
          <div className="p-3 bg-[#3D2817]/5 border border-[#3D2817]/15 rounded">
            <Users className="w-6 h-6 text-[#C44119]" />
          </div>
        </div>

        {/* KPI: Beta vs Pago */}
        <div className="bg-[#F4EBD9] text-[#3D2817] border-2 border-[#3D2817] p-4 rounded-sm shadow-[1.5px_2px_0_rgba(26,20,16,0.9)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black text-[#3D2817]/60 uppercase tracking-widest block">Fase: Em Teste / A Pagar</span>
            <h3 className="font-display font-black text-4xl text-[#3D2817]">{betaCount}<span className="text-[#3D2817]/40 text-xl font-normal"> / {paidCount}</span></h3>
            <span className="text-[9.5px] font-semibold text-[#7A8B6F] block">{betaCount} Em Teste (Beta)</span>
          </div>
          <div className="p-3 bg-[#3D2817]/5 border border-[#3D2817]/15 rounded">
            <Layers className="w-6 h-6 text-[#7A8B6F]" />
          </div>
        </div>

        {/* KPI: MRR Esperado */}
        <div className="bg-[#F4EBD9] text-[#3D2817] border-2 border-[#3D2817] p-4 rounded-sm shadow-[1.5px_2px_0_rgba(26,20,16,0.9)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black text-[#3D2817]/60 uppercase tracking-widest block">Faturação Mensal da Plataforma (MRR)</span>
            <h3 className="font-display font-black text-3xl text-[#7A8B6F] break-all">{mrrTotal.toLocaleString()} <span className="text-sm font-sans font-bold">Kz</span></h3>
            <span className="text-[9.5px] font-semibold text-[#3D2817]/70 block">Conversões ativas em Luanda</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* KPI: Preços Referência */}
        <div className="bg-[#F4EBD9] text-[#3D2817] border-2 border-[#3D2817] p-4 rounded-sm shadow-[1.5px_2px_0_rgba(26,20,16,0.9)] flex flex-col justify-between">
          <div className="text-[9px] font-mono font-black text-[#3D2817]/60 uppercase tracking-widest block">Preços de Tabela SaaS</div>
          <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[10px]">
            <div className="p-1 bg-[#3D2817]/5 border border-[#3D2817]/10 rounded">
              <span className="block text-[#C44119] font-bold">GROWTH</span>
              <span>15K Kz/mês</span>
            </div>
            <div className="p-1 bg-[#3D2817]/5 border border-[#3D2817]/10 rounded">
              <span className="block text-[#E8A33D] font-bold">PRIME</span>
              <span>35K Kz/mês</span>
            </div>
          </div>
        </div>

      </div>

      {/* Controlos Globais e Alertas Rápidos de Risco */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Caixa de Transição Global (Left) */}
        <div className="lg:col-span-5 bg-[#F4EBD9] text-[#3D2817] border-2 border-[#3D2817] p-5 rounded-sm shadow-[1.5px_2px_0_rgba(26,20,16,0.9)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#C44119] font-mono font-black text-xs uppercase">
              <Zap className="w-4 h-4 animate-bounce" />
              <span>Transições de Fase de Serviço</span>
            </div>
            <h4 className="font-bebas text-lg tracking-wide uppercase text-[#3D2817] mt-1.5">Acabar com a fase beta colectiva</h4>
            <p className="text-xs text-[#3D2817]/75 leading-relaxed mt-1">
              Esta ação comercial é irreversível. Ao transicionar, todas as empresas ativas sairão da fase <strong className="text-[#C44119] font-extrabold uppercase">Beta</strong> gratuita para a fase de <strong className="text-emerald-700 font-extrabold uppercase">Plano Restrito Pago</strong>. Os limites do plano Free entrarão em vigor para quem não subscreveu.
            </p>
          </div>
          
          <button
            onClick={handleTerminateBetaForAll}
            className="w-full btn-brasa bg-[#C44119] hover:bg-black text-[#F4EBD9] text-xs font-mono font-extrabold py-3 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>TERMINAR FASE BETA DE TODAS DE UMA VEZ</span>
          </button>
        </div>

        {/* Alertas Automáticos de Risco / Conversão (Right) */}
        <div className="lg:col-span-7 bg-[#F4EBD9] text-[#3D2817] border-2 border-[#3D2817] p-5 rounded-sm shadow-[1.5px_2px_0_rgba(26,20,16,0.9)] flex flex-col space-y-3 justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[#E8A33D] font-mono font-black text-xs uppercase">
              <AlertTriangle className="w-4 h-4 text-[#C44119]" />
              <span>Deteção Comercial de Alvos de Upgrade</span>
            </div>
            <h4 className="font-bebas text-lg tracking-wide uppercase text-[#3D2817] mt-1.5">Tráfego Elevado na Grelha Beta</h4>
            <p className="text-xs text-[#3D2817]/75 mb-3 leading-relaxed">
              O sistema monitoriza quem está a registar atividade intensiva na fase gratuita para sugerir a venda agressiva de upgrades ou transição para os planos Growth/Prime.
            </p>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin font-mono text-[10.5px]">
            {companies.map((co) => {
              const clientsCount = getCompanyClientsCount(co.id);
              const isHighUsage = clientsCount >= 30; // 30+ is heavy usage in beta for demo stats
              const coDate = new Date(co.data_criacao);
              const diffDays = Math.ceil((Date.now() - coDate.getTime()) / (1000 * 60 * 60 * 24));
              const isInactive = diffDays > 7;

              if (!isHighUsage && !isInactive) return null;

              return (
                <div key={co.id} className="flex items-center justify-between p-2 rounded border border-[#3D2817]/15 bg-[#3D2817]/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">🏪 {co.nome_negocio}</span>
                    <span className="text-[9px] bg-stone-200 text-stone-850 px-1 py-0.5 rounded uppercase font-bold">{co.plano}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isHighUsage && (
                      <span className="bg-orange-500/20 text-[#C44119] text-[8.5px] font-black px-1.5 py-0.2 rounded border border-[#C44119]/30 uppercase animate-pulse">
                        🔥 ALVO UPGRADE ({clientsCount} clis)
                      </span>
                    )}
                    {isInactive && (
                      <span className="bg-red-500/10 text-red-600 text-[8.5px] font-black px-1.5 py-0.2 rounded border border-red-500/20 uppercase whitespace-nowrap">
                        ☕ INATIVO (+7d)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {companies.every(c => getCompanyClientsCount(c.id) < 30) && (
              <p className="text-xs text-center text-stone-400 py-4 font-sans font-medium">
                Sem anomalias ou alvos intensivos sinalizados no momento. Todas as grelhas equilibradas.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Tabela de Listagem de Empresas */}
      <div className="bg-[#F4EBD9] text-[#3D2817] border-2 border-[#3D2817] rounded-sm shadow-[1.5px_2px_0_rgba(26,20,16,0.9)] overflow-hidden">
        
        {/* Tabela Header */}
        <div className="p-4 bg-[#3D2817] text-[#F4EBD9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bebas text-xl tracking-wider uppercase">LISTAGEM DE TERMINAIS DE BRASA PARTICULARES</h3>
            <p className="text-[10px] text-[#E8A33D] font-mono uppercase tracking-widest leading-none mt-0.5">Mapeamento de Isolamento de Multi-Tenant activo</p>
          </div>
          <button
            onClick={loadData}
            className="p-1.5 bg-[#F4EBD9] border-1.5 border-black rounded shadow-[1px_1.5px_0_rgba(0,0,0,0.9)] text-[#3D2817] hover:bg-[#E8A33D] transition text-xs font-mono font-extrabold uppercase tracking-tight flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Chapa</span>
          </button>
        </div>

        {/* Tabela Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b-2 border-[#3D2817] bg-[#3D2817]/10 font-mono text-[10px] uppercase font-black text-[#3D2817]/70">
                <th className="p-3">Hamburgueria / Slug</th>
                <th className="p-3">E-mail Registo</th>
                <th className="p-3">Plano</th>
                <th className="p-3">Fase</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Métricas Uso</th>
                <th className="p-3 text-right">Ações de Gestão Central</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3D2817]/10 text-xs">
              {companies.map((co) => {
                const clientsCount = getCompanyClientsCount(co.id);
                const coDate = new Date(co.data_criacao);
                const diffDays = Math.ceil((Date.now() - coDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <tr key={co.id} className="hover:bg-[#3D2817]/5 transition">
                    <td className="p-3">
                      <div className="font-extrabold text-sm text-[#3D2817]">{co.nome_negocio}</div>
                      <span className="font-mono text-[9px] text-stone-500 block leading-none mt-0.5">/{co.slug}</span>
                    </td>
                    <td className="p-3 font-mono text-stone-600">{co.email_admin}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-sm font-mono text-[9.5px] font-black uppercase text-center border ${
                        co.plano === "prime" 
                          ? "bg-amber-100 border-amber-300 text-amber-850 font-bold" 
                          : co.plano === "growth" 
                          ? "bg-indigo-100 border-indigo-200 text-indigo-800" 
                          : "bg-stone-100 border-stone-200 text-stone-700"
                      }`}>
                        {co.plano.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-sm font-mono text-[9.5px] font-black uppercase text-center border ${
                        co.fase_sistema === "pago"
                          ? "bg-green-100 border-green-200 text-green-800"
                          : "bg-amber-50 border-amber-200 text-[#C44119]"
                      }`}>
                        {co.fase_sistema === "pago" ? "A PAGAR" : "EM TESTE"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-sm font-mono text-[9.5px] font-black uppercase text-center border ${
                        co.status === "activo"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800"
                          : "bg-red-500/10 border-red-500/20 text-red-650"
                      }`}>
                        {co.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-stone-600 leading-tight">
                      <div className="flex flex-col">
                        <span>👥 {clientsCount} clientes</span>
                        <span className="text-[9px] text-[#C44119] font-bold">📋 {co.tipo_operacao.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex flex-wrap justify-end gap-1.5 max-w-[325px] sm:max-w-none ml-auto">
                        
                        {/* Impor plano pago Growth */}
                        {co.fase_sistema !== "pago" && (
                          <>
                            <button
                              onClick={() => handleDefinePaidPlan(co.id, "growth")}
                              className="px-2 py-1 bg-stone-850 hover:bg-indigo-700 text-white rounded text-[9.5px] font-bold transition flex items-center gap-1 cursor-pointer select-none"
                              title="Migrar para plano pago Growth (15.000 Kz)"
                            >
                              <Layers className="w-3 h-3 text-indigo-300" />
                              <span>Growth</span>
                            </button>
                            <button
                              onClick={() => handleDefinePaidPlan(co.id, "prime")}
                              className="px-2 py-1 bg-stone-850 hover:bg-amber-600 text-white rounded text-[9.5px] font-bold transition flex items-center gap-1 cursor-pointer select-none"
                              title="Migrar para plano pago Prime (35.000 Kz)"
                            >
                              <Crown className="w-3 h-3 text-amber-300" />
                              <span>Prime</span>
                            </button>
                          </>
                        )}

                        {/* Suspender / Activar status */}
                        <button
                          onClick={() => handleToggleStatus(co.id)}
                          className={`px-2.5 py-1 text-[9.5px] font-bold rounded transition flex items-center gap-1 cursor-pointer select-none ${
                            co.status === "activo"
                              ? "bg-red-50 border border-red-200 text-red-650 hover:bg-red-550 hover:text-white"
                              : "bg-green-50 border border-green-200 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                          }`}
                        >
                          <ToggleLeft className="w-3.5 h-3.5 shrink-0" />
                          <span>{co.status === "activo" ? "Suspender" : "Ativar"}</span>
                        </button>

                        {/* Herdar sessão de suporte */}
                        <button
                          onClick={() => onInheritSession(co.id)}
                          className="px-2.5 py-1 bg-[#3D2817] hover:bg-[#C44119] text-[#F4EBD9] text-[9.5px] font-bold font-mono uppercase tracking-wide rounded shadow-[1px_1px_0_rgba(0,0,0,0.8)] transition flex items-center gap-1 cursor-pointer select-none"
                          title="Fazer login simulado com suporte para diagnosticar bugs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Entrar</span>
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}

              {companies.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-stone-400 font-sans font-medium">
                    Nenhuma hamburgueria registada no banco de dados. Convida novos comensais para testar!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Informative schema notice card */}
        <div className="p-4 bg-[#3D2817]/5 border-t border-[#3D2817]/15 leading-relaxed text-[11px] text-[#3D2817]/85 font-mono space-y-1 bg-[#F4EBD9]">
          <p className="flex items-center gap-2 font-black text-amber-850 uppercase text-xs mb-1">
            <ShieldAlert className="w-4 h-4 text-[#C44119]" />
            MEMENTO DESIGN SUPER-ADMIN: isolamento garantido
          </p>
          <p>• Roteador de segurança client-side lê chaves encriptadas encriptadas por `burguersprime_config_&#123;empresaId&#125;`.</p>
          <p>• Suporta redireccionamento dinâmico ao simular sessão. O histórico de modificações é persistido de forma autónoma.</p>
        </div>

      </div>

    </div>
  );
}

function toastFeedback(success: string, error: string) {
  if (success) {
    return (
      <div className="p-3.5 bg-emerald-700 text-emerald-50 border-2 border-emerald-900 rounded shadow-md font-mono text-xs font-black flex items-center gap-2 animate-fade-in animate-pulse">
        <CheckCircle className="w-4 h-4 text-emerald-200" />
        <span>[SUCESSO CENTRAL DE GRELHAS] {success}</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-3.5 bg-red-700 text-red-50 border-2 border-red-900 rounded shadow-md font-mono text-xs font-black flex items-center gap-2 animate-fade-in animate-pulse">
        <AlertTriangle className="w-4 h-4 text-red-200" />
        <span>[AVISO SAAS] {error}</span>
      </div>
    );
  }
  return null;
}
