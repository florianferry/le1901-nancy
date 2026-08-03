#!/usr/bin/env python3
"""Vérificateur déterministe du wiki. Doit afficher OK avant de clore un lot.

Usage :
    python3 wiki/lint.py                      rapport complet
    python3 wiki/lint.py --contradictions     nombre de contradictions ouvertes
    python3 wiki/lint.py --quiet              silencieux sauf erreurs

Sort en code 1 s’il reste une erreur. Les avertissements ne bloquent pas.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

WIKI = Path(__file__).resolve().parent
REPO = WIKI.parent

ENTRY_FILES = {"index.md", "log.md", "contradictions.md", "gaps.md", "CONVENTIONS.md"}
VALID_TYPES = {"decision", "concept", "flow", "reference", "source"}
VALID_STATUS = {"active", "stale"}
REQUIRED_KEYS = ("title", "type", "status", "sources", "created", "updated")

SOFT_LINES = 400
HARD_LINES = 800

WIKILINK = re.compile(r"\[\[([^\]|#]+)")
FENCE = re.compile(r"```.*?```", re.S)
INLINE_CODE = re.compile(r"`[^`\n]+`")


def sans_code(text: str) -> str:
    """Le texte débarrassé de ses blocs de code et de son code inline.

    Un dépôt peut avoir sa propre syntaxe en doubles crochets, comme les jetons
    `[[page:slug|libellé]]` du générateur i18n du 1901. Citée entre accents graves, elle
    documente le code ; comptée comme wikilink, elle produit un lien cassé que rien ne peut
    résoudre. Le lint ne regarde donc que la prose."""
    return INLINE_CODE.sub(" ", FENCE.sub(" ", text))
H1 = re.compile(r"^# +(.+)$", re.MULTILINE)


def parse_frontmatter(text: str) -> dict | None:
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---", 4)
    if end == -1:
        return None
    block, data, current = text[4:end], {}, None
    for line in block.splitlines():
        if not line.strip():
            continue
        if line.startswith("  - ") and current:
            data.setdefault(current, []).append(line[4:].strip())
        elif ":" in line and not line.startswith(" "):
            key, _, value = line.partition(":")
            key, value = key.strip(), value.strip()
            current = key
            if value:
                if value.startswith("[") and value.endswith("]"):
                    inner = value[1:-1].strip()
                    data[key] = [v.strip() for v in inner.split(",") if v.strip()]
                else:
                    data[key] = value
            else:
                data[key] = []
    return data


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--contradictions", action="store_true")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    contradictions_file = WIKI / "contradictions.md"
    open_count = 0
    if contradictions_file.exists():
        for line in contradictions_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("### ") and "[résolu]" not in line.lower():
                open_count += 1

    if args.contradictions:
        print(open_count)
        return 0

    pages = sorted(p for p in WIKI.rglob("*.md") if p.name not in ENTRY_FILES)
    errors: list[str] = []
    warnings: list[str] = []

    slugs: dict[str, Path] = {}
    inbound: dict[str, int] = {}
    all_slugs = {p.stem for p in pages}

    for path in pages:
        rel = path.relative_to(REPO)
        text = path.read_text(encoding="utf-8")
        slug = path.stem

        if slug in slugs:
            errors.append(f"slug dupliqué « {slug} » : {rel} et {slugs[slug].relative_to(REPO)}")
        slugs[slug] = path

        fm = parse_frontmatter(text)
        if fm is None:
            errors.append(f"{rel} : frontmatter absent ou mal fermé")
            continue

        for key in REQUIRED_KEYS:
            if key not in fm:
                errors.append(f"{rel} : clé de frontmatter manquante « {key} »")
        if fm.get("type") not in VALID_TYPES:
            errors.append(f"{rel} : type invalide « {fm.get('type')} »")
        if fm.get("status") not in VALID_STATUS:
            errors.append(f"{rel} : status invalide « {fm.get('status')} »")

        srcs = fm.get("sources") or []
        if not srcs:
            errors.append(f"{rel} : sources vide, toute page doit s’ancrer quelque part")
        for src in srcs:
            if src.startswith("[["):
                errors.append(f"{rel} : wikilink interdit dans le frontmatter ({src})")
            elif not (REPO / src).exists():
                warnings.append(f"{rel} : source introuvable au dépôt « {src} »")

        titles = H1.findall(text)
        if len(titles) != 1:
            errors.append(f"{rel} : {len(titles)} titres H1, il en faut exactement un")
        elif fm.get("title") and titles[0].strip() != str(fm["title"]).strip():
            warnings.append(f"{rel} : le H1 diffère du title du frontmatter")

        if "## Sources" not in text:
            errors.append(f"{rel} : section « ## Sources » absente")

        n_lines = len(text.splitlines())
        if n_lines > HARD_LINES:
            errors.append(f"{rel} : {n_lines} lignes, au-delà du plafond dur de {HARD_LINES}")
        elif n_lines > SOFT_LINES:
            warnings.append(f"{rel} : {n_lines} lignes, à scinder bientôt ({SOFT_LINES} visé)")

        for target in WIKILINK.findall(sans_code(text)):
            target = target.strip()
            if target not in all_slugs and target not in {f.removesuffix('.md') for f in ENTRY_FILES}:
                errors.append(f"{rel} : lien cassé vers [[{target}]]")
            else:
                inbound[target] = inbound.get(target, 0) + 1

    index_text = (WIKI / "index.md").read_text(encoding="utf-8") if (WIKI / "index.md").exists() else ""
    for target in WIKILINK.findall(sans_code(index_text)):
        t = target.strip()
        inbound[t] = inbound.get(t, 0) + 1

    for path in pages:
        if inbound.get(path.stem, 0) == 0:
            errors.append(f"{path.relative_to(REPO)} : page orpheline, aucun lien entrant")

    if not args.quiet:
        print(f"{len(pages)} pages, {open_count} contradiction(s) ouverte(s)")
        for w in warnings:
            print(f"  avertissement  {w}")
    for e in errors:
        print(f"  ERREUR         {e}")

    if errors:
        print(f"ÉCHEC : {len(errors)} erreur(s)")
        return 1
    if not args.quiet:
        print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
