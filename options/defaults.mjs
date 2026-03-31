const PREF_DEFAULTS = {
  putOriginalInTrash: true,
  use_imap_fix: true,
  add_htl_header: false,
  fullsource_maxchars: 150000,
  edit_shortcut: "",
  editFS_shortcut: "",
};

export async function getPref(name) {
  let value = await browser.storage.local.get({ [name]: PREF_DEFAULTS[name] });
  return value[name];
}
