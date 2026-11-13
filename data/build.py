#!/usr/bin/env python3
"""data/catalog-*.json -> data/catalog.js (window.CATALOG). Validálja a sémát és statisztikát ír."""
import glob, json, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
KP = ["gdp", "infl", "wage", "housing", "health", "deficit"]
items, errs, seen, DOM = [], [], set(), []
def load(pat):
    out = []
    for f in sorted(glob.glob(pat)):
        try: out.append((f, json.load(open(f, encoding="utf-8"))))
        except Exception as e: errs.append(f"{f}: érvénytelen JSON ({e})")
    return out
for f in sorted(glob.glob("catalog-*.json")):
    try: d = json.load(open(f, encoding="utf-8"))
    except Exception as e: errs.append(f"{f}: érvénytelen JSON ({e})"); continue
    for q in d:
        i = q.get("id", "?")
        if i in seen: errs.append(f"{f}: dupla id {i}"); continue
        seen.add(i)
        if len(q.get("options", [])) != 3: errs.append(f"{i}: nem 3 opció"); continue
        bad = [o.get("label") for o in q["options"] if set(o.get("effects", {})) != set(KP) or any(not isinstance(v, int) or abs(v) > 3 for v in o["effects"].values())]
        if bad: errs.append(f"{i}: hibás effects {bad}"); continue
        for e in q.get("evidence", []):
            if e.get("verdict") not in ("jo", "vegyes", "rossz"): errs.append(f"{i}: rossz verdict {e.get('verdict')}")
            if not str(e.get("source", "")).startswith("http"): errs.append(f"{i}: precedens forrás nélkül ({e.get('where')})")
        if not q.get("evidence"): errs.append(f"{i}: nincs precedens")
        items.append(q)
byid = {q["id"]: q for q in items}
for f, d in load("effects-*.json"):          # {id: [eff0, eff1, eff2]}
    for i, effs in d.items():
        if i not in byid: errs.append(f"{f}: ismeretlen id {i}"); continue
        for o, e in zip(byid[i]["options"], effs): o["effects"] = e
for f, d in load("patch-*.json"):            # [{id, add_evidence:[...], remove_where:[...], set_confidence:{where:conf}}]
    for p in d:
        q = byid.get(p["id"])
        if not q: errs.append(f"{f}: ismeretlen id {p['id']}"); continue
        q["evidence"] = [e for e in q["evidence"] if e["where"] not in p.get("remove_where", [])]
        for e in q["evidence"]:
            if e["where"] in p.get("set_confidence", {}): e["confidence"] = p["set_confidence"][e["where"]]
        q["evidence"] += p.get("add_evidence", [])
        if p.get("context"): q["context"].update(p["context"])
VER = {}
for f, d in load("verify-[0-9]*.json"):
    for r in d: VER[r["key"]] = r
for q in items:
    for e in q["evidence"]:
        r = VER.get(q["id"] + "|" + e["where"] + "|" + e["source"])
        if r:
            e["check"] = r["status"]
            if r["status"] in ("partly", "contradicted") and r.get("note"): e["why"] = (e.get("why", "") + " Ellenőrzés: " + r["note"]).strip()
            if r["status"] in ("partly", "not_found"): e["confidence"] = "medium" if r["status"] == "partly" else "low"
            if r["status"] == "contradicted":
                e["confidence"] = "low"
                if r.get("correct"): e["numbers"] = r["correct"] + " (javítva ellenőrzés után)"
            if r["status"] == "partly" and r.get("correct"): e["numbers"] = r["correct"] + " (pontosítva ellenőrzés után)"
for q in items:
    for e in q["evidence"]:
        if e.get("verdict") not in ("jo", "vegyes", "rossz"): errs.append(f"{q['id']}: rossz verdict {e.get('verdict')}")
        if not str(e.get("source", "")).startswith("http"): errs.append(f"{q['id']}: precedens forrás nélkül ({e.get('where')})")
    KPI = [[o["effects"][k] for k in KP] for o in q["options"]]
    for i, a in enumerate(KPI):
        for j, b in enumerate(KPI):
            if i != j and a != b and all(x >= y for x, y in zip(a, b)): DOM.append(q["id"]); break
open("catalog.js", "w", encoding="utf-8").write("window.CATALOG = " + json.dumps(items, ensure_ascii=False) + ";\n")
topics = {}
for q in items: topics[q["topic"]] = topics.get(q["topic"], 0) + 1
ev = [e for q in items for e in q.get("evidence", [])]
print(f"{len(items)} kérdés, {len(topics)} témakör, {len(ev)} precedens (low confidence: {sum(e.get('confidence')=='low' for e in ev)})")
for t, n in topics.items(): print(f"  {t}: {n}")
print(f"dominált opciót tartalmazó kérdés: {len(set(DOM))}")
for e in errs: print("HIBA:", e)
sys.exit(1 if errs else 0)
