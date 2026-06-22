import React, { useState } from "react";
import { SetupConfig, ClientProfile, FinancialMetrics, AuthUser, Empresa } from "../types";
import { 
  Building2, Phone, MapPin, Clock, Instagram, Send, Check, 
  Award, Users, TrendingUp, Sliders, ShieldCheck, 
  Percent, FileText, ToggleLeft, ToggleRight, LogOut, Flame, HelpCircle,
  Database, UploadCloud, DownloadCloud, AlertTriangle, RefreshCw
} from "lucide-react";
import { isSupabaseConfigured, pushDataToSupabase, pullDataFromSupabase } from "../lib/supabase";

interface ProfileProps {
  config: SetupConfig;
  clients: ClientProfile[];
  metrics: FinancialMetrics;
  currentUser?: AuthUser | null;
  onLogOut: () => void;
  onShowGuide?: () => void;
  onUpdateConfig: (newConfig: SetupConfig) => void;
  currentCompany?: Empresa | null;
  onBulkSyncPulled?: (
    config: SetupConfig,
    clients: ClientProfile[],
    metrics: FinancialMetrics,
    burgerComponents?: any[]
  ) => void;
}

export default function Profile({ 
  config, 
  clients, 
  metrics, 
  currentUser, 
  onLogOut, 
  onShowGuide, 
  onUpdateConfig, 
  currentCompany,
  onBulkSyncPulled 
}: ProfileProps) {
  // Enhanced Profile states with LocalStorage backup
  const [address, setAddress] = useState(() => localStorage.getItem("burguersprime_profile_address") || "Av. Pedro de Castro Van-Dúnem Loy, Morro Bento, Luanda");
  const [profilePhone, setProfilePhone] = useState(() => localStorage.getItem("burguersprime_profile_phone") || "+244 931 200 150");
  const [instagram, setInstagram] = useState(() => localStorage.getItem("burguersprime_profile_instagram") || "@burguersprime.ao");
  const [workingHours, setWorkingHours] = useState(() => localStorage.getItem("burguersprime_profile_hours") || "Terça a Domingo: 18h05 - 23h30");
  const [slogan, setSlogan] = useState(() => localStorage.getItem("burguersprime_profile_slogan") || "Sabor Supremo, Grelhado ao Ponto Supremo! 🍔🔥");
  const [isOpen, setIsOpen] = useState(() => {
    const val = localStorage.getItem("burguersprime_profile_is_open");
    return val !== "false";
  });
  
  // Success feedback state
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Supabase sync states
  const [syncingPush, setSyncingPush] = useState(false);
  const [syncingPull, setSyncingPull] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState("");
  const [supabaseStatusType, setSupabaseStatusType] = useState<"success" | "error" | "">("");

  const handlePushSupabase = async () => {
    if (!currentUser || !currentUser.empresaId) {
      setSupabaseStatusMsg("Aviso: Precisas de ter uma empresa activa para poderes enviar dados.");
      setSupabaseStatusType("error");
      return;
    }
    setSyncingPush(true);
    setSupabaseStatusMsg("A enviar todos os teus dados da chapa locais para a nuvem do Supabase...");
    setSupabaseStatusType("");

    // Load custom burger components if exists in local
    const bComponentsStr = localStorage.getItem(`burguersprime_burger_components_${currentUser.empresaId}`) || "[]";
    let bComponents: any[] = [];
    try {
      bComponents = JSON.parse(bComponentsStr);
    } catch (e) {}

    const res = await pushDataToSupabase(
      currentUser.empresaId,
      {
        nome_negocio: currentCompany?.nome_negocio || config.businessName,
        email_admin: currentCompany?.email_admin || currentUser.email,
        plano: currentCompany?.plano || "free",
        fase_sistema: currentCompany?.fase_sistema || "beta",
        status: currentCompany?.status || "activo",
      },
      config,
      clients,
      metrics,
      bComponents
    );

    setSyncingPush(false);
    if (res.success) {
      setSupabaseStatusMsg("Sucesso absoluto! Clientes, métricas financeiras, hambúrgueres e configurações sincronizados com o Supabase!");
      setSupabaseStatusType("success");
    } else {
      setSupabaseStatusMsg(`Erro ao guardar na nuvem do Supabase: ${res.error || "Erro desconhecido"}`);
      setSupabaseStatusType("error");
    }
  };

  const handlePullSupabase = async () => {
    if (!currentUser || !currentUser.empresaId) {
      setSupabaseStatusMsg("Aviso: Precisas de ter uma empresa activa para poderes descarregar dados.");
      setSupabaseStatusType("error");
      return;
    }
    setSyncingPull(true);
    setSupabaseStatusMsg("A descarregar os teus dados guardados no Supabase...");
    setSupabaseStatusType("");

    const res = await pullDataFromSupabase(currentUser.empresaId);
    setSyncingPull(false);

    if (res.success) {
      // Build updated states from pulled values
      const mergedConfig: SetupConfig = {
        hasCompletedOnboarding: res.config?.hasCompletedOnboarding ?? config.hasCompletedOnboarding,
        businessName: res.config?.businessName ?? config.businessName,
        operationType: res.config?.operationType ?? config.operationType,
        ticketMedio: res.config?.ticketMedio ?? config.ticketMedio,
        targetNewClients: config.targetNewClients,
        fixedCosts: res.config?.fixedCosts ?? config.fixedCosts,
        mainChannel: res.config?.mainChannel ?? config.mainChannel,
        hasSalesTeam: config.hasSalesTeam,
        monthlyRevenueTarget: res.config?.monthlyRevenueTarget ?? config.monthlyRevenueTarget,
      };

      const mergedClients = res.clients ?? clients;
      const mergedMetrics = res.metrics ?? metrics;
      const mergedBurgerComponents = res.burgerComponents ?? [];

      if (onBulkSyncPulled) {
        onBulkSyncPulled(mergedConfig, mergedClients, mergedMetrics, mergedBurgerComponents);
      }

      setSupabaseStatusMsg("Sucesso absoluto! Descarregado do Supabase com sucesso. O teu cockpit de Luanda foi atualizado.");
      setSupabaseStatusType("success");
    } else {
      setSupabaseStatusMsg(`Erro ao puxar dados do Supabase: ${res.error || "Erro desconhecido"}`);
      setSupabaseStatusType("error");
    }
  };

  // Math helper stats
  const totalClients = clients.length;
  const loyalCount = clients.filter(c => c.visitFrequency >= 2).length;
  const averageStars = clients.length > 0 
    ? (clients.reduce((acc, c) => acc + (c.averageRating || 0), 0) / clients.length).toFixed(1)
    : "4.8";

  const handleSaveOperationalConfig = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save additional profile details to localStorage
    localStorage.setItem("burguersprime_profile_address", address);
    localStorage.setItem("burguersprime_profile_phone", profilePhone);
    localStorage.setItem("burguersprime_profile_instagram", instagram);
    localStorage.setItem("burguersprime_profile_hours", workingHours);
    localStorage.setItem("burguersprime_profile_slogan", slogan);
    localStorage.setItem("burguersprime_profile_is_open", isOpen.toString());

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfigChange = <K extends keyof SetupConfig>(key: K, value: SetupConfig[K]) => {
    const updated = {
      ...config,
      [key]: value
    };
    onUpdateConfig(updated);
  };

  return (
    <div className="space-y-5 text-[#3D2817]" id="hamburgueria-profile-panel">
      
      {/* Visual Welcome Dashboard Segment */}
      <div className="bg-[#F4EBD9] border-2 border-[#3D2817] p-4 md:p-5 rounded-sm shadow-[2px_2.5px_0_rgba(26,20,16,0.95)] flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="p-1 px-2 bg-[#3D2817] text-[#E8A33D] text-[9.5px] font-mono font-bold rounded-sm uppercase tracking-wide">
              • Ficha Técnica Angola •
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#7A8B6F] animate-pulse" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-[#3D2817] leading-tight uppercase tracking-wide">
            Perfil de <span className="text-[#C44119]">{config.businessName || "BURGUERSPRIME"}</span>
          </h2>
          <p className="text-xs font-mono text-[#3D2817]/75 max-w-xl">
            Configure a identidade comercial da sua hamburgueria em Luanda. Personalize taxas de conversão, dados físicos, horários e canais de fidelização.
          </p>
        </div>

        {/* Status of Store Indicator */}
        <button
          type="button"
          onClick={() => {
            const nextOpen = !isOpen;
            setIsOpen(nextOpen);
            localStorage.setItem("burguersprime_profile_is_open", nextOpen.toString());
          }}
          className={`px-4 py-2 border-2 border-[#3D2817] font-bebas text-xs rounded-sm tracking-wide uppercase flex items-center justify-center gap-2 transition shadow-[1px_1.5px_0_rgba(26,20,16,0.95)] cursor-pointer ${
            isOpen 
              ? "bg-[#7A8B6F] text-[#F4EBD9] hover:bg-[#7A8B6F]/90" 
              : "bg-[#3D2817]/10 text-[#3D2817] hover:bg-[#3D2817]/15"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-[#F4EBD9] animate-ping" : "bg-[#3D2817]/40"}`} />
          <span>SALA DE CHAPA: {isOpen ? "🔥 GRELHA ON" : "💨 GRELHA OFF"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: BUSINESS CARD PREVIEW & METRICS */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* ACTIVE USER SESSION STATS */}
          {currentUser && (
            <div className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-4 shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] space-y-3.5 select-none">
              <div className="flex items-center gap-1.5 text-[#C44119] font-mono font-bold text-[10px] uppercase tracking-wider">
                <Flame className="w-4 h-4 text-[#C44119] fill-[#C44119]" />
                <span>Utilizador em Sessão</span>
              </div>
              <div className="flex items-center gap-3 border-b border-dashed border-[#3D2817]/20 pb-3">
                <span className="text-3xl bg-[#3D2817]/10 border border-[#3D2817]/25 p-2 rounded-sm block font-mono">
                  {currentUser.avatar || "👨‍🍳"}
                </span>
                <div className="min-w-0 flex-1 font-mono">
                  <h4 className="font-extrabold text-xs text-[#3D2817] leading-tight truncate">{currentUser.name}</h4>
                  <p className="text-[10px] text-[#3D2817]/70 truncate">{currentUser.email}</p>
                  {currentUser.businessName && (
                    <span className="text-[9px] bg-[#3D2817] text-[#E8A33D] font-bold px-1.5 py-0.5 rounded-sm border border-[#3D2817] mt-1 inline-block">
                      {currentUser.businessName}
                    </span>
                  )}
                </div>
              </div>
              {onShowGuide && (
                <button
                  type="button"
                  onClick={onShowGuide}
                  className="w-full bg-[#F4EBD9] hover:bg-[#F4EBD9]/90 border-2 border-[#3D2817] text-[#3D2817] rounded-sm py-2 text-xs font-bebas uppercase tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id="btn-profile-show-guide"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Como funciona a Hamburgueria?</span>
                </button>
              )}
              <button
                type="button"
                onClick={onLogOut}
                className="w-full bg-[#3D2817] hover:bg-[#3D2817]/95 text-[#F4EBD9] border-2 border-[#3D2817] rounded-sm py-2 text-xs font-bebas uppercase tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer"
                id="btn-profile-logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Terminar Sessão (Sair do Sistema)</span>
              </button>
            </div>
          )}
          
          {/* VIP DIGITAL MEMBER CARD FOR HAMBURGUERIA - Premium Metal Plate aesthetic */}
          <div className="bg-[#1A1410] text-[#F4EBD9] border-3 border-[#3D2817] rounded-sm p-5 shadow-[3px_4px_0_rgba(26,20,16,0.95)] relative overflow-hidden flex flex-col justify-between aspect-[1.58/1] select-none">
            {/* Stamp Detail in Background */}
            <div className="absolute -right-3 -bottom-3 rotate-12 opacity-[0.06] pointer-events-none">
              <span className="text-7xl font-display font-black border-4 border-[#F4EBD9] rounded-full p-6 block">PRIME</span>
            </div>
            
            {/* Golden Ribbon Badge */}
            <div className="absolute top-4 right-4 bg-[#E8A33D] text-[#1A1410] border border-[#3D2817] rounded-sm px-2 py-0.5 text-[8.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>SÓCIO PRIME</span>
            </div>

            {/* Header Identity */}
            <div className="z-10">
              <span className="text-[8px] font-mono uppercase font-bold tracking-widest text-[#F4EBD9]/60 block mb-1">
                MEMBRO DA PLATAFORMA ANGOLA
              </span>
              <h3 className="font-display font-extrabold text-2xl tracking-tight text-[#F4EBD9] uppercase truncate pr-16 leading-none">
                {config.businessName || "BURGUERSPRIME"}
              </h3>
              <p className="text-[10px] text-[#C44119] font-mono italic font-bold mt-1.5 truncate max-w-[210px]">
                "{slogan}"
              </p>
            </div>

            {/* Middle Chips */}
            <div className="grid grid-cols-3 gap-2 bg-[#3D2817]/40 rounded-sm p-2 border border-[#3D2817]/50 z-10 my-3">
              <div className="text-center">
                <span className="text-[7.5px] uppercase font-mono font-bold text-[#F4EBD9]/65 block leading-none">Clientes</span>
                <span className="font-mono font-black text-white text-xs block mt-1 leading-none">
                  {totalClients}
                </span>
              </div>
              <div className="text-center border-x border-[#3D2817]/40">
                <span className="text-[7.5px] uppercase font-mono font-bold text-[#F4EBD9]/65 block leading-none">Fiel Rank</span>
                <span className="font-mono font-black text-[#7A8B6F] text-xs block mt-1 leading-none">
                  {loyalCount}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[7.5px] uppercase font-mono font-bold text-[#F4EBD9]/65 block leading-none">Feedback</span>
                <span className="font-mono font-black text-[#E8A33D] text-xs block mt-1 leading-none">
                  ★ {averageStars}
                </span>
              </div>
            </div>

            {/* Bottom Location, Time & Card Details */}
            <div className="flex justify-between items-end z-10 border-t border-[#3D2817]/30 pt-2.5">
              <div className="space-y-0.5 text-left font-mono">
                <span className="text-[7.5px] text-[#F4EBD9]/50 uppercase font-bold block">Local Operacional</span>
                <div className="flex items-center gap-1 text-[9px] font-bold text-[#F4EBD9]/85">
                  <MapPin className="w-3 h-3 text-[#C44119]" />
                  <span className="truncate max-w-[170px]">Morro Bento, Luanda</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[7.5px] text-[#F4EBD9]/50 uppercase font-mono font-bold block">Ticket Médio</span>
                <span className="font-mono font-black text-[#E8A33D] text-xs">
                  {config.ticketMedio.toLocaleString()} Kz
                </span>
              </div>
            </div>
          </div>

          {/* QUICK SUMMARY METRIC CARDS */}
          <div className="space-y-2.5">
            <span className="text-[9px] font-bold text-[#3D2817]/65 uppercase tracking-widest block font-mono">
              Indicadores Ativos do Painel
            </span>

            <div className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-3.5 space-y-3 shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] select-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#E8A33D]/20 text-[#3D2817] border border-[#3D2817]/20 rounded-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bebas text-[11px] tracking-wider uppercase text-slate-900 leading-none">Ponto de Equilíbrio</h4>
                    <p className="text-[9.5px] font-mono text-[#3D2817]/65 mt-0.5">Vendas mínimas para pagar custos fixos</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-black text-[#3D2817] text-xs">
                    {Math.ceil(config.fixedCosts / config.ticketMedio)} burgers/mês
                  </span>
                  <span className="block text-[8px] text-[#3D2817]/60">Total: {config.fixedCosts.toLocaleString()} Kz</span>
                </div>
              </div>

              <div className="border-t border-dashed border-[#3D2817]/20 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#C44119]/10 text-[#C44119] border border-[#3D2817]/10 rounded-sm">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bebas text-[11px] tracking-wider uppercase text-slate-900 leading-none">Aquisição de Base</h4>
                    <p className="text-[9.5px] font-mono text-[#3D2817]/65 mt-0.5">Fidelização mensal contra a meta</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-black text-[#C44119] text-xs">
                    {metrics.newClientsCount} de {config.targetNewClients}
                  </span>
                  <span className="block text-[8px] text-[#3D2817]/60">
                    {Math.round((metrics.newClientsCount / config.targetNewClients) * 100)}% Batido
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-[#3D2817]/20 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#7A8B6F]/15 text-[#7A8B6F] border border-[#3D2817]/10 rounded-sm">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bebas text-[11px] tracking-wider uppercase text-slate-900 leading-none">Alvo do Faturamento</h4>
                    <p className="text-[9.5px] font-mono text-[#3D2817]/65 mt-0.5">Meta total de vendas monetárias</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-black text-[#3D2817] text-xs">
                    {config.monthlyRevenueTarget.toLocaleString()} Kz
                  </span>
                  <span className="block text-[8px] text-[#3D2817]/60">
                    Facturado: {metrics.totalSalesRevenue.toLocaleString()} Kz
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: IDENTITY FORM & OPERATIONAL PARAMETERS */}
        <div className="lg:col-span-7 space-y-5">
          
          <form onSubmit={handleSaveOperationalConfig} className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-4 md:p-5 space-y-5 shadow-[1.5px_2px_0_rgba(26,20,16,0.95)]">
            
            {/* Secção 1: Identidade da Loja */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 border-b-2 border-[#3D2817]/15 pb-2">
                <Building2 className="w-4 h-4 text-[#C44119]" />
                <h3 className="font-bebas tracking-wide text-[12px] text-slate-900 uppercase">
                  Identidade do Estabelecimento
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="shop-name-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                    Nome da Hambúrgueria
                  </label>
                  <input
                    type="text"
                    id="shop-name-input"
                    required
                    value={config.businessName}
                    onChange={(e) => handleConfigChange("businessName", e.target.value)}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-3 py-1.5 text-xs font-bold outline-none transition"
                    placeholder="Ex: BURGUERSPRIME"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="shop-slogan-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                    Slogan Comercial / Grito de Marca
                  </label>
                  <input
                    type="text"
                    id="shop-slogan-input"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-3 py-1.5 text-xs font-semibold outline-none transition"
                    placeholder="Ex: Sabor Sem Limites!"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="shop-phone-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                    Contacto WhatsApp Geral (Angola)
                  </label>
                  <input
                    type="text"
                    id="shop-phone-input"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-3 py-1.5 text-xs font-mono font-bold outline-none transition"
                    placeholder="Ex: +244 931 200 150"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="shop-insta-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                    Instagram Oficial (@)
                  </label>
                  <input
                    type="text"
                    id="shop-insta-input"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-3 py-1.5 text-xs font-mono font-bold outline-none transition"
                    placeholder="Ex: @burguersprime"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="shop-address-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                    Endereço Operacional das Vendas
                  </label>
                  <input
                    type="text"
                    id="shop-address-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-3 py-1.5 text-xs font-bold outline-none transition"
                    placeholder="Ex: Morro Bento, Luanda"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="shop-hours-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                    Horário de Trabalho dos Chapas
                  </label>
                  <input
                    type="text"
                    id="shop-hours-input"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-3 py-1.5 text-xs font-bold outline-none transition"
                    placeholder="Ex: Terça a Domingo: 18:00 - 23:30"
                  />
                </div>
              </div>
            </div>

            {/* Secção 2: Metas Financeiras (Syncing to Config) */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 border-b-2 border-[#3D2817]/15 pb-2">
                <Sliders className="w-4 h-4 text-[#E8A33D]" />
                <h3 className="font-bebas tracking-wide text-[12px] text-slate-900 uppercase">
                  Configuração Financeira & Metas
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="ticket-medio-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                      Ticket Médio Operacional (Kz)
                    </label>
                    <span className="text-[9.5px] font-mono font-extrabold text-[#E8A33D]">
                      {config.ticketMedio.toLocaleString()} Kz
                    </span>
                  </div>
                  <input
                    type="number"
                    id="ticket-medio-input"
                    required
                    step="100"
                    min="100"
                    value={config.ticketMedio}
                    onChange={(e) => handleConfigChange("ticketMedio", Math.max(100, Number(e.target.value)))}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-3 py-1.5 text-xs font-mono font-bold outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="revenue-target-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                      Meta Mensal Faturamento (Kz)
                    </label>
                    <span className="text-[9.5px] font-mono font-extrabold text-[#3D2817]">
                      {config.monthlyRevenueTarget.toLocaleString()} Kz
                    </span>
                  </div>
                  <input
                    type="number"
                    id="revenue-target-input"
                    required
                    step="10000"
                    value={config.monthlyRevenueTarget}
                    onChange={(e) => handleConfigChange("monthlyRevenueTarget", Math.max(10000, Number(e.target.value)))}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-3 py-1.5 text-xs font-mono font-bold outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="fixed-costs-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                      Custos Fixos Mensal (Kz)
                    </label>
                    <span className="text-[9.5px] font-mono font-extrabold text-[#C44119]">
                      {config.fixedCosts.toLocaleString()} Kz
                    </span>
                  </div>
                  <input
                    type="number"
                    id="fixed-costs-input"
                    required
                    step="5000"
                    value={config.fixedCosts}
                    onChange={(e) => handleConfigChange("fixedCosts", Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-3 py-1.5 text-xs font-mono font-bold outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="new-clients-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                      Meta Novos Clientes / Mês
                    </label>
                    <span className="text-[9.5px] font-mono font-extrabold text-[#3D2817]">
                      {config.targetNewClients} Clientes
                    </span>
                  </div>
                  <input
                    type="number"
                    id="new-clients-input"
                    required
                    min="1"
                    value={config.targetNewClients}
                    onChange={(e) => handleConfigChange("targetNewClients", Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-3 py-1.5 text-xs font-mono font-bold outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Secção 3: Operações & Vendas */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 border-b-2 border-[#3D2817]/15 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#7A8B6F]" />
                <h3 className="font-bebas tracking-wide text-[12px] text-slate-900 uppercase">
                  Canal de Operações & Venda Directa
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label htmlFor="op-type-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                    Tipo de Operação
                  </label>
                  <select
                    id="op-type-input"
                    value={config.operationType}
                    onChange={(e) => handleConfigChange("operationType", e.target.value as any)}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-2.5 py-1.5 text-xs font-bold outline-none transition cursor-pointer"
                  >
                    <option value="balcao">Esplanada / Balcão</option>
                    <option value="delivery">Mandar p'ra Casa (Delivery)</option>
                    <option value="ambos">Operação Completa (Ambos)</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-1">
                  <label htmlFor="op-channel-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65">
                    Canal Principal de Entrada
                  </label>
                  <select
                    id="op-channel-input"
                    value={config.mainChannel}
                    onChange={(e) => handleConfigChange("mainChannel", e.target.value)}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] text-[#3D2817] focus:border-[#C44119] rounded-sm px-2.5 py-1.5 text-xs font-bold outline-none transition cursor-pointer"
                  >
                    <option value="WhatsApp">WhatsApp Luanda</option>
                    <option value="Instagram">Instagram Direct DM</option>
                    <option value="Indicação">Boca-a-Boca / Indicação</option>
                    <option value="Outro">Apoio Externo / Outro</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-1 font-mono">
                  <label className="block text-[9px] uppercase font-bold text-[#3D2817]/65 mb-1 text-left">
                    Equipa de Vendas Ativa?
                  </label>
                  <button
                    type="button"
                    onClick={() => handleConfigChange("hasSalesTeam", !config.hasSalesTeam)}
                    className={`w-full py-1.5 px-3 border-2 border-[#3D2817] rounded-sm font-bebas text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      config.hasSalesTeam 
                        ? "bg-[#C44119]/15 text-[#3D2817]" 
                        : "bg-[#3D2817]/5 text-[#3D2817]/60 hover:bg-[#3D2817]/10"
                    }`}
                  >
                    {config.hasSalesTeam ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-[#C44119] shrink-0" />
                        <span>Sim, equipa activa</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-[#3D2817]/40 shrink-0" />
                        <span>Apenas Chapa / Sócio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions for Form Save */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-dashed border-[#3D2817]/20 select-none">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7A8B6F]" />
                <span className="text-[10px] font-mono text-[#3D2817]/60">
                  Os dados das metas comunicam com o painel central instantaneamente.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {saveSuccess && (
                  <span className="text-xs text-[#7A8B6F] font-mono font-bold flex items-center gap-1 animate-pulse">
                    <Check className="w-3.5 h-3.5" /> Registado!
                  </span>
                )}
                
                <button
                  type="submit"
                  id="btn-save-hamburgueria-profile"
                  className="px-5 py-2.5 bg-[#C44119] hover:bg-[#C44119]/90 border-2 border-[#3D2817] text-[#F4EBD9] font-bebas text-xs uppercase tracking-wider rounded-sm shadow-[1px_1.5px_0_rgba(26,20,16,0.95)] transition flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Gravar Identidade 💾</span>
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>

      {/* ================= SUPABASE CLOUD INTEGRATION PANEL ================= */}
      <div className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-4 md:p-6 shadow-[2px_2.5px_0_rgba(26,20,16,0.95)] space-y-4 text-[#3D2817] mt-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-[#3D2817] pb-3 gap-2">
          <div className="text-left">
            <span className="p-1 px-2 bg-[#3D2817] text-[#E8A33D] text-[9.5px] font-mono font-bold rounded-sm uppercase tracking-wide flex items-center gap-1.5 w-fit">
              <Database className="w-3 h-3 text-[#E8A33D]" />
              INTEGRAÇÃO SUPABASE CLOUD
            </span>
            <h3 className="font-bebas tracking-wide text-2xl uppercase mt-2 text-[#3D2817]">
              Sincronização de Banco de Dados Relacional
            </h3>
            <p className="text-xs text-[#3D2817]/75 font-sans mt-0.5">
              Conecte o seu cockpit de hamburgueria diretamente à nuvem segura do Supabase (PostgreSQL) para backup e sincronização em tempo real.
            </p>
          </div>

          <div className="shrink-0 font-mono text-[10px] uppercase font-bold px-2 py-1 border border-[#3D2817]/35 rounded bg-[#3D2817]/5">
            {isSupabaseConfigured() ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-605 bg-[#7A8B6F] animate-pulse" />
                CONECTADO COM SUCESSO
              </span>
            ) : (
              <span className="text-[#C44119] flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                MODO LOCAL (OFF-LINE)
              </span>
            )}
          </div>
        </div>

        {isSupabaseConfigured() ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1 select-none">
            {/* Supabase Connected - Left Controls */}
            <div className="lg:col-span-7 space-y-3">
              <div className="bg-emerald-500/10 border-2 border-emerald-600/30 p-3.5 rounded text-slate-800 text-xs">
                <p className="font-sans leading-relaxed">
                  <strong>A sua base de dados na nuvem está ativa!</strong> O BurguersPrime agora pode sincronizar as suas operações locais com tabelas relacionais do PostgreSQL hospedadas no Supabase. Ideal para não perder dados ao limpar a cache do navegador!
                </p>
              </div>

              {supabaseStatusMsg && (
                <div className={`p-3 rounded border text-xs font-mono flex items-start gap-2 ${
                  supabaseStatusType === "success" 
                    ? "bg-[#7A8B6F]/10 border-[#7A8B6F]/40 text-[#3D2817]" 
                    : supabaseStatusType === "error"
                    ? "bg-[#C44119]/10 border-[#C44119]/40 text-[#3D2817]"
                    : "bg-[#3D2817]/5 border-[#3D2817]/25 text-[#3D2817]/80"
                }`}>
                  <RefreshCw className={`w-4 h-4 shrink-0 mt-0.5 ${(syncingPush || syncingPull) ? "animate-spin text-[#C44119]" : "text-[#7A8B6F]"}`} />
                  <span>{supabaseStatusMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={syncingPush || syncingPull}
                  onClick={handlePushSupabase}
                  className="px-4 py-3 bg-[#C44119] hover:bg-[#C44119]/90 border-2 border-[#3D2817] disabled:opacity-50 text-[#F4EBD9] font-bebas text-xs uppercase tracking-wider rounded-sm shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{syncingPush ? "Sincronizar..." : "ENVIAR PARA A NUVEM (PUSH)"}</span>
                </button>

                <button
                  type="button"
                  disabled={syncingPush || syncingPull}
                  onClick={handlePullSupabase}
                  className="px-4 py-3 bg-[#F4EBD9] hover:bg-stone-50 border-2 border-[#3D2817] disabled:opacity-50 text-[#3D2817] font-bebas text-xs uppercase tracking-wider rounded-sm shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>{syncingPull ? "Descarregar..." : "PUXAR DA NUVEM (PULL / OVERWRITE)"}</span>
                </button>
              </div>
            </div>

            {/* Supabase Connected - Right Status Mappings */}
            <div className="lg:col-span-5 bg-[#3D2817]/5 p-4 border border-[#3D2817]/15 rounded-sm space-y-3 text-xs">
              <span className="font-bold font-mono tracking-wide uppercase text-[#3D2817]/70 text-[9px] block">
                Tabelas Relacionais Ativas (Mapeadas)
              </span>

              <div className="space-y-2 font-mono text-[10.5px]">
                <div className="flex justify-between items-center border-b border-dashed border-[#3D2817]/15 pb-1">
                  <span>🏢 empresas (Tenants)</span>
                  <span className="text-emerald-700 font-bold">✔️ Activo</span>
                </div>
                <div className="flex justify-between items-center border-b border-dashed border-[#3D2817]/15 pb-1">
                  <span>👥 clientes (CRM)</span>
                  <span className="text-emerald-700 font-bold">✔️ Activo</span>
                </div>
                <div className="flex justify-between items-center border-b border-dashed border-[#3D2817]/15 pb-1">
                  <span>📊 financeiro_metricas (Finanças/KPI)</span>
                  <span className="text-emerald-700 font-bold">✔️ Activo</span>
                </div>
                <div className="flex justify-between items-center border-b border-dashed border-[#3D2817]/15 pb-1">
                  <span>👨‍🍳 utilizadores (Sessões)</span>
                  <span className="text-emerald-700 font-bold">✔️ Activo</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span>🍔 burger_components</span>
                  <span className="text-emerald-700 font-bold">✔️ Activo</span>
                </div>
              </div>

              <div className="text-[9px] text-[#3D2817]/60 leading-tight">
                * Note: Qualquer salvaguarda enviada para a nuvem cria registros que respeitam o tenant isolado de forma multi-utilizador.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="bg-amber-550/10 border-2 border-orange-700/35 p-3.5 rounded text-slate-800 text-xs flex flex-col sm:flex-row gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#C44119] mb-1 font-mono uppercase text-[10.5px]">Supabase ainda não configurado no servidor</strong>
                <p className="font-sans leading-relaxed">
                  Para aceder à segurança real de backup na nuvem e partilhar a mesma chapa com outros utilizadores da tua equipa, podes conectar gratuitamente o seu próprio projeto Supabase em Luanda. Por predefinição, o cockpit salva de forma offline segura na cache do teu navegador corrente (LocalStorage).
                </p>
              </div>
            </div>

            {/* Steps & Migrations Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="bg-[#3D2817]/5 p-4 border border-[#3D2817]/15 rounded-sm space-y-2">
                <h4 className="font-bold text-[#C44119] font-mono text-[10.5px] uppercase">1. Executa as Migrações SQL</h4>
                <p className="text-[11px] text-[#3D2817]/85 leading-relaxed">
                  Criamos um arquivo de migração completo e pronto no diretório físico do teu projeto em: <br />
                  <code className="bg-white border rounded px-1.5 py-0.5 font-mono text-[9.5px]/none block mt-1 w-fit select-all">/supabase/schema.sql</code> <br />
                  Copia o código desse arquivo, cola-o no <strong>SQL Editor</strong> do teu painel Supabase e clica em <strong>Run</strong> para criar instantaneamente todas as tabelas!
                </p>
              </div>

              <div className="bg-[#3D2817]/5 p-4 border border-[#3D2817]/15 rounded-sm space-y-2">
                <h4 className="font-bold text-slate-800 font-mono text-[10.5px] uppercase">2. Declara as Chaves de Acesso</h4>
                <p className="text-[11px] text-[#3D2817]/85 leading-relaxed">
                  Adiciona as credenciais do teu Supabase nas Variáveis de Ambiente do projeto (arquivo <code className="bg-white px-1 border rounded text-[10px]">.env</code>) ou no painel de segredos da hospedagem:
                </p>
                <div className="font-mono text-[9px] bg-[#1A1410] text-[#F4EBD9] p-2 rounded-sm space-y-1 block max-w-full overflow-x-auto select-all">
                  <div>VITE_SUPABASE_URL="https://o-teu-id.supabase.co"</div>
                  <div>VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. COMPARATIVO DE PLANOS SAAS - CARTÕES DE ASSINATURA */}
      <div className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-4 md:p-6 shadow-[2px_2.5px_0_rgba(26,20,16,0.95)] space-y-4 text-[#3D2817] mt-5">
        
        <div className="border-b-2 border-[#3D2817] pb-3 text-center sm:text-left">
          <span className="p-1 px-2.5 bg-[#C44119] text-[#F4EBD9] text-[9.5px] font-mono font-black rounded-sm uppercase tracking-wider">
            ★ SISTEMA DE FATURAÇÃO SAAS ★
          </span>
          <h3 className="font-bebas tracking-wide text-2xl uppercase mt-2 text-[#3D2817]">
            Planos Comerciais de Subscrição
          </h3>
          <p className="text-xs text-[#3D2817]/75 font-sans mt-0.5">
            Compare os limites operacionais e recursos disponíveis após o encerramento da fase de testes.
          </p>
        </div>

        {/* Beta notification badge */}
        {currentCompany?.fase_sistema === "beta" ? (
          <div className="bg-emerald-600/10 border-2 border-emerald-600 p-3.5 rounded text-emerald-850 text-xs font-mono font-bold flex items-center justify-between gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 uppercase">
              <Award className="w-5 h-5 text-emerald-650 animate-pulse" />
              Hamburgueria Ativa no Período Beta Colectivo (Acesso Completo Ilimitado)
            </span>
            <span className="bg-emerald-650 text-white text-[9px] px-2 py-0.5 rounded font-sans uppercase font-extrabold tracking-wider">
              0 Kz / GRÁTIS
            </span>
          </div>
        ) : (
          <div className="bg-amber-600/10 border-2 border-amber-600 p-3.5 rounded text-stone-900 text-xs font-mono font-bold flex items-center justify-between gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 uppercase">
              <Award className="w-5 h-5 text-amber-500 animate-bounce" />
              Plano de Assinatura Comercial Ativo: <strong className="text-[#C44119] font-black">{currentCompany?.plano?.toUpperCase() || "FREE"}</strong>
            </span>
            <span className="bg-amber-500 text-[#3D2817] text-[10px] px-2 py-0.5 rounded font-sans uppercase font-extrabold tracking-wider">
              SAAS ATIVO
            </span>
          </div>
        )}

        {/* Plans comparison list columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* PLAN 1: FREE */}
          <div className={`p-4 border-2 rounded-sm bg-[#3D2817]/5 flex flex-col justify-between space-y-4 ${
            currentCompany?.fase_sistema !== "beta" && currentCompany?.plano === "free"
              ? "border-[#C44119] shadow-[2px_2px_0_rgba(196,65,25,0.4)]"
              : "border-[#3D2817]/25"
          }`}>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-stone-500 block">Básico Gratuito</span>
              <h4 className="font-bebas text-lg uppercase tracking-wider text-stone-850">PLANO FREE</h4>
              <div className="font-mono text-xl font-extrabold text-[#3D2817]">0 Kz <span className="text-xs font-normal">/mês</span></div>
              <p className="text-[10.5px] text-[#3D2817]/70 leading-relaxed font-sans">Ideal para pequenas grelhas individuais ou balcões de quintal a começar.</p>
              
              <div className="talao-divider-dotted my-3" />
              <ul className="space-y-1.5 font-mono text-[9.5px] text-stone-700">
                <li className="flex items-center gap-1">✔️ 1 Utilizador Técnico</li>
                <li className="flex items-center gap-1">✔️ Até 100 clientes CRM</li>
                <li className="flex items-center gap-1">✔️ Financeiro Básico (CAC/ROI)</li>
                <li className="text-stone-400 flex items-center gap-1">❌ Sem automações de WhatsApp</li>
                <li className="text-stone-400 flex items-center gap-1">❌ Sem análises ou PDF</li>
              </ul>
            </div>
            
            <span className="text-center font-bebas text-xs uppercase px-3 py-1 border border-stone-400 text-stone-500 rounded block mt-4">
              {currentCompany?.fase_sistema !== "beta" && currentCompany?.plano === "free" ? "✓ SEU PLANO" : "Acesso Limitado"}
            </span>
          </div>

          {/* PLAN 2: GROWTH */}
          <div className={`p-4 border-2 rounded-sm bg-indigo-50/20 flex flex-col justify-between space-y-4 ${
            currentCompany?.fase_sistema !== "beta" && currentCompany?.plano === "growth"
              ? "border-[#C44119] shadow-[2px_2px_0_rgba(196,65,25,0.4)]"
              : "border-indigo-200"
          }`}>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[9.5px] uppercase font-mono font-bold text-indigo-700 block">Recomendado</span>
                <span className="bg-indigo-600 text-white text-[7.5px] rounded px-1 uppercase font-bold tracking-widest font-mono">Popular</span>
              </div>
              <h4 className="font-bebas text-lg uppercase tracking-wider text-indigo-950">PLANO GROWTH</h4>
              <div className="font-mono text-xl font-extrabold text-indigo-900">15.000 Kz <span className="text-xs font-normal">/mês</span></div>
              <p className="text-[10.5px] text-[#3D2817]/70 leading-relaxed font-sans">Perfeito para hamburguerias artesanais consolidadas com entregas online.</p>
              
              <div className="talao-divider-dotted my-3" />
              <ul className="space-y-1.5 font-mono text-[9.5px] text-indigo-950">
                <li className="flex items-center gap-1 text-indigo-900">✔️ Até 5 Utilizadores em equipa</li>
                <li className="flex items-center gap-1 text-indigo-900">✔️ Clientes CRM Ilimitados</li>
                <li className="flex items-center gap-1 text-indigo-900">✔️ Financeiro Completo (LTV)</li>
                <li className="flex items-center gap-1 text-indigo-900">✔️ Automações WhatsApp activas</li>
                <li className="flex items-center gap-1 text-indigo-900">✔️ Relatórios em PDF semanais</li>
              </ul>
            </div>
            
            <span className={`text-center font-bebas text-xs uppercase px-3 py-1 rounded block mt-4 border ${
              currentCompany?.fase_sistema !== "beta" && currentCompany?.plano === "growth"
                ? "bg-[#C44119] text-[#F4EBD9] border-black text-white"
                : "border-indigo-400 text-indigo-700 font-bold"
            }`}>
              {currentCompany?.fase_sistema !== "beta" && currentCompany?.plano === "growth" ? "✓ SEU PLANO" : "Plano Superior"}
            </span>
          </div>

          {/* PLAN 3: PRIME */}
          <div className={`p-4 border-2 rounded-sm bg-amber-50/20 flex flex-col justify-between space-y-4 ${
            currentCompany?.fase_sistema !== "beta" && currentCompany?.plano === "prime"
              ? "border-[#C44119] shadow-[2px_2px_0_rgba(196,65,25,0.4)]"
              : "border-amber-200"
          }`}>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-500 block">Alta Escala</span>
              <h4 className="font-bebas text-lg uppercase tracking-wider text-amber-900">PLANO PRIME</h4>
              <div className="font-mono text-xl font-extrabold text-amber-950">35.000 Kz <span className="text-xs font-normal">/mês</span></div>
              <p className="text-[10.5px] text-[#3D2817]/70 leading-relaxed font-sans">Ideal para redes, franquias ou grandes operações com múltiplas lojas físicas.</p>
              
              <div className="talao-divider-dotted my-3" />
              <ul className="space-y-1.5 font-mono text-[9.5px] text-amber-950">
                <li className="flex items-center gap-1 text-amber-900">✔️ Utilizadores ilimitados</li>
                <li className="flex items-center gap-1 text-amber-900">✔️ Gestão de Múltiplas Lojas</li>
                <li className="flex items-center gap-1 text-amber-900">✔️ Comparativos entre Lojas</li>
                <li className="flex items-center gap-1 text-amber-900">✔️ Suporte técnico VIP prioritário</li>
                <li className="flex items-center gap-1 text-amber-900">✔️ Acesso antecipado a novas IA</li>
              </ul>
            </div>
            
            <span className={`text-center font-bebas text-xs uppercase px-3 py-1 rounded block mt-4 border ${
              currentCompany?.fase_sistema !== "beta" && currentCompany?.plano === "prime"
                ? "bg-[#C44119] text-[#F4EBD9] border-black text-white"
                : "border-amber-400 text-amber-805 font-bold"
            }`}>
              {currentCompany?.fase_sistema !== "beta" && currentCompany?.plano === "prime" ? "✓ SEU PLANO" : "Plano Supremo"}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
