const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Printer,
  Package,
  Building2,
  LogOut,
  Menu,
  X,
  Wrench,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Ordens de Serviço", path: "/ordens", icon: ClipboardList },
  { title: "Clientes", path: "/clientes", icon: Users },
  { title: "Impressoras", path: "/impressoras", icon: Printer },
  { title: "Produtos & Serviços", path: "/produtos", icon: Package },
  { title: "Perfil da Empresa", path: "/empresa", icon: Building2 },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await db.auth.logout();
    navigate("/login");
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 fixed inset-y-0">
        <SidebarContent isActive={isActive} onLogout={handleLogout} />
      </aside>

      {/* Sidebar - mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 flex flex-col bg-white border-r border-slate-200 animate-in slide-in-from-left">
            <button className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5 text-slate-500" />
            </button>
            <SidebarContent isActive={isActive} onLogout={handleLogout} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b border-slate-200 px-4 h-14">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100">
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Wrench className="h-4 w-4 text-blue-600" />
            Tec Gestão
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ isActive, onLogout, onNavigate }) {
  return (
    <>
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
          <Wrench className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-slate-900 text-sm">Tec Gestão</div>
          <div className="text-[11px] text-slate-400">Impressoras</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${active ? "text-blue-600" : "text-slate-400"}`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
        >
          <LogOut className="h-[18px] w-[18px] text-slate-400" />
          Sair
        </button>
      </div>
    </>
  );
}