/* ========================================
   ABJ FOUNDATION CLIENT - HELP REQUEST FUNCTIONS
   ======================================== */

class RequestManager {
    static allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    static maxFileSize = 5 * 1024 * 1024;

    static init() {
        const form = document.getElementById('help-request-form');
        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.handleSubmit(form);
            });
        }
    }

    static async handleSubmit(form) {
        if (!AppManager.validateForm(form)) {
            return;
        }

        const fileInput = form.querySelector('input[name="document"]');
        const file = fileInput?.files?.[0] || null;
        const payload = {
            category: form.category.value,
            description: form.description.value.trim()
        };

        try {
            if (file && !this.allowedTypes.includes(file.type)) {
                throw new Error('Invalid file type. Use JPG, PNG, PDF, DOC, or DOCX.');
            }
            if (file && file.size > this.maxFileSize) {
                throw new Error('File too large. Maximum size is 5MB.');
            }

            AppManager.showLoading();
            let response;
            if (file) {
                const formData = new FormData();
                formData.append('category', payload.category);
                formData.append('description', payload.description);
                formData.append('document', file);
                response = await api.uploadHelpRequest(formData);
            } else {
                response = await api.createHelpRequest(payload);
            }

            AppManager.showAlert('Your help request has been submitted.', 'success');
            AppManager.redirectTo('/dashboard.html');
        } catch (error) {
            AppManager.showAlert(error.message || 'Unable to submit request', 'error');
        } finally {
            AppManager.hideLoading();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    RequestManager.init();
});
