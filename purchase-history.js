document.addEventListener('DOMContentLoaded', function() {
    const purchaseHistoryContainer = document.getElementById('purchase-history-container');
    const emailInput = document.getElementById('history-email');
    const searchForm = document.getElementById('search-history-form');
    
    if (searchForm) {
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            if (!email) {
                showToast('error', 'Please enter your email address');
                return;
            }
            
            try {
                showToast('info', 'Searching for your purchase history...');
                
                const response = await fetch(`/api/purchases/${encodeURIComponent(email)}`);
                const data = await response.json();
                
                // Clear previous results
                purchaseHistoryContainer.innerHTML = '';
                
                // Check if we got the empty state message format
                if (data.status === 'empty') {
                    // Create an empty state message with our new styling
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'empty-message';
                    emptyMessage.textContent = data.message || 'No purchase history found for this email address.';
                    purchaseHistoryContainer.appendChild(emptyMessage);
                    return;
                }
                
                // If we have purchases (the normal array format)
                if (Array.isArray(data) && data.length > 0) {
                    // Create header
                    const header = document.createElement('h2');
                    header.textContent = 'Your Purchase History';
                    purchaseHistoryContainer.appendChild(header);
                    
                    // Create a table for the purchases
                    const table = document.createElement('table');
                    table.className = 'purchase-table';
                    
                    // Table header
                    const thead = document.createElement('thead');
                    thead.innerHTML = `
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Details</th>
                        </tr>
                    `;
                    table.appendChild(thead);
                    
                    // Table body
                    const tbody = document.createElement('tbody');
                    
                    data.forEach(purchase => {
                        const tr = document.createElement('tr');
                        
                        // Format date
                        const date = purchase.createdAt ? purchase.createdAt.split('T')[0] : 'N/A';
                        
                        tr.innerHTML = `
                            <td>${date}</td>
                            <td>$${purchase.amount}</td>
                            <td>${purchase.paymentMethod}</td>
                            <td>${purchase.purchaseInfo || 'Donation'}</td>
                        `;
                        
                        tbody.appendChild(tr);
                    });
                    
                    table.appendChild(tbody);
                    purchaseHistoryContainer.appendChild(table);
                } else {
                    // We have an empty array with no status
                    const emptyMessage = document.createElement('div');
                    emptyMessage.className = 'empty-message';
                    emptyMessage.textContent = 'No purchase history found for this email address.';
                    purchaseHistoryContainer.appendChild(emptyMessage);
                }
                
            } catch (error) {
                console.error('Error fetching purchase history:', error);
                showToast('error', 'An error occurred while retrieving your purchase history');
                
                // Create an error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Unable to load purchase history. Please try again later.';
                purchaseHistoryContainer.appendChild(errorMessage);
            }
        });
    }
});