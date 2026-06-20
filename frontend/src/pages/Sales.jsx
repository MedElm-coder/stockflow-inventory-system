import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import SaleDetailModal from "../components/SaleDetailModal";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  // detail modal
  const [selectedId, setSelectedId] = useState(null);

  const fetchSales = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (search) params.search = search;
    if (from) params.from = from;
    if (to) params.to = to;

    api
      .get("/sales", { params })
      .then((res) => {
        setSales(res.data.data);
        setMeta(res.data.meta);
      })
      .finally(() => setLoading(false));
  }, [page, search, from, to]);

  useEffect(() => {
    const t = setTimeout(fetchSales, 300);
    return () => clearTimeout(t);
  }, [fetchSales]);

  useEffect(() => {
    setPage(1);
  }, [search, from, to]);

  return (
    <div>
      <h1 className="page-title">Sales History</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="checkbox-label">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ marginLeft: 6 }}
          />
        </label>
        <label className="checkbox-label">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ marginLeft: 6 }}
          />
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Date</th>
              <th>Cashier</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="empty-row">Loading…</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={6} className="empty-row">No sales found.</td></tr>
            ) : (
              sales.map((s) => (
                <tr
                  key={s.id}
                  className="row-clickable"
                  onClick={() => setSelectedId(s.id)}
                >
                  <td>{s.reference}</td>
                  <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td>{s.cashier?.name ?? "—"}</td>
                  <td>{s.items?.length ?? 0}</td>
                  <td>${s.total_amount}</td>
                  <td><span className="badge badge-ok">{s.payment_method}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="pagination">
          <span>Page {meta.current_page} of {meta.last_page} ({meta.total} sales)</span>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <button disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      {selectedId && (
        <SaleDetailModal saleId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}