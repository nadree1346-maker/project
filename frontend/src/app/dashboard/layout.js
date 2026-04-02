"use client";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { path: "/dashboard",         icon: "bxs-dashboard",       label: "หน้าแรก",  color: "#60a5fa" },
    { path: "/dashboard/student", icon: "bxs-user",            label: "นักศึกษา", color: "#34d399" },
    { path: "/dashboard/course",  icon: "bxs-book",            label: "หลักสูตร", color: "#f472b6" },
    { path: "/dashboard/subject", icon: "bxs-notepad",         label: "รายวิชา",  color: "#fbbf24" },
    { path: "/dashboard/grade",   icon: "bxs-bar-chart-alt-2", label: "เกรด",     color: "#a78bfa" },
  ];

  return (
    <>
      <style suppressHydrationWarning>{css}</style>

      <div className="dl-root">
        {/* ═══ SIDEBAR ═══ */}
        <aside className="dl-sidebar">
          {/* Brand */}
          <div className="dl-brand">
            <div className="dl-brand-logo">
              <img src="/logo.png" alt="logo" className="dl-logo-img" />
            </div>
            <div className="dl-brand-text">
              <span className="dl-brand-name">SSCS</span>
              <span className="dl-brand-sub">Simulation System for Computational Science</span>
            </div>
          </div>

          {/* Divider */}
          <div className="dl-divider" />

          {/* Nav label */}
          <p className="dl-nav-label">MAIN MENU</p>

          {/* Menu */}
          <nav className="dl-nav">
            {menuItems.map((item) => {
              const active = pathname === item.path;
              return (
                <button
                  key={item.path}
                  className={`dl-nav-item ${active ? "dl-nav-item--active" : ""}`}
                  style={{ "--item-color": item.color }}
                  onClick={() => router.push(item.path)}
                >
                  <span className="dl-nav-icon-wrap">
                    <i className={`bx ${item.icon}`}></i>
                  </span>
                  <span className="dl-nav-label-text">{item.label}</span>
                  {active && <span className="dl-nav-dot" />}
                </button>
              );
            })}
          </nav>

          <div className="dl-divider" style={{ marginTop: "auto" }} />

          {/* Bottom */}
          <div className="dl-sidebar-bottom">
            <button className="dl-nav-item dl-nav-item--bottom">
              <span className="dl-nav-icon-wrap"><i className="bx bxs-cog"></i></span>
              <span className="dl-nav-label-text">ตั้งค่า</span>
            </button>
            <button
              className="dl-nav-item dl-nav-item--bottom dl-nav-item--logout"
              onClick={() => router.push("/login")}
            >
              <span className="dl-nav-icon-wrap"><i className="bx bxs-log-out-circle"></i></span>
              <span className="dl-nav-label-text">ออกจากระบบ</span>
            </button>
          </div>
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="dl-content">
          {/* Topbar */}
          <header className="dl-topbar">
            <div className="dl-topbar-search">
              <i className="bx bx-search dl-search-icon"></i>
              <input type="search" placeholder="ค้นหา..." className="dl-search-input" />
            </div>
            <div className="dl-topbar-right">
              <div className="dl-profile">
                <img src="/pf.png" alt="profile" className="dl-avatar" />
                <div className="dl-profile-info">
                  <span className="dl-profile-name">Admin</span>
                  <span className="dl-profile-role">ผู้ดูแลระบบ</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="dl-main">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');
  @import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --sidebar-w: 260px;
    --topbar-h: 68px;
    --bg: #f0f4ff;
    --surface: #ffffff;
    --sidebar-bg: #0f172a;
    --sidebar-border: rgba(255,255,255,0.06);
    --blue: #2563eb;
    --blue-light: #dbeafe;
    --text: #0f172a;
    --muted: #64748b;
    --font-th: 'Noto Sans Thai', sans-serif;
    --font-en: 'Outfit', sans-serif;
  }

  body {
    font-family: var(--font-th);
    background: var(--bg);
    color: var(--text);
  }

  /* ── ROOT LAYOUT ── */
  .dl-root {
    display: flex;
    min-height: 100vh;
  }

  /* ═══════════════════════════
     SIDEBAR
  ═══════════════════════════ */
  .dl-sidebar {
    position: fixed;
    top: 0; left: 0;
    width: var(--sidebar-w);
    height: 100vh;
    background: var(--sidebar-bg);
    display: flex;
    flex-direction: column;
    padding: 0 12px 20px;
    z-index: 100;
    overflow: hidden;
  }

  /* Subtle mesh background */
  .dl-sidebar::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%);
    pointer-events: none;
  }

  .dl-sidebar::after {
    content: '';
    position: absolute;
    bottom: 40px; left: -60px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Brand */
  .dl-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 8px 16px;
  }

  .dl-brand-logo {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }

  .dl-logo-img { width: 36px; height: 36px; object-fit: contain; }

  .dl-brand-text {
    display: flex; flex-direction: column;
    line-height: 1.2;
  }

  .dl-brand-name {
    font-family: var(--font-en);
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.3px;
  }

  .dl-brand-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  /* Divider */
  .dl-divider {
    height: 1px;
    background: var(--sidebar-border);
    margin: 8px 4px;
  }

  /* Nav label */
  .dl-nav-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.2px;
    color: rgba(255,255,255,0.25);
    padding: 10px 10px 6px;
    font-family: var(--font-en);
  }

  /* Nav */
  .dl-nav {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .dl-nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.5);
    font-family: var(--font-th);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    position: relative;
    transition: all 0.18s ease;
  }

  .dl-nav-item:hover {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.9);
  }

  .dl-nav-item:hover .dl-nav-icon-wrap {
    background: rgba(255,255,255,0.1);
    color: var(--item-color, #60a5fa);
  }

  .dl-nav-item--active {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }

  .dl-nav-item--active .dl-nav-icon-wrap {
    background: var(--item-color, #60a5fa) !important;
    color: #fff !important;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--item-color, #60a5fa) 45%, transparent);
  }

  .dl-nav-item--active .dl-nav-label-text {
    font-weight: 600;
  }

  .dl-nav-icon-wrap {
    width: 34px; height: 34px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px;
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.4);
    flex-shrink: 0;
    transition: all 0.18s ease;
  }

  .dl-nav-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--item-color, #60a5fa);
    margin-left: auto;
    box-shadow: 0 0 8px var(--item-color, #60a5fa);
  }

  /* Sidebar bottom */
  .dl-sidebar-bottom {
    display: flex; flex-direction: column; gap: 3px;
    padding-top: 8px;
  }

  .dl-nav-item--bottom { color: rgba(255,255,255,0.35); }
  .dl-nav-item--logout:hover { background: rgba(239,68,68,0.12) !important; color: #f87171 !important; }
  .dl-nav-item--logout:hover .dl-nav-icon-wrap { background: rgba(239,68,68,0.15) !important; color: #f87171 !important; }

  /* ═══════════════════════════
     CONTENT
  ═══════════════════════════ */
  .dl-content {
    margin-left: var(--sidebar-w);
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* Topbar */
  .dl-topbar {
    height: var(--topbar-h);
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    position: sticky;
    top: 0;
    z-index: 50;
    gap: 16px;
  }

  .dl-topbar-search {
    display: flex;
    align-items: center;
    background: #f1f5f9;
    border-radius: 12px;
    padding: 0 14px;
    gap: 8px;
    max-width: 280px;
    width: 100%;
    border: 1.5px solid transparent;
    transition: all 0.2s;
  }

  .dl-topbar-search:focus-within {
    background: #fff;
    border-color: #bfdbfe;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.07);
  }

  .dl-search-icon { font-size: 18px; color: #94a3b8; flex-shrink: 0; }

  .dl-search-input {
    border: none; background: transparent; outline: none;
    font-size: 14px; font-family: var(--font-th);
    color: var(--text); padding: 9px 0; width: 100%;
  }

  .dl-search-input::placeholder { color: #94a3b8; }

  .dl-topbar-right {
    display: flex; align-items: center; gap: 12px;
    margin-left: auto;
  }

  .dl-topbar-btn {
    width: 40px; height: 40px;
    border-radius: 10px;
    border: none; background: #f1f5f9;
    color: #64748b; font-size: 19px;
    cursor: pointer; position: relative;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.18s;
  }

  .dl-topbar-btn:hover { background: #e2e8f0; color: var(--blue); }

  .dl-badge {
    position: absolute; top: -4px; right: -4px;
    background: #ef4444; color: #fff;
    font-size: 10px; font-weight: 700;
    width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #f0f4ff;
    font-family: var(--font-en);
  }

  .dl-profile {
    display: flex; align-items: center; gap: 10px;
    padding: 5px 10px 5px 5px;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.18s;
  }

  .dl-profile:hover { background: #f1f5f9; }

  .dl-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    object-fit: cover;
    border: 2px solid #e2e8f0;
  }

  .dl-profile-info { display: flex; flex-direction: column; line-height: 1.25; }
  .dl-profile-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .dl-profile-role { font-size: 11px; color: #94a3b8; }

  /* Main */
  .dl-main { padding: 28px; flex: 1; }

  /* ═══════════════════════════
     RESPONSIVE
  ═══════════════════════════ */
  @media (max-width: 768px) {
    .dl-sidebar { width: 72px; }
    .dl-brand-text, .dl-nav-label, .dl-nav-label-text, .dl-nav-dot,
    .dl-profile-info { display: none; }
    .dl-brand { justify-content: center; padding: 18px 0; }
    .dl-nav-item { justify-content: center; padding: 11px; }
    .dl-content { margin-left: 72px; }
    .dl-topbar-search { display: none; }
  }

  @media (max-width: 480px) {
    .dl-sidebar { display: none; }
    .dl-content { margin-left: 0; }
  }
`;