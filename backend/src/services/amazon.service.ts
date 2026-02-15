import axios, { AxiosInstance } from 'axios';
import logger from '../config/logger';

interface AmazonTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

interface AmazonOrder {
    AmazonOrderId: string;
    PurchaseDate: string;
    LastUpdateDate: string;
    OrderStatus: string;
    FulfillmentChannel: string;
    OrderTotal?: {
        CurrencyCode: string;
        Amount: string;
    };
    NumberOfItemsShipped: number;
    NumberOfItemsUnshipped: number;
    MarketplaceId: string;
}

interface AmazonOrdersResponse {
    payload: {
        Orders: AmazonOrder[];
        NextToken?: string;
    };
}

class AmazonService {
    private tokenUrl = 'https://api.amazon.com/auth/o2/token';
    private sandboxBaseUrl = 'https://sandbox.sellingpartnerapi-na.amazon.com';
    private productionBaseUrl = 'https://sellingpartnerapi-na.amazon.com';
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    private get baseUrl(): string {
        const cfg = require('../config/config').default;
        return cfg.nodeEnv === 'production' ? this.productionBaseUrl : this.sandboxBaseUrl;
    }

    private getConfig() {
        return require('../config/config').default;
    }

    /**
     * Get or refresh access token
     */
    private async getAccessToken(): Promise<string> {
        // Return cached token if still valid (with 5 min buffer)
        if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
            return this.accessToken;
        }

        logger.info('Refreshing Amazon access token...');

        try {
            const cfg = this.getConfig();
            const response = await axios.post<AmazonTokenResponse>(
                this.tokenUrl,
                new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: cfg.amazon.refreshToken,
                    client_id: cfg.amazon.clientId,
                    client_secret: cfg.amazon.clientSecret,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

            logger.info('Amazon access token refreshed successfully');
            return this.accessToken;
        } catch (error: any) {
            logger.error('Failed to refresh Amazon access token:', error.response?.data || error.message);
            throw new Error('Amazon authentication failed');
        }
    }

    /**
     * Create authenticated axios instance
     */
    private async createAuthenticatedClient(): Promise<AxiosInstance> {
        const token = await this.getAccessToken();

        return axios.create({
            baseURL: this.baseUrl,
            headers: {
                'x-amz-access-token': token,
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds
        });
    }

    /**
     * Get orders from Amazon within date range
     */
    async getOrders(startDate: Date, endDate?: Date): Promise<AmazonOrder[]> {
        try {
            const client = await this.createAuthenticatedClient();

            const cfg = this.getConfig();
            const params: any = {
                MarketplaceIds: cfg.amazon.marketplaceId,
                CreatedAfter: startDate.toISOString(),
            };

            if (endDate) {
                params.CreatedBefore = endDate.toISOString();
            }

            const response = await client.get<AmazonOrdersResponse>('/orders/v0/orders', { params });

            logger.info(`Fetched ${response.data.payload.Orders?.length || 0} orders from Amazon`);
            return response.data.payload.Orders || [];
        } catch (error: any) {
            logger.error('Failed to fetch Amazon orders:', error.response?.data || error.message);
            throw new Error('Failed to fetch orders from Amazon');
        }
    }

    /**
     * Get single order details (for sandbox testing)
     */
    async getOrderById(orderId: string): Promise<AmazonOrder> {
        try {
            const client = await this.createAuthenticatedClient();

            const response = await client.get(`/orders/v0/orders/${orderId}`);

            logger.info(`Fetched order ${orderId} from Amazon`);
            return response.data.payload;
        } catch (error: any) {
            logger.error(`Failed to fetch order ${orderId}:`, error.response?.data || error.message);
            throw new Error(`Failed to fetch order ${orderId} from Amazon`);
        }
    }

    /**
     * Get marketplace participation status
     */
    async getMarketplaceStatus(): Promise<any> {
        try {
            const client = await this.createAuthenticatedClient();

            const response = await client.get('/sellers/v1/marketplaceParticipations');

            logger.info('Fetched Amazon marketplace status');
            return response.data.payload;
        } catch (error: any) {
            logger.error('Failed to fetch marketplace status:', error.response?.data || error.message);
            throw new Error('Failed to fetch Amazon marketplace status');
        }
    }

    /**
     * Update inventory quantity (placeholder for future implementation)
     */
    async updateInventory(sku: string, quantity: number): Promise<void> {
        logger.warn('Amazon inventory sync not yet implemented');
        // TODO: Implement using Feeds API or Inventory API
        throw new Error('Inventory sync not yet implemented');
    }

    /**
     * Test Amazon connection
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.getMarketplaceStatus();
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default new AmazonService();
