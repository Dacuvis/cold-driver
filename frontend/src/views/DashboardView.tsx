import React from 'react'
import type { Inventory, Category, Borrowing, User, StockHistory, ActiveRoute } from '../types'
import {
  Boxes,
  Tags,
  HandMetal,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
} from 'lucide-react'

interface DashboardViewProps {
  inventories: Inventory[]
  categories: Category[]
  borrowings: Borrowing[]
  users: User[]
  stockHistories: StockHistory[]
  onNavigate: (route: ActiveRoute) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inventories,
  categories,
  borrowings,
  users,
  stockHistories,
  onNavigate,
}) => {
  const activeBorrowings = borrowings.filter((b) => b.status === 'dipinjam')
  const lowStockItems = inventories.filter((i) => i.stok <= 2)
  const totalStockCount = inventories.reduce((acc, curr) => acc + curr.stok, 0)

  return (
    <div className="dashboard-view">
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('inventories')}>
          <div className="stat-icon icon-blue">
            <Boxes size={22} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Barang Inventaris</p>

            <h3 className="stat-value">{inventories.length} item</h3>
            <span className="stat-sub">{totalStockCount} unit total stok</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('categories')}>
          <div className="stat-icon icon-green">
            <Tags size={22} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Kategori Barang</p>
            <h3 className="stat-value">{categories.length} kategori</h3>
            <span className="stat-sub">Terorganisir dalam sistem</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('borrowings')}>
          <div className="stat-icon icon-amber">
            <HandMetal size={22} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Peminjaman Aktif</p>
            <h3 className="stat-value">{activeBorrowings.length} transaksi</h3>
            <span className="stat-sub">Barang sedang dipinjam</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('users')}>
          <div className="stat-icon icon-purple">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pengguna Terdaftar</p>
            <h3 className="stat-value">{users.length} user</h3>
            <span className="stat-sub">Admin, Petugas, Peminjam</span>
          </div>
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="panel flex-1">
          <div className="panel-heading">
            <div>
              <h3>Aktivitas Transaksi Stok Terbaru</h3>
              <p className="panel-sub">Riwayat barang masuk dan keluar</p>
            </div>
            <button
              className="button text-button"
              onClick={() => onNavigate('stock-histories')}
            >
              Lihat Semua &rarr;
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Jenis</th>
                  <th>Barang</th>
                  <th>Jumlah</th>
                  <th>Stok Akhir</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {stockHistories.slice(0, 5).map((history) => {
                  const inv = inventories.find((i) => i.id === history.inventoryId)
                  const isMasuk = history.jenis === 'masuk'
                  return (
                    <tr key={history.id}>
                      <td>
                        <span className={`badge ${isMasuk ? 'badge-success' : 'badge-warning'}`}>
                          {isMasuk ? (
                            <>
                              <ArrowDownLeft size={12} /> Masuk
                            </>
                          ) : (
                            <>
                              <ArrowUpRight size={12} /> Keluar
                            </>
                          )}
                        </span>
                      </td>
                      <td className="fw-500">{inv ? inv.namaBarang : `ID #${history.inventoryId}`}</td>
                      <td className="fw-600">{history.jumlah} unit</td>
                      <td>{history.stokSesudah}</td>
                      <td className="text-muted">
                        {new Date(history.createdAt).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  )
                })}
                {stockHistories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-table">
                      Belum ada transaksi riwayat stok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel sidebar-panel">
          <div className="panel-heading">
            <h3>Alert Stok Rendah (&le; 2)</h3>
            <span className="badge badge-danger">{lowStockItems.length} Item</span>
          </div>

          <div className="low-stock-list">
            {lowStockItems.map((item) => (
              <div className="low-stock-item" key={item.id}>
                <div className="low-stock-icon">
                  <AlertTriangle size={18} />
                </div>
                <div className="low-stock-info">
                  <span className="low-stock-name">{item.namaBarang}</span>
                  <span className="low-stock-code">{item.kodeBarang} &bull; {item.lokasi}</span>
                </div>
                <div className="low-stock-count">
                  <span className="stok-pill danger">{item.stok} unit</span>
                </div>
              </div>
            ))}

            {lowStockItems.length === 0 && (
              <div className="empty-box">
                <p>Semua barang memiliki stok aman (&gt; 2 unit).</p>
              </div>
            )}
          </div>

          <div className="quick-actions-box">
            <p className="sidebar-label">Aksi Cepat</p>
            <button
              className="button primary full-width mb-8"
              onClick={() => onNavigate('borrowings')}
            >
              <PlusCircle size={16} /> Buat Peminjaman Baru
            </button>
            <button
              className="button secondary full-width"
              onClick={() => onNavigate('inventories')}
            >
              <Boxes size={16} /> Kelola Inventaris
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
