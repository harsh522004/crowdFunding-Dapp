import { Outlet } from "react-router-dom";
import Header from "./Header";
import { NetworkGuard } from "./NetworkGuard";

function Layout() {
  return (
    <div>
      <Header></Header>
      <NetworkGuard>
        <Outlet />
      </NetworkGuard>
    </div>
  );
}

export default Layout;
