import axios from "axios";
import type { ItemsResponse } from "../types";

const API_BASE_URL = "/api";

export const api = {
  // Получение доступных элементов (available)
  getAvailableItems: async (
    offset: number = 0,
    limit: number = 20,
    filter?: string,
  ): Promise<ItemsResponse> => {
    const params: any = {
      offset,
      limit,
    };
    if (filter) params.filter = filter;

    const response = await axios.get(`${API_BASE_URL}/items/available`, {
      params,
    });
    return response.data;
  },

  // Получить выбранные элементы (selected)
  getSelectedItems: async (
    offset: number = 0,
    limit: number = 20,
    filter?: string,
  ): Promise<ItemsResponse> => {
    const params: any = {
      offset,
      limit,
    };

    if (filter) params.filter = filter;

    const response = await axios.get(`${API_BASE_URL}/items/selected`, {
      params,
    });
    return response.data;
  },

  // Выбрать элемент
  selectItem: async (id: number): Promise<void> => {
    await axios.post(`${API_BASE_URL}/items/select`, { id });
  },

  // Удалить элемент из выбранных
  deselectItem: async (id: number): Promise<void> => {
    await axios.post(`${API_BASE_URL}/items/deselect`, { id });
  },

  // Перегруппировать элементы
  reorderItems: async (order: number[]): Promise<void> => {
    await axios.post(`${API_BASE_URL}/items/reorder`, { order });
  },

  // Добавить новый элемент 
  addItem: async (id: number): Promise<void> => {
    await axios.post(`${API_BASE_URL}/items/add`, { id });
  },


};
