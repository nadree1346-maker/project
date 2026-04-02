export async function GET(endpoint) {
  const url = process.env.NEXT_PUBLIC_SERVER_API + endpoint;
  console.log("GET:", url);

  let response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + (localStorage.getItem("access_token") || ""),
    },
  });

  let text = await response.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ GET ไม่ใช่ JSON:", text);
    throw new Error("GET API error");
  }
}

// -----------------------------

export async function POST(endpoint, data) {
  const url = process.env.NEXT_PUBLIC_SERVER_API + endpoint;
  console.log("POST:", url, data);

  let response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + (localStorage.getItem("access_token") || ""),
    },
    body: JSON.stringify(data),
  });

  let text = await response.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ POST ไม่ใช่ JSON:", text);
    throw new Error("POST API error");
  }
}

// -----------------------------

export async function UPLOAD(endpoint, data) {
  const url = process.env.NEXT_PUBLIC_SERVER_API + endpoint;
  console.log("UPLOAD:", url);

  let response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + (localStorage.getItem("access_token") || ""),
    },
    body: data,
  });

  let text = await response.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ UPLOAD ไม่ใช่ JSON:", text);
    throw new Error("UPLOAD API error");
  }
}