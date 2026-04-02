import { GET, POST, UPLOAD } from "./base_api";

// -----------------------------
// 📌 GET ALL
// -----------------------------
export async function getAllStudent() {
  try {
    return await GET("/student/all");
  } catch (err) {
    console.error("❌ getAllStudent error:", err);
    return { data: [] };
  }
}

// -----------------------------
// 📌 GET DETAIL
// -----------------------------
export async function getStudentDetail(studentId) {
  try {
    return await GET(`/student/detail/${studentId}`);
  } catch (err) {
    console.error("❌ getStudentDetail error:", err);
    return { data: [] };
  }
}

// -----------------------------
// 📌 FORM DATA
// -----------------------------
export async function getFormDataForAdd() {
  try {
    return await GET("/student/form_data_add");
  } catch (err) {
    console.error("❌ getFormDataForAdd error:", err);
    return {};
  }
}

export async function getFormDataForUpdate(studentId) {
  try {
    return await GET(`/student/form_data_update/${studentId}`);
  } catch (err) {
    console.error("❌ getFormDataForUpdate error:", err);
    return {};
  }
}

// -----------------------------
// 📌 ADD / UPDATE / DELETE
// -----------------------------
export async function addStudent(studentId, name, year, gender, age) {
  try {
    return await POST("/student/add", {
      student_id: studentId,
      name,
      year,
      gender,
      age,
    });
  } catch (err) {
    console.error("❌ addStudent error:", err);
    return { success: false };
  }
}

export async function updateStudent(studentId, name, year, gender, age) {
  try {
    return await POST("/student/update", {
      student_id: studentId,
      name,
      year,
      gender,
      age,
    });
  } catch (err) {
    console.error("❌ updateStudent error:", err);
    return { success: false };
  }
}

export async function deleteStudent(studentId) {
  try {
    return await POST("/student/delete", {
      student_id: studentId,
    });
  } catch (err) {
    console.error("❌ deleteStudent error:", err);
    return { success: false };
  }
}

// -----------------------------
// 📊 COUNT
// -----------------------------
export async function countStudentGroupByGender() {
  try {
    return await GET("/student/count_student_group_by_gender");
  } catch (err) {
    console.error("❌ countStudentGroupByGender error:", err);
    return { data: [] };
  }
}

export async function countStudentGroupByYear() {
  try {
    return await GET("/student/count_student_group_by_year");
  } catch (err) {
    console.error("❌ countStudentGroupByYear error:", err);
    return { data: [] };
  }
}

// -----------------------------
// 📷 UPLOAD
// -----------------------------
export async function uploadStudentImage(studentId, formData) {
  try {
    return await UPLOAD(`/student/upload_image/${studentId}`, formData);
  } catch (err) {
    console.error("❌ uploadStudentImage error:", err);
    return { success: false };
  }
}