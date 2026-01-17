import { RequestQueue, QueueOperation, OperationType } from "./queue";

interface AppStorage {
  allItems: Set<number>;
  selectedItems: number[];
}

class DataStore {
  private storage: AppStorage;
  private queue: RequestQueue;

  constructor() {
    // выполняем инициализацию всех элементов
    this.storage = {
      allItems: new Set(Array.from({ length: 1000000 }, (_, i) => i + 1)),
      selectedItems: [],
    };

    this.queue = new RequestQueue(
      (operations) => this.processWriteOperations(operations),
      (operations) => this.processReadOperations(operations),
    );

    console.log(`Initialized ${this.storage.allItems.size} items`);
  }

  /**
   * Обработка write операций (add)
   * @param operations Операции для обработки
   */
  private processWriteOperations(operations: QueueOperation[]) {
    operations.forEach((op) => {
      if (op.type === "add") {
        const id = op.payload.id;
        if (!this.storage.allItems.has(id)) {
          this.storage.allItems.add(id);
          console.log(`Added new item: ${id}`);
        } else {
          console.log(`Intem ${id} already exists, skipped`);
        }
      }
    });
  }

  /**
   * Обработка read операций (select, deselect, reorder)
   * @param operations Операции для обработки 
   */
  private processReadOperations(operations: QueueOperation[]) {
    operations.forEach((op) => {
      switch (op.type) {
        case "select":
          this.selectItem(op.payload.id);
          break;
        case "deselect":
          this.deselectItem(op.payload.id);
          break;
        case "reorder":
          this.reorderItems(op.payload.order);
          break;
      }
    });
  }

  /**
   * Добавить операцию в очередь 
   * @param type Тип операции
   * @param payload Данные
   */
  queueOperation(type: OperationType, payload: any) {
    this.queue.enqueue(type, payload);
  }

  /**
   * Добавляет элемент в выбранные элементы (selectedItems)
   * @param id ID элемента 
   */
  private selectItem(id: number) {
    if(this.storage.allItems.has(id) && !this.storage.selectedItems.includes(id)) {
        this.storage.selectedItems.push(id);

        console.log(`Selected item: ${id}`);
    }
  }

  /**
   * Удаляет элементы из выбранных элементов (selecteItems)
   * @param id ID элемента
   */
  private deselectItem(id: number) {
    const index = this.storage.selectedItems.indexOf(id);
    if(index !== -1) {
        this.storage.selectedItems.splice(index, 1);
        console.log(`Deselected item: ${id}`);
    }
  }

  
  /**
   * Изменение последовательности элементов в правом окне 
   * @param newOrder Последовательность элементов  
   */
  private reorderItems(newOrder: number[]) {
    // проверка, что все ID из newOrder существуют в selected
    const validOrder = newOrder.filter(id => this.storage.selectedItems.includes(id));
    this.storage.selectedItems = validOrder;

    console.log(`Reordered items, new count: ${validOrder.length}`);
  }

  /**
   * @returns Возвращает элементы за исключением выбранных (оставшиеся)
   */
  getAvailableItems(): number[] {
    const selectedItems = new Set(this.storage.selectedItems);
    return Array.from(this.storage.allItems).filter(
      (item) => !selectedItems.has(item),
    );
  }

  /**
   * @returns Возвращает выбранные элементы
   */
  getSelectedItems(): number[] {
    return [...this.storage.selectedItems]; // создаем копию, чтобы не мутировать оригинальный массив в хранилище
  }

  /**
   * @returns Возвращает все элементы
   */
  getAllItems(): number[] {
    return Array.from(this.storage.allItems);
  }
}

// создаем единственный экземпляр хранилища
export const storage = new DataStore();
