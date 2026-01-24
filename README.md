# Avro Explorer

A professional VSCode extension for viewing and exploring Avro files with an interactive interface.

![Avro Explorer](images/logo.svg)

## Features

- 📊 **Interactive Data Table** - Sort, filter, and search through Avro records with Tabulator
- 📋 **Schema Display** - View Avro schema with syntax highlighting (Prism.js)
- ↔️ **Split View** - Compare schema and records side by side
- 💾 **Export** - Export data to CSV or JSON files
- 🎨 **Theme Aware** - Automatically adapts to VSCode light/dark themes
- ⚡ **Fast Loading** - Uses esbuild for optimized bundling

## Getting Started

### Quick Start
Just double-click any `.avro` file to open it in Avro Explorer, or right-click and select "Open in Avro Explorer".

### View Modes
- **Split View** (⇆) - See schema and records side by side
- **Schema Only** (📋) - Focus on the Avro schema definition
- **Records Only** (📊) - Full-screen data table view

### Export Data
Click the export buttons to save records as:
- **CSV** - Comma-separated values for spreadsheet applications
- **JSON** - Full JSON data with indentation

## Requirements

- VSCode 1.78.0 or higher
- Uncompressed Avro files (deflate/snappy compression not supported)

## Installation

1. Open VSCode
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type `Extensions: Install from VSIX`
4. Select the `.vsix` file

Or publish to VSCode Marketplace.

## Building

```bash
# Install dependencies
npm install

# Compile and bundle
npm run compile

# Watch mode for development
npm run watch

# Production build
npm run package
```

## License

Apache License 2.0
