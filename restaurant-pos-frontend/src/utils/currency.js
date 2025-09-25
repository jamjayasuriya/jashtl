/**
 * Format currency in Sri Lankan Rupees (LKR) format
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "Rs. 1,234.56")
 */
export const formatCurrency = (amount) => {
  const numAmount = parseFloat(amount || 0);
  return `Rs. ${numAmount.toFixed(2)}`;
};

/**
 * Format currency with thousand separators for better readability
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with separators (e.g., "Rs. 1,234.56")
 */
export const formatCurrencyWithSeparators = (amount) => {
  const numAmount = parseFloat(amount || 0);
  return `Rs. ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
