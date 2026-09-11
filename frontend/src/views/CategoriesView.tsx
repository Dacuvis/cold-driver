import React, { useState } from 'react'
import type { Category, Inventory } from '../types'
import { Modal } from '../components/Modal'
import { Plus, Search, Edit3, Trash2, AlertCircle } from 'lucide-react'

interface CategoriesViewProps {
  categories: Category[]
  inventories: Inventory[]
  onCreate: (data: Omit<Category, 'id'>) => Promise<void>
  onUpdate: (id: number, data: Omit<Category, 'id'>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  inventories,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [formData, setFormData] = useState<{ namaKategori: string; deskripsi: string }>({
    namaKategori: '',
    deskripsi: '',
  })

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const filteredCategories = categories.filter(
    (c) =>
      c.namaKategori.toLowerCase().includes(search.toLowerCase()) ||
      (c.deskripsi && c.deskripsi.toLowerCase().includes(search.toLowerCase()))
  )

  function handleOpenCreate() {
    setEditingCategory(null)
    setFormData({ namaKategori: '', deskripsi: '' })
    setErrorMsg('')
    setIsFormOpen(true)
  }

  function handleOpenEdit(cat: Category) {
    setEditingCategory(cat)
    setFormData({ namaKategori: cat.namaKategori, deskripsi: cat.deskripsi || '' })
    setErrorMsg('')
    setIsFormOpen(true)
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      if (editingCategory) {
        await onUpdate(editingCategory.id, formData)
      } else {
        await onCreate(formData)
      }
      setIsFormOpen(false)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan kategori')
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
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus kategori')
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
            placeholder="Cari nama kategori atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="button primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      <div className="panel table-panel">
        <div className="panel-heading">
          <h3>Daftar Kategori Inventaris</h3>
          <span>{filteredCategories.length} kategori</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Kategori</th>
                <th>Deskripsi</th>
                <th>Jumlah Barang Terkait</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => {
                const itemCount = inventories.filter((i) => i.categoryId === cat.id).length

                return (
                  <tr key={cat.id}>
                    <td>
                      <code className="code-badge">#{cat.id}</code>
                    </td>
                    <td className="fw-600">{cat.namaKategori}</td>
                    <td className="text-muted">{cat.deskripsi || '-'}</td>
                    <td>
                      <span className="badge badge-info">{itemCount} barang</span>
                    </td>
                    <td>
                      <div className="action-buttons justify-end">
                        <button
                          className="icon-button text-amber"
                          title="Edit Kategori"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="icon-button text-red"
                          title="Hapus Kategori"
                          onClick={() => setDeletingId(cat.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-table">
                    Belum ada kategori yang ditambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        onClose={() => setIsFormOpen(false)}
      >
        <form onSubmit={handleSubmitForm} className="form-grid">
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label>Nama Kategori *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Elektronik / Alat Tulis / Peralatan Olahraga"
              value={formData.namaKategori}
              onChange={(e) => setFormData({ ...formData, namaKategori: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Deskripsi</label>
            <textarea
              rows={3}
              placeholder="Keterangan singkat pengelompokan barang..."
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
              {loading ? 'Menyimpan...' : editingCategory ? 'Simpan' : 'Tambah Kategori'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deletingId !== null}
        title="Konfirmasi Hapus Kategori"
        onClose={() => setDeletingId(null)}
      >
        <div className="confirm-box">
          <p>
            Apakah Anda yakin ingin menghapus kategori ini?
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
