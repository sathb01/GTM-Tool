const schema = window.GTM_INTAKE_SCHEMA;
const STORAGE_KEY = schema.storageKey;
const RECORDS_KEY = `${STORAGE_KEY}:records`;
const ACTIVE_RECORD_KEY = `${STORAGE_KEY}:activeRecordId`;
const API_BASE = window.GTM_API_BASE || (window.location.protocol.startsWith("http") ? window.location.origin : "");

const carryForwardRules = [
  {
    from: "averageDealSize",
    to: "opportunitySnapshot__average-deal-size-contract-value-order-value__answer"
  },
  {
    from: "gtmSystems__crm__tools",
    to: "opportunitySnapshot__crm-or-tracking-system-used-today__answer"
  },
  {
    from: "bestCustomerProfile__size-scale-range__answer",
    to: "sizeFit__best-fit-profile__otherScale"
  },
  {
    from: "bestCustomerProfile__segment-company-type__answer",
    toRepeatable: "verticalFit"
  },
  {
    from: "bestCustomerProfile__primary-pain__answer",
    to: "painUrgency"
  },
  {
    fromTableColumn: {
      table: "customerPaidBenefits",
      column: "benefit"
    },
    to: "painUrgency"
  },
  {
    from: "bestCustomerProfile__trigger-event-or-timing-signal__answer",
    toRepeatable: "positiveTriggerRules"
  },
  {
    from: "bestCustomerProfile__economic-buyer__answer",
    to: "buyingCommittee__economic-buyer__titles"
  },
  {
    from: "bestCustomerProfile__champion-day-to-day-owner__answer",
    to: "buyingCommittee__champion__titles"
  },
  {
    from: "bestCustomerProfile__first-use-case-or-sales-wedge__answer",
    to: "useCaseWedge"
  },
  {
    from: "bestCustomerProfile__first-use-case-or-sales-wedge__answer",
    to: "primaryWedge"
  },
  {
    from: "bestCustomerProfile__disqualification-signals__answer",
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
  option.value = value;
  option.textContent = label;
  return option;
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
      field.options.forEach((option) => {
        select.appendChild(createOption(option));
      });
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

function createOtherField(select, labelText = "Other name") {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  const input = document.createElement("input");

  wrapper.className = "other-field";
  wrapper.hidden = select.value !== "Other";
  label.htmlFor = `${select.name}__other`;
  label.textContent = labelText;
  input.id = `${select.name}__other`;
  input.name = `${select.name}__other`;
  input.type = "text";
  input.placeholder = "Enter other";
  wrapper.appendChild(label);
  wrapper.appendChild(input);

  select.addEventListener("change", () => {
    wrapper.hidden = select.value !== "Other";
    if (wrapper.hidden) {
      input.value = "";
    }
  });

  return wrapper;
}

function supportsOtherField(field) {
  return field.type === "select" && Array.isArray(field.options) && field.options.includes("Other");
}

function selectedMultiselectValues(fieldId) {
  return Array.from(document.querySelectorAll(`input[name="${CSS.escape(fieldId)}"]:checked`))
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
      wrapper.appendChild(createOtherField(input));
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
    return table.rows.map((label) => ({ id: slug(label), label }));
  }

  return Array.from({ length: table.minRows || 3 }, (_, index) => ({
    id: `${table.rowLabel.toLowerCase()}-${index + 1}`,
    label: `${table.rowLabel} ${index + 1}`
  }));
}

function createTable(table) {
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

function renderSections() {
  const sections = document.getElementById("sections");
  const nav = document.getElementById("sectionNav");

  schema.sections.forEach((section) => {
    const anchor = document.createElement("a");
    const sectionEl = document.createElement("section");
    const heading = document.createElement("div");
    const h2 = document.createElement("h2");

    anchor.href = `#${section.id}`;
    anchor.textContent = section.title;
    nav.appendChild(anchor);

    sectionEl.id = section.id;
    heading.className = "section-heading";
    h2.textContent = section.title;
    heading.appendChild(h2);

    if (section.description) {
      const description = document.createElement("p");
      description.textContent = section.description;
      heading.appendChild(description);
    }

    sectionEl.appendChild(heading);

    if (section.fields && section.fields.length) {
      const grid = document.createElement("div");
      grid.className = "grid";
      section.fields.forEach((field) => grid.appendChild(createField(field)));
      sectionEl.appendChild(grid);
    }

    if (section.tables && section.tables.length) {
      section.tables.forEach((table) => sectionEl.appendChild(createTable(table)));
    }

    sections.appendChild(sectionEl);
  });
}

function getFormData() {
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

  applyCarryForward(data);
  applyProofGapAutofill(data);
  data.savedAt = new Date().toISOString();
  return data;
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
  return Object.entries(data)
    .filter(([key, value]) => key.startsWith(`${listId}__item-`) && String(value).trim())
    .sort(([first], [second]) => {
      const firstIndex = Number.parseInt(first.split("__item-")[1], 10);
      const secondIndex = Number.parseInt(second.split("__item-")[1], 10);
      return firstIndex - secondIndex;
    })
    .map(([, value]) => String(value).trim());
}

function tableColumnValues(data, tableId, columnId) {
  return Object.entries(data)
    .filter(([key, value]) => key.startsWith(`${tableId}__`) && key.endsWith(`__${columnId}`) && String(value).trim())
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([, value]) => String(value).trim());
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
}

function updateConditionalFields() {
  updateDynamicOptionFields();

  document.querySelectorAll("select").forEach((select) => {
    const other = document.querySelector(`.other-field input[name="${CSS.escape(`${select.name}__other`)}"]`);

    if (!other) {
      return;
    }

    other.parentElement.hidden = select.value !== "Other";
  });

  document.querySelectorAll("[data-money='true']").forEach((input) => {
    input.value = formatMoneyInput(input.value);
  });
}

function findField(id) {
  for (const section of schema.sections) {
    const field = (section.fields || []).find((item) => item.id === id);
    if (field) {
      return field;
    }
  }

  return null;
}

function normalizeRepeatableData(data) {
  const normalized = { ...data };

  schema.sections.forEach((section) => {
    (section.fields || []).forEach((field) => {
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
  saveRecordToBackend(savedRecord);

  if (showStatus) {
    document.getElementById("saveStatus").textContent = "Company saved.";
  }
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

async function prepareAiPrefill() {
  const status = document.getElementById("researchStatus");
  const companyName = document.querySelector("[name='companyName']").value.trim();
  const website = document.querySelector("[name='website']").value.trim();
  const notes = document.querySelector("[name='researchNotes']");

  if (!companyName && !website) {
    status.textContent = "Add a company name or website first.";
    return;
  }

  status.textContent = "Starting AI research...";

  try {
    const researchEndpoint = window.GTM_RESEARCH_ENDPOINT || (API_BASE ? `${API_BASE}/api/research` : "");

    if (!researchEndpoint) {
      throw new Error("No research endpoint configured.");
    }

    const response = await fetch(researchEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, website })
    });

    if (!response.ok) {
      throw new Error("Research endpoint returned an error.");
    }

    const result = await response.json();
    setFormData(normalizeRepeatableData(result.fields || {}));
    notes.value = result.researchNotes || notes.value;
    status.textContent = "AI research completed. Review the prefilled fields before generating results.";
    saveDraft(false);
  } catch (error) {
    const prompt = [
      `Research ${companyName || website} for a GTM readiness intake.`,
      "Use public sources such as the company website, product pages, pricing pages, resource pages, LinkedIn, review sites, directories, news, and visible social profiles.",
      "Prefill as much of the intake as possible: company profile, geography, public presence, business model, stage, ICP, buyer roles, offer, pricing signals, proof assets, channels, sales motion, competitors, trigger events, and likely GTM risks.",
      "Return JSON field suggestions matching the online intake schema, plus research notes and source URLs for anything inferred."
    ].join("\n");

    notes.value = notes.value ? `${notes.value}\n\nAI research prompt:\n${prompt}` : `AI research prompt:\n${prompt}`;
    status.textContent = "AI endpoint not connected yet. I added the research prompt to the notes.";
    saveDraft(false);
  }
}

function loadDraft() {
  const record = currentRecord();
  const saved = record ? JSON.stringify(record.data) : localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return;
  }

  try {
    setFormData(normalizeRepeatableData(JSON.parse(saved)));
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

async function initializeIntake() {
  migrateLegacyDraft();
  renderSections();
  await loadBackendRecords();
  renderBrandPicker();
  loadDraft();
  updateScoreTotals();

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
  document.getElementById("researchButton").addEventListener("click", prepareAiPrefill);
  document.getElementById("intakeForm").addEventListener("input", updateScoreTotals);
  document.getElementById("intakeForm").addEventListener("change", () => {
    carryForwardToBlankFields();
    updateConditionalFields();
    updateScoreTotals();
  });
  document.getElementById("intakeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveDraft(false);
    window.location.href = "results.html";
  });
}

initializeIntake();
