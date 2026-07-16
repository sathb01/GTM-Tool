# GTM Tool Data Model

Last updated: 2026-06-18

## Storage Shape

The intake is stored as a flat object. Each input field writes a string value keyed by its HTML field name. Repeatable tables and fixed tables use encoded keys.

Saved records use this shape:

```json
{
  "id": "uuid-or-local-id",
  "name": "Company or brand name",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp",
  "data": {
    "companyName": "Example Co",
    "website": "https://example.com"
  }
}
```

## Storage Locations

- Browser active intake key: `gtmReadinessIntake`
- Browser saved records key: derived from the intake storage key
- Server record store: `server/data/records.json`

## Field Key Conventions

### Simple Fields

Simple fields use the field ID directly:

```text
companyName
website
industryId
businessTypeId
quickBestFitCustomer
marketUrgency
```

### Other Fields

Dropdowns with an Other option can create a companion key:

```text
industryId__other
businessTypeId__other
```

### Repeatable Lists

Repeatable list fields are normalized into numbered item keys:

```text
icpMustHaveSignals__item-1
icpMustHaveSignals__item-2
avoidSegments__item-1
```

### Fixed Tables

Fixed table fields use:

```text
tableId__rowId__columnId
```

Examples:

```text
publicPresence__primary-website__url
gtmSystems__crm__tools
constraintLevels__budget__level
successLooksLike__30-days__needTo
```

### Repeatable Card Tables

Repeatable card tables use:

```text
tableId__rowId__columnId
```

The `rowId` is generated from a row label and number:

```text
possibleCustomerGroups__customer-group-1__groupName
proofReferenceCandidates__proof-candidate-1__customerName
offerPortfolio__offer-1__offerName
signalPlayPortfolio__play-1__playName
revenueMotionPortfolio__motion-1__playName
```

### Scoped Assessment Tables

Offer, signal, and revenue motion detailed assessments are scoped under the portfolio row they belong to.

Offer scoped field:

```text
offerAssessments__offer-1__oneSentencePromise
```

Offer scoped table:

```text
offerAssessments__offer-1__valueClaims__value-claim-1__outcome
```

Signal scoped table:

```text
signalPlayAssessments__play-1__buyingTriggerEvents__trigger-1__triggerEvent
```

Revenue motion scoped field:

```text
revenueMotionAssessments__motion-1__channelPerformance__activeStatus
```

Revenue motion scoped table:

```text
revenueMotionAssessments__motion-1__conversionStages__stage-1__stageName
```

## Core Entities

### Company

Primary keys include:

- `companyName`
- `website`
- `preparedBy`
- `respondentRole`
- `reviewPeriod`
- `reportStartDate`
- `reportEndDate`
- `primaryOfferName`
- `primaryOfferUrl`
- `secondaryOfferName`
- `secondaryOfferUrl`
- `industryId`
- `industryLabel`
- `industryGroup`
- `businessTypeId`
- `businessTypeLabel`
- `businessTypeGroup`
- `derivedGtmArchetypeId`
- `derivedGtmArchetypeLabel`
- `scoreModel`
- `companyStage`
- `geography`
- `teamSize`
- `revenueRange`
- `hasRecurringRevenue`
- `monthlyRecurringRevenue`
- `annualRecurringRevenue`
- `customerCount`
- `averageDealSize`
- `primarySalesMotion`
- `mainGrowthConstraint`
- `additionalGrowthConstraints__item-N`
- `researchNotes`

Main tables:

- `publicPresence`
- `gtmSystems`

### GTM Information

The base quick-report data includes:

- `quickBestFitCustomer`
- `quickBuyerProblem`
- `quickUrgencyNow`
- `quickOfferPromise`
- `quickPrimaryOutcome`
- `quickSuccessMeasure`
- `quickPrimaryRevenueSource`
- `quickCurrentSalesMotion`
- `quick90DayGoal`
- `quickBiggestConstraint`
- `quickStopAvoid`
- `weeklyRevenueHours`

The 12 score fields are:

- `marketUrgency`
- `icpClarity`
- `positioningClarity`
- `offerClarity`
- `pricingConfidence`
- `channelFocus`
- `salesMotion`
- `contentAssets`
- `funnelTracking`
- `experimentReadiness`
- `budget`
- `teamCapacity`

### Best-Fit Customer Focus

Main table:

- `possibleCustomerGroups`

Important columns:

- `groupName`
- `whoTheyAre`
- `problem`
- `whyNow`
- `urgency`
- `abilityToPay`
- `easeOfAccess`
- `proofEvidence`
- `implementationFit`
- `badFirstFocusReason`
- `strategicValue`
- `salesCycleFit`
- `revenuePotential`
- `notesEvidence`

Best-fit fields:

- `bestFitCustomerGroup`
- `bestFitPrimaryPain`
- `bestFitTrigger`
- `bestFitDecisionMaker`
- `bestFitChampion`
- `bestFitFirstUseCase`
- `bestFitEvidence`

Fit rule lists:

- `icpMustHaveSignals__item-N`
- `icpNiceToHaveSignals__item-N`
- `icpCautionSignals__item-N`
- `icpDisqualificationRules__item-N`
- `buyingTriggersSummary__item-N`
- `avoidSegments__item-N`

### Revenue Goals, Strategy, and Constraints

Simple fields:

- `businessPriority`
- `goal30`
- `goal60`
- `goal90`
- `clientAttribute`
- `supportedSalesCycle`
- `capacityNotes`
- `lowYieldActivity__item-N`

Tables:

- `constraintLevels`
- `successLooksLike`
- `topBlockers`

Important generated fields:

- `successLooksLike__30-days__generatedStatement`
- `successLooksLike__60-days__generatedStatement`
- `successLooksLike__90-days__generatedStatement`
- `topBlockers__blocker-N__generatedStatement`

### Customer Evidence and Traction

Fields and tables:

- `provenCustomerOutcomes`
- `proofReferenceCandidates`
- `customerEvidenceInventory`
- `expansionOpportunities`
- `deliveryFitRisks`
- `customerPerformance`

Delivery fit risks can be migrated into caution signals or disqualification rules when the user marks them that way.

### ICP Hypothesis and Market Segmentation

Fields and tables:

- `verticalFit__item-N`
- `useCaseWedge`
- `budgetCategory`
- `badFitSignals__item-N`
- `positiveMustHave__item-N`
- `positiveNiceToHave__item-N`
- `negativeCaution__item-N`
- `disqualificationRule`
- `sizeFit`
- `stageFit`
- `buyerRoleMap`
- `triggerEvents`

This section contains older but still-supported detailed ICP fields.

### Buyer Personas and Buying Committee

Overview fields:

- `buyingSituation`
- `conversationStarter`
- `budgetOwner`
- `painOwner`
- `dealBlocker`
- `peopleInvolved`
- `reviewRequirements`

Tables:

- `buyerRoleCards`
- `personaPriority`

Risk fields:

- `dealStallRisks`
- `mostImportantPersonaRisk`
- `salesProcessChangeNeeded`
- `personaRiskSeverity`

### Offer Portfolio and Offer Readiness

Portfolio table:

- `offerPortfolio`

Portfolio columns:

- `offerName`
- `offerRole`
- `targetCustomerGroup`
- `newOfferCustomerGroup`
- `primaryBuyer`
- `offerPriority`
- `assessmentDepth`

Primary offer:

- `primaryGtmOffer`

Scoped offer assessment fields include:

- `offerBuyerProblem`
- `offerTriggerEvent`
- `offerCurrentWorkaround`
- `offerCostOfInaction`
- `offerUrgencyLevel`
- `offerUrgencyEvidence`
- `icpOfferAlignment`
- `offerOutcomes`
- `buyerTransformationSummary`
- `oneSentencePromise`
- `suggestedOfferPromise`
- `offerDifferentiator`
- `offerCategory`
- `mainProofPoint`
- `promiseClarityRating`
- `firstUseCaseForOffer`
- `firstUseCaseFit`
- `whyBestStartingPoint`
- `buyerRequirements`
- `easiestNextStep`
- `nextStepCta`
- `buyingPathClarityRating`
- `pricingModel`
- `isPricingPublic`
- `minimumDealSize`
- `averageExpectedDealSize`
- `buyerApprovalLevel`
- `discountingRule`
- `packagingClarityRating`
- `pilotNeeded`
- `pilotLength`
- `pilotPrice`
- `pilotSuccessMetric`
- `pilotBuyerRequirements`
- `pilotConversionPath`
- `pilotRisk`
- `pilotReadinessRating`
- `buyerAlternativesToday`
- `offerObjections`
- `salesAssets`
- `priorityMissingAssets`

Scoped offer tables include:

- `valueClaims`
- `offerPackages`
- `alternativeComparison`
- `objectionHandling`
- `proofReadiness`

### Signal Plays

Shared signal fields:

- `signalDataSources`
- `signalOperatingOwner`
- `signalMonitoringCadence`
- `signalRoutingOwner`
- `signalInfrastructureNotes`

Shared signal tables:

- `signalDataSourceReadiness`
- `globalNegativeSignals`

Portfolio:

- `signalPlayPortfolio`
- `primarySignalPlay`

Scoped signal assessment tables:

- `buyingTriggerEvents`
- `fitSignals`
- `negativeSignalRules`
- `signalRoutingRules`
- `signalActionPlan`

### Revenue Motions

Shared revenue fields:

- `revenueTrackingSystem`
- `revenueReportingCadence`
- `primaryRevenueOwner`
- `pipelineReviewOwner`
- `sellingCapacity`
- `revenueDataQuality`
- `revenueInfrastructureNotes`

Tables:

- `opportunitySnapshot`
- `revenueMotionPortfolio`
- `primaryRevenueMotion`

Scoped revenue motion fields and tables:

- `channelPerformance`
- `pipelineMetrics`
- `nextExperiment`
- `conversionStages`
- `dealRoutingRules`
- `stalledDeals`

## Migration Layer

The app contains a substantial migration layer in `tool/app.js`. It keeps older saved records usable after major section refactors.

Current migration functions include:

- `normalizeLegacyIcpData`
- `normalizeLegacyGoalData`
- `migrateTractionData`
- `migratePersonaData`
- `migrateOfferData`
- `migrateSignalData`
- `migrateRevenueMotionData`
- `normalizeRepeatableData`
- `applyOfferGeneratedFields`

Important migration behavior:

- Old ICP and target prioritization fields are mapped into possible customer group cards.
- Old success-plan and constraint tracker fields are mapped into success cards and top blocker cards.
- Old proof, customer fit, expansion, and delivery-risk lists are mapped into customer evidence tables.

## Evidence Reconciliation Workspace

`evidenceReconciliationWorkspace` preserves user-approved strategy changes derived from execution evidence.

```text
evidenceReconciliationWorkspace
  version
  pending[]
    id
    evidenceFingerprint
    evidenceState
    evidenceDecision
    area
    sourceField
    sourceLabel
    currentValue
    proposedValue
    rationale
    evidenceSummary[]
    status
  history[]
    previousValue
    approvedValue
    status
    decidedAt
  updatedAt
```

Only one proposal can be pending at a time. Applying a proposal writes the approved value back to its original intake field, removes the pending proposal, and adds an immutable decision-history entry. Confirming an unchanged answer and dismissing a proposal are also recorded. The workspace never silently rewrites intake answers.
- Old buyer committee fields are mapped into buyer role cards.
- Old single-offer fields are mapped into `offerPortfolio__offer-1` and scoped offer assessment fields.
- Old single-context signal fields are mapped into `signalPlayPortfolio__play-1`.
- Old channel, sales motion, and stalled deal fields are mapped into `revenueMotionPortfolio__motion-1` and scoped revenue motion tables.

## Data Model Risks

- Flat keys are flexible but easy to mistype.
- Scoped assessment keys are powerful but require parser helpers.
- Migration code must be preserved until old saved records are no longer needed.
- The frontend schema is the main source of truth. There is no server-side schema validation.
- Saved records can contain stale fields that are hidden from current UI but still appear in the data object.
