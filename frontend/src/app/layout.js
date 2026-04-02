import "./globals.css";

export const metadata = {
  title: "Student System",
  description: "Login System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        {/* ฟ้อน Kanit */}
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap"
          rel="stylesheet"
        />

        {/* Boxicons */}
        <link
          href="https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css"
          rel="stylesheet"
        />
      </head>

      <body style={{ fontFamily: "Kanit, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}