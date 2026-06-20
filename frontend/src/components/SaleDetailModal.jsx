import { useState, useEffect } from "react";
import Modal from "./Modal";
import api from "../api/axios";

export default function SaleDetailModal({ saleId, onClose }) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/sales/${saleId}`)
      .then((res) => setSale(res.data.data))
      .finally(() => setLoading(false));
  }, [saleId]);

  return (
    <Modal onClose={onClose}>
      {loading || !sale ? (
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : (
        <div className="sale-detail">
          <div className="sd-header">
            <span className="sd-ref">{sale.reference}</span>
            <span className="badge badge-ok">{sale.payment_method}</span>
          </div>
          <div className="sd-meta">
            {new Date(sale.created_at).toLocaleString()} · Cashier: {sale.cashier?.name ?? "—"}
          </div>

          <table className="sd-items">
            <thead>
              <tr>
                <th>Item</th>
                <th className="num">Unit</th>
                <th className="num">Qty</th>
                <th className="num">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.product_name}</td>
                  <td className="num">${it.unit_price}</td>
                  <td className="num">{it.quantity}</td>
                  <td className="num">${it.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="sd-summary">
            <div className="sd-line"><span>Amount Paid</span><span>${sale.amount_paid}</span></div>
            <div className="sd-line"><span>Change</span><span>${sale.change_due}</span></div>
            <div className="sd-line total"><span>Total</span><span>${sale.total_amount}</span></div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </Modal>
  );
}