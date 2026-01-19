# Change: Add npm Deploy and Release System

## Why

The project currently lacks any build or release infrastructure. To distribute the background agent plugin via npm for the OpenCode ecosystem, we need a complete local build and release workflow that:
- Compiles TypeScript to publishable JavaScript
- Generates type declarations for TypeScript consumers
- Manages semantic versioning with conventional commits
- Automates changelog generation
- Publishes to npm registry

This enables users to install the plugin via `opencode.json` configuration: `"plugin": ["opencode-background-agent"]`

## What Changes

### Package Configuration
- Add complete `package.json` with npm publishing metadata
- Configure package name: `opencode-background-agent`
- Set initial version: `0.1.0`
- Configure ESM-only module format with proper `exports` field
- Set `@opencode-ai/plugin` as peerDependency

### Source Structure
- Rename `background-agent-0118oldbasednew.ts` to `src/index.ts`
- Create standard `src/` directory structure

### Build System
- Add `tsconfig.json` for TypeScript compilation and type declaration generation
- Use Bun build for fast JavaScript compilation
- Use `tsc` for `.d.ts` type declaration generation
- Output to `dist/` directory

### Code Quality
- Add Biome for linting and formatting (fast, Rust-based)
- Configure strict TypeScript checking

### Testing
- Set up Bun test runner
- Add test script for pre-publish validation

### Version Management
- Integrate conventional-changelog for auto-generated changelogs
- Use conventional commits for automatic version bumping
- Create git tags with `v` prefix (e.g., `v0.1.0`)

### Release Workflow
- Single `release` script that handles: build, test, version bump, changelog, tag, publish
- Support `--dry-run` flag for testing
- Use `NPM_TOKEN` environment variable for authentication
- Add `prepublishOnly` hook for validation

### Documentation
- Update README with installation and usage instructions
- Add CHANGELOG.md (auto-generated)
- Add LICENSE file (MIT)

## Impact

- **Affected specs**: None (new capability)
- **New capability**: `npm-release`
- **Affected code**: 
  - `package.json` (complete rewrite)
  - Source file relocation
  - New configuration files: `tsconfig.json`, `biome.json`
  - New scripts in `scripts/` directory
- **Breaking changes**: None (first release)
