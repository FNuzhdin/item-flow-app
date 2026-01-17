export type OperationType = "select" | "deselect" | "reorder" | "add";

export interface QueueOperation {
  type: OperationType;
  payload: any;
  timestamp: number;
}

export class RequestQueue {
  private writeQueue: Map<string, QueueOperation> = new Map(); /*
  за счет того, что мы используем мэппинг, операции не будут повторятся 
  мэппинги обеспечивают дедупликацию операций
  */
  private readQueue: Map<string, QueueOperation> = new Map();

  private writeTimer: NodeJS.Timeout | null = null;
  private readTimer: NodeJS.Timeout | null = null;

  constructor(
    private onWriteFlush: (operations: QueueOperation[]) => void,
    private onReadFlush: (operations: QueueOperation[]) => void,
  ) {
    this.startTimers();
  }

  private startTimers() {
    this.writeTimer = setInterval(() => {
      this.flushWriteQueue();
    }, 10 * 1000);

    this.readTimer = setInterval(() => {
      this.flushReadQueue();
    }, 1 * 1000);

    console.log(`Queue timers started: Write every 10s, Read every 1s.`);
  }

  /**
   * Добавить операцию в очередь
   * @param type Тип операции
   * @param payload Данные
   */
  enqueue(type: OperationType, payload: any) {
    const key = this.generateKey(type, payload);
    const operation: QueueOperation = {
      type,
      payload,
      timestamp: Date.now(),
    };

    if (type === "add") {
      this.writeQueue.set(key, operation);
    } else {
      this.readQueue.set(key, operation);
    }

    console.log(
      `Queued ${type} operation. WriteQueue: ${this.writeQueue.size}. ReadQueue: ${this.readQueue.size}`,
    );
  }

  /**
   * Генерация ключа операции
   * @param type Тип операции
   * @param payload Данные
   * @returns Типизированный ключ
   *
   * Ключ генерируется таким образом, чтобы решить задачу дедупликации
   */
  private generateKey(type: OperationType, payload: any): string {
    switch (type) {
      case "add":
        return `add:${payload.id}`;
      case "select":
        return `select:${payload.id}`;
      case "deselect":
        return `deselect:${payload.id}`;
      case "reorder":
        return `reorder:${payload.id}`;
      default:
        return `${type}:${JSON.stringify(payload)}`;
    }
  }

  /**
   * Обработка write очереди
   */
  private flushWriteQueue() {
    if (this.writeQueue.size === 0) return;

    const operations = Array.from(this.writeQueue.values());
    console.log(`Flushing write queue: ${operations.length} operations`);

    this.onWriteFlush(operations);
    this.writeQueue.clear();
  }

  /**
   * Обработка read очереди
   */
  private flushReadQueue() {
    if (this.readQueue.size === 0) return;

    const operations = Array.from(this.readQueue.values());
    console.log(`Flushing read queue: ${operations.length} operations`);

    this.onReadFlush(operations);
    this.readQueue.clear();
  }

  stop() {
    if (this.writeTimer) clearInterval(this.writeTimer);
    if (this.readTimer) clearInterval(this.readTimer);

    console.log(`Queue timers stopped.`);
  }
}


