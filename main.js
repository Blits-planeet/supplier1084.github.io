document.addEventListener('DOMContentLoaded', function() {
    // Handle the donation form submission
    const donationForm = document.getElementById('donation-form');
    
    // Make amount options clickable
    const amountOptions = document.querySelectorAll('.amount-option');
    amountOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Find the radio input inside this option and check it
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Trigger change event to handle any logic
            const changeEvent = new Event('change');
            radio.dispatchEvent(changeEvent);
        });
    });
    
    if (donationForm) {
        donationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate the form
            if (!validateDonationForm()) {
                return;
            }
            
            // First, verify the verification code
            const verificationCode = document.getElementById('verificationCode').value;
            const verifyResponse = await fetch('/api/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: verificationCode })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok || !verifyData.success) {
                showToast('error', verifyData.message || 'Invalid security code');
                return;
            }
            
            // Get the amount from either the selected radio option or custom amount
            let amount = document.getElementById('amount').value;
            const selectedAmountOption = document.querySelector('input[name="amount-option"]:checked');
            if (selectedAmountOption && selectedAmountOption.value !== 'custom') {
                amount = selectedAmountOption.value;
            }
            
            // Then, process the payment
            const formData = {
                amount: amount,
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                purchaseInfo: document.getElementById('purchaseInfo').value,
                paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
                verificationCode: verificationCode
            };
            
            try {
                showToast('info', 'Processing your request...');
                
                const response = await fetch('/api/donations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (!response.ok || !data.success) {
                    showToast('error', data.message || 'An error occurred processing your payment');
                    return;
                }
                
                // Redirect to the payment page
                window.location.href = data.redirectUrl;
                
            } catch (error) {
                console.error('Error:', error);
                showToast('error', 'An unexpected error occurred');
            }
        });
    }
});

function validateDonationForm() {
    // Get form values
    const amount = document.getElementById('amount').value;
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const verificationCode = document.getElementById('verificationCode').value;
    
    // Reset previous errors
    resetErrors();
    
    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        showError('amount', 'Please enter a valid donation amount');
        return false;
    }
    
    // Validate name
    if (!fullName.trim()) {
        showError('fullName', 'Please enter your full name');
        return false;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        return false;
    }
    
    // Validate verification code
    if (!verificationCode.trim()) {
        showError('verificationCode', 'Please enter the verification code');
        return false;
    }
    
    return true;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('error');
    
    // Create error message element if it doesn't exist
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    errorElement.textContent = message;
}

function resetErrors() {
    // Remove all error classes and messages
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => {
        message.parentNode.removeChild(message);
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
