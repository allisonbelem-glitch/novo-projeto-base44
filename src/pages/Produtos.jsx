const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";
import { PageLoader, EmptyState } from "@/pages/Dashboard";
import { formatBRL } from "@/lib/format";

const empty = { nome: "", descricao: "", kind: "peca", preco: 0 };

export default function Produtos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems((await db.entities.Product.list("-created_date", 300)) || []); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((p) => !search || p.nome?.toLowerCase().includes(search.toLowerCase()));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...editing, preco: Number(editing.preco) || 0 };
      if (editing.id) await db.entities.Product.update(editing.id, payload);
      else await db.entities.Product.create(payload);
      setOpen(false); load();
    } finally { setSaving(false); }
  };
  const remove = async (p) => {
    if (!confirm(`Excluir "${p.nome}"?`)) return;
    await db.entities.Product.delete(p.id); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produtos & Serviços</h1>
          <p className="text-sm text-slate-500 mt-1">{items.length} cadastrado(s)</p>
        </div>
        <Button onClick={() => { setEditing({ ...empty }); setOpen(true); }} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-1" />Novo</Button>
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState icon={Package} title="Nenhum produto/serviço" desc="Cadastre peças e serviços para usar nas ordens." action={<Button onClick={() => { setEditing({ ...empty }); setOpen(true); }} variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>} />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 p-3">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow bg-white flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 truncate">{p.nome}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.kind === "servico" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                      {p.kind === "servico" ? "Serviço" : "Peça"}
                    </span>
                  </div>
                  {p.descricao && <div className="text-xs text-slate-400 mt-1 line-clamp-2">{p.descricao}</div>}
                  <div className="font-semibold text-blue-600 mt-2">{formatBRL(p.preco)}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing({ ...p }); setOpen(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(p)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar" : "Novo Produto/Serviço"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={save} className="space-y-3">
              <div><Label className="text-xs text-slate-500 mb-1 block">Nome *</Label><Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} required /></div>
              <div><Label className="text-xs text-slate-500 mb-1 block">Descrição</Label><Input value={editing.descricao} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} /></div>
              <div>
                <Label className="text-xs text-slate-500 mb-1 block">Tipo</Label>
                <Select value={editing.kind} onValueChange={(v) => setEditing({ ...editing, kind: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peca">Peça</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-slate-500 mb-1 block">Preço (R$)</Label><Input type="number" step="0.01" value={editing.preco} onChange={(e) => setEditing({ ...editing, preco: e.target.value })} /></div>
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