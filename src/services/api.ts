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

export async function setup2FA(): Promise<{ secret: string; qr_code: string; provisioning_uri: string }> {
  const response = await api.post('/2fa/setup');
  return response.data;
}

export async function verify2FA(code: string): Promise<{ enabled: boolean; backup_codes: string[] }> {
  const response = await api.post('/2fa/verify', { code });
  return response.data;
}

export async function disable2FA(password: string, code: string): Promise<{ message: string }> {
  const response = await api.post('/2fa/disable', { password, code });
  return response.data;
}

export async function get2FAStatus(): Promise<{ enabled: boolean; setup_at: string | null }> {
  const response = await api.get('/2fa/status');
  return response.data;
}

export async function loginVerify2FA(temp_token: string, code: string): Promise<{
  access_token: string; refresh_token: string; token_type: string; user: any;
}> {
  const response = await api.post('/2fa/login-verify', { temp_token, code });
  return response.data;
}

export async function loginBackup2FA(temp_token: string, backup_code: string): Promise<{
  access_token: string; refresh_token: string; token_type: string; user: any;
}> {
  const response = await api.post('/2fa/login-backup', { temp_token, backup_code });
  return response.data;
}

export async function sendLoginSmsOtp(temp_token: string): Promise<{ message: string }> {
  const formData = new URLSearchParams({ temp_token });
  const response = await api.post('/2fa/send-otp', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
}

export async function verifyPDFSignature(file: File): Promise<{
  valid: boolean;
  message: string;
  details: {
    hash: string;
    cert_serial: string;
    cert_subject: string;
    signature_timestamp: string;
  } | null;
}> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/portfolio/report/verify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return response.data;
}

export default api;
