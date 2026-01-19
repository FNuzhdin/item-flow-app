import { useState } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { LeftPanel } from './components/LeftPanel/LeftPanel';
import { RightPanel } from './components/RightPanel/RightPanel';
import { AddItemForm } from './components/AddItemForm/AddItemForm';
import { api } from './services/api';

function App() {
  const [leftPanelRefresh, setLeftPanelRefresh] = useState(0);
  const [rightPanelRefresh, setRightPanelRefresh] = useState(0);

  const handleItemSelect = async (id: number) => {
    try {
      await api.selectItem(id);
      // Обновим правую панель после батчинга (1 сек)
      setTimeout(() => setRightPanelRefresh(prev => prev + 1), 1100);
    } catch (error) {
      console.error('Failed to select item:', error);
    }
  };

  const handleItemDeselect = async (id: number) => {
    try {
      await api.deselectItem(id);
      // Обновим левую панель после батчинга (1 сек)
      setTimeout(() => setLeftPanelRefresh(prev => prev + 1), 1100);
    } catch (error) {
      console.error('Failed to deselect item:', error);
    }
  };

  const handleItemAdded = () => {
    // Обновим левую панель после добавления нового элемента
    setLeftPanelRefresh(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Item Flow Manager
          </h1>
          <ThemeToggle />
        </div>

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
    </div>
  );
}

export default App;