import React, { useState, useEffect } from 'react'

interface JsonConsoleViewProps {
  onRefresh: () => void
  loading: boolean
}

const API_URL = 'http://localhost:3000/api'
const resources = ['users', 'categories', 'inventories', 'stock-histories', 'announcements', 'documentations']
const examples: Record<string, string> = {
  users: '{\n  "nama": "Budi",\n  "username": "budi",\n  "password": "rahasia",\n  "role": "peminjam"\n}',
  categories: '{\n  "namaKategori": "Elektronik",\n  "deskripsi": "Peralatan elektronik"\n}',
  inventories: '{\n  "categoryId": 1,\n  "kodeBarang": "EL-001",\n  "namaBarang": "Laptop",\n  "stok": 5,\n  "kondisi": "Baik",\n  "lokasi": "Lab 1"\n}',
}

export const JsonConsoleView: React.FC<JsonConsoleViewProps> = () => {
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

  useEffect(() => {
    loadData()
  }, [resource])

  async function submitData(event: React.FormEvent) {
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
      setMessage('Data berhasil disimpan ke database.')
      await loadData()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menyimpan data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="json-console-view">
      <div className="grid">
        <div className="panel flex-1">
          <div className="panel-heading">
            <div className="flex-row gap-12 align-center">
              <h3>Dokumen Koleksi</h3>
              <select
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                className="select-sm"
              >
                {resources.map((r) => (
                  <option key={r} value={r}>
                    GET /api/{r}
                  </option>
                ))}
              </select>
            </div>
            <button className="button secondary" onClick={loadData} disabled={loading}>
              {loading ? 'Memuat...' : 'Refresh JSON'}
            </button>
          </div>

          <div className="data-view">
            {rows.length ? (
              <pre>{JSON.stringify(rows, null, 2)}</pre>
            ) : (
              <p className="empty">Belum ada data JSON ditampilkan.</p>
            )}
          </div>
        </div>

        <form className="panel input-panel flex-1" onSubmit={submitData}>
          <div className="panel-heading">
            <h3>POST Low-Level Payload</h3>
            <span>POST /{resource}</span>
          </div>
          <label htmlFor="payload" className="mx-20 mt-16 mb-8 text-muted">
            Dokumen JSON Input:
          </label>
          <textarea
            id="payload"
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            spellCheck={false}
          />
          <button className="button primary mx-20 mt-16" type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Kirim JSON ke Endpoint'}
          </button>
          {message && <p className="message mx-20 mt-12">{message}</p>}
        </form>
      </div>
    </div>
  )
}
