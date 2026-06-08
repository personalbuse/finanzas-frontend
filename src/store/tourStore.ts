import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TourState {
  isActive: boolean;
  currentStep: number;
  shouldStartTour: boolean;
  tourDone: boolean;
  startTour: () => void;
  nextStep: () => void;
  goToStep: (step: number) => void;
  endTour: () => void;
  setShouldStartTour: (value: boolean) => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      isActive: false,
      currentStep: 0,
      shouldStartTour: false,
      tourDone: false,

      startTour: () => {
        set({ shouldStartTour: false, isActive: true, currentStep: 0 });
      },

      nextStep: () => {
        set((state) => ({ currentStep: state.currentStep + 1 }));
      },

      goToStep: (step: number) => {
        set({ currentStep: step });
      },

      endTour: () => {
        set({ tourDone: true, isActive: false, currentStep: 0 });
      },

      setShouldStartTour: (value: boolean) => {
        set({ shouldStartTour: value });
      },
    }),
    {
      name: 'simulador-tour-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        shouldStartTour: state.shouldStartTour,
        tourDone: state.tourDone,
      }),
    },
  ),
);
