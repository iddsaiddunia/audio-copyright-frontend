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
    return this.request<{ token: string; user: any }>({
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

  logout() {
    return this.request<{ message: string }>({
      url: '/auth/logout',
      method: 'POST',
    });
  }

  getProfile() {
    return this.request<any>({
      url: '/auth/me',
      method: 'GET',
    });
  }

  // Track endpoints
  uploadTrack(audio: File) {
    const formData = new FormData();
    formData.append('audio', audio);
    return this.request<any>({
      url: '/tracks/upload',
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData,
    });
  }

  getMyTracks() {
    return this.request<any[]>({ url: '/tracks/my', method: 'GET' });
  }

  getPendingTracks() {
    return this.request<any[]>({ url: '/tracks/pending', method: 'GET' });
  }

  getTrackById(id: string) {
    return this.request<any>({ url: `/tracks/${id}`, method: 'GET' });
  }

  approveTrack(id: string) {
    return this.request<any>({ url: `/tracks/${id}/approve`, method: 'POST' });
  }

  rejectTrack(id: string) {
    return this.request<any>({ url: `/tracks/${id}/reject`, method: 'POST' });
  }

  checkTrackCopyright(id: string) {
    return this.request<{ fingerprint: string; registered: boolean }>({
      url: `/tracks/${id}/copyright/check`,
      method: 'GET',
    });
  }

  publishTrackCopyright(id: string) {
    return this.request<{ message: string; txHash: string }>({
      url: `/tracks/${id}/publish`,
      method: 'POST',
    });
  }

  // Payments
  createRegistrationPayment(data: any) {
    return this.request<any>({ url: '/payments/create', method: 'POST', data });
  }

  createTransferPayment(data: any) {
    return this.request<any>({ url: '/payments/transfer/create', method: 'POST', data });
  }

  createLicensingPayment(data: any) {
    return this.request<any>({ url: '/payments/licensing/create', method: 'POST', data });
  }

  getArtistPayments() {
    return this.request<any[]>({ url: '/payments/artist/all', method: 'GET' });
  }

  getAllPayments() {
    return this.request<any[]>({ url: '/payments/all', method: 'GET' });
  }

  approvePayment(id: string) {
    return this.request<any>({ url: `/payments/${id}/approve`, method: 'POST' });
  }

  rejectPayment(id: string) {
    return this.request<any>({ url: `/payments/${id}/reject`, method: 'POST' });
  }

  generateInvoice(id: string) {
    return this.request<any>({ url: `/payments/${id}/invoice`, method: 'POST' });
  }

  // Licensing & Transfer
  issueLicense(trackId: string, data: any) {
    return this.request<any>({ url: `/licensing/${trackId}/issue`, method: 'POST', data });
  }

  transferCopyright(trackId: string) {
    return this.request<any>({ url: `/transfer/${trackId}/transfer`, method: 'POST' });
  }

  // Artist admin endpoints
  getArtists() {
    return this.request<any[]>({ url: '/artists/', method: 'GET' });
  }

  approveArtist(id: string) {
    return this.request<any>({ url: `/artists/${id}/approve`, method: 'POST' });
  }

  rejectArtist(id: string) {
    return this.request<any>({ url: `/artists/${id}/reject`, method: 'POST' });
  }

  // User endpoints
  getCurrentUser() {
    return this.request<any>({ url: '/users/me', method: 'GET' });
  }

  listUsers() {
    return this.request<any[]>({ url: '/users', method: 'GET' });
  }

  createAdminUser(data: any) {
    return this.request<any>({ url: '/users', method: 'POST', data });
  }

  updateUser(id: string, data: any) {
    return this.request<any>({ url: `/users/${id}`, method: 'PUT', data });
  }

  updateUserStatus(id: string, data: any) {
    return this.request<any>({ url: `/users/${id}/status`, method: 'PUT', data });
  }

  verifyArtist(id: string) {
    return this.request<any>({ url: `/users/${id}/verify`, method: 'PUT' });
  }

  deleteUser(id: string) {
    return this.request<any>({ url: `/users/${id}`, method: 'DELETE' });
  }

  // Health check
  healthCheck() {
    return this.request<{ status: string; message: string }>({ url: '/health', method: 'GET' });
  }

  // Add more endpoints as needed...
}

// Usage example (in a React component):
// import { ApiService } from '../services/apiService';
// const api = new ApiService({ getToken: () => localStorage.getItem('token') });
// api.getMyTracks().then(...)
