import { getOrgan, getPart, loadConfig, parseSymptomIds } from "../data.js";
import { getQuery, go, initializePage, showError } from "../nav.js";
import { doctorMarkup } from "../ui.js";

initializePage();

const content = document.querySelector(".wizard-content");
const title = document.querySelector("[data-title]");
const prevButton = document.querySelector('[data-action="prev"]');
const appointButton = document.querySelector('[data-action="appoint"]');
let part;
let organ;
let symptomIds = [];
let selectedDoctorId = "";

function selectedDoctor() {
  return organ?.doctors.find((doctor) => doctor.id === selectedDoctorId);
}

function appointmentUrl(doctor) {
  if (!doctor?.appointUrl) return null;
  try {
    const url = new URL(doctor.appointUrl, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
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

    symptomIds = parseSymptomIds(query.symptoms);
    if (symptomIds.length === 0) {
      go("/symptom", { part: part.id, organ: organ.id }, { replace: true });
      return;
    }

    selectedDoctorId = organ.doctors[0]?.id ?? "";
    title.textContent = `推薦醫師（${organ.category}）`;

    if (organ.doctors.length === 0) {
      content.innerHTML = '<p class="status">目前沒有可推薦的醫師。</p>';
      return;
    }

    content.innerHTML = `
      <fieldset class="doctors">
        <legend class="sr-only">醫師</legend>
        ${organ.doctors
          .map((doctor, index) => doctorMarkup(doctor, index === 0))
          .join("")}
      </fieldset>
    `;
    appointButton.disabled = !appointmentUrl(selectedDoctor());
  })
  .catch(showError);

content.addEventListener("change", (event) => {
  if (!event.target.matches('input[name="doctor"]')) return;
  selectedDoctorId = event.target.value;
  appointButton.disabled = !appointmentUrl(selectedDoctor());
});

content.addEventListener(
  "error",
  (event) => {
    if (event.target.matches("[data-avatar]") && !event.target.dataset.fallbackApplied) {
      event.target.dataset.fallbackApplied = "true";
      event.target.src = "/assets/doctors/a.svg";
    }
  },
  true,
);

prevButton.addEventListener("click", () => {
  const query = getQuery();
  go("/symptom", {
    part: part?.id ?? query.part,
    organ: organ?.id ?? query.organ,
    symptoms: symptomIds.join(",") || query.symptoms,
  });
});

appointButton.addEventListener("click", () => {
  const url = appointmentUrl(selectedDoctor());
  if (url) window.location.assign(url);
});
