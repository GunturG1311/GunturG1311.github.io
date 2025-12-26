// ===== Utilities =====
const $ = (sel) => document.querySelector(sel);
const params = () => new URLSearchParams(location.search);

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
};

document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});

// ===== Dummy Data (ganti nanti dari API/backend) =====
const MATERI = [
  {
    id: "m1",
    title: "Laravel Dasar: Routing, Controller, View",
    summary: "Pengenalan struktur MVC Laravel dan alur request sederhana.",
    category: "pemrograman",
    type: "artikel",
    tags: ["laravel", "php", "web"],
    author: "Admin",
    date: "2025-12-20",
    views: 1200,
    url: "https://laravel.com/docs"
  },
  {
    id: "m2",
    title: "Python untuk Data: List, Dict, Loop",
    summary: "Dasar-dasar Python yang sering dipakai untuk analisis data.",
    category: "pemrograman",
    type: "video",
    tags: ["python", "data"],
    author: "Kontributor",
    date: "2025-12-18",
    views: 980,
    url: "https://www.python.org/"
  },
  {
    id: "m3",
    title: "Pengantar Jaringan: IP, Subnet, Routing",
    summary: "Konsep inti jaringan komputer, cocok untuk pemula.",
    category: "jaringan",
    type: "pdf",
    tags: ["network", "tcpip"],
    author: "Admin",
    date: "2025-12-15",
    views: 760,
    url: ""
  },
  {
    id: "m4",
    title: "UI/UX Dasar: Hirarki Visual dan Spacing",
    summary: "Cara membuat tampilan lebih rapi dan mudah dipahami.",
    category: "desain",
    type: "artikel",
    tags: ["uiux", "design"],
    author: "Kontributor",
    date: "2025-12-10",
    views: 650,
    url: ""
  },
  {
    id: "m5",
    title: "Bisnis: Cara Menentukan Value Proposition",
    summary: "Framework sederhana agar produk punya nilai yang jelas.",
    category: "bisnis",
    type: "artikel",
    tags: ["bisnis", "produk"],
    author: "Admin",
    date: "2025-12-05",
    views: 540,
    url: ""
  },
  {
    id: "m6",
    title: "Network Fiber: ODC/ODP dan Arsitektur FTTx",
    summary: "Ringkas tentang komponen ODC/ODP dan alur distribusi fiber.",
    category: "jaringan",
    type: "artikel",
    tags: ["network", "fiber"],
    author: "Admin",
    date: "2025-12-22",
    views: 1500,
    url: ""
  },
];

// ===== Card builder =====
function materiCard(item) {
  const badge = item.type.toUpperCase();
  const cat = item.category;
  const tags = item.tags.map(t => `<span class="tag">#${t}</span>`).join("");
  const href = `materi-detail.html?id=${encodeURIComponent(item.id)}`;

  return `
    <article class="card card-item">
      <div class="card-item__top">
        <span class="badge">${badge}</span>
        <span class="badge">${cat}</span>
      </div>
      <a href="${href}">
        <div class="title">${item.title}</div>
      </a>
      <div class="muted">${item.summary}</div>
      <div class="meta" style="margin-top:10px;">
        <span>👤 ${item.author}</span>
        <span>📅 ${fmtDate(item.date)}</span>
        <span>👁️ ${item.views.toLocaleString("id-ID")}</span>
      </div>
      <div class="tags">${tags}</div>
    </article>
  `;
}

function applyFilters(data, { q="", cat="", type="", tag="", sort="newest" }) {
  const qq = (q || "").trim().toLowerCase();

  let out = data.filter(x => {
    const okQ = !qq || (x.title.toLowerCase().includes(qq) || x.summary.toLowerCase().includes(qq));
    const okCat = !cat || x.category === cat;
    const okType = !type || x.type === type;
    const okTag = !tag || x.tags.includes(tag);
    return okQ && okCat && okType && okTag;
  });

  if (sort === "newest") out.sort((a,b) => new Date(b.date) - new Date(a.date));
  if (sort === "popular") out.sort((a,b) => b.views - a.views);
  if (sort === "az") out.sort((a,b) => a.title.localeCompare(b.title));

  return out;
}

// ===== Page inits =====
window.renderLatest = (gridId, limit=6) => {
  const el = document.getElementById(gridId);
  if (!el) return;
  const newest = [...MATERI].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
  el.innerHTML = newest.map(materiCard).join("");
};

window.initMateriPage = () => {
  const grid = $("#materiGrid");
  const countInfo = $("#countInfo");
  const qEl = $("#q");
  const catEl = $("#cat");
  const typeEl = $("#type");
  const sortEl = $("#sort");

  // ambil dari querystring jika ada
  const p = params();
  const initQ = p.get("q") || "";
  const initCat = p.get("cat") || "";
  const initTag = p.get("tag") || "";

  qEl.value = initQ;
  catEl.value = initCat;

  let currentTag = initTag;

  const render = () => {
    const out = applyFilters(MATERI, {
      q: qEl.value,
      cat: catEl.value,
      type: typeEl.value,
      tag: currentTag,
      sort: sortEl.value
    });

    grid.innerHTML = out.map(materiCard).join("");
    const tagInfo = currentTag ? ` • tag: #${currentTag}` : "";
    countInfo.textContent = `${out.length} materi ditemukan${tagInfo}`;
  };

  $("#apply").addEventListener("click", render);
  $("#reset").addEventListener("click", () => {
    qEl.value = "";
    catEl.value = "";
    typeEl.value = "";
    sortEl.value = "newest";
    currentTag = "";
    render();
  });

  sortEl.addEventListener("change", render);

  document.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentTag = btn.dataset.tag;
      render();
    });
  });

  render();
};

window.initDetailPage = () => {
  const p = params();
  const id = p.get("id");
  const box = $("#detail");
  const related = $("#relatedGrid");

  const item = MATERI.find(x => x.id === id) || MATERI[0];

  box.innerHTML = `
    <h2>${item.title}</h2>
    <div class="meta">
      <span>👤 ${item.author}</span>
      <span>📅 ${fmtDate(item.date)}</span>
      <span class="badge">${item.category}</span>
      <span class="badge">${item.type}</span>
    </div>
    <p style="margin-top:12px;">${item.summary}</p>

    <div class="tags">
      ${item.tags.map(t => `<a class="tag" href="materi.html?tag=${encodeURIComponent(t)}">#${t}</a>`).join("")}
    </div>

    <div class="detail__actions">
      ${item.url ? `<a class="btn btn--primary" href="${item.url}" target="_blank" rel="noreferrer">Buka Sumber</a>` : ""}
      <a class="btn btn--ghost" href="upload.html">Upload Materi Baru</a>
    </div>

    <hr style="border:0;border-top:1px solid var(--line); margin:16px 0;">
    <h3>Konten (placeholder)</h3>
    <p class="muted">
      Di versi produksi, area ini bisa berisi artikel full (markdown/html), embed video, atau preview PDF.
    </p>
  `;

  const out = MATERI
    .filter(x => x.id !== item.id && (x.category === item.category || x.tags.some(t => item.tags.includes(t))))
    .slice(0, 6);

  related.innerHTML = out.map(materiCard).join("");
};

window.initUploadPage = () => {
  const form = $("#uploadForm");
  const toast = $("#toast");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    toast.hidden = false;
    toast.textContent = "✅ Materi tersimpan (demo). Untuk produksi, hubungkan ke backend + database.";
    form.reset();
    setTimeout(() => (toast.hidden = true), 3500);
  });
};

window.initDashboardPage = () => {
  const box = $("#queueTable");
  if (!box) return;

  const demoQueue = [
    { title: "Dasar Git & GitHub", cat: "pemrograman", type: "artikel", by: "User A" },
    { title: "Subnetting Cepat", cat: "jaringan", type: "pdf", by: "User B" },
    { title: "UI Checklist untuk Landing Page", cat: "desain", type: "artikel", by: "User C" },
  ];

  box.innerHTML = demoQueue.map((x) => `
    <div class="trow">
      <div>
        <div style="font-weight:800">${x.title}</div>
        <div class="muted">Oleh ${x.by}</div>
      </div>
      <div class="muted">Kategori: ${x.cat}</div>
      <div class="muted">Tipe: ${x.type}</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap">
        <button class="btn btn--primary" onclick="alert('Approve (demo)')">Approve</button>
        <button class="btn btn--ghost" onclick="alert('Reject (demo)')">Reject</button>
      </div>
    </div>
  `).join("");
};