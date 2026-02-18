import React, { useState } from 'react';
import { loginWithSupabase, logoutSupabase } from './services/supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Curriculum from './components/Curriculum';
import AIConsultant from './components/AIConsultant';
import SocialHub from './components/SocialHub';
import RewardsStore from './components/RewardsStore';
import Whiteboard from './components/Whiteboard';
import Repository from './components/Repository';
import Progress from './components/Progress';
import Settings from './components/Settings';
import Metrics from './components/Metrics';
import Schedule from './components/Schedule';
import Flashcards from './components/Flashcards';
import DiagnosticTest from './components/DiagnosticTest';
import { Language, ViewState, StoreItem } from './types';
import { Brain, ShieldCheck, Smartphone } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import { safeAsync } from './utils/errorHandler';

const DEFAULT_STORE_ITEMS: StoreItem[] = [
  { id: 's1', name: 'Estrella Dorada', cost: 50, category: 'avatar', image: '⭐', owned: false },
  { id: 's2', name: 'Cohete', cost: 100, category: 'avatar', image: '🚀', owned: false },
  { id: 's3', name: 'Corona', cost: 200, category: 'avatar', image: '👑', owned: false },
];

const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { user, currentView, language, isSessionLoading } = state;

  // Login form state
  const [loginMode, setLoginMode] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [studentForm, setStudentForm] = useState({ email: '', guardianPhone: '', password: '' });
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App state
  const [coins, setCoins] = useState(0);
  const [storeItems, setStoreItems] = useState<StoreItem[]>(DEFAULT_STORE_ITEMS);
  const [uploadedHomework, setUploadedHomework] = useState<any[]>([]);

  const setLanguage = (lang: Language) => dispatch({ type: 'SET_LANGUAGE', payload: lang });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = loginMode === 'STUDENT' ? studentForm.email : adminForm.email;
    const password = loginMode === 'STUDENT' ? studentForm.password : adminForm.password;

    if (loginMode === 'STUDENT' && !studentForm.guardianPhone.trim()) {
      setLoginError('Por favor ingresa el WhatsApp del acudiente.');
      return;
    }

    setIsLoggingIn(true);
    const { data: userData, error } = await safeAsync(() =>
      loginWithSupabase(email, password, loginMode)
    );
    setIsLoggingIn(false);

    if (error || !userData) {
      setLoginError('Login fallido. Verifica tus credenciales.');
      return;
    }

    dispatch({
      type: 'SET_USER',
      payload: {
        uid: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
        level: userData.level ?? 'primary',
      },
    });
    dispatch({ type: 'SET_VIEW', payload: ViewState.DASHBOARD });
  };

  const handleLogout = async () => {
    await logoutSupabase();
    dispatch({ type: 'CLEAR_USER' });
  };

  const handleViewChange = (view: ViewState) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  };

  const handlePurchase = (item: StoreItem) => {
    if (coins >= item.cost) {
      setCoins(c => c - item.cost);
      setStoreItems(items => items.map(i => i.id === item.id ? { ...i, owned: true } : i));
    }
  };

  const handleUploadHomework = (_file: File) => {
    setUploadedHomework(prev => [...prev, { name: _file.name, timestamp: Date.now() }]);
  };

  // Translations
  const t = {
    es: {
      student: 'Estudiante', admin: 'Administrador',
      mail: 'Correo electrónico', guardian: 'WhatsApp acudiente',
      pass: 'Contraseña', login: 'Iniciar Sesión', access: 'Entrar al Panel',
    },
    en: {
      student: 'Student', admin: 'Admin',
      mail: 'Email', guardian: 'Parent WhatsApp',
      pass: 'Password', login: 'Login', access: 'Enter Dashboard',
    },
    bilingual: {
      student: 'Student / Estudiante', admin: 'Admin',
      mail: 'Email / Correo', guardian: 'Parent WhatsApp',
      pass: 'Password / Contraseña', login: 'Login', access: 'Enter Dashboard',
    },
  } as const;
  const text = t[language] ?? t['es'];

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
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

            {loginError && (
              <p className="text-red-600 text-sm font-medium">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-3 rounded-md font-bold text-white mt-4 transition-opacity ${
                isLoggingIn ? 'opacity-60 cursor-not-allowed' : ''
              } ${loginMode === 'STUDENT' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isLoggingIn ? 'Cargando...' : loginMode === 'STUDENT' ? text.login : text.access}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard onNavigate={handleViewChange} language={language} />;
      case ViewState.CURRICULUM:
        return (
          <Curriculum
            userName={user.name}
            language={language}
            userRole={user.role}
            onLogout={handleLogout}
            userId={user.uid}
            uploadedHomework={uploadedHomework}
          />
        );
      case ViewState.AI_CONSULTANT:
        return <AIConsultant />;
      case ViewState.SOCIAL:
        return <SocialHub />;
      case ViewState.REWARDS:
        return (
          <RewardsStore
            userLevel="KIDS"
            currentCoins={coins}
            items={storeItems}
            onPurchase={handlePurchase}
          />
        );
      case ViewState.WHITEBOARD:
        return <Whiteboard />;
      case ViewState.REPOSITORY:
        return (
          <Repository
            studentName={user.name}
            onUploadHomework={handleUploadHomework}
            userRole={user.role}
          />
        );
      case ViewState.PROGRESS:
        return (
          <Progress
            userRole={user.role}
            userId={user.uid}
            userName={user.name}
          />
        );
      case ViewState.SETTINGS:
        return (
          <Settings
            userId={user.uid}
            userName={user.name}
            userRole={user.role}
            onUpdateUser={(name) => dispatch({ type: 'SET_USER', payload: { ...user, name } })}
            onLogout={handleLogout}
            language={language}
            onLanguageChange={setLanguage}
          />
        );
      case ViewState.METRICS:
        return <Metrics />;
      case ViewState.SCHEDULE:
        return <Schedule />;
      case ViewState.FLASHCARDS:
        return <Flashcards />;
      case ViewState.DIAGNOSTIC:
        return (
          <DiagnosticTest
            studentName={user.name}
            onFinish={(view) => dispatch({ type: 'SET_VIEW', payload: view })}
          />
        );
      default:
        return <Dashboard onNavigate={handleViewChange} language={language} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        userName={user.name}
        userRole={user.role}
        language={language === 'bilingual' ? 'es' : language}
        setLanguage={setLanguage}
        userLevel={user.level}
      />
      <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
