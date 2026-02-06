import axios, { AxiosInstance } from 'axios';
import { CodeAnalysisRequest, FeedbackRequest, ScanResult, HealthStatus } from '../types';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 2 minutes for ML inference
    });

    // Add auth token interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        throw error;
      }
    );
  }

  async getHealth(): Promise<HealthStatus> {
    const response = await this.client.get<HealthStatus>('/health');
    return response.data;
  }

  async analyzeCode(request: CodeAnalysisRequest): Promise<ScanResult> {
    const response = await this.client.post<ScanResult>('/detect', request);
    return response.data;
  }

  async analyzeBatch(files: CodeAnalysisRequest[]): Promise<ScanResult[]> {
    const response = await this.client.post<ScanResult[]>('/detect/batch', { files });
    return response.data;
  }

  async submitFeedback(feedback: FeedbackRequest): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post('/feedback', feedback);
    return response.data;
  }

  async getLanguages(): Promise<{ languages: string[]; default: string }> {
    const response = await this.client.get('/detect/languages');
    return response.data;
  }

  async getVulnerabilityTypes(): Promise<{ vulnerability_types: any[] }> {
    const response = await this.client.get('/detect/vulnerability-types');
    return response.data;
  }

  // User history endpoints
  async getUserHistory(): Promise<{ scans: ScanResult[]; total: number }> {
    const response = await this.client.get('/history');
    return response.data;
  }

  async clearUserHistory(): Promise<{ success: boolean; deleted: number }> {
    const response = await this.client.delete('/history');
    return response.data;
  }

  async deleteScan(scanId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete(`/history/${scanId}`);
    return response.data;
  }
}

export const apiService = new ApiService();
