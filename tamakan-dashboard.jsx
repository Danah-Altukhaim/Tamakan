import { useState } from "react";
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const NAVY = "#0D1B4B";
const BLUE = "#1A3A8F";
const ACCENT = "#2B6CB0";
const GOLD = "#C9A84C";
const LIGHT = "#E8EEF7";
const WHITE = "#FFFFFF";

const user = {
  name: "Shahad Al-Rashidi",
  role: "Reservoir Engineer",
  department: "Engineering & Reservoir",
  avatar: "SR",
  joined: "Jan 2024",
  overallProgress: 68,
  streak: 12,
  points: 2340,
  rank: "Advanced Learner",
};

const tracks = [
  {
    id: 1,
    title: "Reservoir Simulation Fundamentals",
    category: "Engineering & Reservoir",
    icon: "🛢️",
    color: BLUE,
    progress: 90,
    modules: [
      { id: 1, title: "Introduction to Reservoir Engineering", duration: "45 min", status: "completed", type: "video" },
      { id: 2, title: "Fluid Properties & PVT Analysis", duration: "60 min", status: "completed", type: "reading" },
      { id: 3, title: "Reservoir Pressure Concepts", duration: "50 min", status: "completed", type: "video" },
      { id: 4, title: "Material Balance Equations", duration: "75 min", status: "in-progress", type: "interactive" },
      { id: 5, title: "Decline Curve Analysis", duration: "55 min", status: "locked", type: "video" },
    ],
  },
  {
    id: 2,
    title: "Intersect (IX) Simulation Tool",
    category: "Engineering & Reservoir",
    icon: "⚙️",
    color: "#1e5fa8",
    progress: 65,
    modules: [
      { id: 1, title: "IX Interface & Navigation", duration: "30 min", status: "completed", type: "video" },
      { id: 2, title: "Building Your First Model", duration: "90 min", status: "completed", type: "interactive" },
      { id: 3, title: "Grid Design & Upscaling", duration: "70 min", status: "in-progress", type: "reading" },
      { id: 4, title: "Well Control & Constraints", duration: "60 min", status: "locked", type: "video" },
      { id: 5, title: "Running & Debugging Simulations", duration: "80 min", status: "locked", type: "interactive" },
    ],
  },
  {
    id: 3,
    title: "IXFM Workflow Mastery",
    category: "Engineering & Reservoir",
    icon: "🔬",
    color: "#164d8f",
    progress: 40,
    modules: [
      { id: 1, title: "IXFM Overview & Architecture", duration: "40 min", status: "completed", type: "reading" },
      { id: 2, title: "Integrated Asset Modeling Basics", duration: "65 min", status: "in-progress", type: "video" },
      { id: 3, title: "Network & Surface Facilities", duration: "75 min", status: "locked", type: "interactive" },
      { id: 4, title: "History Matching Techniques", duration: "90 min", status: "locked", type: "video" },
      { id: 5, title: "Production Forecasting", duration: "85 min", status: "locked", type: "reading" },
    ],
  },
  {
    id: 4,
    title: "Well Test Analysis",
    category: "Engineering & Reservoir",
    icon: "📊",
    color: "#0f3875",
    progress: 20,
    modules: [
      { id: 1, title: "Pressure Transient Analysis", duration: "55 min", status: "completed", type: "video" },
      { id: 2, title: "Buildup & Drawdown Tests", duration: "70 min", status: "locked", type: "reading" },
      { id: 3, title: "Interpretation Methods", duration: "80 min", status: "locked", type: "interactive" },
      { id: 4, title: "Data Quality & Validation", duration: "45 min", status: "locked", type: "video" },
    ],
  },
  {
    id: 5,
    title: "Field Operations & Safety",
    category: "Engineering & Reservoir",
    icon: "🦺",
    color: "#C9A84C",
    progress: 100,
    completed: true,
    modules: [
      { id: 1, title: "Site Safety Protocols", duration: "40 min", status: "completed", type: "video" },
      { id: 2, title: "Emergency Response Procedures", duration: "50 min", status: "completed", type: "reading" },
      { id: 3, title: "Permit to Work System", duration: "35 min", status: "completed", type: "interactive" },
      { id: 4, title: "Field Reporting Standards", duration: "30 min", status: "completed", type: "video" },
    ],
  },
];

const weeklyActivity = [
  { day: "Sun", mins: 0 },
  { day: "Mon", mins: 45 },
  { day: "Tue", mins: 90 },
  { day: "Wed", mins: 30 },
  { day: "Thu", mins: 75 },
  { day: "Fri", mins: 0 },
  { day: "Sat", mins: 60 },
];

const statusColor = { completed: "#22c55e", "in-progress": GOLD, locked: "#cbd5e1" };
const statusLabel = { completed: "Completed", "in-progress": "In Progress", locked: "Locked" };
const typeIcon = { video: "▶", reading: "📖", interactive: "✦" };

function CircleProgress({ value, size = 80, stroke = 7, color = GOLD }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        style={{ fontSize: size * 0.2, fontWeight: 700, fill: NAVY, fontFamily: "system-ui" }}>
        {value}%
      </text>
    </svg>
  );
}

function Badge({ label, color = BLUE }) {
  return (
    <span style={{
      background: color + "18", color, border: `1px solid ${color}40`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
    }}>{label}</span>
  );
}

export default function TAMAKANDashboard() {
  const [activeTrack, setActiveTrack] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const completedTracks = tracks.filter(t => t.progress === 100).length;
  const inProgressTracks = tracks.filter(t => t.progress > 0 && t.progress < 100).length;
  const totalModules = tracks.reduce((s, t) => s + t.modules.length, 0);
  const completedModules = tracks.reduce((s, t) => s + t.modules.filter(m => m.status === "completed").length, 0);

  const currentTrack = activeTrack !== null ? tracks.find(t => t.id === activeTrack) : null;

  return (
    <div style={{
      minHeight: "100vh", background: "#f0f4fa",
      fontFamily: "'Inter', system-ui, sans-serif", color: NAVY,
    }}>
      {/* TOP NAV */}
      <div style={{
        background: NAVY, color: WHITE, padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60, boxShadow: "0 2px 12px #0D1B4B44",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: GOLD, color: NAVY, fontWeight: 900,
            fontSize: 15, padding: "4px 10px", borderRadius: 6, letterSpacing: 2,
          }}>TAMAKAN</div>
          <span style={{ color: "#7B9EC8", fontSize: 13 }}>تمكّن · Learning Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "#7B9EC8" }}>{user.role}</div>
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: GOLD, color: NAVY, display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 800, fontSize: 14,
          }}>{user.avatar}</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{
        background: WHITE, borderBottom: "1px solid #e2e8f0",
        padding: "0 32px", display: "flex", gap: 0,
      }}>
        {["overview", "my tracks", "explore"].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setActiveTrack(null); }}
            style={{
              border: "none", background: "none", padding: "14px 20px",
              fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
              color: activeTab === tab ? BLUE : "#94a3b8",
              borderBottom: activeTab === tab ? `2.5px solid ${BLUE}` : "2.5px solid transparent",
              marginBottom: -1,
            }}>{tab}</button>
        ))}
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>
            {/* Welcome */}
            <div style={{
              background: `linear-gradient(120deg, ${NAVY} 0%, ${BLUE} 100%)`,
              borderRadius: 16, padding: "28px 32px", color: WHITE, marginBottom: 24,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                  Welcome back, {user.name.split(" ")[0]} 👋
                </div>
                <div style={{ color: "#A8BFDF", fontSize: 14 }}>
                  You're on a <span style={{ color: GOLD, fontWeight: 700 }}>{user.streak}-day streak</span> · Keep it up!
                </div>
                <div style={{ marginTop: 16, display: "flex", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: GOLD }}>{user.points.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: "#A8BFDF" }}>Learning Points</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{completedTracks}/{tracks.length}</div>
                    <div style={{ fontSize: 11, color: "#A8BFDF" }}>Tracks Done</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>{completedModules}/{totalModules}</div>
                    <div style={{ fontSize: 11, color: "#A8BFDF" }}>Modules Done</div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <CircleProgress value={user.overallProgress} size={110} stroke={9} color={GOLD} />
                <div style={{ fontSize: 12, color: "#A8BFDF", marginTop: 6 }}>Overall Progress</div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Rank", value: user.rank, icon: "🏆", color: GOLD },
                { label: "In Progress", value: `${inProgressTracks} Tracks`, icon: "📚", color: BLUE },
                { label: "Streak", value: `${user.streak} days`, icon: "🔥", color: "#e85d04" },
                { label: "Department", value: "Engineering", icon: "🛢️", color: ACCENT },
              ].map(s => (
                <div key={s.label} style={{
                  background: WHITE, borderRadius: 12, padding: "18px 20px",
                  boxShadow: "0 1px 6px #0D1B4B12", border: "1px solid #e2e8f0",
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Weekly activity + continue learning */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20 }}>
              <div style={{ background: WHITE, borderRadius: 14, padding: 24, boxShadow: "0 1px 6px #0D1B4B12", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>This Week's Activity</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={weeklyActivity} barSize={22}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(v) => [`${v} min`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="mins" radius={[6, 6, 0, 0]}>
                      {weeklyActivity.map((e, i) => (
                        <Cell key={i} fill={e.mins > 0 ? BLUE : "#e2e8f0"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
                  300 min total this week
                </div>
              </div>

              <div style={{ background: WHITE, borderRadius: 14, padding: 24, boxShadow: "0 1px 6px #0D1B4B12", border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Continue Learning</div>
                {tracks.filter(t => t.progress > 0 && t.progress < 100).map(t => (
                  <div key={t.id}
                    onClick={() => { setActiveTab("my tracks"); setActiveTrack(t.id); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
                      borderBottom: "1px solid #f1f5f9", cursor: "pointer",
                    }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, background: LIGHT,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                    }}>{t.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                      <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                        <div style={{ height: 6, width: `${t.progress}%`, background: BLUE, borderRadius: 3, transition: "width 0.5s" }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, flexShrink: 0 }}>{t.progress}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MY TRACKS TAB ── */}
        {activeTab === "my tracks" && !currentTrack && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>My Learning Tracks</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 18 }}>
              {tracks.map(t => (
                <div key={t.id} onClick={() => setActiveTrack(t.id)}
                  style={{
                    background: WHITE, borderRadius: 14, padding: 22, cursor: "pointer",
                    boxShadow: "0 2px 10px #0D1B4B10", border: "1px solid #e2e8f0",
                    transition: "box-shadow 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px #0D1B4B22"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 10px #0D1B4B10"; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                    }}>{t.icon}</div>
                    {t.progress === 100 && <Badge label="✓ Complete" color="#16a34a" />}
                    {t.progress > 0 && t.progress < 100 && <Badge label="In Progress" color={BLUE} />}
                    {t.progress === 0 && <Badge label="Not Started" color="#94a3b8" />}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>{t.modules.length} modules</div>
                  <div style={{ height: 7, background: "#e2e8f0", borderRadius: 4, marginBottom: 8 }}>
                    <div style={{
                      height: 7, width: `${t.progress}%`,
                      background: t.progress === 100 ? "#22c55e" : BLUE,
                      borderRadius: 4, transition: "width 0.6s",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {t.modules.filter(m => m.status === "completed").length}/{t.modules.length} complete
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.progress === 100 ? "#16a34a" : BLUE }}>{t.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TRACK DETAIL ── */}
        {activeTab === "my tracks" && currentTrack && (
          <div>
            <button onClick={() => setActiveTrack(null)}
              style={{
                border: "none", background: "none", cursor: "pointer",
                color: BLUE, fontSize: 13, fontWeight: 600, padding: "0 0 18px 0",
                display: "flex", alignItems: "center", gap: 6,
              }}>← Back to Tracks</button>

            <div style={{
              background: `linear-gradient(120deg, ${NAVY}, ${BLUE})`,
              borderRadius: 14, padding: "28px 28px 24px", color: WHITE, marginBottom: 24,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{currentTrack.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{currentTrack.title}</div>
                <div style={{ color: "#A8BFDF", fontSize: 13 }}>
                  {currentTrack.modules.filter(m => m.status === "completed").length} of {currentTrack.modules.length} modules completed
                </div>
              </div>
              <CircleProgress value={currentTrack.progress} size={100} stroke={8} color={GOLD} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {currentTrack.modules.map((mod, i) => (
                <div key={mod.id} style={{
                  background: WHITE, borderRadius: 12, padding: "16px 20px",
                  boxShadow: "0 1px 6px #0D1B4B0E", border: "1px solid #e2e8f0",
                  display: "flex", alignItems: "center", gap: 16,
                  opacity: mod.status === "locked" ? 0.55 : 1,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: statusColor[mod.status] + "20",
                    border: `2px solid ${statusColor[mod.status]}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, color: statusColor[mod.status],
                  }}>
                    {mod.status === "completed" ? "✓" : mod.status === "in-progress" ? "▶" : "🔒"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{mod.title}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{typeIcon[mod.type]} {mod.type}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>⏱ {mod.duration}</span>
                    </div>
                  </div>
                  <Badge
                    label={statusLabel[mod.status]}
                    color={mod.status === "completed" ? "#16a34a" : mod.status === "in-progress" ? "#b45309" : "#94a3b8"}
                  />
                  {mod.status !== "locked" && (
                    <button style={{
                      background: mod.status === "completed" ? "#f0fdf4" : BLUE,
                      color: mod.status === "completed" ? "#16a34a" : WHITE,
                      border: `1px solid ${mod.status === "completed" ? "#bbf7d0" : BLUE}`,
                      borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>
                      {mod.status === "completed" ? "Review" : "Continue"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EXPLORE TAB ── */}
        {activeTab === "explore" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Explore Learning Material</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Engineering & Reservoir Department</div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 20 }}>
              {[
                {
                  title: "Reservoir Simulation Handbook",
                  type: "PDF Guide", icon: "📄", tag: "Reference",
                  desc: "Comprehensive reference for simulation techniques used in operations.",
                  tagColor: BLUE,
                },
                {
                  title: "IX Quick Start Guide",
                  type: "Video Series", icon: "🎥", tag: "Beginner",
                  desc: "3-part video series to get you up and running in Intersect.",
                  tagColor: "#16a34a",
                },
                {
                  title: "SBHP Survey Workflow",
                  type: "Interactive", icon: "✦", tag: "Workflow",
                  desc: "Step-by-step guided walkthrough of the SBHP proposal system.",
                  tagColor: GOLD,
                },
                {
                  title: "Material Balance Deep Dive",
                  type: "Recorded Lecture", icon: "▶", tag: "Intermediate",
                  desc: "2-hour lecture on material balance from the engineering team.",
                  tagColor: ACCENT,
                },
                {
                  title: "History Matching Best Practices",
                  type: "PDF Guide", icon: "📄", tag: "Advanced",
                  desc: "Internal guidelines for history matching workflows.",
                  tagColor: "#7c3aed",
                },
                {
                  title: "Production Forecasting Methods",
                  type: "Interactive", icon: "✦", tag: "Advanced",
                  desc: "Hands-on exercises for decline curve and simulation-based forecasting.",
                  tagColor: "#dc2626",
                },
              ].map((item, i) => (
                <div key={i} style={{
                  background: WHITE, borderRadius: 14, padding: 22,
                  boxShadow: "0 1px 8px #0D1B4B10", border: "1px solid #e2e8f0",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, background: LIGHT,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    }}>{item.icon}</div>
                    <Badge label={item.tag} color={item.tagColor} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: ACCENT, fontWeight: 600, marginBottom: 8 }}>{item.type}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, lineHeight: 1.6 }}>{item.desc}</div>
                  <button style={{
                    width: "100%", background: LIGHT, color: BLUE, border: `1px solid ${BLUE}30`,
                    borderRadius: 8, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}>Open Resource →</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
