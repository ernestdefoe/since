/**
 * Which theme is actually running.
 *
 * Since draws one panel, and a panel that ignores the theme around it looks
 * like a bolt-on. Themes that expose their own design tokens can be matched
 * exactly — but only when that theme is the one the reader is actually seeing.
 *
 * 🚨 The test is "is this theme's JavaScript in the bundle", not "are its CSS
 * variables present". Bespoke injects its `:root` block server-side on every
 * request, so on a forum running Wardrobe — where each member picks a theme —
 * a member reading in a different theme is still served Bespoke's variables,
 * and a check for those would dress this strip in the wrong theme's radius and
 * surface. `flarum.extensions` holds only what was compiled into the bundle
 * this page is running, which under Wardrobe is the chosen theme and no other.
 */
const INTEGRATIONS = {
  'ernestdefoe-bespoke': 'bespoke',
};

export function stampActiveTheme() {
  try {
    const loaded = (typeof flarum !== 'undefined' && flarum.extensions) || {};

    for (const id of Object.keys(INTEGRATIONS)) {
      if (id in loaded) {
        document.documentElement.setAttribute('data-since-theme', INTEGRATIONS[id]);

        return INTEGRATIONS[id];
      }
    }
  } catch (e) {
    // A missing attribute costs the strip its theme polish. Nothing else in
    // the extension depends on it, and a throw here would run before every
    // extender below it.
    console.error('[since] could not detect the active theme:', e);
  }

  return null;
}
