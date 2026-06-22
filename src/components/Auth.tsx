import React, { useState, useEffect } from "react";
import { AuthUser } from "../types";
import { 
  LogIn, UserPlus, Mail, Lock, Shield, Store, Flame, 
  User, Check, Eye, EyeOff, Sun, Moon, Sparkles, CheckCircle
} from "lucide-react";

interface AuthProps {
  onLoginSuccess: (user: AuthUser) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const AVATAR_OPTIONS = [
  { id: "king", emoji: "👑", label: "Dono Supremo" },
  { id: "chef", emoji: "👨‍🍳", label: "Grelhador Mestre" },
  { id: "biker", emoji: "🛵", label: "Entregador Veloz" },
  { id: "money", emoji: "📊", label: "Gestor Financeiro" },
  { id: "artisan", emoji: "💅", label: "Burger Designer" },
];

export default function Auth({ onLoginSuccess, isDarkMode, onToggleDarkMode }: AuthProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Form fields
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [businessName, setBusinessName] = useState<string>("");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("chef");

  // Error / Success handling
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Registered Users (pre-seed if empty)
  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>(() => {
    // Ensure companies list is preseeded in LocalStorage first
    let savedCos = localStorage.getItem("burguersprime_companies");
    if (!savedCos) {
      const initialCompanies = [
        {
          id: "grelha-real-luanda",
          nome_negocio: "Grelha Real Luanda",
          slug: "grelha-real-luanda",
          email_admin: "dono@burguerprime.com",
          plano: "free",
          fase_sistema: "beta",
          data_criacao: "2026-06-15T12:00:00Z",
          status: "activo",
          ticket_medio: 2500,
          custos_fixos_mensais: 200000,
          meta_faturacao: 1000000,
          canal_principal: "WhatsApp",
          tipo_operacao: "ambos"
        },
        {
          id: "vapor-brasa-benguela",
          nome_negocio: "Vapor & Brasa Benguela",
          slug: "vapor-brasa-benguela",
          email_admin: "financeiro@prime.ao",
          plano: "free",
          fase_sistema: "beta",
          data_criacao: "2026-06-16T12:00:00Z",
          status: "activo",
          ticket_medio: 2500,
          custos_fixos_mensais: 200000,
          meta_faturacao: 1000000,
          canal_principal: "Instagram",
          tipo_operacao: "ambos"
        }
      ];
      localStorage.setItem("burguersprime_companies", JSON.stringify(initialCompanies));
    }

    const saved = localStorage.getItem("burguersprime_registered_users");
    let usersList: AuthUser[] = [];
    if (saved) {
      try {
        usersList = JSON.parse(saved);
      } catch (e) { /* ignore */ }
    }

    // Ensure administrator and demo users have proper enterprise-ties
    const hasAdmin = usersList.some(u => u.email.toLowerCase() === "albermidia@gmail.com");
    if (!hasAdmin) {
      const adminUser: AuthUser = {
        id: "admin-albermidia",
        name: "Administrador (Suporte)",
        email: "albermidia@gmail.com",
        password: "admin",
        avatar: "👑",
        businessName: "Administração BurguerPrime",
        empresaId: "admin-system",
        papel: "dono"
      };

      // Ensure standard preseed demo users are also included if first startup
      if (usersList.length === 0) {
        usersList = [
          adminUser,
          {
            id: "demo-1",
            name: "Yuri Grelhas",
            email: "dono@burguerprime.com",
            password: "angola123",
            avatar: "👨‍🍳",
            businessName: "Grelha Real Luanda",
            empresaId: "grelha-real-luanda",
            papel: "dono"
          },
          {
            id: "demo-2",
            name: "Katia Kumbu",
            email: "financeiro@prime.ao",
            password: "kumbu123",
            avatar: "📊",
            businessName: "Vapor & Brasa Benguela",
            empresaId: "vapor-brasa-benguela",
            papel: "gestor"
          }
        ];
      } else {
        // Upgrade existing list to ensure they have the links
        usersList = [adminUser, ...usersList.map(u => {
          if (u.email.toLowerCase() === "dono@burguerprime.com") {
            return { ...u, empresaId: "grelha-real-luanda", papel: "dono" as const };
          }
          if (u.email.toLowerCase() === "financeiro@prime.ao") {
            return { ...u, empresaId: "vapor-brasa-benguela", papel: "gestor" as const };
          }
          return u;
        })];
      }
      localStorage.setItem("burguersprime_registered_users", JSON.stringify(usersList));
    }
    return usersList;
  });

  // Watch for errors to clear them automatically after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleDemoLogin = (user: AuthUser) => {
    setSuccess(`Carimbo de Entrada Confirmado! Bem-vindo(a), ${user.name}!`);
    setTimeout(() => {
      onLoginSuccess(user);
    }, 900);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Falta preencher os talões obrigatórios!");
      return;
    }

    if (isLogin) {
      // Find user
      const user = registeredUsers.find(
        u => u.email.toLowerCase() === cleanEmail && u.password === password
      );

      if (user) {
        setSuccess(`Aprovado! Entrando em ${user.businessName || "BURGUERSPRIME"}...`);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 1000);
      } else {
        setError("Senha ou e-mail incorretos. Tenta de novo.");
      }
    } else {
      // Register logic
      if (!businessName.trim()) {
        setError("Por favor, preenche o nome do teu negócio!");
        return;
      }

      if (password.length < 6) {
        setError("A senha precisa de ter pelo menos 6 caracteres!");
        return;
      }

      // Check duplicate
      const alreadyExists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail);
      if (alreadyExists) {
        setError("Esse e-mail já está em uso. Tenta entrar!");
        return;
      }

      const selectedAvatar = "👨‍🍳";

      // 1. Create Empresa (Company Tenant)
      const newEmpresaId = "empresa-" + Date.now();
      const rawSlug = businessName.trim();
      const slug = rawSlug
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      const newEmpresa = {
        id: newEmpresaId,
        nome_negocio: businessName.trim(),
        slug: slug || "hamburgueria-" + Date.now(),
        email_admin: cleanEmail,
        plano: "free" as const,
        fase_sistema: "beta" as const,
        data_criacao: new Date().toISOString(),
        status: "activo" as const,
        ticket_medio: 2500,
        custos_fixos_mensais: 200000,
        meta_faturacao: 1000000,
        canal_principal: "WhatsApp",
        tipo_operacao: "ambos" as const
      };

      // Persist the new company in LocalStorage
      const currentCos = JSON.parse(localStorage.getItem("burguersprime_companies") || "[]");
      localStorage.setItem("burguersprime_companies", JSON.stringify([...currentCos, newEmpresa]));

      // 2. Create the AuthUser bound to the company and role
      const newUser: AuthUser = {
        id: "user-" + Date.now(),
        name: "Dono de " + businessName.trim(),
        email: cleanEmail,
        password: password,
        avatar: selectedAvatar,
        businessName: businessName.trim(),
        empresaId: newEmpresaId,
        papel: "dono"
      };

      const updatedList = [...registeredUsers, newUser];
      setRegisteredUsers(updatedList);
      localStorage.setItem("burguersprime_registered_users", JSON.stringify(updatedList));

      setSuccess("Tudo pronto! Grelha acesa e registada com sucesso na fase Beta gratuita.");
      
      // Auto-login after 1.1s
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1100);
    }
  };

  return (
    <div id="auth-viewport" className="min-h-screen grill-fumo-texture flex flex-col justify-between p-4 md:p-8 relative selection:bg-[#C44119] selection:text-[#F4EBD9]">
      
      {/* Top Brand Block */}
      <div className="max-w-4xl mx-auto w-full flex justify-between items-center z-10 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#C44119] text-[#F4EBD9] border-2 border-[#3D2817] rounded flex items-center justify-center font-display font-black text-xl tracking-tight shadow-[2px_2px_0_rgba(61,40,23,0.9)] rotate-[-2deg]">
            BP
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl tracking-wider text-[#F4EBD9] leading-none uppercase">
              BURGERS<span className="text-[#E8A33D]">PRIME</span>
            </h2>
            <p className="text-[10px] font-mono tracking-widest text-[#E8A33D]/75">LUANDA GRELHA TECH</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Visual Custom "ONLINE" kitchen stamp in header */}
          <div className="carimbo-stamp text-xs scale-90">
            ★ ONLINE ★
          </div>

          <button 
            type="button"
            onClick={onToggleDarkMode}
            id="auth-dark-mode-toggle"
            className="p-1.5 bg-[#F4EBD9] border-1.5 border-[#3D2817] shadow-[1px_2px_0_rgba(61,40,23,0.9)] rounded text-[#3D2817] hover:bg-[#E8A33D] transition select-none cursor-pointer"
            title={isDarkMode ? "Ver no Balcão Claro" : "Ver no Balcão Escuro"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#C44119]" /> : <Moon className="w-4 h-4 text-[#3D2817]" />}
          </button>
        </div>
      </div>

      {/* Main Redesign Panel */}
      <div className="max-w-4xl mx-auto w-full my-auto py-4 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Pitch Side (Left) - Designed with a "Grill Ticket Poster" look */}
        <div className="lg:col-span-5 space-y-6 text-left hidden lg:block pr-4">
          <div className="border-t-4 border-[#C44119] pt-4 space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest text-[#E8A33D] uppercase">
              • SISTEMA OPERACIONAL DA BRASA •
            </span>
            <h1 className="font-display font-black text-5xl tracking-normal text-[#F4EBD9] leading-none uppercase">
              INFLAMA AS VENDAS DA TUA <span className="text-[#C44119]">GRELHA</span>.
            </h1>
          </div>

          <p className="text-[#F4EBD9]/85 text-sm leading-relaxed font-sans">
            O único cockpit de CRM & Inteligência Financeira desenvolvido à medida das hamburguerias artesanais de Luanda e províncias vizinhas. Corta o desperdício de CMV de vez.
          </p>

          {/* Value props mimicking kitchen orders/items list */}
          <div className="space-y-3 font-mono text-xs border-y border-[#F4EBD9]/20 py-4">
            <div className="flex items-start gap-2.5">
              <span className="text-[#C44119] font-black">[01]</span>
              <div>
                <strong className="text-[#E8A33D] uppercase tracking-wider font-extrabold">Custo de Grelha Inteligente</strong>
                <p className="text-[11px] text-[#F4EBD9]/70 mt-0.5">Mapeia o CMV do pão, carne e molho. Define lucro sustentável.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-[#C44119] font-black">[02]</span>
              <div>
                <strong className="text-[#E8A33D] uppercase tracking-wider font-extrabold">CRM de Carimbo Directo</strong>
                <p className="text-[11px] text-[#F4EBD9]/70 mt-0.5">Captura os clientes fiéis e reativa os desertores via WhatsApp Luanda.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-[#C44119] font-black">[03]</span>
              <div>
                <strong className="text-[#E8A33D] uppercase tracking-wider font-extrabold">Talão & QR Code de Mesa</strong>
                <p className="text-[11px] text-[#F4EBD9]/70 mt-0.5">Pedidos diretos dos clientes direto para a cozinha com faturas limpas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Paper Ticket Card (Right) */}
        <div className="lg:col-span-7 w-full flex flex-col gap-6 animate-print-1">
          <div className="talao-card p-6 md:p-8">
            
            {/* Top shred raw receipt decoration */}
            <div className="text-center mb-6">
              <span className="block text-[10px] uppercase font-mono tracking-widest text-[#3D2817]/60">--- TALÃO DE ENTRADA ---</span>
              <h2 className="font-display text-3xl font-bold uppercase text-[#3D2817] tracking-tight mt-1">BURGUERSPRIME</h2>
              <div className="talao-divider-dotted" />
            </div>

            {/* Login / Register Tab Header */}
            <div className="flex border-1.5 border-[#3D2817] mb-6 p-0.5 bg-[#3D2817]/5 rounded-sm">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(""); }}
                id="tab-login"
                className={`flex-1 text-center py-2.5 rounded-sm text-xs font-extrabold tracking-wider transition-all uppercase ${
                  isLogin 
                    ? "bg-[#3D2817] text-[#F4EBD9]" 
                    : "text-[#3D2817]/60 hover:text-[#3D2817]"
                }`}
              >
                ENTRAR
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(""); }}
                id="tab-register"
                className={`flex-1 text-center py-2.5 rounded-sm text-xs font-extrabold tracking-wider transition-all uppercase ${
                  !isLogin 
                    ? "bg-[#3D2817] text-[#F4EBD9]" 
                    : "text-[#3D2817]/60 hover:text-[#3D2817]"
                }`}
              >
                CRIAR CONTA
              </button>
            </div>

            {/* Error / Success Feedback with Retro Stamp look */}
            {error && (
              <div className="p-3 bg-red-100 border-2 border-[#C44119] rounded-sm text-[#C44119] text-xs font-mono font-bold mb-4 flex items-center gap-2">
                <span>[AVISO DE BRASA]</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-[#7A8B6F]/20 border-2 border-[#7A8B6F] rounded-sm text-[#3D2817] text-xs font-mono font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#7A8B6F] shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {!isLogin && (
                <>

                  {/* Business Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-extrabold text-[#3D2817]/70 uppercase flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#C44119]" />
                      Nome do negócio
                    </label>
                    <input 
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ex: Vapor & Brasa Luanda"
                      id="input-reg-bname"
                      className="w-full talao-input"
                    />
                  </div>

                </>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-extrabold text-[#3D2817]/70 uppercase flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C44119]" />
                  O teu e-mail
                </label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dono@prime.ao"
                  id="input-auth-email"
                  className="w-full talao-input"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono font-extrabold uppercase text-[#3D2817]/70">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#C44119]" />
                    Senha
                  </span>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => setError("Clica num dos acessos rápidos de 1-clique em baixo para entrar!")}
                      className="text-[#C44119] hover:underline cursor-pointer font-bold select-none text-[8.5px] tracking-wide"
                    >
                      PERDESTE A CHAVE?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Introduz a senha"
                    id="input-auth-password"
                    className="w-full talao-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D2817]/50 hover:text-[#3D2817] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Click */}
              <button
                type="submit"
                id="btn-auth-submit"
                className="w-full btn-brasa py-3.5 text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {isLogin ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>ENTRAR</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>CRIAR CONTA</span>
                  </>
                )}
              </button>
            </form>

            <div className="talao-divider-dotted my-5" />

            {/* Quick Demo Access (1-Click) */}
            <div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase text-[#3D2817]/70 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E8A33D] fill-[#E8A33D] animate-pulse" />
                <span>EXPERIMENTAR SEM CRIAR CONTA:</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {registeredUsers.slice(0, 3).map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => handleDemoLogin(user)}
                    className="bg-[#3D2817]/5 hover:bg-[#3D2817]/10 border-1.5 border-[#3D2817]/25 p-2 rounded text-left transition text-xs flex items-center gap-2 cursor-pointer group"
                  >
                    <span className="text-xl bg-[#F4EBD9] p-1 border border-[#3D2817]/20 rounded shrink-0">
                      {user.avatar || "👨‍🍳"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bebas text-sm text-[#3D2817] tracking-wider uppercase group-hover:text-[#C44119] truncate">{user.name}</h4>
                      <p className="text-[8px] font-mono text-[#3D2817]/60 truncate leading-none mt-0.5">{user.email}</p>
                      <p className="text-[9px] text-[#C44119] font-black truncate leading-none mt-0.5">{user.businessName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Jagged / dotted paper bottom mimic */}
            <div className="text-center mt-5 pt-3 border-t-2 border-dashed border-[#3D2817]/40">
              <span className="text-[8px] font-mono text-[#3D2817]/50 uppercase tracking-widest">★ BURGUERSPRIME TERMINAL V1.0 ★</span>
            </div>

          </div>
        </div>

      </div>

      {/* Footer Design System matching client's terminal spec */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-[#F4EBD9]/65 mt-6 select-none font-mono space-y-1.5">
        <p className="flex items-center justify-center gap-1.5 font-bold text-[#7A8B6F] uppercase text-[11px] tracking-wide">
          <span>🔒 Os teus dados estão seguros e isolados por empresa.</span>
        </p>
        <p className="text-[10.5px]">
          BURGERSPRIME © 2026 — Luanda, Angola.
        </p>
      </div>

    </div>
  );
}
