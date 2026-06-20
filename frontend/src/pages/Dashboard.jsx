import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

function StatCard({ label, value, sub, alert }) {
  return (
    <div className={`stat-card ${alert ? "alert" : ""}`}>
      <div className="sc-label">{label}</div>
      <div className="sc-value">{value}</div>
      {sub && <div className="sc-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [salesSeries, setSalesSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all four endpoints in parallel
    Promise.all([
      api.get("/dashboard/summary"),
      api.get("/dashboard/sales-over-time?days=7"),
      api.get("/dashboard/top-products?limit=5"),
      api.get("/dashboard/low-stock?limit=8"),
    ])
      .then(([sum, series, top, low]) => {
        setSummary(sum.data);
        setSalesSeries(series.data.data);
        setTopProducts(top.data.data);
        setLowStock(low.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p style={{ color: "var(--text-muted)" }}>Loading…</p>
      </div>
    );
  }

  const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard
          label="Today's Revenue"
          value={money(summary.today_revenue)}
          sub={`${summary.today_sales_count} sales today`}
        />
        <StatCard
          label="Total Revenue"
          value={money(summary.total_revenue)}
          sub={`${summary.total_sales_count} sales all-time`}
        />
        <StatCard
          label="Low Stock Items"
          value={summary.low_stock_count}
          sub={`of ${summary.total_products} products`}
          alert={summary.low_stock_count > 0}
        />
        <StatCard
          label="Inventory Value"
          value={money(summary.inventory_value)}
          sub="at cost price"
        />
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div className="chart-panel">
          <h2>Revenue — Last 7 Days</h2>
          {salesSeries.every((d) => d.revenue === 0) ? (
            <div className="chart-empty">No sales in this period yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={salesSeries} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
                <XAxis dataKey="date" stroke="#9aa3b2" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="#9aa3b2" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "#1a1d27", border: "1px solid #2a2f3a", borderRadius: 8, color: "#e4e7ec" }}
                  formatter={(v) => money(v)}
                />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-panel">
          <h2>Top Products</h2>
          {topProducts.length === 0 ? (
            <div className="chart-empty">No sales data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProducts} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
                <XAxis
                  dataKey="product_name"
                  stroke="#9aa3b2"
                  fontSize={10}
                  tickFormatter={(n) => (n.length > 10 ? n.slice(0, 10) + "…" : n)}
                />
                <YAxis stroke="#9aa3b2" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1a1d27", border: "1px solid #2a2f3a", borderRadius: 8, color: "#e4e7ec" }}
                />
                <Bar dataKey="total_quantity" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Low stock panel */}
      <div className="panel">
        <h2>Low Stock Alerts</h2>
        {lowStock.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            All products are sufficiently stocked. 🎉
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.stock_quantity}</td>
                  <td>{p.low_stock_threshold}</td>
                  <td>
                    {p.stock_quantity === 0 ? (
                      <span className="badge badge-out">Out</span>
                    ) : (
                      <span className="badge badge-low">Low</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}