import React from 'react'
import type { ActiveRoute } from '../types'
import {
  LayoutDashboard,
  Boxes,
  Tags,
  HandMetal,
  History,
  Users,
  Megaphone,
  Camera,
  Terminal,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'

interface SidebarProps {
  activeRoute: ActiveRoute
  onNavigate: (route: ActiveRoute) => void
  counts: Record<string, number>
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  onNavigate,
  counts,
}) => {
  const navItems: { route: ActiveRoute; label: string; icon: React.ReactNode; countKey?: string }[] = [
    { route: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { route: 'inventories', label: 'Inventaris Barang', icon: <Boxes size={18} />, countKey: 'inventories' },
    { route: 'categories', label: 'Kategori', icon: <Tags size={18} />, countKey: 'categories' },
    { route: 'borrowings', label: 'Peminjaman', icon: <HandMetal size={18} />, countKey: 'borrowings' },
    { route: 'stock-histories', label: 'Riwayat Stok', icon: <History size={18} />, countKey: 'stockHistories' },
    { route: 'users', label: 'Pengguna', icon: <Users size={18} />, countKey: 'users' },
    { route: 'announcements', label: 'Pengumuman', icon: <Megaphone size={18} />, countKey: 'announcements' },
    { route: 'documentations', label: 'Dokumentasi', icon: <Camera size={18} />, countKey: 'documentations' },
    { route: 'json-console', label: 'JSON Console', icon: <Terminal size={18} /> },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <ShieldAlert size={22} />
        </div>
        <div>
          <span className="brand-title">Cold Driver</span>
          <span className="brand-sub">Inventory App</span>
        </div>
      </div>

      <div className="sidebar-group">
        <p className="sidebar-label">Navigasi Utama</p>
        <nav className="nav-list">
          {navItems.map((item) => {
            const isActive = activeRoute === item.route
            const count = item.countKey ? counts[item.countKey] : undefined

            return (
              <button
                key={item.route}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.route)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label-text">{item.label}</span>
                {count !== undefined && count > 0 && (
                  <span className="nav-badge">{count}</span>
                )}
                <ChevronRight size={14} className="nav-arrow" />
              </button>
            )
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <p className="footer-title">Database Connected</p>
        <p className="footer-desc">MongoDB 127.0.0.1:27017</p>
      </div>
    </aside>
  )
}
