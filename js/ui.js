export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function choiceMarkup({ type, name, id, label, checked = false }) {
  return `
    <label class="choice">
      <input
        type="${escapeHtml(type)}"
        name="${escapeHtml(name)}"
        value="${escapeHtml(id)}"
        ${checked ? "checked" : ""}
      >
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

export function hotspotMarkup(part, hotspot, selected) {
  return `
    <button
      type="button"
      class="hotspot"
      data-part-id="${escapeHtml(part.id)}"
      style="top:${hotspot.top};left:${hotspot.left};width:${hotspot.width};height:${hotspot.height}"
      aria-label="${escapeHtml(part.label)}"
      title="${escapeHtml(part.label)}"
    >${selected ? '<span class="indicator"></span>' : ""}</button>
  `;
}

export function doctorMarkup(doctor, checked) {
  const rating =
    typeof doctor.rating === "number"
      ? `<span class="stars" style="--rating:${doctor.rating}" aria-label="評分 ${doctor.rating} / 5"></span>`
      : "";

  const titleBadge = doctor.title
    ? `<span class="doctor-badge">${escapeHtml(doctor.title)}</span>`
    : "";

  let bioContent = "";
  if (doctor.experiences?.length) {
    bioContent += `
      <div class="doctor-section doctor-exp">
        <span class="section-label">現職／經歷：</span>
        <span class="section-content">${escapeHtml(doctor.experiences.join(" "))}</span>
      </div>
    `;
  }
  if (doctor.specialtiesText?.length) {
    bioContent += `
      <div class="doctor-section doctor-spec">
        <span class="section-label">專長領域：</span>
        <span class="section-content">${escapeHtml(doctor.specialtiesText.join(" "))}</span>
      </div>
    `;
  } else if (doctor.specialties?.length) {
    bioContent += `
      <div class="doctor-section doctor-spec">
        <span class="section-label">專長領域：</span>
        <span class="section-content">${escapeHtml(doctor.specialties.join("、"))}</span>
      </div>
    `;
  } else if (doctor.rawAbout) {
    bioContent += `
      <div class="doctor-section doctor-spec">
        <span class="section-label">專長領域：</span>
        <span class="section-content">${escapeHtml(doctor.rawAbout)}</span>
      </div>
    `;
  }

  if (!bioContent.trim()) {
    bioContent = `
      <div class="doctor-section doctor-spec">
        <span class="section-label">主治項目：</span>
        <span class="section-content">${escapeHtml(doctor.deptName ? `${doctor.deptName}專科主治門診診療` : "專科主治門診診療與諮詢")}</span>
      </div>
    `;
  }

  return `
    <label class="doctor">
      <img
        class="doctor-avatar"
        src="${escapeHtml(doctor.avatar)}"
        alt="${escapeHtml(doctor.name)}醫師"
        data-avatar
      >
      <span class="doctor-info">
        <span class="doctor-header">
          <span class="doctor-name">${escapeHtml(doctor.name)}醫師</span>
          ${titleBadge}
        </span>
        <div class="doctor-body">
          ${bioContent}
        </div>
        ${rating}
      </span>
      <span class="doctor-radio">
        <input
          type="radio"
          name="doctor"
          value="${escapeHtml(doctor.id)}"
          ${checked ? "checked" : ""}
        >
      </span>
    </label>
  `;
}
