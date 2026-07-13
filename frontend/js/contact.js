class ContactAPI {
  static baseURL = 'https://abj-production-375a.up.railway.app/api';

  static async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

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

  static async submitContactMessage(contactData) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }
}

class ContactUI {
  static init() {
    this.bindEvents();
  }

  static bindEvents() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
      contactForm.addEventListener('submit', this.handleContactSubmit.bind(this));
    }
  }

  static async handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const contactData = {
      name: form.querySelector('#contact-name').value,
      email: form.querySelector('#contact-email').value,
      phone: form.querySelector('#contact-phone').value,
      subject: form.querySelector('#contact-subject').value,
      message: form.querySelector('#contact-message').value,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const data = await ContactAPI.submitContactMessage(contactData);

      this.showToast('Message sent successfully! We will get back to you soon.', 'success');

      // Reset form
      form.reset();

    } catch (error) {
      this.showToast(error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
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

document.addEventListener('DOMContentLoaded', () => ContactUI.init());