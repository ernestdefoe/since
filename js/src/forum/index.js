import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';

import { snapshotFor, editedSinceRead, changedPosts } from './baseline';
import { stampActiveTheme } from './themes';
import ChangedStrip from './components/ChangedStrip';

/*
 * 🚨 Every extend() here names a module PATH, not an imported component.
 *
 * Importing the component compiles to a registry lookup that runs at BOOT. A
 * component that is code-split — CommentPost is — is not in the registry yet,
 * so the lookup returns undefined and `extend(undefined.prototype, …)` throws
 * inside the initializer. That does not break this extension, it breaks the
 * whole forum bundle: the discussion page rendered with ZERO posts and no error
 * anybody would connect to Since. Proved by toggling the extension: 6 posts
 * disabled, 0 enabled.
 *
 * The string form defers the lookup until the chunk is loaded.
 */
app.initializers.add('ernestdefoe-since', () => {
  // Marks <html> when a theme Since can match is the one actually running, so
  // the stylesheet can adopt that theme's tokens. See themes.js.
  stampActiveTheme();

  /*
   * The strip: "3 posts changed while you were away".
   *
   * 🚨 `sidebarItems`, and that is the only hook DiscussionPage offers for this
   * — it has `sidebar()`, `hero()` and `sidebarItems()`, and NO `items()`. An
   * extend() against a method that does not exist fails silently, which is
   * exactly how this spent a round rendering nothing.
   *
   * The baseline is captured on first ask (see baseline.js), so nothing here
   * depends on a page lifecycle hook having run.
   */
  extend('flarum/forum/components/DiscussionPage', 'sidebarItems', function (items) {
    /*
     * 🚨 Wrapped, because this runs inside a render.
     *
     * An exception thrown here does not fail politely — Mithril stops rendering
     * the page and the reader gets a discussion with no posts in it at all.
     * That is a far worse failure than missing a strip, and it is exactly what
     * happened: the post author is not always loaded on every post in the
     * stream, and one throw took the whole page down.
     */
    try {
      const changed = changedPosts(this.discussion);

      if (!changed.length) return;

      items.add('since', <ChangedStrip discussion={this.discussion} posts={changed} />, 100);
    } catch (e) {
      console.error('[since] strip failed, leaving the page alone:', e);
    }
  });

  /* And the mark on each post that changed. */
  extend('flarum/forum/components/Post', 'elementAttrs', function (attrs) {
    const post = this.attrs.post;
    const snapshot = snapshotFor(post?.discussion?.());

    if (editedSinceRead(post, snapshot)) {
      attrs.className = `${attrs.className || ''} Since-changed`;
    }
  });

  /*
   * 🚨 `headerItems` lives on CommentPost, not Post. Post itself offers only
   * `elementAttrs` and `footerItems` — extending a name the class does not have
   * is a no-op with no error, so the badge simply never appeared.
   */
  extend('flarum/forum/components/CommentPost', 'headerItems', function (items) {
    const post = this.attrs.post;

    let snapshot;

    try {
      snapshot = snapshotFor(post?.discussion?.());
    } catch (e) {
      return;
    }

    if (!editedSinceRead(post, snapshot)) return;

    items.add(
      'since-changed',
      <span className="Since-badge" title={app.translator.trans('ernestdefoe-since.forum.post.changed_help')}>
        {app.translator.trans('ernestdefoe-since.forum.post.changed')}
      </span>,
      // After the edited marker core already shows, which says *that* it was
      // edited but not that it happened behind this reader's back.
      5
    );
  });
});
