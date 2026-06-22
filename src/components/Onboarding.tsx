import React, { useState } from "react";
import { SetupConfig } from "../types";
import { Coffee, DollarSign, Target, Briefcase, Plus, TrendingUp, Sparkles, Sliders } from "lucide-react";

interface OnboardingProps {
  onComplete: (config: SetupConfig) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [businessName, setBusinessName] = useState("Vapor & Brasa");
  const [operationType, setOperationType] = useState<"balcao" | "delivery" | "ambos">("ambos");
  const [ticketMedio, setTicketMedio] = useState<number>(2500);
  const [targetNewClients, setTargetNewClients] = useState<number>(40);
  const [fixedCosts, setFixedCosts] = useState<number>(200000);
  const [mainChannel, setMainChannel] = useState("WhatsApp");
  const [hasSalesTeam, setHasSalesTeam] = useState(false);
  const [monthlyRevenueTarget, setMonthlyRevenueTarget] = useState<number>(1000000);

  const totalSteps = 8;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const finalConfig: SetupConfig = {
        hasCompletedOnboarding: true,
        businessName: businessName || "BURGUERSPRIME",
        operationType,
        ticketMedio: Number(ticketMedio) || 2500,
        targetNewClients: Number(targetNewClients) || 40,
        fixedCosts: Number(fixedCosts) || 200000,
        mainChannel,
        hasSalesTeam,
        monthlyRevenueTarget: Number(monthlyRevenueTarget) || 1000000,
      };
      onComplete(finalConfig);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Live indicators based on onboarding values
  const marginContrib = ticketMedio * 0.60;
  const breakEvenUnits = marginContrib > 0 ? Math.ceil(fixedCosts / marginContrib) : 0;
  const targetUnits = ticketMedio > 0 ? Math.ceil(monthlyRevenueTarget / ticketMedio) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Background elegant decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/5 blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600 text-white rounded-xl font-black text-xl tracking-tight shadow-md shadow-red-500/10">
            BP
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-slate-950">
              BURGUERSPRIME <span className="text-red-600">CRM + FINANCE</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Hamburgueria Operating System v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">Progresso</span>
          <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-red-600 font-mono">{step}/{totalSteps}</span>
        </div>
      </div>

      {/* Main Focus Wizard Container */}
      <div className="max-w-xl mx-auto w-full my-auto py-12 z-10">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
          
          {/* Step 1: Nome da Hamburgueria */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-red-650 uppercase font-mono bg-red-50 border border-red-250/20 px-2.5 py-1 rounded">Passo Inicial</span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">Como se chama a tua Hamburgueria?</h2>
                <p className="text-slate-500 text-sm">Insere o nome comercial que os teus clientes de Angola conhecem nas redes sociais.</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="onboarding-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl px-5 py-4 text-lg text-slate-900 font-semibold outline-none shadow-inner"
                  placeholder="Ex: Vapor & Brasa, X-Salada Lobito"
                />
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-red-600 font-bold shrink-0" />
                <span>O sistema configurará scripts de vendas personalizados com este nome!</span>
              </div>
            </div>
          )}

          {/* Step 2: Método de Operação */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-red-600 uppercase font-mono bg-red-50 border border-red-200/50 px-2.5 py-1 rounded">Logística</span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">Como ficas a entregar os hambúrgueres?</h2>
                <p className="text-slate-500 text-sm">Isto nos ajuda a definir as canais de venda e logística de checkout do teu CRM.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "balcao", title: "Apenas Balcão & Mesa", desc: "Os clientes vêm comer ou recolher na loja física" },
                  { id: "delivery", title: "Apenas Delivery (Entrega)", desc: "Trabalhas focado em motoqueiros e take-away" },
                  { id: "ambos", title: "Ambos os Canais (Misto)", desc: "Tens mesas na loja e também fazes carretos de delivery" }
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`op-type-${item.id}`}
                    onClick={() => setOperationType(item.id as any)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex flex-col gap-1 ${
                      operationType === item.id
                        ? "bg-red-50 border-red-500 text-slate-800 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span className="font-extrabold text-sm tracking-tight">{item.title}</span>
                    <span className="text-xs text-slate-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Ticket Médio */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-red-600 uppercase font-mono bg-red-50 border border-red-200/50 px-2.5 py-1 rounded">Finanças base</span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">Quanto gasta, em média, cada cliente em cada pedido?</h2>
                <p className="text-slate-500 text-sm">O valor médio de kumbu (dinheiro) gasto por um cliente em cada pedido (incluindo bebida e batata).</p>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold font-mono">
                  Kz
                </div>
                <input
                  type="number"
                  id="onboarding-ticket"
                  value={ticketMedio}
                  onChange={(e) => setTicketMedio(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl pl-12 pr-5 py-4 text-xl text-slate-950 font-bold font-mono outline-none shadow-inner"
                  placeholder="2500"
                />
              </div>
              {ticketMedio > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span>O que sobra do hambúrguer para pagar outras contas (lucro bruto - 60%):</span>
                    <span className="text-emerald-700 font-mono font-bold">{(ticketMedio * 0.6).toLocaleString()} Kz</span>
                  </div>
                  <div className="flex justify-between">
                    <span>O que gastas em carne, pão e molhos (custo de ingredientes - 40%):</span>
                    <span className="text-slate-500 font-mono">{(ticketMedio * 0.4).toLocaleString()} Kz</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Novos Clientes Meta */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-red-650 uppercase font-mono bg-red-50 border border-red-250/20 px-2.5 py-1 rounded">Meta de Crescimento</span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">Meta de novos clientes por mês?</h2>
                <p className="text-slate-500 text-sm">Quantos novos esfomeados quer atrair e converter para a tua chapa todos os meses?</p>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="onboarding-clients"
                  value={targetNewClients}
                  onChange={(e) => setTargetNewClients(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl px-5 py-4 text-xl text-slate-950 font-bold font-mono outline-none shadow-inner"
                  placeholder="40"
                />
                {targetNewClients > 500 && (
                  <p className="text-xs text-amber-600 leading-tight mt-1 font-semibold font-sans">
                    ⚠️ Meta irrealista para esta operação. Recomenda-se entre 30 e 150 para garantir acompanhamento personalizado sem estourar o orçamento de marketing.
                  </p>
                )}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Target className="w-4 h-4 text-red-600 shrink-0" />
                <span>Esta meta vai ajudar a calcular se estás a gastar muito ou pouco dinheiro a divulgar o teu negócio!</span>
              </div>
            </div>
          )}

          {/* Step 5: Custos Fixos Mensais */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-red-650 uppercase font-mono bg-red-50 border border-red-250/20 px-2.5 py-1 rounded">Custos de Operação</span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">De quanto dinheiro precisas para manter a porta aberta e o fogo aceso todos os meses?</h2>
                <p className="text-slate-500 text-sm">Soma tudo o que pagas mesmo que não vendas nenhum hambúrguer: Renda do espaço físico, energia, gás, salário da equipa e internet.</p>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-550 font-bold font-mono">
                  Kz
                </div>
                <input
                  type="number"
                  id="onboarding-fixed"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl pl-12 pr-5 py-4 text-xl text-slate-950 font-bold font-mono outline-none shadow-inner"
                  placeholder="200000"
                />
              </div>
              {fixedCosts > 0 && (
                <div className="bg-red-50/45 rounded-xl p-4 border border-red-200/55 text-xs text-slate-700 flex items-start gap-3">
                  <div className="mt-0.5 text-lg font-bold">🍔</div>
                  <div>
                    <span className="font-bold">O que isto significa:</span> Com a média que cada cliente gasta hoje, precisas de vender pelo menos <strong className="font-mono text-slate-900 text-sm bg-white border border-slate-200 px-1.5 py-0.5 rounded">{breakEvenUnits} hambúrgueres</strong> por mês só para pagar os custos básicos e não perder dinheiro!
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Canal Principal de Captação */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-red-650 uppercase font-mono bg-red-50 border border-red-250/20 px-2.5 py-1 rounded">Marketing</span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">Onde vêm mais mensagens e clientes?</h2>
                <p className="text-slate-500 text-sm">Isto configurará os templates automáticos de atendimento do teu painel comercial.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "WhatsApp", title: "WhatsApp Business" },
                  { id: "Instagram", title: "Instagram DM" },
                  { id: "Indicação", title: "Passa-Palavra (Amigos)" },
                  { id: "Fisico", title: "Passantes de Rua" }
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`cap-ch-${item.id}`}
                    onClick={() => setMainChannel(item.id)}
                    className={`text-left px-4 py-3.5 rounded-xl border flex flex-col justify-center items-center text-center gap-1.5 transition-all duration-200 ${
                      mainChannel === item.id
                        ? "bg-red-50 border-red-500 text-slate-900 font-bold shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-550 hover:border-slate-350 hover:text-slate-800"
                    }`}
                  >
                    <span className="text-sm font-bold tracking-tight">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Equipa ou Solo */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-red-650 uppercase font-mono bg-red-50 border border-red-250/20 px-2.5 py-1 rounded">Estrutura Interna</span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">Quem faz as vendas e atende as mensagens?</h2>
                <p className="text-slate-500 text-sm">Ajudará a calibrar as ações urgentes no CRM.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button
                  id="sales-team-false"
                  onClick={() => setHasSalesTeam(false)}
                  className={`w-full text-left px-5 py-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                    !hasSalesTeam
                      ? "bg-red-50 border-red-500 text-slate-900"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <span className="font-extrabold text-sm block">Sou apenas eu ("Guerreiro Solo")</span>
                    <span className="text-xs text-slate-500">Atendo no WhatsApp, controlo a chapa e fecho o caixa do guito</span>
                  </div>
                  {!hasSalesTeam && <div className="h-2.5 w-2.5 rounded-full bg-red-600 shadow" />}
                </button>
                <button
                  id="sales-team-true"
                  onClick={() => setHasSalesTeam(true)}
                  className={`w-full text-left px-5 py-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                    hasSalesTeam
                      ? "bg-red-50 border-red-500 text-slate-900"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <span className="font-extrabold text-sm block">Tenho equipa de vendas / Atendentes</span>
                    <span className="text-xs text-slate-500">Tenho funcionários ou operadores para receber pedidos</span>
                  </div>
                  {hasSalesTeam && <div className="h-2.5 w-2.5 rounded-full bg-red-600 shadow" />}
                </button>
              </div>
            </div>
          )}

          {/* Step 8: Meta de Faturação Mensal */}
          {step === 8 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-red-600 uppercase font-mono bg-red-50 border border-red-250/20 px-2.5 py-1 rounded">Objetivo de Chapa</span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">Quanto dinheiro gostarias de ver entrar no teu caixa todos os meses?</h2>
                <p className="text-slate-500 text-sm">Quanto kumbu total queres receber pelas vendas no final de cada mês?</p>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold font-mono">
                  Kz
                </div>
                <input
                  type="number"
                  id="onboarding-revenue"
                  value={monthlyRevenueTarget}
                  onChange={(e) => setMonthlyRevenueTarget(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-xl pl-12 pr-5 py-4 text-xl text-slate-950 font-bold font-mono outline-none shadow-inner"
                  placeholder="1000000"
                />
              </div>
              
              {monthlyRevenueTarget > 0 && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-250 text-xs text-green-850 space-y-1">
                  <div className="flex justify-between font-bold text-green-950">
                    <span>Meta de Vendas Mensais:</span>
                    <span className="font-mono font-black">{targetUnits} Hambúrgueres/mês</span>
                  </div>
                  <p className="text-slate-650 font-sans">
                    Isso quer dizer que precisas de vender cerca de <strong className="text-red-650 font-mono text-sm">{Math.ceil(targetUnits / 30)} hambúrgueres por dia</strong>. Uma meta muito realista se mimares bem os teus clientes e divulgares no WhatsApp!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                id="btn-onboarding-prev"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl border border-slate-250 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-sm font-semibold transition"
              >
                Anterior
              </button>
            ) : (
              <div />
            )}
            <button
              type="button"
              id="btn-onboarding-next"
              onClick={handleNext}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition active:scale-[0.98]"
            >
              {step === totalSteps ? (
                <>
                  <span>Gerar Sistema de Sucesso</span>
                  <Sparkles className="w-4 h-4 text-white" />
                </>
              ) : (
                <span>Continuar</span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-4xl mx-auto w-full text-center py-4 border-t border-slate-200 z-10">
        <p className="text-xs text-slate-500">
          BURGUERSPRIME &copy; {new Date().getFullYear()} — Criado especificamente para as Hamburguerias de Angola gerarem mais kumbu.
        </p>
      </div>
    </div>
  );
}
