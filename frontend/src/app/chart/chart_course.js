"use client";

import { useMemo } from "react";

export default function CourseChart({ programs }) {
  const chartMax = useMemo(() => {
    if (!programs.length) return 100;
    return Math.max(...programs.map((item) => Number(item.total_credits || 0)), 100);
  }, [programs]);

  if (!programs || programs.length === 0) return null;

  return (
    <>
      <style>{`
        .chart-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chart-row {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 16px;
          align-items: center;
        }
        .chart-label {
          font-weight: 700;
          color: #334155;
          font-size: 14px;
        }
        .chart-bar-wrap {
          width: 100%;
          background: #eef2f7;
          border-radius: 999px;
          overflow: hidden;
          height: 36px;
        }
        .chart-bar {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #60a5fa);
          color: white;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 14px;
          white-space: nowrap;
          border-radius: 999px;
          min-width: fit-content;
          transition: width 0.6s ease;
        }
        .chart-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
        }
        .chart-card h3 {
          color: #0f172a;
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 800;
        }
        @media (max-width: 640px) {
          .chart-row { grid-template-columns: 1fr; }
          .chart-label { font-size: 13px; }
        }
      `}</style>

      <div className="chart-card">
        <h3>สรุปข้อมูลหลักสูตร (Chart)</h3>
        <div className="chart-box">
          {programs.map((item) => {
            const widthPercent = (Number(item.total_credits || 0) / chartMax) * 100;
            return (
              <div key={item.id} className="chart-row">
                <div className="chart-label">{item.program_name_th}</div>
                <div className="chart-bar-wrap">
                  <div className="chart-bar" style={{ width: `${widthPercent}%` }}>
                    {item.total_credits} หน่วยกิต
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}