import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../provider/LanguageProvider';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    titleKey: 'onboarding.welcome',
    descKey: 'onboarding.welcomeDesc',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    titleKey: 'onboarding.learnFirst',
    descKey: 'onboarding.learnFirstDesc',
    highlight: true,
    modules: 'onboarding.courseModules',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    titleKey: 'onboarding.balance',
    descKey: 'onboarding.balanceDesc',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    titleKey: 'onboarding.readyToInvest',
    descKey: 'onboarding.readyToInvestDesc',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleStartCourse();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_shown', 'true');
    onClose();
  };

  const handleStartCourse = () => {
    localStorage.setItem('onboarding_shown', 'true');
    onClose();
    navigate('/learn');
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleSkip}
      />
      
      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden animate-fade-in">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-xl ${step.highlight ? 'bg-emerald-900/30' : 'bg-slate-800'}`}>
              <div className="text-emerald-400">
                {step.icon}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white text-center mb-2">
            {t(step.titleKey)}
          </h2>
          
          <p className="text-sm text-slate-400 text-center mb-4">
            {t(step.descKey)}
          </p>

          {step.modules && (
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-emerald-400 font-medium text-center">
                {t(step.modules)}
              </p>
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-6 bg-emerald-500' 
                    : index < currentStep 
                      ? 'w-1.5 bg-emerald-500/50' 
                      : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-400 bg-[#1a1a1a] rounded-lg hover:bg-[#262626] transition-colors"
            >
              {t('onboarding.skip')}
            </button>
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-black bg-white rounded-lg hover:bg-slate-200 transition-colors"
            >
              {isLastStep ? t('onboarding.startCourse') : t('onboarding.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}