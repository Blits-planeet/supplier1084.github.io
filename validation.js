/**
 * Validates a donation form
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateDonationForm() {
    // Get form values
    const amount = document.getElementById('amount').value;
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const verificationCode = document.getElementById('verificationCode').value;
    
    // Reset previous errors
    resetErrors();
    
    let isValid = true;
    
    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        showError('amount', 'Please enter a valid donation amount');
        isValid = false;
    }
    
    // Validate name
    if (!fullName.trim()) {
        showError('fullName', 'Please enter your full name');
        isValid = false;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate verification code
    if (!verificationCode.trim()) {
        showError('verificationCode', 'Please enter the verification code');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Displays an error message for a form field
 * @param {string} fieldId - The ID of the field with an error
 * @param {string} message - The error message to display
 */
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('error');
    
    // Create error message element if it doesn't exist
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        errorElement.style.color = 'var(--destructive)';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    errorElement.textContent = message;
}

/**
 * Resets all error messages and formatting
 */
function resetErrors() {
    // Remove all error classes
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    
    // Remove all error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => {
        message.parentNode.removeChild(message);
    });
}

/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
