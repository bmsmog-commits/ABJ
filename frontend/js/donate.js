class DonationAPI {
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

  static async createDonation(donationData) {
    return this.request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  static async getMyDonations() {
    return this.request('/donations/mine');
  }
}

class DonationUI {
  static init() {
    this.bindEvents();
  }

  static bindEvents() {
    const donationForm = document.getElementById('donation-form');

    if (donationForm) {
      donationForm.addEventListener('submit', this.handleDonation.bind(this));
    }
  }

  static async handleDonation(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const donationData = {
      name: form.querySelector('#donor-name').value,
      email: form.querySelector('#donor-email').value,
      amount: parseFloat(form.querySelector('#donation-amount').value),
      currency: form.querySelector('#donation-currency').value,
      gateway: form.querySelector('input[name="gateway"]:checked').value,
    };

    if (donationData.amount < 1) {
      this.showToast('Please enter a valid donation amount', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
      const data = await DonationAPI.createDonation(donationData);

      this.showToast('Donation initiated! Redirecting to payment...', 'success');

      // Redirect to payment URL
      setTimeout(() => {
        window.location.href = data.paymentUrl;
      }, 1500);

    } catch (error) {
      this.showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Donate';
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

document.addEventListener('DOMContentLoaded', () => DonationUI.init());