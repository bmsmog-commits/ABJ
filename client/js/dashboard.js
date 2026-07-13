/* ========================================
   ABJ FOUNDATION CLIENT - DASHBOARD FUNCTIONS
   ======================================== */

class DashboardManager {
    static async init() {
        if (!await AuthManager.requireAuth()) return;
        this.renderUser();
        await this.loadStats();
        await this.loadRecentDonations();
        await this.loadRecentRequests();
    }

    static renderUser() {
        const user = AuthManager.getUser();
        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName && user) {
            welcomeName.textContent = `Welcome, ${user.name}`;
        }
    }

    static async loadStats() {
        try {
            AppManager.showLoading();
            const stats = await api.getDashboardStats();
            document.getElementById('total-donations').textContent = `$${stats.totalDonations || 0}`;
            document.getElementById('help-requests-count').textContent = stats.totalHelpRequests || 0;
            document.getElementById('approved-help').textContent = `$${stats.approvedHelpAmount || 0}`;
            document.getElementById('impact-score').textContent = stats.impactScore || 0;
        } catch (error) {
            AppManager.showAlert('Unable to load dashboard stats.', 'error');
        } finally {
            AppManager.hideLoading();
        }
    }

    static async loadRecentDonations() {
        try {
            const response = await api.getDonations();
            const list = document.getElementById('donations-list');
            if (!list) return;
            const donations = response.donations || [];
            if (!donations.length) {
                list.innerHTML = '<div class="empty-state">No donations recorded yet.</div>';
                return;
            }
            list.innerHTML = donations.slice(0, 5).map((donation) => `
                <div class="activity-card">
                    <div>
                        <strong>${donation.currency} ${donation.amount}</strong>
                        <p>${donation.gateway.toUpperCase()} • ${new Date(donation.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span class="badge badge-success">${donation.status}</span>
                </div>
            `).join('');
        } catch (error) {
            AppManager.showAlert('Unable to load donation history.', 'error');
        }
    }

    static async loadRecentRequests() {
        try {
            const response = await api.getHelpRequests();
            const list = document.getElementById('requests-list');
            if (!list) return;
            const requests = response.requests || [];
            if (!requests.length) {
                list.innerHTML = '<div class="empty-state">No help requests yet.</div>';
                return;
            }
            list.innerHTML = requests.slice(0, 5).map((request) => `
                <div class="activity-card">
                    <div>
                        <strong>${request.category}</strong>
                        <p>${request.description.substring(0, 80)}...</p>
                    </div>
                    <span class="badge badge-${request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}">${request.status}</span>
                </div>
            `).join('');
        } catch (error) {
            AppManager.showAlert('Unable to load help requests.', 'error');
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    DashboardManager.init();
});
