import { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export function RegisterPage() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Verify inputs are inserted
        if (!formData.nom || !formData.prenom || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        // 2. Verify email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Veuillez entrer une adresse email valide");
            return;
        }

        // 3. Verify password length
        if (formData.password.length < 5) {
            toast.error("Le mot de passe doit contenir au moins 5 caractères");
            return;
        }

        // 4. Verify passwords match
        if (formData.password !== formData.confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            // 3. Send to backend
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: formData.nom,
                    prenom: formData.prenom,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (response.ok) {
                // Show success toast and navigate
                toast.success("Compte créé avec succès !");
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                // Try to get error message from server
                const errorData = await response.text();
                toast.error(`Erreur lors de l'inscription: ${errorData || response.statusText}`);
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
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Créer un nouveau compte</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nom</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-colors ${isDarkMode
                                            ? 'bg-[#0f172a] border-[#334155] text-white placeholder-gray-500'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                                            }`}
                                        placeholder="Votre nom"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Prénom</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-colors ${isDarkMode
                                            ? 'bg-[#0f172a] border-[#334155] text-white placeholder-gray-500'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                                            }`}
                                        placeholder="Votre prénom"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-colors ${isDarkMode
                                        ? 'bg-[#0f172a] border-[#334155] text-white placeholder-gray-500'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                                        }`}
                                    placeholder="votre@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-colors ${isDarkMode
                                        ? 'bg-[#0f172a] border-[#334155] text-white placeholder-gray-500'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                                        }`}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirmer mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] transition-colors ${isDarkMode
                                        ? 'bg-[#0f172a] border-[#334155] text-white placeholder-gray-500'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                                        }`}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary mt-6"
                        >
                            S'inscrire
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Déjà un compte ?{' '}
                            <Link
                                to="/login"
                                className="text-[#14b8a6] hover:underline font-medium"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
