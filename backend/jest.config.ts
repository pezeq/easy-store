import {
	createDefaultEsmPreset,
	type DefaultEsmPreset,
	type JestConfigWithTsJest,
} from "ts-jest";

const presetConfig: DefaultEsmPreset = createDefaultEsmPreset();

const jestConfig: JestConfigWithTsJest = {
	...presetConfig,
	testEnvironment: "node",
	moduleNameMapper: {
		"^@modules/(.*)\\.js$": "<rootDir>/src/modules/$1",
		"^@shared/(.*)\\.js$": "<rootDir>/src/shared/$1",
		"(.+)\\.js": "$1",
	},
	testPathIgnorePatterns: ["dist/", "node_modules/"],
};

export default jestConfig;
