import { create } from 'zustand';

interface TourState {
  isActive: boolean;
  currentStep: number;
  startTour: () => void;
  nextStep: () => void;
  goToStep: (step: number) => void;
  endTour: () => void;
}

export const useTourStore = create<TourState>()((set) => ({
  isActive: false,
  currentStep: 0,

  startTour: () => {
    localStorage.removeItem('guided_tour');
    set({ isActive: true, currentStep: 0 });
  },

  nextStep: () => {
    set((state) => ({ currentStep: state.currentStep + 1 }));
  },

  goToStep: (step: number) => {
    set({ currentStep: step });
  },

  endTour: () => {
    localStorage.setItem('guided_tour_done', 'true');
    localStorage.setItem('onboarding_shown', 'true');
    set({ isActive: false, currentStep: 0 });
  },
}));
