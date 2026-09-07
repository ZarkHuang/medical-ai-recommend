import { getOrgan, getPart, loadConfig, parseSymptomIds } from "../data.js";
import { getQuery, go, initializePage, replaceQuery, showError } from "../nav.js";
import { choiceMarkup } from "../ui.js";

initializePage();

const content = document.querySelector(".wizard-content");
const prevButton = document.querySelector('[data-action="prev"]');
const recommendButton = document.querySelector('[data-action="recommend"]');
const overlay = document.querySelector(".analysis-overlay");
const selectedCount = document.querySelector("[data-selected-count]");
// const modal = document.querySelector("dialog.modal-overlay");
// const modalCloseButton = document.querySelector('[data-action="close"]');
// modalCloseButton.addEventListener("click", () => {
//   modal.close();
// });
let part;
let organ;
let selectedIds = [];
let analysisStarted = false;

function syncSelectedCount() {
  if (selectedCount) selectedCount.textContent = String(selectedIds.length);
}

function syncSelectionToUrl() {
  replaceQuery({ symptoms: selectedIds.length ? selectedIds.join(",") : null });
  recommendButton.disabled = selectedIds.length === 0 || analysisStarted;
  syncSelectedCount();
}

loadConfig()
  .then((bodyParts) => {
    const query = getQuery();
    part = getPart(bodyParts, query.part);
    if (!part) {
      go("/body", {}, { replace: true });
      return;
    }

    organ = getOrgan(bodyParts, part.id, query.organ);
    if (!organ) {
      go("/organ", { part: part.id }, { replace: true });
      return;
    }

    const validIds = new Set(organ.symptoms.map((symptom) => symptom.id));
    selectedIds = parseSymptomIds(query.symptoms).filter((id) => validIds.has(id));
    if (query.symptoms && selectedIds.join(",") !== query.symptoms) syncSelectionToUrl();

    content.innerHTML = `
      <fieldset class="choice-list">
        <legend class="sr-only">症狀</legend>
        ${organ.symptoms
          .map((symptom) =>
            choiceMarkup({
              type: "checkbox",
              name: "symptom",
              id: symptom.id,
              label: symptom.label,
              checked: selectedIds.includes(symptom.id),
            }),
          )
          .join("")}
      </fieldset>
    `;
    recommendButton.disabled = selectedIds.length === 0;
    syncSelectedCount();
  })
  .catch(showError);

content.addEventListener("change", (event) => {
  if (!event.target.matches('input[name="symptom"]')) return;
  if (event.target.checked) {
    selectedIds = [...selectedIds, event.target.value];
  } else {
    selectedIds = selectedIds.filter((id) => id !== event.target.value);
  }
  syncSelectionToUrl();
});

prevButton.addEventListener("click", () => {
  const query = getQuery();
  go("/organ", { part: part?.id ?? query.part, organ: organ?.id ?? query.organ });
});

recommendButton.addEventListener("click", () => {
  if (analysisStarted || !part || !organ || selectedIds.length === 0) return;
  if (selectedIds.length > 10) {
    go("/too-much-symptoms");
    // const modalList = modal.querySelector(".modal-list");
    // modalList.innerHTML = "";
    // selectedIds.forEach((id) => {
    //   const symptom = organ.symptoms.find((symptom) => symptom.id === id);
    //   modalList.innerHTML += `<li class="modal-item">${symptom.label}</li>`;
    // });
    // modal.showModal();
    return;
  }
  analysisStarted = true;
  recommendButton.disabled = true;

  const selectedLabels = organ.symptoms
    .filter((symptom) => selectedIds.includes(symptom.id))
    .map((symptom) => symptom.label);
  overlay.querySelector("[data-analysis-part]").textContent = `${part.label} > ${organ.label}`;
  overlay.querySelector("[data-analysis-symptoms]").textContent = selectedLabels.join("、");
  overlay.hidden = false;
  document.body.setAttribute("aria-busy", "true");

  const wait = 800 + Math.random() * 500;
  window.setTimeout(() => {
    go("/doctors", {
      part: part.id,
      organ: organ.id,
      symptoms: selectedIds.join(","),
    });
  }, wait);
});
