import { LayoutDashboard, ArrowLeftRight, Lightbulb, Sun, Moon, ChevronDown } from "lucide-react";
import { useApp } from "../context/AppContext";

const tabs = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "insights", label: "Insights", icon: Lightbulb },
];

export default function Sidebar({ mobile, onClose }) {
  const { state, dispatch } = useApp();

  const handleTab = (id) => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: id });
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${mobile ? "sidebar--mobile" : ""}`}>
      <div className="sidebar__brand">
        <div className="brand-icon">₣</div>
        <span className="brand-name">FinTrack</span>
      </div>

      <nav className="sidebar__nav">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${state.activeTab === id ? "nav-item--active" : ""}`}
            onClick={() => handleTab(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
       

        <button
          className="theme-toggle"
          onClick={() =>
            dispatch({
              type: "SET_THEME",
              payload: state.theme === "dark" ? "light" : "dark",
            })
          }
        >
          {state.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          <span>{state.theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </aside>
  );
}