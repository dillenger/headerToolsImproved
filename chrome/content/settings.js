const Services = globalThis.Services || ChromeUtils.import("resource://gre/modules/Services.jsm").Services;
const { MailUtils } = ChromeUtils.import("resource:///modules/MailUtils.jsm");

function savePrefs() {
  Services.prefs.setBoolPref("extensions.hdrtoolsimproved.putOriginalInTrash", document.getElementById("delOrig").checked);
  Services.prefs.setBoolPref("extensions.hdrtoolsimproved.use_imap_fix", document.getElementById("imapFix").checked);
  Services.prefs.setBoolPref("extensions.hdrtoolsimproved.add_htl_header", document.getElementById("addHTLheader").checked);
  if (document.getElementById("shortcutBox1").value.length > 0)
    Services.prefs.setStringPref("extensions.hdrtoolsimproved.edit_shortcut", document.getElementById("shortcutBox1").value);
  else
    Services.prefs.clearUserPref("extensions.hdrtoolsimproved.edit_shortcut");
  if (document.getElementById("shortcutBox2").value.length > 0)
    Services.prefs.setStringPref("extensions.hdrtoolsimproved.editFS_shortcut", document.getElementById("shortcutBox2").value);
  else
    Services.prefs.clearUserPref("extensions.hdrtoolsimproved.editFS_shortcut");
  var maxChars = document.getElementById("maxFSchars").value;
  if (maxChars == -1 || maxChars > 50)
    Services.prefs.setIntPref("extensions.hdrtoolsimproved.fullsource_maxchars", maxChars);
  else
    Services.prefs.setIntPref("extensions.hdrtoolsimproved.fullsource_maxchars", 50);
}

function saveAndRestart() {
  savePrefs();
  MailUtils.restartApplication();
}

function onLoad() {
  document.addEventListener("dialogaccept", function () { savePrefs() });
  document.addEventListener("dialogextra1", function () { saveAndRestart() });
  document.getElementById("delOrig").checked = Services.prefs.getBoolPref("extensions.hdrtoolsimproved.putOriginalInTrash");
  document.getElementById("imapFix").checked = Services.prefs.getBoolPref("extensions.hdrtoolsimproved.use_imap_fix");
  document.getElementById("addHTLheader").checked = Services.prefs.getBoolPref("extensions.hdrtoolsimproved.add_htl_header");
  try {
    document.getElementById("shortcutBox1").value = Services.prefs.getStringPref("extensions.hdrtoolsimproved.edit_shortcut");
    document.getElementById("shortcutBox2").value = Services.prefs.getStringPref("extensions.hdrtoolsimproved.editFS_shortcut");
  }
  catch (e) { }
  document.getElementById("maxFSchars").value = Services.prefs.getIntPref("extensions.hdrtoolsimproved.fullsource_maxchars");
}
