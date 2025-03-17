import { defineConfig, devices } from "@playwright/test"

const isCI = process.env.CI

export default defineConfig({
	testDir: "tests",
	preserveOutput: "never",
	fullyParallel: !isCI,
	use: {
		baseURL: "http://127.0.0.1:4173",
	},
	webServer: {
		command: "pnpm --filter example preview",
		reuseExistingServer: !isCI,
		port: 4173,
		timeout: 10000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
		{
			name: "Mobile Chrome",
			use: { ...devices["Pixel 5"] },
		},
		{
			name: "Mobile Safari",
			use: { ...devices["iPhone 12"] },
		},
	],
})
