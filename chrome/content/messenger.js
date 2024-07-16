Services.scriptloader.loadSubScript("chrome://hdrtoolsimproved/content/hdrtools.js", window, "UTF-8");
Services.scriptloader.loadSubScript("chrome://hdrtoolsimproved/content/keysets.js", window, "UTF-8");

function onLoad(activatedWhileWindowOpen) {

  WL.injectElements(`

  <keyset id="mailKeys">
    <keyset id="headerToolsImprovedkeyset"/>
  </keyset>

  <commandset id="mailCommands">
    <command id="headerToolsImprovededit"
             oncommand="HeaderToolsImpObj.edit();">
    </command>
    <command id="headerToolsImprovededitFS"
             oncommand="HeaderToolsImpObj.editFS();">
    </command>
  </commandset>

  <menupopup id="mailContext">
    <menuseparator id="hdrToolsMailContextSeparator"
                   insertafter="mailContext-mark" />
    <menu id="hdrToolsMailContextMenu"
          label="__MSG_extName__"
          insertafter="hdrToolsMailContextSeparator">
      <observes element="messageBrowser"
                attribute="hidden" />
      <menupopup>
        <menuitem id="headerToolsImprovedModifyHeaders"
                  label="__MSG_changeDetails__"
                  command="headerToolsImprovededit">
        </menuitem>
        <menuitem id="headerToolsImprovedModifySource"
                  label="__MSG_fullSource__"
                  command="headerToolsImprovededitFS">
        </menuitem>
        <menuitem id="headerToolsImprovedSettings"
                  label="__MSG_prefTitle__"
                  oncommand="HeaderToolsImpObj.showSettings();">
        </menuitem>
      </menupopup>
    </menu>
  </menupopup>

`);
  window.HeaderToolsImprovedKeys.initKeyset();
  WL.injectCSS("chrome://hdrtoolsimproved/content/hdrtools.css");
}

// called on window unload or on add-on deactivation while window is still open
function onUnload(deactivatedWhileWindowOpen) {
  // no need to clean up UI on global shutdown
  if (!deactivatedWhileWindowOpen)
    return;
  // If we've added any elements not through WL.inject functions - we need to remove
  // them manually here. The WL-injected elements get auto-removed
}
