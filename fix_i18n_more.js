const fs = require('fs');

const mappings = {
  'frontend/src/shared/components/layout/Footer.tsx': [
    ['Missing Piece', '{t.nav?.home || "Missing Piece"}'],
    ['Sustainably Crafted', '{t.footer?.sustainablyCrafted || "Sustainably Crafted"}'],
    ['Shop Collections', '{t.footer?.shopCollections || "Shop Collections"}'],
    ['Customer Care', '{t.footer?.customerCare || "Customer Care"}'],
    ['The Missing Piece Dispatch', '{t.footer?.newsletter || "The Missing Piece Dispatch"}'],
    ['Subscribe', '{t.footer?.subscribe || "Subscribe"}'],
    ['Privacy Policy', '{t.footer?.privacy || "Privacy Policy"}'],
    ['Terms of Service', '{t.footer?.terms || "Terms of Service"}'],
    ['Wooden Puzzles', '{t.home?.categories?.wooden || "Wooden Puzzles"}'],
    ['Jigsaw Puzzles', '{t.home?.categories?.jigsaw || "Jigsaw Puzzles"}'],
    ['Mystery Escapes', '{t.home?.categories?.mystery || "Mystery Escapes"}'],
    ['Admin Console', '{t.footer?.admin || "Admin Console"}'],
  ],
  'frontend/src/shared/components/layout/Navbar.tsx': [
    ['Missing Piece', '{t.nav?.home || "Missing Piece"}'],
    ['Account', '{t.nav?.profile || "Account"}'],
  ],
  'frontend/src/features/auth/RegisterForm.tsx': [
    ['Join MissingPiece and start exploring luxury puzzles.', '{t.auth?.registerSubtitle || "Join MissingPiece and start exploring luxury puzzles."}'],
    ['Full Name', '{t.auth?.name || "Full Name"}'],
    ['Email Address', '{t.auth?.email || "Email Address"}'],
    ['Password', '{t.auth?.password || "Password"}'],
  ],
  'frontend/src/features/account/ProfilePage.tsx': [
    ['Edit Profile Details', '{t.profile?.editDetails || "Edit Profile Details"}'],
    ['Upload Profile Picture from Device', '{t.profile?.uploadPicture || "Upload Profile Picture from Device"}'],
    ['Choose Image File', '{t.profile?.chooseImage || "Choose Image File"}'],
    ['Full Name', '{t.profile?.fullName || "Full Name"}'],
    ['Quick Navigation', '{t.profile?.quickNavigation || "Quick Navigation"}'],
  ],
  'frontend/src/features/products/ProductListPage.tsx': [
    ['Try adjusting your filters or search term.', '{t.productList?.noProducts || "Try adjusting your filters or search term."}'],
  ],
  'frontend/src/features/products/ProductDetailPage.tsx': [
    ['You May Also Like', '{t.productDetail?.related || "You May Also Like"}'],
  ],
  'frontend/src/features/products/components/ProductFilters.tsx': [
    ['Newest Arrivals', '{t.productList?.newest || "Newest Arrivals"}'],
    ['Price Range', '{t.productList?.priceRange || "Price Range"}'],
  ],
  'frontend/src/features/products/components/ProductCard.tsx': [
    ['Out of Stock', '{t.productDetail?.outOfStock || "Out of Stock"}'],
  ],
  'frontend/src/shared/components/Footer.tsx': [
    ['Fast Global Shipping', '{t.footer?.shipping || "Fast Global Shipping"}'],
  ],
};

for (const [file, replaces] of Object.entries(mappings)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (!content.includes('useLanguage')) {
      content = content.replace(/import.*?['"];?/, match => `${match}\nimport { useLanguage } from '../../shared/context/LanguageContext';`);
    }
    
    // Some files have different component names or nested scopes. So just insert `const { t } = useLanguage();` roughly:
    if (!content.includes('const { t } = useLanguage()')) {
        content = content.replace(/(export (?:default )?function \w+\([^)]*\)\s*\{|const \w+ = \([^)]*\) =>\s*\{)/, '$1\n  const { t } = useLanguage();\n');
    }
    
    for (const [find, replace] of replaces) {
      content = content.replace(new RegExp(`>\\s*${find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<`, 'g'), `>${replace}<`);
    }
    
    fs.writeFileSync(file, content, 'utf8');
  }
}
