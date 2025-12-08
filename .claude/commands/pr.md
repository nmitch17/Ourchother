# Quick Pull Request

Create a branch, commit all uncommitted changes, push, and open a pull request in one streamlined workflow. Follow the `Instructions` below, execute the `Run` section, and then follow the `Report` section.

## Instructions

- Analyze the uncommitted changes to understand what was modified
- Generate a branch name in kebab-case that describes the changes (e.g., `fix/login-validation-error`, `feat/add-user-dashboard`, `chore/update-dependencies`)
- Branch name prefixes: `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`
- Generate a concise commit message:
  - Present tense (e.g., "add", "fix", "update")
  - 50 characters or less for the subject line
  - Descriptive of the actual changes made
- Generate a PR title and body:
  - Title format: `<type>: <description>` (e.g., `feat: add user dashboard`)
  - Body should include a summary of changes and any relevant context
- IMPORTANT: If there are no uncommitted changes, report that and stop

## Run

1. Run `git status` and `git diff` to understand what changes have been made
2. Run `git log --oneline -5` to see recent commit style for context
3. Determine the appropriate branch name based on the changes
4. Run `git checkout -b <branch_name>` to create and switch to the new branch
5. Run `git add -A` to stage all changes
6. Run `git commit -m "<commit_message>"` to create the commit
7. Run `git push -u origin <branch_name>` to push the branch
8. Run `gh pr create --title "<pr_title>" --body "<pr_body>" --base main` to create the PR
9. Capture the PR URL from the output

## Report

Return the following:
- Branch name created
- Commit message used
- PR URL
