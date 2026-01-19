# Design: npm Deploy and Release System

## Context

This project is an OpenCode plugin that needs to be distributed via npm. The plugin ecosystem expects:
- ESM module format (matches OpenCode's architecture)
- TypeScript type declarations for developer experience
- Semantic versioning for dependency management
- Clean, minimal published package

### Constraints
- Local-only workflow (no GitHub Actions)
- Must work with Bun runtime (project uses Bun)
- Must integrate with OpenCode plugin loading system
- Single maintainer workflow

### Reference Implementations
Analyzed existing OpenCode plugins on npm:
- `opencode-helicone-session`: Bun build, ESM, dist/ output
- `opencode-wakatime`: Bun build, ESM, types generation
- `@opencode-ai/plugin`: The plugin framework itself

## Goals / Non-Goals

### Goals
- Simple, single-command release process
- Automatic changelog from commit history
- Type-safe package with `.d.ts` declarations
- Minimal configuration overhead
- Fast build times

### Non-Goals
- CI/CD integration (explicitly local-only)
- Dual ESM/CJS output (ESM-only is sufficient for OpenCode)
- Monorepo support
- Multiple entry points

## Decisions

### Decision 1: Build Toolchain

**Choice**: Bun build + tsc (hybrid approach)

**Rationale**:
- Bun build: Fast JavaScript bundling, matches ecosystem
- tsc: Required for `.d.ts` generation (Bun doesn't support this)
- This is the pattern used by other OpenCode plugins

**Alternatives considered**:
- tsc only: Slower, but simpler single tool
- tsup: Zero-config bundler, but adds dependency overhead
- esbuild: Fast, but Bun build is native to the ecosystem

### Decision 2: Module Format

**Choice**: ESM-only

**Rationale**:
- OpenCode uses ESM internally
- All reference plugins use ESM
- Simpler configuration
- Modern Node.js (18+) fully supports ESM

**Alternatives considered**:
- Dual ESM/CJS: More compatible but adds complexity
- CJS only: Outdated, not recommended

### Decision 3: Version Management

**Choice**: Conventional commits + conventional-changelog

**Rationale**:
- Industry standard
- Automatic version bumping from commit messages
- Structured, parseable commit history
- Auto-generated CHANGELOG.md

**Alternatives considered**:
- Manual versioning: Error-prone, tedious
- auto-changelog: Simpler but less structured

### Decision 4: Linting

**Choice**: Biome

**Rationale**:
- Rust-based: Extremely fast (10-100x faster than ESLint)
- All-in-one: Linter + formatter in single tool
- Zero-config defaults work well for TypeScript
- Active development, growing adoption

**Alternatives considered**:
- ESLint + Prettier: More mature but slower, two tools
- No linting: Not recommended for published packages

### Decision 5: Testing

**Choice**: Bun test

**Rationale**:
- Built into Bun runtime
- Zero configuration
- Fast execution
- Native TypeScript support

**Alternatives considered**:
- Vitest: Excellent but adds dependency
- Jest: Slower, requires configuration

### Decision 6: Dependency Strategy

**Choice**: `@opencode-ai/plugin` as peerDependency

**Rationale**:
- Avoids version conflicts with host application
- User controls which plugin version to use
- Standard pattern for plugin frameworks
- Smaller package size

**Alternatives considered**:
- Regular dependency: May cause version conflicts
- No dependency: Would break type safety

### Decision 7: Authentication

**Choice**: NPM_TOKEN environment variable

**Rationale**:
- More flexible than `npm login`
- Works in any shell environment
- Can be stored securely in shell profile
- Standard CI/CD pattern (even for local use)

**Alternatives considered**:
- Interactive `npm login`: Less automatable
- `.npmrc` file: Risk of committing secrets

## Package Structure

```
opencode-background-agent/
├── src/
│   └── index.ts              # Main plugin source
├── dist/                     # Build output (gitignored)
│   ├── index.js              # Compiled JavaScript
│   └── index.d.ts            # Type declarations
├── scripts/
│   └── release.ts            # Release automation script
├── package.json              # npm package configuration
├── tsconfig.json             # TypeScript configuration
├── biome.json                # Biome linter/formatter config
├── CHANGELOG.md              # Auto-generated changelog
├── README.md                 # Package documentation
└── LICENSE                   # MIT license
```

## package.json Structure

```json
{
  "name": "opencode-background-agent",
  "version": "0.1.0",
  "description": "Background task management plugin for OpenCode AI",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md", "LICENSE", "CHANGELOG.md"],
  "peerDependencies": {
    "@opencode-ai/plugin": "^1.0.0"
  },
  "devDependencies": {
    "@opencode-ai/plugin": "^1.1.25",
    "@biomejs/biome": "^1.x",
    "conventional-changelog-cli": "^4.x",
    "typescript": "^5.x"
  }
}
```

## Release Script Flow

```
release [--dry-run]
    │
    ├─► Validate clean git state
    │
    ├─► Run tests (bun test)
    │
    ├─► Run linting (biome check)
    │
    ├─► Run type check (tsc --noEmit)
    │
    ├─► Build (bun build + tsc declarations)
    │
    ├─► Determine version bump from commits
    │   └─► feat: → minor, fix: → patch, BREAKING: → major
    │
    ├─► Update version in package.json
    │
    ├─► Generate CHANGELOG.md
    │
    ├─► Create git commit + tag (v0.x.x)
    │
    ├─► [if not --dry-run] npm publish
    │
    └─► Push to git remote with tags
```

## Risks / Trade-offs

### Risk: Bun build + tsc is two tools
- **Mitigation**: Build script abstracts this; single command for users
- **Trade-off**: Slightly more complex setup, but faster builds

### Risk: Conventional commits require discipline
- **Mitigation**: Biome can lint commit messages (future enhancement)
- **Trade-off**: Learning curve for contributors

### Risk: NPM_TOKEN in environment
- **Mitigation**: Document secure storage practices
- **Trade-off**: User must manage token security

## Migration Plan

1. Create `src/` directory
2. Move and rename source file
3. Add configuration files
4. Add build scripts
5. Test build locally
6. Test publish with `--dry-run`
7. Publish initial version

## Open Questions

None - all questions resolved through user clarification.
