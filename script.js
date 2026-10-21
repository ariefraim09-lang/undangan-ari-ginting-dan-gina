
const API_URL = "https://script.google.com/macros/s/AKfycbz0EAguWqoLDy3uTX6OMrJ9vruqyQbhg0YmHe6L0ZY-G7YjpiOHhUQ3MoxnBqfqgdjm/exec";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const guest = (new URLSearchParams(window.location.search).get("to") || "").trim();
if (guest && $("#guestName")) {
  $("#guestName").textContent = guest;
}

const cover = $("#cover");
const main = $("#mainContent");
const music = $("#bgMusic");
const musicToggle = $("#musicToggle");
music.volume = 1;
music.muted = false;

$("#openInvitation")?.addEventListener("click", async () => {
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
  } catch {
    musicToggle.textContent = "♫";
  }

  setTimeout(() => {
    cover.style.display = "none";
    window.scrollTo({ top: 0 });
  }, 720);
});

musicToggle?.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicToggle.classList.add("playing");
      musicToggle.textContent = "❚❚";
    } catch {
      musicToggle.textContent = "♫";
    }
  } else {
    music.pause();
    musicToggle.classList.remove("playing");
    musicToggle.textContent = "♫";
  }
});

// Hitung mundur
const target = new Date("2026-11-07T09:00:00+07:00").getTime();

function updateCountdown() {
  const d = Math.max(0, target - Date.now());
  $("#days").textContent = Math.floor(d / 86400000);
  $("#hours").textContent = String(Math.floor((d % 86400000) / 3600000)).padStart(2, "0");
  $("#minutes").textContent = String(Math.floor((d % 3600000) / 60000)).padStart(2, "0");
  $("#seconds").textContent = String(Math.floor((d % 60000) / 1000)).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// RSVP WhatsApp
const waNumber = "6281264428922";
const guestLabel = guest || "Bapak/Ibu/Saudara/i";
const waLink = (msg) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

$("#waHadir").href = waLink(
  `Halo Ari & Gina, saya ${guestLabel}. Dengan senang hati saya mengonfirmasi akan hadir pada acara pernikahan tanggal 7 November 2026. Terima kasih.`
);

$("#waTidakHadir").href = waLink(
  `Halo Ari & Gina, saya ${guestLabel}. Mohon maaf, saya belum dapat hadir pada acara pernikahan tanggal 7 November 2026. Semoga acara berjalan lancar.`
);

// Salin nomor rekening
const toast = $("#copyToast");

$$(".copy-btn").forEach((btn) => {
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

// Galeri foto
const lightbox = $("#lightbox");
const lightboxImage = $("#lightboxImage");

$$(".gallery-item").forEach((item) => {
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

// Kirim ucapan ke Google Sheets
const wishForm = $("#wishForm");
const wishSubmit = $("#wishSubmit");
const wishStatus = $("#wishStatus");
const wishesList = $("#wishesList");

wishForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = $("#wishName").value.trim();
  const ucapan = $("#wishMessage").value.trim();

  if (!nama || !ucapan) {
    wishStatus.textContent = "Nama dan ucapan wajib diisi.";
    return;
  }

  wishSubmit.disabled = true;
  wishStatus.textContent = "Mengirim ucapan...";

  try {
    const body = new URLSearchParams({
      nama: nama,
      ucapan: ucapan,
      jenis: "WISH",
      kehadiran: "",
      jumlah: "0",
      sumber: window.location.href
    });

    await fetch(API_URL, {
      method: "POST",
      body: body
    });

    wishForm.reset();
    wishStatus.textContent =
      "Terima kasih! Ucapan telah dikirim dan menunggu persetujuan.";
  } catch (err) {
    console.error(err);
    wishStatus.textContent =
      "Pengiriman belum dapat dipastikan. Silakan periksa Google Sheets sebelum mencoba lagi.";
  } finally {
    wishSubmit.disabled = false;
  }
});


async function loadApprovedWishes() {
  wishesList.textContent = "Memuat ucapan dan doa...";

  try {
    const response = await fetch(
      API_URL + "?action=wishes",
      { method: "GET" }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.message || "Gagal memuat ucapan.");
    }

    wishesList.replaceChildren();

    if (!data.wishes || data.wishes.length === 0) {
      wishesList.textContent =
        "Belum ada ucapan yang disetujui.";
      return;
    }

    data.wishes.forEach(function(wish) {
      const card = document.createElement("div");
      card.className = "wish-card";

      const name = document.createElement("h3");
      name.textContent = wish.nama;

      const message = document.createElement("p");
      message.textContent = wish.ucapan;

      card.append(name, message);
      wishesList.appendChild(card);
    });
  } catch (err) {
    console.error("Gagal memuat ucapan:", err);
    wishesList.textContent =
      "Ucapan belum dapat dimuat. Silakan coba lagi.";
  }
}

loadApprovedWishes();
