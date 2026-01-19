import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { api } from '../../services/api';
import { Plus, Loader2 } from 'lucide-react';

interface AddItemFormProps {
  onItemAdded: () => void;
}

export const AddItemForm = ({ onItemAdded }: AddItemFormProps) => {
  const [newId, setNewId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Валидация
    const id = parseInt(newId);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    setLoading(true);
    try {
      await api.addItem(id);
      setSuccess(`ID ${id} added to queue. It will appear in ~10 seconds.`);
      setNewId('');
      
      // Обновим левую панель после батчинга (10 сек + небольшой запас)
      setTimeout(() => {
        onItemAdded();
        setSuccess('');
      }, 10500);
    } catch (error) {
      console.error('Failed to add item:', error);
      setError('Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-4">
        Add New Item
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter new ID..."
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            disabled={loading}
            min="1"
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-600 dark:text-green-400">
            {success}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Note: New items are added in batches every 10 seconds.
        </div>
      </form>
    </Card>
  );
};