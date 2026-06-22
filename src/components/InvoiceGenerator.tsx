import React, { useState } from "react";
import { Printer, MessageSquare, Download, X, FileText, Percent, Truck, Wallet } from "lucide-react";

export interface InvoiceData {
  id: string;
  invoiceNum: string;
  name: string;
  phone: string;
  burger: string;
  value: number;
  time?: string;
  status?: string;
}

interface InvoiceGeneratorProps {
  order: InvoiceData;
  onClose: () => void;
  ticketMedio: number;
}

export function generateHTMLInvoice(order: {
  invoiceNum: string;
  name: string;
  phone: string;
  burger: string;
  value: number;
  paymentMethod: string;
  deliveryFee: number;
  discount: number;
  notes?: string;
  time?: string;
}) {
  const dateStr = new Date().toLocaleDateString("pt-PT");
  const subtotal = order.value;
  const delivery = order.deliveryFee || 0;
  const disc = order.discount || 0;
  const total = subtotal + delivery - disc;

  return `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <title>Fatura Recibo #${order.invoiceNum}</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          background-color: #f1f5f9;
          margin: 0;
          padding: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: #0f172a;
        }
        .container {
          width: 100%;
          max-width: 380px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .brand {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 2px;
          margin: 0;
          text-transform: uppercase;
        }
        .sub-brand {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
        }
        .status-badge {
          display: inline-block;
          font-size: 9px;
          background: #d1fae5;
          color: #065f46;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 4px;
          margin-top: 8px;
          text-transform: uppercase;
        }
        .divider {
          border-top: 1px dashed #94a3b8;
          margin: 14px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 5px;
        }
        .info-label {
          color: #64748b;
        }
        .info-value {
          font-weight: bold;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: bold;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .grand-total {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: 900;
          border-top: 2px solid #0f172a;
          padding-top: 8px;
          margin-top: 10px;
        }
        .footer-text {
          text-align: center;
          font-size: 10px;
          color: #64748b;
          margin-top: 20px;
          line-height: 1.4;
        }
        .btn-print {
          display: block;
          width: 100%;
          background: #d97706;
          color: white;
          text-align: center;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: bold;
          border: none;
          margin-top: 20px;
          cursor: pointer;
        }
        @media print {
          body {
            background-color: white;
            padding: 0;
            display: block;
          }
          .container {
            border: none;
            box-shadow: none;
            padding: 0;
            margin: 0 auto;
            max-width: 100%;
          }
          .btn-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <p class="brand">🍔 BURGUERSPRIME 🍔</p>
          <div class="sub-brand">Hamburgueria Comercial • Luanda</div>
          <span class="status-badge">Pago & Confirmado</span>
        </div>

        <div class="info-row">
          <span class="info-label">FATURA RECIBO:</span>
          <span class="info-value">#${order.invoiceNum}</span>
        </div>
        <div class="info-row">
          <span class="info-label">DATA EMISSÃO:</span>
          <span class="info-value">${dateStr} às ${order.time || "00:00"}</span>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <span class="info-label">CILENTE:</span>
          <span class="info-value">${order.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">CONTACTO WA:</span>
          <span class="info-value">${order.phone}</span>
        </div>

        <div class="divider"></div>

        <div class="item-header">
          <span>Qtd / Descrição</span>
          <span>Total (Kz)</span>
        </div>
        <div class="info-row" style="font-size: 13px;">
          <span class="info-value">1x ${order.burger}</span>
          <span class="info-value">${subtotal.toLocaleString()} Kz</span>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <span class="info-label">SUBTOTAL:</span>
          <span>${subtotal.toLocaleString()} Kz</span>
        </div>
        ${delivery > 0 ? `
        <div class="info-row">
          <span class="info-label">TAXA DE ENTREGA:</span>
          <span>+${delivery.toLocaleString()} Kz</span>
        </div>
        ` : ""}
        ${disc > 0 ? `
        <div class="info-row" style="color: #dc2626;">
          <span class="info-label">DESCONTO COMERCIAL:</span>
          <span>-${disc.toLocaleString()} Kz</span>
        </div>
        ` : ""}

        <div class="grand-total">
          <span>TOTAL GERAL:</span>
          <span>${total.toLocaleString()} Kz</span>
        </div>

        <div class="info-row" style="margin-top: 8px;">
          <span class="info-label">FORMA DE PAGAMENTO:</span>
          <span class="info-value">${order.paymentMethod}</span>
        </div>

        <div class="divider"></div>

        <div class="footer-text">
          ${order.notes || "Muito obrigado pela sua preferência! O seu faturamento ajuda-nos a crescer."}
          <br><br>
          <i>BURGUERSPRIME - Sabor Sem Limites</i> ✨
        </div>

        <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar em PDF</button>
      </div>
      <script>
        // Imprime automaticamente o voucher se aberto
      </script>
    </body>
    </html>
  `;
}

export function InvoiceGeneratorModal({ order, onClose, ticketMedio }: InvoiceGeneratorProps) {
  const [invoiceNum, setInvoiceNum] = useState<string>(order.invoiceNum || `FT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("Multicaixa");
  const [notes, setNotes] = useState<string>("Agradecemos imenso a sua preferência! Bom Apetite.");

  const subtotal = order.value || ticketMedio;
  const total = subtotal + deliveryFee - discount;

  const handleOpenPrintFrame = () => {
    const html = generateHTMLInvoice({
      invoiceNum,
      name: order.name,
      phone: order.phone,
      burger: order.burger,
      value: subtotal,
      paymentMethod,
      deliveryFee,
      discount,
      notes,
      time: order.time,
    });

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      alert("Para abrir a fatura imprimível, por favor permita pop-ups para este site.");
    }
  };

  const getStructuredText = () => {
    const formattedDate = new Date().toLocaleDateString("pt-PT");
    const formattedTime = order.time || new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

    return `*🍔 BURGUERSPRIME - FATURA RECIBO*
*DOCUMENTO:* #${invoiceNum}
*DATA DE EMISSÃO:* ${formattedDate} às ${formattedTime}
----------------------------------------
*DADOS DO CLIENTE:*
👤 *Nome:* ${order.name}
📞 *Contacto WA:* ${order.phone}

*DETALHES DO PEDIDO:*
🍔 1x *${order.burger}* - ${subtotal.toLocaleString()} Kz

*MONTRATIVO FINANCEIRO:*
• Subtotal Pedido: ${subtotal.toLocaleString()} Kz
• Taxa de Entrega: ${deliveryFee.toLocaleString()} Kz
• Desconto Aplicado: -${discount.toLocaleString()} Kz
*TOTAL GERAL PAGO:* *${total.toLocaleString()} Kz*

*CONDIÇÃO DE ENTREGA & LIQUIDAÇÃO:*
✅ *CONFIRMADO & REGISTADO*
💳 *Método de Pagamento:* ${paymentMethod}
----------------------------------------
_${notes}_ ✨ Fries & Shakes 🍟🥤`;
  };

  const handleShareWhatsApp = () => {
    const text = getStructuredText();
    const cleanPhone = order.phone.replace(/[^0-9]/g, "");
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleDownloadTxt = () => {
    const text = getStructuredText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fatura-${invoiceNum}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-fade-in font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0 bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-500" />
              Geração Especial de Fatura
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Fature, ajuste e exporte em múltiplos formatos comerciais</p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-200/50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs font-sans">
          
          {/* Order Snapshot */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase">👤 Cliente Comercial</span>
              <p className="font-extrabold text-slate-900 text-xs mt-0.5 truncate">{order.name}</p>
              <p className="text-slate-500 font-mono text-[9px] mt-0.5">{order.phone}</p>
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase">🍔 Item Composto</span>
              <p className="font-extrabold text-slate-900 text-xs mt-0.5 truncate">{order.burger}</p>
              <p className="text-slate-500 font-mono text-[9px] mt-0.5">{subtotal.toLocaleString()} Kz</p>
            </div>
          </div>

          {/* Form Tuning */}
          <div className="space-y-3">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">
              Parametrização & Descontos das Faturas
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3 text-slate-400" /> Num. Documento
                </label>
                <input 
                  type="text" 
                  value={invoiceNum}
                  onChange={(e) => setInvoiceNum(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 outline-none focus:border-amber-505"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                  <Wallet className="w-3 h-3 text-slate-400" /> Método de Pago
                </label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 outline-none focus:border-amber-505"
                >
                  <option value="Multicaixa">Multicaixa</option>
                  <option value="Cash (Dinheiro)">Cash (Dinheiro)</option>
                  <option value="Transferência Express">Transferência Express</option>
                  <option value="Banco / IBAN">Banco / IBAN</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                  <Truck className="w-3 h-3 text-slate-400" /> Taxa de Entrega (Kz)
                </label>
                <input 
                  type="number" 
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 outline-none focus:border-amber-505"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                  <Percent className="w-3 h-3 text-slate-400" /> Desconto Comercial (Kz)
                </label>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-red-650 outline-none focus:border-amber-505"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                Agradecimento de Fecho
              </label>
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-sans text-slate-800 outline-none focus:border-amber-505"
                placeholder="Ex: Obrigado pelo preferência"
              />
            </div>
          </div>

          {/* Thermal Receipt Preview */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 relative overflow-hidden font-mono text-[9px] text-slate-800 space-y-2 border-t-4 border-t-amber-500">
            <div className="text-center pb-2 border-b border-dashed border-slate-300">
              <span className="font-sans font-black text-xs uppercase text-slate-900 block tracking-widest">💰 BURGUERSPRIME 💰</span>
              <span className="text-[8px] text-slate-400 block font-bold uppercase">Pre-Visualização Térmica</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>DOCUMENTO:</span>
                <span className="font-extrabold text-slate-900">#{invoiceNum}</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENTE:</span>
                <span className="font-extrabold text-slate-900 truncate max-w-[130px]">{order.name}</span>
              </div>
              <div className="flex justify-between">
                <span>COMPRA CHAPA:</span>
                <span className="font-sans font-bold text-slate-900">{order.burger}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-1.5 mt-1">
              <div className="flex justify-between text-slate-500">
                <span>SUBTOTAL PEDIDO:</span>
                <span>{subtotal.toLocaleString()} Kz</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>TAXA TRANSPORTE:</span>
                  <span>+{deliveryFee.toLocaleString()} Kz</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>DESCONTO:</span>
                  <span>-{discount.toLocaleString()} Kz</span>
                </div>
              )}
              <div className="flex justify-between font-black text-slate-950 text-xs mt-1.5 pt-1 border-t border-slate-900">
                <span>NÉLIQUIDO RECEPTÁVEL:</span>
                <span className="font-mono text-emerald-700">{total.toLocaleString()} Kz</span>
              </div>
            </div>

            <div className="text-center text-[7.5px] italic text-slate-400 mt-2 border-t border-dashed border-slate-250 pt-1.5">
              {notes}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5 shrink-0 select-none">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] rounded-xl text-center flex items-center justify-center gap-1 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ficheiro Texto</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPrintFrame}
            className="flex-1 py-2 bg-amber-500 hover:bg-amber-655 text-white font-black text-[10px] rounded-xl text-center flex items-center justify-center gap-1 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir PDF 🖨️</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-xl text-center flex items-center justify-center gap-1 transition shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-current" />
            <span>Partilhar WA 💬</span>
          </button>
        </div>

      </div>
    </div>
  );
}
