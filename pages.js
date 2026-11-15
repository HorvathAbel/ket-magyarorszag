/* Profil (menü), Hogyan játssz, Évről évre, Adatkezelés */
function profile() {
  const u = guard(); if (!u) return;
  const days = Math.max(1, Math.round((Date.now() - u.joined) / 864e5) + 1), n = Object.values(u.votes).reduce((a, w) => a + Object.keys(w).length, 0), side = SIDES[u.country];
  const tile = (id, ic, t, s) => `<button class="tile" data-p="${id}"><b>${ic} ${t}</b><span>${s}</span></button>`;
  view.innerHTML = `<div class="wrap page" style="max-width:640px"><div class="card profcard">${avatar(u.nick, 84)}<h1 style="font-size:26px;margin-top:10px">${esc(u.nick)} <button class="ic" data-p="edit" aria-label="Szerkesztés">✎</button></h1>
      <span class="pill ${side.cls}" style="margin-top:6px">${side.tag.replace("-Magyarország", "").toUpperCase()}-MAGYARORSZÁG</span><p class="hint" style="margin-top:8px">Játszik ${days} napja · ${n} leadott szavazat</p>${u.bio ? `<p style="margin-top:8px">${esc(u.bio)}</p>` : ""}</div>
    <div class="tiles">${tile("chats", "✉", "Csevegéseim", "privát és csoportok")}${tile("men", "@", "Említések", "válaszok és @")}${tile("edit", "✎", "Profil", "név és bemutatkozás")}${BACKEND ? tile("notif", "🔔", "Értesítések", u.notify ? "bekapcsolva" : "kikapcsolva") : ""}${tile("how", "▶", "Hogyan játssz", "egy perc alatt")}${tile("rules", "📄", "Szabályok", "és a moderáció")}${tile("fb", "💡", "Ötlet vagy hiba", "írj nekünk")}${u.admin ? tile("adm", "🛠", "Admin", "közlemények kiírása") : ""}</div>
    <p class="hint morelinks"><a href="#/evrol-evre">Évről évre</a> · <a href="#/modszertan">A számok</a> · <button class="lk" data-p="app">Telepítés</button> · <a href="#/adatkezeles">Adatkezelés</a></p>
    <div class="card"><h3>Letiltottak</h3><p class="hint">${(u.blocked || []).length ? (u.blocked || []).map((b) => `${esc(b)} <button class="lk" data-ub="${esc(b)}">Feloldás</button>`).join("<br>") : "Nem tiltottál le senkit."}</p></div>
    <button class="btn ghost block" id="out">Kilépés</button><button class="lk" id="del" style="color:#b42318;text-align:center">Fiók végleges törlése</button>
    <p class="hint" style="text-align:center;font-size:12px">A Két Magyarország játék. Nem képvisel valódi pártot, politikust vagy kampányt.</p></div>`;
  const go = { chats: "#/forum?tab=chat", men: "#/emlitesek", how: "#/hogyan-jatssz", year: "#/evrol-evre", num: "#/modszertan", rules: "#/szabalyok", fb: "#/visszajelzes", adm: "#/admin" };
  view.querySelectorAll("[data-p]").forEach((b) => (b.onclick = () => {
    const k = b.dataset.p; if (go[k]) return (location.hash = go[k]);
    if (k === "edit") {
      const s = sheet("Profil", "Felhasználónév, bemutatkozás", `<label class="fl" for="un">Felhasználónév</label><input id="un" class="inp" maxlength="20" value="${esc(u.nick)}"><label class="fl" for="bi">Bemutatkozás <span class="hint">(nem kötelező)</span></label><textarea id="bi" class="inp" rows="3" maxlength="140">${esc(u.bio || "")}</textarea><label class="fl">E-mail</label><input class="inp" value="${esc(u.email)}" disabled><div class="err" id="pe" role="alert"></div><button class="btn ${u.country} block" id="sv" style="margin-top:8px">Mentés</button>`);
      $("#sv", s.el).onclick = async () => {
        const nn = $("#un", s.el).value.trim(), bio = $("#bi", s.el).value.trim(); const err = nn.toLowerCase() === u.nick.toLowerCase() ? "" : nickErr(nn);
        if (err) return ($("#pe", s.el).textContent = err); if (/https?:|www\./i.test(bio)) return ($("#pe", s.el).textContent = "Link nem lehet a bemutatkozásban.");
        if (BACKEND) { try { await rpc("update_profile", { n: nn, b: bio }); } catch (e2) { return ($("#pe", s.el).textContent = errMsg(e2)); } }
        u.nick = nn; u.bio = bio; saveAccount(u); s.close(); profile(); toast("Profil mentve");
      };
    } else if (k === "notif") {
      const s = sheet("Értesítések", "E-mail az időpontokról", `<p class="hint">Levelet küldünk, ha hamarosan lezárul a jelöltállítás, megnyílt a döntő, a döntő zárása előtt (ha még nem szavaztál), és ha megvan az eredmény. Más levelet nem.</p><label class="check" style="margin-top:12px"><input type="checkbox" id="nf" ${u.notify ? "checked" : ""}><span>Kérek értesítő e-mailt (${esc(u.email)})</span></label><div class="err" id="pe" role="alert"></div><button class="btn ${u.country} block" id="sv" style="margin-top:8px">Mentés</button>`);
      $("#sv", s.el).onclick = async () => {
        const v = $("#nf", s.el).checked;
        try { await rpc("set_notify", { v }); } catch (e2) { return ($("#pe", s.el).textContent = errMsg(e2)); }
        u.notify = v; saveAccount(u); s.close(); profile(); toast(v ? "Értesítések bekapcsolva" : "Értesítések kikapcsolva");
      };
    } else if (k === "app") sheet("Telepítés", "Alkalmazás telepítése", `<p>Nyisd meg ezt az oldalt a telefonodon, és add hozzá a kezdőképernyőhöz: iPhone-on Megosztás → „Kezdőképernyőhöz”, Androidon a böngésző menüje → „Telepítés”. Ingyenes, nincs app store.</p>`);
  }));
  view.querySelectorAll("[data-ub]").forEach((b) => (b.onclick = () => { u.blocked = u.blocked.filter((x) => x !== b.dataset.ub); saveAccount(u); profile(); }));
  $("#out").onclick = async () => { if (BACKEND) await backendLogout(); store.del("km_session"); location.hash = "#/"; };
  $("#del").onclick = async () => {
    if (!confirm("Biztosan törlöd a fiókodat? Ez nem vonható vissza.")) return;
    if (BACKEND) { try { await rpc("delete_account"); } catch (e2) { return toast(errMsg(e2)); } await backendLogout(); }
    const a = accounts(); delete a[u.email]; store.set("km_accounts", a); store.del("km_session"); location.hash = "#/"; toast("Fiók törölve");
  };
}

function howToPlay() {
  const steps = [["Országot választasz, véglegesen.", "TISZA vagy FIDESZ. Nincs váltás, és nem lehet mindkettőben játszani."], ["Vitázz a saját oldaladdal.", "Minden országnak saját fóruma van, a másik ország semmit nem lát belőle. A Parlament közös, de ott naponta 3 felszólalás jár."], ["Válaszd meg a kormányt.", "Bárki indulhat elnöknek, alelnöknek vagy miniszternek, de csak egyben. Az elnök két fordulóban dől el: az 5 legtámogatottabb jut a titkos döntőbe. Az alelnök külön verseny, a legtámogatottabb nyer. Minden tárcát a legtámogatottabb jelölt kap."], ["Szavazz az intézkedésekről.", "Szerdánként 18:00 és 23:59 között. Egy opciót választasz és megerősíted. Egyszer szavazhatsz, nem módosíthatod. Minden szavazat egyformán számít, az elnöké is."], ["Nézd, mi történik.", "Egy valós hét egy év a játékban. A következmények valós adatokból és tanulmányokból jönnek. A válságok mindkét országra ugyanúgy hatnak."], ["Kövesd a videókat.", "A közösségi oldalakon elmondjuk, mit döntött az egyik és a másik ország, és hogy áll."]];
  const faq = [["Mikor szavazhatok?", "Minden szerda 18:00 és 23:59 között. Hetente 3 intézkedésről döntesz, minden 4. héten pedig a kormányról szavazunk."], ["Meddig tart egy kormány?", "Az elnököt, az alelnököt és a minisztereket egyaránt 4 játékévre (4 valós hétre) választjuk. Minden 4. héten új kormányt választunk, szerda este."], ["Hogyan választjuk az elnököt?", "A jelöltek támogatása nyitott: több jelöltet is támogathatsz. Az 5 legtámogatottabb jut a döntőbe, ami titkos szavazás, egy ember egy szavazat, a kormányválasztás szerdáján 18:00 és 23:59 között. A nyertes az elnök. Döntetlennél az nyer, aki előbb jelentkezett."], ["És az alelnököt?", "Külön verseny: alelnöknek indulsz, nem „második helyre”. A legtámogatottabb jelölt nyer. Elnöknek és alelnöknek egyszerre nem indulhatsz."], ["És a minisztereket?", "Minden jelölt egy tárcára indul. Minden tárcát a legtámogatottabb jelölt kapja."], ["Módosíthatom a jelöltségemet?", "Igen: Politika → Jelöltek, Szerkesztés. Módosíthatod a jelmondatodat, a témáidat és a javaslatodat."], ["Javasolhatok intézkedést, ha nem vagyok a kormányban?", "Igen: Szavazás → Polgárok. A legtámogatottabb ötletek hivatalos szavazásra kerülnek. Naponta egy ötletet küldhetsz be."], ["Látom, hogyan áll a másik ország?", "Az alkalmazásban nem. Csak a saját országodat látod, és egy eredményjelzőt arról, hányan játszanak mindkét oldalon. A másikról a videókban számolunk be."], ["Hogyan írok üzenetet valakinek?", "Fórum → Csevegések → Új. Bárkinek írhatsz az országodban, csoportot hozhatsz létre, vagy meghívó linkkel csatlakozhatsz."], ["Mik a „Technikai részletek”?", "Azoknak szólnak, akik többet akarnak tudni: mit változtat az opció, mennyivel, és honnan van a szám. A játékhoz nem kellenek."]];
  view.innerHTML = `<div class="wrap page" style="max-width:700px"><div><div class="eyebrow">Hogyan játssz</div><h1 style="font-size:32px">Hogyan játssz</h1><p class="lead" style="margin-top:8px">Két ország, a mai Magyarország mására. Az egyiket a Tisza-oldal vezeti, a másikat a Fidesz-oldal. Te döntöd el, melyik jut messzebb.</p></div>
    ${steps.map(([h, p], i) => `<div class="card"><div class="n">${i + 1}</div><h3>${h}</h3><p class="hint" style="margin-top:4px">${p}</p></div>`).join("")}
    <div class="faq"><h2 style="font-size:24px;margin:8px 0">Gyakori kérdések</h2>${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
    <a class="btn block" href="#/app">Kezdjük</a><p class="hint"><a href="#/modszertan">A számok működése</a> · <a href="#/szabalyok">Szabályok</a></p></div>`;
}

function yearByYear() {
  const u = guard(); if (!u) return;
  const done = weekMeasures(weekNum() + 50);
  if (BACKEND && window.__res === undefined) loadResults().then(() => yearByYear(), () => { window.__res = null; yearByYear(); });
  view.innerHTML = `${demoBanner}<div class="wrap page"><div><div class="eyebrow">Évről évre</div><h1 style="font-size:30px">Mit döntöttek?</h1><p class="hint">A saját országod döntései, évről évre. Az aktuális év még nyitva.</p></div>
    <div class="card"><div class="status"><i class="live"></i>${2026 + weekNum()} · NYITVA</div><p class="hint" style="margin-top:6px">${roundNow().open ? "Az idei szavazás zárul: " + fmtDt(new Date(roundNow().closes)) : "A következő szavazás: " + fmtDt(roundNextOpen())}. A döntések utána jelennek meg itt.</p></div>
    ${(() => { const h = (E(civ(), u.country).history || []).filter((x) => x.result); return h.length ? `<div class="card"><h3>Korábbi választások</h3>${h.map((x) => `<div class="mrow"><span>${x.id}. választás</span><span class="hint">elnök: ${x.result.president ? esc(x.result.president.nick) : "–"} · alelnök: ${x.result.vp ? esc(x.result.vp.nick) : "–"}</span></div>`).join("")}</div>` : ""; })()}
    ${closedDecisionsHtml(u).replace("Legutóbb lezárt döntések (demó)", "Korábbi év (demó)")}</div>`;
  void done;
}

function privacyPage() {
  view.innerHTML = `<div class="wrap page" style="max-width:700px"><div><div class="eyebrow">Adatkezelés</div><h1 style="font-size:32px">Az adataid</h1></div>
    <div class="card"><h3>Mit tárolunk?</h3><ul class="mv plain"><li>E-mail cím (a belépéshez), felhasználónév, megye (csak statisztikához), a választott ország.</li><li>Ha kéred az értesítéseket: ehhez az e-mail címedet használjuk, a levelekből és a profilodból bármikor leiratkozhatsz.</li><li>A szavazataid, jelöltséged, hozzászólásaid, csevegéseid. Ezeket csak a saját országod látja, a Parlament hozzászólásai kivétel.</li></ul></div>
    <div class="card"><h3>Politikai nézetre utaló adat</h3><p class="hint" style="margin-top:4px">A választott ország politikai szimpátiára utalhat, ezért ehhez kifejezett hozzájárulást kérünk a regisztrációkor. A hozzájárulást a fiók törlésével bármikor visszavonhatod.</p></div>
    <div class="card"><h3>Törlés</h3><p class="hint" style="margin-top:4px">A Profil oldalon a „Fiók végleges törlése” minden adatodat eltávolítja. Kérdés esetén írj nekünk a közösségi oldalunkon.</p></div>
    <p class="hint">Prototípus: az adatok jelenleg csak ebben a böngészőben tárolódnak. Éles működéshez adatkezelési tájékoztató és jogi átnézés kell.</p></div>`;
}

/* ---------- Leiratkozás a levélből (belépés nélkül) ---------- */
async function unsubPage() {
  const t = (location.hash.split("?")[1] || "").replace(/^t=/, "");
  view.innerHTML = `<div class="wrap page" style="max-width:520px"><div class="card"><h1 style="font-size:26px">Leiratkozás</h1><p class="hint" id="us" style="margin-top:8px">Egy pillanat…</p><a class="btn ghost block" href="#/" style="margin-top:12px">Vissza a kezdőlapra</a></div></div>`;
  let ok = false;
  if (BACKEND && /^[0-9a-f-]{36}$/i.test(t)) { try { ok = await rpc("unsubscribe", { tok: t }); } catch {} }
  $("#us").textContent = ok ? "Leiratkoztál, több értesítő levelet nem küldünk. Ha meggondolod magad, a Profil → Értesítések menüben újra bekapcsolhatod." : "Ez a leiratkozó link érvénytelen. A Profil → Értesítések menüben is kikapcsolhatod.";
}

/* ---------- Visszajelzés ---------- */
async function feedbackPage() {
  const u = guard(); if (!u) return;
  let kind = "idea", mine = BACKEND ? [] : store.get("km_fb_" + u.email, []);
  if (BACKEND) { try { mine = await rpc("my_feedback"); } catch {} }
  const KINDS = [["idea", "💡 Ötlet", "Mitől lenne jobb a játék?"], ["bug", "🐞 Hiba", "Mi nem működik? Mit csináltál előtte?"], ["other", "💬 Egyéb", "Írd le, ami eszedbe jutott."]];
  const when = (t) => new Date(t).toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
  const draw = () => {
    const k = KINDS.find((x) => x[0] === kind);
    view.innerHTML = `<div class="wrap page" style="max-width:640px"><a class="back" href="#/profil">‹ Vissza</a><div><div class="hint" style="font-size:12px">Mindent elolvasunk</div><h1 style="font-size:30px">Ötletek a játékhoz</h1></div>
      <div class="card"><div class="seg">${KINDS.map(([i, n]) => `<button class="${kind === i ? "on" : ""}" data-k="${i}">${n}</button>`).join("")}</div>
        <textarea id="fbt" class="inp" rows="5" maxlength="1000" placeholder="${k[2]}"></textarea><div class="err" id="fbe" role="alert"></div>
        <button class="btn ${u.country} block" id="fbs" style="margin-top:8px" disabled>Küldés</button></div>
      <p class="hint">Az országod törvényeire szánt ötleteket a Szavazás → Polgárok részben add le.</p>
      <h3>Amit eddig küldtél</h3>${mine.length ? mine.map((f) => `<div class="card"><span class="hint">${(KINDS.find((x) => x[0] === f.kind) || KINDS[2])[1]} · ${when(f.at)}</span><p style="margin-top:4px">${esc(f.body)}</p></div>`).join("") : '<p class="hint" style="text-align:center">Még nem küldtél semmit.</p>'}</div>`;
    view.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => { kind = b.dataset.k; const t = $("#fbt").value; draw(); $("#fbt").value = t; $("#fbs").disabled = t.trim().length < 5; }));
    const ta = $("#fbt"), sb = $("#fbs");
    ta.oninput = () => (sb.disabled = ta.value.trim().length < 5);
    sb.onclick = async () => {
      const txt = ta.value.trim(); sb.disabled = true;
      try {
        if (BACKEND) { await rpc("send_feedback", { k: kind, txt }); mine = await rpc("my_feedback"); }
        else { mine.unshift({ kind, body: txt, at: Date.now() }); store.set("km_fb_" + u.email, mine); }
      } catch (e) { sb.disabled = false; return ($("#fbe").textContent = errMsg(e)); }
      toast("Köszönjük, elküldtük!"); draw();
    };
  };
  draw();
}

/* ---------- Közösségi szabályok + nyilvános szankciónapló ---------- */
async function rulesPage() {
  const u = session(), side = u && u.country;
  const RULES = [["Érvelj, ne sértegess.", "Nincs sértés, gyűlöletbeszéd (származás, vallás, nem, irányultság) és fenyegetés."], ["Ne adj ki személyes adatot.", "Se a sajátodat, se másét: nincs valódi név, telefonszám, cím."], ["Nincsenek valódi politikusok és pártok.", "Ez játék: a vezetők azok, akiket itt megválasztotok."], ["Ne ássd alá a másik országot.", "Aki átjátszik a másik oldalra szabotálni, kitiltásra kerül."], ["Szankciók:", "figyelmeztetés, ideiglenes némítás, kitiltás. Mind látszik az alábbi naplóban."]];
  let log = [];
  if (BACKEND && side) { try { log = await rpc("get_sanctions"); } catch {} }
  const KN = { warning: "figyelmeztetés", silence: "némítva", ban: "kitiltva" };
  view.innerHTML = `<div class="wrap page" style="max-width:640px">${u ? '<a class="back" href="#/profil">‹ Vissza</a>' : ""}<h1 style="font-size:30px">Közösségi szabályok</h1>
    <div class="card rules">${RULES.map((r, i) => `<div class="rule"><i>${i + 1}</i><div><b>${r[0]}</b><br><span class="hint">${r[1]}</span></div></div>`).join("")}</div>
    <p class="hint">Valami szabálytalant látsz? Koppints az üzenetre, és válaszd a <b>Jelentés</b> lehetőséget. 3 jelentés után az üzenet elrejtődik, amíg a moderátor át nem nézi.</p>
    <p class="hint">A Parlamentben napi 3 felszólalás jár, link és csupa nagybetű nélkül. Legalább 16 évesnek kell lenned, és egy embernek egy fiókja lehet.</p>
    <h3>Moderátorok</h3><p class="hint"><b>Admin</b> · mindkét országban</p>
    ${side ? `<h3>Szankciónapló · ${SIDES[side].tag}</h3>${log.length ? log.map((s) => `<div class="card"><b>${esc(s.nick)}</b> · ${KN[s.kind] || s.kind}${s.until ? " " + new Date(s.until).toLocaleString("hu-HU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) + "-ig" : ""}<br><span class="hint">Ok: ${esc(s.reason)} · ${new Date(s.at).toLocaleDateString("hu-HU")}</span></div>`).join("") : '<p class="hint">Eddig nem volt szankció.</p>'}` : ""}
    <p class="hint" style="font-size:12px">A játék független, nem áll kapcsolatban egyetlen párttal vagy szervezettel sem.</p></div>`;
}

/* ---------- Admin: közlemények kiírása (az admin jogot a szerver adja az e-mail cím alapján) ---------- */
async function adminPage() {
  const u = guard(); if (!u) return;
  let list = [];
  try { list = await rpc("admin_announcements"); } catch { toast("Ehhez nincs jogosultságod."); return (location.hash = "#/profil"); }
  const TARGET = { all: "Mindkét ország", tisza: "Csak Tisza", fidesz: "Csak Fidesz" };
  view.innerHTML = `<div class="wrap page" style="max-width:640px"><a class="back" href="#/profil">‹ Vissza</a><div><div class="hint" style="font-size:12px">Csak adminoknak</div><h1 style="font-size:30px">Közlemény kiírása</h1></div>
    <div class="card"><label class="fl" for="at">Kinek?</label><select id="at" class="inp">${Object.entries(TARGET).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
      <label class="fl" for="ti">Cím</label><input id="ti" class="inp" maxlength="80" placeholder="Pl. Megnyílt az elnöki döntő">
      <label class="fl" for="bo">Szöveg</label><textarea id="bo" class="inp" rows="5" maxlength="1000" placeholder="Röviden, érthetően."></textarea>
      <div class="err" id="ae" role="alert"></div><button class="btn ${u.country} block" id="send" style="margin-top:8px">Kiírás</button></div>
    <h3>Eddigi közlemények</h3>${list.map((a) => `<div class="card"><b>${esc(a.title)}</b> <span class="chip">${TARGET[a.side]}</span><p class="hint" style="margin-top:4px">${esc(a.body).replace(/\n/g, "<br>")}</p><span class="hint" style="font-size:12px">${new Date(a.at).toLocaleString("hu-HU")}</span> <button class="lk" data-del="${a.id}" style="color:#b42318">Törlés</button></div>`).join("") || '<p class="hint">Még nincs közlemény.</p>'}</div>`;
  $("#send").onclick = async () => {
    const btn = $("#send"); btn.disabled = true;
    try { await rpc("admin_post_announcement", { s: $("#at").value, t: $("#ti").value, b: $("#bo").value }); toast("Közlemény kiírva"); adminPage(); }
    catch (e) { btn.disabled = false; $("#ae").textContent = /empty/.test(e.message) ? "Adj meg címet és szöveget." : errMsg(e); }
  };
  view.querySelectorAll("[data-del]").forEach((b) => (b.onclick = async () => {
    if (!confirm("Biztosan törlöd ezt a közleményt?")) return;
    try { await rpc("admin_delete_announcement", { aid: +b.dataset.del }); toast("Törölve"); adminPage(); } catch (e) { toast(errMsg(e)); }
  }));
}
