import { SetupConfig, ClientProfile, AIActionSuggestion, WeeklySummary } from "../types";
import { calculateBreakEven, calculateCAC, calculateClientLTV, calculateROI } from "./finance";

/**
 * Heuristics-driven business advisory engine for BURGUERSPRIME CRM
 */

export function getAISuggestions(
  config: SetupConfig,
  clients: ClientProfile[],
  marketingInvestment: number,
  marketingRevenue: number,
  confirmedSales: number,
  newClientsThisMonth: number,
  currentDay: number
): AIActionSuggestion[] {
  const suggestions: AIActionSuggestion[] = [];
  const breakEvenCalc = calculateBreakEven(config.fixedCosts, config.ticketMedio);
  const activeCAC = calculateCAC(marketingInvestment, newClientsThisMonth);
  const totalSalesRevenue = confirmedSales * config.ticketMedio;
  
  // 1. Check Break Even Progress
  if (currentDay >= 20 && confirmedSales < breakEvenCalc.salesNeeded) {
    suggestions.push({
      id: "breakeven_alert_day_20",
      title: "🚨 Meta de Sobrevivência em Risco!",
      description: `Estamos no dia ${currentDay} do mês e ainda faltam fazer ${breakEvenCalc.salesNeeded - confirmedSales} vendas para bater o Ponto de Equilíbrio (Pagar os Custos Fixos). A tua hamburgueria precisa de acelerar nos combos familiares!`,
      priority: "alta",
      actionLabel: "Lançar Promoção Relâmpago",
      whatsappTemplate: `*🔥 PROMOÇÃO DE SOBREVIVÊNCIA - SÓ ATÉ DOMINGO!* \n\nOlá, pessoal! O vosso final de semana merece os melhores hambúrgueres do bairro. \n\nNa compra de *2 Hamburgueres Clássicos* com batata frita, o terceiro clássico sai por *APENAS 50% do preço*! \n\n*Pede já no WhatsApp:* [Link do WhatsApp]`
    });
  }

  // 2. Churn alert
  const loyalInRisk = clients.filter(c => c.visitFrequency >= 3 && c.lastVisitDaysAgo >= 10);
  if (loyalInRisk.length > 0) {
    const target = loyalInRisk[0];
    suggestions.push({
      id: "churn_risk_alert",
      title: "💔 Clientes Fiéis a Desaparecer",
      description: `Temos ${loyalInRisk.length} clientes fiéis (frequência 3x+) que não compram há mais de 10 dias. O principal é o parceiro(a) *${target.name}* (Fã do ${target.favoriteBurger || "Hambúrguer da Casa"}).`,
      priority: "alta",
      actionLabel: "Oferecer Miminho / Reactivar",
      whatsappTemplate: `*👋 Olá, ${target.name}! Sentimos a tua falta por cá!* \n\nFizemos o balanço e notamos que o teu *${target.favoriteBurger || "Hambúrguer Favorito"}* está com saudades de ti. \n\nPara o teu retorno triunfal à nossa chapa, preparamos uma bebida de borla no teu próximo pedido na nossa hamburgueria! 🥤🍔 \n\n*Vamos preparar um para hoje?*`
    });
  }

  // 3. CAC is too high
  if (activeCAC > config.ticketMedio) {
    suggestions.push({
      id: "cac_high_alert",
      title: "⚠️ Alerta de Alarme: CAC Ultrapassou o Ticket Médio!",
      description: `Estás a gastar em média ${Math.round(activeCAC).toLocaleString()} Kz em publicidade para conquistar cada cliente novo, mas eles gastam apenas ${config.ticketMedio.toLocaleString()} Kz por pedido. Isto vai queimar o teu kumbu (dinheiro)!`,
      priority: "alta",
      actionLabel: "Reduzir Custo de Captação",
      whatsappTemplate: `*🎉 PROGRAMA DE INDICAÇÃO BURGUERSPRIME — HAMBÚRGUER GRÁTIS!* \n\nFamília de comilões, sabiam que cada amigo que indicarem que fizer uma compra ganham *10% de desconto acumulável*?\n\nSe 5 amigos indicados comprarem, ganhas um *Super Burger da tua escolha de borla*!\n\n*Espalha o amor pela chapa:* [Link para partilhar]`
    });
  }

  // 4. Upsell Suggestion
  suggestions.push({
    id: "upsell_fidelidade",
    title: "⚡ Activar Segunda Compra",
    description: "Clientes novos do delivery têm 50% mais chance de fidelizar se fizerem o segundo pedido dentro de 7 dias. Dispara o script de fidelidade já!",
    priority: "media",
    actionLabel: "Ver Script de Fidelidade",
    whatsappTemplate: `*🍔 Olá! Amamos ter-te connosco no teu primeiro pedido!* \n\nPara que o teu paladar continue em festa, neste segundo pedido tens *entrega gratuita* na hamburgueria! Queremos ver se voltas a pedir o teu hambúrguer preferido. \n\nResponsabilidade na chapa! 🚀`
  });

  return suggestions;
}

export function getWeeklySummaryData(
  config: SetupConfig,
  clients: ClientProfile[],
  marketingInvestment: number
): WeeklySummary {
  // Mock last week telemetry derived from configuration targets
  const ticket = config.ticketMedio;
  const targetNew = config.targetNewClients;
  
  const salesCountLastWeek = Math.round((config.fixedCosts / ticket / 4) * 1.3);
  const salesRevenueLastWeek = salesCountLastWeek * ticket;
  const newClientsLastWeek = Math.round(targetNew / 4 * 0.9);
  const activeCAC = calculateCAC(marketingInvestment / 4, newClientsLastWeek) || Math.round(ticket * 0.35);
  const activeLTV = calculateClientLTV(ticket, 3); // 3x visits monthly average

  return {
    vendasSemanaAnterior: salesRevenueLastWeek,
    novosClientes: newClientsLastWeek,
    cacActual: activeCAC,
    ltvActual: activeLTV,
    pontosMelhorar: [
      "Aumentar o ticket médio oferecendo batatas fritas rusticas e molho da casa extra em cada conversação.",
      "Melhorar a taxa de resposta no WhatsApp nos horários de pico (19h às 21h) para não perder esfomeados.",
      "Criar um destaque fixe no Instagram para reviews de clientes que comeram ao balcão."
    ]
  };
}

export interface TriggerScenario {
  id: string;
  name: string;
  condition: string;
  situation: string;
  impactCalc: string;
  advice: string[];
  actionMessage: string;
}

export const ACTIVE_TRIGGER_SCENARIOS: TriggerScenario[] = [
  {
    id: "friday_morning",
    name: "Sexta-feira 10h — Aquecimento de Fim de Semana",
    condition: "Disparado todas as Sextas-feiras às 10h da manhã automaticamente",
    situation: "O final de semana representa 75% da faturação das hamburguerias. Precisamos de motivar a base de clientes a planear o jantar logo cedo.",
    impactCalc: "Pode aumentar o fluxo de caixa do fim de semana em até 30% e otimizar a preparação dos ingredientes (carne fresca).",
    advice: [
      "Lançar a promoção com limite de tempo ou escassez para gerar pressa.",
      "Se tiveres excesso de queijo Cheddar em stock, foca o destaque de hoje num burger duplo extra cheddar."
    ],
    actionMessage: "*🍔 SEXTA-FEIRA DA CHAPA QUENTE - GANHA BATATA FRITA GRÁTIS!* \n\nOlá! A preparar o teu final de semana em grande? \n\nFaz a tua reserva ou pedido hoje até às 17h, e garantimos que a tua batata frita super crocante vai de borla! \n\n*Garante já o teu kumbu de sabor:* [Link WhatsApp]"
  },
  {
    id: "supplier_surge",
    name: "⚠️ Aumento de 10% no Fornecedor de Pão e Carne",
    condition: "Disparado quando os custos de insumos sobem",
    situation: "Se o custo dos ingredientes subir 10%, o teu Ponto de Equilíbrio é empurrado para cima. Precisamos reajustar sutilmente e focar no mix de vendas com maior margem.",
    impactCalc: "A margem cai de 60% para 54%. Precisas de vender mais 11% de hambúrgueres para pagar a mesma despesa fixa mensal!",
    advice: [
      "Não subas o preço de todos os hambúrgueres de uma vez. Atualiza o preço da bebida ou das sobremesas primariamente.",
      "Cria um combo de maior valor para disfarçar o preço individual, ex: adicionar molho premium por um valor baixo mas de margem brutal."
    ],
    actionMessage: "*🚀 COMBO DUPLO FAMÍLIA — MAIS VALOR NA TUA MESA!* \n\nComida boa é comida partilhada! Reunimos os dois campeões de vendas com duas bebidas geladas e uma porção de batatas de Angola por um preço promocional especial.\n\n*Combina com o teu gang hoje mesmo:* [Link WhatsApp]"
  },
  {
    id: "loyal_churn_10d",
    name: "💔 Cliente Fiel Desaparecido Há 10 Dias",
    condition: "Gatilho automático de fidelidade quando a última visita > 10 dias",
    situation: "Reter um cliente fiel custa 5x menos do que atrair um novo do Instagram. Um no-show de 10 dias de quem comprava 3x por mês é um alerta vergonhoso de abandono.",
    impactCalc: "Salva o LTV projetado de 45.000 Kz que seria perdido para a concorrência.",
    advice: [
      "Contacta de forma personalizada com simpatia, nunca cobrando.",
      "Usa sempre o nome e faz menção ao hambúrguer preferido dele."
    ],
    actionMessage: "*🔥 Amigo(a), o que se passa? O grelhador está triste!* \n\nPassamos para saber se está tudo bem desse lado e para te dizer que o teu clássico favorito está a pedir para voltar ao prato. \n\nNo teu pedido de hoje, o refrigerante é por nossa conta como boas-vindas do regresso! \n\n*Vem matar a fome agora:* [Link]"
  },
  {
    id: "cash_flow_negative",
    name: "🚨 Urgente: Fluxo de Caixa Projetado Negativo",
    condition: "Projeção 30 dias indica saldo abaixo de zero",
    situation: "O kumbu vai acabar antes do mês terminar devido ao descompasso entre contas a pagar e vendas abaixo da meta.",
    impactCalc: "Podes ficar sem capital de giro para comprar queijo, pão e pagar o motoqueiro da entrega.",
    advice: [
      "Oferece desconto agressivo para quem pagar por transferência no ato da reserva.",
      "Faz um bazar de vouchers de consumo antecipado: o cliente paga logo 10.000 Kz e consome 12.500 Kz no mês seguinte."
    ],
    actionMessage: "*💳 VOUCHER PRE-PAGO BURGUERSPRIME: PAGA MENOS E COME MAIS!* \n\nQueres apoiar a tua hamburgueria preferida e ainda encher a barriga pagando quase nada? \n\nCompra hoje o nosso Voucher Fidelidade por *8.000 Kz* e tem *10.000 Kz em saldo* de consumo livre para todo o mês!\n\n*Apenas 20 unidades exclusivas:* [Link]"
  }
];
