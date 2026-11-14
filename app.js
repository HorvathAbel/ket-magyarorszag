/* Két Magyarország – kattintható prototípus (demóadatokkal, localStorage-ben tárolva) */
const LAUNCH_AT = new Date("2026-11-21T20:00:00+01:00"); // PLACEHOLDER: nyitás időpontja
const T = { id: "tisza", name: "Tisza", cls: "t", tag: "Tisza-Magyarország" };
const F = { id: "fidesz", name: "Fidesz", cls: "f", tag: "Fidesz-Magyarország" };
const SIDES = { tisza: T, fidesz: F };
const COUNTIES = ["Budapest","Bács-Kiskun","Baranya","Békés","Borsod-Abaúj-Zemplén","Csongrád-Csanád","Fejér","Győr-Moson-Sopron","Hajdú-Bihar","Heves","Jász-Nagykun-Szolnok","Komárom-Esztergom","Nógrád","Pest","Somogy","Szabolcs-Szatmár-Bereg","Tolna","Vas","Veszprém","Zala","Külföld"];

/* ---------- tárolás ---------- */
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const accounts = () => store.get("km_accounts", {});
const saveAccount = (u) => { const a = accounts(); a[u.email] = u; store.set("km_accounts", a); };
const session = () => { const e = store.get("km_session", null); return e ? accounts()[e] || null : null; };
let pending = null; // {email, mode, data}

/* ---------- demóadatok ---------- */
const EVENT = { badge: "Válság · közös mindkét országra", title: "Energiaár-sokk érkezett",
  text: "Az áram és a gáz ára egy hét alatt (= egy év a játékban) 30%-ot ugrott. Mindkét országot egyszerre érinti, a különbséget a meghozott intézkedések adják." };
const FEED = [
  ["t", "A Tisza-ország elfogadta a bérlakásprogramot (54%)."],
  ["f", "A Fidesz-ország az egykulcsos adó megtartása mellett döntött (47%)."],
  ["n", "Energiaár-sokk: mindkét országban nő az infláció."],
  ["t", "Új rekord: 1 248 szavazat ebben a hétben a Tisza-országban."],
  ["f", "Új rekord: 1 311 szavazat ebben a hétben a Fidesz-országban."],
];
/* ---------- segédek ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const view = $("#view");
function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 2400); }
function nextClose() { const d = new Date(); d.setDate(d.getDate() + ((7 - d.getDay()) % 7)); d.setHours(20, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 7); return d; }
function dhms(ms) { ms = Math.max(0, ms); const s = Math.floor(ms / 1e3); return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 }; }
const pad = (n) => String(n).padStart(2, "0");
const lockSvg = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#101828" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

function hungaryMap() {
  const pts = [[16.11,46.87],[16.30,47.00],[16.45,47.40],[16.60,47.66],[16.85,47.70],[17.10,48.00],[17.50,47.87],[18.05,47.75],[18.55,47.77],[18.85,47.82],[19.05,48.07],[19.50,48.22],[19.90,48.15],[20.35,48.30],[20.85,48.55],[21.45,48.52],[21.75,48.35],[22.15,48.40],[22.55,48.10],[22.90,47.95],[22.50,47.80],[22.00,47.50],[21.75,47.00],[21.30,46.65],[21.05,46.25],[20.50,46.15],[20.25,46.10],[19.95,46.15],[19.50,46.20],[18.95,45.95],[18.40,45.97],[17.90,45.78],[17.45,45.78],[17.10,45.97],[16.60,46.45],[16.35,46.55]];
  const K = 120, c = Math.cos(47.1 * Math.PI / 180);
  const P = ([lo, la]) => [((lo - 15.9) * c * K + 8).toFixed(1), ((48.7 - la) * K + 8).toFixed(1)];
  const d = "M" + pts.map((p) => P(p).join(",")).join("L") + "Z";
  const cut = P([19.04, 47.5])[0];
  return `<svg viewBox="0 0 600 350" role="img" aria-label="Magyarország térképe, kettéosztva kék és narancs részre">
    <defs><clipPath id="cl"><path d="${d}"/></clipPath></defs>
    <g clip-path="url(#cl)">
      <rect x="0" y="0" width="${cut}" height="350" fill="#bcd0fa"/>
      <rect x="${cut}" y="0" width="${600 - cut}" height="350" fill="#ffd2a0"/>
    </g>
    <path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
    <line x1="${cut}" y1="0" x2="${cut}" y2="350" stroke="#fff" stroke-width="3" clip-path="url(#cl)"/>
  </svg>`;
}

/* ---------- nav ---------- */
const ICON = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  forum: '<path d="M4 5h16v11H9l-5 4z"/>',
  gov: '<path d="M3 10l9-6 9 6M5 10v8m4-8v8m6-8v8m4-8v8M3 20h18"/>',
  country: '<path d="M4 20V10m6 10V4m6 16v-8m4 8H2"/>',
  vote: '<path d="M5 12l4 4 10-10M4 20h16"/>',
};
function renderNav() {
  const u = session(), r = location.hash || "#/", app = !!(u && u.country);
  const link = (h, t, cls = "") => `<a href="${h}" class="${r.startsWith(h) && h !== "#/" ? "on" : ""} ${cls}">${t}</a>`;
  $("#nav").innerHTML = app
    ? link("#/modszertan", "Módszertan", "hide-m") + link("#/profil", "Profil")
    : link("#/modszertan", "Módszertan", "hide-m") + link("#/belepes", "Belépés") + `<a class="btn sm" href="#/regisztracio">Regisztráció</a>`;
  document.body.dataset.side = (u && u.country) || "";
  const tb = $("#tabbar");
  tb.hidden = !app || /^#\/($|regisztracio|belepes|kod|orszag$)/.test(r);
  document.body.classList.toggle("has-tabbar", !tb.hidden);
  tb.innerHTML = [["#/app", "home", "Kezdőlap"], ["#/forum", "forum", "Fórum"], ["#/politika", "gov", "Politika"], ["#/allapot", "country", "Ország"], ["#/szavazas", "vote", "Szavazás"]]
    .map(([h, i, n]) => `<a href="${h}" class="${r.startsWith(h) ? "on" : ""}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[i]}</svg><span>${n}</span></a>`).join("");
}

/* ---------- nézetek ---------- */
function landing() {
  view.innerHTML = `
  <div class="wrap">
    <section class="hero">
      <div class="eyebrow">Két Magyarország · A kísérlet</div>
      <h1>Két egyforma Magyarország.<br>Melyik jut messzebb?</h1>
      <p class="lead"><span class="tag t">A Tisza</span> vezeti az egyiket, <span class="tag f">a Fidesz</span> a másikat. Ugyanazok a számok, ugyanazok a válságok. <strong>Te döntesz.</strong></p>
      <div class="map-wrap">${hungaryMap()}<div class="lock" aria-hidden="true">${lockSvg}</div>
        <div class="map-labels"><span class="pill t">Tisza</span><span class="pill f">Fidesz</span></div></div>
      <div class="cta-row"><a class="btn" href="#/regisztracio">Foglald el a helyed</a><a class="btn ghost" href="#hogyan" data-scroll>Hogyan működik?</a></div>
    </section>

    <div class="count"><div class="eyebrow">Nyitás</div>
      <h2 style="margin-top:6px">${LAUNCH_AT.toLocaleDateString("hu-HU", { month: "long", day: "numeric", weekday: "long" })}, ${LAUNCH_AT.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}</h2>
      <p class="hint" style="margin-top:4px">Aznap választasz országot (végleg), és leadod az első szavazatod.</p>
      <div class="cells" id="cd"></div></div>

    <section class="s" id="hogyan">
      <div class="eyebrow">Hogyan működik</div><h2 style="margin-top:6px">Négy szabály</h2>
      <div class="steps">
        ${[["Egyszer választasz országot", "Nincs váltás, és nem lehet mindkettőben játszani."],
           ["Egy hét itt = egy év ott", "Mindkét ország saját intézkedéseiről vitázik és szavaz: adók, lakhatás, bérek, egészségügy."],
           ["Az eredményt adatok döntik el", "Nyilvános szabályok és források (KSH, Eurostat, MNB), mindkét országra ugyanazok. Nem vélemények."],
           ["Ugyanazok a válságok mindkettőre", "Recesszió, árvíz, szerencsés fordulat: egyszerre érkezik. A különbség az, ki dönt jobban."]]
          .map(([h, p], i) => `<div class="card"><div class="n">${i + 1}</div><h3>${h}</h3><p>${p}</p></div>`).join("")}
      </div>
    </section>

    <section class="s faq"><div class="eyebrow">Gyakori kérdések</div><h2 style="margin:6px 0 14px">Tudnivalók</h2>
      <details><summary>Ez egy párt hivatalos projektje?</summary><p>Nem. Független, társadalmi játék. A két oldal neve csak azért pártnév, mert a játék a két legnagyobb tábor összemérése. Egyik párttal sincs kapcsolatunk.</p></details>
      <details><summary>Miért csak egyszer választhatok országot?</summary><p>Hogy a döntésnek tétje legyen, és hogy ne lehessen mindkét oldalon „csalni”. A választás végleges.</p></details>
      <details><summary>Hogyan számolódik az eredmény?</summary><p>Egy átlátható modell számol a meghozott intézkedésekből, nyilvános adatforrások paramétereivel. Mindkét országra ugyanaz a szabály és ugyanaz a külső sokk. A modell szimuláció, nem előrejelzés.</p></details>
      <details><summary>Mi lesz az adataimmal?</summary><p>Csak e-mail címet és becenevet kérünk. A választott ország politikai szimpátiára utalhat, ezért kifejezett hozzájárulást kérünk, a profilod pedig bármikor végleg törölhető. A becenevedet más nem látja a valódi neveddel együtt.</p></details>
    </section>

    <section class="s"><div class="band"><div class="eyebrow" style="color:#fff;opacity:.85">Nyitás előtt</div><h2>Melyik országban élnél?</h2>
      <a class="btn" href="#/regisztracio">Regisztrálok</a></div></section>
  </div>`;
  const cd = $("#cd");
  const tick = () => { if (!cd.isConnected) return clearInterval(iv); const x = dhms(LAUNCH_AT - new Date());
    cd.innerHTML = [["nap", x.d], ["óra", x.h], ["perc", x.m], ["mp", x.s]].map(([l, v]) => `<div class="cell"><b>${pad(v)}</b><span>${l}</span></div>`).join(""); };
  tick(); const iv = setInterval(tick, 1000);
  $("[data-scroll]").onclick = (e) => { e.preventDefault(); $("#hogyan").scrollIntoView({ behavior: "smooth" }); };
}

function authShell(step, inner) {
  return `<div class="auth">${step ? `<div class="steps-bar">${[1, 2, 3].map((i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>` : ""}${inner}</div>`;
}
const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

const BLOCKED = ["tisza", "fidesz", "kdnp", "mihazank", "orban", "magyarpeter", "toroczkai", "gyurcsany", "hitler", "admin", "moderator", "kormany"];
function nickErr(n) {
  if (!/^[A-Za-z0-9_áéíóöőúüűÁÉÍÓÖŐÚÜŰ]{3,20}$/.test(n)) return "3–20 karakter: betű, szám vagy alsóvonás.";
  const k = n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  if (BLOCKED.some((b) => k.includes(b))) return "Valódi politikus vagy párt neve nem lehet felhasználónév.";
  if (!BACKEND && Object.values(accounts()).some((a) => a.nick.toLowerCase() === n.toLowerCase())) return "Ez a felhasználónév foglalt.";
  return "";
}
function register() {
  view.innerHTML = authShell(1, `
    <div><h1>Foglald el a helyed</h1><p class="lead" style="margin-top:8px">Jelszó nélkül: e-mailben kapsz egy belépőkódot.</p></div>
    <form id="f" class="auth" style="margin:0;width:auto" novalidate>
      <div class="field"><label for="e">E-mail</label><input id="e" type="email" autocomplete="email" placeholder="te@pelda.hu"><div class="err" id="ee"></div></div>
      <div class="field"><label for="n">Felhasználónév</label><input id="n" maxlength="20" autocomplete="nickname" placeholder="pl. dunai_kata"><small>Ezt látják mások. Betű, szám, alsóvonás. Nem lehet a valódi neved, valódi politikus vagy párt neve.</small><div class="err" id="ne"></div></div>
      <div class="field"><label for="c">Hol élsz?</label><select id="c">${COUNTIES.map((c) => `<option>${c}</option>`).join("")}</select><small>Csak statisztikához, megyei bontásban.</small></div>
      <label class="check"><input type="checkbox" id="age"> Elmúltam 16 éves.</label>
      <label class="check"><input type="checkbox" id="priv"> Elfogadom a <a href=\"#/szabalyok\" target=\"_blank\">szabályokat</a> és az adatkezelési tájékoztatót. Tudomásul veszem, hogy a választott ország politikai szimpátiára utalhat, és ehhez kifejezetten hozzájárulok.</label>
      <label class="check"><input type="checkbox" id="nt"> Kérek e-mailt, ha hamarosan lezárul a jelöltállítás vagy a szavazás, és ha megvan az eredmény. <span class="hint">(Nem kötelező, a levélben és a profilban bármikor leiratkozhatsz.)</span></label>
      <div class="err" id="ce"></div>
      <button class="btn block" type="submit">Kód kérése</button>
      <p class="hint" style="text-align:center">Van már fiókod? <a href="#/belepes"><strong>Belépés</strong></a></p>
    </form>`);
  $("#f").onsubmit = async (ev) => {
    ev.preventDefault();
    const e = $("#e").value.trim().toLowerCase(), n = $("#n").value.trim();
    $("#ee").textContent = emailOk(e) ? (!BACKEND && accounts()[e] ? "Ezzel az e-mail címmel már van fiók. Lépj be." : "") : "Adj meg érvényes e-mail címet.";
    $("#ne").textContent = nickErr(n);
    $("#ce").textContent = $("#age").checked && $("#priv").checked ? "" : "Mindkét jelölőnégyzet kötelező.";
    if ($("#ee").textContent || $("#ne").textContent || $("#ce").textContent) return;
    pending = { email: e, mode: "reg", data: { email: e, nick: n, county: $("#c").value, notify: $("#nt").checked, country: null, votes: {}, joined: Date.now() } };
    if (BACKEND) {
      const btn = $("#f button[type=submit]"); btn.disabled = true;
      try {
        const ne = await rpc("nick_err", { n });
        if (ne) { $("#ne").textContent = ERRS["nick:" + ne]; return; }
        await sendCode(pending);
      } catch (err) { $("#ce").textContent = errMsg(err); return; } finally { btn.disabled = false; }
    }
    location.hash = "#/kod";
  };
}

function login() {
  view.innerHTML = authShell(0, `
    <div><h1>Belépés</h1><p class="lead" style="margin-top:8px">Add meg az e-mail címed, és küldünk egy belépőkódot.</p></div>
    <form id="f" class="auth" style="margin:0;width:auto" novalidate>
      <div class="field"><label for="e">E-mail</label><input id="e" type="email" autocomplete="email" placeholder="te@pelda.hu"><div class="err" id="ee"></div></div>
      <button class="btn block" type="submit">Kód kérése</button>
      <p class="hint" style="text-align:center">Még nincs fiókod? <a href="#/regisztracio"><strong>Regisztráció</strong></a></p>
    </form>`);
  $("#f").onsubmit = async (ev) => {
    ev.preventDefault();
    const e = $("#e").value.trim().toLowerCase();
    if (!emailOk(e)) return ($("#ee").textContent = "Adj meg érvényes e-mail címet.");
    if (!BACKEND && !accounts()[e]) return ($("#ee").innerHTML = 'Ehhez az e-mailhez nincs fiók. <a href="#/regisztracio">Regisztrálj</a>.');
    pending = { email: e, mode: "login" };
    if (BACKEND) {
      const btn = $("#f button[type=submit]"); btn.disabled = true;
      try { await sendCode(pending); }
      catch (err) { const m = errMsg(err); return ($("#ee").innerHTML = m.includes("nincs fiók") ? 'Ehhez az e-mailhez nincs fiók. <a href="#/regisztracio">Regisztrálj</a>.' : esc(m)); }
      finally { btn.disabled = false; }
    }
    location.hash = "#/kod";
  };
}

function code() {
  if (!pending) return (location.hash = "#/belepes");
  if (LINK_MODE) {
    view.innerHTML = authShell(pending.mode === "reg" ? 2 : 0, `
      <div><h1>Nézd meg a leveled</h1><p class="lead" style="margin-top:8px">Küldtünk egy belépő linket ide: <strong>${esc(pending.email)}</strong>. Kattints rá, és belépsz.</p></div>
      <div class="auth" style="margin:0;width:auto;display:grid;gap:10px">
        <p class="hint">A link néhány percig érvényes. Nem jött meg? Nézd meg a spam mappát is. Ezt a lapot nyitva hagyhatod, a link megnyitása után magától továbblép.</p>
        <button class="btn ghost block" id="rs">Új link kérése</button><div class="err" id="ce" role="alert"></div>
        <p class="hint" style="text-align:center"><a href="#/belepes">Másik e-mail címmel</a></p></div>`);
    $("#rs").onclick = async () => { $("#rs").disabled = true; try { await sendCode(pending); toast("Új linket küldtünk"); } catch (err) { $("#ce").textContent = errMsg(err); } setTimeout(() => ($("#rs") && ($("#rs").disabled = false)), 30000); };
    return;
  }
  view.innerHTML = authShell(pending.mode === "reg" ? 2 : 0, `
    <div><h1>Írd be a kódot</h1><p class="lead" style="margin-top:8px">Elküldtük a 6 számjegyű kódot ide: <strong>${esc(pending.email)}</strong></p></div>
    <form id="f" class="auth" style="margin:0;width:auto">
      <div class="codes" id="cs">${[0, 1, 2, 3, 4, 5].map((i) => `<input inputmode="numeric" maxlength="1" aria-label="${i + 1}. számjegy">`).join("")}</div>
      <div class="err" id="ce"></div>
      <button class="btn block" type="submit">Megerősítés</button>
      ${BACKEND ? '<p class="hint" style="text-align:center">A kód néhány percig érvényes. Nem jött meg? Nézd meg a spam mappát is.</p>' : '<div class="demo">Demó: a kód mindig <strong>123456</strong>. Élesben e-mailben érkezik.</div>'}
    </form>`);
  const ins = [...view.querySelectorAll("#cs input")];
  ins[0].focus();
  ins.forEach((el, i) => {
    el.oninput = () => { el.value = el.value.replace(/\D/g, ""); if (el.value && ins[i + 1]) ins[i + 1].focus(); };
    el.onkeydown = (e) => { if (e.key === "Backspace" && !el.value && ins[i - 1]) ins[i - 1].focus(); };
    el.onpaste = (e) => { const t = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6); if (!t) return; e.preventDefault(); [...t].forEach((ch, j) => (ins[j].value = ch)); ins[Math.min(t.length, 5)].focus(); };
  });
  $("#f").onsubmit = async (ev) => {
    ev.preventDefault();
    const tok = ins.map((i) => i.value).join("");
    if (BACKEND) {
      if (tok.length < 6) return ($("#ce").textContent = "Írd be mind a 6 számjegyet.");
      const btn = $("#f button[type=submit]"); btn.disabled = true;
      try { const u = await verifyCode(pending.email, tok); pending = null; location.hash = u.country ? "#/app" : "#/orszag"; }
      catch (err) { $("#ce").textContent = errMsg(err); ins.forEach((i) => (i.value = "")); ins[0].focus(); }
      finally { btn.disabled = false; }
      return;
    }
    if (tok !== "123456") return ($("#ce").textContent = "Hibás kód. Próbáld újra.");
    if (pending.mode === "reg") saveAccount(pending.data);
    store.set("km_session", pending.email);
    const u = session(); pending = null;
    location.hash = u.country ? "#/app" : "#/orszag";
  };
}

function pickCountry() {
  const u = session(); if (!u) return (location.hash = "#/belepes");
  if (u.country) return (location.hash = "#/app");
  let sel = null;
  view.innerHTML = `<div class="wrap" style="padding:36px 0 60px">${authShell(3, "").replace('class="auth"', 'class="auth" style="margin:0 0 24px"')}
    <div style="text-align:center"><h1>Válassz országot</h1><p class="lead" style="margin:10px auto 0">Egyszer választhatsz, és nem lehet visszavonni. Melyik országban élnél?</p></div>
    <div class="pick">
      ${[T, F].map((s) => `<button class="opt ${s.cls}" data-s="${s.id}"><span class="dot">✓</span>
        <div class="eyebrow">Az ország neve</div><h2>${s.tag}</h2>
        <p>${s.id === "tisza" ? "A Tisza oldal vezeti. Ti döntötök az intézkedésekről." : "A Fidesz oldal vezeti. Ti döntötök az intézkedésekről."}</p></button>`).join("")}
    </div>
    <div style="display:flex;justify-content:center;margin-top:22px"><button class="btn" id="go" disabled>Tovább</button></div></div>`;
  view.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
    sel = b.dataset.s; view.querySelectorAll(".opt").forEach((x) => x.classList.toggle("sel", x === b));
    const go = $("#go"); go.disabled = false; go.className = "btn " + sel;
  }));
  $("#go").onclick = () => {
    const m = document.createElement("div"); m.className = "modal";
    m.innerHTML = `<div class="box" role="dialog" aria-modal="true"><h2 style="font-size:26px">${SIDES[sel].tag}?</h2>
      <p class="lead" style="font-size:16px">Ez végleges. Nem válthatsz országot, és másik fiókot sem nyithatsz.</p>
      <label class="check"><input type="checkbox" id="ok"> Értem, a választásom végleges.</label>
      <div style="display:grid;gap:8px"><button class="btn ${sel === "tisza" ? "tisza" : "fidesz"} block" id="yes" disabled>Végleg ezt választom</button><button class="btn ghost block" id="no">Mégsem</button></div></div>`;
    document.body.append(m);
    $("#ok", m).onchange = (e) => ($("#yes", m).disabled = !e.target.checked);
    $("#no", m).onclick = () => m.remove();
    $("#yes", m).onclick = async () => {
      if (BACKEND) { try { await rpc("choose_country", { s: sel }); } catch (err) { toast(errMsg(err)); return; } }
      u.country = sel; saveAccount(u); m.remove(); toast("Üdv " + SIDES[sel].tag + "ban, " + u.nick + "!"); location.hash = "#/app";
    };
  };
}

function guard() { const u = session(); if (!u) { location.hash = "#/belepes"; return null; } if (!u.country) { location.hash = "#/orszag"; return null; } return u; }
const meChip = (u) => `<span class="me ${SIDES[u.country].cls}"><b></b>${SIDES[u.country].tag}</span>`;
const demoBanner = '<div class="banner">Prototípus · minden szám demóadat</div>';

/* ---------- router ---------- */
const routes = { "": landing, "regisztracio": register, "belepes": login, "kod": code, "orszag": pickCountry, "app": home, "szavazas": vote, "forum": forumPage, "vita": forumPage, "politika": politics, "allapot": countryPage, "eredmenyek": countryPage, "modszertan": methodology, "szabalyok": rulesPage, "profil": profile, "emlitesek": mentionsPage, "hogyan-jatssz": howToPlay, "evrol-evre": yearByYear, "adatkezeles": privacyPage, "visszajelzes": feedbackPage, "admin": adminPage, "leiratkozas": unsubPage };
async function route() {
  const r = (location.hash.replace(/^#\/?/, "") || "").split("?")[0];
  if (r === "hogyan") return;
  if (BACKEND && ["app", "politika", "forum", "vita", "allapot", "eredmenyek", "evrol-evre", "szavazas"].includes(r) && (session() || {}).country) { try { await loadElection(); } catch {} }
  window.scrollTo(0, 0); (routes[r] || landing)(); renderNav();
}
addEventListener("hashchange", route);
(BACKEND ? bootBackend() : Promise.resolve()).then(route);
