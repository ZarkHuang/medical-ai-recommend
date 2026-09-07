import { getOrgan, getPart, loadConfig } from "../data.js";
import { getQuery, go, initializePage, replaceQuery, showError } from "../nav.js";
import { choiceMarkup, escapeHtml } from "../ui.js";

initializePage();

const content = document.querySelector(".wizard-content");
const nextButton = document.querySelector('[data-action="next"]');
const prevButton = document.querySelector('[data-action="prev"]');
let part;
let selectedOrganId = "";

loadConfig()
  .then((bodyParts) => {
    const query = getQuery();
    part = getPart(bodyParts, query.part);
    if (!part) {
      go("/body", {}, { replace: true });
      return;
    }

    selectedOrganId = getOrgan(bodyParts, part.id, query.organ)?.id ?? "";
    if (query.organ && !selectedOrganId) replaceQuery({ organ: null, symptoms: null });

    const choices = part.organs
      .map((organ) =>
        choiceMarkup({
          type: "radio",
          name: "organ",
          id: organ.id,
          label: organ.label,
          checked: organ.id === selectedOrganId,
        }),
      )
      .join("");

    content.innerHTML = `
      <div class="split">
        <div class="part-figure">
          <img src="${escapeHtml(part.image)}" alt="${escapeHtml(part.label)}">
        </div>
        <fieldset class="choice-list">
          <legend class="sr-only">細部部位</legend>
          ${choices}
        </fieldset>
      </div>
    `;
    nextButton.disabled = !selectedOrganId;
  })
  .catch(showError);

content.addEventListener("change", (event) => {
  if (!event.target.matches('input[name="organ"]')) return;
  selectedOrganId = event.target.value;
  replaceQuery({ organ: selectedOrganId, symptoms: null });
  nextButton.disabled = false;
});

prevButton.addEventListener("click", () => {
  const partId = part?.id ?? getQuery().part;
  go("/body", { part: partId });
});

nextButton.addEventListener("click", () => {
  if (part && selectedOrganId) {
    go("/symptom", { part: part.id, organ: selectedOrganId });
  }
});
