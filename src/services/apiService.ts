import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface ApiServiceOptions {
  getToken: () => string | null;
}

function getAuthHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiService {
  private axios: AxiosInstance;
  private getToken: () => string | null;

  constructor(options: ApiServiceOptions) {
    this.getToken = options.getToken;
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });
    // Optionally add interceptors for error handling
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const token = this.getToken();
    const headers = { ...config.headers, ...getAuthHeaders(token) };
    const response: AxiosResponse<T> = await this.axios.request({ ...config, headers });
    return response.data;
  }

  // Auth endpoints
  login(data: { email: string; password: string }) {
    return this.request<{ token: string }>({
      url: '/auth/login',
      method: 'POST',
      data,
    });
  }

  register(data: Record<string, any>) {
    return this.request<{ token: string }>({
      url: '/auth/register',
      method: 'POST',
      data,
    });
  }

  // Track endpoints
  getMyTracks() {
    return this.request<any[]>({ url: '/tracks/my', method: 'GET' });
  }

  getTrackById(id: string) {
    return this.request<any>({ url: `/tracks/${id}`, method: 'GET' });
  }

  publishTrackCopyright(id: string) {
    return this.request<{ message: string; txHash: string }>({
      url: `/tracks/${id}/publish`,
      method: 'POST',
    });
  }

  checkTrackCopyright(id: string) {
    return this.request<{ fingerprint: string; registered: boolean }>({
      url: `/tracks/${id}/copyright/check`,
      method: 'GET',
    });
  }

  // Payments
  createPayment(data: any) {
    return this.request<any>({ url: '/payments/create', method: 'POST', data });
  }

  getPendingPayments() {
    return this.request<any[]>({ url: '/payments/pending', method: 'GET' });
  }

  approvePayment(id: string) {
    return this.request<any>({ url: `/payments/${id}/approve`, method: 'POST' });
  }

  rejectPayment(id: string) {
    return this.request<any>({ url: `/payments/${id}/reject`, method: 'POST' });
  }

  // Licensing & Transfer
  issueLicense(trackId: string, data: any) {
    return this.request<any>({ url: `/licensing/${trackId}/issue`, method: 'POST', data });
  }

  transferCopyright(trackId: string, data: any) {
    return this.request<any>({ url: `/transfer/${trackId}/transfer`, method: 'POST', data });
  }

  // Admin endpoints (examples)
  getPendingTracks() {
    return this.request<any[]>({ url: '/tracks/pending', method: 'GET' });
  }

  approveTrack(id: string) {
    return this.request<any>({ url: `/tracks/${id}/approve`, method: 'POST' });
  }

  rejectTrack(id: string) {
    return this.request<any>({ url: `/tracks/${id}/reject`, method: 'POST' });
  }

  // Add more endpoints as needed...
}

// Usage example (in a React component):
// import { ApiService } from '../services/apiService';
// const api = new ApiService({ getToken: () => localStorage.getItem('token') });
// api.getMyTracks().then(...)
