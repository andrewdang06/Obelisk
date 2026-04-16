# Obelisk

Obelisk is a local-first control panel for making Codex CLI coding work more reviewable. It records repository context, generates a plan before execution, runs Codex CLI inside the target repo, captures logs and changed files, runs verification, computes confidence, and presents the evidence in a review dashboard.

## Features
- Register local repositories by absolute path.
- Store repo memory: architecture, conventions, important modules, risky files, failed attempts, and successful strategies.
- Read target-repo `AGENTS.md` guidance, or create a suggested `AGENTS.md` when one is missing.
- Submit coding tasks tied to a repository.
- Generate and persist a structured plan before execution.
- Run Codex CLI in the selected repository through `child_process`.
- Capture stdout, stderr, timestamps, command status, changed files, and diff summary.
- Run available `npm` verification scripts for tests, lint, and typecheck.
- Compute confidence from objective run evidence.
- Review task, plan, memory, AGENTS.md, logs, diff, verification, and confidence in one UI.

## Tech Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Codex CLI via local child process execution

## Requirements
- Node.js 20 or newer
- npm
- PostgreSQL
- Codex CLI available on `PATH`, or configured through `CODEX_CLI_COMMAND`

## Setup
1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env
```

3. Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/obelisk?schema=public"
CODEX_CLI_COMMAND="codex"
CODEX_CLI_ARGS="exec"
```

4. Apply the Prisma schema:

```bash
npm run prisma:migrate
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Codex CLI Configuration
By default the execution service runs:

```bash
codex exec "<structured prompt>"
```

Override this with:
- `CODEX_CLI_COMMAND`: executable name or path.
- `CODEX_CLI_ARGS`: arguments placed before the structured prompt.

Example:

```env
CODEX_CLI_COMMAND="codex"
CODEX_CLI_ARGS="exec"
```

## Verification Behavior
After Codex execution, the app checks the target repository `package.json` scripts:
- `test` -> `npm run test`
- `lint` -> `npm run lint`
- `typecheck` or `type-check` -> matching npm script

Missing scripts are marked `SKIPPED`, not passed. Failed commands reduce confidence and mark the run failed.

## Workflow
1. Add a local repository path at `/repos/new`.
2. Fill repo memory at `/repos/[id]/memory`.
3. Submit a task at `/tasks/new`.
4. Review the generated plan on the repo detail page.
5. Start a Codex run.
6. Review logs, diff, verification, and confidence at `/runs/[id]`.

## Confidence Score Inputs
The score is computed from:
- Codex command exit status.
- stderr presence.
- test, lint, and typecheck results.
- number of changed files.
- whether changed files match the plan.
- whether risky files were touched.

The score is stored on the run and the factors are stored in the run diff summary.

## GitHub
This local repository is configured with:

```bash
origin https://github.com/andrewdang06/Obelisk.git
```

Milestone commits are pushed to `main`.
