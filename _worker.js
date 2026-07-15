const { User } = require('./database');

const PLANS = {
  weekly: { price: 10, duration: 7, label: 'Weekly' },
  monthly: { price: 80, duration: 30, label: 'Monthly' },
  yearly: { price: 600, duration: 365, label: 'Yearly' }
};

// ===== YOUR CONFIGURATION =====
const JAZZCASH_NUMBER = "03093470099";
const JAZZCASH_ACCOUNT = "Mansoor Ahmed";
const SUPPORT_USERNAME = "@Harisahmed13";
const OWNER_USERNAME = "@Harisahmed56"; // Hidden from users

function getPaymentInstructions(plan, price) {
  return `
💳 **Payment Instructions**

📅 Plan: ${PLANS[plan].label}
💰 Amount: $${price} (≈ PKR ${(price * 280).toFixed(0)})

📌 **Payment Method: JazzCash / EasyPaisa**

📱 **Send payment to:**
   📞 ${JAZZCASH_NUMBER}
   👤 Account: ${JAZZCASH_ACCOUNT}

📝 **Reference:** CRYPTO-${Date.now().toString().slice(-6)}

━━━━━━━━━━━━━━━━━━━━━

📸 **After Payment:**
   1. Take screenshot of payment confirmation
   2. Send it here: /submit_payment
   3. Our team will verify within 24 hours

━━━━━━━━━━━━━━━━━━━━━

❌ **Need help?** Contact support:
👤 ${SUPPORT_USERNAME}

━━━━━━━━━━━━━━━━━━━━━

✅ **Ready?** Send /submit_payment after payment
  `;
}

async function verifyPayment(userId, paymentId, plan) {
  try {
    const user = await User.findOne({ telegramId: userId });
    if (!user) return false;
    
    const planData = PLANS[plan];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planData.duration);
    
    user.isPremium = true;
    user.premiumExpiry = expiryDate;
    user.subscriptionPlan = plan;
    user.credits = 999999;
    await user.save();
    return true;
  } catch (error) {
    console.error('Verification Error:', error);
    return false;
  }
}

async function checkPremium(telegramId) {
  const user = await User.findOne({ telegramId });
  if (!user || !user.isPremium) return false;
  if (user.premiumExpiry && new Date() > user.premiumExpiry) {
    user.isPremium = false;
    await user.save();
    return false;
  }
  return true;
}

async function getPremiumDetails(telegramId) {
  const user = await User.findOne({ telegramId });
  if (!user || !user.isPremium) {
    return { isPremium: false, message: '🆓 Free User' };
  }
  const daysLeft = Math.ceil((user.premiumExpiry - new Date()) / (1000 * 60 * 60 * 24));
  return {
    isPremium: true,
    plan: user.subscriptionPlan,
    planLabel: PLANS[user.subscriptionPlan]?.label || 'Premium',
    daysLeft: daysLeft,
    expiryDate: user.premiumExpiry,
    message: `💎 **Premium ${PLANS[user.subscriptionPlan]?.label || ''}**\n📅 Expires: ${user.premiumExpiry.toLocaleDateString()}\n⏰ Days left: ${daysLeft}`
  };
}

module.exports = { 
  PLANS, 
  JAZZCASH_NUMBER, 
  JAZZCASH_ACCOUNT,
  SUPPORT_USERNAME,
  OWNER_USERNAME,
  getPaymentInstructions, 
  verifyPayment, 
  checkPremium, 
  getPremiumDetails 
};
