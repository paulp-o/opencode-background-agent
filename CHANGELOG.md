# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-01-22

### Breaking Changes
- **Removed** `background_resume` tool - use `background_task(resume: id, prompt: msg)` instead
- **Removed** `background_block` tool - use `background_output(task_id: id, block: true)` instead

### Changed
- `background_task` now supports resume mode with optional `resume` parameter for continuing existing tasks
- `background_output` now supports optional `block` and `timeout` parameters for blocking mode
- `background_list` shows `(resumed)` indicator for tasks that have been resumed

### Migration
```typescript
// Resume: Before
background_resume(task_id: 'abc123', message: 'continue working on this')
// Resume: After
background_task(resume: 'abc123', prompt: 'continue working on this')

// Block: Before
background_block(task_ids: ['abc123'], timeout: 60000)  // timeout in ms
// Block: After
background_output(task_id: 'abc123', block: true, timeout: 60)  // timeout in seconds
```

## [0.1.1] - 2026-01-20

### Fixed
- Corrected npm package name in README badges and installation instructions
- Fixed GitHub repository links throughout documentation
- Added bugs and homepage URLs to package.json

## [0.1.0] - 2026-01-19

### Added
- Initial release of @paulp-o/opencode-background-agent
- `background_task` tool for launching async agent tasks
- `background_output` tool for retrieving task results
- `background_cancel` tool for cancelling running tasks
- `background_list` tool for listing all tasks
- `background_clear` tool for clearing all tasks
- Real-time progress tracking with toast notifications
- Automatic task completion notifications
- npm release system with conventional commits
