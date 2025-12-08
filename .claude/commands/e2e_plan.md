# E2E Test Plan Generator

Generate and execute a comprehensive Playwright MCP end-to-end test plan based on the most recent implementation work.

## Instructions

You are creating and executing an E2E test plan for the feature/fix that was just implemented via the `/implement` command.

### Phase 1: Gather Context

1. **Read the Git History** to understand what was just implemented:
   ```bash
   # Get the most recent commits (from the current branch)
   git log --oneline -20

   # Get detailed diff of recent changes
   git diff HEAD~5..HEAD --stat

   # Read the full diff for context
   git diff HEAD~5..HEAD
   ```

2. **Identify the Spec File** that was implemented:
   - Check `specs/` directory for the most recently implemented spec file
   - Read the spec to understand expected behavior and acceptance criteria

3. **Review the Changed Files**:
   - Understand what components, routes, or features were added/modified
   - Note any UI components that need visual testing
   - Identify user flows that need E2E validation

### Phase 2: Setup Test Infrastructure

1. **Create E2E Tests Directory** (if it doesn't exist):
   ```bash
   mkdir -p .claude/commands/e2e_tests
   ```

2. **Create Screenshots Directory** (if it doesn't exist):
   ```bash
   mkdir -p .claude/data/screenshots
   ```

### Phase 3: Generate Test Plan Document

Create a comprehensive test plan file at `.claude/commands/e2e_tests/{feature-name}.md` with:

1. **Overview**: What feature is being tested
2. **Prerequisites**: Dev server, authentication requirements
3. **Test Sections**: Organized by user flow or component
4. **Each Test Case** should include:
   - Step-by-step instructions
   - Expected results
   - Failure indicators
5. **Technical Notes**: Related files, implementation details
6. **Screenshot Checkpoints**: Key visual states to capture

### Phase 4: Execute Tests with Playwright MCP

Use the Playwright MCP tools to execute each test:

#### Before Testing - Capture "Before" Screenshots

For each major test section, take a screenshot BEFORE making any interactions:

```
Screenshot naming convention:
.claude/data/screenshots/{feature}-{section}-{description}-before.png

Examples:
- tags-admin-form-initial-state-before.png
- tags-public-submit-empty-form-before.png
- tags-selection-multiple-tags-before.png
```

Use `mcp__playwright__browser_take_screenshot` with descriptive filenames.

#### Test Execution Flow

1. **Navigate** to the page using `mcp__playwright__browser_navigate`
2. **Take Snapshot** using `mcp__playwright__browser_snapshot` to get element refs
3. **Capture "Before" Screenshot** using `mcp__playwright__browser_take_screenshot`
4. **Interact** with elements using:
   - `mcp__playwright__browser_click` for clicks
   - `mcp__playwright__browser_type` for text input
   - `mcp__playwright__browser_fill_form` for form fills
5. **Verify** results by taking new snapshots and comparing
6. **Document** any failures or unexpected behavior

#### When Issues Are Found

1. **Document the Issue**: Note what failed and expected vs actual behavior
2. **Fix the Code**: Make necessary corrections to the implementation
3. **Re-run the Test**: Verify the fix resolves the issue
4. **Repeat** until all tests pass

### Phase 5: Capture "After" Screenshots

Once all tests pass and behavior matches the spec:

1. Take corresponding "after" screenshots for each "before" screenshot:
   ```
   .claude/data/screenshots/{feature}-{section}-{description}-after.png
   ```

2. Screenshots should demonstrate:
   - Correct visual appearance
   - Expected state after interactions
   - Successful completion of user flows

### Phase 6: Generate Summary Report

Create a summary showing:

| Test Section | Status | Before Screenshot | After Screenshot |
|--------------|--------|-------------------|------------------|
| Section 1    | ✅ Pass | [before.png]      | [after.png]      |
| Section 2    | ✅ Pass | [before.png]      | [after.png]      |

Include:
- Total tests executed
- Pass/fail counts
- Any fixes that were made
- Screenshots location

---

## Test Execution Template

For each test section, follow this pattern:

```markdown
### Executing Test X.Y: {Test Name}

**Step 1: Navigate and capture initial state**
- Navigate to {URL}
- Take snapshot
- Capture screenshot: {feature}-{section}-{description}-before.png

**Step 2: Perform actions**
- {Action 1}
- {Action 2}
- ...

**Step 3: Verify results**
- Expected: {expected behavior}
- Actual: {actual behavior}
- Status: ✅ PASS / ❌ FAIL

**Step 4: If FAIL, fix and re-test**
- Issue: {description}
- Fix: {what was changed}
- Re-test result: ✅ PASS

**Step 5: Capture final state**
- Screenshot: {feature}-{section}-{description}-after.png
```

---

## Important Guidelines

1. **Always start fresh**: Navigate to the page, don't assume state
2. **Use snapshots liberally**: `browser_snapshot` gives you element refs for interactions
3. **Screenshot key states**: Before/after for visual verification
4. **Fix issues immediately**: Don't continue testing broken functionality
5. **Match the spec exactly**: Tests should verify spec requirements
6. **Document everything**: Future reference for regression testing

## Playwright MCP Tools Reference

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Go to a URL |
| `browser_snapshot` | Get page accessibility tree with element refs |
| `browser_take_screenshot` | Capture visual state |
| `browser_click` | Click an element |
| `browser_type` | Type text into element |
| `browser_fill_form` | Fill multiple form fields |
| `browser_press_key` | Press keyboard key |
| `browser_wait_for` | Wait for text/element |
| `browser_console_messages` | Check for errors |

---

## Output

When complete, provide:

1. **Test Plan Location**: Path to the generated `.md` file in `e2e_tests/`
2. **Screenshots Location**: Path to screenshots in `.claude/data/screenshots/`
3. **Summary Table**: Pass/fail status for each test section
4. **Fixes Made**: List of any code changes required
5. **Final Status**: Overall test suite result
