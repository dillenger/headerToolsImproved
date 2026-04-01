import { getPref } from "../options/defaults.mjs";

// Get the raw message as a File object, preserving the original bytes.
export async function getRawFile(messageId) {
  return messenger.messages.getRaw(messageId, { data_format: "File" });
}

// Forces all newlines to CRLF, making the message RFC2822 compliant.
// This also fixes problems with IMAP servers that don't accept mixed newlines.
export function cleanCRLF(data) {
  return data
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "\r\n");
}

// RFC 2047 encode a header value using messengerUtilities.encodeMimeHeader().
// Returns the first encoded string from the result array.
export async function encodeHeader(name, value) {
  let encoded = await messenger.messengerUtilities.encodeMimeHeader(
    name,
    value,
  );
  return encoded[0];
}

// Add or update the X-HeaderToolsImproved stamp in the raw message.
export function addHTLHeader(data, action) {
  let now = new Date();
  let stamp = now.toString().replace(/\(.+\)/, "");
  let htlHead = "X-HeaderToolsImproved: " + action + " - " + stamp;
  htlHead = htlHead.substring(0, 75);
  if (data.indexOf("\nX-HeaderToolsImproved: ") < 0)
    data = data.replace("\r\n\r\n", "\r\n" + htlHead + "\r\n\r\n");
  else
    data = data.replace(
      /\nX-HeaderToolsImproved: .+\r\n/,
      "\n" + htlHead + "\r\n",
    );
  return data;
}

// Some IMAP providers (e.g. Gmail) will not register changes in the source when
// the main headers are not changed. Modifying the Date seconds by one works
// around this.
export function applyImapFix(data, origDate) {
  let newDate = origDate.replace(
    /(\d{2}):(\d{2}):(\d{2})/,
    function (str, p1, p2, p3) {
      let z = parseInt(p3) + 1;
      if (z > 59) z = 50; // cycle back 10 seconds at 59
      if (z < 10) z = "0" + z.toString();
      return p1 + ":" + p2 + ":" + z;
    },
  );
  return data.replace(origDate, newDate);
}

// Extract the original Date header string from the raw message source.
export function getOrigDate(raw) {
  let end = raw.search(/\r?\n\r?\n/);
  let headers = raw.substring(0, end);
  let splitted = null;
  if (headers.indexOf("\nDate:") > -1) splitted = headers.split("\nDate:");
  else if (headers.indexOf("\ndate:") > -1) splitted = headers.split("\ndate:");
  if (splitted) {
    let date = splitted[1].split("\n")[0];
    return date.replace(/ +$/, "").replace(/^ +/, "");
  }
  return "";
}

// Replace a message with a modified version. The new message is first imported
// into a local Trash folder (needed because messages.import() does not work
// reliably with IMAP), then moved to the original folder.
export async function replaceMessage(messageId, newMsgFile) {
  let origHeader = await messenger.messages.get(messageId);

  // Find a local account Trash folder to use as staging area.
  let localAccount = (await messenger.accounts.list(false)).find(
    (a) => a.type == "none",
  );
  if (!localAccount)
    throw new Error("No local account found for message staging");

  let localFolders = await messenger.folders.getSubFolders(localAccount, false);
  let trashFolder =
    localFolders.find((f) => f.type == "trash") ||
    localFolders.find((f) => f.name == "Trash");
  if (!trashFolder)
    trashFolder = await messenger.folders.create(localAccount, "Trash");

  // If the Trash already contains a message with the same Message-ID (from a
  // previous edit), delete it first, as messages.import() rejects duplicates.
  let dupes = await messenger.messages.query({
    folder: trashFolder,
    headerMessageId: origHeader.headerMessageId,
  });
  if (dupes.messages.length > 0)
    await messenger.messages.delete(
      dupes.messages.map((m) => m.id),
      true,
    );

  let newHeader = await messenger.messages.import(newMsgFile, trashFolder, {
    flagged: origHeader.flagged,
    read: origHeader.read,
    tags: origHeader.tags,
  });

  if (!newHeader) return false;

  // If the message already lives in the local Trash, no move needed.
  let destFolder = origHeader.folder;
  let finalHeader;

  if (
    trashFolder.accountId == destFolder.accountId &&
    trashFolder.path == destFolder.path
  ) {
    finalHeader = newHeader;
  } else {
    // Move new message from local Trash to the original folder and poll
    // until it shows up there.
    finalHeader = await new Promise((resolve, reject) => {
      let attempts = 0;
      let checkFolder = async () => {
        let page = await messenger.messages.query({
          folder: destFolder,
          headerMessageId: newHeader.headerMessageId,
        });
        do {
          for (let msg of page.messages) {
            if (
              msg.headerMessageId == newHeader.headerMessageId &&
              msg.id != origHeader.id
            ) {
              resolve(msg);
              return;
            }
          }
          if (page.id) page = await messenger.messages.continueList(page.id);
          else page = null;
        } while (page && page.messages.length > 0);

        if (++attempts > 20)
          reject(new Error("Message not found in destination after move"));
        else window.setTimeout(checkFolder, 500);
      };
      messenger.messages.move([newHeader.id], destFolder);
      checkFolder();
    });
  }

  if (!finalHeader) return false;

  // Delete the original message. Without deletePermanently, the message
  // is moved to the account's own Trash folder.
  let deletePermanently = !(await getPref("putOriginalInTrash"));
  await messenger.messages.delete([origHeader.id], { deletePermanently });

  return finalHeader;
}
