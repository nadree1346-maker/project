"use client";
import { useRouter } from "next/navigation";

const cards = [
  {
    path: "/dashboard/student",
    icon: "bxs-user-circle",
    label: "นักศึกษา",
    sub: "จัดการข้อมูลนักศึกษา",
    color: "#34d399",
    glow: "rgba(52,211,153,0.18)",
    bg: "rgba(52,211,153,0.08)",
    stat: "นักศึกษาทั้งหมด",
  },
  {
    path: "/dashboard/course",
    icon: "bxs-book-open",
    label: "หลักสูตร",
    sub: "จัดการหลักสูตรการเรียน",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.18)",
    bg: "rgba(244,114,182,0.08)",
    stat: "หลักสูตรที่เปิดสอน",
  },
  {
    path: "/dashboard/subject",
    icon: "bxs-notepad",
    label: "รายวิชา",
    sub: "จัดการรายวิชาทั้งหมด",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.18)",
    bg: "rgba(251,191,36,0.08)",
    stat: "รายวิชาที่เปิดสอน",
  },
  {
    path: "/dashboard/grade",
    icon: "bxs-bar-chart-alt-2",
    label: "เกรด",
    sub: "จำลองบันทึกเกรด",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.18)",
    bg: "rgba(167,139,250,0.08)",
    stat: "บันทึกเกรดแล้ว",
  },
];

const quickLinks = [
  { icon: "bx-plus-circle", label: "เพิ่มนักศึกษา", path: "/dashboard/student", color: "#34d399" },
  { icon: "bx-file",        label: "จำลองบันทึกเกรด",    path: "/dashboard/grade",   color: "#a78bfa" },
  { icon: "bx-book-add",    label: "เพิ่มรายวิชา",  path: "/dashboard/subject", color: "#fbbf24" },
  { icon: "bx-cog",         label: "ตั้งค่าระบบ",   path: "/dashboard",         color: "#60a5fa" },
];

export default function Dashboard() {
  const router = useRouter();
  const now = new Date();
  const dateStr = now.toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <style suppressHydrationWarning>{css}</style>

      {/* ── GREETING ── */}
      <div className="db-greeting">
        <div>
          <h1 className="db-greeting-title">สวัสดี, Admin </h1>
          <p className="db-greeting-date">{dateStr}</p>
        </div>
        <div className="db-greeting-badge">
          <i className="bx bxs-graduation"></i>
          ระบบจำลองการจัดการข้อมูลสาขาวิทยาศาสตร์การคำนวณ
        </div>
      </div>

      {/* ── MENU CARDS ── */}
      <div className="db-cards">
        {cards.map((c, i) => (
          <button
            key={c.path}
            className="db-card"
            style={{
              "--card-color": c.color,
              "--card-glow":  c.glow,
              "--card-bg":    c.bg,
              animationDelay: `${i * 80}ms`,
            }}
            onClick={() => router.push(c.path)}
          >
            {/* Glow blob */}
            <div className="db-card-blob" />

            {/* Icon */}
            <div className="db-card-icon">
              <i className={`bx ${c.icon}`}></i>
            </div>

            {/* Text */}
            <div className="db-card-body">
              <p className="db-card-label">{c.label}</p>
              <p className="db-card-sub">{c.sub}</p>
            </div>

            {/* Arrow */}
            <div className="db-card-arrow">
              <i className="bx bx-chevron-right"></i>
            </div>
          </button>
        ))}
      </div>

      {/* ── QUICK ACCESS ── */}
      <div className="db-section-title">
        <span className="db-section-dot" />
        การดำเนินการด่วน
      </div>
      <div className="db-quick">
        {quickLinks.map((q) => (
          <button
            key={q.label}
            className="db-quick-item"
            style={{ "--q-color": q.color }}
            onClick={() => router.push(q.path)}
          >
            <i className={`bx ${q.icon}`}></i>
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* ── FOOTER NOTE ── */}
      <div className="db-footer">
        <i className="bx bx-info-circle"></i>
         ระบบจำลองการจัดการข้อมูลสาขาวิทยาศาสตร์การคำนวณ · {now.getFullYear()}
      </div>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');

  /* ── GREETING ── */
  .db-greeting {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 28px;
  }

  .db-greeting-title {
    font-family: 'Noto Sans Thai', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
    margin: 0;
  }

  .db-greeting-date {
    font-size: 13px;
    color: #94a3b8;
    margin-top: 4px;
    font-family: 'Noto Sans Thai', sans-serif;
  }

  .db-greeting-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 9px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #2563eb;
    font-family: 'Noto Sans Thai', sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    white-space: nowrap;
  }

  .db-greeting-badge i { font-size: 18px; }

  /* ── CARDS ── */
  .db-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
    margin-bottom: 30px;
  }

  .db-card {
    position: relative;
    background: #fff;
    border: 1px solid #f1f5f9;
    border-radius: 20px;
    padding: 22px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: left;
    box-shadow: 0 4px 18px rgba(0,0,0,0.04);
    overflow: hidden;
    animation: cardIn 0.4s cubic-bezier(.22,.61,.36,1) both;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  .db-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px var(--card-glow), 0 4px 12px rgba(0,0,0,0.06);
    border-color: color-mix(in srgb, var(--card-color) 20%, transparent);
  }

  .db-card:hover .db-card-blob {
    opacity: 1;
    transform: scale(1.15);
  }

  .db-card:hover .db-card-arrow {
    background: var(--card-color);
    color: #fff;
    transform: translateX(3px);
  }

  /* Glow blob */
  .db-card-blob {
    position: absolute;
    top: -30px; right: -30px;
    width: 110px; height: 110px;
    border-radius: 50%;
    background: var(--card-glow);
    opacity: 0.6;
    transition: all 0.35s ease;
    pointer-events: none;
  }

  /* Icon */
  .db-card-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: var(--card-bg);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    color: var(--card-color);
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .db-card:hover .db-card-icon {
    background: var(--card-color);
    color: #fff;
    box-shadow: 0 6px 18px var(--card-glow);
  }

  /* Body */
  .db-card-body { flex: 1; min-width: 0; }

  .db-card-label {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    font-family: 'Noto Sans Thai', sans-serif;
    margin: 0 0 3px;
  }

  .db-card-sub {
    font-size: 12.5px;
    color: #94a3b8;
    font-family: 'Noto Sans Thai', sans-serif;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Arrow */
  .db-card-arrow {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: #f1f5f9;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    color: #94a3b8;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  /* ── SECTION TITLE ── */
  .db-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    font-family: 'Outfit', sans-serif;
    margin-bottom: 14px;
  }

  .db-section-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #2563eb;
  }

  /* ── QUICK ACCESS ── */
  .db-quick {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 32px;
  }

  .db-quick-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 12px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    font-size: 13.5px;
    font-weight: 500;
    font-family: 'Noto Sans Thai', sans-serif;
    color: #334155;
    cursor: pointer;
    transition: all 0.18s ease;
  }

  .db-quick-item i {
    font-size: 17px;
    color: var(--q-color);
  }

  .db-quick-item:hover {
    border-color: var(--q-color);
    background: color-mix(in srgb, var(--q-color) 8%, #fff);
    color: #0f172a;
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  }

  /* ── FOOTER ── */
  .db-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #cbd5e1;
    font-family: 'Noto Sans Thai', sans-serif;
    padding-top: 8px;
    border-top: 1px solid #f1f5f9;
  }

  .db-footer i { font-size: 14px; }
`;