import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CATEGORIES } from "../data/transactions";
import { useApp } from "../context/AppContext";

const empty = {
  description: "",
  amount: "",
  category: CATEGORIES[0],
  type: "expense",
  date: new Date().toISOString().split("T")[0],
};

export default function TransactionModal({ existing, onClose }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState(existing || empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = "Required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Must be a positive number";
    if (!form.date) e.date = "Required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const payload = { ...form, amount: parseFloat(form.amount) };
    if (existing) {
      dispatch({ type: "EDIT_TRANSACTION", payload });
    } else {
      dispatch({ type: "ADD_TRANSACTION", payload });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2>{existing ? "Edit Transaction" : "New Transaction"}</h2>
          <button className="modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal__body">
          <div className="form-row">
            <label>Type</label>
            <div className="type-toggle">
              {["expense", "income"].map((t) => (
                <button
                  key={t}
                  className={`type-btn type-btn--${t} ${form.type === t ? "active" : ""}`}
                  onClick={() => set("type", t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>Description</label>
            <input
              className={`form-input ${errors.description ? "form-input--error" : ""}`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="e.g. Monthly Salary"
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-row">
            <label>Amount (USD)</label>
            <input
              className={`form-input ${errors.amount ? "form-input--error" : ""}`}
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="0.00"
            />
            {errors.amount && <span className="form-error">{errors.amount}</span>}
          </div>

          <div className="form-row">
            <label>Category</label>
            <select
              className="form-input"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Date</label>
            <input
              className={`form-input ${errors.date ? "form-input--error" : ""}`}
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit}>
            {existing ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}