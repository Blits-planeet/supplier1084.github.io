import os
import logging
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "development-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)  # needed for url_for to generate with https

# Configuration
VALID_VERIFICATION_CODE = "sup1084"

# Crypto wallet addresses
CRYPTO_WALLETS = {
    "BTC": "bc1qv4mf89l0fv62d2ctnrl5hlmv7ks3spvcxryugy",
    "ETH": "0x65f3f21603a6b6c74c5e0df85bcec8b057260006",
    "LTC": "ltc1q46vt595nxl726ufcwc476xlmwpytp72q2ekwcq"
}

# In-memory storage for donations and purchases
donations = []
purchases = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/payment/<payment_method>')
def payment(payment_method):
    if 'donation_data' not in session:
        flash('No donation information found. Please fill the form first.')
        return redirect(url_for('index'))
    
    # Pass PayPal client ID to the template
    client_id = os.environ.get('PAYPAL_CLIENT_ID')
    
    return render_template('payment.html', 
                          payment_method=payment_method, 
                          donation=session['donation_data'],
                          client_id=client_id)

@app.route('/thank-you')
def thank_you():
    if 'donation_data' not in session:
        flash('No donation information found. Please fill the form first.')
        return redirect(url_for('index'))
    donation = session['donation_data']
    session.pop('donation_data', None)  # Clear donation data after thank you page
    return render_template('thank-you.html', donation=donation)

@app.route('/api/donations', methods=['POST'])
def process_donation():
    try:
        donation_data = request.json
        
        # Basic validation
        required_fields = ['amount', 'fullName', 'email', 'paymentMethod', 'verificationCode']
        for field in required_fields:
            if field not in donation_data or not donation_data[field]:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Add timestamp and pending status
        donation_data['createdAt'] = datetime.now().isoformat()
        donation_data['status'] = 'pending'
        
        # Store in memory (in a real app, this would be in a database)
        donations.append(donation_data)
        
        # Store in session for the payment page
        session['donation_data'] = donation_data
        
        return jsonify({
            'success': True,
            'message': 'Donation processed successfully',
            'redirectUrl': f'/payment/{donation_data["paymentMethod"]}'
        })
    except Exception as e:
        logging.error(f"Error processing donation: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while processing your donation'
        }), 500

@app.route('/api/verify-code', methods=['POST'])
def verify_code():
    try:
        code_data = request.json
        
        if not code_data or 'code' not in code_data:
            return jsonify({
                'success': False,
                'message': 'Verification code is required'
            }), 400
        
        if code_data['code'] != VALID_VERIFICATION_CODE:
            return jsonify({
                'success': False,
                'message': 'Invalid verification code'
            }), 401
        
        return jsonify({
            'success': True,
            'message': 'Verification successful'
        })
    except Exception as e:
        logging.error(f"Error verifying code: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during verification'
        }), 500

@app.route('/api/crypto-wallets')
def get_crypto_wallets():
    return jsonify(CRYPTO_WALLETS)

@app.route('/api/purchases/<email>')
def get_purchases(email):
    # In a real app, this would query the database
    user_purchases = [p for p in purchases if p.get('email') == email]
    
    # If no purchases found, return empty array but with clear message
    if not user_purchases:
        return jsonify({
            'purchases': [],
            'message': 'No purchase history found for this email address.',
            'status': 'empty'
        })
    
    return jsonify(user_purchases)

@app.route('/api/complete-payment', methods=['POST'])
def complete_payment():
    try:
        payment_data = request.json
        
        if 'donation_data' not in session:
            return jsonify({
                'success': False,
                'message': 'No donation information found'
            }), 400
            
        donation = session['donation_data']
        
        # Create purchase record
        purchase = {
            'id': len(purchases) + 1,
            'email': donation['email'],
            'amount': donation['amount'],
            'paymentMethod': donation['paymentMethod'],
            'purchaseInfo': payment_data.get('purchaseInfo', 'Donation'),
            'createdAt': datetime.now().isoformat()
        }
        
        # In a real app, this would be saved to a database
        purchases.append(purchase)
        
        return jsonify({
            'success': True,
            'message': 'Payment completed successfully',
            'purchase': purchase
        })
    except Exception as e:
        logging.error(f"Error completing payment: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while processing your payment'
        }), 500

@app.route('/purchase-history')
def purchase_history():
    return render_template('purchase-history.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('not-found.html'), 404
