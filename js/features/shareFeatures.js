// Share Feature Module
export class ShareManager {
    constructor() {
        this.shareOptions = {
            title: 'Prompt Engine',
            hashtags: ['PromptEngine', 'PromptEngineering'],
            platforms: {
                twitter: true,
                linkedin: true,
                facebook: true
            }
        };
    }

    generateShareLink(promptData) {
        const shareData = {
            type: promptData.type,
            original: promptData.original,
            enhanced: promptData.enhanced,
            timestamp: new Date().toISOString()
        };
        return `${window.location.origin}${window.location.pathname}?share=${btoa(JSON.stringify(shareData))}`;
    }

    generateShareText(promptData) {
        return {
            default: `Check out this enhanced AI prompt:\n\nOriginal: ${promptData.original}\n\nEnhanced: ${promptData.enhanced}`,
            twitter: `Check out this AI-enhanced prompt! 🤖✨\n\nOriginal: "${promptData.original}"\n\nEnhanced: "${promptData.enhanced}"\n\n#${this.shareOptions.hashtags.join(' #')}`,
            linkedin: `I just enhanced this prompt using AI:\n\nOriginal Prompt:\n"${promptData.original}"\n\nEnhanced Version:\n"${promptData.enhanced}"\n\nTry it yourself!`,
            facebook: `I used AI to enhance this prompt:\n\nFrom: "${promptData.original}"\nTo: "${promptData.enhanced}"\n\nTry it yourself!`
        };
    }

    async share(promptData, platform = 'default') {
        try {
            const shareUrl = this.generateShareLink(promptData);
            const shareTexts = this.generateShareText(promptData);
            const shareText = shareTexts[platform] || shareTexts.default;

            // Try native share API first
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: this.shareOptions.title,
                        text: shareText,
                        url: shareUrl
                    });
                    return { 
                        success: true, 
                        message: 'Shared successfully!',
                        platform: 'native'
                    };
                } catch (err) {
                    console.warn('Native share failed, trying platform-specific share:', err);
                }
            }

            // Platform-specific sharing
            if (platform !== 'default' && this.shareOptions.platforms[platform]) {
                const platformUrl = this.getPlatformShareUrl(platform, shareText, shareUrl);
                window.open(platformUrl, '_blank');
                return {
                    success: true,
                    message: `Opened share dialog for ${platform}`,
                    platform
                };
            }

            // Fallback to clipboard
            await navigator.clipboard.writeText(`${shareText}\n\nTry it yourself: ${shareUrl}`);
            return {
                success: true,
                message: 'Share link copied to clipboard!',
                platform: 'clipboard'
            };
        } catch (err) {
            console.error('Share failed:', err);
            return {
                success: false,
                message: 'Failed to share. Please try copying manually.',
                error: err.message
            };
        }
    }

    getPlatformShareUrl(platform, text, url) {
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(url);
        
        switch (platform) {
            case 'twitter':
                return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
            case 'linkedin':
                return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
            default:
                return null;
        }
    }

    getAvailablePlatforms() {
        return Object.entries(this.shareOptions.platforms)
            .filter(([_, enabled]) => enabled)
            .map(([platform]) => platform);
    }

    updateShareOptions(options) {
        this.shareOptions = {
            ...this.shareOptions,
            ...options
        };
    }
} 