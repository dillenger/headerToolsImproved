function migratePrefs() {
  if (Services.prefs.getBoolPref("extensions.hdrtoolsimproved.prefs_migrated") == true) {
    return;
  } else {
    if (Services.prefs.getBoolPref("extensions.hdrtoolslite.putOriginalInTrash","")) {
      Services.prefs.setBoolPref("extensions.hdrtoolsimproved.putOriginalInTrash", Services.prefs.getBoolPref("extensions.hdrtoolslite.putOriginalInTrash"));
    };
    if (Services.prefs.getBoolPref("extensions.hdrtoolslite.editFullSourceWarning","")) {
      Services.prefs.setBoolPref("extensions.hdrtoolsimproved.editFullSourceWarning", Services.prefs.getBoolPref("extensions.hdrtoolslite.editFullSourceWarning"));
    };
    if (Services.prefs.getBoolPref("extensions.hdrtoolslite.use_imap_fix","")) {
      Services.prefs.setBoolPref("extensions.hdrtoolsimproved.use_imap_fix", Services.prefs.getBoolPref("extensions.hdrtoolslite.use_imap_fix"));
    };
    if (Services.prefs.getBoolPref("extensions.hdrtoolslite.add_htl_header","")) {
      Services.prefs.setBoolPref("extensions.hdrtoolsimproved.add_htl_header", Services.prefs.getBoolPref("extensions.hdrtoolslite.add_htl_header"));
    };
    if (Services.prefs.getIntPref("extensions.hdrtoolslite.fullsource_maxchars","")) {
      Services.prefs.setIntPref("extensions.hdrtoolsimproved.fullsource_maxchars", Services.prefs.getIntPref("extensions.hdrtoolslite.fullsource_maxchars"));
    };
    if (Services.prefs.getStringPref("extensions.hdrtoolslite.edit_shortcut","")) {
      Services.prefs.setStringPref("extensions.hdrtoolsimproved.edit_shortcut", Services.prefs.getStringPref("extensions.hdrtoolslite.edit_shortcut"));
    };
    if (Services.prefs.getStringPref("extensions.hdrtoolslite.editFS_shortcut","")) {
      Services.prefs.setStringPref("extensions.hdrtoolsimproved.editFS_shortcut", Services.prefs.getStringPref("extensions.hdrtoolslite.editFS_shortcut"));
    };
    Services.prefs.setBoolPref("extensions.hdrtoolsimproved.prefs_migrated", true);
    console.log("hdrtools preferences have been set or migrated")
  }
}

migratePrefs();
