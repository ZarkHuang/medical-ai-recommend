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

let displayedDoctors = [];

function selectedDoctor() {
  return (
    displayedDoctors.find((doctor) => doctor.id === selectedDoctorId) ||
    organ?.doctors.find((doctor) => doctor.id === selectedDoctorId)
  );
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

    const selectedSymptoms = organ.symptoms.filter((symptom) =>
      symptomIds.includes(symptom.id),
    );
    const matchedDeptNames = [
      ...new Set(
        selectedSymptoms
          .flatMap((s) => s.deptNames || [s.deptName])
          .filter(Boolean),
      ),
    ];
    const matchedDeptIds = new Set(
      selectedSymptoms
        .flatMap((s) => s.deptIds || [s.deptId])
        .filter(Boolean),
    );

    const CHOU_SYMPTOMS = new Set([
      "糖尿病腎病",
      "高血壓腎病",
      "高血脂",
      "腎炎",
      "電解質異常",
      "泌尿道感染",
      "腎性貧血",
      "腎骨病變",
      "毒物檢測",
      "下背痛",
      "血液透析",
      "腹膜透析",
      "慢性病整合照護",
      "腹膜透析植管",
      "尿蛋白",
      "血尿",
      "水腫",
      "慢性腎病",
      "腰痛",
    ]);

    const matchesChouSymptom = selectedSymptoms.some((s) =>
      CHOU_SYMPTOMS.has(s.label),
    );

    function scoreDoctor(doctor) {
      let score = 0;
      if (matchedDeptIds.has(doctor.deptId)) {
        score += 20;
      }
      selectedSymptoms.forEach((symptom) => {
        const term = symptom.label;
        if (
          doctor.rawAbout?.includes(term) ||
          doctor.specialties?.some((s) => s.includes(term)) ||
          doctor.specialtiesText?.some((s) => s.includes(term))
        ) {
          score += 10;
        }
      });
      if (doctor.name.includes("周哲毅") && (matchedDeptIds.has("7") || matchesChouSymptom)) {
        score += 1000;
      }
      return score;
    }

    const scored = organ.doctors.map((doctor, index) => ({
      doctor,
      score: scoreDoctor(doctor),
      index,
    }));

    let candidates = scored;
    if (matchedDeptIds.size > 0) {
      const matched = scored.filter(
        (item) =>
          item.score > 0 ||
          matchedDeptIds.has(item.doctor.deptId) ||
          (matchesChouSymptom && item.doctor.name.includes("周哲毅")),
      );
      if (matched.length > 0) {
        candidates = matched;
      }
    }

    candidates.sort((a, b) => b.score - a.score || a.index - b.index);
    displayedDoctors = candidates.map((item) => item.doctor);

    selectedDoctorId = displayedDoctors[0]?.id ?? "";
    const categoryTitle = matchedDeptNames.length
      ? matchedDeptNames.join("、")
      : organ.category;
    title.textContent = `推薦醫師（${categoryTitle}）`;

    if (displayedDoctors.length === 0) {
      content.innerHTML = '<p class="status">目前沒有可推薦的醫師。</p>';
      return;
    }

    content.innerHTML = `
      <fieldset class="doctors">
        <legend class="sr-only">醫師</legend>
        ${displayedDoctors
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
