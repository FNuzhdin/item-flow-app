import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { storage } from "./storage";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// получить доступные элементы (для левого окна)
app.get("/api/items/available", (req, res) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 20;
  const filter = req.query.filter as string | undefined;

  const { items, total } = storage.getAvailableItemsPaginated(
    offset,
    limit,
    filter,
  );

  res.json({
    items,
    total,
    offset,
    limit,
    filter: filter || null,
  });
});

// получить выбранные элементы (для правого окна)
app.get(`/api/items/selected`, (req, res) => {
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 20;
  const filter = req.query.filter as string | undefined;

  const { items, total } = storage.getSelectedItemsPaginated(
    offset,
    limit,
    filter,
  );

  res.json({
    items,
    total,
    offset,
    limit,
    filter: filter || null
  });
});

// добавить элемент в выбранные
app.post(`/api/items/select`, (req, res) => {
  const { id } = req.body;

  if (!id || typeof id !== "number") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  storage.queueOperation("select", { id });
  res.json({ success: true, message: "Operation queued" });
});

// удалить элемент из выбранных
app.post(`/api/items/deselect`, (req, res) => {
  const { id } = req.body;

  if (!id || typeof id !== "number") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  storage.queueOperation("deselect", { id });
  res.json({ success: true, message: "Operation queued" });
});

// перегруппировать элементы
app.post(`/api/items/reorder`, (req, res) => {
  const { order } = req.body;

  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "Order must be an array" });
  }

  storage.queueOperation("reorder", { order });
  res.json({ success: true, message: "Operation queued" });
});

// добавить новый элемент
app.post(`/api/items/add`, (req, res) => {
  const { id } = req.body;

  if (!id || typeof id !== "number") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  storage.queueOperation("add", { id });
  res.json({ success: true, message: "Operation queued" });
});
