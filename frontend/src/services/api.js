/**
 * api.js — Centralized API service layer
 * All backend communication goes through here.
 */
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});
// ─── Auth ────────────────────────────────────────────────────────────

export const loginUser = (username, password) =>
  API.post("/auth/login", { username, password });

// ─── Customers ───────────────────────────────────────────────────────

export const getCustomers = (params = {}) =>
  API.get("/customers", { params });

export const getCustomerById = (id) =>
  API.get(`/customers/${id}`);

export const updateCustomerStatus = (id, status) =>
  API.put(`/customers/${id}/status`, { status });

// ─── Matches ─────────────────────────────────────────────────────────

export const getAIStatus = () =>
  API.get("/matches/ai-status");

export const getMatches = (customerId) =>
  API.get(`/matches/customers/${customerId}/matches`);

export const sendMatch = (customerId, matchProfileId, introEmail, reverseIntroEmail) =>
  API.post("/matches/send", { customerId, matchProfileId, introEmail, reverseIntroEmail });

export const generateIntroEmail = (customerId, matchProfileId) =>
  API.post("/matches/intro-email", { customerId, matchProfileId });

export const getMatchExplanation = (customerId, matchProfileId, score) =>
  API.post("/matches/explain", { customerId, matchProfileId, score });

// ─── Notes ───────────────────────────────────────────────────────────

export const getNotes = (customerId) =>
  API.get(`/customers/${customerId}/notes`);

export const addNote = (customerId, type, content) =>
  API.post(`/customers/${customerId}/notes`, { type, content });

export default API;
