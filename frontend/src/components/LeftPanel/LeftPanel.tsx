import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { api } from '../../services/api';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { Loader2, Plus } from 'lucide-react';
import type { LeftPanelProps } from '../../types';



export const LeftPanel = ({ onItemSelect, refreshTrigger }: LeftPanelProps) => {
  const [items, setItems] = useState<number[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const LIMIT = 20;

  const loadItems = useCallback(async (currentOffset: number, currentFilter: string, append: boolean = false) => {
    setLoading(true);
    try {
      const response = await api.getAvailableItems(currentOffset, LIMIT, currentFilter || undefined);
      
      if (append) {
        setItems(prev => [...prev, ...response.items]);
      } else {
        setItems(response.items);
      }
      
      setTotal(response.total);
      setHasMore(currentOffset + response.items.length < response.total);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setOffset(0);
    loadItems(0, filter, false);
  }, [filter, refreshTrigger, loadItems]);

  const loadMore = useCallback(() => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    loadItems(newOffset, filter, true);
  }, [offset, filter, loadItems]);

  const loadMoreRef = useInfiniteScroll({
    loading,
    hasMore,
    oneLoadMore: loadMore,
  });

  const handleSelect = (id: number) => {
    onItemSelect(id);
    setItems(prev => prev.filter(item => item !== id));
    setTotal(prev => prev - 1);
  };

  return (
    <Card className="p-4 md:p-6 flex flex-col" style={{ height: '600px' }}>
      {/* Header - фиксированная часть */}
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-lg md:text-xl font-semibold mb-4">
          Available Items
        </h2>
        
        <Input
          placeholder="Filter by ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-2"
        />
        
        <div className="text-sm text-muted-foreground">
          Total: {total.toLocaleString()} items
        </div>
      </div>

      {/* Список элементов - скроллируемая часть */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-4">
            {items.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <span className="font-mono">ID: {id}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSelect(id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Select
                </Button>
              </div>
            ))}

            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {hasMore && !loading && (
              <div ref={loadMoreRef} className="h-10" />
            )}

            {!hasMore && items.length > 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No more items
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No items found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};