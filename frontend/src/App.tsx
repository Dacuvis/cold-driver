import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_URL = 'http://localhost:3000/api'
const resources = ['users', 'categories', 'inventories', 'stock-histories', 'announcements', 'documentations']
const examples: Record<string, string> = {
  users: '{\n  "nama": "Budi",\n  "username": "budi",\n  "password": "rahasia",\n  "role": "peminjam"\n}',
  categories: '{\n  "namaKategori": "Elektronik",\n  "deskripsi": "Peralatan elektronik"\n}',
  inventories: '{\n  "categoryId": 1,\n  "kodeBarang": "EL-001",\n  "namaBarang": "Laptop",\n  "stok": 5,\n  "kondisi": "Baik",\n  "lokasi": "Lab 1"\n}',
}

function App() {
  const [resource, setResource] = useState('categories')
  const [rows, setRows] = useState<unknown[]>([])
  const [payload, setPayload] = useState(examples.categories)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => setPayload(examples[resource] ?? '{\n  \n}'), [resource])

  async function loadData() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${API_URL}/${resource}`)
      const data = await response.json()
      setRows(Array.isArray(data) ? data : [data])
    } catch {
      setMessage('Backend belum berjalan di http://localhost:3000')
    } finally {
      setLoading(false)
    }
  }

  async function submitData(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${API_URL}/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? data.error ?? 'Input ditolak')
      setMessage('Data berhasil disimpan.')
      await loadData()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menyimpan data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">INVENTORY / CONSOLE</p><h1>Data workspace</h1></div>
        <span className="status"><i /> API :3000</span>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <p className="label">Koleksi database</p>
          {resources.map((item) => (
            <button className={`nav-item ${item === resource ? 'active' : ''}`} key={item} onClick={() => setResource(item)}>
              <span>{item.replace('-', ' ')}</span><b>›</b>
            </button>
          ))}
          <p className="sidebar-note">Pilih koleksi, lihat isinya, atau kirim dokumen JSON baru.</p>
        </aside>

        <div className="content">
          <div className="content-heading">
            <div><p className="eyebrow">COLLECTION</p><h2>{resource.replace('-', ' ')}</h2></div>
            <button className="button secondary" onClick={loadData} disabled={loading}>{loading ? 'Memuat...' : 'Refresh data'}</button>
          </div>

          <div className="grid">
            <section className="panel table-panel">
              <div className="panel-heading"><h3>Isi database</h3><span>{rows.length} baris</span></div>
              <div className="data-view">{rows.length ? <pre>{JSON.stringify(rows, null, 2)}</pre> : <p className="empty">Belum ada data ditampilkan.<br />Klik “Refresh data” untuk membaca database.</p>}</div>
            </section>

            <form className="panel input-panel" onSubmit={submitData}>
              <div className="panel-heading"><h3>Tambah data</h3><span>POST /{resource}</span></div>
              <label htmlFor="payload">Dokumen JSON</label>
              <textarea id="payload" value={payload} onChange={(event) => setPayload(event.target.value)} spellCheck={false} />
              <button className="button primary" type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan ke database'}</button>
              {message && <p className="message">{message}</p>}
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
