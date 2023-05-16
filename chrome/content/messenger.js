var Services = globalThis.Services || ChromeUtils.import("resource://gre/modules/Services.jsm").Services;

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
      <observes element="replyMainMenu"
                attribute="disabled" />
    </command>
    <command id="headerToolsImprovededitFS"
             oncommand="HeaderToolsImpObj.editFS();">
      <observes element="replyMainMenu"
                attribute="disabled" />
    </command>
  </commandset>

  <menupopup id="messageMenuPopup">
    <menu id="hdrToolsMessageMenu"
          label="&extName;"
          insertafter="messageMenuAfterMarkSeparator">
      <menupopup>
        <menuitem id="headerToolsImprovedModify1"
                  label="&changeDetails;"
                  command="headerToolsImprovededit">
        </menuitem>
        <menuitem id="headerToolsImprovedModify2"
                  label="&fullSource;"
                  command="headerToolsImprovededitFS">
        </menuitem>
        <menuitem id="headerToolsImprovedSettings1"
                  label="&prefTitle;"
                  oncommand="HeaderToolsImpObj.showSettings();">
        </menuitem>
      </menupopup>
    </menu>
    <menuseparator insertafter="hdrToolsMessageMenu" />
  </menupopup>

  <menupopup id="mailContext">
    <menu id="hdrToolsMailContextMenu"
          label="&extName;"
          insertafter="mailContext-mark">
      <menupopup>
        <menuitem id="headerToolsImprovedModify3"
                  label="&changeDetails;"
                  command="headerToolsImprovededit">
        </menuitem>
        <menuitem id="headerToolsImprovedModify4"
                  label="&fullSource;"
                  command="headerToolsImprovededitFS">
        </menuitem>
        <menuitem id="headerToolsImprovedSettings2"
                  label="&prefTitle;"
                  oncommand="HeaderToolsImpObj.showSettings();">
        </menuitem>
      </menupopup>
    </menu>
  </menupopup>

  <menupopup id="otherActionsPopup"
             class="no-icon-menupopup">
    <menu id="otherActionsContextMenu"
          label="&extName;"
          insertafter="otherActionsSeparator">
      <menupopup>
        <menuitem id="headerToolsImprovedModify5"
                  label="&changeDetails;"
                  command="headerToolsImprovededit">
        </menuitem>
        <menuitem id="headerToolsImprovedModify6"
                  label="&fullSource;"
                  command="headerToolsImprovededitFS">
        </menuitem>
        <menuitem id="headerToolsImprovedSettings3"
                  label="&prefTitle;"
                  oncommand="HeaderToolsImpObj.showSettings();">
        </menuitem>
      </menupopup>
    </menu>
    <menuseparator insertafter="otherActionsContextMenu" />
  </menupopup>

`, ["chrome://hdrtoolsimproved/locale/hdrtools.dtd"]);
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
