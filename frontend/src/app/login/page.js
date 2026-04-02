"use client";
import "bootstrap/dist/css/bootstrap.min.css";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Login success");
        router.push("/dashboard");
      } else {
        alert("Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting server");
    }
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        .wrapper {
          width: 500px;
          max-width: 90%;
          padding: 40px 50px;
          background: transparent;
          border: 3px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(9px);
          border-radius: 12px;
        }

        .wrapper h1 {
          font-size: 36px;
          text-align: center;
          color: #fff;
          font-family: 'Kanit', sans-serif;
        }

        .input-box {
          position: relative;
          width: 100%;
          height: 50px;
          margin: 30px 0;
        }

        .input-box input {
          width: 100%;
          height: 100%;
          background: transparent;
          outline: none;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 40px;
          font-size: 16px;
          color: #fff;
          padding: 20px 45px 20px 20px;
          transition: 0.3s;
          font-family: 'Kanit', sans-serif;
        }

        .input-box input::placeholder { color: rgba(255,255,255,0.7); }
        .input-box input:hover { transform: scale(1.03); }
        .input-box input:focus { border-color: #4facfe; outline: none; }

        .input-box i {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          color: rgba(255,255,255,0.7);
        }

        .remember-forgot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          margin: -10px 0 20px;
          color: #fff;
          font-family: 'Kanit', sans-serif;
        }

        .remember-forgot label {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          color: #fff;
        }

        .remember-forgot label input { accent-color: #4facfe; }

        .remember-forgot a {
          color: #fff;
          text-decoration: none;
        }
        .remember-forgot a:hover { text-decoration: underline; }

        .login-btn {
          width: 100%;
          height: 45px;
          background: linear-gradient(45deg, #4facfe, #00f2fe);
          border: none;
          border-radius: 40px;
          cursor: pointer;
          font-size: 16px;
          color: #fff;
          font-weight: 600;
          transition: 0.3s;
          font-family: 'Kanit', sans-serif;
        }

        .login-btn:hover {
          transform: scale(1.03);
          opacity: 0.9;
        }

        .register-link {
          font-size: 14px;
          text-align: center;
          margin: 20px 0 0;
          color: rgba(255,255,255,0.7);
          font-family: 'Kanit', sans-serif;
        }

        .register-link a {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
        }
        .register-link a:hover { text-decoration: underline; }
      `}</style>

      {/* ใส่ background ผ่าน inline style เพื่อกัน globals.css override */}
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundImage: "url('/bglogin.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Kanit', sans-serif",
        }}
      >
        <div className="wrapper">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>

            <div className="input-box">
              <input
                type="text"
                placeholder="Username"
                required
                onChange={(e) => setUsername(e.target.value)}
              />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="bx bxs-lock-alt"></i>
            </div>

            <div className="remember-forgot">
              <label>
                <input type="checkbox" />
                Remember Me
              </label>
              <a href="#">Forgot Password</a>
            </div>

            <button type="submit" className="login-btn">Login</button>

            <div className="register-link">
              <p>Dont have an account? <a href="#">Register</a></p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}