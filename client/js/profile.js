/* ========================================
   ABJ FOUNDATION CLIENT - PROFILE FUNCTIONS
   ======================================== */

class ProfileManager {
    static init() {
        const form = document.getElementById('profile-form');
        const passwordForm = document.getElementById('password-form');
        const avatarInput = document.getElementById('avatar');

        this.populateProfile();

        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.handleUpdate(form);
            });
        }

        if (passwordForm) {
            passwordForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.handlePasswordChange(passwordForm);
            });
        }

        if (avatarInput) {
            avatarInput.addEventListener('change', async () => {
                await this.uploadAvatar(avatarInput.files[0]);
            });
        }
    }

    static populateProfile() {
        const user = AuthManager.getUser();
        if (!user) return;

        document.getElementById('profile-name')?.setAttribute('value', user.name || '');
        document.getElementById('profile-email')?.setAttribute('value', user.email || '');
        document.getElementById('profile-country')?.value = user.country || '';
        document.getElementById('profile-phone')?.setAttribute('value', user.phone || '');
        document.getElementById('profile-bio')?.textContent = user.bio || '';
        if (user.avatar) {
            document.getElementById('current-avatar')?.setAttribute('src', user.avatar);
        }
    }

    static async handleUpdate(form) {
        if (!AppManager.validateForm(form)) {
            return;
        }

        const userData = {
            name: form.name.value.trim(),
            country: form.country.value,
            phone: form.phone.value.trim(),
            bio: form.bio.value.trim()
        };

        try {
            AppManager.showLoading();
            const response = await api.updateProfile(userData);
            if (response?.user) {
                AuthManager.saveUser(response.user);
            }
            AppManager.showAlert('Profile updated successfully.', 'success');
        } catch (error) {
            AppManager.showAlert(error.message || 'Failed to update profile', 'error');
        } finally {
            AppManager.hideLoading();
        }
    }

    static async handlePasswordChange(form) {
        if (!AppManager.validateForm(form)) {
            return;
        }

        const oldPassword = form.currentPassword.value.trim();
        const newPassword = form.newPassword.value.trim();
        const confirmPassword = form.confirmPassword.value.trim();

        if (newPassword !== confirmPassword) {
            AppManager.showAlert('Passwords do not match.', 'error');
            return;
        }

        try {
            AppManager.showLoading();
            await api.changePassword(oldPassword, newPassword);
            AppManager.showAlert('Password changed successfully.', 'success');
            form.reset();
        } catch (error) {
            AppManager.showAlert(error.message || 'Unable to change password', 'error');
        } finally {
            AppManager.hideLoading();
        }
    }

    static async uploadAvatar(file) {
        if (!file) {
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            AppManager.showAlert('Please upload a valid image file.', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            AppManager.showAlert('Avatar must be smaller than 5MB.', 'error');
            return;
        }

        const payload = new FormData();
        payload.append('avatar', file);

        try {
            AppManager.showLoading();
            const response = await api.uploadFile('/users/avatar', payload);
            if (response?.avatar) {
                const img = document.getElementById('current-avatar');
                if (img) {
                    img.src = response.avatar;
                }
                const user = AuthManager.getUser() || {};
                user.avatar = response.avatar;
                AuthManager.saveUser(user);
                AppManager.showAlert('Profile photo updated.', 'success');
            }
        } catch (error) {
            AppManager.showAlert(error.message || 'Failed to upload avatar', 'error');
        } finally {
            AppManager.hideLoading();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    ProfileManager.init();
});
