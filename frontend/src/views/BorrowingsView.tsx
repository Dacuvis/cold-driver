import React, { useState } from 'react'
import type { Borrowing, Inventory, User } from '../types'
import { Modal } from '../components/Modal'
import { Plus, Search, CheckCircle, Trash2, AlertCircle, Calendar, UserCheck } from 'lucide-react'

interface BorrowingsViewProps {
  borrowings: Borrowing[]
  inventories: Inventory[]
  users: User[]
  onCreateBorrowing: (data: {
    userId: number
    namaPeminjam: string
    kelas: string
    tujuan: string
    tanggalPinjam: string
    parafGuru?: string
    items: { inventoryId: number; jumlah: number; kondisiPinjam: string }[]
  }) => Promise<void>
  onReturnBorrowing: (
    id: number,
    data: {
      tanggalKembali: string
      items: { itemId: number; kondisiKembali: string }[]
    }
  ) => Promise<void>
  onDeleteBorrowing: (id: number) => Promise<void>
}

export const BorrowingsView: React.FC<BorrowingsViewProps> = ({
  borrowings,
  inventories,
  users,
  onCreateBorrowing,
  onReturnBorrowing,
  onDeleteBorrowing,
}) => {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'semua' | 'dipinjam' | 'dikembalikan'>('semua')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [returningBorrowing, setReturningBorrowing] = useState<Borrowing | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Create Form fields
  const [selectedUserId, setSelectedUserId] = useState<number>(users[0]?.id || 1)
  const [namaPeminjam, setNamaPeminjam] = useState('')
  const [kelas, setKelas] = useState('')
  const [tujuan, setTujuan] = useState('')
  const [tanggalPinjam, setTanggalPinjam] = useState(new Date().toISOString().split('T')[0])
  const [parafGuru, setParafGuru] = useState('')
  const [borrowItems, setBorrowItems] = useState<
    { inventoryId: number; jumlah: number; kondisiPinjam: string }[]
  >([{ inventoryId: inventories[0]?.id || 1, jumlah: 1, kondisiPinjam: 'Baik' }])

  // Return Form fields
  const [tanggalKembali, setTanggalKembali] = useState(new Date().toISOString().split('T')[0])
  const [returnConditions, setReturnConditions] = useState<Record<number, string>>({})

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const filteredBorrowings = borrowings.filter((b) => {
    const matchesSearch =
      b.namaPeminjam.toLowerCase().includes(search.toLowerCase()) ||
      b.kodePeminjaman.toLowerCase().includes(search.toLowerCase()) ||
      b.kelas.toLowerCase().includes(search.toLowerCase()) ||
      b.tujuan.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'semua' || b.status === filterStatus
    return matchesSearch && matchesStatus
  })

  function handleOpenCreate() {
    const firstUser = users[0]
    setSelectedUserId(firstUser?.id || 1)
    setNamaPeminjam(firstUser?.nama || '')
    setKelas(firstUser?.kelas || 'X-RPL-1')
    setTujuan('Praktikum Pembelajaran')
    setTanggalPinjam(new Date().toISOString().split('T')[0])
    setParafGuru('Pak Ahmad')
    setBorrowItems([
      { inventoryId: inventories[0]?.id || 1, jumlah: 1, kondisiPinjam: 'Baik' },
    ])
    setErrorMsg('')
    setIsCreateOpen(true)
  }

  function handleUserChange(uid: number) {
    setSelectedUserId(uid)
    const u = users.find((usr) => usr.id === uid)
    if (u) {
      setNamaPeminjam(u.nama)
      if (u.kelas) setKelas(u.kelas)
    }
  }

  function handleAddBorrowItem() {
    setBorrowItems([
      ...borrowItems,
      { inventoryId: inventories[0]?.id || 1, jumlah: 1, kondisiPinjam: 'Baik' },
    ])
  }

  function handleRemoveBorrowItem(index: number) {
    if (borrowItems.length <= 1) return
    setBorrowItems(borrowItems.filter((_, i) => i !== index))
  }

  function handleItemChange(
    index: number,
    field: 'inventoryId' | 'jumlah' | 'kondisiPinjam',
    value: unknown
  ) {
    const next = [...borrowItems]
    next[index] = { ...next[index], [field]: value }
    setBorrowItems(next)
  }

  function handleOpenReturn(borrowing: Borrowing) {
    setReturningBorrowing(borrowing)
    setTanggalKembali(new Date().toISOString().split('T')[0])
    const initCond: Record<number, string> = {}
    borrowing.items.forEach((item) => {
      if (item.id) initCond[item.id] = item.kondisiPinjam || 'Baik'
    })
    setReturnConditions(initCond)
    setErrorMsg('')
  }

  async function handleSubmitCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      await onCreateBorrowing({
        userId: Number(selectedUserId),
        namaPeminjam,
        kelas,
        tujuan,
        tanggalPinjam,
        parafGuru,
        items: borrowItems.map((bi) => ({
          inventoryId: Number(bi.inventoryId),
          jumlah: Number(bi.jumlah),
          kondisiPinjam: bi.kondisiPinjam,
        })),
      })
      setIsCreateOpen(false)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal membuat peminjaman')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitReturn(e: React.FormEvent) {
    e.preventDefault()
    if (!returningBorrowing) return
    setLoading(true)
    setErrorMsg('')
    try {
      const itemsPayload = returningBorrowing.items.map((item) => ({
        itemId: item.id!,
        kondisiKembali: returnConditions[item.id!] || 'Baik',
      }))
      await onReturnBorrowing(returningBorrowing.id, {
        tanggalKembali,
        items: itemsPayload,
      })
      setReturningBorrowing(null)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memproses pengembalian')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    setLoading(true)
    setErrorMsg('')
    try {
      await onDeleteBorrowing(deletingId)
      setDeletingId(null)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus peminjaman')
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
            placeholder="Cari kode peminjaman, nama peminjam, kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as 'semua' | 'dipinjam' | 'dikembalikan')
            }
          >
            <option value="semua">Semua Status</option>
            <option value="dipinjam">Sedang Dipinjam</option>
            <option value="dikembalikan">Sudah Dikembalikan</option>
          </select>
        </div>

        <button className="button primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Buat Peminjaman Baru
        </button>
      </div>

      <div className="panel table-panel">
        <div className="panel-heading">
          <h3>Daftar Transaksi Peminjaman</h3>
          <span>{filteredBorrowings.length} transaksi</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Peminjam &amp; Kelas</th>
                <th>Tujuan</th>
                <th>Barang Dipinjam</th>
                <th>Tgl Pinjam / Kembali</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBorrowings.map((b) => {
                const isDipinjam = b.status === 'dipinjam'

                return (
                  <tr key={b.id}>
                    <td>
                      <code className="code-badge">{b.kodePeminjaman}</code>
                    </td>
                    <td>
                      <span className="fw-600 d-block">{b.namaPeminjam}</span>
                      <span className="table-subtext">{b.kelas}</span>
                    </td>
                    <td className="text-muted">{b.tujuan}</td>
                    <td>
                      <div className="borrowed-items-pill-list">
                        {b.items.map((item, idx) => {
                          const inv = inventories.find((i) => i.id === item.inventoryId)
                          return (
                            <span key={idx} className="item-pill">
                              {inv ? inv.namaBarang : `#${item.inventoryId}`} ({item.jumlah} unit)
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="date-stack">
                        <span>
                          <Calendar size={12} /> {b.tanggalPinjam}
                        </span>
                        {b.tanggalKembali && (
                          <span className="text-success">
                            &rarr; {b.tanggalKembali}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isDipinjam ? 'badge-warning' : 'badge-success'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons justify-end">
                        {isDipinjam && (
                          <button
                            className="button secondary button-sm text-success"
                            onClick={() => handleOpenReturn(b)}
                          >
                            <CheckCircle size={14} /> Kembalikan
                          </button>
                        )}
                        <button
                          className="icon-button text-red"
                          title="Hapus Transaksi"
                          onClick={() => setDeletingId(b.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredBorrowings.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-table">
                    Belum ada catatan transaksi peminjaman.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Borrowing Modal */}
      <Modal
        isOpen={isCreateOpen}
        title="Form Peminjaman Barang"
        onClose={() => setIsCreateOpen(false)}
        maxWidth="640px"
      >
        <form onSubmit={handleSubmitCreate} className="form-grid">
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Pilih Akun User *</label>
              <select
                value={selectedUserId}
                onChange={(e) => handleUserChange(Number(e.target.value))}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nama Peminjam *</label>
              <input
                type="text"
                required
                value={namaPeminjam}
                onChange={(e) => setNamaPeminjam(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kelas / Unit *</label>
              <input
                type="text"
                required
                placeholder="Contoh: XII RPL 2"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tanggal Pinjam *</label>
              <input
                type="date"
                required
                value={tanggalPinjam}
                onChange={(e) => setTanggalPinjam(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tujuan Peminjaman *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Praktikum Pemrograman Web"
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Paraf Guru / Penanggung Jawab</label>
              <input
                type="text"
                placeholder="Contoh: Pak Budi S.Kom"
                value={parafGuru}
                onChange={(e) => setParafGuru(e.target.value)}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-header">
              <label>Daftar Barang Yang Dipinjam *</label>
              <button
                type="button"
                className="button text-button"
                onClick={handleAddBorrowItem}
              >
                + Tambah Item
              </button>
            </div>

            {borrowItems.map((item, idx) => (
              <div key={idx} className="borrow-item-row">
                <div className="flex-2">
                  <select
                    value={item.inventoryId}
                    onChange={(e) =>
                      handleItemChange(idx, 'inventoryId', Number(e.target.value))
                    }
                  >
                    {inventories.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.namaBarang} (Stok: {inv.stok})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    value={item.jumlah}
                    onChange={(e) =>
                      handleItemChange(idx, 'jumlah', Number(e.target.value))
                    }
                  />
                </div>
                <div className="flex-1">
                  <select
                    value={item.kondisiPinjam}
                    onChange={(e) =>
                      handleItemChange(idx, 'kondisiPinjam', e.target.value)
                    }
                  >
                    <option value="Baik">Baik</option>
                    <option value="Cukup">Cukup</option>
                  </select>
                </div>
                {borrowItems.length > 1 && (
                  <button
                    type="button"
                    className="icon-button text-red"
                    onClick={() => handleRemoveBorrowItem(idx)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
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
              {loading ? 'Menyimpan...' : 'Simpan Transaksi Peminjaman'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Borrowing Modal */}
      <Modal
        isOpen={returningBorrowing !== null}
        title={`Proses Pengembalian Barang #${returningBorrowing?.kodePeminjaman}`}
        onClose={() => setReturningBorrowing(null)}
      >
        <form onSubmit={handleSubmitReturn} className="form-grid">
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label>Tanggal Pengembalian *</label>
            <input
              type="date"
              required
              value={tanggalKembali}
              onChange={(e) => setTanggalKembali(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label className="mb-8 d-block">Kondisi Barang Saat Dikembalikan:</label>
            {returningBorrowing?.items.map((item) => {
              const inv = inventories.find((i) => i.id === item.inventoryId)
              return (
                <div key={item.id} className="return-item-row">
                  <div className="return-item-info">
                    <span className="fw-600">{inv ? inv.namaBarang : `#${item.inventoryId}`}</span>
                    <span className="text-muted"> ({item.jumlah} unit)</span>
                  </div>
                  <select
                    value={returnConditions[item.id!] || 'Baik'}
                    onChange={(e) =>
                      setReturnConditions({
                        ...returnConditions,
                        [item.id!]: e.target.value,
                      })
                    }
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
              )
            })}
          </div>

          <div className="form-actions mt-16">
            <button
              type="button"
              className="button secondary"
              onClick={() => setReturningBorrowing(null)}
            >
              Batal
            </button>
            <button type="submit" className="button primary" disabled={loading}>
              <UserCheck size={16} /> {loading ? 'Memproses...' : 'Selesaikan Pengembalian'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deletingId !== null}
        title="Konfirmasi Hapus Transaksi Peminjaman"
        onClose={() => setDeletingId(null)}
      >
        <div className="confirm-box">
          <p>
            Apakah Anda yakin ingin menghapus catatan peminjaman ini?
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
              {loading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
