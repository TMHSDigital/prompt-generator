// Share Features Module
export const shareFeatures = {
    generateShareLink(promptData) {
        const shareData = {
            type: promptData.type,
            original: promptData.original,
            enhanced: promptData.enhanced
        };
        return `${window.location.origin}${window.location.pathname}?share=${btoa(JSON.stringify(shareData))}`;
    },

    async sharePrompt(promptData) {
        const shareText = `Check out this enhanced AI prompt:\n\nOriginal: ${promptData.original}\n\nEnhanced: ${promptData.enhanced}`;
        const shareUrl = this.generateShareLink(promptData);
        
        // Try native share API first
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Prompt Engine',
                    text: shareText,
                    url: shareUrl
                });
                return { success: true, message: 'Shared successfully!' };
            } catch (err) {
                console.warn('Native share failed, falling back to clipboard:', err);
            }
        }
        
        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(`${shareText}\n\nTry it yourself: ${shareUrl}`);
            return { success: true, message: 'Share link copied to clipboard!' };
        } catch (err) {
            console.error('Clipboard fallback failed:', err);
            return { success: false, message: 'Failed to share. Please try copying manually.' };
        }
    },

    getAvailablePlatforms() {
        const platforms = ['copyLink'];
        
        // Add native share platforms if available
        if (navigator.share) {
            platforms.push('twitter', 'facebook', 'linkedin', 'whatsapp', 'telegram');
        }
        
        // Add email if mailto: is supported
        if (navigator.userAgent.indexOf('Mobile') === -1) {
            platforms.push('email');
        }
        
        return platforms;
    }
}; 