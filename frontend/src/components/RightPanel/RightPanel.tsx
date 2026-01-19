import { useState, useEffect, useCallback } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { api } from "../../services/api";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { Loader2, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RightPanelProps {
  onItemDeselect: (id: number) => void;
  refreshTrigger: number;
}

// Компонент для одного сортируемого элемента
interface SortableItemProps {
  id: number;
  onDeselect: (id: number) => void;
}

const SortableItem = ({ id, onDeselect }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent transition-colors"
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <span className="font-mono">ID: {id}</span>
      </div>
      <Button size="sm" variant="outline" onClick={() => onDeselect(id)}>
        <X className="h-4 w-4 mr-1" />
        Remove
      </Button>
    </div>
  );
};

export const RightPanel = ({
  onItemDeselect,
  refreshTrigger,
}: RightPanelProps) => {
  const [items, setItems] = useState<number[]>([]);
  const [allItems, setAllItems] = useState<number[]>([]); // Все выбранные (без фильтра)
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const LIMIT = 20;

  // Настройка сенсоров для drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Загрузка данных
  const loadItems = useCallback(
    async (
      currentOffset: number,
      currentFilter: string,
      append: boolean = false,
    ) => {
      setLoading(true);
      try {
        const response = await api.getSelectedItems(
          currentOffset,
          LIMIT,
          currentFilter || undefined,
        );

        if (append) {
          setItems((prev) => [...prev, ...response.items]);
        } else {
          setItems(response.items);
        }

        setTotal(response.total);
        setHasMore(currentOffset + response.items.length < response.total);

        // Если фильтр пустой, сохраняем полный список для drag&drop
        if (!currentFilter && !append) {
          setAllItems(response.items);
        } else if (!currentFilter && append) {
          setAllItems((prev) => [...prev, ...response.items]);
        }
      } catch (error) {
        console.error("Failed to load items:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Первоначальная загрузка + при изменении refreshTrigger
  useEffect(() => {
    setOffset(0);
    loadItems(0, filter, false);
  }, [filter, refreshTrigger, loadItems]);

  // Загрузка следующей порции
  const loadMore = useCallback(() => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    loadItems(newOffset, filter, true);
  }, [offset, filter, loadItems]);

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll({
    loading,
    hasMore,
    oneLoadMore: loadMore,
  });

  // Обработчик deselect
  const handleDeselect = (id: number) => {
    onItemDeselect(id);
    setItems((prev) => prev.filter((item) => item !== id));
    setAllItems((prev) => prev.filter((item) => item !== id));
    setTotal((prev) => prev - 1);
  };

  // Обработчик окончания перетаскивания
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.toString() === active.id);
      const newIndex = items.findIndex((item) => item.toString() === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Если фильтр активен, обновляем порядок в полном списке
      if (filter) {
        const newAllItems = [...allItems];
        const itemToMove = items[oldIndex];

        // Находим позиции в полном списке
        const oldIndexInAll = allItems.indexOf(itemToMove);
        const overItem = items[newIndex];
        const newIndexInAll = allItems.indexOf(overItem);

        const updatedAllItems = arrayMove(
          newAllItems,
          oldIndexInAll,
          newIndexInAll,
        );
        setAllItems(updatedAllItems);

        // Отправляем обновлённый полный список на сервер
        try {
          await api.reorderItems(updatedAllItems);
        } catch (error) {
          console.error("Failed to reorder items:", error);
        }
      } else {
        // Если фильтр неактивен, отправляем текущий список
        setAllItems(newItems);
        try {
          await api.reorderItems(newItems);
        } catch (error) {
          console.error("Failed to reorder items:", error);
        }
      }
    }
  };

  return (
    <Card className="p-4 md:p-6 flex flex-col" style={{ height: "600px" }}>
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-lg md:text-xl font-semibold mb-4">
          Selected Items
        </h2>

        <Input
          placeholder="Filter by ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-2"
        />

        <div className="text-sm text-muted-foreground">
          Total: {total.toLocaleString()} items selected
        </div>
      </div>

      {/* Список элементов с Drag&Drop */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((id) => id.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 pr-4">
                {items.map((id) => (
                  <SortableItem key={id} id={id} onDeselect={handleDeselect} />
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
                    No items selected
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>
      </div>
    </Card>
  );
};
