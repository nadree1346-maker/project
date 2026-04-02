"use client";

// ==================== เกณฑ์คะแนน (shared) ====================
export const GRADE_THRESHOLDS = [
  { min: 80, grade: "A",  point: 4.0 },
  { min: 75, grade: "B+", point: 3.5 },
  { min: 70, grade: "B",  point: 3.0 },
  { min: 65, grade: "C+", point: 2.5 },
  { min: 60, grade: "C",  point: 2.0 },
  { min: 55, grade: "D+", point: 1.5 },
  { min: 50, grade: "D",  point: 1.0 },
  { min: 0,  grade: "F",  point: 0.0 },
];

export function getGradeColor(grade) {
  const map = {
    A: "#22c55e", "B+": "#84cc16", B: "#a3e635",
    "C+": "#facc15", C: "#fb923c",
    "D+": "#f87171", D: "#ef4444", F: "#dc2626",
    S: "#38bdf8", U: "#f472b6", "-": "#94a3b8",
  };
  return map[grade] ?? "#94a3b8";
}

// ==================== GradeBarChart ====================
export function GradeBarChart({ gradeCount, maxCount }) {
  return (
    <div className="gp-card gp-chart-card">
      <h3 className="gp-card-title">📊 การกระจายเกรด</h3>
      <div className="gp-bar-chart">
        {GRADE_THRESHOLDS.map(({ grade }) => {
          const count = gradeCount[grade] || 0;
          const pct   = (count / Math.max(maxCount, 1)) * 100;
          return (
            <div key={grade} className="gp-bar-row">
              <span className="gp-bar-label" style={{ color: getGradeColor(grade) }}>
                {grade}
              </span>
              <div className="gp-bar-track">
                <div
                  className="gp-bar-fill"
                  style={{ width: `${pct}%`, background: getGradeColor(grade) }}
                />
              </div>
              <span className="gp-bar-count">{count} วิชา</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== TopSubjectsChart ====================
export function TopSubjectsChart({ topSubjects }) {
  return (
    <div className="gp-card gp-chart-card">
      <h3 className="gp-card-title">🏆 วิชาที่ได้คะแนนสูงสุด</h3>
      <div className="gp-top-list">
        {topSubjects.length === 0 ? (
          <p className="gp-empty">ยังไม่มีข้อมูลคะแนน</p>
        ) : (
          topSubjects.map((g, i) => {
            const gc  = getGradeColor(g.grade);
            const pct = Number(g.score);
            return (
              <div key={g.id} className="gp-top-item">
                <div className="gp-top-rank" style={{ background: gc }}>{i + 1}</div>
                <div className="gp-top-info">
                  <div className="gp-top-name">
                    <span className="gp-top-code">{g.subject_code}</span>
                    <span className="gp-top-sname">{g.subject_name}</span>
                  </div>
                  <div className="gp-top-bar-track">
                    <div
                      className="gp-top-bar-fill"
                      style={{ width: `${pct}%`, background: gc }}
                    />
                  </div>
                </div>
                <div className="gp-top-right">
                  <span className="gp-top-num">{g.score}</span>
                  <span className="gp-grade-badge" style={{ background: gc }}>{g.grade}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}