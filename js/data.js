const PART_DEPARTMENTS = {
  head: {
    scalp: { label: "頭皮／頭頂", deptIds: ["1", "42", "25"] },
    face: { label: "臉部", deptIds: ["42", "16", "18", "25"] },
    eye: { label: "眼部", deptIds: ["17", "9"] },
    "ear-nose": { label: "耳鼻", deptIds: ["18", "25"] },
    mouth: { label: "口／牙齒", deptIds: ["19", "18"] },
    brain: { label: "腦部", deptIds: ["1", "21", "43", "27"] },
  },
  neck: {
    "front-neck": { label: "頸前", deptIds: ["18", "12", "9", "10"] },
    "side-neck": { label: "頸側", deptIds: ["26", "53", "10"] },
    "back-neck": { label: "後頸", deptIds: ["53", "26", "21"] },
  },
  chest: {
    heart: { label: "心前區", deptIds: ["2", "13", "11"] },
    lung: { label: "肺部／肋側", deptIds: ["5", "14", "10", "27"] },
    breast: { label: "乳房", deptIds: ["32", "12", "10", "27", "16"] },
  },
  abdomen: {
    "upper-abdomen": { label: "上腹部／胃部", deptIds: ["6", "33", "12", "9", "7"] },
    "lower-abdomen": { label: "下腹部", deptIds: ["6", "15", "20", "24", "7"] },
    "left-abdomen": { label: "左側腹部／腰側", deptIds: ["6", "15", "7"] },
    "right-abdomen": { label: "右側腹部／腰側", deptIds: ["6", "33", "12", "7"] },
    navel: { label: "肚臍周圍", deptIds: ["6", "12"] },
    "whole-abdomen": {
      label: "整個腹部",
      deptIds: ["6", "11", "31", "48", "25", "40"],
    },
  },
  back: {
    "upper-back": { label: "上背", deptIds: ["26", "53", "5"] },
    "lower-back": { label: "下背／腰", deptIds: ["53", "26", "7", "21"] },
    spine: { label: "脊椎中線", deptIds: ["21", "53", "26"] },
  },
  arm: {
    shoulder: { label: "肩部", deptIds: ["53", "26", "8"] },
    elbow: { label: "肘部", deptIds: ["53", "26", "8"] },
    "wrist-hand": { label: "手腕／手", deptIds: ["53", "26", "16", "8"] },
  },
  leg: {
    hip: { label: "髖部", deptIds: ["53", "26", "8"] },
    knee: { label: "膝蓋", deptIds: ["53", "26", "8"] },
    "ankle-foot": { label: "足踝", deptIds: ["53", "26", "13"] },
  },
  other: {
    skin: { label: "皮膚全身", deptIds: ["42", "16", "8", "31"] },
    systemic: {
      label: "全身不適",
      deptIds: ["11", "9", "31", "48", "29", "40", "25", "10", "23", "49", "39", "35"],
    },
    mental: { label: "情緒／睡眠", deptIds: ["44", "43", "1"] },
    women: { label: "婦女健康", deptIds: ["24", "20"] },
    child: { label: "兒童", deptIds: ["23"] },
  },
};

const PARTS = [
  {
    id: "head",
    label: "頭部",
    image: "/assets/parts/head.png",
    hotspots: [{ top: "4%", left: "38%", width: "24%", height: "11%" }],
  },
  {
    id: "neck",
    label: "頸部",
    image: "/assets/parts/neck.png",
    hotspots: [{ top: "15.5%", left: "42%", width: "16%", height: "5%" }],
  },
  {
    id: "chest",
    label: "胸部",
    image: "/assets/parts/chest.png",
    hotspots: [{ top: "20%", left: "32%", width: "36%", height: "15%" }],
  },
  {
    id: "abdomen",
    label: "腹部",
    image: "/assets/parts/abdomen.png",
    hotspots: [{ top: "34%", left: "33%", width: "34%", height: "13%" }],
  },
  {
    id: "back",
    label: "背部",
    image: "/assets/parts/back.png",
    hotspots: [{ top: "22%", left: "46%", width: "8%", height: "24%" }],
  },
  {
    id: "arm",
    label: "上肢",
    image: "/assets/parts/arm.png",
    hotspots: [
      { top: "21%", left: "12%", width: "20%", height: "30%" },
      { top: "21%", left: "68%", width: "20%", height: "30%" },
    ],
  },
  {
    id: "leg",
    label: "下肢",
    image: "/assets/parts/leg.png",
    hotspots: [{ top: "50%", left: "32%", width: "36%", height: "44%" }],
  },
  {
    id: "other",
    label: "其他",
    image: "/assets/bot.png",
    hotspots: [{ top: "2.5%", left: "78%", width: "18%", height: "8%" }],
  },
];

let configPromise;

function splitPhrases(text = "") {
  return text
    .replace(/「[^」]*」/g, " ")
    .split(/[、，,。；;]/)
    .map((item) => item.replace(/^\d+\.\s*/, "").trim())
    .filter((item) => item.length > 0 && !/^\d+$/.test(item));
}

function chineseName(name = "") {
  const stripped = name.replace(/[A-Za-z].*$/, "").trim();
  return stripped || name.trim();
}

function specialtiesFromAbout(about = "") {
  const phrases = splitPhrases(about);
  if (phrases.length) return phrases;
  const trimmed = about.trim();
  if (!trimmed) return [];
  return [trimmed.length > 80 ? `${trimmed.slice(0, 80)}…` : trimmed];
}

function parseDoctorBio(about = "", title = "") {
  const text = (about || "").replace(/\r\n/g, "\n").trim();
  if (!text) return { title: title || "", experiences: [], specialtiesText: [] };

  const rawParts = text
    .split(/(?<=[。！？\n])\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  const experiences = [];
  const specialtiesText = [];

  rawParts.forEach((part) => {
    const isExplicitSpecialty = /專長|擅長|專精|主治症狀|主治疾病|主治項目/.test(part);
    const isExplicitExp =
      /^(?:現任|曾任|經歷|學歷|榮獲)/.test(part) ||
      (!isExplicitSpecialty && /(?:院長|主任|教授|博士|醫師|學系|畢業|研究員|受訓)/.test(part));

    if (isExplicitExp && !isExplicitSpecialty) {
      experiences.push(part);
    } else if (
      isExplicitSpecialty ||
      /治療|手術|疾患|病變|症狀|內科|外科|透析|移植|感染|疼痛/.test(part)
    ) {
      specialtiesText.push(part);
    } else {
      if (experiences.length === 0) experiences.push(part);
      else specialtiesText.push(part);
    }
  });

  return {
    title: title || "",
    experiences,
    specialtiesText,
  };
}

function toDoctor(raw, department) {
  const parsed = parseDoctorBio(raw.doctAbout, raw.doctTitle);
  return {
    id: raw.doctNo,
    name: chineseName(raw.doctName),
    title: raw.doctTitle || "",
    avatar: raw.avatarLink || "/assets/doctors/a.svg",
    specialties: specialtiesFromAbout(raw.doctAbout),
    experiences: parsed.experiences,
    specialtiesText: parsed.specialtiesText,
    rawAbout: raw.doctAbout || "",
    deptId: department?.deptId || "",
    deptName: department?.deptName || "",
    appointUrl: raw.firstAppointmentUrl,
  };
}

function buildConfig(departments) {
  const departmentById = new Map(departments.map((dept) => [dept.deptId, dept]));

  function resolveDepartments(ids) {
    return ids.map((id) => {
      const department = departmentById.get(id);
      if (!department) throw new Error(`Unknown department id: ${id}`);
      return department;
    });
  }

  function uniqueDoctors(selectedDepartments) {
    const byId = new Map();
    selectedDepartments.forEach((department) => {
      department.doctorList.forEach((rawDoctor) => {
        if (!byId.has(rawDoctor.doctNo)) {
          byId.set(rawDoctor.doctNo, toDoctor(rawDoctor, department));
        }
      });
    });
    return [...byId.values()];
  }

  function symptomsFromDepartments(organId, selectedDepartments) {
    const items = [];
    const map = new Map();
    selectedDepartments.forEach((department) => {
      splitPhrases(department.deptAbout).forEach((label) => {
        if (!map.has(label)) {
          const item = {
            label,
            deptId: department.deptId,
            deptName: department.deptName,
            deptIds: [department.deptId],
            deptNames: [department.deptName],
          };
          map.set(label, item);
          items.push(item);
        } else {
          const existing = map.get(label);
          if (!existing.deptIds.includes(department.deptId)) {
            existing.deptIds.push(department.deptId);
            existing.deptNames.push(department.deptName);
          }
        }
      });
    });
    return (
      items.length
        ? items
        : [
            {
              label: "一般看診",
              deptId: selectedDepartments[0]?.deptId || "",
              deptName: selectedDepartments[0]?.deptName || "",
              deptIds: [selectedDepartments[0]?.deptId || ""],
              deptNames: [selectedDepartments[0]?.deptName || ""],
            },
          ]
    ).map((item, index) => ({
      id: `${organId}-s${index}`,
      label: item.label,
      deptId: item.deptId,
      deptName: item.deptName,
      deptIds: item.deptIds,
      deptNames: item.deptNames,
    }));
  }

  return PARTS.map((part) => ({
    ...part,
    organs: Object.entries(PART_DEPARTMENTS[part.id]).map(([id, item]) => {
      const selectedDepartments = resolveDepartments(item.deptIds);
      return {
        id,
        label: item.label,
        image: part.image,
        symptoms: symptomsFromDepartments(id, selectedDepartments),
        category: [...new Set(selectedDepartments.map((dept) => dept.deptName))].join("、"),
        doctors: uniqueDoctors(selectedDepartments),
      };
    }),
  }));
}

export function loadConfig() {
  if (!configPromise) {
    configPromise = fetch("/data/departments.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load departments (${response.status})`);
        return response.json();
      })
      .then(buildConfig);
  }
  return configPromise;
}

export function parseSymptomIds(value) {
  return typeof value === "string" && value ? value.split(",").filter(Boolean) : [];
}

export function getPart(bodyParts, partId) {
  return bodyParts.find((part) => part.id === partId);
}

export function getOrgan(bodyParts, partId, organId) {
  return getPart(bodyParts, partId)?.organs.find((organ) => organ.id === organId);
}
