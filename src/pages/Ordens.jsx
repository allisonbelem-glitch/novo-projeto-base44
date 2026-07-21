const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, ClipboardList } from "lucide-react";
import { PageLoader, EmptyState } from "@/pages/Dashboard";
import { formatBRL, formatDate, STATUS_LABELS, STATUS_COLORS } from "@/lib/format";

export default function Ordens() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    (async () => {
      try { setOrders((await db.entities.ServiceOrder.list("-created_date", 300)) || []); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = orders.filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return String(o.numero || "").includes(q) || (o.client_nome || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ordens de Serviço</h1>
          <p className="text-sm text-slate-500 mt-1">{orders.length} registro(s)</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/ordens/novo"><Plus className="h-4 w-4 mr-1" />Nova OS</Link>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-wrap gap-2 p-3 border-b border-slate-100">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Buscar por nº ou cliente..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {loading ? <PageLoader /> : filtered.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Nenhuma ordem" desc="Crie sua primeira ordem de serviço ou orçamento." action={<Button asChild variant="outline" size="sm"><Link to="/ordens/novo"><Plus className="h-4 w-4 mr-1" />Nova OS</Link></Button>} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Equipamento</TableHead>
                  <TableHead className="hidden sm:table-cell">Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id} className="cursor-pointer hover:bg-slate-50">
                    <TableCell>
                      <Link to={`/ordens/${o.id}`} className="font-mono font-semibold text-blue-600">#{o.numero}</Link>
                    </TableCell>
                    <TableCell><Badge variant="outline">{o.kind === "orcamento" ? "Orçamento" : "OS"}</Badge></TableCell>
                    <TableCell className="font-medium text-slate-800">{o.client_nome || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500">{o.printer_desc || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-slate-500">{formatDate(o.created_date)}</TableCell>
                    <TableCell><span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span></TableCell>
                    <TableCell className="text-right font-semibold">{formatBRL(o.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}