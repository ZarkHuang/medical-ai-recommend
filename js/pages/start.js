import { go, initializePage } from "../nav.js";

initializePage();

document.querySelector('[data-action="start"]').addEventListener("click", () => {
  sessionStorage.removeItem("care-nav-query");
  go("/body");
});
