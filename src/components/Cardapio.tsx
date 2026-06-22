import React, { useState, useEffect } from "react";
import { ProdutoMenu, PedidoCardapio, ClientProfile, FinancialMetrics, SetupConfig, Empresa } from "../types";
import { supabase, isSupabaseConfigured, savePedidoCardapio } from "../lib/supabase";
import { 
  Store, Plus, Trash2, Edit2, Copy, Share2, QrCode, ArrowUp, ArrowDown, 
  Check, Eye, EyeOff, X, ShoppingCart, Minus, CreditCard, MapPin, CheckCircle, 
  MessageSquare, User, Phone, ArrowRight, ExternalLink
} from "lucide-react";

interface CardapioProps {
  config: SetupConfig;
  clients: ClientProfile[];
  metrics: FinancialMetrics;
  currentCompany?: Empresa | null;
  currentUser?: any;
  onUpdateClients: (newClients: ClientProfile[]) => void;
  onUpdateMetrics: (newMetrics: FinancialMetrics) => void;
  onUpdateConfig?: (newConfig: SetupConfig) => void;
}

export default function Cardapio({
  config,
  clients,
  metrics,
  currentCompany,
  currentUser,
  onUpdateClients,
  onUpdateMetrics,
  onUpdateConfig
}: CardapioProps) {
  // Current active mode inside the admin screen
  const [activeSubTab, setActiveSubTab] = useState<"lista" | "preview_dono">("lista");

  // Get/Set local products list, persisting to LocalStorage with fallback demo items
  const [produtos, setProdutos] = useState<ProdutoMenu[]>(() => {
    const empresaId = currentCompany?.id || "default";
    const saved = localStorage.getItem(`burguersprime_menu_${empresaId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { /* ignore */ }
    }
    // Return gorgeous initial items if nothing is saved
    return [
      {
        id: "p-1",
        empresa_id: empresaId,
        nome: "Smash Duplo Prime",
        descricao: "Duas carnes suculentas de 120g na grelha, queijo cheddar derretido, molho artesanal prime e pão brioche amanteigado.",
        preco: 4500,
        categoria: "hamburgueres",
        disponivel: true,
        ordem_exibicao: 1,
      },
      {
        id: "p-2",
        empresa_id: empresaId,
        nome: "Cheeseburger Classic",
        descricao: "Hambúrguer grelhado de 150g, queijo cheddar fatiado, picles caseiros e molho especial em pão macio.",
        preco: 3500,
        categoria: "hamburgueres",
        disponivel: true,
        ordem_exibicao: 2,
      },
      {
        id: "p-3",
        empresa_id: empresaId,
        nome: "Batata Frita Rústica",
        descricao: "Batatas fritas super estaladiças salpicadas com alecrim fresco e flor de sal da nossa costa.",
        preco: 1500,
        categoria: "acompanhamentos",
        disponivel: true,
        ordem_exibicao: 3,
      },
      {
        id: "p-4",
        empresa_id: empresaId,
        nome: "Asinhas Picantes da Banda",
        descricao: "6 asinhas de frango crocantes banhadas em molho picante tradicional de Luanda.",
        preco: 2500,
        categoria: "acompanhamentos",
        disponivel: true,
        ordem_exibicao: 4,
      },
      {
        id: "p-5",
        empresa_id: empresaId,
        nome: "Coca-Cola Zero Lata 330ml",
        descricao: "Gelada no ponto certo para refrescar a chapa.",
        preco: 800,
        categoria: "bebidas",
        disponivel: true,
        ordem_exibicao: 5,
      },
      {
        id: "p-6",
        empresa_id: empresaId,
        nome: "Bacon Snack Extra",
        descricao: "Tiras de bacon fumado ultra crocante para dar o toque ideal.",
        preco: 1000,
        categoria: "extras",
        disponivel: true,
        ordem_exibicao: 6,
      }
    ];
  });

  // Fetch from Supabase if connected
  useEffect(() => {
    const loadSupabaseMenu = async () => {
      const empresaId = currentCompany?.id;
      if (empresaId && isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from("produtos_menu")
            .select("*")
            .eq("empresa_id", empresaId)
            .order("ordem_exibicao", { ascending: true });

          if (!error && data && data.length > 0) {
            const mapped: ProdutoMenu[] = data.map(m => ({
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
            setProdutos(mapped);
          }
        } catch (e) {
          console.error("Erro ao puxar produtos do Supabase:", e);
        }
      }
    };
    loadSupabaseMenu();
  }, [currentCompany]);

  // Persist to LocalStorage whenever changes occur
  useEffect(() => {
    const empresaId = currentCompany?.id || "default";
    localStorage.setItem(`burguersprime_menu_${empresaId}`, JSON.stringify(produtos));
  }, [produtos, currentCompany]);

  // Copy/Share feedbacks
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);

  // Form states for adding/editing products
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria: "hamburgueres" as ProdutoMenu["categoria"],
    foto_url: "",
    disponivel: true
  });

  // Owner settings for orders
  const [businessWhatsApp, setBusinessWhatsApp] = useState(() => {
    return localStorage.getItem("burguersprime_order_whatsapp") || "923000000";
  });

  const saveWhatsappNumber = (val: string) => {
    const clean = val.replace(/\D/g, "");
    setBusinessWhatsApp(clean);
    localStorage.setItem("burguersprime_order_whatsapp", clean);
  };

  const getSlug = () => {
    if (currentCompany?.slug) return currentCompany.slug;
    return (config.businessName || "burguersprime").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  };

  // Build the live public URL
  const publicMenuUrl = `${window.location.origin}?cardapio=${getSlug()}`;

  // Form management
  const handleOpenNew = () => {
    setFormData({
      nome: "",
      descricao: "",
      preco: "",
      categoria: "hamburgueres",
      foto_url: "",
      disponivel: true
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (prod: ProdutoMenu) => {
    setFormData({
      nome: prod.nome,
      descricao: prod.descricao,
      preco: String(prod.preco),
      categoria: prod.categoria,
      foto_url: prod.foto_url || "",
      disponivel: prod.disponivel
    });
    setEditingId(prod.id);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.preco) return;

    const empresaId = currentCompany?.id || "default";
    const precoNum = Number(formData.preco);

    let updatedList: ProdutoMenu[];

    if (editingId) {
      // Edit mode
      updatedList = produtos.map(p => {
        if (p.id === editingId) {
          return {
            ...p,
            nome: formData.nome,
            descricao: formData.descricao,
            preco: precoNum,
            categoria: formData.categoria,
            foto_url: formData.foto_url || undefined,
            disponivel: formData.disponivel
          };
        }
        return p;
      });
    } else {
      // Add mode
      const newProd: ProdutoMenu = {
        id: `p-${Date.now()}`,
        empresa_id: empresaId,
        nome: formData.nome,
        descricao: formData.descricao,
        preco: precoNum,
        categoria: formData.categoria,
        foto_url: formData.foto_url || undefined,
        disponivel: formData.disponivel,
        ordem_exibicao: produtos.length + 1
      };
      updatedList = [...produtos, newProd];
    }

    setProdutos(updatedList);
    setIsFormOpen(false);

    // Sync upward to Supabase if connected
    if (currentCompany?.id && isSupabaseConfigured() && supabase) {
      try {
        const payload = updatedList.map(item => ({
          id: item.id,
          empresa_id: currentCompany.id,
          nome: item.nome,
          descricao: item.descricao,
          preco: item.preco,
          categoria: item.categoria,
          foto_url: item.foto_url || null,
          disponivel: item.disponivel,
          ordem_exibicao: item.ordem_exibicao
        }));
        await supabase.from("produtos_menu").upsert(payload);
      } catch (err) {
        console.error("Erro ao guardar produto no Supabase:", err);
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Tens a certeza que desejas remover este item do cardápio?")) return;

    const updatedList = produtos.filter(p => p.id !== id);
    setProdutos(updatedList);

    // Sync upward to Supabase if connected
    if (currentCompany?.id && isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from("produtos_menu")
          .delete()
          .eq("id", id)
          .eq("empresa_id", currentCompany.id);
      } catch (err) {
        console.error("Erro ao apagar produto no Supabase:", err);
      }
    }
  };

  // Reordering positional arrows
  const moveProduct = async (direction: "up" | "down", index: number) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === produtos.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...produtos];

    // Swap list elements
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Recalculate displays order sequence numbers
    const finalReordered = reordered.map((item, idx) => ({
      ...item,
      ordem_exibicao: idx + 1
    }));

    setProdutos(finalReordered);

    // Sync reordering sequence elements to Supabase
    if (currentCompany?.id && isSupabaseConfigured() && supabase) {
      try {
        const payload = finalReordered.map(item => ({
          id: item.id,
          empresa_id: currentCompany.id,
          nome: item.nome,
          descricao: item.descricao,
          preco: item.preco,
          categoria: item.categoria,
          foto_url: item.foto_url || null,
          disponivel: item.disponivel,
          ordem_exibicao: item.ordem_exibicao
        }));
        await supabase.from("produtos_menu").upsert(payload);
      } catch (err) {
        console.error("Erro ao sincronizar nova ordem no Supabase:", err);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicMenuUrl);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Olá! Espreita o nosso Cardápio Digital no BURGUERSPRIME e faz o teu pedido direto por aqui: ${publicMenuUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // =============================== RENDER MANAGER ===============================
  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION METRICS */}
      <div className="bg-[#F4EBD9] border-2 border-[#3D2817] p-5 rounded-sm shadow-[2px_2.5px_0_rgba(26,20,16,0.9)] text-[#3D2817]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl tracking-wide uppercase">📖 Caderno de Pedidos - Cardápio Digital</h2>
            <p className="text-xs font-mono text-[#3D2817]/70 mt-1">
              Gere produtos públicos, partilhe o teu link dedicado e receba os talões no teu WhatsApp automaticamente integrados com o CRM.
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveSubTab("lista")}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bebas font-bold tracking-wider uppercase border-2 border-black rounded-sm transition select-none ${
                activeSubTab === "lista"
                  ? "bg-[#3D2817] text-[#F4EBD9]"
                  : "bg-white text-black hover:bg-black/5"
              }`}
            >
              Configurar Cardápio
            </button>
            <button
              onClick={() => setActiveSubTab("preview_dono")}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bebas font-bold tracking-wider uppercase border-2 border-black rounded-sm transition select-none flex items-center justify-center gap-1.5 ${
                activeSubTab === "preview_dono"
                  ? "bg-[#3D2817] text-[#F4EBD9]"
                  : "bg-white text-black hover:bg-black/5"
              }`}
            >
              <Eye className="w-4 h-4" />
              Ver Como Cliente
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === "lista" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT INTERACTIVE CONTROLS COLUMN (SHARES & CONFIGS) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* LINK SHARING BANNER KRAFT CARD */}
            <div className="bg-[#ECE0D1] border-2 border-[#3D2817] rounded-sm p-4 text-[#3D2817] shadow-[2px_2.5px_0_rgba(26,20,16,0.9)] flex flex-col justify-between">
              <h3 className="font-bebas text-xl tracking-wider uppercase text-[#C44119] border-b border-[#3D2817]/25 pb-1">
                🔗 O teu Link de Vendas
              </h3>
              
              <div className="my-4 space-y-2">
                <p className="text-[10px] uppercase font-mono tracking-tight font-black text-[#3D2817]/60">Copie o link e coloque na sua Bio do Instagram:</p>
                <div className="p-2.5 bg-white border border-[#3D2817]/30 rounded-sm font-mono text-xs select-all text-[#3D2817] truncate max-w-full">
                  {publicMenuUrl}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center gap-2 bg-[#3D2817] hover:bg-[#1A1410] text-[#F4EBD9] py-2 px-3 text-xs font-bebas tracking-wider uppercase rounded-sm select-none"
                >
                  {copyFeedback ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Link Copiado com sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Link do Cardápio</span>
                    </>
                  )}
                </button>

                <button
                  onClick={shareOnWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 text-xs font-bebas tracking-wider uppercase rounded-sm select-none"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partilhar no WhatsApp</span>
                </button>

                <button
                  onClick={() => setShowQrCodeModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#C44119] hover:bg-[#9B3213] text-white py-2 px-3 text-xs font-bebas tracking-wider uppercase rounded-sm select-none"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gerar QR Code de Mesa</span>
                </button>
              </div>
            </div>

            {/* INTEGRATION SETTINGS */}
            <div className="bg-[#FAF5ED] border-2 border-[#3D2817] rounded-sm p-4 text-[#3D2817] shadow-[2px_2.5px_0_rgba(26,20,16,0.9)] space-y-4">
              <h3 className="font-bebas text-lg tracking-wider uppercase text-black border-b border-[#3D2817]/20 pb-1">
                ⚙️ Canal de Receção
              </h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-bold text-gray-500">
                  WhatsApp para receber Pedidos (Angola):
                </label>
                <div className="flex gap-2">
                  <div className="bg-gray-100 border border-gray-300 rounded-sm px-2.5 py-1.5 font-mono text-xs flex items-center select-none text-gray-500">
                    +244
                  </div>
                  <input
                    type="text"
                    value={businessWhatsApp}
                    onChange={(e) => saveWhatsappNumber(e.target.value)}
                    placeholder="Ex: 923000000"
                    className="flex-1 px-3 py-1.5 bg-white border border-[#3D2817]/40 rounded-sm font-mono text-xs text-[#3D2817] outline-none focus:border-[#C44119]"
                  />
                </div>
                <p className="text-[9px] text-[#3D2817]/65 mt-1 font-mono leading-relaxed">
                  Os clientes serão direcionados para este número de WhatsApp com a mensagem formatada e pronta para enviar.
                </p>
              </div>
            </div>

          </div>

          {/* MAIN PRODUCTS LIST & CONTROL */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#FAF5ED] border-2 border-[#3D2817] rounded-sm p-4 text-[#3D2817] shadow-[2px_2.5px_0_rgba(26,20,16,0.9)] space-y-4">
              
              <div className="flex justify-between items-center">
                <h3 className="font-bebas text-xl tracking-wider uppercase border-b border-dashed border-[#3D2817]/20 pb-1 flex items-center gap-1.5">
                  <Store className="w-5 h-5 text-[#C44119]" />
                  Grelha de Produtos Registados
                </h3>
                <button
                  onClick={handleOpenNew}
                  className="bg-[#C44119] hover:bg-[#A32E10] text-[#F4EBD9] py-1.5 px-3 rounded-sm font-bebas tracking-wide text-xs uppercase flex items-center gap-1 cursor-pointer select-none border-1 border-black shadow-[1px_1.5px_0_black]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Novo Item
                </button>
              </div>

              {produtos.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[#3D2817]/20 rounded-sm">
                  <p className="text-sm text-gray-500 italic">Nenhum produto cadastrado no teu cardápio. Clica em "Novo Item" para começar!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {produtos.map((p, idx) => (
                    <div 
                      key={p.id}
                      className={`p-3 border-2 border-black rounded-sm flex items-center justify-between transition-colors ${
                        p.disponivel ? "bg-white" : "bg-gray-100 opacity-70"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono tracking-tight uppercase px-1.5 py-0.5 rounded-sm text-white font-extrabold font-sans select-none ${
                            p.categoria === "hamburgueres" ? "bg-red-700" :
                            p.categoria === "acompanhamentos" ? "bg-amber-600" :
                            p.categoria === "bebidas" ? "bg-blue-600" : "bg-purple-600"
                          }`}>
                            {p.categoria === "hamburgueres" ? "🍔 burgers" :
                             p.categoria === "acompanhamentos" ? "🍟 batatas/lados" :
                             p.categoria === "bebidas" ? "🥤 bebidas" : "➕ extras"}
                          </span>

                          <span className="font-sans font-bold text-sm text-gray-900 truncate">
                            {p.nome}
                          </span>
                          {!p.disponivel && (
                            <span className="bg-red-100 text-red-800 text-[9px] px-1 rounded-sm border border-red-300 font-mono font-bold select-none">
                              INDISPONÍVEL
                            </span>
                          )}
                        </div>
                        {p.descricao && (
                          <p className="text-[11px] text-gray-500 line-clamp-1 italic">{p.descricao}</p>
                        )}
                        <p className="text-xs font-mono font-black text-[#C44119]">
                          {p.preco.toLocaleString("pt-PT")} Kz
                        </p>
                      </div>

                      {/* ACTIONS STRIP */}
                      <div className="flex items-center gap-1 shrink-0">
                        
                        {/* REORDER BUTTONS */}
                        <div className="flex flex-col gap-0.5 mr-1">
                          <button
                            onClick={() => moveProduct("up", idx)}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-sm disabled:opacity-30 disabled:pointer-events-none"
                            title="Mover para Cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveProduct("down", idx)}
                            disabled={idx === produtos.length - 1}
                            className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-sm disabled:opacity-30 disabled:pointer-events-none"
                            title="Mover para Baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* TOGGLE VISIBILITY */}
                        <button
                          onClick={async () => {
                            const updated = produtos.map((item, i) => i === idx ? { ...item, disponivel: !item.disponivel } : item);
                            setProdutos(updated);

                            if (currentCompany?.id && isSupabaseConfigured() && supabase) {
                              try {
                                await supabase.from("produtos_menu").upsert(updated.map(u => ({
                                  id: u.id,
                                  empresa_id: currentCompany.id,
                                  nome: u.nome,
                                  descricao: u.descricao,
                                  preco: u.preco,
                                  categoria: u.categoria,
                                  foto_url: u.foto_url || null,
                                  disponivel: u.disponivel,
                                  ordem_exibicao: u.ordem_exibicao
                                })));
                              } catch (e) {}
                            }
                          }}
                          className="p-2 text-gray-500 hover:text-black hover:bg-gray-150 rounded-sm bg-gray-50 border border-gray-200"
                          title={p.disponivel ? "Desativar Item temporariamente" : "Ativar Item"}
                        >
                          {p.disponivel ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                        </button>

                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-sm bg-blue-50/50"
                          title="Editar Ficha"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-sm bg-red-50/50"
                          title="Remover definitivamente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        /* OWNER LIVE PREVIEW EMBED SCREEN */
        <div className="bg-[#1A1410] rounded-sm p-1.5 md:p-6 border-5 border-black max-w-lg mx-auto relative shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setActiveSubTab("lista")}
              className="bg-black hover:bg-gray-900 border border-white text-[#F4EBD9] p-2 rounded-full font-black text-xs h-9 w-9 flex items-center justify-center cursor-pointer select-none shadow-md"
              title="Fechar Pré-visualização"
            >
              ✕
            </button>
          </div>
          
          <div className="text-[#F4EBD9] text-center font-mono py-2 bg-black text-[9px] tracking-tight border-b-2 border-dashed border-[#F4EBD9]/20 select-none opacity-80 mb-4">
            📡 MODO PREVIEW CLIENTE (100% OPERACIONAL)
          </div>

          <PublicMenuScreen 
            companySlug={getSlug()}
            companyName={config.businessName || "Kubicados Burger"}
            whatsappNumber={businessWhatsApp}
            definedProducts={produtos}
            clients={clients}
            metrics={metrics}
            currentCompany={currentCompany}
            onUpdateClients={onUpdateClients}
            onUpdateMetrics={onUpdateMetrics}
          />
        </div>
      )}

      {/* FORM DIALOG POPUP MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-slate flex items-center justify-center p-4">
          <div className="bg-[#F4EBD9] border-4 border-black p-5 rounded-sm shadow-[4px_6px_0_rgba(0,0,0,0.95)] max-w-md w-full relative animate-fade-in text-black">
            
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-3 right-3 text-black font-black text-sm hover:text-red-700 bg-white/50 border border-black h-8 w-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-bebas text-xl uppercase tracking-wider text-[#C44119] border-b-2 border-black pb-1.5 mb-4">
              {editingId ? "📝 Editar Produto" : "🍔 Carregar Novo Produto"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#3D2817]">Nome do Produto:</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Smash Duplo com Queijo"
                  className="w-full px-3 py-1.5 bg-white border-2 border-black rounded-sm font-sans text-xs text-black outline-none focus:border-[#C44119]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#3D2817]">Descrição / Ingredientes:</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Duas carnes smash de 120g, queijo cheddar, molho da casa"
                  rows={2}
                  className="w-full px-3 py-1.5 bg-white border-2 border-black rounded-sm font-sans text-xs text-black outline-none focus:border-[#C44119]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#3D2817]">Preço (Kz):</label>
                  <input
                    type="number"
                    required
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    placeholder="Ex: 4500"
                    className="w-full px-3 py-1.5 bg-white border-2 border-black rounded-sm font-mono text-xs text-black outline-none focus:border-[#C44119]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#3D2817]">Categoria:</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as ProdutoMenu["categoria"] })}
                    className="w-full px-2.5 py-1.5 bg-white border-2 border-black rounded-sm font-sans text-xs text-black outline-none focus:border-[#C44119]"
                  >
                    <option value="hamburgueres">Hamburgueres</option>
                    <option value="acompanhamentos">Acompanhamentos</option>
                    <option value="bebidas">Bebidas</option>
                    <option value="extras">Extras</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#3D2817]">Link da Foto (Opcional):</label>
                <input
                  type="text"
                  value={formData.foto_url}
                  onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                  placeholder="Ex: https://images.unsplash.com/photo-example..."
                  className="w-full px-3 py-1.5 bg-white border-2 border-black rounded-sm font-mono text-[10px] text-black outline-none focus:border-[#C44119]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 pb-1">
                <input
                  type="checkbox"
                  id="form-disponivel"
                  checked={formData.disponivel}
                  onChange={(e) => setFormData({ ...formData, disponivel: e.target.checked })}
                  className="w-4 h-4 text-[#C44119] border-2 border-black rounded-sm accent-[#C44119]"
                />
                <label htmlFor="form-disponivel" className="text-xs font-mono font-bold select-none cursor-pointer">
                  Disponível para encomendas
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#3D2817] hover:bg-black text-[#F4EBD9] py-2 px-4 rounded-sm font-bebas tracking-wide text-sm uppercase cursor-pointer transition select-none shadow-[2px_2.5px_0_black] border-2 border-black"
                >
                  {editingId ? "Actualizar Produto" : "Ativar no Meu Cardápio"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QR CODE GENERATOR POPUP MODAL */}
      {showQrCodeModal && (
        <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-6 rounded-sm shadow-[4px_6px_0_rgba(0,0,0,0.95)] max-w-sm w-full text-center relative text-black select-none">
            
            <button
              onClick={() => setShowQrCodeModal(false)}
              className="absolute top-2.5 right-2.5 text-black font-black text-sm hover:text-red-700 border border-black h-8 w-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-bebas text-xl uppercase tracking-wider text-[#C44119] border-b-2 border-black pb-1.5 mb-4">
              🍔 QR CODE DE MESA
            </h3>

            <p className="text-xs text-gray-500 font-sans leading-relaxed mb-4">
              Imprima este código QR e cole-o nas suas mesas. Os clientes só precisam de ler o código com o telemóvel para acederem instantaneamente ao teu menu!
            </p>

            {/* HIGH FIDELITY EMBEDDED SVG REPRESENTATION OF QR CODE */}
            <div className="p-3 bg-gray-50 border-2 border-black rounded-sm max-w-xs mx-auto mb-4 flex flex-col items-center justify-center">
              <svg className="w-40 h-40" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                <path d="M40,0 h10 v10 h-10 z M50,15 h10 v10 h-10 z M40,25 h15 v5 h-15 z M45,40 h10 v10 h-10 z" />
                <path d="M0,45 h10 v15 h-10 z M15,40 h15 v10 h-15 z M15,55 h10 v10 h-10 z M80,45 h20 v10 h-20 z" />
                <path d="M55,60 h10 v10 h-10 z M40,75 h15 v10 h-15 z M50,90 h15 v10 h-15 z L75,80 h10 v10 h-10 z" />
                <path d="M70,40 h5 v5 h-5 z M90,55 h10 v15 h-10 z M85,75 h15 v10 h-15 z M75,90 h20 v10 h-20 z" />
                <path d="M35,65 h5 v5 h-5 z M55,45 h15 v10 h-15 z M60,35 h5 v5 h-5 z M45,55 h10 v5 h-10 z" />
              </svg>
              <div className="font-mono text-[9px] text-[#C44119] font-black mt-2 uppercase">
                ★ ESCANEIA PARA PEDIR ★
              </div>
            </div>

            <div className="py-1 bg-[#F4EBD9] border border-[#3D2817]/40 rounded-sm font-mono text-[10px] text-gray-700 truncate select-all px-2.5 mb-4">
              {publicMenuUrl}
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-[#3D2817] text-white py-1.5 rounded-sm font-bebas uppercase tracking-wider text-xs select-none"
            >
              🖨️ Imprimir QR Code
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ========================================== PUBLIC USER MENU VIEW INTERFACE ==========================================
interface PublicMenuProps {
  companySlug: string;
  companyName: string;
  whatsappNumber: string;
  definedProducts?: ProdutoMenu[];
  clients: ClientProfile[];
  metrics: FinancialMetrics;
  currentCompany: Empresa | null;
  onUpdateClients: (newClients: ClientProfile[]) => void;
  onUpdateMetrics: (newMetrics: FinancialMetrics) => void;
}

export function PublicMenuScreen({
  companySlug,
  companyName,
  whatsappNumber,
  definedProducts = [],
  clients,
  metrics,
  currentCompany,
  onUpdateClients,
  onUpdateMetrics
}: PublicMenuProps) {

  // Load menu items with fallbacks
  const [items] = useState<ProdutoMenu[]>(() => {
    if (definedProducts.length > 0) {
      return definedProducts.filter(p => p.disponivel);
    }
    // Deep fallback
    return [];
  });

  // Category listing resolver
  const categories = ["hamburgueres", "acompanhamentos", "bebidas", "extras"] as const;
  const loadedCategories = categories.filter(cat => items.some(p => p.categoria === cat && p.disponivel));

  // Shopping Cart state
  interface CartItem {
    produto: ProdutoMenu;
    quantidade: number;
    tirar_ingredientes: string[];
    adicionar_extras: string[];
    observacao: string;
    preco_unitario_final: number;
  }
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Active configuration item for modal customizations
  const [customizingItem, setCustomizingItem] = useState<ProdutoMenu | null>(null);
  const [customizeQty, setCustomizeQty] = useState(1);
  const [tempTirar, setTempTirar] = useState<string[]>([]);
  const [tempExtras, setTempExtras] = useState<string[]>([]);
  const [tempObs, setTempObs] = useState("");

  const extrasConfig = [
    { name: "Queijo extra", price: 1000 },
    { name: "Bacon extra", price: 1500 },
    { name: "Ovo", price: 500 }
  ];

  const ingredientesRemoviveis = ["Sem cebola", "Sem alface", "Sem tomate", "Sem picles"];

  // Floating Cart badge parameters
  const totalCartItems = cart.reduce((sum, i) => sum + i.quantidade, 0);
  const totalCartValue = cart.reduce((sum, item) => {
    // base + extras value
    return sum + (item.preco_unitario_final * item.quantidade);
  }, 0);

  // Checkout states screen
  const [checkoutStep, setCheckoutStep] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    nome: "",
    whatsapp: "",
    metodo_entrega: "balcao" as "local" | "balcao" | "casa",
    endereco_entrega: "",
    metodo_pagamento: "dinheiro" as "dinheiro" | "transferencia" | "multicaixa"
  });

  // Handle adding customized item up into main cart list
  const handleOpenCustomizer = (prod: ProdutoMenu) => {
    setCustomizingItem(prod);
    setCustomizeQty(1);
    setTempTirar([]);
    setTempExtras([]);
    setTempObs("");
  };

  const handleAddWithCustomization = () => {
    if (!customizingItem) return;

    // Calculate item pricing dynamically with selected extras
    let finalUnitPreco = customizingItem.preco;
    tempExtras.forEach(eName => {
      const configExt = extrasConfig.find(ec => ec.name === eName);
      if (configExt) finalUnitPreco += configExt.price;
    });

    const newItem: CartItem = {
      produto: customizingItem,
      quantidade: customizeQty,
      tirar_ingredientes: tempTirar,
      adicionar_extras: tempExtras,
      observacao: tempObs,
      preco_unitario_final: finalUnitPreco
    };

    setCart([...cart, newItem]);
    setCustomizingItem(null);
  };

  const removeItem = (idx: number) => {
    setCart(cart.filter((_, i) => i !== idx));
  };

  // FINAL ORDER DISMISSAL & INTEGRATION PIPELINE (PART 5 & PART 6)
  const handleTriggerSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutData.nome.trim() || !checkoutData.whatsapp.trim()) {
      alert("Por favor, preenche o teu Nome e WhatsApp!");
      return;
    }

    if (checkoutData.metodo_entrega === "casa" && !checkoutData.endereco_entrega.trim()) {
      alert("Por favor, preenche o teu Endereço de Entrega!");
      return;
    }

    // Step 1: Format message body exactly as requested
    let messageText = `🍔 NOVO PEDIDO — ${companyName}\n\n`;
    messageText += `Cliente: ${checkoutData.nome}\n`;
    messageText += `WhatsApp: ${checkoutData.whatsapp}\n\n`;
    messageText += `PEDIDO:\n`;

    cart.forEach(item => {
      let customString = "";
      const details: string[] = [];
      if (item.tirar_ingredientes.length > 0) {
        details.push(...item.tirar_ingredientes.map(i => i.toLowerCase()));
      }
      if (item.adicionar_extras.length > 0) {
        details.push(...item.adicionar_extras.map(e => `${e.toLowerCase()} extra`));
      }
      if (item.observacao.trim()) {
        details.push(`obs: ${item.observacao}`);
      }

      if (details.length > 0) {
        customString = ` (${details.join(", ")})`;
      }

      messageText += `- ${item.quantidade}x ${item.produto.nome}${customString}\n`;
    });

    const deliveryLabel = 
      checkoutData.metodo_entrega === "local" ? "Comer no local" :
      checkoutData.metodo_entrega === "balcao" ? "Levantar no balcão" : "Entrega em casa";

    messageText += `\nForma de receber: ${deliveryLabel}\n`;
    if (checkoutData.metodo_entrega === "casa") {
      messageText += `Endereço: ${checkoutData.endereco_entrega}\n`;
    }

    const payLabel = 
      checkoutData.metodo_pagamento === "dinheiro" ? "Dinheiro" :
      checkoutData.metodo_pagamento === "transferencia" ? "Transferência" : "Multicaixa Express";

    messageText += `Pagamento: ${payLabel}\n\n`;
    messageText += `Total estimado: ${totalCartValue.toLocaleString("pt-PT")} Kz`;

    // Step 2: Trigger CRM synchronization pipeline logic (PART 6)
    const normalizedPhone = checkoutData.whatsapp.replace(/\D/g, "");
    const updatedClients = [...clients];
    let clientFound = updatedClients.find(c => c.phone.replace(/\D/g, "") === normalizedPhone);

    const targetEmpresaId = currentCompany?.id || "8174548c-beef-43ca-a3ba-6f4e894eda47";
    let clientId = clientFound?.id || `client-${Date.now()}`;

    if (!clientFound) {
      // Create new customer registry entry
      const newClientEntry: ClientProfile = {
        id: clientId,
        name: checkoutData.nome,
        phone: checkoutData.whatsapp,
        channel: "Cardápio Digital",
        favoriteBurger: cart[0]?.produto.nome || "Não especificado",
        dietaryRestrictions: "Nenhuma",
        visitFrequency: 1.0,
        totalSpent: totalCartValue,
        lastVisitDaysAgo: 0,
        ratingsCount: 0,
        averageRating: 5.0,
        orderHistoryCount: 1,
        isChurnRisk: false
      };
      updatedClients.push(newClientEntry);

      // Sync upward to Supabase if connected
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from("clientes").insert({
            id: newClientEntry.id,
            empresa_id: targetEmpresaId,
            name: newClientEntry.name,
            phone: newClientEntry.phone,
            channel: newClientEntry.channel,
            favorite_burger: newClientEntry.favoriteBurger,
            dietary_restrictions: newClientEntry.dietaryRestrictions,
            visit_frequency: newClientEntry.visitFrequency,
            total_spent: newClientEntry.totalSpent,
            last_visit_days_ago: 0,
            ratings_count: 0,
            average_rating: 5.0,
            order_history_count: 1,
            is_churn_risk: false
          });
        } catch (e) {
          console.error("Erro ao sincronizar novo cliente:", e);
        }
      }
    } else {
      // Customer exists, update analytics totals
      clientFound.orderHistoryCount += 1;
      clientFound.totalSpent += totalCartValue;
      clientFound.visitFrequency = Number((clientFound.visitFrequency + 0.5).toFixed(1));
      clientFound.lastVisitDaysAgo = 0;
      clientId = clientFound.id;

      // Sync upward update
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from("clientes").update({
            order_history_count: clientFound.orderHistoryCount,
            total_spent: clientFound.totalSpent,
            visit_frequency: clientFound.visitFrequency,
            last_visit_days_ago: 0
          }).eq("id", clientFound.id);
        } catch (e) {
          console.error("Erro ao atualizar dados do cliente existente:", e);
        }
      }
    }

    onUpdateClients(updatedClients);

    // Save actual order details (Part 6.4)
    const newOrder: PedidoCardapio = {
      id: `order-${Date.now()}`,
      empresa_id: targetEmpresaId,
      cliente_id: clientId,
      cliente_nome: checkoutData.nome,
      cliente_whatsapp: checkoutData.whatsapp,
      itens: cart.map(item => ({
        produto_nome: item.produto.nome,
        preco: item.produto.preco,
        quantidade: item.quantidade,
        tirar_ingredientes: item.tirar_ingredientes,
        adicionar_extras: item.adicionar_extras,
        preco_total_item: item.preco_unitario_final * item.quantidade,
        observacao: item.observacao || undefined
      })),
      metodo_entrega: checkoutData.metodo_entrega,
      endereco_entrega: checkoutData.endereco_entrega || undefined,
      metodo_pagamento: checkoutData.metodo_pagamento,
      valor_total: totalCartValue,
      data_criacao: new Date().toISOString()
    };

    // Store in Supabase if online
    if (isSupabaseConfigured()) {
      await savePedidoCardapio(newOrder);
    }

    // Step 3: Update overall metrics (Part 6.5)
    const updatedMetrics: FinancialMetrics = {
      ...metrics,
      currentSalesCount: metrics.currentSalesCount + 1,
      totalSalesRevenue: metrics.totalSalesRevenue + totalCartValue,
      newClientsCount: clientFound ? metrics.newClientsCount : metrics.newClientsCount + 1
    };

    onUpdateMetrics(updatedMetrics);

    // Write to DB
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("metrics").upsert({
          empresa_id: targetEmpresaId,
          current_sales_count: updatedMetrics.currentSalesCount,
          total_sales_revenue: updatedMetrics.totalSalesRevenue,
          new_clients_count: updatedMetrics.newClientsCount,
          marketing_investment: updatedMetrics.marketingInvestment,
          marketing_revenue: updatedMetrics.marketingRevenue,
          fixed_costs: updatedMetrics.fixedCosts,
          variable_cost_ratio: updatedMetrics.variableCostRatio,
          current_day_of_month: updatedMetrics.currentDayOfMonth,
          supplier_price_increase_percent: updatedMetrics.supplierPriceIncreasePercent,
          ultima_atualizacao: new Date().toISOString()
        });
      } catch (e) {}
    }

    // Reset shopping session locally
    setCart([]);
    setIsCartOpen(false);
    setCheckoutStep(false);

    // Step 4: Redirection toward WhatsApp wa.me api endpoint
    const finalWaText = encodeURIComponent(messageText);
    const targetWaNumber = whatsappNumber ? whatsappNumber.replace(/\D/g, "") : "923000000";
    window.open(`https://wa.me/${targetWaNumber}?text=${finalWaText}`, "_blank");
  };

  // =============================== PUBLIC SCREEN DESIGN ===============================
  return (
    <div className="bg-[#131110] text-[#F4EBD9] font-sans min-h-screen pb-24 md:pb-32 leading-normal">
      
      {/* BRAND COVER STRIP */}
      <div className="w-full h-32 md:h-44 bg-[#C44119] flex items-center justify-center relative select-none">
        
        {/* Abstract background graphics representing hot grease grid */}
        <div className="absolute inset-0 opacity-15 overflow-hidden flex flex-wrap gap-1 leading-none select-none text-[8px] font-mono pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i}>BURGUERSPRIME GRILLE HEAVY CARVÃO CHARCOAL GRILLE OK CHAPA HOT </span>
          ))}
        </div>

        <div className="relative z-10 text-center px-4">
          <div className="h-10 w-10 md:h-12 md:w-12 bg-black rounded-full border-2 border-white mx-auto flex items-center justify-center font-display font-black text-white text-base md:text-xl tracking-tighter mb-1.5 shadow-md">
            BP
          </div>
          <h1 className="font-bebas text-2xl md:text-3xl uppercase tracking-widest text-[#F4EBD9] leading-none drop-shadow-md">
            {companyName}
          </h1>
          <p className="text-[10px] md:text-xs font-mono text-[#F4EBD9]/85 uppercase tracking-wide mt-1 select-none">
            ♨️ CARDÁPIO DIGITAL DE ENCOMENDAS ♨️
          </p>
        </div>
      </div>

      {/* BODY MENU LISTS */}
      <div className="max-w-md mx-auto px-4.5 py-6 space-y-8">
        
        {/* EMPTY MENU FALLBACK ALERT */}
        {items.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-[#F4EBD9]/20 rounded-sm">
            <h4 className="font-bebas text-lg text-[#E8A33D] uppercase">Cardápio em Manutenção</h4>
            <p className="text-xs text-gray-400 mt-2">Visita-nos mais tarde para veres as novidades da chapa.</p>
          </div>
        )}

        {loadedCategories.map(cat => (
          <section key={cat} className="space-y-4">
            
            <h2 className="font-bebas text-2xl tracking-wider text-[#E8A33D] border-b-2 border-dashed border-[#F4EBD9]/20 pb-1 uppercase flex items-center gap-2">
              {cat === "hamburgueres" ? "🍔 Hambúrgueres" :
               cat === "acompanhamentos" ? "🍟 Acompanhamentos" :
               cat === "bebidas" ? "🥤 Bebidas" : "➕ Extras adicionais"}
            </h2>

            <div className="space-y-4.5">
              {items
                .filter(p => p.categoria === cat && p.disponivel)
                .map(prod => (
                  /* PAPEL KRAFT MENU CARD */
                  <div 
                    key={prod.id}
                    className="bg-[#ECE0D1] border-2 border-[#3D2817] p-3 text-[#3D2817] rounded-sm relative shadow-[2px_2px_0_rgba(255,255,255,0.1)] flex select-none"
                  >
                    <div className="flex-1 pr-2">
                      <h3 className="font-sans font-black text-sm md:text-base leading-snug border-b border-[#3D2817]/10 pb-0.5">
                        {prod.nome}
                      </h3>
                      {prod.descricao && (
                        <p className="text-[11px] md:text-xs text-gray-700 font-sans mt-1.5 leading-relaxed tracking-tight">
                          {prod.descricao}
                        </p>
                      )}
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-xs md:text-sm font-black text-[#C44119]">
                          {prod.preco.toLocaleString("pt-PT")} Kz
                        </span>
                        
                        <button
                          onClick={() => handleOpenCustomizer(prod)}
                          title="Adicionar ao sacola"
                          className="px-3 py-1 font-bebas text-xs uppercase bg-[#3D2817] hover:bg-[#1A1410] text-[#F4EBD9] rounded-sm font-black border border-black flex items-center gap-1 cursor-pointer select-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Pedir
                        </button>
                      </div>
                    </div>

                    {prod.foto_url && (
                      <div className="w-20 h-20 md:w-24 md:h-24 ml-2.5 rounded-sm overflow-hidden border border-[#3D2817]/40 bg-gray-200 shrink-0 select-none pointer-events-none">
                        <img 
                          src={prod.foto_url} 
                          alt={prod.nome} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Hide image in case of broken link
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
            </div>

          </section>
        ))}

      </div>

      {/* FLOATING CART SUMMARY BUTTON BAR (Persistent bottom) */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#E8A33D] hover:bg-[#EEB660] text-[#131110] h-12 py-2 px-4 border-2 border-black rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-between font-bebas text-base uppercase tracking-wider font-extrabold cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <div className="relative bg-black text-[#E8A33D] h-7 w-7 rounded-sm flex items-center justify-center font-mono font-black text-xs shrink-0 select-none">
                {totalCartItems}
              </div>
              <span>Meu Pedido</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tracking-tighter">
                {totalCartValue.toLocaleString("pt-PT")} Kz
              </span>
              <ShoppingCart className="w-5 h-5 ml-1 animate-bounce" />
            </div>
          </button>
        </div>
      )}

      {/* CUSTOMIZATION DIALOG SHEETS MODAL (PART 3) */}
      {customizingItem && (
        <div className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-slate flex items-center justify-center p-4">
          <div className="bg-[#ECE0D1] border-3 border-[#3D2817] p-5 rounded-sm max-w-sm w-full text-[#3D2817] relative animate-fade-in select-none">
            
            <button
              onClick={() => setCustomizingItem(null)}
              className="absolute top-2 right-2 border-2 border-[#3D2817] bg-white h-7 w-7 rounded-full flex items-center justify-center text-sm font-black cursor-pointer"
            >
              ✕
            </button>

            <h3 className="font-bebas text-xl text-[#C44119] border-b border-[#3D2817]/25 pb-1 uppercase">
              {customizingItem.nome}
            </h3>
            
            {customizingItem.descricao && (
              <p className="text-[11px] text-gray-700 italic mt-1 font-sans leading-relaxed">
                {customizingItem.descricao}
              </p>
            )}

            {/* QUANTITY PICKER ROW */}
            <div className="mt-4 flex items-center justify-between bg-white/50 border border-[#3D2817]/30 p-2 rounded-sm mb-4">
              <span className="text-xs font-sans font-bold uppercase text-gray-700">Desejas Quantos?</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => customizeQty > 1 && setCustomizeQty(customizeQty - 1)}
                  className="h-7 w-7 bg-white hover:bg-gray-100 border border-black rounded-sm flex items-center justify-center font-bold text-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-sm font-black w-4 text-center">{customizeQty}</span>
                <button
                  type="button"
                  onClick={() => setCustomizeQty(customizeQty + 1)}
                  className="h-7 w-7 bg-white hover:bg-gray-100 border border-black rounded-sm flex items-center justify-center font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ING REMOVE (Only relevant for burgers) */}
            {customizingItem.categoria === "hamburgueres" && (
              <div className="space-y-2 mb-4">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-500">
                  Tirar algum ingrediente? (Opcional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {ingredientesRemoviveis.map(ing => {
                    const selected = tempTirar.includes(ing);
                    return (
                      <button
                        type="button"
                        key={ing}
                        onClick={() => {
                          if (selected) {
                            setTempTirar(tempTirar.filter(t => t !== ing));
                          } else {
                            setTempTirar([...tempTirar, ing]);
                          }
                        }}
                        className={`text-left p-1.5 rounded-sm border text-[10.5px] font-sans font-bold flex items-center gap-1.5 transition select-none ${
                          selected 
                            ? "bg-red-700 text-[#F4EBD9] border-black" 
                            : "bg-white text-gray-700 border-gray-350 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`h-3 w-3 border flex items-center justify-center shrink-0 text-[8px] font-black rounded-xs ${
                          selected ? "bg-white text-red-700 border-white" : "bg-white text-transparent border-gray-400"
                        }`}>
                          ✓
                        </div>
                        {ing}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EXTRAS CHASSIS */}
            <div className="space-y-2 mb-4">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-500">
                Adicionar Extras? (Opcional)
              </span>
              <div className="space-y-1.5">
                {extrasConfig.map(ext => {
                  const selected = tempExtras.includes(ext.name);
                  return (
                    <button
                      type="button"
                      key={ext.name}
                      onClick={() => {
                        if (selected) {
                          setTempExtras(tempExtras.filter(e => e !== ext.name));
                        } else {
                          setTempExtras([...tempExtras, ext.name]);
                        }
                      }}
                      className={`w-full text-left p-2 rounded-sm border text-xs font-sans font-bold flex items-center justify-between transition select-none ${
                        selected 
                          ? "bg-[#3D2817] text-[#F4EBD9] border-black" 
                          : "bg-white text-gray-700 border-gray-350 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`h-3.5 w-3.5 border flex items-center justify-center shrink-0 text-[9px] font-black rounded-xs ${
                          selected ? "bg-white text-[#3D2817] border-white" : "bg-white text-transparent border-gray-400"
                        }`}>
                          ✓
                        </div>
                        <span>{ext.name}</span>
                      </div>
                      <span className="font-mono text-[10.5px] text-[#C44119] font-black">
                        +{ext.price.toLocaleString("pt-PT")} Kz
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SPECIAL OBSERVATIONS */}
            <div className="space-y-1.5 mb-5">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-500">
                Alguma observação extra?
              </span>
              <input
                type="text"
                value={tempObs}
                onChange={(e) => setTempObs(e.target.value)}
                placeholder="Ex: Pão bem tostado, mal passado..."
                className="w-full px-2.5 py-1.5 bg-white border border-[#3D2817]/40 rounded-sm font-sans text-xs text-black outline-none"
              />
            </div>

            {/* ACTION DIRECT BUTTON */}
            <button
              onClick={handleAddWithCustomization}
              className="w-full bg-[#C44119] hover:bg-[#9E2F11] text-white py-2.5 rounded-sm font-bebas text-sm uppercase tracking-wider font-extrabold transition select-none border-2 border-black shadow-[2px_2.5px_0_black]"
            >
              Adicionar ao Pedido ✓
            </button>

          </div>
        </div>
      )}

      {/* SHOPPING BAG SHEET DIALOG */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[150] bg-black/90 flex flex-col justify-end">
          <div className="bg-[#FAF5ED] text-[#131110] max-w-md w-full mx-auto rounded-t-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border-t-3 border-black select-none">
            
            {/* Sheet header */}
            <div className="bg-black text-[#E8A33D] px-4 py-3 flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-5 h-5 text-[#E8A33D]" />
                <span className="font-bebas text-lg tracking-wider uppercase">Minha Sacola</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-[#F4EBD9] hover:text-[#E8A33D] font-bold text-xs border border-[#F4EBD9]/20 px-2 py-0.5 rounded-sm h-7"
              >
                Fechar ×
              </button>
            </div>

            {/* Cart body content details */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              
              {!checkoutStep ? (
                <>
                  <div className="border-b border-[#3D2817]/10 pb-2 flex justify-between uppercase font-mono text-[10px] text-gray-500 font-bold select-none">
                    <span>Lista de Itens Escolhidos</span>
                    <span>{totalCartItems}un</span>
                  </div>

                  <div className="space-y-3">
                    {cart.map((item, idx) => (
                      <div 
                        key={idx}
                        className="bg-[#ECE0D1] border-2 border-dashed border-[#131110]/20 rounded-sm p-3 flex justify-between items-start text-[#3D2817]"
                      >
                        <div className="space-y-1 flex-1 min-w-0 pr-3">
                          <h4 className="font-sans font-black text-sm">
                            {item.quantidade}x {item.produto.nome}
                          </h4>
                          
                          {/* Item Custom traits strings */}
                          {(item.tirar_ingredientes.length > 0 || item.adicionar_extras.length > 0 || item.observacao) && (
                            <div className="text-[11px] text-gray-600 space-y-0.5 font-sans">
                              {item.tirar_ingredientes.map(i => <div key={i}>❌ {i}</div>)}
                              {item.adicionar_extras.map(e => <div key={e}>⭐️ {e} (+extra)</div>)}
                              {item.observacao.trim() && <div className="italic text-gray-700">✍️ "{item.observacao}"</div>}
                            </div>
                          )}

                          <p className="font-mono text-xs font-bold text-[#C44119]">
                             {(item.preco_unitario_final * item.quantidade).toLocaleString("pt-PT")} Kz
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(idx)}
                          className="text-red-700 hover:bg-red-100 p-1.5 rounded-xs mt-1 border border-transparent hover:border-red-300"
                          title="Remover Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary aggregate details */}
                  <div className="pt-3 border-t-2 border-dashed border-[#3D2817]/25 space-y-2 select-none">
                    <div className="flex justify-between items-center text-sm font-sans font-bold text-gray-700">
                      <span>Subtotal dos Produtos</span>
                      <span className="font-mono">{totalCartValue.toLocaleString("pt-PT")} Kz</span>
                    </div>
                    <p className="text-[9px] text-gray-500 font-mono leading-relaxed select-none">
                      ★ A taxa de entrega será confirmada na entrega se escolheres a opção de receber em casa.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setCheckoutStep(true)}
                      className="w-full bg-[#3D2817] hover:bg-black text-[#F4EBD9] py-3 rounded-sm font-bebas text-sm uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 border-2 border-black"
                    >
                      <span>Preencher Dados e Receber</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                /* CHECKOUT AND SUBMISSION FORMS (PART 4) */
                <form onSubmit={handleTriggerSendOrder} className="space-y-4">
                  
                  <div className="bg-[#ECE0D1] border border-[#131110]/10 p-2.5 rounded-sm flex items-center justify-between text-xs font-bold select-none">
                    <span className="text-[#3D2817]">TOTAL A PAGAR:</span>
                    <span className="font-mono text-[#C44119] text-sm font-black">{totalCartValue.toLocaleString("pt-PT")} Kz</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    
                    <div className="space-y-0.5">
                      <label className="text-[10px] uppercase font-mono font-bold text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        O teu Nome:
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutData.nome}
                        onChange={(e) => setCheckoutData({ ...checkoutData, nome: e.target.value })}
                        placeholder="Ex: Gelson Santos"
                        className="w-full px-3 py-1.5 bg-white border border-[#3D2817]/40 rounded-sm font-sans text-xs text-black outline-none focus:border-[#C44119]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] uppercase font-mono font-bold text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        O teu número de WhatsApp:
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutData.whatsapp}
                        onChange={(e) => setCheckoutData({ ...checkoutData, whatsapp: e.target.value })}
                        placeholder="Ex: 923123456"
                        className="w-full px-3 py-1.5 bg-white border border-[#3D2817]/40 rounded-sm font-sans text-xs text-black outline-none focus:border-[#C44119]"
                      />
                    </div>
                  </div>

                  {/* HOW TO RECEIVE SELECTOR GRID */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-500">
                      Como queres receber o pedido?
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "balcao", label: "Levantar Balcão" },
                        { id: "casa", label: "Entrega em Casa" },
                        { id: "local", label: "Comer no Local" }
                      ].map(type => {
                        const active = checkoutData.metodo_entrega === type.id;
                        return (
                          <button
                            type="button"
                            key={type.id}
                            onClick={() => setCheckoutData({ ...checkoutData, metodo_entrega: type.id as any })}
                            className={`py-2 px-1 text-center font-sans font-bold rounded-sm border text-[10px] flex flex-col items-center justify-center gap-1 select-none transition ${
                              active 
                                ? "bg-[#3D2817] text-[#F4EBD9] border-black font-black" 
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CONDITIONAL DELIVERY ADDDDRES ENTRY */}
                  {checkoutData.metodo_entrega === "casa" && (
                    <div className="space-y-0.5 animate-slide-up">
                      <label className="text-[10px] uppercase font-mono font-bold text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Endereço de entrega completo:
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutData.endereco_entrega}
                        onChange={(e) => setCheckoutData({ ...checkoutData, endereco_entrega: e.target.value })}
                        placeholder="Ex: Bairro Alvalade, Rua Frederico Welwitsch, Prédio 12, 1B"
                        className="w-full px-3 py-1.5 bg-white border border-[#3D2817]/40 rounded-sm font-sans text-xs text-black outline-none focus:border-[#C44119]"
                      />
                    </div>
                  )}

                  {/* HOW WILL YOU PAY RADIOS */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-gray-500">
                      Como vais fazer o pagamento?
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "dinheiro", label: "💵 Dinheiro" },
                        { id: "transferencia", label: "🏦 Transf." },
                        { id: "multicaixa", label: "📱 Multicaixa" }
                      ].map(type => {
                        const active = checkoutData.metodo_pagamento === type.id;
                        return (
                          <button
                            type="button"
                            key={type.id}
                            onClick={() => setCheckoutData({ ...checkoutData, metodo_pagamento: type.id as any })}
                            className={`py-2 px-1 text-center font-sans text-[10px] font-bold rounded-sm border flex items-center justify-center select-none transition ${
                              active 
                                ? "bg-[#3D2817] text-[#F4EBD9] border-black font-black" 
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BACK CHASSIS STRIPS */}
                  <div className="flex gap-2.5 pt-3 border-t border-[#3D2817]/10">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(false)}
                      className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans font-bold text-xs rounded-sm border border-gray-300 select-none"
                    >
                      Voltar
                    </button>
                    
                    {/* ACCENT SUBMISSION REDIRECT TRIGGER CTA */}
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-2 border-black text-white h-11 py-1 px-4 rounded-sm font-bebas uppercase tracking-wide text-xs flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    >
                      <MessageSquare className="w-5.2 h-5.2 shrink-0 animate-pulse text-emerald-100" />
                      <span>Enviar Pedido pelo WhatsApp</span>
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
