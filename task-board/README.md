# Task Board

Papan kerja (work management) berbasis React + TypeScript: Scrum board tiga kolom dengan
drag & drop, prioritas, label, jatuh tempo, filter, dan statistik. Data disimpan di
`localStorage`, jadi tidak butuh backend.

## Menjalankan

```bash
npm install
npm run dev        # server pengembangan
npm run typecheck  # cek tipe (tsc)
npm run lint       # oxlint
npm run build      # tsc -b + vite build
npm run preview    # cek hasil build
```

## Fitur

- Tiga kolom: To Do, Doing, Done.
- Drag & drop antarkolom maupun untuk mengurutkan ulang (indeks drop dihitung dari posisi
  kartu, jadi tetap benar saat filter aktif).
- Form tugas: judul, catatan, prioritas, label, tanggal jatuh tempo, status.
- Filter: pencarian teks, prioritas, label, sembunyikan yang selesai.
- Statistik: total per kolom, tugas telat, selesai hari ini, persentase progres.
- Tema terang/gelap: mengikuti pengaturan sistem saat pertama dibuka, bisa diganti dari header,
  pilihan tersimpan di `localStorage` dan diterapkan sebelum halaman digambar (tanpa kedip).
- Shortcut `N` untuk menambah tugas, `Esc` untuk menutup dialog.

## Struktur

```
src/
  types.ts             tipe data bersama (Task, Filters, ColumnId, ...)
  lib/
    board.ts           reducer + operasi board (move, update, filter, statistik)
    dragDrop.ts        perhitungan indeks drop
    date.ts            format tanggal lokal dan status jatuh tempo
    storage.ts         baca/tulis localStorage + data contoh
    theme.ts           baca/simpan/terapkan tema
    id.ts              pembuatan id tugas
  hooks/
    useTaskBoard.ts    useReducer + persistensi + nilai turunan
    useTheme.ts        state tema terang/gelap
  components/          AppHeader, StatsBar, FilterBar, Board, Column, TaskCard,
                       TaskDialog, PriorityBadge, LabelChips (+ CSS Modules)
```