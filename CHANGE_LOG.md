# GTM Tool Change Log

Last updated: 2026-08-16

This file records the major actions and changes made during the GTM Tool refinement work.

## 2026-08-15 Production Acceptance and Release Gate Repair

- Live-tested the deployed pre-revenue flow with a fresh QA Sock Co record, including locked pre-revenue defaults, hidden post-revenue fields, revenue-model behavior, saved-record persistence, segment scoring, and validation-plan generation.
- Removed the unintended blank revenue-model choice and kept the two requested options only.
- Preserved plan context across navigation: a started plan returns to This Week, while an unstarted plan opens the Plan Summary.
- Corrected Target Company Discovery links to open the current discovery workspace anchor.
- Replaced the long pre-revenue context card with a one-line confirmation beside the automatically locked revenue fields.
- Added the full route-specific 30-day test inside each First-Win Segment card before the respondent accepts, revises, or defers it; existing saved choice values remain compatible.
- Updated the permanent QA fixtures and assertions to the current product contracts; the complete local release gate now passes 1,414 of 1,414 checks.

## 2026-08-16 Pre-Revenue Evidence Guidance

- Clarified that First-Win Segment evidence details are optional and should contain factual support such as source, quantity, observed action, and timing.
- Explained that these details feed the plan's Evidence Available section, the Persona Brief, and evidence-strength assessment; added a concrete retail-buyer example and an explicit blank/skip path.
- Removed the unused validation-checklist approval dropdown and now show the generated checklist directly in each First-Win Segment card.
- Replaced the conditional missing-requirement question with one optional field that explains how any addition will be used in the final plan; legacy saved approval values remain untouched but are no longer displayed.
- Reframed the channel-buyer alternatives question around what the buyer would buy or continue doing instead, replacing overlapping supplier, marketplace, demand-signal, and procurement choices with distinct status-quo, competitor, substitute, internal, workaround, delay, and no-action options.

## 2026-08-13 Pre-Revenue Intake Simplification

- Kept two tool modes only: GTM Readiness and Pre-Revenue Validation. Founder-led selling remains a motion, not a third lifecycle track.
- Made Pre-Revenue Validation visibly set and lock `companyStage` and `revenueRange` as `Pre-revenue`, while hiding report-period, customer/deal-size, current sales-motion, post-revenue constraint, public-presence, and GTM-system questions.
- Split the former mixed business-model classification into business/offer type, revenue model, and route to market. Revenue model is now a two-choice dropdown: Recurring Revenue Model or Standard Revenue Model.
- Added legacy classification and recurring-revenue migrations so existing records retain meaning.
- Added up to three comparable-company/product URLs and incorporated them into the existing manual ChatGPT research prompt. The dormant paid `/api/research` route remains disconnected from the intake.
- Prefilled segment buying paths from route to market, split first-test access from repeatable reach, and replaced respondent-authored validation paths and the long What Must Be True block with generated recommendations plus confirmation/revision controls.
- Changed segment selection to an explicit plan override: the selected segment leads the plan, while a different top-scoring segment is shown as a score conflict.
- Strengthened selected-answer visibility beneath multi-select dropdowns and added the redesign check to the permanent release gate.

## 2026-07-31 Unified Tool Setup Navigation

- Added one canonical task-to-workspace route for ICP Brief, Persona Brief, Target List Setup, Messaging Kit, Outreach Sequence, and Weekly GTM Review Setup.
- Plan Summary, Readiness Blockers, Continue Readiness, This Week, and direct asset links now open the actual task workspace instead of an intermediate `setupTask` card or scroll target.
- Preserved entry context in workspace return actions: readiness entry returns to Plan Summary, while execution entry returns to This Week.
- Moved brief completion into the brief workspaces and made Messaging Kit, Outreach Sequence, Target List, and Weekly Review completion save and advance directly to the next unfinished setup task.
- Kept task-local blocker and continue-later actions secondary, with canonical blocker persistence and a direct Plan Summary return.
- Increased sticky-header and anchor clearance so the workspace heading and controls remain visible below pinned navigation.
- Added a 59-check non-browser route matrix covering all six tasks, entry paths, completion, blocker/continue-later behavior, and return context.

## 2026-07-31 Optional Research Prompt Copy

- Added an optional `Copy research prompts` action inside the post-results `How we searched` disclosure.
- The copied prompt pack uses the current saved ICP, focused search approaches, and guided refinements.
- Kept the payload human-readable and removed JSON response schemas or internal candidate plumbing.
- Preserved automatic server-side discovery as the primary action and retained the no-contact, no-outreach, and no-CRM-write boundaries.

## 2026-07-30 API-Backed Target Discovery

- Added authenticated `GET/POST /api/target-discovery`; the endpoint runs only when the server has `OPENAI_API_KEY`.
- Moved proxy-search formulation, OpenAI web research, candidate ranking, source validation, and candidate-schema normalization to the server.
- Limited target discovery to five runs per network per day and kept the API key server-only.
- Removed pasted JSON and raw research plumbing from the user workflow.
- Candidate cards now show source links, observed evidence, unconfirmed inference, unknowns, and a concise review rationale.
- Replaced technical approval controls with `Good fit`, `Not a fit`, and `Not sure`; later searches use bounded example-based tuning.
- Good-fit companies enter an internal review list only; no contacts, outreach, or CRM writes are created.
- Kept manual public searches and a copyable research request as an optional fallback only when automated research is unavailable.

## 2026-07-30 Concise Find Target Companies

- Replaced the generated-variable form wall with a concise plan-derived brief for company type, size, geography, observable signals, and exclusions.
- Made criteria editing optional and line-oriented, with plain referral/access and exclusion preferences instead of technical semicolon-entry instructions.
- Removed the pre-search buying-signal selector, source-verification prompts, point controls, and internal contextual-input scaffolding from Target Discovery.
- Kept the primary `Find target companies` action and a controlled public-search / copied-research-request handoff without enabling paid research.
- Candidate results now lead with source, observed evidence, clearly labeled inference, and a concise reason to review; search-method details appear only after results.
- Limited signal preference and exclusion refinement to future batches after candidates exist.

## 2026-07-30 Observable Buying Signals

- Replaced the generic `Customer complaints` target-prioritization path with sourceable signal types relevant to ClientRenew's saved ICP.
- Added source guidance and bounded implications for retention-operations hiring, public HubSpot evidence, recurring-service language, growth/change events, and referral or CRM context.
- Kept point rules hidden until a user selects an observable signal; the UI explains that points only rank outreach review and do not prove fit or change readiness.
- Preserved legacy generic values without counting them as active routing evidence; explicit replacement archives the old rule before saving the new one.
- Added focused ClientRenew regression coverage for legacy handling, evidence boundaries, conditional priority controls, and non-fabrication.

## 2026-07-30 Target-Company Discovery

- Replaced literal full-ICP searching with an editable observable-variable model for category, geography, size, public technology evidence, recurring-service language, team/job hypotheses, referral paths, and exclusions.
- Added four focused search approaches that explain why each query is useful and which apparent fit remains unverified.
- Added a controlled copy-only AI discovery prompt and user-initiated focused search links without reconnecting paid browser research.
- Added sourced candidate JSON review with separate observed evidence, inferred fit, missing information, exclusion risks, and explicit user Accept/Reject decisions.
- Added next-batch pattern feedback for industry, geography, size, technology, referral path, and exclusion criteria.
- Preserved manual HubSpot approval and the Required Fields checklist; no CRM writes, contact discovery, outreach, or external messages are automated.

## 2026-07-30 State-Aware Readiness Navigation and Setup Blockers

- Renamed the pre-launch sidebar entry from `This Week` to `Readiness`; it now names and opens the exact current setup task. The label returns to `This Week` only after Tool Setup is ready.
- Made saved setup blockers canonical workflow state. A blocker forces `Waiting / Blocked`, appears on Plan Summary and Readiness Blockers with its saved explanation, and routes directly to the affected setup task without changing the numeric readiness score.
- Fixed the full blocker lifecycle: clearing now deletes the canonical reason, reconciles the tool with observed guided-work completion, persists the unblocked state, and immediately renders the correct current task even when weekly execution had previously started.
- Removed the generic `Improve the highest-impact blockers` action whenever no true launch blocker exists; the summary now continues the exact setup task, focused test, or This Week execution state instead.
- Replaced the long Weekly GTM Review Setup form with five concise recommendations for owner, cadence, CRM source of truth, recurring meeting, and Go / No-Go criteria. Saved canonical values are shown instead of requested again, and only missing values produce contextual inputs.
- Moved the activity/response/conversation/opportunity/learning scorecard and Continue / Revise / Pause / Stop choices into Evidence This Week. Removed the separate decision-recording-location requirement.
- Reduced Target List Setup to the operational HubSpot required-fields checklist plus two actions: confirm list creation with a clearly labeled account count and continue, or copy the Required Fields list. Removed repeated ICP, persona, filter, trigger, sizing, referral, and system-of-record narrative from the active page.
- Made every current Tool Setup task lead with a positive completion or guided-work action; blocker and continue-later controls remain secondary. Completing the external Target List confirmation advances directly to the next ordered setup task.
- Collapsed completed-week rollover into one `Complete Week and Continue` action. The separate close-decision workspace is now shown only when unfinished work needs a genuinely distinct carry-forward, revise, drop, or block decision.
- Removed the redundant Tool Setup status dropdown. Observable guided work now advances status automatically: brief confirmations, Target List creation confirmation, Messaging and Outreach saves, and Weekly Review readiness.
- Kept only task-local controls that the app cannot infer: a contextual blocker/unblock condition and a continue-later action. Clearing a blocker resumes the same guided task.
- Added focused ClientRenew regression coverage for pre-ready and ready navigation, every retained workflow state route, blocker visibility, direct destinations, observed completion, and absence of a separate status screen.

## 2026-07-29 Contextual Smallest Next Step

- Stopped treating vague one-word actions such as `demo`, `call`, or `pilot` as completed buying-path readiness evidence.
- Added a shared recommendation builder that uses the saved customer, buyer, offer, limited pilot, revenue motion, and channels to prefill one concrete evidence-producing buyer commitment.
- Added a bounded three-choice fallback when the saved plan does not contain enough context for a reliable recommendation.
- Added a non-browser ClientRenew regression that fails when the canonical next-step task has an empty recommendation.
- Changed Target List Setup's primary action from a clipboard-only operation to an in-page manual HubSpot checklist with saved ICP criteria, exclusions, fields, list name, initial quantity, and a completion route.
- Added durable Target List Setup status and qualified-account count. Save progress now either names the exact remaining requirement or advances Tool Setup with a concrete Continue action.
- Made Start the focused test state-aware: incomplete setup routes to the exact current prerequisite, while completed setup enters Week 1 with the first action, list status, and result-recording location.

## 2026-07-29 Contextual Guided Work

- Added a shared guided-input pattern that names the saved plan item, explains why the question is being asked now, defines the answer and unit or format, states the readiness effect, and offers a continue-later path when optional.
- Replaced duplicate score-improvement entry points with one ordered contextual task stack. Plan Summary blocker actions now open the same first executable task directly.
- Made the measurable-value and buying-signal tasks use the saved success condition, signal, customer, buyer, motion, channels, and owner instead of generic labels.
- Routed Resume Tool Setup directly to the current setup workspace, applied contextual prompts to Tool Setup and Weekly GTM Review, and reduced the lower Plan Summary to one explicitly labeled supporting action-plan reference.

## 2026-07-29 Canonical Readiness Mapping and Direct Blocker Actions

- Counted saved priority-customer, buyer, offer-portfolio, quick offer, proof-reference, trigger, fit, disqualification, signal-play, and pricing evidence in readiness scoring when scoped assessment rows are absent.
- Kept genuine gaps explicit: ClientRenew still needs structured measurable-value details and 30-day activity/result targets.
- Changed Plan Summary blocker actions to open the specific empty inline inputs in one action, with already-filled fields excluded.
- Removed the long offer-readiness explainer from the inline action path and added a ClientRenew-specific headless regression check.

## 2026-07-29 Revenue Acquisition Channel Sources

- Changed `Where would the opportunity come from? (channel / source)` in the Revenue Acquisition Strategy Portfolio from a single-select field to the shared accessible multi-select control.
- Preserved the existing `revenueMotionPortfolio__motion-N__channelSource` key so legacy single-value records continue to load without a destructive migration.
- Saved multiple selections with the existing semicolon-delimited multi-select encoding and kept selected values visible as a list on intake and readback.
- Added focused regression coverage for schema shape, legacy single-value readback, multiple selections, serialization, and `Other` details.

## 2026-07-23 Product Rename

- Renamed the user-facing product from `GTM OS` and `GTM Tool` to `GTM Intelligence OS`.
- Updated the login page, intake, facilitation flows, reports, assets, AI workspace context, recommendation labels, and server startup message.
- Preserved existing storage keys and record identifiers so saved company data remains compatible.
- Added compatibility handling for the legacy `GTM OS is the source of truth` pipeline setting.

## 2026-07-23 Phase 1 Claim Traceability Foundation

- Added a reusable output-claim model with value, source fields, source categories, status, confidence, and improvement topic.
- Applied claim provenance to the four GTM Plan Summary cards: Readiness Score, Top Opportunity, Next Best Action, and Biggest Risk.
- Added plain-language `What this is based on` details without exposing raw field IDs or internal scoring rules.
- Distinguished calculated results, saved inputs, saved evidence, inferences, and recommendations.
- Added a dependency regression test that changes the same company’s readiness inputs and verifies the calculated score and provenance update together.

## 2026-07-23 Phase 1 Ranked Priority Integrity

- Gave every Ranked Action Plan priority a stable claim ID, status, confidence, source fields, source categories, and exact improvement topic.
- Replaced broad and repeated improvement buttons with one action per priority: either improve the supporting intake inputs or review the saved execution evidence.
- Added direct links for each missing revenue-motion and conversion assumption so users land on the exact unanswered field, including fields that do not yet have a saved value.
- Changed ICP ranking to use the evidence-based customer-priority score instead of the respondent's ICP clarity self-rating.
- Added return-state feedback that says whether a saved change updated the recommendation, left it unchanged, or resolved and reranked the priority.
- Restored and highlighted the affected priority after a guided intake round trip.
- Added ranked-priority provenance and save/recalculate/return regression checks.

## 2026-07-23 Phase 1 Score and Conflict Integrity

- Separated GTM readiness, evidence confidence, and execution progress into three clearly labeled metrics.
- Removed evidence confidence and completed activity volume from the overall readiness formula.
- Reweighted readiness around GTM foundation evidence, planned operating readiness, and a limited respondent self-assessment.
- Added the saved evidence counted and exact next score-changing inputs to every readiness component.
- Added direct guided improvement routes and qualified estimated score opportunities for the top three score improvements.
- Centralized customer, buyer, offer, signal, revenue, and risk source mappings used by output claims.
- Made genuine 90-day goal and revenue-target conflicts block plan generation until the user selects a source of truth or explains why the values should remain different.
- Bound intentional conflict confirmations to the exact values so changed answers trigger a new review.
- Replaced visible internal `Rule used` wording with plain-language recommendation rationale.
- Added release checks for metric separation, conflict resolution, and visible internal diagnostic labels.

## 2026-07-23 Phase 2 Point-of-Answer AI Foundation

- Added schema-owned AI assistance metadata for the highest-friction customer, problem, urgency, offer, measurement, focus, channel, motion, and pre-revenue questions.
- Classified each supported field as recommend from existing answers, adaptive coaching, or ask directly.
- Added field-specific context dependencies, evidence restrictions, follow-up rules, and prompts.
- Replaced generic help labels with `Get our recommendation`, `Get our customer recommendation`, or `Explain this question`.
- Added AI recommendations to select controls and required exact available-option responses.
- Limited field-assist context to the dependencies declared for that question.
- Kept private founder and team background explanation-only with no AI write-back.
- Preserved explicit `Use this answer` review before any recommendation changes the intake.
- Added a 19-check regression gate for classification, context scope, recommendation display, option support, and private-fact safety.

## 2026-07-23 Phase 2 Adaptive Coaching and Uncertainty Paths

- Added three-question guided coaching beside broad customer-context and urgency questions.
- Added `Not sure yet` narrowing paths for primary revenue source, sales motion, 90-day goal, and biggest GTM constraint.
- Delayed the AI request until the user answers at least one narrowing question and selects `Build our recommendation`.
- Added follow-up answers to the question-scoped AI context without saving those temporary notes as company evidence.
- Preserved a separate review step and explicit `Use this answer` before changing or saving the intake.
- Added select-safe recommendation write-back through the normal save path.
- Added four-company AI context isolation coverage for pre-revenue consumer, pre-revenue SaaS, mixed-channel consumer, and post-revenue SaaS companies.
- Added 36 focused checks covering coaching timing, uncertainty paths, option validity, context scope, record isolation, write-back safety, and persistence.

## 2026-07-20 First-Win Segment Question Cleanup

- Reset `New` company navigation to Company Information and clear inherited section, improvement, refresh, and pending-autosave state before the blank intake opens.
- Added a reusable, non-writing multi-select visibility sweep across all saved pre-revenue records, including immediate selection display and section-away/section-back persistence.
- Added a New-company regression check that begins inside a deep pre-revenue section with inherited improvement state and verifies a blank Company Information start.
- Refreshed intake script version identifiers so already-open alpha sessions load the corrected schema and navigation code after reload.
- Removed the duplicate `What kind of customer is this?` field from First-Win Segment cards.
- Clarified that the first dropdown selects the broad first-customer type being narrowed into a candidate segment.
- Preserved legacy `segmentType` answers for existing records while making the first customer-type answer the fallback source for ICP, discovery, route, and validation outputs.
- Kept observable traits, use case, problem, urgency, buying path, and buyer roles as the distinct narrowing questions that follow.

## 2026-07-20 Company-Safe Intake Examples

- Removed all hard-coded customer descriptions from the reusable `Think Big, Start Small` customer-context field.
- Added `Generate company-specific example`, which uses AI and only the active company's saved context to propose a customer description for review.
- Kept AI suggestions opt-in: the generated example changes the intake only after the user selects `Use this answer`.
- Removed the remaining fishing-specific use-case placeholder in the same section so examples cannot look like data carried over from another company.

## 2026-07-17 Plan Summary Score Guidance

- Fixed Offer readiness scoring so saved numeric ratings from 1 through 5 count as their intended scores instead of being treated as missing.
- Made Proof Readiness recognize proof attached to a completed value claim, including evidence type and evidence notes, rather than requiring the same proof to be re-entered in a separate proof table.
- Replaced the static Offer and Proof missing-data checklist with the actual weak dimensions and current scores for the selected primary offer.
- Added guided `Save Changes and Return` and `Return Without Saving` controls at the bottom of improvement sections, replacing ordinary intake progression controls during a report round trip.
- Made legacy primary-offer selections stored by offer name resolve to the correct offer row so newly completed assessments update the offer score.
- Renamed the four plan-summary detail links from `See supporting details` to `Learn more` and made each link expand its matching support panel before scrolling to it.
- Replaced the generic `weakest conversion point` recommendation with the saved Biggest funnel drop-off by name; when none is saved, the plan now asks the user to identify it instead of implying that it is known.
- Replaced the old self-rating-based Revenue Motion summary with the evidence-based Revenue Motion readiness score used by the overall scoring model.
- Added the eight Revenue Motion scoring dimensions, their current scores, and the exact next move for every weak dimension to the readiness details.
- Added separate improvement routes for the score areas that currently need work instead of sending every score issue to one generic intake review.
- Made Revenue Motion remediation preserve its exact score gaps and place the relevant editable revenue fields directly inside the guided improvement card.
- Clarified that a subscore can improve before the rounded weighted overall score changes.

## 2026-07-17 CRM-Centered Execution Assets

- Replaced the duplicate in-tool Target List tracker with a Target List Setup Guide for the user's CRM or spreadsheet.
- Added recommended ICP criteria, starting-list size, required CRM/spreadsheet fields, and a copyable setup guide.
- Removed Pipeline and Opportunities from intake and report navigation; legacy links now route to the Weekly GTM Review.
- Moved weekly target, outreach, opportunity, pipeline, proof-use, overdue, and next-action totals into an editable CRM summary in the Weekly GTM Review.
- Removed target and opportunity record requirements from asset-quality checks, Plan Status, messaging responses, proof usage, and outreach execution.
- Reworked the Proof Asset Builder around five plain-language decisions: what to create, who needs it, what claim it supports, what evidence exists, and whether that evidence can be shared.
- Moved proof strength and draft status behind the scenes so the user no longer has to interpret internal production labels.
- Made Add Step in Outreach Sequence save immediately before the page refreshes.

## 2026-07-17 Active Plan Persistence, ICP Actions, and Messaging

- Preserved weekly priority statuses when weekly progress is saved and synchronized those statuses with the underlying Active Plan actions.
- Allowed completed statuses to save even when a result note is still missing, while keeping the missing evidence visible as a follow-up before the week can be closed.
- Added direct work links beside the ICP Brief's first activation step and evidence-validation section.
- Rewrote system-generated outreach recommendations as coherent buyer messages that connect the problem, audience, offer, outcome, proof, and next-step ask.
- Added shorter topic-led subject lines and migrated recognizable legacy system drafts without replacing user-edited messages or drafts with response history.

## 2026-07-17 Offer and Value Proof Plan

- Rebuilt the vague Offer Plan task list as an Offer and Value Proof Plan.
- Replaced administrative task fields with the exact claim, metric, reason for the gap, evidence to capture, deliverable, and completion rule.
- Added contribution-margin-specific guidance including the baseline formula, measurement level, period, source, target improvement, and supporting proof.
- Added a guided route to complete the claim and proof inputs.
- Reordered the linked outputs so users complete proof in the Proof Asset Builder before using the claim in the Messaging Kit.

## 2026-07-17 Recommendation Status and Example Hygiene

- Removed `Improve This Section` from prescriptive recommendations when no specific deficiency is identified.
- Added a clear status explaining that complete recommendations are execution guidance, not requested remediation.
- Retained improvement actions only when the related impact analysis identifies a real ICP, revenue-motion, buyer, proof, CRM, activity, or offer gap.
- Removed legacy Grounded Brand, Blacksmith, Little Poppy, and Mission Belt example logic from reusable facilitation and proof guidance.
- Replaced company-specific examples with neutral instructions that cannot leak context between company records.

## 2026-07-17 Revenue Motion Remediation Write-Back

- Closed the loop between Revenue Motion Facilitation and the Ranked Action Plan.
- Saving the remediation now updates the selected revenue-motion portfolio row and primary-motion relationship.
- Writes the owner, weekly activity, opportunity criteria, review cadence, review inputs, and continue/revise/stop rules into the 30-day experiment fields used by the report.
- Creates a qualified-opportunity stage from the user's opportunity definition so completed remediation can satisfy the stage-criteria check.
- Marks the facilitation output as applied to the intake while retaining the saved interview notes.
- Reads previously saved Revenue Motion facilitation answers as report fallbacks so completed interviews from before this fix can affect the regenerated plan without re-entry.
- Replaced the mismatched weekly-hours dropdown with guided weekly activity targets that can be executed and measured.
- Includes saved remediation answers in revenue-motion context, channel activity, process, ownership, and experiment-readiness scoring.
- Stops repeating the generic Revenue Motion Discipline remediation after all ten operating questions are complete, unless a genuinely uncovered operating element such as CRM tracking is still missing.

## 2026-07-17 Revenue Motion Revision Signals

- Changed `Which results would tell you this motion needs to be revised?` from single-select to multi-select.
- Clarified that users may select every applicable revision signal.
- Preserved existing saved answers and the required definition when `Other` is selected.

## 2026-07-17 Revenue Motion Name Resolution

- Fixed a false `Named Revenue Motion` gap when the primary-motion selector stored a relationship ID such as `motion-1`.
- Cleans each possible motion-name source separately and uses the first usable display value.
- Applies the same resolved name to Ranked Action Plan priorities and Strategic Insights.

## 2026-07-17 Data Quality Review Navigation and QA Repair

- Changed guided improvement `Save Answers` buttons to the consistent label `Save`.
- Stopped valid relationship IDs, including a linked targeting strategy, from being reported as internal-label errors.
- Expanded repeated-answer warnings into a reviewable list of every affected question.
- Added a persistent `Back to Required Changes` control while correcting an answer, avoiding browser history and the login page.
- Replaced copied ICP text in the ForgeLine QA fixture with role-specific persona answers, operating assumptions, and pipeline metrics.
- Added the ForgeLine semantic repair to the fully populated fixture generator so the copied-answer defect does not return.

## 2026-07-17 Improvement Route Loading

- Prevented the default GTM OS intake section from flashing before an `Improve This Section` destination loads.
- Resolves the requested improvement section before the intake's first render.
- Keeps the workspace hidden only during initialization, then reveals the correctly routed section.

## 2026-07-17 Ranked Action Remediation Links

- Turned each missing Revenue Motion Discipline operating element into a direct guided intake link.
- Added the specific missing task, such as `Complete Named Revenue Motion`, to the destination review.
- Preserved the return path to the same Ranked Action Plan item after the intake answer is updated.

## 2026-07-17 Evidence-Aware Revenue Motion Priorities

- Corrected the Ranked Action Plan so an isolated CRM hygiene note cannot imply that the entire revenue motion is undefined.
- Verified that both ForgeLine QA records contain a named motion, target, activity and result targets, conversion stages, owners, tracking, and weekly review cadence.
- Made Revenue Motion Discipline recommendations list only the operating elements that are actually missing.
- Replaced the generic fallback with motion optimization when the operating structure is already complete.
- Routed inconsistent loss-reason or source-attribution data to a specific CRM Data Quality recommendation instead of a rebuild-the-motion recommendation.
- Removed the same false-positive pattern from Strategic Insights.
- Refreshes untouched, not-started Active Plan priorities from corrected recommendation logic while preserving priorities that have progress, evidence, or history.

## 2026-07-17 GTM Summary Output Mapping

- Removed the standalone Decision and Immediate Action box from the summary.
- Moved the recommended direction into the collapsible Top Opportunity section.
- Kept the immediate action, owner, timing, assets, and work link inside the collapsible Next Best Action section.
- Updated the How to Use This Plan guidance to match the simplified structure.
- Corrected the summary-card action text to use accessible white lettering on coral buttons.
- Standardized the four summary-card actions as coral buttons with white text and bottom alignment across cards of different content lengths.
- Added explicit output mappings to ICP, Offer, Persona, Targeting Signal, Revenue Motion, CRM, and Activity sections.
- Confirmed each mapped output opens as a dedicated asset with print and PDF controls.

## 2026-07-17 GTM Plan Summary Decision and Evidence Layout

- Replaced the vague `Focus` value in Top Opportunity with the actual highest-ranked action area.
- Added clearly labeled, always-visible Decision and Immediate Action content directly below the four summary cards.
- Linked each summary card to its own matching collapsible evidence and action section.
- Added color-coordinated outlines for Readiness, Opportunity, Action, and Risk cards and supporting sections.
- Moved readiness strengths, weaknesses, score-improvement actions, and the guided intake improvement route into the first supporting section.
- Added guided improvement routes for the opportunity and risk sections and a direct Active Plan route for the immediate action.

## 2026-07-17 Report Generation Guardrails

- Routed every intake `View Report` action through the same completeness and data-quality checks used by plan generation.
- Added a friendly empty-intake message instead of generating a blank report.
- Added minimum report-foundation checks for company identity, customer, problem, and offer context before report generation.
- Stopped the results page from silently loading the most recently updated backend company when no company is active or requested.
- Redirected direct empty-report routes to the intake with a clear explanation.

## 2026-07-16 Guided Improvement Round Trip

- Standardized every `Improve This Section` action to open its facilitation flow in the same browser tab.
- Added a persistent improvement bar showing what is being improved, where the user will return, and answered-question progress.
- Replaced the old save/regenerate controls with `Save Changes and Return` and `Return Without Saving`.
- Returns users to the exact originating asset, section, and scroll position.
- Shows a saved-and-updated confirmation and briefly highlights the originating report section after a successful save.
- Added an isolated end-to-end test for both saved and unsaved return paths.
- Applied the same round-trip behavior to Active Plan action runners reached from Active Plan or Plan Status.
- Active Plan actions now show the work item and origin, then offer `Save Evidence and Return` or `Return Without Saving` with exact position restoration.

## 2026-07-16 ICP Context and Validation Workbook

- Added the qualitative customer-context starter to the post-revenue Customer Priority Framework.
- Added a guided `Improve This Section` round trip when the ICP Brief is missing that customer context.
- Corrected the ICP guidance so it points to Customer Priority Framework instead of Company Information.
- Verified real `.xlsx` downloads from both the 30-Day Validation Plan and Validation Workspace.
- Limited the Validation Workbook to those two validation surfaces and removed it from ICP and Active Plan action runners.
- Delayed workbook object-URL cleanup so browsers have time to begin the download reliably.

## 2026-07-16 GTM Plan Summary Navigation

- Added the opening GTM plan view as the first item in every Assets navigation list.
- Renamed that opening view from `GTM Action Plan` to `GTM Plan Summary` so its role is clear and its navigation label matches the page.
- Preserved the existing `asset=gtm` route so saved and shared links remain compatible.
- Made all four summary cards recalculate from the latest saved intake and execution state, including evidence support, current weekly priorities, and blocked work.
- Reformatted the Recommended 90-Day Focus statement as four concise action bullets.
- Reformatted Decision Required and Plan Completeness as concise action bullets.

## 2026-07-16 Split Intake Sidebar Navigation

- Separated the sidebar into an upper intake-navigation box and a distinct Assets box below it.
- Made Foundation, Validation when relevant, Strategy, and Execution collapsible groups inside the intake box.
- Automatically opens the group containing the current section while leaving the other groups collapsed.
- Keeps Assets expanded by default, allows the user to collapse it, and remembers that choice in the browser.
- Preserved independent sidebar scrolling on desktop and a single natural flow on mobile.
- Removed `View` from ICP, Persona, and Validation Plan asset link names.

## 2026-07-16 Reviewed AI Intake Assistance

- Replaced the copy-prompt primary action with reviewed public-company research from the company name and preferably the website.
- Added company-identity confirmation, source links, confidence, public-fact versus inferred labels, and conflict warnings.
- Prevented automatic replacement of existing answers and required explicit selection before applying research.
- Restricted research autofill to a server allowlist and excluded private operating facts and readiness judgments.
- Added contextual `Help me answer this` assistance to a focused set of difficult customer, problem, urgency, offer, success, and hypothesis fields.
- Kept AI suggestions advisory and required the user to select `Use this answer` before saving.
- Added alpha usage controls of five research runs per network per day and 30 assistance requests per network per hour.

## 2026-07-16 Active Plan Weekly Rollover

- Replaced the static weekly checklist behavior with a saved close-week and rollover workflow.
- Required a result or evidence note before a priority can be completed.
- Added carry forward, revise, drop, and blocked decisions for unfinished priorities.
- Limited each new week to three priorities, recommending two or fewer rollover items while allowing all three with confirmation that new planned work will be deferred.
- Kept blocked work recorded without consuming next-week capacity unless the user defines an actionable unblock step.
- Built the next week from selected rollover work, one evidence-based change, and the next planned stage.
- Added current-week highlighting and saved weekly history with completion counts, decisions, learning, and next changes.
- Synchronized progress saved in the Action Runner with the current weekly plan.

## 2026-07-16 Embedded AI Help

- Replaced the nonfunctional Find or ask placeholder with a working section finder and contextual AI assistant on intake and report pages.
- Added explicit AI actions for recommending section answers, explaining questions and recommendations, reviewing answer gaps, and identifying the next action.
- Added an authenticated `/api/assistant` server endpoint using the OpenAI Responses API and a broadly available, cost-conscious model default.
- Kept the API key server-side, excluded contact and credential fields from AI context, capped context and output size, and added an hourly request limit.
- Added clear configuration, API-key, access, and billing messages when OpenAI rejects a request.
- AI suggestions never silently write to the intake; users review and choose what to enter.

## 2026-07-16 Active Plan Overview

- Replaced the four separate Active Plan overview fields with one concise bulleted summary covering Current Focus, Evidence That Matters, the end-of-cycle decision, and the review rhythm.

## 2026-07-16 User-Facing Plan Logic and Persistent Storage

- Removed calculated confidence labels, source-trace rules, score weights, uncertainty penalties, and projected score lifts from user-facing plan sections.
- Kept the overall readiness score, plain-language status, strengths, gaps, recommended actions, and user-entered operating evidence.
- Reframed offer, targeting-strategy, and revenue-motion diagnostics as Current Readiness, What Is Ready, What Needs Work, and Next Moves.
- Simplified Strategic Insights to Observation, Why It Matters, and Recommended Action.
- Replaced Assessment Input Confidence with plain-language Plan Completeness guidance.
- Configured the Render Blueprint for a paid Starter web service with a 1 GB persistent disk mounted directly at `server/data`.

## 2026-07-16 Plan Status and Active Plan Simplification

- Moved Plan Status to the first visible report section by removing the user-facing Asset Quality Control panel.
- Kept asset-quality logic available for internal QA without asking users to recheck a technical score.
- Removed the duplicated Current Priority and What the Evidence Changes analysis from Plan Status.
- Removed Plan Resources blocks from Plan Status and Active Plan because the asset sidebar already provides navigation.
- Removed the confusing Saved Execution Evidence Changes block from Active Plan.
- Removed Evidence Reconciliation from normal asset navigation and routed weekly evidence decisions through Weekly GTM Review.
- Changed internal GTM Tool links to remain in the same browser tab so plan work does not create a trail of duplicate windows.

## 2026-07-16 Portfolio Restoration and Asset Remediation

- Corrected the initial row IDs for offer, targeting-strategy, and revenue-motion portfolios so saved portfolio data binds to the visible intake cards.
- Restored the fully populated ForgeLine Revenue Acquisition Strategy Portfolio to its visible intake card.
- Changed the Active Plan executable-action quality gap to open the exact Revenue Motion intake remediation instead of a generic Active Plan view.
- Added explicit completion steps, required fields, an example, and a direct Return to Active Plan link to the remediation workshop.
- Added a targeted regression check covering portfolio restoration, Active Plan quality 4/4, and the remediation return path.

## 2026-07-16 Login and Browser Security

- Updated the password login page to use the GTM OS navy, coral, and gray interaction palette.
- Added consistent keyboard focus styling to the login form.
- Added Content Security Policy, HSTS, clickjacking protection, MIME sniffing protection, referrer restrictions, and browser permissions restrictions to every server response.
- Verified the hardened server against the four-company asset suite: 100/100 renders and 26/26 save/reload checks passed.

## Project Continuity

- Created `PROJECT_CONTEXT.md` so future ChatGPT/Codex sessions can recover project state even if chat history is incomplete.
- Documented that project files on disk are the source of truth.
- Verified the existing run folder structure under `runs/acme-analytics-2026-05-19/`.

## Intake Redundancy Review

- Reviewed screenshots of the intake form for repeated questions and missing answer carry-forward.
- Added answer carry-forward logic in `tool/app.js` so key answers can populate related blank fields.
- Examples of carry-forward include average deal size, CRM, customer size, vertical, pain, buyer roles, sales wedge, and bad-fit signals.
- Removed or reworded several prompts that repeated the same idea across sections.

## Multi-Brand Storage

- Added browser-local multi-brand storage.
- Added a `Brand` search field.
- Added saved-brand browsing.
- Added `Save Company`, `New Blank Company`, and `Clear Form`.
- Added autosave after the user pauses typing or changes a field.
- Updated results page logic so it reads the active saved brand record.
- Later added backend sync hooks so saved brands can sync to a server when served over HTTP.

## Section 1 / Company Information

- Renamed the research button to `AI Research`.
- Added improved AI Research fallback notes when no backend AI endpoint is configured.
- Changed `Primary geography / markets served` from free text to a dropdown with regional and country-level options.
- Removed `Confidentiality level`.
- Changed `Main growth constraint today` to a dropdown with common growth constraints.
- Added repeatable `Other / additional growth constraints`.
- Changed `Current annual revenue` to a dropdown.
- Added `Monthly recurring revenue (MRR)`.
- Added `Annual recurring revenue (ARR)`.
- Added dollar-prefix and auto-format behavior for money fields.
- Added conditional `Other` text boxes for dropdowns with `Other`, including GTM systems/data sources.

## Executive Snapshot

- Renamed `Fast-Start Executive Snapshot` to `Executive Snapshot`.
- Updated description to `Should be completed by company or department head.`
- Removed redundant traction/source questions.
- Replaced top/second/third sales source fields with a ranked revenue-source table.
- Added `Other sales sources`.
- Replaced paid-problem list with `Which benefits do customers pay you for?`
- Added benefit dropdowns and measurement fields.
- Removed `Sales or marketing activities producing the best conversations`.
- Added `Revenue and/or Pipeline Success Criteria` with 30/60/90 day rows and up to three ranked criteria.
- Replaced `Biggest internal constraint` with ranked `Your Top Constraints`.
- Added dynamic follow-up prompts based on the selected constraint.
- Replaced senior-time question with two trigger lists:
  - prospects that need senior involvement
  - prospects that can be handled without senior involvement
- Reworded avoid-for-now customer/segment question and added a helpful hint.

## Quick Response ICP

- Moved `Build the single best customer profile` into its own section:
  `Quick Response Ideal Customer Profile`.
- Kept the rough-answer structure for now, with plans to build a more guided ICP questionnaire later.

## Revenue Goals, Strategy, and Constraints

- Moved and renamed priority question to:
  `What is the single most important need for the company right now?`
- Added a 60-day primary GTM goal.
- Removed executive/founder involvement per opportunity.
- Removed maximum implementation complexity.
- Replaced separate constraint dropdowns with a constraint-level table.
- Each constraint category now has:
  - level
  - why

## Current Traction and Customer Proof

- Changed current customers into a top-five customer fit table.
- Added `Why each was a good fit`.
- Removed best-fit wins.
- Changed `Usage and value proof` wording to:
  `What value do you provide to your customer(s)?`
- Replaced perceived-value up/down checkboxes with a 1-5 performance ranking table.
- Changed opportunity inventory to:
  `List 5-10 important revenue opportunities from your current pipeline`.
- Updated opportunity fields to include:
  - opportunity type
  - use case / pain
  - source / lead type
  - status
  - value / deal size
  - next action
  - owner
- Removed last 10-20 serious sales conversations table.

## ICP Hypothesis and Market Segmentation

- Changed best-fit size/scale into a structured table with:
  - revenue
  - headcount
  - other scale marker
- Changed prospect stage to ranked top three.
- Added buyer role map with dropdowns for common buyer roles and the role each plays.
- Added helper text to initial use-case wedge.
- Changed trigger events to ranked `Prospect Buy Triggers`.
- Added example-style placeholders for:
  - bad-fit signals
  - positive must-have
  - positive nice-to-have
  - negative caution
- Changed disqualification rule wording.
- Removed strategic exception.
- Removed prospect segment scoring matrix.

## Buyer Personas, Buying Committee, and Proof

- Changed persona value-driver fields into dropdowns.
- Dropdowns use selected value-proof options from Current Traction when available.
- Added `Existing and missing proof assets` table.
- Added asset-exists checkbox and asset name field.
- If a proof criterion is not marked as existing, saving the form auto-adds it to the proof gap tracker unless already listed.

## Backend

- Added a Node backend in `server/server.js`.
- Added `package.json` with `npm start`.
- Added `BACKEND.md`.
- Added `.gitignore`.
- Added `server/data/.gitkeep`.
- Backend serves the tool and exposes:
  - `GET /api/records`
  - `POST /api/records`
  - `PUT /api/records/:id`
  - `POST /api/research` placeholder
- Backend stores records in `server/data/records.json`.
- `server/data/*.json` is ignored by Git to avoid committing client data.
- Added `Start GTM Tool.bat` for easier local startup on Windows.
- Implemented server-side `/api/research` endpoint for AI Research.
- `/api/research` calls OpenAI when `OPENAI_API_KEY` is configured.
- AI Research uses the company name, website, current form fields, and intake schema to return structured field suggestions.
- The endpoint returns a clear setup message when `OPENAI_API_KEY` is missing.
- Added simple password authentication controlled by `TOOL_PASSWORD`.
- Protected intake pages and API endpoints when `TOOL_PASSWORD` is set.
- Added signed session cookie support with optional `AUTH_SECRET`.

## Render Deployment

- Added `render.yaml`.
- Updated server to listen on Render-compatible host/port.
- Confirmed local backend smoke test worked.
- Render deployment is not fully live yet because GitHub needs the complete tool files pushed to `main`.
- `render.yaml` and backend core files were added to GitHub through the GitHub connector.
- The full `tool` folder still needs to be committed or uploaded to GitHub for Render to serve the complete public app.

## Current Workflow

Current local tool path:

```text
C:\Users\sathb\OneDrive\Documents\GitHub\GTM-Tool
```

Local app URL while backend is running:

```text
http://localhost:8787
```

Deployment workflow:

```text
local edits -> GitHub push -> Render auto-deploy
```

Important:

- `localhost` only works on the user's computer.
- A public URL requires successful Render deployment.
- AI Research still needs a real backend OpenAI implementation and API key stored server-side.

## 2026-06-12 Evening Render, Auth, And AI Setup

- Confirmed Render service was live at `https://gtm-tool-1mib.onrender.com`.
- Identified why the login screen did not appear after the first rebuild:
  - Render was deploying from GitHub `main`.
  - GitHub still had the older `server/server.js` without auth or the real AI Research endpoint.
- Updated GitHub `server/server.js` directly with the current backend from the local project.
- GitHub commit created for the backend/auth update:
  - `5f7bc8f` - `Add auth and AI research backend`
- Current backend now includes:
  - password login controlled by `TOOL_PASSWORD`
  - signed session cookies controlled by `AUTH_SECRET`
  - protected tool pages and API endpoints
  - saved brand/company records API
  - AI Research endpoint at `POST /api/research`
  - OpenAI API usage through server-side `OPENAI_API_KEY`
- Walked through Render environment variable setup:
  - `AUTH_SECRET`
  - `TOOL_PASSWORD`
  - `OPENAI_API_KEY`
- Resolved the Render duplicate-key issue by deleting the extra `OPENAI_API_KEY` row and keeping the existing key row.
- User planned to click `Save, rebuild and deploy` after environment variables were corrected.

Next checks:

- After Render finishes deploying, open:

```text
https://gtm-tool-1mib.onrender.com/login
```

- Confirm the password login appears.
- Log in with the value stored in `TOOL_PASSWORD`.
- Test the `AI Research` button with a brand/company name or website entered.
- If AI Research errors, first confirm the saved `OPENAI_API_KEY` value is a complete valid key.
- Still need to return to the local Git permissions/workflow issue so future changes can be pushed normally instead of relying on manual GitHub file updates.

## 2026-06-15 AI Research Cost Control

- Paused browser-triggered API-backed AI Research to avoid ongoing OpenAI API usage costs.
- Renamed the intake header button from `AI Research` to `Copy Research Prompt`.
- Replaced the browser research action with a ChatGPT prompt workflow.
- The prompt is copied to the clipboard when possible and also appended to the research notes field.
- The requested ChatGPT output format is paste-friendly:
  - public presence table
  - intake field suggestions
  - research notes, source URLs, and open questions
- Left `tool/ai-research.js` as an intentional no-op so the old API override script does not call `/api/research`.

## 2026-06-15 Target Prioritization

- Added a `Target prioritization matrix` to the Quick Response Ideal Customer Profile section.
- The matrix scores segments on urgency, ability to pay, ease of access, proof/customer evidence, implementation fit, strategic value, sales-cycle fit, and revenue potential.
- The intake table supports 3 starting segments and additional rows.
- The results page now summarizes target priority, highlights the top segment, and flags one or two low-scoring segments as `Do not chase yet`.
- The copied GTM plan now includes the target-prioritization recommendation when segment scores are present.

## 2026-06-15 Competitive Landscape

- Added competitive landscape capture, later folded into the Offer Readiness section flow.
- Added a repeatable named competitor table with columns for perceived differentiators, why customers choose us, why customers choose the competitor, and the most common objection against switching.
- Moved `Alternatives prospects use today` into `Alternatives & Competition`.
- Moved `Common objections` and objection handling into `Objections`.
- Preserved the existing `alternatives` and `objections` field IDs to protect saved records.
- Updated the ChatGPT research prompt to ask for named competitors and switching context.

## 2026-06-15 Offer Readiness Redesign

- Renamed `Problem, Offer, Packaging, Pricing, and Proof` to `Offer Readiness: Problem, Value, Price, and Proof`.
- Replaced loose blank text areas with structured buyer problem, urgency, value, promise, first-use-case, pricing, and pilot-plan prompts.
- Added `Measurable value claims`, `What changes for the buyer?`, `Offer packaging`, `Buyer objections and risk reduction`, and `Proof readiness` tables.
- Consolidated proof capture into one proof-readiness table instead of separate existing/missing proof and proof-gap tables.
- Added an `Offer Readiness Summary` section to the results page.
- Updated the copyable ChatGPT research prompt to request offer-readiness tables and source-backed field suggestions.
- Added ordered section content rendering so the Offer Readiness section can interleave field groups and tables.
- Moved `Offer promise and positioning` after buyer problem, measurable value, and before/after clarification.
- Reordered Offer Readiness to: Buyer Problem & Urgency, Measurable Value, Before / After, Offer Promise, First Use Case / Buying Path, Packaging & Pricing, Pilot Plan, Alternatives & Competition, Objections, Proof Readiness, Sales Assets.
- Updated the value-claim table to use `Metric affected` as the required measurement column.
- Updated the offer-promise block title and category options to match the requested positioning flow.
- Renamed the packaging/pricing block and tightened pricing model and approval-level dropdowns to the requested option sets.
- Renamed the pilot block to `Pilot plan, if needed` and kept `Pilot price` flexible so it can accept a price, `Free`, `Paid`, or a range.
- Renamed the alternatives block to `Alternatives and competition`; retained the alternatives checkbox list and alternative-comparison strategy table.
- Renamed the objections block to `Objections and risk reduction`; retained the objections checkbox list and objection-handling table.
- Changed `Proof / asset needed` in the objection-handling table from free text to the shared proof-type dropdown.
- Restored the final Offer Readiness section headings and order to the recommended final layout.
- Added a live `Offer Readiness Summary` card at the bottom of the intake section.
- The summary card updates on input/change and pulls target buyer, urgent problem, offer promise, first offer, next step, pricing confidence, strongest proof, proof gap, and likely objection.

## 2026-06-15 Company Information Taxonomy

- Renamed `Prepared by / respondent` to `Your Name`.
- Renamed `Review period covered` to `Report Time Period` and expanded the dropdown to last 90 days, last 6 months, last 12 months, current quarter, current fiscal year, current calendar year, and custom date range.
- Added conditional custom start and finish date fields using `DD/MM/YYYY` placeholders.
- Split the former primary offering text area into primary and secondary product/offer name plus product-page URL fields.
- Added reusable industry and business-type taxonomy data in `tool/gtm-taxonomy.js`.
- Replaced free-text industry/business classification with required grouped dropdowns that store stable IDs and save display labels.
- Added optional `Other / Not sure` detail fields for industry and business model.
- Added derived GTM archetype metadata and score-model mapping for future scoring logic.
- Updated the results page to show friendly Industry, Business model, and GTM archetype labels instead of raw IDs.
- Moved the recurring-revenue checkbox directly after `Current annual revenue`.
- MRR and ARR now only appear when `Recurring revenue applies to this business` is checked.

## 2026-06-15 Local Launcher

- Added `Open GTM Tool.vbs` to start the local GTM Tool server in the background without leaving a PowerShell or command window open.
- Added `Stop GTM Tool.bat` to stop the hidden local server listening on port `8787`.

## 2026-06-15 Value Claim Cards

- Replaced the horizontal `Value claim` table in Offer Readiness with repeatable vertical value-claim cards.
- Each card captures buyer outcome, buyer language, measurement, current state, improvement, timeframe, proof strength, evidence, before state, and after state.
- The first value claim card appears by default, with an `Add another value claim` button up to 5 cards.
- Cards after the first can be removed.
- Added live generated value-claim summaries and save them in hidden `generatedSummary` fields.
- Removed the separate visible `Before / After` intake block because before/after now lives inside each value claim card.
- Added a `Measurable Value Claims` section to the results page.

## 2026-06-16 Executive Quick Review

- Replaced the old `Executive Snapshot` section with `Executive Quick Review`.
- Added a `Quick Review | Detailed Review` toggle near the top of the intake.
- Quick Review is the default mode for new sessions and shows only Company Basics, Executive Quick Review, and the action bar.
- Detailed Review shows the full workbook while keeping the 12 score fields only in Executive Quick Review.
- Executive Quick Review renders four cards: Market and Customer; Offer, Value, and Proof; Revenue Motion; Execution Readiness.
- Moved all 12 GTM readiness score fields out of Pipeline and into Executive Quick Review, with no duplicate score controls.

## 2026-06-16 Best-Fit Customer Focus

- Refactored `Quick Response Ideal Customer Profile` into the visible `Best-Fit Customer Focus` section.
- Added plain-English education cards for customer segments and ICP.
- Replaced the old default ICP table and wide target matrix with 1-3 possible customer group cards.
- Added 15-point segment fit scoring, live recommendations, and a suggested best-fit customer group.
- Added a best-fit profile card, collapsed advanced ICP details, and moved avoid-for-now guidance to the bottom.
- Preserved old saved ICP and prioritization data through migration/fallback logic.
- Updated downstream carry-forward logic and results output for the new best-fit customer fields.

## 2026-06-16 Revenue Planning Cards

- Clarified the lower part of `Revenue Goals, Strategy, and Constraints`.
- Renamed the constraint-level table to `Constraint Scan` with clearer helper text and Medium/High wording.
- Replaced the visible `30/60/90 Success Plan` table with `What Success Looks Like` cards for 30, 60, and 90 days.
- Replaced the visible `GTM Constraint Tracker` table with repeatable `Top Blockers to Resolve` cards.
- Added generated success statements and blocker summaries.
- Preserved legacy `successPlan` and `gtmConstraintTracker` data through migration into the new card fields.
- Updated results to show `90-Day Success Plan`, `Top Blockers to Resolve`, and use the new cards in the generated 90-day plan.
- Added validation so the user must complete all 12 readiness ratings before generating results.
- Moved old Snapshot detail into Detailed Review sections instead of deleting it:
  - channel ranking and channel detail into `Channel Performance`
  - proof/referral candidates into Current Traction and Customer Proof
  - success criteria into `30/60/90 Success Plan`
  - constraints into `GTM Constraint Tracker`
  - low-yield activities into Revenue Goals, Strategy, and Constraints
  - senior/delegate triggers into Lead Sources, Pipeline, and Sales Motion
  - avoid segments into Quick Response Ideal Customer Profile
- Results now use four scorecard categories, show Quick score confidence, show an Executive Quick Summary, list Top Recommended Actions, and suggest Detail Needed to Improve Confidence.
## 2026-07-23 - Phase 2 answer review and proof coaching

- Added field-specific review criteria for customer, problem, urgency, offer, measurement, proof, first-win rationale, channel, motion, goal, constraint, and focus answers.
- Added `Review current answer` beside supported populated fields.
- Reviews return a concise assessment and proposed revision without changing the saved answer.
- Kept `Use this answer` as the required approval step before any reviewed answer is written.
- Added guided problem, offer, success-measure, and proof coaching.
- Added proof assistance for both proven post-revenue outcomes and pre-revenue credibility cues.
- Added safe AI write-back for the existing multi-select dropdown controls using only schema-approved options.
- Expanded Phase 2 regression coverage to 42 focused checks plus four-company context isolation and the full profile, semantic, route, and asset suites.
## 2026-07-23 - Phase 3 canonical plan model

- Added one canonical plan model for validation, foundation, and optimization plans.
- Limited the executable plan to three semantically distinct top priorities.
- Added owner, timing, completion rule, evidence requirement, review decision, and destination to every canonical action.
- Aligned the GTM Plan Summary, ranked action plan, 30/60/90 plan, and Active Plan to the same action order.
- Preserved alternative customer hypotheses separately from the primary customer decision.
- Added a four-company canonical-plan integrity gate covering pre-revenue consumer, pre-revenue SaaS, mixed consumer, and post-revenue SaaS scenarios.

## 2026-07-23 - Phase 3 asset contracts and export coverage

- Added explicit content contracts for every plan, brief, builder, and review workspace shown in asset navigation.
- Added a machine-checkable current-asset contract to each rendered asset.
- Added concise asset status and last-updated information beneath each asset link.
- Kept the Validation Workspace on a workbook export path while preserving PDF and print controls for finished assets.
- Added regression coverage for asset contracts, export controls, navigation state, sidebar scrolling, control overlap, and clean print mode.

## 2026-07-23 - Phase 4 experience and accessibility

- Added shared accessible feedback states for saving, loading, success, warnings, errors, and blank status regions.
- Added a consistent visible focus treatment across links, buttons, fields, and expandable controls.
- Added full keyboard navigation and ARIA relationships to the custom multi-select dropdown.
- Added row, column, and table-title semantics to shared intake tables.
- Preserved independently scrolling desktop navigation while adding compact current-section and asset navigation on mobile.
- Removed the empty intake header panel that appeared when its status controls were hidden.
- Added four-company regression coverage for accessibility basics, keyboard flow, section restoration, mobile context, clipped text, control overlap, and horizontal overflow.

## 2026-07-23 - Phase 5 release quality system

- Added a permanent blocking release gate available through `npm run qa:release`.
- Added required Render deployment-marker verification before live regression testing.
- Combined the critical syntax, persistence, score, content, AI, plan, asset, responsive, route, and render suites into one result.
- Added timestamped machine-readable results and a concise human release summary.
- Prevented the semantic fixture check from rewriting its tracked result file unless explicitly requested.
- Verified the first authenticated Render run with 1,021 passing checks and no blocking failures.

## 2026-07-24 - Fresh four-company QA and full Active Plan cycles

- Replaced the legacy QA fixtures with four new, fully populated pre-revenue and post-revenue scenarios.
- Corrected primary offer, targeting-strategy, and revenue-motion fixture relationships to store row IDs instead of display labels.
- Added authenticated record deletion support and a reusable QA-record cleanup script.
- Fixed the week-close prompt so it remains hidden until every current priority is complete and has evidence.
- Removed remaining ForgeLine-specific dependencies from the permanent regression suite.
- Added a two-company, four-week Active Plan cycle test covering partial completion, carry-forward, weekly history, and next-cycle creation.
- Standardized the fixture generator on the release gate's `GTM_QA_BASE_URL` environment variable so remote seeding cannot silently fall back to localhost.
- Passed the local blocking release gate with 1,192 of 1,192 checks and the focused Active Plan cycle test with 26 of 26 checks.

## 2026-07-29 - Consolidated Plan Summary and guided operating setup

- Made Plan Summary the default post-plan return destination.
- Rebuilt the four summary cards around a Go / Conditional Go / Not Ready launch decision, a 90-day learning opportunity, resumable This Week work, and the top one or two readiness blockers.
- Removed the input-completeness “Evidence confidence” metric from Plan Summary and readiness details.
- Added score-weight presets, optional custom weights, standard-versus-custom comparison, point delta, and launch-decision-change disclosure.
- Replaced generic summary detours with specific actions for the focused test, first 25-account list, current weekly work, and readiness blockers.
- Added consistent expandable readiness components with counted evidence, smallest score-changing inputs, same-page save/recalculation, optional skip, and a secondary deeper-rework path.
- Corrected offer measurable-value scoring to recognize the current value-claim columns (`outcomeType`, `buyerFacingClaim`, `successMetric`, `targetImprovement`, baseline, and timeframe).
- Kept channel/source semicolon-compatible multi-select behavior, added status-driven activity and effort labels, limited 90-day results to Active channels, and changed channel owner to a role dropdown.
- Reframed planning pipeline values as a starting baseline, removed CRM deal-routing and stalled-deal tables from the core planning UI while retaining saved data, and made conversion mapping explicitly optional.
- Converted Tool Setup into one guided, resumable current task with in-context ICP/persona review, blocked reasons, Continue later / Skip for now, and durable progress.
- Added a distinct Weekly GTM Review Setup workspace that reuses canonical owner, cadence, CRM, and selected-motion review-rule fields and saves a durable ready/in-progress state.
- Kept Evidence This Week separate and added a controlled next-experiment exercise built from observed evidence.
- Added consolidated static/runtime syntax regression coverage to the permanent release gate.

## 2026-08-05 - Product safety, compatibility, and continuation standard

- Corrected setup navigation grammar so a task reads, for example, `ICP Brief needs review.`
- Added `SECURITY_AND_COMPATIBILITY_STANDARD.md` as the required product rule for backward-compatible changes, data protection, AI/agent controls, and the production release gate.
- Added `NEXT_CHAT_BRIEF.md` so future work can resume from durable project context rather than a long chat transcript.
