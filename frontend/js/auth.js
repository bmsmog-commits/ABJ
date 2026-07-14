class AuthAPI {
  static baseURL = 'http://localhost:5000/api';

  static async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async getProfile() {
    return this.request('/auth/profile');
  }

  static async updateProfile(userData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  static async verifyEmail(token) {
    return this.request(`/auth/verify-email/${token}`);
  }

  static async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async resetPassword(token, password) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }
}

class AuthUI {
  static init() {
    this.bindEvents();
  }

  static bindEvents() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-password-form');
    const resetForm = document.getElementById('reset-password-form');
    const verifyState = document.getElementById('verify-email-state');

    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }

    if (signupForm) {
      signupForm.addEventListener('submit', this.handleSignup.bind(this));
    }

    if (forgotForm) {
      forgotForm.addEventListener('submit', this.handleForgotPassword.bind(this));
    }

    if (resetForm) {
      resetForm.addEventListener('submit', this.handleResetPassword.bind(this));
    }

    if (verifyState) {
      this.handleEmailVerification();
    }

    const resetFormEl = document.getElementById('reset-password-form');
    if (resetFormEl) {
      const tokenFromPath = window.location.pathname.split('/').filter(Boolean).pop();
      if (tokenFromPath && tokenFromPath !== 'reset-password.html') {
        resetFormEl.dataset.token = tokenFromPath;
      }
    }
  }

  static async handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const email = form.querySelector('#login-email').value;
    const password = form.querySelector('#login-password').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const data = await AuthAPI.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      this.showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } catch (error) {
      this.showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  }

  static async handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const password = form.querySelector('#signup-password').value;
    const confirmPassword = form.querySelector('#signup-password-confirm').value;

    if (password !== confirmPassword) {
      this.showToast('Passwords do not match', 'error');
      return;
    }

    const userData = {
      name: form.querySelector('#signup-name').value,
      email: form.querySelector('#signup-email').value,
      password,
      phone: form.querySelector('#signup-phone').value,
      country: form.querySelector('#signup-country').value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const data = await AuthAPI.register(userData);
      this.showToast(data.message || 'Account created successfully. Please check your email to verify your account.', 'success');
      setTimeout(() => {
        window.location.href = 'verify-email.html';
      }, 1500);
    } catch (error) {
      this.showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  }

  static async handleForgotPassword(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = form.querySelector('#forgot-email').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const data = await AuthAPI.forgotPassword(email);
      this.showToast(data.message || 'Password reset instructions sent.', 'success');
    } catch (error) {
      this.showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Reset Link';
    }
  }

  static async handleResetPassword(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const password = form.querySelector('#new-password').value;
    const confirmPassword = form.querySelector('#confirm-password').value;
    const token = form.dataset.token || new URLSearchParams(window.location.search).get('token') || window.location.pathname.split('/').pop();

    if (password !== confirmPassword) {
      this.showToast('Passwords do not match', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';

    try {
      const data = await AuthAPI.resetPassword(token, password);
      this.showToast(data.message || 'Password reset successful.', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } catch (error) {
      this.showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reset Password';
    }
  }

  static async handleEmailVerification() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || window.location.pathname.split('/').filter(Boolean).pop();
    const state = document.getElementById('verify-email-state');

    if (!token || !state) return;

    state.textContent = 'Verifying your email...';

    try {
      const data = await AuthAPI.verifyEmail(token);
      state.textContent = data.message || 'Email verified successfully ✅';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } catch (error) {
      state.textContent = error.message || 'Verification failed.';
    }
  }

  static showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 20);
    setTimeout(() => toast.classList.remove('visible'), 5200);
    setTimeout(() => toast.remove(), 5800);
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }
}

document.addEventListener('DOMContentLoaded', () => AuthUI.init());