import React, { useState } from 'react'
import type { Documentation, User } from '../types'
import { Modal } from '../components/Modal'
import { Plus, Search, Edit3, Trash2, Camera, Calendar, AlertCircle } from 'lucide-react'

interface DocumentationsViewProps {
  documentations: Documentation[]
  users: User[]
  onCreate: (data: Omit<Documentation, 'id'>) => Promise<void>
  onUpdate: (id: number, data: Omit<Documentation, 'id'>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export const DocumentationsView: React.FC<DocumentationsViewProps> = ({
  documentations,
  users,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Documentation | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [judul, setJudul] = useState('')
  const [kategori, setKategori] = useState('Kegiatan Lab')
  const [deskripsi, setDeskripsi] = useState('')
  const [foto, setFoto] = useState('')
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [createdBy, setCreatedBy] = useState<number>(users[0]?.id || 1)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const filteredDocs = documentations.filter(
    (d) =>
      d.judul.toLowerCase().includes(search.toLowerCase()) ||
      d.kategori.toLowerCase().includes(search.toLowerCase()) ||
      (d.deskripsi && d.deskripsi.toLowerCase().includes(search.toLowerCase()))
  )

  function handleOpenCreate() {
    setEditingItem(null)
    setJudul('')
    setKategori('Kegiatan Lab')
    setDeskripsi('')
    setFoto('')
    setTanggal(new Date().toISOString().split('T')[0])
    setCreatedBy(users[0]?.id || 1)
    setErrorMsg('')
    setIsFormOpen(true)
  }

  function handleOpenEdit(item: Documentation) {
    setEditingItem(item)
    setJudul(item.judul)
    setKategori(item.kategori)
    setDeskripsi(item.deskripsi || '')
    setFoto(item.foto || '')
    setTanggal(item.tanggal)
    setCreatedBy(item.createdBy)
    setErrorMsg('')
    setIsFormOpen(true)
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      if (editingItem) {
        await onUpdate(editingItem.id, {
          judul,
          kategori,
          deskripsi: deskripsi || undefined,
          foto: foto || undefined,
          tanggal,
          createdBy: Number(createdBy),
        })
      } else {
        await onCreate({
          judul,
          kategori,
          deskripsi: deskripsi || undefined,
          foto: foto || undefined,
          tanggal,
          createdBy: Number(createdBy),
        })
      }
      setIsFormOpen(false)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan dokumentasi')
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
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus dokumentasi')
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
            placeholder="Cari judul, kategori, atau deskripsi dokumentasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="button primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Tambah Dokumentasi
        </button>
      </div>

      <div className="documentations-grid">
        {filteredDocs.map((doc) => {
          const author = users.find((u) => u.id === doc.createdBy)

          return (
            <div className="card doc-card" key={doc.id}>
              {doc.foto ? (
                <div className="card-thumb media">
                  <img src={doc.foto} alt={doc.judul} />
                </div>
              ) : (
                <div className="card-thumb media-placeholder">
                  <Camera size={32} />
                </div>
              )}
              <div className="card-body">
                <div className="card-meta">
                  <span className="badge badge-info">{doc.kategori}</span>
                  <span className="meta-date">
                    <Calendar size={12} /> {doc.tanggal}
                  </span>
                </div>
                <h3 className="card-title">{doc.judul}</h3>
                {doc.deskripsi && <p className="card-desc">{doc.deskripsi}</p>}
                <p className="card-author">Oleh: {author ? author.nama : `User #${doc.createdBy}`}</p>
              </div>

              <div className="card-footer">
                <button
                  className="icon-button text-amber"
                  title="Edit Dokumentasi"
                  onClick={() => handleOpenEdit(doc)}
                >
                  <Edit3 size={15} />
                </button>
                <button
                  className="icon-button text-red"
                  title="Hapus Dokumentasi"
                  onClick={() => setDeletingId(doc.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}

        {filteredDocs.length === 0 && (
          <div className="empty-box full-width">
            <p>Belum ada foto atau dokumentasi terdaftar.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        title={editingItem ? 'Edit Dokumentasi' : 'Tambah Dokumentasi Baru'}
        onClose={() => setIsFormOpen(false)}
      >
        <form onSubmit={handleSubmitForm} className="form-grid">
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label>Judul Dokumentasi *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Serah Terima Laptop Lab RPL 2"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kategori *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Kegiatan Lab / Maintenance"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tanggal *</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>URL Foto / Gambar Dokumentasi</label>
            <input
              type="url"
              placeholder="https://..."
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Deskripsi</label>
            <textarea
              rows={3}
              placeholder="Catatan rinci kegiatan atau berita acara..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Penanggung Jawab *</label>
            <select
              value={createdBy}
              onChange={(e) => setCreatedBy(Number(e.target.value))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.role})
                </option>
              ))}
            </select>
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
              {loading ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Dokumentasi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deletingId !== null}
        title="Konfirmasi Hapus Dokumentasi"
        onClose={() => setDeletingId(null)}
      >
        <div className="confirm-box">
          <p>
            Apakah Anda yakin ingin menghapus dokumentasi ini?
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
