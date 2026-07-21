const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import OrderItemEditor from "@/components/OrderItemEditor";
import { PageLoader } from "@/pages/Dashboard";
import { formatBRL, formatDate, formatDateTime, STATUS_LABELS, STATUS_COLORS, PRINTER_TYPES } from "@/lib/format";
import { ArrowLeft, Printer as PrinterIcon, Save, Check } from "lucide-react";

export default function OrdemDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [o, p, cp] = await Promise.all([
          db.entities.ServiceOrder.get(id),
          db.entities.Product.list("-created_date", 300),
          db.entities.CompanyProfile.list("-created_date", 1),
        ]);
        setOrder(o);
        setProducts(p || []);
        setCompany(cp && cp[0]);
      } finally { setLoading(false); }
    })();
  }, [id]);

  const set = (k, v) => setOrder((o) => ({ ...o, [k]: v }));
  const total = (order?.itens || []).reduce((s, it) => s + Number(it.subtotal || 0), 0) - Number(order?.desconto || 0);

  const save = async () => {
    setSaving(true);
    try {
      await db.entities.ServiceOrder.update(order.id, { ...order, total: Math.max(total, 0), desconto: Number(order.desconto) || 0 });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally { setSaving(false); }
  };

  const print = () => window.print();

  if (loading) return <PageLoader />;
  if (!order) return <div className="text-center py-20 text-slate-500">Ordem não encontrada.</div>;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/ordens")}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">#{order.numero}</h1>
              <Badge variant="outline">{order.kind === "orcamento" ? "Orçamento" : "OS"}</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Aberta em {formatDateTime(order.created_date)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={print}><PrinterIcon className="h-4 w-4 mr-1" />Imprimir</Button>
          <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saved ? <><Check className="h-4 w-4 mr-1" />Salvo!</> : <><Save className="h-4 w-4 mr-1" />{saving ? "Salvando..." : "Salvar"}</>}
          </Button>
        </div>
      </div>

      {/* Printable document */}
      <Card className="border-slate-200 shadow-none print:border-0 print:shadow-none">
        <CardContent className="p-6 print:p-0">
          {company && (
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-5">
              <div className="flex items-center gap-3">
                {company.logo_url ? (
                  <img src={company.logo_url} alt="logo" className="h-12 w-12 object-contain rounded-lg" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {(company.nome_fantasia || "T").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-900 text-lg">{company.nome_fantasia || "—"}</div>
                  <div className="text-xs text-slate-500">{company.razao_social}{company.cnpj ? ` · CNPJ: ${company.cnpj}` : ""}</div>
                  <div className="text-xs text-slate-500">{[company.endereco, company.cidade, company.estado, company.cep].filter(Boolean).join(" · ")}</div>
                  <div className="text-xs text-slate-500">{[company.telefone, company.email].filter(Boolean).join(" · ")}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{order.kind === "orcamento" ? "ORÇAMENTO" : "ORDEM DE SERVIÇO"}</div>
                <div className="text-sm font-mono text-slate-700">Nº {order.numero}</div>
                <div className="text-xs text-slate-500">{formatDate(order.created_date)}</div>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <InfoBlock title="Cliente">
              <div className="font-medium text-slate-900">{order.client_nome || "—"}</div>
            </InfoBlock>
            <InfoBlock title="Equipamento">
              <div className="text-sm text-slate-700">{order.printer_desc || "—"}</div>
            </InfoBlock>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <InfoBlock title="Defeito Reclamado">
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{order.defeito_reclamado || "—"}</p>
            </InfoBlock>
            <InfoBlock title="Diagnóstico Técnico">
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{order.diagnostico || "—"}</p>
            </InfoBlock>
          </div>

          <div className="mb-4 print:hidden">
            <Label className="text-xs text-slate-500 mb-1 block">Status</Label>
            <Select value={order.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="hidden print:block mb-4">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
          </div>

          <div className="mb-5">
            <div className="text-sm font-semibold text-slate-700 mb-2">Itens</div>
            <div className="print:hidden">
              <OrderItemEditor itens={order.itens || []} products={products} onChange={(itens) => set("itens", itens)} />
            </div>
            <PrintItems itens={order.itens || []} />
          </div>

          <div className="flex flex-col items-end gap-2 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 print:hidden">
              <Label className="text-xs text-slate-500">Desconto (R$)</Label>
              <Input type="number" step="0.01" className="w-28 text-right" value={order.desconto} onChange={(e) => set("desconto", e.target.value)} />
            </div>
            <div className="flex items-center justify-between w-full sm:w-64 text-sm">
              <span className="text-slate-500">Desconto</span>
              <span className="text-slate-700">{formatBRL(order.desconto)}</span>
            </div>
            <div className="flex items-center justify-between w-full sm:w-64 text-base font-bold">
              <span className="text-slate-700">Total</span>
              <span className="text-slate-900">{formatBRL(Math.max(total, 0))}</span>
            </div>
            {order.data_previsao && (
              <div className="flex items-center justify-between w-full sm:w-64 text-sm">
                <span className="text-slate-500">Previsão de Entrega</span>
                <span className="text-slate-700">{formatDate(order.data_previsao)}</span>
              </div>
            )}
          </div>

          {order.observacoes && (
            <div className="mt-5 print:hidden">
              <Label className="text-xs text-slate-500 mb-1 block">Observações Internas</Label>
              <Textarea rows={2} value={order.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
            </div>
          )}

          {company?.termos_garantia && (
            <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-400 leading-relaxed">
              {company.termos_garantia}
            </div>
          )}

          <div className="mt-10 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <div className="border-t border-slate-300 pt-1">Assinatura do Técnico</div>
            </div>
            <div>
              <div className="border-t border-slate-300 pt-1">Assinatura do Cliente</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoBlock({ title, children }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-[11px] uppercase font-medium text-slate-400 mb-1">{title}</div>
      {children}
    </div>
  );
}

function PrintItems({ itens }) {
  if (!itens.length) return null;
  return (
    <div className="hidden print:block">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="text-left py-1">Descrição</th>
            <th className="text-center py-1 w-12">Qtd</th>
            <th className="text-right py-1 w-24">Unit.</th>
            <th className="text-right py-1 w-24">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((it, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-1">{it.descricao}</td>
              <td className="text-center">{it.quantidade}</td>
              <td className="text-right">{formatBRL(it.preco_unitario)}</td>
              <td className="text-right">{formatBRL(it.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}