import React, { useState } from 'react'
import type { StockHistory, Inventory, User } from '../types'
import { Modal } from '../components/Modal'
import { Plus, Search, Trash2, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react'

interface StockHistoriesViewProps {
  stockHistories: StockHistory[]
  inventories: Inventory[]
  users: User[]
  onCreateStockHistory: (data: Omit<StockHistory, 'id' | 'stokSebelum' | 'stokSesudah' | 'createdAt'>) => Promise<void>
  onDeleteStockHistory: (id: number) => Promise<void>
}

export const StockHistoriesView: React.FC<StockHistoriesViewProps> = ({
  stockHistories,
  inventories,
  users,
  onCreateStockHistory,
  onDeleteStockHistory,
}) => {
  const [search, setSearch] = useState('')
  const [filterJenis, setFilterJenis] = useState<'semua' | 'masuk' | 'keluar'>('semua')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [inventoryId, setInventoryId] = useState<number>(inventories[0]?.id || 1)
  const [userId, setUserId] = useState<number>(users[0]?.id || 1)
  const [jenis, setJenis] = useState<'masuk' | 'keluar'>('masuk')
  const [jumlah, setJumlah] = useState(1)
  const [keterangan, setKeterangan] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const filteredHistories = stockHistories.filter((h) => {
    const inv = inventories.find((i) => i.id === h.inventoryId)
    const usr = users.find((u) => u.id === h.userId)
    const matchesSearch =
      (inv && inv.namaBarang.toLowerCase().includes(search.toLowerCase())) ||
      (usr && usr.nama.toLowerCase().includes(search.toLowerCase())) ||
      (h.keterangan && h.keterangan.toLowerCase().includes(search.toLowerCase()))
    const matchesJenis = filterJenis === 'semua' || h.jenis === filterJenis
    return matchesSearch && matchesJenis
  })

  function handleOpenCreate() {
    setInventoryId(inventories[0]?.id || 1)
    setUserId(users[0]?.id || 1)
    setJenis('masuk')
    setJumlah(1)
    setKeterangan('Stok Masuk Rutin')
    setErrorMsg('')
    setIsCreateOpen(true)
  }

  async function handleSubmitCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      await onCreateStockHistory({
        inventoryId: Number(inventoryId),
        userId: Number(userId),
        jenis,
        jumlah: Number(jumlah),
        keterangan,
      })
      setIsCreateOpen(false)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mencatat transaksi stok')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    setLoading(true)
    setErrorMsg('')
    try {
      await onDeleteStockHistory(deletingId)
      setDeletingId(null)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus riwayat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="view-container">
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama barang, petugas, atau keterangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <select
            value={filterJenis}
            onChange={(e) =>
              setFilterJenis(e.target.value as 'semua' | 'masuk' | 'keluar')
            }
          >
            <option value="semua">Semua Transaksi</option>
            <option value="masuk">Barang Masuk</option>
            <option value="keluar">Barang Keluar</option>
          </select>
        </div>

        <button className="button primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Catat Transaksi Stok
        </button>
      </div>

      <div className="panel table-panel">
        <div className="panel-heading">
          <h3>Log Riwayat Transaksi Stok</h3>
          <span>{filteredHistories.length} transaksi</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Jenis</th>
                <th>Nama Barang</th>
                <th>Petugas</th>
                <th>Jumlah</th>
                <th>Stok (Awal &rarr; Akhir)</th>
                <th>Keterangan</th>
                <th>Waktu</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistories.map((h) => {
                const inv = inventories.find((i) => i.id === h.inventoryId)
                const usr = users.find((u) => u.id === h.userId)
                const isMasuk = h.jenis === 'masuk'

                return (
                  <tr key={h.id}>
                    <td>
                      <code className="code-badge">#{h.id}</code>
                    </td>
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
                    <td className="fw-600">{inv ? inv.namaBarang : `#${h.inventoryId}`}</td>
                    <td className="text-muted">{usr ? usr.nama : `#${h.userId}`}</td>
                    <td className="fw-600">{h.jumlah} unit</td>
                    <td>
                      <span className="text-muted">{h.stokSebelum}</span> &rarr;{' '}
                      <span className="fw-600">{h.stokSesudah}</span>
                    </td>
                    <td className="text-muted">{h.keterangan || '-'}</td>
                    <td className="text-muted">
                      {new Date(h.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <div className="action-buttons justify-end">
                        <button
                          className="icon-button text-red"
                          title="Hapus Log"
                          onClick={() => setDeletingId(h.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredHistories.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-table">
                    Belum ada riwayat transaksi stok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        title="Catat Transaksi Stok Baru"
        onClose={() => setIsCreateOpen(false)}
      >
        <form onSubmit={handleSubmitCreate} className="form-grid">
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Jenis Transaksi *</label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as 'masuk' | 'keluar')}
              >
                <option value="masuk">Barang Masuk (Tambah Stok)</option>
                <option value="keluar">Barang Keluar (Kurangi Stok)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Jumlah Unit *</label>
              <input
                type="number"
                min="1"
                required
                value={jumlah}
                onChange={(e) => setJumlah(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Barang Inventaris *</label>
            <select
              value={inventoryId}
              onChange={(e) => setInventoryId(Number(e.target.value))}
            >
              {inventories.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.namaBarang} (Stok Saat Ini: {inv.stok})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Petugas / User Pembawa *</label>
            <select
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Keterangan / Alasan Transaksi</label>
            <input
              type="text"
              placeholder="Contoh: Pengadaan Baru / Rusak / Hibah"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Batal
            </button>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Transaksi Stok'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deletingId !== null}
        title="Konfirmasi Hapus Log Stok"
        onClose={() => setDeletingId(null)}
      >
        <div className="confirm-box">
          <p>
            Apakah Anda yakin ingin menghapus catatan log stok ini?
          </p>
          {errorMsg && <p className="text-red mt-8">{errorMsg}</p>}
          <div className="form-actions mt-20">
            <button
              className="button secondary"
              onClick={() => setDeletingId(null)}
            >
              Batal
            </button>
            <button
              className="button danger"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Menghapus...' : 'Ya, Hapus Log'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
