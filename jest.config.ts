import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
	preset: "ts-jest",
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	verbose: true,
	transformIgnorePatterns: ["<rootDir>/node_modules/"],
}
export default config
