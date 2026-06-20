import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductFormModal from "../components/ProductFormModal";

function stockBadge(p) {
  if (p.stock_quantity === 0) return <span className="badge badge-out">Out</span>;
  if (p.is_low_stock) return <span className="badge badge-low">Low</span>;
  return <span className="badge badge-ok">OK</span>;
}

export default function Products() {
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [page, setPage] = useState(1);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Load categories once (for filter + form)
  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data || []));
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page };
    if (search) params.search = search;
    if (categoryId) params.category_id = categoryId;
    if (lowOnly) params.stock = "low";

    api
      .get("/products", { params })
      .then((res) => {
        setProducts(res.data.data);
        setMeta(res.data.meta);
      })
      .finally(() => setLoading(false));
  }, [page, search, categoryId, lowOnly]);

  // Debounce search; refetch on filter/page change
  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, categoryId, lowOnly]);

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setShowModal(true); };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await api.delete(`/products/${p.id}`);
    fetchProducts();
  };

  const handleSaved = () => {
    setShowModal(false);
    fetchProducts();
  };

  return (
    <div>
      <h1 className="page-title">Products</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="checkbox-label">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
          Low stock only
        </label>

        {isAdmin && (
          <button className="btn btn-primary spacer" onClick={openCreate}>
            + New Product
          </button>
        )}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="empty-row">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="empty-row">No products found.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.category?.name ?? "—"}</td>
                  <td>${p.price}</td>
                  <td>{p.stock_quantity}</td>
                  <td>{stockBadge(p)}</td>
                  {isAdmin && (
                    <td>
                      <div className="cell-actions">
                        <button className="btn btn-ghost btn-xs" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(p)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="pagination">
          <span>Page {meta.current_page} of {meta.last_page} ({meta.total} items)</span>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <button disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      {showModal && (
        <ProductFormModal
          product={editing}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}