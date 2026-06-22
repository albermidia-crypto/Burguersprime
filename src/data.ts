import { ClientProfile, CommunicationScript, SetupConfig } from "./types";

/**
 * Returns a beautifully curated list of initial Angolan clients, complete with
 * visit frequencies, favorites, and historical metrics to showcase the pipeline immediately.
 */
export function getInitialClients(config: SetupConfig): ClientProfile[] {
  const ticket = config.ticketMedio;
  
  return [
    {
      id: "cli-1",
      name: "João Manuel",
      phone: "+244923112344",
      channel: "Instagram",
      favoriteBurger: "Cheddar Duplo com Bacon",
      dietaryRestrictions: "Nenhuma",
      visitFrequency: 4, 
      totalSpent: ticket * 14,
      lastVisitDaysAgo: 3,
      ratingsCount: 4,
      averageRating: 5,
      orderHistoryCount: 14,
      birthdayDate: "06-20",
    },
    {
      id: "cli-2",
      name: "Yuri Santos",
      phone: "+244912405192",
      channel: "WhatsApp",
      favoriteBurger: "Frango Crocante Catupiry",
      dietaryRestrictions: "Nenhuma",
      visitFrequency: 2,
      totalSpent: ticket * 3,
      lastVisitDaysAgo: 12, // Churn risk!
      ratingsCount: 1,
      averageRating: 4,
      orderHistoryCount: 3,
      birthdayDate: "03-12",
    },
    {
      id: "cli-3",
      name: "Kieza Leitão",
      phone: "+244931880120",
      channel: "Indicação",
      favoriteBurger: "Bacon Supremo & Alho",
      dietaryRestrictions: "Sem Glúten",
      visitFrequency: 5, // Ambassador
      totalSpent: ticket * 28,
      lastVisitDaysAgo: 2,
      ratingsCount: 8,
      averageRating: 5,
      orderHistoryCount: 28,
      birthdayDate: "11-05",
    },
    {
      id: "cli-4",
      name: "Jandira Neto",
      phone: "+244945009511",
      channel: "Instagram",
      favoriteBurger: "Smash Duplo BBQ",
      dietaryRestrictions: "Sem lactose",
      visitFrequency: 3,
      totalSpent: ticket * 9,
      lastVisitDaysAgo: 5,
      ratingsCount: 3,
      averageRating: 5,
      orderHistoryCount: 9,
      birthdayDate: "08-22",
    },
    {
      id: "cli-5",
      name: "Adilson Francisco",
      phone: "+244923456789",
      channel: "WhatsApp",
      favoriteBurger: "Super Blaster Angus",
      dietaryRestrictions: "Nenhuma",
      visitFrequency: 3, // Loyal customer at risk!
      totalSpent: ticket * 8,
      lastVisitDaysAgo: 11, // High Churn risk!
      ratingsCount: 2,
      averageRating: 4.5,
      orderHistoryCount: 8,
      birthdayDate: "06-18", // Birthday soon (June 18)!
    },
    {
      id: "cli-6",
      name: "Miriam Cruz",
      phone: "+244911300450",
      channel: "Instagram",
      favoriteBurger: "Smash Vegano Especial",
      dietaryRestrictions: "Vegano",
      visitFrequency: 4, // Ambassador
      totalSpent: ticket * 22,
      lastVisitDaysAgo: 4,
      ratingsCount: 5,
      averageRating: 5,
      orderHistoryCount: 22,
      birthdayDate: "12-01",
    },
    {
      id: "cli-7",
      name: "Carlos Batalha",
      phone: "+244933221445",
      channel: "Indicação",
      favoriteBurger: "Duplo com Ovo & Queijo",
      dietaryRestrictions: "Nenhuma",
      visitFrequency: 1,
      totalSpent: ticket * 1,
      lastVisitDaysAgo: 15,
      ratingsCount: 1,
      averageRating: 4,
      orderHistoryCount: 1,
      birthdayDate: "02-14",
    },
    {
      id: "cli-8",
      name: "Sandra Gomes",
      phone: "+244922101202",
      channel: "WhatsApp",
      favoriteBurger: "Smash Burger Simples",
      dietaryRestrictions: "Nenhuma",
      visitFrequency: 2,
      totalSpent: ticket * 2,
      lastVisitDaysAgo: 6,
      ratingsCount: 0,
      averageRating: 0,
      orderHistoryCount: 2,
      birthdayDate: "09-09",
    },
    {
      id: "cli-9",
      name: "Wilson Cabral",
      phone: "+244947122344",
      channel: "Instagram",
      favoriteBurger: "Premium Picanha Burger",
      dietaryRestrictions: "Nenhuma",
      visitFrequency: 1,
      totalSpent: ticket * 1,
      lastVisitDaysAgo: 8,
      ratingsCount: 0,
      averageRating: 0,
      orderHistoryCount: 1,
      birthdayDate: "07-04",
    },
    {
      id: "cli-10",
      name: "Neusa Silveira",
      phone: "+244931444555",
      channel: "WhatsApp",
      favoriteBurger: "Super Blend de Costela",
      dietaryRestrictions: "Nenhuma",
      visitFrequency: 1,
      totalSpent: 0,
      lastVisitDaysAgo: 0,
      ratingsCount: 0,
      averageRating: 0,
      orderHistoryCount: 0,
      birthdayDate: "10-25",
    }
  ];
}

export const INITIAL_COMMUNICATION_SCRIPTS: CommunicationScript[] = [
  {
    id: "script-1",
    title: "1. Primeiro Contacto — Boas-vindas",
    category: "vendas",
    description: "Para enviar assim que um cliente novo mandar mensagem a perguntar o preçário no WhatsApp ou Instagram.",
    text: `*👋 Olá! Seja muito bem-vindo à nossa hamburgueria {{NOME_BURGER}}!* 🍔⚡\n\nAqui o fogo é a sério e os nossos smashs são preparados com carne fresca 100% de primeira e pão brioche super fofinho.\n\nQual é o teu desejo para hoje? Queres receber o nosso Menu Completo em formato PDF ou queres fazer logo o teu pedido ao balcão?\n\n*Prepara a tua fome!* 🚀`
  },
  {
    id: "script-2",
    title: "2. Confirmação de Pedido & Tempo",
    category: "pos-venda",
    description: "Mensagem imediata após fechar o pedido, garantindo clareza e credibilidade.",
    text: `*✅ PEDIDO CONFIRMADO NA CHAPA DA {{NOME_BURGER}}!*\n\nParceiro(a) *{{CLIENTE_NOME}}*, o teu pedido foi anotado com sucesso e já está nas mãos do mestre do grelhador!\n\n*Detalhes da Entrega:*\n🍔 Favorito: {{CLIENTE_FAVORITO}}\n🕒 Tempo Estimado de Preparação e Entrega: 30 a 45 minutos\n💵 Valor a Pagar: {{VALOR_TOTAL}} Kz\n\nQualquer contratempo, podes mandar mensagem direta por aqui. O teu kumbu de sabor está a caminho! 🚴🔥`
  },
  {
    id: "script-3",
    title: "3. Follow-up 7 Dias sem Compra",
    category: "vendas",
    description: "Estímulo após uma semana sem ver o cliente, lembrando suavemente e estimulando retorno.",
    text: `*👋 Olá, {{CLIENTE_NOME}}! Tudo bem por aí?*\n\nJá faz 7 dias que não vemos o teu nome na nossa lista de pedidos diários da {{NOME_BURGER}}. Estamos a preocupar-nos com o teu nível de felicidade burger! 😂\n\nQue tal matar a saudade hoje? O nosso *{{CLIENTE_FAVORITO}}* está a sair mesmo quentinho e suculento hoje.\n\n*Basta dizer 'EU QUERO' e enviamos-te com entrega gratuita!* 🚀`
  },
  {
    id: "script-4",
    title: "4. Reactivação após 14 Dias",
    category: "reativacao",
    description: "Alerta de reactivação imperdível para resgatar o cliente ausente temporariamente.",
    text: `*💔 {{CLIENTE_NOME}}, o nosso grelhador está triste sem ti!*\n\nLá se vão duas semanas completas (14 dias) que não vens repor energias com a gente. Para acabar com esta saudade de forma saborosa...\n\nNo teu pedido de hoje, nós *OFERECEMOS uma dose extra de batatas fritas super crocantes* de Angola ou uma bebida gelada!\n\n*Vai um burger hoje? Responde 'CHAPA QUENTE' para activar!* 🍟🔥`
  },
  {
    id: "script-5",
    title: "5. Pedido de Avaliação Google",
    category: "pos-venda",
    description: "Disparar 1 hora depois da entrega para construir prova social e expandir posicionamento local.",
    text: `*⭐ Olá, {{CLIENTE_NOME}}! O teu estômago está feliz?*\n\nQueremos muito saber como correu a tua experiência com o nosso *{{CLIENTE_FAVORITO}}* hoje! Se gostaste do sabor e do carinho...\n\nPodes deixar 5 estrelas e uma breve avaliação no nosso perfil? Ajuda muito a nossa hamburgueria familiar a crescer em Angola!\n\n*Deixa a tua crítica aqui:* [Link do Google Maps]\n\nMuito obrigado pelo apoio e bom proveito! 🙌🍔`
  },
  {
    id: "script-6",
    title: "6. Aniversário do Cliente (+ Desconto)",
    category: "fidelidade",
    description: "Tratamento VIP no dia do aniversário do cliente para fidelizar e lucrar com mesas de festa.",
    text: `*🎉 MUITOS PARABÉNS, {{CLIENTE_NOME}}! QUE SEJA UM DIA MEGA CHAPA QUENTE!* 🎂🕺\n\nA {{NOME_BURGER}} deseja-te muita saúde, prosperidade, e claro, muitos hambúrgueres de primeira!\n\nComo presente da casa no teu dia especial, preparámos um *Desconto Exclusivo de 20% no teu pedido* de aniversário ou, se preferires vir com mais 3 amigos ao balcão, o *TEU hambúrguer sai totalmente grátis*!\n\n*Marca a tua hora de alegria:* [Link de Reservas]`
  },
  {
    id: "script-7",
    title: "7. Promoção de Fim de Semana",
    category: "vendas",
    description: "Disparo colectivo nas sextas-feiras ou sábados de manhã para explodir o stock regulado.",
    text: `*🔥 O FINAL DE SEMANA COMEÇOU NA {{NOME_BURGER}}!*\n\nNão deves cozinhar ao fim de semana! É lei dos esfomeados de Angola! 😎\n\nPor isso, trazemos o nosso *Combo dos Vencedores*:\n👉 2 Burgers Premium à escolha\n👉 1 Dose de Batatas Rústicas com tempero da casa\n👉 2 Refrigerantes em lata gelados\n\nPor apenas *{{VALOR_PROMO}} Kz* (Economizas mais de 1.500 Kz!)\n\n*Faz já a encomenda antes que acabe o stock das carnes frescas:* [Link]`
  },
  {
    id: "script-8",
    title: "8. Convite ao Clube de Fidelidade",
    category: "fidelidade",
    description: "Apresentar as vantagens adicionais de compra recorrente para converter embaixadores.",
    text: `*✨ QUERES COMER BURGERS DE GRAÇA, {{CLIENTE_NOME}}?*\n\nInscreveste-te no nosso Programa de Fidelidade BURGUERSPRIME! É muito simples, rápido e transparente:\n\n1️⃣ Cada pedido que fazes ganhas 1 ponto.\n2️⃣ Ao atingires 5 pontos (pedidos), o teu próximo Burger Simples ao balcão é totalmente gratuito!\n\n*Queres fazer o teu pedido agora e começar a acumular pontos? Basta responder SIM!* 📊🍔`
  },
  {
    id: "script-9",
    title: "9. Ganhaste Hambúrguer Grátis (5 pedidos!)",
    category: "fidelidade",
    description: "Momento glorioso de validação do cliente ao completar sua jornada de 5 compras.",
    text: `*🏆 PARABÉNS, {{CLIENTE_NOME}}! CHEGASTE AO TOPO DO SABOR!* 🏆\n\nConcluíste com sucesso o teu 5º pedido connosco e acumulaste 5 pontos de ouro no BURGUERSPRIME CRM!\n\nComo combinado, a tua fidelidade merece recompensa: o teu próximo *Hambúrguer Clássico à escolha de borla (100% gratuito)*! 🎉🍔\n\n*Dispara mensagem para o nosso atendente e diz 'RESGATAR MEU PREMIO' na tua próxima entrega! Amamos ter-te por cá!*`
  },
  {
    id: "script-10",
    title: "10. Agradecimento por Indicação de Amigo",
    category: "pos-venda",
    description: "Incentivo viral passivo agradecendo ao embaixador quando o amigo fecha a primeira compra.",
    text: `*❤️ OBRIGADO PELA TUA CONFIANÇA, {{CLIENTE_NOME}}! INDICAÇÃO É VIDA!*\n\nO teu amigo(a) indicado acabou de fazer o primeiro pedido dele connosco e adorou!\n\nComo agradecimento por teres espalhado a palavra da nossa chapa {{NOME_BURGER}}, creditamos um *Cupão de Desconto de 1.000 Kz no teu perfil* para uso imediato no próximo final de semana!\n\n*O teu apoio faz-nos continuar acesos! Pede já a tua recompensa:* [Link]`
  }
];
