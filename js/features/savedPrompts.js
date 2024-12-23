// Saved Prompts Feature Module
export const savedPrompts = {
    initialize() {
        // Add click outside listener to close saved prompts viewer
        document.addEventListener('click', (e) => {
            const viewer = document.getElementById('savedPromptsViewer');
            if (viewer && viewer.classList.contains('show')) {
                if (!viewer.querySelector('.saved-prompts-content').contains(e.target)) {
                    viewer.classList.remove('show');
                }
            }
        });

        // Add escape key listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const viewer = document.getElementById('savedPromptsViewer');
                if (viewer && viewer.classList.contains('show')) {
                    viewer.classList.remove('show');
                }
            }
        });
    },

    save(promptData) {
        const savedPrompts = this.getAll();
        savedPrompts.unshift(promptData);
        localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts.slice(0, 10)));
    },

    getAll() {
        return JSON.parse(localStorage.getItem('savedPrompts') || '[]');
    },

    delete(index) {
        const savedPrompts = this.getAll();
        savedPrompts.splice(index, 1);
        localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
    },

    showViewer() {
        const viewer = document.getElementById('savedPromptsViewer');
        if (viewer) {
            viewer.classList.add('show');
        }
    },

    hideViewer() {
        const viewer = document.getElementById('savedPromptsViewer');
        if (viewer) {
            viewer.classList.remove('show');
        }
    }
}; 