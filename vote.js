/* Szavazás a katalógusból (data/catalog.js -> window.CATALOG): végleges szavazat, technikai részletek, polgári javaslatok, utólagos precedens-értékelés */
const CAT = window.CATALOG || [];
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const weekNum = () => Math.max(0, Math.floor((Date.now() - LAUNCH_AT) / 6048e5));
const safeUrl = (u) => (/^https?:\/\//.test(u || "") ? u : "#");
const VERD = { jo: ["Bevált", "ok"], vegyes: ["Vegyes", "mid"], rossz: ["Nem vált be", "bad"] };
const KPI_KEYS = [["gdp", "GDP"], ["infl", "Infláció"], ["wage", "Reálbér"], ["housing", "Lakhatás"], ["health", "Egészségügy"], ["deficit", "Hiány"]];

/* hetente 3 kérdés, mindig három különböző témakörből */
function weekMeasures(wk = weekNum()) {
  const topics = [...new Set(CAT.map((m) => m.topic))];
  if (!topics.length) return [];
  const out = [];
  for (let i = 0; i < 3; i++) {
    const n = wk * 3 + i, tp = topics[n % topics.length], pool = CAT.filter((m) => m.topic === tp);
    out.push(pool[Math.floor(n / topics.length) % pool.length]);
  }
  return out;
}
const seedVotes = (m, side) => m.options.map((_, i) => 12 + (hash(m.id + side + i) % 40));
const winnerIdx = (m, side) => { const v = seedVotes(m, side); return v.indexOf(Math.max(...v)); };

function evidenceHtml(m) {
  const ev = m.evidence || [];
  if (!ev.length) return "";
  return `<div class="ev"><h4>Mit mutatnak a számok? Hasonló döntések máshol</h4>${ev.map((e) => {
    const [lab, cls] = VERD[e.verdict] || ["Vegyes", "mid"];
    return `<div class="evrow"><span class="vb ${cls}">${lab}</span><div>
      <strong>${esc(e.where)}${e.when ? " · " + esc(e.when) : ""}</strong>
      <p>${esc(e.what)}</p>
      <p class="num">${esc(e.numbers)}</p>
      <p class="hint">${esc(e.why || "")} <a href="${esc(safeUrl(e.source))}" target="_blank" rel="noopener noreferrer">Forrás</a>${e.confidence === "low" ? " · <em>kevésbé megbízható adat</em>" : ""}${e.check === "confirmed" ? ' · <span class="ok-chk">✓ forrás ellenőrizve</span>' : ""}</p></div></div>`;
  }).join("")}</div>`;
}
function contextHtml(m) {
  const c = m.context || {};
  return `<details class="ctx"><summary>Háttér: hol tartunk, mit tettek eddig a kormányok?</summary>
    <div class="ctxgrid"><div class="ctxc f"><b>Fidesz-kormányok, 2010–2026</b><p>${esc(c.fidesz || "–")}</p></div>
    <div class="ctxc t"><b>Tisza-kormány, 2026–</b><p>${esc(c.tisza || "–")}</p></div></div>
    ${(c.sources || []).length ? `<p class="hint">Források: ${c.sources.map((s, i) => `<a href="${esc(safeUrl(s))}" target="_blank" rel="noopener noreferrer">[${i + 1}]</a>`).join(" ")}</p>` : ""}</details>`;
}

function techHtml(m, o) {
  const rows = KPI_KEYS.filter(([k]) => o.effects[k]).map(([k, n]) => `<div class="trow"><b>${n}</b><span class="chip eff ${o.effects[k] > 0 ? "pos" : "neg"}">${o.effects[k] > 0 ? "+" : "−"}${Math.abs(o.effects[k])}</span><span class="hint">${o.effects[k] > 0 ? "javul" : "romlik"}</span></div>`).join("");
  const ev = (m.evidence || []).slice(0, 4).map((e) => `<li><span class="vb ${(VERD[e.verdict] || [0, "mid"])[1]}">${(VERD[e.verdict] || ["Vegyes"])[0]}</span> <b>${esc(e.where)}</b>: ${esc(e.numbers)} <a href="${esc(safeUrl(e.source))}" target="_blank" rel="noopener noreferrer">Forrás</a></li>`).join("");
  return `<div class="tech-in"><p class="hint"><b>Előny:</b> ${esc(o.pro)}<br><b>Ára:</b> ${esc(o.con)}</p>
    <div class="eyebrow">Biztosan megtörténik</div>${rows || '<p class="hint">Nincs mért hatás a hat fő mutatón.</p>'}
    <details class="why"><summary>Miért, és a forrás</summary><ul class="mv plain">${ev || "<li>Nincs precedens.</li>"}</ul><p class="hint">A hatások szerkesztői becslések (−3…+3) a precedensek alapján, a modell kalibrálás alatt.</p></details></div>`;
}
function vote() {
  const u = guard(); if (!u) return;
  const wk = "w" + weekNum(), mine = (u.votes[wk] = u.votes[wk] || {}), ms = weekMeasures(), cls = SIDES[u.country].cls, sel = {}, openTech = new Set();
  let tab = new URLSearchParams(location.hash.split("?")[1] || "").get("t") === "cit" ? "cit" : "votes";
  const done = () => ms.filter((m) => mine[m.id] !== undefined).length, vClose = nextDow(6, 23, 59);
  const render = () => {
    const sub = tab === "cit" ? "A legtámogatottabb ötletek szavazásra kerülnek" : tab === "gov" ? "Amit az elnök és a kormány szavazásra bocsát" : `Év ${2026 + weekNum()} · zárul ${fmtDt(vClose)}`;
    view.innerHTML = `${demoBanner}<div class="wrap page"><div><div class="hint" style="font-size:12px">${sub}</div><h1 style="font-size:30px">Szavazás</h1></div>
      <div class="seg">${[["votes", "☑ Szavazások"], ["gov", "▤ Kormány"], ["cit", "☷ Polgárok"]].map(([i, n]) => `<button class="${tab === i ? "on" : ""}" data-t="${i}">${n}</button>`).join("")}</div><div id="vb"></div></div>`;
    view.querySelectorAll("[data-t]").forEach((b) => (b.onclick = () => { tab = b.dataset.t; render(); }));
    const box = $("#vb");
    if (tab === "cit") return citizensView(u, box);
    if (tab === "gov") { box.innerHTML = `<div class="chips wrapc"><button class="tchip sel on all">Minden téma</button>${FORUM_TOPICS.map((t) => `<button class="tchip sel">${tIcon(t, 14)}${esc(t)}</button>`).join("")}</div><div class="card empty"><span class="bulb">💡</span><p class="hint">A kormány még nem tett javaslatot. <a href="#/politika?t=cand"><b>Politika fül →</b></a></p></div>`; return; }
    const allDone = ms.length > 0 && done() === ms.length;
    box.innerHTML = `${allDone ? `<div class="card donecard ${cls}"><b>🎉 Kész, mindent leadtál!</b><p class="hint">Az eredményt ${fmtDt(vClose)} után látod. Addig vitázz a fórumon.</p><a class="btn ${u.country}" href="#/forum">Irány a fórum</a></div>` : ""}<div class="prog"><i style="width:${(done() / Math.max(1, ms.length)) * 100}%"></i></div><p class="hint" style="font-size:13px"><b>${done()}/${ms.length}</b> szavazat leadva. A szavazat <b>végleges</b>, mindenkié egyformán számít. <a href="#/forum"><b>Vita a fórumon →</b></a></p>
      ${ms.length ? "" : '<div class="card">A katalógus még nem töltődött be.</div>'}
      ${ms.map((m) => {
        const voted = mine[m.id] !== undefined, base = seedVotes(m, u.country);
        if (voted) base[mine[m.id]] += 1;
        const tot = base.reduce((a, b) => a + b, 0), pick = voted ? mine[m.id] : sel[m.id];
        return `<div class="card measure mine ${cls}"><div class="mtop"><span class="badge2 ${voted ? "done" : ""}">${voted ? "✓ LEADVA" : "● NYITVA · ZÁRUL " + leftShort(vClose)}</span></div>
          <div class="mq2"><h2>${esc(m.topic)}: ${esc(m.q)}</h2><span class="mti">${tIcon(m.topic, 26)}</span></div>
          ${contextHtml(m)}
          <div class="choice">${m.options.map((o, oi) => {
            const p = Math.round((base[oi] / tot) * 100), key = m.id + oi;
            return `<div class="opt2 ${pick === oi ? "picked " + cls : ""}"><button data-m="${esc(m.id)}" data-o="${oi}" ${voted ? "disabled" : ""}>
              ${voted ? `<i class="fill" style="width:${p}%"></i><span class="pct">${p}%</span>` : ""}<i class="radio ${pick === oi ? "on" : ""}"></i><span class="otxt"><b>${esc(o.label)}</b><span>${esc(o.pro)}</span></span></button>
              <button class="techb" data-tech="${key}">${openTech.has(key) ? "✕ Elrejtés" : "⌕ Mi történik, ha ezt választjuk?"}</button>${openTech.has(key) ? techHtml(m, o) : ""}</div>`; }).join("")}</div>
          ${voted ? `<p class="hint">A szavazatod rögzítettük, nem módosítható.</p>${evidenceHtml(m)}` : `<p class="hint">Válassz egy opciót</p><button class="btn ${u.country} block" data-fin="${esc(m.id)}" ${sel[m.id] === undefined ? "disabled" : ""}>Szavazat véglegesítése</button>`}</div>`;
      }).join("")}`;
    box.querySelectorAll(".choice [data-m]").forEach((b) => (b.onclick = () => { sel[b.dataset.m] = +b.dataset.o; const y = scrollY; render(); scrollTo(0, y); }));
    box.querySelectorAll("[data-tech]").forEach((b) => (b.onclick = () => { const k = b.dataset.tech; openTech.has(k) ? openTech.delete(k) : openTech.add(k); const y = scrollY; render(); scrollTo(0, y); }));
    box.querySelectorAll("[data-fin]").forEach((b) => (b.onclick = () => {
      const m = ms.find((x) => x.id === b.dataset.fin), o = m.options[sel[m.id]];
      const s = sheet("Végleges szavazat", "Biztosan ezt választod?", `<p><b>${esc(o.label)}</b></p><p class="hint">A szavazat végleges, később nem módosíthatod.</p><button class="btn ${u.country} block" id="yes">Igen, véglegesítem</button><button class="btn ghost block" id="no" style="margin-top:8px">Mégsem</button>`);
      $("#no", s.el).onclick = s.close;
      $("#yes", s.el).onclick = async () => {
        if (BACKEND) { try { await rpc("cast_vote", { w: weekNum(), m: m.id, o: sel[m.id] }); } catch (err) { s.close(); toast(errMsg(err)); return; } }
        mine[m.id] = sel[m.id]; saveAccount(u); s.close(); const y = scrollY; render(); scrollTo(0, y); toast("Szavazat rögzítve");
      };
    }));
  };
  render();
}

/* eredmények: a legutóbb lezárt hét döntései és az utólagos értékelés (a saját ország döntése; COMPARE esetén mindkettő) */
function closedDecisionsHtml(u) {
  const ms = weekMeasures(weekNum() + 50); // demó: másik hét kérdései "lezártként"
  if (!ms.length) return "";
  const sides = COMPARE ? ["tisza", "fidesz"] : [u.country];
  return `<div class="card"><h3>Legutóbb lezárt döntések (demó)</h3><p class="hint" style="margin:4px 0 12px">A döntést hasonló, korábbi esetekkel vetjük össze, számokkal.</p>
    ${ms.map((m) => {
      const cnt = { jo: 0, vegyes: 0, rossz: 0 }; (m.evidence || []).forEach((e) => (cnt[e.verdict] = (cnt[e.verdict] || 0) + 1));
      return `<div class="closed"><div class="topic">${esc(m.topic)}</div><h4>${esc(m.q)}</h4>
        <div class="decs">${sides.map((s) => `<div class="dec ${SIDES[s].cls}"><b>${SIDES[s].tag}</b>${esc(m.options[winnerIdx(m, s)].label)}</div>`).join("")}</div>
        <p class="hint">Precedensek: <span class="vb ok">${cnt.jo} bevált</span> <span class="vb mid">${cnt.vegyes} vegyes</span> <span class="vb bad">${cnt.rossz} nem vált be</span></p>
        <details><summary>A részletes számok</summary>${evidenceHtml(m)}</details></div>`;
    }).join("")}</div>`;
}
