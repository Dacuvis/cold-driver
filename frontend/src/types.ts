export type Role = 'admin' | 'petugas' | 'peminjam'
export type StockChange = 'masuk' | 'keluar'
export type BorrowingStatus = 'dipinjam' | 'dikembalikan'

export interface User {
  id: number
  nama: string
  username: string
  role: Role
  kelas?: string
  createdAt?: string
}

export interface Category {
  id: number
  namaKategori: string
  deskripsi?: string
}

export interface Inventory {
  id: number
  categoryId: number
  kodeBarang: string
  namaBarang: string
  stok: number
  kondisi: string
  lokasi: string
  deskripsi?: string
}

export interface StockHistory {
  id: number
  inventoryId: number
  userId: number
  jenis: StockChange
  jumlah: number
  stokSebelum: number
  stokSesudah: number
  keterangan?: string
  createdAt: string
}

export interface BorrowingItem {
  id?: number
  borrowingId?: number
  inventoryId: number
  jumlah: number
  kondisiPinjam: string
  kondisiKembali?: string
}

export interface Borrowing {
  id: number
  userId: number
  kodePeminjaman: string
  namaPeminjam: string
  kelas: string
  tujuan: string
  tanggalPinjam: string
  tanggalKembali?: string
  status: BorrowingStatus
  parafGuru?: string
  items: BorrowingItem[]
}

export interface Announcement {
  id: number
  judul: string
  isi: string
  thumbnail?: string
  createdBy: number
  createdAt: string
}

export interface Documentation {
  id: number
  judul: string
  kategori: string
  deskripsi?: string
  foto?: string
  tanggal: string
  createdBy: number
}

export type ActiveRoute =
  | 'dashboard'
  | 'inventories'
  | 'categories'
  | 'borrowings'
  | 'stock-histories'
  | 'users'
  | 'announcements'
  | 'documentations'
  | 'json-console'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}
