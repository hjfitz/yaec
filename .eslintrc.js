module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "max-len": ["error", { "code": 160 }],
		"implicit-arrow-linebreak": 0,
		"semi": ["error", "never"],
		"indent": ["error", "tab"],
		"camelcase": 0,

		"no-underscore-dangle": 0,
		"import/no-cycle": 1,
		"no-param-reassign": 0,
		"no-return-assign": 0,
		"no-console": 0,
		"no-void": 0,
    "no-tabs": 0,
    "curly": 0,
    "nonblock-statement-body-position": 0,
    
    "max-classes-per-file": 0,
    "lines-between-class-members": 0,

		"object-curly-spacing": ["error", "never"],
		"object-curly-newline": 0,
  },
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  },
  "overrides": [
    {
      "files": ["**/*.ts", "**/*.tsx"],
      "rules": {
        "no-unused-vars": ["off"],
        "no-undef": ["off"]
      }
    }
  ]
};
