const schema = window.GTM_INTAKE_SCHEMA;
const STORAGE_KEY = schema.storageKey;
const RECORDS_KEY = `${STORAGE_KEY}:records`;
const ACTIVE_RECORD_KEY = `${STORAGE_KEY}:activeRecordId`;
const IMPROVEMENT_FOCUS_KEY = `${STORAGE_KEY}:improvementFocus`;
const API_BASE = window.GTM_API_BASE || (window.location.protocol.startsWith("http") ? window.location.origin : "");
let autosaveTimer = null;
let intakeUiRefreshTimer = null;
let pendingIntakePanelRefresh = false;
let lastAutosaveSignature = "";
let currentReportMode = "quick";
let detailedSectionsVisible = false;
let activeSectionId = "company";
let formStateData = {};

const carryForwardRules = [
  {
    from: "averageDealSize",
    to: "opportunitySnapshot__average-deal-size-contract-value-order-value__answer"
  },
  {
    from: "averageDealSize",
    to: "averageExpectedDealSize"
  },
  {
    from: "gtmSystems__crm__tools",
    to: "opportunitySnapshot__crm-or-tracking-system-used-today__answer"
  },
  {
    fromAny: ["bestFitSizeScaleRange", "bestCustomerProfile__size-scale-range__answer"],
    to: "sizeFit__best-fit-profile__otherScale"
  },
  {
    fromAny: ["bestFitCustomerGroup", "possibleCustomerGroups__customer-group-1__groupName", "bestCustomerProfile__segment-company-type__answer", "verticalFit__item-1"],
    toRepeatable: "verticalFit"
  },
  {
    fromAny: ["bestFitCustomerGroup", "possibleCustomerGroups__customer-group-1__groupName", "bestCustomerProfile__segment-company-type__answer"],
    to: "offerTargetSegment"
  },
  {
    fromAny: ["bestFitCustomerGroup", "possibleCustomerGroups__customer-group-1__groupName", "bestCustomerProfile__segment-company-type__answer"],
    to: "priorityIcpForOffer"
  },
  {
    fromAny: ["bestFitPrimaryPain", "possibleCustomerGroups__customer-group-1__problem", "bestCustomerProfile__primary-pain__answer"],
    to: "urgentBuyerProblem"
  },
  {
    fromAny: ["bestFitPrimaryPain", "possibleCustomerGroups__customer-group-1__problem", "bestCustomerProfile__primary-pain__answer"],
    to: "offerBuyerProblem"
  },
  {
    fromTableColumn: {
      table: "customerPaidBenefits",
      column: "benefit"
    },
    to: "urgentBuyerProblem"
  },
  {
    fromAny: ["bestFitTrigger", "possibleCustomerGroups__customer-group-1__whyNow", "buyingTriggersSummary__item-1", "bestCustomerProfile__trigger-event-or-timing-signal__answer", "triggerEvents__1__trigger"],
    toRepeatable: "positiveTriggerRules"
  },
  {
    fromAny: ["bestFitTrigger", "possibleCustomerGroups__customer-group-1__whyNow", "buyingTriggersSummary__item-1", "bestCustomerProfile__trigger-event-or-timing-signal__answer", "triggerEvents__1__trigger"],
    to: "offerTriggerEvent"
  },
  {
    fromAny: ["bestFitDecisionMaker", "bestCustomerProfile__economic-buyer__answer"],
    to: "buyingCommittee__economic-buyer__titles"
  },
  {
    fromAny: ["bestFitDecisionMaker", "bestCustomerProfile__economic-buyer__answer"],
    to: "buyerRoleCards__economic-buyer__commonTitles"
  },
  {
    fromAny: ["bestFitDecisionMaker", "bestCustomerProfile__economic-buyer__answer"],
    to: "primaryBuyer"
  },
  {
    fromAny: ["bestFitDecisionMaker", "bestCustomerProfile__economic-buyer__answer"],
    to: "primaryBuyerForOffer"
  },
  {
    fromAny: ["bestFitChampion", "bestCustomerProfile__champion-day-to-day-owner__answer"],
    to: "buyingCommittee__champion__titles"
  },
  {
    fromAny: ["bestFitChampion", "bestCustomerProfile__champion-day-to-day-owner__answer"],
    to: "buyerRoleCards__champion__commonTitles"
  },
  {
    fromAny: ["bestFitFirstUseCase", "useCaseWedge", "bestCustomerProfile__first-use-case-or-sales-wedge__answer"],
    to: "useCaseWedge"
  },
  {
    fromAny: ["bestFitFirstUseCase", "useCaseWedge", "bestCustomerProfile__first-use-case-or-sales-wedge__answer"],
    to: "primaryWedge"
  },
  {
    fromAny: ["bestFitFirstUseCase", "useCaseWedge", "bestCustomerProfile__first-use-case-or-sales-wedge__answer"],
    to: "firstUseCaseForOffer"
  },
  {
    fromAny: ["bestFitDisqualificationSignals", "icpDisqualificationRules__item-1", "icpCautionSignals__item-1", "bestCustomerProfile__disqualification-signals__answer", "negativeCaution__item-1", "disqualificationRule"],
    toRepeatable: "badFitSignals"
  },
  {
    fromList: "avoidSegments",
    toRepeatable: "badFitSignals"
  }
];

function fieldName(baseId, rowId, columnId) {
  return rowId && columnId ? `${baseId}__${rowId}__${columnId}` : baseId;
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createOption(value, label = value) {
  const option = document.createElement("option");
  if (value && typeof value === "object") {
    option.value = value.id || value.value || value.label;
    option.textContent = value.label || value.id || value.value;
  } else {
    option.value = value;
    option.textContent = label;
  }
  return option;
}

function appendSelectOptions(select, options = []) {
  const grouped = options.some((option) => option && typeof option === "object" && option.group);

  if (!grouped) {
    options.forEach((option) => {
      select.appendChild(createOption(option));
    });
    return;
  }

  const groups = new Map();
  options.forEach((option) => {
    const group = option.group || "Other";
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group).push(option);
  });

  groups.forEach((groupOptions, groupLabel) => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = groupLabel;
    groupOptions.forEach((option) => optgroup.appendChild(createOption(option)));
    select.appendChild(optgroup);
  });
}

function createInput(field, name = field.id) {
  if (field.type === "checkbox") {
    const checkbox = document.createElement("input");
    checkbox.id = name;
    checkbox.name = name;
    checkbox.type = "checkbox";
    checkbox.value = field.value || "Yes";
    return checkbox;
  }

  if (field.type === "textarea" || field.type === "repeatableList") {
    const textarea = document.createElement("textarea");
    textarea.id = name;
    textarea.name = name;
    textarea.placeholder = field.placeholder || "";
    return textarea;
  }

  if (field.type === "money") {
    const input = document.createElement("input");
    input.id = name;
    input.name = name;
    input.type = "text";
    input.inputMode = "decimal";
    input.placeholder = field.placeholder || "";
    input.dataset.money = "true";
    input.addEventListener("blur", () => {
      input.value = formatMoneyInput(input.value);
    });
    return input;
  }

  if (field.type === "multiSelectDropdown") {
    return createMultiSelectDropdown(field, name);
  }

  if (field.type === "select" || field.type === "multiDropdown" || field.type === "score" || field.type === "scoreSelect") {
    const select = document.createElement("select");
    select.id = name;
    select.name = name;
    select.multiple = field.type === "multiDropdown";
    select.size = field.size || (field.type === "multiDropdown" ? 6 : 0);
    if (field.optionsFromMultiselect) {
      select.dataset.optionsFromMultiselect = field.optionsFromMultiselect;
      select.dataset.fallbackOptions = JSON.stringify(field.options || []);
    }
    if (field.dynamicOptionsFrom) {
      select.dataset.dynamicOptionsFrom = field.dynamicOptionsFrom;
      select.dataset.fallbackOptions = JSON.stringify(field.options || []);
    }

    if (field.type !== "multiDropdown") {
      select.appendChild(createOption("", field.type === "score" ? "-" : "Select one"));
    }

    if (field.type === "score") {
      [1, 2, 3, 4, 5].forEach((score) => {
        select.appendChild(createOption(String(score), String(score)));
      });
    } else if (field.type === "scoreSelect") {
      field.options.forEach((label, index) => {
        select.appendChild(createOption(String(index + 1), `${index + 1} - ${label}`));
      });
    } else {
      appendSelectOptions(select, field.options);
    }

    return select;
  }

  const input = document.createElement("input");
  input.id = name;
  input.name = name;
  input.type = field.type || "text";
  input.placeholder = field.placeholder || "";
  return input;
}

function createMoneyControl(input) {
  const wrapper = document.createElement("div");
  const prefix = document.createElement("span");

  wrapper.className = "money-input";
  prefix.className = "money-prefix";
  prefix.textContent = "$";
  wrapper.appendChild(prefix);
  wrapper.appendChild(input);
  return wrapper;
}

function formatMoneyInput(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  const cleaned = text.replace(/[$,\s]/g, "");
  const number = Number(cleaned);

  if (!Number.isFinite(number)) {
    return text.replace(/^\$/, "");
  }

  return number.toLocaleString("en-US", {
    maximumFractionDigits: cleaned.includes(".") ? 2 : 0
  });
}

function createOtherField(select, labelText = "Other name", triggerValue = "Other") {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  const input = document.createElement("input");

  wrapper.className = "other-field";
  wrapper.hidden = select.value !== triggerValue;
  wrapper.dataset.otherTriggerValue = triggerValue;
  label.htmlFor = `${select.name}__other`;
  label.textContent = labelText;
  input.id = `${select.name}__other`;
  input.name = `${select.name}__other`;
  input.type = "text";
  input.placeholder = "Enter other";
  wrapper.appendChild(label);
  wrapper.appendChild(input);

  select.addEventListener("change", () => {
    wrapper.hidden = select.value !== triggerValue;
    if (wrapper.hidden) {
      input.value = "";
    }
  });

  return wrapper;
}

function createMultiSelectDropdown(field, name = field.id) {
  const control = document.createElement("div");
  const trigger = document.createElement("button");
  const panel = document.createElement("div");
  const summary = document.createElement("div");
  const fallbackOptions = field.options || [];

  control.className = "multi-select-dropdown";
  control.dataset.multiSelectDropdown = "true";
  control.dataset.fieldName = name;
  control.tabIndex = -1;
  if (field.optionsFromMultiselect) {
    control.dataset.optionsFromMultiselect = field.optionsFromMultiselect;
    control.dataset.fallbackOptions = JSON.stringify(fallbackOptions);
  }

  trigger.type = "button";
  trigger.className = "multi-select-trigger";
  trigger.textContent = "Select all that apply";
  trigger.setAttribute("aria-expanded", "false");
  panel.className = "multi-select-dropdown-panel";
  panel.hidden = true;
  summary.className = "multi-select-summary";

  function selectedValues() {
    return Array.from(panel.querySelectorAll(`input[name="${CSS.escape(name)}"]:checked`)).map((input) => input.value);
  }

  function updateSummary() {
    const selected = selectedValues();
    trigger.textContent = selected.length ? `${selected.length} selected - View selections` : "Select all that apply";
    summary.textContent = selected.length ? `Selected: ${selected.join(", ")}` : "No selections yet.";
  }

  function renderOptions(options, selected = selectedValues()) {
    panel.innerHTML = "";
    options.forEach((option) => {
      const optionLabel = document.createElement("label");
      const checkbox = document.createElement("input");
      optionLabel.className = "checkbox-option";
      checkbox.type = "checkbox";
      checkbox.name = name;
      checkbox.value = option;
      checkbox.checked = selected.includes(option);
      checkbox.addEventListener("change", () => {
        updateSummary();
        control.dispatchEvent(new Event("change", { bubbles: true }));
        control.dispatchEvent(new Event("input", { bubbles: true }));
      });
      optionLabel.appendChild(checkbox);
      optionLabel.appendChild(document.createTextNode(option));
      panel.appendChild(optionLabel);
    });
    updateSummary();
  }

  Object.defineProperty(control, "value", {
    get() {
      return selectedValues().join(", ");
    },
    set(value) {
      const selected = String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      Array.from(panel.querySelectorAll(`input[name="${CSS.escape(name)}"]`)).forEach((checkbox) => {
        checkbox.checked = selected.includes(checkbox.value);
      });
      updateSummary();
    }
  });

  control.refreshOptions = (options) => renderOptions(options, selectedValues());

  trigger.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    trigger.setAttribute("aria-expanded", String(!panel.hidden));
  });

  document.addEventListener("click", (event) => {
    if (!control.contains(event.target)) {
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
  });

  control.appendChild(trigger);
  control.appendChild(panel);
  control.appendChild(summary);
  renderOptions(fallbackOptions);
  return control;
}

function supportsOtherField(field) {
  if (field.otherValue) {
    return field.type === "select";
  }

  return field.type === "select" && Array.isArray(field.options) && field.options.includes("Other");
}

function selectedMultiselectValues(fieldId) {
  return Array.from(document.querySelectorAll(`input[name="${CSS.escape(fieldId)}"]:checked, select[name="${CSS.escape(fieldId)}"] option:checked`))
    .map((input) => input.value)
    .filter(Boolean);
}

function updateDynamicOptionFields() {
  document.querySelectorAll("select[data-options-from-multiselect]").forEach((select) => {
    const selectedValue = select.value;
    const source = select.dataset.optionsFromMultiselect;
    const fallback = JSON.parse(select.dataset.fallbackOptions || "[]");
    const options = selectedMultiselectValues(source);
    const values = options.length ? options : fallback;

    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value)));

    if (values.includes(selectedValue)) {
      select.value = selectedValue;
    }
  });

  document.querySelectorAll("[data-multi-select-dropdown][data-options-from-multiselect]").forEach((control) => {
    const source = control.dataset.optionsFromMultiselect;
    const fallback = JSON.parse(control.dataset.fallbackOptions || "[]");
    const options = selectedMultiselectValues(source);
    const values = options.length ? options : fallback;

    if (typeof control.refreshOptions === "function") {
      control.refreshOptions(values);
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='possibleCustomerGroups']").forEach((select) => {
    const selectedValue = select.value;
    const fallback = JSON.parse(select.dataset.fallbackOptions || "[]");
    const groupNames = customerGroupRows(getFormData())
      .map((row) => row.values.groupName)
      .filter(Boolean);
    const values = [...new Set([...groupNames, ...fallback])];

    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value)));

    if (values.includes(selectedValue)) {
      select.value = selectedValue;
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='offerPortfolio']").forEach((select) => {
    const selectedValue = select.value;
    const data = getFormData();
    const offers = offerPortfolioRows(data);
    const values = offers.map((row, index) => ({
      id: row.rowId,
      label: offerDisplayName(row, index)
    }));

    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value.id, value.label)));

    if (values.some((value) => value.id === selectedValue)) {
      select.value = selectedValue;
    } else if (!selectedValue && values.length === 1) {
      select.value = values[0].id;
    } else if (!selectedValue) {
      const primary = offers.find((row) => row.values.offerPriority === "Primary GTM focus");
      if (primary && offers.filter((row) => row.values.offerPriority === "Primary GTM focus").length === 1) {
        select.value = primary.rowId;
      }
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='signalCustomerGroups']").forEach((select) => {
    const selectedValue = select.value;
    const data = getFormData();
    const values = collectCustomerGroupOptions(data);

    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value)));

    if (values.includes(selectedValue)) {
      select.value = selectedValue;
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='signalOfferUseCases']").forEach((select) => {
    const selectedValue = select.value;
    const data = getFormData();
    const values = collectOfferUseCaseOptions(data);

    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value)));

    if (values.includes(selectedValue)) {
      select.value = selectedValue;
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='signalPlayPortfolio']").forEach((select) => {
    const selectedValue = select.value;
    const data = getFormData();
    const plays = getSignalPlayRows(data);
    const primary = plays.filter((row) => row.values.playPriority === "Primary targeting strategy");

    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    plays.forEach((row, index) => select.appendChild(createOption(row.rowId, getSignalPlayLabel(data, row.rowId, index))));

    if (plays.some((row) => row.rowId === selectedValue)) {
      select.value = selectedValue;
    } else if (!selectedValue && plays.length === 1) {
      select.value = plays[0].rowId;
    } else if (!selectedValue && primary.length === 1) {
      select.value = primary[0].rowId;
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='revenueCustomerGroups']").forEach((select) => {
    const selectedValue = select.value;
    const values = collectRevenueCustomerGroupOptions(getFormData());
    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value)));
    if (values.includes(selectedValue)) {
      select.value = selectedValue;
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='revenueOffers']").forEach((select) => {
    const selectedValue = select.value;
    const values = collectRevenueOfferOptions(getFormData());
    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value)));
    if (values.includes(selectedValue)) {
      select.value = selectedValue;
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='revenueMotionPortfolio']").forEach((select) => {
    const selectedValue = select.value;
    const data = getFormData();
    const motions = getRevenueMotionRows(data);
    const primary = motions.filter((row) => row.values.playPriority === "Primary revenue motion");
    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    motions.forEach((row, index) => select.appendChild(createOption(row.rowId, getRevenueMotionLabel(data, row.rowId, index))));
    if (motions.some((row) => row.rowId === selectedValue)) {
      select.value = selectedValue;
    } else if (!selectedValue && motions.length === 1) {
      select.value = motions[0].rowId;
    } else if (!selectedValue && primary.length === 1) {
      select.value = primary[0].rowId;
    }
  });
}

function addRepeatableItem(list, field, value = "") {
  const index = list.children.length + 1;
  const item = document.createElement("div");
  const input = createInput(
    { ...field, type: field.itemType || "text" },
    `${field.id}__item-${index}`
  );
  const remove = document.createElement("button");

  item.className = "repeatable-item";
  input.placeholder = field.itemPlaceholder || "Enter one item";
  input.value = value;
  remove.type = "button";
  remove.className = "secondary";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    item.remove();
  });

  item.appendChild(input);
  item.appendChild(remove);
  list.appendChild(item);
}

function fieldForRow(column, row) {
  if (!column.optionsByRow) {
    return column;
  }

  const rowOptions = column.optionsByRow[row.id] || column.optionsByRow[row.label];

  if (!rowOptions) {
    return column;
  }

  return {
    ...column,
    type: "select",
    options: rowOptions.includes("None") ? rowOptions : ["None", ...rowOptions]
  };
}

function fieldForCell(column, row) {
  const field = fieldForRow(column, row);

  if (column.typeByRow && column.typeByRow[row.id]) {
    return {
      ...field,
      type: column.typeByRow[row.id]
    };
  }

  return field;
}

function createField(field) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");

  wrapper.className = field.full ? "full" : "";
  if (field.showWhen) {
    wrapper.dataset.showWhenField = field.showWhen.field;
    if (Object.prototype.hasOwnProperty.call(field.showWhen, "checked")) {
      wrapper.dataset.showWhenChecked = String(field.showWhen.checked);
    } else {
      wrapper.dataset.showWhenValue = field.showWhen.value;
    }
  }
  if (field.showUnless) {
    wrapper.dataset.hideWhenField = field.showUnless.field;
    wrapper.dataset.hideWhenValue = field.showUnless.value;
  }
  label.htmlFor = field.id;
  label.textContent = field.label;

  if (field.required) {
    const required = document.createElement("span");
    required.className = "required";
    required.textContent = " *";
    label.appendChild(required);
  }

  wrapper.appendChild(label);

  if (field.type === "checkbox") {
    const optionLabel = document.createElement("label");
    const checkbox = document.createElement("input");

    optionLabel.className = "checkbox-option";
    checkbox.id = field.id;
    checkbox.name = field.id;
    checkbox.type = "checkbox";
    checkbox.value = field.value || "Yes";
    optionLabel.appendChild(checkbox);
    optionLabel.appendChild(document.createTextNode(field.checkboxLabel || field.label));
    wrapper.appendChild(optionLabel);
  } else if (field.type === "repeatableList") {
    const list = document.createElement("div");
    const button = document.createElement("button");
    list.className = "repeatable-list";
    list.dataset.repeatableFor = field.id;

    Array.from({ length: field.minItems || 1 }).forEach(() => addRepeatableItem(list, field));

    button.type = "button";
    button.className = "secondary";
    button.textContent = field.addLabel || "Add another";
    button.addEventListener("click", () => addRepeatableItem(list, field));

    wrapper.appendChild(list);
    wrapper.appendChild(button);
  } else if (field.type === "multiselect") {
    const grid = document.createElement("div");
    grid.className = "checkbox-grid";

    field.options.forEach((option) => {
      const optionLabel = document.createElement("label");
      const checkbox = document.createElement("input");

      optionLabel.className = "checkbox-option";
      checkbox.type = "checkbox";
      checkbox.name = field.id;
      checkbox.value = option;
      optionLabel.appendChild(checkbox);
      optionLabel.appendChild(document.createTextNode(option));
      grid.appendChild(optionLabel);
    });

    wrapper.appendChild(grid);
  } else {
    const input = createInput(field);
    input.required = Boolean(field.required);
    wrapper.appendChild(field.type === "money" ? createMoneyControl(input) : input);

    if (supportsOtherField(field)) {
      wrapper.appendChild(createOtherField(input, field.otherLabel || "Other name", field.otherValue || "Other"));
    }
  }

  if (field.hint) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = field.hint;
    wrapper.appendChild(hint);
  }

  return wrapper;
}

function tableRows(table) {
  if (table.rows) {
    return table.rows.map((row) => typeof row === "string" ? { id: slug(row), label: row } : row);
  }

  return Array.from({ length: table.minRows || 3 }, (_, index) => ({
    id: `${slug(table.rowLabel)}-${index + 1}`,
    label: `${table.rowLabel} ${index + 1}`
  }));
}

function nextUnusedOfferCardNumber(list) {
  const used = new Set(
    Array.from(list.children)
      .map((card) => Number.parseInt(String(card.dataset.cardRow || "").replace("offer-", ""), 10))
      .filter(Number.isFinite)
  );
  let next = 1;
  while (used.has(next)) {
    next += 1;
  }
  return next;
}

function valueClaimSummary(values) {
  const outcome = values.outcome || "";
  const baseline = values.baseline || "";
  const improvement = values.improvement || values.expectedImprovement || "";
  const timeframe = values.timeframe || "";
  const proofStrength = values.proofStrength || values.confidence || "";
  const parts = [];

  if (!outcome || !baseline || !improvement || !timeframe) {
    return "Complete the outcome, current state, improvement, and timeframe to generate a value claim.";
  }

  parts.push(`We help buyers ${outcome.toLowerCase()} by moving from ${baseline} to ${improvement} within ${timeframe}.`);

  if (proofStrength) {
    parts.push(`Proof level: ${proofStrength}.`);
  }

  if (values.buyerLanguage) {
    parts.push(`Buyer language: ${values.buyerLanguage}.`);
  }

  if (values.proofSource) {
    parts.push(`Evidence: ${values.proofSource}.`);
  }

  if (values.beforeState && values.afterState) {
    parts.push(`Before: ${values.beforeState}. After: ${values.afterState}.`);
  }

  return parts.join(" ");
}

const segmentFitFields = ["urgency", "abilityToPay", "easeOfAccess", "proofEvidence", "implementationFit"];

function segmentFitRecommendation(score, completeCount) {
  if (completeCount < segmentFitFields.length || score <= 4) {
    return "Needs more information";
  }

  if (score >= 13) {
    return "Strong candidate";
  }

  if (score >= 9) {
    return "Possible candidate";
  }

  return "Weak candidate";
}

function segmentFitSummary(values) {
  const scoreLabels = {
    urgency: "Urgency",
    abilityToPay: "Ability to Pay",
    easeOfAccess: "Ease of Access",
    proofEvidence: "Proof Available",
    implementationFit: "Implementation Fit"
  };
  const scoresByField = Object.fromEntries(segmentFitFields.map((field) => [field, Number.parseInt(values[field], 10)]));
  const scores = Object.values(scoresByField).filter(Number.isFinite);
  const total = scores.reduce((sum, score) => sum + score, 0);
  const recommendation = segmentFitRecommendation(total, scores.length);
  const scoreBreakdown = segmentFitFields
    .map((field) => `${scoreLabels[field]}: ${Number.isFinite(scoresByField[field]) ? scoresByField[field] : "-"}`)
    .join(" | ");

  return {
    total,
    recommendation,
    text: `Customer Group Score: ${total}. ${scoreBreakdown}. Recommendation: ${recommendation}. High-scoring customer groups are easier to identify, reach, sell, and scale.`
  };
}

function successStatement(rowId, values) {
  const day = rowId.split("-")[0];

  if (!values.needTo || !values.measure || !values.target) {
    return "Complete the success outcome, measure, and target to generate a clear success statement.";
  }

  return `By day ${day}, success means ${values.needTo}. We will measure it by ${values.measure}, with a target of ${values.target}. Owner: ${values.owner || "Not assigned"}. Verification: ${values.verification || "Not defined"}.`;
}

function blockerStatement(values) {
  if (!values.blocker || !values.whyItMatters || !values.nextAction) {
    return "Complete the blocker, why it matters, and next action to generate a blocker summary.";
  }

  return `Blocker for ${values.successFocus || "the success plan"}: ${values.blocker}. This matters because ${values.whyItMatters}. To move forward, ${values.mustBeTrue || "define what must be true"}. Next action: ${values.nextAction}. Owner: ${values.owner || "Not assigned"}. Timing: ${values.timeframe || "Not set"}.`;
}

function createCardField(field, name) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  const input = createInput(field, name);

  wrapper.className = field.full ? "full" : "";
  label.htmlFor = name;
  label.textContent = field.label;

  if (field.required) {
    const required = document.createElement("span");
    required.className = "required";
    required.textContent = " *";
    label.appendChild(required);
  }

  input.required = Boolean(field.required);
  if (field.placeholderByRow) {
    const rowId = name.split("__")[1];
    input.placeholder = field.placeholderByRow[rowId] || input.placeholder;
  }
  wrapper.appendChild(label);
  wrapper.appendChild(field.type === "money" ? createMoneyControl(input) : input);

  if (field.hint) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = field.hint;
    wrapper.appendChild(hint);
  }

  return { wrapper, input };
}

function createCardTable(table) {
  const wrapper = document.createElement("div");
  const title = document.createElement("h3");
  const list = document.createElement("div");
  const button = document.createElement("button");
  const groups = [...new Set(table.columns.map((column) => column.group || "Details"))];
  const maxRows = table.maxRows || 5;
  const showGeneratedSummary = Boolean(table.summaryType) || table.id === "valueClaims";

  wrapper.className = "repeatable-card-section";
  title.textContent = table.title;
  list.className = "repeatable-card-list";
  list.dataset.repeatableCardListFor = table.id;
  button.type = "button";
  button.className = "secondary";
  button.textContent = table.addLabel || `Add ${table.rowLabel}`;

  if (table.title) {
    wrapper.appendChild(title);
  }
  if (table.hint) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = table.hint;
    wrapper.appendChild(hint);
  }
  wrapper.appendChild(list);

  function updateCardTitles() {
    Array.from(list.children).forEach((card, index) => {
      const heading = card.querySelector("h4");
      const remove = card.querySelector("[data-remove-card]");
      heading.textContent = card.dataset.cardLabel || `${table.rowLabel} ${index + 1}`;
      if (remove) {
        remove.hidden = !table.repeatable || index === 0;
      }
    });
    button.disabled = !table.repeatable || list.children.length >= maxRows;
    button.hidden = !table.repeatable || list.children.length >= maxRows;
  }

  function addCard(row = null) {
    if (list.children.length >= maxRows) {
      return;
    }

    const index = list.children.length + 1;
    const rowId = row?.id || (table.id === "offerPortfolio"
      ? `offer-${nextUnusedOfferCardNumber(list)}`
      : table.id === "signalPlayPortfolio"
        ? `play-${nextUnusedOfferCardNumber(list)}`
        : table.id === "revenueMotionPortfolio"
          ? `motion-${nextUnusedOfferCardNumber(list)}`
      : `${slug(table.rowLabel)}-${index}`);
    const rowLabel = row?.label || `${table.rowLabel} ${index}`;
    const card = document.createElement("div");
    const header = document.createElement("div");
    const heading = document.createElement("h4");
    const remove = document.createElement("button");
    const inputs = {};
    const generated = document.createElement("div");
    const generatedLabel = document.createElement("strong");
    const generatedText = document.createElement("p");
    const hiddenSummary = document.createElement("input");
    const hiddenScore = document.createElement("input");
    const hiddenRecommendation = document.createElement("input");

    card.className = "repeatable-card";
    card.dataset.cardRow = rowId;
    card.dataset.cardLabel = rowLabel;
    header.className = "repeatable-card-header";
    remove.type = "button";
    remove.className = "secondary";
    remove.dataset.removeCard = "true";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      card.remove();
      if (!list.children.length) {
        addCard();
      }
      updateCardTitles();
    });

    header.appendChild(heading);
    if (table.repeatable) {
      header.appendChild(remove);
    }
    card.appendChild(header);

    groups.forEach((group) => {
      const section = table.advancedGroups?.includes(group) ? document.createElement("details") : document.createElement("div");
      const sectionHeading = document.createElement("h5");
      const grid = document.createElement("div");

      section.className = "card-subsection";
      if (table.advancedGroups?.includes(group)) {
        const summary = document.createElement("summary");
        summary.textContent = group;
        section.appendChild(summary);
      } else {
        sectionHeading.textContent = group;
        section.appendChild(sectionHeading);
      }
      grid.className = "card-grid";
      section.appendChild(grid);

      table.columns
        .filter((column) => (column.group || "Details") === group)
        .forEach((column) => {
          const name = fieldName(table.id, rowId, column.id);
          const { wrapper: fieldWrapper, input } = createCardField(column, name);
          inputs[column.id] = input;
          grid.appendChild(fieldWrapper);
        });

      card.appendChild(section);
    });

    if (showGeneratedSummary) {
      generated.className = table.summaryType === "segmentFit" ? "fit-score-summary" : table.summaryType ? "generated-statement" : "generated-value-claim";
      generatedLabel.textContent = table.summaryType === "segmentFit"
        ? "Fit Score"
        : ["successStatement", "blockerStatement"].includes(table.summaryType)
          ? "Generated statement:"
          : "Generated value claim:";
      hiddenSummary.type = "hidden";
      hiddenSummary.name = fieldName(table.id, rowId, "generatedSummary");
      hiddenSummary.id = hiddenSummary.name;
      hiddenScore.type = "hidden";
      hiddenScore.name = fieldName(table.id, rowId, "segmentFitScore");
      hiddenScore.id = hiddenScore.name;
      hiddenRecommendation.type = "hidden";
      hiddenRecommendation.name = fieldName(table.id, rowId, "segmentFitRecommendation");
      hiddenRecommendation.id = hiddenRecommendation.name;
      generated.appendChild(generatedLabel);
      generated.appendChild(generatedText);
      generated.appendChild(hiddenSummary);
      if (table.summaryType === "segmentFit") {
        generated.appendChild(hiddenScore);
        generated.appendChild(hiddenRecommendation);
      }
      card.appendChild(generated);
    }

    function updateGeneratedSummary() {
      const values = Object.fromEntries(
        Object.entries(inputs).map(([key, input]) => [key, String(input.value || "").trim()])
      );
      if (table.summaryType === "segmentFit") {
        const summary = segmentFitSummary(values);
        hiddenSummary.value = summary.text;
        hiddenScore.value = String(summary.total);
        hiddenRecommendation.value = summary.recommendation;
        generatedText.textContent = summary.text;
        updateBestFitCustomerOptions();
        return;
      }

      if (table.summaryType === "successStatement") {
        const summary = successStatement(rowId, values);
        hiddenSummary.name = fieldName(table.id, rowId, "generatedStatement");
        hiddenSummary.id = hiddenSummary.name;
        hiddenSummary.value = summary;
        generatedText.textContent = summary;
        return;
      }

      if (table.summaryType === "blockerStatement") {
        const summary = blockerStatement(values);
        hiddenSummary.name = fieldName(table.id, rowId, "generatedStatement");
        hiddenSummary.id = hiddenSummary.name;
        hiddenSummary.value = summary;
        generatedText.textContent = summary;
        return;
      }

      const summary = valueClaimSummary(values);
      hiddenSummary.value = summary;
      generatedText.textContent = summary;
    }

    Object.values(inputs).forEach((input) => {
      input.addEventListener("change", updateGeneratedSummary);
      input.addEventListener("blur", updateGeneratedSummary);
    });

    const negativeSignalInput = inputs.signal || inputs.negativeSignal;
    if (negativeSignalInput && inputs.whyItMatters) {
      const updateNegativeSignalExplanation = () => {
        if (!String(inputs.whyItMatters.value || "").trim()) {
          inputs.whyItMatters.value = negativeSignalExplanation(negativeSignalInput.value);
        }
      };
      negativeSignalInput.addEventListener("change", updateNegativeSignalExplanation);
      updateNegativeSignalExplanation();
    }

    list.appendChild(card);
    if (showGeneratedSummary) {
      updateGeneratedSummary();
    }
    updateCardTitles();
  }

  tableRows(table).forEach((row) => addCard(row));
  button.addEventListener("click", () => addCard());
  if (table.repeatable) {
    wrapper.appendChild(button);
  }

  return wrapper;
}

function createTable(table) {
  if (table.layout === "cards") {
    return createCardTable(table);
  }

  const wrapper = document.createElement("div");
  const title = document.createElement("h3");
  const scroll = document.createElement("div");
  const htmlTable = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");
  const firstHeader = document.createElement("th");

  wrapper.className = "table-wrap";
  title.textContent = table.title;
  firstHeader.textContent = table.repeatable ? table.rowLabel : "Item";
  headerRow.appendChild(firstHeader);

  table.columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column.label;
    if (column.required) {
      th.textContent = `${column.label} *`;
    }
    headerRow.appendChild(th);
  });

  if (table.scoreMatrix) {
    const th = document.createElement("th");
    th.textContent = "Total";
    headerRow.appendChild(th);
  }

  thead.appendChild(headerRow);
  htmlTable.appendChild(thead);
  htmlTable.appendChild(tbody);
  scroll.appendChild(htmlTable);
  wrapper.appendChild(title);
  if (table.hint) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = table.hint;
    wrapper.appendChild(hint);
  }
  wrapper.appendChild(scroll);

  function addRow(row) {
    const tr = document.createElement("tr");
    const rowHeader = document.createElement("td");
    const rowInputs = {};
    const rowInput = table.repeatable
      ? createInput({ id: `${table.id}__${row.id}__label`, type: "text" }, `${table.id}__${row.id}__label`)
      : null;

    if (rowInput) {
      rowInput.placeholder = row.label;
      rowHeader.appendChild(rowInput);
    } else {
      rowHeader.textContent = row.label;
    }

    tr.appendChild(rowHeader);

    table.columns.forEach((column) => {
      const td = document.createElement("td");
      const cellField = fieldForCell(column, row);
      const input = createInput(cellField, fieldName(table.id, row.id, column.id));
      input.required = Boolean(cellField.required);
      rowInputs[column.id] = input;
      td.appendChild(cellField.type === "money" ? createMoneyControl(input) : input);

      if (supportsOtherField(cellField)) {
        td.appendChild(createOtherField(input, "Other tool name"));
      }

      tr.appendChild(td);
    });

    if (table.scoreMatrix) {
      const td = document.createElement("td");
      const output = document.createElement("strong");
      output.dataset.totalFor = row.id;
      output.textContent = "0";
      td.appendChild(output);
      tr.appendChild(td);
    }

    tbody.appendChild(tr);

    table.columns.forEach((column) => {
      if (!column.followUpFor || !column.followUpPrompts) {
        return;
      }

      const source = rowInputs[column.followUpFor];
      const target = rowInputs[column.id];

      if (!source || !target) {
        return;
      }

      const updatePrompt = () => {
        target.placeholder = column.followUpPrompts[source.value] || "Add relevant detail";
      };

      source.addEventListener("change", updatePrompt);
      updatePrompt();
    });
  }

  tableRows(table).forEach(addRow);

  if (table.repeatable) {
    const actions = document.createElement("div");
    const button = document.createElement("button");
    actions.className = "table-actions";
    button.type = "button";
    button.className = "secondary";
    button.textContent = `Add ${table.rowLabel}`;
    button.addEventListener("click", () => {
      const next = tbody.children.length + 1;
      addRow({ id: `${table.rowLabel.toLowerCase()}-${next}`, label: `${table.rowLabel} ${next}` });
    });
    actions.appendChild(button);
    wrapper.appendChild(actions);
  }

  return wrapper;
}

function renderFieldGrid(fields, titleText = "", hintText = "") {
  const fragment = document.createDocumentFragment();

  if (titleText) {
    const heading = document.createElement("h3");
    heading.textContent = titleText;
    fragment.appendChild(heading);
  }

  if (hintText) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = hintText;
    fragment.appendChild(hint);
  }

  const grid = document.createElement("div");
  grid.className = "grid";
  fields.forEach((field) => grid.appendChild(createField(field)));
  fragment.appendChild(grid);
  return fragment;
}

function renderHelpBlocks(blocks = []) {
  const wrapper = document.createElement("div");
  wrapper.className = "help-block-list";

  blocks.forEach((block) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const title = document.createElement("span");
    const more = document.createElement("span");

    details.className = "help-block";
    title.textContent = block.title;
    more.className = "help-more";
    more.textContent = " (more)";
    summary.appendChild(title);
    summary.appendChild(more);
    details.appendChild(summary);

    if (block.body) {
      const body = document.createElement("p");
      body.textContent = block.body;
      details.appendChild(body);
    }

    if (block.examples && block.examples.length) {
      const list = document.createElement("ul");
      block.examples.forEach((example) => {
        const item = document.createElement("li");
        item.textContent = example;
        list.appendChild(item);
      });
      details.appendChild(list);
    }

    wrapper.appendChild(details);
  });

  return wrapper;
}

function renderCards(cards, sectionEl) {
  const grid = document.createElement("div");
  grid.className = "quick-card-grid";

  cards.forEach((card) => {
    const cardEl = document.createElement("div");
    const heading = document.createElement("h3");
    cardEl.className = "quick-card";
    heading.textContent = card.title;
    cardEl.appendChild(heading);

    if (card.description) {
      const description = document.createElement("p");
      description.textContent = card.description;
      cardEl.appendChild(description);
    }

    cardEl.appendChild(renderFieldGrid(card.fields || []));
    grid.appendChild(cardEl);
  });

  sectionEl.appendChild(grid);
}

function renderIntroBlocks(blocks, sectionEl) {
  sectionEl.appendChild(renderHelpBlocks(blocks || []));
}

function sectionFields(section) {
  const fields = [...(section.fields || [])];

  (section.cards || []).forEach((card) => {
    fields.push(...(card.fields || []));
  });

  (section.content || []).forEach((block) => {
    fields.push(...(block.fields || []));
  });

  return fields;
}

function renderSectionBody(section, sectionEl) {
  if (section.introBlocks && section.introBlocks.length) {
    renderIntroBlocks(section.introBlocks, sectionEl);
  }

  if (section.helpBlocks && section.helpBlocks.length) {
    sectionEl.appendChild(renderHelpBlocks(section.helpBlocks));
  }

  if (section.cards && section.cards.length) {
    renderCards(section.cards, sectionEl);
    return;
  }

  if (section.content && section.content.length) {
    section.content.forEach((block) => {
      const targetEl = block.detailsLabel ? document.createElement("details") : sectionEl;

      if (block.detailsLabel) {
        const summary = document.createElement("summary");
        targetEl.className = "advanced-section";
        summary.textContent = block.detailsLabel;
        targetEl.appendChild(summary);
      }

      if (block.fields && block.fields.length) {
        targetEl.appendChild(renderFieldGrid(block.fields, block.title, block.hint));
      }

      if (block.helpBlocks && block.helpBlocks.length) {
        targetEl.appendChild(renderHelpBlocks(block.helpBlocks));
      }

      if (block.tables && block.tables.length) {
        if (block.title && !(block.fields && block.fields.length)) {
          const heading = document.createElement("h3");
          heading.textContent = block.title;
          targetEl.appendChild(heading);
        }
        if (block.hint && !(block.fields && block.fields.length)) {
          const hint = document.createElement("div");
          hint.className = "hint";
          hint.textContent = block.hint;
          targetEl.appendChild(hint);
        }
        block.tables.forEach((table) => targetEl.appendChild(createTable(table)));
      }

      if (block.detailsLabel) {
        sectionEl.appendChild(targetEl);
      }
    });
    return;
  }

  if (section.fields && section.fields.length) {
    sectionEl.appendChild(renderFieldGrid(section.fields));
  }

  if (section.tables && section.tables.length) {
    section.tables.forEach((table) => sectionEl.appendChild(createTable(table)));
  }
}

function createOfferReadinessSummaryCard() {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const grid = document.createElement("div");
  const items = [
    ["offerAssessed", "Offer assessed"],
    ["priorityIcp", "Priority customer group"],
    ["targetBuyer", "Target buyer"],
    ["score", "Offer readiness score"],
    ["stage", "Readiness stage"],
    ["confidence", "Snapshot confidence"],
    ["strengths", "Strongest areas"],
    ["gaps", "Biggest gaps"],
    ["nextMoves", "Recommended next moves"]
  ];

  card.className = "summary-card";
  card.id = "offerReadinessSummaryCard";
  heading.textContent = "Offer Readiness Snapshot";
  grid.className = "summary-grid";

  items.forEach(([key, label]) => {
    const item = document.createElement("div");
    const itemLabel = document.createElement("div");
    const value = document.createElement("div");

    item.className = "summary-item";
    itemLabel.className = "summary-label";
    value.className = "summary-value";
    value.dataset.summaryValue = key;
    itemLabel.textContent = label;
    value.textContent = "Not filled yet";
    item.appendChild(itemLabel);
    item.appendChild(value);
    grid.appendChild(item);
  });

  card.appendChild(heading);
  card.appendChild(grid);
  return card;
}

function offerPortfolioRows(data = getFormData()) {
  return tableRowsFromData(data, "offerPortfolio")
    .filter((row) => row.values.offerName || row.values.offerRole || row.values.targetCustomerGroup || row.values.assessmentDepth || row.rowId)
    .sort((first, second) => {
      const firstNumber = Number.parseInt(first.rowId.split("-").pop(), 10);
      const secondNumber = Number.parseInt(second.rowId.split("-").pop(), 10);
      return (Number.isFinite(firstNumber) ? firstNumber : 0) - (Number.isFinite(secondNumber) ? secondNumber : 0);
    });
}

function offerDisplayName(row, index = 0) {
  return row?.values.offerName || `Offer ${index + 1}`;
}

function primaryOfferRow(data = getFormData()) {
  const offers = offerPortfolioRows(data);
  return offers.find((row) => row.rowId === data.primaryGtmOffer)
    || offers.find((row) => row.values.offerPriority === "Primary GTM focus")
    || offers[0]
    || null;
}

function scopedOfferField(rowId, fieldId) {
  return `offerAssessments__${rowId}__${fieldId}`;
}

function scopedOfferTable(rowId, tableId) {
  return `offerAssessments__${rowId}__${tableId}`;
}

function createOfferAssessmentPanel(row, index) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const context = document.createElement("div");
  const warning = document.createElement("div");
  const rowId = row.rowId;
  const prefix = `offerAssessments__${rowId}__`;
  const offerName = offerDisplayName(row, index);

  details.className = "advanced-section offer-assessment-panel";
  details.open = index === 0;
  summary.textContent = `Offer Readiness Assessment: ${offerName}`;
  details.appendChild(summary);

  context.className = "summary-card offer-context-card";
  context.innerHTML = `
    <h3>Offer Context</h3>
    <div class="summary-grid">
      <div class="summary-item"><div class="summary-label">Offer name</div><div class="summary-value">${offerName}</div></div>
      <div class="summary-item"><div class="summary-label">Offer role</div><div class="summary-value">${row.values.offerRole || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Customer group</div><div class="summary-value">${row.values.targetCustomerGroup === "Create a new customer group for this offer" ? row.values.newOfferCustomerGroup || "New group not named yet" : row.values.targetCustomerGroup || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Primary buyer</div><div class="summary-value">${row.values.primaryBuyer || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Priority</div><div class="summary-value">${row.values.offerPriority || "Not filled yet"}</div></div>
    </div>
  `;
  details.appendChild(context);

  if (!row.values.targetCustomerGroup || row.values.targetCustomerGroup === "Not sure yet") {
    warning.className = "hint";
    warning.textContent = "Offer readiness is directional until this offer is tied to a priority customer group.";
    details.appendChild(warning);
  }

  const fieldBlocks = [
    {
      title: "Buyer Problem and Urgency",
      hint: "Define the problem this offer solves and why the buyer should act now.",
      fields: [
        { id: `${prefix}offerBuyerProblem`, label: "What urgent problem does this buyer have?", type: "textarea" },
        { id: `${prefix}offerTriggerEvent`, label: "What makes this urgent now?", type: "textarea" },
        { id: `${prefix}offerCurrentWorkaround`, label: "What are they doing today instead?", type: "textarea" },
        { id: `${prefix}offerCostOfInaction`, label: "What happens if they do nothing?", type: "textarea" },
        { id: `${prefix}offerUrgencyLevel`, label: "Urgency level", type: "select", options: ["", "Low - problem exists, but timing is not urgent", "Medium - problem matters, but timing varies", "High - best-fit buyers have clear urgency", "Critical - urgent, budgeted, and time-sensitive"] },
        { id: `${prefix}offerUrgencyEvidence`, label: "What evidence shows this is urgent?", type: "textarea" },
        { id: `${prefix}icpOfferAlignment`, label: "ICP-offer alignment", type: "select", options: ["", "Not clear yet", "ICP is selected but offer fit is unvalidated", "Offer appears relevant to the ICP", "Offer is clearly built around the ICP's urgent problem", "Offer fit is validated with customer evidence"] }
      ]
    },
    {
      title: "Measurable Value",
      fields: [
        { id: `${prefix}offerOutcomes`, label: "What outcomes does this offer help customers achieve?", type: "multiSelectDropdown", options: ["Save time", "Reduce cost", "Increase revenue", "Increase margin", "Increase lead flow", "Improve conversion", "Reduce risk", "Improve quality", "Improve visibility / reporting", "Improve adoption", "Improve retention", "Improve customer satisfaction", "Improve productivity", "Reduce implementation burden", "Other measurable outcome"] }
      ],
      tables: [
        {
          id: scopedOfferTable(rowId, "valueClaims"),
          title: "Value claims",
          layout: "cards",
          repeatable: true,
          rowLabel: "Value Claim",
          minRows: 1,
          maxRows: 10,
          addLabel: "Add value claim",
          columns: [
            { id: "outcome", label: "What outcome does the buyer want?", type: "select", optionsFromMultiselect: `${prefix}offerOutcomes`, options: ["", "Save time", "Reduce cost", "Increase revenue", "Increase margin", "Increase lead flow", "Improve conversion", "Reduce risk", "Improve quality", "Improve visibility / reporting", "Reduce implementation burden", "Improve customer experience", "Other measurable outcome"] },
            { id: "buyerLanguage", label: "Write the outcome in the buyer's words", type: "textarea", full: true },
            { id: "metric", label: "How would the buyer measure success?", type: "select", options: ["", "Hours saved", "Cost reduced", "Revenue added", "Leads generated", "Qualified opportunities created", "Conversion rate", "Sales cycle length", "Error rate", "Customer churn", "Customer satisfaction", "Adoption / usage", "Compliance risk", "Other"] },
            { id: "baseline", label: "What is happening today?", type: "text" },
            { id: "improvement", label: "What should improve?", type: "text" },
            { id: "timeframe", label: "How quickly should they see impact?", type: "select", options: ["", "Immediate", "7-14 days", "30 days", "60 days", "90 days", "6+ months", "Unknown"] },
            { id: "proofStrength", label: "How strong is the proof today?", type: "select", options: ["", "No proof yet", "Anecdotal proof", "One customer example", "Measured customer result", "Repeatable proof across multiple customers"] },
            { id: "proofSource", label: "What evidence supports this?", type: "text" },
            { id: "beforeState", label: "Before using this offer, the buyer is...", type: "textarea", full: true },
            { id: "afterState", label: "After using this offer, the buyer can...", type: "textarea", full: true }
          ]
        }
      ]
    },
    {
      title: "Buyer Transformation Summary",
      hint: "The Buyer Transformation Summary explains the before-and-after state your buyer experiences when your offer succeeds. Example: Before: Manual reporting. After: Automated dashboards and weekly performance visibility.",
      fields: [
        { id: `${prefix}buyerTransformationSummary`, label: "Generated buyer transformation summary", type: "textarea", placeholder: "Complete at least one value claim to generate the buyer transformation summary." }
      ]
    },
    {
      title: "Offer Promise",
      fields: [
        { id: `${prefix}oneSentencePromise`, label: "One-sentence offer promise", type: "textarea" },
        { id: `${prefix}suggestedOfferPromise`, label: "Suggested Offer Promise (AI Draft)", type: "textarea", hint: "This is a draft recommendation. Edit it as needed." },
        { id: `${prefix}offerDifferentiator`, label: "Why choose this instead of the current workaround or competitor?", type: "textarea" },
        { id: `${prefix}offerCategory`, label: "Offer type", type: "select", options: ["", "Software", "Service", "Platform", "Marketplace", "Consulting", "Managed service", "Product", "Diagnostic", "Pilot / proof of concept", "Hybrid", "Other"] },
        { id: `${prefix}mainProofPoint`, label: "Main proof point", type: "textarea" },
        { id: `${prefix}promiseClarityRating`, label: "Promise clarity", type: "select", options: ["", "Unclear", "Clear but generic", "Clear and ICP-specific", "Clear, differentiated, and proof-backed"] }
      ]
    },
    {
      title: "First Use Case and Buying Path",
      fields: [
        { id: `${prefix}firstUseCaseForOffer`, label: "First use case to sell", type: "textarea" },
        { id: `${prefix}firstUseCaseFit`, label: "Is this the right first use case for this ICP?", type: "select", options: ["", "Yes", "Needs refinement", "No, different use case", "Not sure"] },
        { id: `${prefix}whyBestStartingPoint`, label: "Why is this the best starting point?", type: "multiSelectDropdown", options: ["Fastest value", "Easiest proof", "Lowest risk", "Strongest pain", "Easiest buyer access", "Best margin", "Strategic account potential", "Expansion path", "Other"] },
        { id: `${prefix}buyerRequirements`, label: "What does the buyer need to provide or do?", type: "textarea" },
        { id: `${prefix}easiestNextStep`, label: "Easiest next step", type: "select", options: ["", "Diagnostic", "Audit", "Demo", "Workshop", "Trial", "Pilot", "Consultation", "Proposal", "Quote", "Sample", "Other"] },
        { id: `${prefix}nextStepCta`, label: "Next-step CTA wording", type: "text" },
        { id: `${prefix}buyingPathClarityRating`, label: "Buying path clarity", type: "select", options: ["", "No clear next step", "Next step exists but is vague", "Clear next step, but buyer requirements are unclear", "Clear next step and buyer requirements", "Clear, low-friction next step with strong conversion path"] }
      ]
    },
    {
      title: "Packaging and Pricing",
      hint: "Packaging describes how the offer is purchased. Examples: one-time project, monthly subscription, annual license, pilot then rollout, fractional engagement. Example path: Pilot -> Annual Subscription.",
      fields: [
        { id: `${prefix}pricingModel`, label: "Pricing model", type: "select", options: ["", "Subscription", "Project fee", "Usage-based", "Seat-based", "Transaction fee", "Retainer", "Percentage of savings / revenue", "Custom", "Hybrid", "Not sure yet", "Other"] },
        { id: `${prefix}isPricingPublic`, label: "Is pricing public?", type: "select", options: ["", "Yes", "No", "Partially", "Not sure"] },
        { id: `${prefix}minimumDealSize`, label: "Minimum deal size worth pursuing", type: "money" },
        { id: `${prefix}averageExpectedDealSize`, label: "Average expected deal size", type: "money" },
        { id: `${prefix}buyerApprovalLevel`, label: "Buyer approval level", type: "select", options: ["", "Individual user", "Manager", "Department head", "Executive", "Finance / procurement", "Owner / board", "Not sure"] },
        { id: `${prefix}discountingRule`, label: "Discounting rule", type: "textarea" },
        { id: `${prefix}packagingClarityRating`, label: "Packaging clarity", type: "select", options: ["", "Not packaged yet", "Offer exists but is custom each time", "Entry or core offer is defined", "Entry, core, and expansion path are clear", "Packaging is validated and repeatable"] }
      ],
      tables: [
        {
          id: scopedOfferTable(rowId, "offerPackages"),
          title: "Offer packaging",
          rows: ["Entry offer", "Core offer", "Expansion offer"],
          columns: [
            { id: "buyerUseCase", label: "Buyer use case", type: "text" },
            { id: "included", label: "What is included", type: "text" },
            { id: "durationTerm", label: "Duration / term", type: "text" },
            { id: "priceRange", label: "Price / range", type: "text" },
            { id: "successMetric", label: "Success metric", type: "text" },
            { id: "nextStepAfterThis", label: "Next step after this", type: "text" }
          ]
        }
      ]
    },
    {
      title: "Pilot Plan, if needed",
      fields: [
        { id: `${prefix}pilotNeeded`, label: "Is a pilot or proof of concept needed to sell this offer?", type: "select", options: ["", "No", "Optional", "Usually required", "Always required", "Not sure"] },
        { id: `${prefix}pilotLength`, label: "Pilot length", type: "select", options: ["", "7 days", "14 days", "30 days", "60 days", "90 days", "Other"], showUnless: { field: `${prefix}pilotNeeded`, value: "No" } },
        { id: `${prefix}pilotPrice`, label: "Pilot price", type: "text", showUnless: { field: `${prefix}pilotNeeded`, value: "No" } },
        { id: `${prefix}pilotSuccessMetric`, label: "What result proves the buyer should continue?", type: "text", showUnless: { field: `${prefix}pilotNeeded`, value: "No" } },
        { id: `${prefix}pilotBuyerRequirements`, label: "Buyer requirements", type: "textarea", showUnless: { field: `${prefix}pilotNeeded`, value: "No" } },
        { id: `${prefix}pilotConversionPath`, label: "Conversion path", type: "textarea", showUnless: { field: `${prefix}pilotNeeded`, value: "No" } },
        { id: `${prefix}pilotRisk`, label: "What could prevent the pilot from proving value?", type: "textarea", showUnless: { field: `${prefix}pilotNeeded`, value: "No" } },
        { id: `${prefix}pilotReadinessRating`, label: "Pilot readiness", type: "select", options: ["", "Not needed", "Needed but not defined", "Pilot is defined but success metric is unclear", "Pilot has scope, requirements, and success metric", "Pilot is validated and converts to paid next step"], showUnless: { field: `${prefix}pilotNeeded`, value: "No" } }
      ]
    },
    {
      title: "Alternatives, Objections, Proof, and Assets",
      fields: [
        { id: `${prefix}buyerAlternativesToday`, label: "What does the buyer use today to solve this problem?", type: "multiSelectDropdown", hint: "Examples: spreadsheet, internal process, consultant, competitor, no solution.", options: ["Manual work", "Spreadsheets", "Internal team", "Incumbent vendor", "Point solution", "Agency", "Consultant", "Generic tool", "Doing nothing", "Other"] },
        { id: `${prefix}offerObjections`, label: "What objections could block this offer?", type: "multiSelectDropdown", hint: "Select objections likely to delay, block, or slow the buying decision.", options: ["Price", "Timing", "Trust", "ROI", "Risk", "Data quality", "Implementation", "Internal ownership", "Competing priorities", "Security / compliance", "Switching cost", "Adoption", "Procurement friction", "Other"] },
        { id: `${prefix}salesAssets`, label: "Which sales assets exist today?", type: "multiSelectDropdown", hint: "Examples: case study, testimonial, ROI analysis, pilot results, customer reference.", options: ["One-page overview", "ICP definition", "Discovery call guide", "Demo or pitch script", "ROI calculator", "Pricing sheet", "Proposal template", "Implementation plan", "Security / privacy FAQ", "Case study", "Testimonials or reviews", "Reference list", "Objection handling guide", "Competitor / alternatives battlecard", "Email templates", "Call script", "Follow-up sequence", "Customer onboarding checklist", "Expansion / renewal playbook", "Partner/referral one-pager"] },
        { id: `${prefix}priorityMissingAssets`, label: "Priority missing sales assets", type: "multiSelectDropdown", options: ["One-page overview", "ICP definition", "Discovery call guide", "Demo or pitch script", "ROI calculator", "Pricing sheet", "Proposal template", "Implementation plan", "Security / privacy FAQ", "Case study", "Testimonials or reviews", "Reference list", "Objection handling guide", "Competitor / alternatives battlecard", "Email templates", "Call script", "Follow-up sequence", "Customer onboarding checklist", "Expansion / renewal playbook", "Partner/referral one-pager"] }
      ],
      tables: [
        { id: scopedOfferTable(rowId, "alternativeComparison"), title: "Alternative comparison", layout: "cards", repeatable: true, rowLabel: "Alternative", minRows: 1, maxRows: 10, addLabel: "Add alternative", columns: [
          { id: "alternativeName", label: "Alternative / competitor", type: "text" },
          { id: "whyBuyersChooseIt", label: "Why buyers choose it", type: "text" },
          { id: "whereItIsWeak", label: "Where it is weak", type: "text" },
          { id: "ourAdvantage", label: "Our advantage", type: "text" },
          { id: "proofNeededToWin", label: "Proof needed", type: "text" }
        ] },
        { id: scopedOfferTable(rowId, "objectionHandling"), title: "Objection handling", layout: "cards", repeatable: true, rowLabel: "Objection", minRows: 1, maxRows: 10, addLabel: "Add objection", columns: [
          { id: "objection", label: "Objection", type: "select", options: ["", "Price", "Timing", "Trust", "ROI", "Risk", "Data quality", "Implementation", "Internal ownership", "Competing priorities", "Security / compliance", "Switching cost", "Adoption", "Procurement friction", "Other"] },
          { id: "whyBuyerBelievesThis", label: "Why buyer believes this", type: "textarea" },
          { id: "bestResponse", label: "Best response", type: "textarea" },
          { id: "proofAssetNeeded", label: "Proof / asset needed", type: "multiSelectDropdown", options: ["Customer quote", "Case study", "Before / after metric", "ROI calculator", "Demo", "Reference customer", "Review / testimonial", "Usage data", "Benchmark", "Security / privacy documentation", "Implementation plan", "Pilot result", "Other"] },
          { id: "personaLikelyToRaise", label: "Persona most likely to raise it", type: "select", options: ["", "Economic Buyer", "Executive Sponsor", "Champion", "Day-to-Day User", "Implementation Owner", "Technical / Security Reviewer", "Procurement / Finance", "Likely Blocker", "Not sure"] },
          { id: "dealStage", label: "Deal stage where it appears", type: "select", options: ["", "First conversation", "Discovery", "Demo / consultation", "Proposal / quote", "Negotiation", "Procurement / approval", "Implementation planning", "Renewal / expansion", "Not sure"] }
        ] },
        { id: scopedOfferTable(rowId, "proofReadiness"), title: "Proof readiness", layout: "cards", repeatable: true, rowLabel: "Proof Claim", minRows: 1, maxRows: 10, addLabel: "Add proof claim", columns: [
          { id: "claim", label: "Claim we make", type: "textarea" },
          { id: "proofType", label: "Proof type", type: "select", options: ["", "Customer quote", "Case study", "Before / after metric", "ROI calculator", "Demo", "Reference customer", "Review / testimonial", "Usage data", "Benchmark", "Security / privacy documentation", "Implementation plan", "Pilot result", "Other"] },
          { id: "assetExists", label: "Asset exists?", type: "select", options: ["", "Yes", "No", "Partially", "Not sure"] },
          { id: "assetSource", label: "Asset or source", type: "text" },
          { id: "strength", label: "Proof strength", type: "select", options: ["", "No proof yet", "Anecdotal", "Customer story", "Measured result", "Strong public proof", "Repeatable proof across customers"] },
          { id: "gapNextAction", label: "Gap / next action", type: "textarea" },
          { id: "owner", label: "Owner", type: "text" }
        ] }
      ]
    }
  ];

  fieldBlocks.forEach((block) => {
    if (block.fields) {
      details.appendChild(renderFieldGrid(block.fields, block.title, block.hint));
    }
    if (block.tables) {
      const heading = document.createElement("h3");
      if (!block.fields) {
        heading.textContent = block.title;
        details.appendChild(heading);
      }
      block.tables.forEach((table) => details.appendChild(createTable(table)));
    }
  });

  const snapshot = createOfferAssessmentSnapshot(rowId);
  details.appendChild(snapshot);
  return details;
}

function createOfferAssessmentSnapshot(rowId) {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const grid = document.createElement("div");
  const items = [
    ["score", "Offer readiness score"],
    ["stage", "Readiness stage"],
    ["confidence", "Confidence"],
    ["strengths", "Strongest areas"],
    ["gaps", "Biggest gaps"],
    ["nextMoves", "Recommended next moves"]
  ];

  card.className = "summary-card offer-readiness-snapshot";
  card.dataset.offerSnapshotFor = rowId;
  heading.textContent = "Offer Readiness Snapshot";
  grid.className = "summary-grid";
  items.forEach(([key, label]) => {
    const item = document.createElement("div");
    const itemLabel = document.createElement("div");
    const value = document.createElement("div");
    item.className = "summary-item";
    itemLabel.className = "summary-label";
    value.className = "summary-value";
    value.dataset.offerAssessmentValue = key;
    itemLabel.textContent = label;
    value.textContent = "Not filled yet";
    item.appendChild(itemLabel);
    item.appendChild(value);
    grid.appendChild(item);
  });
  card.appendChild(heading);
  card.appendChild(grid);
  return card;
}

function renderOfferAssessmentPanels() {
  const container = document.getElementById("offerAssessmentPanels");
  if (!container) {
    return;
  }

  const data = getFormData();
  const fullOffers = offerPortfolioRows(data).filter((row) => row.values.assessmentDepth === "Full readiness analysis");
  container.innerHTML = "";

  if (fullOffers.length > 3) {
    const warning = document.createElement("div");
    warning.className = "hint";
    warning.textContent = "Multiple full offer assessments can make the intake longer. Consider fully assessing only the offers that matter most for the next 90 days.";
    container.appendChild(warning);
  }

  if (!fullOffers.length) {
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = "Mark an offer as Full readiness analysis to open a detailed, scored assessment for that offer.";
    container.appendChild(note);
    return;
  }

  const title = document.createElement("h3");
  title.textContent = "Offer Readiness Assessments";
  container.appendChild(title);
  fullOffers.forEach((row, index) => container.appendChild(createOfferAssessmentPanel(row, index)));
  setFormData(data);
  updateConditionalFields();
  updateOfferReadinessSummary();
}

const signalSourceFallbackOptions = [
  "CRM",
  "LinkedIn",
  "Website analytics",
  "Intent data",
  "Industry publications",
  "Directories",
  "Events",
  "Customer interviews",
  "Support data",
  "Customer success notes",
  "Partner lists",
  "Enrichment tools",
  "Review sites",
  "Company websites",
  "Job postings",
  "News",
  "Product usage data",
  "Other"
];

function getSignalPlayRows(data = getFormData()) {
  return tableRowsFromData(data, "signalPlayPortfolio")
    .filter((row) => row.rowId || Object.values(row.values).some(Boolean))
    .sort((first, second) => {
      const firstNumber = Number.parseInt(first.rowId.split("-").pop(), 10);
      const secondNumber = Number.parseInt(second.rowId.split("-").pop(), 10);
      return (Number.isFinite(firstNumber) ? firstNumber : 0) - (Number.isFinite(secondNumber) ? secondNumber : 0);
    });
}

function getSignalPlayLabel(data, playRowId, index = null) {
  const plays = getSignalPlayRows(data);
  const playIndex = index ?? plays.findIndex((row) => row.rowId === playRowId);
  const row = plays.find((item) => item.rowId === playRowId);
  return row?.values.playName || `Signal Play ${playIndex >= 0 ? playIndex + 1 : ""}`.trim();
}

function getPrimarySignalPlayRowId(data = getFormData()) {
  const plays = getSignalPlayRows(data);
  const selected = String(data.primarySignalPlay || "").trim();

  if (plays.some((row) => row.rowId === selected)) {
    return selected;
  }

  const primary = plays.filter((row) => row.values.playPriority === "Primary targeting strategy");
  if (primary.length === 1) {
    return primary[0].rowId;
  }

  return plays[0]?.rowId || "";
}

function signalScopedTable(playRowId, tableId) {
  return `signalPlayAssessments__${playRowId}__${tableId}`;
}

function collectCustomerGroupOptions(data = getFormData()) {
  return [...new Set([
    data.bestFitCustomerGroup,
    ...customerGroupRows(data).map((row) => row.values.groupName),
    ...offerPortfolioRows(data).map((row) => row.values.newOfferCustomerGroup || row.values.targetCustomerGroup),
    "Create a new customer group for this play",
    "Not sure yet"
  ].filter(Boolean))];
}

function collectOfferUseCaseOptions(data = getFormData()) {
  const offers = offerPortfolioRows(data);
  const primaryOffer = primaryOfferRow(data);
  return [...new Set([
    ...offers.map((row, index) => offerDisplayName(row, index)),
    primaryOffer ? offerDisplayName(primaryOffer, offers.indexOf(primaryOffer)) : "",
    data.offerBeingAssessed,
    data.bestFitFirstUseCase,
    data.firstUseCaseForOffer,
    primaryOffer ? data[scopedOfferField(primaryOffer.rowId, "firstUseCaseForOffer")] : "",
    "Create a new offer/use case for this play",
    "Not sure yet"
  ].filter(Boolean))];
}

function collectSignalSourceOptions(data = getFormData()) {
  return [...new Set([...listValues(data, "signalDataSources"), ...signalSourceFallbackOptions])];
}

function collectPlaySignalOptions(data, playRowId) {
  const triggers = tableRowsFromData(data, signalScopedTable(playRowId, "buyingTriggerEvents")).map((row) => row.values.triggerEvent || row.values.howObserved);
  const fits = tableRowsFromData(data, signalScopedTable(playRowId, "fitSignals")).map((row) => row.values.signal);
  const negatives = tableRowsFromData(data, signalScopedTable(playRowId, "negativeSignalRules")).map((row) => row.values.negativeSignal || row.values.notes);
  return [...new Set([...triggers, ...fits, ...negatives].filter(Boolean))];
}

function repeatGlobalNegativeSignals(data) {
  return tableRowsFromData(data, "globalNegativeSignals").filter((row) => row.values.signal || row.values.action || row.values.whyItMatters);
}

function createSignalSnapshotCard(playRowId) {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const grid = document.createElement("div");
  const items = [
    ["score", "Signal readiness score"],
    ["stage", "Readiness stage"],
    ["confidence", "Snapshot confidence"],
    ["strengths", "Strongest areas"],
    ["gaps", "Biggest gaps"],
    ["nextMoves", "Recommended next moves"]
  ];

  card.className = "summary-card signal-readiness-snapshot";
  card.dataset.signalSnapshotFor = playRowId;
  heading.textContent = "Signal Readiness Snapshot";
  grid.className = "summary-grid";
  items.forEach(([key, label]) => {
    const item = document.createElement("div");
    const itemLabel = document.createElement("div");
    const value = document.createElement("div");
    item.className = "summary-item";
    itemLabel.className = "summary-label";
    value.className = "summary-value";
    value.dataset.signalAssessmentValue = key;
    itemLabel.textContent = label;
    value.textContent = "Not filled yet";
    item.appendChild(itemLabel);
    item.appendChild(value);
    grid.appendChild(item);
  });
  card.appendChild(heading);
  card.appendChild(grid);
  return card;
}

function signalAssessmentTableDefinitions(playRowId, row, data) {
  const sourceOptions = collectSignalSourceOptions(data);
  const signalOptions = collectPlaySignalOptions(data, playRowId);
  const personaOptions = ["", row.values.primaryBuyerPersona || "", "Economic Buyer", "Executive Sponsor", "Champion", "Day-to-Day User", "Implementation Owner", "Technical / Security Reviewer", "Procurement / Finance", "Likely Blocker", "Not sure"].filter((value, index, list) => list.indexOf(value) === index);

  return [
    {
      title: "Buying Trigger Events",
      hint: "Define events that suggest this customer group may need this offer or use case now.",
      table: { id: signalScopedTable(playRowId, "buyingTriggerEvents"), title: "Buying Trigger Events", layout: "cards", repeatable: true, rowLabel: "Trigger Event", minRows: 1, maxRows: 20, addLabel: "Add trigger event", columns: [
        { id: "triggerEvent", label: "Trigger event", type: "select", options: ["", ...triggerEventOptions] },
        { id: "whyUrgent", label: "Why does this create urgency?", type: "textarea" },
        { id: "buyerProblem", label: "Buyer problem it connects to", type: "text" },
        { id: "howObserved", label: "How can we observe it?", type: "text" },
        { id: "source", label: "Source", type: "select", options: ["", ...sourceOptions] },
        { id: "timingWindow", label: "Best timing window", type: "select", options: ["", "Immediately", "Within 7 days", "Within 30 days", "Within 60 days", "Within 90 days", "Next budget cycle", "Unknown"] },
        { id: "priority", label: "Priority", type: "select", options: ["", "High", "Medium", "Low"] }
      ] }
    },
    {
      title: "Fit Signals",
      hint: "Define the company, buyer, and use-case signals that show this account matches the play.",
      table: { id: signalScopedTable(playRowId, "fitSignals"), title: "Fit Signals", layout: "cards", repeatable: true, rowLabel: "Fit Signal", minRows: 1, maxRows: 20, addLabel: "Add fit signal", columns: [
        { id: "signalCategory", label: "Signal category", type: "select", options: ["", "Company fit", "Buyer fit", "Use-case fit"] },
        { id: "signal", label: "Fit signal", type: "text", placeholder: "Example: Multi-location business, has VP Sales, recently added sales team, uses disconnected tools." },
        { id: "whyItMatters", label: "Why does this matter?", type: "textarea" },
        { id: "visibility", label: "How can we see it?", type: "select", options: ["", "Publicly observable", "Internal data only", "Both public and internal", "Unknown"] },
        { id: "source", label: "Source", type: "select", options: ["", ...sourceOptions] },
        { id: "priority", label: "Priority", type: "select", options: ["", "High", "Medium", "Low"] }
      ] }
    },
    {
      title: "Negative Signals and Disqualification",
      hint: "Define signals that should reduce priority, require review, or disqualify an account for this play.",
      table: { id: signalScopedTable(playRowId, "negativeSignalRules"), title: "Negative Signals and Disqualification", layout: "cards", repeatable: true, rowLabel: "Negative Signal", minRows: 1, maxRows: 20, addLabel: "Add negative signal", columns: [
        { id: "negativeSignal", label: "Negative signal", type: "select", options: ["", ...negativeSignalOptions] },
        { id: "whyItMatters", label: "Why does this matter?", type: "textarea" },
        { id: "action", label: "Action", type: "select", options: ["", "Reduce score", "Disqualify", "Needs review", "Nurture only", "Ask qualification question"] },
        { id: "source", label: "Source", type: "select", options: ["", ...sourceOptions] },
        { id: "notes", label: "Notes", type: "textarea" }
      ] }
    },
    {
      title: "Signal Scoring and Routing Rules",
      hint: "Define how signals should change account priority and what action should happen next.",
      table: { id: signalScopedTable(playRowId, "signalRoutingRules"), title: "Signal Scoring and Routing Rules", layout: "cards", repeatable: true, rowLabel: "Signal Rule", minRows: 1, maxRows: 20, addLabel: "Add signal rule", columns: [
        { id: "signal", label: "Signal", type: "select", options: ["", ...signalOptions] },
        { id: "signalType", label: "Signal type", type: "select", options: ["", "Trigger", "Fit", "Intent", "Negative"] },
        { id: "scoreImpact", label: "Score impact", type: "select", options: ["", "+3", "+2", "+1", "0", "-1", "-2", "Disqualify"] },
        { id: "confidence", label: "Confidence", type: "select", options: ["", "High", "Medium", "Low"] },
        { id: "recommendedAction", label: "Recommended action", type: "select", options: ["", "Add to target list", "Prioritize outreach", "Send to sales", "Nurture", "Disqualify", "Needs review", "Ask qualification question"] },
        { id: "owner", label: "Owner", type: "select", options: ["", "Founder", "Sales", "Marketing", "RevOps", "Customer Success", "Partner", "Other"] },
        { id: "notes", label: "Notes / rule", type: "textarea" }
      ] }
    },
    {
      title: "Signal-Based Action Plan",
      hint: "Define what sales or marketing should do when a high-priority signal appears.",
      table: { id: signalScopedTable(playRowId, "signalActionPlan"), title: "Signal-Based Action Plan", layout: "cards", repeatable: true, rowLabel: "Signal Action", minRows: 1, maxRows: 20, addLabel: "Add signal action", columns: [
        { id: "highPrioritySignal", label: "High-priority signal", type: "select", options: ["", ...signalOptions] },
        { id: "outreachAngle", label: "Outreach angle", type: "textarea" },
        { id: "channel", label: "Channel", type: "select", options: ["", "Email", "LinkedIn", "Call", "Partner intro", "Referral", "Ads", "Event", "Direct mail", "Customer success outreach", "Other"] },
        { id: "buyerPersona", label: "Buyer persona", type: "select", options: personaOptions },
        { id: "proofOrAsset", label: "Proof or asset to use", type: "select", optionsFromMultiselect: "salesAssets", options: ["Case study", "Testimonial", "ROI calculator", "Reference call", "Demo", "Pilot result", "Security / privacy documentation", "Implementation plan", "Customer quote", "Measured result", "Before / after story", "Pricing / business case", "One-page overview", "Other"] },
        { id: "firstMessageIdea", label: "First message idea", type: "textarea" },
        { id: "followUpAction", label: "Follow-up action", type: "text" }
      ] }
    }
  ];
}

function createSignalPlayAssessmentPanel(row, index) {
  const data = getFormData();
  const rowId = row.rowId;
  const playName = getSignalPlayLabel(data, rowId, index);
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const context = document.createElement("div");

  details.className = "advanced-section signal-assessment-panel";
  details.open = index === 0;
  summary.textContent = `Signal Readiness Assessment: ${playName}`;
  details.appendChild(summary);

  context.className = "summary-card signal-context-card";
  context.innerHTML = `
    <h3>Targeting Strategy Context</h3>
    <div class="summary-grid">
      <div class="summary-item"><div class="summary-label">Targeting strategy name</div><div class="summary-value">${playName}</div></div>
      <div class="summary-item"><div class="summary-label">Customer group / ICP</div><div class="summary-value">${row.values.newCustomerGroup || row.values.customerGroup || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Offer or use case</div><div class="summary-value">${row.values.newOfferOrUseCase || row.values.offerOrUseCase || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Primary buyer persona</div><div class="summary-value">${row.values.primaryBuyerPersona || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">GTM motion</div><div class="summary-value">${row.values.gtmMotion || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Priority</div><div class="summary-value">${row.values.playPriority || "Not filled yet"}</div></div>
    </div>
  `;
  details.appendChild(context);

  if (row.values.customerGroup === "Not sure yet" || row.values.offerOrUseCase === "Not sure yet") {
    const warning = document.createElement("div");
    warning.className = "hint";
    warning.textContent = "Signal readiness is directional until this play is tied to a customer group and offer or use case.";
    details.appendChild(warning);
  }

  signalAssessmentTableDefinitions(rowId, row, data).forEach((block) => {
    const heading = document.createElement("h3");
    const hint = document.createElement("div");
    heading.textContent = block.title;
    hint.className = "hint";
    hint.textContent = block.hint;
    details.appendChild(heading);
    details.appendChild(hint);
    if (block.table.id === signalScopedTable(rowId, "negativeSignalRules")) {
      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "secondary";
      copyButton.textContent = "Add global negative signals to this play";
      copyButton.addEventListener("click", () => {
        const currentData = getFormData();
        const targetTable = signalScopedTable(rowId, "negativeSignalRules");
        repeatGlobalNegativeSignals(currentData).forEach((globalRow) => {
          const nextRowId = firstBlankSignalCardId(currentData, targetTable, "negative-signal");
          setValueIfBlank(currentData, `${targetTable}__${nextRowId}__negativeSignal`, globalRow.values.signal);
          setValueIfBlank(currentData, `${targetTable}__${nextRowId}__action`, globalRow.values.action);
          setValueIfBlank(currentData, `${targetTable}__${nextRowId}__whyItMatters`, globalRow.values.whyItMatters);
        });
        setFormData(currentData);
        renderSignalPlayAssessmentPanels();
      });
      details.appendChild(copyButton);
    }
    details.appendChild(createTable(block.table));
  });

  details.appendChild(createSignalSnapshotCard(rowId));
  return details;
}

function renderSignalPlayAssessmentPanels() {
  const container = document.getElementById("signalPlayAssessmentPanels");
  if (!container) {
    return;
  }

  const data = getFormData();
  const fullPlays = getSignalPlayRows(data).filter((row) => row.values.assessmentDepth === "Full signal analysis");
  container.innerHTML = "";

  if (!fullPlays.length) {
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = "Mark a targeting strategy as Full signal analysis to open a detailed, scored assessment for that play.";
    container.appendChild(note);
    return;
  }

  if (fullPlays.length > 3) {
    const warning = document.createElement("div");
    warning.className = "hint";
    warning.textContent = "Multiple full signal analyses can make the intake longer. Consider fully assessing only the plays that matter most for the next 90 days.";
    container.appendChild(warning);
  }

  const title = document.createElement("h3");
  title.textContent = "Signal Play Readiness Assessments";
  container.appendChild(title);
  fullPlays.forEach((row, index) => container.appendChild(createSignalPlayAssessmentPanel(row, index)));
  setFormData(data);
  updateConditionalFields();
  updateSignalReadinessSummary();
}

const revenueChannelOptions = [
  "Inbound website leads",
  "Direct outbound email",
  "Cold calling",
  "LinkedIn / social selling",
  "Website conversion / booking flow",
  "Content / SEO",
  "Paid search / paid social",
  "Events / webinars / communities",
  "Network referrals",
  "Customer referrals",
  "Trade shows",
  "Partners / affiliates / resellers",
  "Marketplaces / app stores / directories",
  "Current customer expansion / upsell",
  "Customer success outreach",
  "Product usage / product-led",
  "Retail / field / local selling",
  "Other"
];

function getRevenueMotionRows(data = getFormData()) {
  return tableRowsFromData(data, "revenueMotionPortfolio")
    .filter((row) => row.rowId || Object.values(row.values).some(Boolean))
    .sort((first, second) => {
      const firstNumber = Number.parseInt(first.rowId.split("-").pop(), 10);
      const secondNumber = Number.parseInt(second.rowId.split("-").pop(), 10);
      return (Number.isFinite(firstNumber) ? firstNumber : 0) - (Number.isFinite(secondNumber) ? secondNumber : 0);
    });
}

function getRevenueMotionLabel(data, motionRowId, index = null) {
  const motions = getRevenueMotionRows(data);
  const motionIndex = index ?? motions.findIndex((row) => row.rowId === motionRowId);
  const row = motions.find((item) => item.rowId === motionRowId);
  return row?.values.playName || `Revenue Motion ${motionIndex >= 0 ? motionIndex + 1 : ""}`.trim();
}

function getPrimaryRevenueMotionRowId(data = getFormData()) {
  const motions = getRevenueMotionRows(data);
  const selected = String(data.primaryRevenueMotion || "").trim();
  if (motions.some((row) => row.rowId === selected)) {
    return selected;
  }
  const primary = motions.filter((row) => row.values.playPriority === "Primary revenue motion");
  return primary.length === 1 ? primary[0].rowId : motions[0]?.rowId || "";
}

function revenueScopedTable(motionRowId, tableId) {
  return `revenueMotionAssessments__${motionRowId}__${tableId}`;
}

function revenueScopedField(motionRowId, groupId, fieldId) {
  return `revenueMotionAssessments__${motionRowId}__${groupId}__${fieldId}`;
}

function collectRevenueCustomerGroupOptions(data = getFormData()) {
  return [...new Set([
    data.bestFitCustomerGroup,
    ...customerGroupRows(data).map((row) => row.values.groupName),
    ...offerPortfolioRows(data).map((row) => row.values.newOfferCustomerGroup || row.values.targetCustomerGroup),
    ...getSignalPlayRows(data).map((row) => row.values.newCustomerGroup || row.values.customerGroup),
    "Create a new customer group for this motion",
    "Not sure yet"
  ].filter(Boolean))];
}

function collectRevenueOfferOptions(data = getFormData()) {
  const offers = offerPortfolioRows(data);
  const primaryOffer = primaryOfferRow(data);
  return [...new Set([
    ...offers.map((row, index) => offerDisplayName(row, index)),
    primaryOffer ? offerDisplayName(primaryOffer, offers.indexOf(primaryOffer)) : "",
    data.offerBeingAssessed,
    "Create a new offer for this motion",
    "Not sure yet"
  ].filter(Boolean))];
}

function motionStageRows(data, motionRowId) {
  return tableRowsFromData(data, revenueScopedTable(motionRowId, "conversionStages"))
    .filter((row) => row.values.stageName || row.values.owner || row.values.entryCriteria || row.values.exitCriteria || row.values.currentConversion || row.values.issuesImprovements);
}

function revenueMotionReadinessDimensions(data, motionRowId = null) {
  const activeMotionRowId = motionRowId || getPrimaryRevenueMotionRowId(data);
  const motion = getRevenueMotionRows(data).find((row) => row.rowId === activeMotionRowId);
  const channel = {
    activeStatus: data[revenueScopedField(activeMotionRowId, "channelPerformance", "activeStatus")],
    currentActivity: data[revenueScopedField(activeMotionRowId, "channelPerformance", "currentActivity")],
    last90DayResults: data[revenueScopedField(activeMotionRowId, "channelPerformance", "last90DayResults")],
    owner: data[revenueScopedField(activeMotionRowId, "channelPerformance", "owner")],
    confidence: data[revenueScopedField(activeMotionRowId, "channelPerformance", "confidence")],
    nextDecision: data[revenueScopedField(activeMotionRowId, "channelPerformance", "nextDecision")]
  };
  const metricFields = ["accountsOrLeadsAdded", "qualifiedLeads", "meetingsBooked", "opportunitiesCreated", "proposalsSent", "closedWon", "closedLost", "revenueClosed", "pipelineCreated", "averageDealSize", "averageSalesCycle"];
  const metricValues = metricFields.map((field) => data[revenueScopedField(activeMotionRowId, "pipelineMetrics", field)]).filter(Boolean);
  const metricConfidence = data[revenueScopedField(activeMotionRowId, "pipelineMetrics", "metricConfidence")];
  const biggestDropoff = data[revenueScopedField(activeMotionRowId, "pipelineMetrics", "biggestDropoff")];
  const stages = motionStageRows(data, activeMotionRowId);
  const routing = tableRowsFromData(data, revenueScopedTable(activeMotionRowId, "dealRoutingRules")).filter((row) => row.values.routingTrigger || row.values.routingType || row.values.action);
  const stalled = tableRowsFromData(data, revenueScopedTable(activeMotionRowId, "stalledDeals")).filter((row) => row.values.opportunityName || row.values.reason || row.values.gtmLesson || row.values.nextAction);
  const experimentFields = ["hypothesis", "audience", "channel", "offer", "successMetric", "timeframe", "owner", "decisionRule"];
  const experimentValues = experimentFields.map((field) => data[revenueScopedField(activeMotionRowId, "nextExperiment", field)]).filter(Boolean);
  const contextScore = motion?.values.customerGroup && motion.values.customerGroup !== "Not sure yet" && motion.values.offer && motion.values.offer !== "Not sure yet" && motion.values.channelSource && motion.values.salesMotionType ? 5 : motion?.values.channelSource ? 3 : 1;
  const channelEvidenceScore = channel.last90DayResults && channel.confidence === "High" ? 5 : channel.currentActivity && channel.last90DayResults ? 4 : channel.currentActivity || channel.activeStatus ? 3 : 1;
  const pipelineScore = metricConfidence?.startsWith("High") && metricValues.length >= 5 ? 5 : metricValues.length >= 4 ? 4 : metricValues.length >= 2 ? 3 : metricConfidence === "Not tracked" ? 1 : 2;
  const processScore = stages.length >= 5 && stages.some((row) => row.values.owner && row.values.entryCriteria && row.values.exitCriteria) ? 5 : stages.length >= 3 ? 4 : stages.length ? 3 : 1;
  const conversionScore = biggestDropoff && stages.some((row) => row.values.currentConversion || row.values.issuesImprovements) ? 5 : biggestDropoff ? 4 : stages.some((row) => row.values.issuesImprovements) ? 3 : 1;
  const ownershipScore = (channel.owner || data.primaryRevenueOwner) && routing.length ? 5 : (channel.owner || data.primaryRevenueOwner) ? 3 : data.sellingCapacity ? 2 : 1;
  const stalledScore = !stalled.length ? 2 : stalled.some((row) => row.values.nextAction && row.values.gtmLesson && row.values.shouldBecome) ? 5 : stalled.some((row) => row.values.nextAction || row.values.gtmLesson) ? 4 : 2;
  const experimentScore = experimentValues.length >= 7 ? 5 : experimentValues.length >= 5 ? 4 : experimentValues.length >= 2 ? 3 : 1;

  return [
    { name: "Channel focus", score: contextScore, nextMove: "Narrow the primary motion to one customer group, offer, channel, and buyer." },
    { name: "Channel evidence", score: channelEvidenceScore, nextMove: "Define 30-day activity and result targets for the selected channel." },
    { name: "Pipeline visibility", score: pipelineScore, nextMove: "Track leads, qualified opportunities, proposals, wins, losses, revenue, and conversion rates." },
    { name: "Sales process clarity", score: processScore, nextMove: "Define stages, owners, entry and exit criteria, and the biggest stage bottleneck." },
    { name: "Conversion health", score: conversionScore, nextMove: "Identify and improve the biggest funnel drop-off." },
    { name: "Ownership and capacity", score: ownershipScore, nextMove: "Assign owner and routing rules for senior involvement, delegation, nurture, and disqualification." },
    { name: "Stalled-deal learning", score: stalledScore, nextMove: "Convert stalled deal reasons into proof gaps, objections, qualification questions, or process fixes." },
    { name: "Next experiment clarity", score: experimentScore, nextMove: "Define a 30-day experiment with hypothesis, audience, channel, success metric, owner, and decision rule." }
  ];
}

function revenueMotionReadinessSnapshot(data, motionRowId = null) {
  const activeMotionRowId = motionRowId || getPrimaryRevenueMotionRowId(data);
  const dimensions = revenueMotionReadinessDimensions(data, activeMotionRowId);
  const score = Math.round((dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length) * 20);
  const stage = score >= 82 ? "Revenue motion scale ready" : score >= 66 ? "Revenue motion validation ready" : score >= 46 ? "Revenue motion foundation needed" : "Revenue motion unclear";
  const strongCount = dimensions.filter((item) => item.score >= 4).length;
  const confidence = strongCount >= 6 ? "High" : strongCount >= 3 ? "Medium" : "Low";
  const strengths = dimensions.filter((item) => item.score >= 4).sort((a, b) => b.score - a.score).map((item) => item.name);
  const gaps = dimensions.filter((item) => item.score <= 2).sort((a, b) => a.score - b.score).map((item) => item.name);
  const nextMoves = dimensions.filter((item) => item.score <= 2).slice(0, 3).map((item) => item.nextMove);
  return { score, stage, confidence, strengths, gaps, nextMoves, dimensions, motionRowId: activeMotionRowId };
}

function createRevenueMotionSnapshotCard(motionRowId) {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const grid = document.createElement("div");
  const items = [["score", "Revenue motion readiness score"], ["stage", "Readiness stage"], ["confidence", "Snapshot confidence"], ["strengths", "Strongest areas"], ["gaps", "Biggest gaps"], ["nextMoves", "Recommended next moves"]];
  card.className = "summary-card revenue-motion-readiness-snapshot";
  card.dataset.revenueMotionSnapshotFor = motionRowId;
  heading.textContent = "Revenue Motion Readiness Snapshot";
  grid.className = "summary-grid";
  items.forEach(([key, label]) => {
    const item = document.createElement("div");
    const itemLabel = document.createElement("div");
    const value = document.createElement("div");
    item.className = "summary-item";
    itemLabel.className = "summary-label";
    value.className = "summary-value";
    value.dataset.revenueMotionAssessmentValue = key;
    itemLabel.textContent = label;
    value.textContent = "Not filled yet";
    item.appendChild(itemLabel);
    item.appendChild(value);
    grid.appendChild(item);
  });
  card.appendChild(heading);
  card.appendChild(grid);
  return card;
}

function createRevenueMotionAssessmentPanel(row, index) {
  const data = getFormData();
  const motionRowId = row.rowId;
  const motionName = getRevenueMotionLabel(data, motionRowId, index);
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const context = document.createElement("div");
  const channelOptions = ["", row.values.channelSource || "", ...revenueChannelOptions].filter((value, idx, list) => list.indexOf(value) === idx);
  const offerOptions = ["", row.values.newOffer || row.values.offer || "", ...collectRevenueOfferOptions(data)].filter((value, idx, list) => list.indexOf(value) === idx);

  details.className = "advanced-section revenue-motion-assessment-panel";
  details.open = index === 0;
  summary.textContent = `Revenue Motion Assessment: ${motionName}`;
  details.appendChild(summary);

  context.className = "summary-card revenue-motion-context-card";
  context.innerHTML = `
    <h3>Revenue Motion Context</h3>
    <div class="summary-grid">
      <div class="summary-item"><div class="summary-label">Revenue motion play name</div><div class="summary-value">${motionName}</div></div>
      <div class="summary-item"><div class="summary-label">Customer group / ICP</div><div class="summary-value">${row.values.newCustomerGroup || row.values.customerGroup || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Offer</div><div class="summary-value">${row.values.newOffer || row.values.offer || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Channel / source</div><div class="summary-value">${row.values.channelSource || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Sales motion</div><div class="summary-value">${row.values.salesMotionType || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Primary buyer</div><div class="summary-value">${row.values.primaryBuyer || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Goal</div><div class="summary-value">${row.values.playGoal || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Priority</div><div class="summary-value">${row.values.playPriority || "Not filled yet"}</div></div>
    </div>
  `;
  details.appendChild(context);

  if (row.values.customerGroup === "Not sure yet" || row.values.offer === "Not sure yet") {
    const warning = document.createElement("div");
    warning.className = "hint";
    warning.textContent = "Revenue motion readiness is directional until this motion is tied to a customer group and offer.";
    details.appendChild(warning);
  }

  [
    {
      title: "Channel Performance",
      fields: [
        { id: revenueScopedField(motionRowId, "channelPerformance", "activeStatus"), label: "Channel status", type: "select", options: ["", "Active", "Testing", "Planned", "Paused", "Not using yet", "Not sure"] },
        { id: revenueScopedField(motionRowId, "channelPerformance", "currentActivity"), label: "Current activity", type: "textarea", placeholder: "Example: 100 outbound emails per week, weekly partner referrals, paid search test, CS expansion outreach." },
        { id: revenueScopedField(motionRowId, "channelPerformance", "last90DayResults"), label: "Last 90-day results", type: "textarea", placeholder: "Example: 180 accounts contacted, 12 replies, 5 demos, 1 closed deal." },
        { id: revenueScopedField(motionRowId, "channelPerformance", "spendOrEffort"), label: "Spend or effort level", type: "text", placeholder: "Example: $2,000/month, 5 hours/week, founder time only." },
        { id: revenueScopedField(motionRowId, "channelPerformance", "owner"), label: "Owner", type: "text" },
        { id: revenueScopedField(motionRowId, "channelPerformance", "confidence"), label: "Confidence", type: "select", options: ["", "High", "Medium", "Low", "Not sure"] },
        { id: revenueScopedField(motionRowId, "channelPerformance", "notesIssues"), label: "Notes / issues", type: "textarea" },
        { id: revenueScopedField(motionRowId, "channelPerformance", "nextDecision"), label: "Next decision", type: "select", options: ["", "Scale", "Continue testing", "Pause", "Fix tracking", "Refine ICP / offer", "Change channel", "Not sure"] }
      ]
    },
    {
      title: "Pipeline Metrics",
      fields: [
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "accountsOrLeadsAdded"), label: "Leads / accounts added", type: "text" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "qualifiedLeads"), label: "Qualified leads / accounts", type: "text" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "meetingsBooked"), label: "Meetings or demos booked", type: "text" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "opportunitiesCreated"), label: "Opportunities created", type: "text" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "proposalsSent"), label: "Proposals sent", type: "text" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "closedWon"), label: "Closed won", type: "text" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "closedLost"), label: "Closed lost", type: "text" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "revenueClosed"), label: "Revenue closed", type: "money" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "pipelineCreated"), label: "Pipeline created", type: "money" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "averageDealSize"), label: "Average deal size", type: "money" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "averageSalesCycle"), label: "Average sales cycle", type: "text" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "costOrEffort"), label: "Cost or effort, if known", type: "text" },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "biggestDropoff"), label: "Biggest funnel drop-off", type: "select", options: ["", "Target to first response", "First response to discovery", "Discovery to demo / consultation", "Demo / consultation to proposal", "Proposal to close", "Close to onboarding", "Renewal / expansion", "Not sure", "Other"] },
        { id: revenueScopedField(motionRowId, "pipelineMetrics", "metricConfidence"), label: "Metric confidence", type: "select", options: ["", "High - tracked in system", "Medium - partially tracked", "Low - estimated", "Not tracked"] }
      ]
    },
    {
      title: "Next Experiment",
      fields: [
        { id: revenueScopedField(motionRowId, "nextExperiment", "hypothesis"), label: "Experiment hypothesis", type: "textarea", placeholder: "Example: If we target expansion-trigger accounts with a proof-backed diagnostic message, we can book 10 qualified calls in 30 days." },
        { id: revenueScopedField(motionRowId, "nextExperiment", "audience"), label: "Audience", type: "text" },
        { id: revenueScopedField(motionRowId, "nextExperiment", "channel"), label: "Channel", type: "select", options: channelOptions },
        { id: revenueScopedField(motionRowId, "nextExperiment", "offer"), label: "Offer", type: "select", options: offerOptions },
        { id: revenueScopedField(motionRowId, "nextExperiment", "successMetric"), label: "Success metric", type: "text", placeholder: "Example: 10 qualified calls, 5 demos, $100k pipeline, 2 closed deals." },
        { id: revenueScopedField(motionRowId, "nextExperiment", "timeframe"), label: "Timeframe", type: "select", options: ["", "7 days", "14 days", "30 days", "60 days", "90 days"] },
        { id: revenueScopedField(motionRowId, "nextExperiment", "owner"), label: "Owner", type: "text" },
        { id: revenueScopedField(motionRowId, "nextExperiment", "decisionRule"), label: "Decision rule", type: "textarea", placeholder: "Example: Scale if reply rate exceeds 8% and at least 5 qualified calls are booked." }
      ]
    }
  ].forEach((block) => details.appendChild(renderFieldGrid(block.fields, block.title)));

  [
    { id: revenueScopedTable(motionRowId, "conversionStages"), title: "Sales Motion and Conversion Map", hint: "Define the stages, owners, conversion points, and bottlenecks for this motion.", rowLabel: "Stage", addLabel: "Add stage", columns: [
      { id: "stageName", label: "Stage name", type: "text" },
      { id: "owner", label: "Owner", type: "text" },
      { id: "entryCriteria", label: "Entry criteria", type: "text" },
      { id: "exitCriteria", label: "Exit criteria", type: "text" },
      { id: "currentConversion", label: "Current conversion", type: "text" },
      { id: "keyAssetMessage", label: "Key asset or message", type: "text" },
      { id: "issuesImprovements", label: "Issues / improvements", type: "textarea" }
    ] },
    { id: revenueScopedTable(motionRowId, "dealRoutingRules"), title: "Deal Routing and Involvement Rules", hint: "Define when senior leadership, sales, team members, or automation should handle opportunities in this motion.", rowLabel: "Routing Rule", addLabel: "Add routing rule", columns: [
      { id: "routingTrigger", label: "Routing trigger", type: "textarea", placeholder: "Example: Deal value over $50k, strategic account, proof opportunity, enterprise buyer, referral from board member." },
      { id: "routingType", label: "Routing type", type: "select", options: ["", "Senior leadership involved", "Sales lead handles", "Delegate to team", "Automated / self-serve", "Nurture", "Disqualify", "Needs review"] },
      { id: "reason", label: "Reason", type: "multiSelectDropdown", options: ["Deal size", "Strategic value", "Enterprise buyer", "Risk", "Proof opportunity", "Referral", "Implementation complexity", "Low value", "Low urgency", "Other"] },
      { id: "action", label: "Action", type: "textarea" }
    ] },
    { id: revenueScopedTable(motionRowId, "stalledDeals"), title: "Stalled Deals and Lost Momentum", hint: "List opportunities that stalled or lost momentum in this motion.", rowLabel: "Stalled Deal", addLabel: "Add stalled deal", columns: [
      { id: "opportunityName", label: "Opportunity / account", type: "text", placeholder: "Example: ABC Company" },
      { id: "source", label: "Source", type: "select", options: ["", row.values.channelSource || "", "Inbound website lead", "Outbound email", "Cold call", "LinkedIn / social selling", "Referral", "Partner", "Event", "Paid search / paid social", "Content / SEO", "Current customer expansion", "Other", "Unknown"].filter((value, idx, list) => list.indexOf(value) === idx) },
      { id: "stageWhereStalled", label: "Stage where it stalled", type: "select", options: ["", "First outreach", "First conversation", "Discovery", "Demo / consultation", "Proposal / quote", "Negotiation / approval", "Procurement", "Implementation planning", "Renewal / expansion", "Other"] },
      { id: "reason", label: "Reason it stalled", type: "select", options: ["", "No budget", "No urgency", "No decision maker", "Weak proof", "Pricing concern", "Implementation risk", "Timing", "Competitor", "Internal priority", "Poor fit", "Unclear next step", "Other"] },
      { id: "dealValue", label: "Deal value", type: "money" },
      { id: "nextAction", label: "Next action", type: "text" },
      { id: "gtmLesson", label: "Lesson for GTM", type: "textarea" },
      { id: "shouldBecome", label: "Should this become a...", type: "multiSelectDropdown", options: ["Proof gap", "Objection to handle", "Disqualification rule", "Qualification question", "Sales-process fix", "Pricing / packaging fix", "Nurture rule", "No action"] }
    ] }
  ].forEach((table) => details.appendChild(createTable({ ...table, layout: "cards", repeatable: true, minRows: 1, maxRows: 20 })));

  details.appendChild(createRevenueMotionSnapshotCard(motionRowId));
  return details;
}

function renderRevenueMotionAssessmentPanels() {
  const container = document.getElementById("revenueMotionAssessmentPanels");
  if (!container) {
    return;
  }
  const data = getFormData();
  const fullMotions = getRevenueMotionRows(data).filter((row) => row.values.assessmentDepth === "Full motion analysis");
  container.innerHTML = "";
  if (!fullMotions.length) {
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = "Mark a revenue motion as Full motion analysis to open a detailed, scored assessment for that motion.";
    container.appendChild(note);
    return;
  }
  if (fullMotions.length > 3) {
    const warning = document.createElement("div");
    warning.className = "hint";
    warning.textContent = "Multiple full motion analyses can make the intake longer. Consider fully assessing only the revenue motions that matter most for the next 90 days.";
    container.appendChild(warning);
  }
  const title = document.createElement("h3");
  title.textContent = "Revenue Motion Readiness Assessments";
  container.appendChild(title);
  fullMotions.forEach((row, index) => container.appendChild(createRevenueMotionAssessmentPanel(row, index)));
  setFormData(data);
  updateConditionalFields();
  updateRevenueMotionSummary();
}

function createRevenueMotionSummaryCard() {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const grid = document.createElement("div");
  const items = [["motions", "Revenue motions listed"], ["fullAnalyses", "Full motion analyses"], ["primaryMotion", "Primary Revenue Motion"], ["score", "Primary readiness score"], ["stage", "Readiness stage"], ["confidence", "Snapshot confidence"], ["highest", "Highest scoring motion"], ["lowest", "Lowest scoring full motion"], ["summaryOnly", "Summary-only motions"], ["nextMoves", "Recommended next moves"]];
  card.className = "summary-card";
  card.id = "revenueMotionSummaryCard";
  heading.textContent = "Revenue Motion Portfolio Summary";
  grid.className = "summary-grid";
  items.forEach(([key, label]) => {
    const item = document.createElement("div");
    const itemLabel = document.createElement("div");
    const value = document.createElement("div");
    item.className = "summary-item";
    itemLabel.className = "summary-label";
    value.className = "summary-value";
    value.dataset.revenueMotionSummaryValue = key;
    itemLabel.textContent = label;
    value.textContent = "Not filled yet";
    item.appendChild(itemLabel);
    item.appendChild(value);
    grid.appendChild(item);
  });
  card.appendChild(heading);
  card.appendChild(grid);
  return card;
}

function updateRevenueMotionSummary() {
  const card = document.getElementById("revenueMotionSummaryCard");
  if (!card) {
    return;
  }
  const data = getFormData();
  const motions = getRevenueMotionRows(data);
  const fullMotions = motions.filter((row) => row.values.assessmentDepth === "Full motion analysis");
  const summaryOnly = motions.filter((row) => row.values.assessmentDepth !== "Full motion analysis");
  const primaryRowId = getPrimaryRevenueMotionRowId(data);
  const snapshot = revenueMotionReadinessSnapshot(data, primaryRowId);
  const scored = fullMotions.map((row, index) => ({ row, label: getRevenueMotionLabel(data, row.rowId, index), snapshot: revenueMotionReadinessSnapshot(data, row.rowId) })).sort((a, b) => b.snapshot.score - a.snapshot.score);
  const values = {
    motions: String(motions.length || 0),
    fullAnalyses: String(fullMotions.length || 0),
    primaryMotion: primaryRowId ? getRevenueMotionLabel(data, primaryRowId) : "",
    score: fullMotions.length ? `${snapshot.score}/100 for primary motion` : "No full motion analyses yet",
    stage: snapshot.stage,
    confidence: snapshot.confidence,
    highest: scored[0] ? `${scored[0].label}: ${scored[0].snapshot.score}/100` : "",
    lowest: scored[scored.length - 1] ? `${scored[scored.length - 1].label}: ${scored[scored.length - 1].snapshot.score}/100` : "",
    summaryOnly: summaryOnly.map((row, index) => getRevenueMotionLabel(data, row.rowId, index)).join(", "),
    nextMoves: snapshot.nextMoves.join(" ")
  };
  Object.entries(values).forEach(([key, value]) => {
    const node = card.querySelector(`[data-revenue-motion-summary-value="${key}"]`);
    if (node) {
      node.textContent = value || "Not filled yet";
    }
  });
  document.querySelectorAll("[data-revenue-motion-snapshot-for]").forEach((snapshotCard) => {
    const motionRowId = snapshotCard.dataset.revenueMotionSnapshotFor;
    const motionSnapshot = revenueMotionReadinessSnapshot(data, motionRowId);
    const cardValues = { score: `${motionSnapshot.score}/100`, stage: motionSnapshot.stage, confidence: motionSnapshot.confidence, strengths: motionSnapshot.strengths.join(", "), gaps: motionSnapshot.gaps.join(", "), nextMoves: motionSnapshot.nextMoves.join(" ") };
    Object.entries(cardValues).forEach(([key, value]) => {
      const node = snapshotCard.querySelector(`[data-revenue-motion-assessment-value="${key}"]`);
      if (node) {
        node.textContent = value || "Not filled yet";
      }
    });
  });
}

function createSignalReadinessSummaryCard() {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const grid = document.createElement("div");
  const items = [
    ["plays", "Targeting strategys listed"],
    ["fullAnalyses", "Full signal analyses"],
    ["primaryPlay", "Primary targeting strategy"],
    ["score", "Signal readiness score"],
    ["stage", "Readiness stage"],
    ["confidence", "Snapshot confidence"],
    ["highest", "Highest scoring play"],
    ["lowest", "Lowest scoring full play"],
    ["summaryOnly", "Summary-only plays"],
    ["strengths", "Strongest areas"],
    ["gaps", "Biggest gaps"],
    ["nextMoves", "Recommended next moves"]
  ];

  card.className = "summary-card";
  card.id = "signalReadinessSummaryCard";
  heading.textContent = "Signal Portfolio Summary";
  grid.className = "summary-grid";

  items.forEach(([key, label]) => {
    const item = document.createElement("div");
    const itemLabel = document.createElement("div");
    const value = document.createElement("div");

    item.className = "summary-item";
    itemLabel.className = "summary-label";
    value.className = "summary-value";
    value.dataset.signalSummaryValue = key;
    itemLabel.textContent = label;
    value.textContent = "Not filled yet";
    item.appendChild(itemLabel);
    item.appendChild(value);
    grid.appendChild(item);
  });

  card.appendChild(heading);
  card.appendChild(grid);
  return card;
}

function createBaseGtmReportActions() {
  const actions = document.createElement("div");
  const quickButton = document.createElement("button");
  const detailedButton = document.createElement("button");

  actions.className = "action-bar section-report-actions";
  quickButton.type = "button";
  quickButton.className = "secondary";
  quickButton.textContent = "Generate Quick GTM Readiness Report";
  quickButton.addEventListener("click", () => submitIntake("quick"));

  detailedButton.type = "button";
  detailedButton.textContent = "Continue to Detailed Readiness Report";
  detailedButton.addEventListener("click", showDetailedSections);

  actions.appendChild(quickButton);
  actions.appendChild(detailedButton);
  return actions;
}

function sectionVisible(section) {
  if (section.hidden || section.deprecated) {
    return false;
  }

  return detailedSectionsVisible || section.id === "company" || section.id === "executiveQuickReview";
}

function visibleSections() {
  return schema.sections.filter(sectionVisible);
}

function firstDetailedSectionId() {
  const section = schema.sections.find((item) => !item.hidden && !item.deprecated && !["company", "executiveQuickReview"].includes(item.id));
  return section?.id || "company";
}

function currentImprovementFocus() {
  try {
    const focus = JSON.parse(localStorage.getItem(IMPROVEMENT_FOCUS_KEY) || "null");
    return focus && focus.sectionId ? focus : null;
  } catch (error) {
    localStorage.removeItem(IMPROVEMENT_FOCUS_KEY);
    return null;
  }
}

function renderImprovementFocusCard(sectionId) {
  const focus = currentImprovementFocus();

  if (!focus || focus.sectionId !== sectionId) {
    return null;
  }

  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const why = document.createElement("p");
  const missingHeading = document.createElement("h4");
  const missingList = document.createElement("ul");
  const questionsHeading = document.createElement("h4");
  const questionsList = document.createElement("ol");
  const exampleHeading = document.createElement("h4");
  const example = document.createElement("p");
  const actions = document.createElement("div");
  const saveAnswers = document.createElement("button");
  const updateModel = document.createElement("button");
  const regenerate = document.createElement("button");
  const dismiss = document.createElement("button");

  card.className = "improvement-focus";
  heading.textContent = `Workshop: ${focus.area || "Recommended follow-up"}`;
  why.textContent = focus.why || "Answer the questions below to improve report confidence.";
  missingHeading.textContent = "What is missing or unclear";
  (focus.missing || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    missingList.appendChild(li);
  });
  questionsHeading.textContent = "Questions to answer";
  (focus.questions || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    questionsList.appendChild(li);
  });
  exampleHeading.textContent = "Example of a stronger answer";
  example.textContent = focus.example || "";
  actions.className = "action-bar";
  saveAnswers.type = "button";
  saveAnswers.className = "secondary";
  saveAnswers.textContent = "Save Answers";
  saveAnswers.addEventListener("click", () => {
    formStateData = {
      ...formStateData,
      ...currentVisibleFormData()
    };
    saveDraft(true);
  });
  updateModel.type = "button";
  updateModel.className = "secondary";
  updateModel.textContent = "Update Model";
  updateModel.addEventListener("click", () => {
    formStateData = {
      ...formStateData,
      ...currentVisibleFormData()
    };
    saveDraft(false);
    renderOfferAssessmentPanels();
    renderSignalPlayAssessmentPanels();
    renderRevenueMotionAssessmentPanels();
    updateConditionalFields();
    refreshIntakeUi({ refreshPanels: true });
    const status = document.getElementById("saveStatus");
    if (status) {
      status.textContent = "Model updated from workshop answers.";
    }
  });
  regenerate.type = "button";
  regenerate.textContent = "Regenerate Blueprint";
  regenerate.addEventListener("click", () => {
    formStateData = {
      ...formStateData,
      ...currentVisibleFormData()
    };
    saveDraft(false);
    submitIntake("detailed");
  });
  dismiss.type = "button";
  dismiss.className = "secondary";
  dismiss.textContent = "Dismiss";
  dismiss.addEventListener("click", () => {
    localStorage.removeItem(IMPROVEMENT_FOCUS_KEY);
    renderSections();
    setFormData(formStateData);
    refreshIntakeUi({ refreshPanels: true });
    updateConditionalFields();
  });

  card.appendChild(heading);
  card.appendChild(why);
  if (missingList.children.length) {
    card.appendChild(missingHeading);
    card.appendChild(missingList);
  }
  if (questionsList.children.length) {
    card.appendChild(questionsHeading);
    card.appendChild(questionsList);
  }
  if (example.textContent) {
    card.appendChild(exampleHeading);
    card.appendChild(example);
  }
  actions.appendChild(saveAnswers);
  actions.appendChild(updateModel);
  actions.appendChild(regenerate);
  actions.appendChild(dismiss);
  card.appendChild(actions);
  return card;
}

function syncFormStateFromDom() {
  formStateData = getFormData();
}

function switchActiveSection(sectionId) {
  if (sectionId === activeSectionId) {
    return;
  }

  syncFormStateFromDom();
  activeSectionId = sectionId;
  renderSections();
  setFormData(formStateData);
  renderOfferAssessmentPanels();
  renderSignalPlayAssessmentPanels();
  renderRevenueMotionAssessmentPanels();
  updateConditionalFields();
  refreshIntakeUi();
  updateDetailedActionBar();
  const active = document.getElementById(activeSectionId);
  if (active) {
    active.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderSectionNavigation(sectionsToShow, nav) {
  sectionsToShow.forEach((section) => {
    const anchor = document.createElement("a");
    anchor.href = `#${section.id}`;
    anchor.textContent = section.title;
    if (section.id === activeSectionId) {
      anchor.classList.add("active");
    }
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      switchActiveSection(section.id);
    });
    nav.appendChild(anchor);
  });
}

function renderSections() {
  const sections = document.getElementById("sections");
  const nav = document.getElementById("sectionNav");
  const sectionsToShow = visibleSections();
  const activeSection = sectionsToShow.find((section) => section.id === activeSectionId) || sectionsToShow[0];

  sections.innerHTML = "";
  nav.innerHTML = "";

  renderSectionNavigation(sectionsToShow, nav);

  if (!activeSection) {
    return;
  }

  activeSectionId = activeSection.id;
  const sectionEl = document.createElement("section");
  const heading = document.createElement("div");
  const h2 = document.createElement("h2");

  sectionEl.id = activeSection.id;
  heading.className = "section-heading";
  h2.textContent = activeSection.title;
  heading.appendChild(h2);

  if (activeSection.description) {
    const description = document.createElement("p");
    description.textContent = activeSection.description;
    heading.appendChild(description);
  }

  sectionEl.appendChild(heading);
  const improvementFocus = renderImprovementFocusCard(activeSection.id);
  if (improvementFocus) {
    sectionEl.appendChild(improvementFocus);
  }
  renderSectionBody(activeSection, sectionEl);

  if (activeSection.id === "executiveQuickReview") {
    sectionEl.appendChild(createBaseGtmReportActions());
  }

  if (activeSection.id === "offer") {
    const assessmentContainer = document.createElement("div");
    assessmentContainer.id = "offerAssessmentPanels";
    sectionEl.appendChild(assessmentContainer);
    sectionEl.appendChild(createOfferReadinessSummaryCard());
  }

  if (activeSection.id === "signals") {
    const signalAssessmentContainer = document.createElement("div");
    signalAssessmentContainer.id = "signalPlayAssessmentPanels";
    sectionEl.appendChild(signalAssessmentContainer);
    sectionEl.appendChild(createSignalReadinessSummaryCard());
  }

  if (activeSection.id === "pipeline") {
    const revenueMotionContainer = document.createElement("div");
    revenueMotionContainer.id = "revenueMotionAssessmentPanels";
    sectionEl.appendChild(revenueMotionContainer);
    sectionEl.appendChild(createRevenueMotionSummaryCard());
  }

  sections.appendChild(sectionEl);
}

function currentVisibleFormData() {
  const data = {};
  const form = document.getElementById("intakeForm");
  const formData = new FormData(form);

  for (const [key, value] of formData.entries()) {
    const serializedValue = serializeFieldValue(key, value);

    if (data[key]) {
      data[key] = `${data[key]}, ${serializedValue}`;
    } else {
      data[key] = serializedValue;
    }
  }

  migrateTractionData(data);
  migratePersonaData(data);
  migrateOfferData(data);
  migrateSignalData(data);
  migrateRevenueMotionData(data);
  applyCarryForward(data);
  applyProofGapAutofill(data);
  applyOfferGeneratedFields(data);
  applyClassificationMetadata(data);
  data.reviewMode = currentReportMode;
  data.savedAt = new Date().toISOString();
  return data;
}

function getFormData() {
  return normalizeRepeatableData({
    ...formStateData,
    ...currentVisibleFormData()
  });
}

function displayWithOther(label, other) {
  return other ? `${label} - ${other}` : label;
}

function applyClassificationMetadata(data) {
  const taxonomy = window.GTM_TAXONOMY;

  if (!taxonomy) {
    return;
  }

  const industry = taxonomy.getIndustryById(data.industryId);
  const businessType = taxonomy.getBusinessTypeById(data.businessTypeId);

  if (industry) {
    data.industryLabel = industry.label;
    data.industryGroup = industry.group;
    data.industry = displayWithOther(industry.label, data.industryId === "other_not_sure" ? data.industryId__other : "");
  }

  if (businessType) {
    data.businessTypeLabel = businessType.label;
    data.businessTypeGroup = businessType.group;
    data.businessModel = displayWithOther(businessType.label, data.businessTypeId === "other_not_sure" ? data.businessTypeId__other : "");
  }

  if (data.industryId || data.businessTypeId) {
    const archetype = taxonomy.deriveGtmArchetype(data.industryId, data.businessTypeId);
    data.derivedGtmArchetypeId = archetype.id;
    data.derivedGtmArchetypeLabel = archetype.label;
    data.scoreModel = archetype.scoreModel;
    data.derivedGtmArchetypeNotes = archetype.notes.join(" ");
  }
}

function serializeFieldValue(key, value) {
  const field = document.querySelector(`[name="${CSS.escape(key)}"]`);
  const text = String(value).trim();

  if (!text) {
    return "";
  }

  if (field && field.closest(".other-field") && field.closest(".other-field").hidden) {
    return "";
  }

  if (field && field.dataset.money === "true") {
    return `$${formatMoneyInput(text)}`;
  }

  return text;
}

function createRecordId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readRecords() {
  try {
    return JSON.parse(localStorage.getItem(RECORDS_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function writeRecords(records) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

async function loadBackendRecords() {
  if (!API_BASE) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/records`);

    if (!response.ok) {
      throw new Error("Could not load saved brands.");
    }

    const result = await response.json();
    if (Array.isArray(result.records)) {
      writeRecords(result.records);
    }
  } catch (error) {
    console.warn(error.message);
  }
}

async function saveRecordToBackend(record) {
  if (!API_BASE || !record || !record.id) {
    return;
  }

  try {
    await fetch(`${API_BASE}/api/records/${encodeURIComponent(record.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });
  } catch (error) {
    console.warn(error.message);
  }
}

function activeRecordId() {
  return localStorage.getItem(ACTIVE_RECORD_KEY) || "";
}

function setActiveRecordId(id) {
  if (id) {
    localStorage.setItem(ACTIVE_RECORD_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_RECORD_KEY);
  }

  updateResultsLink();
}

function resultsUrl(version = "20260622-record-safe-results") {
  const id = activeRecordId();
  const params = new URLSearchParams({ v: version });

  if (id) {
    params.set("recordId", id);
  }

  return `results.html?${params.toString()}`;
}

function updateResultsLink() {
  const link = document.getElementById("viewResultsLink");

  if (link) {
    link.href = resultsUrl();
  }
}

function recordName(data, fallback = "Untitled company") {
  return String(data.companyName || data.website || fallback).trim();
}

function hasMeaningfulData(data) {
  return Object.entries(data).some(([key, value]) => {
    if (key === "savedAt") {
      return false;
    }

    return String(value || "").trim();
  });
}

function currentRecord(records = readRecords()) {
  const activeId = activeRecordId();
  return records.find((record) => record.id === activeId) || null;
}

function migrateLegacyDraft() {
  if (readRecords().length) {
    return;
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return;
  }

  try {
    const data = JSON.parse(saved);
    if (!data || !Object.keys(data).length) {
      return;
    }

    const record = {
      id: createRecordId(),
      name: recordName(data),
      data,
      createdAt: data.savedAt || new Date().toISOString(),
      updatedAt: data.savedAt || new Date().toISOString()
    };
    writeRecords([record]);
    setActiveRecordId(record.id);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function sortedRecords() {
  const records = readRecords();

  return records
    .slice()
    .sort((first, second) => String(first.name || "").localeCompare(String(second.name || "")));
}

function renderBrandPicker() {
  const search = document.getElementById("brandSearch");
  const options = document.getElementById("savedBrandOptions");
  const list = document.getElementById("brandList");
  const active = currentRecord();
  const records = sortedRecords();

  search.value = active ? active.name || "Untitled company" : "";
  options.innerHTML = "";
  list.innerHTML = "";

  records.forEach((record) => {
    const option = document.createElement("option");
    option.value = record.name || "Untitled company";
    options.appendChild(option);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = record.name || "Untitled company";
    button.addEventListener("click", () => switchToRecord(record.id));
    list.appendChild(button);
  });

  if (!records.length) {
    const empty = document.createElement("p");
    empty.textContent = "No saved brands yet.";
    list.appendChild(empty);
  }
}

function findRecordBySearch(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return sortedRecords().find((record) => String(record.name || "").toLowerCase() === normalized) || null;
}

function switchToRecord(recordId) {
  const data = getFormData();

  if (activeRecordId() || hasMeaningfulData(data)) {
    saveDraft(false);
  }

  setActiveRecordId(recordId);
  window.location.href = "index.html";
}

function listValues(data, listId) {
  const directValues = String(data[listId] || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const itemValues = Object.entries(data)
    .filter(([key, value]) => key.startsWith(`${listId}__item-`) && String(value).trim())
    .sort(([first], [second]) => {
      const firstIndex = Number.parseInt(first.split("__item-")[1], 10);
      const secondIndex = Number.parseInt(second.split("__item-")[1], 10);
      return firstIndex - secondIndex;
    })
    .map(([, value]) => String(value).trim());

  return [...new Set([...directValues, ...itemValues])];
}

function tableColumnValues(data, tableId, columnId) {
  return Object.entries(data)
    .filter(([key, value]) => key.startsWith(`${tableId}__`) && key.endsWith(`__${columnId}`) && String(value).trim())
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([, value]) => String(value).trim());
}

function tableRowsFromData(data, tableId) {
  const rowIds = new Set();

  Object.keys(data || {}).forEach((key) => {
    const match = key.match(new RegExp(`^${tableId}__(.+?)__`));
    if (match) {
      rowIds.add(match[1]);
    }
  });

  return Array.from(rowIds)
    .sort((first, second) => {
      const firstNumber = Number.parseInt(first.split("-").pop(), 10);
      const secondNumber = Number.parseInt(second.split("-").pop(), 10);
      if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber)) {
        return firstNumber - secondNumber;
      }
      return first.localeCompare(second);
    })
    .map((rowId) => ({
      rowId,
      values: Object.fromEntries(
        Object.entries(data || {})
          .filter(([key]) => key.startsWith(`${tableId}__${rowId}__`))
          .map(([key, value]) => [key.replace(`${tableId}__${rowId}__`, ""), String(value || "").trim()])
      )
    }));
}

function customerGroupRows(data) {
  return tableRowsFromData(data, "possibleCustomerGroups")
    .filter((row) => row.values.groupName || row.values.problem || row.values.whyNow || row.values.segmentFitScore);
}

function targetHasRepeatableValue(data, listId) {
  return listValues(data, listId).length > 0;
}

function firstBlankRepeatableKey(data, listId) {
  let index = 1;

  while (data[`${listId}__item-${index}`] && String(data[`${listId}__item-${index}`]).trim()) {
    index += 1;
  }

  return `${listId}__item-${index}`;
}

function sourceValue(data, rule) {
  if (rule.fromAny) {
    return rule.fromAny.map((key) => String(data[key] || "").trim()).find(Boolean) || "";
  }

  if (rule.fromList) {
    return listValues(data, rule.fromList).join("; ");
  }

  if (rule.fromTableColumn) {
    return tableColumnValues(data, rule.fromTableColumn.table, rule.fromTableColumn.column).join("; ");
  }

  return String(data[rule.from] || "").trim();
}

function applyCarryForward(data) {
  carryForwardRules.forEach((rule) => {
    const value = sourceValue(data, rule);

    if (!value) {
      return;
    }

    if (rule.to && !String(data[rule.to] || "").trim()) {
      data[rule.to] = value;
    }

    if (rule.toRepeatable && !targetHasRepeatableValue(data, rule.toRepeatable)) {
      data[firstBlankRepeatableKey(data, rule.toRepeatable)] = value;
    }
  });

  return data;
}

function applyProofGapAutofill(data) {
  const existingAssets = new Set(
    tableColumnValues(data, "proofGapTracker", "asset").map((value) => value.toLowerCase())
  );
  const gapRows = Object.keys(data)
    .filter((key) => key.startsWith("proofGapTracker__") && key.endsWith("__asset"))
    .map((key) => Number.parseInt(key.match(/proof-gap-(\d+)/)?.[1] || "0", 10))
    .filter(Boolean);
  let nextGapIndex = gapRows.length ? Math.max(...gapRows) + 1 : 1;

  Object.entries(data).forEach(([key, value]) => {
    if (!key.startsWith("proofAssetStatus__") || !key.endsWith("__criterion") || !String(value).trim()) {
      return;
    }

    const rowId = key.split("__")[1];
    const exists = data[`proofAssetStatus__${rowId}__assetExists`] === "Yes";
    const criterion = String(value).trim();

    if (exists || existingAssets.has(criterion.toLowerCase())) {
      return;
    }

    data[`proofGapTracker__proof-gap-${nextGapIndex}__label`] = `Proof gap ${nextGapIndex}`;
    data[`proofGapTracker__proof-gap-${nextGapIndex}__asset`] = criterion;
    data[`proofGapTracker__proof-gap-${nextGapIndex}__why`] =
      data[`proofAssetStatus__${rowId}__gapNote`] || "Asset does not exist yet.";
    existingAssets.add(criterion.toLowerCase());
    nextGapIndex += 1;
  });
}

function carryForwardToBlankFields() {
  const data = getFormData();
  setFormData(data);
}

function setFormData(data) {
  formStateData = {
    ...formStateData,
    ...(data || {})
  };

  Object.entries(data || {}).forEach(([key, value]) => {
    let fields = document.querySelectorAll(`[name="${CSS.escape(key)}"]`);

    if (!fields.length) {
      const match = key.match(/^(.+)__item-(\d+)$/);
      if (match) {
        const list = document.querySelector(`[data-repeatable-for="${CSS.escape(match[1])}"]`);
        const field = findField(match[1]);
        const targetCount = Number.parseInt(match[2], 10);

        if (list && field) {
          while (list.children.length < targetCount) {
            addRepeatableItem(list, field);
          }

          fields = document.querySelectorAll(`[name="${CSS.escape(key)}"]`);
        }
      }

      const cardMatch = key.match(/^(.+)__(.+?-\d+)__/);
      if (cardMatch) {
        const list = document.querySelector(`[data-repeatable-card-list-for="${CSS.escape(cardMatch[1])}"]`);
        const targetCount = Number.parseInt(cardMatch[2].split("-").pop(), 10);
        const addButton = list?.parentElement?.querySelector("button.secondary");

        if (list && addButton && Number.isFinite(targetCount)) {
          while (list.children.length < targetCount && !addButton.hidden) {
            addButton.click();
          }

          fields = document.querySelectorAll(`[name="${CSS.escape(key)}"]`);
        }
      }

      if (!fields.length) {
        return;
      }
    }

    fields.forEach((field) => {
      if (field.type === "checkbox") {
        field.checked = String(value).split(", ").includes(field.value) || value === true || value === "true";
      } else if (field.tagName === "SELECT" && field.multiple) {
        const selected = String(value).split(", ");
        Array.from(field.options).forEach((option) => {
          option.selected = selected.includes(option.value);
        });
      } else if (field.dataset.money === "true") {
        field.value = formatMoneyInput(value);
      } else {
        field.value = value;
      }
    });
  });

  updateConditionalFields();
  updateSuccessFocusFields();
  updateGeneratedValueClaims();
  updateBestFitCustomerOptions();
  document.querySelectorAll("select[data-dynamic-options-from]").forEach((select) => {
    const value = data[select.name];
    if (String(value || "").trim() && Array.from(select.options).some((option) => option.value === value)) {
      select.value = value;
    }
  });
  updateBestFitSuggestion(data);
}

function updateConditionalFields() {
  updateDynamicOptionFields();

  document.querySelectorAll("select").forEach((select) => {
    const other = document.querySelector(`.other-field input[name="${CSS.escape(`${select.name}__other`)}"]`);

    if (!other) {
      return;
    }

    const triggerValue = other.parentElement.dataset.otherTriggerValue || "Other";
    other.parentElement.hidden = select.value !== triggerValue;
    if (other.parentElement.hidden) {
      other.value = "";
    }
  });

  document.querySelectorAll("[data-show-when-field]").forEach((wrapper) => {
    const source = document.querySelector(`[name="${CSS.escape(wrapper.dataset.showWhenField)}"]`);
    const expectsChecked = wrapper.dataset.showWhenChecked === "true";
    const isVisible = source && (
      expectsChecked
        ? source.checked
        : source.value === wrapper.dataset.showWhenValue
    );
    wrapper.hidden = !isVisible;

    if (!isVisible) {
      wrapper.querySelectorAll("input, textarea, select").forEach((field) => {
        field.value = "";
      });
    }
  });

  document.querySelectorAll("[data-hide-when-field]").forEach((wrapper) => {
    const source = document.querySelector(`[name="${CSS.escape(wrapper.dataset.hideWhenField)}"]`);
    const isHidden = source && source.value === wrapper.dataset.hideWhenValue;
    wrapper.hidden = isHidden;

    if (isHidden) {
      wrapper.querySelectorAll("input, textarea, select").forEach((field) => {
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = false;
        } else {
          field.value = "";
        }
      });
    }
  });

  document.querySelectorAll("[data-money='true']").forEach((input) => {
    input.value = formatMoneyInput(input.value);
  });
}

function updateGeneratedValueClaims() {
  document.querySelectorAll(".repeatable-card").forEach((card) => {
    const firstInput = card.querySelector("input, select, textarea");
    if (firstInput) {
      firstInput.dispatchEvent(new Event("change"));
    }
  });
  updateBestFitCustomerOptions();
}

function findField(id) {
  for (const section of schema.sections) {
    const field = sectionFields(section).find((item) => item.id === id);
    if (field) {
      return field;
    }
  }

  return null;
}

function setIfBlank(target, source, data) {
  if (!String(data[target] || "").trim() && String(data[source] || "").trim()) {
    data[target] = data[source];
  }
}

function setValueIfBlank(data, target, value) {
  if (!target) {
    return;
  }

  if (!String(data[target] || "").trim() && String(value || "").trim()) {
    data[target] = value;
  }
}

function migrateRepeatableValues(data, oldListId, newListId, maxItems = 10) {
  for (let index = 1; index <= maxItems; index += 1) {
    setValueIfBlank(data, `${newListId}__item-${index}`, data[`${oldListId}__item-${index}`]);
  }
}

function appendRepeatableValueIfMissing(data, listId, value) {
  const text = String(value || "").trim();

  if (!text) {
    return;
  }

  const existing = listValues(data, listId).map((item) => item.toLowerCase());
  if (existing.includes(text.toLowerCase())) {
    return;
  }

  data[firstBlankRepeatableKey(data, listId)] = text;
}

function normalizeFitScore(value) {
  const text = String(value || "").trim();
  const numeric = Number.parseInt(text, 10);

  if (Number.isFinite(numeric)) {
    return String(Math.min(Math.max(numeric, 1), 3));
  }

  if (/^high|strong|fast|easy|clear|urgent/i.test(text)) {
    return "3";
  }

  if (/^mid|medium|moderate|some|possible|okay|manageable/i.test(text)) {
    return "2";
  }

  if (/^low|weak|poor|hard|little|none|long/i.test(text)) {
    return "1";
  }

  return text;
}

function normalizeLegacyIcpData(normalized) {
  const mappings = [
    ["bestCustomerProfile__segment-company-type__answer", "bestFitCustomerGroup"],
    ["bestCustomerProfile__segment-company-type__answer", "possibleCustomerGroups__customer-group-1__groupName"],
    ["bestCustomerProfile__size-scale-range__answer", "bestFitSizeScaleRange"],
    ["bestCustomerProfile__maturity-stage__answer", "bestFitMaturityStage"],
    ["bestCustomerProfile__primary-pain__answer", "bestFitPrimaryPain"],
    ["bestCustomerProfile__primary-pain__answer", "possibleCustomerGroups__customer-group-1__problem"],
    ["bestCustomerProfile__current-workaround__answer", "bestFitCurrentWorkaround"],
    ["bestCustomerProfile__trigger-event-or-timing-signal__answer", "bestFitTrigger"],
    ["bestCustomerProfile__trigger-event-or-timing-signal__answer", "possibleCustomerGroups__customer-group-1__whyNow"],
    ["bestCustomerProfile__economic-buyer__answer", "bestFitDecisionMaker"],
    ["bestCustomerProfile__champion-day-to-day-owner__answer", "bestFitChampion"],
    ["bestCustomerProfile__first-use-case-or-sales-wedge__answer", "bestFitFirstUseCase"],
    ["bestCustomerProfile__budget-ability-to-pay__answer", "bestFitBudgetAbility"],
    ["bestCustomerProfile__likely-sales-motion__answer", "bestFitLikelySalesMotion"],
    ["bestCustomerProfile__expected-sales-cycle__answer", "bestFitExpectedSalesCycle"],
    ["bestCustomerProfile__implementation-requirements__answer", "bestFitImplementationRequirements"],
    ["bestCustomerProfile__evidence-this-profile-is-a-good-fit__answer", "bestFitEvidence"],
    ["bestCustomerProfile__expansion-or-strategic-value__answer", "bestFitExpansionValue"],
    ["bestCustomerProfile__disqualification-signals__answer", "bestFitDisqualificationSignals"]
  ];

  mappings.forEach(([source, target]) => setIfBlank(target, source, normalized));
  setIfBlank("bestFitFirstUseCase", "useCaseWedge", normalized);
  setIfBlank("useCaseWedge", "bestFitFirstUseCase", normalized);
  setIfBlank("bestFitBudgetCategory", "budgetCategory", normalized);
  setIfBlank("budgetCategory", "bestFitBudgetCategory", normalized);
  setIfBlank("bestFitRevenueRange", "sizeFit__best-fit-profile__revenue", normalized);
  setIfBlank("bestFitHeadcountRange", "sizeFit__best-fit-profile__headcount", normalized);
  setIfBlank("bestFitSizeScaleRange", "sizeFit__best-fit-profile__otherScale", normalized);
  setIfBlank("sizeFit__best-fit-profile__revenue", "bestFitRevenueRange", normalized);
  setIfBlank("sizeFit__best-fit-profile__headcount", "bestFitHeadcountRange", normalized);
  setIfBlank("sizeFit__best-fit-profile__otherScale", "bestFitSizeScaleRange", normalized);
  setIfBlank("bestFitTrigger", "buyingTriggersSummary__item-1", normalized);
  setIfBlank("buyingTriggersSummary__item-1", "bestFitTrigger", normalized);

  if (!customerGroupRows(normalized).length && targetHasRepeatableValue(normalized, "verticalFit")) {
    listValues(normalized, "verticalFit").slice(0, 3).forEach((value, index) => {
      setValueIfBlank(normalized, `possibleCustomerGroups__customer-group-${index + 1}__groupName`, value);
    });
  }

  customerGroupRows(normalized).slice(0, 3).forEach((row, index) => {
    setValueIfBlank(normalized, `verticalFit__item-${index + 1}`, row.values.groupName);
  });

  migrateRepeatableValues(normalized, "positiveMustHave", "icpMustHaveSignals");
  migrateRepeatableValues(normalized, "positiveNiceToHave", "icpNiceToHaveSignals");
  migrateRepeatableValues(normalized, "negativeCaution", "icpCautionSignals");
  migrateRepeatableValues(normalized, "badFitSignals", "icpDisqualificationRules");
  appendRepeatableValueIfMissing(normalized, "icpDisqualificationRules", normalized.disqualificationRule);

  [1, 2, 3].forEach((index) => {
    setValueIfBlank(normalized, `bestFitBuyingStages__item-${index}`, normalized[`stageFit__${index}__stage`]);
    setValueIfBlank(normalized, `buyingTriggersSummary__item-${index}`, normalized[`triggerEvents__${index}__trigger`]);
  });

  tableRowsFromData(normalized, "buyerRoleMap").forEach((row) => {
    const buyerRole = row.values.buyerRole || "";
    const playsRole = row.values.playsRole || "";
    const label = [buyerRole, playsRole].filter(Boolean).join(" - ");
    let target = "";

    if (/procurement/i.test(buyerRole) || /signs contract/i.test(playsRole)) {
      target = "buyingCommittee__procurement-finance__titles";
    } else if (/blocks decision/i.test(playsRole) || /blocker/i.test(buyerRole)) {
      target = "buyingCommittee__likely-blocker__titles";
    } else if (/implements solution/i.test(playsRole) || /implementation/i.test(buyerRole)) {
      target = "buyingCommittee__implementation-owner__titles";
    } else if (/uses solution/i.test(playsRole) || /individual user/i.test(buyerRole)) {
      target = "buyingCommittee__day-to-day-user__titles";
    } else if (/influences decision/i.test(playsRole)) {
      target = "buyingCommittee__champion__titles";
    } else if (/c-level|founder|owner|department head/i.test(buyerRole) || /owns budget|approves purchase/i.test(playsRole)) {
      target = "buyingCommittee__economic-buyer__titles";
    }

    setValueIfBlank(normalized, target, label);
  });

  if (!targetHasRepeatableValue(normalized, "avoidSegments")) {
    setIfBlank("avoidSegments__item-1", "bestCustomerProfile__disqualification-signals__answer", normalized);
  }

  const oldRows = tableRowsFromData(normalized, "targetPrioritization")
    .filter((row) => row.values.label || Object.values(row.values).some(Boolean))
    .slice(0, 3);
  const rowMappings = {
    label: "groupName",
    urgency: "urgency",
    abilityToPay: "abilityToPay",
    easeOfAccess: "easeOfAccess",
    proofEvidence: "proofEvidence",
    implementationFit: "implementationFit",
    strategicValue: "strategicValue",
    salesCycle: "salesCycleFit",
    revenuePotential: "revenuePotential",
    notes: "notesEvidence"
  };

  oldRows.forEach((row, index) => {
    const newRowId = `customer-group-${index + 1}`;
    Object.entries(rowMappings).forEach(([oldKey, newKey]) => {
      const target = `possibleCustomerGroups__${newRowId}__${newKey}`;
      const value = row.values[oldKey];

      if (!String(normalized[target] || "").trim() && String(value || "").trim()) {
        normalized[target] = ["urgency", "abilityToPay", "easeOfAccess", "proofEvidence", "implementationFit"].includes(newKey)
          ? normalizeFitScore(value)
          : value;
      }
    });
  });
}

function mapBlockerSeverity(value) {
  if (value === "High") {
    return "High - could stop the plan";
  }

  if (value === "Medium") {
    return "Medium - could slow the plan";
  }

  if (value === "Low") {
    return "Low - manageable";
  }

  return value;
}

function normalizeLegacyGoalData(normalized) {
  ["30-days", "60-days", "90-days"].forEach((rowId) => {
    const planPrefix = `successPlan__${rowId}__`;
    const newPrefix = `successLooksLike__${rowId}__`;
    setIfBlank(`${newPrefix}needTo`, `${planPrefix}primaryOutcome`, normalized);
    setIfBlank(`${newPrefix}measure`, `${planPrefix}successMetric`, normalized);
    setIfBlank(`${newPrefix}target`, `${planPrefix}target`, normalized);
    setIfBlank(`${newPrefix}owner`, `${planPrefix}owner`, normalized);
    setIfBlank(`${newPrefix}verification`, `${planPrefix}evidenceNeeded`, normalized);

    const criteria = [1, 2, 3]
      .map((index) => normalized[`successCriteria__${rowId}__rank${index}`])
      .filter(Boolean)
      .map((value, index) => `${index + 1}. ${value}`)
      .join(" ");

    if (!String(normalized[`${newPrefix}needTo`] || "").trim() && criteria) {
      normalized[`${newPrefix}needTo`] = criteria;
    }
  });

  [1, 2, 3].forEach((index) => {
    const oldPrefix = `gtmConstraintTracker__constraint-${index}__`;
    const newPrefix = `topBlockers__blocker-${index}__`;
    setIfBlank(`${newPrefix}blockerType`, `${oldPrefix}constraint`, normalized);
    setIfBlank(`${newPrefix}whyItMatters`, `${oldPrefix}whyItMatters`, normalized);
    setIfBlank(`${newPrefix}mustBeTrue`, `${oldPrefix}mustBeTrue`, normalized);
    setIfBlank(`${newPrefix}owner`, `${oldPrefix}owner`, normalized);
    setIfBlank(`${newPrefix}nextAction`, `${oldPrefix}nextAction`, normalized);

    if (!String(normalized[`${newPrefix}severity`] || "").trim() && normalized[`${oldPrefix}severity`]) {
      normalized[`${newPrefix}severity`] = mapBlockerSeverity(normalized[`${oldPrefix}severity`]);
    }
  });
}

function cardHasMeaningfulData(data, tableId, rowId) {
  return Object.entries(data).some(([key, value]) => key.startsWith(`${tableId}__${rowId}__`) && String(value || "").trim());
}

function firstBlankCardIndex(data, tableId, rowBase) {
  let index = 1;

  while (cardHasMeaningfulData(data, tableId, `${rowBase}-${index}`)) {
    index += 1;
  }

  return index;
}

function migrateRepeatableListToCards(data, listId, tableId, rowBase, fieldId, decorate = null) {
  listValues(data, listId).forEach((value) => {
    const index = firstBlankCardIndex(data, tableId, rowBase);
    const rowId = `${rowBase}-${index}`;
    setValueIfBlank(data, `${tableId}__${rowId}__${fieldId}`, value);
    if (decorate) {
      decorate(rowId, value);
    }
  });
}

function migrateTractionData(data) {
  migrateRepeatableListToCards(data, "caseStudyPotential", "proofReferenceCandidates", "proof-candidate", "customerName", (rowId) => {
    setValueIfBlank(data, `proofReferenceCandidates__${rowId}__proofTypes`, "Case study, Testimonial, Referral introduction");
    setValueIfBlank(data, `proofReferenceCandidates__${rowId}__permissionStatus`, "Not asked yet");
  });

  migrateRepeatableListToCards(data, "proofCustomers", "proofReferenceCandidates", "proof-candidate", "customerName", (rowId) => {
    setValueIfBlank(data, `proofReferenceCandidates__${rowId}__proofTypes`, "Sales reference, Referral introduction");
  });

  [1, 2, 3, 4, 5].forEach((index) => {
    const oldRow = `customer-${index}`;
    const newRow = `customer-${index}`;
    setIfBlank(`customerEvidenceInventory__${newRow}__customerName`, `currentCustomerFit__${oldRow}__customer`, data);
    setIfBlank(`customerEvidenceInventory__${newRow}__whyGoodFit`, `currentCustomerFit__${oldRow}__whyFit`, data);
  });

  migrateRepeatableListToCards(data, "expansionPotential", "expansionOpportunities", "expansion-opportunity", "opportunity");
  migrateRepeatableListToCards(data, "implementationBurden", "deliveryFitRisks", "delivery-fit-risk", "whatMadeHard");
  migrateRepeatableListToCards(data, "stalledOpportunities", "stalledDeals", "stalled-deal", "gtmLesson");

  tableRowsFromData(data, "deliveryFitRisks").forEach((row) => {
    const lesson = row.values.lessonNextAction || row.values.whatMadeHard;
    if (row.values.shouldBecomeRule === "Caution signal") {
      appendRepeatableValueIfMissing(data, "icpCautionSignals", lesson);
    }
    if (row.values.shouldBecomeRule === "Disqualification rule") {
      appendRepeatableValueIfMissing(data, "icpDisqualificationRules", lesson);
    }
  });
}

const buyerPersonaRoles = [
  "economic-buyer",
  "executive-sponsor",
  "champion",
  "day-to-day-user",
  "implementation-owner",
  "technical-security-reviewer",
  "procurement-finance",
  "likely-blocker"
];

function roleHasBuyerCardData(data, roleId) {
  return Object.entries(data).some(([key, value]) => key.startsWith(`buyerRoleCards__${roleId}__`) && String(value || "").trim());
}

function setRoleInvolvedIfBlank(data, roleId, value = "Yes") {
  setValueIfBlank(data, `buyerRoleCards__${roleId}__involved`, value);
}

function migratePersonaData(data) {
  const legacyValueDriverMappings = [
    ["execValueDrivers", ["economic-buyer", "executive-sponsor"]],
    ["operatingLeaderDrivers", ["implementation-owner", "champion"]],
    ["salesMarketingDrivers", ["champion", "day-to-day-user"]],
    ["financeDrivers", ["procurement-finance", "economic-buyer"]],
    ["techDataDrivers", ["technical-security-reviewer"]],
    ["endUserDrivers", ["day-to-day-user"]]
  ];

  legacyValueDriverMappings.forEach(([source, roles]) => {
    roles.forEach((roleId) => {
      setValueIfBlank(data, `buyerRoleCards__${roleId}__caresAbout`, data[source]);
    });
  });

  buyerPersonaRoles.forEach((roleId) => {
    setIfBlank(`buyerRoleCards__${roleId}__commonTitles`, `buyingCommittee__${roleId}__titles`, data);
    setIfBlank(`buyerRoleCards__${roleId}__painPriority`, `buyingCommittee__${roleId}__pain`, data);
    setIfBlank(`buyerRoleCards__${roleId}__message`, `buyingCommittee__${roleId}__message`, data);
    setIfBlank(`buyerRoleCards__${roleId}__discoveryQuestions`, `buyingCommittee__${roleId}__questions`, data);

    if (
      !String(data[`buyerRoleCards__${roleId}__involved`] || "").trim()
      && ["titles", "pain", "message", "questions"].some((field) => String(data[`buyingCommittee__${roleId}__${field}`] || "").trim())
    ) {
      data[`buyerRoleCards__${roleId}__involved`] = "Yes";
    }
  });

  if (data.bestFitDecisionMaker) {
    setValueIfBlank(data, "buyerRoleCards__economic-buyer__commonTitles", data.bestFitDecisionMaker);
    setRoleInvolvedIfBlank(data, "economic-buyer");
  }

  if (data.bestFitChampion) {
    setValueIfBlank(data, "buyerRoleCards__champion__commonTitles", data.bestFitChampion);
    setRoleInvolvedIfBlank(data, "champion");
  }

  if (data.bestFitPrimaryPain) {
    setValueIfBlank(data, "buyerRoleCards__economic-buyer__painPriority", data.bestFitPrimaryPain);
    setValueIfBlank(data, "buyerRoleCards__champion__painPriority", data.bestFitPrimaryPain);
  }

  if (data.bestFitFirstUseCase) {
    setValueIfBlank(data, "buyerRoleCards__champion__message", `First use case to validate: ${data.bestFitFirstUseCase}`);
    setValueIfBlank(data, "buyerRoleCards__day-to-day-user__painPriority", data.bestFitFirstUseCase);
  }

  buyerPersonaRoles.forEach((roleId) => {
    if (data[`buyerRoleCards__${roleId}__involved`] === "Yes") {
      const defaultImportance = ["economic-buyer", "champion", "likely-blocker"].includes(roleId) ? "High" : "Medium";
      setValueIfBlank(data, `personaPriority__${roleId}__importance`, defaultImportance);
    }

    if (roleHasBuyerCardData(data, roleId)) {
      setValueIfBlank(data, `personaPriority__${roleId}__confidence`, "Medium");
    }
  });
}

function migrateOfferData(data) {
  const hasPortfolio = tableRowsFromData(data, "offerPortfolio")
    .some((row) => row.values.offerName || row.values.offerRole || row.values.targetCustomerGroup || row.values.primaryBuyer || row.values.assessmentDepth);
  const hasLegacyOffer = [
    "offerBeingAssessed",
    "priorityIcpForOffer",
    "primaryBuyerForOffer",
    "offerBuyerProblem",
    "oneSentencePromise",
    "pricingModel",
    "pilotNeeded",
    "salesAssets"
  ].some((field) => String(data[field] || "").trim())
    || tableRowsFromData(data, "valueClaims").some((row) => Object.values(row.values).some(Boolean));

  if (!hasPortfolio && hasLegacyOffer) {
    setValueIfBlank(data, "offerPortfolio__offer-1__offerName", data.offerBeingAssessed || data.primaryOfferName || "Primary offer");
    setValueIfBlank(data, "offerPortfolio__offer-1__offerRole", data.offerCategory || "Core offer");
    setValueIfBlank(data, "offerPortfolio__offer-1__targetCustomerGroup", data.priorityIcpForOffer || data.offerTargetSegment || data.bestFitCustomerGroup);
    setValueIfBlank(data, "offerPortfolio__offer-1__primaryBuyer", data.primaryBuyerForOffer || data.primaryBuyer || data.bestFitDecisionMaker);
    setValueIfBlank(data, "offerPortfolio__offer-1__offerPriority", "Primary GTM focus");
    setValueIfBlank(data, "offerPortfolio__offer-1__assessmentDepth", "Full readiness analysis");
    setValueIfBlank(data, "primaryGtmOffer", "offer-1");

    const fieldMappings = [
      "offerBuyerProblem",
      "offerTriggerEvent",
      "offerCurrentWorkaround",
      "offerCostOfInaction",
      "offerUrgencyLevel",
      "offerUrgencyEvidence",
      "icpOfferAlignment",
      "oneSentencePromise",
      "suggestedOfferPromise",
      "offerDifferentiator",
      "offerCategory",
      "mainProofPoint",
      "promiseClarityRating",
      "firstUseCaseForOffer",
      "firstUseCaseFit",
      "whyBestStartingPoint",
      "buyerRequirements",
      "easiestNextStep",
      "nextStepCta",
      "buyingPathClarityRating",
      "pricingModel",
      "isPricingPublic",
      "minimumDealSize",
      "averageExpectedDealSize",
      "buyerApprovalLevel",
      "discountingRule",
      "packagingClarityRating",
      "pilotNeeded",
      "pilotLength",
      "pilotPrice",
      "pilotSuccessMetric",
      "pilotBuyerRequirements",
      "pilotConversionPath",
      "pilotRisk",
      "pilotReadinessRating",
      "salesAssets",
      "priorityMissingAssets",
      "assetNextAction"
    ];

    fieldMappings.forEach((field) => {
      setValueIfBlank(data, scopedOfferField("offer-1", field), data[field]);
    });
    setValueIfBlank(data, scopedOfferField("offer-1", "offerOutcomes"), data.usageProof);
    setValueIfBlank(data, scopedOfferField("offer-1", "buyerAlternativesToday"), data.alternatives);
    setValueIfBlank(data, scopedOfferField("offer-1", "offerObjections"), data.objections);

    ["valueClaims", "offerPackages", "alternativeComparison", "objectionHandling", "proofReadiness"].forEach((tableId) => {
      tableRowsFromData(data, tableId).forEach((row) => {
        Object.entries(row.values).forEach(([field, value]) => {
          setValueIfBlank(data, `${scopedOfferTable("offer-1", tableId)}__${row.rowId}__${field}`, value);
        });
      });
    });
  }

  const mappings = [
    ["offerTargetSegment", "priorityIcpForOffer"],
    ["primaryBuyer", "primaryBuyerForOffer"],
    ["bestFitDecisionMaker", "primaryBuyerForOffer"],
    ["budgetOwner", "primaryBuyerForOffer"],
    ["primaryOfferName", "offerBeingAssessed"],
    ["urgentBuyerProblem", "offerBuyerProblem"],
    ["painUrgency", "offerBuyerProblem"],
    ["bestFitPrimaryPain", "offerBuyerProblem"],
    ["quickBuyerProblem", "offerBuyerProblem"],
    ["bestFitTrigger", "offerTriggerEvent"],
    ["quickUrgencyNow", "offerTriggerEvent"],
    ["buyingTriggersSummary__item-1", "offerTriggerEvent"],
    ["currentWorkaround", "offerCurrentWorkaround"],
    ["bestFitCurrentWorkaround", "offerCurrentWorkaround"],
    ["costOfInaction", "offerCostOfInaction"],
    ["urgencyLevel", "offerUrgencyLevel"],
    ["urgencyEvidence", "offerUrgencyEvidence"],
    ["bestFitCustomerGroup", "priorityIcpForOffer"],
    ["possibleCustomerGroups__customer-group-1__groupName", "priorityIcpForOffer"],
    ["differentiator", "offerDifferentiator"],
    ["primaryWedge", "firstUseCaseForOffer"],
    ["bestFitFirstUseCase", "firstUseCaseForOffer"],
    ["useCaseWedge", "firstUseCaseForOffer"],
    ["startingPointReason", "whyBestStartingPoint"],
    ["buyerCommitmentRequired", "buyerRequirements"],
    ["pricingPublic", "isPricingPublic"],
    ["minimumViableDealSize", "minimumDealSize"],
    ["pilotProofOfConcept", "pilotConversionPath"]
  ];

  mappings.forEach(([source, target]) => setIfBlank(target, source, data));
  setIfBlank("primaryBuyer", "primaryBuyerForOffer", data);
  setIfBlank("offerTargetSegment", "priorityIcpForOffer", data);
  setIfBlank("primaryWedge", "firstUseCaseForOffer", data);

  ["entry-offer", "core-offer", "expansion-offer"].forEach((rowId) => {
    setIfBlank(`offerPackages__${rowId}__durationTerm`, `offerPackaging__${rowId}__duration`, data);
    setIfBlank(`offerPackages__${rowId}__nextStepAfterThis`, `offerPackaging__${rowId}__nextStep`, data);
    setIfBlank(`offerPackages__${rowId}__buyerUseCase`, `offerPackaging__${rowId}__buyerUseCase`, data);
    setIfBlank(`offerPackages__${rowId}__included`, `offerPackaging__${rowId}__included`, data);
    setIfBlank(`offerPackages__${rowId}__priceRange`, `offerPackaging__${rowId}__priceRange`, data);
    setIfBlank(`offerPackages__${rowId}__successMetric`, `offerPackaging__${rowId}__successMetric`, data);
  });

  tableRowsFromData(data, "proofReadiness").forEach((row) => {
    if (row.values.strength === "High") {
      setValueIfBlank(data, `proofReadiness__${row.rowId}__strength`, "Strong public proof");
    } else if (row.values.strength === "Medium") {
      setValueIfBlank(data, `proofReadiness__${row.rowId}__strength`, "Customer story");
    } else if (row.values.strength === "Low") {
      setValueIfBlank(data, `proofReadiness__${row.rowId}__strength`, "Anecdotal");
    }
  });
}

function applyOfferGeneratedFields(data) {
  const promise = offerPromiseSummary(data);
  setValueIfBlank(data, "suggestedOfferPromise", promise);

  const valueClaim = firstFilledTableRow(data, "valueClaims", (row) => (
    row.values.beforeState
    || row.values.afterState
    || row.values.baseline
    || row.values.improvement
    || row.values.outcome
  ));

  if (valueClaim && !String(data.offerBuyerTransformationSummary || "").trim()) {
    const parts = [];
    if (valueClaim.values.beforeState || valueClaim.values.baseline) {
      parts.push(`Before: ${valueClaim.values.beforeState || valueClaim.values.baseline}.`);
    }
    if (valueClaim.values.afterState || valueClaim.values.improvement) {
      parts.push(`After: ${valueClaim.values.afterState || valueClaim.values.improvement}.`);
    }
    if (valueClaim.values.outcome || valueClaim.values.metric || valueClaim.values.timeframe) {
      parts.push(`Outcome: ${[valueClaim.values.outcome, valueClaim.values.metric, valueClaim.values.timeframe].filter(Boolean).join(" / ")}.`);
    }
    data.offerBuyerTransformationSummary = parts.join(" ");
  }
}

const triggerEventOptions = [
  "Leadership change",
  "New funding",
  "Growth initiative",
  "Market expansion",
  "New location",
  "Hiring for relevant role",
  "Compliance pressure",
  "Cost pressure",
  "Customer complaints",
  "Vendor dissatisfaction",
  "System change",
  "Budget cycle",
  "Merger / acquisition",
  "New product launch",
  "Operational breakdown",
  "Competitor pressure",
  "Increased product usage",
  "Expansion in current account",
  "Renewal window",
  "Other"
];

function negativeSignalExplanation(value) {
  const explanations = {
    "No clear budget owner": "Deals can stall when no one clearly owns budget or approval.",
    "Company too small": "The account may lack the budget, volume, or complexity needed for a strong fit.",
    "Too custom": "High customization can slow delivery and weaken repeatability.",
    "Poor data quality": "Bad data can make implementation harder and proof less reliable.",
    "Heavy implementation burden": "The buyer may require more support, access, or change management than the team can support.",
    "Long procurement cycle": "Slow approvals can delay learning, revenue, and proof.",
    "Low urgency": "Low urgency makes it harder to create momentum or justify action now.",
    "Wrong geography": "Geography can create service, support, legal, or market-access issues.",
    "Unsupported tech stack": "Unsupported systems can increase implementation risk.",
    "No executive sponsor": "Without executive support, the deal may lack authority and priority.",
    "Low strategic value": "The account may not create enough revenue, learning, proof, or expansion value.",
    "Low margin": "The account may be expensive to win or serve relative to expected revenue."
  };
  return explanations[value] || "";
}

const negativeSignalOptions = [
  "No clear budget owner",
  "Company too small",
  "Too custom",
  "Poor data quality",
  "Heavy implementation burden",
  "Long procurement cycle",
  "Low urgency",
  "Wrong geography",
  "Unsupported tech stack",
  "No executive sponsor",
  "Low strategic value",
  "Low margin",
  "Other"
];

function firstBlankSignalCardId(data, tableId, rowBase) {
  return `${rowBase}-${firstBlankCardIndex(data, tableId, rowBase)}`;
}

function migrateTriggerValue(data, value, preferredProblem = "") {
  const text = String(value || "").trim();
  if (!text) {
    return;
  }

  const rowId = firstBlankSignalCardId(data, "buyingTriggerEvents", "trigger-event");
  const matched = triggerEventOptions.find((option) => option.toLowerCase() === text.toLowerCase());
  setValueIfBlank(data, `buyingTriggerEvents__${rowId}__triggerEvent`, matched || "Other");
  if (matched) {
    setValueIfBlank(data, `buyingTriggerEvents__${rowId}__whyUrgent`, text);
  } else {
    setValueIfBlank(data, `buyingTriggerEvents__${rowId}__howObserved`, text);
  }
  setValueIfBlank(data, `buyingTriggerEvents__${rowId}__buyerProblem`, preferredProblem);
}

function migrateSignalListToCards(data, listId, tableId, rowBase, fieldId, decorate = null) {
  listValues(data, listId).forEach((value) => {
    const rowId = firstBlankSignalCardId(data, tableId, rowBase);
    setValueIfBlank(data, `${tableId}__${rowId}__${fieldId}`, value);
    if (decorate) {
      decorate(rowId, value);
    }
  });
}

function migrateSignalData(data) {
  setIfBlank("signalPriorityIcp", "bestFitCustomerGroup", data);
  if (data.priorityIcpForOffer !== "Not sure yet") {
    setIfBlank("signalPriorityIcp", "priorityIcpForOffer", data);
  }
  setIfBlank("signalPriorityIcp", "possibleCustomerGroups__customer-group-1__groupName", data);
  setIfBlank("signalPrimaryBuyer", "bestFitDecisionMaker", data);
  setIfBlank("signalPrimaryBuyer", "primaryBuyerForOffer", data);
  setIfBlank("signalPrimaryBuyer", "buyerRoleCards__economic-buyer__commonTitles", data);
  setIfBlank("signalPrimaryBuyer", "buyerRoleCards__champion__commonTitles", data);
  setIfBlank("signalPrimaryBuyer", "buyerRoleCards__day-to-day-user__commonTitles", data);
  setIfBlank("signalPrimaryBuyer", "budgetOwner", data);
  setIfBlank("signalPrimaryBuyer", "painOwner", data);
  setIfBlank("signalOfferUseCase", "offerBeingAssessed", data);
  setIfBlank("signalOfferUseCase", "firstUseCaseForOffer", data);
  setIfBlank("signalOfferUseCase", "bestFitFirstUseCase", data);
  setIfBlank("signalOfferUseCase", "useCaseWedge", data);
  setIfBlank("signalOfferUseCase", "primaryWedge", data);
  setIfBlank("signalPrimaryGtmMotion", "quickCurrentSalesMotion", data);
  setIfBlank("signalPrimaryGtmMotion", "primarySalesMotion", data);
  setIfBlank("signalPrimaryGtmMotion", "quickPrimaryRevenueSource", data);

  const problem = data.offerBuyerProblem || data.bestFitPrimaryPain || data.quickBuyerProblem || "";
  if (!tableRowsFromData(data, "buyingTriggerEvents").some((row) => row.values.triggerEvent || row.values.howObserved)) {
    listValues(data, "positiveTriggerRules").forEach((value) => migrateTriggerValue(data, value, problem));
    [data.bestFitTrigger, data.offerTriggerEvent, data["buyingTriggersSummary__item-1"], data["triggerEvents__1__trigger"], data["triggerEvents__2__trigger"], data["triggerEvents__3__trigger"]]
      .forEach((value) => migrateTriggerValue(data, value, problem));
  }

  if (!tableRowsFromData(data, "fitSignals").some((row) => row.values.signal)) {
    migrateSignalListToCards(data, "publicFitSignals", "fitSignals", "fit-signal", "signal", (rowId) => {
      setValueIfBlank(data, `fitSignals__${rowId}__visibility`, "Publicly observable");
    });
    migrateSignalListToCards(data, "internalFitSignals", "fitSignals", "fit-signal", "signal", (rowId) => {
      setValueIfBlank(data, `fitSignals__${rowId}__visibility`, "Internal data only");
    });
    migrateSignalListToCards(data, "icpMustHaveSignals", "fitSignals", "fit-signal", "signal", (rowId) => {
      setValueIfBlank(data, `fitSignals__${rowId}__signalCategory`, "Company fit");
    });
  }

  if (!tableRowsFromData(data, "negativeSignalRules").some((row) => row.values.negativeSignal || row.values.notes)) {
    ["negativeSignals", "avoidSegments", "icpCautionSignals", "icpDisqualificationRules"].forEach((listId) => {
      listValues(data, listId).forEach((value) => {
        const rowId = firstBlankSignalCardId(data, "negativeSignalRules", "negative-signal");
        const text = String(value || "").trim();
        const matched = negativeSignalOptions.find((option) => option.toLowerCase() === text.toLowerCase());
        setValueIfBlank(data, `negativeSignalRules__${rowId}__negativeSignal`, matched || "Other");
        setValueIfBlank(data, `negativeSignalRules__${rowId}__notes`, matched ? "" : text);
        setValueIfBlank(data, `negativeSignalRules__${rowId}__action`, listId === "icpDisqualificationRules" ? "Disqualify" : "Needs review");
      });
    });
    tableRowsFromData(data, "deliveryFitRisks").forEach((row) => {
      const rowId = firstBlankSignalCardId(data, "negativeSignalRules", "negative-signal");
      setValueIfBlank(data, `negativeSignalRules__${rowId}__negativeSignal`, "Heavy implementation burden");
      setValueIfBlank(data, `negativeSignalRules__${rowId}__whyItMatters`, row.values.whatMadeHard);
      setValueIfBlank(data, `negativeSignalRules__${rowId}__notes`, row.values.shouldBecomeRule);
      setValueIfBlank(data, `negativeSignalRules__${rowId}__action`, "Needs review");
    });
  }

  if (!tableRowsFromData(data, "signalRoutingRules").some((row) => row.values.signal || row.values.notes)) {
    tableRowsFromData(data, "signalRules").forEach((row) => {
      const rowId = firstBlankSignalCardId(data, "signalRoutingRules", "signal-rule");
      setValueIfBlank(data, `signalRoutingRules__${rowId}__signal`, row.values.signal);
      setValueIfBlank(data, `signalRoutingRules__${rowId}__scoreImpact`, row.values.impact);
      setValueIfBlank(data, `signalRoutingRules__${rowId}__confidence`, row.values.confidence === "Mid" ? "Medium" : row.values.confidence);
      setValueIfBlank(data, `signalRoutingRules__${rowId}__notes`, [row.values.notes, row.values.source ? `Source: ${row.values.source}` : ""].filter(Boolean).join(" "));
    });
  }

  if (!tableRowsFromData(data, "signalDataSourceReadiness").some((row) => row.values.source)) {
    listValues(data, "signalDataSources").slice(0, 5).forEach((source) => {
      const rowId = firstBlankSignalCardId(data, "signalDataSourceReadiness", "data-source");
      setValueIfBlank(data, `signalDataSourceReadiness__${rowId}__source`, source);
    });
  }

  if (!tableRowsFromData(data, "globalNegativeSignals").some((row) => row.values.signal || row.values.whyItMatters)) {
    ["avoidSegments", "icpCautionSignals", "icpDisqualificationRules"].forEach((listId) => {
      listValues(data, listId).forEach((value) => {
        const rowId = firstBlankSignalCardId(data, "globalNegativeSignals", "global-negative-signal");
        const text = String(value || "").trim();
        const matched = negativeSignalOptions.find((option) => option.toLowerCase() === text.toLowerCase());
        setValueIfBlank(data, `globalNegativeSignals__${rowId}__signal`, matched || "Other");
        setValueIfBlank(data, `globalNegativeSignals__${rowId}__action`, listId === "icpDisqualificationRules" ? "Disqualify" : "Needs review");
        setValueIfBlank(data, `globalNegativeSignals__${rowId}__whyItMatters`, matched ? "" : text);
      });
    });
  }

  const hasSignalPortfolio = tableRowsFromData(data, "signalPlayPortfolio").some((row) => Object.values(row.values).some(Boolean));
  const hasSingleContextSignals = [
    "signalPriorityIcp",
    "signalPrimaryBuyer",
    "signalOfferUseCase",
    "signalPrimaryGtmMotion",
    "signalStrategyNotes"
  ].some((field) => String(data[field] || "").trim())
    || ["buyingTriggerEvents", "fitSignals", "negativeSignalRules", "signalRoutingRules", "signalActionPlan"].some((tableId) => tableRowsFromData(data, tableId).some((row) => Object.values(row.values).some(Boolean)))
    || ["positiveTriggerRules", "publicFitSignals", "internalFitSignals", "negativeSignals"].some((listId) => listValues(data, listId).length);

  if (!hasSignalPortfolio && hasSingleContextSignals) {
    setValueIfBlank(data, "signalPlayPortfolio__play-1__playName", "Primary targeting strategy");
    setValueIfBlank(data, "signalPlayPortfolio__play-1__customerGroup", data.signalPriorityIcp || data.bestFitCustomerGroup || data.priorityIcpForOffer || "Not sure yet");
    setValueIfBlank(data, "signalPlayPortfolio__play-1__offerOrUseCase", data.signalOfferUseCase || data.offerBeingAssessed || data.firstUseCaseForOffer || data.bestFitFirstUseCase || "Not sure yet");
    setValueIfBlank(data, "signalPlayPortfolio__play-1__primaryBuyerPersona", data.signalPrimaryBuyer || data.bestFitDecisionMaker || data.primaryBuyerForOffer || "Not sure");
    setValueIfBlank(data, "signalPlayPortfolio__play-1__gtmMotion", data.signalPrimaryGtmMotion || data.quickPrimaryRevenueSource || data.primarySalesMotion || "");
    setValueIfBlank(data, "signalPlayPortfolio__play-1__playPriority", "Primary targeting strategy");
    setValueIfBlank(data, "signalPlayPortfolio__play-1__assessmentDepth", "Full signal analysis");
    setValueIfBlank(data, "primarySignalPlay", "play-1");

    ["buyingTriggerEvents", "fitSignals", "negativeSignalRules", "signalRoutingRules", "signalActionPlan"].forEach((tableId) => {
      const targetTable = signalScopedTable("play-1", tableId);
      if (tableRowsFromData(data, targetTable).some((row) => Object.values(row.values).some(Boolean))) {
        return;
      }
      tableRowsFromData(data, tableId).forEach((row) => {
        Object.entries(row.values).forEach(([field, value]) => {
          setValueIfBlank(data, `${targetTable}__${row.rowId}__${field}`, value);
        });
      });
    });
  }

  const primaryPlay = getPrimarySignalPlayRowId(data);
  if (!String(data.primarySignalPlay || "").trim() && primaryPlay) {
    data.primarySignalPlay = primaryPlay;
  }
}

function readableRowId(rowId) {
  return String(rowId || "")
    .split("-")
    .map((part) => part ? part[0].toUpperCase() + part.slice(1) : "")
    .join(" / ");
}

function migrateRevenueMotionData(data) {
  const hasPortfolio = tableRowsFromData(data, "revenueMotionPortfolio").some((row) => Object.values(row.values).some(Boolean));
  const oldChannelRows = tableRowsFromData(data, "channelPerformance").filter((row) => Object.values(row.values).some(Boolean));
  const oldSalesMotionRows = tableRowsFromData(data, "salesMotionMap").filter((row) => Object.values(row.values).some(Boolean));
  const oldStalledRows = tableRowsFromData(data, "stalledDeals").filter((row) => Object.values(row.values).some(Boolean));
  const hasLegacyRevenue = oldChannelRows.length
    || oldSalesMotionRows.length
    || oldStalledRows.length
    || ["seniorTimeTriggers", "delegateProspectTriggers", "additionalSalesSources"].some((listId) => listValues(data, listId).length)
    || Object.keys(data).some((key) => key.startsWith("opportunitySnapshot__") && String(data[key] || "").trim())
    || ["quickPrimaryRevenueSource", "quickCurrentSalesMotion", "primarySalesMotion"].some((field) => String(data[field] || "").trim());

  setIfBlank("revenueTrackingSystem", "opportunitySnapshot__crm-or-tracking-system-used-today__answer", data);
  setIfBlank("revenueTrackingSystem", "gtmSystems__crm__tools", data);

  if (!hasPortfolio && hasLegacyRevenue) {
    const topChannel = oldChannelRows.find((row) => row.values.revenueRank === "1") || oldChannelRows[0];
    setValueIfBlank(data, "revenueMotionPortfolio__motion-1__playName", "Primary revenue motion");
    setValueIfBlank(data, "revenueMotionPortfolio__motion-1__customerGroup", data.bestFitCustomerGroup || data.priorityIcpForOffer || "Not sure yet");
    setValueIfBlank(data, "revenueMotionPortfolio__motion-1__offer", data.offerBeingAssessed || data.primaryOfferName || "Not sure yet");
    setValueIfBlank(data, "revenueMotionPortfolio__motion-1__channelSource", topChannel ? readableRowId(topChannel.rowId) : data.quickPrimaryRevenueSource);
    setValueIfBlank(data, "revenueMotionPortfolio__motion-1__salesMotionType", data.primarySalesMotion || data.quickCurrentSalesMotion);
    setValueIfBlank(data, "revenueMotionPortfolio__motion-1__primaryBuyer", data.bestFitDecisionMaker || data.primaryBuyerForOffer);
    setValueIfBlank(data, "revenueMotionPortfolio__motion-1__playPriority", "Primary revenue motion");
    setValueIfBlank(data, "revenueMotionPortfolio__motion-1__assessmentDepth", "Full motion analysis");
    setValueIfBlank(data, "primaryRevenueMotion", "motion-1");

    if (topChannel) {
      setValueIfBlank(data, revenueScopedField("motion-1", "channelPerformance", "activeStatus"), topChannel.values.active === "Yes" ? "Active" : topChannel.values.active === "No" ? "Not using yet" : topChannel.values.active);
      setValueIfBlank(data, revenueScopedField("motion-1", "channelPerformance", "currentActivity"), topChannel.values.currentActivity);
      setValueIfBlank(data, revenueScopedField("motion-1", "channelPerformance", "last90DayResults"), topChannel.values.last90DayResults);
      setValueIfBlank(data, revenueScopedField("motion-1", "channelPerformance", "owner"), topChannel.values.owner);
      setValueIfBlank(data, revenueScopedField("motion-1", "channelPerformance", "confidence"), topChannel.values.confidence);
      setValueIfBlank(data, revenueScopedField("motion-1", "channelPerformance", "notesIssues"), topChannel.values.notes);
    }

    oldChannelRows.filter((row) => row !== topChannel).slice(0, 8).forEach((row, index) => {
      const motionId = `motion-${index + 2}`;
      setValueIfBlank(data, `revenueMotionPortfolio__${motionId}__playName`, `${readableRowId(row.rowId)} motion`);
      setValueIfBlank(data, `revenueMotionPortfolio__${motionId}__channelSource`, readableRowId(row.rowId));
      setValueIfBlank(data, `revenueMotionPortfolio__${motionId}__assessmentDepth`, "Summary only");
      setValueIfBlank(data, `revenueMotionPortfolio__${motionId}__playPriority`, "Future");
    });

    setIfBlank(revenueScopedField("motion-1", "pipelineMetrics", "averageDealSize"), "opportunitySnapshot__average-deal-size-contract-value-order-value__answer", data);
    setIfBlank(revenueScopedField("motion-1", "pipelineMetrics", "averageSalesCycle"), "opportunitySnapshot__average-sales-cycle__answer", data);
    setIfBlank(revenueScopedField("motion-1", "pipelineMetrics", "biggestDropoff"), "opportunitySnapshot__most-common-next-step-failure-point__answer", data);

    oldSalesMotionRows.forEach((row, index) => {
      const stageId = `stage-${index + 1}`;
      setValueIfBlank(data, `${revenueScopedTable("motion-1", "conversionStages")}__${stageId}__stageName`, readableRowId(row.rowId));
      setValueIfBlank(data, `${revenueScopedTable("motion-1", "conversionStages")}__${stageId}__owner`, row.values.owner);
      setValueIfBlank(data, `${revenueScopedTable("motion-1", "conversionStages")}__${stageId}__entryCriteria`, row.values.entry);
      setValueIfBlank(data, `${revenueScopedTable("motion-1", "conversionStages")}__${stageId}__exitCriteria`, row.values.exit);
      setValueIfBlank(data, `${revenueScopedTable("motion-1", "conversionStages")}__${stageId}__currentConversion`, row.values.conversion);
      setValueIfBlank(data, `${revenueScopedTable("motion-1", "conversionStages")}__${stageId}__issuesImprovements`, row.values.improvements);
    });

    listValues(data, "seniorTimeTriggers").forEach((value) => {
      const rowId = firstBlankSignalCardId(data, revenueScopedTable("motion-1", "dealRoutingRules"), "routing-rule");
      setValueIfBlank(data, `${revenueScopedTable("motion-1", "dealRoutingRules")}__${rowId}__routingTrigger`, value);
      setValueIfBlank(data, `${revenueScopedTable("motion-1", "dealRoutingRules")}__${rowId}__routingType`, "Senior leadership involved");
    });

    listValues(data, "delegateProspectTriggers").forEach((value) => {
      const rowId = firstBlankSignalCardId(data, revenueScopedTable("motion-1", "dealRoutingRules"), "routing-rule");
      setValueIfBlank(data, `${revenueScopedTable("motion-1", "dealRoutingRules")}__${rowId}__routingTrigger`, value);
      setValueIfBlank(data, `${revenueScopedTable("motion-1", "dealRoutingRules")}__${rowId}__routingType`, "Delegate to team");
    });

    oldStalledRows.forEach((row) => {
      Object.entries(row.values).forEach(([field, value]) => {
        setValueIfBlank(data, `${revenueScopedTable("motion-1", "stalledDeals")}__${row.rowId}__${field}`, value);
      });
    });

    const additionalSources = listValues(data, "additionalSalesSources").join(", ");
    if (additionalSources) {
      setValueIfBlank(data, "revenueInfrastructureNotes", `Other sales sources: ${additionalSources}`);
    }
  }

  const primaryMotion = getPrimaryRevenueMotionRowId(data);
  if (!String(data.primaryRevenueMotion || "").trim() && primaryMotion) {
    data.primaryRevenueMotion = primaryMotion;
  }
}

function normalizeRepeatableData(data) {
  const normalized = { ...data };

  schema.sections.forEach((section) => {
    sectionFields(section).forEach((field) => {
      if (field.type !== "repeatableList" || !normalized[field.id]) {
        return;
      }

      const items = String(normalized[field.id])
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

      items.forEach((item, index) => {
        normalized[`${field.id}__item-${index + 1}`] = item;
      });

      delete normalized[field.id];
    });
  });

  Object.keys(normalized).forEach((key) => {
    const match = key.match(/^valueClaims__(value-claim-\d+)__expectedImprovement$/);
    if (match && !normalized[`valueClaims__${match[1]}__improvement`]) {
      normalized[`valueClaims__${match[1]}__improvement`] = normalized[key];
    }
  });

  if (!normalized["valueClaims__value-claim-1__buyerLanguage"] && normalized.economicValue) {
    normalized["valueClaims__value-claim-1__buyerLanguage"] = normalized.economicValue;
  }

  if (!normalized["valueClaims__value-claim-1__beforeState"] && normalized.beforeAfter) {
    normalized["valueClaims__value-claim-1__beforeState"] = normalized.beforeAfter;
  }

  if (!normalized["valueClaims__value-claim-1__beforeState"]) {
    const legacyBefore = Object.entries(normalized).find(([key, value]) => key.startsWith("beforeAfterTransformation__") && key.endsWith("__before") && value);
    if (legacyBefore) {
      normalized["valueClaims__value-claim-1__beforeState"] = legacyBefore[1];
    }
  }

  if (!normalized["valueClaims__value-claim-1__afterState"]) {
    const legacyAfter = Object.entries(normalized).find(([key, value]) => key.startsWith("beforeAfterTransformation__") && key.endsWith("__after") && value);
    if (legacyAfter) {
      normalized["valueClaims__value-claim-1__afterState"] = legacyAfter[1];
    }
  }

  if (!normalized.quickStopAvoid) {
    const avoid = Object.entries(normalized).find(([key, value]) => key.startsWith("avoidSegments__item-") && value);
    if (avoid) {
      normalized.quickStopAvoid = avoid[1];
    }
  }

  if (!normalized.quickPrimaryRevenueSource) {
    const rankedChannel = Object.entries(normalized).find(([key, value]) => key.startsWith("salesActivityRevenueRank__") && key.endsWith("__rank") && value === "1");
    if (rankedChannel) {
      const rowId = rankedChannel[0].replace("salesActivityRevenueRank__", "").replace("__rank", "");
      normalized.quickPrimaryRevenueSource = rowId.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    }
  }

  if (!normalized.quickBiggestConstraint) {
    const constraint = normalized["topConstraints__1__constraint"] || normalized["topConstraints__top-constraint-1__constraint"];
    const allowed = ["Focus", "ICP clarity", "Messaging", "Proof", "Budget", "Team capacity", "Sales process", "Channel access", "Data quality", "Product readiness", "Implementation capacity", "Technology / systems", "Other"];
    if (allowed.includes(constraint)) {
      normalized.quickBiggestConstraint = constraint;
    }
  }

  normalizeLegacyIcpData(normalized);
  normalizeLegacyGoalData(normalized);
  migrateTractionData(normalized);
  migratePersonaData(normalized);
  migrateOfferData(normalized);
  migrateSignalData(normalized);
  migrateRevenueMotionData(normalized);
  applyOfferGeneratedFields(normalized);

  return normalized;
}

function saveDraft(showStatus = true) {
  const data = getFormData();

  if (!hasMeaningfulData(data)) {
    if (showStatus) {
      document.getElementById("saveStatus").textContent = "Nothing to save yet.";
    }
    return;
  }

  const records = readRecords();
  const now = new Date().toISOString();
  const existing = currentRecord(records);
  let savedRecord;

  if (existing) {
    existing.name = recordName(data, existing.name);
    existing.data = data;
    existing.updatedAt = now;
    savedRecord = existing;
  } else {
    const record = {
      id: createRecordId(),
      name: recordName(data),
      data,
      createdAt: now,
      updatedAt: now
    };
    records.push(record);
    setActiveRecordId(record.id);
    savedRecord = record;
  }

  writeRecords(records);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderBrandPicker();
  updateResultsLink();
  saveRecordToBackend(savedRecord);

  if (showStatus) {
    document.getElementById("saveStatus").textContent = "Company saved.";
  }
}

function autosaveDraft() {
  const data = getFormData();

  if (!hasMeaningfulData(data)) {
    return;
  }

  const signature = JSON.stringify(data);

  if (signature === lastAutosaveSignature) {
    return;
  }

  lastAutosaveSignature = signature;
  saveDraft(false);
  document.getElementById("saveStatus").textContent = `Autosaved ${new Date().toLocaleTimeString()}.`;
}

function scheduleAutosave() {
  window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(autosaveDraft, 5000);
}

function refreshIntakeUi(options = {}) {
  if (options.refreshPanels) {
    renderOfferAssessmentPanels();
    renderSignalPlayAssessmentPanels();
    renderRevenueMotionAssessmentPanels();
  }

  updateScoreTotals();
  updateOfferReadinessSummary();
  updateSignalReadinessSummary();
  updateRevenueMotionSummary();
  updateBestFitCustomerOptions();
  updateSuccessFocusFields();
}

function scheduleIntakeUiRefresh(options = {}) {
  pendingIntakePanelRefresh = pendingIntakePanelRefresh || Boolean(options.refreshPanels);
  window.clearTimeout(intakeUiRefreshTimer);
  intakeUiRefreshTimer = window.setTimeout(() => {
    refreshIntakeUi({ refreshPanels: pendingIntakePanelRefresh });
    pendingIntakePanelRefresh = false;
  }, 300);
}

function startBlankCompany() {
  const data = getFormData();

  if (hasMeaningfulData(data)) {
    saveDraft(false);
  }

  setActiveRecordId("");
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = "index.html";
}

function clearCurrentForm() {
  if (!window.confirm("Clear form may result in loss of data.. Do you wish to proceed?")) {
    return;
  }

  setActiveRecordId("");
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = "index.html";
}

function updateScoreTotals() {
  document.querySelectorAll("[data-total-for]").forEach((output) => {
    const row = output.dataset.totalFor;
    const selects = document.querySelectorAll(`[name*="__${row}__"]`);
    let total = 0;

    selects.forEach((select) => {
      const value = Number.parseInt(select.value, 10);
      if (Number.isFinite(value)) {
        total += value;
      }
    });

    output.textContent = String(total);
  });
}

function strongestCustomerGroup(data) {
  const groups = customerGroupRows(data)
    .map((row) => ({
      ...row,
      score: Number.parseInt(row.values.segmentFitScore, 10) || 0
    }))
    .filter((row) => row.values.groupName && row.score > 0)
    .sort((first, second) => second.score - first.score);

  if (!groups.length) {
    return null;
  }

  if (groups.length > 1 && groups[0].score === groups[1].score) {
    return null;
  }

  return groups[0];
}

function updateBestFitSuggestion(data = getFormData()) {
  const select = document.querySelector("[name='bestFitCustomerGroup']");

  if (!select) {
    return;
  }

  let note = document.getElementById("bestFitSuggestion");
  if (!note) {
    note = document.createElement("div");
    note.id = "bestFitSuggestion";
    note.className = "suggested-best-fit";
    select.closest(".full, div")?.insertAdjacentElement("afterend", note);
  }

  const strongest = strongestCustomerGroup(data);
  note.hidden = !strongest || Boolean(select.value);
  if (strongest && !select.value) {
    note.textContent = `Suggested best-fit group: ${strongest.values.groupName} (${strongest.values.segmentFitScore}/15).`;
  }
}

function updateBestFitCustomerOptions() {
  const select = document.querySelector("[name='bestFitCustomerGroup']");

  if (!select) {
    return;
  }

  updateDynamicOptionFields();
  updateBestFitSuggestion();
}

function updateSuccessFocusFields() {
  const mappings = {
    "successLooksLike__30-days__primaryFocus": "goal30",
    "successLooksLike__60-days__primaryFocus": "goal60",
    "successLooksLike__90-days__primaryFocus": "goal90"
  };

  Object.entries(mappings).forEach(([targetName, sourceName]) => {
    const target = document.querySelector(`[name="${CSS.escape(targetName)}"]`);
    const source = document.querySelector(`[name="${CSS.escape(sourceName)}"]`);

    if (target && source && source.value && !String(target.value || "").trim()) {
      target.value = source.value;
    }
  });
}

function maybePrefillBestFitProfile() {
  const select = document.querySelector("[name='bestFitCustomerGroup']");

  if (!select || !select.value || select.value === "Not sure yet") {
    updateBestFitSuggestion();
    return;
  }

  const data = getFormData();
  const row = customerGroupRows(data).find((item) => item.values.groupName === select.value);

  if (!row) {
    updateBestFitSuggestion(data);
    return;
  }

  const fieldMap = {
    bestFitPrimaryPain: row.values.problem,
    bestFitTrigger: row.values.whyNow,
    bestFitEvidence: [row.values.segmentFitRecommendation, row.values.notesEvidence].filter(Boolean).join(" - ")
  };

  Object.entries(fieldMap).forEach(([fieldName, value]) => {
    const input = document.querySelector(`[name="${CSS.escape(fieldName)}"]`);
    if (input && !String(input.value || "").trim() && value) {
      input.value = value;
    }
  });

  updateBestFitSuggestion(data);
}

function missingScoreFields() {
  const data = getFormData();
  return schema.scoreFields.filter((fieldId) => !String(data[fieldId] || "").trim());
}

function sectionForField(fieldId) {
  return schema.sections.find((section) => sectionFields(section).some((field) => field.id === fieldId));
}

function parsePositiveMoneyValue(value) {
  const amount = Number.parseFloat(String(value || "").replace(/[$,\s]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function validateNumericRevenueTargets() {
  const data = getFormData();
  const requiredTargets = [];

  if (data.quick90DayGoal === "Revenue" && !parsePositiveMoneyValue(data.quick90DayRevenueTarget)) {
    requiredTargets.push({
      fieldId: "quick90DayRevenueTarget",
      label: "90-day revenue target in GTM Information"
    });
  }

  if (data.goal90 === "Revenue" && !parsePositiveMoneyValue(data.goal90RevenueTarget)) {
    requiredTargets.push({
      fieldId: "goal90RevenueTarget",
      label: "90-day revenue target in Revenue Goals"
    });
  }

  if (!requiredTargets.length) {
    return true;
  }

  const status = document.getElementById("saveStatus");
  status.innerHTML = "";
  const intro = document.createElement("span");
  intro.textContent = "Revenue is selected as a 90-day goal, so add a numeric ";
  status.appendChild(intro);

  requiredTargets.forEach((target, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "inline-link";
    button.textContent = target.label;
    button.addEventListener("click", () => {
      const section = sectionForField(target.fieldId);
      if (section) {
        switchActiveSection(section.id);
      }
      window.setTimeout(() => {
        updateConditionalFields();
        const input = document.querySelector(`[name="${CSS.escape(target.fieldId)}"]`);
        if (input) {
          input.scrollIntoView({ behavior: "smooth", block: "center" });
          input.focus();
        }
      }, 50);
    });
    status.appendChild(button);
    if (index < requiredTargets.length - 1) {
      status.appendChild(document.createTextNode(", "));
    }
  });

  const firstSection = sectionForField(requiredTargets[0].fieldId);
  if (firstSection) {
    switchActiveSection(firstSection.id);
  }
  return false;
}

function validateReadinessScores() {
  const missing = missingScoreFields();

  if (!missing.length) {
    return true;
  }

  const status = document.getElementById("saveStatus");
  status.innerHTML = "";
  const intro = document.createElement("span");
  intro.textContent = "You still need: ";
  status.appendChild(intro);

  missing.forEach((fieldId, index) => {
    const field = findField(fieldId);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "inline-link";
    button.textContent = field?.label || fieldId;
    button.addEventListener("click", () => {
      const section = sectionForField(fieldId);
      if (section) {
        switchActiveSection(section.id);
      }
      window.setTimeout(() => {
        const input = document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
        if (input) {
          input.scrollIntoView({ behavior: "smooth", block: "center" });
          input.focus();
        }
      }, 50);
    });
    status.appendChild(button);
    if (index < missing.length - 1) {
      status.appendChild(document.createTextNode(", "));
    }
  });

  const firstSection = sectionForField(missing[0]);
  if (firstSection) {
    switchActiveSection(firstSection.id);
  }
  return false;
}

function showIcpGuidanceIfEmpty(mode = currentReportMode) {
  if (mode !== "detailed") {
    return;
  }

  const data = getFormData();
  const hasCustomerFocus = data.bestFitCustomerGroup
    || data.bestFitPrimaryPain
    || data["possibleCustomerGroups__customer-group-1__groupName"]
    || data["possibleCustomerGroups__customer-group-1__problem"];

  if (!hasCustomerFocus) {
    document.getElementById("saveStatus").textContent = "Add at least one customer group or best-fit customer so the GTM plan can include ICP guidance.";
  }
}

function submitIntake(mode = "detailed") {
  currentReportMode = mode === "quick" ? "quick" : "detailed";

  if (!validateReadinessScores()) {
    return;
  }

  if (!validateNumericRevenueTargets()) {
    return;
  }

  showIcpGuidanceIfEmpty(currentReportMode);
  saveDraft(false);
  window.location.href = resultsUrl();
}

function showDetailedSections() {
  const data = getFormData();
  currentReportMode = "detailed";
  detailedSectionsVisible = true;
  activeSectionId = firstDetailedSectionId();
  renderSections();
  updateDetailedActionBar();
  setFormData(normalizeRepeatableData(data));
  renderOfferAssessmentPanels();
  renderSignalPlayAssessmentPanels();
  renderRevenueMotionAssessmentPanels();
  updateConditionalFields();
  refreshIntakeUi();
  updateDetailedActionBar();
  document.getElementById("saveStatus").textContent = "Detailed sections are now available below.";
  const active = document.getElementById(activeSectionId);
  if (active) {
    active.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function applyIncomingImprovementFocus() {
  const focus = currentImprovementFocus();

  if (!focus) {
    return;
  }

  const targetSection = schema.sections.find((section) => section.id === focus.sectionId && !section.hidden && !section.deprecated);

  if (!targetSection) {
    localStorage.removeItem(IMPROVEMENT_FOCUS_KEY);
    return;
  }

  const data = getFormData();
  currentReportMode = "detailed";
  detailedSectionsVisible = true;
  activeSectionId = targetSection.id;
  renderSections();
  setFormData(data);
  renderOfferAssessmentPanels();
  renderSignalPlayAssessmentPanels();
  renderRevenueMotionAssessmentPanels();
  updateConditionalFields();
  refreshIntakeUi();
  updateDetailedActionBar();

  const status = document.getElementById("saveStatus");
  if (status) {
    status.textContent = `Improvement focus loaded: ${focus.area || targetSection.title}.`;
  }

  window.setTimeout(() => {
    const active = document.getElementById(activeSectionId);
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 50);
}

function updateDetailedActionBar() {
  const actionBar = document.getElementById("mainDetailedActions");

  if (actionBar) {
    actionBar.hidden = !detailedSectionsVisible;
  }
}

function firstFilledTableRow(data, tableId, predicate) {
  const rowIds = new Set();

  Object.keys(data || {}).forEach((key) => {
    const match = key.match(new RegExp(`^${tableId}__(.+?)__`));
    if (match) {
      rowIds.add(match[1]);
    }
  });

  return Array.from(rowIds)
    .sort((first, second) => first.localeCompare(second))
    .map((rowId) => ({
      rowId,
      label: String(data[`${tableId}__${rowId}__label`] || "").trim(),
      values: Object.fromEntries(
        Object.entries(data)
          .filter(([key]) => key.startsWith(`${tableId}__${rowId}__`))
          .map(([key, value]) => [key.replace(`${tableId}__${rowId}__`, ""), value])
      )
    }))
    .find(predicate);
}

function offerScopedValue(data, rowId, fieldId, fallback = "") {
  return rowId ? (data[scopedOfferField(rowId, fieldId)] || fallback) : fallback;
}

function firstOfferValueClaim(data, rowId = null) {
  const tableId = rowId ? scopedOfferTable(rowId, "valueClaims") : "valueClaims";
  return firstFilledTableRow(data, tableId, (item) => item.values.outcome || item.values.metric || item.values.improvement || item.values.buyerLanguage);
}

function firstValueClaimOutcome(data, rowId = null) {
  const row = firstOfferValueClaim(data, rowId);
  return row ? [row.values.outcome, row.values.metric].filter(Boolean).join(" measured by ") : "";
}

function offerPromiseSummary(data, rowId = null) {
  const offerRow = rowId ? offerPortfolioRows(data).find((row) => row.rowId === rowId) : primaryOfferRow(data);
  const scopedPromise = rowId ? data[scopedOfferField(rowId, "oneSentencePromise")] : "";

  if (scopedPromise || data.oneSentencePromise) {
    return scopedPromise || data.oneSentencePromise;
  }

  const target = offerRow?.values.newOfferCustomerGroup || offerRow?.values.targetCustomerGroup || data.priorityIcpForOffer || data.offerTargetSegment || "the priority buyer";
  const buyer = offerRow?.values.primaryBuyer || data.primaryBuyerForOffer || data.primaryBuyer || "the buyer";
  const problem = offerScopedValue(data, offerRow?.rowId, "offerBuyerProblem", data.offerBuyerProblem || data.urgentBuyerProblem || data.offerCostOfInaction || data.costOfInaction || data.offerCurrentWorkaround || data.currentWorkaround || "the urgent problem");
  const outcome = firstValueClaimOutcome(data, offerRow?.rowId) || "a measurable outcome";

  return `For ${target}, we help ${buyer} address ${problem} and achieve ${outcome}.`;
}

function pricingConfidenceSummary(data, rowId = null) {
  const signals = [
    offerScopedValue(data, rowId, "pricingModel", data.pricingModel),
    offerScopedValue(data, rowId, "isPricingPublic", data.isPricingPublic || data.pricingPublic),
    offerScopedValue(data, rowId, "minimumDealSize", data.minimumDealSize || data.minimumViableDealSize),
    offerScopedValue(data, rowId, "averageExpectedDealSize", data.averageExpectedDealSize),
    offerScopedValue(data, rowId, "buyerApprovalLevel", data.buyerApprovalLevel)
  ].filter(Boolean).length;

  if (signals >= 4) {
    return "High";
  }

  if (signals >= 2) {
    return "Medium";
  }

  return "Low";
}

function proofSummary(row) {
  if (!row) {
    return "";
  }

  return [row.label, row.values.proofType, row.values.assetSource].filter(Boolean).join(" - ");
}

function scoreFromChoice(value, choices) {
  const text = String(value || "").toLowerCase();
  const match = choices.find(([pattern]) => pattern.test(text));
  return match ? match[1] : 0;
}

function offerReadinessDimensions(data, rowId = null) {
  const activeRowId = rowId || primaryOfferRow(data)?.rowId || null;
  const valueTableId = activeRowId ? scopedOfferTable(activeRowId, "valueClaims") : "valueClaims";
  const proofTableId = activeRowId ? scopedOfferTable(activeRowId, "proofReadiness") : "proofReadiness";
  const firstValueClaim = firstFilledTableRow(data, valueTableId, (row) => (
    row.values.outcome && (row.values.metric || row.values.improvement || row.values.buyerLanguage)
  ));
  const proofRows = tableRowsFromData(data, proofTableId).filter((row) => (
    row.values.claim || row.values.proofType || row.values.assetExists || row.values.strength || row.values.gapNextAction
  ));
  const proofScore = proofRows.some((row) => /repeatable|strong|measured|high/i.test(row.values.strength || "") || row.values.assetExists === "Yes")
    ? 5
    : proofRows.some((row) => /customer|anecdotal|partially|medium/i.test(`${row.values.strength || ""} ${row.values.assetExists || ""}`))
      ? 3
      : proofRows.length
        ? 2
        : 0;

  return [
    {
      name: "ICP-offer alignment",
      score: scoreFromChoice(offerScopedValue(data, activeRowId, "icpOfferAlignment", data.icpOfferAlignment), [[/validated/, 5], [/urgent problem/, 4], [/relevant/, 3], [/unvalidated/, 2], [/not clear/, 1]]),
      nextMove: "Clarify the priority customer group this offer is built for."
    },
    {
      name: "Problem urgency",
      score: Math.max(
        scoreFromChoice(offerScopedValue(data, activeRowId, "offerUrgencyLevel", data.offerUrgencyLevel || data.urgencyLevel), [[/critical/, 5], [/high/, 4], [/medium/, 3], [/low/, 2]]),
        offerScopedValue(data, activeRowId, "offerBuyerProblem", data.offerBuyerProblem)
          && offerScopedValue(data, activeRowId, "offerTriggerEvent", data.offerTriggerEvent)
          && offerScopedValue(data, activeRowId, "offerCostOfInaction", data.offerCostOfInaction)
          ? 3
          : 0
      ),
      nextMove: "Tighten the buyer problem, trigger, cost of inaction, and urgency evidence."
    },
    {
      name: "Measurable value",
      score: firstValueClaim ? (firstValueClaim.values.proofStrength ? 4 : 3) : 0,
      nextMove: "Define at least one measurable value claim with metric, baseline, improvement, and timeframe."
    },
    {
      name: "Promise and positioning",
      score: Math.max(
        scoreFromChoice(offerScopedValue(data, activeRowId, "promiseClarityRating", data.promiseClarityRating), [[/proof-backed|differentiated/, 5], [/specific/, 4], [/generic/, 2], [/unclear/, 1]]),
        offerScopedValue(data, activeRowId, "oneSentencePromise", data.oneSentencePromise)
          && offerScopedValue(data, activeRowId, "offerDifferentiator", data.offerDifferentiator)
          ? 3
          : 0
      ),
      nextMove: "Write the offer promise and differentiator in buyer-facing language."
    },
    {
      name: "Buying path",
      score: Math.max(
        scoreFromChoice(offerScopedValue(data, activeRowId, "buyingPathClarityRating", data.buyingPathClarityRating), [[/conversion path/, 5], [/requirements/, 4], [/buyer requirements are unclear/, 3], [/vague/, 2], [/no clear/, 1]]),
        offerScopedValue(data, activeRowId, "firstUseCaseForOffer", data.firstUseCaseForOffer)
          && offerScopedValue(data, activeRowId, "easiestNextStep", data.easiestNextStep)
          ? 3
          : 0
      ),
      nextMove: "Define the first use case and easiest next step for the buyer."
    },
    {
      name: "Packaging and pricing",
      score: Math.max(
        scoreFromChoice(offerScopedValue(data, activeRowId, "packagingClarityRating", data.packagingClarityRating), [[/validated|repeatable/, 5], [/entry, core, and expansion/, 4], [/defined/, 3], [/custom/, 2], [/not packaged/, 1]]),
        pricingConfidenceSummary(data, activeRowId) === "High" ? 4 : pricingConfidenceSummary(data, activeRowId) === "Medium" ? 3 : 0
      ),
      nextMove: "Clarify entry, core, and expansion packages plus price range and approval level."
    },
    {
      name: "Proof readiness",
      score: proofScore,
      nextMove: "Attach proof to the claims buyers must believe before they buy."
    },
    {
      name: "Risk reduction",
      score: (
        offerScopedValue(data, activeRowId, "buyerAlternativesToday", data.alternatives)
        && firstFilledTableRow(data, activeRowId ? scopedOfferTable(activeRowId, "objectionHandling") : "objectionHandling", (row) => row.values.bestResponse || row.values.proofAssetNeeded)
      ) ? 4 : offerScopedValue(data, activeRowId, "offerObjections", data.objections) ? 2 : 0,
      nextMove: "Map alternatives and objections to responses and proof assets."
    }
  ];
}

function offerReadinessSnapshot(data, rowId = null) {
  const dimensions = offerReadinessDimensions(data, rowId);
  const scored = dimensions.filter((item) => item.score > 0);
  const score = scored.length
    ? Math.round((scored.reduce((sum, item) => sum + item.score, 0) / (dimensions.length * 5)) * 100)
    : 0;
  const stage = score >= 80
    ? "Ready to sell"
    : score >= 60
      ? "Ready for focused testing"
      : score >= 35
        ? "Needs offer definition"
        : "Underbuilt";
  const confidence = scored.length >= 7
    ? "High"
    : scored.length >= 4
      ? "Medium"
      : "Low";
  const strengths = dimensions
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.name);
  const gaps = dimensions
    .filter((item) => item.score <= 2)
    .sort((a, b) => a.score - b.score)
    .map((item) => item.name);
  const nextMoves = dimensions
    .filter((item) => item.score <= 2)
    .slice(0, 3)
    .map((item) => item.nextMove);

  return {
    score,
    stage,
    confidence,
    strengths,
    gaps,
    nextMoves,
    dimensions
  };
}

function updateOfferReadinessSummary() {
  const card = document.getElementById("offerReadinessSummaryCard");

  if (!card) {
    return;
  }

  const data = getFormData();
  const primary = primaryOfferRow(data);
  const primaryRowId = primary?.rowId || null;
  const snapshot = offerReadinessSnapshot(data, primaryRowId);
  const assessedOffers = offerPortfolioRows(data).filter((row) => row.values.assessmentDepth === "Full readiness analysis");
  const summaryOffers = offerPortfolioRows(data).filter((row) => row.values.assessmentDepth !== "Full readiness analysis");
  const values = {
    offerAssessed: primary ? offerDisplayName(primary, offerPortfolioRows(data).indexOf(primary)) : data.offerBeingAssessed,
    priorityIcp: primary?.values.newOfferCustomerGroup || primary?.values.targetCustomerGroup || data.priorityIcpForOffer || data.offerTargetSegment,
    targetBuyer: primary?.values.primaryBuyer || data.primaryBuyerForOffer || data.primaryBuyer,
    score: assessedOffers.length ? `${snapshot.score}/100 for primary offer` : "No full assessments yet",
    stage: snapshot.stage,
    confidence: snapshot.confidence,
    strengths: assessedOffers.length ? snapshot.strengths.join(", ") : `${offerPortfolioRows(data).length} portfolio offer(s) listed`,
    gaps: snapshot.gaps.join(", "),
    nextMoves: snapshot.nextMoves.join(" ")
  };

  Object.entries(values).forEach(([key, value]) => {
    const node = card.querySelector(`[data-summary-value="${key}"]`);

    if (node) {
      node.textContent = value || "Not filled yet";
    }
  });

  document.querySelectorAll("[data-offer-snapshot-for]").forEach((card) => {
    const rowId = card.dataset.offerSnapshotFor;
    const offerSnapshot = offerReadinessSnapshot(data, rowId);
    const cardValues = {
      score: `${offerSnapshot.score}/100`,
      stage: offerSnapshot.stage,
      confidence: offerSnapshot.confidence,
      strengths: offerSnapshot.strengths.join(", "),
      gaps: offerSnapshot.gaps.join(", "),
      nextMoves: offerSnapshot.nextMoves.join(" ")
    };

    Object.entries(cardValues).forEach(([key, value]) => {
      const node = card.querySelector(`[data-offer-assessment-value="${key}"]`);
      if (node) {
        node.textContent = value || "Not filled yet";
      }
    });
  });
}

function signalReadinessDimensions(data, playRowId = null) {
  const tableId = (id) => playRowId ? signalScopedTable(playRowId, id) : id;
  const triggers = tableRowsFromData(data, tableId("buyingTriggerEvents")).filter((row) => row.values.triggerEvent || row.values.whyUrgent || row.values.howObserved);
  const fitSignals = tableRowsFromData(data, tableId("fitSignals")).filter((row) => row.values.signal || row.values.signalCategory);
  const negativeSignals = tableRowsFromData(data, tableId("negativeSignalRules")).filter((row) => row.values.negativeSignal || row.values.notes);
  const sourceRows = tableRowsFromData(data, "signalDataSourceReadiness").filter((row) => row.values.source || row.values.availableToday || row.values.owner);
  const routingRules = tableRowsFromData(data, tableId("signalRoutingRules")).filter((row) => row.values.signal || row.values.scoreImpact || row.values.recommendedAction);
  const actionRows = tableRowsFromData(data, tableId("signalActionPlan")).filter((row) => row.values.highPrioritySignal || row.values.outreachAngle || row.values.channel);
  const triggerScore = !triggers.length
    ? 1
    : triggers.some((row) => row.values.priority === "High" && row.values.buyerProblem && row.values.source)
      ? 5
      : triggers.some((row) => row.values.source && row.values.timingWindow)
        ? 4
        : triggers.some((row) => row.values.whyUrgent)
          ? 3
          : 2;
  const fitCategories = new Set(fitSignals.map((row) => row.values.signalCategory).filter(Boolean));
  const fitScore = !fitSignals.length
    ? 1
    : ["Company fit", "Buyer fit", "Use-case fit"].every((category) => fitCategories.has(category))
      ? 5
      : fitSignals.some((row) => row.values.visibility && row.values.source)
        ? 4
        : fitSignals.some((row) => row.values.signalCategory)
          ? 3
          : 2;
  const negativeScore = !negativeSignals.length
    ? 1
    : negativeSignals.some((row) => row.values.action && row.values.whyItMatters)
      ? 5
      : negativeSignals.some((row) => row.values.action)
        ? 4
        : negativeSignals.some((row) => row.values.whyItMatters)
          ? 3
          : 2;
  const sourceScore = !data.signalDataSources
    ? 1
    : !sourceRows.length
      ? 2
      : sourceRows.some((row) => row.values.availableToday === "Yes" && row.values.owner && row.values.reliability === "High" && row.values.collectionMethod)
        ? 5
        : sourceRows.some((row) => row.values.availableToday === "Yes" && row.values.owner)
          ? 4
          : sourceRows.some((row) => row.values.availableToday === "Yes" || row.values.availableToday === "Partial")
            ? 3
            : 2;
  const routingTypes = new Set(routingRules.map((row) => row.values.signalType).filter(Boolean));
  const routingScore = !routingRules.length
    ? 1
    : ["Trigger", "Fit", "Negative"].every((type) => routingTypes.has(type))
      ? 5
      : routingRules.some((row) => row.values.recommendedAction && row.values.owner)
        ? 4
        : routingRules.some((row) => row.values.scoreImpact)
          ? 3
          : 2;
  const actionScore = !actionRows.length
    ? 1
    : actionRows.some((row) => row.values.highPrioritySignal && row.values.outreachAngle && row.values.channel && row.values.buyerPersona && row.values.proofOrAsset && row.values.followUpAction)
      ? 5
      : actionRows.some((row) => row.values.channel && row.values.buyerPersona && (row.values.proofOrAsset || row.values.firstMessageIdea))
        ? 4
        : actionRows.some((row) => row.values.channel || row.values.buyerPersona)
          ? 3
          : 2;

  return [
    { name: "Trigger clarity", score: triggerScore, nextMove: "Define the top 3 buying trigger events for the priority ICP and connect each to a buyer problem." },
    { name: "Fit signal clarity", score: fitScore, nextMove: "Define company, buyer, and use-case fit signals that can be observed in public or internal data." },
    { name: "Negative signal clarity", score: negativeScore, nextMove: "Add negative signals from ICP disqualification rules and delivery risks." },
    { name: "Data source availability", score: sourceScore, nextMove: "Assign owners for CRM, LinkedIn, enrichment, website analytics, and other key signal sources." },
    { name: "Scoring / routing readiness", score: routingScore, nextMove: "Create scoring and routing rules for trigger, fit, and negative signals." },
    { name: "Signal-based action readiness", score: actionScore, nextMove: "Build one outreach play for the highest-priority trigger, including persona, message, channel, proof asset, and follow-up." }
  ];
}

function signalReadinessSnapshot(data, playRowId = null) {
  const activePlayRowId = playRowId || getPrimarySignalPlayRowId(data);
  const dimensions = signalReadinessDimensions(data, activePlayRowId);
  const score = Math.round((dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length) * 20);
  const stage = score >= 82
    ? "Signal strategy operational"
    : score >= 66
      ? "Signal strategy usable"
      : score >= 46
        ? "Signal foundation needed"
        : "Signal strategy unclear";
  const activePlay = getSignalPlayRows(data).find((row) => row.rowId === activePlayRowId);
  const contextReady = activePlay
    ? activePlay.values.customerGroup && activePlay.values.customerGroup !== "Not sure yet" && activePlay.values.primaryBuyerPersona
    : data.signalPriorityIcp && data.signalPriorityIcp !== "Not sure yet" && data.signalPrimaryBuyer;
  const hasSources = Boolean(data.signalDataSources);
  const tableId = (id) => activePlayRowId ? signalScopedTable(activePlayRowId, id) : id;
  const hasActions = tableRowsFromData(data, tableId("signalRoutingRules")).some((row) => row.values.recommendedAction)
    && tableRowsFromData(data, tableId("signalActionPlan")).some((row) => row.values.highPrioritySignal || row.values.outreachAngle);
  const confidence = contextReady && hasSources && hasActions
    ? "High"
    : contextReady && hasSources
      ? "Medium"
      : "Low";
  const strengths = dimensions.filter((item) => item.score >= 4).sort((a, b) => b.score - a.score).map((item) => item.name);
  const gaps = dimensions.filter((item) => item.score <= 2).sort((a, b) => a.score - b.score).map((item) => item.name);
  const nextMoves = dimensions.filter((item) => item.score <= 2).slice(0, 3).map((item) => item.nextMove);

  return { score, stage, confidence, strengths, gaps, nextMoves, dimensions, playRowId: activePlayRowId };
}

function updateSignalReadinessSummary() {
  const card = document.getElementById("signalReadinessSummaryCard");

  if (!card) {
    return;
  }

  const data = getFormData();
  const plays = getSignalPlayRows(data);
  const fullPlays = plays.filter((row) => row.values.assessmentDepth === "Full signal analysis");
  const summaryOnly = plays.filter((row) => row.values.assessmentDepth !== "Full signal analysis");
  const primaryRowId = getPrimarySignalPlayRowId(data);
  const snapshot = signalReadinessSnapshot(data, primaryRowId);
  const scoredPlays = fullPlays.map((row, index) => ({
    row,
    label: getSignalPlayLabel(data, row.rowId, index),
    snapshot: signalReadinessSnapshot(data, row.rowId)
  })).sort((first, second) => second.snapshot.score - first.snapshot.score);
  const highest = scoredPlays[0];
  const lowest = scoredPlays[scoredPlays.length - 1];
  const values = {
    plays: String(plays.length || 0),
    fullAnalyses: String(fullPlays.length || 0),
    primaryPlay: primaryRowId ? getSignalPlayLabel(data, primaryRowId) : "",
    score: fullPlays.length ? `${snapshot.score}/100 for primary play` : "No full signal analyses yet",
    stage: snapshot.stage,
    confidence: snapshot.confidence,
    highest: highest ? `${highest.label}: ${highest.snapshot.score}/100` : "",
    lowest: lowest ? `${lowest.label}: ${lowest.snapshot.score}/100` : "",
    summaryOnly: summaryOnly.map((row, index) => getSignalPlayLabel(data, row.rowId, index)).join(", "),
    strengths: snapshot.strengths.join(", "),
    gaps: snapshot.gaps.join(", "),
    nextMoves: snapshot.nextMoves.join(" ")
  };

  Object.entries(values).forEach(([key, value]) => {
    const node = card.querySelector(`[data-signal-summary-value="${key}"]`);
    if (node) {
      node.textContent = value || "Not filled yet";
    }
  });

  document.querySelectorAll("[data-signal-snapshot-for]").forEach((snapshotCard) => {
    const rowId = snapshotCard.dataset.signalSnapshotFor;
    const playSnapshot = signalReadinessSnapshot(data, rowId);
    const cardValues = {
      score: `${playSnapshot.score}/100`,
      stage: playSnapshot.stage,
      confidence: playSnapshot.confidence,
      strengths: playSnapshot.strengths.join(", "),
      gaps: playSnapshot.gaps.join(", "),
      nextMoves: playSnapshot.nextMoves.join(" ")
    };

    Object.entries(cardValues).forEach(([key, value]) => {
      const node = snapshotCard.querySelector(`[data-signal-assessment-value="${key}"]`);
      if (node) {
        node.textContent = value || "Not filled yet";
      }
    });
  });
}

function nonEmptyFieldSummary(data) {
  return Object.entries(data || {})
    .filter(([, value]) => String(value || "").trim())
    .map(([key, value]) => `- ${key}: ${String(value).trim()}`)
    .join("\n");
}

function buildResearchPrompt(companyName, website) {
  const currentData = getFormData();
  const currentFields = nonEmptyFieldSummary(currentData);
  const target = companyName || website;

  return [
    `Research ${target} for a GTM readiness intake.`,
    "",
    "Use public sources only: company website, product pages, pricing pages, demo/contact pages, resource pages, LinkedIn, visible social profiles, directories, review sites, marketplaces, and public news or announcements.",
    "",
    "Do not invent facts. If something is unclear, write \"Not found\" or \"Inferred\" and explain briefly. Include source URLs for important claims.",
    "",
    "Return the results in this exact paste-friendly format:",
    "",
    "PUBLIC PRESENCE TABLE",
    "Item | URL(s) | Notes / owner / status",
    "Primary website |  | ",
    "Product / solution pages |  | ",
    "Pricing page |  | ",
    "Demo / contact / booking page |  | ",
    "Blog / resources / learning center |  | ",
    "LinkedIn company page |  | ",
    "Founder / executive profiles |  | ",
    "X / Twitter |  | ",
    "Facebook |  | ",
    "Instagram |  | ",
    "TikTok |  | ",
    "YouTube / video channel |  | ",
    "Podcast / webinar series |  | ",
    "Community / forum / group |  | ",
    "Review profiles or ratings sites |  | ",
    "Marketplace or directory listings |  | ",
    "Other important public pages |  | ",
    "",
    "INTAKE FIELD SUGGESTIONS",
    "Field label | Suggested value | Source URL or evidence",
    "Company name |  | ",
    "Primary website URL |  | ",
    "Business model |  | ",
    "Primary geography / markets served |  | ",
    "Company stage |  | ",
    "Current annual revenue |  | ",
    "Main growth constraint today |  | ",
    "Ideal customer profile clues |  | ",
    "Buyer roles / likely decision makers |  | ",
    "Who this offer is for |  | ",
    "Primary buyer / budget owner |  | ",
    "Urgent buyer problem |  | ",
    "Trigger event / why now |  | ",
    "Current workaround |  | ",
    "Cost of inaction |  | ",
    "Measurable buyer value |  | ",
    "One-sentence offer promise |  | ",
    "First use case to sell |  | ",
    "Recommended next step / CTA |  | ",
    "Packaging and pricing signals |  | ",
    "Pilot plan signals |  | ",
    "Proof assets / case studies / testimonials |  | ",
    "Likely proof gaps |  | ",
    "Most likely sales objections |  | ",
    "Sales channels / acquisition channels |  | ",
    "Competitors or alternatives |  | ",
    "Named competitors and perceived differentiators |  | ",
    "Why customers choose you |  | ",
    "Why customers choose competitors |  | ",
    "Most common objection against switching |  | ",
    "Alternative comparison |  | ",
    "Trigger events or buying signals |  | ",
    "GTM risks or gaps |  | ",
    "",
    "OFFER READINESS TABLES",
    "Value claim | Outcome buyer wants | Buyer language | Metric | Current state | Expected improvement | Timeframe | Proof strength | Evidence | Before | After | Source",
    "Package | Buyer use case | What is included | Duration/term | Price/range | Success metric | Next step after this | Source or evidence",
    "Claim | Proof type | Asset exists? | Asset/source | Strength | Gap/next action | Source or evidence",
    "",
    "ALTERNATIVE COMPARISON",
    "Alternative / competitor | Why buyers use it | Where it is weak | Our advantage | Proof needed | Source or evidence",
    "",
    "OBJECTION HANDLING",
    "Objection | Why buyer believes this | Best response | Proof / asset needed | Deal stage where it appears | Source or evidence",
    "",
    "RESEARCH NOTES",
    "- Key GTM observations:",
    "- Useful source URLs:",
    "- Open questions for the company:",
    "",
    "Current form context, if helpful:",
    currentFields || "- No current fields filled in yet.",
    "",
    `Company name: ${companyName || "unknown"}`,
    `Website: ${website || "unknown"}`
  ].join("\n");
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

async function prepareResearchPrompt() {
  const status = document.getElementById("researchStatus");
  const companyName = document.querySelector("[name='companyName']").value.trim();
  const website = document.querySelector("[name='website']").value.trim();
  const notes = document.querySelector("[name='researchNotes']");

  if (!companyName && !website) {
    status.textContent = "Add a company name or website first.";
    return;
  }

  const prompt = buildResearchPrompt(companyName, website);
  try {
    const copied = await copyText(prompt);
    notes.value = notes.value ? `${notes.value}\n\nResearch prompt:\n${prompt}` : `Research prompt:\n${prompt}`;
    status.textContent = copied
      ? "Research prompt copied. Paste it into ChatGPT, then paste the response back into Research notes."
      : "Research prompt added to notes. Copy it from there into ChatGPT.";
  } catch (error) {
    notes.value = notes.value ? `${notes.value}\n\nAI research prompt:\n${prompt}` : `AI research prompt:\n${prompt}`;
    status.textContent = "Research prompt added to notes. Copy it from there into ChatGPT.";
  }
  saveDraft(false);
}

function loadDraft() {
  const record = currentRecord();
  const saved = record ? JSON.stringify(record.data) : localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    formStateData = {};
    return;
  }

  try {
    const data = normalizeRepeatableData(JSON.parse(saved));
    currentReportMode = data.reviewMode === "detailed" ? "detailed" : currentReportMode;
    detailedSectionsVisible = currentReportMode === "detailed";
    if (detailedSectionsVisible && activeSectionId === "company") {
      activeSectionId = firstDetailedSectionId();
      renderSections();
    }
    setFormData(data);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

async function initializeIntake() {
  migrateLegacyDraft();
  renderSections();
  updateDetailedActionBar();
  await loadBackendRecords();
  renderBrandPicker();
  updateResultsLink();
  loadDraft();
  applyIncomingImprovementFocus();
  renderOfferAssessmentPanels();
  renderSignalPlayAssessmentPanels();
  renderRevenueMotionAssessmentPanels();
  updateConditionalFields();
  updateScoreTotals();
  updateOfferReadinessSummary();
  updateSignalReadinessSummary();
  updateRevenueMotionSummary();
  updateSuccessFocusFields();
  updateDetailedActionBar();

  document.getElementById("saveDraftButton").addEventListener("click", () => saveDraft(true));
  document.getElementById("saveCompanyButton").addEventListener("click", () => saveDraft(true));
  document.getElementById("newCompanyButton").addEventListener("click", startBlankCompany);
  document.getElementById("clearFormButton").addEventListener("click", clearCurrentForm);
  document.getElementById("browseBrandsButton").addEventListener("click", () => {
    document.getElementById("brandBrowser").classList.toggle("open");
  });
  document.getElementById("brandSearch").addEventListener("change", (event) => {
    const record = findRecordBySearch(event.target.value);

    if (record) {
      switchToRecord(record.id);
    }
  });
  document.getElementById("researchButton").addEventListener("click", prepareResearchPrompt);
  document.getElementById("intakeForm").addEventListener("input", () => {
    formStateData = {
      ...formStateData,
      ...currentVisibleFormData()
    };
    scheduleAutosave();
  });
  document.getElementById("intakeForm").addEventListener("change", () => {
    maybePrefillBestFitProfile();
    carryForwardToBlankFields();
    renderOfferAssessmentPanels();
    renderSignalPlayAssessmentPanels();
    renderRevenueMotionAssessmentPanels();
    updateConditionalFields();
    refreshIntakeUi();
    scheduleAutosave();
  });
  document.getElementById("intakeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    submitIntake("detailed");
  });
}

initializeIntake();
