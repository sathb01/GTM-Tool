(function initializeUiFeedback() {
  const statusSelector = [
    "#saveStatus",
    "#researchStatus",
    ".validation-autosave-status",
    ".messaging-save-status",
    "[id$='SaveStatus']",
    "[id$='StatusMessage']"
  ].join(",");

  function inferState(message) {
    const text = String(message || "").trim().toLowerCase();
    if (!text) return "blank";
    if (/\b(saving|loading|building|generating|checking|refreshing|updating)\b/.test(text)) return "loading";
    if (/\b(could not|cannot|failed|failure|error|not saved|unavailable)\b/.test(text)) return "error";
    if (/\b(required|missing|needs attention|warning|blocked|too broad|not ready)\b/.test(text)) return "warning";
    if (/\b(saved|updated|ready|complete|copied|created)\b/.test(text)) return "success";
    return "info";
  }

  function enhanceStatus(element) {
    if (!(element instanceof Element) || !element.matches(statusSelector)) return;
    element.classList.add("ui-feedback-status");
    element.setAttribute("role", "status");
    element.setAttribute("aria-live", "polite");
    element.setAttribute("aria-atomic", "true");
    element.dataset.uiState = inferState(element.textContent);
  }

  function enhanceAll(root = document) {
    if (root instanceof Element && root.matches(statusSelector)) enhanceStatus(root);
    root.querySelectorAll?.(statusSelector).forEach(enhanceStatus);
  }

  function setStatus(target, message, state = "") {
    const element = typeof target === "string" ? document.querySelector(target) : target;
    if (!element) return false;
    element.textContent = String(message || "");
    enhanceStatus(element);
    element.dataset.uiState = state || inferState(message);
    return true;
  }

  const start = () => {
    enhanceAll();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
        const status = target?.matches?.(statusSelector) ? target : target?.closest?.(statusSelector);
        if (status) enhanceStatus(status);
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) enhanceAll(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };

  window.GTM_UI_FEEDBACK = { enhanceAll, inferState, setStatus };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
