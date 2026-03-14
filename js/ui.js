/**
 * UI utilities — formatting, notifications, dialogs, dark mode button sync.
 */

/**
 * @param {HTMLElement} textarea
 */
export function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

/**
 * @param {string} text
 * @returns {string}
 */
export function sanitizeHTML(text) {
    const element = document.createElement('div');
    element.textContent = text;
    return element.innerHTML;
}

/**
 * @param {string} prompt
 * @param {string} medium
 * @returns {string}
 */
export function formatEnhancedPrompt(prompt, medium) {
    const sanitized = sanitizeHTML(prompt);

    if (medium === 'image') {
        return sanitized
            .replace(/\(([^)]+)\)/g, '<span class="parameter">($1)</span>')
            .replace(/,\s*/g, ',\n')
            .split('\n')
            .map(line => `<p>${line.trim()}</p>`)
            .join('');
    }

    return sanitized
        .split('\n')
        .map(line => `<p>${line.trim()}</p>`)
        .join('');
}

/**
 * @param {object} elements - { notification }
 * @param {string} message
 * @param {string} type
 */
export function showNotification(elements, message, type = 'info') {
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type}`;
    elements.notification.classList.add('show');

    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

/**
 * @param {object} elements - { confirmTitle, confirmMessage, confirmDialog }
 * @param {string} title
 * @param {string} message
 * @param {Function} callback
 * @param {object} ctx - object to store confirmCallback on
 */
export function showConfirmDialog(elements, title, message, callback, ctx) {
    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    ctx.confirmCallback = callback;
    elements.confirmDialog.style.display = 'flex';
}

/**
 * @param {object} elements - { confirmDialog }
 * @param {object} ctx
 */
export function hideConfirmDialog(elements, ctx) {
    elements.confirmDialog.style.display = 'none';
    ctx.confirmCallback = null;
}

/**
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * @param {object} elements - { darkModeBtn }
 * @param {object} uiFeatures
 */
export function updateDarkModeButton(elements, uiFeatures) {
    const isDark = uiFeatures.darkMode.isDark;
    elements.darkModeBtn.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
    elements.darkModeBtn.setAttribute('aria-pressed', isDark.toString());
    elements.darkModeBtn.title = `${isDark ? 'Disable' : 'Enable'} dark mode`;
}

/**
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
