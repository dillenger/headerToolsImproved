# header_tools_improved

This extension allows the user to change (edit) messages in any folder.

This is an improved version of Header Tools Lite by Paolo Kaosmos.

A save & restart button was added to the options page, right-click context menus were fixed throughout the add-on, UTF-8 encoded Reply-To headers are decoded properly.

The editing features (changing the headers only or the entire source of a message) are accessible from the menu "Message" -> "Header Tools Improved" or from the context menu in the message panel.

The edit source function should be used with caution, because an error could cause problems in displaying all messages in a folder. Moreover, it could work not properly with some characters and some encodings.

Options for the extension:

- Put the original message to the Trash (default = true): the changes are made by creating a copy of the original message. This option controls whether the original message goes to the Trash folder, or is deleted.

- Forcing changes with IMAP accounts (default = true): some IMAP servers, such as Gmail, do not accept changes if some basic headers (date, sender, the message id, object) are not modified . With this option enabled, the changes are forced by changing the date of the message by 1 second.

- Add the header X-HeaderToolsImproved (default = false): by enabling this option, every change (edit) adds a header that describes the type of change and its time and date.

- Set the maximum number of characters initially displayed when editing the full source (default = 150000).

- The default keyboard shortcuts have not been set, you can set these yourself.
