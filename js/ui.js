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

  return `
    <label class="doctor">
      <img
        class="doctor-avatar"
        src="${escapeHtml(doctor.avatar)}"
        alt="${escapeHtml(doctor.name)}醫師"
        data-avatar
      >
      <span class="doctor-info">
        <span class="doctor-name">${escapeHtml(doctor.name)}醫師</span>
        <span class="doctor-specialties">${escapeHtml(doctor.specialties.join("、"))}</span>
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
