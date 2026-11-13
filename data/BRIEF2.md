# 2. kör: javítások (ágenseknek)
Olvasd el a BRIEF.md-t (séma, szigorú szabályok). Ez a 2. kör: a már megírt katalógus (catalog-A/B/C/D.json) hiányait pótoljuk. NE módosítsd a catalog-*.json fájlokat. Az eredményt a lent megadott KÜLÖN fájlokba írd, a build.py (python3 data/build.py) fésüli össze.

## Formátumok
- effects-XX.json: {"kerdes-id": [ {gdp,infl,wage,housing,health,deficit}, {..}, {..} ]}  (az opciók eredeti sorrendjében, egész -3..3, + = javul)
- patch-XX.json: [ {"id":"kerdes-id", "add_evidence":[ {séma szerinti precedens} ], "remove_where":["Ország/név ahogy a meglévő 'where' mezőben"], "set_confidence":{"where": "low|medium|high"}, "context":{"tisza":"frissített szöveg","fidesz":"..."} } ]  (minden kulcs opcionális)
- catalog-E-XX.json: új kérdések a BRIEF.md sémája szerint.
Ellenőrzés: python3 /Users/abelhorvath/Desktop/ket-magyarorszag/data/build.py (hibát és "dominált opciót tartalmazó kérdés" számot ír).
