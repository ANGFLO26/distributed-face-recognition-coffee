import { Platform } from 'react-native';

// Replace with your computer's IP address if running on real device
// For Android Emulator, use '10.0.2.2'
// For iOS Simulator, use 'localhost'
const DEV_API_URL = 'http://192.168.80.190:8889'; // Update this!

const getBaseUrl = () => {
    // You can add logic here to detect environment
    return DEV_API_URL;
};

export const api = {
    baseUrl: getBaseUrl(),

    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/api/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    },

    async recognize(base64Image) {
        try {
            const response = await fetch(`${this.baseUrl}/api/recognize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    request_type: 'RECOGNIZE',
                    image_data: base64Image,
                    branch_id: 'MOBILE_APP_01',
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Recognition failed:', error);
            throw error;
        }
    },

    async register(base64Image, name, order) {
        try {
            const response = await fetch(`${this.baseUrl}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    request_type: 'REGISTER',
                    image_data: base64Image,
                    customer_name: name,
                    order_details: order,
                    branch_id: 'MOBILE_APP_01',
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    },
};
