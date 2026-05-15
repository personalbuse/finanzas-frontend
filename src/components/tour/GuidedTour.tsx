import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTourStore } from '../../store/tourStore';
import { X, ChevronRight, BookOpen, Globe, LineChart, Briefcase, Sparkles, Wallet, ArrowLeft, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: Wallet,
    title: '¡Bienvenido a tu Amigo Financiero!',
    description: 'Gracias por registrarte. Tienes $10,000 virtuales para practicar inversiones sin riesgo.',
  },
  {
    icon: BookOpen,
    title: '¿Para qué sirve este simulador?',
    description: 'Compra y vende acciones de empresas reales (Apple, Google, Tesla, etc.) con dinero virtual. Aprende sobre mercados, diversificación y estrategias sin arriesgar tu dinero.',
  },
  {
    icon: Sparkles,
    title: 'Conceptos Básicos',
    description: 'Una acción representa una parte de una empresa. Al comprarla, eres dueño de una fracción. Su precio sube o baja según oferta, demanda y la economía.',
  },
  {
    icon: Globe,
    title: 'Mercado de Divisas',
    description: 'Acá puedes consultar las tasas de cambio de las principales monedas del mundo frente al peso colombiano. Cada fila muestra el par, precio y variación.',
  },
  {
    icon: LineChart,
    title: 'Acciones de USA',
    description: 'Explora las acciones disponibles. Busca por símbolo (ej: AAPL), elige cuántas comprar y haz tu primera inversión. Tómate el tiempo que quieras.',
  },
  {
    icon: Briefcase,
    title: 'Tu Portafolio',
    description: 'Aquí ves todas tus inversiones: cantidad, precio promedio, valor actual y ganancia. También puedes vender cuando quieras.',
  },
  {
    icon: Sparkles,
    title: 'Explora más funciones',
    description: 'Mercados Globales, Índices Mundiales, Ranking de Traders, Academia (+$1,000 por módulo) y Transacciones.',
  },
];

export function GuidedTour() {
  const { isActive, currentStep, nextStep, goToStep, endTour } = useTourStore();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      setIsMobile(window.innerWidth < 640);
    });
  }

  if (!isActive) return null;

  const step = STEPS[currentStep];
  if (!step) return null;

  const Icon = step.icon;
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    switch (currentStep) {
      case 2:
        navigate('/forex');
        nextStep();
        break;
      case 3:
        navigate('/stocks');
        nextStep();
        break;
      case 4:
        navigate('/portfolio');
        nextStep();
        break;
      case 5:
        navigate('/dashboard');
        nextStep();
        break;
      default:
        nextStep();
    }
  };

  const handlePrev = () => {
    if (currentStep <= 0) return;
    const prevStep = currentStep - 1;
    switch (prevStep) {
      case 3:
        navigate('/forex');
        break;
      case 4:
        navigate('/stocks');
        break;
      case 5:
        navigate('/portfolio');
        break;
      default:
        navigate('/dashboard');
    }
    goToStep(prevStep);
  };

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[60] animate-slide-up">
        <div className="relative bg-[#0d0d0d] border-t border-[#1a1a1a] rounded-t-2xl shadow-2xl px-5 pt-2 pb-5">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-1 rounded-full bg-slate-600" />
          </div>

          <button
            onClick={() => endTour()}
            className="absolute top-3 right-3 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a1a1a] transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider">
                  Paso {currentStep + 1}/{STEPS.length}
                </span>
                <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden max-w-[80px]">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white leading-tight">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-3">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className={`flex items-center gap-1 px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                isFirst
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 bg-[#1a1a1a] hover:bg-[#262626] active:bg-[#2a2a2a]'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Anterior
            </button>

            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-3 text-sm font-semibold text-black bg-white rounded-lg hover:bg-slate-200 active:bg-slate-300 transition-all"
            >
              {isLast ? 'Finalizar' : 'Siguiente'}
              {isLast ? null : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-96 animate-fade-in">
      <div className="relative bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-[#1a1a1a]">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <button
          onClick={() => endTour()}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a1a1a] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-900/30 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider">
              Paso {currentStep + 1}/{STEPS.length}
            </span>
          </div>

          <h3 className="text-base font-semibold text-white leading-tight mb-1">
            {step.title}
          </h3>

          <p className="text-sm text-slate-400 leading-relaxed">
            {step.description}
          </p>

          <div className="flex items-center justify-between gap-2 mt-3">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                isFirst
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 bg-[#1a1a1a] hover:bg-[#262626]'
              }`}
            >
              <ArrowLeft className="w-3 h-3" />
              Anterior
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-black bg-white rounded-lg hover:bg-slate-200 transition-all"
            >
              {isLast ? 'Finalizar' : 'Siguiente'}
              {isLast ? null : <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
