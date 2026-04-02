import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";
import "./styles/main.css";

function AppShell() {
  const { state } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pages = {
    dashboard: <Dashboard />,
    transactions: <Transactions />,
    insights: <Insights />,
  };

  return (
    <div className={`app app--${state.theme}`}>
      <Sidebar />

      {mobileOpen && (
        <>
          <div
            className="mobile-overlay"
            onClick={() => setMobileOpen(false)}
          />
          <Sidebar mobile onClose={() => setMobileOpen(false)} />
        </>
      )}

      <div className="mobile-header">
        <div className="brand-icon">₣</div>
        <span className="brand-name">FinTrack</span>
        <button
          className="hamburger"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <main className="main-content">
        {pages[state.activeTab]}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}