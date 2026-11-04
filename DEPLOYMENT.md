# JUZARA Health — Menjalankan Website

## Cara paling mudah (Docker)

1. Install Docker Desktop.
2. Salin `.env.example` menjadi `.env`.
3. Ganti password database, session secret, email admin, dan password admin.
4. Jalankan dari folder project:

```bash
docker compose up --build -d
```

5. Buka `http://localhost:8080`.
6. Cek API: `http://localhost:8080/api/health`.

## Akun administrator

Akun administrator pertama dibuat dari `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di `.env` ketika seed dijalankan. Tidak ada akun dokter publik atau password dokter bersama. Administrator harus memverifikasi kredensial profesional dokter terlebih dahulu, lalu membuat akun dokter melalui endpoint admin yang dilindungi autentikasi.

## Menghentikan aplikasi

```bash
docker compose down
```

Data database tetap berada di volume `juzara_pgdata`. Jangan gunakan `docker compose down -v` kecuali memang ingin menghapus seluruh data.

## Untuk akses publik

Dibutuhkan server/hosting, domain, HTTPS, secret produksi, backup, monitoring, firewall, dan konfigurasi `NODE_ENV=production` serta `CLIENT_ORIGIN` sesuai domain HTTPS. File ini tidak otomatis menerbitkan website ke internet.

## Batasan penting

Versi ini adalah web app development/deployment starter. Belum lulus audit keamanan, QA menyeluruh, validasi klinis, maupun pemeriksaan kepatuhan perlindungan data kesehatan. Seluruh seed faskes/jadwal bersifat DEMO dan tidak boleh digunakan untuk reservasi atau rekam medis nyata.

## Login terpadu dan backend

Frontend kini menggunakan satu formulir login. API menerima `{ email, password }` dan menentukan role dari akun di database. Akun dokter hanya diterima bila `doctor.verifiedAt` terisi; akun dokter dibuat oleh administrator melalui endpoint admin yang dilindungi autentikasi.

Untuk deployment, set `VITE_API_URL` pada proyek Vercel ke URL publik backend yang berakhiran `/api` (contoh format: `https://api-domain-anda.example/api`). Pastikan `CLIENT_ORIGIN` pada backend berisi origin frontend Vercel yang tepat, serta `DATABASE_URL` dan `SESSION_SECRET` sudah diatur pada hosting backend. Cookie session lintas domain memerlukan konfigurasi `sameSite: 'none'` dan `secure: true` serta konfigurasi CORS kredensial yang sesuai bila frontend dan API berada pada domain berbeda.

Registrasi membutuhkan database PostgreSQL yang aktif dan migrasi Prisma sudah diterapkan. Tanpa backend/database aktif, registrasi dan login tidak akan berfungsi walaupun frontend sudah ter-deploy.
