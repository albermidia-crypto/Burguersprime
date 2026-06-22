import { createClient } from "@supabase/supabase-js";
import { Empresa, ClientProfile, FinancialMetrics, SetupConfig, AuthUser, ProdutoMenu, PedidoCardapio } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("https://"));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Utility function to convert snake_case DB objects back to camelCase client objects
 */
function mapDbClientToClientProfile(dbClient: any): ClientProfile {
  return {
    id: dbClient.id,
    name: dbClient.name,
    phone: dbClient.phone,
    channel: dbClient.channel,
    favoriteBurger: dbClient.favorite_burger || "",
    dietaryRestrictions: dbClient.dietary_restrictions || "Nenhuma",
    visitFrequency: Number(dbClient.visit_frequency),
    totalSpent: Number(dbClient.total_spent),
    lastVisitDaysAgo: Number(dbClient.last_visit_days_ago),
    ratingsCount: Number(dbClient.ratings_count),
    averageRating: Number(dbClient.average_rating),
    orderHistoryCount: Number(dbClient.order_history_count),
    birthdayDate: dbClient.birthday_date || undefined,
    isChurnRisk: dbClient.is_churn_risk,
  };
}

/**
 * Sync Pull: Downloads whole Tenant/Company data from Supabase DB to LocalStorage
 */
export async function pullDataFromSupabase(empresaId: string): Promise<{
  success: boolean;
  config?: Partial<SetupConfig>;
  clients?: ClientProfile[];
  metrics?: FinancialMetrics;
  burgerComponents?: any[];
  produtosMenu?: ProdutoMenu[];
  error?: string;
}> {
  if (!supabase) {
    return { success: false, error: "Supabase não está configurado." };
  }

  try {
    // 1. Fetch Company/Empresa details
    const { data: dbEmpresa, error: errEmpresa } = await supabase
      .from("empresas")
      .select("*")
      .eq("id", empresaId)
      .single();

    if (errEmpresa && errEmpresa.code !== "PGRST116") {
      throw errEmpresa;
    }

    let config: Partial<SetupConfig> = {};
    if (dbEmpresa) {
      config = {
        hasCompletedOnboarding: true,
        businessName: dbEmpresa.nome_negocio,
        operationType: dbEmpresa.tipo_operacao,
        ticketMedio: dbEmpresa.ticket_medio,
        fixedCosts: dbEmpresa.custos_fixos_mensais,
        monthlyRevenueTarget: dbEmpresa.meta_faturacao,
        mainChannel: dbEmpresa.canal_principal,
      };
    }

    // 2. Fetch CRM clients
    const { data: dbClients, error: errClients } = await supabase
      .from("clientes")
      .select("*")
      .eq("empresa_id", empresaId);

    if (errClients) throw errClients;
    const clients = dbClients ? dbClients.map(mapDbClientToClientProfile) : [];

    // 3. Fetch Financial metrics
    const { data: dbMetrics, error: errMetrics } = await supabase
      .from("financeiro_metricas")
      .select("*")
      .eq("empresa_id", empresaId)
      .single();

    if (errMetrics && errMetrics.code !== "PGRST116") {
      throw errMetrics;
    }

    let metricsObj: FinancialMetrics | undefined;
    if (dbMetrics) {
      metricsObj = {
        marketingInvestment: dbMetrics.marketing_investment,
        marketingRevenue: dbMetrics.marketing_revenue,
        fixedCosts: dbMetrics.fixed_costs,
        variableCostRatio: Number(dbMetrics.variable_cost_ratio),
        currentSalesCount: dbMetrics.current_sales_count,
        totalSalesRevenue: Number(dbMetrics.total_sales_revenue),
        newClientsCount: dbMetrics.new_clients_count,
        currentDayOfMonth: dbMetrics.current_day_of_month,
        supplierPriceIncreasePercent: dbMetrics.supplier_price_increase_percent,
      };
    }

    // 4. Fetch Burger custom components
    const { data: dbComponents, error: errComponents } = await supabase
      .from("burger_components")
      .select("*")
      .eq("empresa_id", empresaId);

    if (errComponents) throw errComponents;
    const burgerComponents = dbComponents ? dbComponents.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      cost: Number(c.cost),
      price: Number(c.price),
      stock: Number(c.stock),
      unit: c.unit,
    })) : [];

    // 5. Fetch digital menu products
    let produtosMenu: ProdutoMenu[] = [];
    const { data: dbMenu, error: errMenu } = await supabase
      .from("produtos_menu")
      .select("*")
      .eq("empresa_id", empresaId);

    if (!errMenu && dbMenu) {
      produtosMenu = dbMenu.map(m => ({
        id: m.id,
        nome: m.nome,
        descricao: m.descricao || "",
        preco: Number(m.preco),
        categoria: m.categoria,
        foto_url: m.foto_url || undefined,
        disponivel: m.disponivel,
        ordem_exibicao: Number(m.ordem_exibicao),
        empresa_id: m.empresa_id,
      }));
    }

    return {
      success: true,
      config,
      clients,
      metrics: metricsObj,
      burgerComponents,
      produtosMenu,
    };
  } catch (error: any) {
    console.error("Erro ao importar do Supabase:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync Push: Uploads whole Tenant/Company local stats up to the Supabase Cloud
 */
export async function pushDataToSupabase(
  empresaId: string,
  empresaData: {
    nome_negocio: string;
    email_admin: string;
    plano: string;
    fase_sistema: string;
    status: string;
  },
  config: SetupConfig,
  clients: ClientProfile[],
  metrics: FinancialMetrics,
  burgerComponents: any[],
  produtosMenu?: ProdutoMenu[]
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase não está configurado." };
  }

  try {
    // 1. Upsert Empresa settings
    const { error: errEmpresa } = await supabase.from("empresas").upsert({
      id: empresaId,
      nome_negocio: empresaData.nome_negocio || config.businessName,
      slug: (empresaData.nome_negocio || config.businessName).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      email_admin: empresaData.email_admin || "albermidia@gmail.com",
      plano: empresaData.plano || "free",
      fase_sistema: empresaData.fase_sistema || "beta",
      status: empresaData.status || "activo",
      ticket_medio: config.ticketMedio || 0,
      custos_fixos_mensais: config.fixedCosts || 0,
      meta_faturacao: config.monthlyRevenueTarget || 0,
      canal_principal: config.mainChannel || "WhatsApp",
      tipo_operacao: config.operationType || "ambos",
    });

    if (errEmpresa) throw errEmpresa;

    // 2. Upsert Metrics record
    const { error: errMetrics } = await supabase.from("financeiro_metricas").upsert({
      empresa_id: empresaId,
      marketing_investment: metrics.marketingInvestment,
      marketing_revenue: metrics.marketingRevenue,
      fixed_costs: metrics.fixedCosts,
      variable_cost_ratio: metrics.variableCostRatio,
      current_sales_count: metrics.currentSalesCount,
      total_sales_revenue: metrics.totalSalesRevenue,
      new_clients_count: metrics.newClientsCount,
      current_day_of_month: metrics.currentDayOfMonth,
      supplier_price_increase_percent: metrics.supplierPriceIncreasePercent,
      ultima_atualizacao: new Date().toISOString(),
    });

    if (errMetrics) throw errMetrics;

    // 3. Sync CRM Clients
    if (clients.length > 0) {
      const dbClientsPayload = clients.map(c => ({
        id: c.id,
        empresa_id: empresaId,
        name: c.name,
        phone: c.phone,
        channel: c.channel,
        favorite_burger: c.favoriteBurger,
        dietary_restrictions: c.dietaryRestrictions || "Nenhuma",
        visit_frequency: c.visitFrequency,
        total_spent: c.totalSpent,
        last_visit_days_ago: c.lastVisitDaysAgo,
        ratings_count: c.ratingsCount,
        average_rating: c.averageRating,
        order_history_count: c.orderHistoryCount,
        birthday_date: c.birthdayDate || null,
        is_churn_risk: c.isChurnRisk || false,
      }));

      const { error: errClients } = await supabase
        .from("clientes")
        .upsert(dbClientsPayload);

      if (errClients) throw errClients;
    }

    // 4. Sync Burger components
    if (burgerComponents.length > 0) {
      const dbComponentsPayload = burgerComponents.map(comp => ({
        id: String(comp.id || ""),
        empresa_id: empresaId,
        name: String(comp.name || "Ingrediente"),
        category: String(comp.category || "extra"),
        cost: Number(comp.cost || 0),
        price: Number(comp.price || 0),
        stock: Number(comp.stock ?? 100),
        unit: String(comp.unit || "un"),
      }));

      const { error: errComponents } = await supabase
        .from("burger_components")
        .upsert(dbComponentsPayload);

      if (errComponents) throw errComponents;
    }

    // 5. Sync Digital Menu products
    if (produtosMenu && produtosMenu.length > 0) {
      const dbMenuPayload = produtosMenu.map(m => ({
        id: String(m.id || ""),
        empresa_id: empresaId,
        nome: String(m.nome || ""),
        descricao: m.descricao ? String(m.descricao) : null,
        preco: Number(m.preco || 0),
        categoria: String(m.categoria || "hamburgueres"),
        foto_url: m.foto_url ? String(m.foto_url) : null,
        disponivel: Boolean(m.disponivel ?? true),
        ordem_exibicao: Number(m.ordem_exibicao || 0),
      }));

      const { error: errMenu } = await supabase
        .from("produtos_menu")
        .upsert(dbMenuPayload);

      if (errMenu) throw errMenu;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao exportar para o Supabase:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle Supabase cloud auth login (syncing user auth)
 */
export async function syncUserToSupabase(user: AuthUser, empresaId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("utilizadores").upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "🍔",
      empresa_id: empresaId,
      papel: user.papel || "funcionario",
    });
    return !error;
  } catch (err) {
    console.error("Erro ao sincronizar login de utilizador no Supabase:", err);
    return false;
  }
}

/**
 * Save new customer Order Cardapio (automatic entry)
 */
export async function savePedidoCardapio(pedido: PedidoCardapio): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("pedidos_cardapio").insert({
      id: pedido.id,
      empresa_id: pedido.empresa_id,
      cliente_id: pedido.cliente_id || null,
      cliente_nome: pedido.cliente_nome,
      cliente_whatsapp: pedido.cliente_whatsapp,
      itens: pedido.itens,
      metodo_entrega: pedido.metodo_entrega,
      endereco_entrega: pedido.endereco_entrega || null,
      metodo_pagamento: pedido.metodo_pagamento,
      valor_total: pedido.valor_total,
      data_criacao: pedido.data_criacao,
    });
    return !error;
  } catch (err) {
    console.error("Erro ao registar pedido do cardápio no Supabase:", err);
    return false;
  }
}

/**
 * Fetch company by its slug (for public view resolution)
 */
export async function fetchEmpresaBySlug(slug: string): Promise<Empresa | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .eq("slug", slug.toLowerCase().trim())
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      nome_negocio: data.nome_negocio,
      slug: data.slug,
      email_admin: data.email_admin || "",
      plano: data.plano || "free",
      fase_sistema: data.fase_sistema || "beta",
      status: data.status || "activo",
      data_criacao: data.data_criacao || new Date().toISOString(),
      ticket_medio: Number(data.ticket_medio || 3500),
      custos_fixos_mensais: Number(data.custos_fixos_mensais || 150000),
      meta_faturacao: Number(data.meta_faturacao || 800000),
      canal_principal: data.canal_principal || "WhatsApp",
      tipo_operacao: data.tipo_operacao || "ambos",
    };
  } catch (err) {
    console.error("Erro ao procurar empresa pelo slug no Supabase:", err);
    return null;
  }
}

/**
 * Fetch products list for public menu by its company ID
 */
export async function fetchProdutosByEmpresa(empresaId: string): Promise<ProdutoMenu[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("produtos_menu")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("disponivel", true)
      .order("ordem_exibicao", { ascending: true });

    if (error || !data) return [];

    return data.map(m => ({
      id: m.id,
      nome: m.nome,
      descricao: m.descricao || "",
      preco: Number(m.preco),
      categoria: m.categoria,
      foto_url: m.foto_url || undefined,
      disponivel: m.disponivel,
      ordem_exibicao: Number(m.ordem_exibicao),
      empresa_id: m.empresa_id,
    }));
  } catch (err) {
    console.error("Erro ao ler produtos pelo ID da empresa no Supabase:", err);
    return [];
  }
}
