import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

async function attemptRefresh(): Promise<string | null> {
  const { refreshToken, setAccessToken, clear } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/refresh-token`,
      new URLSearchParams({ refresh_token: refreshToken }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    const newToken: string = response.data.access_token;
    setAccessToken(newToken);
    return newToken;
  } catch (err) {
    clear();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const newToken = await attemptRefresh();
        isRefreshing = false;
        if (newToken) {
          onRefreshed(newToken);
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(error);
      } catch (refreshErr) {
        isRefreshing = false;
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshErr);
      }
    }

    if (status === 401) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(error);
  },
);

export default api;
