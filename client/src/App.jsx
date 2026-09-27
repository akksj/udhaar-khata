import { useEffect, useState } from "react";

const TOKEN = "khata_token";

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem(TOKEN);
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export default function App() {
  const [session, setSession] = useState(Boolean(localStorage.getItem(TOKEN)));
  const [dash, setDash] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ email: "owner@khata.local", password: "Password123" });
  const [bill, setBill] = useState({ productId: "", qty: 1, customerId: "", paid: 0 });
  const [error, setError] = useState("");

  async function load() {
    const [d, p, c] = await Promise.all([
      api("/api/dashboard"),
      api("/api/products"),
      api("/api/customers")
    ]);
    setDash(d);
    setProducts(p);
    setCustomers(c);
    if (p[0]) setBill((current) => ({ ...current, productId: current.productId || p[0]._id }));
  }

  useEffect(() => {
    if (session) load().catch((err) => setError(err.message));
  }, [session]);

  async function login(event) {
    event.preventDefault();
    const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify(form) });
    localStorage.setItem(TOKEN, data.token);
    setSession(true);
  }

  async function createBill(event) {
    event.preventDefault();
    await api("/api/bills", {
      method: "POST",
      body: JSON.stringify({
        customerId: bill.customerId || undefined,
        paid: Number(bill.paid),
        items: [{ productId: bill.productId, qty: Number(bill.qty) }]
      })
    });
    await load();
  }

  if (!session) {
    return (
      <div className="shell">
        <form className="card grid" onSubmit={login}>
          <h1>Udhaar Khata</h1>
          <p className="muted">Shop ledger for cash, UPI and notebook credit.</p>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit">Open shop</button>
        </form>
      </div>
    );
  }

  return (
    <div className="shell grid">
      <h1>Giri Kirana Store</h1>
      {error && <p className="muted">{error}</p>}
      <div className="stats">
        <div className="card"><p className="muted">Today collected</p><h2>₹{dash?.todaySales || 0}</h2></div>
        <div className="card"><p className="muted">Outstanding udhaar</p><h2>₹{dash?.outstanding || 0}</h2></div>
        <div className="card"><p className="muted">Bills today</p><h2>{dash?.todayBills || 0}</h2></div>
      </div>
      <form className="card grid" onSubmit={createBill}>
        <h3>New bill</h3>
        <select value={bill.productId} onChange={(e) => setBill({ ...bill, productId: e.target.value })}>
          {products.map((product) => (
            <option key={product._id} value={product._id}>{product.name} · ₹{product.price} · stock {product.stock}</option>
          ))}
        </select>
        <input type="number" min="1" value={bill.qty} onChange={(e) => setBill({ ...bill, qty: e.target.value })} />
        <select value={bill.customerId} onChange={(e) => setBill({ ...bill, customerId: e.target.value })}>
          <option value="">Walk-in / cash customer</option>
          {customers.map((customer) => (
            <option key={customer._id} value={customer._id}>{customer.name} owes ₹{customer.balance}</option>
          ))}
        </select>
        <input type="number" min="0" value={bill.paid} onChange={(e) => setBill({ ...bill, paid: e.target.value })} placeholder="Amount paid now" />
        <button type="submit">Save bill</button>
      </form>
      <section className="card">
        <h3>Low stock</h3>
        {(dash?.lowStock || []).map((item) => (
          <p key={item._id}>{item.name} — {item.stock} left</p>
        ))}
      </section>
    </div>
  );
}
