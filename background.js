
async function main() {
  messenger.WindowListener.registerDefaultPrefs("defaults/preferences/defaults.js");

  messenger.WindowListener.registerChromeUrl([
    ["content", "hdrtoolsimproved", "chrome/content/"],
    ["locale", "hdrtoolsimproved", "en-US", "chrome/locale/en-US/"],
    ["locale", "hdrtoolsimproved", "de-DE", "chrome/locale/de-DE/"],
    ["locale", "hdrtoolsimproved", "it", "chrome/locale/it/"],
    ["locale", "hdrtoolsimproved", "ja", "chrome/locale/ja/"]
  ]);

  messenger.WindowListener.registerOptionsPage("chrome://hdrtoolsimproved/content/settings.xhtml");

  messenger.WindowListener.registerWindow("about:3pane", "chrome/content/messenger.js");

  messenger.WindowListener.registerWindow("about:message", "chrome/content/messenger.js");

  //messenger.WindowListener.registerWindow("chrome://messenger/content/messenger.xhtml", "chrome/content/messenger.js");

  //messenger.WindowListener.registerWindow("chrome://messenger/content/messageWindow.xhtml", "chrome/content/messenger.js");

  messenger.WindowListener.registerStartupScript("chrome://hdrtoolsimproved/content/migrateprefs.js");

  messenger.WindowListener.startListening();
}

main();
