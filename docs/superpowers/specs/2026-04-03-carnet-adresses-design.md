# Le Carnet d'Adresses — Enriched Guide

## Context
The current "Le Carnet d'Adresses" section has 3 recommendation cards in a flat grid. We're expanding to 8-10 cards organized by tabbed categories, with an Art Nouveau / École de Nancy theme matching the property's identity.

## Architecture

### Tab System
4 horizontal tabs replacing the current flat grid:

| Tab | Icon | Cards |
|-----|------|-------|
| Gastronomie | `ph-fork-knife` | Macarons des Sœurs Macarons, La Bolée, La Maison dans le Parc |
| Art Nouveau & Culture | `ph-buildings` | Musée de l'École de Nancy, Villa Majorelle, Place Stanislas |
| Promenades | `ph-map-trifold` | Parc de la Pépinière, Vieille Ville & Grande Rue |
| Shopping & Artisanat | `ph-storefront` | Daum (cristallerie), Marché Central |

### Tab Behavior
- Horizontal tab bar styled with gold underline for active tab
- First tab (Gastronomie) active by default
- Smooth fade transition on tab switch (CSS only, no library)
- Mobile: tabs scroll horizontally with `overflow-x: auto`
- Cards retain existing design: icon, title, short description, Google Maps CTA link

### Card Content (10 cards)

**Gastronomie (3 cards — existing, kept)**
1. Macarons des Sœurs Macarons — secret recipe pastry
2. La Bolée — authentic quiche lorraine
3. La Maison dans le Parc — gastronomic fine dining

**Art Nouveau & Culture (3 cards — new)**
4. Musée de l'École de Nancy — decorative arts museum, Art Nouveau collection
5. Villa Majorelle — first Art Nouveau house in Nancy, by Henri Sauvage
6. Place Stanislas — UNESCO World Heritage, 18th-century square

**Promenades (2 cards — new)**
7. Parc de la Pépinière — 21-hectare park in city center
8. Vieille Ville & Grande Rue — historic old town walking route

**Shopping & Artisanat (2 cards — new)**
9. Daum — crystal artisans since 1878, Art Nouveau heritage
10. Marché Central — covered market, local producers

### i18n
All new content translated in 4 languages (FR/EN/ES/DE) via the existing `translations` object and `data-i18n` / `data-i18n-html` attributes. Tab labels also translated.

### Files Modified
- `index.html` — HTML structure (tabs + cards) and JS tab switching logic, i18n translations object

## Verification
- Open in browser, click each tab — correct cards appear
- Click each Google Maps link — opens in new tab
- Switch language — tab labels and card content translate
- Mobile viewport — tabs scroll horizontally, cards stack vertically
