import { useApp } from "../context/AppContext";
import SummaryCards from "../components/SummaryCards";
import { BalanceTrendChart, SpendingBreakdownChart, MonthlyBarChart } from "../components/Charts";
import { fmtDate, fmt } from "../utils/helpers";
import { CATEGORY_COLORS } from "../data/transactions";

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { transactions } = state;
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page-title">Financial Overview</h1>
          <p className="page-sub">All-time summary across {transactions.length} transactions</p>
        </div>
      </div>

      <SummaryCards transactions={transactions} />

      <div className="charts-grid">
        <BalanceTrendChart transactions={transactions} />
        <SpendingBreakdownChart transactions={transactions} />
        <MonthlyBarChart transactions={transactions} />
      </div>

      <div className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Recent Transactions</h2>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "transactions" })}
          >
            View all →
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">
            <span>No transactions yet</span>
          </div>
        ) : (
          <div className="tx-list tx-list--compact">
            {recent.map((tx) => (
              <div key={tx.id} className="tx-row">
                <div
                  className="tx-dot"
                  style={{ background: CATEGORY_COLORS[tx.category] || "#6b7280" }}
                />
                <div className="tx-info">
                  <span className="tx-desc">{tx.description}</span>
                  <span className="tx-meta">{fmtDate(tx.date)} · {tx.category}</span>
                </div>
                <span className={`tx-amount tx-amount--${tx.type}`}>
                  {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}