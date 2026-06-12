# Nile Transit Agency (Starbus Tycoon)

Playable business idle simulator inspired by the real **Starbus** ticket-operations model.

You run a **ticket operations agency** — not a bus owner. Revenue comes from **commissions** on intercity routes (starting with **Omdurman → Khartoum**), while established competitors dominate the street.

## Step 1 MVP (current)

- Economy engine: variable daily commission revenue, office + software expenses, net profit
- One active route aligned with Starbus hub model
- Reputation + market share simulation
- Street scene: 7 competitor offices vs your small startup office
- Fintech-style dashboard: customer flow chart, market status, todos
- **End Day** progression with localStorage save
- Bankruptcy when cash falls below -5,000 SDG

## Run locally

```bash
cd starbus-game
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`).

## Reset progress

Click the ⚙️ icon in the top bar (dev shortcut) or clear `localStorage` key `nile-transit-save-v1`.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Zustand (game state)
- JSON / localStorage saves

## Next steps (planned)

- Step 2: Employees, hiring/firing, salary expenses
- Step 3: Random events, upgrades, route expansion
- Step 4: UI polish, street animations, idle ticks
- Step 5: Economy balance pass
