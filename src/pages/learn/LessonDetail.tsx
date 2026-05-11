import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../provider/LanguageProvider';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FileText,
  CheckCircle,
  Lightbulb,
  CreditCard
} from 'lucide-react';

export function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'theory' | 'quiz' | 'simulation'>('theory');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!id || !['m1', 'm2', 'm3', 'm4', 'm5', 'm6'].includes(id)) {
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

  const nextStep = async () => {
    if (step === 'theory') setStep('quiz');
    else if (step === 'quiz') setStep('simulation');
    else {
      try {
        const res = await api.post(`/complete-module/${id}`);
        if (res.data.current_balance) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          currentUser.current_balance = res.data.current_balance;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
        toast.success(`${t('learning.moduleCompleted')} ${t('learning.bonusEarned')}`);
      } catch (error) {
        console.error('Error completing module:', error);
      }
      navigate('/learn');
    }
  };

  const getTheorySections = (theoryText: string) => {
    const sections: { title: string; content: string; type: 'intro' | 'list' | 'cards' | 'facts' }[] = [];
    const parts = theoryText.split('\n\n');
    
    parts.forEach((part, index) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      if (index === 0) {
        sections.push({ title: 'Introduccion', content: trimmed, type: 'intro' });
      } else if (trimmed.includes(':') && trimmed.split('\n').length > 3) {
        sections.push({ title: trimmed.split(':')[0].trim(), content: trimmed, type: 'list' });
      } else if (trimmed.includes('•') || trimmed.includes('- ')) {
        sections.push({ title: 'Puntos Clave', content: trimmed, type: 'list' });
      } else {
        sections.push({ title: 'Resumen', content: trimmed, type: 'intro' });
      }
    });
    
    return sections;
  };

  const theorySections = getTheorySections(t(`learn.modules.${id}.theory`));
  
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in py-6 md:py-8">
      <button 
        onClick={() => navigate('/learn')}
        className="group flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest mb-6 transition-colors"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t('learn.backToAcademy')}
      </button>

      <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="h-1 w-full bg-slate-100 dark:bg-[#1a1a1a] flex">
          <div className={`h-full bg-emerald-500 transition-all duration-500 ${getProgressWidth()}`} />
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${
              step === 'theory' ? 'bg-blue-500' : step === 'quiz' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {getStepLabel()}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-6">
            {t(`learn.modules.${id}.title`)}
          </h2>

          {step === 'theory' && (
            <div className="animate-fade-in space-y-4">
              {theorySections.map((section, idx) => (
                <div key={idx} className={`rounded-xl border overflow-hidden ${
                  section.type === 'intro' 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
                    : section.type === 'list'
                    ? 'bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-[#262626]'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}>
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-[#262626] flex items-center gap-3">
                    {section.type === 'intro' && <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    {section.type === 'list' && <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                    {section.type === 'cards' && <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                    {section.type === 'facts' && <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      {section.title}
                    </h3>
                  </div>
                  <div className="p-5">
                    {section.type === 'list' ? (
                      <ul className="space-y-3">
                        {section.content.split('\n').filter(line => line.trim()).map((line, lineIdx) => (
                          <li key={lineIdx} className="flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                            <span className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                              {line.replace(/^[•\-]\s*/, '').trim()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        {section.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  onClick={async () => {
                    try {
                      await api.post(`/complete-module/${id}`);
                      const res = await api.get('/user');
                      if (res.data.current_balance) {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        currentUser.current_balance = res.data.current_balance;
                        localStorage.setItem('user', JSON.stringify(currentUser));
                      }
                      toast.success(`${t('learning.moduleCompleted')} ${t('learning.bonusEarned')}`);
                    } catch (error) {
                      console.error('Error completing module:', error);
                    }
                    navigate('/learn');
                  }} 
                  className="btn-primary px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700"
                >
                  {t('learning.finishLesson')}
                </button>
                <button 
                  onClick={() => setStep('quiz')} 
                  className="btn-secondary px-8 py-2.5"
                >
                  {t('learning.testKnowledge')}
                </button>
              </div>
            </div>
          )}

          {step === 'quiz' && (
            <div className="animate-fade-in">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-5 border border-amber-100 dark:border-amber-900">
                <p className="text-base md:text-lg text-slate-900 dark:text-white font-medium mb-1">
                  {t(`learn.modules.${id}.quiz.q1`)}
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                {[1, 2].map((num) => (
                  <button
                    key={num}
                    onClick={() => !showResult && setSelectedOption(num.toString())}
                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 ${
                      selectedOption === num.toString() 
                        ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                        : 'border-slate-200 dark:border-[#262626] hover:border-slate-400 dark:hover:border-[#333] text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0d0d0d]'
                    } ${showResult && t(`learn.modules.${id}.quiz.a`) === num.toString() ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-400' : ''}`}
                    disabled={showResult}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium ${
                        selectedOption === num.toString() 
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white' 
                          : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300'
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