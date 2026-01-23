# AGENTS.md for avro-viewer VSCode Extension

This document provides guidelines and instructions for agentic coding agents working on the avro-viewer VSCode extension project.

## Project Overview

**avro-viewer** is a simple VSCode extension that allows users to preview .avro files. It provides two main features:

1. Displaying the schema of an Avro file in a webview
2. Displaying the records from an Avro file in a table format

The extension is written in JavaScript (ES2020) and uses the `avsc` library for Avro file processing.

## Build/Lint/Test Commands

### Package Management

```bash
# Install dependencies
npm install
```

### Linting

```bash
# Run ESLint on all files
npm run lint
```

### Testing

```bash
# Run all tests (includes linting first)
npm test

# Run tests without linting (not recommended)
node ./test/runTest.js
```

### Development

```bash
# Run extension in development mode (VSCode debugger required)
# Use the "Run Extension" launch configuration in VSCode
```

## Code Style Guidelines

### Language and Version

- **Language**: JavaScript (ES2020)
- **Module System**: CommonJS (Node.js)
- **Target**: Node.js v16+ (compatible with VSCode 1.78.0+)

### File Structure

```
avro-viewer/
├── extension.js          # Main extension entry point
├── package.json          # Extension metadata and dependencies
├── .eslintrc.json        # ESLint configuration
├── jsconfig.json         # TypeScript/JavaScript compiler config
├── images/               # Extension icons and assets
├── samples/              # Sample Avro files
├── test/                 # Test files
│   ├── runTest.js        # Test runner
│   └── suite/
│       ├── extension.test.js    # Extension tests
│       └── index.js             # Test suite setup
└── .vscode/              # VSCode configuration
```

### Imports and Dependencies

#### External Modules

```javascript
// CommonJS require syntax
const vscode = require('vscode');
const avro = require('avsc');
```

#### Project Structure

- Single entry point: `extension.js`
- All code resides in a single file for simplicity
- No submodules or complex file structure

### Naming Conventions

#### Variables

```javascript
// Use camelCase for variables
const avroPath = vscode.window.activeTextEditor.document.fileName;
const avroBasename = avroPath.split('/').pop().split('.').shift();
```

#### Functions

```javascript
// Use camelCase for function names
function getHtmlSchema(schema) {
  // ...
}

function getHtmlRecords(matrix) {
  // ...
}
```

#### Constants

```javascript
// Use const for immutable values
const vscode = require('vscode');
```

### Code Formatting

#### Indentation

- Use 4 spaces per indentation level

#### Line Length

- Aim for 80 characters per line (soft limit)
- Line breaks after logical operators or at natural code boundaries

#### Semicolons

- Optional but recommended

### Error Handling

#### Current Implementation

The extension has minimal error handling. Key points:

1. No explicit error catching around async operations
2. Decoder events are assumed to succeed
3. NULL checks are performed on record values: `(record[field] !== undefined && record[field] !== null) ? record[field] : ''`

#### Best Practices for Changes

```javascript
// Example of improved error handling
decoder.on('error', (err) => {
  vscode.window.showErrorMessage(`Error reading Avro file: ${err.message}`);
  console.error('Avro file reading error:', err);
});

// Always validate inputs
function getHtmlSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    return '<p>Invalid schema</p>';
  }
  // ...
}
```

### Documentation

#### Comments

```javascript
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // ...
}
```

- Use JSDoc comments for functions and parameters
- Keep comments concise and relevant
- Explain why, not what (code should be self-documenting)

#### README.md

- Contains usage instructions and limitations
- Include screenshots to demonstrate features

### Testing

#### Test Framework

- **Framework**: Mocha
- **Assertions**: Node.js assert module
- **Test Files**: `test/suite/extension.test.js`

#### Running Tests

```bash
# Run all tests
npm test

# Run tests in VSCode debugger
# Use the "Extension Tests" launch configuration
```

#### Writing Tests

```javascript
const assert = require('assert');
const vscode = require('vscode');

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});
```

### VSCode Extension Development

#### Key API Concepts

```javascript
// Command registration
let disposable = vscode.commands.registerCommand(
  'avro-viewer.open',
  function () {
    // Command handler
  }
);

// Webview creation
let panel = vscode.window.createWebviewPanel(
  'Schema',
  `Schema: ${avro_basename}`,
  vscode.ViewColumn.One,
  {}
);
panel.webview.html = getHtmlSchema(schema);
```

#### Extension Context

- Activation events: None (activates on command invocation)
- Subscriptions: Always dispose resources when deactivating
- Context management: Store disposable commands in `context.subscriptions`

### Avro File Processing

#### Library

- **avsc**: v5.7.7
- **File Decoding**: `avro.createFileDecoder()` for streaming Avro file processing

#### Key Methods

```javascript
// Create file decoder
const decoder = avro.createFileDecoder(avroPath);

// Event handlers
decoder.on('metadata', (metadata) => {
  /* Get schema */
});
decoder.on('data', (data) => {
  /* Get records */
});
decoder.on('end', () => {
  /* File decoding complete */
});
```

### Current Limitations

1. **Compression**: Cannot handle deflate/snappy compressed Avro files
2. **Large Files**: No pagination or virtual scrolling for large datasets
3. **Error Handling**: Minimal error handling and user feedback
4. **Schema Display**: Basic JSON stringification without syntax highlighting
5. **Record Display**: Simple HTML table without sorting or filtering

### Best Practices for Development

1. Keep code simple and maintainable
2. Prioritize user experience and feedback
3. Test with various Avro file sizes and schemas
4. Follow VSCode extension development guidelines
5. Document all changes in CHANGELOG.md

## Configuration Files

### package.json

```json
{
  "engines": {
    "vscode": "^1.78.0"
  },
  "dependencies": {
    "avsc": "^5.7.7"
  }
}
```

### .eslintrc.json

```json
{
  "env": {
    "browser": false,
    "commonjs": true,
    "es6": true,
    "node": true,
    "mocha": true
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "no-const-assign": "warn",
    "no-this-before-super": "warn",
    "no-undef": "warn",
    "no-unreachable": "warn",
    "no-unused-vars": "warn",
    "constructor-super": "warn",
    "valid-typeof": "warn"
  }
}
```

### jsconfig.json

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "checkJs": true,
    "lib": ["ES2020"]
  },
  "exclude": ["node_modules"]
}
```

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Make changes following the guidelines above
4. Test your changes
5. Submit a pull request
