export interface SetupConfig {
  hasCompletedOnboarding: boolean;
  businessName: string;
  operationType: "balcao" | "delivery" | "ambos";
  ticketMedio: number; // in Kz
  targetNewClients: number; // monthly target
  fixedCosts: number; // monthly fixed costs in Kz
  mainChannel: string; // "WhatsApp" | "Instagram" | "Indicação" | "Outro"
  hasSalesTeam: boolean;
  monthlyRevenueTarget: number; // target in Kz
}

export type PipelineStage = 
  | "PRIMEIRO_CONTACTO"
  | "PRIMEIRO_PEDIDO"
  | "CLIENTE_RECORRENTE"
  | "CLIENTE_FIEL"
  | "EMBAIXADOR";

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  channel: string;
  favoriteBurger: string;
  dietaryRestrictions: string;
  visitFrequency: number; // monthly frequency
  totalSpent: number; // in Kz
  lastVisitDaysAgo: number; // days since last visit
  ratingsCount: number;
  averageRating: number; // 1 to 5 stars
  orderHistoryCount: number;
  birthdayDate?: string; // MM-DD format or YYYY-MM-DD
  isChurnRisk?: boolean;
}

export interface CommunicationScript {
  id: string;
  title: string;
  category: "vendas" | "fidelidade" | "reativacao" | "pos-venda";
  text: string;
  description: string;
}

export interface FinancialMetrics {
  marketingInvestment: number;
  marketingRevenue: number;
  fixedCosts: number;
  variableCostRatio: number; // e.g., 0.40 for 60% margin
  currentSalesCount: number;
  totalSalesRevenue: number;
  newClientsCount: number;
  currentDayOfMonth: number;
  supplierPriceIncreasePercent: number; // default 0
}

export interface AIActionSuggestion {
  id: string;
  title: string;
  description: string;
  priority: "alta" | "media";
  actionLabel: string;
  whatsappTemplate?: string;
}

export interface WeeklySummary {
  vendasSemanaAnterior: number;
  novosClientes: number;
  cacActual: number;
  ltvActual: number;
  pontosMelhorar: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  businessName?: string;
  empresaId?: string; // Links user to their specific company tenant
  papel?: "dono" | "gestor" | "funcionario"; // User privilege role
}

export interface Empresa {
  id: string; // uuid string
  nome_negocio: string;
  slug: string;
  email_admin: string;
  plano: "free" | "growth" | "prime";
  fase_sistema: "beta" | "pago";
  data_criacao: string; // ISO date string
  status: "activo" | "suspenso" | "cancelado";
  ticket_medio: number;
  custos_fixos_mensais: number;
  meta_faturacao: number;
  canal_principal: string;
  tipo_operacao: "balcao" | "delivery" | "ambos";
}

export interface UtilizadorEmpresa {
  id: string;
  empresa_id: string;
  user_id: string;
  papel: "dono" | "gestor" | "funcionario";
}

/**
 * verificarLimitePlano - Determina se uma hamburgueria tem direito a executar determinada acção no SaaS.
 * 
 * Se a empresa estiver na fase Beta (fase_sistema === 'beta'), as restrições são ignoradas: o acesso é sempre permitido.
 * Fora da fase Beta (fase_sistema === 'pago'), os limites individuais do seu plano devem ser cumpridos.
 */
export function verificarLimitePlano(
  empresa?: Empresa | null, 
  funcionalidade?: "usuarios" | "utilizadores" | "clientes" | "clientes_crm" | "financeiro_completo" | "whatsapp_massa" | "relatorio_semanal" | "comparativo_lojas" | "multiplas_lojas", 
  acaoAdicional?: { totalUsuarios?: number; totalClientes?: number }
): { permitido: boolean; mensagem?: string } {
  // Se não existir empresa, trata como acesso seguro por defeito
  if (!empresa) {
    return { permitido: true };
  }

  // Se a empresa estiver na fase Beta, as restrições de limites de plano são ignoradas totalmente.
  if (empresa.fase_sistema === "beta") {
    return { permitido: true };
  }

  const plano = empresa.plano || "free";

  if (plano === "free") {
    if ((funcionalidade === "usuarios" || funcionalidade === "utilizadores") && acaoAdicional && acaoAdicional.totalUsuarios !== undefined && acaoAdicional.totalUsuarios >= 1) {
      return { 
        permitido: false, 
        mensagem: "Limite Excedido! O Plano Gratuito (FREE) suporta apenas 1 utilizador ativo. Por favor, solicite a mudar o plano para GROWTH." 
      };
    }
    if ((funcionalidade === "clientes" || funcionalidade === "clientes_crm") && acaoAdicional && acaoAdicional.totalClientes !== undefined && acaoAdicional.totalClientes >= 100) {
      return { 
        permitido: false, 
        mensagem: "Chapa Cheia! O Plano Gratuito (FREE) suporta um limite máximo de 100 clientes registados. Faça o upgrade para o Plano GROWTH." 
      };
    }
    if (funcionalidade === "financeiro_completo") {
      return { 
        permitido: false, 
        mensagem: "Módulo Restrito! O Plano Gratuito (FREE) inclui análises básicas. Faça o upgrade para o Plano GROWTH para desbloquear métricas LTV e Projeções." 
      };
    }
    if (funcionalidade === "whatsapp_massa") {
      return { 
        permitido: false, 
        mensagem: "Canal Entupido! O envio de automações de WhatsApp em massa requer o Plano GROWTH ativo com as licenças do gateway." 
      };
    }
    if (funcionalidade === "relatorio_semanal") {
      return { 
        permitido: false, 
        mensagem: "Destaque do Sistema! O relatório semanal automático por WhatsApp está disponível apenas no Plano GROWTH ou superior." 
      };
    }
    if (funcionalidade === "comparativo_lojas" || funcionalidade === "multiplas_lojas") {
      return { 
        permitido: false, 
        mensagem: "Módulo Multi-Loja! O suporte de múltiplas franquias e comparativos consolidadas está reservado para clientes PRIME." 
      };
    }
  }

  if (plano === "growth") {
    if ((funcionalidade === "usuarios" || funcionalidade === "utilizadores") && acaoAdicional && acaoAdicional.totalUsuarios !== undefined && acaoAdicional.totalUsuarios >= 5) {
      return { 
        permitido: false, 
        mensagem: "Limite da Equipa! O Plano GROWTH suporta até 5 utilizadores ativos. Para aceder a utilizadores ilimitados, mude para PRIME." 
      };
    }
    if (funcionalidade === "comparativo_lojas" || funcionalidade === "multiplas_lojas") {
      return { 
        permitido: false, 
        mensagem: "Franquia Reservada! A gestão e dashboard comparativo de múltiplas lojas faz parte da rede do Plano PRIME." 
      };
    }
  }

  // Plano PRIME tem acesso total livre de restrições de escala
  return { permitido: true };
}

// ================= TYPES FOR DIGTIAL MENU CARDÁPIO =================
export interface ProdutoMenu {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: "hamburgueres" | "acompanhamentos" | "bebidas" | "extras";
  foto_url?: string;
  disponivel: boolean;
  ordem_exibicao: number;
  empresa_id: string;
}

export interface PedidoCardapio {
  id: string;
  empresa_id: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  itens: {
    produto_nome: string;
    preco: number;
    quantidade: number;
    tirar_ingredientes: string[];
    adicionar_extras: string[];
    preco_total_item: number;
    observacao?: string;
  }[];
  metodo_entrega: "local" | "balcao" | "casa";
  endereco_entrega?: string;
  metodo_pagamento: "dinheiro" | "transferencia" | "multicaixa";
  valor_total: number;
  data_criacao: string;
}

