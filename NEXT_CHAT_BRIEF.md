# GTM Tool Continuation Brief

Use this brief to start a new Codex chat in this project. Treat the files on disk and the deployed `main` branch as the source of truth; do not rely on a prior chat transcript.

## Start here

1. Read `AGENTS.md` and the context files it lists.
2. Inspect `git status --short`, recent commits, and the deployed Render URL before changing anything.
3. Do not use the user's visible browser unless they explicitly ask. Use code, focused checks, and deployed HTTP verification.
4. Do not commit `server/data/records.json`, `.env`, backups, or `.codex-worktrees/`.

## Product decisions that must remain true

- Plan Summary separates the launch decision, priority opportunity, current work, and actual blockers.
- Before launch, **Finish setup** is the single direct launcher for the one current prerequisite. After tools are ready, it becomes **This Week**.
- Readiness Score and Readiness Blockers explain the decision; they must not duplicate a prerequisite action.
- A user must never be asked for input without clear, saved context: what the task concerns, why it matters, the answer format, the effect, and an optional skip path. Do not show internal rule names or implementation logic.
- Actual work happens in the direct workspace. A button must not send the user through an intermediate page to click the same action again.
- Tool setup is guided and resumable. Completion is recorded inside the relevant workspace; blocker controls are secondary.
- Target List Setup helps users find candidate companies, review evidence, and then create the list. It never performs CRM writes, contact discovery, or outreach without explicit future approval.
- The 90-day plan is a learning experiment. The starting ICP can change as evidence is collected.
- Preserve legacy field keys and migrations. `revenueMotionPortfolio__motion-N__channelSource` remains semicolon-compatible and supports multiple values.

## Recent UX work

- Six setup workspaces use canonical direct routes: ICP Brief, Persona Brief, Target List Setup, Messaging Kit, Outreach Sequence, and Weekly GTM Review Setup.
- Score-review guidance was simplified to avoid exposing internal logic.
- The sticky guided-work return bar was repositioned and given clearance so it does not hide content.
- `Finish setup` is the one pre-launch launcher; Risk and score areas do not offer redundant task actions.
- Grammar correction: setup navigation must read, for example, `ICP Brief needs review.`

## Security boundary

Read `SECURITY_AND_COMPATIBILITY_STANDARD.md` before work. This product is still a protected prototype: it uses a shared password and a server JSON record store. It is not ready for multi-tenant real customer data until individual identity, tenant authorization, a managed database, auditability, validation, backups, and a security review are complete.

## Deployment rule

The user expects each approved product change to be committed and pushed to `origin/main` so Render deploys it. Provide an exact Render URL with a commit cache-buster, for example:

`https://gtm-tool-1mib.onrender.com/results.html?v=<commit>&asset=gtm`

Render is password-gated. A `302` redirect to `/login` confirms the deployment is reachable, but it is not a visual UI test.

## Immediate next work

1. Establish and implement the production security architecture before allowing real customer data.
2. Run a structured desirability pilot before building more features:
   - Recruit 5-7 people who fit the intended GTM user.
   - Give each the same realistic task: create a plan, finish the current setup task, find/review a target company, and begin Week 1.
   - Observe without coaching; record completion, confusion points, time-to-first-action, and whether they would return.
   - Success threshold: at least 4 of 5 complete the core flow unaided, most understand the next action in under one minute, and at least 3 agree to use it again during a real 30-day GTM effort.
   - Run a 2-4 week pilot with 8-12 users after the usability fixes. Track activation, weekly return, setup completion, first-target-list completion, weekly evidence entry, and retention. Interview users who stop.
3. Only then prioritize the next feature based on observed failure points, not feature requests alone.

## Verification expectations

- Run syntax checks for touched JavaScript/server files.
- Run focused QA checks relevant to the change and `git diff --check`.
- Test persistent behavior with a QA record only; do not change or commit real customer data.
- Push only intentional changes. Confirm `origin/main` matches the commit and confirm Render reaches the login gate.
