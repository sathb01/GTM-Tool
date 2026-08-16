(function (root) {
  function clean(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function isMeaningfulNextStep(value) {
    const text = clean(value);
    if (!text) return false;
    return !/^(demo|call|meeting|pilot|follow[- ]?up|conversation|learn more|next step)$/i.test(text);
  }

  function smallestEvidenceProducingNextStep(context = {}) {
    const customer = clean(context.customer);
    const buyer = clean(context.buyer);
    const offer = clean(context.offer);
    const motion = clean(context.motion);
    const pilot = clean(context.pilot);
    const channel = clean(context.channel);

    if (customer && buyer && offer) {
      const reviewSubject = pilot || `${offer}'s renewal-risk workflow`;
      return {
        mode: "recommendation",
        recommendation: `Ask ${buyer} at one qualified account in the saved customer group (${customer}) to join a 30-minute review of ${reviewSubject}. Use ${offer} in the review, then ask the buyer to agree to scope one limited account-portfolio test. Record whether they accept, object, or decline and the reason.`,
        why: `This is the smallest step in ${motion || "the saved revenue motion"}${channel ? ` through ${channel}` : ""} that can produce buyer evidence before a larger pilot or purchase commitment.`,
        readinessEffect: "Saving a specific buyer commitment completes the buying-path input used by Offer and Proof readiness."
      };
    }

    return {
      mode: "choice",
      recommendation: "",
      choices: [
        "Ask one qualified buyer for a 30-minute problem and workflow review.",
        "Ask one qualified buyer to review one proof asset and name what is still missing.",
        "Ask one qualified buyer to scope a limited pilot for one account or workflow."
      ],
      why: "The saved plan does not yet contain enough customer, buyer, and offer detail to write a reliable custom recommendation.",
      readinessEffect: "Choosing one bounded evidence-producing action completes the buying-path input used by Offer and Proof readiness."
    };
  }

  function targetListProgressGuidance(context = {}) {
    const status = clean(context.status) || "Not started";
    const system = clean(context.system) || "the CRM or spreadsheet";
    const customer = clean(context.customer) || "the saved priority customer group";
    const nextTool = clean(context.nextTool) || "the next Tool Setup task";
    const initialCount = Math.max(0, Number(context.initialCount) || 0);
    if (/^First qualified accounts added$/i.test(status) && initialCount < 1) {
      return {
        ready: false,
        title: `Record how many qualified ${customer} accounts were added.`,
        body: `The status says accounts were added, but the saved account count is empty. Enter the number of qualified accounts currently in ${system} so Tool Setup can preserve the handoff accurately.`,
        actionLabel: "Enter the qualified account count",
        actionTarget: "#target-list-progress"
      };
    }
    const ready = /^(List created with required fields|First qualified accounts added)$/i.test(status);
    if (ready) {
      return {
        ready: true,
        title: `Target List Setup is ready in ${system}.`,
        body: `The list for ${customer} has the required structure${initialCount ? ` and ${initialCount} qualified account${initialCount === 1 ? "" : "s"}` : ""}. Progress is saved, and Tool Setup can now continue with ${nextTool}.`,
        actionLabel: `Continue in Tool Setup - ${nextTool}`
      };
    }
    if (/required fields still missing/i.test(status)) {
      return {
        ready: false,
        title: `Finish the required fields for the ${customer} list.`,
        body: `Still needed in ${system}: account name, website, buyer role, observable fit reason, source, owner, status, and one dated next action. These fields are required so outreach and the weekly review can identify who was worked, why they fit, and what happens next.`,
        actionLabel: "Review the required fields and finish the list",
        actionTarget: "#target-list-system-setup"
      };
    }
    return {
      ready: false,
      title: `Create the ${customer} list in ${system}.`,
      body: `Still needed: create one list using the saved ICP criteria and the required fields below. The list must exist before Messaging Kit or Outreach Sequence work can be assigned to qualified accounts.`,
      actionLabel: `Create the list in ${system}`,
      actionTarget: "#target-list-system-setup"
    };
  }

  function targetListCreationPlan(context = {}) {
    const company = clean(context.company) || "Company";
    const customer = clean(context.customer) || "Priority customer group";
    const criteria = Array.isArray(context.criteria) ? context.criteria.map(clean).filter(Boolean) : [];
    const exclusions = Array.isArray(context.exclusions) ? context.exclusions.map(clean).filter(Boolean) : [];
    const requiredFields = Array.isArray(context.requiredFields) ? context.requiredFields.map(clean).filter(Boolean) : [];
    const listName = `${company.replace(/^QA\d*\s*-\s*/i, "")} - ${customer.split(",")[0]} - First 25`;
    return {
      listName,
      initialQuantity: 25,
      criteria: criteria.length ? criteria : ["Use the saved priority-customer definition and observable fit signals."],
      exclusions: exclusions.length ? exclusions : ["Exclude any account that violates a saved disqualification rule."],
      requiredFields: requiredFields.length ? requiredFields : ["Account name", "Website", "Buyer role", "Fit reason", "Source", "Owner", "Status", "Next action and due date"],
      completionAction: "Return to this workspace, mark the list created, record the qualified account count if accounts were added, save progress, and continue to the next Tool Setup task."
    };
  }

  function focusedTestRouteGuidance(context = {}) {
    const currentTool = clean(context.currentTool);
    const currentStatus = clean(context.currentStatus) || "Not ready";
    const currentDone = clean(context.currentDone);
    if (!context.setupComplete && currentTool) {
      return {
        ready: false,
        label: `Complete prerequisite - ${currentTool}`,
        explanation: `${currentTool} is ${currentStatus.toLowerCase()}. ${currentDone || "Complete this setup task before starting Week 1."}`
      };
    }
    const weekAction = clean(context.weekAction) || "the first saved Week 1 action";
    const listStatus = clean(context.listStatus) || "Target List status not yet recorded";
    const resultsLocation = clean(context.resultsLocation) || "Weekly GTM Review";
    return {
      ready: true,
      label: "Start the focused test",
      explanation: `Enter Week 1 with ${weekAction}. Target List: ${listStatus}. Record activity, buyer responses, and the decision in ${resultsLocation}.`
    };
  }

  function readinessNavigationGuidance(context = {}) {
    const currentTool = clean(context.currentTool) || "the current setup task";
    const currentStatus = clean(context.currentStatus) || "Not ready";
    const blocker = clean(context.blocker);
    const setupLabel = clean(context.setupLabel) || "Readiness";
    if (!context.ready) {
      return {
        label: setupLabel,
        meta: blocker ? `Blocked: ${currentTool}` : `Start here: ${currentTool}`,
        title: blocker ? `Setup blocked - ${currentTool}` : `Continue ${setupLabel}`,
        copy: blocker
          ? `${blocker} Resolve this before launch, then complete the guided ${currentTool} task or choose Continue later.`
          : /^needs review$/i.test(currentStatus)
            ? `${currentTool} needs review. Complete this current setup task before weekly execution begins.`
            : `${currentTool} is ${currentStatus.toLowerCase()}. Complete this current setup task before weekly execution begins.`,
        actionLabel: blocker ? `Resolve ${currentTool} blocker` : `Continue ${currentTool}`
      };
    }
    return {
      label: "This Week",
      meta: context.started ? "In progress" : "Ready to start",
      title: context.started ? "Resume This Week" : "Start This Week",
      copy: "Tool Setup is ready. Continue with the saved weekly execution plan.",
      actionLabel: context.started ? "Resume This Week" : "Start This Week"
    };
  }

  function resolveToolBlockerState(context = {}) {
    const reason = clean(context.reason);
    if (reason) {
      return {
        status: "Waiting / Blocked",
        reason
      };
    }
    const currentStatus = clean(context.currentStatus);
    return {
      status: context.observedReady
        ? "Ready"
        : /Waiting\s*\/\s*Blocked/i.test(currentStatus) || !currentStatus
          ? "In progress"
          : currentStatus,
      reason: ""
    };
  }

  root.GTM_GUIDED_TASK_CONTEXT = Object.freeze({
    isMeaningfulNextStep,
    smallestEvidenceProducingNextStep,
    targetListProgressGuidance,
    targetListCreationPlan,
    focusedTestRouteGuidance,
    readinessNavigationGuidance,
    resolveToolBlockerState
  });
})(typeof window !== "undefined" ? window : globalThis);
