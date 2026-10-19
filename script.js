
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, where, onSnapshot, doc, updateDoc, increment
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMEqIS57Ro-ufzlkd1NGj0CIWabZyirOM",
  authDomain: "undangan-ari-gina-2026.firebaseapp.com",
  projectId: "undangan-ari-gina-2026",
  storageBucket: "undangan-ari-gina-2026.firebasestorage.app",
  messagingSenderId: "1016151046438",
  appId: "1:1016151046438:web:9dedfedf60b2f6b005e9e7",
  measurementId: "G-0SJ21STGS9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const params = new URLSearchParams(window.location.search);
const guest = (params.get("to") || "").trim();
if (guest) $("#guestName").textContent = guest;

const cover = $("#cover");
const main = $("#mainContent");
const music = $("#bgMusic");
const musicToggle = $("#musicToggle");

$("#openInvitation").addEventListener("click", async () => {
  document.body.classList.remove("locked");
  cover.style.transition = "opacity .7s ease";
  cover.style.opacity = "0";
  main.classList.add("visible");
  main.setAttribute("aria-hidden", "false");
  musicToggle.classList.add("show");

  try {
    await music.play();
    musicToggle.classList.add("playing");
    musicToggle.textContent = "❚❚";
  } catch (_) {}

  setTimeout(() => {
    cover.style.display = "none";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, 720);
});

musicToggle.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicToggle.classList.add("playing");
      musicToggle.textContent = "❚❚";
    } catch (_) {}
  } else {
    music.pause();
    musicToggle.classList.remove("playing");
    musicToggle.textContent = "♫";
  }
});

// Countdown: 7 November 2026, 09:00 WIB (UTC+7)
const target = new Date("2026-11-07T09:00:00+07:00").getTime();
function updateCountdown() {
  const distance = Math.max(0, target - Date.now());
  const d = Math.floor(distance / 86400000);
  const h = Math.floor((distance % 86400000) / 3600000);
  const m = Math.floor((distance % 3600000) / 60000);
  const s = Math.floor((distance % 60000) / 1000);
  $("#days").textContent = d;
  $("#hours").textContent = String(h).padStart(2, "0");
  $("#minutes").textContent = String(m).padStart(2, "0");
  $("#seconds").textContent = String(s).padStart(2, "0");
}
updateCountdown();
setInterval(updateCountdown, 1000);

// WhatsApp RSVP
const waNumber = "6281264428922";
function waLink(message) {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
const guestLabel = guest || "Bapak/Ibu/Saudara/i";
$("#waHadir").href = waLink(`Halo Ari & Gina, saya ${guestLabel}. Dengan senang hati saya mengonfirmasi akan hadir pada acara pernikahan tanggal 7 November 2026. Terima kasih.`);
$("#waTidakHadir").href = waLink(`Halo Ari & Gina, saya ${guestLabel}. Mohon maaf, saya belum dapat hadir pada acara pernikahan tanggal 7 November 2026. Semoga seluruh acara berjalan lancar dan penuh sukacita.`);

// Copy bank account
const toast = $("#copyToast");
$$(".copy-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      toast.textContent = "Nomor rekening disalin.";
    } catch {
      toast.textContent = `Nomor rekening: ${btn.dataset.copy}`;
    }
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  });
});

// Gallery lightbox
const lightbox = $("#lightbox");
const lightboxImage = $("#lightboxImage");
$$(".gallery-item").forEach(item => {
  item.addEventListener("click", () => {
    lightboxImage.src = item.dataset.src;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
}
$("#closeLightbox").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// Firestore wishes
const wishForm = $("#wishForm");
const wishSubmit = $("#wishSubmit");
const wishStatus = $("#wishStatus");

wishForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const Nama = $("#wishName").value.trim();
  const Pesan = $("#wishMessage").value.trim();

  if (!Nama || !Pesan) return;

  wishSubmit.disabled = true;
  wishStatus.textContent = "Mengirim ucapan...";

  try {
    await addDoc(collection(db, "Ucapan"), {
      Nama,
      Pesan,
      Likes: 0,
      status: "pending",
      createdAt: serverTimestamp()
    });
    wishForm.reset();
    wishStatus.textContent = "Terima kasih. Ucapan berhasil dikirim dan menunggu persetujuan.";
  } catch (err) {
    console.error(err);
    wishStatus.textContent = "Ucapan belum berhasil dikirim. Silakan coba kembali.";
  } finally {
    wishSubmit.disabled = false;
  }
});

const wishesList = $("#wishesList");
const approvedQuery = query(collection(db, "Ucapan"), where("status", "==", "approved"));

onSnapshot(approvedQuery, (snapshot) => {
  const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  items.sort((a, b) => {
    const at = a.createdAt?.toMillis?.() || 0;
    const bt = b.createdAt?.toMillis?.() || 0;
    return bt - at;
  });

  wishesList.innerHTML = "";
  if (!items.length) {
    wishesList.innerHTML = `<p class="muted">Belum ada ucapan yang ditampilkan.</p>`;
    return;
  }

  for (const item of items) {
    const card = document.createElement("article");
    card.className = "wish-card";

    const meta = document.createElement("div");
    meta.className = "wish-meta";

    const name = document.createElement("div");
    name.className = "wish-name";
    name.textContent = item.Nama || "Tamu";

    const date = document.createElement("div");
    date.className = "wish-date";
    const dt = item.createdAt?.toDate?.();
    date.textContent = dt ? dt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }) : "";

    meta.append(name, date);

    const message = document.createElement("p");
    message.className = "wish-message";
    message.textContent = item.Pesan || "";

    const like = document.createElement("button");
    like.type = "button";
    like.className = "like-btn";
    like.textContent = `♡ ${Number.isInteger(item.Likes) ? item.Likes : 0}`;
    like.addEventListener("click", async () => {
      like.disabled = true;
      try {
        await updateDoc(doc(db, "Ucapan", item.id), { Likes: increment(1) });
      } catch (err) {
        console.error(err);
      } finally {
        like.disabled = false;
      }
    });

    card.append(meta, message, like);
    wishesList.appendChild(card);
  }
}, (err) => {
  console.error(err);
  wishesList.innerHTML = `<p class="muted">Ucapan belum dapat dimuat. Periksa Firestore Rules atau koneksi internet.</p>`;
});
