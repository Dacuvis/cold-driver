import React, { useState } from 'react'
import type { User, Role } from '../types'
import { Modal } from '../components/Modal'
import { Plus, Search, Edit3, Trash2, Shield, User as UserIcon, AlertCircle } from 'lucide-react'

interface UsersViewProps {
  users: User[]
  onCreateUser: (data: { nama: string; username: string; password: string; role: Role; kelas?: string }) => Promise<void>
  onUpdateUser: (id: number, data: { nama: string; username: string; password?: string; role: Role; kelas?: string }) => Promise<void>
  onDeleteUser: (id: number) => Promise<void>
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<'semua' | Role>('semua')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [nama, setNama] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('peminjam')
  const [kelas, setKelas] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.kelas && u.kelas.toLowerCase().includes(search.toLowerCase()))
    const matchesRole = filterRole === 'semua' || u.role === filterRole
    return matchesSearch && matchesRole
  })

  function handleOpenCreate() {
    setEditingUser(null)
    setNama('')
    setUsername('')
    setPassword('')
    setRole('peminjam')
    setKelas('')
    setErrorMsg('')
    setIsFormOpen(true)
  }

  function handleOpenEdit(user: User) {
    setEditingUser(user)
    setNama(user.nama)
    setUsername(user.username)
    setPassword('') // Optional when editing
    setRole(user.role)
    setKelas(user.kelas || '')
    setErrorMsg('')
    setIsFormOpen(true)
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      if (editingUser) {
        await onUpdateUser(editingUser.id, {
          nama,
          username,
          role,
          kelas: kelas || undefined,
          ...(password ? { password } : {}),
        })
      } else {
        if (!password || password.length < 6) {
          throw new Error('Password minimal 6 karakter')
        }
        await onCreateUser({
          nama,
          username,
          password,
          role,
          kelas: kelas || undefined,
        })
      }
      setIsFormOpen(false)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan user')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    setLoading(true)
    setErrorMsg('')
    try {
      await onDeleteUser(deletingId)
      setDeletingId(null)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menghapus user')
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
            placeholder="Cari nama, username, atau kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'semua' | Role)}
          >
            <option value="semua">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="petugas">Petugas</option>
            <option value="peminjam">Peminjam</option>
          </select>
        </div>

        <button className="button primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      <div className="panel table-panel">
        <div className="panel-heading">
          <h3>Daftar Pengguna Sistem</h3>
          <span>{filteredUsers.length} pengguna</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Pengguna</th>
                <th>Username</th>
                <th>Role / Hak Akses</th>
                <th>Kelas / Unit</th>
                <th>Tanggal Terdaftar</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isAdmin = u.role === 'admin'
                const isPetugas = u.role === 'petugas'

                return (
                  <tr key={u.id}>
                    <td>
                      <code className="code-badge">#{u.id}</code>
                    </td>
                    <td className="fw-600">
                      <div className="user-cell">
                        <div className="user-avatar">
                          {isAdmin ? <Shield size={14} /> : <UserIcon size={14} />}
                        </div>
                        <span>{u.nama}</span>
                      </div>
                    </td>
                    <td>
                      <code>@{u.username}</code>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isAdmin
                            ? 'badge-danger'
                            : isPetugas
                            ? 'badge-info'
                            : 'badge-success'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-muted">{u.kelas || '-'}</td>
                    <td className="text-muted">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td>
                      <div className="action-buttons justify-end">
                        <button
                          className="icon-button text-amber"
                          title="Edit User"
                          onClick={() => handleOpenEdit(u)}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="icon-button text-red"
                          title="Hapus User"
                          onClick={() => setDeletingId(u.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-table">
                    Belum ada data pengguna yang sesuai.
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
        title={editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
        onClose={() => setIsFormOpen(false)}
      >
        <form onSubmit={handleSubmitForm} className="form-grid">
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label>Nama Lengkap *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                required
                placeholder="budisantoso"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Role Pengguna *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="peminjam">Peminjam (Siswa / Guru)</option>
                <option value="petugas">Petugas Inventaris</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Password {editingUser ? '(Kosongkan jika tak diubah)' : '*'}
              </label>
              <input
                type="password"
                minLength={6}
                required={!editingUser}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Kelas / Unit Kerja</label>
              <input
                type="text"
                placeholder="Contoh: XII RPL 1 / Staf Lab"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
              />
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
              {loading ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deletingId !== null}
        title="Konfirmasi Hapus Pengguna"
        onClose={() => setDeletingId(null)}
      >
        <div className="confirm-box">
          <p>
            Apakah Anda yakin ingin menghapus pengguna ini?
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
