import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { NetworkGuard } from "./NetworkGuard";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />
      <main className="flex-1">
        <NetworkGuard>
          <Outlet />
        </NetworkGuard>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
