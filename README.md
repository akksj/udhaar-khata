# Udhaar Khata

MERN ledger for a kirana counter: stock, a bill that can mix cash and credit, and a customer balance.

Shopkeepers need three numbers at close: what was collected today, who still owes money, and what is about to run out.

## What works

- Owner login (JWT)
- Product catalog with stock and reorder level
- Bill lines check stock before save
- Credit is rejected unless a customer is selected
- A failed bill puts stock back
- Collecting udhaar cannot exceed the balance and writes a payment row

## What is not done

- No WhatsApp bill text, barcode search, or PWA
- Runs locally. Not deployed.

## Stack

MongoDB · Express · React (Vite) · Node.js · JWT

## Run

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Seed login: `owner@khata.local` / `Password123`

## Author

Sarthak Giri · [github.com/akksj](https://github.com/akksj) · [LinkedIn](https://www.linkedin.com/in/sarthak-giri-117490296)
