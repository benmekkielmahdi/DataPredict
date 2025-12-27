import { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    try {
      // 2. API Call
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Backend returns raw string token, not JSON
        const token = await response.text();
        if (token) {
          localStorage.setItem('token', token);

          try {
            const profileRes = await fetch(`/auth/profile?token=${token}`);
            if (profileRes.ok) {
              const profile = await profileRes.json();
              if (profile.id) {
                localStorage.setItem('userId', profile.id.toString());
              }

              const userInfo = {
                username: profile.prenom ? `${profile.prenom} ${profile.nom}` : email.split('@')[0],
                email: profile.email || email,
                role: 'User'
              };
              localStorage.setItem('user', JSON.stringify(userInfo));
            } else {
              // Fallback if profile fetch fails
              const username = email.split('@')[0] || 'Utilisateur';
              localStorage.setItem('user', JSON.stringify({
                username: username.charAt(0).toUpperCase() + username.slice(1),
                email: email,
                role: 'User'
              }));
            }
          } catch (error) {
            console.error("Failed to fetch user profile", error);
          }
        }

        // 3. Success
        toast.success("Bienvenue !");

        // Short delay to let user see the toast before redirecting
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        // 4. Error
        toast.error("Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.error(error);
      toast.error("Impossible de contacter le serveur");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      <div className="w-full max-w-md">
        <div className={`rounded-2xl shadow-2xl p-8 border transition-all duration-300 ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-gray-200'}`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#2dd4bf] to-[#a855f7] bg-clip-text text-transparent mb-2">
              DataPredict
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plateforme d'apprentissage automatique</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-colors ${isDarkMode
                    ? 'bg-[#0f172a] border-[#334155] text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-colors ${isDarkMode
                    ? 'bg-[#0f172a] border-[#334155] text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Pas encore de compte ?{' '}
              <Link
                to="/register"
                className="text-[#14b8a6] hover:underline font-medium"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
