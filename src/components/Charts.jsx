import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend,
  } from "recharts";
  import { groupByMonth, groupByCategory } from "../utils/helpers";
  import { CATEGORY_COLORS } from "../data/transactions";
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: ${p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };
  
  export function BalanceTrendChart({ transactions }) {
    const data = groupByMonth(transactions);
    return (
      <div className="chart-card">
        <h3 className="chart-title">Income vs Expenses</h3>
        <p className="chart-subtitle">Monthly overview</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--income)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--income)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--expense)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--expense)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income" name="Income" stroke="var(--income)" strokeWidth={2} fill="url(#incomeGrad)" />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="var(--expense)" strokeWidth={2} fill="url(#expenseGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  export function SpendingBreakdownChart({ transactions }) {
    const data = groupByCategory(transactions).slice(0, 7);
    return (
      <div className="chart-card">
        <h3 className="chart-title">Spending Breakdown</h3>
        <p className="chart-subtitle">By category</p>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name] || "#6b7280"}
                />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: "var(--text-secondary)", fontSize: 11 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  export function MonthlyBarChart({ transactions }) {
    const data = groupByMonth(transactions);
    return (
      <div className="chart-card chart-card--wide">
        <h3 className="chart-title">Net Cash Flow</h3>
        <p className="chart-subtitle">Monthly net (income − expenses)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="net" name="Net" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.month} fill={entry.net >= 0 ? "var(--income)" : "var(--expense)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }