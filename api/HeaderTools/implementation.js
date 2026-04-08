/* global Services, ExtensionCommon */

"use strict";

var { ExtensionUtils } = ChromeUtils.importESModule(
  "resource://gre/modules/ExtensionUtils.sys.mjs"
);
var { ExtensionError } = ExtensionUtils;

var HeaderTools = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      HeaderTools: {
        replaceMessage: async function (messageId, rawData, options = {}) {
          let deletePermanently = options.deletePermanently ?? true;

          // 1. Resolve WebExtension messageId to nsIMsgDBHdr.
          let msgHdr = context.extension.messageManager.get(messageId);
          if (!msgHdr) {
            throw new ExtensionError("Message not found: " + messageId);
          }
          let folder = msgHdr.folder;
          let flags = msgHdr.flags;
          let keywords = msgHdr.getStringProperty("keywords");

          // 2. Write raw data to a temp file.
          let tempFile = Services.dirsvc
            .get("TmpD", Ci.nsIFile);
          tempFile.append("HT.eml");
          tempFile.createUnique(0, 0o600);

          let foStream = Cc[
            "@mozilla.org/network/file-output-stream;1"
          ].createInstance(Ci.nsIFileOutputStream);
          foStream.init(tempFile, 2, 0x200, false); // write-only
          foStream.write(rawData, rawData.length);
          foStream.close();

          // 3. Create a second nsIFile pointing to the same path.
          //    Workaround: copyFileMessage has issues on Windows when the
          //    nsIFile was already used by the output stream.
          let fileSpec;
          try {
            fileSpec = Cc["@mozilla.org/file/local;1"].createInstance(
              Ci.nsILocalFile
            );
          } catch (e) {
            fileSpec = Cc["@mozilla.org/file/local;1"].createInstance(
              Ci.nsIFile
            );
          }
          fileSpec.initWithPath(tempFile.path);

          // 4. Register temp file for cleanup on exit.
          Cc["@mozilla.org/uriloader/external-helper-app-service;1"]
            .getService(Ci.nsPIExternalAppLauncher)
            .deleteTemporaryFileOnExit(fileSpec);

          // 5. Copy the modified message into the folder and handle
          //    deletion of the original, all wrapped in a Promise.
          // 5. Copy the modified message into the folder and handle
          //    deletion of the original, all wrapped in a Promise.
          return new Promise((resolve, reject) => {
            let newMessageKey = null;
            let copyDone = false;

            console.log("HeaderTools: starting copyFileMessage");

            // Post-copy actions: restore replied/forwarded disposition,
            // then resolve with the new WebExtension message ID.
            function postActions(key) {
              console.log("HeaderTools: postActions called with key", key);
              try {
                let newHdr = folder.GetMessageHeader(key);
                console.log("HeaderTools: got new header, flags:", newHdr.flags);
                if (newHdr.flags & 0x0010) {
                  folder.addMessageDispositionState(newHdr, 0);
                }
                if (newHdr.flags & 0x1000) {
                  folder.addMessageDispositionState(newHdr, 1);
                }
                let converted =
                  context.extension.messageManager.convert(newHdr);
                console.log("HeaderTools: converted message ID:", converted.id);
                resolve({ messageId: converted.id });
              } catch (e) {
                console.error("HeaderTools: postActions error:", e);
                reject(new ExtensionError("Post-actions failed: " + e));
              }
            }

            // Called when both setMessageKey and onStopCopy have
            // completed successfully. This ensures we run postActions
            // only after the copy is fully done and we have the key.
            function tryFinish() {
              if (newMessageKey !== null && copyDone) {
                console.log("HeaderTools: both setMessageKey and onStopCopy done, running postActions");
                postActions(newMessageKey);
              }
            }

            let copyListener = {
              QueryInterface: ChromeUtils.generateQI([
                "nsIMsgCopyServiceListener",
              ]),
              getMessageId() {},
              onProgress() {},
              onStartCopy() {
                console.log("HeaderTools: onStartCopy");
              },
              onStopCopy(status) {
                console.log("HeaderTools: onStopCopy, status:", status);
                if (status == 0) {
                  let list = [msgHdr];
                  folder.deleteMessages(
                    list,
                    null,
                    deletePermanently,
                    true,
                    null,
                    false
                  );
                  console.log("HeaderTools: original deleted");
                  let msgWindow =
                    Services.wm.getMostRecentBrowserWindow()?.msgWindow;
                  if (msgWindow) {
                    folder.updateFolder(msgWindow);
                  }
                  copyDone = true;
                  tryFinish();
                } else {
                  console.error("HeaderTools: copy failed, status:", status);
                  reject(
                    new ExtensionError(
                      "copyFileMessage failed with status: " + status
                    )
                  );
                }
              },
              setMessageKey(key) {
                console.log("HeaderTools: setMessageKey, key:", key, "folder type:", folder.server.type);
                newMessageKey = key;
                tryFinish();
              },
            };

            // 6. Perform the copy.
            try {
              let cs = Cc[
                "@mozilla.org/messenger/messagecopyservice;1"
              ].getService(Ci.nsIMsgCopyService);
              let msgWindow =
                Services.wm.getMostRecentBrowserWindow()?.msgWindow;
              console.log("HeaderTools: calling copyFileMessage, file:", fileSpec.path, "folder:", folder.URI);
              cs.copyFileMessage(
                fileSpec,
                folder,
                null,
                false,
                flags,
                keywords,
                copyListener,
                msgWindow
              );
              console.log("HeaderTools: copyFileMessage call returned");
            } catch (e) {
              console.error("HeaderTools: copyFileMessage threw:", e);
              reject(
                new ExtensionError("copyFileMessage threw: " + e)
              );
            }
          });
        },
      },
    };
  }
};
