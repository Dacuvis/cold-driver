import React, { useState } from 'react'
import type { Inventory, Category, StockHistory, User } from '../types'
import { Modal } from '../components/Modal'
import { Plus, Search, Edit3, Trash2, ArrowUpRight, AlertCircle } from 'lucide-react'

interface InventoriesViewProps {
  inventories: Inventory[]
  categories: Category[]
  users: User[]
  onCreate: (data: Omit<Inventory, 'id'>) => Promise<void>
  onUpdate: (id: number, data: Omit<Inventory, 'id'>) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onAdjustStock: (data: Omit<StockHistory, 'id' | 'stokSebelum' | 'stokSesudah' | 'createdAt'>) => Promise<void>
}

export const InventoriesView: React.FC<InventoriesViewProps> = ({
  inventories,
  categories,
  users,
  onCreate,
  onUpdate,
  onDelete,
  onAdjustStock,
}) => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all')

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Inventory | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Stock Adjustment Modal state
  const [stockItem, setStockItem] = useState<Inventory | null>(null)
  const [stockJenis, setStockJenis] = useState<'masuk' | 'keluar'>('masuk')
  const [stockJumlah, setStockJumlah] = useState(1)
  const [stockUserId, setStockUserId] = useState<number>(users[0]?.id || 1)
  const [stockKeterangan, setStockKeterangan] = useState('')

  // Form input fields
  const [formData, setFormData] = useState<{
    categoryId: number
    kodeBarang: string
    namaBarang: string
    stok: number
    kondisi: string
    lokasi: string
    deskripsi: string
  }>({
    categoryId: categories[0]?.id || 1,
    kodeBarang: '',
    namaBarang: '',
    stok: 1,
    kondisi: 'Baik',
    lokasi: 'Gudang Utama',
    deskripsi: '',
  })

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const filteredInventories = inventories.filter((item) => {
    const matchesSearch =
      item.namaBarang.toLowerCase().includes(search.toLowerCase()) ||
      item.kodeBarang.toLowerCase().includes(search.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || item.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  function handleOpenCreate() {
    setEditingItem(null)
    setFormData({
      categoryId: categories[0]?.id || 1,
      kodeBarang: `BRG-${Math.floor(100 + Math.random() * 900)}`,
      namaBarang: '',
      stok: 1,
      kondisi: 'Baik',
      lokasi: 'Gudang Utama',
      deskripsi: '',
    })
    setErrorMsg('')
    setIsFormOpen(true)
  }

  function handleOpenEdit(item: Inventory) {
    setEditingItem(item)
    setFormData({
      categoryId: item.categoryId,
      kodeBarang: item.kodeBarang,
      namaBarang: item.namaBarang,
      stok: item.stok,
      kondisi: item.kondisi,
      lokasi: item.lokasi,
      deskripsi: item.deskripsi || '',
    })
    setErrorMsg('')
    setIsFormOpen(true)
  }

  function handleOpenStock(item: Inventory) {
    setStockItem(item)
    setStockJenis('masuk')
    setStockJumlah(1)
    setStockUserId(users[0]?.id || 1)
    setStockKeterangan('')
    setErrorMsg('')
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      if (editingItem) {
        await onUpdate(editingItem.id, formData)
      } else {
        await onCreate(formData)
      }
      setIsFormOpen(false)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan barang')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    setLoading(true)
    setErrorMsg('')
    try {
      await onDelete(deletingId)
      setDeletingId(null)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus barang')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitStock(e: React.FormEvent) {
    e.preventDefault()
    if (!stockItem) return
    setLoading(true)
    setErrorMsg('')
    try {
      await onAdjustStock({
        inventoryId: stockItem.id,
        userId: Number(stockUserId),
        jenis: stockJenis,
        jumlah: Number(stockJumlah),
        keterangan: stockKeterangan,
      })
      setStockItem(null)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengubah stok')
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
            placeholder="Cari kode, nama barang, atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.namaKategori}
              </option>
            ))}
          </select>
        </div>

        <button className="button primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Tambah Barang
        </button>
      </div>

      <div className="panel table-panel">
        <div className="panel-heading">
          <h3>Daftar Barang Inventaris</h3>
          <span>{filteredInventories.length} item ditemukan</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th>Stok</th>
                <th>Kondisi</th>
                <th>Lokasi</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventories.map((item) => {
                const category = categories.find((c) => c.id === item.categoryId)
                const isLowStock = item.stok <= 2

                return (
                  <tr key={item.id}>
                    <td>
                      <code className="code-badge">{item.kodeBarang}</code>
                    </td>
                    <td className="fw-600">
                      {item.namaBarang}
                      {item.deskripsi && (
                        <p className="table-subtext">{item.deskripsi}</p>
                      )}
                    </td>
                    <td>
                      <span className="category-pill">
                        {category ? category.namaKategori : `Cat #${item.categoryId}`}
                      </span>
                    </td>
                    <td>
                      <span className={`stok-pill ${isLowStock ? 'danger' : 'success'}`}>
                        {item.stok} unit
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.kondisi.toLowerCase() === 'baik'
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                      >
                        {item.kondisi}
                      </span>
                    </td>
                    <td className="text-muted">{item.lokasi}</td>
                    <td>
                      <div className="action-buttons justify-end">
                        <button
                          className="icon-button text-blue"
                          title="Ubah Stok (+/-)"
                          onClick={() => handleOpenStock(item)}
                        >
                          <ArrowUpRight size={15} />
                        </button>
                        <button
                          className="icon-button text-amber"
                          title="Edit Barang"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="icon-button text-red"
                          title="Hapus Barang"
                          onClick={() => setDeletingId(item.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredInventories.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-table">
                    Belum ada data barang inventaris yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        title={editingItem ? 'Edit Barang Inventaris' : 'Tambah Barang Inventaris Baru'}
        onClose={() => setIsFormOpen(false)}
      >
        <form onSubmit={handleSubmitForm} className="form-grid">
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Kode Barang *</label>
              <input
                type="text"
                required
                value={formData.kodeBarang}
                onChange={(e) => setFormData({ ...formData, kodeBarang: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Kategori *</label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: Number(e.target.value) })
                }
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.namaKategori}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Nama Barang *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Laptop Asus ROG"
              value={formData.namaBarang}
              onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Jumlah Stok *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stok}
                onChange={(e) =>
                  setFormData({ ...formData, stok: Number(e.target.value) })
                }
              />
            </div>
            <div className="form-group">
              <label>Kondisi Barang *</label>
              <select
                value={formData.kondisi}
                onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
              >
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Lokasi Penyimpanan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Lab Komputer 1 / Lemari B"
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Deskripsi Tambahan</label>
            <textarea
              rows={3}
              placeholder="Keterangan spesifikasi atau catatan kondisi..."
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => setIsFormOpen(false)}
            >
              Batal
            </button>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Barang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deletingId !== null}
        title="Konfirmasi Hapus Barang"
        onClose={() => setDeletingId(null)}
      >
        <div className="confirm-box">
          <p>
            Apakah Anda yakin ingin menghapus barang inventaris ini? Tindakan ini tidak dapat
            dibatalkan.
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
              {loading ? 'Menghapus...' : 'Ya, Hapus Barang'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={stockItem !== null}
        title={`Ubah Stok: ${stockItem?.namaBarang || ''}`}
        onClose={() => setStockItem(null)}
      >
        <form onSubmit={handleSubmitStock} className="form-grid">
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Jenis Transaksi *</label>
              <select
                value={stockJenis}
                onChange={(e) => setStockJenis(e.target.value as 'masuk' | 'keluar')}
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
                value={stockJumlah}
                onChange={(e) => setStockJumlah(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Petugas / Penganggung Jawab *</label>
            <select
              value={stockUserId}
              onChange={(e) => setStockUserId(Number(e.target.value))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Keterangan / Catatan</label>
            <input
              type="text"
              placeholder="Contoh: Pengadaan stok baru / Rusak dibuang"
              value={stockKeterangan}
              onChange={(e) => setStockKeterangan(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => setStockItem(null)}
            >
              Batal
            </button>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? 'Proses...' : 'Proses Transaksi Stok'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
