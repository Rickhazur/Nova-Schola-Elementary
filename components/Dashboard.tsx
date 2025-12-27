
import React from 'react';
import { ViewState, Language } from '../types';
import { Target, Zap, Heart, Sparkles, Compass, Lightbulb, Shield, Calculator, ArrowRight, Brain, Rocket, Star, Gamepad2, Smile } from 'lucide-react';

interface DashboardProps {
  onNavigate?: (view: ViewState) => void;
  onStartTour?: () => void;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onStartTour, language }) => {
  const t = {
    es: {
      heroTitle: "Nova Kids",
      heroSubtitle: "Tu Superpoder",
      heroBadge: "Mundo Divertido",
      heroDesc: "¡Bienvenido a tu base de operaciones! Aquí aprender es como jugar un video juego. Gana trofeos, explora mundos y conviértete en un genio.",
      btnStart: "¡Jugar Misión!",
      btnDemo: "Ver Demo",
      statsCurriculum: "Profes Geniales",
      statsLogic: "Ayuda Robot",
      statsMastery: "Diversión Total",
      diagnosticTitle: "Juego de Inicio",
      diagnosticRequired: "¡Juega Ya!",
      diagnosticDesc: "Antes de empezar la aventura, juguemos un mini-juego de Mate y Ciencias para ver qué tan fuertes son tus poderes mentales.",
      btnDiagnostic: "Jugar Ahora",
      methodTitle: "Aprende Jugando",
      methodDesc: "Nada de clases aburridas. Aquí cada lección es una aventura nueva con premios y retos.",
      resultsTitle: "Gana Premios",
      resultsDesc: "Completa tus misiones, gana monedas y compra cosas increíbles en la tienda para tu avatar.",
      adnTitle: "Nuestro Código",
      valAutonomy: { title: "Soy Piloto", desc: "Yo decido mi vuelo." },
      valWellness: { title: "Soy Feliz", desc: "Aprender me da alegría." },
      valMastery: { title: "Soy Capaz", desc: "Lo intento hasta lograrlo." },
      valImpact: { title: "Soy Héroe", desc: "Ayudo a los demás." }
    },
    en: {
      heroTitle: "Nova Kids",
      heroSubtitle: "Your Superpower",
      heroBadge: "Fun World",
      heroDesc: "Welcome to your home base! Here learning is like playing a video game. Win trophies, explore worlds, and become a genius.",
      btnStart: "Play Mission!",
      btnDemo: "Watch Demo",
      statsCurriculum: "Cool Owners",
      statsLogic: "Robot Helper",
      statsMastery: "Total Fun",
      diagnosticTitle: "Start Game",
      diagnosticRequired: "Play Now!",
      diagnosticDesc: "Before starting the adventure, let's play a mini-game of Math and Science to see how strong your mental powers are.",
      btnDiagnostic: "Play Now",
      methodTitle: "Learn by Playing",
      methodDesc: "No boring classes. Here every lesson is a new adventure with prizes and challenges.",
      resultsTitle: "Win Prizes",
      resultsDesc: "Complete your missions, earn coins, and buy amazing things in the store for your avatar.",
      adnTitle: "Our Code",
      valAutonomy: { title: "I'm Pilot", desc: "I decide my flight." },
      valWellness: { title: "I'm Happy", desc: "Learning gives me joy." },
      valMastery: { title: "I Can Do It", desc: "I try until I succeed." },
      valImpact: { title: "I'm Hero", desc: "I help others." }
    }
  };

  const text = t[language as keyof typeof t];

  return (
    <div className="space-y-10 animate-fade-in font-sans pb-12">
      {/* Hero Header */}
      <header className="relative rounded-[3rem] p-8 md:p-16 text-black overflow-hidden shadow-comic-lg min-h-[500px] flex flex-col justify-center group border-4 border-black bg-white">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-kid-blue/20 via-kid-yellow/20 to-kid-pink/20"></div>

        {/* Floating Shapes */}
        <div className="absolute top-10 right-10 text-kid-yellow w-24 h-24 animate-bounce-slow opacity-80 decoration-clone"><Star fill="currentColor" className="w-full h-full" /></div>
        <div className="absolute bottom-10 right-32 text-kid-blue w-16 h-16 animate-float opacity-80"><Rocket className="w-full h-full transform rotate-45" /></div>
        <div className="absolute top-1/2 right-10 text-kid-pink w-20 h-20 animate-spin-reverse opacity-60"><Zap className="w-full h-full" /></div>

        <div className="relative z-10 max-w-3xl pl-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-black mb-6 uppercase tracking-widest shadow-comic transform -rotate-2">
            <Gamepad2 className="w-4 h-4 text-kid-yellow" />
            <span>{text.heroBadge}</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter text-kid-navy drop-shadow-sm">
            {text.heroTitle}<br />
            <span className="text-4xl md:text-6xl font-black text-kid-blue text-stroke">{text.heroSubtitle}</span>
          </h2>
          <p className="text-slate-700 text-xl md:text-2xl max-w-2xl font-bold mb-10 leading-relaxed pl-2 bg-white/60 p-4 rounded-xl backdrop-blur-sm border-2 border-black/5">
            {text.heroDesc}
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate && onNavigate(ViewState.CURRICULUM)}
              className="bg-kid-orange hover:bg-orange-400 text-black px-8 py-5 rounded-2xl font-black text-xl transition-all shadow-comic hover:shadow-comic-lg hover:translate-y-[-4px] flex items-center gap-3 border-4 border-black group"
            >
              {text.btnStart} <Rocket className="w-6 h-6 group-hover:animate-ping" />
            </button>
            <button
              onClick={onStartTour}
              className="bg-white hover:bg-slate-50 text-black px-8 py-5 rounded-2xl font-black text-xl transition-all border-4 border-black shadow-comic hover:shadow-comic-lg hover:translate-y-[-4px]"
            >
              {text.btnDemo}
            </button>
          </div>
        </div>
      </header>

      {/* --- DIAGNOSTIC CTA --- */}
      <section className="bg-kid-purple rounded-[2.5rem] p-6 md:p-10 shadow-comic relative overflow-hidden text-white border-4 border-black transform rotate-1 hover:rotate-0 transition-transform duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-kid-pink opacity-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-comic transform -rotate-3">
              <Calculator className="w-12 h-12 text-kid-purple" />
            </div>
            <div>
              <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                <span className="bg-kid-yellow text-black text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider animate-bounce flex items-center gap-1 border-2 border-black shadow-sm">
                  <Star className="w-3 h-3 fill-black" /> {text.diagnosticRequired}
                </span>
                <h3 className="text-3xl font-black text-white">{text.diagnosticTitle}</h3>
              </div>
              <p className="text-purple-100 max-w-xl text-lg font-medium leading-relaxed">
                {text.diagnosticDesc}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate(ViewState.DIAGNOSTIC)}
            className="whitespace-nowrap bg-kid-green text-black px-8 py-4 rounded-2xl font-black text-lg shadow-comic border-4 border-black hover:bg-green-400 transition-all flex items-center gap-3 hover:scale-105"
          >
            {text.btnDiagnostic}
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-kid-blue p-8 rounded-[2.5rem] shadow-comic border-4 border-black flex flex-col justify-center relative overflow-hidden group hover:-translate-y-2 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <Compass className="w-12 h-12 text-black mb-4 relative z-10 bg-white p-2 rounded-2xl border-2 border-black shadow-sm" />
          <h3 className="text-2xl font-black text-white mb-3 relative z-10">{text.methodTitle}</h3>
          <p className="text-black/80 font-bold text-lg leading-relaxed relative z-10">
            {text.methodDesc}
          </p>
        </div>

        <div className="bg-kid-pink p-8 rounded-[2.5rem] shadow-comic border-4 border-black flex flex-col justify-center relative overflow-hidden group hover:-translate-y-2 transition-transform">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <Lightbulb className="w-12 h-12 text-black mb-4 relative z-10 bg-white p-2 rounded-2xl border-2 border-black shadow-sm" />
          <h3 className="text-2xl font-black text-white mb-3 relative z-10">{text.resultsTitle}</h3>
          <p className="text-white font-bold text-lg leading-relaxed relative z-10">
            {text.resultsDesc}
          </p>
        </div>
      </div>

      {/* Values Section */}
      <section>
        <div className="flex items-center gap-4 mb-8 justify-center">
          <div className="h-2 bg-black/10 flex-1 rounded-full"></div>
          <h3 className="text-3xl font-black text-kid-navy uppercase tracking-widest bg-white px-6 py-2 rounded-full border-4 border-black shadow-comic transform -rotate-2">{text.adnTitle}</h3>
          <div className="h-2 bg-black/10 flex-1 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ValueCard
            title={text.valAutonomy.title}
            desc={text.valAutonomy.desc}
            icon={<Target className="w-6 h-6 text-black" />}
            color="bg-kid-blue"
          />
          <ValueCard
            title={text.valWellness.title}
            desc={text.valWellness.desc}
            icon={<Smile className="w-6 h-6 text-black" />}
            color="bg-kid-yellow"
          />
          <ValueCard
            title={text.valMastery.title}
            desc={text.valMastery.desc}
            icon={<Zap className="w-6 h-6 text-black" />}
            color="bg-kid-orange"
          />
          <ValueCard
            title={text.valImpact.title}
            desc={text.valImpact.desc}
            icon={<Heart className="w-6 h-6 text-black" />}
            color="bg-kid-green"
          />
        </div>
      </section>
    </div>
  );
};

const ValueCard: React.FC<{ title: string; desc: string; icon: React.ReactNode; color: string }> = ({ title, desc, icon, color }) => (
  <div className={`bg-white p-6 rounded-[2rem] shadow-comic border-4 border-black hover:-translate-y-2 transition-all group`}>
    <div className={`w-14 h-14 rounded-2xl ${color} border-2 border-black flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div>
      <h4 className="font-black text-xl text-black mb-1">{title}</h4>
      <p className="text-sm font-bold text-slate-500 leading-snug">{desc}</p>
    </div>
  </div>
);

export default Dashboard;
