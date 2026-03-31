import { getPref } from "./defaults.mjs";
import { localizeDocument } from "../vendor/i18n.mjs";

async function loadPref(el) {
  let type = el.getAttribute("type");
  let name = el.dataset.preference;
  let value = await getPref(name);
  switch (type) {
    case "checkbox":
      el.checked = value;
      break;
    case "number":
    case "text":
      el.value = value;
      break;
  }
}

async function savePref(el) {
  let type = el.getAttribute("type");
  let name = el.dataset.preference;
  switch (type) {
    case "checkbox":
      await browser.storage.local.set({ [name]: !!el.checked });
      break;
    case "number":
      await browser.storage.local.set({ [name]: parseInt(el.value) || 0 });
      break;
    case "text":
      await browser.storage.local.set({ [name]: el.value });
      break;
  }
}

async function loadSettings() {
  for (let el of document.querySelectorAll("*[data-preference]")) {
    await loadPref(el);
  }
}

async function saveSettings() {
  for (let el of document.querySelectorAll("*[data-preference]")) {
    await savePref(el);
  }
}

async function load() {
  localizeDocument();

  document.getElementById("shortcuts_message1").textContent =
    messenger.i18n.getMessage("shortcuts_message1");
  document.getElementById("shortcuts_message2").textContent =
    messenger.i18n.getMessage("shortcuts_message2");

  await loadSettings();

  document.getElementById("btn_save").addEventListener("click", async () => {
    await saveSettings();
    await loadSettings();
  });
  document.getElementById("btn_cancel").addEventListener("click", loadSettings);
}

window.addEventListener("load", load);
