import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../provider/LanguageProvider';

export function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'theory' | 'quiz' | 'simulation'>('theory');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!id || !['m1', 'm2', 'm3'].includes(id)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Module not found</h2>
          <button 
            onClick={() => navigate('/learn')}
            className="btn-primary"
          >
            {t('learn.backToAcademy')}
          </button>
        </div>
      </div>
    );
  }

  const handleQuizSubmit = () => {
    const correct = selectedOption === t(`learn.modules.${id}.quiz.a`);
    setIsCorrect(correct);
    setShowResult(true);
  };

  const nextStep = () => {
    if (step === 'theory') setStep('quiz');
    else if (step === 'quiz') setStep('simulation');
    else navigate('/learn');
  };

  const getStepLabel = () => {
    switch (step) {
      case 'theory': return t('learn.steps.theory');
      case 'quiz': return t('learn.steps.quiz');
      case 'simulation': return t('learn.steps.simulation');
    }
  };

  const getProgressWidth = () => {
    switch (step) {
      case 'theory': return 'w-1/3';
      case 'quiz': return 'w-2/3';
      case 'simulation': return 'w-full';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in py-8 md:py-12">
      <button 
        onClick={() => navigate('/learn')}
        className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest mb-8 transition-colors"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t('learn.backToAcademy')}
      </button>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-xl">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 flex">
          <div className={`h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ${getProgressWidth()}`} />
        </div>

        <div className="p-8 md:p-14">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-3 h-3 rounded-full ${
              step === 'theory' ? 'bg-blue-500' : step === 'quiz' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {getStepLabel()}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-10">
            {t(`learn.modules.${id}.title`)}
          </h2>

          {step === 'theory' && (
            <div className="animate-fade-in">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-8 mb-10 border border-slate-100 dark:border-slate-600">
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {t(`learn.modules.${id}.theory`)}
                </p>
              </div>
              <button onClick={nextStep} className="btn-primary px-10 py-3 shadow-lg hover:shadow-xl transition-shadow">
                {t('learn.continueCourse')}
              </button>
            </div>
          )}

          {step === 'quiz' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 mb-8 border border-amber-100 dark:border-amber-800">
                <p className="text-lg md:text-xl text-slate-900 dark:text-white font-bold mb-2">
                  {t(`learn.modules.${id}.quiz.q1`)}
                </p>
              </div>
              
              <div className="space-y-4 mb-10">
                {[1, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => !showResult && setSelectedOption(num.toString())}
                    className={`w-full p-5 rounded-2xl border-2 text-left font-bold transition-all duration-200 ${
                      selectedOption === num.toString() 
                        ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800'
                    } ${showResult && t(`learn.modules.${id}.quiz.a`) === num.toString() ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-400' : ''}`}
                    disabled={showResult}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedOption === num.toString() 
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {num === 1 ? 'A' : 'B'}
                      </span>
                      {t(`learn.modules.${id}.quiz.o${num}`)}
                    </span>
                  </button>
                ))}
              </div>

              {!showResult ? (
                <button 
                  onClick={handleQuizSubmit} 
                  disabled={!selectedOption}
                  className="btn-primary px-10 py-3 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('learn.checkAnswer')}
                </button>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className={`p-6 rounded-2xl border-2 ${
                    isCorrect 
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700' 
                      : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
                  }`}>
                    <p className={`font-bold text-lg ${
                      isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
                    }`}>
                      {isCorrect ? t('learn.correctAnswer') : t('learn.wrongAnswer')}
                    </p>
                  </div>
                  <button onClick={nextStep} className="btn-primary px-10 py-3 shadow-lg hover:shadow-xl transition-shadow">
                    {t('learn.nextStep')}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'simulation' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-700/50 dark:to-emerald-900/20 border border-slate-200 dark:border-emerald-800 rounded-2xl p-8 mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-lg text-slate-900 dark:text-white font-bold">{t('learn.instruction')}</p>
                </div>
                <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {t(`learn.modules.${id}.simulation`)}
                </p>
              </div>
              
              <button 
                onClick={() => navigate('/stocks')}
                className="btn-primary px-10 py-3 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {t('learn.goToMarket')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}