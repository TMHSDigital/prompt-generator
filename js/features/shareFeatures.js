// Share Feature Module
export class ShareManager {
    constructor() {
        this.shareOptions = {
            title: 'Prompt Engine',
            hashtags: ['PromptEngine', 'PromptEngineering'],
            platforms: {
                twitter: true,
                linkedin: true,
                facebook: true,
                email: true,
                whatsapp: true,
                telegram: true,
                copyLink: true,
                qrCode: true
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
        const baseText = `Check out this enhanced prompt using Prompt Engine:\n\nOriginal: "${promptData.original}"\n\nEnhanced: "${promptData.enhanced}"`;
        
        return {
            default: baseText,
            twitter: `${baseText}\n\n#${this.shareOptions.hashtags.join(' #')} 🤖✨`,
            linkedin: `${baseText}\n\nTry it yourself!`,
            facebook: `${baseText}\n\nTry it yourself!`,
            email: `${baseText}\n\nGenerated using Prompt Engine - Transform your prompts with best practices`,
            whatsapp: `${baseText}\n\nTry it yourself! 🤖✨`,
            telegram: `${baseText}\n\nTry it yourself! 🤖✨`
        };
    }

    async share(promptData, platform = 'default') {
        try {
            const shareUrl = this.generateShareLink(promptData);
            const shareTexts = this.generateShareText(promptData);
            const shareText = shareTexts[platform] || shareTexts.default;

            switch(platform) {
                case 'copyLink':
                    await navigator.clipboard.writeText(shareUrl);
                    return {
                        success: true,
                        message: 'Link copied to clipboard!',
                        platform: 'clipboard'
                    };
                
                case 'qrCode':
                    return {
                        success: true,
                        message: 'QR Code generated',
                        platform: 'qrCode',
                        qrCodeData: shareUrl
                    };

                case 'email':
                    const emailUrl = `mailto:?subject=${encodeURIComponent(this.shareOptions.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
                    window.open(emailUrl, '_blank');
                    return {
                        success: true,
                        message: 'Email client opened',
                        platform: 'email'
                    };

                case 'whatsapp':
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');
                    return {
                        success: true,
                        message: 'WhatsApp opened',
                        platform: 'whatsapp'
                    };

                case 'telegram':
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
                    return {
                        success: true,
                        message: 'Telegram opened',
                        platform: 'telegram'
                    };

                default:
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
            }
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