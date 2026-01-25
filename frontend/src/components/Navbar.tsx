import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

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
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav>
      <Link to="/" className="nav-title" style={{ textDecoration: 'none' }}>
        V4Corner
      </Link>
      <NavLink to="/" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        首页
      </NavLink>
      <NavLink to="/blogs" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        博客
      </NavLink>
      <NavLink to="/members" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        成员
      </NavLink>
      <NavLink to="/chat" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        AI对话
      </NavLink>
      <NavLink to="/notices" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
        班级通知
      </NavLink>

      <div style={{ flex: 1 }}></div>

      {!isLoading && (
        <>
          {isAuthenticated && user ? (
            <>
              {/* 通知中心 */}
              <NotificationCenter />

              <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '8px'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    overflow: 'hidden'
                  }}
                >
                  {user.avatar_url ? (
                    <img
                      src={`http://localhost:8000${user.avatar_url}`}
                      alt={`${user.username}'s avatar`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span>{user.nickname ? user.nickname[0].toUpperCase() : user.username[0].toUpperCase()}</span>
                  )}
                </div>
                <span>{user.nickname || user.username}</span>
                <span>▼</span>
              </div>

              {showUserMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                    minWidth: '150px',
                    zIndex: 100
                  }}
                >
                  <div
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate(`/users/${user.id}`);
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    个人中心
                  </div>
                  <div
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/users/me');
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    编辑资料
                  </div>
                  <div
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/favorites');
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    我的收藏
                  </div>
                  <div
                    onClick={handleLogout}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    退出登录
                  </div>
                </div>
              )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                登录
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                注册
              </Link>
            </div>
          )}
        </>
      )}
    </nav>
  );
}

export default Navbar;
