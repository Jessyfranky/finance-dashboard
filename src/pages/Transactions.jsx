import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Download, ArrowUpDown, ChevronUp, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import TransactionModal from "../components/TransactionModal";
import { CATEGORIES, CATEGORY_COLORS } from "../data/transactions";
import { fmt, fmtDate, exportToCSV, exportToJSON } from "../utils/helpers";

const MONTHS = [
  { value: "all", label: "All Months" },
  { value: "2024-12", label: "Dec 2024" },
  { value: "2024-11", label: "Nov 2024" },
  { value: "2024-10", label: "Oct 2024" },
];

export default function Transactions() {
  const { state, dispatch } = useApp();
  const { transactions, filters, role } = state;
  const isAdmin = role === "admin";

  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setFilter = (payload) => dispatch({ type: "SET_FILTER", payload });

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    if (filters.type !== "all") list = list.filter((t) => t.type === filters.type);
    if (filters.category !== "all") list = list.filter((t) => t.category === filters.category);
    if (filters.month !== "all") list = list.filter((t) => t.date.startsWith(filters.month));

    list.sort((a, b) => {
      let cmp = 0;
      if (filters.sortBy === "date") cmp = a.date.localeCompare(b.date);
      else if (filters.sortBy === "amount") cmp = a.amount - b.amount;
      else if (filters.sortBy === "description") cmp = a.description.localeCompare(b.description);
      return filters.sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [transactions, filters]);

  const toggleSort = (col) => {
    if (filters.sortBy === col) {
      setFilter({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" });
    } else {
      setFilter({ sortBy: col, sortDir: "desc" });
    }
  };

  const SortIcon = ({ col }) => {
    if (filters.sortBy !== col) return <ArrowUpDown size={12} className="sort-icon" />;
    return filters.sortDir === "asc"
      ? <ChevronUp size={12} className="sort-icon active" />
      : <ChevronDown size={12} className="sort-icon active" />;
  };

  const handleDelete = (id) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
    setDeleteConfirm(null);
  };

  const totalShown = filtered.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount;
      else acc.expenses += t.amount;
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const activeFilterCount = [
    filters.type !== "all",
    filters.category !== "all",
    filters.month !== "all",
    filters.search !== "",
  ].filter(Boolean).length;

  return (
    <div className="tx-page">
      <div className="tx-page__hero">
        <div className="tx-page__hero-inner">
          <div>
            <h1 className="tx-page__title">Transactions</h1>
            <p className="tx-page__sub">
              Showing {filtered.length} of {transactions.length} records
            </p>
          </div>
          <div className="tx-page__hero-stats">
            <div className="hero-stat">
              <span className="hero-stat__label">In</span>
              <span className="hero-stat__value hero-stat__value--in">{fmt(totalShown.income)}</span>
            </div>
            <div className="hero-stat__divider" />
            <div className="hero-stat">
              <span className="hero-stat__label">Out</span>
              <span className="hero-stat__value hero-stat__value--out">{fmt(totalShown.expenses)}</span>
            </div>
            <div className="hero-stat__divider" />
            <div className="hero-stat">
              <span className="hero-stat__label">Net</span>
              <span className={`hero-stat__value ${totalShown.income - totalShown.expenses >= 0 ? "hero-stat__value--in" : "hero-stat__value--out"}`}>
                {fmt(totalShown.income - totalShown.expenses)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="tx-page__body">
        <div className="tx-toolbar">
          <div className="search-wrap">
            <Search size={14} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by name or category..."
              value={filters.search}
              onChange={(e) => setFilter({ search: e.target.value })}
            />
            {filters.search && (
              <button className="search-clear" onClick={() => setFilter({ search: "" })}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="tx-toolbar__right">
            <button
              className={`btn btn--ghost btn--sm ${filtersOpen ? "btn--active" : ""}`}
              onClick={() => setFiltersOpen((p) => !p)}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="filter-badge">{activeFilterCount}</span>
              )}
            </button>

            <div className="export-wrap">
              <button className="btn btn--ghost btn--sm" onClick={() => setExportOpen((p) => !p)}>
                <Download size={14} />
                Export
              </button>
              {exportOpen && (
                <div className="export-dropdown">
                  <button onClick={() => { exportToCSV(filtered); setExportOpen(false); }}>
                    Export CSV
                  </button>
                  <button onClick={() => { exportToJSON(filtered); setExportOpen(false); }}>
                    Export JSON
                  </button>
                </div>
              )}
            </div>

            {isAdmin && (
              <button className="btn btn--primary btn--sm" onClick={() => setModal({ mode: "add" })}>
                <Plus size={14} />
                Add
              </button>
            )}
          </div>
        </div>

        {filtersOpen && (
          <div className="filter-panel">
            <select className="filter-select" value={filters.type} onChange={(e) => setFilter({ type: e.target.value })}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="filter-select" value={filters.category} onChange={(e) => setFilter({ category: e.target.value })}>
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={filters.month} onChange={(e) => setFilter({ month: e.target.value })}>
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select className="filter-select" value={filters.sortBy} onChange={(e) => setFilter({ sortBy: e.target.value })}>
              <option value="date">Sort: Date</option>
              <option value="amount">Sort: Amount</option>
              <option value="description">Sort: Name</option>
            </select>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => dispatch({ type: "RESET_FILTERS" })}
            >
              Clear all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No transactions match your filters.</p>
            <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: "RESET_FILTERS" })}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tx-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort("date")} className="sortable">
                    Date <SortIcon col="date" />
                  </th>
                  <th onClick={() => toggleSort("description")} className="sortable">
                    Description <SortIcon col="description" />
                  </th>
                  <th>Category</th>
                  <th>Type</th>
                  <th onClick={() => toggleSort("amount")} className="sortable text-right">
                    Amount <SortIcon col="amount" />
                  </th>
                  {isAdmin && <th className="text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id} className="tx-table__row">
                    <td className="tx-table__date">{fmtDate(tx.date)}</td>
                    <td className="tx-table__desc">
                      <div className="tx-table__desc-wrap">
                        <span
                          className="tx-table__dot"
                          style={{ background: CATEGORY_COLORS[tx.category] || "#6b7280" }}
                        />
                        {tx.description}
                      </div>
                    </td>
                    <td>
                      <span
                        className="category-tag"
                        style={{
                          background: (CATEGORY_COLORS[tx.category] || "#6b7280") + "22",
                          color: CATEGORY_COLORS[tx.category] || "#6b7280",
                        }}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td>
                      <span className={`type-tag type-tag--${tx.type}`}>{tx.type}</span>
                    </td>
                    <td className={`text-right tx-amount--${tx.type} tx-table__amount`}>
                      {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                    </td>
                    {isAdmin && (
                      <td className="text-center">
                        <div className="row-actions">
                          <button className="row-action" onClick={() => setModal({ mode: "edit", tx })}>
                            <Pencil size={13} />
                          </button>
                          <button
                            className="row-action row-action--danger"
                            onClick={() => setDeleteConfirm(tx.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <TransactionModal
          existing={modal.mode === "edit" ? modal.tx : null}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal modal--sm">
            <div className="modal__header">
              <h2>Delete Transaction</h2>
            </div>
            <div className="modal__body">
              <p>Are you sure you want to delete this transaction? This cannot be undone.</p>
            </div>
            <div className="modal__footer">
              <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





