import { useEffect, useState, useCallback } from 'react'
import type {
  ActiveRoute,
  Inventory,
  Category,
  Borrowing,
  User,
  StockHistory,
  Announcement,
  Documentation,
  ToastMessage,
  Role,
} from './types'
import { api } from './services/api'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { ToastContainer } from './components/ToastContainer'

import { DashboardView } from './views/DashboardView'
import { InventoriesView } from './views/InventoriesView'
import { CategoriesView } from './views/CategoriesView'
import { BorrowingsView } from './views/BorrowingsView'
import { StockHistoriesView } from './views/StockHistoriesView'
import { UsersView } from './views/UsersView'
import { AnnouncementsView } from './views/AnnouncementsView'
import { DocumentationsView } from './views/DocumentationsView'
import { JsonConsoleView } from './views/JsonConsoleView'

import './App.css'

function getInitialRoute(): ActiveRoute {
  const hash = window.location.hash.replace('#/', '')
  const validRoutes: ActiveRoute[] = [
    'dashboard',
    'inventories',
    'categories',
    'borrowings',
    'stock-histories',
    'users',
    'announcements',
    'documentations',
    'json-console',
  ]
  return validRoutes.includes(hash as ActiveRoute) ? (hash as ActiveRoute) : 'dashboard'
}

export function App() {
  const [activeRoute, setActiveRoute] = useState<ActiveRoute>(getInitialRoute)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data collections state
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stockHistories, setStockHistories] = useState<StockHistory[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [documentations, setDocumentations] = useState<Documentation[]>([])

  const addToast = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, text }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // URL Hash router sync
  const handleNavigate = (route: ActiveRoute) => {
    setActiveRoute(route)
    window.location.hash = `#/${route}`
    setSidebarOpen(false)
  }

  useEffect(() => {
    const handleHashChange = () => {
      setActiveRoute(getInitialRoute())
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Fetch all database resources
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      const [invData, catData, borData, userData, stkData, annData, docData] =
        await Promise.all([
          api.get<Inventory[]>('/inventories'),
          api.get<Category[]>('/categories'),
          api.get<Borrowing[]>('/borrowings'),
          api.get<User[]>('/users'),
          api.get<StockHistory[]>('/stock-histories'),
          api.get<Announcement[]>('/announcements'),
          api.get<Documentation[]>('/documentations'),
        ])

      setInventories(Array.isArray(invData) ? invData : [])
      setCategories(Array.isArray(catData) ? catData : [])
      setBorrowings(Array.isArray(borData) ? borData : [])
      setUsers(Array.isArray(userData) ? userData : [])
      setStockHistories(Array.isArray(stkData) ? stkData : [])
      setAnnouncements(Array.isArray(annData) ? annData : [])
      setDocumentations(Array.isArray(docData) ? docData : [])
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Gagal menghubungkan ke backend API')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // --- CRUD Handlers --- //

  // Inventories CRUD
  const handleCreateInventory = async (data: Omit<Inventory, 'id'>) => {
    await api.post('/inventories', data)
    addToast('success', 'Barang inventaris berhasil ditambahkan.')
    await fetchAllData()
  }

  const handleUpdateInventory = async (id: number, data: Omit<Inventory, 'id'>) => {
    await api.put(`/inventories/${id}`, data)
    addToast('success', 'Data barang berhasil diperbarui.')
    await fetchAllData()
  }

  const handleDeleteInventory = async (id: number) => {
    await api.delete(`/inventories/${id}`)
    addToast('success', 'Barang inventaris berhasil dihapus.')
    await fetchAllData()
  }

  const handleAdjustStock = async (
    data: Omit<StockHistory, 'id' | 'stokSebelum' | 'stokSesudah' | 'createdAt'>
  ) => {
    await api.post('/stock-histories', data)
    addToast('success', 'Transaksi stok berhasil diproses.')
    await fetchAllData()
  }

  // Categories CRUD
  const handleCreateCategory = async (data: Omit<Category, 'id'>) => {
    await api.post('/categories', data)
    addToast('success', 'Kategori baru berhasil dibuat.')
    await fetchAllData()
  }

  const handleUpdateCategory = async (id: number, data: Omit<Category, 'id'>) => {
    await api.put(`/categories/${id}`, data)
    addToast('success', 'Kategori berhasil diperbarui.')
    await fetchAllData()
  }

  const handleDeleteCategory = async (id: number) => {
    await api.delete(`/categories/${id}`)
    addToast('success', 'Kategori berhasil dihapus.')
    await fetchAllData()
  }

  // Borrowings CRUD
  const handleCreateBorrowing = async (data: {
    userId: number
    namaPeminjam: string
    kelas: string
    tujuan: string
    tanggalPinjam: string
    parafGuru?: string
    items: { inventoryId: number; jumlah: number; kondisiPinjam: string }[]
  }) => {
    await api.post('/borrowings', data)
    addToast('success', 'Peminjaman barang berhasil dicatat.')
    await fetchAllData()
  }

  const handleReturnBorrowing = async (
    id: number,
    data: { tanggalKembali: string; items: { itemId: number; kondisiKembali: string }[] }
  ) => {
    await api.post(`/borrowings/${id}/return`, data)
    addToast('success', 'Pengembalian barang berhasil diproses.')
    await fetchAllData()
  }

  const handleDeleteBorrowing = async (id: number) => {
    await api.delete(`/borrowings/${id}`)
    addToast('success', 'Transaksi peminjaman berhasil dihapus.')
    await fetchAllData()
  }

  // Stock Histories CRUD
  const handleDeleteStockHistory = async (id: number) => {
    await api.delete(`/stock-histories/${id}`)
    addToast('success', 'Log riwayat stok berhasil dihapus.')
    await fetchAllData()
  }

  // Users CRUD
  const handleCreateUser = async (data: {
    nama: string
    username: string
    password: string
    role: Role
    kelas?: string
  }) => {
    await api.post('/users', data)
    addToast('success', 'Pengguna baru berhasil ditambahkan.')
    await fetchAllData()
  }

  const handleUpdateUser = async (
    id: number,
    data: { nama: string; username: string; password?: string; role: Role; kelas?: string }
  ) => {
    await api.put(`/users/${id}`, data)
    addToast('success', 'Data pengguna berhasil diperbarui.')
    await fetchAllData()
  }

  const handleDeleteUser = async (id: number) => {
    await api.delete(`/users/${id}`)
    addToast('success', 'Pengguna berhasil dihapus.')
    await fetchAllData()
  }

  // Announcements CRUD
  const handleCreateAnnouncement = async (data: Omit<Announcement, 'id' | 'createdAt'>) => {
    await api.post('/announcements', data)
    addToast('success', 'Pengumuman berhasil diterbitkan.')
    await fetchAllData()
  }

  const handleUpdateAnnouncement = async (
    id: number,
    data: Omit<Announcement, 'id' | 'createdAt'>
  ) => {
    await api.put(`/announcements/${id}`, data)
    addToast('success', 'Pengumuman berhasil diperbarui.')
    await fetchAllData()
  }

  const handleDeleteAnnouncement = async (id: number) => {
    await api.delete(`/announcements/${id}`)
    addToast('success', 'Pengumuman berhasil dihapus.')
    await fetchAllData()
  }

  // Documentations CRUD
  const handleCreateDocumentation = async (data: Omit<Documentation, 'id'>) => {
    await api.post('/documentations', data)
    addToast('success', 'Dokumentasi baru berhasil ditambahkan.')
    await fetchAllData()
  }

  const handleUpdateDocumentation = async (id: number, data: Omit<Documentation, 'id'>) => {
    await api.put(`/documentations/${id}`, data)
    addToast('success', 'Dokumentasi berhasil diperbarui.')
    await fetchAllData()
  }

  const handleDeleteDocumentation = async (id: number) => {
    await api.delete(`/documentations/${id}`)
    addToast('success', 'Dokumentasi berhasil dihapus.')
    await fetchAllData()
  }

  const resourceCounts = {
    inventories: inventories.length,
    categories: categories.length,
    borrowings: borrowings.length,
    users: users.length,
    stockHistories: stockHistories.length,
    announcements: announcements.length,
    documentations: documentations.length,
  }

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <Sidebar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        counts={resourceCounts}
      />

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main-shell">
        <Topbar
          activeRoute={activeRoute}
          loading={loading}
          onRefresh={fetchAllData}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="content-body">
          {activeRoute === 'dashboard' && (
            <DashboardView
              inventories={inventories}
              categories={categories}
              borrowings={borrowings}
              users={users}
              stockHistories={stockHistories}
              onNavigate={handleNavigate}
            />
          )}

          {activeRoute === 'inventories' && (
            <InventoriesView
              inventories={inventories}
              categories={categories}
              users={users}
              onCreate={handleCreateInventory}
              onUpdate={handleUpdateInventory}
              onDelete={handleDeleteInventory}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {activeRoute === 'categories' && (
            <CategoriesView
              categories={categories}
              inventories={inventories}
              onCreate={handleCreateCategory}
              onUpdate={handleUpdateCategory}
              onDelete={handleDeleteCategory}
            />
          )}

          {activeRoute === 'borrowings' && (
            <BorrowingsView
              borrowings={borrowings}
              inventories={inventories}
              users={users}
              onCreateBorrowing={handleCreateBorrowing}
              onReturnBorrowing={handleReturnBorrowing}
              onDeleteBorrowing={handleDeleteBorrowing}
            />
          )}

          {activeRoute === 'stock-histories' && (
            <StockHistoriesView
              stockHistories={stockHistories}
              inventories={inventories}
              users={users}
              onCreateStockHistory={handleAdjustStock}
              onDeleteStockHistory={handleDeleteStockHistory}
            />
          )}

          {activeRoute === 'users' && (
            <UsersView
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeRoute === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              users={users}
              onCreate={handleCreateAnnouncement}
              onUpdate={handleUpdateAnnouncement}
              onDelete={handleDeleteAnnouncement}
            />
          )}

          {activeRoute === 'documentations' && (
            <DocumentationsView
              documentations={documentations}
              users={users}
              onCreate={handleCreateDocumentation}
              onUpdate={handleUpdateDocumentation}
              onDelete={handleDeleteDocumentation}
            />
          )}

          {activeRoute === 'json-console' && (
            <JsonConsoleView onRefresh={fetchAllData} loading={loading} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
