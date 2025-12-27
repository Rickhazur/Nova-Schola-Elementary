import React, { useState, useEffect } from 'react';
import { supabase, loginWithSupabase, logoutSupabase } from './services/supabase';
import Sidebar from './components/Sidebar';
import { ViewState, UserLevel, Language } from './types';
import {
  Brain,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

const App: React.FC = () => {
  // Estados de autenticación y usuario
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [userLevel, setUserLevel] = useState<UserLevel>('primary');
  const [language, setLanguage] = useState<Language>('es');

  // Formulario login
  const [loginMode, setLoginMode] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [studentForm, setStudentForm] = useState({ email: '', guardianPhone: '', password: '' });
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });

  // Vista actual
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  // Verificar sesión activa al cargar
  useEffect(() => {
    const session = supabase?.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const user = data.session.user;
        setIsAuthenticated(true);
        setUserId(user.id);
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || '');
        setUserRole(user.user_metadata?.role || 'STUDENT');
      }
    });
  }, []);

  // Manejar login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let email = '';
      let password = '';
      if (loginMode === 'STUDENT') {
        email = studentForm.email;
        password = studentForm.password;
        if (!studentForm.guardianPhone.trim()) {
          alert('Por favor ingresa el WhatsApp del acudiente.');
          return;
        }
      } else {
        email = adminForm.email;
        password = adminForm.password;
      }

      const userData = await loginWithSupabase(email, password, loginMode);
      if (userData) {
        setIsAuthenticated(true);
        setUserId(userData.uid);
        setUserName(userData.name);
        setUserRole(userData.role === 'ADMIN' ? 'ADMIN' : 'STUDENT');
        setUserLevel(userData.level as UserLevel || 'primary');
        setCurrentView(ViewState.DASHBOARD);
      }
    } catch (error) {
      alert('Login fallido. Verifica tus credenciales.');
      console.error(error);
    }
  };

  // Manejar logout
  const handleLogout = async () => {
    await logoutSupabase();
    setIsAuthenticated(false);
    setUserId('');
    setUserName('');
    setUserRole('STUDENT');
    setUserLevel('primary');
    setStudentForm({ email: '', guardianPhone: '', password: '' });
    setAdminForm({ email: '', password: '' });
    setCurrentView(ViewState.DASHBOARD);
  };

  // Traducciones básicas
  const t = {
    es: {
      student: 'Estudiante',
      admin: 'Administrador',
      mail: 'Correo electrónico',
      guardian: 'WhatsApp acudiente',
      pass: 'Contraseña',
      login: 'Iniciar Sesión',
      access: 'Entrar al Panel',
    },
    en: {
      student: 'Student',
      admin: 'Admin',
      mail: 'Email',
      guardian: 'Parent WhatsApp',
      pass: 'Password',
      login: 'Login',
      access: 'Enter Dashboard',
    },
  };
  const text = t[language];

  // Mostrar formulario login si no autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="w-full max-w-[420px] mx-auto flex flex-col items-center relative z-10">
          <div className="mb-8 text-center">
            <div className="w-24 h-24 bg-white border-4 border-black rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Brain className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-blue-900 tracking-tight">Nova Schola</h1>
            <p className="text-blue-700 font-semibold mt-2">Academia IA para primaria</p>
          </div>

          <div className="flex bg-gray-100 rounded-2xl p-2 mb-6 border border-gray-300 w-full">
            <button
              onClick={() => setLoginMode('STUDENT')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                loginMode === 'STUDENT' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Smartphone className="w-5 h-5" /> {text.student}
            </button>
            <button
              onClick={() => setLoginMode('ADMIN')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                loginMode === 'ADMIN' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShieldCheck className="w-5 h-5" /> {text.admin}
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 w-full">
            {loginMode === 'STUDENT' ? (
              <>
                <label className="block">
                  <span className="text-gray-700 font-semibold">{text.mail}</span>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md p-3 mt-1"
                    placeholder="correo@ejemplo.com"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700 font-semibold">{text.guardian}</span>
                  <input
                    type="tel"
                    value={studentForm.guardianPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, guardianPhone: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md p-3 mt-1"
                    placeholder="300 123 4567"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700 font-semibold">{text.pass}</span>
                  <input
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md p-3 mt-1"
                    placeholder="********"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="text-gray-700 font-semibold">{text.mail}</span>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md p-3 mt-1"
                    placeholder="admin@nova.edu"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700 font-semibold">{text.pass}</span>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md p-3 mt-1"
                    placeholder="********"
                  />
                </label>
              </>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-md font-bold text-white mt-4 ${
                loginMode === 'STUDENT' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loginMode === 'STUDENT' ? text.login : text.access}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Mostrar app principal si autenticado
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        userName={userName}
        userRole={userRole}
      />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Bienvenido, {userName}</h1>
        {/* Aquí renderiza las vistas según currentView */}
        {currentView === ViewState.DASHBOARD && <div>Dashboard content aquí</div>}
      </main>
    </div>
  );
};

export default App;
