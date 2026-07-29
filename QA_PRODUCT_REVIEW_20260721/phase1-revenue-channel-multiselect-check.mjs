import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
});
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  await page.goto(`${baseUrl}/index.html?v=20260729-revenue-channel-multiselect`, {
    waitUntil: "load"
  });
  await page.waitForFunction(() => Boolean(window.GTM_INTAKE_SCHEMA && document.getElementById("intakeForm")), null, {
    timeout: 15000
  });

  const state = await page.evaluate(() => {
    const field = findTableColumn("revenueMotionPortfolio", "channelSource");
    const fieldName = "qaRevenueMotionPortfolio__motion-1__channelSource";
    const form = document.getElementById("intakeForm");
    const host = document.createElement("div");
    const control = createInput(field, fieldName);
    host.dataset.qaRevenueChannel = "true";
    host.appendChild(control);
    form.appendChild(host);

    const selectedText = () => Array.from(control.querySelectorAll(".multi-select-selected-text"))
      .map((item) => item.textContent.trim())
      .filter(Boolean);
    const checkedValues = () => Array.from(control.querySelectorAll('input[type="checkbox"]:checked'))
      .map((input) => input.value);

    control.value = "Network referrals";
    const legacySingle = {
      value: control.value,
      selected: selectedText(),
      checked: checkedValues()
    };

    control.value = "Network referrals; Direct outbound email";
    const multiple = {
      value: control.value,
      selected: selectedText(),
      checked: checkedValues(),
      formValues: new FormData(form).getAll(fieldName),
      serialized: currentVisibleFormData()[fieldName]
    };

    control.value = "Outbound plus referrals";
    const legacyCustom = {
      value: control.value,
      selected: selectedText()
    };

    control.value = "Other: Trade association list";
    const otherInput = control.querySelector(`input[name="${CSS.escape(`${fieldName}__other`)}"]`);
    const other = {
      value: control.value,
      selected: selectedText(),
      visible: Boolean(otherInput && !otherInput.closest(".other-field")?.hidden),
      required: Boolean(otherInput?.required)
    };

    host.remove();
    return {
      fieldType: field?.type,
      optionsIncludeBlank: field?.options?.includes(""),
      legacySingle,
      multiple,
      legacyCustom,
      other
    };
  });

  const checks = {
    schemaUsesMultiSelect: state.fieldType === "multiSelectDropdown",
    noBlankCheckboxOption: state.optionsIncludeBlank === false,
    legacySingleValueLoads: state.legacySingle.value === "Network referrals"
      && state.legacySingle.selected.includes("Network referrals")
      && state.legacySingle.checked.includes("Network referrals"),
    multipleValuesRemainVisible: state.multiple.selected.includes("Network referrals")
      && state.multiple.selected.includes("Direct outbound email"),
    multipleValuesSerialize: state.multiple.serialized.split("; ").sort().join("; ")
      === ["Network referrals", "Direct outbound email"].sort().join("; "),
    formCarriesBothSelections: state.multiple.formValues.includes("Network referrals")
      && state.multiple.formValues.includes("Direct outbound email"),
    legacyCustomValueRemainsVisible: state.legacyCustom.value === "Outbound plus referrals"
      && state.legacyCustom.selected.includes("Outbound plus referrals"),
    otherDetailRemainsVisible: state.other.value === "Other: Trade association list"
      && state.other.selected.includes("Other: Trade association list")
      && state.other.visible
      && state.other.required,
    noPageErrors: pageErrors.length === 0
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({
    checks: Object.keys(checks).length,
    passed: Object.keys(checks).length - failures.length,
    failed: failures.length,
    failures,
    state,
    pageErrors
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
