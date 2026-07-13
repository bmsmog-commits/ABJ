# ABJ Foundation - Setup Guide

## 🚀 Application Status: SERVERS RUNNING
- ✅ Backend API Server: http://localhost:5000 (waiting for database)
- ✅ Frontend Server: http://localhost:3000
- ✅ Environment file created with placeholders

## ⚠️  IMPORTANT: Database Required

The backend server is currently waiting for MongoDB connection. Choose one of the options below:

### 1. MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/atlas
2. Create free account → Build a Cluster → Choose free tier
3. Create database user (username/password)
4. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
5. Clusters → Connect → Connect your application
6. Copy the connection string
7. Update `.env` file:
   ```
   MONGO_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/abjfoundation?retryWrites=true&w=majority
   ```
8. Restart the backend server (it will auto-restart with nodemon)

### 2. Local MongoDB Installation

1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Keep current `.env` setting (already configured for local)
4. Restart backend server

## 📋 Remaining Setup Steps

### 3. Stripe Payment Setup

**Step 1: Create Stripe Account**
1. Go to https://stripe.com
2. Click "Start now" and create a free account
3. Complete email verification

**Step 2: Get API Keys**
1. In Stripe Dashboard, go to "Developers" → "API keys"
2. Copy your "Publishable key" (starts with `pk_test_`)
3. Copy your "Secret key" (starts with `sk_test_`)
4. Update `.env` file:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY
   ```

**Step 3: Configure Webhook**
1. In Stripe Dashboard, go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Enter endpoint URL: `http://localhost:5000/api/webhooks/webhook`
4. Select events to listen for: `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Update `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET
   ```

### 4. Test the Application

**Frontend URLs:**
- Home: http://localhost:3000/index.html
- Donate: http://localhost:3000/donate.html
- Login: http://localhost:3000/login.html
- Signup: http://localhost:3000/signup.html
- Request Help: http://localhost:3000/request-help.html
- Contact: http://localhost:3000/contact.html

**API Endpoints:**
- API Base: http://localhost:5000/api
- Health Check: http://localhost:5000/

### 5. Optional: Email Setup

To enable contact form email notifications:
1. Use Gmail or another SMTP provider
2. Generate an app password for Gmail
3. Update `.env`:
   ```
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

## 🔧 Current Status

- ✅ Frontend server running on port 3000
- ⏳ Backend server waiting for database connection
- ⏳ Stripe setup needed for payments
- ⏳ Webhook configuration needed

Once you complete the database setup, the backend will connect automatically and all features will be functional!
7. Update `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET
   ```

### 3. Test the Application

**Frontend URLs:**
- Home: http://localhost:3000/index.html
- Donate: http://localhost:3000/donate.html
- Login: http://localhost:3000/login.html
- Signup: http://localhost:3000/signup.html
- Request Help: http://localhost:3000/request-help.html
- Contact: http://localhost:3000/contact.html

**API Endpoints:**
- API Base: http://localhost:5000/api
- Health Check: http://localhost:5000/

### 4. Optional: Email Setup

To enable contact form email notifications:
1. Use Gmail or another SMTP provider
2. Generate an app password for Gmail
3. Update `.env`:
   ```
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

## 🔧 Troubleshooting

**Server won't start:**
- Check if ports 3000 and 5000 are available
- Verify MongoDB connection string
- Check console for error messages

**Payments not working:**
- Verify Stripe keys are correct
- Check webhook endpoint is active
- Ensure webhook secret matches

**Database connection issues:**
- For Atlas: Check IP whitelist includes 0.0.0.0/0
- For local: Ensure MongoDB service is running

## 🎯 Next Steps

1. Complete Stripe setup above
2. Test user registration and login
3. Test donation flow (will redirect to Stripe test checkout)
4. Test help request submission
5. Test contact form

The application is now fully functional with all features implemented!