import app from 'flarum/forum/app';

/**
 * Where the reader was when they arrived.
 *
 * 🚨 This has to be captured the moment a discussion loads and then left alone.
 * Flarum PATCHes `lastReadPostNumber` as you scroll, which updates the very
 * model attributes this extension compares against — so reading the discussion
 * destroys the record of what you had already read. By the time the reader has
 * scrolled past the first screen, `lastReadAt` is *now* and nothing looks edited
 * any more.
 *
 * Snapshotted per discussion, per page load. A refresh legitimately loses it:
 * you have now read those posts, and they are not news a second time.
 */
const snapshots = new Map();

export function capture(discussion) {
  if (!discussion || snapshots.has(discussion.id())) return snapshots.get(discussion.id());

  const at = discussion.lastReadAt?.();
  const number = discussion.lastReadPostNumber?.();

  const snapshot = {
    // A discussion nobody has read has nothing to be "since" — everything in it
    // is new, which core's own unread divider already says better than we could.
    hasVisited: !!at && !!number,
    at: at ? new Date(at).getTime() : null,
    number: number || 0,
  };

  snapshots.set(discussion.id(), snapshot);

  return snapshot;
}

/**
 * 🚨 Captures on first ask rather than trusting a page hook.
 *
 * The first cut captured in `DiscussionPage.oninit`, which meant every check
 * depended on that one hook having run — and when it did not, nothing was ever
 * marked and there was no error to explain why. Themes replace page components;
 * hooks are not a contract.
 *
 * Capturing lazily is just as safe. The read state in the store only moves when
 * the scroll PATCH comes back, which is after the first render — so the first
 * question anybody asks still gets the pre-visit answer.
 */
export function snapshotFor(discussion) {
  if (!discussion) return undefined;

  return snapshots.get(discussion.id()) || capture(discussion);
}

/**
 * Did this post change after the reader had already read it?
 *
 * Both halves matter. `editedAt` alone would flag every edited post in the
 * thread, including ones edited long before they ever visited; the post number
 * is what limits it to what they actually saw.
 */
export function editedSinceRead(post, snapshot) {
  if (!snapshot?.hasVisited || !post) return false;

  const editedAt = post.editedAt?.();

  if (!editedAt) return false;

  const number = post.number?.();

  if (!number || number > snapshot.number) return false;

  return new Date(editedAt).getTime() > snapshot.at;
}

/** Every post in the loaded stream that changed under the reader. */
export function changedPosts(discussion) {
  const snapshot = snapshotFor(discussion);

  if (!snapshot?.hasVisited) return [];

  return (discussion.posts() || [])
    .filter((post) => post && post.contentType?.() === 'comment')
    .filter((post) => editedSinceRead(post, snapshot));
}

export function currentUser() {
  return app.session.user;
}
