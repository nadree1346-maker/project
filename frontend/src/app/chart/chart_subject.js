"use client";

import { useMemo, useEffect, useRef } from "react";

const PROGRAM_COLORS = {
  ICT:  0,
  CS:   1,
  IT:   2,
  STAT: 3,
  MATH: 4,
};

function getBarClass(program) {
  const idx = PROGRAM_COLORS[program] ?? (program?.charCodeAt(0) ?? 0) % 5;
  return `sc-bar sc-bar-${idx + 1}`;
}

const PILL_COLORS = ["#1a6b5e","#2563a8","#7c3a9e","#b86a00","#8a1c1c"];

export default function SubjectChart({ subjects }) {
  const chartMax = useMemo(() => {
    if (!subjects?.length) return 4;
    return Math.max(
      ...subjects.map((s) => parseInt(String(s.credit).split("(")[0]) || 0),
      4
    );
  }, [subjects]);

  const programList = useMemo(() => {
    return [...new Set(subjects?.map((s) => s.program).filter(Boolean))];
  }, [subjects]);

  if (!subjects || subjects.length === 0) {
    return (
      <div className="sc-empty">
        <style suppressHydrationWarning>{chartCss}</style>
        ยังไม่มีข้อมูลรายวิชา
      </div>
    );
  }

  return (
    <>
      <style suppressHydrationWarning>{chartCss}</style>

      {/* Legend pills */}
      {programList.length > 1 && (
        <div className="sc-summary">
          {programList.map((prog, i) => (
            <div className="sc-summary-pill" key={prog}>
              <div className="sc-dot" style={{ background: PILL_COLORS[i % PILL_COLORS.length] }} />
              {prog} ({subjects.filter((s) => s.program === prog).length} วิชา)
            </div>
          ))}
        </div>
      )}

      <div className="sc-wrap">
        {subjects.map((item, idx) => {
          const numCredit   = parseInt(String(item.credit).split("(")[0]) || 0;
          const widthPct    = Math.max((numCredit / chartMax) * 100, 6);
          const barClass    = getBarClass(item.program);
          const delay       = `${idx * 0.045}s`;

          return (
            <div className="sc-row" key={item.id} style={{ animationDelay: delay }}>
              {/* Meta */}
              <div className="sc-meta">
                <span className="sc-code">{item.code}</span>
                <span className="sc-name" title={item.name}>{item.name}</span>
                <span className="sc-program-tag">{item.program}</span>
              </div>

              {/* Bar track */}
              <div className="sc-track">
                <div
                  className={barClass}
                  style={{ width: `${widthPct}%`, animationDelay: delay }}
                >
                  {numCredit} หน่วยกิต
                </div>
              </div>

              {/* Credit value */}
              <div>
                <div className="sc-credit-val">{numCredit}</div>
                <div className="sc-credit-unit">หน่วยกิต</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const chartCss = `
  @keyframes barGrow {
    from { width: 0%; opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sc-wrap {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .sc-row {
    display: grid;
    grid-template-columns: 220px 1fr 52px;
    align-items: center;
    gap: 16px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f4f4;
    animation: fadeSlideUp 0.4s ease both;
  }

  .sc-row:last-child { border-bottom: none; }

  .sc-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sc-code {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #2f8a7a;
    background: #e8f6f3;
    padding: 2px 7px;
    border-radius: 4px;
    width: fit-content;
  }

  .sc-name {
    font-size: 13px;
    color: #2f4f4f;
    font-weight: 600;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 210px;
  }

  .sc-program-tag {
    font-size: 10px;
    color: #8fa8a8;
    font-weight: 500;
  }

  .sc-track {
    position: relative;
    background: #eef5f5;
    border-radius: 8px;
    height: 28px;
    overflow: hidden;
  }

  .sc-bar {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding-left: 12px;
    font-size: 11px;
    font-weight: 700;
    color: white;
    white-space: nowrap;
    animation: barGrow 0.7s cubic-bezier(.22,.61,.36,1) both;
    min-width: 36px;
  }

  .sc-bar-1 { background: linear-gradient(90deg, #1a6b5e, #2f9e8a); }
  .sc-bar-2 { background: linear-gradient(90deg, #2563a8, #4a90d9); }
  .sc-bar-3 { background: linear-gradient(90deg, #7c3a9e, #b06adc); }
  .sc-bar-4 { background: linear-gradient(90deg, #b86a00, #e8973a); }
  .sc-bar-5 { background: linear-gradient(90deg, #8a1c1c, #d45a5a); }

  .sc-credit-val {
    font-size: 18px;
    font-weight: 800;
    color: #2f4f4f;
    text-align: right;
    line-height: 1;
  }

  .sc-credit-unit {
    font-size: 9px;
    color: #8fa8a8;
    text-align: right;
    font-weight: 500;
  }

  /* Summary bar at top */
  .sc-summary {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .sc-summary-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f4faf9;
    border: 1px solid #c8e6e0;
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #2f4f4f;
  }

  .sc-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .sc-empty {
    text-align: center;
    padding: 40px;
    color: #aac4c4;
    font-size: 14px;
  }
`;