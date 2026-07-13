/* ========================================
   ABJ FOUNDATION CLIENT - API HELPER
   ======================================== */

const API_BASE_URL = 'http://localhost:5000/api';

class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    getAuthHeader() {
        const token = localStorage.getItem('token');
        return {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json'
        };
    }

    async handleResponse(response) {
        const contentType = response.headers.get('Content-Type') || '';
        const data = contentType.includes('application/json') ? await response.json() : null;

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            }
            const message = data?.message || data?.error || response.statusText || 'API Error';
            throw new Error(message);
        }

        return data;
    }

    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        const response = await fetch(url, options);
        return this.handleResponse(response);
    }

    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET',
            headers: this.getAuthHeader()
        });
    }

    async post(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });
    }

    async postAuth(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'POST',
            headers: this.getAuthHeader(),
            body: JSON.stringify(body)
        });
    }

    async put(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            headers: this.getAuthHeader(),
            body: JSON.stringify(body)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
            headers: this.getAuthHeader()
        });
    }

    async uploadFile(endpoint, formData) {
        const token = localStorage.getItem('token');
        return this.request(endpoint, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData
        });
    }

    login(email, password) {
        return this.post('/auth/login', { email, password });
    }

    register(userData) {
        return this.post('/auth/register', userData);
    }

    getProfile() {
        return this.get('/users/profile');
    }

    updateProfile(userData) {
        return this.put('/users/profile', userData);
    }

    changePassword(oldPassword, newPassword) {
        return this.postAuth('/users/change-password', { oldPassword, newPassword });
    }

    createDonation(donationData) {
        return this.post('/donations', donationData);
    }

    getDonations() {
        return this.get('/donations');
    }

    getDonation(id) {
        return this.get(`/donations/${id}`);
    }

    createHelpRequest(payload) {
        return this.postAuth('/requests', payload);
    }

    uploadHelpRequest(formData) {
        return this.uploadFile('/requests', formData);
    }

    getHelpRequests() {
        return this.get('/requests');
    }

    getHelpRequest(id) {
        return this.get(`/requests/${id}`);
    }

    getNotifications(page = 1, limit = 10) {
        return this.get(`/notifications?page=${page}&limit=${limit}`);
    }

    markNotificationRead(id) {
        return this.put(`/notifications/${id}`, { read: true });
    }

    markAllNotificationsRead() {
        return this.postAuth('/notifications/mark-all-read', {});
    }

    deleteNotification(id) {
        return this.delete(`/notifications/${id}`);
    }

    getDashboardStats() {
        return this.get('/dashboard/stats');
    }
}

const api = new APIClient();
