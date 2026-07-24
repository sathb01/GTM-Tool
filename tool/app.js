const schema = window.GTM_INTAKE_SCHEMA;
const STORAGE_KEY = schema.storageKey;
const RECORDS_KEY = `${STORAGE_KEY}:records`;
const ACTIVE_RECORD_KEY = `${STORAGE_KEY}:activeRecordId`;
const IMPROVEMENT_FOCUS_KEY = `${STORAGE_KEY}:improvementFocus`;
const ACTIVE_SECTION_KEY = `${STORAGE_KEY}:activeSectionId`;
const API_BASE = window.GTM_API_BASE || (window.location.protocol.startsWith("http") ? window.location.origin : "");
let autosaveTimer = null;
let intakeUiRefreshTimer = null;
let pendingIntakePanelRefresh = false;
let pendingSkipDynamicOptions = false;
let lastAutosaveSignature = "";
let currentReportMode = "quick";
let detailedSectionsVisible = false;
let activeSectionId = "company";
let formStateData = {};
let activeDataQualityReview = null;
let preferIntakeStartOnInitialLoad = false;
let multiSelectDropdownId = 0;

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

const USE_OUR_RECOMMENDATIONS_OPTION = "Use our recommendations";

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

function recommendationFirstOptions(options = []) {
  const legacyRecommendationLabels = new Set(["Use recommendation as written", "Use recommendations", USE_OUR_RECOMMENDATIONS_OPTION]);
  const normalized = (options || [])
    .filter((option) => {
      const value = option && typeof option === "object" ? option.label || option.value || option.id : option;
      return value !== "" && !legacyRecommendationLabels.has(value);
    });

  return [USE_OUR_RECOMMENDATIONS_OPTION, ...normalized];
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
    if (field.recommendationKey && field.type === "select") {
      select.dataset.recommendationKey = field.recommendationKey;
    }
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
      appendSelectOptions(select, field.recommendationKey ? recommendationFirstOptions(field.options) : field.options);
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

function createOtherField(select, labelText = "Other name", triggerValue = "Other", requiredWhenVisible = false) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  const input = document.createElement("input");

  wrapper.className = "other-field";
  wrapper.hidden = select.value !== triggerValue;
  wrapper.dataset.otherTriggerValue = triggerValue;
  wrapper.dataset.requireOther = String(requiredWhenVisible);
  label.htmlFor = `${select.name}__other`;
  label.textContent = labelText;
  input.id = `${select.name}__other`;
  input.name = `${select.name}__other`;
  input.type = "text";
  input.placeholder = "Enter other";
  input.required = requiredWhenVisible && select.value === triggerValue;
  wrapper.appendChild(label);
  wrapper.appendChild(input);

  select.addEventListener("change", () => {
    wrapper.hidden = select.value !== triggerValue;
    input.required = requiredWhenVisible && !wrapper.hidden;
    if (wrapper.hidden) {
      input.value = "";
    }
  });

  return wrapper;
}

function recommendationSelectOptions(select) {
  return Array.from(select?.options || [])
    .map((option) => option.value)
    .filter((value) => value && ![USE_OUR_RECOMMENDATIONS_OPTION, "Other", "Not sure yet", "Custom"].includes(value));
}

function recommendedOptionForSelect(select, recommendationText) {
  const recommendationItems = recommendationListItems(recommendationText);
  return recommendationSelectOptions(select).find((option) => optionMatchesRecommendation(option, recommendationText, recommendationItems)) || "";
}

function applyRecommendedSelectChoice(select) {
  if (!select || select.value !== USE_OUR_RECOMMENDATIONS_OPTION) {
    return false;
  }

  const recommended = recommendedOptionForSelect(select, select.dataset.recommendedText || "");
  if (!recommended) {
    return false;
  }

  select.value = recommended;
  return true;
}

function selectedRecommendationSelectText(select) {
  const value = String(select?.value || "").trim();
  if (!value) {
    return "";
  }

  const selected = Array.from(select.options || []).find((option) => option.value === value);
  return String(selected?.textContent || value).trim();
}

function updateRecommendationSelectSummary(select) {
  const summary = select?.recommendationSummary;
  if (!summary) {
    return;
  }

  const selected = selectedRecommendationSelectText(select);
  summary.innerHTML = "";

  if (!selected) {
    const empty = document.createElement("span");
    empty.className = "multi-select-empty";
    empty.textContent = "No selection yet.";
    summary.appendChild(empty);
    return;
  }

  const list = document.createElement("ul");
  const item = document.createElement("li");
  const text = document.createElement("span");
  list.className = "multi-select-selected-list recommendation-select-selected-list";
  text.className = "multi-select-selected-text";
  text.textContent = selected;
  item.appendChild(text);
  list.appendChild(item);
  summary.appendChild(list);
}

function setRecommendationSelectText(select, recommendationText) {
  if (!select) {
    return;
  }

  select.dataset.recommendedText = recommendationText || "";
  applyRecommendedSelectChoice(select);
  updateRecommendationSelectSummary(select);
}

function createRecommendationSelectSummary(select) {
  const summary = document.createElement("div");

  summary.className = "multi-select-summary recommendation-select-summary";
  summary.dataset.recommendationSelectSummaryFor = select.name;
  select.recommendationSummary = summary;
  select.addEventListener("change", () => {
    applyRecommendedSelectChoice(select);
    updateRecommendationSelectSummary(select);
  });
  updateRecommendationSelectSummary(select);
  return summary;
}

function otherOptionValue(field) {
  const values = ["Other", "Other measurable outcome", "Other quantified results"];
  return Array.isArray(field.options) ? values.find((value) => field.options.includes(value)) : "";
}

function multiSelectOptionText(option) {
  if (option && typeof option === "object") {
    return String(option.value || option.id || option.label || "").trim();
  }
  return String(option || "").trim();
}

function splitMultiSelectValues(value, options = []) {
  const text = String(value || "").trim();
  if (!text) {
    return [];
  }

  const structured = text
    .split(/[;|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (structured.length > 1) {
    return structured;
  }

  const knownOptions = [...new Set((options || []).map(multiSelectOptionText).filter(Boolean))]
    .sort((first, second) => second.length - first.length);
  if (!knownOptions.length || knownOptions.includes(text)) {
    return [text];
  }

  const values = [];
  let remaining = text;
  while (remaining) {
    remaining = remaining.replace(/^\s*,\s*/, "").trim();
    if (!remaining) {
      break;
    }

    const exact = knownOptions.find((option) => remaining === option || remaining.startsWith(`${option}, `));
    if (exact) {
      values.push(exact);
      remaining = remaining.slice(exact.length);
      continue;
    }

    const nextKnown = knownOptions
      .map((option) => remaining.indexOf(`, ${option}`))
      .filter((index) => index > 0)
      .sort((first, second) => first - second)[0];
    if (Number.isFinite(nextKnown)) {
      values.push(remaining.slice(0, nextKnown).trim());
      remaining = remaining.slice(nextKnown + 2);
      continue;
    }

    values.push(remaining);
    break;
  }

  return values.filter(Boolean);
}

function createMultiSelectDropdown(field, name = field.id) {
  const control = document.createElement("div");
  const trigger = document.createElement("button");
  const panel = document.createElement("div");
  const summary = document.createElement("div");
  const otherWrapper = document.createElement("div");
  const otherLabel = document.createElement("label");
  const otherInput = document.createElement("input");
  const recommendationWrapper = document.createElement("div");
  const recommendationTitle = document.createElement("div");
  const recommendationValue = document.createElement("div");
  const dropdownId = `multi-select-${++multiSelectDropdownId}`;
  const panelId = `${dropdownId}-options`;
  const fallbackOptions = field.recommendationKey ? recommendationFirstOptions(field.options || []) : field.options || [];
  const otherValues = ["Other", "Other measurable outcome", "Other quantified results"];
  let currentOptions = fallbackOptions;
  let optionSignature = JSON.stringify(fallbackOptions);
  let recommendedValues = [];

  control.className = "multi-select-dropdown";
  control.dataset.multiSelectDropdown = "true";
  control.dataset.fieldName = name;
  control.selectedValueString = "";
  control.tabIndex = -1;
  Object.defineProperty(control, "value", {
    get() {
      return selectedDisplayValues().join("; ");
    },
    set(value) {
      const values = splitMultiSelectValues(value, currentOptions);
      control.selectedValueString = values.join("; ");
      renderOptions(currentOptions, values);
    }
  });
  if (field.optionsFromMultiselect) {
    control.dataset.optionsFromMultiselect = field.optionsFromMultiselect;
    control.dataset.fallbackOptions = JSON.stringify(fallbackOptions);
  }
  if (field.dynamicOptionsFrom) {
    control.dataset.dynamicOptionsFrom = field.dynamicOptionsFrom;
    control.dataset.fallbackOptions = JSON.stringify(fallbackOptions);
  }

  trigger.type = "button";
  trigger.className = "multi-select-trigger";
  trigger.textContent = "Choose options";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", panelId);
  trigger.setAttribute("aria-haspopup", "true");
  panel.className = "multi-select-dropdown-panel";
  panel.id = panelId;
  panel.setAttribute("role", "group");
  panel.setAttribute("aria-label", `${field.label || name} options`);
  panel.hidden = true;
  summary.className = "multi-select-summary";
  otherWrapper.className = "other-field";
  otherWrapper.hidden = true;
  otherWrapper.dataset.requireOther = "true";
  otherWrapper.dataset.multiSelectOtherFor = name;
  otherLabel.htmlFor = `${name}__other`;
  otherLabel.textContent = field.otherLabel || "Define other";
  otherInput.id = `${name}__other`;
  otherInput.name = `${name}__other`;
  otherInput.type = "text";
  otherInput.placeholder = "Enter other";
  otherWrapper.appendChild(otherLabel);
  otherWrapper.appendChild(otherInput);
  if (field.recommendationKey) {
    recommendationWrapper.className = "multi-select-recommendation";
    recommendationWrapper.dataset.dropdownRecommendationKey = field.recommendationKey;
    recommendationTitle.className = "multi-select-recommendation-title";
    recommendationTitle.textContent = "Recommended";
    recommendationValue.className = "multi-select-recommendation-value";
    setExpandableText(recommendationValue, "Recommendation will update from the earlier answers.", 18);
    recommendationWrapper.appendChild(recommendationTitle);
    recommendationWrapper.appendChild(recommendationValue);
  }

  function optionIsOther(value) {
    return otherValues.includes(value);
  }

  function hasOtherOption() {
    return currentOptions.some(optionIsOther);
  }

  function selectedValues() {
    const checked = Array.from(panel.querySelectorAll(`input[name="${CSS.escape(name)}"]:checked`))
      .map((input) => input.value)
      .filter((value) => value !== USE_OUR_RECOMMENDATIONS_OPTION);
    if (checked.length) {
      return checked;
    }
    return splitMultiSelectValues(control.selectedValueString, currentOptions)
      .filter((item) => item !== USE_OUR_RECOMMENDATIONS_OPTION)
      .map((item) => otherValues.find((value) => item === value || item.startsWith(`${value}:`)) || item);
  }

  function clearHelperOnlySelection() {
    const helper = recommendationCheckbox();
    if (helper && helper.checked && !selectedValues().length) {
      helper.checked = false;
    }
  }

  function selectedDisplayValues() {
    const otherText = otherInput.value.trim();
    return selectedValues().map((value) => optionIsOther(value) && otherText ? `${value}: ${otherText}` : value);
  }

  function updateSummary() {
    clearHelperOnlySelection();
    const selectedRaw = selectedValues();
    const selected = selectedDisplayValues();
    const hasSelectedOther = selectedRaw.some(optionIsOther);
    control.selectedValueString = selected.join("; ");
    trigger.textContent = selected.length ? "Edit selections" : "Choose options";
    otherWrapper.hidden = !hasOtherOption() || !hasSelectedOther;
    otherInput.required = hasOtherOption() && hasSelectedOther;
    if (otherWrapper.hidden) {
      otherInput.value = "";
    }
    summary.innerHTML = "";
    if (!selected.length) {
      const empty = document.createElement("span");
      empty.className = "multi-select-empty";
      empty.textContent = "No selections yet.";
      summary.appendChild(empty);
      return;
    }
    const list = document.createElement("ul");
    list.className = "multi-select-selected-list";
    selected.filter((value) => String(value || "").trim()).forEach((value) => {
      const item = document.createElement("li");
      const text = document.createElement("span");
      text.className = "multi-select-selected-text";
      text.textContent = value;
      item.appendChild(text);
      list.appendChild(item);
    });
    if (list.children.length) {
      summary.appendChild(list);
    }
    if (name === "preEvidenceTracked" && selected.length > 6) {
      const warning = document.createElement("div");
      warning.className = "multi-select-scope-warning";
      warning.textContent = "This may be too much for a 30-day validation test. Nice to know. Disregard if knowing does not impact the next decision.";
      summary.appendChild(warning);
    }
  }

  control.updateSummary = updateSummary;
  otherInput.addEventListener("input", updateSummary);

  function recommendationCheckbox() {
    return optionCheckbox(USE_OUR_RECOMMENDATIONS_OPTION);
  }

  function optionCheckbox(value) {
    return Array.from(panel.querySelectorAll(`input[name="${CSS.escape(name)}"]`)).find((input) => input.value === value);
  }

  function syncRecommendationCheckbox() {
    const checkbox = recommendationCheckbox();
    if (!checkbox) {
      return;
    }

    const selected = selectedValues();
    const hasRecommendedValues = recommendedValues.length > 0;
    checkbox.disabled = !hasRecommendedValues;
    checkbox.checked = hasRecommendedValues && recommendedValues.every((value) => selected.includes(value));
  }

  function applyRecommendedSelection(checked) {
    if (checked) {
      Array.from(panel.querySelectorAll(`input[name="${CSS.escape(name)}"]`)).forEach((checkbox) => {
        checkbox.checked = checkbox.value === USE_OUR_RECOMMENDATIONS_OPTION;
      });
    }
    recommendedValues.forEach((value) => {
      const checkbox = optionCheckbox(value);
      if (checkbox) {
        checkbox.checked = checked;
      }
    });
    syncRecommendationCheckbox();
    updateSummary();
    control.dispatchEvent(new Event("change", { bubbles: true }));
    control.dispatchEvent(new Event("input", { bubbles: true }));
  }

  control.setRecommendedText = (text) => {
    const items = recommendationListItems(text);
    recommendedValues = currentOptions
      .filter((option) => ![USE_OUR_RECOMMENDATIONS_OPTION, ...otherValues, "Not sure yet"].includes(option))
      .filter((option) => optionMatchesRecommendation(option, text, items));

    Array.from(panel.querySelectorAll(".checkbox-option")).forEach((label) => {
      const input = label.querySelector("input");
      const isRecommended = recommendedValues.includes(input?.value || "");
      label.classList.toggle("recommended-option", isRecommended);
      label.querySelector(".recommended-option-badge")?.remove();
      if (isRecommended) {
        const badge = document.createElement("span");
        badge.className = "recommended-option-badge";
        badge.textContent = "Recommended";
        label.appendChild(badge);
      }
    });

    syncRecommendationCheckbox();
  };

  function renderOptions(options, selected = selectedValues()) {
    currentOptions = field.recommendationKey ? recommendationFirstOptions(options || []) : options || [];
    optionSignature = JSON.stringify(currentOptions);
    panel.innerHTML = "";
    const normalizedSelected = selected.map((item) => {
      const text = String(item || "").trim();
      const otherMatch = otherValues.find((value) => text === value || text.startsWith(`${value}:`));
      if (otherMatch) {
        const otherText = text.startsWith(`${otherMatch}:`) ? text.slice(otherMatch.length + 1).trim() : "";
        if (otherText && !otherInput.value.trim()) {
          otherInput.value = otherText;
        }
        return otherMatch;
      }
      return text;
    });
    currentOptions.forEach((option) => {
      const optionLabel = document.createElement("label");
      const checkbox = document.createElement("input");
      optionLabel.className = "checkbox-option";
      checkbox.type = "checkbox";
      checkbox.name = name;
      checkbox.value = option;
      checkbox.checked = normalizedSelected.includes(option);
      checkbox.addEventListener("change", () => {
        if (checkbox.value === USE_OUR_RECOMMENDATIONS_OPTION) {
          applyRecommendedSelection(checkbox.checked);
          return;
        }
        syncRecommendationCheckbox();
        updateSummary();
        control.dispatchEvent(new Event("change", { bubbles: true }));
        control.dispatchEvent(new Event("input", { bubbles: true }));
      });
      optionLabel.appendChild(checkbox);
      optionLabel.appendChild(document.createTextNode(option));
      panel.appendChild(optionLabel);
    });
    if (recommendationValue.textContent) {
      control.setRecommendedText(recommendationValue.textContent);
    } else {
      syncRecommendationCheckbox();
    }
    updateSummary();
  }

  control.refreshOptions = (options) => {
    const nextOptions = field.recommendationKey ? recommendationFirstOptions(options || []) : options || [];
    const nextSignature = JSON.stringify(nextOptions);
    if (nextSignature === optionSignature) {
      updateSummary();
      return;
    }
    const selected = selectedValues();
    renderOptions(nextOptions, selected);
  };

  function setPanelOpen(open, focusOption = false) {
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (open && focusOption) {
      const firstOption = panel.querySelector('input[type="checkbox"]:checked')
        || panel.querySelector('input[type="checkbox"]:not(:disabled)');
      firstOption?.focus();
    }
  }

  trigger.addEventListener("click", () => {
    setPanelOpen(panel.hidden);
  });

  trigger.addEventListener("keydown", (event) => {
    if (["ArrowDown", "Enter", " "].includes(event.key) && panel.hidden) {
      event.preventDefault();
      setPanelOpen(true, true);
    } else if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      setPanelOpen(false);
    }
  });

  panel.addEventListener("keydown", (event) => {
    const options = Array.from(panel.querySelectorAll('input[type="checkbox"]:not(:disabled)'));
    const currentIndex = options.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setPanelOpen(false);
      trigger.focus();
      return;
    }
    if (currentIndex < 0 || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? options.length - 1
        : event.key === "ArrowDown"
          ? (currentIndex + 1) % options.length
          : (currentIndex - 1 + options.length) % options.length;
    options[nextIndex]?.focus();
  });

  control.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!control.contains(document.activeElement)) setPanelOpen(false);
    }, 0);
  });

  document.addEventListener("click", (event) => {
    if (!control.contains(event.target)) {
      setPanelOpen(false);
    }
  });

  control.appendChild(trigger);
  control.appendChild(panel);
  control.appendChild(otherWrapper);
  control.appendChild(summary);
  if (field.recommendationKey) {
    control.appendChild(recommendationWrapper);
  }
  renderOptions(fallbackOptions);
  return control;
}

function supportsOtherField(field) {
  if (field.otherValue) {
    return field.type === "select";
  }

  return field.type === "select" && Boolean(otherOptionValue(field));
}

function selectedMultiselectValues(fieldId) {
  return Array.from(document.querySelectorAll(`input[name="${CSS.escape(fieldId)}"]:checked, select[name="${CSS.escape(fieldId)}"] option:checked`))
    .map((input) => {
      const otherValues = ["Other", "Other measurable outcome", "Other quantified results"];
      if (otherValues.includes(input.value)) {
        const other = document.querySelector(`input[name="${CSS.escape(`${fieldId}__other`)}"]`);
        const otherText = String(other?.value || "").trim();
        return otherText ? `${input.value}: ${otherText}` : input.value;
      }
      return input.value;
    })
    .filter(Boolean);
}

function updateDynamicOptionFields() {
  const data = getFormData();

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

  document.querySelectorAll("[data-multi-select-dropdown][data-dynamic-options-from='possibleCustomerGroups']").forEach((control) => {
    const fallback = JSON.parse(control.dataset.fallbackOptions || "[]");
    const values = [...new Set([...collectSharedCustomerGroupOptions(data), ...fallback])];

    if (typeof control.refreshOptions === "function") {
      control.refreshOptions(values);
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='possibleCustomerGroups']").forEach((select) => {
    const selectedValue = select.value;
    const fallback = JSON.parse(select.dataset.fallbackOptions || "[]");
    const values = [...new Set([...collectSharedCustomerGroupOptions(data), ...fallback])];

    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value)));

    if (values.includes(selectedValue)) {
      select.value = selectedValue;
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='offerPortfolio']").forEach((select) => {
    const selectedValue = select.value;
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

  document.querySelectorAll("select[data-dynamic-options-from='preCustomerHypotheses']").forEach((select) => {
    const selectedValue = select.value;
    const fallback = JSON.parse(select.dataset.fallbackOptions || "[]");
    const values = [...new Set([
      ...tableRowsFromData(data, "preCustomerHypotheses").map((row) => row.values.segmentName__other || row.values.segmentName || row.values.groupName || row.values.specificDefinition).filter(Boolean),
      ...fallback
    ])];

    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value)));

    if (values.includes(selectedValue)) {
      select.value = selectedValue;
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='signalCustomerGroups']").forEach((select) => {
    const selectedValue = select.value;
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
    const values = collectRevenueCustomerGroupOptions(data);
    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value)));
    if (values.includes(selectedValue)) {
      select.value = selectedValue;
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='revenueOffers']").forEach((select) => {
    const selectedValue = select.value;
    const values = collectRevenueOfferOptions(data);
    select.innerHTML = "";
    select.appendChild(createOption("", "Select one"));
    values.forEach((value) => select.appendChild(createOption(value)));
    if (values.includes(selectedValue)) {
      select.value = selectedValue;
    }
  });

  document.querySelectorAll("select[data-dynamic-options-from='revenueMotionPortfolio']").forEach((select) => {
    const selectedValue = select.value;
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
  const itemField = { ...field, type: field.itemType || "text" };
  const input = createInput(
    itemField,
    `${field.id}__item-${index}`
  );
  const remove = document.createElement("button");

  item.className = "repeatable-item";
  input.placeholder = field.itemPlaceholder || "Enter one item";
  input.value = value;
  remove.type = "button";
  remove.className = "secondary repeatable-remove-button";
  remove.textContent = "×";
  remove.title = "Remove this item";
  remove.setAttribute("aria-label", "Remove this item");
  remove.addEventListener("click", () => {
    item.remove();
  });

  item.appendChild(input);
  if (supportsOtherField(itemField)) {
    item.appendChild(createOtherField(input, field.otherLabel || "Define other", field.otherValue || otherOptionValue(itemField) || "Other", Boolean(field.requireOther)));
  }
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

function compactText(value, wordLimit = 6) {
  const text = String(value || "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= wordLimit) {
    return text;
  }
  return `${words.slice(0, wordLimit).join(" ")}...`;
}

function recommendationListItems(value) {
  const text = String(value || "").trim();
  if (!text) {
    return [];
  }

  const lineItems = text.split(/\n+/).map((item) => item.trim()).filter(Boolean);
  if (lineItems.length > 1) {
    return lineItems;
  }

  const ruleItems = text.split(/\s+(?=(?:Continue|Revise|Stop or pause):)/i).map((item) => item.trim()).filter(Boolean);
  if (ruleItems.length > 1) {
    return ruleItems;
  }

  const semicolonItems = text.split(";").map((item) => item.trim()).filter(Boolean);
  if (semicolonItems.length > 1 && semicolonItems.every((item) => item.split(/\s+/).filter(Boolean).length <= 12)) {
    return semicolonItems;
  }

  return [];
}

function nestedRecommendationParts(item) {
  const nestedMatch = String(item || "").match(/^([^:]{2,60}):\s*(.+)$/);
  if (!nestedMatch) {
    return null;
  }

  const detail = nestedMatch[2].trim();
  const delimiter = detail.includes(";") ? ";" : ",";
  const details = detail
    .split(delimiter)
    .map((part) => part.trim())
    .filter(Boolean);

  if (details.length < 2) {
    return null;
  }

  return {
    label: nestedMatch[1],
    details
  };
}

function renderBulletedText(element, items) {
  const list = document.createElement("ul");
  list.className = "recommendation-list";
  if (items.length >= 4 && items.every((item) => item.split(/\s+/).filter(Boolean).length <= 10 && item.length <= 85)) {
    list.classList.add("recommendation-list--columns");
  }

  items.forEach((item) => {
    const listItem = document.createElement("li");
    const nested = nestedRecommendationParts(item);

    if (nested) {
      const label = document.createElement("span");
      const nestedList = document.createElement("ul");
      label.className = "recommendation-list-label";
      label.textContent = `${nested.label}:`;
      nestedList.className = "recommendation-sublist";
      nested.details.forEach((nestedItem) => {
        const child = document.createElement("li");
        child.textContent = nestedItem;
        nestedList.appendChild(child);
      });
      listItem.appendChild(label);
      listItem.appendChild(nestedList);
    } else {
      listItem.textContent = item;
    }
    list.appendChild(listItem);
  });

  element.appendChild(list);
}

function normalizedRecommendationMatchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(use|start|with|the|a|an|and|or|to|for|of|in|on|as|our|recommended|recommendation|positive|signal)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function recommendationKeywordSet(value) {
  return normalizedRecommendationMatchText(value)
    .split(" ")
    .filter((word) => word.length > 2);
}

function optionMatchesRecommendation(option, recommendationText, recommendationItems = recommendationListItems(recommendationText)) {
  const optionText = normalizedRecommendationMatchText(option);
  const sourceItems = recommendationItems.length ? recommendationItems : [recommendationText];

  if (!optionText || [USE_OUR_RECOMMENDATIONS_OPTION, "other", "not sure yet"].includes(optionText)) {
    return false;
  }

  return sourceItems.some((item) => {
    const itemText = normalizedRecommendationMatchText(item);
    if (!itemText) {
      return false;
    }
    if (itemText === optionText || itemText.includes(optionText) || optionText.includes(itemText)) {
      return true;
    }

    const optionWords = recommendationKeywordSet(optionText);
    const itemWords = new Set(recommendationKeywordSet(itemText));
    const overlap = optionWords.filter((word) => itemWords.has(word)).length;
    return optionWords.length >= 3 && overlap >= Math.min(3, optionWords.length);
  });
}

function setExpandableText(element, value, wordLimit = 6) {
  const text = String(value || "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  const listItems = recommendationListItems(text);
  const nestedSingleItem = nestedRecommendationParts(text);

  element.innerHTML = "";

  if (!text) {
    element.textContent = "Not captured yet";
    return;
  }

  if (listItems.length > 1 || nestedSingleItem) {
    renderBulletedText(element, listItems.length > 1 ? listItems : [text]);
    return;
  }

  const span = document.createElement("span");
  const button = document.createElement("button");

  if (words.length <= wordLimit) {
    span.textContent = text;
    element.appendChild(span);
    return;
  }

  span.textContent = compactText(text, wordLimit);
  button.type = "button";
  button.className = "inline-more-button";
  button.textContent = "more...";
  button.addEventListener("click", () => {
    const expanded = button.dataset.expanded === "true";
    button.dataset.expanded = String(!expanded);
    span.textContent = expanded ? compactText(text, wordLimit) : text;
    button.textContent = expanded ? "more..." : "less";
  });

  element.appendChild(span);
  element.appendChild(document.createTextNode(" "));
  element.appendChild(button);
}

function pathKindForBuyingPath(buyingPath = "") {
  const text = String(buyingPath || "");
  if (/mixed|not sure/i.test(text)) {
    return "mixed";
  }
  if (/retail|wholesale|distributor|marketplace|corporate|team|business/i.test(text)) {
    return "channel";
  }
  return "dtc";
}

function pathSpecificField({ buyingPath, dtc, channel, mixed }) {
  const pathKind = pathKindForBuyingPath(buyingPath);
  if (pathKind === "mixed") {
    return mixed || channel || dtc;
  }
  if (pathKind === "channel") {
    return channel || mixed || dtc;
  }
  return dtc || mixed || channel;
}

function sourceForPreRevenueSummaryGap(gapKey, data = getFormData()) {
  const segment = selectedPreRevenueDiscoverySegment(data);
  const rowId = segment?.rowId || "";
  const values = segment?.values || {};
  const buyingPath = firstFilledValue(data.preDiscoveryBuyingPath, values.likelyBuyerPath, data.preRevenueRouteToMarket);
  const segmentField = (columnId) => rowId ? fieldName("preCustomerHypotheses", rowId, columnId) : "";
  const segmentSection = "preRevenueHypotheses";
  const problemFallback = pathSpecificField({
    buyingPath,
    dtc: "preProblemHypothesisDtc",
    channel: "preProblemHypothesisChannel",
    mixed: "preProblemHypothesisDtc"
  });
  const urgencyFallback = pathSpecificField({
    buyingPath,
    dtc: "prePainMechanismDtc",
    channel: "prePainMechanismChannel",
    mixed: "prePainMechanismDtc"
  });
  const buyerFallback = pathSpecificField({
    buyingPath,
    dtc: "preDtcPrimaryBuyer",
    channel: "preChannelPrimaryBuyer",
    mixed: "preDtcPrimaryBuyer"
  });
  const evidenceFallback = pathSpecificField({
    buyingPath,
    dtc: "preProblemEvidenceDtc",
    channel: "preProblemEvidenceChannel",
    mixed: "preProblemEvidenceDtc"
  });
  const riskFallback = pathSpecificField({
    buyingPath,
    dtc: "preDtcTrustConcerns",
    channel: "preChannelProofConcerns",
    mixed: "preDtcTrustConcerns"
  });
  const targets = {
    problem: {
      field: segmentField("problem") || problemFallback,
      section: rowId ? segmentSection : "preRevenueProblem",
      useOther: true,
      prompt: "Add the problem, buying job, or unmet need this target has."
    },
    urgency: {
      field: segmentField("whyNow") || urgencyFallback,
      section: rowId ? segmentSection : "preRevenueProblem",
      useOther: true,
      prompt: "Add why this target might care now."
    },
    buyerRoles: {
      field: segmentField(pathSpecificField({
        buyingPath,
        dtc: "likelyBuyerDtc",
        channel: "likelyBuyerChannel",
        mixed: "likelyBuyerUnknown"
      })) || buyerFallback,
      section: rowId ? segmentSection : "preRevenueBuyerDiscovery",
      useOther: true,
      prompt: "Add the buyer, user, influencer, approver, or recommender role."
    },
    validationPath: {
      field: segmentField(pathSpecificField({
        buyingPath,
        dtc: "validationPathDtc",
        channel: "validationPathChannel",
        mixed: "validationPathDtc"
      })) || "preRoutingDecisionNextStep",
      section: rowId ? segmentSection : "preRevenueBuyerDiscovery",
      useOther: true,
      prompt: "Add the smallest validation path or buyer signal to test."
    },
    evidence: {
      field: segmentField(pathSpecificField({
        buyingPath,
        dtc: "evidenceAvailableDtc",
        channel: "evidenceAvailableChannel",
        mixed: "evidenceAvailableDtc"
      })) || evidenceFallback,
      section: rowId ? segmentSection : "preRevenueProblem",
      useOther: true,
      prompt: "Add the evidence already available, or the evidence to collect first."
    },
    risk: {
      field: segmentField(pathSpecificField({
        buyingPath,
        dtc: "riskRequirementsDtc",
        channel: "riskRequirementsChannel",
        mixed: "riskRequirementsDtc"
      })) || riskFallback,
      section: rowId ? segmentSection : "preRevenueBuyerDiscovery",
      useOther: true,
      prompt: "Add the worry, risk, or proof question that needs to be tested."
    },
    firstCommitment: {
      field: "preWedgeOfferType",
      section: "preRevenueWedge",
      useOther: true,
      prompt: "Choose the first offer, commitment, or next step you want to test."
    }
  };

  return targets[gapKey] || null;
}

function sectionTables(section) {
  const tables = [...(section.tables || [])];

  (section.cards || []).forEach((card) => {
    tables.push(...(card.tables || []));
  });

  (section.content || []).forEach((block) => {
    tables.push(...(block.tables || []));
  });

  return tables;
}

function findTableColumn(tableId, columnId) {
  for (const section of schema.sections) {
    const table = sectionTables(section).find((item) => item.id === tableId);
    const column = table?.columns?.find((item) => item.id === columnId);
    if (column) {
      return column;
    }
  }

  return null;
}

function findFieldDefinitionForDataKey(key) {
  const direct = findField(key);
  if (direct) {
    return direct;
  }

  const parts = String(key || "").split("__");
  if (parts.length >= 3) {
    return findTableColumn(parts[0], parts.slice(2).join("__"));
  }

  return null;
}

function fieldHasGuidedOptions(field) {
  return Boolean(field && ["select", "multiSelectDropdown", "multiDropdown", "scoreSelect"].includes(field.type) && Array.isArray(field.options) && field.options.length);
}

function quickAddFieldForTarget(target) {
  const field = findFieldDefinitionForDataKey(target?.field);

  if (!fieldHasGuidedOptions(field)) {
    return null;
  }

  return {
    ...field,
    id: `${target.field}__quickAdd`,
    required: false,
    showWhen: null,
    showUnless: null,
    dynamicOptionsFrom: null,
    optionsFromMultiselect: null,
    hint: "",
    recommendationKey: null
  };
}

function quickAddContainerFor(eventTarget) {
  return eventTarget?.closest?.(".missing-answer-editor") || null;
}

function quickAddValue(input, field, name) {
  const value = String(input?.value || "").trim();
  if (!value) {
    return "";
  }

  if (field?.type === "select" && value === "Other") {
    const other = document.querySelector(`input[name="${CSS.escape(`${name}__other`)}"]`);
    const otherText = String(other?.value || "").trim();
    return otherText ? `Other: ${otherText}` : "";
  }

  return value;
}

function applyMissingSummaryAnswer(target, answer) {
  const text = String(answer || "").trim();
  if (!target?.field || !text) {
    return;
  }

  const field = findFieldDefinitionForDataKey(target.field);
  const value = target.useOther && !fieldHasGuidedOptions(field) && !/^Other:/i.test(text) ? `Other: ${text}` : text;
  const otherText = value.replace(/^Other:\s*/i, "");
  formStateData[target.field] = value;
  if (/^Other:/i.test(value)) {
    formStateData[`${target.field}__other`] = otherText;
  }

  const fieldElement = document.querySelector(`[name="${CSS.escape(target.field)}"]`);
  const customMultiSelect = document.querySelector(`[data-multi-select-dropdown][data-field-name="${CSS.escape(target.field)}"]`);

  if (customMultiSelect && typeof customMultiSelect.value !== "undefined") {
    customMultiSelect.value = value;
    if (typeof customMultiSelect.updateSummary === "function") {
      customMultiSelect.updateSummary();
    }
  } else if (fieldElement) {
    if (/^Other:/i.test(value) && fieldElement.tagName === "SELECT" && Array.from(fieldElement.options).some((option) => option.value === "Other")) {
      fieldElement.value = "Other";
      const other = document.querySelector(`input[name="${CSS.escape(`${target.field}__other`)}"]`);
      if (other) {
        other.value = otherText;
      }
    } else {
      fieldElement.value = value;
    }
  }

  saveDraft(false);
  updateConditionalFields();
  refreshIntakeUi({ skipDynamicOptions: true });
}

function renderMissingSummaryAnswer(element, target) {
  element.innerHTML = "";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "missing-answer-button";
  button.textContent = "Question not answered - Add Answer?";
  button.addEventListener("click", () => {
    if (element.querySelector(".missing-answer-editor")) {
      return;
    }

    const editor = document.createElement("div");
    const quickField = quickAddFieldForTarget(target);
    const quickName = quickField?.id || "";
    const prompt = document.createElement("div");
    const input = quickField ? createInput(quickField, quickName) : document.createElement("textarea");
    const actions = document.createElement("div");
    const save = document.createElement("button");
    const cancel = document.createElement("button");

    editor.className = "missing-answer-editor";
    editor.dataset.quickAddEditor = "true";
    prompt.className = "hint";
    prompt.textContent = quickField
      ? `${target.prompt || "Add the missing answer."} Choose from the original options, or choose Other and define it.`
      : target.prompt || "Add the missing answer.";
    input.placeholder = "Add answer";
    actions.className = "missing-answer-actions";
    save.type = "button";
    save.textContent = "Save answer";
    cancel.type = "button";
    cancel.className = "secondary";
    cancel.textContent = "Cancel";

    save.addEventListener("click", () => {
      const answer = quickField ? quickAddValue(input, quickField, quickName) : String(input.value || "").trim();
      if (!answer) {
        input.focus();
        return;
      }
      applyMissingSummaryAnswer(target, answer);
    });
    cancel.addEventListener("click", () => editor.remove());

    actions.appendChild(save);
    actions.appendChild(cancel);
    editor.appendChild(prompt);
    editor.appendChild(input);
    input.dataset.quickAddInput = "true";
    if (quickField && supportsOtherField(quickField)) {
      editor.appendChild(createOtherField(input, quickField.otherLabel || "Define other", quickField.otherValue || otherOptionValue(quickField) || "Other", Boolean(quickField.requireOther)));
    }
    editor.appendChild(actions);
    element.appendChild(editor);
    input.focus();
  });

  element.appendChild(button);
}

function setSummaryValue(element, item, wordLimit = 6) {
  const [, value, target] = item;
  if (String(value || "").trim() === "Not captured yet" && target) {
    renderMissingSummaryAnswer(element, target);
    return;
  }

  setExpandableText(element, value, wordLimit);
}

function appendCopyableExample(wrapper, field, input) {
  const explicitExample = String(field?.example || "").trim();
  const source = [input?.placeholder, field?.placeholder, field?.hint]
    .map((value) => String(value || "").trim())
    .find((value) => /Examples?:\s*/i.test(value));
  if (!explicitExample && !source) return;

  const example = explicitExample || source.replace(/^[\s\S]*?Examples?:\s*/i, "").trim();
  if (!example) return;
  const line = document.createElement("div");
  const label = document.createElement("span");
  const text = document.createElement("span");
  const copy = document.createElement("button");

  line.className = "field-example";
  label.className = "field-example-label";
  text.className = "field-example-text";
  copy.className = "field-example-copy";
  label.textContent = "Example:";
  text.textContent = example;
  copy.type = "button";
  copy.textContent = "Copy";
  copy.title = "Copy example";
  copy.setAttribute("aria-label", "Copy example");
  copy.addEventListener("click", async () => {
    let copied = false;
    try {
      copied = await copyText(example);
    } catch {
      copied = false;
    }
    copy.textContent = copied ? "Copied" : "Copy failed";
    window.setTimeout(() => {
      copy.textContent = "Copy";
    }, 1500);
  });

  line.append(label, text, copy);
  wrapper.appendChild(line);
}

function createField(field) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");

  wrapper.className = field.full ? "full" : "";
  wrapper.dataset.fieldId = field.id;
  wrapper.dataset.fieldLabel = field.label;
  if (field.showWhen) {
    wrapper.dataset.showWhenField = field.showWhen.field;
    if (Object.prototype.hasOwnProperty.call(field.showWhen, "contains")) {
      wrapper.dataset.showWhenContains = field.showWhen.contains;
    } else if (Object.prototype.hasOwnProperty.call(field.showWhen, "values")) {
      wrapper.dataset.showWhenValues = JSON.stringify(field.showWhen.values);
    } else if (Object.prototype.hasOwnProperty.call(field.showWhen, "checked")) {
      wrapper.dataset.showWhenChecked = String(field.showWhen.checked);
    } else {
      wrapper.dataset.showWhenValue = field.showWhen.value;
    }
    if (field.showWhen.defaultVisible) {
      wrapper.dataset.showWhenDefaultVisible = "true";
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
    button.className = "secondary repeatable-add-button";
    button.textContent = `+ ${field.addLabel || "Add another"}`.replace(/^\+\s*\+\s*/, "+ ");
    button.addEventListener("click", () => addRepeatableItem(list, field));

    wrapper.appendChild(list);
    wrapper.appendChild(button);
  } else if (field.type === "sectionLink") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = field.buttonLabel || "Go back";
    button.addEventListener("click", () => {
      syncFormStateFromDom();
      switchActiveSection(field.targetSection);
    });
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
    appendCopyableExample(wrapper, field, input);
    wrapper.appendChild(field.type === "money" ? createMoneyControl(input) : input);

    if (supportsOtherField(field)) {
      wrapper.appendChild(createOtherField(input, field.otherLabel || "Other name", field.otherValue || otherOptionValue(field) || "Other", Boolean(field.requireOther)));
    }

    if (field.recommendationKey && field.type === "select") {
      wrapper.appendChild(createRecommendationSelectSummary(input));
    }
  }

  if (field.hint) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = field.hint;
    wrapper.appendChild(hint);
  }

  if (field.recommendationKey && field.type !== "multiSelectDropdown") {
    const recommendation = document.createElement("div");
    const title = document.createElement("div");
    const value = document.createElement("div");

    recommendation.className = "field-recommendation";
    recommendation.dataset.fieldRecommendationKey = field.recommendationKey;
    title.className = "field-recommendation-title";
    title.textContent = "Our recommendation";
    value.className = "field-recommendation-value";
    setExpandableText(value, "Recommendation will update from the earlier answers.", 18);
    recommendation.appendChild(title);
    recommendation.appendChild(value);
    wrapper.appendChild(recommendation);
  }

  return wrapper;
}

function tableRows(table) {
  if (table.rows) {
    return table.rows.map((row) => typeof row === "string" ? { id: slug(row), label: row } : row);
  }

  return Array.from({ length: table.minRows || 3 }, (_, index) => ({
    id: table.id === "offerPortfolio"
      ? `offer-${index + 1}`
      : table.id === "signalPlayPortfolio"
        ? `play-${index + 1}`
        : table.id === "revenueMotionPortfolio"
          ? `motion-${index + 1}`
          : `${slug(table.rowLabel)}-${index + 1}`,
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

function claimListValue(value) {
  return splitMultiSelectValues(value);
}

function valueClaimOutcome(values) {
  return values.outcomeType || values.outcome || values.outcomeOtherText || "Value claim";
}

function valueClaimMetric(values) {
  return values.successMetric || values.metric || "";
}

function valueClaimTargetDefined(values) {
  return Boolean(
    values.targetImprovementType
    && values.targetImprovementType !== "Unknown"
    && (
      !["Specific number", "Percentage improvement", "Range"].includes(values.targetImprovementType)
      || values.targetImprovementValue
      || values.targetImprovementUnit
    )
  );
}

function scoreValueClaim(values) {
  let score = 0;
  const buyerRoles = claimListValue(values.buyerRoles);
  if (buyerRoles.length && !buyerRoles.includes("Not sure yet")) {
    score += 1;
  }
  if (values.buyerPriorityLevel === "High - this is a top buying reason" || values.buyerPriorityLevel === "high") {
    score += 1;
  } else if (values.buyerPriorityLevel === "Medium - this supports the decision" || values.buyerPriorityLevel === "medium") {
    score += 0.5;
  }
  if (valueClaimMetric(values) && valueClaimMetric(values) !== "Not sure yet") {
    score += 2;
  }
  if (values.baselineStatus === "Known" || values.baselineStatus === "known") {
    score += 2;
  } else if (values.baselineStatus === "Estimated" || values.baselineStatus === "estimated") {
    score += 1;
  }
  if (valueClaimTargetDefined(values)) {
    score += 2;
  }
  if (["Case study", "Quantified case study", "ROI calculator", "Benchmark data", "Third-party validation", "Strong repeatable proof", "Repeatable proof across multiple customers", "Measured customer result"].includes(values.proofStrength)) {
    score += 2;
  } else if (["Customer quote", "Before/after example", "Internal estimate", "Anecdotal proof", "One customer example"].includes(values.proofStrength)) {
    score += 1;
  }
  if (values.salesReadiness === "Yes - ready to use" || values.salesReadiness === "ready") {
    score += 2;
  } else if (values.salesReadiness === "Yes - but needs stronger proof" || values.salesReadiness === "needs_stronger_proof") {
    score += 1;
  }
  return Math.min(score, 12);
}

function valueClaimStatus(score) {
  if (score >= 10) return "Strong";
  if (score >= 7) return "Promising";
  if (score >= 4) return "Under-proven";
  return "Not ready";
}

function valueClaimTopGap(values) {
  if (!claimListValue(values.buyerRoles).length || claimListValue(values.buyerRoles).includes("Not sure yet")) return "Buyer role is unclear.";
  if (!valueClaimMetric(values) || valueClaimMetric(values) === "Not sure yet") return "Success metric is missing.";
  if (!values.baselineStatus || ["Unknown", "unknown"].includes(values.baselineStatus)) return "Current baseline is missing.";
  if (!valueClaimTargetDefined(values)) return "Target improvement is not defined.";
  if (["No proof yet", "Anecdotal proof", ""].includes(values.proofStrength || "")) return "Proof is not strong enough yet.";
  if (["Not yet - needs more validation", "Not sure", "not_ready", "not_sure"].includes(values.salesReadiness || "")) return "Claim is not sales-ready.";
  return "No immediate proof gap identified.";
}

function valueClaimRecommendedAction(values) {
  const outcome = valueClaimOutcome(values).toLowerCase();
  const metric = valueClaimMetric(values) || "the success metric";
  const missingProof = claimListValue(values.missingProof || values.proofGap).join(" ");
  if (!valueClaimMetric(values) || valueClaimMetric(values) === "Not sure yet") return `Choose a success metric for the ${outcome} claim so it can be measured and proven.`;
  if (!values.baselineStatus || ["Unknown", "unknown"].includes(values.baselineStatus)) return `Define the current baseline for ${metric} before using this claim in sales messaging.`;
  if (/ROI calculator/i.test(missingProof)) return `Build an ROI or business-case calculator to support the ${outcome} claim.`;
  if (["No proof yet", "Anecdotal proof", ""].includes(values.proofStrength || "")) return `Collect stronger proof for the ${outcome} claim by gathering one customer quote, before/after example, or quantified case study.`;
  if (["Not yet - needs more validation", "Not sure", "not_ready", "not_sure"].includes(values.salesReadiness || "")) return `Rewrite the ${outcome} value claim in buyer language and validate it in 3 sales conversations.`;
  if (!claimListValue(values.buyerRoles).length || claimListValue(values.buyerRoles).includes("Not sure yet")) return `Identify which buyer role cares most about the ${outcome} claim.`;
  return "Use this claim in sales messaging and keep improving proof quality.";
}

function valueClaimSuggestedAsset(values) {
  const text = `${values.outcomeType || values.outcome || ""} ${values.successMetric || values.metric || ""} ${values.missingProof || values.proofGap || ""}`;
  if (/roi|business case/i.test(text)) return "ROI calculator or business-case worksheet";
  if (/margin|cost|dollar|savings/i.test(text)) return "Cost or margin proof sheet";
  if (/time|hours|days|cycle|manual/i.test(text)) return "Time-savings proof point or quantified case study";
  if (/risk|quality|compliance|delay/i.test(text)) return "Risk-reduction proof story";
  return "Customer quote, before/after example, or one-page proof asset";
}

function valueClaimSummary(values) {
  const score = scoreValueClaim(values);
  const status = valueClaimStatus(score);
  const outcome = valueClaimOutcome(values);
  const claim = values.buyerFacingClaim || values.buyerLanguage || "";
  const metric = valueClaimMetric(values) || "No success metric selected";
  return [
    `Claim readiness: ${status}.`,
    `Score: ${score} / 12.`,
    `Value claim: ${claim || outcome}.`,
    `Success metric: ${metric}.`,
    `Top gap: ${valueClaimTopGap(values)}`,
    `Recommended action: ${valueClaimRecommendedAction(values)}`,
    `Suggested asset: ${valueClaimSuggestedAsset(values)}.`
  ].join(" ");
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
    implementationFit: "Fit",
    urgency: "Pain / Urgency",
    abilityToPay: "Economic Value",
    easeOfAccess: "Winability",
    proofEvidence: "Evidence Confidence"
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
    text: `Customer Group Hypothesis Score: ${total}. ${scoreBreakdown}. Recommendation: ${recommendation}. A group becomes an ICP candidate when it is measurable, reachable, meaningfully different, actionable, and valuable enough to prioritize.`
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
  const coreValues = [values.blocker, values.whyItMatters, values.mustBeTrue].map((value) => String(value || "").trim()).filter(Boolean);
  const normalized = coreValues.map((value) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim());
  const repeatsAnswer = normalized.some((value, index) => normalized.indexOf(value) !== index);
  const looksLikeCopiedPlanSummary = coreValues.some((value) => value.length > 180 && (value.match(/[.!?]/g) || []).length >= 2 && /(?:schedule|diagnostic|customer|manufacturer|company|segment|buyer)/i.test(value));
  if (repeatsAnswer || looksLikeCopiedPlanSummary) {
    return "This blocker is not ready to use. Replace the repeated customer or plan summary with one specific obstacle, why it matters, what must change, and the next action.";
  }
  const sentence = (value, fallback) => String(value || fallback).trim().replace(/[.]+$/, "");
  return `${sentence(values.successFocus, "Success plan")} blocker: ${sentence(values.blocker, "Not defined")}. Why it matters: ${sentence(values.whyItMatters, "Not defined")}. Required resolution: ${sentence(values.mustBeTrue, "Define what must be true")}. Next action: ${sentence(values.nextAction, "Not defined")}. Owner: ${sentence(values.owner, "Not assigned")}. Timing: ${sentence(values.timeframe, "Not set")}.`;
}

function createCardField(field, name) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  const inputField = field.type === "repeatableList" && field.itemType === "select"
    ? { ...field, type: "multiSelectDropdown" }
    : field;
  const input = createInput(inputField, name);

  wrapper.className = field.full ? "full" : "";
  if (field.showWhen) {
    const parts = name.split("__");
    parts[parts.length - 1] = field.showWhen.field;
    wrapper.dataset.showWhenField = parts.join("__");
    if (Object.prototype.hasOwnProperty.call(field.showWhen, "contains")) {
      wrapper.dataset.showWhenContains = field.showWhen.contains;
    } else if (Object.prototype.hasOwnProperty.call(field.showWhen, "values")) {
      wrapper.dataset.showWhenValues = JSON.stringify(field.showWhen.values);
    } else if (Object.prototype.hasOwnProperty.call(field.showWhen, "checked")) {
      wrapper.dataset.showWhenChecked = String(field.showWhen.checked);
    } else {
      wrapper.dataset.showWhenValue = field.showWhen.value;
    }
    if (field.showWhen.defaultVisible) {
      wrapper.dataset.showWhenDefaultVisible = "true";
    }
  }
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

  if (supportsOtherField(inputField)) {
    wrapper.appendChild(createOtherField(input, inputField.otherLabel || "Define other", inputField.otherValue || otherOptionValue(inputField) || "Other", Boolean(inputField.requireOther)));
  }

  if (field.hint) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = field.hint;
    wrapper.appendChild(hint);
  }

  appendCopyableExample(wrapper, field, input);

  return { wrapper, input };
}

function createCardTable(table) {
  const wrapper = document.createElement("div");
  const title = document.createElement("h3");
  const list = document.createElement("div");
  const button = document.createElement("button");
  const groups = [...new Set(table.columns.map((column) => column.group || "Details"))];
  const maxRows = table.maxRows || 5;
  const showGeneratedSummary = Boolean(table.summaryType) || table.id === "valueClaims" || table.id.endsWith("__valueClaims");

  wrapper.className = "repeatable-card-section";
  title.textContent = table.title;
  list.className = "repeatable-card-list";
  list.dataset.repeatableCardListFor = table.id;
  button.type = "button";
  button.className = "secondary card-add-button";
  button.dataset.addCard = table.id;
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
    remove.className = "secondary card-remove-button";
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
      const isCollapsibleGroup = table.advancedGroups?.includes(group) || table.collapsibleGroups?.includes(group);
      const section = isCollapsibleGroup ? document.createElement("details") : document.createElement("div");
      const sectionHeading = document.createElement("h5");
      const grid = document.createElement("div");

      section.className = "card-subsection";
      if (isCollapsibleGroup) {
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
      generatedLabel.textContent = (table.id === "valueClaims" || table.id.endsWith("__valueClaims"))
        ? "Claim readiness:"
        : table.summaryType === "segmentFit"
        ? "Fit Score"
        : table.summaryType === "blockerStatement"
          ? "Blocker summary:"
          : table.summaryType === "successStatement"
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

      if ((table.id === "valueClaims" || table.id.endsWith("__valueClaims")) && inputs.beforeState && inputs.afterState) {
        const offerRowId = scopedOfferRowIdFromTable(table.id);
        const data = getFormData();
        if (shouldReplaceGeneratedValueClaimState(inputs.beforeState.value)) {
          inputs.beforeState.value = generatedValueClaimBeforeState(values, data, offerRowId);
          values.beforeState = inputs.beforeState.value;
        }
        if (shouldReplaceGeneratedValueClaimState(inputs.afterState.value)) {
          inputs.afterState.value = generatedValueClaimAfterState(values, data, offerRowId);
          values.afterState = inputs.afterState.value;
        }
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
  const tableTitleId = `${String(table.id || "table").replace(/[^a-z0-9_-]+/gi, "-")}-title`;

  wrapper.className = "table-wrap";
  title.textContent = table.title;
  title.id = tableTitleId;
  htmlTable.setAttribute("aria-labelledby", tableTitleId);
  firstHeader.textContent = table.repeatable ? table.rowLabel : "Item";
  firstHeader.scope = "col";
  headerRow.appendChild(firstHeader);

  table.columns.forEach((column) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = column.label;
    if (column.required) {
      th.textContent = `${column.label} *`;
    }
    headerRow.appendChild(th);
  });

  if (table.scoreMatrix) {
    const th = document.createElement("th");
    th.textContent = "Total";
    th.scope = "col";
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
    const rowHeader = document.createElement("th");
    const rowInputs = {};
    const rowInput = table.repeatable
      ? createInput({ id: `${table.id}__${row.id}__label`, type: "text" }, `${table.id}__${row.id}__label`)
      : null;

    if (rowInput) {
      rowInput.placeholder = row.label;
      rowInput.setAttribute("aria-label", `${table.rowLabel}: ${row.label}`);
      rowHeader.appendChild(rowInput);
    } else {
      rowHeader.textContent = row.label;
    }
    rowHeader.scope = "row";

    tr.appendChild(rowHeader);

    table.columns.forEach((column) => {
      const td = document.createElement("td");
      const cellField = fieldForCell(column, row);
      const input = createInput(cellField, fieldName(table.id, row.id, column.id));
      input.required = Boolean(cellField.required);
      input.setAttribute("aria-label", `${row.label}: ${column.label}`);
      rowInputs[column.id] = input;
      td.appendChild(cellField.type === "money" ? createMoneyControl(input) : input);

      if (supportsOtherField(cellField)) {
        td.appendChild(createOtherField(input, cellField.otherLabel || "Other tool name", cellField.otherValue || otherOptionValue(cellField) || "Other", Boolean(cellField.requireOther)));
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

function firstFilledValue(...values) {
  return values.map((value) => String(value || "").trim()).find(Boolean) || "";
}

function readableListValue(value) {
  return uniqueListParts(value).join("; ");
}

function uniqueListParts(value) {
  const seen = new Set();
  return String(value || "")
    .split(/[;|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function listParts(value) {
  return uniqueListParts(value);
}

function meaningfulReadableValue(...values) {
  const ignored = /^(not sure yet|i don't know yet|unknown|select one|other)$/i;
  return readableListValue(
    values
      .flatMap((value) => listParts(value))
      .filter((value) => !ignored.test(value))
      .join("; ")
  );
}

function firstMeaningfulValue(...values) {
  return listParts(meaningfulReadableValue(...values))[0] || "";
}

function valueLooksKnown(value) {
  const text = String(value || "").trim();
  return Boolean(text) && !/^(not captured yet|not selected yet|not sure yet|i don't know yet|unknown|select one)$/i.test(text);
}

function sentenceFragment(value) {
  const text = String(value || "").trim().replace(/[.?!]+$/, "");
  if (!text) {
    return "";
  }

  if (/^[A-Z]{2,}\b/.test(text)) {
    return text;
  }

  return text.charAt(0).toLowerCase() + text.slice(1);
}

function targetPhraseForRule(target) {
  const text = String(target || "").trim();
  if (!text || /^the selected first-win segment$/i.test(text)) {
    return "targets in the selected first-win segment";
  }

  const normalized = /^(End users|Consumers|Users|Buyers|Retail buyers|Channel buyers)\b/.test(text)
    ? sentenceFragment(text)
    : text;
  const alreadyPluralGroup = /(targets|buyers|users|customers|accounts|people|consumers|stores|retailers|wholesalers|distributors|companies|teams|brands|businesses|households|segments|groups)$/i.test(normalized);
  return alreadyPluralGroup ? normalized : `${normalized} targets`;
}

function capitalizeSentenceFragment(value) {
  const text = String(value || "").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function cleanDecisionRuleDetail(rule, label) {
  const text = String(rule || "").trim();
  if (!text) {
    return "";
  }

  return text
    .replace(new RegExp(`^${label}:\\s*`, "i"), "")
    .replace(new RegExp(`^${label}\\s+(?:when|if)\\s+`, "i"), "")
    .replace(/[.]+$/, "");
}

function decisionRuleLine(label, details = []) {
  const cleaned = uniqueListParts(details.join("; "))
    .map((item) => item.replace(/[.]+$/, "").trim())
    .filter(Boolean);

  return `${label}: ${cleaned.join("; ")}`;
}

function validationThresholdRules(...values) {
  const text = values.join("; ").toLowerCase();
  const continueRules = [];
  const reviseRules = [];
  const stopRules = [];

  if (/waitlist|sign[ -]?up|signup/.test(text)) {
    continueRules.push("When 50 qualified people join the waitlist or signup list");
    reviseRules.push("When people show interest but do not join the waitlist or signup list");
    stopRules.push("When fewer than 10 qualified people join after a reasonable outreach test");
  }

  if (/online sales|sales test|preorder|pre-order|order|buy|purchase|deposit/.test(text)) {
    continueRules.push("When at least 3 qualified buyers attempt to buy, preorder, place a deposit, or request purchase details");
    reviseRules.push("When people like the idea but hesitate at the buying step");
    stopRules.push("When no qualified buyer will take a purchase-oriented next step");
  }

  if (/willingness to pay|price|pricing|price point/.test(text)) {
    continueRules.push("When at least 10 qualified buyers give usable price or willingness-to-pay feedback");
    reviseRules.push("When price feedback is inconsistent or below the level needed for the business to work");
    stopRules.push("When buyers consistently reject the price needed to make the offer viable");
  }

  if (/message clarity|clarity|understand|value proposition/.test(text)) {
    continueRules.push("When at least 5 qualified buyers can explain the value and use case in their own words");
    reviseRules.push("When buyers cannot quickly explain what the product is for or why it matters");
  }

  return { continueRules, reviseRules, stopRules };
}

function preRevenueSegmentDisplayName(row) {
  if (!row) {
    return "";
  }

  return firstFilledValue(
    row.values.segmentName__other,
    row.values.segmentNameUnknown,
    row.values.segmentName,
    row.values.groupName,
    row.values.specificDefinition
  );
}

function selectedPreRevenueDiscoverySegment(data = getFormData()) {
  const segments = tableRowsFromData(data, "preCustomerHypotheses");
  const selectedName = firstFilledValue(data.preDiscoveryTargetSegment, data.prePrimaryHypothesis);

  if (selectedName) {
    const match = segments.find((row) => preRevenueSegmentDisplayName(row) === selectedName);
    if (match) {
      return match;
    }
  }

  return segments[0] || null;
}

function preRevenueBuyerDiscoveryItems(data = getFormData()) {
  const segment = selectedPreRevenueDiscoverySegment(data);
  const values = segment?.values || {};
  const buyingPath = firstFilledValue(data.preDiscoveryBuyingPath, values.likelyBuyerPath, data.preRevenueRouteToMarket);
  const isDtc = /direct|consumer|end user|influencer|community/i.test(buyingPath) || /mixed|not sure/i.test(buyingPath);
  const isChannel = /retail|wholesale|distributor|marketplace|corporate|team|business/i.test(buyingPath) || /mixed|not sure/i.test(buyingPath);

  return [
    ["Segment to answer for", preRevenueSegmentDisplayName(segment) || data.prePrimaryHypothesis || "Not selected yet"],
    ["Likely buying path", buyingPath || "Not selected yet"],
    ["Problem or buying job already captured", readableListValue(firstFilledValue(values.problem, values.problemUnknown, data.preProblemHypothesisDtc, data.preProblemHypothesisChannel)) || "Not captured yet", sourceForPreRevenueSummaryGap("problem", data)],
    ["Why this might matter now", readableListValue(firstFilledValue(values.whyNow, values.whyNowUnknown, data.prePainMechanismDtc, data.prePainMechanismChannel)) || "Not captured yet", sourceForPreRevenueSummaryGap("urgency", data)],
    ["Buyer roles already mentioned", readableListValue(firstFilledValue(
      isDtc ? values.likelyBuyerDtc : "",
      isChannel ? values.likelyBuyerChannel : "",
      values.likelyBuyerUnknown
    )) || "Not captured yet", sourceForPreRevenueSummaryGap("buyerRoles", data)],
    ["Validation path already mentioned", readableListValue(firstFilledValue(
      isDtc ? firstFilledValue(values.validationPathDtc, values.validationPathDtcUnknown) : "",
      isChannel ? firstFilledValue(values.validationPathChannel, values.validationPathChannelUnknown) : "",
      values.validationPath,
      values.validationPathUnknown
    )) || "Not captured yet", sourceForPreRevenueSummaryGap("validationPath", data)],
    ["Evidence already mentioned", readableListValue(firstFilledValue(
      isDtc ? firstFilledValue(values.evidenceAvailableDtc, values.evidenceAvailableDtcUnknown) : "",
      isChannel ? firstFilledValue(values.evidenceAvailableChannel, values.evidenceAvailableChannelUnknown) : ""
    )) || "Not captured yet", sourceForPreRevenueSummaryGap("evidence", data)],
    ["Known buyer worries or risks", readableListValue(firstFilledValue(
      isDtc ? firstFilledValue(values.riskRequirementsDtc, values.riskRequirementsDtcUnknown) : "",
      isChannel ? firstFilledValue(values.riskRequirementsChannel, values.riskRequirementsChannelUnknown) : ""
    )) || "Not captured yet", sourceForPreRevenueSummaryGap("risk", data)]
  ];
}

function renderPreRevenueBuyerDiscoveryContext(sectionEl) {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const intro = document.createElement("p");
  const grid = document.createElement("div");

  card.className = "summary-card pre-revenue-context-card";
  card.dataset.preRevenueBuyerDiscoveryContext = "true";
  heading.textContent = "Earlier Target Summary";
  intro.textContent = "Use this as the reference point for the discovery questions below. If the target, path, problem, or buyer context does not look right, go back and revise the earlier target section before continuing.";
  grid.className = "summary-grid";

  preRevenueBuyerDiscoveryItems().forEach((summaryItem) => {
    const [label] = summaryItem;
    const item = document.createElement("div");
    const itemLabel = document.createElement("div");
    const itemValue = document.createElement("div");

    item.className = "summary-item";
    itemLabel.className = "summary-label";
    itemValue.className = "summary-value";
    itemLabel.textContent = label;
    setSummaryValue(itemValue, summaryItem, 6);
    item.appendChild(itemLabel);
    item.appendChild(itemValue);
    grid.appendChild(item);
  });

  card.appendChild(heading);
  card.appendChild(intro);
  card.appendChild(grid);
  sectionEl.appendChild(card);
}

function updatePreRevenueBuyerDiscoveryContext() {
  const card = document.querySelector("[data-pre-revenue-buyer-discovery-context='true']");
  if (!card) {
    return;
  }

  const values = card.querySelectorAll(".summary-value");
  preRevenueBuyerDiscoveryItems().forEach((summaryItem, index) => {
    if (values[index]) {
      setSummaryValue(values[index], summaryItem, 6);
    }
  });
}

function selectHasOption(select, value) {
  return Boolean(select && Array.from(select.options).some((option) => option.value === value));
}

function updatePreRevenueBuyerDiscoveryDefaults() {
  const data = getFormData();
  const targetSelect = document.querySelector("[name='preDiscoveryTargetSegment']");
  const pathSelect = document.querySelector("[name='preDiscoveryBuyingPath']");
  const selectedTarget = targetSelect?.value || data.preDiscoveryTargetSegment || "";
  const inferredSegment = selectedPreRevenueDiscoverySegment(data);
  const inferredTarget = preRevenueSegmentDisplayName(inferredSegment) || data.prePrimaryHypothesis || "";
  const inferredBuyingPath = String(inferredSegment?.values?.likelyBuyerPath || "").trim();

  if (!targetSelect && inferredTarget && !String(formStateData.preDiscoveryTargetSegment || "").trim()) {
    formStateData.preDiscoveryTargetSegment = inferredTarget;
  }

  if (!pathSelect && inferredBuyingPath && !String(formStateData.preDiscoveryBuyingPath || "").trim()) {
    formStateData.preDiscoveryBuyingPath = inferredBuyingPath;
  }

  if (targetSelect && !targetSelect.value && data.prePrimaryHypothesis && selectHasOption(targetSelect, data.prePrimaryHypothesis)) {
    targetSelect.value = data.prePrimaryHypothesis;
  }

  if (pathSelect) {
    const segment = selectedPreRevenueDiscoverySegment({
      ...data,
      preDiscoveryTargetSegment: targetSelect?.value || data.preDiscoveryTargetSegment
    });
    const buyingPath = String(segment?.values?.likelyBuyerPath || "").trim();

    if (
      buyingPath
      && selectHasOption(pathSelect, buyingPath)
      && (
        !pathSelect.value
        || selectedTarget !== String(pathSelect.dataset.lastContextTarget || "")
        || pathSelect.dataset.pathWasInferred === "true"
      )
    ) {
      pathSelect.value = buyingPath;
      pathSelect.dataset.pathWasInferred = "true";
    }

    pathSelect.dataset.lastContextTarget = selectedTarget;
  }
}

function preRevenueValidationMotionItems(data = getFormData()) {
  const segment = selectedPreRevenueDiscoverySegment(data);
  const values = segment?.values || {};
  const buyingPath = firstFilledValue(data.preDiscoveryBuyingPath, values.likelyBuyerPath, data.preRevenueRouteToMarket);
  const pathKind = pathKindForBuyingPath(buyingPath || data.preRevenueRouteToMarket);
  const isDtc = pathKind === "dtc" || pathKind === "mixed";
  const isChannel = pathKind === "channel" || pathKind === "mixed";
  const target = preRevenueSegmentDisplayName(segment) || data.prePrimaryHypothesis || "the selected first-win segment";
  const targetForSentence = targetPhraseForRule(target);
  const buyerRoles = readableListValue(firstFilledValue(
    isDtc ? values.likelyBuyerDtc : "",
    isChannel ? values.likelyBuyerChannel : "",
    values.likelyBuyerUnknown,
    data.preDtcPrimaryBuyer,
    data.preChannelPrimaryBuyer
  ));
  const routeToMarket = meaningfulReadableValue(data.preRevenueRouteToMarket);
  const broadMarket = meaningfulReadableValue(data.preBroadMarket, data.preBroadMarketUnknownUse, data.preBroadMarketUnknownComparable);
  const firstCustomerTypes = meaningfulReadableValue(data.preFirstCustomerTypes, data.preFirstCustomerUnknownAccess, data.preBroadCustomerTypes);
  const segmentType = meaningfulReadableValue(values.segmentType, values.segmentTypeUnknown, values.segmentName__other, values.segmentName);
  const segmentTraits = meaningfulReadableValue(values.specificUseCaseDefinition, values.description, values.specificDefinition);
  const reachPath = meaningfulReadableValue(values.reachability, values.reachabilityUnknown, data.preFastestPathToTest, data.preRoutingDecisionNextStep, data.preFirstCustomerUnknownAccess);
  const problem = meaningfulReadableValue(values.problem, values.problemUnknown, data.preProblemHypothesisDtc, data.preProblemHypothesisChannel, data.preBroadMarketProblem, data.preProblemUnknownMoment, data.preProblemUnknownAlternative);
  const primaryProblem = firstMeaningfulValue(problem);
  const urgency = meaningfulReadableValue(values.whyNow, values.whyNowUnknown, data.preUrgencyTriggerDtc, data.preUrgencyTriggerChannel, data.prePainMechanismDtc, data.prePainMechanismChannel, values.timingRequirements);
  const validationPath = meaningfulReadableValue(
    isDtc ? firstFilledValue(values.validationPathDtc, values.validationPathDtcUnknown) : "",
    isChannel ? firstFilledValue(values.validationPathChannel, values.validationPathChannelUnknown) : "",
    data.preFastestPathToTest,
    data.preRoutingDecisionNextStep
  );
  const firstCommitment = meaningfulReadableValue(data.preWedgeOfferType, data.preWedgeOfferName, data.preWedgeOutcome, data.prePriceTest);
  const primaryCommitment = firstMeaningfulValue(firstCommitment);
  const proofRisk = meaningfulReadableValue(
    isDtc ? firstFilledValue(values.riskRequirementsDtc, values.riskRequirementsDtcUnknown, data.preDtcTrustConcerns) : "",
    isChannel ? firstFilledValue(values.riskRequirementsChannel, values.riskRequirementsChannelUnknown, data.preChannelProofConcerns) : "",
    data.prePathDecisionCriteria
  );
  const primaryProofRisk = firstMeaningfulValue(proofRisk);
  const credibility = meaningfulReadableValue(values.credibility, values.credibilityUnknown);
  const evidence = meaningfulReadableValue(
    isDtc ? firstFilledValue(values.evidenceAvailableDtc, values.evidenceAvailableDtcUnknown, data.preProblemEvidenceDtc) : "",
    isChannel ? firstFilledValue(values.evidenceAvailableChannel, values.evidenceAvailableChannelUnknown, data.preProblemEvidenceChannel) : "",
    data.preProblemEvidenceDtc,
    data.preProblemEvidenceChannel
  );
  const successSignal = meaningfulReadableValue(values.successRequirements, values.successRequirementsUnknown, data.preWedgeSuccessCriteria, data.preWedgeOutcome);
  const primarySuccessSignal = firstMeaningfulValue(successSignal);
  const deliveryFit = meaningfulReadableValue(values.deliveryFit, values.implementationRequirements, data.preWedgeIncluded);
  const assumptions = meaningfulReadableValue(values.assumptions, data.preHypothesisReason);
  const recommendedSources = reachPath
    ? `Use ${reachPath} as the first source because it is already the clearest access path for ${target}.`
    : isChannel
      ? `Start with reachable channel or business-buyer sources for ${target}: warm introductions, existing buyer lists, partner/distributor contacts, marketplaces, trade shows, or industry groups.`
      : `Start with reachable consumer/user sources for ${target}: founder network, existing audience, communities, social channels, events, warm referrals, or customer interviews.`;
  const recommendedAudience = [
    `Start with ${targetForSentence}`,
    segmentType ? `defined as ${segmentType}` : "",
    segmentTraits ? `with traits such as ${segmentTraits}` : firstCustomerTypes ? `inside ${firstCustomerTypes}` : "",
    buyerRoles ? `prioritizing ${buyerRoles}` : "",
    broadMarket && !segmentTraits ? `from the ${broadMarket} context` : ""
  ].filter(Boolean).join("; ") + ".";
  const recommendedIncludeRule = [
    `Include targets that match ${target}`,
    primaryProblem ? `show signs of ${primaryProblem}` : "can react to the core problem hypothesis",
    urgency ? `have a reason to care now such as ${urgency}` : "can explain whether the timing matters",
    reachPath ? `are reachable through ${reachPath}` : "can be reached in the next 30 days",
    primaryCommitment ? `can take a small next step around ${primaryCommitment}` : "can take a small validation step"
  ].filter(Boolean).join("; ") + ".";
  const recommendedExcludeRule = [
    `Exclude targets outside ${target}`,
    "people or accounts you cannot reach quickly",
    deliveryFit ? `targets that would require more delivery capacity than ${deliveryFit}` : "targets that require heavy customization or a long buying process",
    isChannel ? "buyers who cannot review terms, fit, margin, demand, or a small test" : "consumers who cannot react to the use case, price, proof, or next step"
  ].join("; ") + ".";
  const recommendedMessage = [
    `Lead with ${primaryProblem || "the problem or buying job"}`,
    urgency ? `connect it to ${urgency}` : "connect it to the use case, occasion, workflow, or timing reason",
    target ? `make it specific to ${target}` : "",
    primaryCommitment ? `ask for ${primaryCommitment}` : "ask for one small validation commitment"
  ].filter(Boolean).join("; ");
  const recommendedProof = [
    evidence ? `Use ${evidence} as the current credibility cue` : credibility ? `Use ${credibility} as the credibility cue` : "",
    primaryProofRisk ? `directly address ${primaryProofRisk}` : "",
    !evidence && !credibility ? (isChannel
      ? "Keep the message honest: say you are validating buyer demand, economic fit, channel fit, and low-risk test requirements."
      : "Keep the message honest: say you are validating the use case, product difference, and willingness to take a small next step.") : ""
  ].filter(Boolean).join("; ");
  const recommendedAsk = validationPath || [
    primaryCommitment ? `Ask for ${primaryCommitment}` : "",
    primarySuccessSignal ? `treat ${primarySuccessSignal} as the target signal` : "",
    !primaryCommitment && !primarySuccessSignal ? (isChannel
      ? "ask for a concept, demo, sample, beta, pilot, test order, pricing/terms review, or buyer introduction"
      : "ask for feedback, waitlist, preorder, signup, trial, sample/demo review, referral, or willingness-to-pay input") : ""
  ].filter(Boolean).join("; ");
  const recommendedWeeklyTarget = reachPath && /existing|founder|warm|customer|prospect|list|community|event|trade/i.test(reachPath)
    ? (isChannel
      ? `Each week, use ${reachPath} to identify 10-20 qualified buyer/account targets and complete 3-5 useful conversations, reviews, or next-step requests.`
      : `Each week, use ${reachPath} to identify 15-30 reachable people and complete 5-10 useful reactions, conversations, signups, or commitment tests.`)
    : isChannel
      ? "Each week, contact 10-20 reachable buyers or accounts and complete 3-5 useful buyer conversations, reviews, or next-step requests."
      : "Each week, contact 15-30 reachable buyers or users and complete 5-10 useful conversations, reactions, signups, or commitment tests.";
  const recommendedWeeklyActivity = [
    "Build or clean the list",
    recommendedSources.replace(/^Use |^Start with /, "").replace(/\.$/, ""),
    "send outreach",
    "follow up",
    primaryCommitment ? `ask for ${primaryCommitment}` : "ask for the smallest next step",
    "record evidence and objections",
    "revise the test weekly"
  ].join("; ") + ".";
  const recommendedPositiveSignal = isChannel
    ? `Positive signal: ${primarySuccessSignal || "the buyer can name where it fits, asks about terms/pricing/proof, requests review materials, introduces the right stakeholder, or considers a pilot/test order."}`
    : `Positive signal: ${primarySuccessSignal || "the buyer recognizes the problem, shares a workaround, asks about price/timing, joins a list, signs up/preorders, requests a sample/demo, or recommends another buyer."}`;
  const problemPhrase = sentenceFragment(primaryProblem || "the problem matters");
  const urgencyPhrase = sentenceFragment(firstMeaningfulValue(urgency));
  const proofRiskPhrase = sentenceFragment(primaryProofRisk);
  const successSignalPhrase = sentenceFragment(primarySuccessSignal);
  const commitmentPhrase = sentenceFragment(primaryCommitment);
  const thresholdRules = validationThresholdRules(firstCommitment, successSignal, validationPath, recommendedPositiveSignal, recommendedAsk);
  const stopReachabilityRule = /^targets in\b/i.test(targetForSentence)
    ? `${capitalizeSentenceFragment(targetForSentence)} are not reachable`
    : `The selected ${targetForSentence} are not reachable`;
  const recommendedContinue = [
    `When multiple ${targetForSentence} confirm that ${problemPhrase}`,
    ...thresholdRules.continueRules,
    successSignalPhrase ? `When the test produces evidence such as ${successSignalPhrase}` : "When at least one meaningful next-step signal appears"
  ].filter(Boolean).join("; ") + ".";
  const recommendedRevise = [
    "When people respond but do not understand the value",
    ...thresholdRules.reviseRules,
    urgencyPhrase ? `When the reason to act is ${urgencyPhrase}, but buyers still do not take action` : "When urgency is weak",
    proofRiskPhrase ? `When the proof concern is ${proofRiskPhrase} and it blocks the next step` : "When proof or credibility is missing"
  ].filter(Boolean).join("; ") + ".";
  const recommendedStop = [
    `When ${sentenceFragment(stopReachabilityRule)}`,
    ...thresholdRules.stopRules,
    primaryProblem ? `When targets do not recognize that ${problemPhrase}` : "When targets do not recognize the problem",
    commitmentPhrase ? `When no one will take the ${commitmentPhrase} step` : "When no one will take a small next step"
  ].filter(Boolean).join("; ") + ".";

  return [
    ["Our recommendation: first test audience", recommendedAudience],
    ["Our recommendation: first sources to try", recommendedSources],
    ["Our recommendation: include rule", recommendedIncludeRule],
    ["Our recommendation: exclude rule", recommendedExcludeRule],
    ["Our recommendation: core data to capture", "For every target capture name/account, role, why they match, source, contact method, current alternative, likely problem, relevant context, question to ask, and next step requested."],
    ["Our recommendation: message to test", recommendedMessage],
    ["Our recommendation: proof or credibility cue", recommendedProof],
    ["Our recommendation: ask / next step", recommendedAsk],
    ["Our recommendation: weekly activity target", recommendedWeeklyTarget],
    ["Our recommendation: weekly work pattern", recommendedWeeklyActivity],
    ["Our recommendation: positive signal", recommendedPositiveSignal],
    ["Our recommendation: continue rule", recommendedContinue],
    ["Our recommendation: revise rule", recommendedRevise],
    ["Our recommendation: stop or pause rule", recommendedStop],
    ["Target audience for this motion", target],
    ["Buying path to keep in mind", buyingPath || "Not selected yet"],
    ["Problem / buying job being tested", problem || "Not captured yet", sourceForPreRevenueSummaryGap("problem", data)],
    ["Urgency or reason to act", urgency || "Not captured yet", sourceForPreRevenueSummaryGap("urgency", data)],
    ["Buyer roles already identified", buyerRoles || "Not captured yet", sourceForPreRevenueSummaryGap("buyerRoles", data)],
    ["Suggested validation path", validationPath || "Not captured yet", sourceForPreRevenueSummaryGap("validationPath", data)],
    ["First offer or commitment", firstCommitment || "Not captured yet", sourceForPreRevenueSummaryGap("firstCommitment", data)],
    ["Risk or proof question to watch", proofRisk || "Not captured yet", sourceForPreRevenueSummaryGap("risk", data)]
  ];
}

function preRevenueValidationRecommendationMap(data = getFormData()) {
  const entries = Object.fromEntries(preRevenueValidationMotionItems(data));

  return {
    validationChannel: entries["Our recommendation: first sources to try"] || "",
    targetListWho: entries["Our recommendation: first test audience"] || "",
    targetListFitSignals: entries["Our recommendation: include rule"] || "",
    targetListExclusions: entries["Our recommendation: exclude rule"] || "",
    messageLead: entries["Our recommendation: message to test"] || "",
    messageProofPoint: entries["Our recommendation: proof or credibility cue"] || "",
    messageAsk: entries["Our recommendation: ask / next step"] || "",
    weeklyActivityTarget: entries["Our recommendation: weekly activity target"] || "",
    weeklyActivityMix: entries["Our recommendation: weekly work pattern"] || "",
    positiveSignal: entries["Our recommendation: positive signal"] || "",
    continueCriteria: entries["Our recommendation: continue rule"] || "",
    reviseTriggers: entries["Our recommendation: revise rule"] || "",
    stopTriggers: entries["Our recommendation: stop or pause rule"] || ""
  };
}

function renderPreRevenueValidationMotionContext(sectionEl) {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const intro = document.createElement("p");
  const grid = document.createElement("div");

  card.className = "summary-card pre-revenue-context-card";
  card.dataset.preRevenueValidationMotionContext = "true";
  heading.textContent = "Our Recommendation for This Validation Motion";
  intro.textContent = "These recommendations are based on the earlier answers in the intake. Use them as the starting point for the 30-day test. The fields below are for confirming, revising, or adding to the recommendation, not for guessing from scratch.";
  grid.className = "summary-grid";

  preRevenueValidationMotionItems().forEach((summaryItem) => {
    const [label] = summaryItem;
    const item = document.createElement("div");
    const itemLabel = document.createElement("div");
    const itemValue = document.createElement("div");

    item.className = "summary-item";
    itemLabel.className = "summary-label";
    itemValue.className = "summary-value";
    itemLabel.textContent = label;
    setSummaryValue(itemValue, summaryItem, 6);
    item.appendChild(itemLabel);
    item.appendChild(itemValue);
    grid.appendChild(item);
  });

  card.appendChild(heading);
  card.appendChild(intro);
  card.appendChild(grid);
  sectionEl.appendChild(card);
}

function updatePreRevenueValidationMotionContext() {
  const card = document.querySelector("[data-pre-revenue-validation-motion-context='true']");
  if (!card) {
    return;
  }

  const values = card.querySelectorAll(".summary-value");
  preRevenueValidationMotionItems().forEach((summaryItem, index) => {
    if (values[index]) {
      setSummaryValue(values[index], summaryItem, 6);
    }
  });
}

function updatePreRevenueValidationMotionRecommendations() {
  const recommendations = {
    ...preRevenueValidationRecommendationMap(),
    ...preRevenueEvidenceTrackerRecommendationMap()
  };
  const fallback = "No recommendation available yet. Complete the earlier pre-revenue answers to improve this recommendation.";

  document.querySelectorAll("[data-field-recommendation-key]").forEach((element) => {
    const value = element.querySelector(".field-recommendation-value");
    if (value) {
      const key = element.dataset.fieldRecommendationKey;
      setExpandableText(value, recommendations[key] || fallback, key === "decisionRules" ? 90 : 18);
    }
  });

  document.querySelectorAll("[data-dropdown-recommendation-key]").forEach((element) => {
    const value = element.querySelector(".multi-select-recommendation-value");
    const recommendation = recommendations[element.dataset.dropdownRecommendationKey] || fallback;
    if (value) {
      setExpandableText(value, recommendation, 18);
    }
    element.querySelector(".multi-select-optional-recommendation")?.remove();
    if (element.dataset.dropdownRecommendationKey === "evidenceTracked" && recommendations.evidenceTrackedOptional) {
      const optional = document.createElement("div");
      const optionalTitle = document.createElement("div");
      const optionalValue = document.createElement("div");
      optional.className = "multi-select-optional-recommendation";
      optionalTitle.className = "multi-select-recommendation-title";
      optionalTitle.textContent = "Nice to know. Disregard if knowing does not impact the next decision.";
      optionalValue.className = "multi-select-recommendation-value";
      setExpandableText(optionalValue, recommendations.evidenceTrackedOptional, 18);
      optional.appendChild(optionalTitle);
      optional.appendChild(optionalValue);
      element.appendChild(optional);
    }
    const control = element.closest("[data-multi-select-dropdown]");
    if (control && typeof control.setRecommendedText === "function") {
      control.setRecommendedText(recommendation);
    }
  });

  document.querySelectorAll("select[data-recommendation-key]").forEach((select) => {
    const recommendation = recommendations[select.dataset.recommendationKey] || fallback;
    setRecommendationSelectText(select, recommendation);
  });
}

function preRevenueEvidenceTrackerItems(data = getFormData()) {
  const segment = selectedPreRevenueDiscoverySegment(data);
  const values = segment?.values || {};
  const validationEntries = Object.fromEntries(preRevenueValidationMotionItems(data));
  const buyingPath = firstFilledValue(data.preDiscoveryBuyingPath, values.likelyBuyerPath, data.preRevenueRouteToMarket);
  const pathKind = pathKindForBuyingPath(buyingPath || data.preRevenueRouteToMarket);
  const isChannel = pathKind === "channel" || pathKind === "mixed";
  const target = preRevenueSegmentDisplayName(segment) || data.prePrimaryHypothesis || "the selected first-win segment";
  const problem = meaningfulReadableValue(values.problem, values.problemUnknown, data.preProblemHypothesisDtc, data.preProblemHypothesisChannel, data.preBroadMarketProblem);
  const primaryProblem = firstMeaningfulValue(problem);
  const urgency = meaningfulReadableValue(values.whyNow, values.whyNowUnknown, data.preUrgencyTriggerDtc, data.preUrgencyTriggerChannel, data.prePainMechanismDtc, data.prePainMechanismChannel, values.timingRequirements);
  const buyerRoles = meaningfulReadableValue(
    isChannel ? values.likelyBuyerChannel : values.likelyBuyerDtc,
    values.likelyBuyerUnknown,
    data.preChannelPrimaryBuyer,
    data.preDtcPrimaryBuyer
  );
  const evidence = meaningfulReadableValue(
    isChannel ? firstFilledValue(values.evidenceAvailableChannel, values.evidenceAvailableChannelUnknown, data.preProblemEvidenceChannel) : firstFilledValue(values.evidenceAvailableDtc, values.evidenceAvailableDtcUnknown, data.preProblemEvidenceDtc),
    data.preProblemEvidenceDtc,
    data.preProblemEvidenceChannel
  );
  const proofRisk = meaningfulReadableValue(
    isChannel ? firstFilledValue(values.riskRequirementsChannel, values.riskRequirementsChannelUnknown, data.preChannelProofConcerns) : firstFilledValue(values.riskRequirementsDtc, values.riskRequirementsDtcUnknown, data.preDtcTrustConcerns),
    data.prePathDecisionCriteria
  );
  const firstCommitment = meaningfulReadableValue(data.preWedgeOfferType, data.preWedgeOfferName, data.preWedgeOutcome, data.prePriceTest);
  const primaryCommitment = firstMeaningfulValue(firstCommitment);
  const successSignal = meaningfulReadableValue(values.successRequirements, values.successRequirementsUnknown, data.preWedgeSuccessCriteria, data.preWedgeOutcome);
  const primarySuccessSignal = firstMeaningfulValue(successSignal);
  const validationAsk = validationEntries["Our recommendation: ask / next step"] || "";
  const positiveSignal = validationEntries["Our recommendation: positive signal"] || "";
  const mustKnowEvidence = [
    problem ? "Problem intensity" : "",
    "Current workaround",
    firstCommitment || successSignal ? "Next-step conversion" : "",
    "Objections"
  ].filter(Boolean);
  const niceToKnowEvidence = [
    buyerRoles ? "Buyer role" : "",
    urgency ? "Trigger event" : "",
    proofRisk ? "Requested proof" : "",
    "Words buyers use",
    isChannel ? "Pilot interest" : "Willingness to pay"
  ].filter(Boolean);
  const recommendedTracked = mustKnowEvidence.join("; ");
  const optionalTracked = niceToKnowEvidence.join("; ");
  const recommendedLocation = isChannel
    ? "Spreadsheet or CRM, with one row per buyer/account and columns for role, fit, proof requested, next step, and decision."
    : "Spreadsheet or Notion / docs, with one row per person and columns for segment fit, problem intensity, words used, objection, and next step.";
  const recommendedCadence = "Review weekly during the 30-day test, with a quick midweek scan if outreach volume is high.";
  const recommendedOwner = "The person running the validation motion should own the evidence review; if that is the founder, keep the review lightweight and weekly.";
  const targetForRule = targetPhraseForRule(target);
  const problemPhrase = sentenceFragment(primaryProblem || "the problem matters");
  const urgencyPhrase = sentenceFragment(firstMeaningfulValue(urgency));
  const proofRiskPhrase = sentenceFragment(firstMeaningfulValue(proofRisk));
  const successSignalPhrase = sentenceFragment(primarySuccessSignal);
  const commitmentPhrase = sentenceFragment(primaryCommitment);
  const thresholdRules = validationThresholdRules(firstCommitment, successSignal, validationAsk, positiveSignal);
  const stopReachabilityRule = /^targets in\b/i.test(targetForRule)
    ? `${capitalizeSentenceFragment(targetForRule)} are not reachable`
    : `The selected ${targetForRule} are not reachable`;
  const recommendedDecisionRules = [
    decisionRuleLine("Continue", [
      `When multiple ${targetForRule} confirm that ${problemPhrase}`,
      ...thresholdRules.continueRules,
      successSignalPhrase ? `When the test produces evidence such as ${successSignalPhrase}` : "When at least one meaningful next-step signal appears"
    ]),
    decisionRuleLine("Revise", [
      "When people respond but do not understand the value",
      ...thresholdRules.reviseRules,
      urgencyPhrase ? `When the reason to act is ${urgencyPhrase}, but buyers still do not take action` : "When urgency is weak",
      proofRiskPhrase ? `When the proof concern is ${proofRiskPhrase} and it blocks the next step` : "When proof or credibility is missing"
    ]),
    decisionRuleLine("Stop or pause", [
      `When ${sentenceFragment(stopReachabilityRule)}`,
      ...thresholdRules.stopRules,
      primaryProblem ? `When targets do not recognize that ${problemPhrase}` : "When targets do not recognize the problem",
      commitmentPhrase ? `When no one will take the ${commitmentPhrase} step` : "When no one will take a small next step"
    ])
  ].join("\n");

  return [
    ["Our recommendation: must-know evidence to track", recommendedTracked],
    ["Nice to know. Disregard if knowing does not impact the next decision.", optionalTracked],
    ["Our recommendation: tracking location", recommendedLocation],
    ["Our recommendation: review cadence", recommendedCadence],
    ["Our recommendation: evidence owner", recommendedOwner],
    ["Our recommendation: decision rules", recommendedDecisionRules],
    ["Target audience for this evidence review", target],
    ["Problem being validated", problem || "Not captured yet", sourceForPreRevenueSummaryGap("problem", data)],
    ["Urgency being validated", urgency || "Not captured yet", sourceForPreRevenueSummaryGap("urgency", data)],
    ["Primary next step to measure", firstCommitment || validationAsk || "Not captured yet", sourceForPreRevenueSummaryGap("firstCommitment", data)],
    ["Positive signal to look for", successSignal || positiveSignal || "Not captured yet", sourceForPreRevenueSummaryGap("validationPath", data)],
    ["Current evidence baseline", evidence || "Not captured yet", sourceForPreRevenueSummaryGap("evidence", data)],
    ["Risk or proof gap to watch", proofRisk || "Not captured yet", sourceForPreRevenueSummaryGap("risk", data)]
  ];
}

function preRevenueEvidenceTrackerRecommendationMap(data = getFormData()) {
  const entries = Object.fromEntries(preRevenueEvidenceTrackerItems(data));

  return {
    evidenceTracked: entries["Our recommendation: must-know evidence to track"] || "",
    evidenceTrackedOptional: entries["Nice to know. Disregard if knowing does not impact the next decision."] || "",
    trackingLocation: entries["Our recommendation: tracking location"] || "",
    reviewCadence: entries["Our recommendation: review cadence"] || "",
    learningOwner: entries["Our recommendation: evidence owner"] || "",
    decisionRules: entries["Our recommendation: decision rules"] || ""
  };
}

function conciseContextValue(value, maxItems = 3) {
  const parts = uniqueListParts(value).filter((item) => !/^not captured yet$/i.test(item));

  if (!parts.length) {
    return "Not captured yet";
  }

  return parts.join(", ");
}

function preRevenueEvidenceTrackerContextItems(entries) {
  return [
    ["Target audience", conciseContextValue(entries["Target audience for this evidence review"], 1)],
    ["Problem to validate", conciseContextValue(entries["Problem being validated"], 3)],
    ["Next step to measure", conciseContextValue(entries["Primary next step to measure"], 3)]
  ];
}

function renderEvidenceTrackerContextItems(card, entries) {
  const existing = card.querySelector(".summary-grid");
  const grid = existing || document.createElement("div");

  grid.className = "summary-grid evidence-context-grid";
  grid.innerHTML = "";
  preRevenueEvidenceTrackerContextItems(entries).forEach((summaryItem) => {
    const [label, value] = summaryItem;
    const item = document.createElement("div");
    const itemLabel = document.createElement("div");
    const itemValue = document.createElement("div");

    item.className = "summary-item";
    itemLabel.className = "summary-label";
    itemValue.className = "summary-value";
    itemLabel.textContent = label;
    setSummaryValue(itemValue, [label, value], 12);
    item.appendChild(itemLabel);
    item.appendChild(itemValue);
    grid.appendChild(item);
  });

  if (!existing) {
    card.appendChild(grid);
  }
}

function renderPreRevenueEvidenceTrackerContext(sectionEl) {
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const intro = document.createElement("p");
  const data = getFormData();
  const entries = Object.fromEntries(preRevenueEvidenceTrackerItems(data));

  card.className = "summary-card pre-revenue-context-card";
  card.dataset.preRevenueEvidenceTrackerContext = "true";
  heading.textContent = "Validation Test Context";
  intro.textContent = "Use this section to decide what evidence must be tracked for the specific validation test below.";

  card.appendChild(heading);
  card.appendChild(intro);
  renderEvidenceTrackerContextItems(card, entries);
  sectionEl.appendChild(card);
}

function updatePreRevenueEvidenceTrackerContext() {
  const card = document.querySelector("[data-pre-revenue-evidence-tracker-context='true']");
  if (!card) {
    return;
  }

  const entries = Object.fromEntries(preRevenueEvidenceTrackerItems());
  const intro = card.querySelector("p");
  if (intro) {
    intro.textContent = "Use this section to decide what evidence must be tracked for the specific validation test below.";
  }
  renderEvidenceTrackerContextItems(card, entries);
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

function renderCustomerContextStarter(sectionEl) {
  const context = String(getFormData().customerContextStarter || "").trim();
  if (!context) return;
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const intro = document.createElement("p");
  const source = document.createElement("p");
  card.className = "summary-card pre-revenue-context-card";
  card.dataset.customerContextStarter = "true";
  heading.textContent = "Customer Context Starter";
  intro.textContent = "Use this as source context for the structured ICP answers below. Confirm or refine the details with the guided questions; this description does not replace them.";
  source.textContent = context;
  card.append(heading, intro, source);
  sectionEl.appendChild(card);
}

function renderKnownBuyerBlockerContext(sectionEl) {
  const blocker = String(getFormData().dealBlocker || "").trim();
  if (!blocker || /^(?:none|unknown|not identified|not sure)$/i.test(blocker)) return;
  const card = document.createElement("div");
  const heading = document.createElement("h3");
  const explanation = document.createElement("p");
  card.className = "summary-card known-buyer-blocker-card";
  heading.textContent = `Potential buyer blocker already identified: ${blocker}`;
  explanation.textContent = "This is a buying-committee risk, not automatically an execution blocker. Add it to Top Blockers to Resolve only if this role could stop the 30-, 60-, or 90-day plan, and describe the specific objection or approval risk.";
  card.append(heading, explanation);
  sectionEl.appendChild(card);
}

function renderSectionBody(section, sectionEl) {
  if (section.introBlocks && section.introBlocks.length) {
    renderIntroBlocks(section.introBlocks, sectionEl);
  }

  if (["preRevenueBuyerDiscovery", "preRevenueValidationMotion", "preRevenueEvidenceTracker"].includes(section.id)) {
    renderCustomerContextStarter(sectionEl);
  }

  if (section.contextSummary === "preRevenueBuyerDiscovery") {
    renderPreRevenueBuyerDiscoveryContext(sectionEl);
  }

  if (section.contextSummary === "preRevenueValidationMotion") {
    renderPreRevenueValidationMotionContext(sectionEl);
  }

  if (section.contextSummary === "preRevenueEvidenceTracker") {
    renderPreRevenueEvidenceTrackerContext(sectionEl);
  }

  if (section.helpBlocks && section.helpBlocks.length) {
    sectionEl.appendChild(renderHelpBlocks(section.helpBlocks));
  }

  if (section.id === "goals") {
    renderKnownBuyerBlockerContext(sectionEl);
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

function offerCustomerGroupList(row) {
  const selected = String(row?.values.targetCustomerGroup || "")
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const newGroup = String(row?.values.newOfferCustomerGroup || "").trim();
  const values = selected.includes("Create a new customer group for this offer") && newGroup
    ? [...selected.filter((item) => item !== "Create a new customer group for this offer"), newGroup]
    : selected;

  return [...new Set(values)].filter(Boolean);
}

function offerCustomerGroupDisplay(row, fallback = "Not filled yet") {
  const groups = offerCustomerGroupList(row).filter((item) => item !== "Not sure yet");
  return groups.length ? groups.join("; ") : fallback;
}

function isCreateCustomerGroupOption(value) {
  return /^Create a new customer group for this /i.test(String(value || "").trim());
}

function normalizedCustomerGroupOption(value) {
  const text = String(value || "").trim();
  if (!text || /^not sure/i.test(text) || isCreateCustomerGroupOption(text)) {
    return "";
  }
  if (/^multi[-\s]?sku product companies$/i.test(text)) {
    return "Multi-Sku Branded Product Companies";
  }
  return text;
}

function collectSharedCustomerGroupOptions(data = getFormData()) {
  return [...new Set([
    data.bestFitCustomerGroup,
    ...customerGroupRows(data).map((row) => row.values.groupName),
    ...offerPortfolioRows(data).flatMap((row) => offerCustomerGroupList(row)),
    ...getSignalPlayRows(data).flatMap((row) => [row.values.newCustomerGroup, row.values.customerGroup]),
    ...getRevenueMotionRows(data).flatMap((row) => [row.values.newCustomerGroup, row.values.customerGroup])
  ].map(normalizedCustomerGroupOption).filter(Boolean))];
}

function primaryOfferRow(data = getFormData()) {
  const offers = offerPortfolioRows(data);
  return offers.find((row) => row.rowId === data.primaryGtmOffer)
    || offers.find((row) => String(row.values.offerName || "").trim().toLowerCase() === String(data.primaryGtmOffer || "").trim().toLowerCase())
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
  const offerProblemOptions = ["Lack of resources / capacity", "Lack of expertise / specialized capability", "Lack of capital / budget constraints", "Manual work or inefficient process", "Margin pressure or rising costs", "Vendor, supplier, or fulfillment issues", "Quality or delivery reliability issues", "Difficulty launching new products or offers", "Low lead quality or inconsistent demand", "Slow follow-up or missed opportunities", "Insufficient proof, trust, or business case", "Competitive pressure", "Implementation complexity", "Compliance, security, or risk pressure", "Other"];
  const offerTriggerOptions = ["Leadership change", "New funding", "Growth initiative", "Market expansion", "New product launch", "Cost pressure", "Customer complaints", "Vendor dissatisfaction", "System change", "Budget cycle", "Operational breakdown", "Competitor pressure", "Renewal window", "Other"];
  const workaroundOptions = ["Manual work", "Spreadsheets", "Internal team", "Incumbent vendor", "Point solution", "Agency", "Consultant", "Generic tool", "No formal solution", "Doing nothing", "Other"];
  const costOfInactionOptions = ["Lost revenue", "Higher costs", "Lower margin", "Launch delays", "Quality issues", "Customer churn", "Missed opportunities", "Operational risk", "Founder or team burnout", "Poor visibility", "Compliance or security risk", "Other"];
  const offerEvidenceOptions = ["Customer interview", "Current customer example", "Past customer example", "Win/loss pattern", "CRM data", "Sales call notes", "Pipeline pattern", "Case study", "Testimonial", "Reference customer", "Market research", "Founder observation", "Assumption only", "Other"];
  const useCaseOptions = ["Reduce manual work", "Increase qualified pipeline", "Improve conversion", "Reduce costs", "Improve margin", "Launch products faster", "Improve operational reliability", "Improve reporting or visibility", "Create a repeatable sales process", "Clarify positioning or messaging", "Build a target-account list", "Improve proof or buyer confidence", "Reduce implementation risk", "Other"];
  const buyerRequirementOptions = ["Budget owner access", "Executive sponsor", "Champion or day-to-day owner", "Clean data", "System access", "Implementation owner", "Process change", "Training / enablement", "Technical integration", "Security or privacy review", "Procurement review", "Low customization", "Other"];
  const outcomeTypeOptions = ["Save time", "Reduce cost", "Increase revenue", "Improve margin", "Launch faster", "Reduce risk", "Improve quality", "Increase capacity", "Improve customer experience", "Simplify operations", "Improve visibility", "Reduce dependency on internal resources", "Improve consistency", "Improve compliance", "Other / Not sure yet"];
  const successMetricOptions = ["Hours saved", "Days saved", "Cycle time reduction", "Fewer manual steps", "Fewer meetings", "Faster approval", "Faster launch", "Reduced internal workload", "Dollar savings", "Lower labor cost", "Lower vendor cost", "Lower rework cost", "Lower landed cost", "Lower support cost", "Lower software/tool cost", "Reduced waste", "More leads", "Higher conversion rate", "Faster sales cycle", "Larger average order", "More products launched", "More repeat purchases", "Higher retention", "Higher customer lifetime value", "Higher gross margin", "Lower production cost", "Lower defect/rework cost", "Better pricing power", "Improved product mix", "Reduced logistics cost", "Shorter development cycle", "Shorter sourcing cycle", "Shorter production timeline", "Faster time to first order", "Faster time to market", "Fewer delays", "Fewer quality issues", "Fewer supplier problems", "Fewer compliance issues", "Better predictability", "Lower operational dependency", "Quality improved", "Risk reduced", "Capacity increased", "Customer satisfaction improved", "Process visibility improved", "Other", "Not sure yet"];
  const buyerRoleOptions = ["Economic Buyer", "Executive Sponsor", "Champion", "Day-to-Day User", "Implementation Owner", "Finance / Procurement", "Technical / Security Reviewer", "Legal", "Operations", "Customer Success / Support", "Likely Blocker", "External Advisor / Consultant", "Board / Investor", "Other", "Not sure yet"];
  const buyerRoleReasonOptions = ["Owns the budget", "Feels the pain directly", "Uses the solution", "Approves the purchase", "Measures success", "Implements the solution", "Reviews risk", "Controls procurement", "Influences internal adoption", "Can block the deal", "Not sure yet"];
  const baselineUnitOptions = ["Hours", "Days", "Weeks", "Dollars", "Percentage", "Units", "Projects", "Products", "Defects", "Delays", "Manual steps", "People involved", "Other"];
  const baselineSourceOptions = ["Customer data", "Internal estimate", "CRM data", "Operational data", "Interview", "Case study", "Industry benchmark", "Assumption", "Other"];
  const buyerImprovementOptions = ["Fewer hours spent", "Faster launch", "Lower landed cost", "Fewer quality issues", "Higher margin", "Less management burden", "More team capacity", "More predictable delivery", "Better customer satisfaction", "Reduced operational risk", "Better visibility", "Better consistency", "Other", "Not sure yet"];
  const proofGapOptions = ["Need baseline metric", "Need quantified savings", "Need quantified result", "Need customer quote", "Need case study", "Need ROI calculator", "Need before/after example", "Need before/after story", "Need implementation proof", "Need reference customer", "Need comparison to current approach", "Need stronger message", "Need benchmark", "Need third-party validation", "Need clearer buyer language", "Need stronger discovery questions", "Not sure yet"];
  const evidenceAvailableOptions = ["Customer quote", "Customer testimonial", "Reference customer", "Before/after story", "Case study", "Quantified case study", "Internal data", "Customer data", "CRM data", "Operational data", "ROI calculator", "Demo", "Pilot result", "Benchmark data", "Third-party validation", "None yet", "Not sure yet"];

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
      <div class="summary-item"><div class="summary-label">Customer groups</div><div class="summary-value">${offerCustomerGroupDisplay(row)}</div></div>
      <div class="summary-item"><div class="summary-label">Primary buyer</div><div class="summary-value">${row.values.primaryBuyer || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Priority</div><div class="summary-value">${row.values.offerPriority || "Not filled yet"}</div></div>
    </div>
  `;
  details.appendChild(context);

  if (!offerCustomerGroupList(row).filter((item) => item !== "Not sure yet").length) {
    warning.className = "hint";
    warning.textContent = "Offer readiness is directional until this offer is tied to a priority customer group.";
    details.appendChild(warning);
  }

  const fieldBlocks = [
    {
      title: "Buyer Problem and Urgency",
      hint: "Define the problem this offer solves and why the buyer should act now.",
      fields: [
        { id: `${prefix}offerBuyerProblem`, label: "What urgent problem does this buyer have?", type: "multiSelectDropdown", otherLabel: "Define other buyer problem", requireOther: true, options: offerProblemOptions },
        { id: `${prefix}offerTriggerEvent`, label: "What makes this urgent now?", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add urgency trigger", otherLabel: "Define other urgency trigger", requireOther: true, options: offerTriggerOptions },
        { id: `${prefix}offerCurrentWorkaround`, label: "What are they doing today instead?", type: "multiSelectDropdown", otherLabel: "Define other workaround", requireOther: true, options: workaroundOptions },
        { id: `${prefix}offerCostOfInaction`, label: "What happens if they do nothing?", type: "multiSelectDropdown", otherLabel: "Define other cost of inaction", requireOther: true, options: costOfInactionOptions },
        { id: `${prefix}offerUrgencyLevel`, label: "Urgency level", type: "select", options: ["", "Low - problem exists, but timing is not urgent", "Medium - problem matters, but timing varies", "High - best-fit buyers have clear urgency", "Critical - urgent, budgeted, and time-sensitive"] },
        { id: `${prefix}offerUrgencyEvidence`, label: "What evidence shows this is urgent?", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add urgency evidence", otherLabel: "Define other urgency evidence", requireOther: true, options: offerEvidenceOptions },
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
          title: "Value Claims & Proof",
          hint: "Define the outcomes buyers care about, how those outcomes are measured, and what proof is needed before the claim is ready for sales messaging.",
          layout: "cards",
          repeatable: true,
          rowLabel: "Value Claim",
          minRows: 1,
          maxRows: 10,
          addLabel: "+ Add another value claim",
          advancedGroups: ["Measurement Details", "Evidence Details", "Before / After Story", "Action Plan Output"],
          columns: [
            { id: "outcomeType", label: "What outcome does the buyer want?", type: "select", group: "Claim Summary", otherValue: "Other / Not sure yet", otherLabel: "Describe the outcome", requireOther: true, options: ["", ...outcomeTypeOptions] },
            { id: "buyerFacingClaim", label: "Buyer-facing value claim", type: "textarea", group: "Claim Summary", full: true, hint: "Write this the way a buyer would describe the value, not as an internal product feature." },
            { id: "buyerRoles", label: "Who cares most about this claim?", type: "multiSelectDropdown", group: "Buyer Relevance", options: buyerRoleOptions },
            { id: "buyerRoleReason", label: "Why does this role care?", type: "multiSelectDropdown", group: "Buyer Relevance", options: buyerRoleReasonOptions },
            { id: "buyerPriorityLevel", label: "Buyer priority level", type: "select", group: "Buyer Relevance", options: ["", "High - this is a top buying reason", "Medium - this supports the decision", "Low - this is nice to have", "Unknown"] },
            { id: "successMetric", label: "How would the buyer measure success?", type: "select", group: "Measurement", otherLabel: "Define other success metric", requireOther: true, options: ["", ...successMetricOptions] },
            { id: "baselineStatus", label: "Do you know what is happening today?", type: "select", group: "Measurement", options: ["", "Known", "Estimated", "Unknown", "Not applicable"] },
            { id: "proofStrength", label: "How strong is the proof today?", type: "select", group: "Proof", options: ["", "No proof yet", "Anecdotal proof", "Internal estimate", "Customer quote", "Before/after example", "Case study", "Quantified case study", "ROI calculator", "Benchmark data", "Third-party validation", "Strong repeatable proof"] },
            { id: "salesReadiness", label: "Can this claim be used in sales messaging today?", type: "select", group: "Proof", options: ["", "Yes - ready to use", "Yes - but needs stronger proof", "Not yet - needs more validation", "Not sure"] },
            { id: "baselineValue", label: "Current baseline value", type: "text", group: "Measurement Details", showWhen: { field: "baselineStatus", values: ["Known", "Estimated"] } },
            { id: "baselineUnit", label: "Baseline unit", type: "select", group: "Measurement Details", showWhen: { field: "baselineStatus", values: ["Known", "Estimated"] }, options: ["", ...baselineUnitOptions] },
            { id: "baselineSource", label: "Baseline source", type: "select", group: "Measurement Details", showWhen: { field: "baselineStatus", values: ["Known", "Estimated"] }, options: ["", ...baselineSourceOptions] },
            { id: "targetImprovementType", label: "What improvement should the buyer expect?", type: "select", group: "Measurement Details", options: ["", "Specific number", "Percentage improvement", "Range", "Qualitative improvement", "Unknown"] },
            { id: "targetImprovementValue", label: "Target improvement value", type: "text", group: "Measurement Details" },
            { id: "targetImprovementUnit", label: "Target improvement unit", type: "text", group: "Measurement Details" },
            { id: "targetImprovementDescription", label: "Describe the expected improvement", type: "textarea", group: "Measurement Details", full: true },
            { id: "timeToImpact", label: "How quickly should they see impact?", type: "select", group: "Measurement Details", options: ["", "Immediate", "Within 30 days", "Within 60-90 days", "Within 3-6 months", "Within 6-12 months", "More than 12 months", "Unknown"] },
            { id: "buyerImprovement", label: "What should improve for the buyer?", type: "multiSelectDropdown", group: "Evidence Details", options: buyerImprovementOptions },
            { id: "evidenceAvailable", label: "What evidence do you already have?", type: "multiSelectDropdown", group: "Evidence Details", options: evidenceAvailableOptions },
            { id: "evidenceNotes", label: "Evidence notes", type: "textarea", group: "Evidence Details", full: true, hint: "Add details, examples, customer names, or context that may help the report language." },
            { id: "missingProof", label: "What proof is missing?", type: "multiSelectDropdown", group: "Evidence Details", options: proofGapOptions },
            { id: "proofGap", label: "What needs to be proven before this claim is credible?", type: "multiSelectDropdown", group: "Evidence Details", options: proofGapOptions },
            { id: "beforeState", label: "Before using this offer, the buyer is...", type: "textarea", group: "Before / After Story", full: true, hint: "Describe the buyer's current situation, pain, friction, or limitation." },
            { id: "afterState", label: "After using this offer, the buyer can...", type: "textarea", group: "Before / After Story", full: true, hint: "Describe what changes for the buyer after the offer works." },
            { id: "legacyWhatShouldImprove", label: "Legacy note: what should improve?", type: "textarea", group: "Action Plan Output", full: true, hint: "Preserved from older records when available. Do not use this as the primary scoring source." }
          ]
        }
      ]
    },
    {
      title: "Buyer Transformation Summary",
      hint: "The Buyer Transformation Summary explains the before-and-after state your buyer experiences when your offer succeeds. Example: Before: Manual reporting. After: Automated dashboards and weekly performance visibility.",
      fields: [
        { id: `${prefix}buyerTransformationSummary`, label: "Suggested buyer transformation summary", type: "textarea", placeholder: "Complete at least one value claim to generate the buyer transformation summary." }
      ]
    },
    {
      title: "Offer Promise",
      fields: [
        { id: `${prefix}oneSentencePromise`, label: "One-sentence offer promise", type: "textarea" },
        { id: `${prefix}suggestedOfferPromise`, label: "Suggested Offer Promise", type: "textarea", hint: "This is a draft recommendation generated from the offer inputs. Edit it as needed." },
        { id: `${prefix}offerDifferentiator`, label: "Why choose this instead of the current workaround or competitor?", type: "textarea" },
        { id: `${prefix}offerCategory`, label: "Offer type", type: "select", options: ["", "Software", "Service", "Platform", "Marketplace", "Consulting", "Managed service", "Product", "Diagnostic", "Pilot / proof of concept", "Hybrid", "Other"] },
        { id: `${prefix}mainProofPoint`, label: "Main proof point", type: "textarea" },
        { id: `${prefix}promiseClarityRating`, label: "Promise clarity", type: "select", options: ["", "Unclear", "Clear but generic", "Clear and ICP-specific", "Clear, differentiated, and proof-backed"] }
      ]
    },
    {
      title: "First Use Case and Buying Path",
      fields: [
        { id: `${prefix}firstUseCaseForOffer`, label: "First use case to sell", type: "multiSelectDropdown", otherLabel: "Define other first use case", requireOther: true, options: useCaseOptions },
        { id: `${prefix}firstUseCaseFit`, label: "Is this the right first use case for this ICP?", type: "select", options: ["", "Yes", "Needs refinement", "No, different use case", "Not sure"] },
        { id: `${prefix}whyBestStartingPoint`, label: "Why is this the best starting point?", type: "multiSelectDropdown", options: ["Fastest value", "Easiest proof", "Lowest risk", "Strongest pain", "Easiest buyer access", "Best margin", "Strategic account potential", "Expansion path", "Other"] },
        { id: `${prefix}buyerRequirements`, label: "What does the buyer need to provide or do?", type: "repeatableList", itemType: "select", minItems: 1, addLabel: "Add buyer requirement", otherLabel: "Define other buyer requirement", requireOther: true, options: buyerRequirementOptions },
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
    ...collectSharedCustomerGroupOptions(data),
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

function collectBuyerProblemOptions(data = getFormData()) {
  const offerProblems = offerPortfolioRows(data)
    .map((row) => row.rowId)
    .flatMap((rowId) => [
      data[scopedOfferField(rowId, "offerBuyerProblem")],
      data[scopedOfferField(rowId, "offerCostOfInaction")]
    ]);

  return [...new Set([
    data.bestFitPrimaryPain,
    data.quickBuyerProblem,
    data.offerBuyerProblem,
    data.urgentBuyerProblem,
    ...customerGroupRows(data).flatMap((row) => [row.values.problem, row.values.whyNow]),
    ...offerProblems,
    "Other / not sure"
  ].map((value) => String(value || "").trim()).filter(Boolean))];
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
  const buyerProblemOptions = collectBuyerProblemOptions(data);
  const personaOptions = ["", row.values.primaryBuyerPersona || "", "Economic Buyer", "Executive Sponsor", "Champion", "Day-to-Day User", "Implementation Owner", "Technical / Security Reviewer", "Procurement / Finance", "Likely Blocker", "Not sure"].filter((value, index, list) => list.indexOf(value) === index);

  return [
    {
      title: "Buying Trigger Events",
      hint: "For this targeting strategy, define events that suggest the selected customer group may need the selected offer now. Use evidence you can observe, not generic urgency.",
      table: { id: signalScopedTable(playRowId, "buyingTriggerEvents"), title: "", layout: "cards", repeatable: true, rowLabel: "Trigger Event", minRows: 1, maxRows: 20, addLabel: "Add trigger event", columns: [
        { id: "triggerEvent", label: "What happened that could make this account ready now?", type: "select", options: ["", ...triggerEventOptions], requireOther: true, otherLabel: "Define other trigger event" },
        { id: "buyerProblem", label: "Which buyer problem does this connect to?", type: "select", options: ["", ...buyerProblemOptions] },
        { id: "whyUrgent", label: "Why would this make the problem more urgent?", type: "textarea", placeholder: "Example: New product launch increases sourcing pressure and exposes capacity gaps." },
        { id: "howObserved", label: "How could we observe this signal?", type: "text", placeholder: "Example: LinkedIn post, trade show booth, job posting, website launch, customer conversation." },
        { id: "source", label: "Where would we check for it?", type: "select", options: ["", ...sourceOptions] },
        { id: "timingWindow", label: "Best timing window", type: "select", options: ["", "Immediately", "Within 7 days", "Within 30 days", "Within 60 days", "Within 90 days", "Next budget cycle", "Unknown"] },
        { id: "priority", label: "How strongly should this affect priority?", type: "select", options: ["", "High", "Medium", "Low"] }
      ] }
    },
    {
      title: "Fit Signals",
      hint: "Define evidence that this account resembles the customer group this play is meant to reach. Separate company fit, buyer fit, and use-case fit.",
      table: { id: signalScopedTable(playRowId, "fitSignals"), title: "", layout: "cards", repeatable: true, rowLabel: "Fit Signal", minRows: 1, maxRows: 20, addLabel: "Add fit signal", columns: [
        { id: "signalCategory", label: "What kind of fit does this prove?", type: "select", options: ["", "Company fit", "Buyer fit", "Use-case fit"] },
        { id: "signal", label: "What observable evidence would show fit?", type: "text", placeholder: "Example: Lean product team, active product launch, margin pressure, COO owns operations." },
        { id: "whyItMatters", label: "Why does this make the account more worth pursuing?", type: "textarea" },
        { id: "visibility", label: "Can we see this before a sales conversation?", type: "select", options: ["", "Publicly observable", "Internal data only", "Both public and internal", "Unknown"] },
        { id: "source", label: "Where would we check for it?", type: "select", options: ["", ...sourceOptions] },
        { id: "priority", label: "How strongly should this affect priority?", type: "select", options: ["", "High", "Medium", "Low"] }
      ] }
    },
    {
      title: "Negative Signals and Disqualification",
      hint: "Define signals that make an account a weaker fit for this specific targeting strategy. Use this when the issue is specific to this customer group, offer, buyer, or motion.",
      table: { id: signalScopedTable(playRowId, "negativeSignalRules"), title: "", layout: "cards", repeatable: true, rowLabel: "Negative Signal", minRows: 1, maxRows: 20, addLabel: "Add negative signal", columns: [
        { id: "negativeSignal", label: "What would make this account lower priority for this play?", type: "select", options: ["", ...negativeSignalOptions] },
        { id: "whyItMatters", label: "Why would this weaken fit, timing, reachability, or deal quality?", type: "textarea" },
        { id: "action", label: "What should happen if we see it?", type: "select", options: ["", "Reduce score", "Disqualify", "Needs review", "Nurture only", "Ask qualification question"] },
        { id: "source", label: "Where would we check for it?", type: "select", options: ["", ...sourceOptions] },
        { id: "notes", label: "What question should sales ask to confirm?", type: "textarea" }
      ] }
    },
    {
      title: "Signal Scoring and Routing Rules",
      hint: "Define how signals should change account priority and what action should happen next.",
      table: { id: signalScopedTable(playRowId, "signalRoutingRules"), title: "", layout: "cards", repeatable: true, rowLabel: "Signal Rule", minRows: 1, maxRows: 20, addLabel: "Add signal rule", columns: [
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
      table: { id: signalScopedTable(playRowId, "signalActionPlan"), title: "", layout: "cards", repeatable: true, rowLabel: "Signal Action", minRows: 1, maxRows: 20, addLabel: "Add signal action", columns: [
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
      copyButton.textContent = "Copy cross-play rules into this strategy";
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
  "Social media posts",
  "Social media ads",
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
    ...collectSharedCustomerGroupOptions(data),
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
  const experimentFields = ["hypothesis", "audience", "channel", "offer", "successMetric", "timeframe", "owner", "reviewCadence", "reviewInputs", "continueRule", "reviseRule", "stopRule", "decisionRule"];
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
    { name: "Next experiment clarity", score: experimentScore, nextMove: "Define a 30-day experiment with hypothesis, audience, channel, success metric, owner, review cadence, and separate continue, revise, and stop rules." }
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
      <div class="summary-item"><div class="summary-label">Current status</div><div class="summary-value">${row.values.currentStatus || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Customer group / ICP</div><div class="summary-value">${row.values.newCustomerGroup || row.values.customerGroup || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Offer</div><div class="summary-value">${row.values.newOffer || row.values.offer || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Channel / source</div><div class="summary-value">${row.values.channelSource || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Sales motion</div><div class="summary-value">${row.values.salesMotionType || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Primary buyer</div><div class="summary-value">${row.values.primaryBuyer || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Goal</div><div class="summary-value">${row.values.playGoal || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Priority</div><div class="summary-value">${row.values.playPriority || "Not filled yet"}</div></div>
      <div class="summary-item"><div class="summary-label">Evidence / unknowns</div><div class="summary-value">${row.values.evidenceOrUnknowns || "Not filled yet"}</div></div>
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
        { id: revenueScopedField(motionRowId, "nextExperiment", "reviewCadence"), label: "Review cadence", type: "select", options: ["", "Daily", "Weekly", "Biweekly", "Monthly", "End of test", "Not sure"] },
        { id: revenueScopedField(motionRowId, "nextExperiment", "reviewInputs"), label: "What will be reviewed at that cadence?", type: "textarea", placeholder: "Example: Accounts added, replies, meetings, qualified opportunities, stalled reasons, proof gaps, next actions." },
        { id: revenueScopedField(motionRowId, "nextExperiment", "continueRule"), label: "What result means continue?", type: "textarea", placeholder: "Example: Continue if the motion creates qualified conversations, clear buyer learning, or enough pipeline to justify another test cycle." },
        { id: revenueScopedField(motionRowId, "nextExperiment", "reviseRule"), label: "What result means revise?", type: "textarea", placeholder: "Example: Revise the ICP, offer, message, channel, or activity target if replies are low or the wrong buyers engage." },
        { id: revenueScopedField(motionRowId, "nextExperiment", "stopRule"), label: "What result means stop or pause?", type: "textarea", placeholder: "Example: Stop or pause if the motion creates no qualified conversations, no useful learning, or requires more effort than the opportunity supports." },
        { id: revenueScopedField(motionRowId, "nextExperiment", "decisionRule"), label: "Overall outcome notes", type: "textarea", placeholder: "Use only if the three outcome rules need extra context." }
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
  quickButton.textContent = "Generate Quick GTM Blueprint";
  quickButton.addEventListener("click", () => submitIntake("quick"));

  detailedButton.type = "button";
  detailedButton.textContent = "Continue";
  detailedButton.addEventListener("click", showDetailedSections);

  actions.appendChild(quickButton);
  actions.appendChild(detailedButton);
  return actions;
}

function isPreRevenueMode() {
  const selectedMode = formStateData.toolMode || document.querySelector("[name='toolMode']")?.value || "";
  return selectedMode === "Pre-Revenue Validation";
}

function sectionVisible(section) {
  if (section.hidden || section.deprecated) {
    return false;
  }

  if (isPreRevenueMode()) {
    return section.id === "company" || section.preRevenue;
  }

  if (section.preRevenue) {
    return false;
  }

  return detailedSectionsVisible || section.id === "company" || section.id === "executiveQuickReview";
}

function visibleSections() {
  return schema.sections.filter(sectionVisible);
}

function firstDetailedSectionId() {
  if (isPreRevenueMode()) {
    return schema.sections.find((item) => item.preRevenue && !item.hidden && !item.deprecated)?.id || "company";
  }

  const section = schema.sections.find((item) => !item.hidden && !item.deprecated && !item.preRevenue && !["company", "executiveQuickReview"].includes(item.id));
  return section?.id || "company";
}

function currentImprovementFocus() {
  const urlFocus = improvementFocusFromUrl();
  try {
    const storedFocus = JSON.parse(localStorage.getItem(IMPROVEMENT_FOCUS_KEY) || "null");
    if (storedFocus && storedFocus.sectionId && (!urlFocus || storedFocus.sectionId === urlFocus.sectionId)) {
      return {
        ...(urlFocus || {}),
        ...storedFocus,
        returnTo: urlFocus?.returnTo || storedFocus.returnTo || ""
      };
    }
  } catch (error) {
    localStorage.removeItem(IMPROVEMENT_FOCUS_KEY);
  }
  return urlFocus;
}

function improvementFocusFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const sectionId = params.get("focus") || "";
  const review = params.get("review") || "";
  const task = params.get("task") || "";
  const returnTo = params.get("returnTo") || "";

  if (!sectionId || !review) {
    return null;
  }

  const defaults = {
    score: {
      area: "Readiness score inputs",
      why: "These answers have the biggest effect on the readiness score. Review weak or vague answers before treating the score as final.",
      missing: ["Customer priority score and evidence", "Offer and proof readiness", "Buying signal clarity", "Revenue motion and CRM operating rhythm"],
      questions: ["Which score area is red or yellow?", "Which answer is still an assumption instead of evidence?", "Which intake answer could be made more specific today?", "Which section would most improve execution if clarified?"],
      example: "Customer Priority: choose the best-fit customer group, select the primary pain, add evidence, and define observable fit and disqualification signals.",
      fieldIds: ["customerContextStarter", "bestFitCustomerGroup", "bestFitDecisionMaker", "bestFitChampion", "bestFitEvidence"]
    },
    risk: {
      area: "Risk warning inputs",
      why: "The risk warning is based on answers that suggest execution could stall unless the source inputs are clarified.",
      missing: ["The answer that triggered the risk", "The owner responsible for addressing it", "The next action that lowers the risk"],
      questions: ["Which intake answer created this risk?", "Is the warning still accurate?", "What proof, owner, process, or decision would reduce the risk?", "Should the ranked action plan change based on the corrected answer?"],
      example: "If the risk is weak proof, review Offer Readiness and Customer Evidence before increasing outreach."
    },
    buyer: {
      area: "Buyer persona answers",
      why: "Review the buying committee answers that shape the persona section and outreach plan.",
      missing: ["Economic buyer", "Champion", "Likely blocker", "Proof needed by role", "What each role must believe"],
      questions: ["Who owns budget?", "Who feels the pain most often?", "Who can block the deal?", "What proof does each role need?", "Which persona should the first outreach target?"],
      example: "Economic Buyer: CFO or CEO. Needs proof of margin impact, implementation risk control, and a clear business case.",
      fieldIds: ["buyingSituation", "conversationStarter", "budgetOwner", "painOwner", "dealBlocker", "reviewRequirements"]
    },
    offer: {
      area: "Offer and proof answers",
      why: "Review the offer, proof, and value-claim answers that determine whether the action plan is specific enough to use.",
      missing: ["Primary offer", "Buyer problem", "Measurable outcome", "Proof asset", "Main objection"],
      questions: ["Which offer is the action plan anchored to?", "What problem does it solve?", "How will the buyer measure success?", "What proof makes the claim believable?", "What objection could stop the deal?"],
      example: "Offer: Price Check. Problem: margin pressure. Proof: case story showing lower landed cost or reduced sourcing risk."
    },
    signals: {
      area: "Buying trigger and signal answers",
      why: "Review the observable signals that determine which accounts should be prioritized.",
      missing: ["Trigger events", "Fit signals", "Negative signals", "Data sources", "Action when signal appears"],
      questions: ["What event means the buyer may act now?", "How can the user observe that signal?", "What signal disqualifies an account?", "What action should the signal trigger?"],
      example: "Trigger: new product launch. Source: website, job posts, trade show list. Action: add to target list and lead with launch-risk message.",
      fieldIds: ["primarySignalPlay"]
    },
    revenue: {
      area: "Revenue motion and CRM answers",
      why: "Review the answers that define the motion, owner, weekly target, and review rhythm.",
      missing: ["Target customer group", "Offer", "Channel/source", "Sales motion", "Weekly activity target", "Review cadence"],
      questions: ["Which customer group and offer will the motion test?", "Which channel/source will be used?", "Who owns the motion?", "What will be done weekly?", "What result means continue, revise, or stop?"],
      example: "Founder-led referral motion to 10 Tier A accounts, reviewed weekly, with continue/revise/stop rules after 30 days.",
      fieldIds: ["revenueTrackingSystem", "revenueReportingCadence", "primaryRevenueOwner", "pipelineReviewOwner", "sellingCapacity", "primaryRevenueMotion"]
    }
  };

  let focus = defaults[review] || {
    area: "Related intake answers",
    why: "Review the answers that support this recommendation before changing the action plan.",
    missing: ["Source answer", "Evidence", "Owner", "Next action"],
    questions: ["Is the current answer accurate?", "Is it specific enough to execute?", "What evidence supports it?"],
    example: "Replace broad or old answers with the current source of truth."
  };

  if (task === "active-plan-action") {
    focus = {
      area: "Complete the Active Plan foundation",
      why: "The Active Plan cannot pass its executable-action check until one complete revenue motion connects a customer group, offer, channel, sales motion, owner, and measurable goal.",
      missing: [
        "One named revenue acquisition strategy",
        "The customer group and offer this strategy will use",
        "The channel or source and sales motion",
        "The primary buyer, owner, and measurable goal",
        "Primary revenue motion selected below"
      ],
      questions: [
        "Complete the first Revenue Acquisition Strategy card below.",
        "Choose that strategy as the Primary Revenue Motion.",
        "Save the answers, then return to the Active Plan and continue the first action."
      ],
      example: "Referral-led diagnostic for specialty manufacturers: promote the 90-Day Throughput Improvement Program through network referrals, use consultative selling to reach the COO, assign the Revenue Operations Manager, and target four closed programs in 90 days."
    };
  } else if (task === "customer-context") {
    focus = {
      area: "ICP customer context",
      why: "The ICP needs a plain-language description of the customer before the structured criteria can become a useful profile.",
      missing: ["Who the customer is", "The situation they are in", "What they are trying to accomplish", "What is difficult today", "Details that would help identify or find more of them"],
      questions: [
        "Complete Describe the customer, user, or buyer you most want to reach at the top of this section.",
        "Include concrete details that distinguish this customer from a broad market label.",
        "Save the answer and return to the ICP Brief."
      ],
      example: "Operations leaders at specialty manufacturers with urgent throughput constraints, limited internal process-improvement capacity, and pressure to increase output without adding another facility or a large permanent team.",
      fieldIds: ["customerContextStarter"]
    };
  }

  return {
    type: "review",
    sectionId,
    ...focus,
    returnTo,
    returnLabel: task === "active-plan-action" ? "Return to Active Plan" : task === "customer-context" ? "Return to ICP Brief" : "Return to Report",
    createdAt: new Date().toISOString()
  };
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
  const answerHeading = document.createElement("h4");
  const answerIntro = document.createElement("p");
  const exampleHeading = document.createElement("h4");
  const example = document.createElement("p");
  const actions = document.createElement("div");
  const saveAnswers = document.createElement("button");
  const updateModel = document.createElement("button");
  const regenerate = document.createElement("button");
  const dismiss = document.createElement("button");
  const returnLink = document.createElement("a");
  const answerFields = document.createElement("div");
  const savedReturnUrl = () => {
    const destination = new URL(focus.returnTo, window.location.href);
    destination.searchParams.set("improvement", "saved");
    destination.searchParams.set("improved", focus.area || "Intake section");
    destination.searchParams.set("refreshed", Date.now().toString());
    return `${destination.pathname.split("/").pop() || "results.html"}${destination.search}${destination.hash}`;
  };

  card.className = "improvement-focus";
  heading.textContent = `${focus.returnTo ? "Improving" : "Workshop"}: ${focus.area || "Recommended follow-up"}`;
  answerFields.className = "improvement-answer-fields";
  why.textContent = focus.why || "Answer the questions below to improve report confidence.";
  missingHeading.textContent = "What is missing or unclear";
  (focus.missing || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    missingList.appendChild(li);
  });
  questionsHeading.textContent = focus.questionsHeading || "Questions to answer";
  (focus.questions || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    questionsList.appendChild(li);
  });
  exampleHeading.textContent = "Example of a stronger answer";
  example.textContent = focus.example || "";
  answerHeading.textContent = focus.answerHeading || "Update the source answers";
  answerIntro.textContent = focus.answerIntro || "Edit the intake answers below. These fields are the source information used by the plan.";
  actions.className = "action-bar";
  saveAnswers.type = "button";
  saveAnswers.className = "secondary";
  saveAnswers.textContent = "Save";
  saveAnswers.addEventListener("click", async () => {
    formStateData = {
      ...formStateData,
      ...currentVisibleFormData()
    };
    saveAnswers.disabled = true;
    saveAnswers.textContent = "Saving...";
    await saveDraft(true);
    saveAnswers.disabled = false;
    saveAnswers.textContent = "Save";
  });
  updateModel.type = "button";
  updateModel.className = "secondary";
  updateModel.textContent = "Update Model";
  updateModel.addEventListener("click", async () => {
    formStateData = {
      ...formStateData,
      ...currentVisibleFormData()
    };
    updateModel.disabled = true;
    updateModel.textContent = "Updating...";
    const saved = await saveDraft(false);
    if (!saved) {
      const status = document.getElementById("saveStatus");
      if (status) status.textContent = "The model was not updated because the latest answers could not be saved.";
      updateModel.disabled = false;
      updateModel.textContent = "Update Model";
      return;
    }
    renderOfferAssessmentPanels();
    renderSignalPlayAssessmentPanels();
    renderRevenueMotionAssessmentPanels();
    updateConditionalFields();
    refreshIntakeUi({ refreshPanels: true });
    const status = document.getElementById("saveStatus");
    if (status) {
      status.textContent = "Model updated from workshop answers.";
    }
    updateModel.disabled = false;
    updateModel.textContent = "Update Model";
  });
  regenerate.type = "button";
  regenerate.dataset.improvementSaveReturn = "true";
  regenerate.textContent = focus.returnTo ? "Save Changes and Return" : "Regenerate Action Plan";
  regenerate.addEventListener("click", async () => {
    formStateData = {
      ...formStateData,
      ...currentVisibleFormData()
    };
    regenerate.disabled = true;
    regenerate.textContent = "Saving...";
    const saved = await saveDraft(false);
    if (saved) {
      if (focus.returnTo) {
        window.location.href = savedReturnUrl();
      } else {
        await submitIntake("detailed");
      }
    } else {
      const status = document.getElementById("saveStatus");
      if (status) status.textContent = "The action plan was not regenerated because the latest answers could not be saved.";
      regenerate.disabled = false;
      regenerate.textContent = "Regenerate Action Plan";
    }
  });
  dismiss.type = "button";
  dismiss.className = "secondary";
  dismiss.textContent = "Dismiss";
  dismiss.addEventListener("click", () => {
    localStorage.removeItem(IMPROVEMENT_FOCUS_KEY);
    if (new URLSearchParams(window.location.search).has("review")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("review");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
    renderSections();
    setFormData(formStateData);
    refreshIntakeUi({ refreshPanels: true });
    updateConditionalFields();
  });

  if (focus.returnTo && /^(?:results|facilitation)\.html(?:[?#]|$)/.test(focus.returnTo)) {
    returnLink.className = "secondary";
    returnLink.href = focus.returnTo;
    returnLink.textContent = "Return Without Saving";
  }

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
  if (Array.isArray(focus.fieldIds) && focus.fieldIds.length) {
    card.appendChild(answerHeading);
    card.appendChild(answerIntro);
    card.appendChild(answerFields);
  }
  if (example.textContent) {
    card.appendChild(exampleHeading);
    card.appendChild(example);
  }
  if (!focus.returnTo) {
    actions.appendChild(saveAnswers);
    actions.appendChild(updateModel);
  }
  actions.appendChild(regenerate);
  if (returnLink.href) {
    actions.appendChild(returnLink);
  }
  if (!focus.returnTo) actions.appendChild(dismiss);
  card.appendChild(actions);
  return card;
}

function mountImprovementAnswerFields(card, sectionEl) {
  const focus = currentImprovementFocus();
  const host = card?.querySelector(".improvement-answer-fields");
  if (!focus?.fieldIds?.length || !host) return;

  focus.fieldIds.forEach((fieldId) => {
    const wrapper = sectionEl.querySelector(`[data-field-id="${CSS.escape(fieldId)}"]`);
    if (!wrapper) return;
    const sourceGrid = wrapper.parentElement;
    const example = wrapper.querySelector(".field-example");
    const firstControl = wrapper.querySelector("textarea, select, input, [data-multi-select-dropdown]");
    if (example && firstControl) wrapper.insertBefore(example, firstControl);
    wrapper.classList.add("improvement-answer-field");
    host.appendChild(wrapper);
    if (sourceGrid?.classList.contains("grid") && !sourceGrid.children.length) {
      const hint = sourceGrid.previousElementSibling?.classList.contains("hint") ? sourceGrid.previousElementSibling : null;
      const heading = (hint?.previousElementSibling || sourceGrid.previousElementSibling)?.tagName === "H3"
        ? (hint?.previousElementSibling || sourceGrid.previousElementSibling)
        : null;
      sourceGrid.remove();
      hint?.remove();
      heading?.remove();
    }
  });
}

function createBottomImprovementActions(focus) {
  const actions = document.createElement("div");
  const saveAndReturn = document.createElement("button");
  const returnWithoutSaving = document.createElement("a");
  actions.className = "action-bar improvement-bottom-actions";
  saveAndReturn.type = "button";
  saveAndReturn.textContent = "Save Changes and Return";
  saveAndReturn.addEventListener("click", () => {
    const primaryAction = document.querySelector('[data-improvement-save-return="true"]');
    if (primaryAction) primaryAction.click();
  });
  returnWithoutSaving.className = "secondary";
  returnWithoutSaving.href = focus.returnTo;
  returnWithoutSaving.textContent = "Return Without Saving";
  actions.appendChild(saveAndReturn);
  actions.appendChild(returnWithoutSaving);
  return actions;
}

function syncFormStateFromDom() {
  formStateData = getFormData();
}

function activeSectionStorageKey() {
  return `${ACTIVE_SECTION_KEY}:${activeRecordId() || "draft"}:${currentReportMode}`;
}

function rememberActiveSection(sectionId = activeSectionId) {
  if (!sectionId) {
    return;
  }

  localStorage.setItem(activeSectionStorageKey(), sectionId);
}

function rememberedActiveSection(sectionsToShow = visibleSections()) {
  const incomingSectionId = sectionIdFromUrl();
  if (sectionsToShow.some((section) => section.id === incomingSectionId)) {
    return incomingSectionId;
  }

  if (preferIntakeStartOnInitialLoad && sectionsToShow.some((section) => section.id === "company")) {
    return "company";
  }

  const savedSectionId = localStorage.getItem(activeSectionStorageKey()) || "";
  return sectionsToShow.some((section) => section.id === savedSectionId) ? savedSectionId : "";
}

function shouldStartAtIntakeBeginning() {
  const params = new URLSearchParams(window.location.search);
  const hasExplicitDestination = params.has("recordId")
    || params.has("section")
    || params.has("focus")
    || params.has("review")
    || params.has("improve")
    || Boolean(String(window.location.hash || "").replace(/^#/, ""));
  const navigationEntry = window.performance?.getEntriesByType?.("navigation")?.[0];

  return !hasExplicitDestination && navigationEntry?.type !== "reload";
}

function sectionIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const rawSectionId = params.get("section") || decodeURIComponent(String(window.location.hash || "").replace(/^#/, ""));
  return schema.sections.some((section) => section.id === rawSectionId && !section.hidden && !section.deprecated) ? rawSectionId : "";
}

function switchActiveSection(sectionId) {
  if (sectionId === activeSectionId) {
    return;
  }

  syncFormStateFromDom();
  activeSectionId = sectionId;
  rememberActiveSection(sectionId);
  const url = new URL(window.location.href);
  url.searchParams.set("section", sectionId);
  url.hash = sectionId;
  window.history.replaceState({}, "", url);
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
  const activeIndex = Math.max(0, sectionsToShow.findIndex((section) => section.id === activeSectionId));
  const compactNavigation = window.matchMedia("(max-width: 780px)").matches;
  const intakeBox = document.createElement("details");
  const intakeSummary = document.createElement("summary");
  const intakeContent = document.createElement("div");
  const groupList = document.createElement("div");
  const progress = document.createElement("div");
  const progressText = document.createElement("div");
  const progressTrack = document.createElement("div");
  const progressFill = document.createElement("div");
  const progressPercent = sectionsToShow.length ? ((activeIndex + 1) / sectionsToShow.length) * 100 : 0;

  progress.className = "section-progress";
  progressText.className = "section-progress-text";
  progressTrack.className = "section-progress-track";
  progressFill.className = "section-progress-fill";
  progressText.textContent = `Step ${activeIndex + 1} of ${sectionsToShow.length}`;
  progressFill.style.width = `${progressPercent}%`;
  progressTrack.appendChild(progressFill);
  progress.appendChild(progressText);
  progress.appendChild(progressTrack);
  intakeBox.className = "nav-intake-box";
  intakeBox.open = !compactNavigation;
  intakeSummary.className = "nav-intake-summary";
  intakeSummary.textContent = `Step ${activeIndex + 1} of ${sectionsToShow.length}: ${sectionsToShow[activeIndex]?.title || "Intake"}`;
  intakeContent.className = "nav-intake-content";
  groupList.className = "nav-group-list";

  const groupLabels = {
    company: "Foundation",
    executiveQuickReview: "Foundation",
    preRevenueContext: "Validation",
    preRevenueHypotheses: "Validation",
    preRevenueProblem: "Validation",
    preRevenueWedge: "Validation",
    preRevenueBuyerDiscovery: "Validation",
    preRevenueValidationMotion: "Validation",
    preRevenueEvidenceTracker: "Validation",
    quickIcp: "Strategy",
    goals: "Strategy",
    traction: "Strategy",
    icp: "Strategy",
    personas: "Strategy",
    offer: "Execution",
    signals: "Execution",
    pipeline: "Execution"
  };
  const appendSectionLink = (section, container) => {
    const anchor = document.createElement("a");
    anchor.href = `#${section.id}`;
    anchor.textContent = section.title;
    if (section.id === activeSectionId) anchor.classList.add("active");
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      switchActiveSection(section.id);
    });
    container.appendChild(anchor);
  };
  const groupOrder = ["Foundation", "Validation", "Strategy", "Execution", "Workspace"];
  const activeGroup = groupLabels[activeSectionId] || "Workspace";
  groupOrder.forEach((group) => {
    const groupSections = sectionsToShow.filter((section) => (groupLabels[section.id] || "Workspace") === group);
    if (!groupSections.length) return;
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const links = document.createElement("div");
    details.className = "nav-section-group";
    details.dataset.navGroup = group;
    details.open = group === activeGroup;
    summary.textContent = group;
    links.className = "nav-section-links";
    groupSections.forEach((section) => appendSectionLink(section, links));
    details.append(summary, links);
    groupList.appendChild(details);
  });
  intakeContent.append(progress, groupList);
  intakeBox.append(intakeSummary, intakeContent);
  nav.appendChild(intakeBox);

  const navData = getFormData();
  const hasIcpAsset = Boolean(
    navData.bestFitCustomerGroup
    || navData.quickBestFitCustomer
    || tableRowsFromData(navData, "possibleCustomerGroups").some((row) => String(row.values.groupName || "").trim())
  );
  const hasPersonaAsset = ["bestFitDecisionMaker", "budgetOwner", "conversationStarter", "painOwner", "dealBlocker"]
    .some((field) => String(navData[field] || "").trim())
    || Object.keys(navData).some((field) => field.startsWith("buyerRoleCards__") && String(navData[field] || "").trim());
  if (isPreRevenueMode() || navData.companyName || navData.website || hasIcpAsset || hasPersonaAsset) {
    const assets = document.createElement("details");
    const summary = document.createElement("summary");
    const assetLinksContainer = document.createElement("div");
    assets.className = "nav-assets-box";
    assets.open = !compactNavigation && localStorage.getItem(`${STORAGE_KEY}:assetsNavOpen`) !== "false";
    summary.textContent = "Assets";
    assetLinksContainer.className = "nav-asset-links";
    assets.append(summary, assetLinksContainer);
    assets.addEventListener("toggle", () => localStorage.setItem(`${STORAGE_KEY}:assetsNavOpen`, String(assets.open)));

    const assetLinks = isPreRevenueMode()
      ? [
        ["GTM Plan Summary", "gtm"],
        ["Active Plan", "active"],
        ["ICP Brief", "icp"],
        ["Persona Brief", "personas"],
        ["Messaging Kit", "messaging"],
        ["Target List Setup", "targets"],
        ["Proof Asset Builder", "proof-assets"],
        ["Outreach Sequence", "outreach"],
        ["Weekly GTM Review", "weekly-review"],
        ["30-Day Validation Plan", "validation"]
      ]
      : [
        ["GTM Plan Summary", "gtm"],
        ["Active Plan", "active"],
        ...(hasIcpAsset ? [["ICP Brief", "icp"]] : []),
        ["Persona Brief", "personas"],
        ["Messaging Kit", "messaging"],
        ["Target List Setup", "targets"],
        ["Proof Asset Builder", "proof-assets"],
        ["Outreach Sequence", "outreach"],
        ["Weekly GTM Review", "weekly-review"]
      ];

    assetLinks.forEach(([text, asset]) => {
      const link = document.createElement("a");
      link.href = resultsUrl(undefined, asset);
      link.textContent = text;
      link.className = "nav-asset-link";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        syncFormStateFromDom();
        saveDraft(false);
        window.location.href = resultsUrl(undefined, asset);
      });
      assetLinksContainer.appendChild(link);
    });

    nav.appendChild(assets);
  }
}

function createSectionProgressActions(sectionsToShow, activeSection) {
  const currentIndex = sectionsToShow.findIndex((section) => section.id === activeSection.id);
  const previousSection = currentIndex > 0 ? sectionsToShow[currentIndex - 1] : null;
  const nextSection = currentIndex >= 0 && currentIndex < sectionsToShow.length - 1 ? sectionsToShow[currentIndex + 1] : null;
  const actions = document.createElement("div");

  actions.className = "section-navigation-actions";

  if (previousSection) {
    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "secondary";
    previous.textContent = `Back to ${previousSection.title}`;
    previous.addEventListener("click", () => switchActiveSection(previousSection.id));
    actions.appendChild(previous);
  } else {
    const spacer = document.createElement("span");
    spacer.className = "section-nav-spacer";
    actions.appendChild(spacer);
  }

  if (nextSection) {
    const next = document.createElement("button");
    next.type = "button";
    next.textContent = `Continue to ${nextSection.title}`;
    next.addEventListener("click", () => switchActiveSection(nextSection.id));
    actions.appendChild(next);
  } else if (isPreRevenueMode()) {
    const submit = document.createElement("button");
    submit.type = "button";
    submit.textContent = "View Validation Plan";
    submit.addEventListener("click", () => submitIntake("preRevenue", "validation"));
    actions.appendChild(submit);
  }

  return actions;
}

function renderSections() {
  const sections = document.getElementById("sections");
  const nav = document.getElementById("sectionNav");
  const sectionsToShow = visibleSections();
  const restoredSectionId = rememberedActiveSection(sectionsToShow);
  const activeSection = sectionsToShow.find((section) => section.id === restoredSectionId)
    || sectionsToShow.find((section) => section.id === activeSectionId)
    || sectionsToShow[0];

  sections.innerHTML = "";
  nav.innerHTML = "";

  if (!activeSection) {
    return;
  }

  activeSectionId = activeSection.id;
  rememberActiveSection(activeSectionId);
  renderSectionNavigation(sectionsToShow, nav);
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
  if (improvementFocus) mountImprovementAnswerFields(improvementFocus, sectionEl);

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

  const activeImprovementFocus = currentImprovementFocus();
  if (activeImprovementFocus?.sectionId === activeSection.id && activeImprovementFocus.returnTo) {
    sectionEl.appendChild(createBottomImprovementActions(activeImprovementFocus));
  } else {
    sectionEl.appendChild(createSectionProgressActions(sectionsToShow, activeSection));
  }

  sections.appendChild(sectionEl);
}

function currentVisibleFormData() {
  const data = {};
  const form = document.getElementById("intakeForm");
  const formData = new FormData(form);

  for (const [key, value] of formData.entries()) {
    if (
      value === USE_OUR_RECOMMENDATIONS_OPTION
      && document.querySelector(`[data-multi-select-dropdown][data-field-name="${CSS.escape(key)}"]`)
    ) {
      continue;
    }

    const serializedValue = serializeFieldValue(key, value);

    const sourceField = document.querySelector(`[name="${CSS.escape(key)}"]`);
    const multiValue = Boolean(
      sourceField?.closest?.("[data-multi-select-dropdown]")
      || (sourceField?.tagName === "SELECT" && sourceField.multiple)
    );
    if (data[key]) {
      data[key] = `${data[key]}${multiValue ? "; " : ", "}${serializedValue}`;
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

  if (["Other", "Other measurable outcome", "Other quantified results"].includes(text)) {
    const other = document.querySelector(`input[name="${CSS.escape(`${key}__other`)}"]`);
    const otherText = String(other?.value || "").trim();
    if (otherText) {
      return `${text}: ${otherText}`;
    }
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
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/api/records/${encodeURIComponent(record.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });
    if (!response.ok) {
      throw new Error("Could not save this company to the workspace.");
    }
    return true;
  } catch (error) {
    console.warn(error.message);
    return false;
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

function requestedRecordIdFromUrl() {
  return new URLSearchParams(window.location.search).get("recordId") || "";
}

function resultsUrl(version = "20260712-pre-revenue-assets", asset = "") {
  const id = activeRecordId();
  const params = new URLSearchParams({ v: version });
  const assetAnchors = {
    active: "active-plan-objective",
    validation: "plan-decision",
    gtm: "draft-icp",
    icp: "icp-brief",
    personas: "persona-overview",
    messaging: "messaging-workspace",
    targets: "target-list-workspace",
    "proof-assets": "proof-asset-workspace",
    outreach: "outreach-sequence-workspace",
    "weekly-review": "weekly-review-workspace"
  };

  if (id) {
    params.set("recordId", id);
  }

  if (asset && assetAnchors[asset]) {
    params.set("asset", asset);
  }

  if (activeSectionId) {
    const returnParams = new URLSearchParams({ section: activeSectionId });
    if (id) {
      returnParams.set("recordId", id);
    }
    params.set("returnTo", `index.html?${returnParams.toString()}#${encodeURIComponent(activeSectionId)}`);
  }

  const hash = assetAnchors[asset] ? `#${assetAnchors[asset]}` : "";
  return `results.html?${params.toString()}${hash}`;
}

function updateResultsLink() {
  const url = resultsUrl();

  ["viewResultsLink", "topResultsLink"].forEach((id) => {
    const link = document.getElementById(id);

    if (link) {
      link.href = url;
    }
  });
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
    .map(([key, value]) => {
      const other = String(data[`${key}__other`] || "").trim();
      return String(value).trim() === "Other" && other ? other : String(value).trim();
    });

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

function hasReportInput(data) {
  const directFields = [
    "companyName",
    "website",
    "primaryOfferName",
    "quickBestFitCustomer",
    "quickPrimaryProblem",
    "quickOfferPromise",
    "customerContextStarter",
    "preBroadMarket",
    "preOfferStage"
  ];

  if (directFields.some((key) => String(data[key] || "").trim())) {
    return true;
  }

  return Object.entries(data || {}).some(([key, value]) => (
    /^(?:possibleCustomerGroups|preCustomerHypotheses|offerPortfolio)__/.test(key)
    && String(value || "").trim()
  ));
}

function reportFoundationGaps(data, mode) {
  const valuesFor = (keys) => keys.some((key) => String(data[key] || "").trim());
  const hasMatchingValue = (pattern) => Object.entries(data || {}).some(([key, value]) => (
    pattern.test(key) && String(value || "").trim()
  ));
  const gaps = [];

  if (!valuesFor(["companyName", "website"])) {
    gaps.push("company name or website");
  }

  if (mode === "preRevenue") {
    if (!valuesFor(["customerContextStarter", "quickBestFitCustomer"]) && !hasMatchingValue(/^preCustomerHypotheses__.+__(?:segmentName|segmentName__other|groupName|description|specificUseCaseDefinition)$/)) {
      gaps.push("first customer or user hypothesis");
    }
    if (!valuesFor(["primaryOfferName", "quickOfferPromise", "preBroadMarket", "preOfferStage"])) {
      gaps.push("product or offer");
    }
  } else {
    if (!valuesFor(["quickBestFitCustomer", "bestFitCustomerGroup"]) && !hasMatchingValue(/^possibleCustomerGroups__.+__groupName$/)) {
      gaps.push("priority customer");
    }
    if (!valuesFor(["quickPrimaryProblem", "bestFitPrimaryPain"]) && !hasMatchingValue(/^possibleCustomerGroups__.+__problem$/)) {
      gaps.push("customer problem");
    }
    if (!valuesFor(["primaryOfferName", "quickOfferPromise", "primaryGtmOffer"]) && !hasMatchingValue(/^offerPortfolio__.+__offerName$/)) {
      gaps.push("offer");
    }
  }

  return gaps;
}

function validateReportFoundation(mode) {
  const data = getFormData();
  const status = document.getElementById("saveStatus");

  if (!hasReportInput(data)) {
    const message = "I would love to provide a report! Unfortunately, it looks like the intake has not been filled out yet.";
    if (status) status.textContent = message;
    window.alert(message);
    switchActiveSection("company");
    return false;
  }

  const gaps = reportFoundationGaps(data, mode);
  if (!gaps.length) {
    return true;
  }

  const message = `The report is not ready yet. Please add the ${gaps.join(", ")} before creating it.`;
  if (status) status.textContent = message;
  window.alert(message);
  switchActiveSection(mode === "preRevenue" ? "preRevenueContext" : "company");
  return false;
}

function baseFieldName(name = "") {
  return String(name || "").replace(/__other$/, "");
}

function changedFieldName(event) {
  return baseFieldName(event?.target?.name || event?.target?.closest?.("[data-field-name]")?.dataset.fieldName || "");
}

function shouldRunCarryForwardForChange(event) {
  const name = changedFieldName(event);

  if (!name) {
    return false;
  }

  return carryForwardRules.some((rule) => {
    if (rule.from === name || rule.fromList === name) {
      return true;
    }
    if (rule.fromAny?.includes(name)) {
      return true;
    }
    if (rule.fromTableColumn) {
      return name.startsWith(`${rule.fromTableColumn.table}__`) && name.endsWith(`__${rule.fromTableColumn.column}`);
    }
    return false;
  });
}

function setFormData(data) {
  formStateData = {
    ...formStateData,
    ...(data || {})
  };

  Object.entries(data || {}).forEach(([key, value]) => {
    if (key.endsWith("__other") && !String(value || "").trim()) {
      return;
    }

    let fields = document.querySelectorAll(`[name="${CSS.escape(key)}"]`);
    const customMultiSelect = document.querySelector(`[data-multi-select-dropdown][data-field-name="${CSS.escape(key)}"]`);
    if (customMultiSelect && typeof customMultiSelect.value !== "undefined") {
      customMultiSelect.value = value;
      if (typeof customMultiSelect.updateSummary === "function") {
        customMultiSelect.updateSummary();
      }
    }

    if (!fields.length && !customMultiSelect) {
      const match = key.match(/^(.+)__item-(\d+)$/);
      if (match && !String(value || "").trim()) {
        return;
      }
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
        const addButton = list?.parentElement?.querySelector(`button[data-add-card="${CSS.escape(cardMatch[1])}"]`);

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
        const optionValues = Array.from(document.querySelectorAll(`[name="${CSS.escape(field.name)}"]`))
          .map((option) => option.value)
          .filter(Boolean);
        const selected = splitMultiSelectValues(value, optionValues);
        const otherMatch = selected.find((item) => item.startsWith(`${field.value}:`));
        field.checked = selected.includes(field.value) || Boolean(otherMatch) || value === true || value === "true";
        if (otherMatch) {
          const other = document.querySelector(`input[name="${CSS.escape(`${field.name}__other`)}"]`);
          if (other && !String(other.value || "").trim()) {
            other.value = otherMatch.slice(field.value.length + 1).trim();
          }
        }
      } else if (field.tagName === "SELECT" && field.multiple) {
        const selected = String(value).split(", ");
        Array.from(field.options).forEach((option) => {
          option.selected = selected.includes(option.value);
        });
      } else if (field.tagName === "SELECT") {
        const text = String(value || "").trim();
        const hasExactOption = Array.from(field.options).some((option) => option.value === text);
        const otherValues = ["Other", "Other / Not sure yet", "Other measurable outcome", "Other quantified results"];
        const otherOption = otherValues.find((optionValue) => Array.from(field.options).some((option) => option.value === optionValue) && (text === optionValue || text.startsWith(`${optionValue}:`) || !hasExactOption));
        if (text && otherOption && (text === otherOption || !hasExactOption || text.startsWith(`${otherOption}:`))) {
          const savedOtherText = String(data[`${key}__other`] || "").trim();
          const currentOther = document.querySelector(`.other-field input[name="${CSS.escape(`${field.name}__other`)}"]`);
          const currentOtherVisible = currentOther && !currentOther.closest(".other-field")?.hidden;
          if (text === otherOption && !savedOtherText && field.value !== otherOption && !currentOtherVisible) {
            field.value = "";
            return;
          }
          field.value = otherOption;
          const other = currentOther;
          const otherText = text.startsWith(`${otherOption}:`) ? text.slice(otherOption.length + 1).trim() : savedOtherText || text;
          if (other && !String(other.value || "").trim()) {
            other.value = otherText === otherOption ? "" : otherText;
          }
        } else {
          field.value = value;
        }
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
  document.querySelectorAll("[data-multi-select-dropdown='true']").forEach((control) => {
    if (typeof control.updateSummary === "function") {
      control.updateSummary();
    }
  });
  document.querySelectorAll("select[data-recommendation-key]").forEach((select) => {
    updateRecommendationSelectSummary(select);
  });
  document.querySelectorAll("select[data-dynamic-options-from]").forEach((select) => {
    const value = data[select.name];
    if (String(value || "").trim() && Array.from(select.options).some((option) => option.value === value)) {
      select.value = value;
      updateRecommendationSelectSummary(select);
    }
  });
  updateBestFitSuggestion(data);
}

function updateConditionalFields() {
  updateDynamicOptionFields();
  updatePreRevenueBuyerDiscoveryDefaults();
  const data = getFormData();

  function fieldValuesFromData(name) {
    return String(data[name] || "")
      .split(/[;,|]/)
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => value.replace(/^(Other|Other measurable outcome|Other quantified results):\s*/i, "$1"));
  }

  document.querySelectorAll("select").forEach((select) => {
    const other = document.querySelector(`.other-field input[name="${CSS.escape(`${select.name}__other`)}"]`);

    if (!other) {
      return;
    }

    const triggerValue = other.parentElement.dataset.otherTriggerValue || "Other";
    other.parentElement.hidden = select.value !== triggerValue;
    other.required = !other.parentElement.hidden && Boolean(other.required || other.parentElement.dataset.requireOther === "true");
    if (other.parentElement.hidden) {
      other.value = "";
    }
  });

  document.querySelectorAll("[data-show-when-field]").forEach((wrapper) => {
    const sourceName = wrapper.dataset.showWhenField;
    const source = document.querySelector(`[name="${CSS.escape(sourceName)}"]`);
    const expectsChecked = wrapper.dataset.showWhenChecked === "true";
    const expectedContains = wrapper.dataset.showWhenContains;
    const expectedValues = wrapper.dataset.showWhenValues ? JSON.parse(wrapper.dataset.showWhenValues) : null;
    const dataValues = fieldValuesFromData(sourceName);
    const selectedValues = (expectedContains || expectedValues)
      ? [
          ...Array.from(document.querySelectorAll(`[name="${CSS.escape(sourceName)}"]:checked, select[name="${CSS.escape(sourceName)}"] option:checked`)).map((field) => field.value),
          ...dataValues
        ].filter(Boolean)
      : [];
    const sourceValue = source?.value || data[sourceName] || "";
    const sourceChecked = source ? source.checked : data[sourceName] === true || data[sourceName] === "true";
    const hasSourceValue = Boolean(source || sourceValue || selectedValues.length || sourceChecked);
    const defaultVisible = wrapper.dataset.showWhenDefaultVisible === "true";
    const isVisible = hasSourceValue ? (
      expectedContains
        ? selectedValues.includes(expectedContains)
        : expectedValues
          ? (selectedValues.length ? selectedValues.some((value) => expectedValues.includes(value)) : expectedValues.includes(sourceValue))
        : expectsChecked
        ? sourceChecked
        : sourceValue === wrapper.dataset.showWhenValue
    ) : defaultVisible;
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

function compactRepeatableList(data, listId, options = {}) {
  const otherValues = ["Other", "Other measurable outcome", "Other quantified results"];
  const dropValues = new Set((options.dropValues || []).map((value) => String(value || "").trim().toLowerCase()).filter(Boolean));
  const entries = Object.entries(data)
    .filter(([key]) => new RegExp(`^${listId}__item-\\d+$`).test(key))
    .sort(([first], [second]) => Number.parseInt(first.split("__item-")[1], 10) - Number.parseInt(second.split("__item-")[1], 10))
    .map(([key, value]) => {
      const text = String(value || "").trim();
      const other = String(data[`${key}__other`] || "").trim();

      if (!text && !other) {
        return "";
      }

      if (otherValues.includes(text)) {
        return other ? `${text}: ${other}` : "";
      }

      if (text.startsWith("Other:")) {
        return text;
      }

      return text;
    })
    .filter((value) => value && !dropValues.has(value.replace(/^Other:\s*/i, "").trim().toLowerCase()));

  Object.keys(data).forEach((key) => {
    if (new RegExp(`^${listId}__item-\\d+(__other)?$`).test(key)) {
      delete data[key];
    }
  });

  [...new Set(entries)].forEach((value, index) => {
    const key = `${listId}__item-${index + 1}`;
    data[key] = value;
    if (value.startsWith("Other:")) {
      data[`${key}__other`] = value.slice("Other:".length).trim();
    }
  });
}

function deliveryRiskRuleTexts(data, ruleType) {
  return tableRowsFromData(data, "deliveryFitRisks")
    .filter((row) => row.values.shouldBecomeRule === ruleType)
    .flatMap((row) => [row.values.lessonNextAction, row.values.whatMadeHard])
    .map((value) => String(value || "").trim())
    .filter(Boolean);
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
  appendRepeatableValueIfMissing(normalized, "bestFitCurrentWorkaround", normalized["bestCustomerProfile__current-workaround__answer"]);
  appendRepeatableValueIfMissing(normalized, "bestFitBudgetAbility", normalized["bestCustomerProfile__budget-ability-to-pay__answer"]);
  appendRepeatableValueIfMissing(normalized, "bestFitImplementationRequirements", normalized["bestCustomerProfile__implementation-requirements__answer"]);
  appendRepeatableValueIfMissing(normalized, "bestFitExpansionValue", normalized["bestCustomerProfile__expansion-or-strategic-value__answer"]);
  appendRepeatableValueIfMissing(normalized, "bestFitDisqualificationSignals", normalized["bestCustomerProfile__disqualification-signals__answer"]);
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
  migrateRepeatableValues(normalized, "icpDisqualificationRules", "bestFitDisqualificationSignals");
  migrateRepeatableValues(normalized, "implementationBurden", "bestFitImplementationRequirements");
  migrateRepeatableValues(normalized, "expansionPotential", "bestFitExpansionValue");

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
  ["goal30", "goal60", "goal90"].forEach((fieldId) => {
    if (normalized[fieldId] === "Leadflow") {
      normalized[fieldId] = "Lead flow";
    }
  });

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

  // Delivery risks stay in Customer Evidence. They should not silently become ICP rules.
}

const buyerPersonaRoles = [
  "economic-buyer",
  "executive-sponsor",
  "champion",
  "day-to-day-user",
  "implementation-owner",
  "technical-security-reviewer",
  "procurement-finance",
  "legal",
  "operations",
  "customer-success-support",
  "external-advisor-consultant",
  "board-investor",
  "likely-blocker"
];

const buyerPersonaRoleLabels = {
  "economic-buyer": "economic buyer",
  "executive-sponsor": "executive sponsor",
  champion: "champion",
  "day-to-day-user": "day-to-day user",
  "implementation-owner": "implementation owner",
  "technical-security-reviewer": "technical or security reviewer",
  "procurement-finance": "procurement or finance reviewer",
  legal: "legal reviewer",
  operations: "operations stakeholder",
  "customer-success-support": "customer success or support stakeholder",
  "external-advisor-consultant": "external advisor or consultant",
  "board-investor": "board or investor",
  "likely-blocker": "likely blocker"
};

const buyerPersonaCategoryLabels = {
  "economic-buyer": "Economic Buyer",
  "executive-sponsor": "Executive Sponsor",
  champion: "Champion",
  "day-to-day-user": "Day-to-Day User",
  "implementation-owner": "Implementation Owner",
  "technical-security-reviewer": "Technical / Security Reviewer",
  "procurement-finance": "Finance / Procurement",
  legal: "Legal",
  operations: "Operations",
  "customer-success-support": "Customer Success / Support",
  "external-advisor-consultant": "External Advisor / Consultant",
  "board-investor": "Board / Investor",
  "likely-blocker": "Likely Blocker"
};

const buyerPersonaCategoryOptions = Object.values(buyerPersonaCategoryLabels);

function normalizeBuyerPersonaCategory(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  const aliases = {
    "Procurement / Finance": "Finance / Procurement",
    "Technical Reviewer": "Technical / Security Reviewer",
    "Security Reviewer": "Technical / Security Reviewer",
    "End User": "Day-to-Day User",
    User: "Day-to-Day User"
  };
  if (aliases[text]) {
    return aliases[text];
  }

  const roleIdMatch = buyerPersonaCategoryLabels[text];
  if (roleIdMatch) {
    return roleIdMatch;
  }

  return buyerPersonaCategoryOptions.find((option) => option.toLowerCase() === text.toLowerCase()) || "";
}

function buyerPersonaRoleIdFromLabel(value) {
  const normalized = normalizeBuyerPersonaCategory(value);
  return Object.entries(buyerPersonaCategoryLabels)
    .find(([, label]) => label.toLowerCase() === normalized.toLowerCase())?.[0] || "";
}

function splitCommitteeRoles(value) {
  return String(value || "")
    .split(/[;,|]/)
    .map((item) => normalizeBuyerPersonaCategory(item.trim()) || item.trim())
    .filter((item) => item && item !== "Not sure yet" && item !== "Other");
}

function splitAnswerList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isPlaceholderRecommendation(value) {
  const text = String(value || "").trim();
  return !text
    || /^ai$/i.test(text)
    || /^ai please$/i.test(text)
    || /^please ai$/i.test(text)
    || /ai\s+reco?mm?end?a?tion/i.test(text)
    || /needs?\s+to\s+be\s+(an?\s+)?ai/i.test(text)
    || /^What makes .+ important enough for the .+ to address now\?/i.test(text)
    || /^How is .+ affecting your team, budget, timeline, or results today\?/i.test(text);
}

function generatedBuyerBeliefStatement(data, roleId) {
  const prefix = `buyerRoleCards__${roleId}__`;
  const roleLabel = buyerPersonaRoleLabels[roleId] || "buyer";
  const pain = data[`${prefix}painPriority`] || data.bestFitPrimaryPain || data.quickBuyerProblem || "their priority problem";
  const caresAbout = splitAnswerList(data[`${prefix}caresAbout`])[0] || data.quickPrimaryOutcome || "the outcome";
  const objection = data[`${prefix}likelyObjection`] || data[`${prefix}objectionDetail`] || "risk";
  const proof = splitAnswerList(data[`${prefix}proofNeeded`])[0] || data.mainProofPoint || "credible proof";
  const clean = (value) => String(value || "").replace(/[.?!]+$/g, "").trim();

  return `This ${roleLabel} needs to believe the problem is worth solving now, the offer will help with ${clean(pain).toLowerCase()}, and the risk around ${clean(objection).toLowerCase()} can be managed. They will likely need ${clean(proof).toLowerCase()} that connects to ${clean(caresAbout).toLowerCase()}.`;
}

function generatedBuyerDiscoveryQuestions(data, roleId) {
  const prefix = `buyerRoleCards__${roleId}__`;
  const roleLabel = buyerPersonaRoleLabels[roleId] || "buyer";
  const pain = data[`${prefix}painPriority`] || data.bestFitPrimaryPain || data.quickBuyerProblem || "";
  const caresAbout = splitAnswerList(data[`${prefix}caresAbout`])[0] || data.quickPrimaryOutcome || "";
  const belief = data[`${prefix}needsToBelieve`] || "";
  const objection = data[`${prefix}likelyObjection`] || data[`${prefix}objectionDetail`] || "";
  const proof = splitAnswerList(data[`${prefix}proofNeeded`])[0] || "";
  const clean = (value) => String(value || "").replace(/[.?!]+$/g, "").trim();
  const context = (value) => clean(value) ? ` Context to test: ${clean(value)}.` : "";
  const questions = [
    `What is the most important problem this ${roleLabel} needs solved right now?${context(pain)}`,
    `How does this ${roleLabel} measure success, and what would need to change for this to be worth prioritizing?${context(caresAbout)}`,
    `What would the ${roleLabel} need to believe before supporting the next step?`,
    `What concern could slow or block the decision, and how would they want that risk handled?${context(objection)}`,
    `What proof would make this feel credible enough to move forward?${context(proof || belief)}`
  ];

  return questions.join("\n");
}

function proofAssetExistsForOffer(data, offerRowId, assetName) {
  const text = String(assetName || "").toLowerCase();
  const offerAssets = [
    offerScopedValue(data, offerRowId, "salesAssets"),
    offerScopedValue(data, offerRowId, "mainProofPoint"),
    offerScopedValue(data, offerRowId, "priorityMissingAssets")
  ].join(" ").toLowerCase();
  const proofRows = tableRowsFromData(data, offerRowId ? scopedOfferTable(offerRowId, "proofReadiness") : "proofReadiness");
  const proofText = proofRows.map((row) => [row.values.proofType, row.values.assetExists, row.values.assetSource, row.values.strength].join(" ")).join(" ").toLowerCase();
  const aliases = {
    "security packet": ["security", "privacy", "technical"],
    "pricing / business case": ["business case", "pricing", "proposal"],
    "before / after story": ["before", "after", "case study", "customer story"],
    testimonial: ["testimonial", "reviews", "customer quote"],
    "reference customer": ["reference"],
    "roi calculator": ["roi", "calculator"]
  };
  const needles = [text, ...(aliases[text] || [])].filter(Boolean);
  return needles.some((needle) => offerAssets.includes(needle) || proofText.includes(needle));
}

function missingCommitteeAssets(data, row) {
  const offerRowId = row?.rowId || null;
  return splitAnswerList(row?.values.buyingCommitteeProofNeeded)
    .filter((asset) => !["Other", "Not sure yet"].includes(asset))
    .filter((asset) => !proofAssetExistsForOffer(data, offerRowId, asset));
}

function generatedCommitteeMessageAngle(data, row) {
  const primaryBuyer = row?.values.primaryBuyer || data.primaryBuyerForOffer || data.primaryBuyer || "the primary buyer";
  const committee = splitAnswerList(row?.values.buyingCommitteeRoles).filter((item) => item !== "Not sure yet");
  const concerns = splitAnswerList(row?.values.buyingCommitteePrimaryConcern);
  const proofNeeded = splitAnswerList(row?.values.buyingCommitteeProofNeeded);
  const objections = splitAnswerList(row?.values.buyingCommitteeLikelyObjection);
  const assets = splitAnswerList(offerScopedValue(data, row?.rowId, "salesAssets")).slice(0, 3);
  const committeeText = committee.length ? committee.join(", ") : "the roles that influence approval, implementation, and risk";
  const concernText = concerns.length ? concerns.slice(0, 3).join(", ").toLowerCase() : "business impact, risk, and implementation effort";
  const proofText = proofNeeded.length ? proofNeeded.slice(0, 3).join(", ").toLowerCase() : "credible proof";
  const objectionText = objections.length ? objections.slice(0, 2).join(", ").toLowerCase() : "delay or uncertainty";
  const assetText = assets.length ? ` Use existing assets first: ${assets.join(", ")}.` : "";

  return `Lead with the outcome that matters to ${primaryBuyer}, then equip ${committeeText} with proof around ${concernText}. Address ${objectionText} directly and use ${proofText} to make the decision feel safer.${assetText}`;
}

function generatedCommitteeMissingAssetNote(data, row) {
  const missing = missingCommitteeAssets(data, row);
  if (!missing.length) {
    return "No immediate missing committee asset is suggested from the current selections.";
  }
  return `Potential missing asset: ${missing.slice(0, 3).join(", ")}. Create or improve this asset before relying on the committee message in sales.`;
}

function shouldReplaceGeneratedCommitteeMessage(value) {
  const text = String(value || "").trim();
  return !text || /^Lead with the outcome that matters to /i.test(text) || /^The tool will suggest/i.test(text);
}

function updateBuyingCommitteeMessageAngles(data = getFormData()) {
  offerPortfolioRows(data).forEach((row) => {
    const messageName = `offerPortfolio__${row.rowId}__buyingCommitteeMessageAngle`;
    const missingName = `offerPortfolio__${row.rowId}__buyingCommitteeMissingAssetNote`;
    const messageInput = document.querySelector(`[name="${CSS.escape(messageName)}"]`);
    const missingInput = document.querySelector(`[name="${CSS.escape(missingName)}"]`);

    if (messageInput && shouldReplaceGeneratedCommitteeMessage(messageInput.value)) {
      messageInput.value = generatedCommitteeMessageAngle(data, row);
    }
    if (missingInput) {
      missingInput.value = generatedCommitteeMissingAssetNote(data, row);
    }
  });
}

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

  const syncCommitteeRole = (roleLabel, source = {}) => {
    const roleId = buyerPersonaRoleIdFromLabel(roleLabel);
    if (!roleId) {
      return;
    }
    setRoleInvolvedIfBlank(data, roleId);
    setValueIfBlank(data, `personaPriority__${roleId}__importance`, ["Economic Buyer", "Executive Sponsor", "Champion", "Likely Blocker"].includes(normalizeBuyerPersonaCategory(roleLabel)) ? "High" : "Medium");
    setValueIfBlank(data, `buyerRoleCards__${roleId}__commonTitles`, source.primaryBuyer);
    setValueIfBlank(data, `buyerRoleCards__${roleId}__caresAbout`, source.concerns);
    setValueIfBlank(data, `buyerRoleCards__${roleId}__proofNeeded`, source.proofNeeded);
    setValueIfBlank(data, `buyerRoleCards__${roleId}__likelyObjection`, source.objections);
    setValueIfBlank(data, `buyerRoleCards__${roleId}__message`, source.messageAngle);
  };

  offerPortfolioRows(data).forEach((row) => {
    splitCommitteeRoles(row.values.buyingCommitteeRoles).forEach((role) => syncCommitteeRole(role, {
      primaryBuyer: row.values.primaryBuyer,
      concerns: row.values.buyingCommitteePrimaryConcern,
      proofNeeded: row.values.buyingCommitteeProofNeeded,
      objections: row.values.buyingCommitteeLikelyObjection,
      messageAngle: row.values.buyingCommitteeMessageAngle
    }));
  });

  getSignalPlayRows(data).forEach((row) => {
    splitCommitteeRoles(row.values.buyingCommitteeRoles).forEach((role) => syncCommitteeRole(role, {
      primaryBuyer: row.values.primaryBuyerPersona
    }));
  });

  getRevenueMotionRows(data).forEach((row) => {
    splitCommitteeRoles(row.values.buyingCommitteeRoles).forEach((role) => syncCommitteeRole(role, {
      primaryBuyer: row.values.primaryBuyer
    }));
  });

  buyerPersonaRoles.forEach((roleId) => {
    setIfBlank(`buyerRoleCards__${roleId}__commonTitles`, `buyingCommittee__${roleId}__titles`, data);
    setIfBlank(`buyerRoleCards__${roleId}__painPriority`, `buyingCommittee__${roleId}__pain`, data);
    setIfBlank(`buyerRoleCards__${roleId}__message`, `buyingCommittee__${roleId}__message`, data);
    setIfBlank(`buyerRoleCards__${roleId}__discoveryQuestions`, `buyingCommittee__${roleId}__questions`, data);
    if (roleHasBuyerCardData(data, roleId) && isPlaceholderRecommendation(data[`buyerRoleCards__${roleId}__needsToBelieve`])) {
      data[`buyerRoleCards__${roleId}__needsToBelieve`] = generatedBuyerBeliefStatement(data, roleId);
    }
    if (roleHasBuyerCardData(data, roleId) && isPlaceholderRecommendation(data[`buyerRoleCards__${roleId}__discoveryQuestions`])) {
      data[`buyerRoleCards__${roleId}__discoveryQuestions`] = generatedBuyerDiscoveryQuestions(data, roleId);
    }

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
    ["bestFitCurrentWorkaround__item-1", "offerCurrentWorkaround"],
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

function buyerTransformationSummaryFromClaim(valueClaim) {
  if (!valueClaim) {
    return "";
  }

  const parts = [];
  if (valueClaim.values.beforeState || valueClaim.values.baseline) {
    parts.push(`Before: ${valueClaim.values.beforeState || valueClaim.values.baseline}.`);
  }
  if (valueClaim.values.afterState || valueClaim.values.targetImprovementDescription || valueClaim.values.improvement) {
    parts.push(`After: ${valueClaim.values.afterState || valueClaim.values.targetImprovementDescription || valueClaim.values.improvement}.`);
  }
  if (valueClaimOutcome(valueClaim.values) || valueClaimMetric(valueClaim.values) || valueClaim.values.timeToImpact || valueClaim.values.timeframe) {
    parts.push(`Outcome: ${[valueClaimOutcome(valueClaim.values), valueClaimMetric(valueClaim.values), valueClaim.values.timeToImpact || valueClaim.values.timeframe].filter(Boolean).join(" / ")}.`);
  }
  return parts.join(" ");
}

function scopedOfferRowIdFromTable(tableId) {
  const match = String(tableId || "").match(/^offerAssessments__(offer-\d+)__valueClaims$/);
  return match ? match[1] : null;
}

function cleanGeneratedPhrase(value) {
  return String(value || "").replace(/[.?!]+$/g, "").trim();
}

function generatedValueClaimBeforeState(values, data = {}, offerRowId = null) {
  const offerRow = offerRowId ? offerPortfolioRows(data).find((row) => row.rowId === offerRowId) : null;
  const buyer = offerRow?.values.primaryBuyer || data.primaryBuyerForOffer || data.primaryBuyer || "the buyer";
  const problem = offerScopedValue(data, offerRowId, "offerBuyerProblem", data.offerBuyerProblem || data.urgentBuyerProblem || data.bestFitPrimaryPain || data.quickBuyerProblem);
  const workaround = values.baselineValue || values.baseline || offerScopedValue(data, offerRowId, "offerCurrentWorkaround", data.offerCurrentWorkaround || data.currentWorkaround || data.bestFitCurrentWorkaround);
  const cost = offerScopedValue(data, offerRowId, "offerCostOfInaction", data.offerCostOfInaction || data.costOfInaction);
  const outcome = valueClaimOutcome(values) || values.buyerFacingClaim || values.buyerLanguage;
  const parts = [`${buyer} is dealing with ${cleanGeneratedPhrase(problem || outcome || "a priority problem")}`];

  if (workaround) {
    parts.push(`while the current state is ${cleanGeneratedPhrase(workaround)}`);
  }

  if (cost) {
    parts.push(`and inaction creates ${cleanGeneratedPhrase(cost)}`);
  }

  return `${parts.join(", ")}.`;
}

function generatedValueClaimAfterState(values, data = {}, offerRowId = null) {
  const offerRow = offerRowId ? offerPortfolioRows(data).find((row) => row.rowId === offerRowId) : null;
  const buyer = offerRow?.values.primaryBuyer || data.primaryBuyerForOffer || data.primaryBuyer || "the buyer";
  const outcome = valueClaimOutcome(values) || values.targetImprovementDescription || values.improvement || values.buyerFacingClaim || values.buyerLanguage || firstValueClaimOutcome(data, offerRowId) || offerScopedValue(data, offerRowId, "firstUseCaseForOffer", data.firstUseCaseForOffer);
  const improvement = values.targetImprovementDescription || values.targetImprovementValue || values.improvement || values.expectedImprovement;
  const metric = valueClaimMetric(values);
  const timeframe = values.timeToImpact || values.timeframe;
  const proof = values.evidenceNotes || values.proofSource || offerScopedValue(data, offerRowId, "mainProofPoint", data.mainProofPoint);
  const parts = [`${buyer} can achieve ${cleanGeneratedPhrase(outcome || "a measurable improvement")}`];
  const buyerLanguage = (values.buyerFacingClaim || values.buyerLanguage) && (values.buyerFacingClaim || values.buyerLanguage) !== outcome ? (values.buyerFacingClaim || values.buyerLanguage) : "";

  if (improvement) {
    parts.push(`with improvement toward ${cleanGeneratedPhrase(improvement)}`);
  }

  if (metric) {
    parts.push(`measured by ${cleanGeneratedPhrase(metric)}`);
  }

  if (timeframe) {
    parts.push(`within ${cleanGeneratedPhrase(timeframe)}`);
  }

  if (proof) {
    parts.push(`supported by ${cleanGeneratedPhrase(proof)}`);
  }

  return `${parts.join(", ")}.${buyerLanguage ? ` Buyer language to test: ${cleanGeneratedPhrase(buyerLanguage)}.` : ""}`;
}

function shouldReplaceGeneratedValueClaimState(value) {
  const text = String(value || "").trim();
  return !text
    || /^[^.!?]+ is trying to solve /i.test(text)
    || /^[^.!?]+ is dealing with /i.test(text)
    || /^[^.!?]+ can achieve /i.test(text);
}

function firstTransformationValueClaim(data, tableId) {
  return firstFilledTableRow(data, tableId, (row) => (
    row.values.beforeState
    || row.values.afterState
    || row.values.baseline
    || row.values.improvement
    || row.values.outcome
    || row.values.baselineValue
    || row.values.targetImprovementDescription
    || row.values.outcomeType
    || row.values.buyerFacingClaim
  ));
}

function applyValueClaimGeneratedStates(data, tableId, offerRowId = null) {
  tableRowsFromData(data, tableId).forEach((row) => {
    const mappings = [
      ["outcome", "outcomeType"],
      ["buyerLanguage", "buyerFacingClaim"],
      ["metric", "successMetric"],
      ["baseline", "baselineValue"],
      ["improvement", "targetImprovementDescription"],
      ["expectedImprovement", "targetImprovementDescription"],
      ["timeframe", "timeToImpact"],
      ["proofSource", "evidenceNotes"]
    ];
    mappings.forEach(([oldField, newField]) => {
      setValueIfBlank(data, `${tableId}__${row.rowId}__${newField}`, row.values[oldField]);
      row.values[newField] = data[`${tableId}__${row.rowId}__${newField}`];
    });
    if (row.values.improvement && !data[`${tableId}__${row.rowId}__legacyWhatShouldImprove`]) {
      data[`${tableId}__${row.rowId}__legacyWhatShouldImprove`] = row.values.improvement;
      row.values.legacyWhatShouldImprove = row.values.improvement;
    }

    const hasClaimContext = row.values.outcome
      || row.values.buyerLanguage
      || row.values.metric
      || row.values.baseline
      || row.values.improvement
      || row.values.expectedImprovement
      || row.values.proofSource
      || row.values.outcomeType
      || row.values.buyerFacingClaim
      || row.values.successMetric
      || row.values.baselineValue
      || row.values.targetImprovementDescription
      || row.values.evidenceNotes;

    if (!hasClaimContext) {
      return;
    }

    const beforeKey = `${tableId}__${row.rowId}__beforeState`;
    const afterKey = `${tableId}__${row.rowId}__afterState`;
    if (shouldReplaceGeneratedValueClaimState(data[beforeKey])) {
      data[beforeKey] = generatedValueClaimBeforeState(row.values, data, offerRowId);
    }
    row.values.beforeState = data[beforeKey];
    if (shouldReplaceGeneratedValueClaimState(data[afterKey])) {
      data[afterKey] = generatedValueClaimAfterState(row.values, data, offerRowId);
    }
    row.values.afterState = data[afterKey];
  });
}

function applyOfferGeneratedFields(data) {
  applyValueClaimGeneratedStates(data, "valueClaims");

  const legacyPromise = offerPromiseSummary(data);
  if (shouldReplaceGeneratedOfferPromise(data.suggestedOfferPromise)) {
    data.suggestedOfferPromise = legacyPromise;
  }

  const legacySummary = buyerTransformationSummaryFromClaim(firstTransformationValueClaim(data, "valueClaims"));
  if (legacySummary && !String(data.offerBuyerTransformationSummary || "").trim()) {
    data.offerBuyerTransformationSummary = legacySummary;
  }

  offerPortfolioRows(data).forEach((offerRow) => {
    const rowId = offerRow.rowId;
    const scopedValueClaimsTable = scopedOfferTable(rowId, "valueClaims");
    const scopedPromise = offerPromiseSummary(data, rowId);
    const scopedPromiseField = scopedOfferField(rowId, "suggestedOfferPromise");
    const scopedSummaryField = scopedOfferField(rowId, "buyerTransformationSummary");
    applyValueClaimGeneratedStates(data, scopedValueClaimsTable, rowId);
    const scopedSummary = buyerTransformationSummaryFromClaim(firstTransformationValueClaim(data, scopedValueClaimsTable));

    if (shouldReplaceGeneratedOfferPromise(data[scopedPromiseField])) {
      data[scopedPromiseField] = scopedPromise;
    }
    if (scopedSummary && !String(data[scopedSummaryField] || "").trim()) {
      data[scopedSummaryField] = scopedSummary;
    }
  });
}

function updateBuyerDiscoveryQuestions(data = getFormData()) {
  buyerPersonaRoles.forEach((roleId) => {
    const fieldName = `buyerRoleCards__${roleId}__discoveryQuestions`;
    const input = document.querySelector(`[name="${CSS.escape(fieldName)}"]`);
    if (!input || !roleHasBuyerCardData(data, roleId) || !isPlaceholderRecommendation(input.value)) {
      return;
    }

    input.value = generatedBuyerDiscoveryQuestions(data, roleId);
  });
}

function updateBuyerBeliefStatements(data = getFormData()) {
  buyerPersonaRoles.forEach((roleId) => {
    const fieldName = `buyerRoleCards__${roleId}__needsToBelieve`;
    const input = document.querySelector(`[name="${CSS.escape(fieldName)}"]`);
    if (!input || !roleHasBuyerCardData(data, roleId) || !isPlaceholderRecommendation(input.value)) {
      return;
    }

    input.value = generatedBuyerBeliefStatement(data, roleId);
  });
}

function updateOfferGeneratedPromiseFields(data = getFormData()) {
  document.querySelectorAll('textarea[name$="suggestedOfferPromise"]').forEach((input) => {
    if (!shouldReplaceGeneratedOfferPromise(input.value)) {
      return;
    }

    const match = input.name.match(/^offerAssessments__(offer-\d+)__suggestedOfferPromise$/);
    input.value = offerPromiseSummary(data, match ? match[1] : null);
  });
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
  setValueIfBlank(data, `buyingTriggerEvents__${rowId}__triggerEvent`, matched || `Other: ${text}`);
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
    ["negativeSignals"].forEach((listId) => {
      listValues(data, listId).forEach((value) => {
        const rowId = firstBlankSignalCardId(data, "negativeSignalRules", "negative-signal");
        const text = String(value || "").trim();
        const matched = negativeSignalOptions.find((option) => option.toLowerCase() === text.toLowerCase());
        setValueIfBlank(data, `negativeSignalRules__${rowId}__negativeSignal`, matched || "Other");
        setValueIfBlank(data, `negativeSignalRules__${rowId}__notes`, matched ? "" : text);
        setValueIfBlank(data, `negativeSignalRules__${rowId}__action`, "Needs review");
      });
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
    const primaryBuyerPersona = normalizeBuyerPersonaCategory(data.signalPrimaryBuyer)
      || normalizeBuyerPersonaCategory(data.bestFitDecisionMaker)
      || normalizeBuyerPersonaCategory(data.primaryBuyerForOffer)
      || "Not sure";
    setValueIfBlank(data, "signalPlayPortfolio__play-1__playName", "Primary targeting strategy");
    setValueIfBlank(data, "signalPlayPortfolio__play-1__customerGroup", data.signalPriorityIcp || data.bestFitCustomerGroup || data.priorityIcpForOffer || "Not sure yet");
    setValueIfBlank(data, "signalPlayPortfolio__play-1__offerOrUseCase", data.signalOfferUseCase || data.offerBeingAssessed || data.firstUseCaseForOffer || data.bestFitFirstUseCase || "Not sure yet");
    setValueIfBlank(data, "signalPlayPortfolio__play-1__primaryBuyerPersona", primaryBuyerPersona);
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

  tableRowsFromData(data, "signalPlayPortfolio").forEach((row) => {
    const key = `signalPlayPortfolio__${row.rowId}__primaryBuyerPersona`;
    const normalizedPersona = normalizeBuyerPersonaCategory(data[key]);
    if (normalizedPersona) {
      data[key] = normalizedPersona;
    } else if (String(data[key] || "").trim() && data[key] !== "Other") {
      data[key] = "Not sure";
    }
  });

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

  Object.keys(normalized).forEach((key) => {
    const isCustomerGroupReference = /(?:^|__)(?:customerGroup|targetCustomerGroup|priorityIcp|offerTargetSegment|verticalFit)(?:__item-\d+)?$/i.test(key);
    if (isCustomerGroupReference) {
      normalized[key] = String(normalized[key] || "")
        .split(/[;,|]/)
        .map((item) => normalizedCustomerGroupOption(item) || String(item || "").trim())
        .filter(Boolean)
        .filter((item, index, list) => list.indexOf(item) === index)
        .join("; ");
    }
  });

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
  migratePersonaData(normalized);
  applyOfferGeneratedFields(normalized);
  compactRepeatableList(normalized, "icpMustHaveSignals");
  compactRepeatableList(normalized, "icpNiceToHaveSignals");
  compactRepeatableList(normalized, "icpCautionSignals", { dropValues: deliveryRiskRuleTexts(normalized, "Caution signal") });
  compactRepeatableList(normalized, "icpDisqualificationRules", { dropValues: deliveryRiskRuleTexts(normalized, "Disqualification rule") });
  compactRepeatableList(normalized, "buyingTriggersSummary");

  return normalized;
}

function removeBareOtherSelections(data) {
  const otherValues = ["Other", "Other measurable outcome", "Other quantified results"];

  Object.keys(data).forEach((key) => {
    if (!otherValues.includes(String(data[key] || "").trim())) {
      return;
    }

    if (!String(data[`${key}__other`] || "").trim()) {
      data[key] = "";
    }
  });

  return data;
}

async function saveDraft(showStatus = true) {
  const data = removeBareOtherSelections(getFormData());

  if (!hasMeaningfulData(data)) {
    if (showStatus) {
      document.getElementById("saveStatus").textContent = "Nothing to save yet.";
    }
    return false;
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
  const savedToWorkspace = await saveRecordToBackend(savedRecord);

  if (showStatus) {
    document.getElementById("saveStatus").textContent = savedToWorkspace
      ? "Company saved."
      : "Saved in this browser, but the workspace copy could not be updated. Try Save again.";
  }
  return savedToWorkspace;
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
  updateBestFitCustomerOptions({ skipDynamicOptions: Boolean(options.skipDynamicOptions) });
  updateSuccessFocusFields();
  updateBuyerBeliefStatements();
  updateBuyerDiscoveryQuestions();
  updatePreRevenueBuyerDiscoveryContext();
  updatePreRevenueValidationMotionContext();
  updatePreRevenueEvidenceTrackerContext();
  updatePreRevenueValidationMotionRecommendations();
  updateOfferGeneratedPromiseFields();
  updateBuyingCommitteeMessageAngles();
}

function scheduleIntakeUiRefresh(options = {}) {
  pendingIntakePanelRefresh = pendingIntakePanelRefresh || Boolean(options.refreshPanels);
  pendingSkipDynamicOptions = pendingSkipDynamicOptions || Boolean(options.skipDynamicOptions);
  window.clearTimeout(intakeUiRefreshTimer);
  intakeUiRefreshTimer = window.setTimeout(() => {
    refreshIntakeUi({ refreshPanels: pendingIntakePanelRefresh, skipDynamicOptions: pendingSkipDynamicOptions });
    pendingIntakePanelRefresh = false;
    pendingSkipDynamicOptions = false;
  }, 300);
}

function shouldRefreshAssessmentPanels(event) {
  const name = changedFieldName(event);

  return name === "primaryGtmOffer"
    || name === "primarySignalPlay"
    || name === "primaryRevenueMotion"
    || /^offerPortfolio__.+__(offerName|offerRole|offerPriority|assessmentDepth)$/.test(name)
    || /^signalPlayPortfolio__.+__(playName|playPriority|assessmentDepth)$/.test(name)
    || /^revenueMotionPortfolio__.+__(playName|playPriority|assessmentDepth|salesMotionType)$/.test(name);
}

function startBlankCompany() {
  const data = getFormData();

  if (hasMeaningfulData(data)) {
    saveDraft(false);
  }

  window.clearTimeout(autosaveTimer);
  window.clearTimeout(intakeUiRefreshTimer);
  autosaveTimer = null;
  intakeUiRefreshTimer = null;
  formStateData = {};
  lastAutosaveSignature = "";
  currentReportMode = "quick";
  detailedSectionsVisible = false;
  activeSectionId = "company";
  setActiveRecordId("");
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(IMPROVEMENT_FOCUS_KEY);
  ["quick", "detailed", "preRevenue"].forEach((mode) => {
    localStorage.removeItem(`${ACTIVE_SECTION_KEY}:draft:${mode}`);
  });
  window.location.href = "index.html?new=1#company";
}

function clearCurrentForm() {
  if (!window.confirm("Clear form may result in loss of data.. Do you wish to proceed?")) {
    return;
  }

  setActiveRecordId("");
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(IMPROVEMENT_FOCUS_KEY);
  ["quick", "detailed", "preRevenue"].forEach((mode) => {
    localStorage.removeItem(`${ACTIVE_SECTION_KEY}:draft:${mode}`);
  });
  window.location.href = "index.html?new=1#company";
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
  const hasExplicitSelection = Boolean(select.value && select.value !== "Not sure yet");
  note.hidden = !strongest || hasExplicitSelection;
  if (strongest && !hasExplicitSelection) {
    note.textContent = `Suggested best-fit group: ${strongest.values.groupName} (${strongest.values.segmentFitScore}/15).`;
  }
}

function updateBestFitCustomerOptions(options = {}) {
  const select = document.querySelector("[name='bestFitCustomerGroup']");

  if (!select) {
    return;
  }

  if (!options.skipDynamicOptions) {
    updateDynamicOptionFields();
  }
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

function meaningfulPreRevenueSegments(data = getFormData()) {
  return tableRowsFromData(data, "preCustomerHypotheses")
    .filter((row) => [
      row.values.segmentName,
      row.values.segmentName__other,
      row.values.segmentNameUnknown,
      row.values.groupName,
      row.values.segmentType,
      row.values.segmentTypeUnknown,
      row.values.description,
      row.values.specificUseCaseDefinition,
      row.values.specificDefinition,
      row.values.problem,
      row.values.problemUnknown,
      row.values.whyNow,
      row.values.whyNowUnknown,
      row.values.likelyBuyerPath,
      row.values.likelyBuyerDtc,
      row.values.likelyBuyerChannel,
      row.values.reachability,
      row.values.reachabilityUnknown,
      row.values.credibility,
      row.values.credibilityUnknown,
      row.values.validationPathDtc,
      row.values.validationPathDtcUnknown,
      row.values.validationPathChannel,
      row.values.validationPathChannelUnknown,
      row.values.validationPath,
      row.values.validationPathUnknown,
      row.values.evidenceAvailableDtc,
      row.values.evidenceAvailableDtcUnknown,
      row.values.evidenceAvailableChannel,
      row.values.evidenceAvailableChannelUnknown,
      row.values.riskRequirementsDtc,
      row.values.riskRequirementsDtcUnknown,
      row.values.riskRequirementsChannel,
      row.values.riskRequirementsChannelUnknown,
      row.values.successRequirements,
      row.values.successRequirementsUnknown
    ].some((value) => String(value || "").trim()));
}

function validatePreRevenueFirstWinSegments() {
  const data = getFormData();
  const segments = meaningfulPreRevenueSegments(data);
  const status = document.getElementById("saveStatus");
  const broadOnlyPattern = /\b(everyone|anyone|all businesses|all companies|all customers|small businesses|businesses|consumers)\b/i;
  const hasBroadOnlySegment = segments.some((row) => {
    const text = [row.values.segmentName__other, row.values.segmentNameUnknown, row.values.segmentName, row.values.groupName, row.values.description, row.values.specificDefinition].filter(Boolean).join(" ");
    return broadOnlyPattern.test(text) && !String(row.values.problem || "").trim() && !String(row.values.reachability || "").trim();
  });

  if (segments.length < 2) {
    if (status) {
      status.textContent = "Add at least two candidate first-win segments before generating the validation plan. This module needs comparison, not a single broad ICP guess.";
    }
    switchActiveSection("preRevenueHypotheses");
    return false;
  }

  if (hasBroadOnlySegment) {
    if (status) {
      status.textContent = "One candidate segment looks too broad. Split it into a narrower first-win segment with a specific problem and reach path.";
    }
    switchActiveSection("preRevenueHypotheses");
    return false;
  }

  return true;
}

function sectionForDataKey(key) {
  const cleanKey = String(key || "").replace(/__other$/, "");
  const directSection = sectionForField(cleanKey);
  if (directSection) {
    return directSection;
  }

  const parts = cleanKey.split("__");
  if (parts.length >= 3) {
    return schema.sections.find((section) => sectionTables(section).some((table) => table.id === parts[0])) || null;
  }

  return null;
}

function dataQualityLabel(key) {
  const field = findFieldDefinitionForDataKey(String(key || "").replace(/__other$/, ""));
  const fallback = String(key || "").split("__").pop().replace(/([a-z])([A-Z])/g, "$1 $2");
  return field?.label || `${fallback.charAt(0).toUpperCase()}${fallback.slice(1)}`;
}

function dataQualityValues(value) {
  return String(value || "")
    .split(/\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function unresolvedOtherValue(value) {
  return dataQualityValues(value).some((item) => /^(?:other|other measurable outcome|other quantified results|other\s*\/\s*not sure yet)$/i.test(item));
}

function normalizedDuplicateLabel(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b(?:incorporated|corporation|company|limited|llc|inc|ltd|co)\b/g, "")
    .replace(/\b(founder[- ]led) sales\b/g, "$1")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\b([a-z]+)s\b/g, "$1");
}

function duplicatePairId(labels = []) {
  return Array.from(new Set(labels.map((label) => String(label || "").trim().toLowerCase()).filter(Boolean)))
    .sort()
    .join("::");
}

function storedDataHygieneList(data, key) {
  try {
    const parsed = JSON.parse(String(data?.[key] || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function canonical90DayGoal(value) {
  const normalized = String(value || "").trim().toLowerCase();
  const aliases = {
    "lead flow": "lead-flow",
    revenue: "revenue",
    retention: "retention",
    expansion: "expansion",
    awareness: "awareness",
    "category awareness": "awareness",
    "systems / processes": "systems",
    "systems / process improvement": "systems",
    hiring: "hiring",
    "hiring / team capacity": "hiring"
  };
  return aliases[normalized] || "";
}

function goalValueForField(canonical, fieldId) {
  const values = fieldId === "quick90DayGoal"
    ? {
      "lead-flow": "Lead flow",
      revenue: "Revenue",
      retention: "Retention",
      expansion: "Expansion",
      awareness: "Category awareness",
      systems: "Systems / process improvement",
      hiring: "Hiring / team capacity"
    }
    : {
      "lead-flow": "Lead flow",
      revenue: "Revenue",
      retention: "Retention",
      expansion: "Expansion",
      awareness: "Awareness",
      systems: "Systems / processes",
      hiring: "Hiring"
    };
  return values[canonical] || "";
}

function sourceConflictAcceptanceId(conflictId, values = []) {
  const signature = values
    .map((value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " "))
    .join("::");
  return `${conflictId}::${signature}`;
}

function sourceTruthConflictIssues(data) {
  const issues = [];
  const accepted = new Set(storedDataHygieneList(data, "dataHygieneAcceptedConflicts"));
  const quickGoal = canonical90DayGoal(data.quick90DayGoal);
  const detailedGoal = canonical90DayGoal(data.goal90);
  const goalAcceptanceId = sourceConflictAcceptanceId("90-day-goal", [data.quick90DayGoal, data.goal90]);

  if (quickGoal && detailedGoal && quickGoal !== detailedGoal && !accepted.has(goalAcceptanceId)) {
    issues.push({
      severity: "error",
      kind: "source-conflict",
      conflictId: "90-day-goal",
      acceptanceId: goalAcceptanceId,
      title: "Confirm the 90-day goal",
      detail: "The quick intake and detailed intake name different primary goals for the same 90-day period.",
      choices: [
        {
          label: `Use ${data.quick90DayGoal}`,
          source: "GTM Information",
          updates: {
            quick90DayGoal: goalValueForField(quickGoal, "quick90DayGoal"),
            goal90: goalValueForField(quickGoal, "goal90")
          }
        },
        {
          label: `Use ${data.goal90}`,
          source: "Revenue Goals, Strategy, and Constraints",
          updates: {
            quick90DayGoal: goalValueForField(detailedGoal, "quick90DayGoal"),
            goal90: goalValueForField(detailedGoal, "goal90")
          }
        }
      ]
    });
  }

  const quickTarget = parsePositiveMoneyValue(data.quick90DayRevenueTarget);
  const detailedTarget = parsePositiveMoneyValue(data.goal90RevenueTarget);
  const revenueGoalApplies = quickGoal === "revenue" && detailedGoal === "revenue";
  const targetAcceptanceId = sourceConflictAcceptanceId("90-day-revenue-target", [quickTarget, detailedTarget]);
  if (revenueGoalApplies && quickTarget && detailedTarget && quickTarget !== detailedTarget && !accepted.has(targetAcceptanceId)) {
    issues.push({
      severity: "error",
      kind: "source-conflict",
      conflictId: "90-day-revenue-target",
      acceptanceId: targetAcceptanceId,
      title: "Confirm the 90-day revenue target",
      detail: "The quick intake and detailed intake contain different revenue targets for the same 90-day period.",
      choices: [
        {
          label: `Use ${data.quick90DayRevenueTarget}`,
          source: "GTM Information",
          updates: {
            quick90DayRevenueTarget: data.quick90DayRevenueTarget,
            goal90RevenueTarget: data.quick90DayRevenueTarget
          }
        },
        {
          label: `Use ${data.goal90RevenueTarget}`,
          source: "Revenue Goals, Strategy, and Constraints",
          updates: {
            quick90DayRevenueTarget: data.goal90RevenueTarget,
            goal90RevenueTarget: data.goal90RevenueTarget
          }
        }
      ]
    });
  }

  return issues;
}

function hasSavedValueMatching(data, pattern) {
  return Object.entries(data || {}).some(([key, value]) => pattern.test(key) && String(value || "").trim());
}

function planCompletenessIssues(data) {
  if (currentReportMode !== "detailed" || isPreRevenueMode()) return [];
  const checks = [
    {
      complete: Boolean(data.bestFitCustomerGroup || data["possibleCustomerGroups__customer-group-1__groupName"] || data.quickBestFitCustomer),
      key: "bestFitCustomerGroup",
      sectionId: "quickIcp",
      title: "Choose the priority customer group",
      detail: "The GTM plan needs one customer group to anchor targeting, messaging, proof, and execution."
    },
    {
      complete: Boolean(data.primaryGtmOffer || data.primaryOfferName || data.quickPrimaryOffer || hasSavedValueMatching(data, /^offerPortfolio__.+__offerName$/)),
      key: "primaryGtmOffer",
      sectionId: "offer",
      title: "Choose the primary offer",
      detail: "The GTM plan needs one named offer connected to the priority customer group."
    },
    {
      complete: Boolean(data.bestFitDecisionMaker || data.budgetOwner || data.primaryBuyer || hasSavedValueMatching(data, /^offerPortfolio__.+__primaryBuyer$/)),
      key: "bestFitDecisionMaker",
      sectionId: "personas",
      title: "Identify the primary buyer",
      detail: "The GTM plan needs a named buyer or decision-maker before it can recommend messaging and next actions."
    },
    {
      complete: Boolean(data.primaryRevenueMotion || data.quickCurrentSalesMotion || hasSavedValueMatching(data, /^revenueMotionPortfolio__.+__(?:playName|salesMotionType)$/)),
      key: "primaryRevenueMotion",
      sectionId: "pipeline",
      title: "Choose the revenue motion",
      detail: "The GTM plan needs one motion to organize the 30-day execution cycle."
    },
    {
      complete: Boolean(data.primaryRevenueChannel || data.quickPrimaryRevenueSource || hasSavedValueMatching(data, /^revenueMotionAssessments__.+__(?:channelSource|primaryChannel)$/)),
      key: "primaryRevenueChannel",
      sectionId: "pipeline",
      title: "Choose the channel or opportunity source",
      detail: "The GTM plan needs a channel or source that explains where the first opportunities will come from."
    }
  ];
  return checks.filter((check) => !check.complete).map((check) => ({ ...check, severity: "warning", kind: "plan-completeness" }));
}

function repeatedSummaryTextIssues(data) {
  const occurrences = new Map();
  Object.entries(data || {}).forEach(([key, rawValue]) => {
    if (/generated(?:Summary|Statement)|researchNotes|dataHygiene|Workspace$/i.test(key)) return;
    const value = String(rawValue || "").trim();
    if (value.length < 180 || (value.match(/[.!?]/g) || []).length < 2) return;
    const normalized = value.toLowerCase().replace(/\s+/g, " ").trim();
    if (!occurrences.has(normalized)) occurrences.set(normalized, []);
    occurrences.get(normalized).push(key);
  });
  const issues = [];
  occurrences.forEach((keys) => {
    const sourceGroups = new Set(keys.map((key) => key.split("__")[0]));
    if (keys.length < 3 || sourceGroups.size < 2) return;
    const key = keys[0];
    const section = sectionForDataKey(key);
    issues.push({
      key,
      sectionId: section?.id || "company",
      fieldLabel: dataQualityLabel(key),
      severity: "error",
      kind: "repeated-summary-text",
      title: "Replace repeated summary text",
      detail: `The same long answer appears in ${keys.length} unrelated fields. Review the affected questions below and replace the copied text with an answer that fits each question.`,
      matches: keys.map((matchKey) => {
        const matchSection = sectionForDataKey(matchKey);
        return {
          key: matchKey,
          sectionId: matchSection?.id || "company",
          fieldLabel: dataQualityLabel(matchKey)
        };
      })
    });
  });
  return issues;
}

function dataQualityIssues(data = getFormData()) {
  const issues = [];
  const duplicateCandidates = new Map();
  const duplicateFieldPattern = /(?:groupName|customerName|proofCustomer|offerName|motionName|salesMotion)$/i;
  const relationshipIdFields = new Set(["primaryGtmOffer", "primarySignalPlay", "primaryRevenueMotion"]);
  const confirmedSeparatePairs = new Set(storedDataHygieneList(data, "dataHygieneDistinctPairs"));

  Object.entries(data || {}).forEach(([key, rawValue]) => {
    if (key.endsWith("__other") || ["savedAt", "recordId"].includes(key)) {
      return;
    }

    if (rawValue && typeof rawValue === "object") {
      return;
    }

    const value = String(rawValue || "").trim();
    if (!value) {
      return;
    }

    const section = sectionForDataKey(key);
    const baseIssue = {
      key,
      sectionId: section?.id || "company",
      fieldLabel: dataQualityLabel(key)
    };

    if (unresolvedOtherValue(value) && !String(data[`${key}__other`] || "").trim()) {
      issues.push({
        ...baseIssue,
        severity: "error",
        title: "Define the Other selection",
        detail: `${baseIssue.fieldLabel} includes Other without saying what Other means.`
      });
    }

    if (/^(?:ai please|ai recommendation|this needs ai|undefined|null|\[object object\]|generic buyer)$/i.test(value)) {
      issues.push({
        ...baseIssue,
        severity: "error",
        title: "Replace placeholder text",
        detail: `${baseIssue.fieldLabel} contains a placeholder instead of a usable answer.`
      });
    }

    const fieldDefinition = findFieldDefinitionForDataKey(key);
    const storesRelationshipId = relationshipIdFields.has(key)
      || ["offerPortfolio", "signalPlayPortfolio", "revenueMotionPortfolio"].includes(fieldDefinition?.dynamicOptionsFrom);
    if (!storesRelationshipId && /^(?:motion|play|offer|customer-group)-\d+$/i.test(value)) {
      issues.push({
        ...baseIssue,
        severity: "error",
        title: "Replace an internal record label",
        detail: `${baseIssue.fieldLabel} contains a system label rather than the answer the plan should display.`
      });
    }

    if (duplicateFieldPattern.test(key)) {
      dataQualityValues(value).forEach((candidate) => {
        const normalized = normalizedDuplicateLabel(candidate);
        if (normalized.length < 3 || /^(?:other|not sure yet)$/.test(normalized)) {
          return;
        }
        if (!duplicateCandidates.has(normalized)) {
          duplicateCandidates.set(normalized, []);
        }
        duplicateCandidates.get(normalized).push({ ...baseIssue, value: candidate });
      });
    }
  });

  duplicateCandidates.forEach((matches) => {
    const distinctLabels = Array.from(new Set(matches.map((match) => match.value.toLowerCase())));
    if (matches.length < 2 || distinctLabels.length < 2) {
      return;
    }
    const labels = Array.from(new Set(matches.map((match) => match.value)));
    const pairId = duplicatePairId(labels);
    if (confirmedSeparatePairs.has(pairId)) {
      return;
    }
    const first = matches[0];
    const usages = Object.entries(data || {}).reduce((items, [key, value]) => {
      if (["dataHygieneResolutionLog", "dataHygieneDistinctPairs"].includes(key)) {
        return items;
      }
      if (structuredReferenceValue(value, labels, "__data_quality_reference__") === String(value || "")) {
        return items;
      }
      const section = sectionForDataKey(key);
      items.push({
        key,
        sectionId: section?.id || "company",
        fieldLabel: dataQualityLabel(key),
        value: String(value || "")
      });
      return items;
    }, []);
    issues.push({
      ...first,
      severity: "warning",
      title: "Confirm a possible duplicate",
      detail: `${labels.join(" and ")} may refer to the same item. Confirm before combining them.`,
      labels,
      pairId,
      matches: usages
    });
  });

  issues.push(...sourceTruthConflictIssues(data));
  issues.push(...planCompletenessIssues(data));
  issues.push(...repeatedSummaryTextIssues(data));

  return issues.filter((issue, index, allIssues) => allIssues.findIndex((candidate) => (
    candidate.key === issue.key && candidate.title === issue.title && candidate.detail === issue.detail
  )) === index);
}

function structuredReferenceValue(value, oldLabels, preferredLabel) {
  const text = String(value || "");
  const replacements = new Map(oldLabels.map((label) => [String(label).trim().toLowerCase(), preferredLabel]));
  const exact = replacements.get(text.trim().toLowerCase());
  if (exact) {
    return exact;
  }

  const separator = text.includes(";") ? "; " : text.includes(", ") ? ", " : "";
  if (!separator) {
    return text;
  }

  let changed = false;
  const updated = text.split(separator).map((item) => {
    const replacement = replacements.get(item.trim().toLowerCase());
    if (replacement) {
      changed = true;
      return replacement;
    }
    return item;
  });
  return changed ? Array.from(new Set(updated)).join(separator) : text;
}

function appendDataHygieneResolution(data, resolution) {
  const log = storedDataHygieneList(data, "dataHygieneResolutionLog");
  log.push({ ...resolution, resolvedAt: new Date().toISOString() });
  data.dataHygieneResolutionLog = JSON.stringify(log);
}

async function applyDuplicateResolution(issue, action, preferredLabel = "") {
  const data = getFormData();
  const labels = issue.labels || [];

  if (action === "separate") {
    const confirmed = new Set(storedDataHygieneList(data, "dataHygieneDistinctPairs"));
    confirmed.add(issue.pairId || duplicatePairId(labels));
    data.dataHygieneDistinctPairs = JSON.stringify(Array.from(confirmed));
    appendDataHygieneResolution(data, { action: "kept-separate", originalLabels: labels });
  } else {
    Object.keys(data).forEach((key) => {
      if (["dataHygieneResolutionLog", "dataHygieneDistinctPairs"].includes(key)) {
        return;
      }
      data[key] = structuredReferenceValue(data[key], labels, preferredLabel);
    });
    appendDataHygieneResolution(data, {
      action: "standardized-name",
      originalLabels: labels,
      preferredLabel
    });
  }

  formStateData = { ...formStateData, ...data };
  setFormData(data);
  refreshIntakeUi();
  const saved = await saveDraft(false);
  const remaining = dataQualityIssues();
  if (remaining.length) {
    showDataQualityReview(remaining, currentReportMode, "");
  } else {
    hideDataQualityReview();
  }
  const status = document.getElementById("saveStatus");
  if (status) {
    status.textContent = saved
      ? action === "separate"
        ? "The entries will remain separate. Your confirmation was saved."
        : `Updated structured references to ${preferredLabel}. The original names remain in the data-quality history.`
      : "The duplicate decision was applied in this browser, but the workspace copy could not be updated.";
  }
}

async function applySourceConflictResolution(issue, action, updates = {}) {
  const data = getFormData();

  if (action === "intentional") {
    const accepted = new Set(storedDataHygieneList(data, "dataHygieneAcceptedConflicts"));
    accepted.add(issue.acceptanceId || issue.conflictId);
    data.dataHygieneAcceptedConflicts = JSON.stringify(Array.from(accepted));
    appendDataHygieneResolution(data, {
      action: "accepted-intentional-conflict",
      conflictId: issue.conflictId,
      reason: String(updates.reason || "").trim(),
      choices: issue.choices?.map((choice) => ({ source: choice.source, label: choice.label })) || []
    });
  } else {
    Object.assign(data, updates);
    appendDataHygieneResolution(data, {
      action: "selected-source-of-truth",
      conflictId: issue.conflictId,
      updates
    });
  }

  formStateData = { ...formStateData, ...data };
  setFormData(data);
  refreshIntakeUi();
  const saved = await saveDraft(false);
  const remaining = dataQualityIssues();
  if (remaining.length) {
    showDataQualityReview(remaining, currentReportMode, "");
  } else {
    hideDataQualityReview();
  }
  const status = document.getElementById("saveStatus");
  if (status) {
    status.textContent = saved
      ? action === "intentional"
        ? "The difference was confirmed as intentional and saved."
        : "The source-of-truth decision was applied and saved."
      : "The decision was applied in this browser, but the workspace copy could not be updated.";
  }
}

function duplicateUsageLabel(match) {
  const section = schema.sections.find((item) => item.id === match.sectionId);
  const rowId = String(match.key || "").split("__")[1] || "";
  const rowLabel = rowId ? ` (${rowId.replace(/-/g, " ")})` : "";
  return `${section?.title || "Intake"}: ${match.fieldLabel}${rowLabel}`;
}

function renderDuplicateResolution(item, issue) {
  const controls = document.createElement("div");
  const usageTitle = document.createElement("strong");
  const usageList = document.createElement("ul");
  const choiceLabel = document.createElement("label");
  const choice = document.createElement("select");
  const actions = document.createElement("div");
  const standardize = document.createElement("button");
  const keepSeparate = document.createElement("button");

  controls.className = "data-quality-resolution";
  usageTitle.textContent = "Currently used in";
  Array.from(new Set((issue.matches || []).map(duplicateUsageLabel))).forEach((usage) => {
    const listItem = document.createElement("li");
    listItem.textContent = usage;
    usageList.appendChild(listItem);
  });
  choiceLabel.textContent = "Preferred name";
  (issue.labels || []).forEach((label) => choice.appendChild(createOption(label)));
  actions.className = "data-quality-resolution-actions";
  standardize.type = "button";
  standardize.textContent = "Use This Name Everywhere";
  standardize.addEventListener("click", () => applyDuplicateResolution(issue, "standardize", choice.value));
  keepSeparate.type = "button";
  keepSeparate.className = "secondary";
  keepSeparate.textContent = "Keep as Separate Entries";
  keepSeparate.addEventListener("click", () => applyDuplicateResolution(issue, "separate"));
  actions.append(standardize, keepSeparate);
  controls.append(usageTitle, usageList, choiceLabel, choice, actions);
  item.appendChild(controls);
}

function renderSourceConflictResolution(item, issue) {
  const controls = document.createElement("div");
  const choiceList = document.createElement("div");
  const explanationLabel = document.createElement("label");
  const explanation = document.createElement("textarea");
  const intentional = document.createElement("button");
  controls.className = "data-quality-resolution";
  choiceList.className = "data-quality-conflict-choices";

  (issue.choices || []).forEach((choice) => {
    const choiceCard = document.createElement("div");
    const source = document.createElement("span");
    const value = document.createElement("strong");
    const useButton = document.createElement("button");
    source.textContent = choice.source;
    value.textContent = choice.label.replace(/^Use\s+/i, "");
    useButton.type = "button";
    useButton.textContent = choice.label;
    useButton.addEventListener("click", () => applySourceConflictResolution(issue, "select", choice.updates));
    choiceCard.append(source, value, useButton);
    choiceList.appendChild(choiceCard);
  });

  intentional.type = "button";
  intentional.className = "secondary";
  intentional.textContent = "Keep Different With Explanation";
  intentional.disabled = true;
  explanationLabel.textContent = "Why should these answers remain different?";
  explanation.rows = 2;
  explanation.placeholder = "Explain the different periods, definitions, or decisions so the plan does not treat this as an accidental conflict.";
  explanation.addEventListener("input", () => {
    intentional.disabled = !explanation.value.trim();
  });
  intentional.addEventListener("click", () => {
    const reason = explanation.value.trim();
    if (!reason) return;
    applySourceConflictResolution(issue, "intentional", { reason });
  });
  explanationLabel.appendChild(explanation);
  controls.append(choiceList, explanationLabel, intentional);
  item.appendChild(controls);
}

function renderRepeatedTextResolution(item, issue) {
  const controls = document.createElement("div");
  const list = document.createElement("div");
  controls.className = "data-quality-resolution";
  list.className = "data-quality-affected-fields";
  (issue.matches || []).forEach((match) => {
    const row = document.createElement("div");
    const label = document.createElement("span");
    const review = document.createElement("button");
    const section = schema.sections.find((candidate) => candidate.id === match.sectionId);
    label.textContent = `${section?.title || "Intake"}: ${match.fieldLabel}`;
    review.type = "button";
    review.className = "secondary";
    review.textContent = "Review";
    review.addEventListener("click", () => focusDataQualityIssue(match));
    row.append(label, review);
    list.appendChild(row);
  });
  controls.appendChild(list);
  item.appendChild(controls);
}

function dataQualityReturnBar() {
  let bar = document.getElementById("dataQualityReturnBar");
  if (bar) return bar;
  bar = document.createElement("div");
  const button = document.createElement("button");
  bar.id = "dataQualityReturnBar";
  bar.className = "data-quality-return-bar";
  bar.hidden = true;
  button.type = "button";
  button.textContent = "← Back to Required Changes";
  button.addEventListener("click", () => {
    const state = activeDataQualityReview;
    const remaining = dataQualityIssues();
    if (remaining.length && state) {
      showDataQualityReview(remaining, state.mode, state.asset);
    } else {
      hideDataQualityReview();
    }
  });
  bar.appendChild(button);
  document.getElementById("intakeForm")?.insertBefore(bar, document.getElementById("sections"));
  return bar;
}

function hideDataQualityReview(preserveReturn = false) {
  const review = document.getElementById("dataQualityReview");
  if (review) {
    review.hidden = true;
    review.innerHTML = "";
  }
  if (!preserveReturn) {
    activeDataQualityReview = null;
    const bar = document.getElementById("dataQualityReturnBar");
    if (bar) bar.hidden = true;
  }
}

function isIntakeSignatureKey(key) {
  const cleanKey = String(key || "").replace(/__other$/, "");
  if (findField(cleanKey)) {
    return true;
  }

  const repeatableMatch = cleanKey.match(/^(.+)__item-\d+$/);
  if (repeatableMatch && findField(repeatableMatch[1])) {
    return true;
  }

  const parts = cleanKey.split("__");
  return parts.length >= 3 && Boolean(findTableColumn(parts[0], parts[2]));
}

function intakePlanSignature(data = getFormData()) {
  const material = Object.entries(data || {})
    .filter(([key]) => isIntakeSignatureKey(key))
    .map(([key, value]) => [key, String(value || "").trim()])
    .filter(([, value]) => value)
    .sort(([first], [second]) => first.localeCompare(second));
  const text = JSON.stringify(material);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function updatePlanStaleWarning(data = getFormData()) {
  const warning = document.getElementById("planStaleWarning");
  if (!warning) {
    return false;
  }
  const generatedSignature = String(data.lastPlanInputSignature || formStateData.lastPlanInputSignature || "").trim();
  const isStale = Boolean(generatedSignature && intakePlanSignature(data) !== generatedSignature);
  warning.hidden = !isStale;
  return isStale;
}

function markPlanGenerated() {
  const data = getFormData();
  formStateData = {
    ...formStateData,
    lastPlanGeneratedAt: new Date().toISOString(),
    lastPlanInputSignature: intakePlanSignature(data)
  };
  updatePlanStaleWarning({ ...data, ...formStateData });
}

function focusDataQualityIssue(issue) {
  hideDataQualityReview(true);
  dataQualityReturnBar().hidden = false;
  if (issue.sectionId) {
    switchActiveSection(issue.sectionId);
  }

  window.setTimeout(() => {
    updateConditionalFields();
    const input = document.querySelector(`[name="${CSS.escape(issue.key)}"]`);
    if (!input) {
      document.getElementById(issue.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    document.querySelectorAll(".data-quality-field-focus").forEach((item) => item.classList.remove("data-quality-field-focus"));
    const target = input.closest(".field, .table-field, .repeatable-card") || input;
    target.classList.add("data-quality-field-focus");
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    input.focus();
  }, 80);
}

function showDataQualityReview(issues, mode, asset) {
  const review = document.getElementById("dataQualityReview");
  if (!review) {
    return;
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  activeDataQualityReview = { mode, asset };
  dataQualityReturnBar().hidden = true;
  review.innerHTML = "";
  review.hidden = false;

  const heading = document.createElement("h2");
  heading.textContent = "Review Data Quality Before Generating";
  const intro = document.createElement("p");
  intro.textContent = errors.length
    ? "Fix the items marked Required so system labels or incomplete answers do not appear in the plan."
    : "Review the missing plan foundations or confirmed data differences below. You can return to the intake or generate with clearly labeled gaps.";
  const summary = document.createElement("div");
  summary.className = "data-quality-summary";
  if (errors.length) {
    summary.innerHTML += `<span class="data-quality-chip is-error">${errors.length} required</span>`;
  }
  if (warnings.length) {
    summary.innerHTML += `<span class="data-quality-chip is-warning">${warnings.length} to confirm</span>`;
  }

  const list = document.createElement("div");
  list.className = "data-quality-list";
  issues.forEach((issue) => {
    const item = document.createElement("div");
    item.className = `data-quality-item is-${issue.severity}`;
    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${issue.severity === "error" ? "Required" : "Confirm"}: ${issue.title}`;
    const detail = document.createElement("span");
    detail.textContent = issue.detail;
    content.append(title, detail);
    item.appendChild(content);
    if (issue.kind === "source-conflict") {
      renderSourceConflictResolution(item, issue);
    } else if (issue.title === "Confirm a possible duplicate") {
      renderDuplicateResolution(item, issue);
    } else if (issue.kind === "repeated-summary-text") {
      renderRepeatedTextResolution(item, issue);
    } else {
      const fix = document.createElement("button");
      fix.type = "button";
      fix.className = "secondary";
      fix.textContent = "Review Answer";
      fix.addEventListener("click", () => focusDataQualityIssue(issue));
      item.appendChild(fix);
    }
    list.appendChild(item);
  });

  const actions = document.createElement("div");
  actions.className = "data-quality-actions";
  const returnButton = document.createElement("button");
  returnButton.type = "button";
  returnButton.className = "secondary";
  returnButton.textContent = "Return to Intake";
  returnButton.addEventListener("click", hideDataQualityReview);
  actions.appendChild(returnButton);

  if (!errors.length) {
    const continueButton = document.createElement("button");
    continueButton.type = "button";
    continueButton.textContent = "Generate Anyway";
    continueButton.addEventListener("click", () => submitIntake(mode, asset, true));
    actions.appendChild(continueButton);
  }

  review.append(heading, intro, summary, list, actions);
  review.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function submitIntake(mode = "detailed", asset = "", skipQualityReview = false) {
  currentReportMode = isPreRevenueMode() || mode === "preRevenue" ? "preRevenue" : mode === "quick" ? "quick" : "detailed";

  if (!validateReportFoundation(currentReportMode)) {
    return;
  }

  if (currentReportMode !== "preRevenue") {
    if (!validateReadinessScores()) {
      return;
    }

    if (!validateNumericRevenueTargets()) {
      return;
    }

    showIcpGuidanceIfEmpty(currentReportMode);
  } else if (!validatePreRevenueFirstWinSegments()) {
    return;
  }

  const qualityIssues = dataQualityIssues();
  if (!skipQualityReview && qualityIssues.length) {
    showDataQualityReview(qualityIssues, mode, asset);
    return;
  }
  hideDataQualityReview();
  markPlanGenerated();

  const saved = await saveDraft(false);
  if (!saved) {
    document.getElementById("saveStatus").textContent = "The action plan could not be generated because the latest answers were not saved.";
    return;
  }
  window.location.href = resultsUrl(undefined, asset);
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
  const submitButton = document.getElementById("submitButton");
  const resultsLink = document.getElementById("viewResultsLink");

  if (actionBar) {
    actionBar.hidden = !detailedSectionsVisible;
  }
  if (submitButton) {
    submitButton.textContent = isPreRevenueMode() ? "View GTM Plan" : "Generate GTM Action Plan";
  }
  if (resultsLink && isPreRevenueMode()) {
    resultsLink.href = resultsUrl(undefined, "gtm");
    resultsLink.textContent = "View GTM Plan";
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

function meaningfulGeneratedValue(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  if (/^(n\/a|na|none|null|unknown|not sure|not sure yet|not filled yet|create a new customer group for this offer)$/i.test(text)) {
    return "";
  }

  return text;
}

function firstMeaningfulGeneratedValue(values, fallback = "") {
  return values.map(meaningfulGeneratedValue).find(Boolean) || fallback;
}

function firstValueClaimOutcome(data, rowId = null) {
  const row = firstOfferValueClaim(data, rowId);
  if (!row) {
    return "";
  }

  const outcome = firstMeaningfulGeneratedValue([row.values.outcome, row.values.buyerLanguage, row.values.improvement]);
  const metric = meaningfulGeneratedValue(row.values.metric);
  return [outcome, metric ? `measured by ${metric}` : ""].filter(Boolean).join(" ");
}

function shouldReplaceGeneratedOfferPromise(value) {
  const text = String(value || "").trim();
  return !text
    || /^For (NA|N\/A|not sure|not sure yet|the priority buyer),/i.test(text)
    || /address the urgent problem/i.test(text)
    || /address the priority problem/i.test(text)
    || /achieve (a|the) measurable outcome/i.test(text);
}

function offerPromiseSummary(data, rowId = null) {
  const offerRow = rowId ? offerPortfolioRows(data).find((row) => row.rowId === rowId) : primaryOfferRow(data);
  const scopedPromise = rowId ? data[scopedOfferField(rowId, "oneSentencePromise")] : "";

  if (meaningfulGeneratedValue(scopedPromise) && !shouldReplaceGeneratedOfferPromise(scopedPromise)) {
    return scopedPromise;
  }

  if (meaningfulGeneratedValue(data.oneSentencePromise) && !shouldReplaceGeneratedOfferPromise(data.oneSentencePromise)) {
    return data.oneSentencePromise;
  }

  const activeRowId = rowId || offerRow?.rowId || null;
  const target = firstMeaningfulGeneratedValue([
    offerCustomerGroupDisplay(offerRow, ""),
    data.priorityIcpForOffer,
    data.offerTargetSegment,
    data.bestFitCustomerGroup,
    data.bestFitSegment
  ], "the priority customer group");
  const buyer = firstMeaningfulGeneratedValue([
    offerRow?.values.primaryBuyer,
    data.primaryBuyerForOffer,
    data.primaryBuyer,
    data.bestFitDecisionMaker,
    data.budgetOwner
  ], "the buyer");
  const problem = firstMeaningfulGeneratedValue([
    offerScopedValue(data, activeRowId, "offerBuyerProblem"),
    data.offerBuyerProblem,
    data.urgentBuyerProblem,
    data.bestFitPrimaryPain,
    data.quickBuyerProblem,
    offerScopedValue(data, activeRowId, "offerCostOfInaction"),
    data.offerCostOfInaction,
    data.costOfInaction,
    offerScopedValue(data, activeRowId, "offerCurrentWorkaround"),
    data.offerCurrentWorkaround,
    data.currentWorkaround
  ], "the priority problem");
  const outcome = firstMeaningfulGeneratedValue([
    firstValueClaimOutcome(data, activeRowId),
    offerScopedValue(data, activeRowId, "offerOutcomes"),
    data.quickPrimaryOutcome,
    data.primaryOutcome,
    data.provenCustomerOutcomes
  ], "the measurable outcome");

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
  const numeric = Number(text);
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 5) {
    return numeric;
  }
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
  const proofTableScore = proofRows.some((row) => /repeatable|strong|measured|high/i.test(row.values.strength || "") || row.values.assetExists === "Yes")
    ? 5
    : proofRows.some((row) => /customer|anecdotal|partially|medium/i.test(`${row.values.strength || ""} ${row.values.assetExists || ""}`))
      ? 3
      : proofRows.length
        ? 2
        : 0;
  const valueClaimProofScore = firstValueClaim?.values.evidenceAvailable && firstValueClaim?.values.evidenceNotes
    ? 4
    : firstValueClaim?.values.evidenceAvailable || firstValueClaim?.values.proofStrength
      ? 3
      : 0;
  const proofScore = Math.max(proofTableScore, valueClaimProofScore);

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
    priorityIcp: offerCustomerGroupDisplay(primary, "") || data.priorityIcpForOffer || data.offerTargetSegment,
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
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Local browser permissions can block this API; fall through to the page-based copy method.
    }
  }

  const textarea = document.createElement("textarea");
  try {
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
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
    if (data.toolMode === "Pre-Revenue Validation") {
      data.reviewMode = "preRevenue";
    }
    // Restore saved state before rendering navigation so the correct workflow
    // (pre-revenue, detailed, or quick) determines which sections exist.
    formStateData = data;
    currentReportMode = data.reviewMode === "preRevenue" || data.toolMode === "Pre-Revenue Validation" ? "preRevenue" : data.reviewMode === "detailed" ? "detailed" : currentReportMode;
    detailedSectionsVisible = currentReportMode === "detailed";
    if (currentReportMode === "preRevenue") {
      activeSectionId = activeSectionId === "company" || activeSectionId === "executiveQuickReview" ? "preRevenueContext" : activeSectionId;
      renderSections();
    } else if (detailedSectionsVisible && activeSectionId === "company") {
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
  preferIntakeStartOnInitialLoad = shouldStartAtIntakeBeginning();
  const reportNotice = new URLSearchParams(window.location.search).get("reportNotice");
  const incomingRecordId = requestedRecordIdFromUrl();
  if (incomingRecordId) {
    setActiveRecordId(incomingRecordId);
  }
  const incomingImprovementFocus = currentImprovementFocus();
  if (incomingImprovementFocus?.sectionId) {
    const targetSection = schema.sections.find((section) =>
      section.id === incomingImprovementFocus.sectionId && !section.hidden && !section.deprecated
    );
    if (targetSection) {
      currentReportMode = "detailed";
      detailedSectionsVisible = true;
      activeSectionId = targetSection.id;
    }
  }
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
  updateBuyerBeliefStatements();
  updateBuyerDiscoveryQuestions();
  updateOfferGeneratedPromiseFields();
  updateBuyingCommitteeMessageAngles();
  updateDetailedActionBar();
  updatePlanStaleWarning();
  preferIntakeStartOnInitialLoad = false;

  if (reportNotice === "empty") {
    const message = "I would love to provide a report! Unfortunately, it looks like the intake has not been filled out yet.";
    const status = document.getElementById("saveStatus");
    if (status) status.textContent = message;
    window.alert(message);
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("reportNotice");
    window.history.replaceState({}, "", `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
  }

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
  const startCompanyResearch = () => {
    if (window.GTM_INTAKE_AI?.openResearch) {
      window.GTM_INTAKE_AI.openResearch();
      return;
    }
    prepareResearchPrompt();
  };
  document.getElementById("researchButton").addEventListener("click", startCompanyResearch);
  const topResearchButton = document.getElementById("topResearchButton");
  if (topResearchButton) {
    topResearchButton.addEventListener("click", startCompanyResearch);
  }
  document.getElementById("regenerateStalePlanButton").addEventListener("click", () => {
    submitIntake(isPreRevenueMode() ? "preRevenue" : "detailed", isPreRevenueMode() ? "gtm" : "");
  });
  ["viewResultsLink", "topResultsLink"].forEach((id) => {
    const link = document.getElementById(id);
    if (!link) return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      submitIntake(isPreRevenueMode() ? "preRevenue" : "detailed", isPreRevenueMode() ? "gtm" : "");
    });
  });
  document.getElementById("intakeForm").addEventListener("input", (event) => {
    if (quickAddContainerFor(event.target)) {
      return;
    }
    if (event.target?.closest?.("[data-multi-select-dropdown]")) {
      updatePlanStaleWarning();
      scheduleAutosave();
      return;
    }
    formStateData = {
      ...formStateData,
      ...currentVisibleFormData()
    };
    updatePlanStaleWarning();
    scheduleAutosave();
  });
  document.getElementById("intakeForm").addEventListener("change", (event) => {
    if (quickAddContainerFor(event.target)) {
      return;
    }
    formStateData = {
      ...formStateData,
      ...currentVisibleFormData()
    };
    updatePlanStaleWarning();

    if (changedFieldName(event) === "toolMode") {
      currentReportMode = isPreRevenueMode() ? "preRevenue" : currentReportMode === "preRevenue" ? "quick" : currentReportMode;
      detailedSectionsVisible = !isPreRevenueMode() && detailedSectionsVisible;
      activeSectionId = isPreRevenueMode() ? "preRevenueContext" : "company";
      renderSections();
      setFormData(formStateData);
      updateConditionalFields();
      refreshIntakeUi({ skipDynamicOptions: true });
      updatePlanStaleWarning();
      scheduleAutosave();
      return;
    }
    if (changedFieldName(event) === "preDiscoveryBuyingPath") {
      const pathSelect = document.querySelector("[name='preDiscoveryBuyingPath']");
      if (pathSelect) {
        pathSelect.dataset.pathWasInferred = "false";
      }
    }
    maybePrefillBestFitProfile();
    if (shouldRunCarryForwardForChange(event)) {
      carryForwardToBlankFields();
    }
    if (shouldRefreshAssessmentPanels(event)) {
      renderOfferAssessmentPanels();
      renderSignalPlayAssessmentPanels();
      renderRevenueMotionAssessmentPanels();
    }
    updateConditionalFields();
    scheduleIntakeUiRefresh({ skipDynamicOptions: true });
    scheduleAutosave();
  });
  document.getElementById("intakeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    submitIntake(isPreRevenueMode() ? "preRevenue" : "detailed", isPreRevenueMode() ? "gtm" : "");
  });
}

initializeIntake()
  .catch((error) => {
    console.error("The intake could not finish loading.", error);
  })
  .finally(() => {
    document.body.classList.remove("intake-initializing");
  });
