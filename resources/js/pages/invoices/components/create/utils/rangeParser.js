/**
 * Utility functions for parsing and generating invoice number ranges
 * Supports:
 * - Plain numbers: 25 - 30
 * - Leading zeros: 0025 - 0030
 * - Alphanumeric prefixes: B-345 - B-350, INV-00123 - INV-00130
 */

/**
 * Parse an invoice number string into its components
 * @param {string} str - Invoice number string (e.g., "0025", "B-345", "INV-00123")
 * @returns {object|null} - { prefix, number, numericValue, padding } or null if invalid
 */
export function parseInvoiceNumber(str) {
    if (!str || typeof str !== 'string') {
        return null;
    }

    // Trim whitespace
    const trimmed = str.trim();

    // Match pattern: (optional prefix)(numeric part)
    // The numeric part must be at the end
    const match = trimmed.match(/^(.*?)(\d+)$/);

    if (!match) {
        return null; // No numeric part found
    }

    const prefix = match[1]; // Everything before the number (could be empty, or like "B-", "INV-")
    const numberStr = match[2]; // The numeric part as string (preserves leading zeros)
    const numericValue = parseInt(numberStr, 10);
    const padding = numberStr.length; // Length for zero-padding

    return {
        prefix,
        number: numberStr,
        numericValue,
        padding,
    };
}

/**
 * Format an invoice number with prefix and padding
 * @param {string} prefix - Prefix part (e.g., "", "B-", "INV-")
 * @param {number} numericValue - The numeric value to format
 * @param {number} padding - Number of digits to pad with zeros
 * @returns {string} - Formatted invoice number
 */
export function formatInvoiceNumber(prefix, numericValue, padding) {
    const paddedNumber = String(numericValue).padStart(padding, '0');
    return `${prefix}${paddedNumber}`;
}

/**
 * Validate a range and return count or error
 * @param {string} startStr - Start of range (e.g., "0025", "B-345")
 * @param {string} endStr - End of range (e.g., "0030", "B-350")
 * @returns {object} - { valid: boolean, count: number, error: string, startParsed, endParsed }
 */
export function validateRange(startStr, endStr) {
    // Parse both values
    const startParsed = parseInvoiceNumber(startStr);
    const endParsed = parseInvoiceNumber(endStr);

    // Check if both are valid
    if (!startParsed) {
        return {
            valid: false,
            count: 0,
            error: 'Invalid start format - must end with a number',
            startParsed: null,
            endParsed: null,
        };
    }

    if (!endParsed) {
        return {
            valid: false,
            count: 0,
            error: 'Invalid end format - must end with a number',
            startParsed,
            endParsed: null,
        };
    }

    // Check if prefixes match
    if (startParsed.prefix !== endParsed.prefix) {
        return {
            valid: false,
            count: 0,
            error: `Prefix mismatch: "${startParsed.prefix || '(none)'}" vs "${endParsed.prefix || '(none)'}"`,
            startParsed,
            endParsed,
        };
    }

    // Check if end >= start
    if (endParsed.numericValue < startParsed.numericValue) {
        return {
            valid: false,
            count: 0,
            error: 'End value must be greater than or equal to start value',
            startParsed,
            endParsed,
        };
    }

    // Calculate count
    const count = endParsed.numericValue - startParsed.numericValue + 1;

    // Limit to 100 invoices
    if (count > 100) {
        return {
            valid: false,
            count,
            error: `Range too large (${count} invoices). Maximum is 100.`,
            startParsed,
            endParsed,
        };
    }

    return {
        valid: true,
        count,
        error: null,
        startParsed,
        endParsed,
    };
}

/**
 * Generate a sequence of invoice numbers from start to end
 * @param {string} startStr - Start of range (e.g., "0025", "B-345")
 * @param {string} endStr - End of range (e.g., "0030", "B-350")
 * @returns {array} - Array of formatted invoice numbers, or empty array if invalid
 */
export function generateInvoiceSequence(startStr, endStr) {
    const validation = validateRange(startStr, endStr);

    if (!validation.valid) {
        return []; // Return empty array for invalid ranges
    }

    const { startParsed, count } = validation;
    const sequence = [];

    for (let i = 0; i < count; i++) {
        const currentValue = startParsed.numericValue + i;
        const formatted = formatInvoiceNumber(startParsed.prefix, currentValue, startParsed.padding);
        sequence.push(formatted);
    }

    return sequence;
}

/**
 * Generate a preview of the sequence (first N items)
 * @param {string} startStr - Start of range
 * @param {string} endStr - End of range
 * @param {number} previewCount - Number of items to preview (default: 3)
 * @returns {object} - { items: array, hasMore: boolean, totalCount: number }
 */
export function generatePreview(startStr, endStr, previewCount = 3) {
    const sequence = generateInvoiceSequence(startStr, endStr);
    const totalCount = sequence.length;
    const items = sequence.slice(0, previewCount);
    const hasMore = totalCount > previewCount;

    return {
        items,
        hasMore,
        totalCount,
        remaining: hasMore ? totalCount - previewCount : 0,
    };
}
