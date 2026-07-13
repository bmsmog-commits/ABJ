class HelpAPI {
  static baseURL = 'https://abj-production-375a.up.railway.app/api';

  static async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
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

  static async createHelpRequest(formData) {
    return this.request('/requests', {
      method: 'POST',
      body: formData,
    });
  }

  static async getMyRequests() {
    return this.request('/requests/mine');
  }
}

class HelpUI {
  static init() {
    this.bindEvents();
  }

  static bindEvents() {
    const helpForm = document.getElementById('help-request-form');

    if (helpForm) {
      helpForm.addEventListener('submit', this.handleHelpRequest.bind(this));
    }
  }

  static async handleHelpRequest(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const formData = new FormData();
    formData.append('name', form.querySelector('#help-name').value);
    formData.append('email', form.querySelector('#help-email').value);
    formData.append('phone', form.querySelector('#help-phone').value);
    formData.append('country', form.querySelector('#help-country').value);
    formData.append('category', form.querySelector('#help-category').value);
    formData.append('description', form.querySelector('#help-description').value);

    const fileInput = form.querySelector('#help-file');
    if (fileInput.files[0]) {
      formData.append('document', fileInput.files[0]);
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const data = await HelpAPI.createHelpRequest(formData);

      this.showToast('Help request submitted successfully! We will review it soon.', 'success');

      // Reset form
      form.reset();

    } catch (error) {
      this.showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Request';
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
}

document.addEventListener('DOMContentLoaded', () => HelpUI.init());