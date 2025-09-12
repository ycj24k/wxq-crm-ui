// playwright.config.ts
import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

// 忽略 Node.js 版本检查
process.env.PLAYWRIGHT_SKIP_NODE_VERSION_CHECK = '1';
process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1';

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
};
export default config;
