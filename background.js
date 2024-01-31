
async function main() {
  messenger.WindowListener.registerDefaultPrefs("defaults/preferences/defaults.js");

  messenger.WindowListener.registerChromeUrl([
    ["content", "hdrtoolsimproved", "chrome/content/"]
  ]);

  messenger.WindowListener.registerOptionsPage("chrome://hdrtoolsimproved/content/settings.xhtml");

  messenger.WindowListener.registerWindow("about:3pane", "chrome/content/messenger.js");

  //messenger.WindowListener.registerWindow("about:message", "chrome/content/messenger.js");

  messenger.WindowListener.registerStartupScript("chrome://hdrtoolsimproved/content/migrateprefs.js");

  messenger.WindowListener.startListening();
}

main();
