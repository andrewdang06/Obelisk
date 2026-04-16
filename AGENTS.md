# AGENTS.md

## Project Purpose
This repository implements a Codex Reliability Layer: a web app and backend orchestration system that improves Codex CLI reliability through planning, repo memory, verification, and review.

## Rules
- Always plan before coding.
- Keep changes small and reviewable.
- Prefer modular services over tightly coupled logic.
- Never claim completion if verification has not run.
- If a step fails, report it clearly.
- Preserve a clean separation between UI, API, execution, and verification.

## MVP Priorities
1. End-to-end functionality
2. Clear data flow
3. Honest run status
4. Simple but solid UI
5. Easy local setup

## Planning Contract
Every coding task must produce a saved plan before execution. A useful plan in this repository includes:
- A task summary in plain language.
- Concrete implementation steps that can be reviewed before Codex runs.
- Likely files or directories that should change.
- Risk notes for migrations, shared services, auth boundaries, filesystem access, child process execution, and UI state.
- Verification commands that the system will attempt after execution.
- Rollback notes that explain how to unwind the change if verification fails.

Plans are not decorative. They are used later to evaluate adherence by comparing expected files, changed files, risky file access, and verification outcomes.

## Reliability Flow
1. Register a local repository and store its path.
2. Load repo memory and target-repo `AGENTS.md` guidance.
3. Save a task and generate a plan.
4. Execute Codex CLI from inside the target repo with task, plan, memory, and guidance.
5. Capture stdout, stderr, timestamps, exit status, changed files, and diff summary.
6. Run verification commands when available.
7. Compute confidence from objective evidence, not optimism.
8. Present a review screen that makes failures and uncertainty visible.

## Completion Checklist
For each task:
1. Update or create a plan.
2. Implement code.
3. Run or define verification.
4. Summarize changed files.
5. State remaining issues honestly.

## Coding Standards
- Use TypeScript throughout where possible.
- Prefer readable code over clever abstractions.
- Use descriptive naming.
- Keep components reusable.
- Keep comments minimal and useful.

## Repository-Specific Guidance
- Keep database access in `src/lib` service modules or focused repository helpers.
- Keep route handlers thin: validate input, call services, return typed responses.
- Keep UI components presentational unless colocating a small server action is clearer.
- Treat Codex CLI execution as an auditable operation: persist command, timing, stdout, stderr, status, diff summary, and verification results.
- Confidence scores must be explainable from stored run data, not arbitrary decoration.
- Prefer explicit statuses over booleans for task, run, and verification state.
- Do not hide missing environment variables or unavailable commands behind fake success states.
- Maintain a cohesive product visual system across pages; avoid default template styling.
