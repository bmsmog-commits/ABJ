const App = {
  init() {
    this.cacheElements();
    this.bindEvents();
    this.initTheme();
    this.initTestimonialSlider();
    this.initScrollAnimations();
    this.initAccordion();
  },

  cacheElements() {
    this.navToggle = document.querySelector('.nav-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    this.header = document.querySelector('.site-header');
    this.newsletterForm = document.querySelector('#newsletter-form');
    this.testimonialSlider = document.querySelector('#testimonial-slider');
    this.prevSlide = document.querySelector('.slider-button.prev');
    this.nextSlide = document.querySelector('.slider-button.next');
    this.accordionButtons = document.querySelectorAll('.accordion-button');
    this.forms = document.querySelectorAll('form');
    this.themeToggle = document.querySelector('#theme-toggle');
  },

  bindEvents() {
    if (this.navToggle && this.navMenu) {
      this.navToggle.addEventListener('click', () => {
        const open = this.navMenu.classList.toggle('open');
        this.navToggle.setAttribute('aria-expanded', open);
      });
    }

    if (this.newsletterForm) {
      this.newsletterForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this.handleNewsletterSubmit();
      });
    }

    this.forms.forEach((form) => {
      if (!form.classList.contains('no-validate')) {
        form.addEventListener('submit', (event) => {
          if (!this.validateForm(form)) {
            event.preventDefault();
          }
        });
      }
    });

    window.addEventListener('scroll', () => this.toggleStickyHeader());

    if (this.prevSlide) {
      this.prevSlide.addEventListener('click', () => this.changeSlide(-1));
    }

    if (this.nextSlide) {
      this.nextSlide.addEventListener('click', () => this.changeSlide(1));
    }
  },

  validateForm(form) {
    const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
    let valid = true;

    fields.forEach((field) => {
      field.classList.remove('invalid');
      const error = field.parentElement.querySelector('.field-error');
      if (error) error.remove();

      if (!field.value.trim()) {
        this.showFieldError(field, 'This field is required');
        valid = false;
        return;
      }

      if (field.type === 'email' && !this.isValidEmail(field.value.trim())) {
        this.showFieldError(field, 'Please enter a valid email address');
        valid = false;
      }

      if (field.type === 'file' && field.files.length) {
        const file = field.files[0];
        const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024;
        if (!allowed.includes(file.type)) {
          this.showFieldError(field, 'Allowed file types: JPG, PNG, PDF, DOC, DOCX');
          valid = false;
        }
        if (file.size > maxSize) {
          this.showFieldError(field, 'Maximum file size is 5MB');
          valid = false;
        }
      }
    });

    return valid;
  },

  showFieldError(field, message) {
    field.classList.add('invalid');
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    field.parentElement.appendChild(error);
  },

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  handleNewsletterSubmit() {
    const emailField = document.querySelector('#newsletter-email');
    if (!emailField || !this.isValidEmail(emailField.value.trim())) {
      this.showToast('Please enter a valid email address', 'error');
      return;
    }

    emailField.value = '';
    this.showToast('Thank you for joining our newsletter!');
  },

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 20);
    setTimeout(() => toast.classList.remove('visible'), 5200);
    setTimeout(() => toast.remove(), 5800);
  },

  toggleStickyHeader() {
    if (!this.header) return;
    if (window.scrollY > 30) {
      this.header.classList.add('sticky');
    } else {
      this.header.classList.remove('sticky');
    }
  },

  initTestimonialSlider() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.testimonial-card');
    if (!this.slides.length) return;
    this.updateSlider();
    this.sliderInterval = setInterval(() => this.changeSlide(1), 6000);
  },

  changeSlide(direction) {
    if (!this.slides) return;
    this.currentSlide = (this.currentSlide + direction + this.slides.length) % this.slides.length;
    this.updateSlider();
  },

  updateSlider() {
    this.slides.forEach((slide, index) => {
      slide.style.transform = `translateX(${100 * (index - this.currentSlide)}%)`;
      slide.style.opacity = index === this.currentSlide ? '1' : '0.35';
      slide.style.pointerEvents = index === this.currentSlide ? 'auto' : 'none';
    });
  },

  initAccordion() {
    const accordionButtons = document.querySelectorAll('.accordion-button');
    if (!accordionButtons.length) return;

    accordionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        button.classList.toggle('active');
        const panel = button.nextElementSibling;
        if (panel) {
          if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
          } else {
            panel.style.maxHeight = panel.scrollHeight + 'px';
          }
        }
      });
    });
  },

  initScrollAnimations() {
    const sections = document.querySelectorAll('.section, .campaign-card, .testimonial-card, .newsletter-card, .stat-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    sections.forEach((section) => observer.observe(section));
  },

  // Theme management
  initTheme() {
    this.detectTheme();
    this.bindThemeEvents();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  },

  detectTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;

    this.setTheme(theme);
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update theme toggle button if it exists
    if (this.themeToggle) {
      this.themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      this.themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  },

  bindThemeEvents() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
