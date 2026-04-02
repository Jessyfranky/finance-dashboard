import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { fmt, groupByCategory, groupByMonth } from "../utils/helpers";
import { CATEGORY_COLORS } from "../data/transactions";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function InsightCard({ title, value, sub, accent }) {
  return (
    <div className="insight-card" style={{ "--accent": accent }}>
      <div className="insight-card__bar" />
      <div className="insight-card__content">
        <p className="insight-card__title">{title}</p>
        <p className="insight-card__value">{value}</p>
        {sub && <p className="insight-card__sub">{sub}</p>}
      </div>
    </div>
  );
}

export default function Insights() {
  const { state } = useApp();
  const { transactions } = state;

  const byCategory = useMemo(() => groupByCategory(transactions), [transactions]);
  const byMonth = useMemo(() => groupByMonth(transactions), [transactions]);

  const topCategory = byCategory[0];

  const months = byMonth.slice(-2);
  const currentM = months[1];
  const prevM = months[0];

  const savingsRate = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    if (!totalIncome) return 0;
    return (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1);
  }, [transactions]);

  const avgMonthlyExpense = useMemo(() => {
    if (!byMonth.length) return 0;
    const total = byMonth.reduce((s, m) => s + m.expenses, 0);
    return total / byMonth.length;
  }, [byMonth]);

  const expenseChange = useMemo(() => {
    if (!currentM || !prevM || !prevM.expenses) return null;
    return (((currentM.expenses - prevM.expenses) / prevM.expenses) * 100).toFixed(1);
  }, [currentM, prevM]);

  const radarData = byCategory.slice(0, 6).map((c) => ({
    subject: c.name.split(" ")[0],
    value: c.value,
  }));

  const maxVal = Math.max(...radarData.map((d) => d.value));

  const biggest = byCategory.slice(0, 5);

  if (transactions.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Insights</h1>
        <div className="empty-state">Add some transactions to see insights.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page-title">Insights</h1>
          <p className="page-sub">Patterns and observations from your data</p>
        </div>
      </div>

      <div className="insights-grid">
        {topCategory && (
          <InsightCard
            title="Highest Spending Category"
            value={topCategory.name}
            sub={`${fmt(topCategory.value)} total spent`}
            accent={CATEGORY_COLORS[topCategory.name] || "#f97316"}
          />
        )}
        <InsightCard
          title="Overall Savings Rate"
          value={`${savingsRate}%`}
          sub="of total income saved"
          accent="#22c55e"
        />
        <InsightCard
          title="Avg Monthly Expense"
          value={fmt(avgMonthlyExpense)}
          sub="across all recorded months"
          accent="#3b82f6"
        />
        {expenseChange !== null && (
          <InsightCard
            title="Expense Change (MoM)"
            value={`${expenseChange > 0 ? "+" : ""}${expenseChange}%`}
            sub={`${currentM?.label} vs ${prevM?.label}`}
            accent={parseFloat(expenseChange) > 0 ? "#ef4444" : "#22c55e"}
          />
        )}
      </div>

      <div className="insights-bottom">
        <div className="chart-card">
          <h3 className="chart-title">Spending Radar</h3>
          <p className="chart-subtitle">Top categories by spend</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Radar
                dataKey="value"
                stroke="var(--accent)"
                fill="var(--accent)"
                fillOpacity={0.2}
              />
              <Tooltip formatter={(v) => fmt(v)} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Spending Categories</h3>
          <p className="chart-subtitle">Ranked by total amount</p>
          <div className="category-bars">
            {biggest.map((c) => {
              const pct = ((c.value / biggest[0].value) * 100).toFixed(0);
              return (
                <div key={c.name} className="cat-bar-row">
                  <div className="cat-bar-label">
                    <span
                      className="cat-dot"
                      style={{ background: CATEGORY_COLORS[c.name] || "#6b7280" }}
                    />
                    <span>{c.name}</span>
                  </div>
                  <div className="cat-bar-track">
                    <div
                      className="cat-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: CATEGORY_COLORS[c.name] || "#6b7280",
                      }}
                    />
                  </div>
                  <span className="cat-bar-val">{fmt(c.value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card chart-card--wide observations-card">
          <h3 className="chart-title">Observations</h3>
          <p className="chart-subtitle">Patterns worth noting</p>
          <ul className="observations-list">
            {topCategory && (
              <li>
                <span className="obs-bullet" style={{ background: CATEGORY_COLORS[topCategory.name] }} />
                Your biggest spending category is <strong>{topCategory.name}</strong>, accounting for {fmt(topCategory.value)} in total.
              </li>
            )}
            <li>
              <span className="obs-bullet" style={{ background: "#22c55e" }} />
              You are saving roughly <strong>{savingsRate}%</strong> of your income.{" "}
              {parseFloat(savingsRate) >= 20 ? "That's a healthy rate — great work." : "Aim for 20%+ for long-term financial health."}
            </li>
            {expenseChange !== null && (
              <li>
                <span className="obs-bullet" style={{ background: parseFloat(expenseChange) > 0 ? "#ef4444" : "#22c55e" }} />
                Expenses {parseFloat(expenseChange) > 0 ? "increased" : "decreased"} by{" "}
                <strong>{Math.abs(expenseChange)}%</strong> compared to last month.
              </li>
            )}
            <li>
              <span className="obs-bullet" style={{ background: "#3b82f6" }} />
              Your average monthly expenses are <strong>{fmt(avgMonthlyExpense)}</strong>. Use this as a budgeting baseline.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}