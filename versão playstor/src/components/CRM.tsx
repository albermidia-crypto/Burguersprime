import React, { useState, useEffect } from "react";
import { SetupConfig, ClientProfile, PipelineStage, CommunicationScript } from "../types";
import { INITIAL_COMMUNICATION_SCRIPTS } from "../data";
import QRScanner from "./QRScanner";
import { InvoiceGeneratorModal, InvoiceData } from "./InvoiceGenerator";
import { 
  Users, CheckCircle, MessageSquare, Copy, Star, 
  Trash2, ChevronRight, ChevronLeft, ArrowRight, UserPlus, Filter, Sparkles,
  QrCode, Camera, Scan, RefreshCw
} from "lucide-react";

interface CRMProps {
  config: SetupConfig;
  clients: ClientProfile[];
  onAddClient: (newClient: ClientProfile) => void;
  onUpdateClientStage: (clientId: string, newStage: PipelineStage) => void;
  onDeleteClient: (clientId: string) => void;
  onRegisterQrOrder?: (order: { name: string; phone: string; burger: string; value: number }) => void;
  initialCrmSubTab?: "pipeline" | "scripts" | "qr-reader";
  initialSearchQuery?: string;
  initialSelectedClientId?: string;
}

function MockQrCodeSvg({ text }: { text: string }) {
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = hashString(text || "burguersprime");
  const bits: boolean[] = [];
  for (let i = 0; i < 144; i++) {
    const pseudoRandom = Math.sin(seed + i) * 10000;
    bits.push((pseudoRandom - Math.floor(pseudoRandom)) > 0.45);
  }

  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28 bg-white p-1.5 border-2 border-slate-900 rounded-lg shadow-sm mx-auto">
      <rect x="0" y="0" width="25" height="25" fill="#0f172a" />
      <rect x="5" y="5" width="15" height="15" fill="#ffffff" />
      <rect x="9" y="9" width="7" height="7" fill="#0f172a" />

      <rect x="75" y="0" width="25" height="25" fill="#0f172a" />
      <rect x="80" y="5" width="15" height="15" fill="#ffffff" />
      <rect x="84" y="9" width="7" height="7" fill="#0f172a" />

      <rect x="0" y="75" width="25" height="25" fill="#0f172a" />
      <rect x="5" y="80" width="15" height="15" fill="#ffffff" />
      <rect x="9" y="84" width="7" height="7" fill="#0f172a" />

      <rect x="75" y="75" width="8" height="8" fill="#0f172a" />

      {Array.from({ length: 12 }).map((_, r) => {
        return Array.from({ length: 12 }).map((_, c) => {
          if (r < 4 && c < 4) return null;
          if (r < 4 && c >= 8) return null;
          if (r >= 8 && c < 4) return null;
          if (r >= 8 && c >= 8) return null;

          const bitIndex = r * 12 + c;
          const isFilled = bits[bitIndex];
          if (!isFilled) return null;

          return (
            <rect
              key={`${r}-${c}`}
              x={c * 8.3}
              y={r * 8.3}
              width="6"
              height="6"
              fill="#0f172a"
              rx="0.5px"
            />
          );
        });
      })}
    </svg>
  );
}

const STAGES: { id: PipelineStage; name: string; color: string; desc: string }[] = [
  { id: "PRIMEIRO_CONTACTO", name: "1. 1º Contacto", color: "border-t-sky-600 bg-sky-50/40 text-sky-800", desc: "Novas conversas" },
  { id: "PRIMEIRO_PEDIDO", name: "2. 1º Pedido", color: "border-t-purple-600 bg-purple-50/40 text-purple-800", desc: "Convertido rec." },
  { id: "CLIENTE_RECORRENTE", name: "3. Recorrente", color: "border-t-indigo-600 bg-indigo-50/40 text-indigo-800", desc: "Comprou 2x+" },
  { id: "CLIENTE_FIEL", name: "4. Fiel", color: "border-t-red-650 bg-red-50/40 text-red-800", desc: "Clientes Fiéis" },
  { id: "EMBAIXADOR", name: "5. Embaixador", color: "border-t-emerald-600 bg-emerald-50/40 text-emerald-800", desc: "Traz amigos" }
];

export default function CRM({ 
  config, 
  clients, 
  onAddClient, 
  onUpdateClientStage, 
  onDeleteClient,
  onRegisterQrOrder,
  initialCrmSubTab,
  initialSearchQuery,
  initialSelectedClientId
}: CRMProps) {
  // Tabs for CRM: "pipeline" or "scripts" or "qr-reader"
  const [crmSubTab, setCrmSubTab] = useState<"pipeline" | "scripts" | "qr-reader">("pipeline");
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  
  // Selected client
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialCrmSubTab) {
      setCrmSubTab(initialCrmSubTab);
    }
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
    if (initialSelectedClientId) {
      setSelectedClientId(initialSelectedClientId);
    }
  }, [initialCrmSubTab, initialSearchQuery, initialSelectedClientId]);
  
  // Dense segmentation filters
  const [filterChannel, setFilterChannel] = useState("Todos");
  const [filterBurger, setFilterBurger] = useState("Todos");
  const [filterLoyalty, setFilterLoyalty] = useState("Todos");
  
  // Form State for Manual Orders (Novo Pedido) / Clients
  const [showAddForm, setShowAddForm] = useState(false);
  const [orderClientType, setOrderClientType] = useState<"EXISTING" | "NEW">("EXISTING");
  const [manualOrderClientId, setManualOrderClientId] = useState<string>("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("+244 9");
  const [newClientChannel, setNewClientChannel] = useState("WhatsApp");
  const [newClientFavorite, setNewClientFavorite] = useState("Cheddar Duplo Suprema");
  const [newClientRestrictions, setNewClientRestrictions] = useState("Nenhuma");
  const [manualOrderValue, setManualOrderValue] = useState<number>(config.ticketMedio);

  useEffect(() => {
    if (clients.length > 0 && !manualOrderClientId) {
      setManualOrderClientId(clients[0].id);
    }
  }, [clients, manualOrderClientId]);

  // QR Scanner / Simulator States
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [qrScanLogs, setQrScanLogs] = useState<any[]>([
    {
      id: "log-1",
      time: "10:15",
      name: "João Manuel",
      phone: "+244923112344",
      burger: "Cheddar Duplo com Bacon",
      value: config.ticketMedio,
      status: "EXISTING",
      desc: "Venda registada. Upgrade de Fidelidade e frequência actualizado."
    },
    {
      id: "log-2",
      time: "09:42",
      name: "Neusa Silveira",
      phone: "+244931444555",
      burger: "Super Blend de Costela",
      value: config.ticketMedio * 1.2,
      status: "EXISTING",
      desc: "Primeiro pedido detectado. Avançou na esteira comercial!"
    }
  ]);
  const [qrScanAlert, setQrScanAlert] = useState<any | null>(null);

  // Custom QR Generator State
  const [qrGenName, setQrGenName] = useState("Carlos Mendes");
  const [qrGenPhone, setQrGenPhone] = useState("+244 923 888 777");
  const [qrGenBurger, setQrGenBurger] = useState("Smash Duplo Angola");
  const [qrGenValue, setQrGenValue] = useState(config.ticketMedio);

  // Drag-and-drop file state
  const [qrDragActive, setQrDragActive] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);

  // Estados para emissão e customização de faturas comerciais
  const [activeInvoicePaymentMethod, setActiveInvoicePaymentMethod] = useState<string>("Multicaixa");
  const [activeInvoiceDeliveryFee, setActiveInvoiceDeliveryFee] = useState<number>(0);
  const [activeInvoiceDiscount, setActiveInvoiceDiscount] = useState<number>(0);
  const [activeInvoiceNum, setActiveInvoiceNum] = useState<string>(`FT-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // Para registrar e emitir faturas diretas de um cliente do Kanban
  const [showDirectInvoiceModal, setShowDirectInvoiceModal] = useState<boolean>(false);
  const [directInvoiceClient, setDirectInvoiceClient] = useState<ClientProfile | null>(null);
  const [directInvoiceBurger, setDirectInvoiceBurger] = useState<string>("");
  const [directInvoiceValue, setDirectInvoiceValue] = useState<number>(config.ticketMedio);
  const [directInvoiceNotes, setDirectInvoiceNotes] = useState<string>("Muito obrigado pela sua preferência! Bom Apetite.");
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<InvoiceData | null>(null);

  const handleRealQrScan = (order: { name: string; phone: string; burger: string; value: number }) => {
    setActiveInvoiceNum(`FT-${Math.floor(1000 + Math.random() * 9000)}`);
    setActiveInvoiceDeliveryFee(0);
    setActiveInvoiceDiscount(0);

    if (onRegisterQrOrder) {
      onRegisterQrOrder(order);
    }

    const cleanPhone = order.phone.replace(/\D/g, "");
    const existed = clients.some(c => c.phone.replace(/\D/g, "") === cleanPhone);

    const newLog = {
      id: "log-" + Date.now(),
      time: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      name: order.name,
      phone: order.phone,
      burger: order.burger,
      value: order.value,
      status: existed ? "EXISTING" : "NEW",
      desc: existed 
       ? `Sócio ${order.name} comprou novamente via Câmara Live! Frequência e caixa financeira sincronizados em tempo real.` 
       : `Novo registo ${order.name} criado via Câmara Live. Perfil integrado à esteira do CRM com sucesso.`
    };

    setQrScanLogs(prev => [newLog, ...prev]);
    setQrScanAlert(newLog);
  };

  const triggerScanProcess = (name: string, phone: string, burger: string, value: number) => {
    setIsQrScanning(true);
    setQrScanAlert(null);
    setActiveInvoiceNum(`FT-${Math.floor(1000 + Math.random() * 9000)}`);
    setActiveInvoiceDeliveryFee(0);
    setActiveInvoiceDiscount(0);

    setTimeout(() => {
      setIsQrScanning(false);
      
      if (onRegisterQrOrder) {
        onRegisterQrOrder({ name, phone, burger, value });
      }

      const cleanPhone = phone.replace(/\D/g, "");
      const existed = clients.some(c => c.phone.replace(/\D/g, "") === cleanPhone);

      const newLog = {
        id: "log-" + Date.now(),
        time: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        name,
        phone,
        burger,
        value,
        status: existed ? "EXISTING" : "NEW",
        desc: existed 
         ? `Sócio ${name} comprou novamente! Frequência e caixa financeira sincronizados em tempo real.` 
         : `Novo registo ${name} criado automaticamente. Perfil integrado à esteira do CRM com sucesso.`
      };

      setQrScanLogs(prev => [newLog, ...prev]);
      setQrScanAlert(newLog);
    }, 1200);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  const getWhatsAppInvoiceLink = (
    name: string, 
    phone: string, 
    burger: string, 
    value: number, 
    customInvNum?: string, 
    devFee?: number, 
    disc?: number
  ) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    
    const subtotal = value;
    const currentInvNum = customInvNum || activeInvoiceNum;
    const currentDevFee = devFee !== undefined ? devFee : activeInvoiceDeliveryFee;
    const currentDisc = disc !== undefined ? disc : activeInvoiceDiscount;
    const total = subtotal + currentDevFee - currentDisc;
    
    const formattedDate = new Date().toLocaleDateString("pt-PT");
    const formattedTime = new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

    const message = `*🍔 BURGUERSPRIME - FATURA COMERCIAL & RECIBO*
*DOCUMENTO:* #${currentInvNum}
*DATA DE EMISSÃO:* ${formattedDate} às ${formattedTime}
----------------------------------------
*DADOS DO CLIENTE:*
👤 *Nome:* ${name}
📞 *Contacto WA:* ${phone}

*DETALHES DO PEDIDO:*
🍔 1x *${burger}* - ${subtotal.toLocaleString()} Kz

*DEMONSTRATIVO FINANCEIRO:*
• Subtotal Pedido: ${subtotal.toLocaleString()} Kz
• Taxa de Entrega: ${currentDevFee.toLocaleString()} Kz
• Desconto Comercial: -${currentDisc.toLocaleString()} Kz
*TOTAL GERAL PAGO:* *${total.toLocaleString()} Kz*

*CONDIÇÃO DE LIQUIDAÇÃO:*
✅ *CONFIRMADO & PAGO (VIA QR)*
💳 *Método de Pagamento:* ${activeInvoicePaymentMethod}
----------------------------------------
_Agradecemos imenso a sua preferência! O seu histórico de fidelidade BURGUERSPRIME foi atualizado. Bom Apetite!_ ✨🍟🥤`;

    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderClientType === "EXISTING") {
      const client = clients.find(c => c.id === manualOrderClientId);
      if (!client) {
        alert("Por favor, selecione um cliente válido.");
        return;
      }
      
      const order = {
        name: client.name,
        phone: client.phone,
        burger: newClientFavorite || client.favoriteBurger || "Hambúrguer",
        value: Number(manualOrderValue) || config.ticketMedio,
        channel: client.channel,
        dietaryRestrictions: client.dietaryRestrictions
      };
      
      if (onRegisterQrOrder) {
        onRegisterQrOrder(order);
      }
      
      // Sync invoice view with the manual order
      const newLog = {
        id: "log-" + Date.now(),
        time: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        name: order.name,
        phone: order.phone,
        burger: order.burger,
        value: order.value,
        status: "EXISTING" as const,
        desc: `Pedido manual adicionado para ${order.name}. Fidelização e estatísticas atualizadas.`
      };
      setQrScanLogs(prev => [newLog, ...prev]);
      setQrScanAlert(newLog);
      
    } else {
      if (!newClientName.trim()) {
        alert("Por favor, escreva o nome do novo cliente.");
        return;
      }
      
      const order = {
        name: newClientName,
        phone: newClientPhone || "+244 900 000 000",
        burger: newClientFavorite || "Hambúrguer",
        value: Number(manualOrderValue) || config.ticketMedio,
        channel: newClientChannel,
        dietaryRestrictions: newClientRestrictions
      };
      
      if (onRegisterQrOrder) {
        onRegisterQrOrder(order);
      }
      
      // Sync invoice view with the manual order
      const newLog = {
        id: "log-" + Date.now(),
        time: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
        name: order.name,
        phone: order.phone,
        burger: order.burger,
        value: order.value,
        status: "NEW" as const,
        desc: `Novo cliente registado com pedido manual de ${order.name}!`
      };
      setQrScanLogs(prev => [newLog, ...prev]);
      setQrScanAlert(newLog);
    }
    
    // Reset states
    setNewClientName("");
    setNewClientPhone("+244 9");
    setNewClientFavorite("Cheddar Duplo Suprema");
    setNewClientRestrictions("Nenhuma");
    setManualOrderValue(config.ticketMedio);
    setShowAddForm(false);
  };

  const getClientStage = (client: ClientProfile): PipelineStage => {
    if (client.orderHistoryCount === 0) {
      return "PRIMEIRO_CONTACTO";
    } else if (client.orderHistoryCount === 1) {
      return "PRIMEIRO_PEDIDO";
    } else if (client.orderHistoryCount > 1 && client.visitFrequency < 3) {
      return "CLIENTE_RECORRENTE";
    } else if (client.visitFrequency >= 3 && client.orderHistoryCount < 15) {
      return "CLIENTE_FIEL";
    } else {
      return "EMBAIXADOR";
    }
  };

  const handleStageShift = (client: ClientProfile, direction: "back" | "forward") => {
    const currentStage = getClientStage(client);
    const stageIds = STAGES.map(s => s.id);
    const index = stageIds.indexOf(currentStage);

    if (direction === "forward" && index < stageIds.length - 1) {
      const nextStage = stageIds[index + 1];
      let updatedOrders = client.orderHistoryCount;
      let freq = client.visitFrequency;

      if (nextStage === "PRIMEIRO_PEDIDO") {
        updatedOrders = 1;
      } else if (nextStage === "CLIENTE_RECORRENTE") {
        updatedOrders = 2;
        freq = 3;
      } else if (nextStage === "CLIENTE_FIEL") {
        updatedOrders = 8;
        freq = 3.5;
      } else if (nextStage === "EMBAIXADOR") {
        updatedOrders = 20;
        freq = 5;
      }
      
      onUpdateClientStage(client.id, nextStage);
      client.orderHistoryCount = updatedOrders;
      client.visitFrequency = freq;
    } else if (direction === "back" && index > 0) {
      const prevStage = stageIds[index - 1];
      let updatedOrders = client.orderHistoryCount;
      let freq = client.visitFrequency;

      if (prevStage === "PRIMEIRO_CONTACTO") {
        updatedOrders = 0;
        freq = 0;
      } else if (prevStage === "PRIMEIRO_PEDIDO") {
        updatedOrders = 1;
        freq = 1;
      } else if (prevStage === "CLIENTE_RECORRENTE") {
        updatedOrders = 2;
        freq = 2;
      } else if (prevStage === "CLIENTE_FIEL") {
        updatedOrders = 9;
        freq = 3;
      }
      onUpdateClientStage(client.id, prevStage);
      client.orderHistoryCount = updatedOrders;
      client.visitFrequency = freq;
    }
  };

  const compileScriptText = (scriptText: string, clientProf?: ClientProfile) => {
    const active = clientProf || {
      name: "Parceiro",
      favoriteBurger: "Cheddar Especial",
      totalSpent: config.ticketMedio
    };
    return scriptText
      .replace(/{{NOME_BURGER}}/g, config.businessName)
      .replace(/{{CLIENTE_NOME}}/g, active.name)
      .replace(/{{CLIENTE_FAVORITO}}/g, active.favoriteBurger || "Hambúrguer de Casa")
      .replace(/{{VALOR_TOTAL}}/g, (config.ticketMedio).toLocaleString())
      .replace(/{{VALOR_PROMO}}/g, (config.ticketMedio * 1.8).toLocaleString());
  };

  const handleCopyScript = (script: CommunicationScript) => {
    const raw = compileScriptText(script.text, selectedClient);
    navigator.clipboard.writeText(raw);
    setCopiedScriptId(script.id);
    setTimeout(() => setCopiedScriptId(null), 2500);
  };

  // Extract unique burgers to populate segmenter dropdown
  const uniqueBurgers = Array.from(new Set(clients.map(c => c.favoriteBurger))).filter(Boolean).sort();

  const filteredClients = clients.filter(c => {
    // 1. Unify text search match
    const matchesQuery = searchQuery === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.favoriteBurger.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 2. Unify Channel/Origin match
    const matchesChannel = filterChannel === "Todos" || c.channel === filterChannel;
    
    // 3. Unify Favorite Burger match
    const matchesBurger = filterBurger === "Todos" || c.favoriteBurger === filterBurger;
    
    // 4. Unify Loyalty Level match
    const matchesLoyalty = filterLoyalty === "Todos" || getClientStage(c) === filterLoyalty;
    
    return matchesQuery && matchesChannel && matchesBurger && matchesLoyalty;
  });

  return (
    <div className="space-y-4 animate-fade-in text-[#3D2817]" id="high-density-crm">
      
      {/* 1. Header with Compact Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-[#F4EBD9] text-[#3D2817] border-2 border-[#3D2817] p-2.5 rounded-sm shadow-[2px_2.5px_0_rgba(26,20,16,0.9)] select-none">
        <div>
          <span className="text-[10px] font-mono font-bold text-[#E8A33D] bg-[#3D2817] border border-[#3D2817] px-2 py-0.5 rounded-sm uppercase tracking-wide leading-none">
            • CRM Atendimento Angola •
          </span>
          <h2 className="font-display font-extrabold text-2xl text-[#3D2817] uppercase tracking-wide mt-1 leading-none">Gestão de Clientes & Pipeline</h2>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
          <div className="bg-[#3D2817]/8 border border-[#3D2817]/20 p-0.5 rounded-sm flex items-center gap-0.5 flex-1 md:flex-initial overflow-hidden">
            <button
              onClick={() => setCrmSubTab("pipeline")}
              id="subtab-pipeline"
              className={`px-3 py-1.5 rounded-sm text-[10px] font-bebas tracking-wide uppercase transition flex-1 md:flex-initial flex items-center justify-center gap-1 cursor-pointer ${
                crmSubTab === "pipeline"
                  ? "bg-[#3D2817] text-[#F4EBD9]"
                  : "text-[#3D2817]/70 hover:text-[#3D2817] hover:bg-[#3D2817]/5"
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setCrmSubTab("scripts")}
              id="subtab-scripts"
              className={`px-3 py-1.5 rounded-sm text-[10px] font-bebas tracking-wide uppercase transition flex-1 md:flex-initial flex items-center justify-center gap-1 cursor-pointer ${
                crmSubTab === "scripts"
                  ? "bg-[#3D2817] text-[#F4EBD9]"
                  : "text-[#3D2817]/70 hover:text-[#3D2817] hover:bg-[#3D2817]/5"
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Scripts (10)</span>
            </button>
            <button
              onClick={() => setCrmSubTab("qr-reader")}
              id="subtab-qr-reader"
              className={`px-3 py-1.5 rounded-sm text-[10px] font-bebas tracking-wide uppercase transition flex-1 md:flex-initial flex items-center justify-center gap-1 cursor-pointer ${
                crmSubTab === "qr-reader"
                  ? "bg-[#C44119] text-[#F4EBD9] font-black"
                  : "text-[#3D2817]/70 hover:text-[#3D2817] hover:bg-[#3D2817]/5"
              }`}
            >
              <QrCode className="w-3 h-3 text-[#E8A33D] shrink-0" />
              <span>Captar QR Pedido</span>
              <span className="bg-[#3D2817] text-[#E8A33D] text-[8px] px-1 rounded-sm">Novo</span>
            </button>
          </div>

          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (clients.length > 0) {
                setOrderClientType("EXISTING");
                if (!manualOrderClientId && clients[0]) {
                  setManualOrderClientId(clients[0].id);
                  setNewClientFavorite(clients[0].favoriteBurger || "Cheddar Duplo Suprema");
                  setNewClientRestrictions(clients[0].dietaryRestrictions || "Nenhuma");
                }
              } else {
                setOrderClientType("NEW");
              }
            }}
            id="btn-crm-add-client"
            className="px-3 py-2 btn-brasa text-[10px] uppercase font-bebas tracking-wide flex items-center gap-1.5 select-none"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Novo Pedido</span>
          </button>
        </div>
      </div>

      {/* 2. Customer manual order creation panel (Very dense form) */}
      {showAddForm && (
        <form onSubmit={handleCreateCustomer} className="bg-[#F4EBD9] border-2 border-[#3D2817] p-4 space-y-3.5 shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] text-[#3D2817] select-none rounded-sm" id="form-new-client">
          <div className="flex justify-between items-center pb-2 border-b border-dashed border-[#3D2817]/25">
            <h3 className="font-bebas text-sm text-slate-900 flex items-center gap-1.5 leading-none">
              <Sparkles className="w-3.5 h-3.5 text-[#C44119] animate-pulse" />
              Registo de Pedido Manual (Sem QR)
            </h3>
            <span className="text-[9px] font-mono font-bold text-[#E8A33D] bg-[#3D2817] px-2 py-0.5 rounded-sm uppercase tracking-wide">BURGUERSPRIME Workspace</span>
          </div>

          {/* Client select type selector */}
          <div className="flex bg-[#3D2817]/8 border border-[#3D2817]/20 p-0.5 rounded-sm text-[10px] font-bebas uppercase tracking-wide select-none max-w-sm">
            <button
              type="button"
              disabled={clients.length === 0}
              onClick={() => {
                setOrderClientType("EXISTING");
                if (clients[0]) {
                  setManualOrderClientId(clients[0].id);
                  setNewClientFavorite(clients[0].favoriteBurger || "Cheddar Duplo Suprema");
                  setNewClientRestrictions(clients[0].dietaryRestrictions || "Nenhuma");
                }
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-sm transition-all text-center cursor-pointer ${
                orderClientType === "EXISTING"
                  ? "bg-[#3D2817] text-[#F4EBD9] shadow-sm"
                  : "text-[#3D2817]/60 hover:text-[#3D2817] disabled:opacity-50"
              }`}
            >
              Cliente Existente ({clients.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderClientType("NEW");
                setNewClientFavorite("Cheddar Duplo Suprema");
                setNewClientRestrictions("Nenhuma");
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-sm transition-all text-center cursor-pointer ${
                orderClientType === "NEW"
                  ? "bg-[#3D2817] text-[#F4EBD9] shadow-sm"
                  : "text-[#3D2817]/60 hover:text-[#3D2817]"
              }`}
            >
              Registrar Novo Cliente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
            {/* Conditional input fields depending on client exists or new */}
            {orderClientType === "EXISTING" ? (
              <div className="md:col-span-6">
                <label htmlFor="manual-order-client-select" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65 mb-0.5">Escolha o Cliente do CRM</label>
                <select
                  id="manual-order-client-select"
                  required
                  value={manualOrderClientId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setManualOrderClientId(cid);
                    const sel = clients.find(c => c.id === cid);
                    if (sel) {
                      setNewClientFavorite(sel.favoriteBurger || "Cheddar Duplo Suprema");
                      setNewClientRestrictions(sel.dietaryRestrictions || "Nenhuma");
                    }
                  }}
                  className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] rounded-sm px-2.5 py-1.5 text-xs font-bold text-[#3D2817] outline-none"
                >
                  <option value="" disabled>-- Selecione o Cliente --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="md:col-span-3">
                  <label htmlFor="client-name-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65 mb-0.5">Nome Completo</label>
                  <input
                    type="text"
                    id="client-name-input"
                    required={orderClientType === "NEW"}
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] rounded-sm px-2.5 py-1.5 text-xs text-[#3D2817] outline-none font-semibold focus:border-[#C44119]"
                  />
                </div>
                <div className="md:col-span-3">
                  <label htmlFor="client-phone-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65 mb-0.5">Contacto WhatsApp</label>
                  <input
                    type="text"
                    id="client-phone-input"
                    required={orderClientType === "NEW"}
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+244 9..."
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] rounded-sm px-2.5 py-1.5 text-xs text-[#3D2817] outline-none font-mono font-bold focus:border-[#C44119]"
                  />
                </div>
              </>
            )}

            {/* Custom order inputs */}
            <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-4 gap-2.5">
              <div className="md:col-span-2">
                <label htmlFor="client-fav-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65 mb-0.5">Hambúrger Escolhido</label>
                <input
                  type="text"
                  id="client-fav-input"
                  required
                  value={newClientFavorite}
                  onChange={(e) => setNewClientFavorite(e.target.value)}
                  placeholder="Ex: Cheddar Suprema"
                  className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] rounded-sm px-2.5 py-1.5 text-xs text-[#3D2817] outline-none font-semibold focus:border-[#C44119]"
                />
              </div>

              <div className="md:col-span-1">
                <label htmlFor="manual-order-price" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65 mb-0.5">Valor Pago (Kz)</label>
                <input
                  type="number"
                  id="manual-order-price"
                  required
                  value={manualOrderValue}
                  onChange={(e) => setManualOrderValue(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] rounded-sm px-2.5 py-1.5 text-xs font-mono font-bold text-[#3D2817] outline-none text-right focus:border-[#C44119]"
                />
              </div>

              {orderClientType === "NEW" ? (
                <div className="md:col-span-1">
                  <label htmlFor="client-channel-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65 mb-0.5">Origem</label>
                  <select
                    id="client-channel-input"
                    value={newClientChannel}
                    onChange={(e) => setNewClientChannel(e.target.value)}
                    className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] rounded-sm px-2 py-1.5 text-xs text-[#3D2817] outline-none font-bold cursor-pointer focus:border-[#C44119]"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Fisico">Balcão</option>
                  </select>
                </div>
              ) : (
                <div className="md:col-span-1 opacity-70 font-mono">
                  <label className="block text-[9px] uppercase font-bold text-[#3D2817]/50 mb-0.5">Origem CRM</label>
                  <div className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817]/20 rounded-sm px-2 py-1.5 text-xs text-[#3D2817]/80 select-none font-bold">
                    {clients.find(c => c.id === manualOrderClientId)?.channel || "WhatsApp"}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-0.5">
            <div className="md:col-span-12">
              <label htmlFor="client-rest-input" className="block text-[9px] uppercase font-mono font-bold text-[#3D2817]/65 mb-0.5">Observações / Restrições do Pedido</label>
              <input
                type="text"
                id="client-rest-input"
                value={newClientRestrictions}
                onChange={(e) => setNewClientRestrictions(e.target.value)}
                placeholder="Ex: Sem cebola, bem passado"
                className="w-full bg-[#3D2817]/5 border-2 border-[#3D2817] rounded-sm px-2.5 py-1.5 text-xs text-[#3D2817] outline-none font-sans focus:border-[#C44119]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3.5 border-t border-dashed border-[#3D2817]/20">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              id="btn-cancel-client"
              className="px-4 py-1.5 text-[#3D2817]/80 hover:text-[#3D2817] text-xs font-bebas uppercase tracking-wider rounded-sm bg-[#3D2817]/10 hover:bg-[#3D2817]/15 border-2 border-[#3D2817] transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-client"
              className="px-5 py-1.5 bg-[#C44119] hover:bg-[#C44119]/90 text-[#F4EBD9] border-2 border-[#3D2817] text-xs font-bebas uppercase tracking-wider rounded-sm shadow-[1px_1.5px_0_rgba(26,20,16,0.95)] transition cursor-pointer"
            >
              Confirmar & Lançar Pedido na Chapa 🍔
            </button>
          </div>
        </form>
      )}

      {/* 2.5 GLOBAL HIGH-DENSITY SEGMENTATION FILTERS */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col gap-2" id="crm-global-filters">
        <div className="flex justify-between items-center pb-1.5 border-b border-slate-250">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700 leading-none">
              Filtros Activos de Segmentação Comercial (WhatsApp Core)
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 font-medium">
            Mostrando <span className="font-bold text-red-655">{filteredClients.length}</span> de <span className="font-bold text-slate-800">{clients.length}</span> clientes
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Unidade A: Text search query */}
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-[8.5px] font-bold text-slate-400 uppercase leading-none">Pesquisa Directa</span>
            <input
              type="text"
              placeholder="Nome ou ingrediente..."
              value={searchQuery}
              id="search-input-crm-global"
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-red-600 rounded-lg pl-2.5 pr-2 pt-3.5 pb-1 text-xs text-slate-900 outline-none font-medium leading-none"
            />
          </div>

          {/* Unidade B: Channel Origin Select */}
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-[8px] font-extrabold text-slate-400 uppercase leading-none">Origem Canal</span>
            <select
              value={filterChannel}
              id="select-channel-filter"
              onChange={(e) => setFilterChannel(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-red-600 rounded-lg pl-2 pr-2 pt-3.5 pb-1 text-xs text-slate-800 outline-none leading-tight font-medium"
            >
              <option value="Todos">Todas as Origens</option>
              {Array.from(new Set(clients.map(c => c.channel).filter(Boolean))).map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
          </div>

          {/* Unidade C: Cheeseburgers / Favorites select dropdown */}
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-[8px] font-extrabold text-slate-400 uppercase leading-none">Hambúrguer Favorito</span>
            <select
              value={filterBurger}
              id="select-burger-filter"
              onChange={(e) => setFilterBurger(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-red-600 rounded-lg pl-2 pr-2 pt-3.5 pb-1 text-xs text-slate-800 outline-none leading-tight font-medium"
            >
              <option value="Todos">Todos os Hambúrgueres</option>
              {uniqueBurgers.map((burger) => (
                <option key={burger} value={burger}>{burger}</option>
              ))}
            </select>
          </div>

          {/* Unidade D: Loyalty stages */}
          <div className="relative flex items-center gap-1.5">
            <div className="relative flex-grow">
              <span className="absolute left-2.5 top-1.5 text-[8px] font-extrabold text-slate-400 uppercase leading-none">Nível Fidelidade</span>
              <select
                value={filterLoyalty}
                id="select-loyalty-filter"
                onChange={(e) => setFilterLoyalty(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-red-600 rounded-lg pl-2 pr-2 pt-3.5 pb-1 text-xs text-slate-800 outline-none leading-tight font-medium"
              >
                <option value="Todos">Todos os Níveis</option>
                {STAGES.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name.split(". ")[1]}</option>
                ))}
              </select>
            </div>

            {/* Micro reset filters */}
            {(searchQuery !== "" || filterChannel !== "Todos" || filterBurger !== "Todos" || filterLoyalty !== "Todos") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterChannel("Todos");
                  setFilterBurger("Todos");
                  setFilterLoyalty("Todos");
                }}
                id="btn-clear-crm-filters"
                className="px-2.5 py-2.5 bg-red-100 hover:bg-red-200 text-red-755 transition rounded-lg text-xs font-black leading-none shrink-0"
                title="Limpar todos os filtros de segmentação"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Render Views based on Sub-Tab selection */}
      {crmSubTab === "pipeline" && (
        
        // INTERACTIVE KANBAN PIPELINE (High fidelity, compact cards, 420px column height)
        <div className="space-y-3" id="section-kanban-pipeline">
          
          <div className="flex justify-between items-center bg-[#F4EBD9] border-2 border-[#3D2817] px-3 py-1.5 rounded-sm gap-2 h-9 shadow-[1px_1.5px_0_rgba(26,20,16,0.95)]">
            <div className="flex items-center gap-1.5 flex-grow text-[#3D2817]">
              <Users className="w-3.5 h-3.5 text-[#C44119]" />
              <span className="text-xs font-bebas uppercase tracking-wide">Quadro de Negócio Activo</span>
              <span className="text-[10px] text-[#3D2817]/65 font-mono hidden sm:inline">— Ajusta a fidelidade movimentando as etapas</span>
            </div>
            <div className="text-[10px] text-[#3D2817] font-mono font-bold">
              Segmentados: <span className="text-[#C44119]">{filteredClients.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
            {STAGES.map((st) => {
              const stageClients = filteredClients.filter(c => getClientStage(c) === st.id);
              
              return (
                <div key={st.id} className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-2 flex flex-col h-[410px] overflow-hidden shadow-[1.5px_2px_0_rgba(26,20,16,0.95)]" id={`kanban-col-${st.id}`}>
                  
                  {/* Column header */}
                  <div className={`border-1.5 border-[#3D2817] pb-1.5 pt-1.5 px-2 bg-[#3D2817] text-[#F4EBD9] mb-2 flex justify-between items-center rounded-sm`}>
                    <div>
                      <h3 className="font-bebas text-[11px] tracking-wider uppercase leading-none">{st.name}</h3>
                      <p className="text-[8.5px] text-[#F4EBD9]/70 font-mono leading-none mt-1">{st.desc}</p>
                    </div>
                    <span className="text-[9.5px] font-mono font-bold bg-[#C44119] text-[#F4EBD9] px-1.5 py-0.2 rounded-sm">
                      {stageClients.length}
                    </span>
                  </div>

                  {/* Scrollable list */}
                  <div className="space-y-1.5 overflow-y-auto flex-grow pr-1 scrollbar-thin">
                    {stageClients.length > 0 ? (
                      stageClients.map((client) => {
                        const isAtRisk = client.visitFrequency >= 2 && client.lastVisitDaysAgo >= 10;
                        const isBirthday = client.birthdayDate === "06-18" || client.birthdayDate === "06-20";
                        const isSelected = selectedClientId === client.id;
                        
                        return (
                          <div
                            key={client.id}
                            id={`crm-client-${client.id}`}
                            onClick={() => setSelectedClientId(client.id)}
                            className={`p-2 bg-[#F4EBD9] hover:bg-[#F4EBD9]/95 rounded-sm border-2 transition-all cursor-pointer relative ${
                              isSelected 
                                ? "border-[#C44119] shadow-[1px_1.5px_0_rgba(26,20,16,0.95)] bg-[#C44119]/5" 
                                : isAtRisk 
                                  ? "border-[#C44119]/40 bg-[#C44119]/5" 
                                  : "border-[#3D2817]/35"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="font-bold text-[#3D2817] text-xs truncate max-w-[90px] leading-tight">
                                {client.name}
                              </h4>
                              <div className="flex gap-0.5 items-center shrink-0">
                                {isAtRisk && <span className="h-1.5 w-1.5 rounded-full bg-[#C44119]" title="Atalho ausência" />}
                                {isBirthday && <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />}
                                <span className="text-[8px] font-mono text-[#3D2817]/70 px-1 rounded-sm bg-[#3D2817]/5 border border-[#3D2817]/15 font-medium leading-none">
                                  {client.channel === "WhatsApp" ? "WA" : "IG"}
                                </span>
                              </div>
                            </div>

                            <p className="text-[9px] text-[#3D2817]/75 font-mono truncate mt-1">
                              🍔 {client.favoriteBurger}
                            </p>

                            <div className="grid grid-cols-2 gap-0.5 mt-1.5 pt-1.5 border-t border-dashed border-[#3D2817]/25 text-[8.5px] font-mono text-[#3D2817]/70 leading-none">
                              <div>Freq: <strong className="text-[#3D2817]">{client.visitFrequency}x/m</strong></div>
                              <div className="text-right">Gasto: <strong className="text-[#C44119]">{(client.totalSpent).toLocaleString()}</strong></div>
                            </div>

                            {/* Dense controls */}
                            <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-slate-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStageShift(client, "back");
                                }}
                                id={`shift-back-${client.id}`}
                                className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition disabled:opacity-20"
                                disabled={getClientStage(client) === "PRIMEIRO_CONTACTO"}
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteClient(client.id);
                                }}
                                id={`delete-cli-${client.id}`}
                                className="p-0.5 hover:bg-red-50 rounded text-red-500/70 hover:text-red-700 transition"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStageShift(client, "forward");
                                }}
                                id={`shift-fwd-${client.id}`}
                                className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition disabled:opacity-20"
                                disabled={getClientStage(client) === "EMBAIXADOR"}
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>

                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-stone-550 text-[10px] font-mono">
                        Nenhum cliente nesta etapa ainda
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Kanban Footer Inspector (Highly compressed horizontal bar format to fit cleanly without scroll) */}
          {selectedClient && (
            <div className="bg-[#F4EBD9] border-2 border-[#3D2817] rounded-sm p-3 grid grid-cols-1 md:grid-cols-4 gap-2.5 shadow-[1.5px_2px_0_rgba(26,20,16,0.95)] select-none text-[#3D2817]" id="section-profile-inspector">
              <div className="col-span-1 border-b md:border-b-0 md:border-r border-[#3D2817]/20 pb-1.5 md:pb-0 md:pr-3 flex flex-col justify-center">
                <span className="text-[8px] uppercase font-mono font-black text-[#3D2817]/60 tracking-wider">Investigação Directa</span>
                <h4 className="font-bebas text-base text-[#3D2817] mt-0.5 truncate">{selectedClient.name}</h4>
                <p className="text-[#C44119] font-mono font-bold text-[10.5px] leading-tight">{selectedClient.phone}</p>
              </div>

              <div className="col-span-2 flex items-center justify-around gap-2 text-xs">
                <div>
                  <span className="text-[#3D2817]/60 block uppercase text-[8px] font-mono font-bold">BURGER FAVORITO</span>
                  <span className="font-bold text-[#3D2817] text-[11px]">🍔 {selectedClient.favoriteBurger}</span>
                </div>
                <div>
                  <span className="text-[#3D2817]/60 block uppercase text-[8px] font-mono font-bold">CANAL ORIGEM</span>
                  <span className="font-bold text-[#3D2817] text-[11px]">{selectedClient.channel}</span>
                </div>
                <div>
                  <span className="text-[#3D2817]/60 block uppercase text-[8px] font-mono font-bold">RESTRIÇÃO</span>
                  <span className="font-bold text-[#C44119] font-mono text-[11px]">{selectedClient.dietaryRestrictions || "NENHUMA"}</span>
                </div>
              </div>

              {/* Inspector action shortcuts */}
              <div className="col-span-1 flex gap-1.5 items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setDirectInvoiceClient(selectedClient);
                    setDirectInvoiceBurger(selectedClient.favoriteBurger);
                    setDirectInvoiceValue(config.ticketMedio);
                    setActiveInvoiceNum(`FT-${Math.floor(1000 + Math.random() * 9000)}`);
                    setActiveInvoiceDeliveryFee(0);
                    setActiveInvoiceDiscount(0);
                    setShowDirectInvoiceModal(true);
                  }}
                  id={`btn-issue-invoice-${selectedClient.id}`}
                  className="flex-1 py-1.5 bg-[#E8A33D] hover:bg-[#E8A33D]/90 border border-[#3D2817] text-[#1A1410] font-bebas text-xs rounded-sm transition text-center flex items-center justify-center gap-0.5 shadow-sm uppercase cursor-pointer"
                >
                  <span>🧾 Faturar</span>
                </button>
                <button
                  onClick={() => setCrmSubTab("scripts")}
                  id="btn-crm-link-scripts"
                  className="flex-1 py-1.5 bg-[#3D2817] hover:bg-[#3D2817]/90 text-[#F4EBD9] font-bebas text-xs rounded-sm transition text-center uppercase cursor-pointer"
                >
                  Scripts
                </button>
                <a
                  href={`https://wa.me/${selectedClient.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  id={`btn-wa-direct-${selectedClient.id}`}
                  className="flex-1 py-1.5 bg-[#7A8B6F] border border-[#3D2817] text-[#F4EBD9] font-bebas text-xs rounded-sm transition text-center flex items-center justify-center gap-0.5 uppercase cursor-pointer"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}

        </div>
      )}

      {crmSubTab === "scripts" && (

        // SCRIPTS DIRECTORY & 10 COMMERCIAL SCRIPTS (Tighter list layout)
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" id="section-scripts-directory">
          
          <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">Enlace de Cliente</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Une os dados de um cliente para gerar o template WhatsApp.
              </p>
            </div>

            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  id={`script-target-client-${c.id}`}
                  className={`w-full text-left p-2 rounded-lg border transition flex flex-col gap-0.5 ${
                    selectedClientId === c.id
                      ? "bg-red-50 border-red-500 text-slate-900"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="font-bold text-[11px] leading-tight truncate">{c.name}</span>
                  <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-500 leading-none">
                    <span>🍔 {c.favoriteBurger}</span>
                    <span>Freq: {c.visitFrequency}x/m</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedClient && (
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-0.5">
                <span className="text-[8px] uppercase font-bold text-slate-400 block leading-none">Alvo Actual:</span>
                <p className="font-bold text-slate-900">{selectedClient.name}</p>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Burger: {selectedClient.favoriteBurger}</span>
                  <span>Telemóvel: {selectedClient.phone}</span>
                </div>
              </div>
            )}
          </div>

          {/* 10 scripts list (High fidelity and super tight block) */}
          <div className="col-span-2 space-y-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
              <h3 className="font-bold text-slate-900 text-xs leading-none">Biblioteca de 10 Scripts Prontos</h3>
              <p className="text-[10px] text-slate-500 mt-1">
                Selecione um script abaixo e envie para o telemóvel associado ao cliente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
              {INITIAL_COMMUNICATION_SCRIPTS.map((script) => {
                const compiled = compileScriptText(script.text, selectedClient);
                return (
                  <div 
                    key={script.id} 
                    id={`script-item-${script.id}`}
                    className="p-2.5 bg-white border border-slate-250 rounded-lg flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1 pb-1 border-b border-slate-100">
                        <h4 className="font-bold text-slate-900 text-[10.5px] truncate">{script.title}</h4>
                        <span className="text-[7.5px] font-bold font-mono px-1 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {script.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug mt-1.5 mb-2 h-8 overflow-hidden select-none">
                        {script.description}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded p-1.5 font-mono text-[8.5px] leading-relaxed text-slate-800 relative select-all max-h-20 overflow-y-auto border border-slate-200">
                      <button
                        onClick={() => handleCopyScript(script)}
                        id={`btn-copy-script-${script.id}`}
                        className="absolute right-1 top-1 p-0.5 bg-white border border-slate-200 rounded hover:border-red-650 text-slate-600 transition"
                        title="Copiar WhatsApp"
                      >
                        {copiedScriptId === script.id ? (
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                      {compiled}
                    </div>

                    <div className="mt-2 text-center">
                      <button
                        onClick={() => handleCopyScript(script)}
                        id={`btn-dispatch-script-${script.id}`}
                        className="w-full py-1 bg-red-650 hover:bg-red-700 text-white font-bold text-[9px] rounded transition"
                      >
                        {copiedScriptId === script.id ? "✓ Copiado com Sucesso!" : "Copiar WhatsApp"}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {crmSubTab === "qr-reader" && (
        <div className="space-y-4" id="section-qr-reader-dashboard">
          
          <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/30 text-emerald-50 p-4 rounded-xl shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in select-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-slate-950 font-black text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono">
                  Sincronização em Tempo Real
                </span>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </div>
              <h3 className="text-sm font-black text-white">Leitor de QR Codes para Auto-Captação de Pedidos</h3>
              <p className="text-[10px] text-emerald-200/80 leading-relaxed max-w-2xl font-semibold">
                O sistema lê o QR gerado no pedido (fatura ou comanda da chapa). Ele cruza imediatamente o contacto telefónico com a base de dados. Se o cliente existir, incrementa visitas e compras. Se for novo, regista-o no CRM. Tudo se actualiza instantaneamente no seu painel financeiro!
              </p>
            </div>

            <div className="flex gap-2 shrink-0 z-10">
              <div className="bg-slate-900/40 border border-emerald-500/20 px-3 py-2 rounded-lg text-center min-w-[100px]">
                <span className="text-[8px] text-emerald-300 font-bold block uppercase tracking-wider">Lidos na Sessão</span>
                <span className="text-lg font-mono font-black text-emerald-400 leading-none">{qrScanLogs.length}</span>
              </div>
              <div className="bg-slate-900/40 border border-emerald-500/20 px-3 py-2 rounded-lg text-center min-w-[100px]">
                <span className="text-[8px] text-emerald-300 font-bold block uppercase tracking-wider">Câmara Integrada</span>
                <span className="text-[10px] font-bold text-white uppercase bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/30 inline-block mt-0.5 animate-pulse">
                  Pronto
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* COLUMN 1: Live Simulator & Scanner Frame */}
            <div className="lg:col-span-12 xl:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    Visor do Scanner Comercial
                  </h4>
                  <button
                    type="button"
                    onClick={() => setUseRealCamera(!useRealCamera)}
                    className={`text-[9.5px] font-bold uppercase px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                      useRealCamera
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${useRealCamera ? "bg-red-600 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
                    <span>{useRealCamera ? "Usar Simulador" : "Ligar Câmara Real"}</span>
                  </button>
                </div>

                {/* Camera / Viewfinder Box */}
                {useRealCamera ? (
                  <div className="my-3">
                    <QRScanner 
                      onScanSuccess={(order) => {
                        handleRealQrScan(order);
                        setUseRealCamera(false);
                      }} 
                      onClose={() => setUseRealCamera(false)} 
                    />
                  </div>
                ) : (
                  /* Animated Camera scan preview */
                  <div className="bg-slate-950 rounded-xl p-3 relative h-48 flex flex-col items-center justify-center overflow-hidden border border-slate-800 my-3 group">
                    
                    {isQrScanning && (
                      <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center space-y-3 font-semibold text-white">
                        <div className="animate-spin h-7 w-7 border-2 border-t-emerald-500 border-r-transparent border-slate-600 rounded-full" />
                        <p className="text-[10px] font-mono tracking-widest text-emerald-400 animate-pulse text-center font-bold">
                          A LER DADOS DO QR...<br/>
                          <span className="text-slate-400 text-[9px]">Sincronizando com o BURGUERSPRIME CRM</span>
                        </p>
                      </div>
                    )}

                    {/* Corner Target indicators */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-500 z-10" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-500 z-10" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-500 z-10" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-500 z-10" />

                    {/* Red tracking laser lines */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-bounce z-10 mt-1" style={{ animationDuration: '2.5s' }} />

                    {/* Center QR representation */}
                    <div className="opacity-95 text-center flex flex-col items-center z-0 select-none">
                      <QrCode className="w-16 h-16 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors duration-300" />
                      <p className="text-[8.5px] font-mono text-slate-500 mt-2">
                        Aponta o QR Code do pedido para a câmara ou arrasta uma foto
                      </p>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setQrDragActive(true); }}
                      onDragLeave={() => setQrDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setQrDragActive(false);
                        triggerScanProcess(
                          "Kianda Morais", 
                          "+244 949 101 " + Math.floor(100 + Math.random() * 900), 
                          "Super Blend de Costela", 
                          config.ticketMedio + 1500
                        );
                      }}
                      className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity ${
                        qrDragActive ? "bg-emerald-950/90 text-white opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <div className="text-center p-3 border-2 border-dashed border-emerald-400 rounded-xl">
                        <p className="text-[10px] font-bold">SOLTE O FICHEIRO AQUI PARA LER 📂</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Action */}
                <div className="flex gap-2 text-xs">
                  <label className="flex-1 py-1 px-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-[9.5px] rounded-lg text-center cursor-pointer flex items-center justify-center gap-1 transition">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={() => {
                        triggerScanProcess(
                          "Kianda Morais", 
                          "+244 949 101 " + Math.floor(100 + Math.random() * 900), 
                          "Super Blend de Costela", 
                          config.ticketMedio + 1500
                        );
                      }}
                    />
                    <span>Fazer Upload do QR</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (useRealCamera) {
                        setUseRealCamera(false);
                      } else {
                        triggerScanProcess(qrGenName, qrGenPhone, qrGenBurger, Number(qrGenValue));
                      }
                    }}
                    className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9.5px] rounded-lg text-center shadow flex items-center justify-center gap-1 transition-all"
                  >
                    <span>{useRealCamera ? "Desligar Câmara" : "Ler QR Ativo Abaixo ↓"}</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Scanners */}
              <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
                <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase font-black">
                  Simulações de Teste Rápido (Casos de Estudo do Negócio)
                </span>
                <div className="space-y-1.5 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      triggerScanProcess("João Manuel", "+244923112344", "Cheddar Duplo com Bacon", config.ticketMedio);
                    }}
                    id="btn-scan-preset-1"
                    className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 transition flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-[10px] text-slate-900 block leading-tight">João Manuel (Fidelizado)</span>
                      <span className="text-[8.5px] text-slate-500 font-mono">Simular compra adicional de Burger</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-[8px] px-1.5 py-0.5 rounded font-bold">Existente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerScanProcess("Yuri Santos", "+244912405192", "Frango Crocante Catupiry", 4500);
                    }}
                    id="btn-scan-preset-2"
                    className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 transition flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-[10px] text-slate-900 block leading-tight">Yuri Santos (Em Risco)</span>
                      <span className="text-[8.5px] text-slate-500 font-mono">Registar compra para resgatar cliente!</span>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.5 rounded font-bold">Resgate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerScanProcess("Mateus Antunes", "+244929112344", "Smash Duplo Angola", config.ticketMedio + 1200);
                    }}
                    id="btn-scan-preset-3"
                    className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 transition flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-[10px] text-slate-900 block leading-tight">Mateus Antunes (Desconhecido)</span>
                      <span className="text-[8.5px] text-slate-500 font-mono">Adicionar automatico no CRM no 1º Pedido</span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.5 rounded font-bold">Novo Cliente</span>
                  </button>
                </div>
              </div>

            </div>

            {/* COLUMN 2: CUSTOM QR CODE GENERATOR PANEL */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-2">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    Gerador de QR do Pedido
                  </h4>
                  <span className="text-[8px] font-extrabold bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 border">
                    Integrado
                  </span>
                </div>

                <p className="text-[9px] text-slate-500 leading-tight">
                  Construa e imprima a comanda de teste. Mudar os dados actualiza o código QR abaixo instantaneamente.
                </p>

                {/* Live Form */}
                <div className="space-y-2.5 mt-3">
                  <div className="space-y-0.5">
                    <label className="text-[8.5px] uppercase tracking-wide font-black text-slate-400 block leading-none">
                      Nome do Comprador
                    </label>
                    <input 
                      type="text" 
                      value={qrGenName} 
                      onChange={(e) => setQrGenName(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-2 py-1 text-xs text-slate-800 outline-none font-semibold"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[8.5px] uppercase tracking-wide font-black text-slate-400 block leading-none">
                      Telemóvel (WhatsApp)
                    </label>
                    <input 
                      type="text" 
                      value={qrGenPhone} 
                      onChange={(e) => setQrGenPhone(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-2 py-1 text-xs text-slate-800 outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[8.5px] uppercase tracking-wide font-black text-slate-400 block leading-none">
                        Item Grelhado
                      </label>
                      <input 
                        type="text" 
                        value={qrGenBurger} 
                        onChange={(e) => setQrGenBurger(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-2 py-1 text-xs text-slate-800 outline-none font-semibold"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8.5px] uppercase tracking-wide font-black text-slate-400 block leading-none">
                        Preço do Pedido (Kz)
                      </label>
                      <input 
                        type="number" 
                        value={qrGenValue} 
                        onChange={(e) => setQrGenValue(Number(e.target.value))} 
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded px-2 py-1 text-xs text-slate-800 outline-none font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Dynamic Rendering Zone */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                <MockQrCodeSvg text={`${qrGenName}|${qrGenPhone}|${qrGenBurger}|${qrGenValue}`} />
                <div className="text-center font-mono leading-none">
                  <span className="text-[7.5px] text-slate-400 font-extrabold uppercase">Conteúdo do QR Hash:</span>
                  <span className="text-[9.5px] font-bold text-slate-750 block select-all mt-0.5">
                    {qrGenName.split(" ")[0] || "Carlos"} | {qrGenPhone} | {qrGenBurger.substring(0, 12)}...
                  </span>
                </div>
              </div>

            </div>

            {/* COLUMN 3: REAL-TIME CAPTURED LOGS */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 font-sans">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '4s' }} />
                    Log de Captura
                  </h4>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Scan success alert voucher (Rich Commercial Invoice visual) */}
                {qrScanAlert ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-md space-y-3 animate-fade-in relative overflow-hidden font-mono border-t-4 border-t-emerald-600">
                    <div className="text-center pb-2 border-b border-dashed border-slate-300">
                      <span className="font-sans font-black text-[12.5px] uppercase text-slate-900 block tracking-wider">💰 BURGUERSPRIME 💰</span>
                      <span className="text-[8.5px] text-slate-400 block uppercase font-bold">Hamburgueria • Angola</span>
                      <span className="text-[8px] bg-emerald-100 text-emerald-800 font-sans font-bold px-1.5 py-0.5 rounded mt-1.5 inline-block">
                        PAGAMENTO CONFIRMADO
                      </span>
                    </div>

                    <div className="text-[9.5px] space-y-1 text-slate-700 border-b border-dashed border-slate-200 pb-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">DOC FATURA:</span>
                        <span className="font-black text-slate-900">{activeInvoiceNum}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">DATA EMISSÃO:</span>
                        <span>{new Date().toLocaleDateString("pt-PT")} • {qrScanAlert.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">CLIENTE:</span>
                        <span className="font-black text-slate-900 truncate max-w-[110px]">{qrScanAlert.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">WHATASPP:</span>
                        <span className="font-bold">{qrScanAlert.phone}</span>
                      </div>
                    </div>

                    <div className="text-[10px] space-y-1 border-b border-dashed border-slate-200 pb-2">
                      <div className="flex justify-between text-slate-400 font-bold text-[8.5px] uppercase">
                        <span>QTD / ITEM</span>
                        <span>MONTANTE</span>
                      </div>
                      <div className="flex justify-between items-start text-slate-800 mt-1">
                        <div className="truncate max-w-[140px] font-sans">
                          <span className="font-semibold text-slate-500">1x </span>
                          <span className="font-black text-slate-900">{qrScanAlert.burger}</span>
                        </div>
                        <span className="font-bold text-slate-900">{qrScanAlert.value.toLocaleString()} Kz</span>
                      </div>
                    </div>

                    {/* Inputs de customização de entrega e desconto na fatura */}
                    <div className="space-y-1.5 py-1 text-[9px] font-sans border-b border-dashed border-slate-200 pb-2">
                      <span className="text-[8px] font-extrabold text-slate-400 block uppercase tracking-wider">Ajustes da Fatura Activa:</span>
                      
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 font-semibold text-[9px]">Taxa Entrega:</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <input 
                            type="number" 
                            value={activeInvoiceDeliveryFee} 
                            onChange={(e) => setActiveInvoiceDeliveryFee(Math.max(0, Number(e.target.value)))}
                            className="w-14 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-right font-mono text-xs font-bold outline-none"
                          />
                          <span className="text-[8px] text-slate-400 font-bold">Kz</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <span className="text-slate-500 font-semibold text-[9px]">Desconto Venda:</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <input 
                            type="number" 
                            value={activeInvoiceDiscount} 
                            onChange={(e) => setActiveInvoiceDiscount(Math.max(0, Number(e.target.value)))}
                            className="w-14 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-right font-mono text-xs font-bold text-red-650 outline-none"
                          />
                          <span className="text-[8px] text-slate-400 font-bold">Kz</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 font-semibold text-[9px]">Forma de Pago:</span>
                        <select 
                          value={activeInvoicePaymentMethod} 
                          onChange={(e) => setActiveInvoicePaymentMethod(e.target.value)}
                          className="w-24 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[9px] font-bold text-slate-850 outline-none"
                        >
                          <option value="Multicaixa">Multicaixa</option>
                          <option value="Cash (Dinheiro)">Dinheiro</option>
                          <option value="Transferência Express">TPA / Express</option>
                          <option value="Banco / IBAN">Banco / IBAN</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-[10px] space-y-1 text-slate-900 pt-1 leading-none">
                      <div className="flex justify-between font-mono text-[9.5px] text-slate-400">
                        <span>SUBTOTAL:</span>
                        <span>{qrScanAlert.value.toLocaleString()} Kz</span>
                      </div>
                      {activeInvoiceDeliveryFee > 0 && (
                        <div className="flex justify-between font-mono text-[9.5px] text-slate-500">
                          <span>TAXA ENTREGA:</span>
                          <span>+{activeInvoiceDeliveryFee.toLocaleString()} Kz</span>
                        </div>
                      )}
                      {activeInvoiceDiscount > 0 && (
                        <div className="flex justify-between font-mono text-[9.5px] text-red-500">
                          <span>DESCONTO:</span>
                          <span>-{activeInvoiceDiscount.toLocaleString()} Kz</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-800 pt-2 font-black text-xs text-slate-950 mt-1.5 flex items-center">
                        <span>TOTAL PAGO:</span>
                        <span className="font-mono text-emerald-700 font-black">
                          {(qrScanAlert.value + activeInvoiceDeliveryFee - activeInvoiceDiscount).toLocaleString()} Kz
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-4 font-sans select-none relative z-10 pt-1 border-t border-dashed border-slate-250">
                      <a
                        href={getWhatsAppInvoiceLink(qrScanAlert.name, qrScanAlert.phone, qrScanAlert.burger, qrScanAlert.value)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg text-center shadow flex items-center justify-center gap-1.5 transition-all text-decoration-none"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        <span>Mandar via WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          alert(`Sucesso! Talão comercial #${activeInvoiceNum} enviado para a fila de impressão térmica com sucesso.`);
                        }}
                        className="w-full py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold text-[9px] rounded-lg text-center flex items-center justify-center gap-1 transition-all"
                      >
                        <span>🖨️ Simular Talão Físico</span>
                      </button>
                    </div>

                    <div className="text-center text-[7px] text-slate-400 font-sans tracking-wide pt-1">
                      {qrScanAlert.status === "NEW" ? "🆕 CLIENTE DEBUTANTE NO CRM" : "✅ FIDELIZAÇÃO ATUALIZADA"}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center text-[10px] text-slate-400 font-sans font-medium">
                    Nenhum QR scanneado nesta sessão. Use as simulações ou mude os dados à esquerda e clique em ler para processar!
                  </div>
                )}

                {/* Historico de Leituras */}
                <div className="space-y-1.5 font-sans">
                  <span className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-wider block leading-none">
                    Leituras Recentes ({qrScanLogs.length})
                  </span>
                  
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                    {qrScanLogs.map((log) => (
                      <div key={log.id} className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-[9px] hover:bg-slate-100/50 transition relative space-y-1.5 shadow-sm">
                        <div className="flex justify-between text-[8px] font-mono text-slate-400">
                          <span>{log.time}</span>
                          <span className={`font-black uppercase tracking-wider ${log.status === "NEW" ? "text-emerald-600" : "text-blue-600"}`}>
                            {log.status === "NEW" ? "NOVO CLIENTE" : "CLIENTE ATIVO"}
                          </span>
                        </div>
                        <p className="font-extrabold text-slate-900 truncate mt-0.5">{log.name} • <span className="text-slate-500 font-semibold">{log.burger}</span></p>
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                          <span className="text-slate-600 font-mono font-bold text-[8.5px]">
                            {log.value.toLocaleString()} Kz • {log.phone}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceOrder({
                              id: log.id,
                              invoiceNum: `FT-${Math.floor(1000 + Math.random() * 9000)}`,
                              name: log.name,
                              phone: log.phone,
                              burger: log.burger,
                              value: log.value,
                              status: log.status,
                              time: log.time
                            })}
                            className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white text-[8px] font-black rounded-md flex items-center gap-0.5 transition shadow-sm leading-none"
                          >
                            <span>Faturar 🧾</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Real-time sync feedback indicators */}
              <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[8.5px] text-slate-500 space-y-1 select-none">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                  <span>Sincronização com o Dashboard Activo: <strong>Ligado</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                  <span>Sincronização Financeira e Fluxo: <strong>Aprovado</strong></span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 4. Active Automations Cabinet (Highly compact horizontal bar structure) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm select-none" id="section-active-automations">
        <h3 className="font-bold text-slate-900 text-xs leading-none mb-1">Gabinete de Automações Activas</h3>
        <p className="text-[10px] text-slate-500 mb-2.5">Gatilhos automáticos configurados para resgate de emergência imediato.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {[
            { title: "Ausência Longa", trigger: "Alerta aos 10 dias", rule: "no-show > 10 dias", status: "Activo", color: "bg-red-500" },
            { title: "Resgate Fidelidade", trigger: "Disparo automático", rule: "Roteiro de 14 dias", status: "Activo", color: "bg-amber-500" },
            { title: "Auto-Retenção", trigger: "Cupão 2ª Compra", rule: "Incentivo após 1º pedido", status: "Activo", color: "bg-emerald-500" },
            { title: "Promo Colectiva", trigger: "Sexta às 10:00", rule: "Panela de Mensagens", status: "Activo", color: "bg-indigo-505" },
            { title: "Aniversariantes", trigger: "Cupão de Brinde", rule: "Script de Anos no WA", status: "Activo", color: "bg-pink-500" }
          ].map((aut, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[7.5px] font-mono leading-none pb-0.5 border-b border-slate-200/50">
                  <span>REGRA #{idx+1}</span>
                  <div className="flex items-center gap-0.5 text-emerald-600 font-bold">
                    <span className={`h-1 w-1 rounded-full ${aut.color || 'bg-emerald-500'}`} />
                    <span>{aut.status}</span>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 text-[10px] mt-1 leading-tight truncate">{aut.title}</h4>
                <p className="text-[9px] text-slate-550 leading-tight mt-0.5 truncate">{aut.rule}</p>
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-slate-150 leading-none">
                <span className="text-[7.5px] text-slate-400 font-extrabold block">GATILHO:</span>
                <span className="text-[9px] font-bold text-red-650 mt-0.5 block truncate">{aut.trigger}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Direct Manual Invoice Generation Modal */}
      {showDirectInvoiceModal && directInvoiceClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 p-5 space-y-4 animate-fade-in my-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 font-sans">
                  🧾 Emitir Fatura Directa
                </h3>
                <p className="text-[10px] text-slate-500 font-sans">
                  Gere o talão comercial e envie para o WhatsApp do parceiro
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDirectInvoiceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
              >
                <span className="text-xl font-bold leading-none">&times;</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs font-sans">
              <div>
                <span className="text-[8px] uppercase font-bold text-slate-400">👤 Cliente Alvo</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{directInvoiceClient.name}</p>
                <p className="text-slate-500 font-mono text-[10px]">{directInvoiceClient.phone}</p>
              </div>

              {/* Burger name selector */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8.5px] font-bold text-slate-400 block mb-0.5 uppercase">Hambúrguer Vendido</label>
                  <input 
                    type="text" 
                    value={directInvoiceBurger} 
                    onChange={(e) => setDirectInvoiceBurger(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-bold text-slate-800 outline-none"
                    placeholder="Nome do burger"
                  />
                </div>
                <div>
                  <label className="text-[8.5px] font-bold text-slate-400 block mb-0.5 uppercase">Preço Base (Kz)</label>
                  <input 
                    type="number" 
                    value={directInvoiceValue} 
                    onChange={(e) => setDirectInvoiceValue(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-mono font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Adjusts */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                <div>
                  <label className="text-[8.5px] font-bold text-slate-400 block mb-0.5 uppercase">Taxa de Entrega</label>
                  <input 
                    type="number" 
                    value={activeInvoiceDeliveryFee} 
                    onChange={(e) => setActiveInvoiceDeliveryFee(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[8.5px] font-bold text-slate-400 block mb-0.5 uppercase">Desconto (Kz)</label>
                  <input 
                    type="number" 
                    value={activeInvoiceDiscount} 
                    onChange={(e) => setActiveInvoiceDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-xs font-bold text-red-650 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[8.5px] font-bold text-slate-400 block mb-0.5 uppercase">Meio de Pago</label>
                  <select 
                    value={activeInvoicePaymentMethod} 
                    onChange={(e) => setActiveInvoicePaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1.5 text-[10px] font-bold text-slate-800 outline-none"
                  >
                    <option value="Multicaixa">Multicaixa</option>
                    <option value="Cash (Dinheiro)">Dinheiro</option>
                    <option value="Transferência Express">TPA / Express</option>
                    <option value="Banco / IBAN">Banco / IBAN</option>
                  </select>
                </div>
              </div>

              {/* Notas de agradecimento */}
              <div>
                <label className="text-[8.5px] font-bold text-slate-400 block mb-0.5 uppercase">Notas no WhatsApp</label>
                <input 
                  type="text" 
                  value={directInvoiceNotes} 
                  onChange={(e) => setDirectInvoiceNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none font-sans"
                />
              </div>
            </div>

            {/* Cupom térmico real mini preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[9px] text-slate-800 leading-normal relative overflow-hidden max-h-[160px] overflow-y-auto scrollbar-thin">
              <div className="text-center pb-1.5 border-b border-dashed border-slate-300">
                <span className="font-sans font-black uppercase text-slate-900 block text-[10px]">💰 BURGUERSPRIME 💰</span>
                <span className="text-[7.5px] text-slate-400 block uppercase">Fatura Manual Directa</span>
              </div>
              <div className="space-y-0.5 py-1.5">
                <div className="flex justify-between">
                  <span>DOCUMENTO:</span>
                  <span className="font-black">{activeInvoiceNum}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENTE:</span>
                  <span className="font-black truncate max-w-[120px]">{directInvoiceClient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>ITEM:</span>
                  <span className="font-sans font-semibold">{directInvoiceBurger}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-1 mt-1 font-bold">
                  <span>TOTAL GERAL:</span>
                  <span className="text-emerald-700 font-black font-mono">
                    {(directInvoiceValue + activeInvoiceDeliveryFee - activeInvoiceDiscount).toLocaleString()} Kz
                  </span>
                </div>
              </div>
              <div className="text-center text-[7.5px] text-slate-400 border-t border-dashed border-slate-200 pt-1 mt-1 leading-tight italic">
                {directInvoiceNotes}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              <button
                type="button"
                onClick={() => setShowDirectInvoiceModal(false)}
                className="py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-705 font-bold transition text-center"
              >
                Cancelar
              </button>
              <a
                href={getWhatsAppInvoiceLink(
                  directInvoiceClient.name, 
                  directInvoiceClient.phone, 
                  directInvoiceBurger, 
                  directInvoiceValue, 
                  activeInvoiceNum, 
                  activeInvoiceDeliveryFee, 
                  activeInvoiceDiscount
                )}
                target="_blank"
                rel="noreferrer"
                className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-center shadow flex items-center justify-center gap-1 transition-all text-decoration-none"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>Mandar WA 💬</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 6. Invoice Generator Modal from readings list */}
      {selectedInvoiceOrder && (
        <InvoiceGeneratorModal
          order={selectedInvoiceOrder}
          ticketMedio={config.ticketMedio}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

    </div>
  );
}
