"use client";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const genderColors = (labels) =>
  labels.map((l) =>
    l === "ชาย" ? "#60a5fa" : l === "หญิง" ? "#f472b6" : "#a78bfa"
  );

const countBy = (students, key) =>
  students.reduce((acc, s) => {
    acc[s[key]] = (acc[s[key]] || 0) + 1;
    return acc;
  }, {});

export default function StudentCharts({ students }) {
  if (!students || students.length === 0) return null;

  const yearCount   = countBy(students, "year");
  const genderCount = countBy(students, "gender");
  const ageCount    = countBy(students, "age");

  return (
    <div className="st-charts-grid">
      {/* ชั้นปี */}
      <div className="st-card">
        <p className="st-card-title">📊 นักศึกษาแต่ละชั้นปี</p>
        <Bar
          data={{
            labels: Object.keys(yearCount).map((y) => `ปี ${y}`),
            datasets: [
              {
                label: "จำนวน",
                data: Object.values(yearCount),
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
                borderRadius: 8,
              },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { display: false } } }}
        />
      </div>

      {/* เพศ */}
      <div className="st-card">
        <p className="st-card-title">🧍 เพศ</p>
        <Pie
          data={{
            labels: Object.keys(genderCount),
            datasets: [
              {
                data: Object.values(genderCount),
                backgroundColor: genderColors(Object.keys(genderCount)),
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </div>

      {/* อายุ */}
      <div className="st-card">
        <p className="st-card-title">🎂 อายุ</p>
        <Bar
          data={{
            labels: Object.keys(ageCount).map((a) => `${a} ปี`),
            datasets: [
              {
                label: "จำนวน",
                data: Object.values(ageCount),
                backgroundColor: "#6366f1",
                borderRadius: 8,
              },
            ],
          }}
          options={{ responsive: true, plugins: { legend: { display: false } } }}
        />
      </div>
    </div>
  );
}