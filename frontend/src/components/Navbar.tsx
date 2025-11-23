import { Link, NavLink } from 'react-router-dom';

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px'
};

const activeStyle: React.CSSProperties = {
  backgroundColor: '#e2e8f0',
  color: '#0f172a'
};

function Navbar() {
  return (
    <nav>
      <Link to="/" className="nav-title" style={{ textDecoration: 'none' }}>
        V4Corner
      </Link>
      <NavLink to="/" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Home
      </NavLink>
      <NavLink to="/blogs" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        Blogs
      </NavLink>
      <NavLink to="/about" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        About
      </NavLink>
    </nav>
  );
}

export default Navbar;
