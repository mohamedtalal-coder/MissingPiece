const fs = require('fs');

const replacements = [
  {
    file: 'frontend/src/shared/MyOrdersPage.tsx',
    finds: [
      [/<h1.*?>My Orders<\/h1>/g, '<h1 className="text-2xl font-bold tracking-wide">{t.orders?.myOrders || "My Orders"}</h1>'],
      [/<p.*?>Track your puzzle shipments and order history<\/p>/g, '<p className="text-xs text-[#a1a1aa] font-sans">{t.orders?.trackHistory || "Track your puzzle shipments and order history"}</p>'],
      [/<p.*?>You haven't placed any orders yet.<\/p>/g, '<p className="text-xs text-[#a1a1aa]">{t.orders?.noOrders || "You haven\'t placed any orders yet."}</p>']
    ]
  },
  {
    file: 'frontend/src/features/account/ProfilePage.tsx',
    finds: [
      [/<h2.*?>Edit Profile Details<\/h2>/g, '<h2 className="text-white font-serif font-bold text-base border-b border-border pb-3">{t.profile?.editDetails || "Edit Profile Details"}</h2>'],
      [/<label.*?>Upload Profile Picture from Device<\/label>/g, '<label className="text-[#e9d5ff]">{t.profile?.uploadPicture || "Upload Profile Picture from Device"}</label>'],
      [/<span>Choose Image File<\/span>/g, '<span>{t.profile?.chooseImage || "Choose Image File"}</span>'],
      [/<label.*?>Full Name<\/label>/g, '<label className="text-[#e9d5ff]">{t.profile?.fullName || "Full Name"}</label>'],
      [/<h2.*?>Quick Navigation<\/h2>/g, '<h2 className="text-white font-serif font-bold text-base border-b border-border pb-3">{t.profile?.quickNavigation || "Quick Navigation"}</h2>']
    ]
  },
  {
    file: 'frontend/src/features/auth/RegisterForm.tsx',
    finds: [
      [/<h1.*?>Create Account<\/h1>/g, '<h1 className="text-2xl font-serif font-bold text-white tracking-wide">{t.auth?.createAccount || "Create Account"}</h1>'],
      [/<p.*?>Join MissingPiece and start exploring luxury puzzles.<\/p>/g, '<p className="text-xs text-[#a1a1aa]">{t.auth?.registerSubtitle || "Join MissingPiece and start exploring luxury puzzles."}</p>'],
      [/<label.*?>Full Name<\/label>/g, '<label className="text-[11px] text-[#d8b4fe] font-medium">{t.auth?.name || "Full Name"}</label>'],
      [/<label.*?>Email Address<\/label>/g, '<label className="text-[11px] text-[#d8b4fe] font-medium">{t.auth?.email || "Email Address"}</label>'],
      [/<label.*?>Password<\/label>/g, '<label className="text-[11px] text-[#d8b4fe] font-medium">{t.auth?.password || "Password"}</label>']
    ]
  },
  {
    file: 'frontend/src/features/auth/LoginForm.tsx',
    finds: [
      [/<label.*?>Email Address<\/label>/g, '<label className="text-xs font-medium text-primary">{t.auth?.email || "Email Address"}</label>'],
      [/<label.*?>Password<\/label>/g, '<label className="text-xs font-medium text-primary">{t.auth?.password || "Password"}</label>'],
      [/<span>Sign In<\/span>/g, '<span>{t.auth?.signIn || "Sign In"}</span>']
    ]
  },
  {
    file: 'frontend/src/features/auth/LoginPage.tsx',
    finds: [
      [/<h1.*?>Welcome Back<\/h1>/g, '<h1 className="text-2xl font-bold text-white">{t.auth?.welcomeBack || "Welcome Back"}</h1>'],
      [/<p.*?>Sign in to your account<\/p>/g, '<p className="text-xs font-sans text-[#cbd5e1]">{t.auth?.signInSubtitle || "Sign in to your account"}</p>']
    ]
  },
  {
    file: 'frontend/src/features/auth/RegisterPage.tsx',
    finds: [
      [/<h1.*?>Create Account<\/h1>/g, '<h1 className="text-2xl font-bold text-white">{t.auth?.createAccount || "Create Account"}</h1>'],
      [/<p.*?>Register a new account to start shopping<\/p>/g, '<p className="text-xs font-sans text-[#cbd5e1]">{t.auth?.registerSubtitle || "Register a new account to start shopping"}</p>']
    ]
  },
  {
    file: 'frontend/src/features/cart/CartPage.tsx',
    finds: [
      [/<h1.*?>Shopping Cart<\/h1>/g, '<h1 className="text-2xl font-serif font-bold">{t.cart?.title || "Shopping Cart"}</h1>'],
      [/<p.*?>Review your selected luxury puzzle items<\/p>/g, '<p className="text-xs text-[#cbd5e1]">{t.cart?.subtitle || "Review your selected luxury puzzle items"}</p>'],
      [/<p.*?>Loading your cart\.\.\.<\/p>/g, '<p className="text-xs text-[#cbd5e1] text-center py-16">{t.common?.loading || "Loading your cart..."}</p>'],
      [/<p.*?>Your cart is currently empty\.<\/p>/g, '<p className="text-sm text-[#cbd5e1]">{t.cart?.empty || "Your cart is currently empty."}</p>'],
      [/<h3.*?>Order Summary<\/h3>/g, '<h3 className="font-serif font-bold text-base border-b border-border pb-3">{t.cart?.orderSummary || "Order Summary"}</h3>'],
      [/<span>Subtotal<\/span>/g, '<span>{t.cart?.subtotal || "Subtotal"}</span>'],
      [/<span>Shipping<\/span>/g, '<span>{t.cart?.shipping || "Shipping"}</span>'],
      [/<span.*?>Free<\/span>/g, '<span className="text-emerald-400 font-semibold">{t.cart?.free || "Free"}</span>'],
      [/<span>Total<\/span>/g, '<span>{t.common?.total || "Total"}</span>'],
      [/<span>Proceed to Checkout<\/span>/g, '<span>{t.cart?.proceedToCheckout || "Proceed to Checkout"}</span>']
    ]
  },
  {
    file: 'frontend/src/shared/components/Footer.tsx',
    finds: [
      [/<span>Fast Global Shipping<\/span>/g, '<span>{t.footer?.shipping || "Fast Global Shipping"}</span>']
    ]
  },
  {
    file: 'frontend/src/features/products/components/ProductCard.tsx',
    finds: [
      [/<span.*?>Out of Stock<\/span>/g, '<span className="bg-red-500/80 text-white px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.5)]">{t.productDetail?.outOfStock || "Out of Stock"}</span>']
    ]
  },
  {
    file: 'frontend/src/features/products/components/ProductFilters.tsx',
    finds: [
      [/<option.*?>Newest Arrivals<\/option>/g, '<option value="newest">{t.productList?.newest || "Newest Arrivals"}</option>'],
      [/<span>Price Range<\/span>/g, '<span>{t.productList?.priceRange || "Price Range"}</span>']
    ]
  },
  {
    file: 'frontend/src/features/products/ProductDetailPage.tsx',
    finds: [
      [/<h2.*?>You May Also Like<\/h2>/g, '<h2 className="text-2xl font-serif font-bold text-[var(--text-main)] mb-8">{t.productDetail?.related || "You May Also Like"}</h2>']
    ]
  },
  {
    file: 'frontend/src/features/products/ProductListPage.tsx',
    finds: [
      [/<p.*?>Try adjusting your filters or search term\.<\/p>/g, '<p className="text-lg text-[var(--text-muted)]">{t.productList?.noProducts || "Try adjusting your filters or search term."}</p>']
    ]
  },
  {
    file: 'frontend/src/shared/components/layout/Navbar.tsx',
    finds: [
      [/<span.*?>Missing Piece<\/span>/g, '<span className="font-headline-sm text-headline-sm text-primary tracking-tight">{t.nav?.home || "Missing Piece"}</span>'],
      [/<span.*?>Account<\/span>/g, '<span className="font-label-md text-label-md hidden lg:inline-block">{t.nav?.profile || "Account"}</span>']
    ]
  },
  {
    file: 'frontend/src/shared/components/layout/Footer.tsx',
    finds: [
      [/<span.*?>Missing Piece<\/span>/g, '<span className="font-headline-sm text-headline-sm text-primary">{t.nav?.home || "Missing Piece"}</span>'],
      [/<span.*?>Sustainably Crafted<\/span>/g, '<span className="font-label-sm text-label-sm uppercase tracking-wider">{t.footer?.sustainablyCrafted || "Sustainably Crafted"}</span>'],
      [/<h3.*?>Shop Collections<\/h3>/g, '<h3 className="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">{t.footer?.shopCollections || "Shop Collections"}</h3>'],
      [/<Link.*?>Wooden Puzzles<\/Link>/g, '<Link to="/products?category=wooden" className="hover:text-primary transition-colors">{t.home?.categories?.wooden || "Wooden Puzzles"}</Link>'],
      [/<Link.*?>Jigsaw Puzzles<\/Link>/g, '<Link to="/products?category=jigsaw" className="hover:text-primary transition-colors">{t.home?.categories?.jigsaw || "Jigsaw Puzzles"}</Link>'],
      [/<Link.*?>Mystery Escapes<\/Link>/g, '<Link to="/products?category=mystery-escape" className="hover:text-primary transition-colors">{t.home?.categories?.mystery || "Mystery Escapes"}</Link>'],
      [/<h3.*?>Customer Care<\/h3>/g, '<h3 className="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">{t.footer?.customerCare || "Customer Care"}</h3>'],
      [/<h3.*?>The Missing Piece Dispatch<\/h3>/g, '<h3 className="font-label-lg text-label-lg text-on-surface mb-space-xs uppercase tracking-wider">{t.footer?.newsletter || "The Missing Piece Dispatch"}</h3>'],
      [/<Button.*?>Subscribe<\/Button>/g, '<Button variant="primary" className="w-full">{t.footer?.subscribe || "Subscribe"}</Button>'],
      [/<Link.*?>Privacy Policy<\/Link>/g, '<Link to="/privacy" className="hover:text-primary transition-colors">{t.footer?.privacy || "Privacy Policy"}</Link>'],
      [/<Link.*?>Terms of Service<\/Link>/g, '<Link to="/terms" className="hover:text-primary transition-colors">{t.footer?.terms || "Terms of Service"}</Link>']
    ]
  }
];

for (const {file, finds} of replacements) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [regex, replace] of finds) {
      content = content.replace(regex, replace);
    }

    if (!content.includes('useLanguage')) {
      const match = content.match(/import .*? from '.*';\n/);
      const matchLength = match ? match[0].length : 0;
      
      const fileDir = require('path').resolve(require('path').dirname(file));
      const contextDir = require('path').resolve('./frontend/src/shared/context');
      let relPath = require('path').relative(fileDir, contextDir);
      if (!relPath.startsWith('.')) relPath = './' + relPath;
      
      content = content.slice(0, matchLength) + `import { useLanguage } from '${relPath}/LanguageContext';\n` + content.slice(matchLength);
    }
    
    if (content.includes('useLanguage') && !content.includes('const { t } = useLanguage()')) {
       // Just insert it after the component declaration
       content = content.replace(/(export (?:default )?function \w+\([^)]*\)\s*\{|const \w+ = \([^)]*\) =>\s*\{)/, '$1\n  const { t } = useLanguage() as any;\n');
    } else if (content.includes('const { t } = useLanguage()')) {
       content = content.replace('const { t } = useLanguage()', 'const { t } = useLanguage() as any');
    }

    fs.writeFileSync(file, content, 'utf8');
  }
}

// Special case for Footer.tsx
const footerPath = 'frontend/src/shared/components/layout/Footer.tsx';
if (fs.existsSync(footerPath)) {
  let content = fs.readFileSync(footerPath, 'utf8');
  content = content.replace(/<Icon name="settings" className="text-sm" \/>\s*Admin Console/g, '<Icon name="settings" className="text-sm" />{t.footer?.admin || "Admin Console"}');
  fs.writeFileSync(footerPath, content, 'utf8');
}
