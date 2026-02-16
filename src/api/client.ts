import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true, // Important: Send cookies (refresh token)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Store access token in memory (not localStorage for security)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

// CSRF Token Management
let csrfToken: string | null = null;

export const fetchCsrfToken = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/csrf-token`, {
            withCredentials: true
        });
        csrfToken = response.data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token', error);
        return null;
    }
};

// Request interceptor: Add access token and CSRF token to headers
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Add Authorization header
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Add CSRF token for mutation requests
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '') && config.headers) {
            if (!csrfToken) {
                await fetchCsrfToken();
            }
            if (csrfToken) {
                config.headers['x-csrf-token'] = csrfToken;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint (refresh token sent automatically via cookie)
                const response = await axios.post(
                    `${API_BASE_URL}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = response.data.data.accessToken;
                setAccessToken(newAccessToken);

                // Retry original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, user needs to login again
                setAccessToken(null);
                // Don't force redirect, let the UI handle the error (e.g. show login modal)
                // window.location.href = '/'; 
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
