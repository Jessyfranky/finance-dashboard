import { createContext, useContext, useReducer, useEffect } from "react";
import { initialTransactions } from "../data/transactions";

const AppContext = createContext(null);

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem("fintrack_transactions");
    return saved ? JSON.parse(saved) : initialTransactions;
  } catch {
    return initialTransactions;
  }
};

const loadTheme = () => {
  try {
    return localStorage.getItem("fintrack_theme") || "dark";
  } catch {
    return "dark";
  }
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "RESET_FILTERS":
      return { ...state, filters: initialFilters };
    case "ADD_TRANSACTION":
      const newTx = { ...action.payload, id: Date.now() };
      return { ...state, transactions: [newTx, ...state.transactions] };
    case "EDIT_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    default:
      return state;
  }
}

const initialFilters = {
  search: "",
  type: "all",
  category: "all",
  sortBy: "date",
  sortDir: "desc",
  month: "all",
};

const initialState = {
  transactions: loadFromStorage(),
  role: "viewer",
  theme: loadTheme(),
  activeTab: "dashboard",
  filters: initialFilters,
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    localStorage.setItem("fintrack_transactions", JSON.stringify(state.transactions));
  }, [state.transactions]);

  useEffect(() => {
    localStorage.setItem("fintrack_theme", state.theme);
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}