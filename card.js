document.addEventListener('DOMContentLoaded', function() {
    const cardForm = document.getElementById('card-payment-form');
    
    if (cardForm) {
        // Setup form validation and submission
        cardForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Simple validation
            const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
            const expiryDate = document.getElementById('expiry-date').value;
            const cvv = document.getElementById('cvv').value;
            const cardName = document.getElementById('card-name').value;
            
            // Reset previous errors
            const errorElements = document.querySelectorAll('.error-message');
            errorElements.forEach(element => element.remove());
            
            // Validate card number (simple check for length)
            if (!/^\d{13,19}$/.test(cardNumber)) {
                showCardError('card-number', 'Please enter a valid card number');
                return;
            }
            
            // Validate expiry date (format MM/YY)
            if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
                showCardError('expiry-date', 'Please enter a valid expiry date (MM/YY)');
                return;
            }
            
            // Validate CVV (3-4 digits)
            if (!/^\d{3,4}$/.test(cvv)) {
                showCardError('cvv', 'Please enter a valid CVV code');
                return;
            }
            
            // Validate card name
            if (!cardName.trim()) {
                showCardError('card-name', 'Please enter the name on your card');
                return;
            }
            
            // In a real application, we would process the payment with a payment gateway
            // For this example, we'll simulate a successful payment
            
            try {
                // Show processing message
                showToast('info', 'Processing your payment...');
                
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Send completion to server
                const response = await fetch('/api/complete-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        purchaseInfo: 'Credit card payment'
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok || !data.success) {
                    showToast('error', data.message || 'An error occurred processing your payment');
                    return;
                }
                
                // Show success message
                showToast('success', 'Payment successful!');
                
                // Redirect to thank you page after a short delay
                setTimeout(() => {
                    window.location.href = '/thank-you';
                }, 1500);
                
            } catch (error) {
                console.error('Error processing payment:', error);
                showToast('error', 'An unexpected error occurred');
            }
        });
        
        // Setup card number formatting
        const cardNumberInput = document.getElementById('card-number');
        cardNumberInput.addEventListener('input', function(e) {
            // Remove non-digits
            let value = this.value.replace(/\D/g, '');
            
            // Add space after every 4 digits
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            
            // Update the input value
            this.value = value;
        });
        
        // Setup expiry date formatting
        const expiryInput = document.getElementById('expiry-date');
        expiryInput.addEventListener('input', function(e) {
            // Remove non-digits
            let value = this.value.replace(/\D/g, '');
            
            // Insert slash after 2 digits
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            
            // Limit to MM/YY format
            if (value.length > 5) {
                value = value.slice(0, 5);
            }
            
            // Update the input value
            this.value = value;
        });
        
        // Setup CVV input to only allow digits
        const cvvInput = document.getElementById('cvv');
        cvvInput.addEventListener('input', function(e) {
            // Remove non-digits
            this.value = this.value.replace(/\D/g, '');
            
            // Limit to 4 digits
            if (this.value.length > 4) {
                this.value = this.value.slice(0, 4);
            }
        });
    }
});

function showCardError(fieldId, message) {
    const field = document.getElementById(fieldId);
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.classList.add('error-message');
    errorElement.style.color = 'var(--destructive)';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    errorElement.textContent = message;
    
    // Add error message after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
    
    // Highlight the field
    field.style.borderColor = 'var(--destructive)';
    
    // Focus on the field
    field.focus();
}