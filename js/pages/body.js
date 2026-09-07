import { getPart, loadConfig } from "../data.js";
import { getQuery, go, initializePage, replaceQuery, showError } from "../nav.js";
import { choiceMarkup, hotspotMarkup } from "../ui.js";

initializePage();

const content = document.querySelector(".wizard-content");
const nextButton = document.querySelector('[data-action="next"]');
let bodyParts = [];
let selectedPartId = "";

function selectPart(partId) {
  if (!getPart(bodyParts, partId)) return;
  selectedPartId = partId;
  replaceQuery({ part: partId, organ: null, symptoms: null });

  document.querySelectorAll('input[name="body-part"]').forEach((radio) => {
    radio.checked = radio.value === partId;
  });
  document.querySelectorAll(".hotspot").forEach((hotspot) => {
    hotspot.innerHTML =
      hotspot.dataset.partId === partId ? '<span class="indicator"></span>' : "";
  });
  nextButton.disabled = false;
}

loadConfig()
  .then((parts) => {
    bodyParts = parts;
    const queryPart = getQuery().part;
    selectedPartId = getPart(parts, queryPart) ? queryPart : "";
    if (queryPart && !selectedPartId) replaceQuery({ part: null, organ: null, symptoms: null });

    const hotspots = parts
      .flatMap((part) =>
        part.hotspots.map((hotspot) => hotspotMarkup(part, hotspot, part.id === selectedPartId)),
      )
      .join("");
    const choices = parts
      .map((part) =>
        choiceMarkup({
          type: "radio",
          name: "body-part",
          id: part.id,
          label: part.label,
          checked: part.id === selectedPartId,
        }),
      )
      .join("");

    content.innerHTML = `
      <div class="split">
        <div class="body-figure">
          <img src="/assets/human_body.png" alt="人體圖">
          ${hotspots}
        </div>
        <fieldset class="choice-list">
          <legend class="sr-only">身體部位</legend>
          ${choices}
        </fieldset>
      </div>
    `;
    nextButton.disabled = !selectedPartId;
  })
  .catch(showError);

content.addEventListener("click", (event) => {
  const hotspot = event.target.closest(".hotspot");
  if (hotspot) selectPart(hotspot.dataset.partId);
});

content.addEventListener("change", (event) => {
  if (event.target.matches('input[name="body-part"]')) selectPart(event.target.value);
});

nextButton.addEventListener("click", () => {
  if (selectedPartId) go("/organ", { part: selectedPartId });
});
