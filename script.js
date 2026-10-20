import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

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
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const guest = (new URLSearchParams(location.search).get("to") || "").trim();
if (guest) $("#guestName").textContent = guest;

const cover=$("#cover"), main=$("#mainContent"), music=$("#bgMusic"), musicToggle=$("#musicToggle");
$("#openInvitation").addEventListener("click", async()=>{
  document.body.classList.remove("locked");
  cover.style.transition="opacity .7s"; cover.style.opacity="0";
  main.classList.add("visible"); main.setAttribute("aria-hidden","false"); musicToggle.classList.add("show");
  try{await music.play(); musicToggle.textContent="❚❚";}catch{musicToggle.textContent="♫";}
  setTimeout(()=>cover.style.display="none",720);
});
musicToggle.addEventListener("click",async()=>{
  if(music.paused){try{await music.play();musicToggle.textContent="❚❚";}catch{}}
  else{music.pause();musicToggle.textContent="♫";}
});

const target=new Date("2026-11-07T09:00:00+07:00").getTime();
setInterval(()=>{
  const d=Math.max(0,target-Date.now());
  $("#days").textContent=Math.floor(d/86400000);
  $("#hours").textContent=String(Math.floor((d%86400000)/3600000)).padStart(2,"0");
  $("#minutes").textContent=String(Math.floor((d%3600000)/60000)).padStart(2,"0");
  $("#seconds").textContent=String(Math.floor((d%60000)/1000)).padStart(2,"0");
},1000);

const wa="6281264428922", g=guest||"Bapak/Ibu/Saudara/i";
$("#waHadir").href=`https://wa.me/${wa}?text=${encodeURIComponent(`Halo Ari & Gina, saya ${g}. Dengan senang hati saya mengonfirmasi akan hadir pada acara pernikahan tanggal 7 November 2026. Terima kasih.`)}`;
$("#waTidakHadir").href=`https://wa.me/${wa}?text=${encodeURIComponent(`Halo Ari & Gina, saya ${g}. Mohon maaf, saya belum dapat hadir pada acara pernikahan tanggal 7 November 2026. Semoga seluruh acara berjalan lancar dan penuh sukacita.`)}`;

const toast=$("#copyToast");
$$(".copy-btn").forEach(b=>b.addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText(b.dataset.copy);toast.textContent="Nomor rekening disalin."}catch{toast.textContent=b.dataset.copy}
  toast.style.opacity="1";setTimeout(()=>toast.style.opacity="0",1600);
}));

const lightbox=$("#lightbox"), lightboxImage=$("#lightboxImage");
$$(".gallery-item").forEach(i=>i.addEventListener("click",()=>{lightboxImage.src=i.dataset.src;lightbox.classList.add("open")}));
$("#closeLightbox").addEventListener("click",()=>lightbox.classList.remove("open"));
lightbox.addEventListener("click",e=>{if(e.target===lightbox) lightbox.classList.remove("open")});

$("#wishForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const Nama=$("#wishName").value.trim(), Pesan=$("#wishMessage").value.trim(), s=$("#wishStatus"), btn=$("#wishSubmit");
  if(!Nama||!Pesan)return;
  btn.disabled=true;s.textContent="Mengirim ucapan...";
  try{
    await addDoc(collection(db,"Ucapan"),{Nama,Pesan,Likes:0,status:"pending",createdAt:serverTimestamp()});
    e.target.reset();s.textContent="Terima kasih. Ucapan berhasil dikirim dan menunggu persetujuan.";
  }catch(err){console.error(err);s.textContent="Ucapan belum berhasil dikirim."}
  btn.disabled=false;
});

const list=$("#wishesList");
onSnapshot(query(collection(db,"Ucapan"),where("status","==","approved")),snap=>{
  const items=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0));
  list.innerHTML="";
  if(!items.length){list.innerHTML='<p class="muted">Belum ada ucapan yang ditampilkan.</p>';return;}
  items.forEach(item=>{
    const c=document.createElement("article");c.className="wish-card";
    const n=document.createElement("strong");n.textContent=item.Nama||"Tamu";
    const p=document.createElement("p");p.textContent=item.Pesan||"";
    const l=document.createElement("button");l.className="like-btn";l.textContent=`♡ ${Number.isInteger(item.Likes)?item.Likes:0}`;
    l.addEventListener("click",async()=>{l.disabled=true;try{await updateDoc(doc(db,"Ucapan",item.id),{Likes:increment(1)})}catch{}l.disabled=false});
    c.append(n,p,l);list.append(c);
  });
},err=>{console.error(err);list.innerHTML='<p class="muted">Ucapan belum dapat dimuat.</p>'});
