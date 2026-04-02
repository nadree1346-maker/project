"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import CourseChart from "@/app/chart/chart_course";

const initialForm = {
  faculty_group: "วิทยาศาสตร์การคำนวณ",
  degree_level: "ปริญญาตรี",
  program_name_th: "",
  program_name_en: "",
  degree_name_th: "",
  degree_name_en: "",
  degree_abbr_th: "",
  degree_abbr_en: "",
  curriculum_year: 2564,
  total_credits: "",
  general_education_credits: "",
  major_credits: "",
  free_elective_credits: "",
  description: "",
};

export default function CoursePage() {
  const searchParams = useSearchParams();

  const [programs, setPrograms]               = useState([]);
  const [selectedId, setSelectedId]           = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [creditRules, setCreditRules]         = useState([]);
  const [creditDetails, setCreditDetails]     = useState([]);
  const [openSections, setOpenSections]       = useState({});
  const [loading, setLoading]                 = useState(true);
  const [errorText, setErrorText]             = useState("");
  const [formData, setFormData]               = useState(initialForm);
  const [editId, setEditId]                   = useState(null);

  useEffect(() => { loadPrograms(); }, []);

  async function loadPrograms() {
    try {
      setLoading(true);
      setErrorText("");
      const res  = await fetch("http://127.0.0.1:3001/api/course-programs");
      const data = await res.json();
      setPrograms(Array.isArray(data) ? data : []);

      if (Array.isArray(data) && data.length > 0) {
        // ✅ รับ program_id จาก URL ถ้ามี ถ้าไม่มีใช้ตัวแรก
        const pid = searchParams.get("program_id");
        const targetId = pid ? Number(pid) : data[0].id;
        await loadProgramDetail(targetId);
      } else {
        setSelectedProgram(null);
        setCreditRules([]);
        setCreditDetails([]);
      }
    } catch (error) {
      console.error("LOAD PROGRAMS ERROR:", error);
      setErrorText("โหลดข้อมูลหลักสูตรไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function loadProgramDetail(id) {
    try {
      setSelectedId(id);
      setErrorText("");
      
      const detailRes   = await fetch(`http://127.0.0.1:3001/api/course-programs/${id}`);
      const detailData  = await detailRes.json();
      
      const detailsRes  = await fetch(`http://127.0.0.1:3001/api/course-programs/${id}/credit-details`);
      const detailsData = await detailsRes.json();

      setSelectedProgram(detailData.program || null);
      setCreditRules(Array.isArray(detailData.creditRules) ? detailData.creditRules : []);

      // ✅ แก้ไข: รองรับทั้งกรณี response เป็น array หรือ object
      if (Array.isArray(detailsData)) {
        setCreditDetails(detailsData);
      } else if (detailsData && Array.isArray(detailsData.creditDetails)) {
        setCreditDetails(detailsData.creditDetails);
      } else if (detailsData && Array.isArray(detailsData.subjects)) {
        setCreditDetails(detailsData.subjects);
      } else {
        setCreditDetails([]);
      }
      setOpenSections({});
    } catch (error) {
      console.error("LOAD PROGRAM DETAIL ERROR:", error);
      setErrorText("โหลดรายละเอียดหลักสูตรไม่สำเร็จ");
      setCreditDetails([]);
    }
  }

  function toggleSection(sectionName) {
    setOpenSections((prev) => ({ 
      ...prev, [sectionName]: !prev[sectionName] }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const method = editId ? "PUT" : "POST";
      const url    = editId
        ? `http://127.0.0.1:3001/api/course-programs/${editId}`
        : "http://127.0.0.1:3001/api/course-programs";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          curriculum_year:           Number(formData.curriculum_year),
          total_credits:             Number(formData.total_credits),
          general_education_credits: Number(formData.general_education_credits),
          major_credits:             Number(formData.major_credits),
          free_elective_credits:     Number(formData.free_elective_credits),
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "บันทึกข้อมูลไม่สำเร็จ"); return; }

      alert(editId ? "แก้ไขหลักสูตรสำเร็จ" : "เพิ่มหลักสูตรสำเร็จ");
      setFormData(initialForm);
      setEditId(null);
      await loadPrograms();
      if (data.id) await loadProgramDetail(data.id);
    } catch (error) {
      console.error("SAVE COURSE ERROR:", error);
      alert("บันทึกข้อมูลไม่สำเร็จ");
    }
  }

  function handleEdit(program) {
    setEditId(program.id);
    setFormData({
      faculty_group:             program.faculty_group || "วิทยาศาสตร์การคำนวณ",
      degree_level:              program.degree_level  || "ปริญญาตรี",
      program_name_th:           program.program_name_th  || "",
      program_name_en:           program.program_name_en  || "",
      degree_name_th:            program.degree_name_th   || "",
      degree_name_en:            program.degree_name_en   || "",
      degree_abbr_th:            program.degree_abbr_th   || "",
      degree_abbr_en:            program.degree_abbr_en   || "",
      curriculum_year:           program.curriculum_year  || 2564,
      total_credits:             program.total_credits               || "",
      general_education_credits: program.general_education_credits   || "",
      major_credits:             program.major_credits               || "",
      free_elective_credits:     program.free_elective_credits       || "",
      description:               program.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!confirm("ต้องการลบหลักสูตรนี้ใช่หรือไม่?")) return;
    try {
      const res  = await fetch(`http://127.0.0.1:3001/api/course-programs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "ลบข้อมูลไม่สำเร็จ"); return; }
      alert("ลบหลักสูตรสำเร็จ");
      await loadPrograms();
    } catch (error) {
      console.error("DELETE COURSE ERROR:", error);
      alert("ลบข้อมูลไม่สำเร็จ");
    }
  }

  function handleCancelEdit() {
    setEditId(null);
    setFormData(initialForm);
  }

  return (
    <div className="course-page">
      <style suppressHydrationWarning>{css}</style>

      <div className="course-header">
        <h1>หลักสูตรวิทยาศาสตร์การคำนวณ</h1>
        <p>ระดับปริญญาตรี</p>
      </div>

      {/* ===== FORM ===== */}
      <div className="card">
        <h3>{editId ? "แก้ไขหลักสูตร" : "เพิ่มหลักสูตร"}</h3>
        <form className="course-form" onSubmit={handleSubmit}>
          <input name="program_name_th"           placeholder="ชื่อสาขา (ไทย)"      value={formData.program_name_th}           onChange={handleChange} required />
          <input name="program_name_en"           placeholder="ชื่อสาขา (อังกฤษ)"   value={formData.program_name_en}           onChange={handleChange} required />
          <input name="degree_name_th"            placeholder="ชื่อปริญญา (ไทย)"    value={formData.degree_name_th}            onChange={handleChange} required />
          <input name="degree_name_en"            placeholder="ชื่อปริญญา (อังกฤษ)" value={formData.degree_name_en}            onChange={handleChange} required />
          <input name="degree_abbr_th"            placeholder="ชื่อย่อ (ไทย)"        value={formData.degree_abbr_th}            onChange={handleChange} required />
          <input name="degree_abbr_en"            placeholder="ชื่อย่อ (อังกฤษ)"     value={formData.degree_abbr_en}            onChange={handleChange} required />
          <input name="curriculum_year"           placeholder="ปีหลักสูตร"           value={formData.curriculum_year}           onChange={handleChange} type="number" required />
          <input name="total_credits"             placeholder="หน่วยกิตรวม"          value={formData.total_credits}             onChange={handleChange} type="number" required />
          <input name="general_education_credits" placeholder="ศึกษาทั่วไป"          value={formData.general_education_credits} onChange={handleChange} type="number" required />
          <input name="major_credits"             placeholder="วิชาเฉพาะ"            value={formData.major_credits}             onChange={handleChange} type="number" required />
          <input name="free_elective_credits"     placeholder="วิชาเลือกเสรี"        value={formData.free_elective_credits}     onChange={handleChange} type="number" required />
          <textarea name="description" placeholder="คำอธิบายหลักสูตร" value={formData.description} onChange={handleChange} rows={4} required />
          <div className="form-actions">
            <button type="submit" className="save-btn">
              {editId ? "บันทึกการแก้ไข" : "เพิ่มหลักสูตร"}
            </button>
            {editId && (
              <button type="button" className="cancel-btn" onClick={handleCancelEdit}>ยกเลิก</button>
            )}
          </div>
        </form>
      </div>

      {/* ===== TABLE ===== */}
      <div className="card">
        <h3>รายการหลักสูตร</h3>
        <div className="course-table-wrapper">
          <table className="course-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>สาขา</th>
                <th>ปีหลักสูตร</th>
                <th>หน่วยกิตรวม</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((item) => (
                <tr key={item.id} className={selectedId === item.id ? "active-row" : ""}>
                  <td>{item.id}</td>
                  <td>{item.program_name_th}</td>
                  <td>{item.curriculum_year}</td>
                  <td>{item.total_credits}</td>
                  <td className="table-actions">
                    <button className="view-btn"   onClick={() => loadProgramDetail(item.id)}>ดู</button>
                    <button className="edit-btn"   onClick={() => handleEdit(item)}>แก้ไข</button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== CHART ===== */}
      <CourseChart programs={programs} />

      {/* ===== DETAIL LAYOUT ===== */}
      <div className="course-layout">
        <aside className="course-sidebar">
          <div className="sidebar-card">
            <h2>สาขาในกลุ่มวิทยาศาสตร์การคำนวณ</h2>
            <p>เลือกสาขาเพื่อดูรายละเอียดหลักสูตรและหน่วยกิต</p>
            <div className="program-count">จำนวนสาขา: {programs.length}</div>
            <div className="program-list">
              {programs.map((item) => (
                <button
                  key={item.id}
                  className={`program-btn ${selectedId === item.id ? "active" : ""}`}
                  onClick={() => loadProgramDetail(item.id)}
                >
                  {item.program_name_th}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="course-content">
          {loading ? (
            <div className="card">กำลังโหลดข้อมูล...</div>
          ) : errorText ? (
            <div className="card error-card">{errorText}</div>
          ) : selectedProgram ? (
            <>
              {/* ===== Hero ===== */}
              <div className="card hero-card">
                <div className="hero-badge">🎓 หลักสูตรที่เลือก</div>
                <h2>{selectedProgram.degree_name_th}</h2>
                <p className="hero-en">{selectedProgram.degree_name_en}</p>
                <p className="hero-year">ปีหลักสูตร: {selectedProgram.curriculum_year}</p>
              </div>

              {/* ===== Summary ===== */}
              <div className="summary-grid">
                <div className="summary-box">
                  <span>ชื่อสาขา</span>
                  <strong>{selectedProgram.program_name_th}</strong>
                </div>
                <div className="summary-box">
                  <span>ชื่อย่อ</span>
                  <strong>{selectedProgram.degree_abbr_th}</strong>
                </div>
                <div className="summary-box highlight">
                  <span>หน่วยกิตรวม</span>
                  <strong>{selectedProgram.total_credits}</strong>
                </div>
              </div>

              {/* ===== Description ===== */}
              <div className="card">
                <h3>คำอธิบายหลักสูตร</h3>
                <p>{selectedProgram.description}</p>
              </div>

              {/* ===== Credit Structure ===== */}
              <div className="card">
                <h3>โครงสร้างหน่วยกิต</h3>
                <div className="credit-list">
                  {creditRules.map((rule) => {
                    const children = Array.isArray(creditDetails)
                      ? creditDetails.filter((item) => item.parent_rule_name === rule.rule_name)
                      : [];
                    const isOpen = openSections[rule.rule_name];
                    return (
                      <div key={rule.id} className="credit-group">
                        <button
                          className="credit-item clickable"
                          onClick={() => toggleSection(rule.rule_name)}
                        >
                          <div className="credit-left">
                            <span>{rule.rule_name}</span>
                          </div>
                          <div className="credit-right">
                            <strong>{rule.credits} หน่วยกิต</strong>
                            <span className={`arrow ${isOpen ? "open" : ""}`}>▼</span>
                          </div>
                        </button>
                        {isOpen && children.length > 0 && (
                          <div className="credit-sublist">
                            {children.map((item) => (
                              <div key={item.id} className="credit-subitem">
                                <span>{item.detail_name}</span>
                                <strong>{item.credits_text} หน่วยกิต</strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="card">ไม่พบข้อมูลหลักสูตร</div>
          )}
        </section>
      </div>
    </div>
  );
}

const css = `
  .course-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
  }

  .course-header h1 {
    margin-bottom: 8px;
    color: #0f172a;
    font-size: 28px;
    font-weight: 800;
  }

  .course-header p {
    color: #64748b;
    font-size: 18px;
  }

  .card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
  }

  .card h3 {
    color: #0f172a;
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: 800;
  }

  .card p {
    color: #475569;
    line-height: 1.8;
    font-size: 16px;
  }

  /* form */
  .course-form {
    display: grid;
    grid-template-columns: repeat(3, minmax(200px, 1fr));
    gap: 14px;
  }

  .course-form input,
  .course-form textarea {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #dbe4f0;
    border-radius: 14px;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
  }

  .course-form input:focus,
  .course-form textarea:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
  }

  .course-form textarea {
    grid-column: 1 / -1;
    resize: vertical;
  }

  .form-actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 12px;
  }

  .save-btn, .cancel-btn, .view-btn, .edit-btn, .delete-btn {
    border: none;
    border-radius: 12px;
    padding: 10px 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-btn:hover, .cancel-btn:hover, .view-btn:hover,
  .edit-btn:hover, .delete-btn:hover { opacity: 0.85; transform: translateY(-1px); }

  .save-btn   { background: #2563eb; color: white; }
  .cancel-btn { background: #e2e8f0; color: #0f172a; }
  .view-btn   { background: #dbeafe; color: #1d4ed8; }
  .edit-btn   { background: #fef3c7; color: #92400e; }
  .delete-btn { background: #fee2e2; color: #b91c1c; }

  /* table */
  .course-table-wrapper { overflow-x: auto; }

  .course-table {
    width: 100%;
    border-collapse: collapse;
  }

  .course-table th,
  .course-table td {
    padding: 14px 12px;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
  }

  .course-table th { color: #64748b; font-size: 14px; }
  .course-table td { color: #0f172a; font-size: 15px; }

  .course-table tbody tr { transition: background 0.15s; }
  .course-table tbody tr:hover { background: #f8fafc; }
  .course-table tbody tr.active-row { background: #eff6ff; }

  .table-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* detail layout */
  .course-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;
    align-items: start;
  }

  .course-sidebar {
    position: sticky;
    top: 24px;
  }

  .sidebar-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  }

  .sidebar-card h2 {
    color: #2563eb;
    font-size: 22px;
    line-height: 1.35;
    margin-bottom: 16px;
    font-weight: 800;
  }

  .sidebar-card p {
    color: #64748b;
    line-height: 1.7;
    margin-bottom: 20px;
    font-size: 15px;
  }

  .program-count {
    color: #64748b;
    margin-bottom: 18px;
    font-weight: 600;
    font-size: 14px;
  }

  .program-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .program-btn {
    width: 100%;
    padding: 14px 18px;
    border: 1px solid #cfe0ff;
    background: #eff6ff;
    color: #1d4ed8;
    border-radius: 14px;
    text-align: left;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .program-btn:hover {
    background: #dbeafe;
    transform: translateY(-1px);
  }

  .program-btn.active {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
  }

  .course-content {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  /* hero */
  .hero-card { position: relative; }

  .hero-badge {
    display: inline-block;
    background: #eff6ff;
    color: #2563eb;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 999px;
    margin-bottom: 12px;
  }

  .hero-card h2 {
    margin-bottom: 10px;
    color: #0f172a;
    font-size: 22px;
    font-weight: 800;
  }

  .hero-en   { color: #64748b; font-size: 16px; margin-bottom: 8px; }
  .hero-year { color: #475569; font-size: 14px; }

  /* summary */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(150px, 1fr));
    gap: 16px;
  }

  .summary-box {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 18px;
    padding: 20px;
  }

  .summary-box.highlight {
    background: #2563eb;
    border-color: #2563eb;
  }

  .summary-box.highlight span { color: #bfdbfe; }
  .summary-box.highlight strong { color: #ffffff; }

  .summary-box span {
    display: block;
    color: #475569;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .summary-box strong {
    color: #1d4ed8;
    font-size: 20px;
    font-weight: 800;
  }

  /* credit */
  .credit-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .credit-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .credit-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #dbe4f0;
    border-radius: 16px;
    padding: 16px 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .credit-item:hover { background: #eef4ff; border-color: #bfdbfe; }

  .credit-left span {
    color: #334155;
    font-size: 15px;
    font-weight: 700;
  }

  .credit-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .credit-right strong {
    color: #0f172a;
    font-size: 15px;
    font-weight: 800;
  }

  .arrow {
    color: #2563eb;
    font-size: 14px;
    transition: transform 0.2s ease;
  }

  .arrow.open { transform: rotate(180deg); }

  .credit-sublist {
    margin-left: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .credit-subitem {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 16px;
  }

  .credit-subitem span {
    color: #475569;
    font-size: 14px;
    line-height: 1.6;
    max-width: 75%;
  }

  .credit-subitem strong {
    color: #1e293b;
    font-size: 14px;
    font-weight: 800;
    white-space: nowrap;
  }

  .error-card { color: #dc2626; font-weight: 700; }

  @media (max-width: 1200px) {
    .summary-grid,
    .course-form { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 960px) {
    .course-layout { grid-template-columns: 1fr; }
    .course-sidebar { position: static; }
  }

  @media (max-width: 640px) {
    .course-page { padding: 16px; }
    .summary-grid,
    .course-form { grid-template-columns: 1fr; }
    .sidebar-card h2 { font-size: 20px; }
    .course-header h1 { font-size: 22px; }
    .credit-item,
    .credit-subitem { flex-direction: column; align-items: flex-start; gap: 8px; }
    .credit-subitem span { max-width: 100%; }
    .form-actions { flex-direction: column; }
  }
`;