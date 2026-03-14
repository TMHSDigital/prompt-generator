/**
 * Share utilities — clipboard, platform dialog, share dispatch.
 */
import { shareFeatures } from './features/shareFeatures.js';

/**
 * @param {object} elements - { enhancedPrompt, originalPrompt, promptMedium, promptType }
 * @param {object} uiFeatures
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sharePrompt(elements, uiFeatures) {
    const enhancedText = elements.enhancedPrompt.textContent;
    if (!enhancedText || enhancedText.includes('Your enhanced prompt will appear here')) {
        uiFeatures.notifications.show('Please generate an enhanced prompt first.', 'error');
        return { success: false, message: 'No prompt to share' };
    }

    const promptData = {
        original: elements.originalPrompt.value,
        enhanced: enhancedText,
        medium: elements.promptMedium.value,
        type: elements.promptType.value,
    };

    const platforms = shareFeatures.getAvailablePlatforms();
    if (platforms.length > 1 && !navigator.share) {
        const platform = await showSharePlatformDialog(platforms);
        if (platform) {
            return await shareFeatures.sharePrompt(promptData, platform);
        }
        return { success: false, message: 'Share cancelled' };
    }

    return await shareFeatures.sharePrompt(promptData);
}

/**
 * @param {string[]} platforms
 * @returns {Promise<string|null>}
 */
export function showSharePlatformDialog(platforms) {
    const dialog = document.createElement('div');
    dialog.className = 'share-dialog';

    const socialPlatforms = ['twitter', 'linkedin', 'facebook'];
    const messagingPlatforms = ['whatsapp', 'telegram'];
    const otherPlatforms = ['email', 'copyLink', 'qrCode'];

    dialog.innerHTML = `
        <div class="share-dialog-content">
            <h3>Share Enhanced Prompt</h3>

            <div class="share-section">
                <h4>Social Media</h4>
                <div class="share-platforms">
                    ${socialPlatforms.filter(p => platforms.includes(p)).map(platform => `
                        <button class="share-platform-btn" data-platform="${platform}">
                            <i class="fab fa-${platform}"></i>
                            <span>${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="share-section">
                <h4>Messaging</h4>
                <div class="share-platforms">
                    ${messagingPlatforms.filter(p => platforms.includes(p)).map(platform => `
                        <button class="share-platform-btn" data-platform="${platform}">
                            <i class="fab fa-${platform}"></i>
                            <span>${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="share-section">
                <h4>Other Options</h4>
                <div class="share-platforms">
                    ${otherPlatforms.filter(p => platforms.includes(p)).map(platform => `
                        <button class="share-platform-btn" data-platform="${platform}">
                            <i class="fas fa-${
                                platform === 'email' ? 'envelope' :
                                platform === 'copyLink' ? 'link' :
                                platform === 'qrCode' ? 'qrcode' : ''
                            }"></i>
                            <span>${
                                platform === 'copyLink' ? 'Copy Link' :
                                platform === 'qrCode' ? 'QR Code' :
                                platform.charAt(0).toUpperCase() + platform.slice(1)
                            }</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <button class="share-dialog-close">
                <i class="fas fa-times"></i>
                <span>Close</span>
            </button>
        </div>
    `;

    return new Promise(resolve => {
        dialog.addEventListener('click', e => {
            const platformBtn = e.target.closest('.share-platform-btn');
            if (platformBtn) {
                dialog.remove();
                resolve(platformBtn.dataset.platform);
            }
        });

        dialog.querySelector('.share-dialog-close').addEventListener('click', () => {
            dialog.remove();
            resolve(null);
        });

        document.body.appendChild(dialog);
    });
}

/**
 * @param {object} elements - { enhancedPrompt }
 * @param {object} uiFeatures
 */
export async function copyToClipboard(elements, uiFeatures) {
    const promptText = elements.enhancedPrompt.textContent;
    try {
        await navigator.clipboard.writeText(promptText);
        uiFeatures.notifications.show('Copied to clipboard!', 'success');
    } catch {
        uiFeatures.notifications.show('Failed to copy to clipboard.', 'error');
    }
}
