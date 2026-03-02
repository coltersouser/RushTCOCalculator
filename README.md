# Rush Alternative Fuel ROI Calculator — React Scaffold

This project is a **React + TypeScript + Tailwind + Recharts** scaffold with:
- Rush theme colors (Gold/Black/Red)
- Hybrid Sales ↔ Engineer mode
- Schema-driven inputs (Sales hides advanced fields)
- Results dashboard + chart (placeholder math)
- Scenario Save/Load (localStorage)
- PDF export via browser Print-to-PDF (offline)

## Run locally
1) Install Node.js (LTS)
2) In this folder:

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

## Next step
The math engine in `src/engine/calc.ts` is placeholder.
We will port your Excel calculation logic into dedicated engine modules next.
