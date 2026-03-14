export const shareFeatures = {
    generateShareLink(promptData) {
        const shareData = {
            medium: promptData.medium,
            type: promptData.type,
            original: promptData.original,
            enhanced: promptData.enhanced
        };
        return `${window.location.origin}${window.location.pathname}?share=${btoa(JSON.stringify(shareData))}`;
    },

    async sharePrompt(promptData, platform) {
        const shareText = `Check out this enhanced AI prompt:\n\nOriginal: ${promptData.original}\n\nEnhanced: ${promptData.enhanced}`;
        const shareUrl = this.generateShareLink(promptData);
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(shareUrl);

        if (platform) {
            const urls = {
                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this enhanced AI prompt via Prompt Engine')}&url=${encodedUrl}`,
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                whatsapp: `https://wa.me/?text=${encodedText}%0A%0A${encodedUrl}`,
                telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
                email: `mailto:?subject=${encodeURIComponent('Enhanced AI Prompt — Prompt Engine')}&body=${encodedText}%0A%0ATry it yourself: ${encodedUrl}`,
            };

            if (platform === 'copyLink') {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    return { success: true, message: 'Share link copied to clipboard!' };
                } catch {
                    return { success: false, message: 'Failed to copy link.' };
                }
            }

            if (urls[platform]) {
                window.open(urls[platform], '_blank', 'noopener,noreferrer');
                return { success: true, message: `Opened ${platform}` };
            }
        }

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Prompt Engine', text: shareText, url: shareUrl });
                return { success: true, message: 'Shared successfully!' };
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('Native share failed:', err);
                }
            }
        }

        try {
            await navigator.clipboard.writeText(`${shareText}\n\nTry it yourself: ${shareUrl}`);
            return { success: true, message: 'Share link copied to clipboard!' };
        } catch {
            return { success: false, message: 'Failed to share. Please try copying manually.' };
        }
    },

    getAvailablePlatforms() {
        return ['twitter', 'linkedin', 'facebook', 'whatsapp', 'telegram', 'email', 'copyLink'];
    }
};
