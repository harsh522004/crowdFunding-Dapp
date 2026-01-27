import { NavLink } from "react-router-dom";

function Header() {
  return (
    <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">₿</span>
            </div>
            <h1 className="text-xl font-bold text-white">CrowdFund</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-blue-400 ${
                  isActive ? 'text-blue-400' : 'text-slate-300'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/create"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-blue-400 ${
                  isActive ? 'text-blue-400' : 'text-slate-300'
                }`
              }
            >
              Create Campaign
            </NavLink>
            <NavLink
              to="/my-campaigns"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-blue-400 ${
                  isActive ? 'text-blue-400' : 'text-slate-300'
                }`
              }
            >
              My Campaigns
            </NavLink>
          </nav>

          {/* Connect Wallet Button */}
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
