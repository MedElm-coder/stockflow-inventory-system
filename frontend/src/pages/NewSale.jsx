import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export default function NewSale() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]); // { id, name, sku, price, stock, qty }
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { per_page: 24, status: "active" };
    if (search) params.search = search;
    api
      .get("/products", { params })
      .then((res) => setProducts(res.data.data))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  // ---- Cart operations ----
  const addToCart = (p) => {
    if (p.stock_quantity <= 0) return;
    setReceipt(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) {
        if (existing.qty >= p.stock_quantity) return prev; // cap at stock
        return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: parseFloat(p.price),
          stock: p.stock_quantity,
          qty: 1,
        },
      ];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id !== id) return i;
          const next = i.qty + delta;
          if (next < 1) return i;
          if (next > i.stock) return i; // cap at stock
          return { ...i, qty: next };
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const paid = parseFloat(amountPaid) || 0;
  const change = paid - total;

  const canCheckout = cart.length > 0 && paid >= total && !submitting;

  const checkout = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post("/sales", {
        items: cart.map((i) => ({ product_id: i.id, quantity: i.qty })),
        amount_paid: paid,
        payment_method: paymentMethod,
      });
      setReceipt(res.data.data);
      setCart([]);
      setAmountPaid("");
      fetchProducts(); // refresh stock counts
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">New Sale</h1>

      <div className="pos-grid">
        {/* LEFT: products */}
        <div className="pos-products">
          <input
            className="pos-search"
            type="text"
            placeholder="Search products to add…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading…</p>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <div
                  key={p.id}
                  className={`product-card ${p.stock_quantity <= 0 ? "disabled" : ""}`}
                  onClick={() => addToCart(p)}
                >
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-meta">{p.sku} · stock {p.stock_quantity}</div>
                  <div className="pc-price">${p.price}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: cart */}
        <div className="cart">
          <h2>Cart</h2>

          {receipt ? (
            <div className="receipt">
              <h3>✓ Sale Complete</h3>
              <div className="r-ref">Ref: {receipt.reference}</div>
              {receipt.items.map((it) => (
                <div className="r-line" key={it.id}>
                  <span>{it.product_name} × {it.quantity}</span>
                  <span>${it.subtotal}</span>
                </div>
              ))}
              <div className="r-line r-total">
                <span>Total</span><span>${receipt.total_amount}</span>
              </div>
              <div className="r-line"><span>Paid</span><span>${receipt.amount_paid}</span></div>
              <div className="r-line"><span>Change</span><span>${receipt.change_due}</span></div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 14 }}
                onClick={() => setReceipt(null)}
              >
                New Sale
              </button>
            </div>
          ) : cart.length === 0 ? (
            <p className="cart-empty">Click products to add them to the cart.</p>
          ) : (
            <>
              {cart.map((i) => (
                <div className="cart-item" key={i.id}>
                  <div className="ci-name">
                    {i.name}
                    <small>${i.price.toFixed(2)} each</small>
                  </div>
                  <div className="qty-control">
                    <button onClick={() => changeQty(i.id, -1)} disabled={i.qty <= 1}>−</button>
                    <span>{i.qty}</span>
                    <button onClick={() => changeQty(i.id, 1)} disabled={i.qty >= i.stock}>+</button>
                  </div>
                  <div className="ci-subtotal">${(i.price * i.qty).toFixed(2)}</div>
                  <button className="ci-remove" onClick={() => removeItem(i.id)}>×</button>
                </div>
              ))}

              <div className="cart-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="field">
                <label>Amount Paid</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className={`change-line ${change < 0 ? "negative" : ""}`}>
                <span>Change</span>
                <span>${change.toFixed(2)}</span>
              </div>

              <div className="field">
                <label>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {error && <div className="form-error">{error}</div>}

              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={checkout}
                disabled={!canCheckout}
              >
                {submitting ? "Processing…" : "Complete Sale"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}