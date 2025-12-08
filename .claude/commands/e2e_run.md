# Execute E2E Test Plan with Parallel Agents

Execute the E2E test plan at the specified path using Playwright MCP tools, **spawning parallel agents** for independent test sections to maximize efficiency.

## Test Plan Location
$ARGUMENTS

## Instructions

You are executing an E2E test plan using Playwright MCP. This command uses **parallel agent execution** to run independent test sections concurrently.

### Phase 1: Load, Parse, and Analyze Test Plan

1. **Read the test plan file** at the path specified above
2. **Parse all test sections** and create a structured list
3. **Identify prerequisites** (dev server URL, authentication requirements, etc.)
4. **Analyze section dependencies** to determine which can run in parallel:

#### Dependency Analysis Rules
Sections are **INDEPENDENT** (can run in parallel) if they:
- Test different pages/URLs (e.g., `/admin/events` vs `/submit` vs `/docs/api`)
- Test different features that don't share state
- Are purely UI/visual validation tests
- Don't create/modify shared data that other sections read

Sections are **DEPENDENT** (must run sequentially) if they:
- Create data in one section that's verified in another
- Require a specific sequence (e.g., create → edit → delete)
- Modify application state that affects other tests
- Build on UI state from previous sections

### Phase 2: Setup

1. **Ensure screenshots directory exists**:
   ```bash
   mkdir -p .claude/data/screenshots
   ```

2. **Verify dev server is running** by navigating to the base URL specified in prerequisites. If no server is running, run '/start' slash command.

3. **Create master todo list** with all sections grouped by parallelization strategy

### Phase 3: Spawn Parallel Test Agents

Based on your dependency analysis, spawn multiple agents using the **Task tool** to run independent test sections in parallel.

#### Agent Spawning Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    PARALLEL EXECUTION                        │
├─────────────────────────────────────────────────────────────┤
│  Agent 1: UI Display Tests    │  Agent 2: Form Tests        │
│  - Section 1: Page Layout     │  - Section 5: Form Display  │
│  - Section 3: Styling         │  - Section 6: Form Input    │
├─────────────────────────────────│─────────────────────────────┤
│  Agent 3: Navigation Tests    │  Agent 4: Responsive Tests  │
│  - Section 2: Tab Switching   │  - Section 8: Mobile View   │
│  - Section 7: Deep Linking    │  - Section 9: Tablet View   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  SEQUENTIAL (IF NEEDED)                      │
│  Agent 5: Data Flow Tests (depends on parallel results)     │
│  - Section 10: Create → Verify → Modify cycle               │
└─────────────────────────────────────────────────────────────┘
```

#### Spawn Agents Using Task Tool

For each parallel group, spawn an agent with this prompt structure:

```markdown
Execute E2E tests for sections [X, Y, Z] from the test plan.

## Test Plan Context
[Include relevant sections from the test plan]

## Your Assigned Sections
- Section X: [Name] - Tests [1.1, 1.2, 1.3]
- Section Y: [Name] - Tests [2.1, 2.2]
- Section Z: [Name] - Tests [3.1, 3.2, 3.3]

## Execution Instructions
1. Use Playwright MCP tools for all browser interactions
2. Take screenshots: .claude/data/screenshots/{feature}-{section}-{test}-[before|after].png
3. For each test, report: PASS ✅ | FAIL ❌ | SKIPPED ⚠️
4. If a test fails, document the failure but continue to next test
5. Return a structured result with all test outcomes

## Expected Output Format
Return a JSON-structured result:
{
  "sections_tested": ["X", "Y", "Z"],
  "results": [
    {"section": "X", "test": "1.1", "status": "PASS", "notes": "..."},
    {"section": "X", "test": "1.2", "status": "FAIL", "error": "...", "screenshot": "..."},
    ...
  ],
  "issues_found": [...],
  "fixes_needed": [...]
}
```

#### Parallel Grouping Examples

**For a typical test plan, group like this:**

| Agent | Focus Area | Typical Sections | Why Parallel? |
|-------|------------|------------------|---------------|
| 1 | Page Load & Layout | Sections 1, 11 | Read-only visual checks |
| 2 | Navigation & Tabs | Sections 2, 13 | Different interaction patterns |
| 3 | Component Display | Sections 3, 8 | Isolated UI verification |
| 4 | Form Interactions | Sections 4, 5 | Can use separate form instances |
| 5 | Responsive Design | Sections 12 | Viewport testing, no data changes |
| 6 | Accessibility | Section 9 | Read-only accessibility audit |

**Sequential after parallel:**
| Agent | Focus Area | Sections | Why Sequential? |
|-------|------------|----------|-----------------|
| 7 | Data Persistence | Sections 6, 7, 10 | Creates data → verifies → modifies |

### Phase 4: Spawn All Parallel Agents at Once

**CRITICAL**: Use a single message with multiple Task tool calls to spawn all parallel agents simultaneously:

```
<Task tool call 1: subagent_type="general-purpose" - UI Display tests>
<Task tool call 2: subagent_type="general-purpose" - Navigation tests>
<Task tool call 3: subagent_type="general-purpose" - Form Display tests>
<Task tool call 4: subagent_type="general-purpose" - Responsive tests>
... (all in ONE message)
```

Set `run_in_background: true` for all agents, then use `AgentOutputTool` to collect results.

### Phase 5: Collect Results and Run Sequential Tests

1. **Wait for all parallel agents** using `AgentOutputTool`
2. **Aggregate results** from all agents
3. **If sequential tests exist**, spawn agent(s) for those sections
4. **Collect final results**

### Phase 6: Generate Unified Summary Report

After all agents complete, aggregate their results:

```markdown
## E2E Test Summary (Parallel Execution)

### Test Plan: {plan file name}
### Execution Date: {date}
### Execution Mode: Parallel ({N} agents)

### Agent Execution Summary
| Agent | Sections | Tests Run | Passed | Failed | Duration |
|-------|----------|-----------|--------|--------|----------|
| 1 | 1, 11 | 8 | 8 | 0 | ~30s |
| 2 | 2, 13 | 6 | 5 | 1 | ~45s |
| 3 | 3, 8 | 10 | 10 | 0 | ~25s |
| ... | ... | ... | ... | ... | ... |

### Detailed Results by Section
| Section | Test | Status | Agent | Notes |
|---------|------|--------|-------|-------|
| 1 | 1.1 | ✅ PASS | 1 | |
| 1 | 1.2 | ✅ PASS | 1 | |
| 2 | 2.1 | ❌ FAIL | 2 | Element not found |
...

### Overall Results
- **Total Tests**: X
- **Passed**: X (Y%)
- **Failed**: X
- **Skipped**: X

### Issues Found (Aggregated)
1. [Agent 2] Section 2.1: {Issue description}
2. ...

### Fixes Needed
1. {File}: {Description}
2. ...

### Screenshots Location
`.claude/data/screenshots/`
```

## Playwright MCP Tools Quick Reference

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Navigate to a URL |
| `browser_snapshot` | Get page accessibility tree with element refs |
| `browser_take_screenshot` | Capture visual state to file |
| `browser_click` | Click an element (requires ref from snapshot) |
| `browser_type` | Type text into an element |
| `browser_fill_form` | Fill multiple form fields at once |
| `browser_press_key` | Press keyboard key (Enter, Tab, etc.) |
| `browser_select_option` | Select dropdown option |
| `browser_wait_for` | Wait for text to appear/disappear |
| `browser_console_messages` | Check for JS errors |
| `browser_hover` | Hover over an element |
| `browser_resize` | Change viewport size |
| `browser_tabs` | Manage multiple browser tabs |

## Important Guidelines

1. **Maximize parallelization**: Spawn as many agents as there are independent section groups
2. **Use background execution**: Set `run_in_background: true` for all parallel agents
3. **Include full context**: Each agent prompt must include the specific test steps from the plan
4. **Standardize output format**: All agents should return structured JSON results
5. **Always use fresh snapshots**: Take a new `browser_snapshot` before each interaction
6. **Element refs change**: After any page change, element refs from previous snapshots are invalid
7. **Screenshot everything**: Visual evidence helps verify behavior and debug failures
8. **Document failures immediately**: Don't skip broken tests - note them for later fixing
9. **Check console for errors**: JS errors often indicate bugs that need fixing

## Browser Tab Strategy for Parallel Agents

Each parallel agent can use `browser_tabs` to manage its own tab:
```
1. Agent opens new tab: browser_tabs(action: "new")
2. Agent works in its tab
3. When done, agent can close its tab or leave it for inspection
```

This prevents agents from interfering with each other's browser state.

## Output

When complete, provide:

1. **Parallel execution summary** showing agent distribution
2. **Aggregated results table** with all test outcomes
3. **Screenshots location** for visual verification
4. **Issues list** aggregated from all agents
5. **Overall status**: PASS (all tests pass) or FAIL (with failure count)
6. **Recommendations** for any issues found
