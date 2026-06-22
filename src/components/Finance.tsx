import React, { useState } from "react";
import { SetupConfig, ClientProfile, FinancialMetrics } from "../types";
import { calculateBreakEven, calculateROI, calculateCashFlow, calculateCAC, calculateClientLTV } from "../utils/finance";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area 
} from "recharts";
import { 
  Percent, TrendingUp, DollarSign, Users, Award, ShieldAlert, 
  CheckCircle, Calculator, ArrowUpRight, Sliders, RefreshCw 
} from "lucide-react";

interface FinanceProps {
  config: SetupConfig;
  clients: ClientProfile[];
  metrics: FinancialMetrics;
  onUpdateMetrics: (updated: Partial<FinancialMetrics>) => void;
}

export default function Finance({ config, clients, metrics, onUpdateMetrics }: FinanceProps) {
  // Simulator states (local copies for instant live feedback sliding!)
  const [simMarketingInvestment, setSimMarketingInvestment] = useState(metrics.marketingInvestment);
  const [simMarketingRevenue, setSimMarketingRevenue] = useState(metrics.marketingRevenue);
  const [simFixedCosts, setSimFixedCosts] = useState(config.fixedCosts);
  const [simSupplierPctInc, setSimSupplierPctInc] = useState(0); // Price increase slider %
  const [simSalesCount, setSimSalesCount] = useState(metrics.currentSalesCount);

  // Derive target parameters
  const ticket = config.ticketMedio;
  const originalMarginPct = 0.60;
  const simIngredientsCostRatio = 0.40 * (1 + simSupplierPctInc / 100);
  const simMarginPct = Math.max(0.10, 1 - simIngredientsCostRatio);

  // 1. ROI Live Math
  const liveROI = calculateROI(simMarketingInvestment, simMarketingRevenue);
  const lastMonthROI = 135; // historical comparison
  const isRoiLow = liveROI < 100;

  // 2. Fluxo de Caixa Live Math
  const liveConfirmedEntries = simSalesCount * ticket;
  const pipelineEntries = clients.filter(c => c.visitFrequency >= 2).length * ticket * 1.5;
  const liveVariableCosts = liveConfirmedEntries * simIngredientsCostRatio;
  
  const liveCashFlow = calculateCashFlow(
    liveConfirmedEntries,
    pipelineEntries,
    simFixedCosts,
    liveVariableCosts
  );

  // 3. CAC Live Math
  const newClientsSim = Math.max(1, Math.round(simSalesCount * 0.25)); // assume roughly 25% are new
  const liveCAC = calculateCAC(simMarketingInvestment, newClientsSim);
  const isCacTooHigh = liveCAC > ticket;

  // 4. LTV Live Math
  const averageFreq = clients.reduce((acc, c) => acc + c.visitFrequency, 0) / clients.length || 3.0;
  const liveLTV = calculateClientLTV(ticket, averageFreq);
  const ltvCacRatio = liveCAC > 0 ? (liveLTV / liveCAC).toFixed(1) : "N/A";
  
  // Golden Clients (TOP 5 LTV for higher density space)
  const goldenClients = [...clients]
    .map(c => ({
      ...c,
      calculatedLTV: calculateClientLTV(ticket, c.visitFrequency)
    }))
    .sort((a, b) => b.calculatedLTV - a.calculatedLTV)
    .slice(0, 5);

  const highLtvChurnRisk = [...clients]
    .filter(c => calculateClientLTV(ticket, c.visitFrequency) >= ticket * 12 && c.lastVisitDaysAgo >= 10);

  // 5. Break Even Live Math
  const liveBreakEven = calculateBreakEven(simFixedCosts, ticket, simMarginPct);
  const liveBePercent = Math.min(100, Math.round((simSalesCount / liveBreakEven.salesNeeded) * 100));
  const runRatePerDay = simSalesCount / Math.max(1, metrics.currentDayOfMonth);
  const projectedBeDay = runRatePerDay > 0 ? Math.ceil(liveBreakEven.salesNeeded / runRatePerDay) : 31;
  const dayOfEquilibriumAlert = metrics.currentDayOfMonth >= 20 && liveBePercent < 100;

  const [notification, setNotification] = useState<string | null>(null);

  const handleApplySimToCore = () => {
    onUpdateMetrics({
      marketingInvestment: simMarketingInvestment,
      marketingRevenue: simMarketingRevenue,
      currentSalesCount: simSalesCount,
      fixedCosts: simFixedCosts,
    });
    setNotification("Parâmetros de simulação aplicados com sucesso! 🤝");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleResetSim = () => {
    setSimMarketingInvestment(metrics.marketingInvestment);
    setSimMarketingRevenue(metrics.marketingRevenue);
    setSimFixedCosts(config.fixedCosts);
    setSimSupplierPctInc(0);
    setSimSalesCount(metrics.currentSalesCount);
  };

  // Recharts visual formatting (Charcoal & Brasa palette)
  const mockCashFlowProjectionData = [
    { name: "Confirmado", Saldo: Math.round(liveConfirmedEntries - (simFixedCosts + liveVariableCosts)) },
    { name: "30d Proj", Saldo: Math.round(liveCashFlow.projected30d) },
    { name: "60d Proj", Saldo: Math.round(liveCashFlow.projected60d) }
  ];

  const roiTimelineData = [
    { name: "Mês -2", ROI: 85 },
    { name: "Mês -1", ROI: 110 },
    { name: "Mês Actual", ROI: Math.round(liveROI) }
  ];

  return (
    <div className="space-y-4 animate-fade-in text-[#3D2817]" id="high-density-finance">
      
      {/* 1. Cohesive Header (Sleek and tight) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-[#F4EBD9] text-[#3D2817] border-2 border-[#3D2817] p-3 rounded-sm shadow-[2px_2.5px_0_rgba(26,20,16,0.9)] select-none">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#E8A33D] bg-[#3D2817] border border-[#3D2817] px-2 py-0.5 rounded-sm uppercase tracking-wider leading-none">
            • Simulador de Emergência Capitalista •
          </span>
          <h2 className="font-display font-extrabold text-2xl text-[#3D2817] mt-1.5 flex items-center gap-2 uppercase tracking-wide leading-none">
            <Calculator className="w-5 h-5 text-[#C44119]" />
            Inteligência Financeira Operacional
          </h2>
          <p className="text-[#3D2817]/65 text-[11px] font-mono mt-1">
            Gere cenários e analise custos de insumos na grelha de Luanda para projeções de fluxo de caixa 60d.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
          <button
            onClick={handleResetSim}
            id="btn-un-sim"
            className="flex-1 md:flex-initial px-3 py-2 bg-[#3D2817]/10 hover:bg-[#3D2817]/15 border-2 border-[#3D2817] text-[#3D2817] rounded-sm text-xs font-bebas uppercase tracking-wide transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resetar</span>
          </button>
          <button
            onClick={handleApplySimToCore}
            id="btn-apply-sim"
            className="flex-1 md:flex-initial px-4 py-2 bg-[#3D2817] hover:bg-[#3D2817]/95 text-[#F4EBD9] border-2 border-[#3D2817] rounded-sm text-xs font-bebas uppercase tracking-wide shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            Gravar no Painel
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-[#7A8B6F] text-[#F4EBD9] border-2 border-[#3D2817] font-bebas p-2 rounded-sm text-xs text-center uppercase tracking-wide animate-fade-in shadow-[1px_1.5px_0_rgba(26,20,16,0.95)]">
          ★ {notification} ★
        </div>
      )}

      {/* 2. Dynamic Sliders Playground (Super Tight Inline Style) */}
      <div className="bg-[#F4EBD9] border-2 border-[#3D2817] p-3 rounded-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 shadow-[1.5px_2px_0_rgba(26,20,16,0.95)]" id="section-finance-sliders">
        
        {/* Slider 1: Ad Spend */}
        <div className="space-y-1 bg-[#3D2817]/5 p-2 rounded-sm border border-[#3D2817]/20">
          <div className="flex justify-between items-center text-[10px]">
            <label htmlFor="range-marketing-investment" className="font-bold text-[#3D2817]/75 uppercase font-mono">Invest Ads</label>
            <span className="font-bold text-[#3D2817] font-mono">{simMarketingInvestment.toLocaleString()} Kz</span>
          </div>
          <input
            type="range"
            id="range-marketing-investment"
            min="10000"
            max="300000"
            step="5000"
            value={simMarketingInvestment}
            onChange={(e) => setSimMarketingInvestment(Number(e.target.value))}
            className="w-full h-1 bg-[#3D2817]/15 rounded appearance-none cursor-pointer accent-[#C44119]"
          />
          <div className="text-[8.5px] text-[#3D2817]/60 font-mono">Angola Instagram Ads</div>
        </div>

        {/* Slider 2: Tracked Return */}
        <div className="space-y-1 bg-[#3D2817]/5 p-2 rounded-sm border border-[#3D2817]/20">
          <div className="flex justify-between items-center text-[10px]">
            <label htmlFor="range-marketing-revenue" className="font-bold text-[#3D2817]/75 uppercase font-mono">Fatura Ads</label>
            <span className="font-bold text-[#3D2817] font-mono">{simMarketingRevenue.toLocaleString()} Kz</span>
          </div>
          <input
            type="range"
            id="range-marketing-revenue"
            min="20000"
            max="1000000"
            step="10000"
            value={simMarketingRevenue}
            onChange={(e) => setSimMarketingRevenue(Number(e.target.value))}
            className="w-full h-1 bg-[#3D2817]/15 rounded appearance-none cursor-pointer accent-[#C44119]"
          />
          <div className="text-[8.5px] text-[#3D2817]/60 font-mono">Vendas rastreadas</div>
        </div>

        {/* Slider 3: Outlay fixed costs */}
        <div className="space-y-1 bg-[#3D2817]/5 p-2 rounded-sm border border-[#3D2817]/20">
          <div className="flex justify-between items-center text-[10px]">
            <label htmlFor="range-fixed-costs" className="font-bold text-[#3D2817]/75 uppercase font-mono">Custos Fixos</label>
            <span className="font-bold text-[#3D2817] font-mono">{simFixedCosts.toLocaleString()} Kz</span>
          </div>
          <input
            type="range"
            id="range-fixed-costs"
            min="50000"
            max="600000"
            step="10000"
            value={simFixedCosts}
            onChange={(e) => setSimFixedCosts(Number(e.target.value))}
            className="w-full h-1 bg-[#3D2817]/15 rounded appearance-none cursor-pointer accent-[#C44119]"
          />
          <div className="text-[8.5px] text-[#3D2817]/60 font-mono">Renda, salários, energia</div>
        </div>

        {/* Slider 4: Supplier surge */}
        <div className="space-y-1 bg-[#3D2817]/5 p-2 rounded-sm border border-[#3D2817]/20">
          <div className="flex justify-between items-center text-[10px]">
            <label htmlFor="range-supplier-pct-inc" className="font-bold text-[#3D2817]/75 uppercase font-mono">Carne/Pão</label>
            <span className={`font-bold font-mono ${simSupplierPctInc > 0 ? "text-[#C44119]" : "text-[#3D2817]/70"}`}>+{simSupplierPctInc}%</span>
          </div>
          <input
            type="range"
            id="range-supplier-pct-inc"
            min="0"
            max="50"
            step="5"
            value={simSupplierPctInc}
            onChange={(e) => setSimSupplierPctInc(Number(e.target.value))}
            className="w-full h-1 bg-[#3D2817]/15 rounded appearance-none cursor-pointer accent-[#C44119]"
          />
          <div className="text-[8.5px] text-[#3D2817]/60 font-mono font-bold">Insumo fornecedor</div>
        </div>

        {/* Slider 5: Sales volume achieved */}
        <div className="space-y-1 bg-[#C44119]/5 p-2 rounded-sm border border-[#C44119]/25 col-span-1 sm:col-span-2 md:col-span-1">
          <div className="flex justify-between items-center text-[10px]">
            <label htmlFor="range-sales-count" className="font-extrabold text-[#C44119] uppercase font-mono">Burgers/Mês</label>
            <span className="font-black text-[#C44119] font-mono">{simSalesCount} vds</span>
          </div>
          <input
            type="range"
            id="range-sales-count"
            min="1"
            max="500"
            step="10"
            value={simSalesCount}
            onChange={(e) => setSimSalesCount(Number(e.target.value))}
            className="w-full h-1 bg-[#3D2817]/15 rounded appearance-none cursor-pointer accent-[#C34119]"
          />
          <div className="text-[8.5px] text-[#3D2817]/60 font-mono">Vendas totais simulador</div>
        </div>

      </div>

      {/* 3. Five Financial Modules (3-Column layout perfectly integrated to eliminate scroll and maximize density) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5" id="section-finance-metric-details">
        
        {/* COLUMN 1: ROI & CAC (Marketing & Acquisition Side-by-side) */}
        <div className="space-y-3.5 flex flex-col justify-between">
          
          {/* Module 1: ROI Card */}
          <div className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-3.5 space-y-2.5 flex-1 shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] flex flex-col justify-between" id="finance-section-roi">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-mono text-[#C44119] font-black uppercase block leading-none">MÓDULO 1</span>
                  <h3 className="font-bebas tracking-wide uppercase text-slate-900 text-sm mt-1">Resultado dos Anúncios (ROI)</h3>
                  <p className="text-[9px] text-[#3D2817]/60 font-mono leading-none mt-1">Multiplicador real de cada investimento em panfletos e média de publicidade</p>
                </div>
                <div className="p-1 px-1.5 bg-[#C44119] text-[#F4EBD9] border border-[#3D2817] rounded-sm">
                  <Percent className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-2 rounded-sm text-center">
                  <span className="text-[8px] text-[#3D2817]/60 block uppercase font-mono font-bold leading-none">Rentabilidade</span>
                  <span className={`text-sm font-black font-mono block mt-1 ${isRoiLow ? "text-[#C44119]" : "text-[#7A8B6F]"}`}>
                    {liveROI.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-2 rounded-sm text-center">
                  <span className="text-[8px] text-[#3D2817]/60 block uppercase font-mono font-bold leading-none">Mês Anterior</span>
                  <span className="text-sm font-black font-mono text-[#3D2817] block mt-1">
                    {lastMonthROI}%
                  </span>
                </div>
              </div>

              {isRoiLow && (
                <div className="bg-[#C44119]/10 border-2 border-[#C44119]/30 rounded-sm p-2 leading-tight flex items-start gap-1.5 text-[10px] text-[#3D2817]">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#C44119]" />
                  <span>
                    <strong>Atenção:</strong> Os teus anúncios estão a dar prejuízo! Estás a gastar mais em publicidade do que o que estás a receber de volta.
                  </span>
                </div>
              )}
            </div>

            <div className="h-16 mt-1.5 opacity-90">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={roiTimelineData}>
                  <Area type="monotone" dataKey="ROI" stroke="#C44119" fill="rgba(196, 65, 25, 0.1)" strokeWidth={2} />
                  <XAxis dataKey="name" fontSize={7} stroke="#3D2817" tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: "8px", background: "#F4EBD9", border: "2px solid #3D2817" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Module 3: CAC Card */}
          <div className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-3.5 space-y-2.5 flex-1 shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] flex flex-col justify-between" id="finance-section-cac">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-mono text-[#3D2817]/70 font-black uppercase block leading-none">MÓDULO 3</span>
                  <h3 className="font-bebas tracking-wide uppercase text-slate-900 text-sm mt-1">Custo por Cliente Novo (CAC)</h3>
                  <p className="text-[9px] text-[#3D2817]/60 font-mono mt-1">Custo médio para atrair cada comensal novo</p>
                </div>
                <div className="p-1 px-1.5 bg-[#3D2817] text-[#F4EBD9] border border-[#3D2817] rounded-sm">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-2 rounded-sm text-center">
                  <span className="text-[8px] text-[#3D2817]/60 block uppercase font-mono font-bold leading-none">Adquirir Cliente</span>
                  <span className={`text-sm font-black font-mono block mt-1 ${isCacTooHigh ? "text-[#C44119]" : "text-[#3D2817]"}`}>
                    {Math.round(liveCAC).toLocaleString()} Kz
                  </span>
                </div>
                <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-2 rounded-sm text-center">
                  <span className="text-[8px] text-[#3D2817]/60 block uppercase font-mono font-bold leading-none">Sob Ticket</span>
                  <span className="text-sm font-black font-mono text-[#3D2817] block mt-1">
                    {((liveCAC / ticket) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {isCacTooHigh && (
                <div className="bg-[#C44119]/10 border-2 border-[#C44119]/30 rounded-sm p-2 leading-tight flex items-start gap-1.5 text-[10px] text-[#3D2817]">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#C44119]" />
                  <span>
                    <strong>Crítico:</strong> Atrair cada cliente novo está a custar mais caro do que o lucro que eles te deixam no primeiro hambúrguer!
                  </span>
                </div>
              )}
            </div>
            
            <p className="bg-[#3D2817]/5 px-2.5 py-1.5 border border-[#3D2817]/20 rounded-sm text-[9.5px] font-mono leading-relaxed text-[#3D2817]/80 block">
              💡 Use combos criativos no WhatsApp para rebaixar o custo do cliente novo.
            </p>
          </div>

        </div>

        {/* COLUMN 2: CASH FLOW & LTV (Internal values stacked) */}
        <div className="space-y-3.5 flex flex-col justify-between">
          
          {/* Module 2: Fluxo de Caixa Card */}
          <div className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-3.5 space-y-2.5 flex-1 shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] flex flex-col justify-between" id="finance-section-caixa">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-mono text-[#E8A33D] font-bold uppercase block leading-none">MÓDULO 2</span>
                  <h3 className="font-bebas tracking-wide uppercase text-slate-900 text-sm mt-1">Dinheiro a Entrar e a Sair (Fluxo de Caixa)</h3>
                  <p className="text-[9px] text-[#3D2817]/60 font-mono mt-1">Movimentações de caixa e estimativa de compras</p>
                </div>
                <div className="p-1 px-1.5 bg-[#E8A33D] text-[#1A1410] border border-[#3D2817] rounded-sm">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 my-2 text-[10.5px]">
                <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-1 rounded-sm text-center">
                  <span className="text-[7.5px] text-[#3D2817]/50 block font-mono font-bold leading-none">Saldo</span>
                  <span className={`text-[10px] font-black font-mono block mt-1 ${liveCashFlow.currentBalance < 0 ? "text-[#C44119]" : "text-[#3D2817]"}`}>
                    {liveCashFlow.currentBalance.toLocaleString()} Kz
                  </span>
                </div>
                <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-1 rounded-sm text-center">
                  <span className="text-[7.5px] text-[#3D2817]/50 block font-mono font-bold leading-none">30 Dias</span>
                  <span className={`text-[10px] font-black font-mono block mt-1 ${liveCashFlow.isNegative30d ? "text-[#C44119]" : "text-[#3D2817]"}`}>
                    {liveCashFlow.projected30d.toLocaleString()} Kz
                  </span>
                </div>
                <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-1 rounded-sm text-center">
                  <span className="text-[7.5px] text-[#3D2817]/50 block font-mono font-bold leading-none">60 Dias</span>
                  <span className={`text-[10px] font-black font-mono block mt-1 ${liveCashFlow.isNegative60d ? "text-[#C44119]" : "text-[#3D2817]"}`}>
                    {liveCashFlow.projected60d.toLocaleString()} Kz
                  </span>
                </div>
              </div>

              {liveCashFlow.isNegative30d && (
                <div className="bg-[#C44119]/10 border-2 border-[#C44119]/30 rounded-sm p-2 leading-tight flex items-start gap-1.5 text-[10px] text-[#3D2817]">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#C44119]" />
                  <span>
                    <strong>Atenção:</strong> A estimativa indica que podes ficar sem dinheiro em caixa nos próximos 30 dias se o ritmo continuar assim!
                  </span>
                </div>
              )}
            </div>

            <div className="h-16 mt-1.5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockCashFlowProjectionData}>
                  <Bar dataKey="Saldo" fill="#3D2817" radius={[1, 1, 0, 0]} />
                  <XAxis dataKey="name" fontSize={7} stroke="#3D2817" tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: "8px", background: "#F4EBD9", border: "2px solid #3D2817" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Module 4: LTV Card */}
          <div className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-3.5 space-y-2.5 flex-1 shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] flex flex-col justify-between" id="finance-section-ltv">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-mono text-[#7A8B6F] font-bold uppercase block leading-none">MÓDULO 4</span>
                  <h3 className="font-bebas tracking-wide uppercase text-slate-900 text-sm mt-1">Valor de Cada Cliente (LTV)</h3>
                  <p className="text-[9px] text-[#3D2817]/60 font-mono mt-1">Quanto um cliente fiel gasta em média connosco ao longo de 6 meses</p>
                </div>
                <div className="p-1 px-1.5 bg-[#7A8B6F] text-[#F4EBD9] border border-[#3D2817] rounded-sm">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-2 rounded-sm text-center">
                  <span className="text-[8px] text-[#3D2817]/60 block uppercase font-mono font-bold leading-none">Valor por Cliente (LTV)</span>
                  <span className="text-sm font-black font-mono text-[#3D2817] block mt-1">
                    {Math.round(liveLTV).toLocaleString()} Kz
                  </span>
                </div>
                <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-2 rounded-sm text-center">
                  <span className="text-[8px] text-[#3D2817]/60 block uppercase font-mono font-bold leading-none">Multiplicador de Valor</span>
                  <span className="text-sm font-black font-mono text-[#3D2817] block mt-1 font-mono">
                    {ltvCacRatio}x
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[8px] uppercase font-mono font-bold text-[#3D2817]/60 block leading-none">Top 3 Clientes Alta Frequência:</span>
              <div className="space-y-1 text-[10px]">
                {goldenClients.slice(0, 3).map((g) => (
                  <div key={g.id} className="flex justify-between items-center bg-[#3D2817]/5 py-1 px-2 border border-[#3D2817]/15 rounded-sm font-mono text-[#3D2817]">
                    <span className="font-sans truncate text-[#3D2817] font-bold max-w-[80px]">{g.name}</span>
                    <span className="text-[#C44119] font-bold leading-none">{g.calculatedLTV.toLocaleString()} Kz</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN 3: BREAK EVEN (Single full-height dense card) */}
        <div className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-3.5 flex flex-col justify-between shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] col-span-1 md:col-span-2 lg:col-span-1" id="finance-section-breakeven">
          <div>
            <div className="flex justify-between items-start pb-2 border-b border-dashed border-[#3D2817]/25">
              <div>
                <span className="text-[8px] font-mono text-[#3D2817]/70 font-bold uppercase block leading-none">MÓDULO 5</span>
                <h3 className="font-bebas tracking-wide uppercase text-slate-900 text-sm mt-1">Quanto Preciso Vender Para Não Perder Dinheiro (Ponto de Equilíbrio)</h3>
                <p className="text-[9px] text-[#3D2817]/60 font-mono leading-relaxed mt-1">
                  Divisão dos custos fixos ({simFixedCosts.toLocaleString()} Kz) pela margem de lucro de cada hambúrguer gasto
                </p>
              </div>
              <div className="p-1 bg-[#3D2817] border border-[#3D2817] rounded-sm shrink-0">
                <Calculator className="w-3.5 h-3.5 text-[#F4EBD9]" />
              </div>
            </div>

            {dayOfEquilibriumAlert && (
              <div className="bg-[#C44119]/10 border-2 border-[#C44119]/30 p-2.5 rounded-sm flex items-start gap-1.5 mt-2.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5 text-[#C44119] shrink-0 mt-0.5" />
                <span className="text-[9.5px] text-[#3D2817] leading-relaxed">
                  <strong>Ponto de Alerta:</strong> Passámos do Dia 20 e ainda não vendemos o suficiente para pagar todas as contas fixas do mês!
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 my-3 text-xs">
              <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-2 rounded-sm text-center">
                <span className="text-[8px] text-[#3D2817]/60 block uppercase font-mono font-bold leading-none">Meta para Empatar</span>
                <span className="text-base font-black font-mono text-[#3D2817] block mt-1.5">{liveBreakEven.salesNeeded} Unids</span>
                <span className="text-[8px] text-[#3D2817]/60 font-mono mt-1 block">hambúrgueres/mês</span>
              </div>
              <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-2 rounded-sm text-center">
                <span className="text-[8px] text-[#3D2817]/60 block uppercase font-mono font-bold leading-none">Faturação Necessária</span>
                <span className="text-base font-black font-mono text-[#C44119] block mt-1.5">{liveBreakEven.revenueNeeded.toLocaleString()} Kz</span>
                <span className="text-[8px] text-[#3D2817]/60 font-mono mt-1 block">para pagar contas</span>
              </div>
              <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-2 rounded-sm text-center">
                <span className="text-[8px] text-[#3D2817]/60 block uppercase font-mono font-bold leading-none">Hambúrgueres Vendidos</span>
                <span className="text-base font-black font-mono text-[#3D2817] block mt-1.5">{simSalesCount}</span>
                <span className="text-[8px] text-[#3D2817]/60 font-mono mt-1 block">quantidade</span>
              </div>
              <div className="bg-[#3D2817]/5 border border-[#3D2817]/15 p-2 rounded-sm text-center">
                <span className="text-[8px] text-[#3D2817]/60 block uppercase font-mono font-bold leading-none">Dia do Empate</span>
                <span className="text-base font-black font-mono text-[#3D2817] block mt-1.5">{projectedBeDay > 30 ? "Fora do Mês" : `Dia ${projectedBeDay}`}</span>
                <span className="text-[8px] text-[#3D2817]/60 font-mono mt-1 block font-mono">ritmo actual</span>
              </div>
            </div>
          </div>

          {/* Progress bar inside module */}
          <div className="space-y-1.5 bg-[#3D2817]/5 p-2.5 border border-[#3D2817]/15 rounded-sm">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-[#3D2817]/70 font-mono uppercase">Progresso para empatar o mês:</span>
              <span className="font-mono font-extrabold text-[#3D2817]">{liveBePercent}% Batido</span>
            </div>
            <div className="h-3.5 bg-[#3D2817]/15 rounded-sm w-full overflow-hidden relative border border-[#3D2817]/30">
              <div 
                className={`h-full rounded-sm transition-all duration-300 ${
                  liveBePercent >= 100 
                    ? "bg-[#7A8B6F]" 
                    : "bg-[#C44119]"
                }`} 
                style={{ width: `${liveBePercent}%` }} 
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8.5px] font-mono font-extrabold text-white mix-blend-difference">
                {simSalesCount} / {liveBreakEven.salesNeeded} Unids
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
