/**
 * @typedef {Object} Factor
 * @property {string} name - The name of the factor
 * @property {string} description - Description of what the factor does
 */

/**
 * @typedef {Object} Type
 * @property {string} name - The name of the type
 * @property {string} description - Description of the type's purpose
 * @property {string[]} factors - Array of factors applicable to this type
 */

/**
 * @typedef {Object} Medium
 * @property {string} name - The name of the medium
 * @property {string} description - Description of the medium's purpose
 * @property {Object.<string, Type>} types - Map of types available for this medium
 */

/**
 * Defines the available mediums and their associated prompt types.
 * Each medium has a name and a set of types, and each type has specific factors.
 * @type {Object.<string, Medium>}
 */
export const mediumTypes = {
    text: {
        name: 'Text',
        description: 'Generate or enhance text-based prompts',
        types: {
            general: {
                name: 'General',
                description: 'General purpose text generation',
                factors: ['objective', 'tone', 'format', 'constraints', 'examples']
            },
            completion: {
                name: 'Completion',
                description: 'Continue or complete existing text',
                factors: ['creativity', 'format', 'continuity', 'style', 'context']
            },
            chat: {
                name: 'Chat',
                description: 'Conversational interactions',
                factors: ['role', 'tone', 'context', 'memory', 'constraints']
            },
            code: {
                name: 'Code',
                description: 'Generate or modify code',
                factors: ['language', 'purpose', 'complexity', 'style', 'documentation', 'tests']
            }
        }
    },
    image: {
        name: 'Image',
        description: 'Generate or modify image prompts',
        types: {
            generation: {
                name: 'Generation',
                description: 'Create new images',
                factors: ['subject', 'style', 'composition', 'lighting', 'color', 'mood', 'detail', 'perspective']
            },
            editing: {
                name: 'Editing',
                description: 'Modify existing images',
                factors: ['modification', 'strength', 'style', 'focus', 'preservation', 'blend']
            },
            variation: {
                name: 'Variation',
                description: 'Create variations of images',
                factors: ['elements', 'style', 'diversity', 'consistency']
            }
        }
    }
};

/**
 * Gets the factors associated with a specific medium and type.
 * @param {string} medium - The medium (text/image)
 * @param {string} type - The prompt type within the medium
 * @returns {string[]} Array of factors for the specified medium and type
 */
export function getFactors(medium, type) {
    return mediumTypes[medium]?.types[type]?.factors || [];
}

/**
 * Gets information about a specific prompt type within a medium.
 * @param {string} medium - The medium (text/image)
 * @param {string} type - The prompt type to get info for
 * @returns {Type|null} Type information or null if not found
 */
export function getTypeInfo(medium, type) {
    return mediumTypes[medium]?.types[type] || null;
}

/**
 * Gets information about a specific medium.
 * @param {string} medium - The medium to get info for
 * @returns {Medium|null} Medium information or null if not found
 */
export function getMediumInfo(medium) {
    return mediumTypes[medium] || null;
}

/**
 * Gets best practices configuration for a specific medium and type.
 * @param {string} medium - The medium (text/image)
 * @param {string} type - The prompt type
 * @returns {Object} Best practices configuration
 * @returns {boolean} .clearContext - Whether to include clear context
 * @returns {boolean} .chainOfThought - Whether to use chain-of-thought prompting
 * @returns {boolean} .validateInput - Whether to validate input
 * @returns {boolean} .useExamples - Whether to include examples
 * @returns {number} .temperature - Recommended temperature setting
 */
export function getBestPractices(medium, type) {
    const commonPractices = {
        clearContext: true,
        chainOfThought: true,
        validateInput: true,
        useExamples: false,
        temperature: 0.7
    };

    const mediumPractices = {
        text: {
            general: { useExamples: true },
            completion: { temperature: 0.9 },
            chat: { temperature: 0.8 },
            code: { temperature: 0.3 }
        },
        image: {
            generation: { useWeighting: true },
            editing: { preserveContext: true },
            variation: { maintainStyle: true }
        }
    };

    return {
        ...commonPractices,
        ...(mediumPractices[medium]?.[type] || {})
    };
} 