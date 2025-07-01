import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/designSystem.css';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', path: '/', icon: '🏠' },
    { id: 'calendar', label: 'Events', path: '/calendar', icon: '📅' },
    { id: 'messages', label: 'Chat', path: '/messages', icon: '💬' },
    { id: 'sasqwatch', label: 'SasqWatch', path: '/sasqwatch', icon: '👣' },
    { id: 'more', label: 'More', path: '/more', icon: '⚙️' }
  ];

  const handleNavClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <nav className="nav-bar">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.id === 'home' && location.pathname === '/') ||
                          (item.id === activeTab);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                position: 'relative',
                transition: 'all var(--transition-fast)'
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40px',
                  height: '3px',
                  backgroundColor: 'var(--primary-blue)',
                  borderRadius: '0 0 3px 3px'
                }} />
              )}
              
              <span className="nav-icon" style={{
                fontSize: isActive ? 'var(--text-2xl)' : 'var(--text-xl)',
                transition: 'font-size var(--transition-fast)',
                display: 'block',
                marginBottom: 'var(--space-1)'
              }}>
                {item.icon}
              </span>
              <span className="nav-label" style={{
                fontSize: 'var(--text-xs)',
                fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)'
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;