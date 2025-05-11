document.addEventListener('DOMContentLoaded', function() {
    const cryptoPaymentSection = document.getElementById('crypto-payment');
    
    if (cryptoPaymentSection) {
        // Fetch crypto wallet addresses from API
        fetchCryptoWallets();
        
        // Setup copy buttons
        setupCopyButtons();
        
        // Setup confirmation button
        setupConfirmationButton();
    }
});

async function fetchCryptoWallets() {
    try {
        const response = await fetch('/api/crypto-wallets');
        const wallets = await response.json();
        
        // Display wallet addresses
        document.getElementById('btc-wallet').textContent = wallets.BTC;
        document.getElementById('eth-wallet').textContent = wallets.ETH;
        document.getElementById('ltc-wallet').textContent = wallets.LTC;
    } catch (error) {
        console.error('Error fetching crypto wallets:', error);
        showToast('error', 'Error fetching wallet addresses');
    }
}

function setupCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const walletType = this.getAttribute('data-wallet');
            const walletElement = document.getElementById(`${walletType.toLowerCase()}-wallet`);
            const walletAddress = walletElement.textContent;
            
            // Copy to clipboard
            navigator.clipboard.writeText(walletAddress)
                .then(() => {
                    showToast('success', `${walletType} wallet address copied to clipboard`);
                })
                .catch(err => {
                    console.error('Could not copy text:', err);
                    showToast('error', 'Failed to copy address');
                });
        });
    });
}

function setupConfirmationButton() {
    const confirmButton = document.getElementById('confirm-crypto-payment');
    
    confirmButton.addEventListener('click', async function() {
        try {
            const response = await fetch('/api/complete-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    purchaseInfo: 'Cryptocurrency payment'
                })
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                showToast('error', data.message || 'An error occurred processing your payment');
                return;
            }
            
            // Show success message
            showToast('success', 'Thank you for your cryptocurrency donation!');
            
            // Redirect to thank you page after a short delay
            setTimeout(() => {
                window.location.href = '/thank-you';
            }, 1500);
            
        } catch (error) {
            console.error('Error confirming payment:', error);
            showToast('error', 'An unexpected error occurred');
        }
    });
}
