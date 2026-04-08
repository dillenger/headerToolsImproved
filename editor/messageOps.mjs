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

// Replace a message with a modified version using the HeaderTools experiment
// API, which calls nsIMsgCopyService.copyFileMessage() internally.
export async function replaceMessage(messageId, newMsgFile) {
  // Convert File to binary string (Latin-1 preserves all byte values 1:1).
  let buffer = await newMsgFile.arrayBuffer();
  let rawData = new TextDecoder("latin1").decode(buffer);

  let deletePermanently = !(await getPref("putOriginalInTrash"));
  let result = await messenger.HeaderTools.replaceMessage(
    messageId,
    rawData,
    { deletePermanently },
  );

  if (!result) return false;
  return messenger.messages.get(result.messageId);
}
