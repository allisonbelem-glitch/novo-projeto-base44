const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Pencil, Trash2, Users, Phone, Mail } from "lucide-react";
import { PageLoader, EmptyState } from "@/pages/Dashboard";

const empty = { nome: "", cpf_cnpj: "", telefone: "", email: "", endereco: "", cidade: "", estado: "", cep: "", observacoes: "" };

export default function Clientes() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await db.entities.Client.list("-created_date", 200);
      setClients(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = clients.filter((c) =>
    !search || c.nome?.toLowerCase().includes(search.toLowerCase()) || c.telefone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing({ ...empty }); setOpen(true); };
  const openEdit = (c) => { setEditing({ ...c }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing.id) await db.entities.Client.update(editing.id, editing);
      else await db.entities.Client.create(editing);
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Excluir o cliente "${c.nome}"?`)) return;
    await db.entities.Client.delete(c.id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">{clients.length} cadastrado(s)</p>
        </div>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-1" />Novo Cliente</Button>
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por nome, telefone ou e-mail..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum cliente" desc="Cadastre seus clientes para vincular às ordens de serviço." action={<Button onClick={openNew} variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>} />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 p-3">
            {filtered.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{c.nome}</div>
                    {c.cpf_cnpj && <div className="text-xs text-slate-400">{c.cpf_cnpj}</div>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(c)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  {c.telefone && <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />{c.telefone}</div>}
                  {c.email && <div className="flex items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5 text-slate-400" />{c.email}</div>}
                  {(c.cidade || c.estado) && <div className="text-xs text-slate-400">{[c.cidade, c.estado].filter(Boolean).join(" - ")}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar Cliente" : "Novo Cliente"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome *" className="col-span-2">
                  <Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} required />
                </Field>
                <Field label="CPF/CNPJ"><Input value={editing.cpf_cnpj} onChange={(e) => setEditing({ ...editing, cpf_cnpj: e.target.value })} /></Field>
                <Field label="Telefone"><Input value={editing.telefone} onChange={(e) => setEditing({ ...editing, telefone: e.target.value })} /></Field>
                <Field label="E-mail" className="col-span-2"><Input value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
                <Field label="Endereço" className="col-span-2"><Input value={editing.endereco} onChange={(e) => setEditing({ ...editing, endereco: e.target.value })} /></Field>
                <Field label="Cidade"><Input value={editing.cidade} onChange={(e) => setEditing({ ...editing, cidade: e.target.value })} /></Field>
                <Field label="Estado"><Input value={editing.estado} onChange={(e) => setEditing({ ...editing, estado: e.target.value })} /></Field>
                <Field label="CEP"><Input value={editing.cep} onChange={(e) => setEditing({ ...editing, cep: e.target.value })} /></Field>
                <Field label="Observações" className="col-span-2"><Input value={editing.observacoes} onChange={(e) => setEditing({ ...editing, observacoes: e.target.value })} /></Field>
              </div>
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

export function Field({ label, children, className }) {
  return (
    <div className={className}>
      <Label className="text-xs text-slate-500 mb-1 block">{label}</Label>
      {children}
    </div>
  );
}