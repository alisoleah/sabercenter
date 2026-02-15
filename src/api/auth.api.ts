import apiClient, { setAccessToken } from './client';

interface RegisterData {
    fullName: string;
    phoneNumber: string;
    email?: string;
    password: string;
    governorate?: string;
}

interface LoginData {
    phoneNumber: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: string;
            fullName: string;
            phoneNumber: string;
            email: string | null;
            role: string;
            governorate: string | null;
        };
        accessToken: string;
        // refreshToken is in HttpOnly cookie
    };
}

interface UserResponse {
    success: boolean;
    data: {
        id: string;
        fullName: string;
        phoneNumber: string;
        email: string | null;
        role: string;
        governorate: string | null;
    };
}

export const authApi = {
    /**
     * Register new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/register', data);

        // Store access token
        if (response.data.success) {
            setAccessToken(response.data.data.accessToken);
        }

        return response.data;
    },

    /**
     * Login user
     */
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/api/auth/login', data);

        // Store access token
        if (response.data.success) {
            setAccessToken(response.data.data.accessToken);
        }

        return response.data;
    },

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        await apiClient.post('/api/auth/logout');
        setAccessToken(null);
    },

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<UserResponse> {
        const response = await apiClient.get<UserResponse>('/api/auth/me');
        return response.data;
    },

    /**
     * Refresh access token (refresh token sent via cookie automatically)
     */
    async refreshToken(): Promise<{ accessToken: string }> {
        const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {});

        if (response.data.success) {
            setAccessToken(response.data.data.accessToken);
            return { accessToken: response.data.data.accessToken };
        }

        throw new Error('Token refresh failed');
    },
};
