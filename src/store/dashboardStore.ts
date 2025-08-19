import { create } from 'zustand';
import type { DashboardData, Insight, Period } from '../types/dashboard';

interface DashboardState {
  data: DashboardData | null;
  insights: Insight[];
  loading: boolean;
  error: string | null;
  selectedPeriod: Period;
  comparisonEnabled: boolean;
  comparisonPeriod: Period | null;
  
  setData: (data: DashboardData) => void;
  setInsights: (insights: Insight[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedPeriod: (period: Period) => void;
  setComparisonEnabled: (enabled: boolean) => void;
  setComparisonPeriod: (period: Period | null) => void;
  reset: () => void;
}

const initialState = {
  data: null,
  insights: [],
  loading: false,
  error: null,
  selectedPeriod: {
    year: new Date().getFullYear(),
    quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`
  },
  comparisonEnabled: false,
  comparisonPeriod: null
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialState,
  
  setData: (data) => set({ data, error: null }),
  setInsights: (insights) => set({ insights }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  setComparisonEnabled: (enabled) => set({ comparisonEnabled: enabled }),
  setComparisonPeriod: (period) => set({ comparisonPeriod: period }),
  reset: () => set(initialState)
}));