import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "tests",
	fullyParallel: true,
	preserveOutput: "never",
	use: {
		baseURL: "http://localhost:4173",
	},
	webServer: {
		command: "pnpm --filter example preview",
		url: "http://localhost:4173",
		reuseExistingServer: true,
		timeout: 2000,
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
