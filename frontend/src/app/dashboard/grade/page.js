"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GRADE_THRESHOLDS,
  getGradeColor,
  GradeBarChart,
  TopSubjectsChart,
} from "@/app/chart/chart_grade";

function calcGrade(score) {
  if (score === "" || score === null || score === undefined)
    return { grade: "-", point: null };
  const s = Number(score);
  if (isNaN(s)) return { grade: "-", point: null };
  const found = GRADE_THRESHOLDS.find((t) => s >= t.min);
  return found ?? { grade: "F", point: 0 };
}

const EMPTY_FORM = {
  subject_code: "",
  subject_name: "",
  credit_value: "",
  section: "01",
  subject_type: "C",
  score: "",
  semester: "2",
  year: "2568",
};

export default function GradePage() {
  const [grades, setGrades]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editId, setEditId]       = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [filterSem, setFilterSem] = useState("all");
  const [search, setSearch]       = useState("");

  useEffect(() => { loadGrades(); }, []);

  async function loadGrades() {
    try {
      setLoading(true);
      const res  = await fetch("http://127.0.0.1:3001/api/grades");
      const data = await res.json();
      setGrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const liveGrade = useMemo(() => calcGrade(form.score), [form.score]);

  async function handleSubmit(e) {
    e.preventDefault();
    const { grade, point } = calcGrade(form.score);
    const payload = {
      ...form,
      subject_type: form.subject_type || "C",
      score: form.score !== "" ? Number(form.score) : null,
      credit: String(form.credit_value),
      credit_value: Number(form.credit_value) || 0,
      grade,
      grade_point: point,
      student_id: "6400000000",
      student_name: "Test User",
      program_id: 4,
    };

    try {
      const method = editId ? "PUT" : "POST";
      const url    = editId
        ? `http://127.0.0.1:3001/api/grades/${editId}`
        : "http://127.0.0.1:3001/api/grades";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) { alert("บันทึกไม่สำเร็จ"); return; }
      resetForm();
      loadGrades();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(item) {
    setEditId(item.id);
    setForm({
      subject_code: item.subject_code ?? "",
      subject_name: item.subject_name ?? "",
      credit_value: item.credit_value ?? "",
      section:      item.section ?? "01",
      subject_type: item.subject_type ?? "C",
      score:        item.score ?? "",
      semester:     String(item.semester),
      year:         String(item.year),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("ต้องการลบรายการนี้?")) return;
    await fetch(`http://127.0.0.1:3001/api/grades/${id}`, { method: "DELETE" });
    loadGrades();
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  }

  const semesterList = useMemo(() => {
    const set = new Set(grades.map((g) => `${g.semester}/${g.year}`));
    return ["all", ...Array.from(set).sort()];
  }, [grades]);

  const filtered = useMemo(() => {
    return grades.filter((g) => {
      const matchSem = filterSem === "all" || `${g.semester}/${g.year}` === filterSem;
      const q = search.toLowerCase();
      const matchSearch =
        (g.subject_code ?? "").toLowerCase().includes(q) ||
        (g.subject_name ?? "").toLowerCase().includes(q);
      return matchSem && matchSearch;
    });
  }, [grades, filterSem, search]);

  const stats = useMemo(() => {
    const valid = filtered.filter((g) =>
      GRADE_THRESHOLDS.find((t) => t.grade === g.grade)
    );
    const totalCredits = valid.reduce((s, g) => s + Number(g.credit_value || 0), 0);
    const totalPoints  = valid.reduce((s, g) => {
      const found = GRADE_THRESHOLDS.find((t) => t.grade === g.grade);
      return s + (found ? found.point * Number(g.credit_value || 0) : 0);
    }, 0);
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    return { totalCredits, totalPoints: totalPoints.toFixed(2), gpa };
  }, [filtered]);

  const gradeCount = useMemo(() => {
    const count = {};
    filtered.forEach((g) => {
      if (!g.grade || g.grade === "-") return;
      count[g.grade] = (count[g.grade] || 0) + 1;
    });
    return count;
  }, [filtered]);

  const maxCount = Math.max(...Object.values(gradeCount), 1);

  const topSubjects = useMemo(() => {
    return [...filtered]
      .filter((g) => g.score !== null && g.score !== undefined && g.score !== "")
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, 5);
  }, [filtered]);

  return (
    <>
      {/* Inject CSS */}
      <style>{css}</style>

      <div className="gp-root">

        {/* HEADER */}
        <div className="gp-header">
          <div>
            <h1 className="gp-title">ระบบจำลองบันทึกเกรด</h1>
            <p className="gp-subtitle">Grade Management System</p>
          </div>
          <button className="gp-btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
            + เพิ่มรายวิชา
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="gp-card gp-form-card">
            <div className="gp-form-header">
              <h2>{editId ? "✏️ แก้ไขรายวิชา" : "➕ เพิ่มรายวิชา"}</h2>
              <button className="gp-btn-close" onClick={resetForm}>✕</button>
            </div>

            <form className="gp-form" onSubmit={handleSubmit}>
              <div className="gp-form-row">
                <div className="gp-field">
                  <label>รหัสวิชา</label>
                  <input name="subject_code" value={form.subject_code}
                    onChange={handleChange} placeholder="เช่น 308-232" required />
                </div>
                <div className="gp-field gp-field-wide">
                  <label>ชื่อวิชา</label>
                  <input name="subject_name" value={form.subject_name}
                    onChange={handleChange} placeholder="ชื่อวิชา" required />
                </div>
              </div>

              <div className="gp-form-row">
                <div className="gp-field">
                  <label>หน่วยกิต</label>
                  <input name="credit_value" type="number" min="1" max="9"
                    value={form.credit_value} onChange={handleChange} placeholder="3" required />
                </div>
                <div className="gp-field">
                  <label>ตอน</label>
                  <input name="section" value={form.section}
                    onChange={handleChange} placeholder="01" />
                </div>
                <div className="gp-field">
                  <label>ประเภท</label>
                  <select name="subject_type" value={form.subject_type} onChange={handleChange}>
                    <option value="C">C</option>
                    <option value="G">G</option>
                    <option value="S/U">S/U</option>
                  </select>
                </div>
                <div className="gp-field">
                  <label>ภาค</label>
                  <input name="semester" value={form.semester}
                    onChange={handleChange} placeholder="2" />
                </div>
                <div className="gp-field">
                  <label>ปีการศึกษา</label>
                  <input name="year" value={form.year}
                    onChange={handleChange} placeholder="2568" />
                </div>
              </div>

              {/* คะแนน + preview */}
              <div className="gp-score-section">
                <div className="gp-field gp-field-score">
                  <label>คะแนน (0 – 100)</label>
                  <input
                    name="score" type="number" min="0" max="100"
                    value={form.score} onChange={handleChange}
                    placeholder="กรอกคะแนน" required
                    className="gp-score-input"
                  />
                </div>

                <div
                  className="gp-grade-preview"
                  style={{ "--gc": getGradeColor(liveGrade.grade) }}
                >
                  <span className="gp-preview-label">เกรดที่ได้</span>
                  <span className="gp-preview-grade">{liveGrade.grade}</span>
                  <span className="gp-preview-point">
                    {liveGrade.point !== null ? `${liveGrade.point} แต้ม` : "กรอกคะแนน"}
                  </span>
                </div>
              </div>

              {/* threshold bar */}
              <div className="gp-threshold-bar">
                {GRADE_THRESHOLDS.map((t) => (
                  <div
                    key={t.grade}
                    className={`gp-thresh-item ${liveGrade.grade === t.grade ? "active" : ""}`}
                    style={{ "--tc": getGradeColor(t.grade) }}
                  >
                    <span className="gp-thresh-grade">{t.grade}</span>
                    <span className="gp-thresh-min">{t.min}+</span>
                  </div>
                ))}
              </div>

              <div className="gp-form-actions">
                <button type="submit" className="gp-btn-save">
                  {editId ? "💾 บันทึก" : "✅ เพิ่ม"}
                </button>
                <button type="button" className="gp-btn-cancel" onClick={resetForm}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TOOLBAR */}
        <div className="gp-toolbar">
          <div className="gp-search-wrap">
            <span className="gp-search-icon">🔍</span>
            <input
              className="gp-search"
              placeholder="ค้นหารหัส / ชื่อวิชา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* STATS */}
        <div className="gp-stats-row">
          {[
            { label: "วิชาทั้งหมด", val: filtered.length, unit: "วิชา" },
            { label: "หน่วยกิตรวม", val: stats.totalCredits, unit: "หน่วยกิต" },
            { label: "หน่วยคะแนน",  val: stats.totalPoints, unit: "คะแนน" },
            { label: "GPA", val: stats.gpa, unit: "", highlight: true },
          ].map(({ label, val, unit, highlight }) => (
            <div key={label} className={`gp-stat-box ${highlight ? "gp-stat-gpa" : ""}`}>
              <span className="gp-stat-label">{label}</span>
              <strong className="gp-stat-val">{val}</strong>
              {unit && <span className="gp-stat-unit">{unit}</span>}
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div className="gp-card">
          <h3 className="gp-card-title">รายการวิชาทั้งหมด</h3>
          {loading ? (
            <p className="gp-loading">กำลังโหลด...</p>
          ) : filtered.length === 0 ? (
            <p className="gp-empty">ไม่มีข้อมูล</p>
          ) : (
            <div className="gp-table-wrap">
              <table className="gp-table">
                <thead>
                  <tr>
                    <th>รหัสวิชา</th>
                    <th>ชื่อวิชา</th>
                    <th>ตอน</th>
                    <th>หน่วยกิต</th>
                    <th>ประเภท</th>
                    <th>คะแนน</th>
                    <th>เกรด</th>
                    <th>ภาค/ปี</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => {
                    const gc = getGradeColor(g.grade);
                    return (
                      <tr key={g.id}>
                        <td className="gp-code">{g.subject_code}</td>
                        <td className="gp-name">{g.subject_name}</td>
                        <td>{g.section ?? "-"}</td>
                        <td>{g.credit_value}</td>
                        <td>{g.subject_type ?? "C"}</td>
                        <td className="gp-score-cell">
                          {g.score !== null && g.score !== undefined && g.score !== "" ? (
                            <div className="gp-score-bar-wrap">
                              <div className="gp-score-bar-track">
                                <div
                                  className="gp-score-bar-fill"
                                  style={{ width: `${Number(g.score)}%`, background: gc }}
                                />
                              </div>
                              <span className="gp-score-num">{g.score}</span>
                            </div>
                          ) : "-"}
                        </td>
                        <td>
                          <span className="gp-grade-badge" style={{ background: gc }}>
                            {g.grade}
                          </span>
                        </td>
                        <td>{g.semester}/{g.year}</td>
                        <td>
                          <div className="gp-actions">
                            <button className="gp-btn-edit" onClick={() => handleEdit(g)}>แก้ไข</button>
                            <button className="gp-btn-del"  onClick={() => handleDelete(g.id)}>ลบ</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CHARTS — แยกออกเป็น component จาก chart_grade.js */}
        {filtered.length > 0 && (
          <div className="gp-charts-grid">
            <GradeBarChart gradeCount={gradeCount} maxCount={maxCount} />
            <TopSubjectsChart topSubjects={topSubjects} />
          </div>
        )}

      </div>
    </>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

.gp-root {
  font-family: 'Sarabun', sans-serif;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  color: #1e293b;
}

/* ===== HEADER ===== */
.gp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.gp-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.gp-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 2px 0 0;
}
.gp-btn-add {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Sarabun', sans-serif;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}
.gp-btn-add:hover { background: #1d4ed8; }

/* ===== CARD ===== */
.gp-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}
.gp-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px;
}

/* ===== FORM ===== */
.gp-form-card { border-top: 3px solid #2563eb; }
.gp-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.gp-form-header h2 { margin: 0; font-size: 18px; font-weight: 700; }
.gp-btn-close {
  background: none; border: none; font-size: 18px;
  cursor: pointer; color: #64748b; padding: 4px 8px;
  border-radius: 6px;
}
.gp-btn-close:hover { background: #f1f5f9; }

.gp-form { display: flex; flex-direction: column; gap: 14px; }
.gp-form-row { display: flex; gap: 12px; flex-wrap: wrap; }
.gp-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 120px;
  flex: 1;
}
.gp-field-wide { flex: 2; }
.gp-field label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}
.gp-field input,
.gp-field select {
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-family: 'Sarabun', sans-serif;
  color: #1e293b;
  transition: border-color 0.2s;
  outline: none;
  background: #f8fafc;
}
.gp-field input:focus,
.gp-field select:focus {
  border-color: #2563eb;
  background: #fff;
}

/* score + preview */
.gp-score-section {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}
.gp-field-score { flex: 1; min-width: 180px; }
.gp-score-input {
  font-size: 20px !important;
  font-weight: 700 !important;
  text-align: center;
  border-color: #cbd5e1 !important;
}

.gp-grade-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2.5px solid var(--gc, #94a3b8);
  border-radius: 12px;
  padding: 12px 24px;
  min-width: 120px;
  background: #f8fafc;
  transition: border-color 0.3s;
}
.gp-preview-label { font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px; }
.gp-preview-grade {
  font-size: 36px;
  font-weight: 800;
  color: var(--gc, #94a3b8);
  line-height: 1.1;
  transition: color 0.3s;
}
.gp-preview-point { font-size: 12px; color: #64748b; }

/* threshold bar */
.gp-threshold-bar {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.gp-thresh-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  opacity: 0.5;
  transition: all 0.2s;
  min-width: 52px;
}
.gp-thresh-item.active {
  opacity: 1;
  border-color: var(--tc);
  background: color-mix(in srgb, var(--tc) 12%, white);
}
.gp-thresh-grade { font-size: 14px; font-weight: 700; color: var(--tc); }
.gp-thresh-min   { font-size: 10px; color: #94a3b8; }

/* form actions */
.gp-form-actions { display: flex; gap: 10px; padding-top: 4px; }
.gp-btn-save {
  background: #2563eb; color: #fff; border: none;
  padding: 10px 24px; border-radius: 8px;
  font-size: 15px; font-family: 'Sarabun', sans-serif;
  font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.gp-btn-save:hover { background: #1d4ed8; }
.gp-btn-cancel {
  background: #f1f5f9; color: #475569; border: none;
  padding: 10px 20px; border-radius: 8px;
  font-size: 15px; font-family: 'Sarabun', sans-serif;
  cursor: pointer; transition: background 0.2s;
}
.gp-btn-cancel:hover { background: #e2e8f0; }

/* ===== TOOLBAR ===== */
.gp-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.gp-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 14px;
  flex: 1;
  min-width: 200px;
}
.gp-search-icon { font-size: 14px; }
.gp-search {
  border: none; outline: none; font-size: 14px;
  font-family: 'Sarabun', sans-serif; width: 100%;
  color: #1e293b; background: transparent;
}
.gp-sem-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.gp-sem-tab {
  padding: 6px 14px; border-radius: 20px;
  border: 1.5px solid #e2e8f0; background: #fff;
  font-size: 13px; font-family: 'Sarabun', sans-serif;
  cursor: pointer; color: #64748b; transition: all 0.2s;
}
.gp-sem-tab:hover { border-color: #2563eb; color: #2563eb; }
.gp-sem-tab.active {
  background: #2563eb; color: #fff; border-color: #2563eb;
  font-weight: 600;
}

/* ===== STATS ===== */
.gp-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.gp-stat-box {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.gp-stat-gpa { border-top: 3px solid #2563eb; }
.gp-stat-label { font-size: 12px; color: #94a3b8; font-weight: 500; }
.gp-stat-val   { font-size: 26px; font-weight: 700; color: #0f172a; }
.gp-stat-unit  { font-size: 11px; color: #cbd5e1; }
.gp-stat-gpa .gp-stat-val { color: #2563eb; }

/* ===== TABLE ===== */
.gp-table-wrap { overflow-x: auto; }
.gp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.gp-table thead tr {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}
.gp-table th {
  padding: 10px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.4px;
  white-space: nowrap;
}
.gp-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}
.gp-table tbody tr:hover { background: #f8fafc; }
.gp-table td { padding: 10px 12px; color: #334155; }

.gp-code { font-weight: 600; color: #2563eb; font-size: 13px; }
.gp-name { max-width: 220px; }

/* score bar in table */
.gp-score-cell { min-width: 130px; }
.gp-score-bar-wrap { display: flex; align-items: center; gap: 8px; }
.gp-score-bar-track {
  flex: 1; height: 6px; background: #f1f5f9;
  border-radius: 3px; overflow: hidden;
}
.gp-score-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.gp-score-num { font-size: 13px; font-weight: 600; color: #1e293b; min-width: 28px; }

.gp-grade-badge {
  display: inline-block;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.3px;
}

/* actions */
.gp-actions { display: flex; gap: 6px; }
.gp-btn-edit {
  padding: 5px 12px; border-radius: 6px;
  background: #eff6ff; color: #2563eb;
  border: 1px solid #bfdbfe; font-size: 13px;
  font-family: 'Sarabun', sans-serif; cursor: pointer;
  transition: all 0.15s;
}
.gp-btn-edit:hover { background: #dbeafe; }
.gp-btn-del {
  padding: 5px 12px; border-radius: 6px;
  background: #fff5f5; color: #dc2626;
  border: 1px solid #fecaca; font-size: 13px;
  font-family: 'Sarabun', sans-serif; cursor: pointer;
  transition: all 0.15s;
}
.gp-btn-del:hover { background: #fee2e2; }

/* ===== CHARTS ===== */
.gp-charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.gp-chart-card { margin-bottom: 0; }

/* bar chart */
.gp-bar-chart { display: flex; flex-direction: column; gap: 10px; }
.gp-bar-row { display: flex; align-items: center; gap: 10px; }
.gp-bar-label { font-size: 13px; font-weight: 700; min-width: 30px; text-align: right; }
.gp-bar-track {
  flex: 1; height: 22px; background: #f1f5f9;
  border-radius: 6px; overflow: hidden;
}
.gp-bar-fill {
  height: 100%; border-radius: 6px;
  transition: width 0.5s cubic-bezier(.4,0,.2,1);
  min-width: 4px;
}
.gp-bar-count { font-size: 12px; color: #64748b; min-width: 50px; }

/* top list */
.gp-top-list { display: flex; flex-direction: column; gap: 12px; }
.gp-top-item { display: flex; align-items: center; gap: 12px; }
.gp-top-rank {
  width: 28px; height: 28px; border-radius: 50%;
  color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.gp-top-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.gp-top-name { display: flex; gap: 8px; align-items: baseline; }
.gp-top-code { font-size: 12px; font-weight: 700; color: #2563eb; }
.gp-top-sname {
  font-size: 12px; color: #64748b;
  white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; max-width: 160px;
}
.gp-top-bar-track {
  height: 6px; background: #f1f5f9;
  border-radius: 3px; overflow: hidden;
}
.gp-top-bar-fill {
  height: 100%; border-radius: 3px;
  transition: width 0.5s;
}
.gp-top-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.gp-top-num { font-size: 18px; font-weight: 800; color: #0f172a; }

/* ===== misc ===== */
.gp-loading, .gp-empty {
  text-align: center; color: #94a3b8;
  padding: 32px 0; font-size: 14px;
}

@media (max-width: 768px) {
  .gp-stats-row { grid-template-columns: repeat(2, 1fr); }
  .gp-charts-grid { grid-template-columns: 1fr; }
  .gp-header { flex-direction: column; align-items: flex-start; gap: 12px; }
}
`;