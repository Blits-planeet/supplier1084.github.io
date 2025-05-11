document.addEventListener('DOMContentLoaded', function() {
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    
    if (paypalButtonContainer) {
        // Get donation amount from the summary
        const amountElement = document.querySelector('.donation-summary .summary-item:first-child span:last-child');
        const amount = amountElement ? amountElement.textContent.replace('$', '') : '10';
        
        // Initialize PayPal buttons
        initPayPalButton(amount);
    }
});

function initPayPalButton(amount) {
    // Now using the client ID from environment variables
    paypal.Buttons({
        style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'paypal',
        },
        
        createOrder: function(data, actions) {
            // Get the notes/message if any
            const purchaseInfo = document.querySelector('.payment-summary p').textContent.replace('Notes:', '').trim();
            
            // Check if we're on PayPal or Card payment page
            const isPayPalPage = document.querySelector('h2').textContent.includes('PayPal');
            
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: amount,
                        currency_code: 'USD'
                    },
                    description: purchaseInfo || 'Payment to Supplier 1084'
                }],
                // Set application context based on payment method
                application_context: {
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'PAY_NOW',
                    // For Friends & Family, we would typically use a different method
                    // but we're simulating it here with the branding name
                    brand_name: isPayPalPage ? 'Supplier 1084 (Friends & Family Payment)' : 'Supplier 1084 Business'
                }
            });
        },
        
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(orderData) {
                // Successful capture! For demo purposes:
                console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
                
                // Send the payment information to the server
                completePayment(orderData)
                    .then(() => {
                        // Show success message
                        showToast('success', 'Payment completed successfully!');
                        
                        // Redirect to thank you page after a short delay
                        setTimeout(() => {
                            window.location.href = '/thank-you';
                        }, 1500);
                    })
                    .catch(error => {
                        console.error('Error completing payment:', error);
                        showToast('error', 'Error completing payment. Please try again.');
                    });
            });
        },
        
        onError: function(err) {
            console.error('PayPal error:', err);
            showToast('error', 'PayPal error: ' + err);
        }
    }).render('#paypal-button-container');
}

async function completePayment(orderData) {
    try {
        const response = await fetch('/api/complete-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paypalOrderId: orderData.id,
                purchaseInfo: 'PayPal payment: ' + orderData.id
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to complete payment on server');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error in completePayment:', error);
        throw error;
    }
}
