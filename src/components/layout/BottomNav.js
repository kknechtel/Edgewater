import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'calendar', label: 'Events', path: '/calendar', icon: '📅' },
    { id: 'music', label: 'Music', path: '/music', icon: '🎵' },
    { id: 'dinner', label: 'Dinner', path: '/dinner', icon: '🍽️' },
    { id: 'photos', label: 'Photos', path: '/photos', icon: '📸' },
    { id: 'messages', label: 'Chat', path: '/messages', icon: '💬' },
    { id: 'sasqwatch', label: 'SasqWatch', path: '/sasqwatch', icon: '👹' },
    { id: 'bags', label: 'Bags', path: '/bags', icon: '🎯' },
    { id: 'profile', label: 'Profile', path: '/profile', icon: '👤' }
  ];

  const handleNavClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`flex flex-col items-center py-2 px-1 flex-1 ${
              location.pathname === item.path
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav; 