const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentSession = async ({ name, email, amount, currency = 'USD', gateway = 'stripe' }) => {
  if (gateway !== 'stripe') {
    // For other gateways, return a mock URL for now
    const returnBase = process.env.PAYMENT_RETURN_URL || 'https://abjfoundation.ngo';
    const paymentSessionId = Math.random().toString(36).substring(2, 12);
    return `${returnBase}/payment-success?gateway=${gateway}&amount=${amount}&currency=${currency}&session=${paymentSessionId}`;
  }

  try {
    const successBase = process.env.PAYMENT_RETURN_URL || 'https://abjfoundation.ngo';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Donation to ABJ Foundation',
              description: `Donation from ${name}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successBase}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${successBase}/payment-cancelled`,
      customer_email: email,
      metadata: {
        donor_name: name,
        donor_email: email,
      },
    });

    return session.url;
  } catch (error) {
    console.error('Stripe session creation error:', error);
    throw new Error('Payment session creation failed');
  }
};

module.exports = { createPaymentSession };
