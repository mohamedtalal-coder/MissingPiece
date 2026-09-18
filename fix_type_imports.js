const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/orders/CheckoutPage.tsx', 'utf8');
content = content.replace(
  "import { ordersApi, ShippingAddress } from './ordersApi';",
  "import { ordersApi, type ShippingAddress } from './ordersApi';"
);
content = content.replace(
  "  const { user, isAuthenticated } = useAuth();",
  "  const { isAuthenticated } = useAuth();"
);
fs.writeFileSync('frontend/src/features/orders/CheckoutPage.tsx', content);

let myOrdersContent = fs.readFileSync('frontend/src/shared/MyOrdersPage.tsx', 'utf8');
myOrdersContent = myOrdersContent.replace(
  "import { ordersApi, Order } from '../features/orders/ordersApi';",
  "import { ordersApi, type Order } from '../features/orders/ordersApi';"
);
fs.writeFileSync('frontend/src/shared/MyOrdersPage.tsx', myOrdersContent);
