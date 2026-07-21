const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderItemEditor from "@/components/OrderItemEditor";
import { ArrowLeft, Save } from "lucide-react";
import { PageLoader } from "@/pages/Dashboard";
import { PRINTER_TYPES } from "@/lib/format";

export default function OrdemNova() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    client_id: "", client_nome: "", printer_id: "", printer_desc: "",
    kind: "os", status: "em_analise", defeito_reclamado: "", diagnostico: "",
    observacoes: "", desconto: 0, data_previsao: "", itens: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const [c, p, pr] = await Promise.all([
          db.entities.Client.list("-created_date", 300),
          db.entities.Printer.list("-created_date", 300),
          db.entities.Product.list("-created_date", 300),
        ]);
        setClients(c || []);
        setPrinters(p || []);
        setProducts(pr || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onClient = (id) => {
    const c = clients.find((x) => x.id === id);
    set("client_id", id);
    set("client_nome", c?.nome || "");
    // reset printer when client changes
    set("printer_id", "");
    set("printer_desc", "");
  };
  const onPrinter = (id) => {
    const p = printers.find((x) => x.id === id);
    set("printer_id", id);
    set("printer_desc", p ? `${p.marca} ${p.modelo}${p.numero_serie ? ` (S/N: ${p.numero_serie})` : ""}` : "");
  };

  const clientPrinters = printers.filter((p) => p.client_id === form.client_id);

  const total = form.itens.reduce((s, it) => s + Number(it.subtotal || 0), 0) - Number(form.desconto || 0);

  const save = async (e) => {
    e.preventDefault();
    if (!form.client_id) return;
    setSaving(true);
    try {
      // generate numero = count + 1
      const existing = await db.entities.ServiceOrder.list("-created_date", 500);
      const numero = (existing?.length || 0) + 1;
      await db.entities.ServiceOrder.create({
        ...form,
        numero,
        desconto: Number(form.desconto) || 0,
        total: Math.max(total, 0),
      });
      navigate("/ordens");
    } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/ordens")}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Ordem de Serviço</h1>
          <p className="text-sm text-slate-500 mt-0.5">Preencha os dados e adicione os itens</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <Card className="border-amber-200 bg-amber-50 shadow-none"><CardContent className="p-4 text-sm text-amber-800">Você precisa cadastrar um cliente antes de criar uma ordem.</CardContent></Card>
      ) : (
        <form onSubmit={save} className="space-y-5">
          <Card className="border-slate-200 shadow-none"><CardContent className="p-5 space-y-4">
            <SectionTitle>Cliente & Equipamento</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Cliente *</Label>
                <Select value={form.client_id} onValueChange={onClient}>
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Impressora</Label>
                <Select value={form.printer_id} onValueChange={onPrinter} disabled={!form.client_id}>
                  <SelectTrigger><SelectValue placeholder="Selecione o equipamento" /></SelectTrigger>
                  <SelectContent>
                    {clientPrinters.map((p) => <SelectItem key={p.id} value={p.id}>{p.marca} {p.modelo} — {PRINTER_TYPES[p.tipo]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Tipo</Label>
                <Select value={form.kind} onValueChange={(v) => set("kind", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="os">Ordem de Serviço</SelectItem>
                    <SelectItem value="orcamento">Orçamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Previsão de Entrega</Label>
                <Input type="date" value={form.data_previsao} onChange={(e) => set("data_previsao", e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Defeito Reclamado</Label>
              <Textarea rows={2} value={form.defeito_reclamado} onChange={(e) => set("defeito_reclamado", e.target.value)} placeholder="Descrição do problema relatado pelo cliente..." />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Diagnóstico Técnico</Label>
              <Textarea rows={2} value={form.diagnostico} onChange={(e) => set("diagnostico", e.target.value)} placeholder="Análise técnica do equipamento..." />
            </div>
          </CardContent></Card>

          <Card className="border-slate-200 shadow-none"><CardContent className="p-5 space-y-3">
            <SectionTitle>Itens (Peças & Serviços)</SectionTitle>
            <OrderItemEditor itens={form.itens} products={products} onChange={(itens) => set("itens", itens)} />
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-500">Desconto (R$)</Label>
                <Input type="number" step="0.01" className="w-28 text-right" value={form.desconto} onChange={(e) => set("desconto", e.target.value)} />
              </div>
              <div className="text-sm text-slate-500">Total: <span className="text-lg font-bold text-slate-900">{(Math.max(total, 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div>
            </div>
          </CardContent></Card>

          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Observações Internas</Label>
            <Textarea rows={2} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/ordens")}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700"><Save className="h-4 w-4 mr-1" />{saving ? "Salvando..." : "Criar Ordem"}</Button>
          </div>
        </form>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="text-sm font-semibold text-slate-700 pb-2 border-b border-slate-100">{children}</div>;
}