import { NavLink } from "react-router-dom";

function Header() {
  return (
    <header>
      <div>
        <h1>Funding</h1>
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/create">Create</NavLink>
          <NavLink to="/my-campaigns">My Campaign</NavLink>
          <NavLink to="/campaign/:address">Campaign Details</NavLink>
        </nav>
        <button>Connect Wallet</button>
      </div>
    </header>
  );
}

export default Header;
