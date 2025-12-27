import { LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface TopbarProps {
  onLogout: () => void;
}

interface UserInfo {
  username: string;
  email: string;
  role: string;
}

export function Topbar({ onLogout }: TopbarProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    username: 'Utilisateur',
    email: '',
    role: 'Admin'
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserInfo({
            username: user.username || user.name || 'Utilisateur',
            email: user.email || '',
            role: user.role || 'Admin'
          });
          return;
        }

        const response = await fetch('/auth/user/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            username: data.username || data.name || 'Utilisateur',
            email: data.email || '',
            role: data.role || 'Admin'
          });
          localStorage.setItem('user', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className={`h-16 transition-colors duration-300 border-b flex items-center justify-end px-4 md:px-6 z-10 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode
            ? 'bg-[#334155] text-yellow-400 hover:bg-[#475569]'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="flex items-center gap-3">
          {/* User Info */}
          <div className="hidden sm:flex flex-col items-end">
            <div className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userInfo.username}</div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-purple-600 rounded-full flex items-center justify-center hover:ring-2 hover:ring-offset-2 hover:ring-teal-500 transition-all cursor-pointer">
                <span className="text-white font-bold text-sm">
                  {getInitials(userInfo.username)}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 z-[100]">
              <div className="px-2 py-3 border-b border-gray-100 mb-2">
                <div className="font-medium text-sm text-gray-900">{userInfo.username}</div>
                {userInfo.email && (
                  <div className="text-xs text-gray-500 mt-1">{userInfo.email}</div>
                )}
              </div>
              <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
