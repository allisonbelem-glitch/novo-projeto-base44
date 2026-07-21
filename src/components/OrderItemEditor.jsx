import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { formatBRL } from "@/lib/format";

export default function OrderItemEditor({ itens = [], products = [], onChange }) {
  const update = (i, patch) => {
    const next = itens.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    // recompute subtotal
    next[i] = { ...next[i], subtotal: Number(next[i].quantidade || 0) * Number(next[i].preco_unitario || 0) };
    onChange(next);
  };
  const add = () => onChange([...itens, { descricao: "", kind: "peca", quantidade: 1, preco_unitario: 0, subtotal: 0 }]);
  const remove = (i) => onChange(itens.filter((_, idx) => idx !== i));

  const pickProduct = (i, productId) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    update(i, { descricao: p.nome, kind: p.kind, preco_unitario: Number(p.preco) || 0 });
  };

  const subtotalGeral = itens.reduce((s, it) => s + Number(it.subtotal || 0), 0);

  return (
    <div className="space-y-2">
      <div className="hidden md:grid grid-cols-12 gap-2 px-1 text-[11px] font-medium text-slate-400 uppercase">
        <div className="col-span-5">Descrição</div>
        <div className="col-span-2">Tipo</div>
        <div className="col-span-1 text-center">Qtd</div>
        <div className="col-span-2 text-right">Preço Unit.</div>
        <div className="col-span-2 text-right">Subtotal</div>
      </div>
      {itens.length === 0 && (
        <div className="text-center text-sm text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl">
          Nenhum item adicionado.
        </div>
      )}
      {itens.map((it, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-12 md:col-span-5">
            <Input
              placeholder="Descrição do item"
              value={it.descricao}
              onChange={(e) => update(i, { descricao: e.target.value })}
            />
            {products.length > 0 && (
              <select
                className="mt-1 w-full text-xs text-slate-500 border-slate-200 rounded-md bg-transparent focus:outline-none"
                value=""
                onChange={(e) => e.target.value && pickProduct(i, e.target.value)}
              >
                <option value="">+ preencher do catálogo</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.nome} — {formatBRL(p.preco)}</option>)}
              </select>
            )}
          </div>
          <div className="col-span-4 md:col-span-2">
            <Select value={it.kind} onValueChange={(v) => update(i, { kind: v })}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="peca">Peça</SelectItem>
                <SelectItem value="servico">Serviço</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-3 md:col-span-1">
            <Input type="number" step="0.01" className="text-center" value={it.quantidade} onChange={(e) => update(i, { quantidade: e.target.value })} />
          </div>
          <div className="col-span-4 md:col-span-2">
            <Input type="number" step="0.01" className="text-right" value={it.preco_unitario} onChange={(e) => update(i, { preco_unitario: e.target.value })} />
          </div>
          <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-1">
            <span className="text-sm font-medium text-slate-700 hidden md:inline">{formatBRL(it.subtotal)}</span>
            <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4 mr-1" />Adicionar item</Button>
        <div className="text-sm text-slate-500">Subtotal: <span className="font-semibold text-slate-800">{formatBRL(subtotalGeral)}</span></div>
      </div>
    </div>
  );
}