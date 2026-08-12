export const fmtBRL = (n) => "R$ " + (n || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
export const fmtBRLk = (n) =>
  n >= 1000000 ? "R$ " + (n / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "M"
  : n >= 1000 ? "R$ " + (n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + "k"
  : fmtBRL(n);

export const FASES = [
  "Angariação", "Autorização de Venda", "Anúncio Ativo", "Com Propostas",
  "Em Negociação", "Análise Documental", "Cartório / Registro", "Finalizado",
];

export const ETAPAS = [
  { id: "lead", nome: "Novo Lead", cor: "#9A968A" },
  { id: "contato", nome: "Contato Realizado", cor: "#2E7D8C" },
  { id: "visita", nome: "Visita / Acesso", cor: "#1F5E6B" },
  { id: "proposta", nome: "Proposta Enviada", cor: "#C2913C" },
  { id: "negoc", nome: "Negociação", cor: "#B0543C" },
  { id: "doc", nome: "Documentação", cor: "#6B61C9" },
  { id: "assinado", nome: "Contrato Assinado", cor: "#2E9E5B" },
  { id: "ganho", nome: "Fechado / Ganho", cor: "#13674E" },
  { id: "semretorno", nome: "Sem Retorno", cor: "#D24B3E" },
];
