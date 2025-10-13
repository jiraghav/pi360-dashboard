import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import PageTitleUpdater from "./components/PageTitleUpdater";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PageTitleUpdater /> {/* updates title dynamically */}
        <Navbar />
        <div className="layout">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
