/* ========================================
   ABJ FOUNDATION CLIENT - APP FUNCTIONS
   ======================================== */

class AppManager {
    static init() {
        this.setupEventListeners();
        this.syncNavState();
        this.setupMobileMenu();
        this.renderNotificationBadge();
        this.initTheme();
    }

    static setupEventListeners() {
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.matches('.validate-form')) {
                if (!this.validateForm(form)) {
                    event.preventDefault();
                    return;
                }
            }
        });

        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                if (!this.validateForm(contactForm)) {
                    return;
                }
                await this.handleContactForm(contactForm);
            });
        }

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                if (!this.validateForm(loginForm)) {
                    return;
                }
                await AuthManager.login(loginForm.email.value.trim(), loginForm.password.value.trim());
            });
        }

        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                if (!this.validateForm(signupForm)) {
                    return;
                }

                const password = signupForm.password.value.trim();
                const confirmPassword = signupForm.confirmPassword?.value.trim();
                if (password !== confirmPassword) {
                    this.showAlert('Passwords do not match', 'error');
                    return;
                }

                await AuthManager.register({
                    name: signupForm.name.value.trim(),
                    email: signupForm.email.value.trim(),
                    password,
                    country: signupForm.country.value,
                    phone: signupForm.phone.value.trim()
                });
            });
        }

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.navbar') && window.innerWidth < 900) {
                const menu = document.querySelector('.navbar-menu');
                if (menu) {
                    menu.classList.remove('open');
                }
            }
        });

        document.querySelectorAll('#theme-toggle')?.forEach((button) => {
            button.addEventListener('click', () => {
                this.toggleTheme();
            });
        });
    }

    static setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const menu = document.querySelector('.navbar-menu');
        if (hamburger && menu) {
            hamburger.addEventListener('click', () => {
                menu.classList.toggle('open');
            });
        }
    }

    static showAlert(message, type = 'info', duration = 5000) {
        const container = document.getElementById('alerts-container') || this.createAlertsContainer();
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button type="button" class="alert-close" aria-label="Close">&times;</button>
        `;
        container.appendChild(alert);

        alert.querySelector('.alert-close')?.addEventListener('click', () => alert.remove());

        if (duration > 0) {
            setTimeout(() => alert.remove(), duration);
        }
    }

    static createAlertsContainer() {
        const container = document.createElement('div');
        container.id = 'alerts-container';
        document.body.appendChild(container);
        return container;
    }

    static showLoading() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.remove('hidden');
        }
    }

    static hideLoading() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    static redirectTo(url, delay = 600) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    }

    static validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input, select, textarea');

        fields.forEach((field) => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    static validateField(field) {
        if (!field.closest('form')) return true;
        const value = field.value.trim();
        const type = field.type;
        const isRequired = field.hasAttribute('required');
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true;

        formGroup.classList.remove('error');
        formGroup.querySelector('.field-error')?.remove();

        if (isRequired && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }

        if (type === 'tel' && value) {
            const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
            if (!phoneRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
        }

        if (type === 'number' && value) {
            const numberValue = parseFloat(value);
            if (isNaN(numberValue) || numberValue <= 0) {
                this.showFieldError(field, 'Please enter a valid number');
                return false;
            }
        }

        return true;
    }

    static showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        formGroup.classList.add('error');
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        formGroup.appendChild(error);
    }

    static initTheme() {
        this.detectTheme();
        this.bindThemeEvents();

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    static detectTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemTheme;

        this.setTheme(theme);
    }

    static setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update theme toggle button if it exists
        const themeToggle = document.querySelector('#theme-toggle');
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
            themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    static toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    static bindThemeEvents() {
        const themeToggle = document.querySelector('#theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    static syncNavState() {
        const user = AuthManager.getUser();
        const authLinks = document.querySelectorAll('.auth-only');
        const guestLinks = document.querySelectorAll('.guest-only');

        authLinks.forEach((item) => {
            item.style.display = user ? 'flex' : 'none';
        });

        guestLinks.forEach((item) => {
            item.style.display = user ? 'none' : 'flex';
        });

        const userName = document.getElementById('navbar-user-name');
        if (userName && user) {
            userName.textContent = user.name || 'Member';
        }
    }

    static async renderNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        if (!badge || !AuthManager.isAuthenticated()) return;

        try {
            const response = await api.getNotifications(1, 50);
            const unread = Array.isArray(response.notifications)
                ? response.notifications.filter((item) => !item.read).length
                : 0;
            if (unread > 0) {
                badge.textContent = unread > 9 ? '9+' : unread;
                badge.style.display = 'inline-flex';
            }
        } catch (error) {
            console.warn('Unable to load notification badge', error);
        }
    }

    static async handleContactForm(form) {
        const payload = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim()
        };

        try {
            AppManager.showLoading();
            await api.post('/contact', payload);
            AppManager.showAlert('Your message has been sent. We will get back to you shortly.', 'success');
            form.reset();
        } catch (error) {
            AppManager.showAlert(error.message || 'Failed to send your message', 'error');
        } finally {
            AppManager.hideLoading();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    AppManager.init();
});
