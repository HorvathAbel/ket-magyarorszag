# Katalógus-írási útmutató (ágenseknek)

Cél: a "Két Magyarország" játékhoz (Tisza-ország vs Fidesz-ország, a játékosok heti szavazásokon hoznak általános közpolitikai döntéseket) kérdéskatalógust írunk. Minden kérdéshez kell: magyar kontextus, 3 kiegyensúlyozott opció, és 2-3 NEMZETKÖZI vagy hazai történelmi PRECEDENS számokkal, jó/vegyes/rossz értékeléssel.

## Valós háttér (ellenőrzött, kiindulásnak)
- 2026. ápr. 12-i választás: Tisza 141 mandátum (53,18% lista), Fidesz–KDNP 52 (38,61%), Mi Hazánk 6; részvétel 79,56%. Tisza-kormány 2026 májusában alakult (Magyar Péter miniszterelnök).
- Tisza-kormány eddig (forrásokkal keresd meg a pontos státuszt, ne feltételezd): költségvetés-felülvizsgálat, uniós források (16,4 Mrd €) visszaszerzése, Európai Ügyészséghez csatlakozás, Nemzeti Vagyonvisszaszerzési Hivatal, 100 000 Ft iskolakezdési támogatás (2026 aug.), 2027-es költségvetés (Költségvetési Tanács nem talált kivetnivalót), tervek: családi pótlék emelés (2008 óta nem változott), minimálbér adójának csökkentése, anyák szja-mentessége egymilliós jövedelemig, vényköteles gyógyszerek áfájának eltörlése, 5% áfa egészséges élelmiszerre, 1 Mrd Ft feletti vagyonra vagyonadó (terv/program!), +500 Mrd Ft/év egészségügy, hiány 3% alá.
- Fidesz-kormányok 2010–2026: 16%-os egykulcsos szja (2011), 15% (2016), 9% tao (2017), 27% áfa (EU-csúcs), rezsicsökkentés (2013), magánnyugdíj-pénztárak államosítása (2010-11), válságadók/bankadó, CSOK (2015) és Otthon Start (2025), családi adókedvezmény, anyák szja-mentessége, 25 év alattiak szja-mentessége, árrésstop (2022), infláció csúcsa 25,7% (2023 jan.), 2025: stagnáló GDP (~0,5%), hiány kb. 4,7% GDP, adósság kb. 74,6% GDP.
Minden kontextus-állításhoz keress forrást. Ha egy Tisza-intézkedés csak program/bejelentés, a státusz legyen "terv" vagy "bejelentve", NE "elfogadva".

## SZIGORÚ szabályok (a hitelesség a projekt lényege)
1. Számot CSAK akkor írj, ha forrásban megtaláltad (WebSearch/WebFetch). Ha nem találsz számot, írd: "számszerű adat nem áll rendelkezésre" és confidence: "low". Soha ne találj ki számot, tanulmányt vagy URL-t.
2. Minden precedenshez kötelező egy működő forrás URL (OECD, Eurostat, KSH, MNB, IMF, Világbank, NBER, Kela, tudományos cikk, elismert sajtó).
3. Értékelés (verdict): "jo" | "vegyes" | "rossz" – az adott intézkedés MÉRHETŐ céljához képest (pl. foglalkoztatás, infláció, bevétel), nem politikai szimpátia alapján. Indokold egy mondatban, mit mértek.
4. Kiegyensúlyozottság: minden kérdésben legyen legalább egy "jo/vegyes" és egy "rossz/vegyes" precedens, ha ilyen létezik. Mindhárom opciónak legyen valódi előnye ÉS ára. Semleges, nem uszító megfogalmazás. Egyik opciót se címkézd pártprogramnak.
5. Kontextusban csak tényeket írj (mit tett a Fidesz-kormány / a Tisza-kormány), értékelés nélkül, forrásokkal.
6. Magyar nyelv, tömören. Opciónként pro/con max 1-1 mondat. Kérdés max 110 karakter.
7. A hatásvektor ("effects") egész szám -3..+3, a hat mutatóra, ahol + = a mutató javul: gdp (növekedés), infl (alacsonyabb infláció), wage (reálbér), housing (lakhatás megfizethetősége), health (egészségügyi ellátás), deficit (alacsonyabb hiány). Szerkesztői becslés a precedensek alapján; a 0 gyakori. A három opció hatásai különbözzenek érdemben, és egyik se legyen mindenben jobb a többinél.

## JSON séma (tömb, kérdésenként egy objektum)
{
 "id": "tema-kulcs-01",              // egyedi, ASCII, kisbetű, kötőjel
 "topic": "Személyi jövedelemadó",   // témakör neve (magyarul)
 "q": "Mi legyen a személyi jövedelemadó szerkezete?",
 "context": {
   "fidesz": "Tény a 2010–2026 közötti Fidesz-kormányokról, forrással összhangban.",
   "tisza": "Tény/terv a Tisza-kormányról. Kezdd a státusszal: [elfogadva] vagy [terv] vagy [bejelentve].",
   "sources": ["https://..."]
 },
 "options": [
   {"label":"...", "pro":"...", "con":"...", "effects":{"gdp":0,"infl":0,"wage":0,"housing":0,"health":0,"deficit":0}},
   {...}, {...}
 ],
 "evidence": [
   {"where":"Észtország","when":"1994–","what":"Mit vezettek be (1 mondat)","numbers":"Konkrét mért adat (pl. 'foglalkoztatás +x%')","verdict":"jo|vegyes|rossz","why":"mit mértek, 1 mondat","source":"https://...","confidence":"high|medium|low"}
 ]
}

## Kimenet
Írd az eredményt egyetlen érvényes JSON-fájlba (UTF-8, csak a tömb). Ellenőrizd: python3 -c "import json,sys;d=json.load(open(sys.argv[1]));print(len(d))" FÁJL
Ne módosíts más fájlt. Végén jelentsd: hány kérdés készült, melyek confidence-e "low", és hol nem találtál megbízható számot.
