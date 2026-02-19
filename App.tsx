import React, { useState, useEffect } from 'react';
import { ViewState, Subject, Infraction, StoreItem, Language, UserLevel } from './types';
import Sidebar from './components/Sidebar';

// Lazy Load Heavy Components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Curriculum = React.lazy(() => import('./components/Curriculum'));
const AIConsultant = React.lazy(() => import('./components/AIConsultant'));
const Metrics = React.lazy(() => import('./components/Metrics'));
const Progress = React.lazy(() => import('./components/Progress'));
const Flashcards = React.lazy(() => import('./components/Flashcards'));
const SocialHub = React.lazy(() => import('./components/SocialHub'));
const RewardsStore = React.lazy(() => import('./components/RewardsStore'));
const Settings = React.lazy(() => import('./components/Settings'));
const TestingCenter = React.lazy(() => import('./components/TestingCenter'));
const ParentAgreement = React.lazy(() => import('./components/ParentAgreement'));
const OnboardingTour = React.lazy(() => import('./components/OnboardingTour'));
const DiagnosticTest = React.lazy(() => import('./components/DiagnosticTest'));
const Repository = React.lazy(() => import('./components/Repository'));
const DualWhiteboard = React.lazy(() => import('./components/DualWhiteboard'));
const SupportWidget = React.lazy(() => import('./components/SupportWidget'));
import {
    loginWithSupabase,
    logoutSupabase,
    getUserEconomy,
    fetchStoreItems,
    logStudentInfraction,
    saveStoreItemToDb,
    deleteStoreItemFromDb,
    fetchStudentAcademicResults,
    fetchStudentAllowedViews,
    adminAwardCoins,
    isOffline,
    subscribeToEconomy,
    getAllStudents
} from './services/supabase';
import { Brain, Lock, Zap, ArrowRight, ShieldCheck, Activity, Smartphone, Mail, AtSign, Phone, Globe } from 'lucide-react';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [isTourOpen, setTourOpen] = useState(false);
    const [isTestingCenterOpen, setTestingCenterOpen] = useState(false);
    const [loginMode, setLoginMode] = useState<'STUDENT' | 'ADMIN'>('STUDENT');

    // LANGUAGE & AGE STATE
    const [language, setLanguage] = useState<Language>('es');
    const [studentAge, setStudentAge] = useState<number>(8);

    const [studentForm, setStudentForm] = useState({ email: '', guardianPhone: '', password: '' });
    const [adminForm, setAdminForm] = useState({ email: '', password: '' });

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [userRole, setUserRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
    const [userLevel, setUserLevel] = useState<UserLevel>('primary');
    const [loginLevel, setLoginLevel] = useState<UserLevel>('primary');
    const [agreementAccepted, setAgreementAccepted] = useState(false);
    const [isMockSession, setIsMockSession] = useState(false);

    const [remedialSubject, setRemedialSubject] = useState<Subject | undefined>(undefined);
    const [dailyInfractions, setDailyInfractions] = useState<Infraction[]>([]);
    const [coins, setCoins] = useState(0);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [studentMenuConfig, setStudentMenuConfig] = useState<string[]>([]);
    const [uploadedHomework, setUploadedHomework] = useState<File[]>([]);
    const [isSimulationMode, setIsSimulationMode] = useState(false);

    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [studentsList, setStudentsList] = useState<{ uid: string, name: string, email: string }[]>([]);

    useEffect(() => {
        if (isAuthenticated) {
            loadUserData(userId);
            loadMenuConfig(userId);

            if (userRole === 'ADMIN') {
                loadStudentsList();
            }

            if (userRole === 'STUDENT') {
                const unsubEconomy = subscribeToEconomy(userId, (newCoins) => {
                    setCoins(newCoins);
                });
                return () => { unsubEconomy(); };
            }
        }
    }, [isAuthenticated, userId, userRole]);

    const loadStudentsList = async () => {
        const students = await getAllStudents();
        setStudentsList(students);
        if (students.length > 0) {
            setSelectedStudentId(students[0].uid);
        }
    };

    const loadMenuConfig = async (uid: string) => {
        const allowedViews = await fetchStudentAllowedViews(uid);
        if (allowedViews && allowedViews.length > 0) {
            setStudentMenuConfig(allowedViews);
        } else {
            setStudentMenuConfig([ViewState.DASHBOARD, ViewState.SCHEDULE, ViewState.CURRICULUM, ViewState.REPOSITORY, ViewState.AI_CONSULTANT, ViewState.PROGRESS, ViewState.REWARDS]);
        }
    };

    const loadUserData = async (uid: string) => {
        const economy = await getUserEconomy(uid);
        setCoins(economy.coins);
        const items = await fetchStoreItems();
        setStoreItems(items.length > 0 ? items : [
            { id: 't1', name: 'Tema Oscuro', cost: 150, category: 'theme', owned: false },
            { id: 'a1', name: 'Avatar Robot', cost: 300, category: 'avatar', owned: false },
            { id: 'c1', name: 'Cupón Cine 2x1', cost: 500, category: 'coupon', owned: false },
            { id: 'r1', name: 'Pizza Party', cost: 1000, category: 'real', owned: false },
        ]);
    };

    const loadRemedialPlan = async (uid: string) => {
        const results = await fetchStudentAcademicResults(uid);
        const mathResult = results.find((r: any) => r.subject === 'Math' || (r.remedial_plan && r.remedial_plan.length > 0));
        if (mathResult && mathResult.remedial_plan) {
            const subject: Subject = {
                id: 'remedial-math', name: 'NIVELACION: Matematicas', icon: <Zap className="w-6 h-6" />,
                description: 'Curso intensivo personalizado.', colorTheme: 'rose',
                tracks: [{
                    id: 'rem-1', name: 'Plan de Choque', overview: 'Recuperacion de bases.',
                    modules: [{
                        id: 1, name: 'Modulos de Recuperacion', level: 'Prioridad Alta', focus: 'Cerrar brechas.',
                        classes: mathResult.remedial_plan.map((c: any, idx: number) => ({
                            id: 700 + idx, title: c.title, duration: c.duration || '25 min', topic: c.topic,
                            isRemedial: true, blueprint: { hook: '', development: '', practice: '', closure: '', differentiation: '' }
                        }))
                    }]
                }]
            };
            setRemedialSubject(subject);
            return true;
        }
        return false;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        let emailToAuth = loginMode === 'STUDENT' ? studentForm.email : adminForm.email;
        let passwordToAuth = loginMode === 'STUDENT' ? studentForm.password : adminForm.password;

        if (loginMode === 'STUDENT' && !studentForm.guardianPhone.trim()) {
            alert("Por favor ingresa el WhatsApp del acudiente.");
            return;
        }

        try {
            const user = await loginWithSupabase(emailToAuth, passwordToAuth, loginMode);
            setUserId(user.uid);
            setUserName(user.name);
            setUserRole(user.role as any);
            setUserLevel(loginLevel);
            setIsMockSession(false);
            setIsAuthenticated(true);

            if (loginMode === 'STUDENT' && studentForm.guardianPhone) {
                const { saveGuardianPhone } = await import('./services/supabase');
                await saveGuardianPhone(user.uid, studentForm.guardianPhone);
            }

            const hasRemedial = await loadRemedialPlan(user.uid);
            setAgreementAccepted(user.role === 'ADMIN' || hasRemedial);

            if (user.role === 'ADMIN') setCurrentView(ViewState.PROGRESS);
            else if (hasRemedial) setCurrentView(ViewState.CURRICULUM);
            else setCurrentView(ViewState.DASHBOARD);
        } catch (error) {
            alert("Login fallido. Verifica tus credenciales.");
        }
    };

    const handleLogout = async () => {
        await logoutSupabase();
        setIsAuthenticated(false);
        setUserId('');
        setUserName('');
        setStudentForm({ email: '', guardianPhone: '', password: '' });
        setAdminForm({ email: '', password: '' });
        setAgreementAccepted(false);
        setIsSimulationMode(false);
        setIsMockSession(false);
        setRemedialSubject(undefined);
        setUploadedHomework([]);
        setCurrentView(ViewState.DASHBOARD);
        setSelectedStudentId('');
        setStudentsList([]);
    };

    const handleSimulatePersona = async (name: string, role: 'STUDENT' | 'ADMIN', level: UserLevel) => {
        setIsSimulationMode(true);
        setUserName(name);
        setUserRole(role);
        setUserLevel(level);
        setIsAuthenticated(true);
        setAgreementAccepted(true);
        setTestingCenterOpen(false);
        setIsMockSession(true);
        if (role === 'ADMIN') setCurrentView(ViewState.PROGRESS);
        else setCurrentView(ViewState.DASHBOARD);
    };

    const handleLogInfraction = (type: Infraction['type'], description: string) => {
        const newInfraction: Infraction = { id: Date.now().toString(), type, description, timestamp: new Date().toISOString(), severity: 'MEDIUM' };
        setDailyInfractions(prev => [newInfraction, ...prev]);
        if (userId) logStudentInfraction(userId, newInfraction);
    };

    const handleTriggerAction = (action: 'ROOM_CHECK' | 'ADD_COINS' | 'INFRACTION' | 'TOUR') => {
        switch (action) {
            case 'ROOM_CHECK': alert("Room Check forzado iniciado..."); break;
            case 'ADD_COINS': setCoins(prev => prev + 1000); break;
            case 'INFRACTION': handleLogInfraction('ACADEMIC_DISHONESTY', 'Simulated infraction via DevTools'); break;
            case 'TOUR': setTourOpen(true); break;
        }
    };

    const handleAdminAddCoins = async (amount: number) => {
        if (!selectedStudentId) {
            alert("Por favor selecciona un estudiante primero.");
            return;
        }
        const success = await adminAwardCoins(selectedStudentId, amount);
        if (success) {
            const student = studentsList.find(s => s.uid === selectedStudentId);
            alert('Enviados ' + amount + ' Nova Coins a ' + (student?.name || 'estudiante') + '.');
        } else {
            alert("Error enviando coins. Revisa la consola.");
        }
    };

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudentId(studentId);
    };

    if (!isAuthenticated) {
        const t = {
            es: { student: 'Estudiante', admin: 'Profe/Admin', mail: 'Usuario', guardian: 'Celular Mamá/Papá', pass: 'Contraseña', login: '¡Vamos a Jugar!', access: 'Entrar al Panel' },
            en: { student: 'Student', admin: 'Teacher/Admin', mail: 'User', guardian: 'Parent Phone', pass: 'Password', login: 'Let\'s Play!', access: 'Enter Dashboard' }
        };
        const text = t[language as keyof typeof t];

        return (
            <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-6 font-sans relative overflow-hidden">
                <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-kid-blue/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-kid-pink/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-kid-yellow/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

                <div className="w-full max-w-[420px] mx-auto flex flex-col items-center relative z-10">
                    <div className="mb-8 text-center animate-bounce-slow">
                        <div className="w-24 h-24 bg-white border-4 border-black rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-comic transform rotate-3">
                            <Brain className="w-12 h-12 text-kid-blue" />
                        </div>
                        <h1 className="text-4xl font-display font-black text-kid-navy tracking-tight md:text-5xl">NOVA <span className="text-kid-pink">KIDS</span></h1>
                        <p className="text-kid-purple font-bold text-lg mt-2 bg-white/50 px-4 py-1 rounded-full inline-block border-2 border-kid-purple/20">Learning is Fun! 🚀</p>
                    </div>

                    <div className="mb-8">
                        <div className="bg-white border-2 border-black rounded-full p-1 flex shadow-comic">
                            <button onClick={() => setLanguage('es')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border-2 ${language === 'es' ? 'bg-kid-yellow text-black border-black' : 'border-transparent text-slate-500 hover:text-black'}`}>Español</button>
                            <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border-2 ${language === 'en' ? 'bg-kid-yellow text-black border-black' : 'border-transparent text-slate-500 hover:text-black'}`}>English</button>
                        </div>
                    </div>

                    <div className="w-full bg-white border-4 border-black rounded-[2.5rem] p-8 shadow-comic-lg relative overflow-hidden">
                        <div className="flex bg-slate-100 rounded-2xl p-2 mb-6 border-2 border-slate-200">
                            <button onClick={() => setLoginMode('STUDENT')} className={`flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${loginMode === 'STUDENT' ? 'bg-kid-blue text-white shadow-comic border-2 border-black' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Smartphone className="w-5 h-5" /> {text.student}
                            </button>
                            <button onClick={() => setLoginMode('ADMIN')} className={`flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${loginMode === 'ADMIN' ? 'bg-kid-purple text-white shadow-comic border-2 border-black' : 'text-slate-400 hover:text-slate-600'}`}>
                                <ShieldCheck className="w-5 h-5" /> {text.admin}
                            </button>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {loginMode === 'STUDENT' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-kid-navy tracking-wider ml-1 uppercase">{text.mail}</label>
                                        <div className="relative group">
                                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-kid-blue" />
                                            <input
                                                type="email"
                                                value={studentForm.email}
                                                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                                className="w-full bg-slate-50 border-4 border-slate-200 focus:border-kid-blue text-black rounded-2xl py-4 pl-12 pr-4 text-base placeholder:text-slate-400 outline-none transition-all font-bold"
                                                placeholder="tu@cole.edu"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-kid-navy tracking-wider ml-1 uppercase">{text.guardian}</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-kid-green" />
                                            <input
                                                type="tel"
                                                value={studentForm.guardianPhone}
                                                onChange={(e) => setStudentForm({ ...studentForm, guardianPhone: e.target.value })}
                                                className="w-full bg-slate-50 border-4 border-slate-200 focus:border-kid-green text-black rounded-2xl py-4 pl-12 pr-4 text-base placeholder:text-slate-400 outline-none transition-all font-bold"
                                                placeholder="300 123 4567"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-kid-navy tracking-wider ml-1 uppercase">{text.pass}</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-kid-pink" />
                                            <input
                                                type="password"
                                                value={studentForm.password}
                                                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                                                className="w-full bg-slate-50 border-4 border-slate-200 focus:border-kid-pink text-black rounded-2xl py-4 pl-12 pr-4 text-base placeholder:text-slate-400 outline-none transition-all font-bold"
                                                placeholder="********"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 tracking-wider ml-1 uppercase">EMAIL ADMIN</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-kid-purple" />
                                            <input
                                                type="email"
                                                value={adminForm.email}
                                                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                                className="w-full bg-slate-50 border-4 border-slate-200 focus:border-kid-purple text-black rounded-2xl py-4 pl-12 pr-4 text-base placeholder:text-slate-400 outline-none transition-all font-bold"
                                                placeholder="admin@nova.edu"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 tracking-wider ml-1 uppercase">{text.pass}</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-kid-purple" />
                                            <input
                                                type="password"
                                                value={adminForm.password}
                                                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                                className="w-full bg-slate-50 border-4 border-slate-200 focus:border-kid-purple text-black rounded-2xl py-4 pl-12 pr-4 text-base placeholder:text-slate-400 outline-none transition-all font-bold"
                                                placeholder="********"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <button type="submit" className={`w-full text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 transition-all shadow-comic hover:translate-y-[-2px] hover:shadow-comic-lg active:translate-y-0 ${loginMode === 'STUDENT' ? 'bg-kid-orange hover:bg-orange-400 text-black border-4 border-black' : 'bg-kid-purple hover:bg-purple-600 text-white border-4 border-black'}`}>
                                <span className="tracking-widest uppercase">{loginMode === 'STUDENT' ? text.login : text.access}</span>
                                <ArrowRight className="w-6 h-6 border-2 border-white rounded-full p-0.5" />
                            </button>

                            {isOffline && (
                                <button type="button" className="w-full bg-rose-100 border-2 border-rose-500 text-rose-600 text-[10px] font-bold py-2 rounded-xl flex items-center justify-center gap-2 animate-pulse cursor-default">
                                    <Zap className="w-3 h-3 fill-rose-500" />
                                    <span>OFFLINE MODE</span>
                                </button>
                            )}
                        </form>
                    </div>

                    <div className="mt-8 opacity-50 hover:opacity-100 transition-opacity">
                        <button onClick={() => setTestingCenterOpen(true)} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-slate-200">
                            <Activity className="w-3 h-3" /> Dev Tools
                        </button>
                    </div>

                    <React.Suspense fallback={null}>
                        <TestingCenter isOpen={isTestingCenterOpen} onClose={() => setTestingCenterOpen(false)} onSimulatePersona={handleSimulatePersona} onTriggerAction={handleTriggerAction} />
                    </React.Suspense>
                </div>
            </div>
        );
    }

    if (!agreementAccepted && userRole === 'STUDENT') {
        return (
            <React.Suspense fallback={<div className="h-screen flex items-center justify-center text-white">Loading Agreement...</div>}>
                <ParentAgreement studentName={userName} onAccept={() => setAgreementAccepted(true)} onLogout={handleLogout} />
            </React.Suspense>
        );
    }

    return (
        <div className="flex bg-[#FFFDF5] min-h-screen font-sans text-slate-900 overflow-hidden">
            <Sidebar
                currentView={currentView}
                onViewChange={setCurrentView}
                onStartTour={() => setTourOpen(true)}
                onLogout={handleLogout}
                userName={userName}
                userRole={userRole}
                isSimulationMode={isSimulationMode}
                onExitSimulation={() => { setIsSimulationMode(false); handleLogout(); }}
                restrictedMode={!!remedialSubject}
                studentMenuConfig={studentMenuConfig}
                isMock={isMockSession}
                language={language}
                setLanguage={setLanguage}
                userLevel={userLevel}
            />
            <main className="flex-1 overflow-y-auto h-screen relative md:ml-64 bg-[#FFFDF5]">
                {isAuthenticated && (
                    <React.Suspense fallback={null}>
                        <SupportWidget userId={userId} userName={userName} userRole={userRole} />
                    </React.Suspense>
                )}
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
                    <React.Suspense fallback={
                        <div className="flex h-96 items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-kid-blue"></div>
                        </div>
                    }>
                        {currentView === ViewState.DASHBOARD && <Dashboard onNavigate={setCurrentView} onStartTour={() => setTourOpen(true)} language={language} />}
                        {currentView === ViewState.REPOSITORY && <Repository studentName={userName} userRole={userRole} onUploadHomework={(file) => setUploadedHomework(prev => [...prev, file])} />}
                        {currentView === ViewState.CURRICULUM && <Curriculum userName={userName} userRole={userRole} remedialSubject={remedialSubject} onLogInfraction={handleLogInfraction} onLogout={handleLogout} guardianPhone={studentForm.guardianPhone} uploadedHomework={uploadedHomework} userId={userId} language={language} />}
                        {currentView === ViewState.AI_CONSULTANT && <AIConsultant />}
                        {currentView === ViewState.METRICS && <Metrics />}
                        {currentView === ViewState.PROGRESS && (
                            <Progress
                                userRole={userRole}
                                userId={userId}
                                userName={userName}
                                dailyInfractions={dailyInfractions}
                                onAwardCoins={(amt) => setCoins(c => c + amt)}
                                onAddItemToStore={(item) => { setStoreItems(prev => [...prev, item]); saveStoreItemToDb(item); }}
                                onMenuConfigUpdate={() => loadMenuConfig(userId)}
                                studentsList={studentsList}
                                selectedStudentId={selectedStudentId}
                                onSelectStudent={handleSelectStudent}
                            />
                        )}
                        {currentView === ViewState.DIAGNOSTIC && (
                            <DiagnosticTest studentName={userName} onFinish={async (view, data) => {
                                if (data?.remedialSubject) {
                                    setRemedialSubject(data.remedialSubject);
                                    if (userId && data.rawResult?.remedialClasses) {
                                        const { assignRemedialPlan } = await import('./services/supabase');
                                        const planForDB = data.rawResult.remedialClasses.map((c: any, idx: number) => ({
                                            title: c.title || `Sesión ${idx + 1}`,
                                            topic: c.topic || 'Refuerzo General',
                                            duration: '25 min',
                                            status: 'pending'
                                        }));
                                        await assignRemedialPlan(userId, 'Math', planForDB);
                                    }
                                }
                                setCurrentView(view);
                            }} />
                        )}
                        {currentView === ViewState.WHITEBOARD && <DualWhiteboard language={language} studentAge={studentAge} />}
                        {currentView === ViewState.FLASHCARDS && <Flashcards />}
                        {currentView === ViewState.SOCIAL && <SocialHub />}
                        {currentView === ViewState.REWARDS && (
                            <RewardsStore
                                userLevel='KIDS'
                                currentCoins={coins}
                                items={storeItems}
                                onPurchase={(item) => {
                                    if (coins >= item.cost) {
                                        setCoins(c => c - item.cost);
                                        setStoreItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true } : i));
                                        alert('Compraste ' + item.name + '!');
                                    }
                                }}
                                isEditable={userRole === 'ADMIN'}
                                onDelete={(id) => { setStoreItems(prev => prev.filter(i => i.id !== id)); deleteStoreItemFromDb(id); }}
                                onUpdate={(item) => { setStoreItems(prev => prev.map(i => i.id === item.id ? item : i)); saveStoreItemToDb(item); }}
                                onAddCoins={handleAdminAddCoins}
                                selectedStudentId={selectedStudentId}
                                selectedStudentName={studentsList.find(s => s.uid === selectedStudentId)?.name || ''}
                                studentsList={studentsList}
                                onSelectStudent={handleSelectStudent}
                            />
                        )}
                        {currentView === ViewState.SETTINGS && (
                            <Settings
                                userId={userId}
                                userName={userName}
                                userRole={userRole}
                                onUpdateUser={setUserName}
                                onLogout={handleLogout}
                                language={language}
                                onLanguageChange={setLanguage}
                                studentAge={studentAge}
                                onAgeChange={setStudentAge}
                                isPrimary={true}
                            />
                        )}
                    </React.Suspense>
                </div>
                {userRole === 'ADMIN' && (
                    <button className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-lg opacity-30 hover:opacity-100" onClick={() => setTestingCenterOpen(true)}>🛠️</button>
                )}
                <React.Suspense fallback={null}>
                    <TestingCenter isOpen={isTestingCenterOpen} onClose={() => setTestingCenterOpen(false)} onSimulatePersona={handleSimulatePersona} onTriggerAction={handleTriggerAction} />
                    <OnboardingTour isOpen={isTourOpen} onClose={() => setTourOpen(false)} currentView={currentView} onNavigate={setCurrentView} />
                </React.Suspense>
            </main>
        </div>
    );
};

export default App;
