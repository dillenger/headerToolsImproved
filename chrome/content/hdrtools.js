/* This extension is a simplified version of TB_Header_Tools of Frank DiLecce (a genius!)
It follows the same logic, but the code is totally rewritten, so that in future it will be easier
to maintain it for everyone. Moreover it doesn't affect any Thunderbird native functions and
so it shouldn't give any compatibility problems.
*/

var HeaderToolsImpObj = {

  // global variables
  folder : null,
  hdr : null,
  prefs : Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
  bundle : Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://hdrtoolsimproved/locale/hdrtools.properties"),

  // called loading dialog for changing headers details
  initDialog : function() {
    var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
    let extension = ExtensionParent.GlobalManager.getExtension("hdrtoolslite@dillinger");
    i18n.updateDocument({extension});
    document.addEventListener("dialogaccept", function() {HeaderToolsImpObj.exitDialog(false)}); // This replaces ondialogaccept in XUL.
    document.addEventListener("dialogcancel", function() {HeaderToolsImpObj.exitDialog(true)}); // This replaces ondialogcancel in XUL.
    // window.arguments[0] is an object with date,subject,author and recipients as strings
    var date1 = window.arguments[0].date.substring(0,3);
    for (var i=1;i<8;i++) {
      if (document.getElementById("date3").menupopup.childNodes[i].label == date1) {
        document.getElementById("date3").selectedIndex = i;
        date1 = null;
        break;
      }
    }
    if (! date1)
      document.getElementById("dateBox").value = window.arguments[0].date.substring(5);
    else
      document.getElementById("dateBox").value = window.arguments[0].date;
    document.getElementById("subBox").value = window.arguments[0].subject;
    document.getElementById("authBox").value = window.arguments[0].author;
    document.getElementById("recBox").value = window.arguments[0].recipients;
    document.getElementById("replytoBox").value = window.arguments[0].replyto;
    document.getElementById("inreplytoBox").value = window.arguments[0].inreplyto;
    document.getElementById("midBox").value = window.arguments[0].mid;
    document.getElementById("refBox").value = window.arguments[0].ref;
    window.sizeToContent();
  },

  // called closing dialog for changing headers details
  exitDialog : function(cancel) {
    window.arguments[0].cancel = cancel;
    if (cancel)  // user clicked on "Cancel" button
      return true;

    if (document.getElementById("date3").selectedIndex > 0)
      var dateValue = document.getElementById("date3").selectedItem.label+", "+document.getElementById("dateBox").value;
    else
      var dateValue = document.getElementById("dateBox").value;

    /*
    if (! dateValue.match(/^.{3}\,/)) {
      alert(extension.localeData.localizeMessage("wrongDate"));
      return false;
    }*/
    window.arguments[0].date = dateValue;
    window.arguments[0].subject = document.getElementById("subBox").value;
    window.arguments[0].author = document.getElementById("authBox").value;
    window.arguments[0].recipients = document.getElementById("recBox").value;
    window.arguments[0].replyto = document.getElementById("replytoBox").value;
    window.arguments[0].inreplyto = document.getElementById("inreplytoBox").value;
    window.arguments[0].mid = document.getElementById("midBox").value;
    window.arguments[0].ref = document.getElementById("refBox").value;
    return true;
  },

  // called loading dialog for editing full source, that is in window.arguments[0].value
  initDialog2 : function() {
    var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
    let extension = ExtensionParent.GlobalManager.getExtension("hdrtoolslite@dillinger");
    i18n.updateDocument({extension});
    document.addEventListener("dialogaccept", function() {HeaderToolsImpObj.exitDialog2(false)}); // This replaces ondialogaccept in XUL.
    document.addEventListener("dialogcancel", function() {HeaderToolsImpObj.exitDialog2(true)}); // This replaces ondialogcancel in XUL.
    document.getElementById("editFSarea").focus();
    var limit = HeaderToolsImpObj.prefs.getIntPref("extensions.hdrtoolsimproved.fullsource_maxchars");
    HeaderToolsImpObj.full = window.arguments[0].value.length;
    if (limit > -1 &&  HeaderToolsImpObj.full > limit) {
      var text =  window.arguments[0].value.substring(0,limit);
      document.getElementById("FS_button").removeAttribute("collapsed");
      var percent = parseInt((limit/HeaderToolsImpObj.full)*100);
    }
    else {
      var text =  window.arguments[0].value;
      var percent = 100;
    }
    document.getElementById("sourcePercent").value = document.getElementById("sourcePercent").value.replace("§", percent);
    // dialog will hang with too big vaue for textbox on slow machines
    document.getElementById("editFSarea").setAttribute("limit", limit);
    document.getElementById("charsetBox").value = window.arguments[0].charset;
    setTimeout(function() {
      document.getElementById("editFSarea").value = text;
      // move the cursor at the beginning of the text
      document.getElementById("editFSarea").setSelectionRange(0,0);
      window.sizeToContent();
    }, 300);
  },

  showFullSource : function() {
    var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
    let extension = ExtensionParent.GlobalManager.getExtension("hdrtoolslite@dillinger");
    if (confirm(extension.localeData.localizeMessage("fsBigMessage"))) {
      document.getElementById("editFSarea").setAttribute("limit", "-1");
      document.getElementById("editFSarea").value = "";
      document.getElementById("editFSarea").value = window.arguments[0].value;
      document.getElementById("FS_button").collapsed = true;
      document.getElementById("sourcePercent").value = document.getElementById("sourcePercent").value.replace(/\d+\%/, "100%");
    }
  },

  // called closing dialog for editing full source
  exitDialog2 : function(cancel) {
    window.arguments[0].cancel = cancel;
    if (! cancel) {
      var limit = document.getElementById("editFSarea").getAttribute("limit");
      if (limit > -1) {
        var fullSource = window.arguments[0].value.substring(limit);
        fullSource =  document.getElementById("editFSarea").value + fullSource;
      }
      else
        var fullSource = document.getElementById("editFSarea").value;
      window.arguments[0].value = fullSource;
      window.arguments[0].charset = document.getElementById("charsetBox").value;
    }
  },

  // parses headers to find the original Date header, not present in nsImsgDbHdr
  getOrigDate : function() {
    var dateOrig = "";
    var splitted = null;
    try {
      var str_message = HeaderToolsImpObj.listener.text;
      // This is the end of the headers
      var end = str_message.search(/\r?\n\r?\n/);
      if (str_message.indexOf("\nDate") > -1 && str_message.indexOf("\nDate")  < end)
        splitted =str_message.split("\nDate:");
      else if (str_message.indexOf("\ndate") > -1 && str_message.indexOf("\ndate")  < end)
        splitted =str_message.split("\ndate:");
      if (splitted) {
        dateOrig = splitted[1].split("\n")[0];
        dateOrig = dateOrig.replace(/ +$/,"");
        dateOrig = dateOrig.replace(/^ +/,"");
      }
    }
    catch(e) {}
    return dateOrig;
  },

  // start changing headers details
  edit: function() {
    //var msguri = gFolderDisplay.selectedMessageUris[0];
    var gTabmail = Services.wm.getMostRecentBrowserWindow().gTabmail;
    var msguri = gTabmail.currentAboutMessage.gMessageURI;
    //var mms = messenger.msgHdrFromURI(msguri).QueryInterface(Components.interfaces.nsIMsgDBHdr);
    var mms = MailServices.messageServiceFromURI(msguri);
    //HeaderToolsImpObj.hdr = mms.messageURIToMsgHdr(msguri);
    var messenger = Services.wm.getMostRecentBrowserWindow().messenger;
    HeaderToolsImpObj.hdr = messenger.msgHdrFromURI(msguri);
    //HeaderToolsImpObj.folder = HeaderToolsImpObj.hdr.folder;
    HeaderToolsImpObj.folder = gTabmail.currentAboutMessage.gMessage.folder;
    HeaderToolsImpObj.listener.fullSource = false;
    mms.streamMessage(msguri, HeaderToolsImpObj.listener, null, null, false, null);
  },

  // start editing full source
  editFS: function() {
    if (HeaderToolsImpObj.prefs.getBoolPref("extensions.hdrtoolsimproved.editFullSourceWarning")) {
      var check = {value: false};
      Services.prompt.alertCheck(null,"Header Tools Improved", extension.localeData.localizeMessage("fsWarning"),extension.localeData.localizeMessage("dontShowAgain"), check);
      HeaderToolsImpObj.prefs.setBoolPref("extensions.hdrtoolsimproved.editFullSourceWarning", ! check.value);
    }
    //var msguri = gFolderDisplay.selectedMessageUris[0];
    var gTabmail = Services.wm.getMostRecentBrowserWindow().gTabmail;
    var msguri = gTabmail.currentAboutMessage.gMessageURI;
    //var mms = messenger.msgHdrFromURI(msguri).QueryInterface(Components.interfaces.nsIMsgDBHdr);
    var mms = MailServices.messageServiceFromURI(msguri);
    //HeaderToolsImpObj.hdr = mms.messageURIToMsgHdr(msguri);
    var messenger = Services.wm.getMostRecentBrowserWindow().messenger;
    HeaderToolsImpObj.hdr = messenger.msgHdrFromURI(msguri);
    //HeaderToolsImpObj.folder = HeaderToolsImpObj.hdr.folder;
    HeaderToolsImpObj.folder = gTabmail.currentAboutMessage.gMessage.folder;
    HeaderToolsImpObj.listener.fullSource = true;
    mms.streamMessage(msguri, HeaderToolsImpObj.listener, null, null, false, null);
  },

  cleanCRLF : function(data) {
    /* This function forces all newline as CRLF; this is useful for some reasons
    1) this will make the message RFC2822 compliant
    2) this will fix some problems with IMAP servers that don't accept mixed newlines
    3) this will make easier to use regexps
    */
    var newData = data.replace(/\r\n/g, "\r");
    newData = newData.replace(/\r/g, "\n");
    newData = newData.replace(/\n/g, "\r\n");
    return newData;
  },

  // streamMessage listener
  listener : {
    QueryInterface : function(iid)  {
                  if (iid.equals(Components.interfaces.nsIStreamListener) ||
                      iid.equals(Components.interfaces.nsISupports))
                   return this;

                  throw Components.results.NS_NOINTERFACE;
                  return 0;
          },

    onStartRequest : function (aRequest) {
      HeaderToolsImpObj.listener.text = "";
    },

    onStopRequest : function (aRequest, aStatusCode) {

      var isImap = (HeaderToolsImpObj.folder.server.type == "imap") ? true : false;
      var date = HeaderToolsImpObj.getOrigDate();
      var originalSub = HeaderToolsImpObj.hdr.mime2DecodedSubject;

      if (HeaderToolsImpObj.listener.fullSource) {
        // we're editing full source
        var textObj = {};
        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
          .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        var text = HeaderToolsImpObj.listener.text;
        if (HeaderToolsImpObj.hdr.Charset)
          converter.charset = HeaderToolsImpObj.hdr.Charset;
        // hdr.Charset will not work with multipart messages, so we must try to extract the charset manually
        else {
          try {
            var textCut = text.substring(text.indexOf("charset=")+8, text.indexOf("charset=")+35);
            var mailCharset = textCut.match(/[^\s]+/).toString();
            mailCharset = mailCharset.replace(/\"/g, "");
            mailCharset = mailCharset.replace(/\'/g, "");
            converter.charset = mailCharset;
          }
          catch(e) {
            converter.charset = "UTF-8";
          }
        }
        try {
          text = converter.ConvertToUnicode(text);
        }
        catch(e) {}

        textObj.value = text;
        textObj.charset = converter.charset;
        window.openDialog('chrome://hdrtoolsimproved/content/cnghdrs2.xhtml',"","chrome,modal,centerscreen,resizable",textObj);
        if (textObj.cancel) { // user clicked on "Cancel" button
          HeaderToolsImpObj.hdr = null;
          HeaderToolsImpObj.folder = null;
          return;
        }
        var data = HeaderToolsImpObj.cleanCRLF(textObj.value);
        try {
          converter.charset = textObj.charset;
          data = converter.ConvertFromUnicode(data);
        }
        catch(e) {}
        var dateIsChanged = false;
        var action = "bodyChanged";
      }
      else {
        // we're just changing headers details
        var newHdr = {};
        newHdr.author = HeaderToolsImpObj.hdr.mime2DecodedAuthor;
        newHdr.recipients = HeaderToolsImpObj.hdr.mime2DecodedRecipients;
        if (HeaderToolsImpObj.hdr.flags & 0x0010)
          // in replies the subject returned by mime2DecodedSubject has no initial "Re:"
          originalSub ="Re: "+ originalSub;
        newHdr.subject = originalSub;
        newHdr.date = date;
        newHdr.replyto = HeaderToolsImpObj.hdr.getStringProperty("replyTo");

        var { MsgUtils } = ChromeUtils.import("resource:///modules/MimeMessageUtils.jsm");
        var rawReferences = HeaderToolsImpObj.hdr.getStringProperty("references");
        references = MsgUtils.getReferences(rawReferences);
        newHdr.inreplyto = MsgUtils.getInReplyTo(rawReferences);

        var mimeConverter = Components.classes["@mozilla.org/messenger/mimeconverter;1"]
          .getService(Components.interfaces.nsIMimeConverter);
        // decode UTF-8 encoded Reply-To headers before the dialog opens
        newHdr.replyto = mimeConverter.decodeMimeHeader(newHdr.replyto, "UTF-8", false, false);

        if (HeaderToolsImpObj.hdr.messageId)
          newHdr.mid = "<"+HeaderToolsImpObj.hdr.messageId+">";
        newHdr.ref = "";
        var refs = HeaderToolsImpObj.hdr.numReferences;
        if (refs > 0)
          newHdr.ref = "<"+HeaderToolsImpObj.hdr.getStringReference(0)+">";
        for (var i=1;i<refs;i++)
          newHdr.ref = newHdr.ref + " <"+HeaderToolsImpObj.hdr.getStringReference(i)+">";

        window.openDialog('chrome://hdrtoolsimproved/content/cnghdrs.xhtml',"","chrome,modal,centerscreen,resizable ",newHdr);

        if (newHdr.cancel)
          return;

        // encodes the headers in UTF-8. I couldn't use message charset, because sometimes it's null
        var newSubEnc = mimeConverter.encodeMimePartIIStr_UTF8(newHdr.subject, false, "UTF-8", 0, 72);
        var newAuthEnc = mimeConverter.encodeMimePartIIStr_UTF8(newHdr.author, true, "UTF-8", 0, 72);
        var newRecEnc = mimeConverter.encodeMimePartIIStr_UTF8(newHdr.recipients, true, "UTF-8", 0, 72);
        var newReplytoEnc = mimeConverter.encodeMimePartIIStr_UTF8(newHdr.replyto, true, "UTF-8", 0, 72);

        var data = HeaderToolsImpObj.cleanCRLF(HeaderToolsImpObj.listener.text);
        var endHeaders = data.search(/\r\n\r\n/);
        var headers = data.substring(0,endHeaders);

        // unfold headers, if necessary
        while(headers.match(/\r\nSubject: .*\r\n\s+/))
          headers = headers.replace(/(\r\nSubject: .*)(\r\n\s+)/, "$1 ");
        while(headers.match(/\r\nFrom: .*\r\n\s+/))
          headers = headers.replace(/(\r\nFrom: .*)(\r\n\s+)/, "$1 ");
        while(headers.match(/\r\nTo: .*\r\n\s+/))
          headers = headers.replace(/(\r\nTo: .*)(\r\n\s+)/, "$1 ");
        while(headers.match(/\r\nReply-To: .*\r\n\s+/))
          headers = headers.replace(/(\r\nReply-To: .*)(\r\n\s+)/, "$1 ");

        // This will be removed after the if-else_if-else series, it will make easier to test headers
        headers = "\n"+headers+"\r\n";

        // check also lowercase headers, used for example by SOGO
        if (headers.indexOf("\nSubject:") > -1)
          headers = headers.replace(/\nSubject: *.*\r\n/, "\nSubject: "+newSubEnc+"\r\n");
        else if (headers.indexOf("\nsubject:") > -1)
          headers = headers.replace(/\nsubject: *.*\r\n/, "\nsubject: "+newSubEnc+"\r\n");
        else // header missing
          headers = headers+("Subject: "+newSubEnc+"\r\n");

        if (headers.indexOf("\nDate:") > -1)
          headers = headers.replace(/\nDate: *.*\r\n/, "\nDate: "+newHdr.date+"\r\n");
        else if (headers.indexOf("\ndate:") > -1)
          headers = headers.replace(/\ndate: *.*\r\n/, "\ndate: "+newHdr.date+"\r\n");
        else // header missing
          headers = headers+("Date: "+newHdr.date+"\r\n");

        if (headers.indexOf("\nFrom:") > -1)
          headers = headers.replace(/\nFrom: *.*\r\n/, "\nFrom: "+newAuthEnc+"\r\n");
        else if (headers.indexOf("\nfrom:") > -1)
          headers = headers.replace(/\nfrom: *.*\r\n/, "\nfrom: "+newAuthEnc+"\r\n");
        else // header missing
          headers = headers+("From: "+newAuthEnc+"\r\n");

        if (headers.indexOf("\nTo:") > -1)
          headers = headers.replace(/\nTo: *.*\r\n/, "\nTo: "+newRecEnc+"\r\n");
        else if (headers.indexOf("\nto:") > -1)
          headers = headers.replace(/\nto: *.*\r\n/, "\nto: "+newRecEnc+"\r\n");
        else // header missing
          headers = headers+("To: "+newRecEnc+"\r\n");

        if (headers.indexOf("\nReply-To:") > -1)
          headers = headers.replace(/\nReply-To: *.*\r\n/, "\nReply-To: "+newReplytoEnc+"\r\n");
        else if (headers.indexOf("\nreply-to:") > -1)
          headers = headers.replace(/\nreply-to: *.*\r\n/, "\nreply-to: "+newReplytoEnc+"\r\n");
        else { // header missing
          headers = headers+("Reply-To: "+newReplytoEnc+"\r\n");
          console.debug("Reply-To: missing");
        }

        if (headers.indexOf("\nMessage-ID:") > -1) {
          headers = headers.replace(/\nMessage-ID:\r\n/, "\nMessage-ID:"); // newline fix
          headers = headers.replace(/\nMessage-ID: *.*\r\n/, "\nMessage-ID: "+newHdr.mid+"\r\n");
        }
        else if (headers.indexOf("\nMessage-Id:") > -1) {
          headers = headers.replace(/\nMessage-Id:\r\n/, "\nMessage-Id:"); // newline fix
          headers = headers.replace(/\nMessage-Id: *.*\r\n/, "\nMessage-Id: "+newHdr.mid+"\r\n");
        }
        else if (headers.indexOf("\nMessage-id:") > -1) {
          headers = headers.replace(/\nMessage-id:\r\n/, "\nMessage-id:"); // newline fix
          headers = headers.replace(/\nMessage-id: *.*\r\n/, "\nMessage-id: "+newHdr.mid+"\r\n");
        }
        else if (newHdr.mid) { // header missing
          var newMid = (newHdr.mid.substring(0,1) == "<") ? newHdr.mid : "<"+newHdr.mid+">";
          headers = headers+("Message-ID: "+newMid+"\r\n");
        }

        if (newHdr.inreplyto != MsgUtils.getInReplyTo(rawReferences)) {
          newHdr.ref = newHdr.inreplyto;
          console.debug("In-Reply-To: changed, copy In-Reply-To: to References:");
        }

        if (headers.indexOf("\nIn-Reply-To:") > -1)
          headers = headers.replace(/\nIn-Reply-To: *.*\r\n/, "\nIn-Reply-To: "+newHdr.inreplyto+"\r\n");
        else if (headers.indexOf("\nin-reply-to:") > -1)
          headers = headers.replace(/\nin-reply-to: *.*\r\n/, "\nin-reply-to: "+newHdr.inreplyto+"\r\n");
        else { // header missing
          headers = headers+("In-Reply-To: "+newHdr.inreplyto+"\r\n");
          console.debug("In-Reply-To: missing");
        }

        if (headers.indexOf("\nReferences:") > -1)
          headers = headers.replace(/\nReferences: *.*\r\n/, "\nReferences: "+newHdr.ref+"\r\n");
        else if (headers.indexOf("\nreferences:") > -1)
          headers = headers.replace(/\nreferences: *.*\r\n/, "\nreferences: "+newHdr.ref+"\r\n");
        else { // header missing
          headers = headers+("References: "+newHdr.ref+"\r\n");
          console.debug("References: missing");
        }

        if (newHdr.ref === "") { // header removed
          headers = headers.replace(/\nIn-Reply-To: *.*\r\n/, "\nIn-Reply-To: \r\n");
          console.debug("References: removed, also remove In-Reply-To:");
        }

        // strips off characters added before the if-else_if-else series
        headers = headers.substring(1,headers.length-2);
        data = headers + data.substring(endHeaders);
        var action = "headerChanged";
      }

      // strips off some useless headers
      data = data.replace(/^From - .+\r\n/, "");
      data = data.replace(/X-Mozilla-Status.+\r\n/, "");
      data = data.replace(/X-Mozilla-Status2.+\r\n/, "");
      data = data.replace(/X-Mozilla-Keys.+\r\n/, "");

      if (HeaderToolsImpObj.prefs.getBoolPref("extensions.hdrtoolsimproved.add_htl_header")) {
        var now = new Date;
        var HTLhead = "X-HeaderToolsImproved: "+action+" - "+now.toString();
        HTLhead = HTLhead.replace(/\(.+\)/, "");
        HTLhead = HTLhead.substring(0,75);
        if (data.indexOf("\nX-HeaderToolsImproved: ") <0)
          data = data.replace("\r\n\r\n","\r\n"+HTLhead+"\r\n\r\n");
        else
          data = data.replace(/\nX-HeaderToolsImproved: .+\r\n/,"\n"+HTLhead+"\r\n");
      }

      if (! dateIsChanged && isImap && HeaderToolsImpObj.prefs.getBoolPref("extensions.hdrtoolsimproved.use_imap_fix")) {
        // Some IMAP providers (e.g. Gmail) will not register changes in the source when the main
        // headers are not changed. Modifying the "Date" field by one second works around this limit.
        var newDate = date.replace(/(\d{2}):(\d{2}):(\d{2})/, function (str, p1, p2, p3) {
          var z = parseInt(p3)+1;
          if (z > 59) z = 50; // cycle back 10 seconds at 59
          if (z < 10) z = "0"+z.toString();
          return p1+":"+p2+":"+z});
        data = data.replace(date,newDate);
      }

      // creates the temporary file, where the modified message body will be stored
      var tempFile = Components.classes["@mozilla.org/file/directory_service;1"].
        getService(Components.interfaces.nsIProperties).
        get("TmpD", Components.interfaces.nsIFile);
      tempFile.append("HT.eml");
      tempFile.createUnique(0,0o600);
      var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
        .createInstance(Components.interfaces.nsIFileOutputStream);
      foStream.init(tempFile, 2, 0x200, false); // open as "write only"
      foStream.write(data,data.length);
      foStream.close();

      var flags =  HeaderToolsImpObj.hdr.flags;
      var keys =  HeaderToolsImpObj.hdr.getStringProperty("keywords");

      HeaderToolsImpObj.list = [];
      HeaderToolsImpObj.list.push(HeaderToolsImpObj.hdr);

      // this is interesting: nsIMsgFolder.copyFileMessage seems to have a bug on Windows, when
      // the nsIFile has been already used by foStream (because of Windows lock system?), so we
      // must initialize another nsIFile object, pointing to the temporary file
      try {
        var fileSpec = Components.classes["@mozilla.org/file/local;1"]
          .createInstance(Components.interfaces.nsILocalFile);
      }
      catch(e) {
        var fileSpec = Components.classes["@mozilla.org/file/local;1"]
          .createInstance(Components.interfaces.nsIFile);
      }
      fileSpec.initWithPath(tempFile.path);
      var fol = HeaderToolsImpObj.hdr.folder;
      var extService = Components.classes['@mozilla.org/uriloader/external-helper-app-service;1']
        .getService(Components.interfaces.nsPIExternalAppLauncher)
      extService.deleteTemporaryFileOnExit(fileSpec); // function's name says all!!!
      HeaderToolsImpObj.noTrash = ! (HeaderToolsImpObj.prefs.getBoolPref("extensions.hdrtoolsimproved.putOriginalInTrash"))
      // Moved in copyListener.onStopCopy
      // HeaderToolsImpObj.folder.deleteMessages(HeaderToolsImpObj.list,null,noTrash,true,null,false);
      var cs = Components.classes["@mozilla.org/messenger/messagecopyservice;1"].getService(Components.interfaces.nsIMsgCopyService);
      var msgWindow = Services.wm.getMostRecentBrowserWindow().msgWindow;
      cs.copyFileMessage(fileSpec, fol, null, false, flags, keys, HeaderToolsImpObj.copyListener, msgWindow);
    },

    onDataAvailable : function (aRequest, aInputStream, aOffset, aCount) {
      var scriptStream = Components.classes["@mozilla.org/scriptableinputstream;1"].
            createInstance().QueryInterface(Components.interfaces.nsIScriptableInputStream);
      scriptStream.init(aInputStream);
      HeaderToolsImpObj.listener.text+=scriptStream.read(scriptStream.available());
     }
  },

  // copyFileMessage listener
  copyListener : {
    QueryInterface : function(iid) {
      if (iid.equals(Components.interfaces.nsIMsgCopyServiceListener) ||
      iid.equals(Components.interfaces.nsISupports))
      return this;

      throw Components.results.NS_NOINTERFACE;
      return 0;
    },
    GetMessageId: function (messageId) {},
    OnProgress: function (progress, progressMax) {},
    OnStartCopy: function () {},
    OnStopCopy: function (status) {
      if (status == 0) // copy done
        HeaderToolsImpObj.folder.deleteMessages(HeaderToolsImpObj.list,null,HeaderToolsImpObj.noTrash,true,null,false);
    },
    SetMessageKey: function (key) {
      // at this point, the message is already stored in local folders, but not yet in remote folders,
      // so for remote folders we use a folderListener
      if (HeaderToolsImpObj.folder.server.type == "imap" || HeaderToolsImpObj.folder.server.type == "news") {
        Components.classes["@mozilla.org/messenger/services/session;1"]
                  .getService(Components.interfaces.nsIMsgMailSession)
                  .AddFolderListener(HeaderToolsImpObj.folderListener, Components.interfaces.nsIFolderListener.all);
        HeaderToolsImpObj.folderListener.key = key;
        HeaderToolsImpObj.folderListener.URI = HeaderToolsImpObj.folder.URI;
      }
      else
        setTimeout(function() {HeaderToolsImpObj.postActions(key);}, 500);
    }
  },

  postActions : function(key) {
    gDBView.selectMsgByKey(key); // select message with modified headers/source
    var hdr = HeaderToolsImpObj.folder.GetMessageHeader(key);
    if (hdr.flags & 2)
      HeaderToolsImpObj.folder.addMessageDispositionState(hdr,0); //set replied if necessary
          if (hdr.flags & 4096)
      HeaderToolsImpObj.folder.addMessageDispositionState(hdr,1); //set fowarded if necessary
  },

  // used just for remote folders
  folderListener  : {
    OnItemAdded: function(parentItem, item, view) {
      try {
        var hdr = item.QueryInterface(Components.interfaces.nsIMsgDBHdr);
      }
      catch(e) {
                 return;
      }
      if (HeaderToolsImpObj.folderListener.key == hdr.messageKey && HeaderToolsImpObj.folderListener.URI == hdr.folder.URI) {
        HeaderToolsImpObj.postActions(HeaderToolsImpObj.folderListener.key);
        // we don't need anymore the folderListener
         Components.classes["@mozilla.org/messenger/services/session;1"]
                      .getService(Components.interfaces.nsIMsgMailSession)
                      .RemoveFolderListener(HeaderToolsImpObj.folderListener);
      }
    },
    OnItemRemoved: function(parentItem, item, view) {},
    OnItemPropertyChanged: function(item, property, oldValue, newValue) {},
    OnItemIntPropertyChanged: function(item, property, oldValue, newValue) {},
    OnItemBoolPropertyChanged: function(item, property, oldValue, newValue) {},
    OnItemUnicharPropertyChanged: function(item, property, oldValue, newValue){},
    OnItemPropertyFlagChanged: function(item, property, oldFlag, newFlag) {},
    OnItemEvent: function(folder, event) {}
  },

  showSettings : function() {
    window.openDialog("chrome://hdrtoolsimproved/content/settings.xhtml", "chrome");
  }
};
