# Project Plan

## Objective
Build a local-first control panel that improves Codex CLI reliability by forcing a reviewable sequence: repository context, structured plan, execution, verification, confidence scoring, and human review.

## Product Flow
1. A user adds a local repository path.
2. The system records repo memory and loads target-repo `AGENTS.md` guidance when present.
3. A user submits a coding task.
4. The planner saves a structured plan before any execution starts.
5. The execution service runs Codex CLI inside the selected repository.
6. The system records logs, timing, command status, changed files, and diff summary.
7. The verification service runs tests, lint, and typecheck when scripts are available.
8. The confidence scorer combines verification, plan adherence, risky files, diff size, and execution cleanliness.
9. The review UI shows the full evidence trail for a human decision.

## System Boundaries
- UI pages and components live in `src/app` and `src/components`.
- Route handlers validate HTTP input and call services.
- Services in `src/lib` own database access, planning, memory, execution, verification, scoring, and git inspection.
- Prisma owns persistence and should remain the only direct database layer.
- Child process execution is isolated to execution and verification services.

## MVP Assumptions
- PostgreSQL is configured through `DATABASE_URL`.
- Codex CLI is available as `codex`, or `CODEX_CLI_COMMAND` points to the executable.
- Target repositories are already present on the local machine and readable by the web server process.
- Verification commands are inferred from package scripts first. Missing commands are marked skipped, not passed.
- The app is local infrastructure, so repository paths are stored as local absolute paths.

## Evidence Model
The system should preserve enough information to answer:
- What did the user ask for?
- What did the system plan before execution?
- What instructions and memory were used?
- What command ran, where did it run, and when?
- What did Codex write to stdout and stderr?
- Which files changed?
- Did tests, lint, and typecheck run?
- Why did the confidence score land where it did?

## Delivery Order
1. Repository setup and AGENTS.md
2. Next.js application shell
3. Prisma schema
4. Modular service architecture
5. Repository, task, and run APIs
6. Dashboard and form UI
7. Planner
8. Repo memory
9. Codex execution
10. Verification
11. Confidence scoring
12. Review UI
13. Visual refinement
14. README and setup docs
