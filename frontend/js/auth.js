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
}

class AuthUI {
  static init() {
    this.bindEvents();
  }

  static bindEvents() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }

    if (signupForm) {
      signupForm.addEventListener('submit', this.handleSignup.bind(this));
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      this.showToast('Account created successfully! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } catch (error) {
      this.showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
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