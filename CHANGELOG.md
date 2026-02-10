# Changelog

All notable changes to Avro Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2026-02-10

### Fixed

- **Long Type Compatibility**: Fixed JavaScript compatibility issues with long data types (BigInt)

### Improved

- **Display Optimization**: Enhanced table display when viewport is not wide enough

### Added

- **Data Preview Panel**: Added a dedicated preview panel to display full cell data content

## [0.3.1] - 2026-01-29

### Changed

- **Blueprint 6 Upgrade**: Refactored layout using `Section` and `SectionCard` components for a professional look.
- **Virtualized Table**: Integrated `@blueprintjs/table` (Table2) to support smooth scrolling of large datasets without manual pagination.
- **Inline Column Filtering**: Filter records directly from each table column header.
- **Theme Synchronization Hook**: Automatic detection and application of `bp6-dark` based on VS Code's active theme.

## [0.3.0] - 2024-01-24

### Added

- **Custom Editor Support**: Double-click .avro files to open directly in Avro Explorer
- **Split View**: Side-by-side schema and records view with resizable panel
- **Interactive Data Table**: Sortable, filterable columns with Tabulator
- **Theme Awareness**: Automatic light/dark theme adaptation using color-mix
- **Export Functionality**: Save data as CSV or JSON with system save dialog
- **VSCode Notifications**: Schema copy notifications using native API
- **New Icon**: Combined Apache Avro logo with eye icon

### Changed

- **Project Rename**: From "avro-viewer" to "Avro Explorer"
- **Publisher**: New publisher account (winse)
- **UI Refresh**: Icon-only toolbar buttons with segmented control style
- **Enhanced Styling**: Windows-style row colors with hover/select states

### Fixed

- Tab switching issue causing content loss
- CSP configuration for inline scripts
- Panel disposal on editor visibility change

### Technical

- Migrated from vanilla JS to React 18 + TypeScript
- Added esbuild for fast bundling
- ESLint + Prettier + Airbnb configuration

## [0.2.0] - 2023-07 (Original)

### Original Features (by Yasunari Ota)

- Basic Avro file preview
- Schema display
- Records table view
- Copy functionality

---

## Installation

Download from VSCode Marketplace: [Avro Explorer](https://marketplace.visualstudio.com/items?itemName=winse.avro-explorer)

Or install from VSIX:

```bash
code --install-extension avro-explorer-0.3.0.vsix
```
