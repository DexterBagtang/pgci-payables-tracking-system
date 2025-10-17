/**
 * PO Validation Rules
 * Centralized validation rules for Purchase Order forms
 */

export const poValidationRules = {
    po_number: {
        validate: (value) => {
            if (!value || value.trim() === '') {
                return 'PO Number is required';
            }
            if (value.length < 3) {
                return 'PO Number must be at least 3 characters';
            }
            return null;
        },
    },

    vendor_id: {
        validate: (value) => {
            if (!value || value === '' || value === 'all') {
                return 'Please select a vendor';
            }
            return null;
        },
    },

    project_id: {
        validate: (value) => {
            if (!value || value === '' || value === 'all') {
                return 'Please select a project';
            }
            return null;
        },
    },

    po_amount: {
        validate: (value) => {
            if (!value || value === '') {
                return 'PO Amount is required';
            }
            const amount = parseFloat(value);
            if (isNaN(amount)) {
                return 'PO Amount must be a valid number';
            }
            if (amount <= 0) {
                return 'PO Amount must be greater than 0';
            }
            return null;
        },
    },

    po_date: {
        validate: (value) => {
            if (!value || value === '') {
                return 'PO Date is required';
            }
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return 'PO Date is invalid';
            }
            return null;
        },
    },

    description: {
        validate: (value) => {
            if (value && value.length > 1000) {
                return 'Description must not exceed 1000 characters';
            }
            return null;
        },
    },

    payment_term: {
        validate: (value) => {
            if (value && value.length > 500) {
                return 'Payment Terms must not exceed 500 characters';
            }
            return null;
        },
    },

    files: {
        validate: (fileList) => {
            if (!fileList || fileList.length === 0) {
                return null; // Files are optional
            }

            // Check if fileList is an array or FileList
            const filesArray = Array.from(fileList);

            for (const file of filesArray) {
                // Check file size (10MB max)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    return `File "${file.name}" exceeds maximum size of 10MB`;
                }

                // Allowed file types
                const allowedTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                ];

                if (!allowedTypes.includes(file.type)) {
                    return `File "${file.name}" has an unsupported file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG`;
                }
            }

            return null;
        },
    },
};

/**
 * Validate a single field
 * @param {string} fieldName - The field name to validate
 * @param {*} value - The field value
 * @returns {string|null} - Error message or null if valid
 */
export const validateField = (fieldName, value) => {
    const rule = poValidationRules[fieldName];
    if (!rule) return null; // No rule defined for this field

    return rule.validate(value);
};

/**
 * Validate all form data
 * @param {Object} data - Form data object
 * @returns {Object} - Object with field names as keys and error messages as values
 */
export const validateFormData = (data) => {
    const validationErrors = {};

    // Check required fields
    const requiredFields = ['po_number', 'vendor_id', 'project_id', 'po_amount', 'po_date'];

    for (const fieldName of requiredFields) {
        const error = validateField(fieldName, data[fieldName]);
        if (error) {
            validationErrors[fieldName] = error;
        }
    }

    // Check optional fields with length constraints
    const optionalFields = ['description', 'payment_term'];

    for (const fieldName of optionalFields) {
        const error = validateField(fieldName, data[fieldName]);
        if (error) {
            validationErrors[fieldName] = error;
        }
    }

    return validationErrors;
};

/**
 * Validate files
 * @param {FileList|Array} files - Files to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateFiles = (files) => {
    return validateField('files', files);
};
