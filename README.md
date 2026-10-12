# Sri Properties — Farmland & Property Website

A static, animated website. Open with any static server (no build step).

## Run locally
```bash
python -m http.server 5500 --directory website
```
Then visit http://localhost:5500

## Folder layout
```
website/
├─ index.html          all sections & markup
├─ css/style.css       design system + responsive styles
├─ js/data.js          ← PROPERTY LISTINGS (edit here)
├─ js/main.js          animations, filters, drawer, planner, forms
└─ assets/img, video   HD photos + drone clips
```

## Common edits
| What | Where |
|---|---|
| Add / edit a listing | `js/data.js` — copy one object in `PROPERTIES` and change it. Grid, filters, drawer and booking form update automatically. |
| Currency (e.g. INR) | `js/data.js` → `SITE_CONFIG` → `currency: "INR", locale: "en-IN"` (also update the hero budget dropdown + planner ranges in `index.html`) |
| Brand name | Search & replace `Sri` / `Properties` in `index.html` |
| Phone, email, address | `#contact` section and mobile menu in `index.html` |
| Colours / fonts | CSS variables at the top of `css/style.css` |
| Booking form backend | `js/main.js` → search for `Connect your backend` |

## Before going live
- Replace sample testimonials (marked `SAMPLE CONTENT`) with real, permission-granted ones.
- Replace placeholder stats, contact details and listing data with real figures.
- Hook the booking + newsletter forms to your email/CRM.

Libraries (CDN): GSAP 3 + ScrollTrigger, Lenis smooth scroll, Google Fonts (Fraunces, Manrope).
