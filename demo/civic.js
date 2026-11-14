/* Polgári réteg: kezdőlap, politika (kormányfa, jelöltek, indulás, támogatás), polgári ötletek */
const DEPTS = [["penzugy", "Pénzügy", "Adók"], ["honvedelem", "Honvédelem", "Külpolitika"], ["igazsagugy", "Igazságügy", "Rend és biztonság"], ["egeszsegugy", "Egészségügy", "Egészségügy"], ["oktatas", "Oktatás", "Oktatás"], ["lakhatas", "Lakhatás", "Lakhatás"], ["munkaugy", "Munkaügy", "Munka és bérek"], ["belugy", "Belügy", "Rend és biztonság"], ["energia", "Energia és környezet", "Energia"], ["kulugy", "Külügy", "Külpolitika"]];
const deptName = (id) => (DEPTS.find((d) => d[0] === id) || [0, id])[1];
const FORUM_TOPICS = Object.keys(TOPICS);
const RACE_TABS = [["president", "Elnök"], ["vp", "Alelnök"], ["cabinet", "Kormány"]];

function nextDow(dow, h, m) {
  const d = new Date(); d.setHours(h, m, 0, 0);
  let add = (dow - d.getDay() + 7) % 7; if (add === 0 && d < new Date()) add = 7;
  d.setDate(d.getDate() + add); return d;
}
const fmtDt = (d) => d.toLocaleDateString("hu-HU", { weekday: "long", month: "long", day: "numeric" }) + ", " + d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
const left = (d) => { const x = dhms(d - new Date()); return x.d ? `${x.d} nap ${x.h} óra` : `${x.h} óra ${x.m} perc`; };
const leftShort = (d) => { const x = dhms(d - new Date()); return x.d ? `${x.d}N ${x.h}Ó` : `${x.h}Ó ${x.m}P`; };

/* ---------- demó jelöltek és ötletek ---------- */
const NAME_A = ["Duna", "Balaton", "Mecsek", "Bükk", "Mátra", "Kárpát", "Alföld", "Szigetköz", "Tokaj", "Villány", "Pannon", "Gemenc", "Hortobágy", "Zemplén", "Bakony", "Őrség"];
const NAME_B = ["Lovas", "Kovács", "Szabó", "Nagy", "Tóth", "Varga", "Molnár", "Kiss", "Horváth", "Farkas", "Máté", "Papp"];
const PLAT = {
  "Adók": [["Egyszerűbb adók, kevesebb kiskapu", "Szerintem az adórendszernek érthetőnek kell lennie. Kevesebb kedvezmény, átlátható kulcsok, és mindenki tudja, mire megy az adója."], ["Arányos teherviselés", "A magasabb jövedelmek viseljenek arányosan nagyobb terhet, a minimálbér közelében pedig maradjon meg a nettó."], ["Adócsökkentés a vállalkozásoknak", "A kisvállalkozások adminisztrációja és adóterhe csökkenjen, mert ők adják a munkahelyek nagy részét."]],
  "Gazdaság": [["Stabil költségvetés, kiszámítható gazdaság", "A hiány legyen kordában, az uniós forrásokat pedig gyorsan és átláthatóan költsük el."], ["Erős hazai kkv-szektor", "Könnyebb hitelhez jutás, kevesebb papír, gyorsabb közbeszerzés a helyi cégeknek."], ["Versenyképes ország", "Befektetés a képzésbe és az infrastruktúrába, hogy itthon legyenek jó munkahelyek."]],
  "Munka és bérek": [["Tisztességes bér, biztos munka", "A minimálbér kövesse a megélhetési költségeket, és a vendégmunka ne nyomja le a béreket."], ["Rugalmasabb munkaidő", "Szeretnék kísérletezni a rövidebb munkahéttel és a távmunka szabályaival."], ["Munkaerő-piaci segítség", "Gyorsabb átképzés, hatékonyabb álláskeresési támogatás."]],
  "Család": [["Biztonság a családoknak", "A családi pótlék értékét meg kell őrizni, a bölcsődei férőhelyeket pedig bővíteni."], ["Gyerekvállalás támogatása", "Egyszerű, kiszámítható támogatások, nem bonyolult pályázatok."], ["Család és karrier együtt", "Rugalmas GYED és több bölcsőde, hogy ne kelljen választani."]],
  "Lakhatás": [["Megfizethető otthon mindenkinek", "Több bérlakás és átlátható lakbérek, hogy a fiatalok is hozzájussanak otthonhoz."], ["Első lakás: gyors segítség", "Kamattámogatás vagy adókedvezmény az első lakásvásárlóknak, az árakat nem hajtva fel."], ["Építsünk többet", "Gyorsabb engedélyezés és olcsóbb építés, mert a kínálat hiánya a fő baj."]],
  "Egészségügy": [["Rövidebb várólisták", "Több nővér és orvos, jobb bérek, hogy ne vándoroljanak el."], ["Megelőzés és háziorvos", "A megelőző ellátás hosszú távon olcsóbb, ezt kell erősíteni."], ["Átlátható egészségügy", "Nyilvános várólisták és a hálapénz megszüntetése."]],
  "Oktatás": [["Jobb iskolák, kevesebb adminisztráció", "A tanárok kapjanak tisztességes bért, és kevesebb papírmunkát."], ["Gyakorlatias szakképzés", "A szakképzés és a vállalatok együttműködése adjon valódi munkát a végzetteknek."], ["Esélyegyenlőség", "Minden gyerek jusson jó óvodához és alapozó képzéshez."]],
  "Nyugdíj": [["Biztos nyugdíj", "Az éves emelés kövesse az inflációt, hogy a nyugdíj értékét ne vigye el az áremelkedés."], ["Rugalmas nyugdíjba vonulás", "Legyen választási lehetőség a korhatár körül, ösztönzőkkel."], ["Méltó időskor", "Több idősgondozási férőhely és házi segítség."]],
  "Szociális": [["Célzott segítség", "A támogatás oda menjen, ahol a legnagyobb a szükség, egyszerű szabályokkal."], ["Gyermekszegénység ellen", "A rászoruló családoknak közvetlen segítség és étkeztetés."], ["Munkába vezető út", "A segély ne csapda legyen, hanem híd a munkába."]],
  "Rend és biztonság": [["Biztonságos utcák", "Több rendőr, jobb fizetés, és hatékony nyomozás."], ["Igazságos büntetés", "A büntetés kiszámítható legyen, a megelőzés pedig fontosabb a szigornál."], ["Átlátható állam", "Nyilvános közbeszerzések és vagyonvisszaszerzés, hogy az állam pénze ne tűnjön el."]],
  "Energia": [["Olcsó, tiszta energia", "Napenergia, atomerőmű és hálózatfejlesztés együtt: megfizethető rezsi."], ["Energiafüggetlenség", "Csökkentsük az egy forrástól való függést, és bővítsük a tárolókapacitást."], ["Célzott rezsisegítség", "A támogatás a rászorulókhoz menjen, ne mindenkihez."]],
  "Közlekedés": [["Jobb vasút, olcsóbb bérlet", "A vasút és a regionális közlekedés fejlesztése, egyszerű bérletrendszer."], ["Autópályák és körgyűrűk", "A fő útvonalak befejezése, hogy a vidék is elérhető legyen."], ["Elektromos jövő", "Töltőhálózat és ésszerű támogatás az e-autókhoz."]],
  "Környezet": [["Tiszta Magyarország", "Aszály elleni vízgazdálkodás, erdők védelme, tiszta levegő."], ["Zöld munkahelyek", "A klímavédelem legyen a gazdaság motorja, ne teher."], ["Józan klímapolitika", "A klímavédelem ára ne a legszegényebbeket terhelje."]],
  "Külpolitika": [["Erős szövetségek", "Együttműködés az EU-val és a NATO-val, uniós források hazahozása."], ["Önálló, de kiszámítható", "Kereskedelmi és energia-érdekeink mentén, kiszámíthatóan képviseljük magunkat."], ["Biztonságos határok", "Határvédelem és védelmi képesség az ésszerű szinten."]],
  "Általános": [["Átlátható, érvelő politika", "Minden törvényhez legyen nyilvános hatásvizsgálat, és legyen ellenőrizhető, mit hozott."], ["Összefogás", "A két tábor között legyen vita, de legyen közös ügy is."], ["Józan ész", "Kevesebb szólam, több adat."]],
  "Kampány": [["Hallgassuk meg egymást", "Az érvekre érvvel válaszoljunk."], ["Együtt építkezünk", "Szívesen fogadom a javaslataitokat."], ["Konkrét tervekkel", "Nem ígérek mindent, csak azt, amit meg tudok valósítani."]],
};
function genCands(side) {
  const out = [], seed = side === "tisza" ? 11 : 29, rnd = (n) => hash(side + "r" + n);
  const mk = (i, race, dept) => {
    const topic = dept ? DEPTS.find((d) => d[0] === dept)[2] : FORUM_TOPICS[(rnd(i) % (FORUM_TOPICS.length - 1)) + 1 - (rnd(i) % 7 === 0 ? 0 : 0)];
    const pool = PLAT[topic] || PLAT["Általános"], pick = pool[rnd(i + 5) % pool.length], nick = NAME_A[rnd(i) % 16] + NAME_B[rnd(i + 1) % 12] + (10 + (rnd(i + 2) % 89));
    const t2 = FORUM_TOPICS[(rnd(i + 3) % (FORUM_TOPICS.length - 1)) + 1], t3 = FORUM_TOPICS[(rnd(i + 4) % (FORUM_TOPICS.length - 1)) + 1];
    return { id: "c" + side[0] + i, nick, race, dept: dept || null, rename: dept && rnd(i + 8) % 4 === 0 ? "Minisztérium: " + deptName(dept) + " és Fejlesztés" : "", slogan: pick[0], platform: pick[1], topics: [...new Set([topic, t2, t3])].slice(0, 3), seed: Math.floor((rnd(i + 6) % 100) ** 2 / 40), backers: [], no: 100 + (rnd(i + 7) % 4900), edited: rnd(i + 9) % 5 === 0, ts: Date.now() - (rnd(i) % 86400) * 1000 * 3 - seed };
  };
  for (let i = 0; i < 30; i++) out.push(mk(i, "president"));
  for (let i = 0; i < 14; i++) out.push(mk(100 + i, "vp"));
  DEPTS.forEach((d, j) => { for (let k = 0; k < 4; k++) out.push(mk(200 + j * 10 + k, "cabinet", d[0])); });
  return out;
}
const IDEAS = {
  tisza: [["Nyugdíj", "Az éves nyugdíjemelés kövesse automatikusan az inflációt", "Így a nyugdíj értékét nem viszi el az áremelkedés.", 305, 21], ["Lakhatás", "Országos, nyilvános lakbéradatbázis", "Lássuk, mennyi a valós bérleti díj, és ne lehessen visszaélni.", 241, 12], ["Általános", "Minden törvényhez kötelező, nyilvános hatásvizsgálat", "Mérjük meg előre, mit okoz, és később ellenőrizzük.", 198, 9], ["Oktatás", "Ingyenes iskolai étkeztetés minden gyereknek", "A gyermekszegénység ellen a legegyszerűbb eszköz.", 176, 15], ["Egészségügy", "Nyilvános, naprakész várólista minden ellátásra", "Mindenki lássa, mikor kerülhet sorra.", 152, 7]],
  fidesz: [["Család", "A családi pótlék automatikus, éves emelése", "A pótlék értéke ne csússzon vissza.", 312, 18], ["Gazdaság", "A kisvállalkozói adminisztráció felére csökkentése", "Kevesebb papír, több munkahely.", 257, 11], ["Oktatás", "A szakképzés és a vállalatok közvetlen együttműködése", "A végzettek tudjanak azonnal munkát találni.", 203, 8], ["Közlekedés", "Egységes országos bérlet, olcsóbban", "Egy jegy, minden közlekedési eszközre.", 181, 10], ["Rend és biztonság", "Több rendőr a kisvárosokban", "A biztonság ne csak a nagyvárosokban legyen érezhető.", 140, 6]],
};
function seedCiv() {
  const mkI = (side) => IDEAS[side].map(([topic, title, why, b, a], i) => ({ id: "i" + side[0] + i, nick: NAME_A[(i * 3) % 16] + NAME_B[(i * 5) % 12] + (20 + i), topic, title, why, seed: b, backers: [], answers: [], aseed: a, ts: Date.now() - (i + 1) * 5400000 }));
  return { cands: BACKEND ? { tisza: [], fidesz: [] } : { tisza: genCands("tisza"), fidesz: genCands("fidesz") }, ideas: BACKEND ? { tisza: [], fidesz: [] } : { tisza: mkI("tisza"), fidesz: mkI("fidesz") }, v: 2 };
}
/* backend módban a jelöltek és a választás a szerverről jönnek (loadElection), a gyorsítótár külön kulcson él */
const civKey = () => (BACKEND ? "km_civ_b" : "km_civ");
const civ = () => { let c = store.get(civKey(), null); if (!c || c.v !== 2) { c = seedCiv(); store.set(civKey(), c); } return c; };
const saveCiv = (c) => store.set(civKey(), c);
const backs = (x) => x.seed + x.backers.length;
const myCand = (u) => civ().cands[u.country].find((c) => c.nick === u.nick);
const isCand = (nick, side) => civ().cands[side].some((c) => c.nick === nick);
const raceOf = (c) => (c.race === "cabinet" ? "Jelölt: " + deptName(c.dept) : c.race === "vp" ? "Alelnökjelölt" : "Elnökjelölt");
const ago2 = (ts) => { const s = Math.max(1, Math.round((Date.now() - ts) / 1000)); return s < 90 ? "most" : s < 3600 ? Math.round(s / 60) + " p" : s < 86400 ? Math.round(s / 3600) + " ó" : Math.round(s / 86400) + " n"; };
const upArrow = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';

/* ---------- kezdőlap ---------- */
function home() {
  const u = guard(); if (!u) return;
  const ms = weekMeasures(), wk = "w" + weekNum(), voted = ms.filter((m) => (u.votes[wk] || {})[m.id] !== undefined).length;
  const { cv, el, ph } = sync(u.country), mine = myCand(u), backed = cv.cands[u.country].some((c) => c.backers.includes(u.email)), posted = didPostToday(u);
  const task = (done, title, sub, href) => `<a class="task ${done ? "done" : ""}" href="${href}"><i class="chk">${done ? "✓" : ""}</i><div><b>${title}</b><span>${sub}</span></div><em>›</em></a>`;
  const R = roundNow(), vClose = new Date(R.closes), eClose = new Date(el.closeAt), fin = new Date(el.finAt), annKey = "ann2_" + u.country;
  const showAnn = !(u.seen || {})[annKey];
  const adm = BACKEND && (window.__ann || [])[0] && (u.seen || {}).annHome !== window.__ann[0].id ? window.__ann[0] : null;
  const topIdeas = cv.ideas[u.country].slice().sort((a, b) => backs(b) - backs(a)).slice(0, 3);
  view.innerHTML = `${demoBanner}<div class="wrap page">
    <div><h1 style="font-size:30px">Szia, ${esc(u.nick)}!</h1><p class="hint" style="margin-top:4px">Te a <b class="${SIDES[u.country].cls === "t" ? "t-txt" : "f-txt"}">${SIDES[u.country].tag.toUpperCase()}</b> polgára vagy. Mi a teendőd most:</p></div>
    ${adm ? `<div class="card ann"><button class="x2" id="admx" aria-label="Elrejtés">✕</button><div class="eyebrow">Közlemény</div><h3 style="margin:4px 0">${esc(adm.title)}</h3><p class="hint" style="font-size:14px">${esc(adm.body).replace(/\n/g, "<br>")}</p></div>` : ""}
    ${showAnn ? `<div class="card ann"><button class="x2" id="annx" aria-label="Elrejtés">✕</button><div class="eyebrow">Közlemény · 41 p</div><h3 style="margin:4px 0">Mikor szavazunk?</h3>
      <p class="hint" style="font-size:14px"><b>Minden szerda, ${hm(R.opens)}–${hm(R.closes)}:</b> heti szavazás, hetente 3 intézkedésről.<br><b>Minden 4. héten:</b> kormányválasztás. Legközelebb ${fmtDt(fin)}-kor ${fin < new Date() ? "megnyílt" : "nyílik"} az elnöki döntő…</p><a href="#" id="annm"><b>Elolvasom az egészet</b></a></div>` : ""}
    <div class="tasks">
      ${R.kind === "election" ? task(false, "Ezen a héten a kormányról szavazunk", `Szerdán ${hm(R.opens)} és ${hm(R.closes)} között. Indulj jelöltként, vagy támogass valakit.`, "#/politika") : task(voted === ms.length && ms.length > 0, `Szavazz az intézkedésekről (${voted}/${ms.length})`, R.open ? `Válassz egy opciót, mint egy szavazáson. Zárul: ${left(vClose)}.` : `Szerdánként ${hm(R.opens)}-kor nyílik. Következő: ${fmtDt(roundNextOpen(R))}.`, "#/szavazas")}
      ${ph === "final" ? task(!!el.votes[u.email], "Szavazz az elnöki döntőn", `Titkos, végleges szavazat. Zárul: ${fmtDt(eClose)}.`, "#/politika") : ph === "closed" ? task(true, "Az új kormány megvan", "Nézd meg a Politika fülön, kik nyertek.", "#/politika?t=gov") : task(!!mine || backed, "Indulj a választáson, vagy támogass valakit", `A választás zárul: ${fmtDt(eClose)}.`, "#/politika")}
      ${task(posted, "Szólj hozzá a fórumon", "Csak a saját országod olvassa. Ötletek igen, sértések nem.", "#/forum")}
    </div>
    <button class="btn block ${u.country}" id="share">Meghívom a barátaimat</button>
    <div class="tiles"><a class="tile" href="#/emlitesek"><b>@ Említések</b><span>válaszok és @</span></a><a class="tile" href="#/hogyan-jatssz"><b>▶ Hogyan játssz</b><span>egy perc alatt</span></a><a class="tile" href="#/evrol-evre"><b>▦ Évről évre</b><span>mit döntöttek</span></a><a class="tile" href="#/modszertan"><b>⌕ A számok</b><span>hogyan működnek</span></a></div>
    <div class="card"><div class="crow"><h3>Polgári ötletek</h3><a href="#/szavazas?t=cit"><b>Mind</b></a></div>
      ${topIdeas.map((p) => `<div class="mini"><span class="up">${upArrow}<b>${backs(p)}</b></span><div><div>${tChip(p.topic)}</div><b>${esc(p.title)}</b><span class="hint">${esc(p.nick)} · ${ago2(p.ts)}</span></div></div>`).join("")}</div></div>`;
  $("#share").onclick = async () => { const url = location.href.split("#")[0]; try { if (navigator.share) await navigator.share({ title: "Két Magyarország", url }); else { await navigator.clipboard.writeText(url); toast("Link másolva"); } } catch {} };
  const dx = $("#admx"); if (dx) dx.onclick = () => { u.seen = { ...(u.seen || {}), annHome: adm.id }; saveAccount(u); home(); };
  const ax = $("#annx"); if (ax) ax.onclick = () => { u.seen = { ...(u.seen || {}), [annKey]: 1 }; saveAccount(u); home(); };
  const am = $("#annm"); if (am) am.onclick = (e) => { e.preventDefault(); sheet("Közlemény", "Mikor szavazunk?", `<p><b>Minden szerda, ${hm(R.opens)}–${hm(R.closes)}:</b> heti szavazás, hetente 3 intézkedésről. Az eredményt a szavazás lezárása után kapja meg a saját országod.</p><p><b>Minden 4. héten:</b> kormányválasztás. A jelöltállítás és a támogatás addig tart, amíg a döntő meg nem nyílik.</p><p><b>${fmtDt(fin)}:</b> ${fin < new Date() ? "megnyílt" : "megnyílik"} az elnöki döntő. Az 5 legtöbb támogatást kapott jelölt közül titkos szavazással választotok.</p><p><b>${fmtDt(eClose)}:</b> zárul az alelnök és a kormány választása.</p>`); };
}

/* ---------- választási fázisok: támogatás -> titkos elnöki döntő -> lezárás ---------- */
const TERM_PRES = 4 * 7 * 864e5, TERM_CAB = 4 * 7 * 864e5;
function E(cv, side) {
  cv.elec = cv.elec || {}; cv.gov = cv.gov || {};
  if (!cv.elec[side]) cv.elec[side] = { id: 1, finAt: nextDow(3, 18, 0).getTime(), closeAt: nextDow(3, 23, 59).getTime(), finalists: null, votes: {}, result: null, history: [] };
  return cv.elec[side];
}
const phaseOf = (el) => el.srv || (el.result || Date.now() >= el.closeAt ? "closed" : Date.now() >= el.finAt ? "final" : "open");
const snap = (c) => (c ? { id: c.id, nick: c.nick, slogan: c.slogan, dept: c.dept, rename: c.rename, no: c.no } : null);
const finVotes = (el, c) => hash(c.id + "fin") % 300 + Object.values(el.votes).filter((v) => v === c.id).length;
const best = (arr, f) => arr.slice().sort((a, b) => f(b) - f(a) || a.ts - b.ts)[0];
/* a fázisváltásokat itt hajtjuk végre (finalisták befagyasztása, számlálás) */
function sync(side) {
  if (BACKEND) { const cv = civ(), el = E(cv, side); return { cv, el, ph: phaseOf(el), gov: cv.gov[side] || null }; }
  const cv = civ(), el = E(cv, side), ph = phaseOf(el), list = cv.cands[side];
  if (ph !== "open" && !el.finalists) el.finalists = list.filter((c) => c.race === "president").sort((a, b) => backs(b) - backs(a) || a.ts - b.ts).slice(0, 5).map((c) => c.id);
  if (ph === "closed" && !el.result) {
    const fin = el.finalists.map((id) => list.find((c) => c.id === id)).filter(Boolean), cab = {};
    DEPTS.forEach((d) => { cab[d[0]] = snap(best(list.filter((c) => c.race === "cabinet" && c.dept === d[0]), backs)); });
    el.result = { president: snap(best(fin, (c) => finVotes(el, c))), vp: snap(best(list.filter((c) => c.race === "vp"), backs)), cabinet: cab, at: el.closeAt, tally: fin.map((c) => [c.nick, finVotes(el, c)]) };
    cv.gov[side] = el.result;
  }
  saveCiv(cv); return { cv, el, ph: phaseOf(el), gov: cv.gov[side] || null };
}
function officeOf(nick, side) {
  const g = (civ().gov || {})[side]; if (!g) return "";
  if (g.president && g.president.nick === nick) return "Elnök";
  if (g.vp && g.vp.nick === nick) return "Alelnök";
  const d = Object.entries(g.cabinet || {}).find(([, c]) => c && c.nick === nick); return d ? "Miniszter" : "";
}
const roleCard = (title, icon, c, extra) => `<div class="role ${c ? "held" : ""}"><i class="rav">${c ? avatar(c.nick, 32) : icon}</i><span>${title}</span><b>${c ? esc(c.nick) : "Betöltetlen"}</b>${c ? `<span class="rs">«${esc(c.slogan)}»</span>` : ""}${extra || ""}</div>`;

/* ---------- politika ---------- */
function politics() {
  const u = guard(); if (!u) return;
  const q0 = new URLSearchParams((location.hash.split("?")[1] || ""));
  let tab = q0.get("t") === "gov" ? "gov" : "cand", race = ["president", "vp", "cabinet"].includes(q0.get("r")) ? q0.get("r") : "president", sort = "random", topic = "all", dept = "all", query = q0.get("q") || "", limit = 20, seedR = Date.now(), pick = null;
  const draw = () => {
    const { cv, el, ph, gov } = sync(u.country), all = cv.cands[u.country], mine = all.find((c) => c.nick === u.nick);
    const locked = ph === "closed" || (ph === "final" && race === "president"), eClose = new Date(el.closeAt), fin = new Date(el.finAt);
    const inRace = all.filter((c) => c.race === race);
    let list = inRace.filter((c) => (topic === "all" || c.topics.includes(topic)) && (race !== "cabinet" || dept === "all" || c.dept === dept) && (!query || (c.nick + c.slogan + c.no).toLowerCase().includes(query.toLowerCase().replace(/^#/, ""))));
    list = list.slice().sort(sort === "new" ? (a, b) => b.ts - a.ts : sort === "old" ? (a, b) => a.ts - b.ts : (a, b) => hash(a.id + seedR) - hash(b.id + seedR));
    if (mine && mine.race === race && list.includes(mine)) list = [mine, ...list.filter((x) => x !== mine)];
    const winnerId = ph === "closed" && gov ? (race === "vp" ? (gov.vp || {}).id : race === "president" ? (gov.president || {}).id : null) : null;
    const cabWin = ph === "closed" && gov ? Object.values(gov.cabinet || {}).filter(Boolean).map((c) => c.id) : [];
    const shown = list.slice(0, limit), title = { president: "Elnökválasztás 2026", vp: "Alelnök-választás 2026", cabinet: "Kormányválasztás 2026" }[race];
    const stat = ph === "closed" ? '<i class="live off"></i>LEZÁRULT' : ph === "final" && race === "president" ? `<i class="live"></i>DÖNTŐ · TITKOS SZAVAZÁS · ZÁRUL ${leftShort(eClose)}` : `<i class="live"></i>NYITVA · ZÁRUL ${leftShort(race === "president" ? fin : eClose)}`;
    const expl = ph === "closed" ? "A választás lezárult. A nyertesek a Kormány fülön láthatók." : race === "president" ? (ph === "final" ? `A támogatás lezárult. Az 5 legtámogatottabb jelölt jutott a döntőbe: egy titkos, végleges szavazatot adhatsz le ${fmtDt(eClose)}-ig.` : `Támogass mindenkit, akit szeretnél ${upArrow}. A legtöbb támogatást kapott 5 jelölt jut a titkos döntőbe: ${fmtDt(fin)}.`) : race === "vp" ? `Támogass mindenkit, akit szeretnél ${upArrow}. A legtöbb támogatott lesz az alelnök: ${fmtDt(eClose)}.` : `Támogass mindenkit, akit szeretnél ${upArrow}. Minden tárcát a legtöbb támogatott jelölt kap meg: ${fmtDt(eClose)}.`;
    const card = (c) => `<div class="cand ${c.nick === u.nick ? "me2" : ""} ${winnerId === c.id || cabWin.includes(c.id) ? "winner" : ""}" id="${c.id}"><button class="upb ${c.backers.includes(u.email) ? "on" : ""}" data-back="${c.id}" ${locked || c.nick === u.nick ? "disabled" : ""} aria-label="Támogatom" aria-pressed="${c.backers.includes(u.email)}">${upArrow}<b>${backs(c)}</b></button>
      <div class="cbody"><div class="clab">${winnerId === c.id || cabWin.includes(c.id) ? "🏆 Győztes · " : ""}${c.nick === u.nick ? "Te · " : ""}${raceOf(c)}${c.edited ? " · szerkesztve" : ""}</div>
        ${c.dept ? `<div class="tp"><span class="tchip">${tIcon(DEPTS.find((d) => d[0] === c.dept)[2], 13)}${esc(deptName(c.dept))}</span></div>${c.rename ? `<div class="hint" style="font-size:12px">Átnevezné: <b>${esc(c.rename)}</b></div>` : ""}` : ""}
        <div class="cn">${avatar(c.nick, 22)}<b>${esc(c.nick)}</b></div><div class="slog">«${esc(c.slogan)}»</div><div class="tp">${c.topics.map(tChip).join("")}</div>
        <p class="plat ${c.platform.length > 130 ? "clamp" : ""}">${esc(c.platform)}</p>${c.platform.length > 130 ? '<button class="more" data-more>Tovább</button>' : ""}
        <div class="cfoot"><span>#${c.no}</span><button data-share="${c.id}">Megosztás</button>${c.nick === u.nick && !locked ? '<button data-edit>Szerkesztés</button><button data-wd>Visszalépés</button>' : ""}</div></div></div>`;
    /* döntő */
    const voted = el.votes[u.email], fins = (el.finalists || []).map((id) => all.find((c) => c.id === id)).filter(Boolean);
    const finalHtml = race === "president" && ph !== "open" ? (ph === "final" ? `<div class="card finalbox"><h3>Titkos döntő</h3><p class="hint" style="font-size:14px">Egy ember, egy szavazat. A szavazatod titkos, és nem módosítható.</p>
      ${fins.map((c) => `<button class="fopt ${(voted || pick) === c.id ? "on" : ""}" data-fp="${c.id}" ${voted ? "disabled" : ""}><i class="radio ${(voted || pick) === c.id ? "on" : ""}"></i><span>${avatar(c.nick, 28)}</span><span class="otxt"><b>${esc(c.nick)}</b><span>«${esc(c.slogan)}»</span></span></button>`).join("")}
      ${voted ? '<p class="hint"><b>✓ Leadtad a titkos szavazatod.</b> Az eredmény a lezáráskor derül ki.</p>' : `<button class="btn ${u.country} block" data-fv ${pick ? "" : "disabled"}>Szavazat véglegesítése</button>`}</div>` : `<div class="card finalbox"><h3>A döntő eredménye</h3>${(gov && gov.tally ? (() => { const t = gov.tally.reduce((a, b) => a + b[1], 0); return gov.tally.slice().sort((a, b) => b[1] - a[1]).map(([n, v]) => `<div class="mrow"><span>${esc(n)}${gov.president && gov.president.nick === n ? " 🏆" : ""}</span><b>${Math.round((v / t) * 100)}%</b></div>`).join(""); })() : "")}</div>`) : "";
    const orgGov = gov || { president: null, vp: null, cabinet: {} };
    const until = (c, dur) => (c ? `<span class="rs">mandátum: ${new Date(gov.at + dur).toLocaleDateString("hu-HU", { month: "short", day: "numeric" })}-ig</span>` : "");
    view.innerHTML = `${demoBanner}<div class="wrap page"><div><div class="eyebrow">A kormány: ${SIDES[u.country].tag}</div><h1 style="font-size:30px;color:var(--${u.country === "tisza" ? "tisza" : "fidesz-ink"})">${SIDES[u.country].name.toUpperCase()}-POLGÁROK</h1></div>
      <div class="seg"><button class="${tab === "gov" ? "on" : ""}" data-t="gov">▤ Kormány</button><button class="${tab === "cand" ? "on" : ""}" data-t="cand">☷ Jelöltek</button></div>
      ${tab === "gov" ? `<button class="rowlink" data-t="cand"><span>${ph === "closed" ? "A választás lezárult" : "Következő választás"}<b>${ph === "closed" ? "Új választás: 4 hét múlva" : "Zárul: " + fmtDt(eClose)}</b></span><em>›</em></button>
        <div class="orgchart">${roleCard("Elnök", "♛", orgGov.president, until(orgGov.president, TERM_PRES)).replace('class="role', 'class="role big')}<i class="vline"></i>${roleCard("Alelnök", "⛨", orgGov.vp, until(orgGov.vp, TERM_PRES)).replace('class="role', 'class="role mid')}<i class="vline"></i><div class="cab">KORMÁNY</div>
          <div class="cgrid">${DEPTS.map((d) => { const c = (orgGov.cabinet || {})[d[0]]; return roleCard(c && c.rename ? c.rename : d[1], tIcon(d[2], 16), c, until(c, TERM_CAB)); }).join("")}</div></div>
        <div class="card"><p class="hint" style="font-size:14px">Három verseny van, és csak egyikben indulhatsz. Az elnök és az alelnök 4 hétre (4 játékévre), a kormány 2 hétre kap mandátumot. Utána új választás. Ők az ország nevében szólnak, de a szavazatuk ugyanannyit ér, mint bárki másé.</p></div>` : `
        <div class="seg sm">${RACE_TABS.map(([i, n]) => `<button class="${race === i ? "on" : ""}" data-r="${i}">${i === "president" ? "♛" : i === "vp" ? "⛨" : "▤"} ${n}</button>`).join("")}</div>
        <div class="crow" style="margin-top:4px"><h2 style="font-size:19px">${title}</h2><a href="#/forum?ch=Kampány" class="hint"><b>💬 Vita</b></a></div>
        <div class="status">${stat}</div><p class="hint" style="font-size:14px">${expl}</p>
        ${finalHtml}
        ${locked ? "" : `<button class="btn block ${u.country}" data-run>${mine ? "Jelöltségem szerkesztése" : race === "cabinet" ? "Indulok miniszternek" : race === "vp" ? "Indulok alelnöknek" : "Indulok elnöknek"}</button>`}
        <div class="seg sm"><button class="${sort === "random" ? "on" : ""}" data-s="random">⚂ Véletlen</button><button class="${sort === "new" ? "on" : ""}" data-s="new">⚡ Új</button><button class="${sort === "old" ? "on" : ""}" data-s="old">◷ Régi</button></div>
        <div class="chips wrapc">${race === "cabinet" ? `<button class="tchip sel ${dept === "all" ? "on all" : ""}" data-d="all">Minden tárca</button>${DEPTS.map((d) => `<button class="tchip sel ${dept === d[0] ? "on" : ""}" data-d="${d[0]}">${tIcon(d[2], 14)}${esc(d[1])}</button>`).join("")}` : `<button class="tchip sel ${topic === "all" ? "on all" : ""}" data-f="all">Minden téma</button>${FORUM_TOPICS.map((t) => `<button class="tchip sel ${topic === t ? "on" : ""}" data-f="${esc(t)}">${tIcon(t, 14)}${esc(t)}</button>`).join("")}`}</div>
        <input id="q" class="search" placeholder="Név, jelmondat vagy szám" value="${esc(query)}" aria-label="Keresés"><p class="hint" style="font-size:12px">${inRace.length} jelölt · mutatva: ${shown.length}. Keress névre vagy számra, vagy kattints a Véletlenre.</p>
        ${shown.map(card).join("") || '<p class="hint">Nincs találat.</p>'}${list.length > limit ? '<button class="btn ghost block" data-more2>Továbbiak</button>' : ""}`}
      ${BACKEND && !(session() || {}).demo ? "" : `<div class="card demo2"><div class="eyebrow">Demó-vezérlő (csak a prototípusban)</div><p class="hint" style="font-size:13px">Fázis: <b>${{ open: "támogatás nyitva", final: "elnöki döntő", closed: "lezárult" }[ph]}</b>. Itt előreléptetheted az időt, hogy kipróbáld a döntőt és az eredményt.</p>
        <div class="crow"><button class="btn ghost sm" data-ph="final" ${ph !== "open" ? "disabled" : ""}>Döntő indítása</button><button class="btn ghost sm" data-ph="closed" ${ph === "closed" ? "disabled" : ""}>Választás lezárása</button><button class="btn ghost sm" data-ph="new" ${ph !== "closed" ? "disabled" : ""}>Új választás</button></div></div>`}</div>`;
    view.querySelectorAll("[data-t]").forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
    view.querySelectorAll("[data-r]").forEach((b) => (b.onclick = () => { race = b.dataset.r; limit = 20; dept = "all"; topic = "all"; draw(); }));
    view.querySelectorAll("[data-s]").forEach((b) => (b.onclick = () => { sort = b.dataset.s; if (sort === "random") seedR = Date.now(); draw(); }));
    view.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => { topic = b.dataset.f; draw(); }));
    view.querySelectorAll("[data-d]").forEach((b) => (b.onclick = () => { dept = b.dataset.d; draw(); }));
    const qi = $("#q"); if (qi) qi.oninput = () => { query = qi.value; limit = 20; clearTimeout(draw.t); draw.t = setTimeout(() => { const p = qi.selectionStart; draw(); const n = $("#q"); n.focus(); n.setSelectionRange(p, p); }, 250); };
    const m2 = $("[data-more2]"); if (m2) m2.onclick = () => { limit += 40; draw(); };
    view.querySelectorAll("[data-more]").forEach((b) => (b.onclick = () => { const p = b.previousElementSibling; p.classList.toggle("clamp"); b.textContent = p.classList.contains("clamp") ? "Tovább" : "Kevesebb"; }));
    view.querySelectorAll("[data-back]").forEach((b) => (b.onclick = async () => {
      const c = all.find((x) => x.id === b.dataset.back), i = c.backers.indexOf(u.email);
      if (BACKEND) { try { await rpc("set_back", { cid: c.id, on_off: i < 0 }); await loadElection(); } catch (e) { toast(errMsg(e)); return; } }
      else { i < 0 ? c.backers.push(u.email) : c.backers.splice(i, 1); saveCiv(cv); }
      const y = scrollY; draw(); scrollTo(0, y);
    }));
    view.querySelectorAll("[data-share]").forEach((b) => (b.onclick = async () => { const c = all.find((x) => x.id === b.dataset.share); const url = location.href.split("#")[0] + "#/politika?q=" + c.no; try { if (navigator.share) await navigator.share({ title: c.slogan, url }); else { await navigator.clipboard.writeText(url); toast("Link másolva"); } } catch {} }));
    const run = $("[data-run]"); if (run) run.onclick = () => candSheet(u, mine, race, draw);
    const ed = $("[data-edit]"); if (ed) ed.onclick = () => candSheet(u, mine, mine.race, draw);
    const wd = $("[data-wd]"); if (wd) wd.onclick = async () => {
      if (!confirm("Biztosan visszalépsz a jelöltségtől?")) return;
      if (BACKEND) { try { await rpc("withdraw_candidate"); await loadElection(); } catch (e) { return toast(errMsg(e)); } }
      else { cv.cands[u.country] = all.filter((c) => c.nick !== u.nick); saveCiv(cv); }
      draw();
    };
    view.querySelectorAll("[data-fp]").forEach((b) => (b.onclick = () => { pick = b.dataset.fp; draw(); }));
    const fv = $("[data-fv]"); if (fv) fv.onclick = () => { const c = all.find((x) => x.id === pick); const s = sheet("Titkos szavazat", "Biztosan rá szavazol?", `<p><b>${esc(c.nick)}</b><br><span class="hint">«${esc(c.slogan)}»</span></p><p class="hint">A szavazat titkos és végleges.</p><button class="btn ${u.country} block" id="yes">Igen, leadom</button><button class="btn ghost block" id="no" style="margin-top:8px">Mégsem</button>`); $("#no", s.el).onclick = s.close; $("#yes", s.el).onclick = async () => {
        if (BACKEND) { try { await rpc("cast_final", { cid: pick }); await loadElection(); } catch (e) { s.close(); toast(errMsg(e)); draw(); return; } }
        else { const c2 = civ(); E(c2, u.country).votes[u.email] = pick; saveCiv(c2); }
        s.close(); toast("Szavazat rögzítve"); draw();
      }; };
    view.querySelectorAll("[data-ph]").forEach((b) => (b.onclick = async () => {
      if (BACKEND) { try { await rpc("demo_step", { a: { final: "final", closed: "close", new: "new" }[b.dataset.ph] }); await loadElection(); pick = null; } catch (e) { toast(errMsg(e)); } return draw(); }
      const c2 = civ(), e2 = E(c2, u.country), k = b.dataset.ph;
      if (k === "final") e2.finAt = Date.now() - 1000;
      if (k === "closed") { e2.finAt = Math.min(e2.finAt, Date.now() - 2000); e2.closeAt = Date.now() - 1000; }
      if (k === "new") { e2.history = [...(e2.history || []), { id: e2.id, result: e2.result }]; Object.assign(e2, { id: e2.id + 1, finAt: nextDow(3, 18, 0).getTime(), closeAt: nextDow(3, 23, 59).getTime(), finalists: null, votes: {}, result: null }); c2.cands[u.country].forEach((x) => (x.backers = [])); pick = null; }
      saveCiv(c2); draw();
    }));
  };
  draw();
}
function candSheet(u, c, race, done) {
  const sel = new Set(c ? c.topics : []); let dept = c && c.dept ? c.dept : null;
  const s = sheet("Bárki indulhat", c ? "Jelöltség szerkesztése" : race === "cabinet" ? "Indulok miniszternek" : race === "vp" ? "Indulok alelnöknek" : "Indulok elnöknek", `
    ${c && c.race !== race ? "" : ""}
    ${race === "cabinet" ? `<label class="fl">Melyik tárcát vezetnéd?</label><div class="chips wrapc" id="dp">${DEPTS.map((d) => `<button type="button" class="tchip sel ${dept === d[0] ? "on" : ""}" data-d="${d[0]}">${tIcon(d[2], 14)}${esc(d[1])}</button>`).join("")}</div>
      <label class="fl" for="rn">Nevezd át, ha te nyersz (nem kötelező)</label><input id="rn" maxlength="40" class="inp" placeholder="pl. Családügyi Minisztérium" value="${c ? esc(c.rename || "") : ""}"><small class="hint">A szavazók látják. Ha nyersz, a tárca a te nevedet viseli.</small>` : ""}
    <label class="fl" for="sl">A jelmondatod</label><input id="sl" maxlength="80" class="inp" placeholder="Egy ország, ami mindenkinek működik" value="${c ? esc(c.slogan) : ""}">
    <label class="fl">A témáid <span class="hint">(legfeljebb 3)</span></label><div class="chips wrapc" id="tp">${topicChips(sel, 3)}</div>
    <label class="fl" for="pl">Mit javasolsz, és miért támogassanak?</label><textarea id="pl" maxlength="280" rows="4" class="inp">${c ? esc(c.platform) : ""}</textarea>
    <div class="crow"><small class="hint">Saját szavaiddal, kérlek. Nem MI: a szavazók észreveszik.</small><small class="hint" id="pc">0/280</small></div><div class="err" id="fe" role="alert"></div>
    <button class="btn block ${u.country}" id="ok" disabled>${c ? "Mentés" : race === "cabinet" ? "Indulok miniszternek" : race === "vp" ? "Indulok alelnöknek" : "Indulok elnöknek"}</button>`);
  const chk = () => { const ok = $("#sl", s.el).value.trim().length >= 8 && sel.size > 0 && $("#pl", s.el).value.trim().length >= 20 && (race !== "cabinet" || dept); $("#ok", s.el).disabled = !ok; $("#pc", s.el).textContent = $("#pl", s.el).value.length + "/280"; };
  s.el.querySelectorAll("[data-tp]").forEach((b) => (b.onclick = () => { const t = b.dataset.tp; if (sel.has(t)) sel.delete(t); else if (sel.size < 3) sel.add(t); b.classList.toggle("on", sel.has(t)); chk(); }));
  s.el.querySelectorAll("#dp [data-d]").forEach((b) => (b.onclick = () => { dept = b.dataset.d; s.el.querySelectorAll("#dp [data-d]").forEach((x) => x.classList.toggle("on", x === b)); chk(); }));
  s.el.querySelectorAll("input,textarea").forEach((x) => (x.oninput = chk)); chk();
  $("#ok", s.el).onclick = async () => {
    const sl = $("#sl", s.el).value.trim(), pl = $("#pl", s.el).value.trim(), rn = race === "cabinet" ? $("#rn", s.el).value.trim() : "";
    if (/https?:|www\./i.test(sl + pl + rn)) return ($("#fe", s.el).textContent = "Link nem lehet a jelöltségben.");
    if (BACKEND) {
      try { await rpc("run_candidate", { r: race, d: dept || null, rn, sl, pl, tp: [...sel] }); await loadElection(); } catch (e) { return ($("#fe", s.el).textContent = errMsg(e)); }
      s.close(); toast(c ? "Jelöltség frissítve" : "Elindultál a választáson"); return done();
    }
    const cv = civ(), list = cv.cands[u.country];
    if (c) { const x = list.find((y) => y.nick === u.nick); Object.assign(x, { slogan: sl, platform: pl, topics: [...sel], dept: dept || x.dept, rename: rn, edited: true }); }
    else list.push({ id: "c" + Date.now(), nick: u.nick, race, dept: dept || null, rename: rn, slogan: sl, platform: pl, topics: [...sel], seed: 0, backers: [], no: 100 + (hash(u.nick) % 4900), edited: false, ts: Date.now() });
    saveCiv(cv); s.close(); toast(c ? "Jelöltség frissítve" : "Elindultál a választáson"); done();
  };
}

/* ---------- polgári ötletek (a Szavazás fül „Polgárok” része) ---------- */
function citizensView(u, box) {
  let sort = "top", topic = "all", openId = null;
  const draw = () => {
    const cv = civ(), all = cv.ideas[u.country];
    if (openId) return ideaDetail(u, cv, all.find((p) => p.id === openId), box, () => { openId = null; draw(); });
    const list = all.filter((p) => topic === "all" || p.topic === topic).sort(sort === "top" ? (a, b) => backs(b) - backs(a) : (a, b) => b.ts - a.ts);
    box.innerHTML = `<button class="btn block ${u.country}" id="pi">💡 Ötletet javaslok</button>
      <div class="seg sm"><button class="${sort === "top" ? "on" : ""}" data-s="top">🔥 Legtámogatottabb</button><button class="${sort === "new" ? "on" : ""}" data-s="new">⚡ Új</button></div>
      <div class="chips wrapc"><button class="tchip sel ${topic === "all" ? "on all" : ""}" data-f="all">Minden téma</button>${FORUM_TOPICS.map((t) => `<button class="tchip sel ${topic === t ? "on" : ""}" data-f="${esc(t)}">${tIcon(t, 14)}${esc(t)}</button>`).join("")}</div>
      <p class="hint" style="font-size:13px">A legtámogatottabb ötletek szavazásra kerülnek.</p>
      ${list.map((p) => `<div class="idea"><button class="upb ${p.backers.includes(u.email) ? "on" : ""}" data-pb="${p.id}" aria-pressed="${p.backers.includes(u.email)}">${upArrow}<b>${backs(p) >= 1000 ? (backs(p) / 1000).toFixed(1) + "k" : backs(p)}</b></button>
        <div class="ibody" data-open="${p.id}">${tChip(p.topic)}<h4>${esc(p.title)}</h4>${p.why ? `<p class="hint">${esc(p.why)}</p>` : ""}<span class="tchip">💬 ${p.aseed + p.answers.length} válasz</span><div class="hint" style="font-size:12px">${esc(p.nick)} · ${ago2(p.ts)}</div></div></div>`).join("") || '<p class="hint">Még nincs ötlet ebben a témában.</p>'}`;
    box.querySelectorAll("[data-s]").forEach((b) => (b.onclick = () => { sort = b.dataset.s; draw(); }));
    box.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => { topic = b.dataset.f; draw(); }));
    box.querySelectorAll("[data-pb]").forEach((b) => (b.onclick = async () => {
      const p = all.find((x) => x.id === b.dataset.pb); if (!p) return;
      if (BACKEND) { try { await rpc("toggle_idea_back", { iid: p.id }); await loadIdeas(); } catch (e) { toast(errMsg(e)); } return draw(); }
      const i = p.backers.indexOf(u.email); i < 0 ? p.backers.push(u.email) : p.backers.splice(i, 1); saveCiv(cv); draw();
    }));
    box.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => { openId = b.dataset.open; draw(); }));
    $("#pi", box).onclick = () => {
      const day = Date.now() - 864e5, used = all.filter((p) => p.nick === u.nick && p.ts > day).length;
      let tp = null;
      const s = sheet("Naponta egy", "Az ötleted", `<label class="fl">Téma</label><div class="tilegrid">${FORUM_TOPICS.slice(1).map((t) => `<button type="button" class="ttile" data-ti="${esc(t)}">${tIcon(t, 24)}<span>${esc(t)}</span></button>`).join("")}</div>
        <label class="fl" for="it">Az ötleted</label><input id="it" class="inp" maxlength="100" placeholder="Ingyenes iskolai étkezés minden gyereknek"><label class="fl" for="iw">Miért? <span class="hint">(nem kötelező)</span></label><textarea id="iw" class="inp" rows="4" maxlength="1000"></textarea><small class="hint" id="ic">0 / 1000</small><div class="err" id="ie" role="alert"></div><button class="btn block ${u.country}" id="ip" disabled>Elküldöm</button>`);
      const chk = () => { $("#ip", s.el).disabled = !(tp && $("#it", s.el).value.trim().length >= 10); $("#ic", s.el).textContent = $("#iw", s.el).value.length + " / 1000"; };
      s.el.querySelectorAll("[data-ti]").forEach((b) => (b.onclick = () => { tp = b.dataset.ti; s.el.querySelectorAll("[data-ti]").forEach((x) => x.classList.toggle("on", x === b)); chk(); }));
      s.el.querySelectorAll("input,textarea").forEach((x) => (x.oninput = chk));
      $("#ip", s.el).onclick = async () => {
        const t = $("#it", s.el).value.trim(), w = $("#iw", s.el).value.trim();
        if (BACKEND) {
          try { await rpc("propose_idea", { tp, t, w }); await loadIdeas(); } catch (e) { return ($("#ie", s.el).textContent = /daily_limit/.test(e.message) ? "Ma már beküldtél egy ötletet." : /duplicate/.test(e.message) ? "Ez az ötlet már szerepel." : errMsg(e)); }
          s.close(); toast("Ötlet beküldve"); return draw();
        }
        const err = used >= 1 ? "Ma már beküldtél egy ötletet." : /https?:|www\./i.test(t + w) ? "Link nem lehet az ötletben." : all.some((p) => p.title.toLowerCase() === t.toLowerCase()) ? "Ez az ötlet már szerepel." : "";
        if (err) return ($("#ie", s.el).textContent = err);
        all.push({ id: "i" + Date.now(), nick: u.nick, topic: tp, title: t, why: w, seed: 0, backers: [u.email], answers: [], aseed: 0, ts: Date.now() }); saveCiv(cv); s.close(); toast("Ötlet beküldve"); draw();
      };
    };
  };
  draw();
}
function ideaDetail(u, cv, p, box, back) {
  if (BACKEND && !p.__loaded) {
    box.innerHTML = '<p class="hint" style="padding:24px;text-align:center">Betöltés…</p>';
    rpc("get_idea_answers", { iid: p.id }).then((rows) => { p.answers = rows.map((r) => ({ nick: r.nick, text: r.text, ts: r.at })); p.aseed = 0; p.__loaded = 1; ideaDetail(u, cv, p, box, back); }).catch((e) => { toast(errMsg(e)); back(); });
    return;
  }
  box.innerHTML = `<button class="btn ghost sm" id="bk">‹ Vissza</button><div class="card" style="margin-top:10px">${tChip(p.topic)}<h3 style="margin:8px 0">${esc(p.title)}</h3><p>${esc(p.why || "")}</p><div class="hint">${esc(p.nick)} · ${ago2(p.ts)} · <b>${backs(p)}</b> támogató</div></div>
    <h4 style="margin:14px 0 6px">${p.aseed + p.answers.length} válasz</h4>
    ${p.answers.map((a) => `<div class="msg ${SIDES[u.country].cls}"><div class="mh">${avatar(a.nick, 20)}<b>${esc(a.nick)}</b><span class="hint">${ago2(a.ts)}</span></div><p>${esc(a.text)}</p></div>`).join("") || '<p class="hint">Légy te az első, aki válaszol.</p>'}
    <form id="af" class="compose card"><textarea id="at" rows="2" maxlength="280" placeholder="Válaszod…"></textarea><div class="crow"><div class="err" id="ae" role="alert"></div><button class="btn ${u.country} sm" type="submit">Küldés</button></div></form>`;
  $("#bk", box).onclick = back;
  $("#af", box).onsubmit = async (e) => {
    e.preventDefault(); const t = $("#at", box).value.trim(); if (t.length < 3) return;
    if (BACKEND) {
      try { await rpc("answer_idea", { iid: p.id, txt: t }); } catch (err) { return ($("#ae", box).textContent = errMsg(err)); }
      p.__loaded = 0; return ideaDetail(u, cv, p, box, back);
    }
    if (/https?:|www\./i.test(t)) return ($("#ae", box).textContent = "Link nem küldhető."); const last = p.answers.filter((a) => a.nick === u.nick).slice(-1)[0]; if (last && Date.now() - last.ts < 15000) return ($("#ae", box).textContent = "Várj egy kicsit."); p.answers.push({ nick: u.nick, text: t, ts: Date.now() }); saveCiv(cv); ideaDetail(u, cv, p, box, back); };
}
