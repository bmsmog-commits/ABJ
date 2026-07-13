/* ========================================
   ABJ FOUNDATION CLIENT - NOTIFICATIONS FUNCTIONS
   ======================================== */

class NotificationManager {
    static page = 1;

    static init() {
        this.loadNotifications();
        const button = document.getElementById('load-more-notifications');
        button?.addEventListener('click', () => {
            this.page += 1;
            this.loadNotifications(this.page);
        });
    }

    static async loadNotifications(page = 1) {
        if (!AuthManager.isAuthenticated()) {
            return;
        }

        try {
            AppManager.showLoading();
            const response = await api.getNotifications(page, 10);
            this.renderNotifications(response.notifications || []);
            const badge = document.getElementById('notification-badge');
            if (badge) {
                const unread = (response.notifications || []).filter((item) => !item.read).length;
                badge.textContent = unread > 9 ? '9+' : unread;
                badge.style.display = unread ? 'inline-flex' : 'none';
            }
        } catch (error) {
            console.error(error);
            AppManager.showAlert('Unable to load notifications.', 'error');
        } finally {
            AppManager.hideLoading();
        }
    }

    static renderNotifications(notifications) {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        if (!notifications.length) {
            container.innerHTML = '<div class="empty-state">You have no notifications yet.</div>';
            return;
        }

        container.innerHTML = notifications
            .map((notification) => {
                const unreadClass = notification.read ? '' : 'notification-unread';
                return `
                    <div class="notification-card ${unreadClass}">
                        <div>
                            <strong>${notification.title}</strong>
                            <p>${notification.message}</p>
                            <small>${new Date(notification.createdAt).toLocaleString()}</small>
                        </div>
                        <div class="notification-actions">
                            ${notification.read ? '' : `<button type="button" class="btn btn-sm" data-action="read" data-id="${notification._id}">Mark read</button>`}
                            <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-id="${notification._id}">Delete</button>
                        </div>
                    </div>
                `;
            })
            .join('');

        container.querySelectorAll('[data-action]')?.forEach((button) => {
            button.addEventListener('click', async (event) => {
                const action = event.target.dataset.action;
                const id = event.target.dataset.id;
                if (action === 'read') {
                    await this.markAsRead(id);
                }
                if (action === 'delete') {
                    await this.delete(id);
                }
            });
        });
    }

    static async markAsRead(id) {
        try {
            await api.markNotificationRead(id);
            await this.loadNotifications(this.page);
        } catch (error) {
            AppManager.showAlert('Unable to mark notification as read.', 'error');
        }
    }

    static async delete(id) {
        try {
            await api.deleteNotification(id);
            await this.loadNotifications(this.page);
        } catch (error) {
            AppManager.showAlert('Unable to delete notification.', 'error');
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    NotificationManager.init();
});
