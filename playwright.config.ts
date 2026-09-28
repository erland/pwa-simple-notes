import { defineConfig, devices } from '@playwright/test'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const basePath = process.env.GITHUB_ACTIONS && repositoryName && !repositoryName.endsWith('.github.io') ? `/${repositoryName}/` : '/'
const baseURL = `http://127.0.0.1:4173${basePath}`

export default defineConfig({
  testDir: './e2e',
  testMatch: '*.pw.ts',
  workers: process.env.CI ? 1 : undefined,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, serviceWorkers: 'allow', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
