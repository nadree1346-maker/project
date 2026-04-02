"use client";

import { useEffect, useMemo, useState } from "react";
import SubjectChart from "@/app/chart/chart_subject";

const PROGRAM_OPTIONS = [
  { label: "ICT",  id: 1 },
  { label: "CS",   id: 2 },
  { label: "IT",   id: 3 },
  { label: "STAT", id: 4 },
  { label: "MATH", id: 5 },
];

const PROGRAM_ID_TO_NAME = Object.fromEntries(
  PROGRAM_OPTIONS.map((p) => [p.id, p.label])
);

const initialForm = {
  program_id: 1,   
  code:     "",
  name:     "",
  credit:   "",
  year:     "",
  semester: "",
  category: "",
};

export default function SubjectPage() {
  const [subjects, setSubjects]               = useState([]);
  const [selectedId, setSelectedId]           = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [errorText, setErrorText]             = useState("");
  const [formData, setFormData]               = useState(initialForm);
  const [editId, setEditId]                   = useState(null);
  const [selectedProgram, setSelectedProgram] = useState("ทั้งหมด");

  useEffect(() => { loadSubjects(); }, []);

  async function loadSubjects() {
    try {
      setLoading(true);
      setErrorText("");
      const res  = await fetch("http://127.0.0.1:3001/api/subjects");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setSubjects(list);
      if (list.length > 0) await loadSubjectDetail(list[0].id);
      else setSelectedSubject(null);
    } catch (err) {
      console.error(err);
      setErrorText("โหลดข้อมูลรายวิชาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function loadSubjectDetail(id) {
    try {
      setSelectedId(id);
      const res  = await fetch(`http://127.0.0.1:3001/api/subjects/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSelectedSubject(data.subject || data);
    } catch (err) {
      console.error("loadSubjectDetail error:", err);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    if (!formData.code.trim())     { alert("กรุณากรอกรหัสวิชา"); return false; }
    if (!formData.name.trim())     { alert("กรุณากรอกชื่อรายวิชา"); return false; }
    if (!formData.credit.trim())   { alert("กรุณากรอกหน่วยกิต"); return false; }
    if (!formData.year || Number(formData.year) <= 0)         { alert("กรุณากรอกชั้นปีให้ถูกต้อง"); return false; }
    if (!formData.semester || Number(formData.semester) <= 0) { alert("กรุณากรอกภาคการศึกษาให้ถูกต้อง"); return false; }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      code:       formData.code.trim(),
      name:       formData.name.trim(),
      credit:     formData.credit.trim(),
      category:   formData.category.trim() || null,
      year:       Number(formData.year),
      semester:   Number(formData.semester),
      program_id: Number(formData.program_id), 
    };

    try {
      const method = editId ? "PUT" : "POST";
      const url    = editId
        ? `http://127.0.0.1:3001/api/subjects/${editId}`
        : "http://127.0.0.1:3001/api/subjects";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "บันทึกข้อมูลไม่สำเร็จ");
        return;
      }

      const data = await res.json();
      alert(editId ? "แก้ไขรายวิชาสำเร็จ" : "เพิ่มรายวิชาสำเร็จ");
      setFormData(initialForm);
      setEditId(null);
      await loadSubjects();
      if (data.id) await loadSubjectDetail(data.id);
    } catch (err) {
      console.error(err);
      alert("บันทึกข้อมูลไม่สำเร็จ");
    }
  }

  function handleEdit(subject) {
    setEditId(subject.id);
    setFormData({
      program_id: subject.program_id ?? 1,
      code:       subject.code     || "",
      name:       subject.name     || "",
      credit:     subject.credit   || "",
      category:   subject.category || "",
      year:       subject.year     || "",
      semester:   subject.semester || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("ต้องการลบรายวิชานี้ใช่หรือไม่?")) return;
    try {
      const res  = await fetch(`http://127.0.0.1:3001/api/subjects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "ลบข้อมูลไม่สำเร็จ"); return; }
      alert("ลบรายวิชาสำเร็จ");
      await loadSubjects();
      setSelectedSubject(null);
    } catch (err) {
      console.error(err);
      alert("ลบข้อมูลไม่สำเร็จ");
    }
  }

  function handleCancelEdit() {
    setEditId(null);
    setFormData(initialForm);
  }

  const programs = useMemo(() => {
    const ids = [...new Set(subjects.map((s) => s.program_id).filter(Boolean))];
    return ["ทั้งหมด", ...ids.map((id) => PROGRAM_ID_TO_NAME[id] || `#${id}`)];
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    if (selectedProgram === "ทั้งหมด") return subjects;
    return subjects.filter((s) => PROGRAM_ID_TO_NAME[s.program_id] === selectedProgram);
  }, [subjects, selectedProgram]);

  const programName = (s) =>
    s.program /* ถ้า server JOIN มาแล้ว */ ||
    PROGRAM_ID_TO_NAME[s.program_id] ||
    "-";

  return (
    <div className="sp-root">
      <style suppressHydrationWarning>{css}</style>

      {/* ===== HEADER ===== */}
      <div className="sp-header">
        <h1>จัดการข้อมูลรายวิชา</h1>
        <p>เพิ่ม แก้ไข ลบ และดูรายละเอียดรายวิชา</p>
      </div>

      {/* ===== FORM ===== */}
      <div className="sp-card">
        <h3>{editId ? "✏️ แก้ไขรายวิชา" : "➕ เพิ่มรายวิชา"}</h3>
        <form className="sp-form" onSubmit={handleSubmit}>

          <div className="sp-form-field">
            <label>รหัสวิชา</label>
            <input name="code" placeholder="เช่น ICT101" value={formData.code} onChange={handleChange} required />
          </div>

          <div className="sp-form-field">
            <label>ชื่อรายวิชา</label>
            <input name="name" placeholder="ชื่อรายวิชา" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="sp-form-field">
            <label>หน่วยกิต</label>
            <input name="credit" placeholder="เช่น 3(3-0-6)" value={formData.credit} onChange={handleChange} required />
          </div>

          <div className="sp-form-field">
            <label>หมวดวิชา (category)</label>
            <input name="category" placeholder="เช่น Major, GE" value={formData.category} onChange={handleChange} />
          </div>

          <div className="sp-form-field">
            <label>ชั้นปี</label>
            <input name="year" type="number" placeholder="1–4" value={formData.year} onChange={handleChange} required />
          </div>

          <div className="sp-form-field">
            <label>ภาคการศึกษา</label>
            <input name="semester" type="number" placeholder="1–3" value={formData.semester} onChange={handleChange} required />
          </div>

          <div className="sp-form-actions">
            <button type="submit" className="sp-btn sp-btn-save">
              {editId ? "💾 บันทึกการแก้ไข" : "✅ เพิ่มรายวิชา"}
            </button>
            {editId && (
              <button type="button" className="sp-btn sp-btn-cancel" onClick={handleCancelEdit}>
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ===== TABLE ===== */}
      <div className="sp-card">
        <h3>📋 รายการรายวิชา ({filteredSubjects.length} วิชา)</h3>
        <div className="sp-table-wrap">
          {filteredSubjects.length === 0 ? (
            <div className="sp-empty">ไม่พบรายวิชา</div>
          ) : (
            <table className="sp-table">
              <thead>
                <tr>
                  <th>รหัสวิชา</th>
                  <th>ชื่อรายวิชา</th>
                  <th>หน่วยกิต</th>
                  <th>ปี / เทอม</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((item) => (
                  <tr key={item.id}>
                    <td><span className="sp-code-badge">{item.code}</span></td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ fontWeight: 600, color: "#2f4f4f" }}>{item.credit}</td>
                    <td><span className="sp-year-badge">ปี {item.year} / เทอม {item.semester}</span></td>
                    <td>
                      <div className="sp-table-actions">
                        <button className="sp-btn sp-btn-edit"   onClick={() => handleEdit(item)}>แก้ไข</button>
                        <button className="sp-btn sp-btn-delete" onClick={() => handleDelete(item.id)}>ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ===== CHART ===== */}
      <div className="sp-card">
        <h3>📊 สรุปจำนวนหน่วยกิตรายวิชา</h3>
        <SubjectChart subjects={filteredSubjects} />
      </div>
    </div>
  );
}

// ==================== STYLES ====================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

  .sp-root {
    font-family: 'IBM Plex Sans Thai', 'Segoe UI', sans-serif;
    background: #f0f5f5;
    min-height: 100vh;
    padding: 32px;
    color: #1a3333;
  }

  .sp-header { margin-bottom: 28px; }
  .sp-header h1 {
    font-size: 28px; font-weight: 700; color: #1a3333;
    margin-bottom: 4px; letter-spacing: -0.3px;
  }
  .sp-header p { font-size: 15px; color: #6b8f8f; }

  .sp-card {
    background: #fff; border-radius: 16px; padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(47,79,79,0.07);
    border: 1px solid #e4eeee;
  }
  .sp-card h3 {
    font-size: 16px; font-weight: 700; color: #1a3333;
    margin-bottom: 18px; padding-bottom: 12px;
    border-bottom: 2px solid #e4eeee;
    display: flex; align-items: center; gap: 8px;
  }

  .sp-form {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .sp-form-field { display: flex; flex-direction: column; gap: 5px; }
  .sp-form-field label {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px; color: #6b8f8f;
  }
  .sp-form input,
  .sp-form select {
    padding: 10px 13px; border-radius: 10px;
    border: 1.5px solid #d4e4e4; background: #f7fafa;
    font-size: 14px; font-family: 'IBM Plex Sans Thai', sans-serif;
    color: #1a3333; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .sp-form input:focus,
  .sp-form select:focus {
    border-color: #2f8a7a; background: #fff;
    box-shadow: 0 0 0 3px rgba(47,138,122,0.12);
  }

  .sp-form-actions {
    grid-column: 1 / -1;
    display: flex; gap: 10px; padding-top: 4px;
  }

  .sp-btn {
    padding: 10px 22px; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 600;
    font-family: 'IBM Plex Sans Thai', sans-serif;
    cursor: pointer; transition: all 0.18s;
  }
  .sp-btn:hover  { opacity: 0.85; transform: translateY(-1px); }
  .sp-btn:active { transform: translateY(0); }
  .sp-btn-save   { background: #2f4f4f; color: #fff; }
  .sp-btn-cancel { background: #e4eeee; color: #2f4f4f; }
  .sp-btn-view   { background: #d9ecef; color: #1a5060; font-size: 13px; padding: 7px 14px; }
  .sp-btn-edit   { background: #fdf0d5; color: #8a5200; font-size: 13px; padding: 7px 14px; }
  .sp-btn-delete { background: #fde8e8; color: #8a1c1c; font-size: 13px; padding: 7px 14px; }

  .sp-filter-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .sp-filter-chip {
    padding: 7px 16px; border-radius: 999px; font-size: 13px;
    font-weight: 600; border: 1.5px solid #c8e0e0;
    background: #f4fafa; color: #4a7070; cursor: pointer;
    transition: all 0.15s; font-family: 'IBM Plex Sans Thai', sans-serif;
  }
  .sp-filter-chip:hover  { background: #e0f0f0; border-color: #2f8a7a; }
  .sp-filter-chip.active { background: #2f4f4f; color: #fff; border-color: #2f4f4f; }

  .sp-table-wrap { overflow-x: auto; }
  .sp-table { width: 100%; border-collapse: separate; border-spacing: 0 5px; }
  .sp-table thead th {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: #8aabab; padding: 6px 14px; text-align: left;
  }
  .sp-table tbody tr {
    background: #fff; box-shadow: 0 1px 6px rgba(47,79,79,0.06);
    border-radius: 10px; transition: transform 0.15s, box-shadow 0.15s;
  }
  .sp-table tbody tr:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(47,79,79,0.1); }
  .sp-table td { padding: 12px 14px; font-size: 13.5px; vertical-align: middle; }
  .sp-table td:first-child { border-radius: 10px 0 0 10px; }
  .sp-table td:last-child  { border-radius: 0 10px 10px 0; }

  .sp-code-badge {
    font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 600;
    background: #e8f6f3; color: #2f8a7a; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.3px;
  }
  .sp-program-badge {
    font-size: 11px; font-weight: 700; padding: 3px 9px;
    border-radius: 6px; background: #f0f4f4; color: #4a7070;
  }
  .sp-year-badge { font-size: 12px; color: #8aabab; font-weight: 600; }
  .sp-table-actions { display: flex; gap: 6px; flex-wrap: wrap; }

  .sp-hero {
    background: linear-gradient(135deg, #2f4f4f 0%, #1a6b5e 100%);
    border-radius: 16px; padding: 28px; color: #fff;
    margin-bottom: 16px; position: relative; overflow: hidden;
  }
  .sp-hero::before {
    content: ''; position: absolute; right: -30px; top: -30px;
    width: 160px; height: 160px; border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }
  .sp-hero::after {
    content: ''; position: absolute; right: 40px; bottom: -50px;
    width: 120px; height: 120px; border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .sp-hero h2 { font-size: 22px; font-weight: 700; margin-bottom: 6px; position: relative; }
  .sp-hero-sub {
    font-size: 13px; opacity: 0.7; position: relative;
    font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.5px;
  }

  .sp-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 0; }
  .sp-summary-box {
    background: #f4fafa; border: 1.5px solid #d4e8e4;
    border-radius: 14px; padding: 18px 20px; transition: border-color 0.15s;
  }
  .sp-summary-box:hover { border-color: #2f8a7a; }
  .sp-summary-box span {
    display: block; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.5px; color: #8aabab; margin-bottom: 6px;
  }
  .sp-summary-box strong {
    font-size: 20px; font-weight: 700; color: #2f4f4f;
    font-family: 'IBM Plex Mono', monospace;
  }

  .sp-empty  { text-align: center; padding: 40px; color: #aac4c4; font-size: 14px; }
  .sp-loading { text-align: center; padding: 40px; color: #6b8f8f; font-size: 14px; }
  .sp-error  { color: #b91c1c; font-weight: 600; }

  @media (max-width: 960px) {
    .sp-root { padding: 16px; }
    .sp-form { grid-template-columns: 1fr 1fr; }
    .sp-summary-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .sp-form { grid-template-columns: 1fr; }
    .sp-form-actions { flex-direction: column; }
    .sp-header h1 { font-size: 22px; }
  }
`;