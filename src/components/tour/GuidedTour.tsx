import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTourStore } from '../../store/tourStore';
import {
  X,
  BookOpen,
  Globe,
  LineChart,
  Briefcase,
  Sparkles,
  Wallet,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

const STEPS = [
  {
    icon: Wallet,
    titleKey: 'tour.step1.title',
    descriptionKey: 'tour.step1.description',
  },
  {
    icon: BookOpen,
    titleKey: 'tour.step2.title',
    descriptionKey: 'tour.step2.description',
  },
  {
    icon: Sparkles,
    titleKey: 'tour.step3.title',
    descriptionKey: 'tour.step3.description',
  },
  {
    icon: Globe,
    titleKey: 'tour.step4.title',
    descriptionKey: 'tour.step4.description',
  },
  {
    icon: LineChart,
    titleKey: 'tour.step5.title',
    descriptionKey: 'tour.step5.description',
  },
  {
    icon: Briefcase,
    titleKey: 'tour.step6.title',
    descriptionKey: 'tour.step6.description',
  },
  {
    icon: Sparkles,
    titleKey: 'tour.step7.title',
    descriptionKey: 'tour.step7.description',
  },
];

const STEP_NAVIGATIONS: Record<number, string> = {
  2: '/forex',
  3: '/stocks',
  4: '/portfolio',
  5: '/dashboard',
};

export function GuidedTour() {
  const { isActive, currentStep, nextStep, goToStep, endTour } = useTourStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (!isActive) return null;

  const step = STEPS[currentStep];
  if (!step) return null;

  const Icon = step.icon;
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    const target = STEP_NAVIGATIONS[currentStep];
    if (target) navigate(target);
    nextStep();
  };

  const handlePrev = () => {
    if (isFirst) return;
    const prevStep = currentStep - 1;
    const target = STEP_NAVIGATIONS[prevStep] ?? '/dashboard';
    navigate(target);
    goToStep(prevStep);
  };

  const title = t(step.titleKey, step.titleKey);
  const description = t(step.descriptionKey, step.descriptionKey);
  const stepLabel = t('tour.stepLabel', 'Paso {{current}}/{{total}}')
    .replace('{{current}}', String(currentStep + 1))
    .replace('{{total}}', String(STEPS.length));

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[60] animate-slide-up">
        <div className="relative bg-[#0d0d0d] border-t border-[#1a1a1a] rounded-t-2xl shadow-2xl px-5 pt-2 pb-5">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-1 rounded-full bg-slate-600" />
          </div>

          <button
            type="button"
            onClick={() => endTour()}
            aria-label={t('tour.close', 'Cerrar tour')}
            className="absolute top-3 right-3 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a1a1a] transition-all"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider">
                  {stepLabel}
                </span>
                <div
                  className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden max-w-[80px]"
                  role="progressbar"
                  aria-valuenow={currentStep + 1}
                  aria-valuemin={0}
                  aria-valuemax={STEPS.length}
                >
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white leading-tight">
                {title}
              </h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirst}
              aria-label={t('tour.previous', 'Paso anterior')}
              className={`flex items-center gap-1 px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                isFirst
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 bg-[#1a1a1a] hover:bg-[#262626] active:bg-[#2a2a2a]'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              {t('tour.previous', 'Anterior')}
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label={isLast ? t('tour.finish', 'Finalizar tour') : t('tour.next', 'Siguiente paso')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-3 text-sm font-semibold text-black bg-white rounded-lg hover:bg-slate-200 active:bg-slate-300 transition-all"
            >
              {isLast ? t('tour.finish', 'Finalizar') : t('tour.next', 'Siguiente')}
              {isLast ? null : <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
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
          type="button"
          onClick={() => endTour()}
          aria-label={t('tour.close', 'Cerrar tour')}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a1a1a] transition-all"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-900/30 flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider">
              {stepLabel}
            </span>
          </div>

          <h3 className="text-base font-semibold text-white leading-tight mb-1">
            {title}
          </h3>

          <p className="text-sm text-slate-400 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center justify-between gap-2 mt-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirst}
              aria-label={t('tour.previous', 'Paso anterior')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                isFirst
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 bg-[#1a1a1a] hover:bg-[#262626]'
              }`}
            >
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
              {t('tour.previous', 'Anterior')}
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label={isLast ? t('tour.finish', 'Finalizar tour') : t('tour.next', 'Siguiente paso')}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-black bg-white rounded-lg hover:bg-slate-200 transition-all"
            >
              {isLast ? t('tour.finish', 'Finalizar') : t('tour.next', 'Siguiente')}
              {isLast ? null : <ChevronRight className="w-3 h-3" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
