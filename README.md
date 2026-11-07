# 💰 Daily Expense Tracker & Monthly Recap

Aplikasi web sederhana untuk mencatat pengeluaran harian dan melihat total rekapitulasi secara bulanan. Aplikasi ini berjalan sepenuhnya di sisi klien (*client-side*) tanpa memerlukan database server eksternal.

## ✨ Fitur Utama
- **Pencatatan Harian:** Menginput tanggal, nama keperluan, dan nominal pengeluaran.
- **Penyimpanan Lokal:** Menggunakan `LocalStorage` agar data tetap tersimpan meskipun browser di-refresh atau ditutup.
- **Rekap Bulanan Otomatis:** Filter bawaan untuk menghitung total pengeluaran pada bulan tertentu secara dinamis.
- **Format Rupiah:** Angka otomatis terformat ke dalam Rupiah (`IDR`) agar mudah dibaca.
- **Responsive Design:** Tampilan bersih dan nyaman diakses melalui perangkat mobile maupun desktop.

## 🛠️ Teknologi yang Digunakan
- **HTML5:** Struktur semantik aplikasi.
- **CSS3:** Desain modern, layouting (Flexbox/Grid), dan variabel warna.
- **Vanilla JavaScript:** Logika manipulasi DOM, perhitungan matematika, dan manajemen state via LocalStorage.
