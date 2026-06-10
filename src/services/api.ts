import axios, { type AxiosError } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: () => void) {
  refreshSubscribers.push(cb);
}

async function attemptRefresh(): Promise<boolean> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/refresh-token`,
      {},
      { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
    );
    return response.status === 200;
  } catch {
    return false;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean; _retryCount?: number }) | undefined;

    if (status !== 401 && originalRequest && (originalRequest._retryCount ?? 0) < 2) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
      await new Promise((r) => setTimeout(r, 1000 * originalRequest._retryCount!));
      return api(originalRequest);
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber(() => {
            resolve(api(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const success = await attemptRefresh();
        isRefreshing = false;
        if (success) {
          onRefreshed();
          return api(originalRequest);
        }
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(error);
      } catch (refreshErr) {
        isRefreshing = false;
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshErr instanceof Error ? refreshErr : new Error(String(refreshErr)));
      }
    }

    if (status === 401) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(error);
  },
);

export function createCancelSource() {
  const controller = new AbortController();
  return { signal: controller.signal, cancel: () => controller.abort() };
}

export default api;
