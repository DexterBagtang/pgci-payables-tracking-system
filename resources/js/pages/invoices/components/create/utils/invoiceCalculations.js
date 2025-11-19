/**
 * Calculate VAT breakdown from gross amount
 * Assumes 12% VAT rate
 *
 * @param {string|number} amount - The gross invoice amount
 * @returns {object} Object containing grossAmount, vatableAmount, and vatAmount
 */
export const calculateVAT = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    const vatableAmount = numAmount / 1.12;
    const vatAmount = numAmount - vatableAmount;
    return {
        grossAmount: numAmount,
        vatableAmount: vatableAmount,
        vatAmount: vatAmount,
    };
};

/**
 * Calculate percentage of PO amount used by invoice
 *
 * @param {string|number} invoiceAmount - The invoice amount
 * @param {string|number} poAmount - The purchase order amount
 * @returns {number} Percentage of PO amount (0-100+)
 */
export const calculatePOPercentage = (invoiceAmount, poAmount) => {
    const invoice = parseFloat(invoiceAmount) || 0;
    const po = parseFloat(poAmount) || 0;
    if (po === 0) return 0;
    return (invoice / po) * 100;
};
