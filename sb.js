/* Backend (Supabase): belépés, profil, szavazás. Ha a config.js üres, minden a régi demó módban marad. */
const CFG = window.KM_CFG || {};
const BACKEND = !!(CFG.url && CFG.key && window.supabase);
const LINK_MODE = BACKEND && CFG.mode !== "code";
const cameByLink = /access_token=|error_code=/.test(location.hash);
const linkError = /error_code=otp_expired|error_description=/.test(location.hash);
const sb = BACKEND ? window.supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
const rpc = async (fn, args) => { const { data, error } = await sb.rpc(fn, args || {}); if (error) throw error; return data; };

const ERRS = {
  "nick:format": "3–20 karakter: betű, szám vagy alsóvonás.", "nick:blocked": "Valódi politikus vagy párt neve nem lehet felhasználónév.", "nick:taken": "Ez a felhasználónév foglalt.",
  bio_link: "Link nem lehet a bemutatkozásban.", no_country: "Előbb válassz országot.", country_locked: "Az országválasztás végleges.", week_closed: "Most nincs nyitva szavazás. Szerdánként 18:00 és 23:59 között szavazhatsz.", election_week: "Ezen a héten a kormányról szavazunk, a Politika fülön.", not_on_ballot: "Ez a kérdés most nincs a szavazólapon.",
  already_voted: "Erre már szavaztál.", election_closed: "A választás lezárult.", race_locked: "Ez a verseny már lezárult.", self_back: "Magadat nem támogathatod.",
  no_candidate: "Ez a jelölt már nem elérhető.", not_final: "Most nincs döntő.", not_finalist: "Csak döntős jelöltre szavazhatsz.",
  daily_limit: "Ma már elhasználtad a 3 parlamenti felszólalásodat.", too_fast: "Lassabban: várj egy kicsit a következő üzenet előtt.", too_long: "Túl hosszú üzenet.",
  no_links: "A Parlamentben nem lehet link.", caps: "Ne csupa nagybetűvel írj.", duplicate: "Ezt már elküldted.", empty: "Üres üzenet.", topic_stance: "Válassz témát és álláspontot.", no_user: "Nincs ilyen polgár az országodban.", blocked: "Ezzel a felhasználóval nem tudsz csevegni.", bad_reply: "Erre az üzenetre már nem lehet válaszolni.", channel: "Ez a csatorna nem érhető el.", forbidden: "Ehhez nincs jogosultságod.",
  over_email_send_rate_limit: "Túl sok kódot kértél. Várj egy kicsit, és próbáld újra.", "rate limit": "Túl sok próbálkozás. Várj egy kicsit.",
  otp_disabled: "Ehhez az e-mailhez nincs fiók.", "Signups not allowed": "Ehhez az e-mailhez nincs fiók.", otp_expired: "Hibás vagy lejárt kód.", "invalid": "Hibás vagy lejárt kód.",
};
const errMsg = (e) => { const m = `${(e && (e.code || "")) || ""} ${(e && (e.message || e.error_description)) || ""}`; const k = Object.keys(ERRS).find((k) => m.includes(k)); return k ? ERRS[k] : "Hiba történt. Próbáld újra."; };

async function sendCode(p) {
  const base = { emailRedirectTo: location.origin + location.pathname };
  const options = p.mode === "reg" ? { ...base, shouldCreateUser: true, data: { nick: p.data.nick, county: p.data.county, consent: true, notify: !!p.data.notify } } : { ...base, shouldCreateUser: false };
  const { error } = await sb.auth.signInWithOtp({ email: p.email, options });
  if (error) throw error;
}
async function verifyCode(email, token) {
  const { error } = await sb.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw error;
  return refreshMe();
}

/* a szerver az igazság forrása; a helyi fiókobjektum csak gyorsítótár a szinkron felülethez */
async function refreshMe() {
  const [me, vs, adm] = await Promise.all([rpc("me"), rpc("my_votes"), rpc("is_admin").catch(() => false)]);
  const votes = {}; vs.forEach((x) => { (votes["w" + x.week] = votes["w" + x.week] || {})[x.m] = x.o; });
  const old = accounts()[me.email] || {};
  const u = { ...old, email: me.email, nick: me.nick, county: me.county, country: me.country, bio: me.bio, joined: me.joined, demo: me.demo, notify: !!me.notify, admin: !!adm, votes, blocked: old.blocked || [], seen: old.seen || {} };
  window.__round = me.round || null;
  saveAccount(u); store.set("km_session", me.email);
  return u;
}
async function bootBackend() {
  for (let i = 0; i < 3; i++) {
    try {
      const { data, error } = await sb.auth.getSession();
      if (error) throw error;
      if (!data.session) { store.del("km_session"); break; }
      const u = await refreshMe();
      if (cameByLink) location.hash = u.country ? "#/app" : "#/orszag";
      break;
    } catch (e) {
      console.warn("boot", i, e && (e.message || e));
      if (i < 2) await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  if (linkError && !session()) setTimeout(() => toast("A belépő link lejárt vagy már felhasználták. Kérj újat."), 300);
  /* másik lapon megnyitott link: a várakozó lap is belép */
  sb.auth.onAuthStateChange((ev, sess) => {
    if (ev === "SIGNED_IN" && sess && location.hash.startsWith("#/kod")) {
      setTimeout(async () => { try { const u = await refreshMe(); location.hash = u.country ? "#/app" : "#/orszag"; } catch {} }, 0);
    }
  });
}
/* kilépéskor a helyi gyorsítótár is törlődik, hogy közös gépen ne maradjon meg a felhasználó adata */
const wipeLocal = () => ["km_session", "km_accounts", "km_civ_b", "km_forum3"].forEach((k) => store.del(k));
async function backendLogout() { try { await sb.auth.signOut(); } catch {} wipeLocal(); }

/* a szerver választási állapota -> a felület által használt (szinkron) civ() szerkezet */
const mapResult = (r, at) => (r ? { president: r.president, vp: r.vp, cabinet: r.cabinet || {}, tally: (r.tally || []).map((t) => [t.nick, t.votes]), at } : null);
async function loadAnnouncements() {
  const u = session(); if (!u || !u.country) return;
  window.__ann = await rpc("get_announcements");
}
async function loadIdeas() {
  const u = session(); if (!u || !u.country) return;
  const rows = await rpc("get_ideas"), cv = civ();
  cv.ideas[u.country] = rows.map((r) => ({ id: r.id, nick: r.nick, topic: r.topic, title: r.title, why: r.why, seed: r.backs - (r.backed ? 1 : 0), backers: r.backed ? [u.email] : [], answers: [], aseed: r.answers, ts: r.at }));
  saveCiv(cv);
}
async function loadElection() {
  const u = session(); if (!u || !u.country) return;
  const [el, cs, used] = await Promise.all([rpc("get_election"), rpc("get_candidates"), rpc("parl_used"), loadIdeas().catch(() => {}), loadAnnouncements().catch(() => {})]);
  window.__postedToday = used > 0;
  const cv = civ(), side = u.country;
  cv.cands[side] = cs.map((c) => ({ id: c.id, nick: c.nick, race: c.race, dept: c.dept, rename: c.rename || "", slogan: c.slogan, platform: c.platform, topics: c.topics,
    seed: c.backs - (c.backed ? 1 : 0), backers: c.backed ? [u.email] : [], no: 100 + (hash(c.id) % 4900), edited: false, ts: c.at }));
  cv.elec = cv.elec || {}; cv.gov = cv.gov || {};
  const hist = el.history.map((h) => ({ id: h.no, result: mapResult(h.result, h.close_at) }));
  const res = mapResult(el.result, el.close_at);
  cv.elec[side] = { id: el.no, srv: el.phase, finAt: el.final_at, closeAt: el.close_at, finalists: el.phase === "open" ? null : el.finalists.map((f) => f.id), votes: el.my_final ? { [u.email]: "x" } : {}, result: res, history: hist };
  cv.gov[side] = res || (hist.length ? hist[hist.length - 1].result : null);
  saveCiv(cv);
}
