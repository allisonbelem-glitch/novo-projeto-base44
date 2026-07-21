const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Save, Check } from "lucide-react";
import { PageLoader } from "@/pages/Dashboard";

const empty = {
  nome_fantasia: "", razao_social: "", cnpj: "", telefone: "", email: "",
  endereco: "", cidade: "", estado: "", cep: "", logo_url: "",
  termos_garantia: "Garantia de 90 dias sobre os serviços prestados e peças substituídas, conforme Código de Defesa do Consumidor.",
};

export default function Empresa() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await db.entities.CompanyProfile.list("-created_date", 1);
        if (list && list.length) setProfile(list[0]);
        else setProfile({ ...empty });
      } catch { setProfile({ ...empty }); }
    })();
  }, []);

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile.id) await db.entities.CompanyProfile.update(profile.id, profile);
      else await db.entities.CompanyProfile.create(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  if (!profile) return <PageLoader />;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Perfil da Empresa</h1>
        <p className="text-sm text-slate-500 mt-1">Dados que aparecem nas ordens de serviço impressas</p>
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-5">
          <form onSubmit={save} className="space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-medium pb-2 border-b border-slate-100">
              <Building2 className="h-4 w-4 text-blue-600" /> Dados da Empresa
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nome Fantasia *"><Input value={profile.nome_fantasia} onChange={(e) => set("nome_fantasia", e.target.value)} required /></Field>
              <Field label="Razão Social"><Input value={profile.razao_social} onChange={(e) => set("razao_social", e.target.value)} /></Field>
              <Field label="CNPJ"><Input value={profile.cnpj} onChange={(e) => set("cnpj", e.target.value)} /></Field>
              <Field label="Telefone"><Input value={profile.telefone} onChange={(e) => set("telefone", e.target.value)} /></Field>
              <Field label="E-mail"><Input value={profile.email} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="Logo (URL)"><Input value={profile.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://..." /></Field>
              <Field label="Endereço" full><Input value={profile.endereco} onChange={(e) => set("endereco", e.target.value)} /></Field>
              <Field label="Cidade"><Input value={profile.cidade} onChange={(e) => set("cidade", e.target.value)} /></Field>
              <Field label="Estado"><Input value={profile.estado} onChange={(e) => set("estado", e.target.value)} /></Field>
              <Field label="CEP"><Input value={profile.cep} onChange={(e) => set("cep", e.target.value)} /></Field>
            </div>

            <div className="flex items-center gap-2 text-slate-700 font-medium pt-2 pb-2 border-b border-slate-100">
              Termos de Garantia
            </div>
            <div>
              <Textarea rows={3} value={profile.termos_garantia} onChange={(e) => set("termos_garantia", e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saved ? <><Check className="h-4 w-4 mr-1" />Salvo!</> : <><Save className="h-4 w-4 mr-1" />{saving ? "Salvando..." : "Salvar"}</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="text-xs text-slate-500 mb-1 block">{label}</Label>
      {children}
    </div>
  );
}