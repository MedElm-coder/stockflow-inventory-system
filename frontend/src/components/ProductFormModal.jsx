import { useState, useEffect } from "react";
import Modal from "./Modal";
import api from "../api/axios";

const EMPTY = {
  category_id: "",
  name: "",
  sku: "",
  description: "",
  price: "",
  cost_price: "",
  stock_quantity: "",
  low_stock_threshold: 10,
  is_active: true,
};

export default function ProductFormModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        category_id: product.category?.id ?? "",
        name: product.name ?? "",
        sku: product.sku ?? "",
        description: product.description ?? "",
        price: product.price ?? "",
        cost_price: product.cost_price ?? "",
        stock_quantity: product.stock_quantity ?? "",
        low_stock_threshold: product.low_stock_threshold ?? 10,
        is_active: product.is_active ?? true,
      });
    } else {
      setForm(EMPTY);
    }
  }, [product]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async () => {
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) {
        await api.put(`/products/${product.id}`, form);
      } else {
        await api.post("/products", form);
      }
      onSaved();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setErrors({ general: ["Something went wrong. Please try again."] });
      }
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key) => errors[key]?.[0];

  return (
    <Modal onClose={onClose}>
      <h2>{isEdit ? "Edit Product" : "New Product"}</h2>

      {errors.general && <div className="form-error">{errors.general[0]}</div>}

      <div className="field" style={{ marginBottom: 14 }}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={change} />
        {fieldError("name") && <div className="field-error">{fieldError("name")}</div>}
      </div>

      <div className="field-row" style={{ marginBottom: 14 }}>
        <div className="field">
          <label>SKU</label>
          <input name="sku" value={form.sku} onChange={change} />
          {fieldError("sku") && <div className="field-error">{fieldError("sku")}</div>}
        </div>
        <div className="field">
          <label>Category</label>
          <select name="category_id" value={form.category_id} onChange={change}>
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {fieldError("category_id") && <div className="field-error">{fieldError("category_id")}</div>}
        </div>
      </div>

      <div className="field-row" style={{ marginBottom: 14 }}>
        <div className="field">
          <label>Price</label>
          <input name="price" type="number" step="0.01" value={form.price} onChange={change} />
          {fieldError("price") && <div className="field-error">{fieldError("price")}</div>}
        </div>
        <div className="field">
          <label>Cost Price</label>
          <input name="cost_price" type="number" step="0.01" value={form.cost_price} onChange={change} />
        </div>
      </div>

      <div className="field-row" style={{ marginBottom: 14 }}>
        <div className="field">
          <label>Stock Quantity</label>
          <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={change} />
          {fieldError("stock_quantity") && <div className="field-error">{fieldError("stock_quantity")}</div>}
        </div>
        <div className="field">
          <label>Low Stock Threshold</label>
          <input name="low_stock_threshold" type="number" value={form.low_stock_threshold} onChange={change} />
        </div>
      </div>

      <div className="field" style={{ marginBottom: 14 }}>
        <label>Description</label>
        <textarea name="description" rows={2} value={form.description} onChange={change} />
      </div>

      <label className="checkbox-label">
        <input type="checkbox" name="is_active" checked={form.is_active} onChange={change} />
        Active
      </label>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </Modal>
  );
}