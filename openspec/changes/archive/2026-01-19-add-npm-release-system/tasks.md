# Tasks: Add npm Deploy and Release System

## 1. Project Structure Setup
- [x] 1.1 Create `src/` directory
- [x] 1.2 Move `background-agent-0118oldbasednew.ts` to `src/index.ts`
- [x] 1.3 Create `scripts/` directory for release automation
- [x] 1.4 Update `.gitignore` to include `dist/` directory

## 2. Package Configuration
- [x] 2.1 Rewrite `package.json` with full npm publishing metadata
  - Name: `opencode-background-agent`
  - Version: `0.1.0`
  - Type: `module`
  - Main: `./dist/index.js`
  - Types: `./dist/index.d.ts`
  - Exports field configuration
  - Files array: `["dist", "README.md", "LICENSE", "CHANGELOG.md"]`
  - Keywords, description, repository, author, license fields
- [x] 2.2 Configure `@opencode-ai/plugin` as peerDependency
- [x] 2.3 Add devDependencies: typescript, @biomejs/biome, conventional-changelog-cli, @types/bun

## 3. TypeScript Configuration
- [x] 3.1 Create `tsconfig.json` with:
  - Strict mode enabled
  - ESM module output
  - Declaration file generation
  - Target ES2022 (modern Node.js)
  - Include `src/**/*`
  - OutDir `dist/`

## 4. Build System
- [x] 4.1 Add `build` script using Bun build
- [x] 4.2 Add `build:types` script using tsc for `.d.ts` generation
- [x] 4.3 Add `clean` script to remove dist/
- [x] 4.4 Add combined `build:all` script (clean + build + types)
- [x] 4.5 Verify build output produces valid ESM module

## 5. Code Quality Setup
- [x] 5.1 Create `biome.json` configuration
- [x] 5.2 Add `lint` script for Biome checking
- [x] 5.3 Add `format` script for Biome formatting
- [x] 5.4 Add `check` script combining lint + format check
- [x] 5.5 Run initial lint/format on source code

## 6. Testing Setup
- [x] 6.1 Create `src/index.test.ts` with basic plugin tests
- [x] 6.2 Add `test` script using Bun test
- [x] 6.3 Verify tests pass before release

## 7. Version Management
- [x] 7.1 Add `conventional-changelog-cli` to devDependencies
- [x] 7.2 Add `changelog` script for generating CHANGELOG.md
- [x] 7.3 Create initial empty `CHANGELOG.md`

## 8. Release Script
- [x] 8.1 Create `scripts/release.ts` with:
  - Clean git state validation
  - Test execution
  - Lint/type check execution
  - Build execution
  - Version bump (patch/minor/major from commits)
  - Changelog generation
  - Git commit and tag creation
  - npm publish (unless --dry-run)
  - Git push with tags
- [x] 8.2 Add `release` script to package.json
- [x] 8.3 Add `release:dry` script for dry-run testing
- [x] 8.4 Add `prepublishOnly` script for safety validation

## 9. npm Publishing Setup
- [x] 9.1 Add `.npmrc` with registry configuration (no tokens)
- [x] 9.2 Document NPM_TOKEN environment variable usage
- [x] 9.3 Add `npm publish --dry-run` validation

## 10. Documentation
- [x] 10.1 Update `README.md` with:
  - Installation instructions
  - Usage with OpenCode
  - Configuration options
  - Development setup
  - Release process
- [x] 10.2 Create `LICENSE` file (MIT)
- [x] 10.3 Document NPM_TOKEN setup in README

## 11. Validation
- [x] 11.1 Run full build pipeline
- [x] 11.2 Run `npm pack` and inspect tarball contents
- [x] 11.3 Run `npm publish --dry-run` to validate
- [x] 11.4 Test local installation with `npm link` (verified: runtime import works)
- [x] 11.5 Validate types work in consuming project (verified: types work with skipLibCheck; strict fails due to upstream @opencode-ai/plugin exports)
- [x] 11.6 Run `openspec validate add-npm-release-system --strict` (completed via archive)

## Dependencies

```
1.x (Structure) ─┬─► 2.x (Package Config)
                 └─► 3.x (TypeScript Config)
                         │
2.x + 3.x ──────────────►├─► 4.x (Build System)
                         │
4.x ────────────────────►├─► 5.x (Code Quality) ──► 6.x (Testing)
                         │
6.x ────────────────────►├─► 7.x (Version Management)
                         │
7.x ────────────────────►├─► 8.x (Release Script)
                         │
8.x ────────────────────►├─► 9.x (npm Setup)
                         │
9.x ────────────────────►├─► 10.x (Documentation)
                         │
10.x ───────────────────►└─► 11.x (Validation)
```

## Parallelizable Work

After structure setup (1.x):
- **Parallel Group A**: 2.x (Package Config) + 3.x (TypeScript Config)
- **Parallel Group B**: 5.x (Code Quality) + 6.x (Testing) after build works

## Estimated Effort

| Section | Effort |
|---------|--------|
| 1. Structure | 5 min |
| 2. Package Config | 15 min |
| 3. TypeScript Config | 10 min |
| 4. Build System | 20 min |
| 5. Code Quality | 15 min |
| 6. Testing | 20 min |
| 7. Version Management | 10 min |
| 8. Release Script | 30 min |
| 9. npm Setup | 10 min |
| 10. Documentation | 20 min |
| 11. Validation | 15 min |
| **Total** | **~3 hours** |
