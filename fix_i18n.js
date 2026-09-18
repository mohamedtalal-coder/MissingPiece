const fs = require('fs');

const mappings = {
  'frontend/src/features/cart/CartPage.tsx': [
    ['Shopping Cart', '{t.cart.title || "Shopping Cart"}'],
    ['Review your selected luxury puzzle items', '{t.cart.subtitle || "Review your selected luxury puzzle items"}'],
    ['Loading your cart...', '{t.common.loading || "Loading..."}'],
    ['Your cart is currently empty.', '{t.cart.empty || "Your cart is currently empty."}'],
    ['Explore Catalog', '{t.cart.exploreCatalog || "Explore Catalog"}'],
    ['Order Summary', '{t.cart.orderSummary || "Order Summary"}'],
    ['Subtotal', '{t.cart.subtotal || "Subtotal"}'],
    ['Shipping', '{t.cart.shipping || "Shipping"}'],
    ['Total', '{t.common.total || "Total"}'],
    ['Proceed to Checkout', '{t.cart.proceedToCheckout || "Proceed to Checkout"}'],
    ['Free', '{t.cart.free || "Free"}'],
  ],
  'frontend/src/features/auth/LoginForm.tsx': [
    ['Email Address', '{t.auth?.email || "Email Address"}'],
    ['Password', '{t.auth?.password || "Password"}'],
    ['Sign In', '{t.auth?.signIn || "Sign In"}'],
  ],
  'frontend/src/features/auth/LoginPage.tsx': [
    ['Welcome Back', '{t.auth?.welcomeBack || "Welcome Back"}'],
    ['Sign in to your account', '{t.auth?.signInSubtitle || "Sign in to your account"}'],
  ],
  'frontend/src/features/auth/RegisterForm.tsx': [
    ['Create Account', '{t.auth?.createAccount || "Create Account"}'],
  ],
  'frontend/src/features/auth/RegisterPage.tsx': [
    ['Create Account', '{t.auth?.createAccount || "Create Account"}'],
    ['Register a new account to start shopping', '{t.auth?.registerSubtitle || "Register a new account to start shopping"}'],
  ],
  'frontend/src/shared/MyOrdersPage.tsx': [
    ['My Orders', '{t.orders?.myOrders || "My Orders"}'],
    ['Track your puzzle shipments and order history', '{t.orders?.trackHistory || "Track your puzzle shipments and order history"}'],
    ["You haven't placed any orders yet.", '{t.orders?.noOrders || "You haven\'t placed any orders yet."}'],
  ],
};

for (const [file, replaces] of Object.entries(mappings)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add useLanguage import if not there
    if (!content.includes('useLanguage')) {
      content = content.replace(/import.*?['"];?/, match => `${match}\nimport { useLanguage } from '../../shared/context/LanguageContext';`);
    }
    
    // Add const { t } = useLanguage(); inside the component
    // Need to find the component start. Usually export function XXX() {
    content = content.replace(/(export (?:default )?function \w+\([^)]*\)\s*\{)/, '$1\n  const { t } = useLanguage();');
    
    for (const [find, replace] of replaces) {
      // Replace >Find< with >Replace<
      content = content.replace(new RegExp(`>\\s*${find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`, 'g'), `>${replace}<`);
    }
    
    fs.writeFileSync(file, content, 'utf8');
  }
}
