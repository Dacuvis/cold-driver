import React from 'react'
import type { ActiveRoute } from '../types'
import { RefreshCw, Server, Menu } from 'lucide-react'

interface TopbarProps {
  activeRoute: ActiveRoute
  loading: boolean
  onRefresh: () => void
  onToggleSidebar?: () => void
}

const routeTitles: Record<ActiveRoute, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'Ringkasan data inventaris dan aktivitas sistem' },
  inventories: { title: 'Kelola Inventaris', subtitle: 'Daftar stok barang, lokasi, dan kondisi item' },
  categories: { title: 'Kelola Kategori', subtitle: 'Kategori pengelompokan barang inventaris' },
  borrowings: { title: 'Kelola Peminjaman', subtitle: 'Peminjaman aktif dan pengembalian barang' },
  'stock-histories': { title: 'Riwayat Stok', subtitle: 'Catatan barang masuk dan keluar' },
  users: { title: 'Kelola Pengguna', subtitle: 'Pengguna sistem, peran admin, petugas, dan peminjam' },
  announcements: { title: 'Pengumuman', subtitle: 'Informasi dan pengumuman sistem' },
  documentations: { title: 'Dokumentasi', subtitle: 'Galeri foto dan aktivitas inventaris' },
  'json-console': { title: 'Developer JSON Console', subtitle: 'Inspec low-level API & payload JSON' },
}

export const Topbar: React.FC<TopbarProps> = ({
  activeRoute,
  loading,
  onRefresh,
  onToggleSidebar,
}) => {
  const currentInfo = routeTitles[activeRoute] || { title: 'Inventaris', subtitle: 'Sistem Inventaris' }

  return (
    <header className="topbar">
      <div className="topbar-left">
        {onToggleSidebar && (
          <button className="icon-button mobile-menu-toggle" onClick={onToggleSidebar}>
            <Menu size={20} />
          </button>
        )}
        <div>
          <p className="eyebrow">COLD DRIVER / {activeRoute.toUpperCase()}</p>
          <h1 className="topbar-title">{currentInfo.title}</h1>
          <p className="topbar-sub">{currentInfo.subtitle}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <span className="api-badge">
          <Server size={14} />
          <span>API :3000</span>
          <i className="status-dot" />
        </span>
        <button
          className="button secondary refresh-btn"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Memuat...' : 'Refresh Data'}</span>
        </button>
      </div>
    </header>
  )
}
