import React, { useState } from 'react'
import type { Announcement, User } from '../types'
import { Modal } from '../components/Modal'
import { Plus, Search, Edit3, Trash2, Megaphone, AlertCircle } from 'lucide-react'

interface AnnouncementsViewProps {
  announcements: Announcement[]
  users: User[]
  onCreate: (data: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>
  onUpdate: (id: number, data: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  users,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Announcement | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [judul, setJudul] = useState('')
  const [isi, setIsi] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [createdBy, setCreatedBy] = useState<number>(users[0]?.id || 1)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.judul.toLowerCase().includes(search.toLowerCase()) ||
      a.isi.toLowerCase().includes(search.toLowerCase())
  )

  function handleOpenCreate() {
    setEditingItem(null)
    setJudul('')
    setIsi('')
    setThumbnail('')
    setCreatedBy(users[0]?.id || 1)
    setErrorMsg('')
    setIsFormOpen(true)
  }

  function handleOpenEdit(item: Announcement) {
    setEditingItem(item)
    setJudul(item.judul)
    setIsi(item.isi)
    setThumbnail(item.thumbnail || '')
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
          isi,
          thumbnail: thumbnail || undefined,
          createdBy: Number(createdBy),
        })
      } else {
        await onCreate({
          judul,
          isi,
          thumbnail: thumbnail || undefined,
          createdBy: Number(createdBy),
        })
      }
      setIsFormOpen(false)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan pengumuman')
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
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus pengumuman')
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
            placeholder="Cari judul atau isi pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="button primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Buat Pengumuman
        </button>
      </div>

      <div className="announcements-grid">
        {filteredAnnouncements.map((a) => {
          const author = users.find((u) => u.id === a.createdBy)

          return (
            <div className="card announcement-card" key={a.id}>
              {a.thumbnail && (
                <div className="card-thumb">
                  <img src={a.thumbnail} alt={a.judul} />
                </div>
              )}
              <div className="card-body">
                <div className="card-meta">
                  <span className="meta-author">
                    <Megaphone size={14} /> {author ? author.nama : `User #${a.createdBy}`}
                  </span>
                  <span className="meta-date">
                    {new Date(a.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="card-title">{a.judul}</h3>
                <p className="card-desc">{a.isi}</p>
              </div>

              <div className="card-footer">
                <button
                  className="icon-button text-amber"
                  title="Edit Pengumuman"
                  onClick={() => handleOpenEdit(a)}
                >
                  <Edit3 size={15} />
                </button>
                <button
                  className="icon-button text-red"
                  title="Hapus Pengumuman"
                  onClick={() => setDeletingId(a.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}

        {filteredAnnouncements.length === 0 && (
          <div className="empty-box full-width">
            <p>Belum ada pengumuman yang diterbitkan.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        title={editingItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
        onClose={() => setIsFormOpen(false)}
      >
        <form onSubmit={handleSubmitForm} className="form-grid">
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label>Judul Pengumuman *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Jadwal Stock Opname Semester Genap"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Isi Pengumuman *</label>
            <textarea
              rows={4}
              required
              placeholder="Tuliskan pengumuman lengkap di sini..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>URL Gambar / Thumbnail (Opsional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Pembuat *</label>
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
              {loading ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deletingId !== null}
        title="Konfirmasi Hapus Pengumuman"
        onClose={() => setDeletingId(null)}
      >
        <div className="confirm-box">
          <p>
            Apakah Anda yakin ingin menghapus pengumuman ini?
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
