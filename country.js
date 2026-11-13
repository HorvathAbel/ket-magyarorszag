/* Ország (mutatók, törvények, eredményjelző), Módszertan (nyilvános), Szabályok (nyilvános) */
const COMPARE = false; // a mintajáték szerint a másik ország eredménye csak a videókban látszik; true = mindkét vonal látszik

/* Kiinduló mutatók. Csak az ellenőrzött értékek vannak kitöltve; a többi „kezdőérték betöltendő” (KSH, Eurostat, MNB). */
const INDICATORS = [
  { g: "Gazdaság", n: "Gazdaság mérete", v: "100,0", src: "A modell számolja (kezdet = 100)", kpi: null },
  { g: "Gazdaság", n: "GDP-növekedés", v: "kb. 0,5%", note: "2025, előzetes becslések szerint stagnálás", src: "KSH, MTA-riport (2025–26)", kpi: "gdp" },
  { g: "Gazdaság", n: "Infláció", v: null, src: "KSH, a legutóbbi 12 havi érték", kpi: "infl" },
  { g: "Gazdaság", n: "Munkanélküliség", v: null, src: "KSH munkaerő-felmérés", kpi: null },
  { g: "Emberek", n: "Reálbér", v: null, src: "KSH", kpi: "wage" },
  { g: "Emberek", n: "Szegénységi kockázat", v: null, src: "KSH, Eurostat (AROPE)", kpi: null },
  { g: "Emberek", n: "Lakásár / jövedelem arány", v: null, src: "MNB lakáspiaci jelentés", kpi: "housing" },
  { g: "Emberek", n: "Egészségügyi ellátás (várólisták)", v: null, src: "NEAK, OECD", kpi: "health" },
  { g: "Állam", n: "Államháztartási hiány", v: "4,7% GDP", note: "2025", src: "Eurostat / KSH (2026. április)", kpi: "deficit" },
  { g: "Állam", n: "Államadósság", v: "74,6% GDP", note: "2025 vége, a második éve nő", src: "Eurostat / KSH (2026. április)", kpi: null },
  { g: "Rend és környezet", n: "Közbiztonság (bűncselekmény / 100 ezer fő)", v: null, src: "ENYÜBS, KSH", kpi: null },
  { g: "Rend és környezet", n: "CO₂-kibocsátás", v: null, src: "Eurostat, HungaroMet", kpi: null },
  { g: "Hangulat", n: "Országhangulat", v: "50", src: "Játékbecslés, nem tanulmány", kpi: null },
  { g: "Hangulat", n: "Társadalmi feszültség", v: "50", src: "Játékbecslés, nem tanulmány", kpi: null },
  { g: "Hangulat", n: "Politikai stabilitás", v: "50", src: "Játékbecslés, nem tanulmány", kpi: null },
  { g: "Hangulat", n: "Kormányba vetett bizalom", v: "50", src: "Játékbecslés, nem tanulmány", kpi: null },
  { g: "Hangulat", n: "Üzleti bizalom", v: "50", src: "Játékbecslés, nem tanulmány", kpi: null },
];
const effChips = (e) => KPI_KEYS.filter(([k]) => e[k]).map(([k, n]) => `<span class="chip eff ${e[k] > 0 ? "pos" : "neg"}">${n} ${e[k] > 0 ? "+" : "−"}${Math.abs(e[k])}</span>`).join("") || '<span class="chip">nincs mért hatás</span>';

/* mely döntések mozgatják az adott mutatót (a katalógus hatásvektoraiból) */
function movers(kpi) {
  return CAT.map((q) => { const v = q.options.map((o) => o.effects[kpi]); return { q, lo: Math.min(...v), hi: Math.max(...v), span: Math.max(...v) - Math.min(...v) }; })
    .filter((x) => x.span > 0).sort((a, b) => b.span - a.span).slice(0, 6);
}
const sgn = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n);

function lineChart(u) {
  const S = { tisza: [100, 101.8, 103.1, 102.4, 105.2, 107.9, 107.1, 109.2], fidesz: [100, 102.2, 102.9, 104.6, 103.8, 106.1, 108.3, 108.9] };
  const lines = COMPARE ? ["tisza", "fidesz"] : [u.country], all = lines.flatMap((k) => S[k]);
  const W = 640, H = 220, p = 34, mn = Math.floor(Math.min(...all) - 1), mx = Math.ceil(Math.max(...all) + 1);
  const X = (i) => p + (i * (W - p * 2)) / 7, Y = (v) => H - p - ((v - mn) / (mx - mn)) * (H - p * 2);
  const path = (a) => a.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(v).toFixed(1)).join("");
  const grid = [0, 1, 2, 3].map((i) => { const v = mn + ((mx - mn) * i) / 3; return `<line x1="${p}" x2="${W - p}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e4e8f0"/><text x="${p - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="#5b6678">${Math.round(v)}</text>`; }).join("");
  const xl = S.tisza.map((_, i) => `<text x="${X(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#5b6678">${2027 + i}</text>`).join("");
  const col = { tisza: "#1b5be0", fidesz: "#ff8300" };
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Összesített fejlődési index évenként">${grid}${xl}${lines.map((k) => `<path d="${path(S[k])}" fill="none" stroke="${col[k]}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</svg>`;
}

function countryPage() {
  const u = guard(); if (!u) return;
  let tab = "ind";
  const grp = { "Gazdaság": "Gazdaság", "Emberek": "Emberek", "Állam": "Állam", "Rend és környezet": "Rend és környezet", "Hangulat": "Az ország hangulata" };
  const draw = () => {
    const groups = [...new Set(INDICATORS.map((i) => i.g))];
    view.innerHTML = `${demoBanner}<div class="wrap page"><div><div class="hint" style="font-size:12px">Kiinduló állapot · 2026</div><h1 style="font-size:30px;color:var(--${u.country === "tisza" ? "tisza" : "fidesz-ink"})">${SIDES[u.country].name.toUpperCase()}</h1></div>
      <div class="seg">${[["ind", "▥ Számok"], ["news", "📣 Hírek"], ["score", "⚑ Eredményjelző"]].map(([i, n]) => `<button class="${tab === i ? "on" : ""}" data-t="${i}">${n}</button>`).join("")}</div>
      ${tab === "ind" ? `<p class="hint" style="font-size:14px">Kiinduló számok (2026). Minden változás adatokból és tanulmányokból jön, mindkét országra ugyanúgy. A „Részletesen” gomb megmutatja, mi mozgatja a számot.</p>
        ${groups.map((g) => `<h3 class="gh">${grp[g] || g}</h3><div class="igrid">${INDICATORS.map((i, ix) => [i, ix]).filter(([i]) => i.g === g).map(([i, ix]) => `<div class="icard"><span class="hint">${esc(i.n)}</span><b class="${i.v ? "" : "na"}">${i.v || "—"}</b><span class="isrc">${i.note ? esc(i.note) + " · " : ""}${i.v ? "" : "kezdőérték betöltendő · "}${esc(i.src)}</span><div class="ib"><button data-h="${ix}">📈 Előzmény</button><button data-d="${ix}">⌕ Részletesen</button></div></div>`).join("")}</div>`).join("")}
        <h3 class="gh">Hatályos törvények</h3><div class="card">${[...new Set(CAT.map((q) => q.topic))].map((t) => `<div class="mrow"><span>${tIcon(t, 15)} ${esc(t)}</span><span class="hint">a jelenlegi szabályozás marad</span></div>`).join("")}</div>` : ""}
      ${tab === "news" ? `<div class="card empty"><span class="bulb">📣</span><p class="hint">Még nincs hír. A heti döntések után itt olvasod, mi történt az országodban.</p></div>` : ""}
      ${tab === "score" ? scoreboard(u) : ""}</div>`;
    view.querySelectorAll("[data-t]").forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
    view.querySelectorAll("[data-h]").forEach((b) => (b.onclick = () => { const i = INDICATORS[+b.dataset.h]; sheet("Előzmény", i.n, `<p class="hint">Még nincs előzmény: ${i.v ? "a kiinduló érték " + esc(i.v) + "." : "a kezdőérték betöltésre vár."} Az első játékév lezárása után itt látod a változást évről évre.</p>${i.kpi === "gdp" || i.n === "Gazdaság mérete" ? lineChart(u) : ""}<p class="hint">Forrás: ${esc(i.src)}</p>`); }));
    view.querySelectorAll("[data-d]").forEach((b) => (b.onclick = () => { const i = INDICATORS[+b.dataset.d]; sheet("Részletesen", i.n, `<p class="hint">${i.note ? esc(i.note) + ". " : ""}<b>Forrás:</b> ${esc(i.src)}</p>${i.kpi ? `<div class="eyebrow">Ezek a döntések mozgatják</div><ul class="mv">${movers(i.kpi).map((x) => `<li><span>${esc(x.q.q)}</span><em>${sgn(x.lo)} … ${sgn(x.hi)}</em></li>`).join("")}</ul>` : '<p class="hint">Ezt a számot a modell közvetetten mozgatja, vagy játékbecslés.</p>'}`); }));
  };
  draw();
}
function scoreboard(u) {
  const base = { tisza: [6565, 1351, 332, 107, 8401], fidesz: [11831, 2878, 701, 164, 14402] }, me = civ().cands[u.country].some((c) => c.nick === u.nick) ? 1 : 0;
  const v = (s, i) => (base[s][i] + (s === u.country ? (i === 0 ? 1 : i === 1 ? me : 0) : 0)).toLocaleString("hu-HU");
  const rows = ["Polgárok", "Jelöltek", "Polgári ötletek", "Csevegőcsoportok", "Üzenet (24 óra)"];
  return `<div class="card"><div class="sb2"><b class="t-txt">TISZA</b><span></span><b class="f-txt">FIDESZ</b>${rows.map((r, i) => `<b class="t-txt big">${v("tisza", i)}</b><span class="hint">${r}</span><b class="f-txt big">${v("fidesz", i)}</b>`).join("")}</div>
    <p class="hint" style="font-size:13px;margin-top:10px">Csak a részvételről. Amit a másik ország mond és szavaz, titok. Azt, hogyan áll, a közösségi videókban mutatjuk meg. Demóadat.</p></div>`;
}

/* ---------- Módszertan (nyilvános) ---------- */
function methodology() {
  const topics = [...new Set(CAT.map((q) => q.topic))], ev = CAT.flatMap((q) => q.evidence || []);
  const n = (f) => ev.filter(f).length;
  view.innerHTML = `<div class="wrap page"><div><div class="eyebrow">Módszertan</div><h1 style="font-size:34px">Hogyan számolunk?</h1>
    <p class="lead" style="margin-top:8px">Mindkét ország ugyanazzal a modellel és ugyanazokkal a szabályokkal fut. Az egyetlen különbség az, hogy mit döntenek a polgárai.</p></div>
    <div class="card"><h3>A modell</h3><ul class="mv plain">
      <li>Minden mutató valós adatból indul (2026 a nulladik év). A betöltendő kezdőértékeket jelezzük.</li>
      <li>Új törvények nélkül minden mutató a saját alaptrendjét követi.</li>
      <li>Minden döntés annyit mozgat a mutatókon, amennyit a nyilvános becslések mondanak. A hatások többsége néhány év alatt épül be.</li>
      <li>A válságok mindkét országot egyformán érik, előre megadott ideig.</li>
      <li>A hiány a kiadás és a bevétel különbsége, az adósság a hiánnyal nő, a gazdaság növekedésével együtt csökken az arányosan.</li>
      <li>Ezek leegyszerűsített becslések. A valós hatások bizonytalanok, a törvények egymásra is hatnak.</li></ul></div>
    <div class="card"><h3>A katalógus</h3><p class="hint" style="margin-top:4px"><b>${CAT.length}</b> kérdés, <b>${topics.length}</b> témakör, <b>${ev.length}</b> precedens: ${n((e) => e.confidence === "high")} high, ${n((e) => e.confidence === "medium")} medium, ${n((e) => e.confidence === "low")} low megbízhatóságú. <b>${n((e) => e.check === "confirmed")}</b> állítást független ellenőrzés a forrással összevetett és megerősített.</p></div>
    <div class="card"><h3>Mutatók és források</h3>${INDICATORS.map((i) => `<div class="mrow"><span>${i.n}</span><span class="hint">${esc(i.src)}</span></div>`).join("")}</div>
    <div class="card"><h3>Döntések és hatásaik</h3><p class="hint" style="margin:4px 0 10px">A hatások szerkesztői becslések a precedensek alapján, a modell kalibrálás alatt. Minden opciónál látszik, hogy mely mutatókat mozgatja.</p>
      ${topics.map((t) => `<details class="mt"><summary>${esc(t)} <span class="hint">(${CAT.filter((q) => q.topic === t).length})</span></summary>${CAT.filter((q) => q.topic === t).map((q) => `<div class="mq"><h4>${esc(q.q)}</h4>${q.options.map((o) => `<div class="mo"><b>${esc(o.label)}</b><div class="tp">${effChips(o.effects)}</div></div>`).join("")}
        <p class="hint">${(q.evidence || []).length} precedens · ${(q.evidence || []).filter((e) => e.check === "confirmed").length} ellenőrizve</p></div>`).join("")}</details>`).join("")}</div>
    <p class="hint">Szimuláció, nem előrejelzés és nem tanács. <a href="#/szabalyok">Szabályok</a></p></div>`;
}
