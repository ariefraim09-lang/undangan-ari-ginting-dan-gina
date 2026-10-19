# Undangan Ari & Gina — GitHub Pages

Website undangan statis HTML/CSS/JavaScript dengan Firebase Cloud Firestore untuk ucapan tamu.

## Isi paket
- `index.html` — halaman utama.
- `style.css` — desain marun, hitam, putih, dan emas.
- `script.js` — countdown, musik, RSVP WhatsApp, galeri, gift copy, dan Firestore.
- `assets/images/` — foto yang sudah dioptimalkan untuk web.
- `assets/music/` — musik latar yang diberikan pengguna.
- `firestore.rules.txt` — contoh Rules yang sesuai dengan field website.

## Publikasi di GitHub Pages
1. Buat repository baru, contoh: `undangan-ari-gina`.
2. Upload seluruh isi folder ini ke root repository (pastikan `index.html` berada di root).
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Branch: `main`, folder: `/ (root)`, lalu **Save**.
6. Tunggu proses deploy selesai. URL biasanya:
   `https://USERNAME.github.io/undangan-ari-gina/`

## Personalisasi nama tamu
Tambahkan query `?to=` pada URL, misalnya:
`https://USERNAME.github.io/undangan-ari-gina/?to=Bapak%20Budi%20dan%20Keluarga`

## Firestore
Website menulis ucapan ke collection `Ucapan` dengan field:
- `Nama` (string)
- `Pesan` (string)
- `Likes` (integer)
- `status` (`pending` / `approved`)
- `createdAt` (timestamp)

Ucapan baru dibuat sebagai `pending`. Agar tampil di website, ubah field `status` menjadi `approved` melalui Firebase Console.

## Catatan penting
- Firebase web config memang berada di sisi klien. Keamanan data ditentukan oleh Firestore Security Rules.
- GitHub Pages adalah website publik. Nomor rekening dan data yang ditampilkan di `index.html` dapat dilihat oleh pengunjung.
- Jika ingin preview WhatsApp (Open Graph) lebih konsisten, setelah URL final tersedia, tambahkan `og:url` dan ubah `og:image` menjadi URL absolut dari foto cover.
