var HeaderToolsImprovedKeys = {
  initKeyset: function () {
    var shortcut1, shortcut2 = null;
    try {
      shortcut1 = HeaderToolsImpObj.prefs.getStringPref("extensions.hdrtoolsimproved.edit_shortcut");
      shortcut2 = HeaderToolsImpObj.prefs.getStringPref("extensions.hdrtoolsimproved.editFS_shortcut");
    }
    catch (e) { };
    if (shortcut1) {
      var key1 = document.createXULElement("key");
      key1.setAttribute("key", shortcut1);
      key1.setAttribute("modifiers", "shift");
      key1.setAttribute("id", "headerToolsImprovedkey1");
      key1.setAttribute("command", "headerToolsImprovededit");
      document.getElementById("headerToolsImprovedkeyset").appendChild(key1);
      document.getElementById("headerToolsImprovedModify1").setAttribute("key", "headerToolsImprovedkey1");
      document.getElementById("headerToolsImprovedModify3").setAttribute("key", "headerToolsImprovedkey1");
      document.getElementById("headerToolsImprovedModify5").setAttribute("key", "headerToolsImprovedkey1");
    }
    if (shortcut2) {
      var key2 = document.createXULElement("key");
      key2.setAttribute("key", shortcut2);
      key2.setAttribute("modifiers", "shift");
      key2.setAttribute("id", "headerToolsImprovedkey2");
      key2.setAttribute("command", "headerToolsImprovededitFS");
      document.getElementById("headerToolsImprovedkeyset").appendChild(key2);
      document.getElementById("headerToolsImprovedModify2").setAttribute("key", "headerToolsImprovedkey2");
      document.getElementById("headerToolsImprovedModify4").setAttribute("key", "headerToolsImprovedkey2");
      document.getElementById("headerToolsImprovedModify6").setAttribute("key", "headerToolsImprovedkey2");
    }
  }
};
