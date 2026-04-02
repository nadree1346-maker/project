"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import StudentCharts from "@/app/chart/chart_student";

const EMPTY_FORM = {
  name: "", student_id: "", year: "", gender: "",
  age: "", image: null, program_id: ""
};

export default function Student() {
  const router = useRouter();
  const [students, setStudents]               = useState([]);
  const [programs, setPrograms]               = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingId, setEditingId]             = useState(null);
  const [form, setForm]                       = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl]           = useState(null);

  const loadStudents = async () => {
    const res = await axios.get("http://localhost:3001/students");
    setStudents(res.data);
  };

  const loadPrograms = async () => {
    const res = await axios.get("http://localhost:3001/api/course-programs");
    setPrograms(res.data);
  };

  useEffect(() => {
    loadStudents();
    loadPrograms();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("student_id", form.student_id);
    fd.append("year", form.year);
    fd.append("gender", form.gender);
    fd.append("age", form.age);
    fd.append("program_id", form.program_id);
    if (form.image) fd.append("image", form.image);

    if (editingId) {
      await axios.put(`http://localhost:3001/students/${editingId}`, fd);
    } else {
      await axios.post("http://localhost:3001/students", fd);
    }
    loadStudents();
    setForm(EMPTY_FORM);
    setEditingId(null);
    setPreviewUrl(null);
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name, student_id: s.student_id, year: s.year,
      gender: s.gender, age: s.age, image: null,
      program_id: s.program_id || ""
    });
    setEditingId(s.id);
    setPreviewUrl(s.image ? `http://localhost:3001/uploads/${s.image}` : null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("ต้องการลบนักศึกษานี้?")) return;
    await axios.delete(`http://localhost:3001/students/${id}`);
    loadStudents();
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setPreviewUrl(null);
  };

  // ปุ่ม ดูข้อมูล → นำทางไปหน้าหลักสูตร
  const handleViewCourse = (s) => {
  console.log("program_id:", s.program_id);  // เพิ่มบรรทัดนี้
  if (!s.program_id) {
    alert("นักศึกษานี้ยังไม่ได้กำหนดสาขา");
    return;
  }
  router.push(`/dashboard/course?program_id=${s.program_id}`);
};

  
  return (
    <div className="st-root">
      <style suppressHydrationWarning>{css}</style>

      <h1 className="st-title">นักศึกษาสาขาวิทยาศาสตร์การคำนวณ</h1>

      {/* ===== FORM ===== */}
      <div className="st-card">
        <p className="st-card-title">{editingId ? "✏️ แก้ไขนักศึกษา" : "➕ เพิ่มนักศึกษา"}</p>
        <form onSubmit={handleSubmit}>
          <div className="st-form">

            <div className="st-field">
              <label>ชื่อ-นามสกุล</label>
              <input type="text" placeholder="ชื่อ-นามสกุล" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="st-field">
              <label>รหัสนักศึกษา</label>
              <input type="text" placeholder="รหัสนักศึกษา" value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })} required />
            </div>

            <div className="st-field">
              <label>ชั้นปี</label>
              <input type="number" placeholder="1-4" value={form.year} min="1" max="4"
                onChange={(e) => setForm({ ...form, year: e.target.value })} required />
            </div>

            <div className="st-field">
              <label>เพศ</label>
              <select value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
                <option value="">เลือกเพศ</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div className="st-field">
              <label>อายุ</label>
              <input type="number" placeholder="อายุ" value={form.age} min="15" max="100"
                onChange={(e) => setForm({ ...form, age: e.target.value })} required />
            </div>

            {/* ===== สาขา dropdown ===== */}
            <div className="st-field">
              <label>สาขา</label>
              <select value={form.program_id}
                onChange={(e) => setForm({ ...form, program_id: e.target.value })} required>
                <option value="">เลือกสาขา</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.program_name_th}</option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div className="st-upload-area">
              <span className="st-upload-label">รูปภาพ</span>
              <div className="st-upload-box">
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {previewUrl ? (
                  <img src={previewUrl} className="st-upload-preview" alt="preview" />
                ) : (
                  <>
                    <i className="bx bx-image-add st-upload-icon"></i>
                    <span className="st-upload-text">คลิกเพื่อเลือกรูปภาพ<br/>หรือลากวางไฟล์ที่นี่</span>
                  </>
                )}
              </div>
              {form.image && <span className="st-upload-filename">📎 {form.image.name}</span>}
            </div>

          </div>

          <div className="st-form-actions" style={{ marginTop: 20 }}>
            <button type="submit" className="st-btn st-btn-primary">
              {editingId ? "💾 บันทึก" : "✅ เพิ่มนักศึกษา"}
            </button>
            {editingId && (
              <button type="button" className="st-btn st-btn-cancel" onClick={resetForm}>
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ===== TABLE ===== */}
      <div className="st-card">
        <p className="st-card-title">รายการนักศึกษาทั้งหมด ({students.length} คน)</p>
        <div className="st-table-wrap">
          {students.length === 0 ? (
            <p className="st-empty">ยังไม่มีข้อมูลนักศึกษา</p>
          ) : (
            <table className="st-table">
              <thead>
                <tr>
                  <th>รูป</th>
                  <th>รหัส</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>ชั้นปี</th>
                  <th>เพศ</th>
                  <th>อายุ</th>
                  <th>สาขา</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.image
                        ? <img src={`http://localhost:3001/uploads/${s.image}`} className="st-table-img" alt={s.name} />
                        : <div className="st-table-no-img">👤</div>
                      }
                    </td>
                    <td style={{ fontWeight: 600, color: "#2563eb" }}>{s.student_id}</td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td><span className="st-badge st-badge-year">ปี {s.year}</span></td>
                    <td>
                      <span className={`st-badge ${
                        s.gender === "ชาย" ? "st-badge-male"
                        : s.gender === "หญิง" ? "st-badge-female"
                        : "st-badge-other"
                      }`}>{s.gender}</span>
                    </td>
                    <td>{s.age} ปี</td>
                    <td>
                      {s.program_name_th
                        ? <span className="st-badge st-badge-program">{s.program_name_th}</span>
                        : <span style={{ color: "#94a3b8", fontSize: 12 }}>ไม่ระบุ</span>
                      }
                    </td>
                    <td>
                      <div className="st-actions">
                        <button
                          className="st-btn st-btn-view"
                          onClick={() => handleViewCourse(s)}
                          disabled={!s.program_id}
                          title={!s.program_id ? "ยังไม่ได้กำหนดสาขา" : "ดูหลักสูตรสาขา"}
                        >
                          ดูหลักสูตร
                        </button>
                        <button className="st-btn st-btn-edit" onClick={() => handleEdit(s)}>แก้ไข</button>
                        <button className="st-btn st-btn-delete" onClick={() => handleDelete(s.id)}>ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <StudentCharts students={students} />
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

  .st-root { font-family: 'Poppins', sans-serif; color: #0f172a; }

  /* ===== TITLE ===== */
  .st-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 24px;
    color: #0f172a;
  }

  /* ===== CARD ===== */
  .st-card {
    background: #fff;
    border-radius: 20px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
    padding: 28px;
    margin-bottom: 24px;
  }

  .st-card-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
  }

  /* ===== FORM ===== */
  .st-form {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
    align-items: end;
  }

  .st-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .st-field label {
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .st-field input,
  .st-field select {
    padding: 10px 14px;
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    background: #f8fafc;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    color: #0f172a;
    outline: none;
    transition: all 0.2s;
  }

  .st-field input:focus,
  .st-field select:focus {
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
  }

  /* Image Upload Area */
  .st-upload-area {
    grid-column: span 2;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .st-upload-label {
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .st-upload-box {
    position: relative;
    border: 2px dashed #cbd5e1;
    border-radius: 16px;
    background: #f8fafc;
    min-height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s;
    overflow: hidden;
  }

  .st-upload-box:hover {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .st-upload-box input[type=file] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .st-upload-icon {
    font-size: 40px;
    color: #94a3b8;
  }

  .st-upload-text {
    font-size: 13px;
    color: #94a3b8;
    text-align: center;
  }

  .st-upload-preview {
    width: 100%;
    height: 160px;
    object-fit: cover;
    border-radius: 14px;
  }

  .st-upload-filename {
    font-size: 12px;
    color: #2563eb;
    font-weight: 500;
  }

  /* Form Actions */
  .st-form-actions {
    display: flex;
    gap: 10px;
    align-items: end;
  }

  .st-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .st-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .st-btn:active { transform: translateY(0); }

  .st-btn-primary { background: #2563eb; color: #fff; }
  .st-btn-cancel  { background: #f1f5f9; color: #64748b; }
  .st-btn-view    { background: #ecfdf5; color: #059669; }
  .st-btn-edit    { background: #fef3c7; color: #b45309; }
  .st-btn-delete  { background: #fee2e2; color: #b91c1c; }

  /* ===== TABLE ===== */
  .st-table-wrap { overflow-x: auto; }

  .st-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 8px;
  }

  .st-table thead th {
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #94a3b8;
    padding: 8px 14px;
  }

  .st-table tbody tr {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .st-table tbody tr:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  }

  .st-table td {
    padding: 18px 14px;
    font-size: 13.5px;
    vertical-align: middle;
  }

  .st-table td:first-child { border-radius: 12px 0 0 12px; }
  .st-table td:last-child  { border-radius: 0 12px 12px 0; }

  .st-table-img {
    width: 100px;
    height: 100px;
    border-radius: 16px;
    object-fit: cover;
    border: 2px solid #f1f5f9;
  }

  .st-table-no-img {
    width: 100px;
    height: 100px;
    border-radius: 16px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    color: #cbd5e1;
  }

  .st-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
  }

  .st-badge-year { background: #eff6ff; color: #2563eb; }
  .st-badge-male { background: #eff6ff; color: #1d4ed8; }
  .st-badge-female { background: #fdf2f8; color: #be185d; }
  .st-badge-other { background: #f5f3ff; color: #7c3aed; }

  .st-actions { display: flex; gap: 6px; flex-wrap: wrap; }

  /* ===== CHARTS ===== */
  .st-charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  /* ===== MODAL ===== */
  .st-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  }

  .st-modal {
    background: #fff;
    border-radius: 24px;
    padding: 32px;
    width: 340px;
    max-width: 90vw;
    text-align: center;
    box-shadow: 0 25px 60px rgba(0,0,0,0.15);
    animation: modalPop 0.25s cubic-bezier(.22,.61,.36,1);
  }

  @keyframes modalPop {
    from { transform: scale(0.9); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  .st-modal-img {
    width: 130px;
    height: 130px;
    border-radius: 20px;
    object-fit: cover;
    margin: 0 auto 16px;
    display: block;
    border: 3px solid #f1f5f9;
  }

  .st-modal-no-img {
    width: 130px;
    height: 130px;
    border-radius: 20px;
    background: #f1f5f9;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 52px;
    color: #cbd5e1;
  }

  .st-modal h2 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #0f172a;
  }

  .st-modal-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
    text-align: left;
  }

  .st-modal-row {
    display: flex;
    justify-content: space-between;
    font-size: 13.5px;
    padding: 8px 12px;
    background: #f8fafc;
    border-radius: 8px;
  }

  .st-modal-row span:first-child { color: #64748b; font-weight: 500; }
  .st-modal-row span:last-child  { color: #0f172a; font-weight: 600; }

  /* ===== EMPTY ===== */
  .st-empty {
    text-align: center;
    padding: 40px;
    color: #94a3b8;
    font-size: 14px;
  }
`;