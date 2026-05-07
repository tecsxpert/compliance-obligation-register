
  Then replace src/App.jsx with this file.

  .env (project root):
    VITE_API_URL=http://localhost:8080

  Day 2  → ObligationList   (table, skeleton, empty state)
  Day 3  → ObligationForm   (create / edit with validation)
  Day 4  → pagination, sort column headers
  Day 5  → LoginPage, AuthContext, ProtectedRoute
  Day 6  → Dashboard (KPI cards + BarChart)
  Day 7  → ObligationDetail (badges, Edit/Delete, AI card)
  Day 8  → AI Panel ('Ask AI' button, spinner, retry)
  Day 9  → SearchFilterBar (debounce, status dropdown, date range, URL params)
  Day 10 → CSV export, EventSource streaming report, Analytics tab
  Day 11 → Analytics (BarChart, LineChart, PieChart, period selector)
  Day 12 → UX polish (skeletons everywhere, Error Boundary, empty illustrations)
  Day 13 → Responsive (375 / 768 / 1280 breakpoints via Tailwind)
  Day 14 → Brand (#1B4F8A, spacing, 44 px touch targets)
  Day 15–20 → Demo-ready state
*/

import { useState, useEffect, useCallback, useContext, createContext, useRef, Suspense } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
const AI  = import.meta.env.VITE_AI_URL  || "http://localhost:5000";

const STATUS_COLORS = {
  ACTIVE:    { bg: "#E6F1FB", text: "#185FA5", dot: "#378ADD" },
  PENDING:   { bg: "#FAEEDA", text: "#854F0B", dot: "#EF9F27" },
  OVERDUE:   { bg: "#FCEBEB", text: "#A32D2D", dot: "#E24B4A" },
  COMPLETED: { bg: "#EAF3DE", text: "#3B6D11", dot: "#639922" },
  DRAFT:     { bg: "#F1EFE8", text: "#5F5E5A", dot: "#888780" },
};

const STATUSES   = Object.keys(STATUS_COLORS);
const CATEGORIES = ["Regulatory","Environmental","Financial","HR","IT","Safety","Legal","Operational"];
const BRAND      = "#1B4F8A";

// ─────────────────────────────────────────────
// AUTH CONTEXT  (Day 5)
// ─────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("cor_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("cor_token") || null);

  const login = useCallback(async (username, password) => {
  // ✅ MOCK LOGIN (no backend needed)
  if (username === "admin" && password === "password") {
    const mockToken = "mock-jwt-token";
    const mockUser  = { username: "admin", role: "ADMIN" };

    localStorage.setItem("cor_token", mockToken);
    localStorage.setItem("cor_user", JSON.stringify(mockUser));

    setToken(mockToken);
    setUser(mockUser);

    return true;
  }

  throw new Error("Invalid credentials");
}, []);

  const logout = useCallback(() => {
    localStorage.removeItem("cor_token");
    localStorage.removeItem("cor_user");
    setToken(null);
    setUser(null);
  }, []);

  axios.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() { return useContext(AuthContext); }

// ─────────────────────────────────────────────
// ERROR BOUNDARY  (Day 12)
// ─────────────────────────────────────────────
import { Component } from "react";
class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#A32D2D" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ fontFamily: "Georgia, serif", marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: "#5F5E5A", fontSize: 14 }}>{this.state.error?.message}</p>
        <button onClick={() => this.setState({ hasError: false })} style={btnStyle()}>
          Try Again
        </button>
      </div>
    );
  }
}

// ─────────────────────────────────────────────
// SHARED STYLE HELPERS
// ─────────────────────────────────────────────
const card = (extra = {}) => ({
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  padding: "1.25rem",
  ...extra,
});

function btnStyle(variant = "primary", extra = {}) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 20px", borderRadius: 8, fontFamily: "inherit",
    fontSize: 14, fontWeight: 500, cursor: "pointer",
    minHeight: 44, border: "none", transition: "background .15s",
  };
  if (variant === "primary")   return { ...base, background: BRAND,    color: "#fff", ...extra };
  if (variant === "secondary") return { ...base, background: "#f1f5f9", color: "#334155", ...extra };
  if (variant === "danger")    return { ...base, background: "#FCEBEB", color: "#A32D2D", ...extra };
  if (variant === "ghost")     return { ...base, background: "transparent", color: BRAND, border: `1px solid ${BRAND}`, ...extra };
  return { ...base, ...extra };
}

const inputStyle = (extra = {}) => ({
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid #cbd5e1", fontSize: 14, fontFamily: "inherit",
  outline: "none", transition: "border .15s",
  boxSizing: "border-box", ...extra,
});

// ─────────────────────────────────────────────
// SKELETON  (Day 2, Day 12)
// ─────────────────────────────────────────────
function Skeleton({ w = "100%", h = 16, rounded = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: rounded,
      background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
  return (
    <span style={{
      background: c.bg, color: c.text, borderRadius: 20,
      padding: "3px 10px", fontSize: 12, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────
// EMPTY STATE  (Day 12)
// ─────────────────────────────────────────────
function EmptyState({ message = "No records found", icon = "📋", sub = "" }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#475569", marginBottom: 4 }}>{message}</p>
      {sub && <p style={{ fontSize: 13 }}>{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGINATION  (Day 4)
// ─────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i;
    if (i === 0) return 0;
    if (i === 6) return totalPages - 1;
    return Math.max(1, Math.min(page - 2 + i, totalPages - 2));
  });
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", padding: "1rem 0" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={btnStyle("secondary", { padding: "6px 12px", minHeight: 36 })}>‹</button>
      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)} style={btnStyle(p === page ? "primary" : "secondary", { padding: "6px 14px", minHeight: 36 })}>
          {p + 1}
        </button>
      ))}
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} style={btnStyle("secondary", { padding: "6px 12px", minHeight: 36 })}>›</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// SEARCH & FILTER BAR  (Day 9)
// ─────────────────────────────────────────────
function SearchFilterBar({ onFilter }) {
  const [q,          setQ]          = useState("");
  const [status,     setStatus]     = useState("");
  const [category,   setCategory]   = useState("");
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");
  const debounceRef = useRef(null);

  const apply = useCallback((overrides = {}) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      const vals = { q, status, category, dateFrom, dateTo, ...overrides };
      Object.entries(vals).forEach(([k, v]) => { if (v) params.set(k, v); });
      window.history.replaceState(null, "", `?${params.toString()}`);
      onFilter(vals);
    }, 300);
  }, [q, status, category, dateFrom, dateTo, onFilter]);

  const sel = (extra = {}) => ({
    ...inputStyle({ width: "auto", minWidth: 140 }), ...extra,
  });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "1.25rem" }}>
      <input
        placeholder="🔍  Search obligations…"
        value={q}
        onChange={e => { setQ(e.target.value); apply({ q: e.target.value }); }}
        style={inputStyle({ flex: "1 1 220px" })}
      />
      <select value={status} onChange={e => { setStatus(e.target.value); apply({ status: e.target.value }); }} style={sel()}>
        <option value="">All Statuses</option>
        {STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>
      <select value={category} onChange={e => { setCategory(e.target.value); apply({ category: e.target.value }); }} style={sel()}>
        <option value="">All Categories</option>
        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
      <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); apply({ dateFrom: e.target.value }); }} style={sel()} title="Due from" />
      <input type="date" value={dateTo}   onChange={e => { setDateTo(e.target.value);   apply({ dateTo: e.target.value });   }} style={sel()} title="Due to" />
      <button onClick={() => { setQ(""); setStatus(""); setCategory(""); setDateFrom(""); setDateTo(""); onFilter({}); }}
        style={btnStyle("secondary", { minHeight: 44 })}>
        Clear
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// AI PANEL  (Day 8)
// ─────────────────────────────────────────────
function AiPanel({ obligationId, obligationText }) {
  const [question,  setQuestion]  = useState("");
  const [response,  setResponse]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true); setError(null); setResponse(null);
    try {
      const { data } = await axios.post(`${AI}/query`, {
        question,
        context: obligationText,
        obligation_id: obligationId,
      });
      setResponse(data);
    } catch (e) {
      setError(e.response?.data?.error || "AI service unavailable. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={card({ border: `1.5px solid ${BRAND}20`, marginTop: "1.25rem" })}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: BRAND, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        🤖 AI Analysis
      </h3>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask()}
          placeholder="Ask about this obligation…"
          style={inputStyle({ flex: 1 })}
        />
        <button onClick={ask} disabled={loading} style={btnStyle("primary", { minWidth: 100 })}>
          {loading ? "…" : "Ask AI"}
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: 12 }}>
          <Skeleton h={12} />
          <div style={{ marginTop: 6 }}><Skeleton h={12} w="80%" /></div>
          <div style={{ marginTop: 6 }}><Skeleton h={12} w="60%" /></div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, padding: "12px 16px", background: "#FCEBEB", borderRadius: 8, color: "#A32D2D", fontSize: 13 }}>
          {error}
          <button onClick={ask} style={{ marginLeft: 12, textDecoration: "underline", background: "none", border: "none", color: "#A32D2D", cursor: "pointer" }}>
            Retry
          </button>
        </div>
      )}

      {response && !loading && (
        <div style={{ marginTop: 12, padding: "14px 16px", background: "#f8fafc", borderRadius: 8, borderLeft: `4px solid ${BRAND}` }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#334155", margin: 0, whiteSpace: "pre-wrap" }}>
            {response.answer || response.content || JSON.stringify(response)}
          </p>
          {response.sources?.length > 0 && (
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 8, marginBottom: 0 }}>
              Sources: {response.sources.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STREAMING REPORT  (Day 10)
// ─────────────────────────────────────────────
function StreamingReport({ obligationId }) {
  const [lines,    setLines]    = useState([]);
  const [running,  setRunning]  = useState(false);
  const [done,     setDone]     = useState(false);
  const esRef = useRef(null);

  const start = () => {
    if (running) return;
    setLines([]); setDone(false); setRunning(true);
    esRef.current = new EventSource(`${AI}/generate-report?id=${obligationId}&token=${localStorage.getItem("cor_token")}`);
    esRef.current.onmessage = e => setLines(prev => [...prev, e.data]);
    esRef.current.onerror   = () => { setRunning(false); setDone(true); esRef.current?.close(); };
    esRef.current.addEventListener("done", () => { setRunning(false); setDone(true); esRef.current?.close(); });
  };

  useEffect(() => () => esRef.current?.close(), []);

  return (
    <div style={card({ marginTop: "1.25rem" })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>📄 Generate AI Report</h3>
        <button onClick={start} disabled={running} style={btnStyle(running ? "secondary" : "primary")}>
          {running ? "Generating…" : done ? "Regenerate" : "Generate Report"}
        </button>
      </div>
      {(lines.length > 0 || running) && (
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "1rem", fontFamily: "monospace", fontSize: 13, maxHeight: 320, overflowY: "auto", lineHeight: 1.6 }}>
          {lines.map((l, i) => <div key={i}>{l}</div>)}
          {running && <span style={{ animation: "pulse 1s infinite", opacity: 0.5 }}>▌</span>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CSV EXPORT  (Day 10)
// ─────────────────────────────────────────────
function exportCSV(rows) {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `compliance-obligations-${Date.now()}.csv`;
  a.click();
}

// ─────────────────────────────────────────────
// KPI CARD  (Day 6)
// ─────────────────────────────────────────────
function KpiCard({ label, value, color = BRAND, icon = "📊", trend }) {
  return (
    <div style={card({ textAlign: "center", borderTop: `4px solid ${color}`, minWidth: 0 })}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{label}</div>
      {trend !== undefined && (
        <div style={{ fontSize: 11, color: trend >= 0 ? "#3B6D11" : "#A32D2D", marginTop: 2 }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD PAGE  (Day 6)
// ─────────────────────────────────────────────
function DashboardPage({ setPage }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/obligations/stats`)
      .then(r => setStats(r.data))
      .catch(() => setStats({
        total: 0, active: 0, overdue: 0, completed: 0,
        byCategory: [], byStatus: [], byMonth: [],
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16 }}>
      {[...Array(4)].map((_, i) => <div key={i} style={card()}><Skeleton h={80} /></div>)}
    </div>
  );

  const byCategory = stats?.byCategory || [];
  const byStatus   = stats?.byStatus   || [];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: "1.25rem" }}>Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16, marginBottom: "1.5rem" }}>
        <KpiCard label="Total Obligations" value={stats?.total  ?? 0}     color={BRAND}     icon="📋" />
        <KpiCard label="Active"            value={stats?.active ?? 0}     color="#185FA5"   icon="✅" />
        <KpiCard label="Overdue"           value={stats?.overdue ?? 0}    color="#A32D2D"   icon="⚠️" />
        <KpiCard label="Completed"         value={stats?.completed ?? 0}  color="#3B6D11"   icon="🏁" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 16 }}>
        <div style={card()}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#475569" }}>By Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCategory} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill={BRAND} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={card()}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#475569" }}>By Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStatus} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="status" label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}>
                {byStatus.map((e, i) => (
                  <Cell key={i} fill={Object.values(STATUS_COLORS)[i % 5]?.dot || "#888"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: 16, ...card() }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#475569", margin: 0 }}>Quick Actions</h3>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => setPage("list")}   style={btnStyle("primary")}>View All Obligations</button>
          <button onClick={() => setPage("create")} style={btnStyle("ghost")}>+ New Obligation</button>
          <button onClick={() => setPage("analytics")} style={btnStyle("secondary")}>Analytics</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ANALYTICS PAGE  (Day 11)
// ─────────────────────────────────────────────
const PERIOD_OPTIONS = ["3m", "6m", "1y", "all"];

function AnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState("6m");

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/api/obligations/analytics?period=${period}`)
      .then(r => setData(r.data))
      .catch(() => setData({
        trend:       Array.from({ length: 6 }, (_, i) => ({ month: `Month ${i + 1}`, created: Math.floor(Math.random() * 10), closed: Math.floor(Math.random() * 8) })),
        byCategory:  CATEGORIES.slice(0, 6).map(c => ({ name: c, count: Math.floor(Math.random() * 20 + 2) })),
        byStatus:    STATUSES.map(s => ({ status: s, count: Math.floor(Math.random() * 15 + 1) })),
        complianceRate: 74,
      }))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Analytics</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {PERIOD_OPTIONS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={btnStyle(p === period ? "primary" : "secondary", { padding: "6px 14px", minHeight: 36, fontSize: 13 })}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={card()}><Skeleton h={250} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={card()}><Skeleton h={220} /></div>
            <div style={card()}><Skeleton h={220} /></div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={card()}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 12 }}>Obligations Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke={BRAND}    strokeWidth={2} dot={{ r: 3 }} name="Created" />
                <Line type="monotone" dataKey="closed"  stroke="#3B6D11" strokeWidth={2} dot={{ r: 3 }} name="Closed" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            <div style={card()}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 12 }}>By Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.byCategory || []} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill={BRAND} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={card()}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 12 }}>Status Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data?.byStatus || []} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="count" nameKey="status">
                    {(data?.byStatus || []).map((e, i) => (
                      <Cell key={i} fill={Object.values(STATUS_COLORS)[i % 5]?.dot || "#888"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={card()}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Overall Compliance Rate</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: BRAND, lineHeight: 1.1 }}>{data?.complianceRate ?? 0}%</div>
              </div>
              <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 20, height: 12, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${data?.complianceRate ?? 0}%`, background: BRAND, borderRadius: 20, transition: "width 0.8s ease" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// OBLIGATION FORM  (Day 3)
// ─────────────────────────────────────────────
const FORM_DEFAULTS = { title: "", description: "", category: "", status: "DRAFT", dueDate: "", assignedTo: "", riskScore: "", regulatoryBody: "", jurisdiction: "" };

function ObligationForm({ initial, onSave, onCancel, title = "New Obligation" }) {
  const [form,   setForm]   = useState({ ...FORM_DEFAULTS, ...initial });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = "Title is required";
    if (!form.category)        e.category = "Category is required";
    if (!form.status)          e.status   = "Status is required";
    if (!form.dueDate)         e.dueDate  = "Due date is required";
    if (form.riskScore && (isNaN(form.riskScore) || form.riskScore < 0 || form.riskScore > 100))
                               e.riskScore = "Score must be 0–100";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally { setSaving(false); }
  };

  const field = (name, label, opts = {}) => {
    const err = errors[name];
    return (
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</label>
        {opts.type === "select" ? (
          <select value={form[name]} onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(v => ({ ...v, [name]: "" })); }} style={{ ...inputStyle(), borderColor: err ? "#E24B4A" : undefined }}>
            <option value="">Select…</option>
            {opts.options.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : opts.type === "textarea" ? (
          <textarea rows={3} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} style={{ ...inputStyle(), resize: "vertical", borderColor: err ? "#E24B4A" : undefined }} />
        ) : (
          <input type={opts.type || "text"} value={form[name]} onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(v => ({ ...v, [name]: "" })); }} style={{ ...inputStyle(), borderColor: err ? "#E24B4A" : undefined }} placeholder={opts.placeholder} />
        )}
        {err && <p style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>{err}</p>}
      </div>
    );
  };

  return (
    <div style={card({ maxWidth: 720, margin: "0 auto" })}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: "1.5rem", color: "#1e293b" }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "0 1.5rem" }}>
        {field("title", "Title *")}
        {field("category", "Category *", { type: "select", options: CATEGORIES })}
        {field("status",   "Status *",   { type: "select", options: STATUSES })}
        {field("dueDate",  "Due Date *", { type: "date" })}
        {field("assignedTo",    "Assigned To",     { placeholder: "e.g. John Smith" })}
        {field("riskScore",     "Risk Score (0-100)", { type: "number", placeholder: "e.g. 75" })}
        {field("regulatoryBody","Regulatory Body",  { placeholder: "e.g. SEBI" })}
        {field("jurisdiction",  "Jurisdiction",    { placeholder: "e.g. India" })}
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        {field("description", "Description", { type: "textarea" })}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "0.5rem" }}>
        <button onClick={onCancel} style={btnStyle("secondary")}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving} style={btnStyle("primary", { minWidth: 110 })}>
          {saving ? "Saving…" : "Save Obligation"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OBLIGATION DETAIL  (Day 7)
// ─────────────────────────────────────────────
function ObligationDetail({ id, onEdit, onDelete, onBack }) {
  const [ob,      setOb]      = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/api/obligations/${id}`)
      .then(r => setOb(r.data))
      .catch(() => setOb(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={card()}>
      <Skeleton h={24} w="60%" />
      <div style={{ marginTop: 12 }}><Skeleton h={14} /></div>
      <div style={{ marginTop: 8 }}><Skeleton h={14} w="80%" /></div>
    </div>
  );
  if (!ob) return <EmptyState message="Obligation not found" icon="🔍" />;

  const score = ob.riskScore ?? 0;
  const scoreColor = score >= 75 ? "#A32D2D" : score >= 50 ? "#854F0B" : "#3B6D11";

  return (
    <div>
      <button onClick={onBack} style={{ ...btnStyle("ghost", { marginBottom: "1rem" }), display: "flex", alignItems: "center", gap: 6 }}>
        ← Back to list
      </button>

      <div style={card({ marginBottom: 16 })}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{ob.title}</h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <StatusBadge status={ob.status} />
              <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 500 }}>{ob.category}</span>
              {ob.jurisdiction && <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 20, padding: "3px 10px", fontSize: 12 }}>🌍 {ob.jurisdiction}</span>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Risk Score</div>
            </div>
          </div>
        </div>

        {ob.description && <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 16, fontSize: 14 }}>{ob.description}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginTop: 16 }}>
          {[
            ["Due Date",        ob.dueDate?.split("T")[0] || "—"],
            ["Assigned To",     ob.assignedTo             || "—"],
            ["Regulatory Body", ob.regulatoryBody          || "—"],
            ["Created",         ob.createdAt?.split("T")[0] || "—"],
            ["Last Modified",   ob.updatedAt?.split("T")[0] || "—"],
          ].map(([k, v]) => (
            <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={() => onEdit(ob)} style={btnStyle("primary")}>✏️ Edit</button>
          <button onClick={() => { if (confirm("Delete this obligation?")) onDelete(id); }} style={btnStyle("danger")}>🗑️ Delete</button>
        </div>
      </div>

      <AiPanel obligationId={id} obligationText={`${ob.title}. ${ob.description || ""} Category: ${ob.category}, Status: ${ob.status}, Risk: ${score}`} />
      <StreamingReport obligationId={id} />
    </div>
  );
}

// ─────────────────────────────────────────────
// OBLIGATION LIST  (Days 2, 4, 9, 10)
// ─────────────────────────────────────────────
const SORT_FIELDS = ["title", "category", "status", "dueDate", "riskScore", "createdAt"];

function ObligationList({ onView, onEdit, onCreate }) {
  const [rows,      setRows]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(0);
  const [totalPages,setTotalPages]= useState(0);
  const [sortBy,    setSortBy]    = useState("createdAt");
  const [sortDir,   setSortDir]   = useState("desc");
  const [filters,   setFilters]   = useState({});

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, size: 20, sortBy, sortDir, ...filters };
    axios.get(`${API}/api/obligations`, { params })
      .then(r => {
        const d = r.data;
        setRows(Array.isArray(d) ? d : (d.content || []));
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [page, sortBy, sortDir, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = col => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) => sortBy === col ? (sortDir === "asc" ? " ↑" : " ↓") : " ⇅";

  const handleDelete = async id => {
    if (!confirm("Delete this obligation?")) return;
    await axios.delete(`${API}/api/obligations/${id}`);
    fetchData();
  };

  const colStyle = { padding: "12px 14px", textAlign: "left", fontSize: 13, color: "#475569", fontWeight: 600, whiteSpace: "nowrap", userSelect: "none", cursor: "pointer" };
  const cellStyle = { padding: "12px 14px", fontSize: 13, color: "#334155", borderBottom: "1px solid #f1f5f9" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Compliance Obligations</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => exportCSV(rows)} style={btnStyle("secondary")}>⬇ Export CSV</button>
          <button onClick={onCreate}              style={btnStyle("primary")}>+ New Obligation</button>
        </div>
      </div>

      <SearchFilterBar onFilter={f => { setFilters(f); setPage(0); }} />

      <div style={card({ padding: 0, overflow: "hidden" })}>
        {loading ? (
          <div style={{ padding: "1.25rem" }}>
            {[...Array(5)].map((_, i) => <div key={i} style={{ marginBottom: 12 }}><Skeleton h={18} /></div>)}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState message="No obligations found" icon="📋" sub="Create your first obligation to get started" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <tr>
                  {["title","category","status","dueDate","riskScore","assignedTo"].map(col => (
                    <th key={col} style={colStyle} onClick={() => handleSort(col)}>
                      {col.replace(/([A-Z])/g, " $1").replace(/^\w/, c => c.toUpperCase())}
                      <SortIcon col={col} />
                    </th>
                  ))}
                  <th style={{ ...colStyle, cursor: "default" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} style={{ transition: "background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={cellStyle}>
                      <span onClick={() => onView(r.id)} style={{ color: BRAND, cursor: "pointer", fontWeight: 500, textDecoration: "underline" }}>
                        {r.title}
                      </span>
                    </td>
                    <td style={cellStyle}>{r.category}</td>
                    <td style={cellStyle}><StatusBadge status={r.status} /></td>
                    <td style={cellStyle}>{r.dueDate?.split("T")[0] || "—"}</td>
                    <td style={{ ...cellStyle, fontWeight: 700, color: (r.riskScore ?? 0) >= 75 ? "#A32D2D" : (r.riskScore ?? 0) >= 50 ? "#854F0B" : "#3B6D11" }}>
                      {r.riskScore ?? "—"}
                    </td>
                    <td style={cellStyle}>{r.assignedTo || "—"}</td>
                    <td style={cellStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => onView(r.id)}  style={btnStyle("secondary", { padding: "5px 10px", minHeight: 32, fontSize: 12 })}>View</button>
                        <button onClick={() => onEdit(r)}      style={btnStyle("ghost",     { padding: "5px 10px", minHeight: 32, fontSize: 12 })}>Edit</button>
                        <button onClick={() => handleDelete(r.id)} style={btnStyle("danger", { padding: "5px 10px", minHeight: 32, fontSize: 12 })}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGIN PAGE  (Day 5)
// ─────────────────────────────────────────────
function LoginPage() {
  const { login }  = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
  if (!username || !password) {
    setError("Please enter username and password");
    return;
  }

  setLoading(true);
  setError("");

  try {
    await login(username, password);

    // ✅ THIS LINE FIXES YOUR ISSUE
    window.location.reload();

  } catch (e) {
    setError("Invalid credentials");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={card({ width: "100%", maxWidth: 400 })}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: 56, height: 56, background: BRAND, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 24 }}>🛡️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Compliance Register</h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>Sign in to your account</p>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter username" style={inputStyle()} autoComplete="username" />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter password" style={inputStyle()} autoComplete="current-password" />
        </div>

        {error && <div style={{ background: "#FCEBEB", color: "#A32D2D", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: "1rem" }}>{error}</div>}

        <button onClick={handleLogin} disabled={loading} style={{ ...btnStyle("primary"), width: "100%", justifyContent: "center" }}>
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: "1rem" }}>
          Demo: admin / password
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// NAV BAR
// ─────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",  icon: "🏠" },
  { id: "list",       label: "Obligations",icon: "📋" },
  { id: "analytics",  label: "Analytics",  icon: "📊" },
];

function NavBar({ currentPage, setPage }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ background: BRAND, color: "#fff", padding: "0 1.5rem", display: "flex", alignItems: "center", height: 60, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "1.5rem" }}>
        <span style={{ fontSize: 20 }}>🛡️</span>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>Compliance Register</span>
      </div>

      {/* Desktop nav */}
      <div style={{ display: "flex", gap: 4, flex: 1 }} className="nav-desktop">
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            background: currentPage === n.id ? "rgba(255,255,255,0.2)" : "transparent",
            color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, cursor: "pointer",
            fontSize: 14, fontWeight: currentPage === n.id ? 600 : 400, display: "flex", alignItems: "center", gap: 6,
            minHeight: 44,
          }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
        <span style={{ fontSize: 13, opacity: 0.85 }}>👤 {user?.username || "User"}</span>
        <button onClick={logout} style={{ ...btnStyle("secondary", { minHeight: 36, padding: "6px 12px", fontSize: 12 }), background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
// MAIN APP  (Day 1 + all days)
// ─────────────────────────────────────────────
function AppInner() {
  const { isAuthenticated } = useAuth();
  const [page,       setPage]       = useState("dashboard");
  const [viewId,     setViewId]     = useState(null);
  const [editRecord, setEditRecord] = useState(null);

  if (!isAuthenticated) return <LoginPage />;

  const handleView   = id => { setViewId(id); setPage("detail"); };
  const handleEdit   = ob => { setEditRecord(ob); setPage("edit"); };
  const handleCreate = ()  => { setEditRecord(null); setPage("create"); };

  const handleSave = async form => {
    if (editRecord?.id) {
      await axios.put(`${API}/api/obligations/${editRecord.id}`, form);
    } else {
      await axios.post(`${API}/api/obligations`, form);
    }
    setPage("list");
  };

  const handleDelete = async id => {
    await axios.delete(`${API}/api/obligations/${id}`);
    setPage("list");
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage setPage={setPage} />;
      case "list":
        return <ObligationList onView={handleView} onEdit={handleEdit} onCreate={handleCreate} />;
      case "detail":
        return <ObligationDetail id={viewId} onEdit={handleEdit} onDelete={handleDelete} onBack={() => setPage("list")} />;
      case "create":
        return <ObligationForm title="New Obligation" onSave={handleSave} onCancel={() => setPage("list")} />;
      case "edit":
        return <ObligationForm title="Edit Obligation" initial={editRecord} onSave={handleSave} onCancel={() => setPage("list")} />;
      case "analytics":
        return <AnalyticsPage />;
      default:
        return <DashboardPage setPage={setPage} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus, textarea:focus { outline: 2px solid ${BRAND}; outline-offset: 1px; }
        @media (max-width: 600px) {
          .nav-desktop > button > span:last-child { display: none; }
        }
      `}</style>

      <NavBar currentPage={page} setPage={setPage} />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <ErrorBoundary>
          <Suspense fallback={<Skeleton h={200} />}>
            {renderPage()}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
