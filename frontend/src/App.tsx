import { useState, useEffect } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { LeftPanel } from "./components/LeftPanel/LeftPanel";
import { RightPanel } from "./components/RightPanel/RightPanel";
import { AddItemForm } from "./components/AddItemForm/AddItemForm";
import { api } from "./services/api";
import { Loader2 } from "lucide-react";
import { Footer } from "./components/Footer";

function App() {
  const [leftPanelRefresh, setLeftPanelRefresh] = useState(0);
  const [rightPanelRefresh, setRightPanelRefresh] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [appState, setAppState] = useState<{
    totalSelected: number;
    totalAvailable: number;
    totalItems: number;
  } | null>(null);

  // Функция для загрузки/обновления статистики
  const loadAppState = async () => {
    try {
      const state = await api.getAppState();
      setAppState({
        totalSelected: state.totalSelected,
        totalAvailable: state.totalAvailable,
        totalItems: state.totalItems,
      });
    } catch (error) {
      console.error("Failed to load app state:", error);
    }
  };

  useEffect(() => {
    const loadInitialState = async () => {
      await loadAppState();
      setIsInitializing(false);
    };

    loadInitialState();
  }, []);

  const handleItemSelect = async (id: number) => {
    try {
      await api.selectItem(id);
      setTimeout(() => {
        setRightPanelRefresh((prev) => prev + 1);
        loadAppState(); // Обновляем статистику
      }, 1100);
    } catch (error) {
      console.error("Failed to select item:", error);
    }
  };

  const handleItemDeselect = async (id: number) => {
    try {
      await api.deselectItem(id);
      setTimeout(() => {
        setLeftPanelRefresh((prev) => prev + 1);
        loadAppState(); // Обновляем статистику
      }, 1100);
    } catch (error) {
      console.error("Failed to deselect item:", error);
    }
  };

  const handleItemAdded = () => {
    setLeftPanelRefresh((prev) => prev + 1);
    loadAppState(); // Обновляем статистику после добавления
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading application state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto" style={{ maxWidth: "1400px" }}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Item Flow Manager
            </span>
          </h1>
          <ThemeToggle />
        </div>

        {/* Статистика */}
        {appState && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg bg-card">
              <div className="text-sm text-muted-foreground">Total Items</div>
              <div className="text-2xl font-bold">
                {appState.totalItems.toLocaleString()}
              </div>
            </div>
            <div className="p-3 border rounded-lg bg-card">
              <div className="text-sm text-muted-foreground">Available</div>
              <div className="text-2xl font-bold">
                {appState.totalAvailable.toLocaleString()}
              </div>
            </div>
            <div className="p-3 border rounded-lg bg-card">
              <div className="text-sm text-muted-foreground">Selected</div>
              <div className="text-2xl font-bold">
                {appState.totalSelected.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Форма добавления */}
        <div className="mb-6">
          <AddItemForm onItemAdded={handleItemAdded} />
        </div>

        {/* Панели */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <LeftPanel
            onItemSelect={handleItemSelect}
            refreshTrigger={leftPanelRefresh}
          />
          <RightPanel
            onItemDeselect={handleItemDeselect}
            refreshTrigger={rightPanelRefresh}
          />
        </div>
      </div>

      <Footer/>
    </div>
  );
}

export default App;
