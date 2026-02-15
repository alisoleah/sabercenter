/**
 * Concurrency Test for Order Creation
 * 
 * This test simulates multiple concurrent requests attempting to purchase
 * the last available unit of a product to verify race condition prevention.
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';
const TEST_PRODUCT_ID = 'test-product-uuid'; // Replace with actual product ID
const TEST_USER_TOKEN = 'Bearer test-token'; // Replace with actual auth token

interface OrderRequest {
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    deliveryMethod: string;
    deliveryAddress: string;
    paymentMethod: string;
}

async function createOrder(orderData: OrderRequest, requestId: number) {
    try {
        const response = await axios.post(`${API_BASE}/orders`, orderData, {
            headers: {
                'Authorization': TEST_USER_TOKEN,
                'Content-Type': 'application/json',
            },
        });
        console.log(`✅ Request ${requestId}: Order created successfully`);
        return { success: true, requestId, data: response.data };
    } catch (error: any) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('Insufficient stock')) {
            console.log(`❌ Request ${requestId}: Correctly rejected (Insufficient stock)`);
            return { success: false, requestId, reason: 'insufficient_stock' };
        }
        console.error(`❌ Request ${requestId}: Failed with error:`, error.response?.data || error.message);
        return { success: false, requestId, reason: 'error', error: error.message };
    }
}

async function runConcurrencyTest() {
    console.log('--- Starting Concurrency Test ---');
    console.log('Simulating 5 concurrent requests for the same product...\n');

    const orderData: OrderRequest = {
        items: [
            {
                productId: TEST_PRODUCT_ID,
                quantity: 1,
            },
        ],
        deliveryMethod: 'delivery',
        deliveryAddress: '123 Test Street, Test City',
        paymentMethod: 'cash',
    };

    // Create 5 concurrent requests
    const requests = Array.from({ length: 5 }, (_, i) =>
        createOrder(orderData, i + 1)
    );

    const results = await Promise.all(requests);

    console.log('\n--- Test Results ---');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Successful orders: ${successful}`);
    console.log(`Rejected orders: ${failed}`);

    if (successful === 1 && failed === 4) {
        console.log('\n✅ TEST PASSED: Exactly one order succeeded, race condition prevented!');
    } else if (successful > 1) {
        console.log('\n❌ TEST FAILED: Multiple orders succeeded, race condition detected!');
    } else {
        console.log('\n⚠️  TEST INCONCLUSIVE: No orders succeeded (check stock availability)');
    }
}

// Note: This test requires:
// 1. Backend server running on localhost:3000
// 2. Valid product ID with limited stock (ideally 1 unit)
// 3. Valid authentication token
console.log('⚠️  Manual Setup Required:');
console.log('1. Update TEST_PRODUCT_ID with a real product UUID');
console.log('2. Update TEST_USER_TOKEN with a valid auth token');
console.log('3. Ensure the product has exactly 1 unit in stock');
console.log('4. Run: npx ts-node src/test-order-concurrency.ts\n');

// Uncomment to run:
// runConcurrencyTest();
