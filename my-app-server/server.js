const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const db = require("./db_pool");

// ==================
// Middleware
// ==================
app.use(cors());
app.use(express.json());

// ==================
// Upload Config
// ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

// ==================
//  LOGIN
// ==================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username=? AND password=?",
      [username, password]
    );

    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json(err);
  }
});

// ==================
//  STUDENTS
// ==================
 
// ดึงนักศึกษาทั้งหมด
app.get("/students", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, cp.program_name_th
      FROM students s
      LEFT JOIN course_programs cp ON s.program_id = cp.id
      ORDER BY s.id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET STUDENTS ERROR:", err);
    res.status(500).json({ error: "โหลดข้อมูลไม่สำเร็จ" });
  }
});
 
 
app.post("/students", upload.single("image"), async (req, res) => {
  try {
    const { name, student_id, year, gender, age, program_id } = req.body;
    const image = req.file ? req.file.filename : null;
    const [result] = await db.query(
      `INSERT INTO students (name, student_id, year, gender, age, image, program_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, student_id, year, gender, age, image, program_id || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("ADD STUDENT ERROR:", err);
    res.status(500).json({ error: "เพิ่มข้อมูลไม่สำเร็จ" });
  }
});
 
app.put("/students/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, student_id, year, gender, age, program_id } = req.body;

    if (req.file) {
      await db.query(
        `UPDATE students SET name=?, student_id=?, year=?, gender=?, age=?, image=?, program_id=? WHERE id=?`,
        [name, student_id, year, gender, age, req.file.filename, program_id || null, req.params.id]
      );
    } else {
      await db.query(
        `UPDATE students SET name=?, student_id=?, year=?, gender=?, age=?, program_id=? WHERE id=?`,
        [name, student_id, year, gender, age, program_id || null, req.params.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE STUDENT ERROR:", err);
    res.status(500).json({ error: "แก้ไขข้อมูลไม่สำเร็จ" });
  }
});
 
// ลบนักศึกษา
app.delete("/students/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM students WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE STUDENT ERROR:", err);
    res.status(500).json({ error: "ลบข้อมูลไม่สำเร็จ" });
  }
});

// COURSE ROUTES

// ดึงหลักสูตรทั้งหมด
app.get("/api/course-programs", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM course_programs
      WHERE faculty_group = 'วิทยาศาสตร์การคำนวณ'
        AND is_active = 1
      ORDER BY id ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("GET course_programs ERROR:", err);
    res.status(500).json({ error: "Failed to fetch course programs" });
  }
});

// ดึงหลักสูตรรายตัว + หมวดหลัก
app.get("/api/course-programs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [programRows] = await db.query(
      "SELECT * FROM course_programs WHERE id = ?",
      [id]
    );

    if (programRows.length === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    const [ruleRows] = await db.query(
      "SELECT * FROM course_credit_rules WHERE program_id = ? ORDER BY sort_order ASC",
      [id]
    );

    res.json({
      program: programRows[0],
      creditRules: ruleRows,
    });
  } catch (err) {
    console.error("GET course_programs/:id ERROR:", err);
    res.status(500).json({ error: "Failed to fetch program detail" });
  }
});

// ดึงรายละเอียดภายในแต่ละหมวด
app.get("/api/course-programs/:id/credit-details", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM course_credit_details
       WHERE program_id = ?
       ORDER BY parent_rule_name ASC, sort_order ASC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET credit details ERROR:", err);
    res.status(500).json({ error: "Failed to fetch credit details" });
  }
});

// เพิ่มหลักสูตร
app.post("/api/course-programs", async (req, res) => {
  try {
    const {
      faculty_group,
      degree_level,
      program_name_th,
      program_name_en,
      degree_name_th,
      degree_name_en,
      degree_abbr_th,
      degree_abbr_en,
      curriculum_year,
      total_credits,
      general_education_credits,
      major_credits,
      free_elective_credits,
      description,
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO course_programs
      (faculty_group, degree_level, program_name_th, program_name_en,
       degree_name_th, degree_name_en, degree_abbr_th, degree_abbr_en,
       curriculum_year, total_credits, general_education_credits,
       major_credits, free_elective_credits, description, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        faculty_group,
        degree_level,
        program_name_th,
        program_name_en,
        degree_name_th,
        degree_name_en,
        degree_abbr_th,
        degree_abbr_en,
        curriculum_year,
        total_credits,
        general_education_credits,
        major_credits,
        free_elective_credits,
        description,
      ]
    );

    const newId = result.insertId;

    await db.query(
      `INSERT INTO course_credit_rules (program_id, rule_name, credits, sort_order)
       VALUES (?, 'หมวดวิชาศึกษาทั่วไป', ?, 1),
              (?, 'หมวดวิชาเฉพาะ', ?, 2),
              (?, 'วิชาเลือกเสรี', ?, 3)`,
      [
        newId,
        general_education_credits || 0,
        newId,
        major_credits || 0,
        newId,
        free_elective_credits || 0,
      ]
    );

    res.json({ success: true, id: newId });
  } catch (err) {
    console.error("POST course_programs ERROR:", err);
    res.status(500).json({ error: "Failed to add course program" });
  }
});

// แก้ไขหลักสูตร
app.put("/api/course-programs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      program_name_th,
      program_name_en,
      degree_name_th,
      degree_name_en,
      degree_abbr_th,
      degree_abbr_en,
      curriculum_year,
      total_credits,
      general_education_credits,
      major_credits,
      free_elective_credits,
      description,
    } = req.body;

    await db.query(
      `UPDATE course_programs
       SET program_name_th = ?, program_name_en = ?,
           degree_name_th = ?, degree_name_en = ?,
           degree_abbr_th = ?, degree_abbr_en = ?,
           curriculum_year = ?, total_credits = ?,
           general_education_credits = ?, major_credits = ?,
           free_elective_credits = ?, description = ?
       WHERE id = ?`,
      [
        program_name_th,
        program_name_en,
        degree_name_th,
        degree_name_en,
        degree_abbr_th,
        degree_abbr_en,
        curriculum_year,
        total_credits,
        general_education_credits,
        major_credits,
        free_elective_credits,
        description,
        id,
      ]
    );

    await db.query(
      `UPDATE course_credit_rules
       SET credits = CASE
         WHEN rule_name = 'หมวดวิชาศึกษาทั่วไป' THEN ?
         WHEN rule_name = 'หมวดวิชาเฉพาะ' THEN ?
         WHEN rule_name = 'วิชาเลือกเสรี' THEN ?
         ELSE credits
       END
       WHERE program_id = ?`,
      [
        general_education_credits || 0,
        major_credits || 0,
        free_elective_credits || 0,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("PUT course_programs ERROR:", err);
    res.status(500).json({ error: "Failed to update course program" });
  }
});

// ลบหลักสูตรแบบ soft delete
app.delete("/api/course-programs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE course_programs SET is_active = 0 WHERE id = ?",
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE course_programs ERROR:", err);
    res.status(500).json({ error: "Failed to delete course program" });
  }
});

// CREDIT DETAILS

app.get("/api/course-programs/:id/credit-details", async (req, res) => {
  try {

    const programId = req.params.id;

    // ข้อมูลหลักสูตร
    const [programRows] = await db.query(
      "SELECT * FROM course_programs WHERE id = ?",
      [programId]
    );

    if (programRows.length === 0) {
      return res.status(404).json({
        error: "Program not found"
      });
    }

    // กฎหน่วยกิต
    const [ruleRows] = await db.query(
      `SELECT *
       FROM course_credit_rules
       WHERE program_id = ?
       ORDER BY sort_order ASC`,
      [programId]
    );

    // วิชาในหลักสูตร
    const [subjectRows] = await db.query(
      `SELECT *
       FROM subjects
       WHERE program_id = ?
       ORDER BY year, semester`,
      [programId]
    );

    res.json({
      program: programRows[0],
      creditRules: ruleRows,
      subjects: subjectRows
    });

  } catch (err) {
    console.error("CREDIT DETAIL ERROR:", err);
    res.status(500).json({
      error: "Failed to load credit details"
    });
  }
});

//subject

app.get("/api/subjects/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        id,
        subject_code AS code,
        subject_name_th AS name,
        credits AS credit,
        category,
        year,
        semester,
        program_id
       FROM subjects
       WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "ไม่พบรายวิชา" });
    res.json({ subject: rows[0] });
  } catch (err) {
    console.error("GET SUBJECT BY ID ERROR:", err);
    res.status(500).json({ error: "โหลดข้อมูลไม่สำเร็จ" });
  }
});
 
// ดึงวิชาทั้งหมด
app.get("/api/subjects", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        subject_code AS code,
        subject_name_th AS name,
        credits AS credit,
        category,
        year,
        semester,
        program_id
      FROM subjects
      ORDER BY id ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET SUBJECTS ERROR:", err);
    res.status(500).json({ error: "โหลดข้อมูลไม่สำเร็จ" });
  }
});
 
// เพิ่มวิชา
app.post("/api/subjects", async (req, res) => {
  try {
    const { code, name, credit, category, year, semester, program_id } = req.body;
    const [result] = await db.query(
      `INSERT INTO subjects
        (subject_code, subject_name_th, credits, category, year, semester, program_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, name, credit, category || null, year, semester, program_id || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("ADD SUBJECT ERROR:", err);
    res.status(500).json({ error: "เพิ่มข้อมูลไม่สำเร็จ" });
  }
});
 
// แก้ไขวิชา
app.put("/api/subjects/:id", async (req, res) => {
  try {
    const { code, name, credit, category, year, semester, program_id } = req.body;
    await db.query(
      `UPDATE subjects SET
        subject_code    = ?,
        subject_name_th = ?,
        credits         = ?,
        category        = ?,
        year            = ?,
        semester        = ?,
        program_id      = ?
       WHERE id = ?`,
      [code, name, credit, category || null, year, semester, program_id || null, req.params.id]
    );
    res.json({ success: true, id: Number(req.params.id) });
  } catch (err) {
    console.error("UPDATE SUBJECT ERROR:", err);
    res.status(500).json({ error: "แก้ไขข้อมูลไม่สำเร็จ" });
  }
});
 
// ลบวิชา
app.delete("/api/subjects/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM subjects WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE SUBJECT ERROR:", err);
    res.status(500).json({ error: "ลบข้อมูลไม่สำเร็จ" });
  }
});
 
// แก้ไขวิชา
app.put("/api/subjects/:id", async (req, res) => {
  try {
    const { code, name, credit, category, year, semester, program_id } = req.body;

    await db.query(
      `UPDATE subjects SET
        subject_code=?,
        subject_name_th=?,
        credits=?,
        category=?,
        year=?,
        semester=?,
        program_id=?
       WHERE id=?`,
      [code, name, credit, category, year, semester, program_id, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE SUBJECT ERROR:", err);
    res.status(500).json({ error: "แก้ไขข้อมูลไม่สำเร็จ" });
  }
});

// ลบวิชา
app.delete("/api/subjects/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM subjects WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE SUBJECT ERROR:", err);
    res.status(500).json({ error: "ลบข้อมูลไม่สำเร็จ" });
  }
});

// ==================
// GRADES
// ==================

// ดึงเกรดทั้งหมด
app.get("/api/grades", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM grades
      ORDER BY semester ASC, year ASC, id ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("GET GRADES ERROR:", err);
    res.status(500).json({ error: "โหลดข้อมูลเกรดไม่สำเร็จ" });
  }
});

// ดึงเกรดตาม student_id
app.get("/api/grades/student/:student_id", async (req, res) => {
  try {
    const { student_id } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM grades
       WHERE student_id = ?
       ORDER BY year ASC, semester ASC`,
      [student_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET GRADES BY STUDENT ERROR:", err);
    res.status(500).json({ error: "โหลดข้อมูลเกรดไม่สำเร็จ" });
  }
});

// เพิ่มเกรด ✅ แก้ไขแล้ว — เพิ่ม score เข้า INSERT
app.post("/api/grades", async (req, res) => {
  try {
    const {
      student_id,
      student_name,
      subject_code,
      subject_name,
      credit,
      credit_value,
      section,
      subject_type,
      score,
      grade,
      semester,
      year,
      program_id,
    } = req.body;

    const creditVal = credit_value ?? parseInt(String(credit)) ?? 0;

    await db.query(
      `INSERT INTO grades
        (student_id, student_name, subject_code, subject_name,
         credit, credit_value, section, subject_type,
         score, grade, semester, year, program_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id ?? "6400000000",
        student_name ?? "Unknown",
        subject_code,
        subject_name,
        credit,
        creditVal,
        section ?? "01",
        subject_type ?? "C",
        score !== undefined && score !== "" ? Number(score) : null, 
        grade,
        Number(semester),
        Number(year),
        program_id ?? 4,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("POST GRADE ERROR:", err);
    res.status(500).json({ error: "เพิ่มเกรดไม่สำเร็จ" });
  }
});

// แก้ไขเกรด ✅ แก้ไขแล้ว — เพิ่ม score เข้า UPDATE
app.put("/api/grades/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_id,
      student_name,
      subject_code,
      subject_name,
      credit,
      credit_value,
      section,
      subject_type,
      score,
      grade,
      semester,
      year,
      program_id,
    } = req.body;

    const creditVal = credit_value ?? parseInt(String(credit)) ?? 0;

    await db.query(
      `UPDATE grades SET
        student_id   = ?,
        student_name = ?,
        subject_code = ?,
        subject_name = ?,
        credit       = ?,
        credit_value = ?,
        section      = ?,
        subject_type = ?,
        score        = ?,
        grade        = ?,
        semester     = ?,
        year         = ?,
        program_id   = ?
       WHERE id = ?`,
      [
        student_id ?? "6400000000",       
        student_name ?? "Unknown",         
        subject_code ?? "",
        subject_name ?? "",
        credit ?? String(creditVal),       
        creditVal,
        section ?? "01",
        subject_type ?? "C",
        score !== undefined && score !== "" ? Number(score) : null,
        grade ?? "F",
        Number(semester ?? 1),             
        Number(year ?? 2568),              
        program_id ?? 4,
        id,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("PUT GRADE ERROR:", err);
    res.status(500).json({ error: "แก้ไขเกรดไม่สำเร็จ", detail: err.message }); // 👈 เพิ่ม debug
  }
});

// ลบเกรด
app.delete("/api/grades/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM grades WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE GRADE ERROR:", err);
    res.status(500).json({ error: "ลบเกรดไม่สำเร็จ" });
  }
});


// ==================
// START SERVER
// ==================
app.listen(3001, () => {
  console.log("🚀 Server running on http://localhost:3001");
});