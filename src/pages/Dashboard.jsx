const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Users, Printer, Package, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { formatBRL, STATUS_LABELS, STATUS_COLORS } from "@/lib/format";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [orders, clients, printers, products] = await Promise.all([
          db.entities.ServiceOrder.list("-created_date", 100),
          db.entities.Client.list("-created_date", 1),
          db.entities.Printer.list("-created_date", 1),
          db.entities.Product.list("-created_date", 1),
        ]);
        const orderList = orders || [];
        const open = orderList.filter((o) => !["finalizado", "cancelado"].includes(o.status));
        const revenue = orderList.filter((o) => o.status === "finalizado").reduce((s, o) => s + Number(o.total || 0), 0);
        setStats({
          orders: orderList.length,
          open: open.length,
          clients: clients?.length || 0,
          printers: printers?.length || 0,
          products: products?.length || 0,
          revenue,
        });
        setRecent(orderList.slice(0, 6));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <PageLoader />;

  const cards = [
    { label: "Ordens de Serviço", value: stats.orders, icon: ClipboardList, color: "from-blue-500 to-indigo-500" },
    { label: "Em Aberto", value: stats.open, icon: Clock, color: "from-amber-500 to-orange-500" },
    { label: "Clientes", value: stats.clients, icon: Users, color: "from-emerald-500 to-teal-500" },
    { label: "Impressoras", value: stats.printers, icon: Printer, color: "from-violet-500 to-purple-500" },
    { label: "Produtos & Serviços", value: stats.products, icon: Package, color: "from-rose-500 to-pink-500" },
    { label: "Faturamento", value: formatBRL(stats.revenue), icon: TrendingUp, color: "from-green-500 to-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Visão geral do seu atendimento</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="overflow-hidden border-slate-200 shadow-none">
              <CardContent className="p-4">
                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-[18px] w-[18px] text-white" />
                </div>
                <div className="text-xl font-bold text-slate-900">{c.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Ordens recentes</h2>
            <Link to="/ordens" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver todas</Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Nenhuma ordem ainda"
              desc="Crie sua primeira ordem de serviço."
              action={<Link to="/ordens/novo" className="text-sm text-blue-600 font-medium">Nova OS →</Link>}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.map((o) => (
                <Link key={o.id} to={`/ordens/${o.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-900">#{o.numero || "—"}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                    </div>
                    <div className="text-sm text-slate-500 truncate mt-0.5">{o.client_nome || "—"} · {o.printer_desc || "Sem equipamento"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{formatBRL(o.total)}</div>
                    <div className="text-[11px] text-slate-400">{o.kind === "orcamento" ? "Orçamento" : "OS"}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-7 h-7 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="font-medium text-slate-700">{title}</p>
      {desc && <p className="text-sm text-slate-400 mt-1 max-w-xs">{desc}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}