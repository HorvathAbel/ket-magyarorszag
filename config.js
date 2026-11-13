/* Backend-beállítás. Üresen hagyva a prototípus a régi demó módban fut (localStorage, kód: 123456).
   A publishable kulcs nyilvános, a védelmet az RLS és a jogosultságok adják (supabase/001_schema.sql). */
window.KM_CFG = {
  url: "https://pvaaqmshynhrrqqjathz.supabase.co",
  key: "sb_publishable_s1x9_IBkBgVOi-1gF7o5GA_HaGn-wcl",
  // "link": a levélben megerősítő link van (alapértelmezett Supabase levelezővel); "code": 6 jegyű kód (saját SMTP + {{ .Token }} sablon kell hozzá)
  mode: "code",
};
