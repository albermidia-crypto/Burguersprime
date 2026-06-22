import React, { useState, useEffect } from "react";
import { SetupConfig, ClientProfile, FinancialMetrics, PipelineStage, AuthUser, Empresa } from "./types";
import { getInitialClients } from "./data";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import CRM from "./components/CRM";
import Finance from "./components/Finance";
import Profile from "./components/Profile";
import Auth from "./components/Auth";
import WelcomeExplainer from "./components/WelcomeExplainer";
import SuperAdmin from "./components/SuperAdmin";
import Cardapio, { PublicMenuScreen } from "./components/Cardapio";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { 
  LayoutDashboard, Users, Wallet, RotateCcw, Clock, 
  HelpCircle, Sparkles, AlertTriangle, CheckCircle,
  Menu, X, Sliders, Settings, TrendingUp, Coins, Store,
  Sun, Moon, Plus, Trash2, Percent, Utensils, Crown, ShieldAlert
} from "lucide-react";

/**
 * Winners CRM + Finance - Ultimate Hamburgueria Business Suite
 */
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dark Mode state with localStorage and system preference check
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("burguersprime_dark_mode");
    if (saved) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Current logged in user (null if not authenticated)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("burguersprime_current_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { /* ignore */ }
    }
    return null;
  });

  // Real Admin account backup during impersonation session inheritance (Mode Suporte)
  const [realAdminUser, setRealAdminUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("burguersprime_real_admin_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Active company tenant details
  const [currentCompany, setCurrentCompany] = useState<Empresa | null>(null);

  const [showWelcomeExplainer, setShowWelcomeExplainer] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      const alreadySeen = localStorage.getItem(`burguersprime_seen_explainer_${currentUser.id}`);
      if (!alreadySeen) {
        setShowWelcomeExplainer(true);
      }
    } else {
      setShowWelcomeExplainer(false);
    }
  }, [currentUser]);

  const handleDismissExplainer = () => {
    if (currentUser) {
      localStorage.setItem(`burguersprime_seen_explainer_${currentUser.id}`, "true");
    }
    setShowWelcomeExplainer(false);
  };

  // Logout handler
  const handleLogOut = () => {
    localStorage.removeItem("burguersprime_current_user");
    localStorage.removeItem("burguersprime_real_admin_user");
    setCurrentUser(null);
    setRealAdminUser(null);
    setIsSidebarOpen(false);
  };

  // Login Success handler
  const handleLoginSuccess = (user: AuthUser) => {
    localStorage.setItem("burguersprime_current_user", JSON.stringify(user));
    setCurrentUser(user);
    if (user.businessName && !config.businessName) {
      setConfig(prev => ({
        ...prev,
        businessName: user.businessName || prev.businessName
      }));
    }
  };


  
  // 1. Initial State Loaders (with Multi-Tenant Scoped Separation)
  const [config, setConfig] = useState<SetupConfig>(() => {
    const savedUser = localStorage.getItem("burguersprime_current_user");
    let empresaId = "default";
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.empresaId) empresaId = u.empresaId;
      } catch (e) {}
    }

    let saved = localStorage.getItem(`burguersprime_config_${empresaId}`);
    if (!saved) {
      saved = localStorage.getItem("burguersprime_config");
    }
    if (!saved) {
      saved = localStorage.getItem("winners_config");
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (parsed.businessName === "Winners Hamburgueria" || parsed.businessName === "burguersPrime" || parsed.businessName === "Winners Burger") {
            parsed.businessName = "BURGUERSPRIME";
          }
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return {
      hasCompletedOnboarding: false,
      businessName: "",
      operationType: "ambos",
      ticketMedio: 2500,
      targetNewClients: 40,
      fixedCosts: 200000,
      mainChannel: "WhatsApp",
      hasSalesTeam: false,
      monthlyRevenueTarget: 1000000,
    };
  });

  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const savedUser = localStorage.getItem("burguersprime_current_user");
    let empresaId = "default";
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.empresaId) empresaId = u.empresaId;
      } catch (e) {}
    }

    let saved = localStorage.getItem(`burguersprime_clients_${empresaId}`);
    if (!saved) {
      saved = localStorage.getItem("burguersprime_clients");
    }
    if (!saved) {
      saved = localStorage.getItem("winners_clients");
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [metrics, setMetrics] = useState<FinancialMetrics>(() => {
    const savedUser = localStorage.getItem("burguersprime_current_user");
    let empresaId = "default";
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.empresaId) empresaId = u.empresaId;
      } catch (e) {}
    }

    let saved = localStorage.getItem(`burguersprime_metrics_${empresaId}`);
    if (!saved) {
      saved = localStorage.getItem("burguersprime_metrics");
    }
    if (!saved) {
      saved = localStorage.getItem("winners_metrics");
    }
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      marketingInvestment: 80000,
      marketingRevenue: 280000,
      fixedCosts: 200000,
      variableCostRatio: 0.40, // 60% margin = 40% ingredient cost
      currentSalesCount: 125,
      totalSalesRevenue: 125 * 2500,
      newClientsCount: 26,
      currentDayOfMonth: 18, // June 18
      supplierPriceIncreasePercent: 0
    };
  });

  // Burger components list state for calculating the real burger price / cost
  const [burgerComponents, setBurgerComponents] = useState<{ id: string; name: string; cost: number }[]>(() => {
    const saved = localStorage.getItem("burguersprime_burger_components");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { /* ignore */ }
    }
    return [
      { id: "1", name: "Pão de Brioche Grelhado", cost: 350 },
      { id: "2", name: "Hambúrguer de Carne (150g)", cost: 900 },
      { id: "3", name: "Queijo Cheddar Fatiado", cost: 250 },
      { id: "4", name: "Bacon Crocante / Salada", cost: 300 },
      { id: "5", name: "Molho Especial Prime", cost: 150 },
      { id: "6", name: "Embalagem Premium & Saco", cost: 250 },
    ];
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "crm" | "finance" | "profile" | "cardapio" | "superadmin">("dashboard");

  // CRM Initial state settings for Quick Responding (CRM jump)
  const [crmInitialSearch, setCrmInitialSearch] = useState<string>("");
  const [crmInitialSelectedClient, setCrmInitialSelectedClient] = useState<string>("");
  const [crmInitialSubTab, setCrmInitialSubTab] = useState<"pipeline" | "scripts">("pipeline");
  const [reactivationSuccessBanner, setReactivationSuccessBanner] = useState<string>("");

  // Public Menu Routing state
  const [publicCardapioSlug, setPublicCardapioSlug] = useState<string | null>(() => {
    // 1. Check query parameters
    const params = new URLSearchParams(window.location.search);
    const cardapioParam = params.get("cardapio");
    if (cardapioParam) return cardapioParam;

    // 2. Check hash
    const hash = window.location.hash;
    if (hash && hash.startsWith("#cardapio=")) {
      return hash.replace("#cardapio=", "");
    }
    if (hash && hash.startsWith("#/cardapio/")) {
      return hash.replace("#/cardapio/", "");
    }

    // 3. Check path router fallback for burguersprime.app/cardapio/[slug]
    const path = window.location.pathname;
    if (path && (path.startsWith("/cardapio/") || path === "/cardapio")) {
      const segments = path.split("/");
      const slugVal = segments[2] || segments[1];
      if (slugVal && slugVal !== "cardapio") {
        return slugVal;
      }
    }
    return null;
  });

  const [publicCompany, setPublicCompany] = useState<any | null>(null);
  const [publicProducts, setPublicProducts] = useState<any[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);

  useEffect(() => {
    if (!publicCardapioSlug) return;
    
    const resolvePublicMenu = async () => {
      setLoadingPublic(true);
      
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: dbEmp, error: errEmp } = await supabase
            .from("empresas")
            .select("*")
            .eq("slug", publicCardapioSlug.toLowerCase().trim())
            .single();

          if (!errEmp && dbEmp) {
            setPublicCompany(dbEmp);
            
            const { data: dbMenu, error: errMenu } = await supabase
              .from("produtos_menu")
              .select("*")
              .eq("empresa_id", dbEmp.id)
              .eq("disponivel", true)
              .order("ordem_exibicao", { ascending: true });

            if (!errMenu && dbMenu && dbMenu.length > 0) {
              const mapped = dbMenu.map(m => ({
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
              setPublicProducts(mapped);
            } else {
              setPublicProducts(getDefaultFallbacks(dbEmp.id));
            }
          } else {
            setPublicCompany({ id: "demo-public", nome_negocio: publicCardapioSlug.toUpperCase() });
            setPublicProducts(getDefaultFallbacks("demo-public"));
          }
        } catch (e) {
          console.error("Erro public cardapio:", e);
        } finally {
          setLoadingPublic(false);
        }
      } else {
        setPublicCompany({ id: "demo-public", nome_negocio: publicCardapioSlug.toUpperCase() });
        setPublicProducts(getDefaultFallbacks("demo-public"));
        setLoadingPublic(false);
      }
    };

    resolvePublicMenu();
  }, [publicCardapioSlug]);

  function getDefaultFallbacks(empId: string) {
    return [
      {
        id: "p-1",
        empresa_id: empId,
        nome: "Smash Duplo Prime",
        descricao: "Duas carnes suculentas de 120g na grelha, queijo cheddar derretido, molho artesanal prime e pão brioche amanteigado.",
        preco: 4500,
        categoria: "hamburgueres",
        disponivel: true,
        ordem_exibicao: 1,
      },
      {
        id: "p-2",
        empresa_id: empId,
        nome: "Cheeseburger Classic",
        descricao: "Hambúrguer grelhado de 150g, queijo cheddar fatiado, picles caseiros e molho especial em pão macio.",
        preco: 3500,
        categoria: "hamburgueres",
        disponivel: true,
        ordem_exibicao: 2,
      },
      {
        id: "p-3",
        empresa_id: empId,
        nome: "Batata Frita Rústica",
        descricao: "Batatas fritas super estaladiças salpicadas com alecrim fresco e flor de sal da nossa costa.",
        preco: 1500,
        categoria: "acompanhamentos",
        disponivel: true,
        ordem_exibicao: 3,
      }
    ];
  }

  // micro-tutorial state
  const [showTutorial, setShowTutorial] = useState(() => {
    const completed = localStorage.getItem("burguersprime_tutorial_completed") || localStorage.getItem("winners_tutorial_completed");
    return completed !== "true";
  });
  const [tutorialStep, setTutorialStep] = useState(1);

  const handleTriggerReactivation = (clientName: string, clientId: string) => {
    setCrmInitialSearch(clientName);
    setCrmInitialSelectedClient(clientId);
    setCrmInitialSubTab("scripts");
    setActiveTab("crm");
    setReactivationSuccessBanner(`✅ Script de reactivação pronto para ${clientName}`);
    
    // Automatically clear banner after 10 seconds
    setTimeout(() => {
      setReactivationSuccessBanner("");
    }, 10000);
  };

  // 2. LocalStorage Sync triggers (Tenant-scoped isolation)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("burguersprime_dark_mode", String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const empresaId = currentUser?.empresaId || "default";
    localStorage.setItem(`burguersprime_config_${empresaId}`, JSON.stringify(config));
    localStorage.setItem("burguersprime_config", JSON.stringify(config)); // Fallback support
  }, [config, currentUser?.empresaId]);

  useEffect(() => {
    const empresaId = currentUser?.empresaId || "default";
    if (clients && clients.length > 0) {
      localStorage.setItem(`burguersprime_clients_${empresaId}`, JSON.stringify(clients));
      localStorage.setItem("burguersprime_clients", JSON.stringify(clients)); // Fallback support
    }
  }, [clients, currentUser?.empresaId]);

  useEffect(() => {
    const empresaId = currentUser?.empresaId || "default";
    localStorage.setItem(`burguersprime_metrics_${empresaId}`, JSON.stringify(metrics));
    localStorage.setItem("burguersprime_metrics", JSON.stringify(metrics)); // Fallback support
  }, [metrics, currentUser?.empresaId]);

  useEffect(() => {
    const empresaId = currentUser?.empresaId || "default";
    localStorage.setItem(`burguersprime_burger_components_${empresaId}`, JSON.stringify(burgerComponents));
    localStorage.setItem("burguersprime_burger_components", JSON.stringify(burgerComponents)); // Fallback support
  }, [burgerComponents, currentUser?.empresaId]);

  // Swapper for tenant-scoped local states when active company switches
  useEffect(() => {
    if (!currentUser) {
      setCurrentCompany(null);
      return;
    }
    const empresaId = currentUser.empresaId || "default";
    const companiesStr = localStorage.getItem("burguersprime_companies");
    let match: Empresa | null = null;
    if (companiesStr) {
      try {
        const cos = JSON.parse(companiesStr);
        match = cos.find((c: any) => c.id === empresaId);
      } catch (e) {}
    }

    if (!match) {
      match = {
        id: empresaId,
        nome_negocio: currentUser.businessName || "BURGUERSPRIME",
        slug: empresaId,
        email_admin: currentUser.email,
        plano: "free",
        fase_sistema: "beta",
        data_criacao: new Date().toISOString(),
        status: "activo",
        ticket_medio: 2500,
        custos_fixos_mensais: 200000,
        meta_faturacao: 1000000,
        canal_principal: "WhatsApp",
        tipo_operacao: "ambos"
      };
    }
    setCurrentCompany(match);

    // Swap configurations
    let savedConfig = localStorage.getItem(`burguersprime_config_${empresaId}`);
    if (!savedConfig && (empresaId === "grelha-real-luanda" || empresaId === "vapor-brasa-benguela" || empresaId === "admin-system")) {
      const initial = {
        hasCompletedOnboarding: true,
        businessName: currentUser.businessName || "BURGUERSPRIME",
        operationType: "ambos" as const,
        ticketMedio: 2500,
        targetNewClients: 40,
        fixedCosts: 200000,
        mainChannel: "WhatsApp",
        hasSalesTeam: false,
        monthlyRevenueTarget: 1000000,
      };
      localStorage.setItem(`burguersprime_config_${empresaId}`, JSON.stringify(initial));
      savedConfig = JSON.stringify(initial);
    }

    let parsedConfig;
    if (savedConfig) {
      try { parsedConfig = JSON.parse(savedConfig); } catch (e) {}
    }
    if (!parsedConfig) {
      parsedConfig = {
        hasCompletedOnboarding: false,
        businessName: currentUser.businessName || "",
        operationType: "ambos" as const,
        ticketMedio: 2500,
        targetNewClients: 40,
        fixedCosts: 200000,
        mainChannel: "WhatsApp",
        hasSalesTeam: false,
        monthlyRevenueTarget: 1000000,
      };
    }
    setConfig(parsedConfig);

    // Swap clients to brand-new or pre-seeded lists
    let savedClients = localStorage.getItem(`burguersprime_clients_${empresaId}`);
    if (!savedClients && parsedConfig.hasCompletedOnboarding) {
      const initialClientsData = getInitialClients(parsedConfig);
      localStorage.setItem(`burguersprime_clients_${empresaId}`, JSON.stringify(initialClientsData));
      savedClients = JSON.stringify(initialClientsData);
    }
    let parsedClients = [];
    if (savedClients) {
      try { parsedClients = JSON.parse(savedClients); } catch (e) {}
    }
    setClients(parsedClients);

    // Swap metrics
    let savedMetrics = localStorage.getItem(`burguersprime_metrics_${empresaId}`);
    if (!savedMetrics) {
      const calculatedTargetSales = Math.ceil(parsedConfig.monthlyRevenueTarget / parsedConfig.ticketMedio);
      const initialMetrics = {
        marketingInvestment: 80000,
        marketingRevenue: 280000,
        fixedCosts: parsedConfig.fixedCosts,
        variableCostRatio: 0.40,
        currentSalesCount: Math.round(calculatedTargetSales * 0.58),
        totalSalesRevenue: Math.round(calculatedTargetSales * 0.58) * parsedConfig.ticketMedio,
        newClientsCount: Math.round(parsedConfig.targetNewClients * 0.60),
        currentDayOfMonth: 18,
        supplierPriceIncreasePercent: 0
      };
      localStorage.setItem(`burguersprime_metrics_${empresaId}`, JSON.stringify(initialMetrics));
      savedMetrics = JSON.stringify(initialMetrics);
    }
    let parsedMetrics;
    if (savedMetrics) {
      try { parsedMetrics = JSON.parse(savedMetrics); } catch (e) {}
    }
    if (parsedMetrics) {
      setMetrics(parsedMetrics);
    }

    // Swap recipe parameters
    let savedComponents = localStorage.getItem(`burguersprime_burger_components_${empresaId}`);
    let parsedComponents;
    if (savedComponents) {
      try { parsedComponents = JSON.parse(savedComponents); } catch (e) {}
    }
    if (!parsedComponents) {
      parsedComponents = [
        { id: "1", name: "Pão de Brioche Grelhado", cost: 350 },
        { id: "2", name: "Hambúrguer de Carne (150g)", cost: 900 },
        { id: "3", name: "Queijo Cheddar Fatiado", cost: 250 },
        { id: "4", name: "Bacon Crocante / Salada", cost: 300 },
        { id: "5", name: "Molho Especial Prime", cost: 150 },
        { id: "6", name: "Embalagem Premium & Saco", cost: 250 },
      ];
    }
    setBurgerComponents(parsedComponents);
  }, [currentUser?.empresaId]);

  // Support Session Inheritance helpers
  const handleInheritSession = (companyId: string) => {
    // Save current admin credentials so they do not get lost
    if (!realAdminUser) {
      localStorage.setItem("burguersprime_real_admin_user", JSON.stringify(currentUser));
      setRealAdminUser(currentUser);
    }

    // Retrieve users of that company
    const savedUsers = localStorage.getItem("burguersprime_registered_users");
    let match = null;
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        match = parsed.find((u: any) => u.empresaId === companyId);
      } catch (e) {}
    }

    if (!match) {
      match = {
        id: "support-tempid-" + Date.now(),
        name: `Suporte Grelha (${companyId})`,
        email: "suporte@albermidia.ao",
        avatar: "👨‍🍳",
        businessName: `Visualizando ${companyId}`,
        empresaId: companyId,
        papel: "gestor"
      };
    }

    localStorage.setItem("burguersprime_current_user", JSON.stringify(match));
    setCurrentUser(match);
    setActiveTab("dashboard");
  };

  const handleExitSupportMode = () => {
    if (realAdminUser) {
      localStorage.setItem("burguersprime_current_user", JSON.stringify(realAdminUser));
      setCurrentUser(realAdminUser);
      localStorage.removeItem("burguersprime_real_admin_user");
      setRealAdminUser(null);
      setActiveTab("superadmin");
    }
  };

  // Synchronize dynamic variableCostRatio from physical ingredients cost CMV
  useEffect(() => {
    const totalCost = burgerComponents.reduce((acc, c) => acc + c.cost, 0);
    const calculatedRatio = config.ticketMedio > 0 ? (totalCost / config.ticketMedio) : 0.40;
    setMetrics(prev => {
      // Prevents infinite loop by checking if value actually changed
      if (Math.abs(prev.variableCostRatio - calculatedRatio) > 0.001) {
        return {
          ...prev,
          variableCostRatio: calculatedRatio
        };
      }
      return prev;
    });
  }, [burgerComponents, config.ticketMedio]);

  // Adjust defaults once onboarding is completed
  const handleOnboardingComplete = (newConfig: SetupConfig) => {
    const initialClientsList = getInitialClients(newConfig);
    setConfig(newConfig);
    setClients(initialClientsList);
    
    const calculatedTargetSales = Math.ceil(newConfig.monthlyRevenueTarget / newConfig.ticketMedio);
    // Seed high-fidelity relative initial metrics
    const initialMetrics: FinancialMetrics = {
      marketingInvestment: 60000,
      marketingRevenue: 220000,
      fixedCosts: newConfig.fixedCosts,
      variableCostRatio: 0.40,
      currentSalesCount: Math.round(calculatedTargetSales * 0.58), // mid-month sales progress
      totalSalesRevenue: Math.round(calculatedTargetSales * 0.58) * newConfig.ticketMedio,
      newClientsCount: Math.round(newConfig.targetNewClients * 0.60),
      currentDayOfMonth: 18, // Day 18 fits alerts beautifully
      supplierPriceIncreasePercent: 0
    };
    setMetrics(initialMetrics);
  };

  const handleResetSystem = () => {
    if (confirm("Tens a certeza que queres resetar o BURGUERSPRIME? Todos os dados de vendas e clientes serão reconfigurados para o onboarding inicial de Angola!")) {
      localStorage.removeItem("burguersprime_config");
      localStorage.removeItem("burguersprime_clients");
      localStorage.removeItem("burguersprime_metrics");
      localStorage.removeItem("burguersprime_tutorial_completed");
      localStorage.removeItem("burguersprime_burger_components");
      localStorage.removeItem("winners_config");
      localStorage.removeItem("winners_clients");
      localStorage.removeItem("winners_metrics");
      localStorage.removeItem("winners_tutorial_completed");
      
      setBurgerComponents([
        { id: "1", name: "Pão de Brioche Grelhado", cost: 350 },
        { id: "2", name: "Hambúrguer de Carne (150g)", cost: 900 },
        { id: "3", name: "Queijo Cheddar Fatiado", cost: 250 },
        { id: "4", name: "Bacon Crocante / Salada", cost: 300 },
        { id: "5", name: "Molho Especial Prime", cost: 150 },
        { id: "6", name: "Embalagem Premium & Saco", cost: 250 },
      ]);
      
      setConfig({
        hasCompletedOnboarding: false,
        businessName: "",
        operationType: "ambos",
        ticketMedio: 2500,
        targetNewClients: 40,
        fixedCosts: 200000,
        mainChannel: "WhatsApp",
        hasSalesTeam: false,
        monthlyRevenueTarget: 1000000,
      });
      setClients([]);
      setActiveTab("dashboard");
    }
  };

  // 3. Global handlers passed into modular layouts
  const handleAddClient = (newProfile: ClientProfile) => {
    setClients((prev) => [newProfile, ...prev]);
    // update current metrics for new client counters
    setMetrics(prev => ({
      ...prev,
      newClientsCount: prev.newClientsCount + 1,
      currentSalesCount: prev.currentSalesCount + 1,
      totalSalesRevenue: prev.totalSalesRevenue + config.ticketMedio
    }));
  };

  const handleUpdateClientStage = (clientId: string, newStage: PipelineStage) => {
    setClients((prev) => 
      prev.map(c => c.id === clientId ? { ...c, lastVisitDaysAgo: 0 } : c)
    );
  };

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter(c => c.id !== clientId));
  };

  const handleRegisterQrOrder = (order: { name: string; phone: string; burger: string; value: number }) => {
    const cleanPhone = order.phone.replace(/\D/g, "");
    const existingIndex = clients.findIndex(c => c.phone.replace(/\D/g, "") === cleanPhone);

    if (existingIndex !== -1) {
      setClients((prev) => {
        const updated = [...prev];
        const client = updated[existingIndex];
        const newHistoryCount = client.orderHistoryCount + 1;
        const newFrequency = client.visitFrequency + 1;
        updated[existingIndex] = {
          ...client,
          visitFrequency: newFrequency,
          orderHistoryCount: newHistoryCount,
          totalSpent: client.totalSpent + order.value,
          lastVisitDaysAgo: 0,
          favoriteBurger: order.burger || client.favoriteBurger
        };
        return updated;
      });

      setMetrics((prev) => ({
        ...prev,
        currentSalesCount: prev.currentSalesCount + 1,
        totalSalesRevenue: prev.totalSalesRevenue + order.value
      }));
    } else {
      const newClient: ClientProfile = {
        id: "cli-" + Date.now(),
        name: order.name,
        phone: order.phone,
        channel: (order as any).channel || "QR Code",
        favoriteBurger: order.burger,
        dietaryRestrictions: (order as any).dietaryRestrictions || "Nenhuma",
        visitFrequency: 1,
        totalSpent: order.value,
        lastVisitDaysAgo: 0,
        ratingsCount: 0,
        averageRating: 0,
        orderHistoryCount: 1,
        birthdayDate: "06-16",
      };

      setClients((prev) => [newClient, ...prev]);

      setMetrics((prev) => ({
        ...prev,
        newClientsCount: prev.newClientsCount + 1,
        currentSalesCount: prev.currentSalesCount + 1,
        totalSalesRevenue: prev.totalSalesRevenue + order.value
      }));
    }
  };

  const handleUpdateMetrics = (updatedFields: Partial<FinancialMetrics>) => {
    setMetrics((prev) => ({
      ...prev,
      ...updatedFields,
      // recalculate derived values
      totalSalesRevenue: (updatedFields.currentSalesCount ?? prev.currentSalesCount) * config.ticketMedio
    }));
  };

  // Helper calculation for active alerts badge count
  const calcActiveAlertsCount = () => {
    let count = 0;
    const breakEvenSales = Math.ceil(config.fixedCosts / (config.ticketMedio * 0.60));
    if (metrics.currentDayOfMonth >= 20 && metrics.currentSalesCount < breakEvenSales) count++;
    const highLtvChurnRisk = clients.filter(c => c.visitFrequency >= 3 && c.lastVisitDaysAgo >= 10);
    if (highLtvChurnRisk.length > 0) count++;
    if (metrics.marketingInvestment / Math.max(1, metrics.newClientsCount) > config.ticketMedio) count++;
    return count;
  };

  const activeAlertsBadge = calcActiveAlertsCount();

  // If public cardapio query is present, bypass login check to allow customers to view the public menu immediately!
  if (publicCardapioSlug) {
    return (
      <div className="bg-[#131110] min-h-screen">
        {loadingPublic ? (
          <div className="flex flex-col items-center justify-center min-h-screen text-[#F4EBD9]">
            <span className="text-3xl mb-4 animate-bounce">🍔</span>
            <p className="font-mono text-xs uppercase tracking-wide">A carregar o Cardápio Digital de "{publicCardapioSlug}"...</p>
          </div>
        ) : (
          <PublicMenuScreen 
            companySlug={publicCardapioSlug}
            companyName={publicCompany?.nome_negocio || publicCardapioSlug.toUpperCase()}
            whatsappNumber={localStorage.getItem("burguersprime_order_whatsapp") || "923000000"}
            definedProducts={publicProducts}
            clients={clients}
            metrics={metrics}
            currentCompany={publicCompany}
            onUpdateClients={(newClients) => {
              setClients(newClients);
              const empresaId = currentUser?.empresaId || "default";
              localStorage.setItem(`burguersprime_clients_${empresaId}`, JSON.stringify(newClients));
            }}
            onUpdateMetrics={(newMetrics) => {
              setMetrics(newMetrics);
              const empresaId = currentUser?.empresaId || "default";
              localStorage.setItem(`burguersprime_metrics_${empresaId}`, JSON.stringify(newMetrics));
            }}
          />
        )}
      </div>
    );
  }

  // If there is no logged in user, show auth login & register portal
  if (!currentUser) {
    return (
      <Auth 
        onLoginSuccess={handleLoginSuccess} 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)} 
      />
    );
  }

  // If welcome explainer has not been dismissed, show it right after logging in or registering
  if (showWelcomeExplainer) {
    return (
      <WelcomeExplainer 
        currentUser={currentUser} 
        onDismiss={handleDismissExplainer} 
      />
    );
  }

  // If onboarding hasn't been completed, force onboarding wizard
  if (!config.hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen grill-fumo-texture text-[#F4EBD9] font-sans flex flex-col justify-between scroll-smooth">
      
      {/* 2.5 COLLAPSIBLE LEFT SIDEBAR DRAWER (Filtros & Configurações do Sistema) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex" id="sidebar-drawer-container">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSidebarOpen(false)} 
          />
          
          {/* Drawer content body */}
          <div className="relative flex flex-col w-80 bg-[#131110] text-[#F4EBD9] h-full shadow-2xl animate-slide-in-left border-r border-[#3D2817] p-4 overflow-y-auto pr-3.5 scrollbar-thin">
            
            {/* Header of Drawer */}
            <div className="flex justify-between items-center pb-3 border-b border-[#3D2817] mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C44119] animate-pulse" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#F4EBD9]">
                  MENU BURGUERSPRIME
                </span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 hover:bg-[#C44119] hover:text-[#F4EBD9] rounded transition text-[#F4EBD9]/70"
                id="btn-close-sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PART 1 - DRAWER NAVIGATION MENU (Overlays content, hides on click) */}
            <div className="space-y-2 mb-6 pb-6 border-b border-[#3D2817]">
              <div className="flex items-center gap-1.5 text-[#E8A33D] font-extrabold text-[10px] uppercase tracking-wider mb-2">
                <Menu className="w-3.5 h-3.5" />
                <span>Navegação do Negócio</span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("dashboard");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-sm text-xs font-bebas tracking-wide uppercase transition flex items-center gap-3 border ${
                    activeTab === "dashboard"
                      ? "bg-[#C44119] text-[#F4EBD9] border-[#C44119] font-bold"
                      : "bg-[#1A1410] text-[#F4EBD9]/80 border-[#3D2817] hover:bg-[#3D2817]/40 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Início</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCrmInitialSearch("");
                    setCrmInitialSelectedClient("");
                    setCrmInitialSubTab("pipeline");
                    setActiveTab("crm");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-sm text-xs font-bebas tracking-wide uppercase transition flex items-center gap-3 border relative ${
                    activeTab === "crm"
                      ? "bg-[#C44119] text-[#F4EBD9] border-[#C44119] font-bold"
                      : "bg-[#1A1410] text-[#F4EBD9]/80 border-[#3D2817] hover:bg-[#3D2817]/40 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Meus Clientes (CRM)</span>
                  {activeAlertsBadge > 0 && (
                    <span className="absolute right-3.5 h-4 px-1.5 rounded-sm text-[8.5px] font-mono font-black flex items-center justify-center bg-[#C44119] text-white">
                      {activeAlertsBadge}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("cardapio");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-sm text-xs font-bebas tracking-wide uppercase transition flex items-center gap-3 border ${
                    activeTab === "cardapio"
                      ? "bg-[#C44119] text-[#F4EBD9] border-[#C44119] font-bold"
                      : "bg-[#1A1410] text-[#F4EBD9]/80 border-[#3D2817] hover:bg-[#3D2817]/40 hover:text-white"
                  }`}
                >
                  <Utensils className="w-4 h-4 shrink-0" />
                  <span>Meu Cardápio</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("finance");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-sm text-xs font-bebas tracking-wide uppercase transition flex items-center gap-3 border ${
                    activeTab === "finance"
                      ? "bg-[#C44119] text-[#F4EBD9] border-[#C44119] font-bold"
                      : "bg-[#1A1410] text-[#F4EBD9]/80 border-[#3D2817] hover:bg-[#3D2817]/40 hover:text-white"
                  }`}
                >
                  <Wallet className="w-4 h-4 shrink-0" />
                  <span>Meu Dinheiro</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("profile");
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-sm text-xs font-bebas tracking-wide uppercase transition flex items-center gap-3 border ${
                    activeTab === "profile"
                      ? "bg-[#C44119] text-[#F4EBD9] border-[#C44119] font-bold"
                      : "bg-[#1A1410] text-[#F4EBD9]/80 border-[#3D2817] hover:bg-[#3D2817]/40 hover:text-white"
                  }`}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Meu Negócio</span>
                </button>

                {(currentUser?.email === "albermidia@gmail.com" || realAdminUser?.email === "albermidia@gmail.com") && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("superadmin");
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-sm text-xs font-bebas tracking-wide uppercase transition flex items-center gap-3 border ${
                      activeTab === "superadmin"
                        ? "bg-amber-600 text-[#F4EBD9] border-amber-600 font-bold"
                        : "bg-[#1A1410] text-amber-500 border-[#3D2817] hover:bg-amber-950 hover:text-amber-400"
                    }`}
                  >
                    <Crown className="w-4 h-4 shrink-0" />
                    <span>Super-Admin (Central)</span>
                  </button>
                )}
              </div>
            </div>

            {/* SECTION 1: BUSINESS CONFIG SLIDERS */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-1.5 text-[#C44119] font-extrabold text-[10px] uppercase tracking-wider">
                <Settings className="w-3.5 h-3.5" />
                <span>Simulador de Parâmetros</span>
              </div>

              {/* Business Name Field */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Nome da Hamburgueria</label>
                <input 
                  type="text" 
                  value={config.businessName} 
                  onChange={(e) => setConfig(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 rounded px-2.5 py-1.5 text-xs text-slate-100 outline-none transition font-medium"
                />
              </div>

              {/* Ticket Medio Input & Slider wrapper */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Ticket Médio (Kz)</label>
                  <span className="text-xs font-mono font-bold text-red-400">{config.ticketMedio.toLocaleString()} Kz</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="10000" 
                  step="250"
                  value={config.ticketMedio} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setConfig(prev => ({ ...prev, ticketMedio: val }));
                    setMetrics(prev => ({ ...prev, totalSalesRevenue: prev.currentSalesCount * val }));
                  }} 
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-650"
                />
              </div>

              {/* Fixed Costs Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Custos Fixos Mensais</label>
                  <span className="text-xs font-mono font-bold text-slate-300">{config.fixedCosts.toLocaleString()} Kz</span>
                </div>
                <input 
                  type="number" 
                  value={config.fixedCosts} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setConfig(prev => ({ ...prev, fixedCosts: val }));
                    setMetrics(prev => ({ ...prev, fixedCosts: val }));
                  }} 
                  className="w-full bg-slate-800 border border-slate-705 focus:border-red-500 rounded px-2 py-1 text-xs text-slate-100 outline-none"
                />
              </div>

              {/* Monthly Revenue Target */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Meta de Faturação</label>
                  <span className="text-xs font-mono font-bold text-green-400">{config.monthlyRevenueTarget.toLocaleString()} Kz</span>
                </div>
                <input 
                  type="number" 
                  value={config.monthlyRevenueTarget} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setConfig(prev => ({ ...prev, monthlyRevenueTarget: val }));
                  }} 
                  className="w-full bg-slate-800 border border-slate-705 focus:border-red-500 rounded px-2 py-1 text-xs text-slate-100 outline-none"
                />
              </div>

              {/* Meta de Clientes Novos por Mês */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Meta de Clientes Novos por Mês</label>
                  <span className="text-xs font-mono font-bold text-yellow-400">{config.targetNewClients} novos</span>
                </div>
                <input 
                  type="number" 
                  value={config.targetNewClients} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setConfig(prev => ({ ...prev, targetNewClients: val }));
                  }} 
                  className="w-full bg-slate-800 border border-slate-705 focus:border-red-500 rounded px-2 py-1 text-xs text-slate-100 outline-none"
                />
                {config.targetNewClients > 500 && (
                  <p className="text-[9.5px] text-orange-400 leading-tight mt-1 font-medium bg-orange-500/10 p-1.5 rounded border border-orange-500/20 font-sans">
                    ⚠️ Meta irrealista para esta operação. Recomenda-se entre 30 e 150 para garantir acompanhamento personalizado sem estourar o orçamento de marketing.
                  </p>
                )}
              </div>

              {/* Main Channel Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Canal Principal de Vendas</label>
                <select 
                  value={config.mainChannel} 
                  onChange={(e) => setConfig(prev => ({ ...prev, mainChannel: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-705 focus:border-red-500 rounded px-2 py-1 text-xs text-slate-100 outline-none"
                >
                  <option value="WhatsApp">WhatsApp Core</option>
                  <option value="Instagram">Instagram Direct</option>
                  <option value="Presencial">Presencial (Balcão)</option>
                  <option value="Chamada">Ligar Directo</option>
                </select>
              </div>

              {/* Operation Type */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Tipo de Operação</label>
                <select 
                  value={config.operationType} 
                  onChange={(e) => setConfig(prev => ({ ...prev, operationType: e.target.value as any }))}
                  className="w-full bg-slate-800 border border-slate-705 focus:border-red-500 rounded px-2 py-1 text-xs text-slate-100 outline-none"
                >
                  <option value="delivery">Módulo Entrega (Delivery)</option>
                  <option value="balcao">Só Takeaway / Balcão</option>
                  <option value="ambos">Formato Híbrido (Ambos)</option>
                </select>
              </div>
            </div>

            {/* SUB-SECTION: TECHNICAL SHEET & BURGER COMPONENT COST CALCULATOR */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex items-center gap-1.5 text-red-500 font-extrabold text-[10px] uppercase tracking-wider">
                <Utensils className="w-3.5 h-3.5 text-red-500" />
                <span>Ficha Técnica & Custo Real</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Regista cada componente do hambúrguer para calcular a soma dos ingredientes, obtendo o custo real (CMV) e a margem bruta real em Angola.
              </p>

              {/* LIST OF BURGER COMPONENTS */}
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                {burgerComponents.map((comp, idx) => (
                  <div key={comp.id || idx} className="flex items-center gap-1.5 bg-slate-950/40 p-1.5 rounded border border-slate-800/80">
                    <input 
                      type="text"
                      value={comp.name}
                      onChange={(e) => {
                        const newComponents = [...burgerComponents];
                        newComponents[idx].name = e.target.value;
                        setBurgerComponents(newComponents);
                      }}
                      placeholder="Ingrediente"
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-red-500 rounded px-1.5 py-0.5 text-[10px] text-slate-200 outline-none font-medium"
                    />
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1 max-w-[85px] shrink-0">
                      <input 
                        type="number"
                        value={comp.cost}
                        onChange={(e) => {
                          const newComponents = [...burgerComponents];
                          newComponents[idx].cost = Math.max(0, Number(e.target.value));
                          setBurgerComponents(newComponents);
                        }}
                        className="w-full bg-transparent text-[10px] text-slate-200 font-mono text-right outline-none py-0.5"
                      />
                      <span className="text-[9px] text-slate-500 select-none ml-1">Kz</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newComponents = burgerComponents.filter((_, i) => i !== idx);
                        setBurgerComponents(newComponents);
                      }}
                      className="p-1 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded transition cursor-pointer"
                      title="Remover ingrediente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* ADD NEW INGREDIENT BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setBurgerComponents(prev => [
                    ...prev,
                    { id: String(Date.now()), name: "Novo Ingrediente", cost: 0 }
                  ]);
                }}
                className="w-full bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 rounded py-1.5 text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Adicionar Ingrediente</span>
              </button>

              {/* SUMMARY CALCULATIONS */}
              {(() => {
                const totalCost = burgerComponents.reduce((acc, c) => acc + c.cost, 0);
                const ticket = config.ticketMedio;
                const grossProfit = Math.max(0, ticket - totalCost);
                const cmvPercent = ticket > 0 ? (totalCost / ticket) * 100 : 0;
                const profitPercent = ticket > 0 ? (grossProfit / ticket) * 100 : 0;

                let cmvColor = "text-green-400";
                let cmvBg = "bg-green-500/10 border-green-500/20";
                let cmvStatus = "CMV Óptimo";
                if (cmvPercent > 40) {
                  cmvColor = "text-red-400";
                  cmvBg = "bg-red-500/10 border-red-500/20";
                  cmvStatus = "CMV Crítico (Alto)";
                } else if (cmvPercent > 30) {
                  cmvColor = "text-yellow-400";
                  cmvBg = "bg-yellow-500/10 border-yellow-500/20";
                  cmvStatus = "CMV Aceitável";
                }

                return (
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 font-sans">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Total Ingredientes (Custo):</span>
                      <span className="font-mono font-bold text-red-400">{totalCost.toLocaleString()} Kz</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Preço de Venda (Ticket):</span>
                      <span className="font-mono font-bold text-slate-200">{ticket.toLocaleString()} Kz</span>
                    </div>
                    
                    <div className="border-t border-slate-900 my-1 pt-1 flex justify-between items-center text-[10px]">
                      <span className="text-slate-300 font-medium">Lucro Bruto Estimado:</span>
                      <span className={`font-mono font-bold ${grossProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {grossProfit.toLocaleString()} Kz ({profitPercent.toFixed(0)}%)
                      </span>
                    </div>

                    <div className={`text-[9px] px-2 py-1.5 rounded border ${cmvBg} flex justify-between items-center mt-1`}>
                      <span className="font-medium text-slate-300">CMV (Custo de Matéria):</span>
                      <span className={`font-mono font-bold ${cmvColor}`}>{cmvPercent.toFixed(1)}% — {cmvStatus}</span>
                    </div>

                    {totalCost > ticket && (
                      <div className="text-[9px] text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded leading-tight">
                        ⚠️ Atenção: O custo dos ingredientes é maior que o preço de venda! Aconselha-se aumentar o Ticket Médio ou renegociar matéria-prima.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* SECTION 2: HEALTH DIAGNOSTIC AND SYSTEM META */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex items-center gap-1.5 text-red-500 font-extrabold text-[10px] uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Análise de Desempenho</span>
              </div>

              {/* Visual mini-KPI list */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Clientes Ativos:</span>
                  <span className="font-mono font-bold text-slate-200">{clients.length} registados</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Cobertura da Meta:</span>
                  <span className="font-mono font-bold text-green-400">
                    {((metrics.totalSalesRevenue / config.monthlyRevenueTarget) * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Break even sales count */}
                <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Ponto de Equilíbrio:</span>
                  <span className="font-mono font-bold text-red-400">
                    {Math.ceil(config.fixedCosts / (config.ticketMedio * 0.60))} burgers
                  </span>
                </div>

                {/* Marketing Cost of Acquisition (CAC) */}
                <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-800">
                  <span className="text-slate-400">CAC Estimado:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {Math.round(metrics.marketingInvestment / Math.max(1, metrics.newClientsCount)).toLocaleString()} Kz
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: SESSÃO DO UTILIZADOR */}
            <div className="border-t border-slate-800 pt-4 mt-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                <span>Operador do Sistema</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <span className="text-2xl bg-slate-900 border border-slate-800 p-1.5 rounded-full block select-none">
                  {currentUser?.avatar || "👨‍🍳"}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-slate-100 truncate">{currentUser?.name}</h4>
                  <p className="text-[9px] text-slate-500 font-mono truncate">{currentUser?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogOut}
                className="w-full bg-slate-950/40 hover:bg-slate-800 hover:text-red-400 text-slate-300 border border-slate-800 rounded py-1.5 text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                id="btn-sidebar-logout"
              >
                <span>Terminar Sessão (Log Out)</span>
              </button>
            </div>

            {/* SECTION 4: DEEP RESET SHORTCUT */}
            <div className="border-t border-slate-800 pt-5 mt-5 space-y-2">
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  handleResetSystem();
                }}
                className="w-full bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-900/65 rounded py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5"
                id="btn-sidebar-reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resetar Hamburgueria</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />

      {/* Intro Tutorial Overlay Modal */}
      {showTutorial && clients.length < 2 && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative flex flex-col justify-between text-slate-900 animate-fade-in">
            {/* Steps indicator */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-red-655 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 font-mono">
                Tutorial de Introdução
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                {tutorialStep} / 3
              </span>
            </div>

            {/* Steps Rendering */}
            {tutorialStep === 1 && (
              <div className="space-y-3">
                <h3 className="text-base font-black text-slate-900">Passo 1 de 3 — Configura o teu negócio</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Clica no ícone <strong className="text-red-650">☰</strong> no canto superior esquerdo e preenche o nome da tua hamburgueria, ticket médio e custos fixos.
                </p>
              </div>
            )}

            {tutorialStep === 2 && (
              <div className="space-y-3">
                <h3 className="text-base font-black text-slate-900">Passo 2 de 3 — Adiciona o teu primeiro cliente</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Vai ao <strong className="text-red-650">Meus Clientes</strong> e regista o teu primeiro cliente. Precisas apenas do nome e WhatsApp.
                </p>
              </div>
            )}

            {tutorialStep === 3 && (
              <div className="space-y-3">
                <h3 className="text-base font-black text-slate-900">Passo 3 de 3 — O sistema trabalha por ti</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Com os dados preenchidos, o painel calcula automaticamente o teu ponto de equilíbrio, ROI e clientes em risco. Actualiza diariamente.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (tutorialStep < 3) {
                    setTutorialStep(tutorialStep + 1);
                  } else {
                    localStorage.setItem("burguersprime_tutorial_completed", "true");
                    setShowTutorial(false);
                  }
                }}
                className="w-full py-2 bg-red-650 hover:bg-red-700 text-white font-extrabold text-center text-xs rounded-lg shadow transition flex items-center justify-center gap-1"
              >
                <span>{tutorialStep < 3 ? "Seguinte →" : "Começar a Usar →"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("burguersprime_tutorial_completed", "true");
                  setShowTutorial(false);
                }}
                className="w-full py-1.5 text-slate-400 hover:text-slate-700 font-extrabold text-[11px] text-center transition bg-slate-50 hover:bg-slate-100 bg-transparent rounded"
              >
                Já sei usar — entrar directamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-2.5 md:px-4 py-3 z-10 flex-grow space-y-4">
        
        {/* Success Banner Alert for Reactivation */}
        {reactivationSuccessBanner && (
          <div className="bg-emerald-600 text-emerald-50 border border-emerald-500 rounded-xl px-4 py-2.5 shadow-md flex items-center justify-between animate-fade-in z-40 text-xs font-bold font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-100 shrink-0" />
              <span>{reactivationSuccessBanner}</span>
            </div>
            <button
              onClick={() => setReactivationSuccessBanner("")}
              className="text-emerald-100 hover:text-white px-1 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* TOP STATUS BAR & HEADER */}
        {realAdminUser && (
          <div className="bg-[#C44119] text-[#F4EBD9] border-2 border-black rounded-sm px-4 py-2 text-xs font-mono font-bold flex justify-between items-center z-[80] shadow-md animate-pulse">
            <span className="flex items-center gap-2 uppercase">
              <ShieldAlert className="w-4.5 h-4.5 text-[#E8A33D] shrink-0 animate-bounce" />
              <span>🛠️ MODO DE SUPORTE ATIVO: Visualizando grelha de "{config.businessName || "Hamburgueria Particular"}"</span>
            </span>
            <button
              onClick={handleExitSupportMode}
              className="bg-black hover:bg-[#F4EBD9] hover:text-black text-white text-[9px] font-black uppercase px-2.5 py-1 rounded transition select-none cursor-pointer"
            >
              Voltar ao Painel Admin ×
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-[#131110] text-[#F4EBD9] border-2 border-[#3D2817] px-4 py-2 rounded-sm relative">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle menu button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              id="btn-sidebar-toggle"
              className="h-8.5 w-8.5 bg-[#3D2817] hover:bg-[#C44119] text-[#F4EBD9] rounded-sm flex items-center justify-center transition shrink-0 border border-[#3D2817]"
              title="Abrir Menu de Navegação & Parâmetros"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            <div className="h-8.5 w-8.5 bg-[#C44119] border border-[#3D2817] rounded-sm flex items-center justify-center font-display font-bold text-[#F4EBD9] text-base tracking-tight">
              BP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-lg text-[#F4EBD9] leading-none tracking-wide">BURGUERS<span className="text-[#C44119]">PRIME</span></h1>
                <div className="carimbo-stamp text-[8px] scale-[0.8] origin-left py-0.5 px-1 rounded border border-[#E8A33D] text-[#E8A33D] font-mono leading-none">
                  ★ ONLINE ★
                </div>
              </div>
              <p className="text-[9.5px] text-[#F4EBD9]/60 font-mono mt-0.5">
                Hamburgueria: <span className="text-[#E8A33D] font-bold uppercase">{config.businessName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            {/* Global Dark Mode toggle button */}
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              id="btn-dark-mode"
              className="p-1.5 bg-[#3D2817] hover:bg-[#C44119] border border-[#3D2817] rounded-sm text-[#F4EBD9] transition flex items-center justify-center cursor-pointer"
              title={isDarkMode ? "Alterar para Modo Claro" : "Alterar para Modo Escuro"}
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5 text-[#E8A33D]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#F4EBD9]" />
              )}
            </button>

            {/* Force restart onboarding */}
            <button
              onClick={handleResetSystem}
              id="btn-re-onboard"
              className="p-1.5 bg-[#3D2817] hover:bg-[#C44119] border border-[#3D2817] rounded-sm text-[#F4EBD9] transition flex items-center justify-center cursor-pointer"
              title="Resetar Configuração de Hamburgueria"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ACTIVE WORKSPACE RENDERER */}
        <main className="bg-transparent" id="workspace-viewport">
          {activeTab === "dashboard" && (
            <Dashboard 
              config={config} 
              clients={clients} 
              metrics={metrics}
              onNavigateToCRM={() => {
                setCrmInitialSearch("");
                setCrmInitialSelectedClient("");
                setCrmInitialSubTab("pipeline");
                setActiveTab("crm");
              }}
              onNavigateToFinance={() => setActiveTab("finance")}
              onTriggerReactivation={handleTriggerReactivation}
            />
          )}

          {activeTab === "crm" && (
            <CRM 
              config={config} 
              clients={clients} 
              onAddClient={handleAddClient} 
              onUpdateClientStage={handleUpdateClientStage} 
              onDeleteClient={handleDeleteClient}
              onRegisterQrOrder={handleRegisterQrOrder}
              initialCrmSubTab={crmInitialSubTab}
              initialSearchQuery={crmInitialSearch}
              initialSelectedClientId={crmInitialSelectedClient}
            />
          )}

          {activeTab === "cardapio" && (
            <Cardapio 
              config={config}
              clients={clients}
              metrics={metrics}
              currentUser={currentUser}
              onUpdateClients={(newClients) => {
                setClients(newClients);
                const empresaId = currentUser?.empresaId || "default";
                localStorage.setItem(`burguersprime_clients_${empresaId}`, JSON.stringify(newClients));
              }}
              onUpdateMetrics={(newMetrics) => {
                setMetrics(newMetrics);
                const empresaId = currentUser?.empresaId || "default";
                localStorage.setItem(`burguersprime_metrics_${empresaId}`, JSON.stringify(newMetrics));
              }}
            />
          )}

          {activeTab === "finance" && (
            <Finance 
              config={config} 
              clients={clients} 
              metrics={metrics} 
              onUpdateMetrics={handleUpdateMetrics}
            />
          )}

          {activeTab === "profile" && (
            <Profile 
              config={config} 
              clients={clients} 
              metrics={metrics} 
              currentUser={currentUser}
              onLogOut={handleLogOut}
              onShowGuide={() => setShowWelcomeExplainer(true)}
              onUpdateConfig={(newConfig) => setConfig(newConfig)}
              currentCompany={currentCompany}
              onBulkSyncPulled={(pConfig, pClients, pMetrics, pBurgerComponents) => {
                setConfig(pConfig);
                setClients(pClients);
                setMetrics(pMetrics);
                if (pBurgerComponents) {
                  setBurgerComponents(pBurgerComponents);
                }
              }}
            />
          )}

          {activeTab === "superadmin" && currentUser && (
            <SuperAdmin
              currentUser={currentUser}
              onInheritSession={handleInheritSession}
              onExitSupportMode={handleExitSupportMode}
              isSupportModeActive={!!realAdminUser}
            />
          )}
        </main>

      </div>

      {/* FOOTER ACCENTS */}
      <footer className="w-full bg-[#1A1410] border-t-2 border-dashed border-[#F4EBD9]/20 py-6 text-center text-xs mt-12 px-4 space-y-1.5 select-none">
        <p className="font-sans text-[#7A8B6F] text-xs font-bold flex items-center justify-center gap-1.5 uppercase tracking-wide">
          <span>🔒 Os teus dados estão seguros e isolados por empresa.</span>
        </p>
        <p className="font-bebas tracking-widest text-[#E8A33D] text-sm uppercase">★ BURGUERSPRIME — O COCKPIT OFICIAL DO DONO DE HAMBURGUERIA EM ANGOLA ★</p>
        <p className="text-[#F4EBD9]/65 font-mono text-[10.5px]">
          BURGERSPRIME © 2026 — Luanda, Angola.
        </p>
      </footer>

    </div>
  );
}
