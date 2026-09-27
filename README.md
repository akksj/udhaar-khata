# Udhaar Khata

A **real-life MERN** app for kirana stores, medical stores, and neighborhood shops that still keep credit in a paper notebook.

Shopkeepers need three things every evening:

1. what sold today
2. who still owes money (udhaar)
3. which item is about to go out of stock

Udhaar Khata is that notebook, rebuilt as a MERN product.

## Why this is a good portfolio project

Recruiters see a thousand todo apps. They rarely see a domain model that matches how Indian retail actually works:

- cash + UPI + udhaar on the same bill
- customer running balance
- low-stock alerts
- simple GST-ready invoice fields

## Features in this starter

- JWT auth for shop owner / helper
- Product catalog with stock and reorder level
- Customer ledger with running balance
- Billing that can mix paid + credit
- Dashboard numbers: today's sales, outstanding udhaar, low stock

## Stack

MongoDB · Express · React (Vite) · Node.js · JWT

## Project structure

```text
udhaar-khata/
  server/
  client/
```

## Quick start

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

## Next commits worth making

- [ ] Print / share bill as WhatsApp text
- [ ] Payment reminder list for customers idle 15+ days
- [ ] Fast barcode / name search at billing counter
- [ ] Multi-shop support
- [ ] PWA so it works on a cheap Android at the counter

## Author

Sarthak Giri — MERN stack developer  
[github.com/akksj](https://github.com/akksj) · [LinkedIn](https://www.linkedin.com/in/sarthak-giri-117490296)
