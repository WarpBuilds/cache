import nock from "nock";

nock.disableNetConnect();

export default {
    clearMocks: true,
    moduleFileExtensions: ["js", "ts"],
    roots: ["<rootDir>/__tests__"],
    testEnvironment: "node",
    testMatch: ["**/*.test.ts"],
    transform: {
        "^.+\\.(ts|js)$": [
            "ts-jest",
            {
                tsconfig: {
                    allowJs: true,
                    esModuleInterop: true,
                    module: "commonjs",
                    moduleResolution: "node",
                    target: "ES2022"
                },
                diagnostics: {
                    ignoreCodes: [151002]
                }
            }
        ]
    },
    moduleNameMapper: {
        "^@actions/cache$":
            "<rootDir>/node_modules/@actions/cache/lib/cache.js",
        "^@actions/core$": "<rootDir>/node_modules/@actions/core/lib/core.js",
        "^@actions/exec$": "<rootDir>/node_modules/@actions/exec/lib/exec.js",
        "^@actions/io$": "<rootDir>/node_modules/@actions/io/lib/io.js",
        "^@actions/io/lib/io-util$":
            "<rootDir>/node_modules/@actions/io/lib/io-util.js",
        "^@actions/glob$": "<rootDir>/node_modules/@actions/glob/lib/glob.js",
        "^@actions/github$":
            "<rootDir>/node_modules/@actions/github/lib/github.js",
        "^@actions/http-client$":
            "<rootDir>/node_modules/@actions/http-client/lib/index.js",
        "^@actions/http-client/lib/auth$":
            "<rootDir>/node_modules/@actions/http-client/lib/auth.js",
        "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    transformIgnorePatterns: [
        "node_modules/(?!(@actions|@octokit|universal-user-agent|before-after-hook)/)"
    ],
    verbose: true
};

const processStdoutWrite = process.stdout.write.bind(process.stdout);
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
process.stdout.write = (str, encoding?, cb?) => {
    // Core library will directly call process.stdout.write for commands
    // We don't want :: commands to be executed by the runner during tests
    if (!String(str).match(/^::/)) {
        return processStdoutWrite(str, encoding, cb);
    }
    return true;
};
