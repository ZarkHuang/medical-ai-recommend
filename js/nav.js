const STEPS = {
  "/start": 0,
  "/body": 1,
  "/organ": 2,
  "/symptom": 3,
  "/doctors": 4,
  "/too-much-symptoms": 5,
};

export function currentPath() {
  const path = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "");
  for (const stepKey of Object.keys(STEPS)) {
    if (path.endsWith(stepKey) || path === stepKey) {
      return stepKey;
    }
  }
  return path || "/start";
}

export function getQuery() {
  const urlQuery = Object.fromEntries(new URLSearchParams(window.location.search));
  try {
    const saved = JSON.parse(sessionStorage.getItem("care-nav-query") || "{}");
    return { ...saved, ...urlQuery };
  } catch {
    return urlQuery;
  }
}

export function replaceQuery(patch) {
  const url = new URL(window.location.href);
  Object.entries(patch).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  try {
    const current = JSON.parse(sessionStorage.getItem("care-nav-query") || "{}");
    Object.entries(patch).forEach(([key, value]) => {
      if (value) current[key] = value;
      else delete current[key];
    });
    sessionStorage.setItem("care-nav-query", JSON.stringify(current));
  } catch {}
}

function queryString(query) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const value = params.toString();
  return value ? `?${value}` : "";
}

export function go(path, query = {}, { replace = false } = {}) {
  const cur = currentPath();
  sessionStorage.setItem("care-nav-from-step", String(STEPS[cur] ?? 0));

  const normalizedPath = path.endsWith("/") ? path : `${path}/`;

  try {
    const currentSaved = JSON.parse(sessionStorage.getItem("care-nav-query") || "{}");
    const updated = { ...currentSaved, ...query };
    Object.keys(updated).forEach((k) => {
      if (updated[k] === null || updated[k] === undefined || updated[k] === "") {
        delete updated[k];
      }
    });
    sessionStorage.setItem("care-nav-query", JSON.stringify(updated));
  } catch {}

  const destination = `${normalizedPath}${queryString(query)}`;
  if (replace) window.location.replace(destination);
  else window.location.assign(destination);
}

export function initializePage() {
  const page = document.querySelector(".wizard-page");
  if (!page) return;

  const currentStep = STEPS[currentPath()] ?? 0;
  const storedStep = sessionStorage.getItem("care-nav-from-step");
  sessionStorage.removeItem("care-nav-from-step");

  let fromStep = storedStep === null ? null : Number(storedStep);
  if (fromStep === null && document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      if (referrer.origin === window.location.origin) {
        let referrerPath = referrer.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "") || "/";
        for (const stepKey of Object.keys(STEPS)) {
          if (referrerPath.endsWith(stepKey) || referrerPath === stepKey) {
            referrerPath = stepKey;
            break;
          }
        }
        fromStep = STEPS[referrerPath] ?? null;
      }
    } catch {}
  }

  if (fromStep !== null && fromStep !== currentStep) {
    page.classList.add(currentStep >= fromStep ? "slide-left" : "slide-right");
  }
}

export function showError(error) {
  const content = document.querySelector(".wizard-content");
  if (!content) return;
  const message = error instanceof Error ? error.message : "資料載入失敗";
  content.innerHTML = `<p class="status status--error">資料載入失敗：${escapeText(message)}</p>`;
}

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
