# Build & Deploy

Proyek ini memakai **Vite + React** (bukan Astro).

## Env

Di root `portofolio` buat file `.env` (atau salin dari `env.example`):

```bash
VITE_PUBLIC_API_URL=http://localhost:4000
```

Vite hanya mengekspos variabel yang diawali `VITE_` ke kode client.

## Scripts

- **Dev:** `npm run dev` (atau `pnpm run dev`) — jalankan Vite dev server.
- **Build:** `npm run build` — hasil di `dist/`.
- **Preview:** `npm run preview` — menyajikan `dist/` lokal.

## Build lokal (Windows): error EPERM symlink

Jika build/deploy gagal dengan error symlink (mis. dengan pnpm/node-linker):

1. **Aktifkan Developer Mode**  
   Windows Settings → Privacy & security → For developers → **Developer Mode** = On.

2. **Jalankan terminal sebagai Administrator**  
   Buka PowerShell/CMD as Admin, lalu `cd portofolio` dan `npm run build`.

3. **Build hanya di CI/Vercel**  
   Push ke Git dan biarkan platform yang menjalankan build (lingkungan Linux).

Setelah mengubah `.npmrc` (mis. `node-linker=hoisted`), jalankan ulang:

```bash
npm install
npm run build
```

## Node.js

Build di Vercel/CI biasanya memakai Node 18+. Untuk konsistensi lokal, gunakan Node 18 atau 22 (mis. lewat nvm: `nvm use 22`).
