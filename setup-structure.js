const fs = require("fs");
const path = require("path");

const filesToAdd = [
  // app structure
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/[auth]/sign-in/page.tsx",
  "src/app/[auth]/sign-up/page.tsx",
  "src/app/[auth]/reset-password/page.tsx",
  "src/app/[main]/dashboard/page.tsx",
  "src/app/[main]/trading/page.tsx",
  "src/app/[main]/wallet/page.tsx",
  "src/app/[main]/orders/page.tsx",
  "src/app/[main]/demo/page.tsx",
  "src/app/[main]/profile/page.tsx",
  "src/app/api/ping/route.ts",
  // features
  "src/features/trading/TradingChart.tsx",
  "src/features/trading/OrderBook.tsx",
  "src/features/trading/TradeForm.tsx",
  "src/features/trading/hooks.ts",
  "src/features/trading/api.ts",
  "src/features/trading/types.ts",
  "src/features/trading/utils.ts",
  "src/features/demo/DemoProvider.tsx",
  "src/features/demo/DemoTradeForm.tsx",
  "src/features/demo/DemoHistory.tsx",
  "src/features/demo/hooks.ts",
  "src/features/demo/api.ts",
  "src/features/demo/types.ts",
  "src/features/wallet/WalletConnector.tsx",
  "src/features/wallet/WalletHistory.tsx",
  "src/features/wallet/hooks.ts",
  "src/features/wallet/api.ts",
  "src/features/wallet/types.ts",
  "src/features/orders/OrdersTable.tsx",
  "src/features/orders/TradeHistoryWidget.tsx",
  "src/features/orders/hooks.ts",
  "src/features/orders/api.ts",
  "src/features/orders/types.ts",
  "src/features/orders/utils.ts",
  "src/features/user/UserProfile.tsx",
  "src/features/user/hooks.ts",
  "src/features/notifications/NotificationProvider.tsx",
  "src/features/notifications/hooks.ts",
  // components
  "src/components/ui/Button.tsx",
  "src/components/ui/Modal.tsx",
  "src/components/ui/Tooltip.tsx",
  "src/components/layout/AppShell.tsx",
  "src/components/layout/Sidebar.tsx",
  "src/components/layout/Header.tsx",
  // hooks
  "src/hooks/useAuth.ts",
  "src/hooks/useSocket.ts",
  "src/hooks/useMetaMask.ts",
  "src/hooks/useDemoAccount.ts",
  // lib
  "src/lib/apiClient.ts",
  "src/lib/web3.ts",
  "src/lib/constants.ts",
  "src/lib/queryClient.ts",
  // styles
  "src/styles/globals.css",
  "src/styles/theme.css",
  // tests
  "src/tests/features/demo.test.ts",
  "src/tests/features/trading.test.ts",
  "src/tests/features/orders.test.ts",
  "src/tests/features/wallet.test.ts",
  "src/tests/lib/apiClient.test.ts",
  // root files
  ".env.local",
  ".gitignore",
  "next.config.js",
  "tailwind.config.js",
  "tsconfig.json",
  "README.md",
];

// public/ (ยังอยู่ root)
const publicFiles = ["public/.gitkeep"];

function createStructure(base, arr) {
  arr.forEach((item) => {
    const fullPath = path.join(base, item);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, "");
    }
  });
}

createStructure(process.cwd(), filesToAdd);
createStructure(process.cwd(), publicFiles);

console.log("✅ โครงสร้างโปรเจกต์ (ทุกอย่างใน src/) สร้างเสร็จแล้ว!");
