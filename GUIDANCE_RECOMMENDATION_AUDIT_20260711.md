# Guidance Recommendation Audit - 2026-07-11

Purpose: identify places where the intake should guide the user with recommendation-first answers instead of asking for open-ended strategic thinking.

## Principle

Keep freeform fields for names, owners, dates, exact wording, notes, and pasted research. Replace or supplement freeform fields when the user is being asked to define strategy, criteria, rules, messaging, proof needs, buyer logic, or next actions.

## Already Changed In This Pass

- `preTargetListInfoToCapture` in Validation Motion: removed the visible freeform prompt. The system now states the core target-list fields in the recommendation panel, and extra capture needs should be handled through Other in the guided dropdowns.
- `preRevenueValidationMotion`: converted the visible section to a recommendation-first workflow. The panel now recommends the audience, sources, include/exclude rules, core data capture, message, proof cue, ask, weekly target, weekly work pattern, positive signal, continue rule, revise rule, and stop/pause rule. The fields below are framed as confirm / revise / add controls.

## Immediate Recommendation-First Candidates

### Pre-Revenue: First Validation Offer / Buying Commitment

- `preWedgeIncluded`: should recommend what the buyer receives or agrees to based on offer type, buying path, and validation goal.
- `preWedgeExcluded`: should recommend what to leave out to keep the first validation offer small.
- `preWedgeSuccessCriteria`: should be guided with path-specific thresholds such as waitlist signups, reviews, preorders, pilot requests, sample/demo reviews, or test orders.

### Pre-Revenue: Buyer and Discovery Plan

- `preDtcDiscoveryQuestions`: should generate recommended DTC discovery questions from selected segment, problem, urgency, buyer role, and first commitment.
- `preChannelDiscoveryQuestions`: should generate recommended channel/business buyer questions from selected segment, buyer role, channel type, risk, proof needs, and economic concerns.

### Pre-Revenue: Evidence Tracker

- `preDecisionRules`: should become guided continue / revise / stop logic based on the Validation Motion answers.
- `preEvidenceTracked`: should show recommended tracking items first, based on buying path and selected positive signals.

### Customer Priority Framework

- `possibleCustomerGroups.whoTheyAre`: should use guided dimensions and examples, not a blank description.
- `possibleCustomerGroups.segmentIdentityDetails`: should be guided by measurable, reachable, meaningfully different, actionable, valuable criteria.
- `possibleCustomerGroups.endConsumerProfile`: should be guided for B2C or end-user cases.
- `possibleCustomerGroups.channelBuyerProfile`: should be guided for retailer, wholesaler, marketplace, distributor, partner, or business-buyer cases.
- `possibleCustomerGroups.sizeDefinition`: should use guided size markers by business type.
- `possibleCustomerGroups.economicFitDefinition`: should use recommended economic markers such as budget source, margin, order size, LTV, renewal, or repeat purchase.
- `possibleCustomerGroups.resourceConstraintDefinition`: should only appear when resource constraints are part of the segment description, with suggested ways to quantify it.
- `possibleCustomerGroups.expertiseGap`: should only appear when capability gap is relevant, with guided capability options.
- `possibleCustomerGroups.competitiveContext`: should be guided by current alternative, workaround, incumbent, or do-nothing choices.
- `possibleCustomerGroups.whyNow`: should be guided by trigger/timing options and recommended examples.

### Revenue Goals, Strategy, and Constraints

- `capacityNotes`: should be guided by customer types to avoid, support burden, customization burden, delivery risk, implementation risk, and current capacity limits.
- Legacy success-plan text fields should be replaced by structured 30/60/90 outcomes, metrics, owner, evidence, and decision rules where still visible.

### Customer Evidence and Traction

- `proofReferenceCandidates.resultStory`: should be guided by result type, evidence strength, buyer relevance, and proof asset type.
- `customerEvidenceInventory.whyGoodFit`: should be guided by fit dimensions instead of open notes.
- `customerEvidenceInventory.notes`: should remain optional notes only.
- `expansionOpportunities.opportunity`: should be guided by expansion paths.
- `deliveryFitRisks.whatMadeHard`: should be guided by delivery-risk categories.
- `deliveryFitRisks.lessonNextAction`: should recommend next action categories before allowing notes.

### ICP Hypothesis and Market Segmentation

- `useCaseWedge`: should be generated or guided from customer group, problem, offer, proof, and urgency.
- `disqualificationRule`: should be guided by fit, caution, and bad-fit signals already captured elsewhere.

### Buyer Personas and Buying Committee

- `buyerRoleCards.painPriority`: should be recommended from buyer role and selected problem.
- `buyerRoleCards.needsToBelieve`: should be generated from role, risk, proof, and buying path.
- `buyerRoleCards.message`: should be recommended from role, problem, offer, proof, and message angle.
- `buyerRoleCards.discoveryQuestions`: should be generated as suggested questions, then editable.
- `mostImportantPersonaRisk` and `salesProcessChangeNeeded`: should be guided from buyer risk and sales process gaps.

### Offer Readiness

- `offerPortfolio.buyingCommitteeMessageAngle`: should be generated first, then editable.
- `offerPortfolio.buyingCommitteeMissingAssetNote`: should be generated from selected buyer committee, value claims, proof assets, and missing proof.

### Buying Triggers and Targeting Signals

- `signalInfrastructureNotes`: should remain optional notes.
- `signalDataSourceReadiness.notesGaps`: should be guided by missing source, owner, confidence, cadence, and action.
- `globalNegativeSignals.whyItMatters`: should be guided by evidence requirements for disqualification rules.
- `signalPlayPortfolio.playNotes`: should remain optional notes after the play is structured.

### Revenue Motion, Channels, and Pipeline

- `revenueInfrastructureNotes`: should remain optional notes.
- `revenueMotionPortfolio.playGoal`: should be guided by motion type, channel/source, offer, and 30/90-day objective.
- `revenueMotionPortfolio.evidenceOrUnknowns`: should become guided evidence / uncertainty categories.
- Legacy channel and sales-motion tables should be treated as legacy only; if visible, they need guided replacements.

## Fields That Can Stay Freeform

- Company name, person name, role/title, website, custom date, owner name.
- Exact customer/account names.
- Offer names, play names, motion names, and new customer-group names.
- Pasted research notes and optional notes fields after the recommendation-first structure is already provided.
- Numeric or custom values that cannot be known from the schema.
