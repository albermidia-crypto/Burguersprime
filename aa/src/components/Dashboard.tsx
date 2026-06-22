import React, { useState } from "react";
import { SetupConfig, ClientProfile, FinancialMetrics, AIActionSuggestion } from "../types";
import { ACTIVE_TRIGGER_SCENARIOS, getAISuggestions, getWeeklySummaryData } from "../utils/aiEngine";
import { calculateBreakEven, calculateROI, calculateCashFlow, calculateCAC, calculateClientLTV } from "../utils/finance";
import { 
  Sparkles, AlertTriangle, CheckCircle, TrendingUp, Users, DollarSign, 
  Percent, ArrowUpRight, Copy, HelpCircle, Flame, Calendar, RefreshCw, Clipboard
} from "lucide-react";

interface DashboardProps {
  config: SetupConfig;
  clients: ClientProfile[];
  metrics: FinancialMetrics;
  onNavigateToCRM: () => void;
  onNavigateToFinance: () => void;
  onTriggerReactivation: (clientName: string, clientId: string) => void;
}

export default function Dashboard({ 
  config, 
  clients, 
  metrics, 
  onNavigateToCRM, 
  onNavigateToFinance, 
  onTriggerReactivation 
}: DashboardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("friday_morning");
  const [triggeredAlerts, setTriggeredAlerts] = useState<string[]>([]);
  const [isRescuing, setIsRescuing] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);

  // 1. Math Integrations
  const ticket = config.ticketMedio;
  const breakEven = calculateBreakEven(config.fixedCosts, ticket);
  const salesMade = metrics.currentSalesCount;
  const bePercent = Math.min(100, Math.round((salesMade / breakEven.salesNeeded) * 100));

  const activeROI = calculateROI(metrics.marketingInvestment, metrics.marketingRevenue);
  const activeCAC = calculateCAC(metrics.marketingInvestment, metrics.newClientsCount);
  
  // Expenses calculated
  const variableExpenses = salesMade * ticket * metrics.variableCostRatio;
  const financeExp = calculateCashFlow(
    metrics.totalSalesRevenue,
    clients.filter(c => c.visitFrequency >= 2).length * ticket * 1.5, // estimate pipeline entries
    config.fixedCosts,
    variableExpenses
  );

  const loyalClients = clients.filter(c => c.visitFrequency >= 3);
  const loyalAtRisk = clients.filter(c => c.visitFrequency >= 3 && c.lastVisitDaysAgo >= 10);

  // Today vs Yesterday simulation
  const salesToday = Math.round(salesMade * 0.12 * ticket);
  const salesYesterday = Math.round(salesMade * 0.10 * ticket);
  const todayTrendPercent = salesYesterday > 0 ? Math.round(((salesToday - salesYesterday) / salesYesterday) * 100) : 15;

  // AI Suggestions
  const aiSuggestions = getAISuggestions(
    config,
    clients,
    metrics.marketingInvestment,
    metrics.marketingRevenue,
    salesMade,
    metrics.newClientsCount,
    metrics.currentDayOfMonth
  );

  // Active triggers scenario
  const currentScenario = ACTIVE_TRIGGER_SCENARIOS.find(s => s.id === activeScenarioId) || ACTIVE_TRIGGER_SCENARIOS[0];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareWhatsApp = () => {
    const todayStr = new Date().toLocaleDateString("pt-AO", { day: '2-digit', month: '2-digit', year: 'numeric' });
    const shareText = `📊 *BURGUERSPRIME CRM — RESUMO DO DIA*
🍔 ${config.businessName}
📅 ${todayStr}

💰 Vendas hoje: ${salesToday.toLocaleString()} Kz (${todayTrendPercent >= 0 ? '+' : ''}${todayTrendPercent}% vs ontem)
👥 Clientes novos este mês: ${metrics.newClientsCount} de ${config.targetNewClients}
⚖️ Ponto de Equilíbrio: ${bePercent}%
📈 ROI Publicidade: ${Math.round(activeROI)}%
💵 Projecção 30 dias: ${financeExp.projected30d.toLocaleString()} Kz
⚠️ Clientes em risco: ${loyalAtRisk.length}

_Gerado pelo BURGUERSPRIME cocpkit_`;

    navigator.clipboard.writeText(shareText);
    setShowShareNotification(true);
    setTimeout(() => {
      setShowShareNotification(false);
    }, 4000);
  };

  // Generate simulated alerts list
  const activeAlerts: { id: string; type: "error" | "warning" | "success"; text: string; action: () => void; actionText: string }[] = [];

  if (metrics.currentDayOfMonth >= 20 && bePercent < 100) {
    activeAlerts.push({
      id: "alert-be",
      type: "error",
      text: `No Dia ${metrics.currentDayOfMonth}, faltam ${breakEven.salesNeeded - salesMade} vendas para o Ponto de Equilíbrio.`,
      action: onNavigateToFinance,
      actionText: "Ajustar",
    });
  }
  if (loyalAtRisk.length > 0) {
    activeAlerts.push({
      id: "alert-churn",
      type: "warning",
      text: `Temos ${loyalAtRisk.length} Clientes Fiéis ausentes há mais de 10 dias. Perigo de abandono.`,
      action: onNavigateToCRM,
      actionText: "Resgatar",
    });
  }
  if (activeCAC > ticket) {
    activeAlerts.push({
      id: "alert-cac",
      type: "error",
      text: `Alerta: CAC (${Math.round(activeCAC).toLocaleString()} Kz) superior ao Ticket Médio!`,
      action: onNavigateToFinance,
      actionText: "Melhorar",
    });
  }
  if (financeExp.isNegative30d) {
    activeAlerts.push({
      id: "alert-cashflow",
      type: "error",
      text: `Tesouraria 30d indica saldo operacional negativo de ${(financeExp.projected30d * -1).toLocaleString()} Kz.`,
      action: onNavigateToFinance,
      actionText: "Análise",
    });
  } else if (bePercent >= 100) {
    activeAlerts.push({
      id: "alert-be-success",
      type: "success",
      text: `Excelente! Ultrapassaste o Ponto de Equilíbrio mensal. Todo burger agora é lucro!`,
      action: onNavigateToFinance,
      actionText: "Análise",
    });
  }

  // Weekly Summary Monday Morning simulation
  const weeklySummary = getWeeklySummaryData(config, clients, metrics.marketingInvestment);

  return (
    <div id="high-density-dashboard" className="space-y-3">
      
      {/* 1. Header Context & Compact Actions Grid (Partes 2, 3, 5 e 6) */}
      <div className="flex flex-col gap-2 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#E8A33D] font-mono text-[10.5px] uppercase font-bold tracking-widest mt-1">
            <span>🔥 TERMINAL DA BRASA</span>
            <span className="text-white/20">|</span>
            <span className="text-[#F4EBD9]/70 font-semibold text-[11px]">Visão Geral de Hoje</span>
          </div>
        </div>
        
        {/* Actions grid: same height fixed, 50%/50% columns, same border and weight (Parte 5) */}
        <div className="grid grid-cols-2 gap-2 w-full select-none">
          {/* Share button wrapper */}
          <div className="relative w-full">
            <button
              onClick={handleShareWhatsApp}
              id="btn-share-resumo"
              className="w-full h-10 bg-[#E8A33D] hover:bg-[#F4EBD9] hover:text-[#1A1410] text-[#1A1410] font-bebas tracking-wider text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] border border-[#3D2817] rounded-sm cursor-pointer font-bold uppercase"
              title="Partilhar no WhatsApp"
            >
              <span>📤 PARTILHAR RESUMO</span>
            </button>

            {showShareNotification && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#F4EBD9] text-[#3D2817] border border-[#3D2817] font-mono text-[8px] font-bold py-1.5 rounded-sm text-center shadow-lg animate-fade-in z-30">
                ✓ TALÃO COPIADO! COLA NO WHATSAPP
              </div>
            )}
          </div>

          {/* AI Advisor Button */}
          <button
            onClick={() => setShowAiAdvisor(!showAiAdvisor)}
            id="btn-ai-advisor"
            className="w-full h-10 bg-[#C44119] hover:bg-[#F4EBD9] text-[#F4EBD9] hover:text-[#1A1410] font-bebas tracking-wider text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] border border-[#3D2817] rounded-sm cursor-pointer font-bold uppercase font-sans"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-[#E8A33D]" />
            <span>ACÇÕES INTELIGENTES</span>
            <span className="bg-[#1A1410] text-[#E8A33D] text-[8.5px] font-mono px-1 rounded font-bold leading-none">
              {aiSuggestions.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Printed "Grill Ticket" Paper Cards) - 2 columns fixed on mobile (Parte 5) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        
        {/* Card 1: Vendas Hoje */}
        <div className="talao-card p-2 sm:p-2.5 flex flex-col justify-between animate-print-0" id="card-vendas-hoje">
          <div className="talao-header-torn">
            <span className="text-[8px] font-mono font-black text-[#3D2817]/60 block tracking-tight uppercase">VENDAS HOJE</span>
            <div className="talao-divider-dotted" />
          </div>
          <div className="my-1">
            <h4 className="text-[20px] sm:text-2xl font-black font-mono text-[#3D2817] leading-none tracking-tight">{salesToday.toLocaleString()} Kz</h4>
            <p className="text-[8px] font-mono text-[#3D2817]/60 mt-0.5">Ontem: {salesYesterday.toLocaleString()}</p>
          </div>
          <div className="talao-divider-dotted my-1" />
          <div className="text-[8px] font-mono font-bold text-[#E8A33D] bg-[#3D2817] px-1 py-0.5 rounded-sm w-max tracking-wide uppercase leading-none">
            ▲ +{todayTrendPercent}% VS ONTEM
          </div>
        </div>

        {/* Card 2: Clientes Novos */}
        <div className="talao-card p-2 sm:p-2.5 flex flex-col justify-between animate-print-1" id="card-clientes-novos">
          <div className="talao-header-torn">
            <span className="text-[8px] font-mono font-black text-[#3D2817]/60 block tracking-tight uppercase">NOVOS CLIENTES</span>
            <div className="talao-divider-dotted" />
          </div>
          <div className="my-1">
            <h4 className="text-[20px] sm:text-2xl font-black font-mono text-[#3D2817] leading-none tracking-tight">{metrics.newClientsCount} NOVOS</h4>
            <p className="text-[8px] font-mono text-[#3D2817]/60 mt-0.5">Mês de Trabalho</p>
          </div>
          <div className="talao-divider-dotted my-1" />
          <div className="text-[8px] font-mono font-bold text-[#3D2817]/70 border border-[#3D2817]/40 px-1 py-0.5 rounded-sm w-max leading-none">
            META: {config.targetNewClients} CD
          </div>
        </div>

        {/* Card 3: Ponto de Equilíbrio % */}
        <div className="talao-card p-2 sm:p-2.5 flex flex-col justify-between animate-print-2" id="card-ponto-equilibrio">
          <div className="talao-header-torn">
            <span className="text-[8px] font-mono font-black text-[#3D2817]/60 block tracking-tight uppercase">PONTO EQUILÍBRIO</span>
            <div className="talao-divider-dotted" />
          </div>
          <div className="my-1">
            <h4 className="text-[20px] sm:text-2xl font-black font-mono text-[#3D2817] leading-none tracking-tight">{bePercent}%</h4>
            <p className="text-[8px] font-mono text-[#3D2817]/60 mt-0.5">Falta: {Math.max(0, breakEven.salesNeeded - salesMade)} vds</p>
          </div>
          <div className="space-y-1 mt-1">
            <div className="w-full bg-[#3D2817]/15 h-1 rounded-sm overflow-hidden border border-[#3D2817]/10">
              <div 
                className={`h-full transition-all duration-300 ${bePercent >= 100 ? "bg-[#7A8B6F]" : "bg-[#C44119]"}`} 
                style={{ width: `${Math.min(100, bePercent)}%` }} 
              />
            </div>
            <div className="text-[8px] font-mono text-[#3D2817]/60 font-bold uppercase leading-none">
              {bePercent >= 100 ? "COBERTO ★" : "PENDENTE"}
            </div>
          </div>
        </div>

        {/* Card 4: Projecção Tesouraria */}
        <div className="talao-card p-2 sm:p-2.5 flex flex-col justify-between animate-print-3" id="card-saldo-projectado">
          <div className="talao-header-torn">
            <span className="text-[8px] font-mono font-black text-[#3D2817]/60 block tracking-tight uppercase">DINHEIRO PREVISTO</span>
            <div className="talao-divider-dotted" />
          </div>
          <div className="my-1">
            <h4 className={`text-[17px] sm:text-xl font-black font-mono leading-none tracking-tight ${financeExp.projected30d < 0 ? "text-[#C44119]" : "text-[#7A8B6F]"}`}>
              {financeExp.projected30d.toLocaleString()} Kz
            </h4>
            <p className="text-[8px] font-mono text-[#3D2817]/60 mt-0.5">Próximos 30 dias</p>
          </div>
          <div className="talao-divider-dotted my-1" />
          <div className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm w-max uppercase leading-none ${
            financeExp.projected30d < 0 
              ? "bg-[#C44119] text-[#F4EBD9]" 
              : "bg-[#7A8B6F] text-[#F4EBD9]"
          }`}>
            {financeExp.projected30d < 0 ? "⚠️ Risco" : "✓ Seguro"}
          </div>
        </div>

        {/* Card 5: ROI Campanha */}
        <div className="talao-card p-2 sm:p-2.5 flex flex-col justify-between animate-print-4" id="card-roi-activo">
          <div className="talao-header-torn">
            <span className="text-[8px] font-mono font-black text-[#3D2817]/60 block tracking-tight uppercase">RETORNO ADZ (ROI)</span>
            <div className="talao-divider-dotted" />
          </div>
          <div className="my-1">
            <h4 className="text-[20px] sm:text-2xl font-black font-mono text-[#3D2817] leading-none tracking-tight">{Math.round(activeROI)}%</h4>
            <p className="text-[8px] font-mono text-[#3D2817]/65 mt-0.5 leading-snug">Vezes: x{((activeROI || 0)/100).toFixed(1)} Retorno</p>
          </div>
          <div className="talao-divider-dotted my-1" />
          <div className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm w-max uppercase leading-none ${
            activeROI < 100 ? "bg-[#C44119] text-[#F4EBD9]" : "bg-[#7A8B6F] text-[#F4EBD9]"
          }`}>
            {activeROI < 100 ? "ALERTA" : "SALDÁVEL"}
          </div>
        </div>

        {/* Card 6: Clientes Ausentes */}
        <div className="talao-card p-2 sm:p-2.5 flex flex-col justify-between animate-print-5" id="card-churn-risco">
          <div className="talao-header-torn">
            <span className="text-[8px] font-mono font-black text-[#3D2817]/60 block tracking-tight uppercase">RISCO DE PERDA</span>
            <div className="talao-divider-dotted" />
          </div>
          <div className="my-1">
            <h4 className="text-[20px] sm:text-2xl font-black font-mono text-[#C44119] leading-none tracking-tight">{loyalAtRisk.length} EM RISCO</h4>
            <p className="text-[8px] font-mono text-[#3D2817]/60 mt-0.5">Ausentes há +10d</p>
          </div>
          <button
            onClick={() => {
              const targetClient = loyalAtRisk[0] || clients[0];
              if (!targetClient) return;
              setIsRescuing(true);
              setTimeout(() => {
                setIsRescuing(false);
                onTriggerReactivation(targetClient.name, targetClient.id);
              }, 1200);
            }}
            id="btn-churn-quick-jump"
            className="text-[8px] font-mono font-black text-[#C44119] hover:bg-[#C44119] hover:text-[#F4EBD9] border border-[#C44119] px-1 py-0.5 rounded-sm w-full text-center transition duration-150 disabled:opacity-50 uppercase leading-none mt-1 cursor-pointer"
            disabled={isRescuing || clients.length === 0}
          >
            {isRescuing ? "..." : "RESGATAR"}
          </button>
        </div>
      </div>

      {/* 3. AI Suggestions Panel (Beautifully styled on the brand grid) */}
      {showAiAdvisor && (
        <div className="talao-card p-5 relative overflow-hidden animate-fade-in" id="section-ai-ideas">
          <div className="absolute top-2 right-3 font-mono text-[9px] text-[#3D2817]/50 select-none uppercase">
            ★ COCKPIT INTELIGÊNCIA ARTIFICIAL CONSELHO ★
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[#3D2817] text-[#F4EBD9] rounded-sm">
              <Sparkles className="w-4 h-4 text-[#E8A33D] animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-display text-xl text-[#3D2817] uppercase tracking-wide leading-none">Sugestões de Acção Estratégicas Activas</h3>
              <p className="text-[10px] text-[#3D2817]/70 font-mono mt-0.5">Cruzamento financeiro, CMV e comportamental da hamburgueria em Luanda.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {aiSuggestions.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-3 border-2 rounded-sm flex flex-col justify-between ${
                  item.priority === "alta" ? "border-[#C44119]/40 bg-[#C44119]/5" : "border-[#3D2817]/35 bg-transparent"
                }`}
                id={`ai-suggestion-${index}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-[#3D2817]/20">
                    <span className={`text-[8.5px] font-mono font-extrabold px-1.5 rounded-sm uppercase tracking-wide ${
                      item.priority === "alta" ? "bg-[#C44119] text-[#F4EBD9]" : "bg-[#E8A33D] text-[#1A1410]"
                    }`}>
                      {item.priority}
                    </span>
                    <span className="text-[10px] text-[#3D2817]/50 font-mono">#{index + 1}</span>
                  </div>
                  <h4 className="font-bebas text-sm text-[#3D2817] tracking-wider uppercase mb-1">{item.title}</h4>
                  <p className="text-[11px] text-[#3D2817]/85 font-sans leading-normal mb-3">{item.description}</p>
                </div>

                {item.whatsappTemplate && (
                  <div className="bg-[#1A1410] border-1.5 border-[#3D2817] rounded-sm p-2 mb-3 flex-grow font-mono text-[9px] leading-relaxed text-[#F4EBD9]/90 relative select-all max-h-24 overflow-y-auto">
                    <button
                      onClick={() => handleCopyText(item.whatsappTemplate || "", item.id)}
                      id={`btn-copy-${item.id}`}
                      className="absolute top-1 right-1 p-1 bg-[#3D2817] border border-[#F4EBD9]/20 rounded-sm hover:border-[#E8A33D] text-[#F4EBD9]/70 hover:text-[#E8A33D] transition"
                      title="Copiar Template"
                    >
                      {copiedId === item.id ? (
                        <CheckCircle className="w-3 h-3 text-[#7A8B6F]" />
                      ) : (
                        <Clipboard className="w-3 h-3" />
                      )}
                    </button>
                    {item.whatsappTemplate.slice(0, 110)}...
                  </div>
                )}

                <button
                  onClick={() => {
                    if (item.whatsappTemplate) {
                      handleCopyText(item.whatsappTemplate, item.id);
                    } else {
                      onNavigateToCRM();
                    }
                  }}
                  id={`ai-act-btn-${item.id}`}
                  className="w-full btn-brasa py-2 text-xs uppercase"
                >
                  {copiedId === item.id ? "✓ Copiado para WhatsApp" : item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Active Alerts, Monday Report, and Active Trigger Simulator side-by-side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        
        {/* Box A: Alerts Center (Wood layout) */}
        <div className="talao-card p-3.5 flex flex-col justify-between" id="section-alerts">
          <div>
            <div className="talao-header-torn mb-2.5 flex justify-between items-center">
              <h3 className="font-bebas text-lg text-[#3D2817] flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-[#C44119]" />
                Alertas Activos do Dia
              </h3>
              <span className="text-[9px] font-mono text-[#3D2817]/50 uppercase">Prioridade</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-2 rounded-sm border-1.5 flex items-start gap-2 transition-colors ${
                      alert.type === "error" 
                        ? "bg-[#C44119]/5 border-[#C44119]/40 text-[#3D2817]" 
                        : alert.type === "warning" 
                          ? "bg-[#E8A33D]/5 border-[#E8A33D]/40 text-[#3D2817]" 
                          : "bg-[#7A8B6F]/5 border-[#7A8B6F]/40 text-[#3D2817]"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <AlertTriangle className={`w-3.5 h-3.5 ${
                        alert.type === 'error' ? 'text-[#C44119]' : alert.type === 'warning' ? 'text-[#E8A33D]' : 'text-[#7A8B6F]'
                      }`} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between gap-1">
                      <p className="text-[11px] font-sans font-medium leading-relaxed">
                        {alert.text}
                      </p>
                      <button 
                        onClick={alert.action}
                        className="text-[9px] font-mono font-black text-left self-start mt-0.5 uppercase border-b-1.5 border-[#3D2817] pb-0.2 text-[#C44119] hover:text-[#3D2817]"
                      >
                        {alert.actionText} →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-[#3D2817]/50 font-mono text-[11px]">
                  Sem acções urgentes hoje. Grelhas saudáveis! 👍
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-2 border-t border-dashed border-[#3D2817]/25 text-[10px] text-[#3D2817]/60 flex items-center justify-end">
            <button className="flex items-center gap-1 hover:text-[#C44119] transition font-bold cursor-pointer font-mono">
              <RefreshCw className="w-2.5 h-2.5" />
              Recarregar
            </button>
          </div>
        </div>

        {/* Box B: Monday Report */}
        <div className="talao-card p-3.5 flex flex-col justify-between" id="section-monday-summary">
          <div>
            <div className="talao-header-torn mb-2.5 flex justify-between items-center">
              <h3 className="font-bebas text-lg text-[#3D2817] flex items-center gap-1 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-[#3D2817]" />
                Resumo Semanal
              </h3>
              <span className="text-[8.5px] font-bold font-mono text-[#F4EBD9] bg-[#3D2817] border border-[#3D2817] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                SEGUNDA 08:00
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs text-[#3D2817]">
              <div className="bg-[#3D2817]/4 border border-[#3D2817]/20 p-2 rounded-sm">
                <span className="text-[8px] text-[#3D2817]/50 block uppercase font-bold leading-none">Venda Anterior</span>
                <span className="font-mono text-xs font-black text-[#3D2817] leading-none block mt-1.5">
                  {weeklySummary.vendasSemanaAnterior.toLocaleString()} Kz
                </span>
              </div>
              <div className="bg-[#3D2817]/4 border border-[#3D2817]/20 p-2 rounded-sm">
                <span className="text-[8px] text-[#3D2817]/50 block uppercase font-bold leading-none">Novos Clientes</span>
                <span className="font-mono text-xs font-black text-[#3D2817] leading-none block mt-1.5">
                  +{weeklySummary.novosClientes} pessoas
                </span>
              </div>
              <div className="bg-[#3D2817]/4 border border-[#3D2817]/20 p-2 rounded-sm col-span-2">
                <span className="text-[8px] text-[#3D2817]/50 block uppercase font-bold leading-none">Custo por Cliente Novo (CAC)</span>
                <span className={`font-mono text-xs font-black leading-none block mt-1 ${weeklySummary.cacActual > ticket ? "text-[#C44119]" : "text-[#7A8B6F]"}`}>
                  {weeklySummary.cacActual.toLocaleString()} Kz
                </span>
                <span className="text-[7.5px] text-[#3D2817]/65 font-sans mt-0.5 block leading-normal">
                  Cada cliente novo custou-te, em média, {weeklySummary.cacActual.toLocaleString()} Kz para conquistar.
                </span>
              </div>
              <div className="bg-[#3D2817]/4 border border-[#3D2817]/20 p-2 rounded-sm col-span-2">
                <span className="text-[8px] text-[#3D2817]/50 block uppercase font-bold leading-none">Valor de Cada Cliente (LTV)</span>
                <span className="font-mono text-xs font-black text-[#3D2817] leading-none block mt-1">
                  {weeklySummary.ltvActual.toLocaleString()} Kz
                </span>
                <span className="text-[7.5px] text-[#3D2817]/65 font-sans mt-0.5 block leading-normal">
                  Cada cliente fiel vale, em média, {weeklySummary.ltvActual.toLocaleString()} Kz ao longo do tempo.
                </span>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[9px] font-mono uppercase font-black text-[#3D2817]/60 tracking-wider block">3 Melhorias Semanais:</span>
              <ul className="mt-1 space-y-1">
                {weeklySummary.pontosMelhorar.map((pt, index) => (
                  <li key={index} className="text-[10px] text-[#3D2817] flex items-start gap-1 leading-normal font-sans">
                    <span className="text-[#C44119] font-bold shrink-0">{index + 1}.</span>
                    <span className="truncate">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Box C: Active Trigger Simulator */}
        <div className="talao-card p-3.5 flex flex-col justify-between" id="section-triggers-sim">
          <div>
            <div className="talao-header-torn mb-2.5 flex justify-between items-center">
              <h3 className="font-bebas text-lg text-[#3D2817] flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-[#C44119]" />
                Simulador Inteligência
              </h3>
              <span className="text-[9.5px] text-[#3D2817]/50 font-mono">SIMULADOR</span>
            </div>

            {/* Quick selectors row */}
            <div className="grid grid-cols-4 gap-1 mb-2">
              {ACTIVE_TRIGGER_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveScenarioId(s.id)}
                  id={`trigger-tab-${s.id}`}
                  className={`py-1 rounded-sm text-[8px] font-bold tracking-tight text-center truncate cursor-pointer ${
                    activeScenarioId === s.id
                      ? "bg-[#3D2817] text-[#F4EBD9]"
                      : "bg-[#3D2817]/5 border border-[#3D2817]/20 text-[#3D2817] hover:bg-[#3D2817]/10"
                  }`}
                  title={s.name}
                >
                  {s.id === "friday_morning" && "🗓️ Sexta 10h"}
                  {s.id === "supplier_surge" && "🥖 Carb +10%"}
                  {s.id === "loyal_churn_10d" && "💔 Abandono"}
                  {s.id === "cash_flow_negative" && "💳 Caixa Neg"}
                </button>
              ))}
            </div>

            {/* Simulation Context details */}
            <div className="bg-[#3D2817]/5 rounded-sm p-3 border border-[#3D2817]/25 space-y-1.5 text-[10.5px]">
              <div>
                <p className="font-bebas text-sm text-[#3D2817] tracking-wider uppercase leading-none">{currentScenario.name}</p>
                <p className="text-[9px] text-[#C44119] font-mono font-black uppercase mt-1 leading-none">{currentScenario.impactCalc}</p>
              </div>
              <p className="text-[#3D2817] font-sans italic text-[11px] leading-snug">
                "{currentScenario.situation}"
              </p>
            </div>
          </div>

          {/* Copy Direct Message Action Button */}
          <div className="mt-3">
            <button
              onClick={() => {
                handleCopyText(currentScenario.actionMessage, currentScenario.id);
                setTriggeredAlerts([...triggeredAlerts, currentScenario.id]);
                alert(`Gatilho simulado e mensagem copiada para o WhatsApp!`);
              }}
              id={`sim-trigger-fire-${currentScenario.id}`}
              className="w-full btn-brasa py-2 text-xs flex items-center justify-center gap-1.5 select-none"
            >
              <Flame className="w-3.5 h-3.5 animate-pulse text-[#E8A33D]" />
              <span>DISPARAR WHATSAPP ({copiedId === currentScenario.id ? "COPIADO!" : "COPIAR MENSAGEM"})</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
