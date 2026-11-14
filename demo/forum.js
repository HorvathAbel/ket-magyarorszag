/* Fórum: témacsatornák a saját országnak + közös Parlament (szigorúan limitált) + csevegések + említések */
const PARL = { max: 280, perDay: 3, gap: 60 };
const OWN = { max: 500, gap: 4 };
const STANCES = { pro: "Mellette", con: "Ellene", q: "Kérdés" };
const ANNOUNCEMENTS = [
  ["Üdv a játékban!", "Egy hét itt egy év a játékban. Minden ország ugyanazokat a kérdéseket kapja, a döntést a saját polgárai hozzák."],
  ["Hogyan szólj hozzá?", "A saját fórumodat csak az országod látja. A Parlament közös, de ott naponta 3 felszólalás jár, hogy minden mondatnak súlya legyen."],
  ["Jelentés és moderáció", "Ha egy üzenetet 3 játékos jelent, azonnal elrejtjük, amíg a moderátor átnézi."],
];
const PUB_GROUPS = [["Adók és gazdaság", "Adó, költségvetés, vállalkozások."], ["Lakhatás és család", "Otthon, lakbér, családtámogatás."], ["Egészségügy és oktatás", "Várólisták, iskolák, bérek."]];

function seedForum() {
  const n = Date.now(), m = (min) => n - min * 60000;
  const M = (nick, side, room, ch, text, min, stance, likes = 0, reports = 0, replyTo = null) => ({ id: "s" + hash(nick + text), nick, side, room, ch, text, ts: m(min), stance: stance || null, likes: Array.from({ length: likes }, (_, i) => "seed" + i), reports: Array.from({ length: reports }, (_, i) => "rep" + i), replyTo });
  return {
    msgs: [
      M("KatiBudapest", "tisza", "parl", "Lakhatás", "A lakáshitel-támogatás gyors, de ha nem nő a kínálat, csak az árakat hajtja fel. Szerintem a bérlakás-építés a tartósabb megoldás.", 190, "pro", 6),
      M("PestiGabor", "fidesz", "parl", "Lakhatás", "A bérlakás-program évekig tart. Aki ma venne lakást, annak a hitel segít most. Kell a kettő együtt.", 175, "con", 4),
      M("SzegediBori", "tisza", "parl", "Lakhatás", "Kérdés: van olyan ország, ahol a hitelprogram és a bérlakás együtt működött, és mérték is?", 120, "q", 3),
      M("DebreciLaci", "fidesz", "parl", "Lakhatás", "Ausztria bécsi önkormányzati lakásmodellje a példa, de ott 100 éves a rendszer. Nálunk nincs ekkora lakásállomány.", 95, "pro", 7),
      M("BudaiMarci", "tisza", "own", "Általános", "Szerintem a heti szavazásnál az energiaár-sokk miatt a hiánycél lesz a kulcs. Mit gondoltok?", 70),
      M("KatiBudapest", "tisza", "own", "Általános", "Szerintem a kiszámíthatóság fontosabb nekem, mint a kulcsok pontos értéke.", 60, null, 0, 0, { nick: "BudaiMarci", text: "Szerintem a heti szavazásnál az energiaár-sokk…" }),
      M("KatiBudapest", "tisza", "own", "Adók", "Az szja-szerkezetnél a kiszámíthatóság a fontos. @PecsiDani, te mit gondolsz?", 55),
      M("PecsiDani", "tisza", "own", "Kampány", "Pénzügyi tárcára indulok. Ha érdekel a 3% alatti hiány, nézd meg a jelmondatomat.", 40),
      M("PestiGabor", "fidesz", "own", "Általános", "Az adószerkezetnél én a stabilitásra szavaznék, nem akarok túl sok változást egyszerre.", 80),
      M("DebreciLaci", "fidesz", "own", "Gazdaság", "Szerintem a kisvállalkozások adóterhe fontosabb, mint amennyit most beszélünk róla.", 41),
      M("NyiregyhaziAnna", "fidesz", "own", "Oktatás", "Tanárbér: nem csak a béremelés számít, hanem az is, hogy mennyi a tanárok adminisztrációja.", 33),
      M("SpamGuy99", "fidesz", "own", "Általános", "Vedd meg most, nagyon olcsó!!! szavazz rám", 20, null, 0, 3),
    ],
    chats: { tisza: PUB_GROUPS.map(([n, d], i) => ({ id: "pt" + i, type: "group", pub: true, name: n, about: d, members: ["BudaiMarci"], msgs: [] })), fidesz: PUB_GROUPS.map(([n, d], i) => ({ id: "pf" + i, type: "group", pub: true, name: n, about: d, members: ["PestiGabor"], msgs: [] })) },
  };
}
const forumState = () => { let f = store.get("km_forum3", null); if (!f) { f = seedForum(); store.set("km_forum3", f); } return f; };
const saveForum = (f) => store.set("km_forum3", f);
const didPostToday = (u) => (BACKEND ? !!window.__postedToday : forumState().msgs.some((x) => x.nick === u.nick && x.side === u.country && Date.now() - x.ts < 864e5));
/* szerveres üzenet -> a felület által használt üzenetalak */
const toMsg = (r, u) => ({ id: String(r.id), nick: r.nick, side: r.side, room: r.room, ch: r.room === "parl" ? r.topic || "Általános" : r.channel, text: r.body, ts: r.at, stance: r.stance,
  likes: Array.from({ length: r.likes }, (_, i) => (r.liked && i === 0 ? u.email : "x" + i)), reports: [], replyTo: r.reply ? { id: r.reply.id, nick: r.reply.nick, text: r.reply.body } : null, office: r.office || "" });
const ago = (ts) => { const s = Math.max(1, Math.round((Date.now() - ts) / 1000)); if (s < 90) return "most"; if (s < 3600) return Math.round(s / 60) + " perce"; if (s < 86400) return Math.round(s / 3600) + " órája"; return Math.round(s / 86400) + " napja"; };
const mention = (t) => esc(t).replace(/@([A-Za-z0-9_áéíóöőúüűÁÉÍÓÖŐÚÜŰ]{3,20})/g, '<span class="at">@$1</span>');

/* spamvédelem: kliensoldali demó, élesben szerveren is érvényesíteni kell */
function checkMsg(parl, u, text, mine) {
  const R = parl ? PARL : OWN, now = Date.now();
  if (!text.trim()) return "Írj be valamit.";
  if (text.length > R.max) return `Legfeljebb ${R.max} karakter lehet.`;
  if (/https?:|www\.|\.(hu|com|net|org)\b/i.test(text)) return "Link nem küldhető. Csoportba hívni a Csevegések fülön lehet.";
  const letters = text.replace(/[^A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]/g, "");
  if (letters.length > 14 && letters.replace(/[^A-ZÁÉÍÓÖŐÚÜŰ]/g, "").length / letters.length > 0.7) return "Ne csupa nagybetűvel írj.";
  if (/(.)\1{6,}/.test(text)) return "Túl sok ismétlődő karakter.";
  if (mine.slice(-5).some((x) => x.text.trim().toLowerCase() === text.trim().toLowerCase())) return "Ezt már elküldted.";
  const last = mine[mine.length - 1];
  if (last && now - last.ts < R.gap * 1000) return `Várj még ${Math.ceil((R.gap * 1000 - (now - last.ts)) / 1000)} másodpercet.`;
  if (parl && mine.filter((x) => now - x.ts < 864e5).length >= PARL.perDay) return `Mára elfogytak a felszólalásaid (${PARL.perDay}/${PARL.perDay}). Reagálhatsz „Meggyőző”-vel.`;
  return null;
}

function forumPage() {
  const u = guard(); if (!u) return;
  const param = new URLSearchParams(location.hash.split("?")[1] || "");
  let tab = param.get("chat") || param.get("tab") === "chat" ? "chat" : "forum", ch = FORUM_TOPICS.includes(param.get("ch")) ? param.get("ch") : "Általános", stance = "pro", openChat = param.get("chat"), replyTo = null;
  const draw = async () => {
    let st = forumState();
    if (BACKEND) {
      st = { msgs: [], chats: st.chats };
      try { st.ann = await rpc("get_announcements"); } catch { st.ann = []; }
      if (tab === "forum" && ch !== "Közlemények") {
        try {
          const parl = ch === "Parlament", rows = await rpc("get_messages", { s: parl ? "all" : u.country, ch: parl ? "parlament" : ch, lim: 60 });
          st.msgs = rows.reverse().map((r) => toMsg(r, u)); u.__used = parl ? await rpc("parl_used") : 0;
          u.blocked = await rpc("my_blocks");
        } catch (e) { toast(errMsg(e)); }
      }
    }
    view.innerHTML = `${demoBanner}<div class="wrap page"><div class="seg"><button class="${tab === "forum" ? "on" : ""}" data-t="forum">📣 Fórumok</button><button class="${tab === "chat" ? "on" : ""}" data-t="chat">✉ Csevegések</button></div><div id="body"></div></div>`;
    view.querySelectorAll("[data-t]").forEach((b) => (b.onclick = () => { tab = b.dataset.t; openChat = null; draw(); }));
    const c = { ch, stance, replyTo, setCh: (x) => { ch = x; replyTo = null; draw(); }, setStance: (s) => (stance = s), setReply: (r) => { replyTo = r; draw(); }, draw, openChat, setOpen: (i) => { openChat = i; draw(); } };
    if (tab === "forum") forumTab(u, st, $("#body"), c); else chatTab(u, st, $("#body"), c);
  };
  draw();
  if (BACKEND) {
    clearInterval(window.__fp);
    window.__fp = setInterval(() => {
      const ta = $("#ctext"), ms = $("#msgs");
      if (!location.hash.startsWith("#/forum")) return clearInterval(window.__fp);
      if ((tab === "forum" ? ms : tab === "chat" && openChat) && ta && !ta.value && !document.querySelector(".sheetwrap")) draw();
      else if (tab === "chat" && !openChat && !document.querySelector(".sheetwrap") && !$("#cs")?.value) draw();
    }, 8000);
  }
}

function msgHtml(x, u, withLike) {
  const mine = x.nick === u.nick && x.side === u.country, liked = x.likes.includes(u.email), hidden = x.reports.length >= 3;
  if ((u.blocked || []).includes(x.nick) && !mine) return "";
  if (hidden) return `<div class="msg hid"><p class="hint">Ezt az üzenetet 3 játékos jelentette, ezért elrejtettük. A moderátor átnézi.</p></div>`;
  return `<div class="msg ${SIDES[x.side].cls} ${mine ? "own" : ""}" id="${esc(x.id)}"><div class="mh">${avatar(x.nick, 24)}<b>${esc(x.nick)}</b>${(x.office !== undefined ? x.office : officeOf(x.nick, x.side)) ? `<span class="chip office">${x.office !== undefined ? x.office : officeOf(x.nick, x.side)}</span>` : ""}${isCand(x.nick, x.side) ? `<a class="chip cand-b" href="#/politika?q=${encodeURIComponent(x.nick)}">Jelölt ›</a>` : ""}
    ${x.room === "parl" ? `<span class="chip">${esc(x.ch)}</span>` : ""}${x.stance ? `<span class="chip s-${x.stance}">${STANCES[x.stance]}</span>` : ""}<span class="hint">${ago(x.ts)}</span>
    <span class="mact"><button class="ic" data-reply="${esc(x.id)}" aria-label="Válasz">↩</button><button class="ic" data-menu="${esc(x.id)}" aria-label="Továbbiak">⋯</button></span></div>
    ${x.replyTo ? `<div class="quote"><b>${esc(x.replyTo.nick)}</b>: ${esc(x.replyTo.text)}</div>` : ""}
    <p>${mention(x.text)}</p>${withLike ? `<div class="ma">${mine ? `<span class="hint">👍 ${x.likes.length}</span>` : `<button class="lk ${liked ? "on" : ""}" data-like="${esc(x.id)}">👍 Meggyőző · ${x.likes.length}</button>`}</div>` : ""}</div>`;
}

function forumTab(u, st, box, c) {
  const ann = c.ch === "Közlemények", parl = c.ch === "Parlament", now = Date.now();
  const msgs = st.msgs.filter((x) => (parl ? x.room === "parl" : x.room === "own" && x.side === u.country && x.ch === c.ch));
  const mineP = st.msgs.filter((x) => x.room === "parl" && x.nick === u.nick && x.side === u.country), mineO = st.msgs.filter((x) => x.room === "own" && x.nick === u.nick && x.side === u.country);
  const usedToday = BACKEND ? u.__used || 0 : mineP.filter((x) => now - x.ts < 864e5).length, wkTopics = weekMeasures().map((m) => m.topic);
  const latest = BACKEND ? ((st.ann || [])[0] || {}).id || 0 : 0;
  const unread = BACKEND ? latest > ((u.seen || {}).annId || 0) : !(u.seen || {}).annForum;
  if (ann && unread) { u.seen = { ...(u.seen || {}), annForum: 1, annId: latest }; saveAccount(u); }
  const chip = (n, label) => `<button class="chipb ${c.ch === n ? "on" : ""} ${n === "Parlament" ? "parl" : ""}" data-ch="${esc(n)}">${label}</button>`;
  box.innerHTML = `<div class="chips">${chip("Közlemények", `📣 Közlemények${unread ? ' <i class="dot"></i>' : ""}`)}${chip("Parlament", "🏛 Parlament")}${FORUM_TOPICS.map((n) => chip(n, `${tIcon(n, 14)} ${esc(n)}`)).join("")}</div>
    ${ann ? [...(BACKEND ? (st.ann || []).map((a) => [esc(a.title), esc(a.body).replace(/\n/g, "<br>") + `<br><span class="hint" style="font-size:12px">${ago(a.at)}${a.side === "all" ? "" : " · csak " + SIDES[a.side].name}</span>`]) : []), ...ANNOUNCEMENTS].map(([t, x]) => `<div class="card ann"><h3>${t}</h3><p class="hint" style="font-size:14px;margin-top:4px">${x}</p></div>`).join("") : `<div class="card chat">
      <div class="rules">${parl ? `<b>Parlament · közös, mindkét oldal látja.</b> Naponta ${PARL.perDay} felszólalás, legfeljebb ${PARL.max} karakter, ${PARL.gap} mp szünet, téma és álláspont kötelező. Link és csupa nagybetű tilos. Reagálni korlátlanul lehet.` : `<b>${esc(c.ch)} · csak ${SIDES[u.country].name}-polgárok látják.</b> Legfeljebb ${OWN.max} karakter, ${OWN.gap} mp szünet. Ötletek igen, sértések nem. Saját szavaiddal írj.`}</div>
      <div class="msgs" id="msgs">${msgs.length ? msgs.map((x) => msgHtml(x, u, parl)).join("") : '<p class="hint" style="padding:24px;text-align:center">Még nincs üzenet. Légy te az első.</p>'}</div>
      <form id="cf" class="compose">
        ${c.replyTo ? `<div class="quote rq"><span>Válasz <b>${esc(c.replyTo.nick)}</b> üzenetére: ${esc(c.replyTo.text)}</span><button type="button" class="ic" id="rx" aria-label="Mégsem">✕</button></div>` : ""}
        ${parl ? `<div class="crow"><select id="ctopic" aria-label="Téma">${[...new Set([...wkTopics, ...FORUM_TOPICS])].map((t) => `<option>${esc(t)}</option>`).join("")}</select>
          <div class="stance">${Object.entries(STANCES).map(([k, v]) => `<button type="button" class="st ${c.stance === k ? "on" : ""}" data-s="${k}">${v}</button>`).join("")}</div></div>` : ""}
        <textarea id="ctext" rows="2" maxlength="${parl ? PARL.max : OWN.max}" placeholder="${parl ? "Egy gondolat, egy érv. Röviden." : "Írj ide: " + esc(c.ch) + "…"}" aria-label="Üzenet"></textarea>
        <div class="crow"><span class="hint" id="cc">0/${parl ? PARL.max + " · ma " + usedToday + "/" + PARL.perDay + " felszólalás" : OWN.max}</span><div class="err" id="cerr" role="alert"></div>
          <button class="btn ${u.country} sm" type="submit">Küldés</button></div></form></div>`}`;
  const ms = $("#msgs", box); if (ms) ms.scrollTop = 1e6;
  box.querySelectorAll("[data-ch]").forEach((b) => (b.onclick = () => c.setCh(b.dataset.ch)));
  if (ann) return;
  box.querySelectorAll(".st[data-s]").forEach((b) => (b.onclick = () => { c.setStance(b.dataset.s); c.stance = b.dataset.s; box.querySelectorAll(".st[data-s]").forEach((x) => x.classList.toggle("on", x === b)); }));
  const ta = $("#ctext", box); ta.oninput = () => ($("#cc", box).textContent = `${ta.value.length}/${parl ? PARL.max : OWN.max}` + (parl ? ` · ma ${usedToday}/${PARL.perDay} felszólalás` : ""));
  const rx = $("#rx", box); if (rx) rx.onclick = () => c.setReply(null);
  $("#cf", box).onsubmit = async (e) => {
    e.preventDefault(); const text = ta.value.trim();
    if (BACKEND) {
      const btn = $("#cf button[type=submit]", box); btn.disabled = true;
      try { await rpc("post_message", { s: parl ? "all" : u.country, ch: parl ? "parlament" : c.ch, txt: text, reply: c.replyTo ? +c.replyTo.id : null, tp: parl ? $("#ctopic", box).value : null, st: parl ? c.stance : null }); }
      catch (err) { btn.disabled = false; return ($("#cerr", box).textContent = errMsg(err)); }
      c.replyTo = null; return c.setReply(null);
    }
    const err = checkMsg(parl, u, text, parl ? mineP : mineO);
    if (err) return ($("#cerr", box).textContent = err);
    st.msgs.push({ id: "m" + Date.now(), nick: u.nick, side: u.country, room: parl ? "parl" : "own", ch: parl ? $("#ctopic", box).value : c.ch, text, ts: Date.now(), stance: parl ? c.stance : null, likes: [], reports: [], replyTo: c.replyTo });
    saveForum(st); c.replyTo = null; c.setReply(null);
  };
  box.querySelectorAll("[data-like]").forEach((b) => (b.onclick = async () => { const x = st.msgs.find((y) => y.id === b.dataset.like); if (!x || x.nick === u.nick) return; if (BACKEND) { try { await rpc("toggle_like", { mid: +x.id }); } catch (e) { toast(errMsg(e)); } return c.draw(); } const i = x.likes.indexOf(u.email); i < 0 ? x.likes.push(u.email) : x.likes.splice(i, 1); saveForum(st); c.draw(); }));
  box.querySelectorAll("[data-reply]").forEach((b) => (b.onclick = () => { const x = st.msgs.find((y) => y.id === b.dataset.reply); if (x) c.setReply({ id: x.id, nick: x.nick, text: x.text.slice(0, 60) }); }));
  box.querySelectorAll("[data-menu]").forEach((b) => (b.onclick = () => {
    const x = st.msgs.find((y) => y.id === b.dataset.menu), mine = x.nick === u.nick && x.side === u.country;
    const s = sheet("Üzenet", x.nick, `<p class="hint">${esc(x.text.slice(0, 120))}</p><div class="menu">
      <button data-a="copy">Másolás</button>${mine ? "" : `<button data-a="rep">${x.reports.includes(u.email) || (u.rep || []).includes(x.id) ? "Már jelentetted" : "Jelentés"}</button><button data-a="blk">Letiltom ${esc(x.nick)} felhasználót</button>`}</div>`);
    s.el.querySelector('[data-a="copy"]').onclick = async () => { try { await navigator.clipboard.writeText(x.text); toast("Másolva"); } catch {} s.close(); };
    const rp = s.el.querySelector('[data-a="rep"]'); if (rp) rp.onclick = async () => { if (BACKEND) { try { await rpc("report_message", { mid: +x.id }); u.rep = [...new Set([...(u.rep || []), x.id])]; saveAccount(u); toast("Jelentve. 3 jelentés után az üzenet elrejtődik."); } catch (e) { toast(errMsg(e)); } s.close(); return c.draw(); } if (!x.reports.includes(u.email)) { x.reports.push(u.email); saveForum(st); toast(x.reports.length >= 3 ? "Az üzenet elrejtve, a moderátor átnézi." : "Jelentve. 3 jelentés után az üzenet elrejtődik."); } s.close(); c.draw(); };
    const bl = s.el.querySelector('[data-a="blk"]'); if (bl) bl.onclick = async () => { if (BACKEND) { try { await rpc("set_block", { n: x.nick, on_off: true }); } catch (e) { toast(errMsg(e)); } } u.blocked = [...new Set([...(u.blocked || []), x.nick])]; saveAccount(u); toast(x.nick + " letiltva"); s.close(); c.draw(); };
  }));
}

/* csevegések a szerveren: privát üzenet és csoportok, csak a saját országon belül */
async function chatTabBackend(u, box, c) {
  const link = (id) => location.origin + location.pathname + "#/forum?chat=" + id;
  const idOf = (s) => (String(s).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i) || [""])[0];
  if (c.openChat) {
    let ch;
    try { ch = await rpc("get_chat", { cid: c.openChat }); }
    catch { try { await rpc("join_chat", { cid: c.openChat }); ch = await rpc("get_chat", { cid: c.openChat }); } catch (e) { toast(errMsg(e)); return c.setOpen(null); } }
    box.innerHTML = `<button class="btn ghost sm" id="bk">‹ Vissza</button><div class="card chat" style="margin-top:10px"><div class="rules"><b>${esc(ch.name || "Csevegés")}</b> · ${ch.members} tag${ch.kind === "group" ? ` · <button class="lk" id="cp">meghívó link másolása</button> · <button class="lk" id="lv">kilépés</button>` : ""}</div>
      <div class="msgs" id="msgs">${ch.msgs.length ? ch.msgs.map((x) => `<div class="msg ${x.nick === u.nick ? "own" : ""}"><div class="mh">${avatar(x.nick, 22)}<b>${esc(x.nick)}</b><span class="hint">${ago(x.at)}</span></div><p>${mention(x.text)}</p></div>`).join("") : '<p class="hint" style="padding:24px;text-align:center">Még nincs üzenet.</p>'}</div>
      <form id="cf" class="compose"><textarea id="ctext" rows="2" maxlength="500" placeholder="Írj…" aria-label="Üzenet"></textarea><div class="crow"><div class="err" id="cerr" role="alert"></div><button class="btn ${u.country} sm" type="submit">Küldés</button></div></form></div>`;
    $("#bk", box).onclick = () => c.setOpen(null); $("#msgs", box).scrollTop = 1e6;
    const cp = $("#cp", box); if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(link(ch.id)); toast("Link másolva"); } catch { prompt("Meghívó link", link(ch.id)); } };
    const lv = $("#lv", box); if (lv) lv.onclick = async () => { try { await rpc("leave_chat", { cid: ch.id }); } catch (e) { toast(errMsg(e)); } c.setOpen(null); };
    $("#cf", box).onsubmit = async (e) => {
      e.preventDefault(); const t = $("#ctext", box).value.trim(); if (!t) return;
      try { await rpc("post_chat", { cid: ch.id, txt: t }); } catch (err) { return ($("#cerr", box).textContent = errMsg(err)); }
      c.draw();
    };
    return;
  }
  let list = []; try { list = await rpc("my_chats"); } catch (e) { toast(errMsg(e)); }
  let q = "";
  const paint = () => {
    const fl = list.filter((x) => (x.name || "").toLowerCase().includes(q.toLowerCase()));
    $("#cl", box).innerHTML = fl.length ? fl.map((x) => `<button class="chatrow" data-o="${x.id}">${avatar(x.name || "?", 36)}<span><b>${esc(x.name || "Csevegés")}</b><span class="hint">${x.kind === "group" ? "Csoport" : "Privát"} · ${x.last ? esc(x.last) : "még nincs üzenet"}</span></span></button>`).join("") : '<div class="card empty"><span class="bulb">✉</span><p class="hint">Még nincs csevegésed. Írj valakinek, vagy hozz létre egy csoportot.</p></div>';
    box.querySelectorAll("[data-o]").forEach((b) => (b.onclick = () => c.setOpen(b.dataset.o)));
  };
  box.innerHTML = `<div class="crow"><input class="search" id="cs" placeholder="Csevegés keresése" aria-label="Keresés" style="flex:1"><button class="btn ${u.country} sm" id="nw">✎ Új</button></div><div id="cl"></div>`;
  paint(); $("#cs", box).oninput = (e) => { q = e.target.value; paint(); };
  $("#nw", box).onclick = () => {
    const s = sheet("", "Új csevegés", `<div class="menu"><button data-a="g">👥 Új csoport</button><button data-a="j">🔗 Csatlakozás linkkel</button><button data-a="p">🌐 Nyilvános csoportok</button></div>
      <label class="fl" for="who">Írj valakinek az országodban</label><input id="who" class="inp" maxlength="20" placeholder="Felhasználónév"><div class="err" id="we" role="alert"></div><button class="btn ${u.country} block" id="go" style="margin-top:8px">Csevegés indítása</button>`);
    $("#go", s.el).onclick = async () => { const w = $("#who", s.el).value.trim(); if (!w) return; try { const id = await rpc("start_dm", { n: w }); s.close(); c.setOpen(id); } catch (e) { $("#we", s.el).textContent = errMsg(e); } };
    s.el.querySelector('[data-a="g"]').onclick = () => { s.close(); const g = sheet("", "Új csoport", `<label class="fl" for="gn">A csoport neve</label><input id="gn" class="inp" maxlength="40"><div class="err" id="ge"></div><button class="btn ${u.country} block" id="gc" style="margin-top:8px">Létrehozás</button>`); $("#gc", g.el).onclick = async () => { const n = $("#gn", g.el).value.trim(); if (!n) return; try { const id = await rpc("create_group", { gname: n }); g.close(); c.setOpen(id); } catch (e) { $("#ge", g.el).textContent = /daily_limit/.test(e.message) ? "Legfeljebb 10 csoportot hozhatsz létre." : errMsg(e); } }; };
    s.el.querySelector('[data-a="j"]').onclick = () => { s.close(); const j = sheet("", "Csatlakozás linkkel", `<label class="fl" for="jl">Meghívó link</label><input id="jl" class="inp" placeholder="Illeszd be a linket"><div class="err" id="je"></div><button class="btn ${u.country} block" id="jc" style="margin-top:8px">Csatlakozás</button>`); $("#jc", j.el).onclick = async () => { const id = idOf($("#jl", j.el).value); if (!id) return ($("#je", j.el).textContent = "Ez nem meghívó link."); try { await rpc("join_chat", { cid: id }); j.close(); c.setOpen(id); } catch (e) { $("#je", j.el).textContent = errMsg(e); } }; };
    s.el.querySelector('[data-a="p"]').onclick = async () => { s.close(); let pg = []; try { pg = await rpc("public_groups"); } catch {} const p = sheet("", "Nyilvános csoportok", `<div class="menu">${pg.map((g) => `<button data-g="${g.id}"><b>${esc(g.name)}</b><span class="hint">${esc(g.about || "")} · ${g.members} tag</span></button>`).join("") || '<p class="hint">Még nincs nyilvános csoport.</p>'}</div>`); p.el.querySelectorAll("[data-g]").forEach((b) => (b.onclick = async () => { try { await rpc("join_chat", { cid: b.dataset.g }); p.close(); c.setOpen(b.dataset.g); } catch (e) { toast(errMsg(e)); } })); };
  };
}

/* csevegések: privát üzenet bármelyik saját országbeli polgárnak, csoportok, meghívó link, nyilvános csoportok */
function chatTab(u, st, box, c) {
  if (BACKEND) return chatTabBackend(u, box, c);
  const all = st.chats[u.country], list = all.filter((x) => x.members.includes(u.nick)), open = all.find((x) => x.id === c.openChat);
  const citizens = [...new Set(civ().cands[u.country].map((x) => x.nick))].filter((n) => n !== u.nick);
  if (open) {
    if (!open.members.includes(u.nick)) { open.members.push(u.nick); saveForum(st); }
    box.innerHTML = `<button class="btn ghost sm" id="bk">‹ Vissza</button><div class="card chat" style="margin-top:10px"><div class="rules"><b>${esc(open.name)}</b> · ${open.members.length} tag${open.type === "group" ? ` · meghívó link: <code>#/forum?chat=${esc(open.id)}</code>` : ""}</div>
      <div class="msgs" id="msgs">${open.msgs.length ? open.msgs.map((x) => `<div class="msg ${x.nick === u.nick ? "own" : ""}"><div class="mh">${avatar(x.nick, 22)}<b>${esc(x.nick)}</b><span class="hint">${ago(x.ts)}</span></div><p>${mention(x.text)}</p></div>`).join("") : '<p class="hint" style="padding:24px;text-align:center">Még nincs üzenet.</p>'}</div>
      <form id="cf" class="compose"><textarea id="ctext" rows="2" maxlength="500" placeholder="Írj…" aria-label="Üzenet"></textarea><div class="crow"><div class="err" id="cerr" role="alert"></div><button class="btn ${u.country} sm" type="submit">Küldés</button></div></form></div>`;
    $("#bk", box).onclick = () => c.setOpen(null); $("#msgs", box).scrollTop = 1e6;
    $("#cf", box).onsubmit = (e) => {
      e.preventDefault(); const t = $("#ctext", box).value.trim(), last = open.msgs.filter((x) => x.nick === u.nick).slice(-1)[0];
      if (!t) return; if (/https?:|www\./i.test(t)) return ($("#cerr", box).textContent = "Link nem küldhető.");
      if (last && Date.now() - last.ts < 2000) return ($("#cerr", box).textContent = "Lassabban.");
      open.msgs.push({ nick: u.nick, text: t, ts: Date.now() }); saveForum(st); c.draw();
    };
    return;
  }
  let q = "";
  const paint = () => {
    const fl = list.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
    $("#cl", box).innerHTML = fl.length ? fl.map((x) => `<button class="chatrow" data-o="${x.id}">${avatar(x.name, 36)}<span><b>${esc(x.name)}</b><span class="hint">${x.type === "group" ? "Csoport" : "Privát"} · ${x.msgs.length ? esc(x.msgs[x.msgs.length - 1].text.slice(0, 50)) : "még nincs üzenet"}</span></span></button>`).join("") : '<div class="card empty"><span class="bulb">✉</span><p class="hint">Még nincs csevegésed. Nyomd meg az Új gombot.</p></div>';
    box.querySelectorAll("[data-o]").forEach((b) => (b.onclick = () => c.setOpen(b.dataset.o)));
  };
  box.innerHTML = `<div class="crow"><input class="search" id="cs" placeholder="Csevegés keresése" aria-label="Keresés" style="flex:1"><button class="btn ${u.country} sm" id="nw">✎ Új</button></div><div id="cl"></div>`;
  paint(); $("#cs", box).oninput = (e) => { q = e.target.value; paint(); };
  const mk = (type, name) => { const id = "k" + Date.now(); all.push({ id, type, name, members: [u.nick], msgs: [] }); saveForum(st); c.setOpen(id); };
  $("#nw", box).onclick = () => {
    const s = sheet("", "Új csevegés", `<div class="menu"><button data-a="g">👥 Új csoport</button><button data-a="j">🔗 Csatlakozás linkkel</button><button data-a="p">🌐 Nyilvános csoportok</button></div>
      <label class="fl" for="who">Írj valakinek az országodban</label><input id="who" class="inp" list="cits" placeholder="Írj be egy nevet vagy felhasználónevet"><datalist id="cits">${citizens.slice(0, 60).map((n) => `<option value="${esc(n)}">`).join("")}</datalist><button class="btn ${u.country} block" id="go" style="margin-top:8px">Csevegés indítása</button><div class="err" id="we"></div>`);
    $("#go", s.el).onclick = () => { const w = $("#who", s.el).value.trim(); if (!citizens.includes(w)) return ($("#we", s.el).textContent = "Nincs ilyen polgár az országodban."); s.close(); const ex = all.find((x) => x.type === "dm" && x.name === w && x.members.includes(u.nick)); ex ? c.setOpen(ex.id) : mk("dm", w); };
    s.el.querySelector('[data-a="g"]').onclick = () => { s.close(); const g = sheet("", "Új csoport", `<label class="fl" for="gn">A csoport neve</label><input id="gn" class="inp" maxlength="40"><div class="err" id="ge"></div><button class="btn ${u.country} block" id="gc" style="margin-top:8px">Létrehozás</button>`); $("#gc", g.el).onclick = () => { const n = $("#gn", g.el).value.trim(); if (n.length < 3 || /https?:|www\./i.test(n)) return ($("#ge", g.el).textContent = "3–40 karakter, link nélkül."); g.close(); mk("group", n); }; };
    s.el.querySelector('[data-a="j"]').onclick = () => { s.close(); const j = sheet("", "Csatlakozás linkkel", `<label class="fl" for="jl">Meghívó link</label><input id="jl" class="inp" placeholder="#/forum?chat=…"><div class="err" id="je"></div><button class="btn ${u.country} block" id="jc" style="margin-top:8px">Csatlakozás</button>`); $("#jc", j.el).onclick = () => { const id = (($("#jl", j.el).value.match(/chat=([\w]+)/) || [])[1]); const g = all.find((x) => x.id === id && x.type === "group"); if (!g) return ($("#je", j.el).textContent = "Ez a meghívó nem érvényes."); j.close(); c.setOpen(g.id); }; };
    s.el.querySelector('[data-a="p"]').onclick = () => { s.close(); const p = sheet("", "Nyilvános csoportok", `<div class="menu">${all.filter((x) => x.pub).map((g) => `<button data-g="${g.id}"><b>${esc(g.name)}</b><span class="hint">${esc(g.about || "")} · ${g.members.length} tag</span></button>`).join("")}</div>`); p.el.querySelectorAll("[data-g]").forEach((b) => (b.onclick = () => { p.close(); c.setOpen(b.dataset.g); })); };
  };
}

/* ---------- említések ---------- */
async function mentionsPage() {
  const u = guard(); if (!u) return;
  if (BACKEND) {
    let rows = []; try { rows = (await rpc("get_mentions")).map((r) => toMsg(r, u)); } catch (e) { toast(errMsg(e)); }
    view.innerHTML = `${demoBanner}<div class="wrap page"><div><div class="eyebrow">Említések</div><h1 style="font-size:30px">Válaszok és @</h1></div>
      ${rows.map((x) => `<div class="msg ${SIDES[x.side].cls}"><div class="mh">${avatar(x.nick, 24)}<b>${esc(x.nick)}</b><span class="chip">${esc(x.room === "parl" ? "Parlament · " + x.ch : x.ch)}</span><span class="hint">${ago(x.ts)}</span></div>${x.replyTo ? `<div class="quote"><b>${esc(x.replyTo.nick)}</b>: ${esc(x.replyTo.text)}</div>` : ""}<p>${mention(x.text)}</p></div>`).join("") || `<div class="card empty"><span class="bulb">@</span><p class="hint">Még senki nem említett vagy válaszolt neked. Ha valaki @${esc(u.nick)} néven említ, itt látod.</p></div>`}</div>`;
    return;
  }
  const st = forumState(), mine = st.msgs.filter((x) => x.nick === u.nick && x.side === u.country).map((x) => x.id);
  const list = st.msgs.filter((x) => x.nick !== u.nick && (x.text.includes("@" + u.nick) || (x.replyTo && x.replyTo.nick === u.nick)) && (x.room === "parl" || x.side === u.country));
  view.innerHTML = `${demoBanner}<div class="wrap page"><div><div class="eyebrow">Említések</div><h1 style="font-size:30px">Válaszok és @</h1></div>
    ${list.map((x) => `<div class="msg ${SIDES[x.side].cls}"><div class="mh">${avatar(x.nick, 24)}<b>${esc(x.nick)}</b><span class="chip">${esc(x.room === "parl" ? "Parlament · " + x.ch : x.ch)}</span><span class="hint">${ago(x.ts)}</span></div>${x.replyTo ? `<div class="quote"><b>${esc(x.replyTo.nick)}</b>: ${esc(x.replyTo.text)}</div>` : ""}<p>${mention(x.text)}</p></div>`).join("") || `<div class="card empty"><span class="bulb">@</span><p class="hint">Még senki nem említett vagy válaszolt neked. Ha valaki @${esc(u.nick)} néven említ, itt látod.</p></div>`}</div>`;
  void mine;
}
