import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { fmt } from "../utils/helpers";

function Card({ label, value, icon: Icon, variant, change }) {
  return (
    <div className={`summary-card summary-card--${variant}`}>
      <div className="summary-card__header">
        <span className="summary-card__label">{label}</span>
        <div className={`summary-card__icon summary-card__icon--${variant}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="summary-card__value">{fmt(value)}</div>
      {change !== undefined && (
        <div className={`summary-card__change ${change >= 0 ? "positive" : "negative"}`}>
          {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% vs last month
        </div>
      )}
    </div>
  );
}

export default function SummaryCards({ transactions }) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const calc = (txs, type) =>
    txs
      .filter((t) => t.type === type)
      .reduce((s, t) => s + t.amount, 0);

  const currentTxs = transactions.filter((t) => t.date.startsWith(thisMonth));
  const lastTxs = transactions.filter((t) => t.date.startsWith(lastMonth));

  const totalIncome = calc(transactions, "income");
  const totalExpenses = calc(transactions, "expense");
  const balance = totalIncome - totalExpenses;

  const curIncome = calc(currentTxs, "income");
  const curExpenses = calc(currentTxs, "expense");
  const lastIncome = calc(lastTxs, "income");
  const lastExpenses = calc(lastTxs, "expense");

  const incomeChange = lastIncome ? ((curIncome - lastIncome) / lastIncome) * 100 : 0;
  const expenseChange = lastExpenses ? ((curExpenses - lastExpenses) / lastExpenses) * 100 : 0;

  return (
    <div className="summary-cards">
      <Card label="Total Balance" value={balance} icon={Wallet} variant="balance" />
      <Card
        label="Total Income"
        value={totalIncome}
        icon={TrendingUp}
        variant="income"
        change={incomeChange}
      />
      <Card
        label="Total Expenses"
        value={totalExpenses}
        icon={TrendingDown}
        variant="expense"
        change={expenseChange}
      />
    </div>
  );
}