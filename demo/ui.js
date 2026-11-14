/* Közös UI-elemek: témaikonok, avatar, bottom sheet */
const TOPICS = {
  "Általános": ["#4b5563", "M4 5h16v11H9l-5 4z"],
  "Kampány": ["#c2410c", "M5 21V4h12l-2 4 2 4H5"],
  "Gazdaság": ["#2f7d3b", "M3 17l6-6 4 4 8-8M15 7h6v6"],
  "Munka és bérek": ["#d9691f", "M4 8h16v11H4zM9 8V5h6v3"],
  "Adók": ["#d98a14", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v10M9.5 9.5c0-1 1-1.500 2.500-1.500s2.500.500 2.500 1.500-1 1.500-2.500 2-2.500 1-2.500 2 1 1.500 2.500 1.500 2.500-.500 2.500-1.500"],
  "Család": ["#be4b7a", "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 11a2.500 2.500 0 1 0 0-5M17 15c2.500 0 4 1.500 4 4"],
  "Lakhatás": ["#2c7a8a", "M3 11l9-7 9 7v9H4zM10 20v-6h4v6"],
  "Egészségügy": ["#d1456b", "M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"],
  "Oktatás": ["#6d4ad9", "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5"],
  "Nyugdíj": ["#a63fa0", "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4l3 2"],
  "Szociális": ["#c2410c", "M12 20s-7-4.500-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.500-7 10-7 10z"],
  "Rend és biztonság": ["#374151", "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"],
  "Energia": ["#c99a0a", "M13 3L5 14h6l-1 7 8-11h-6z"],
  "Közlekedés": ["#3b6fc4", "M6 4h12v12H6zM8 20l2-4M16 20l-2-4M6 10h12"],
  "Környezet": ["#4f8f2a", "M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l8-8"],
  "Külpolitika": ["#2f7d3b", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"],
};
/* a katalógus témaköreit a 16 ikonos fórumtémára képezzük le */
function topicKey(t) {
  if (TOPICS[t]) return t;
  const m = [["adó", "Adók"], ["Áfa", "Adók"], ["Költségvetés", "Gazdaság"], ["Munka", "Munka és bérek"], ["Család", "Család"], ["Lakhatás", "Lakhatás"], ["Nyugdíj", "Nyugdíj"], ["Szociális", "Szociális"], ["Egészség", "Egészségügy"], ["Oktatás", "Oktatás"], ["Közbiztonság", "Rend és biztonság"], ["Igazságszolgáltatás", "Rend és biztonság"], ["Energia", "Energia"], ["Közlekedés", "Közlekedés"], ["Környezet", "Környezet"], ["Külpolitika", "Külpolitika"], ["Gazdaságfejlesztés", "Gazdaság"], ["Agrár", "Gazdaság"], ["Média", "Általános"]];
  const f = m.find(([k]) => (t || "").includes(k)); return f ? f[1] : "Általános";
}
const tIcon = (t, size = 18) => { const [c, p] = TOPICS[topicKey(t)]; return `<svg class="ti" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${p}"/></svg>`; };
const tChip = (t) => `<span class="tchip">${tIcon(t, 13)}${esc(t)}</span>`;
const AV_COLORS = ["#3f8f4a", "#3b7ea1", "#8a5cc2", "#c76a2a", "#4b5563", "#b4506d", "#7a8b1f", "#2f6fb0"];
const avatar = (nick, size = 24) => `<i class="av" style="width:${size}px;height:${size}px;background:${AV_COLORS[hash(nick) % AV_COLORS.length]};font-size:${Math.round(size * 0.5)}px">${esc((nick || "?")[0].toUpperCase())}</i>`;

/* alulról felcsúszó lap (a mintában minden űrlap ilyen) */
function sheet(kicker, title, html) {
  const m = document.createElement("div"); m.className = "sheetwrap";
  m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><i class="grab"></i><button class="x" aria-label="Bezárás">✕</button><div class="sk">${esc(kicker || "")}</div><h2 class="st2">${esc(title)}</h2><div class="sb">${html}</div></div>`;
  const close = () => { m.remove(); document.removeEventListener("keydown", esc2); };
  const esc2 = (e) => { if (e.key === "Escape") close(); };
  m.addEventListener("click", (e) => { if (e.target === m) close(); });
  $(".x", m).onclick = close; document.addEventListener("keydown", esc2); document.body.append(m);
  return { el: m, close, $: (s) => $(s, m) };
}
const topicChips = (selected, max, attr = "data-tp") => Object.keys(TOPICS).map((t) => `<button type="button" class="tchip sel ${selected.has(t) ? "on" : ""}" ${attr}="${esc(t)}">${tIcon(t, 14)}${esc(t)}</button>`).join("");
