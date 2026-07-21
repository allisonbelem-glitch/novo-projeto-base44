export const STATUS_LABELS = {
  em_analise: "Em Análise",
  orcamento_pendente: "Orçamento Pendente",
  aprovado: "Aprovado",
  em_manutencao: "Em Manutenção",
  pronto_retirada: "Pronto p/ Retirada",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export const STATUS_COLORS = {
  em_analise: "bg-slate-100 text-slate-700",
  orcamento_pendente: "bg-amber-100 text-amber-700",
  aprovado: "bg-blue-100 text-blue-700",
  em_manutencao: "bg-violet-100 text-violet-700",
  pronto_retirada: "bg-teal-100 text-teal-700",
  finalizado: "bg-emerald-100 text-emerald-700",
  cancelado: "bg-rose-100 text-rose-700",
};

export const PRINTER_TYPES = {
  laser: "Laser",
  jato_tinta: "Jato de Tinta",
  termica: "Térmica",
  matricial: "Matricial",
  multifuncional: "Multifuncional",
};

export function formatBRL(value) {
  const n = Number(value || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}