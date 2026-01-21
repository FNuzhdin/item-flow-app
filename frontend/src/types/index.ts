// ответ от сервера
export interface ItemsResponse {
  items: number[];
  total: number;
  offset: number;
  limit: number;
  filter: string | null;
}

// Типы для ThemeProvider
export type Theme = "dark" | "light" | "system";

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// Типы для infinityScroll
export interface UseInfiniteScrollProps  {
  loading: boolean;
  hasMore: boolean;
  oneLoadMore: () => void;
}

// Для левой панели 
export interface LeftPanelProps {
  onItemSelect: (id: number) => void;
  refreshTrigger?: number
}

// состояние (для сохранения между обновлениями страницы)
export interface AppState {
  selected: number[],
  totalSelected: number,
  totalAvailable: number,
  totalItems: number
}
