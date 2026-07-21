const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Printer } from "lucide-react";
import { PageLoader, EmptyState } from "@/pages/Dashboard";
import { PRINTER_TYPES } from "@/lib/format";

const empty = { client_id: "", marca: "", modelo: "", numero_serie: "", tipo: "laser", observacoes: "" };

export default function Impressoras() {
  const [printers, setPrinters] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        db.entities.Printer.list("-created_date", 300),
        db.entities.Client.list("-created_date", 300),
      ]);
      setPrinters(p || []);
      setClients(c || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const clientName = (id) => clients.find((c) => c.id === id)?.nome || "—";
  const filtered = printers.filter((p) => !search || `${p.marca} ${p.modelo}`.toLowerCase().includes(search.toLowerCase()) || clientName(p.client_id).toLowerCase().includes(search.toLowerCase()));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing.id) await db.entities.Printer.update(editing.id, editing);
      else await db.entities.Printer.create(editing);
      setOpen(false); load();
    } finally { setSaving(false); }
  };
  const remove = async (p) => {
    if (!confirm(`Excluir a impressora ${p.marca} ${p.modelo}?`)) return;
    await db.entities.Printer.delete(p.id); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Impressoras</h1>
          <p className="text-sm text-slate-500 mt-1">{printers.length} cadastrada(s)</p>
        </div>
        <Button onClick={() => { setEditing({ ...empty }); setOpen(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-1" />Nova</Button>
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por marca, modelo ou cliente..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState icon={Printer} title="Nenhuma impressora" desc="Cadastre os equipamentos dos seus clientes." action={<Button onClick={() => { setEditing({ ...empty }); setOpen(true); }} variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>} />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 p-3">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{p.marca} {p.modelo}</div>
                    <div className="text-xs text-slate-400 mt-0.5">N/S: {p.numero_serie || "—"}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing({ ...p }); setOpen(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(p)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{PRINTER_TYPES[p.tipo] || p.tipo}</span>
                  <span className="text-xs text-slate-500 truncate">· {clientName(p.client_id)}</span>
                </div>
                {p.observacoes && <div className="text-xs text-slate-400 mt-2 line-clamp-2">{p.observacoes}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar Impressora" : "Nova Impressora"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={save} className="space-y-3">
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Cliente *</Label>
                <Select value={editing.client_id} onValueChange={(v) => setEditing({ ...editing, client_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-slate-500 mb-1 block">Marca *</Label><Input value={editing.marca} onChange={(e) => setEditing({ ...editing, marca: e.target.value })} required /></div>
                <div><Label className="text-xs text-slate-500 mb-1 block">Modelo *</Label><Input value={editing.modelo} onChange={(e) => setEditing({ ...editing, modelo: e.target.value })} required /></div>
                <div><Label className="text-xs text-slate-500 mb-1 block">Nº de Série</Label><Input value={editing.numero_serie} onChange={(e) => setEditing({ ...editing, numero_serie: e.target.value })} /></div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Tipo</Label>
                  <Select value={editing.tipo} onValueChange={(v) => setEditing({ ...editing, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRINTER_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs text-slate-500 mb-1 block">Observações</Label><Input value={editing.observacoes} onChange={(e) => setEditing({ ...editing, observacoes: e.target.value })} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">{saving ? "Salvando..." : "Salvar"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}