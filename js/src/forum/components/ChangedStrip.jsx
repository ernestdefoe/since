import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Icon from 'flarum/common/components/Icon';
import username from 'flarum/common/helpers/username';
import humanTime from 'flarum/common/helpers/humanTime';

/**
 * 🚨 Flarum 2 has NO `helpers/icon` — icons are the `Icon` component now. The
 * import resolved to undefined and the call became "f(...) is not a function"
 * inside a view, which does not fail politely: Mithril stopped rendering and
 * the discussion page came up with zero posts in it. Proved by toggling the
 * extension — 6 posts off, 0 posts on.
 *
 * "Three posts changed while you were away."
 *
 * Flarum already tells a returning reader what is NEW. It says nothing about
 * what MOVED — a post they read last week that has since been rewritten looks
 * exactly like one they have read. This is the missing half.
 *
 * Deliberately a list of links rather than a count: a count tells you something
 * happened, a list lets you go and read it, which is the only thing anybody
 * wanted from the count.
 */
export default class ChangedStrip extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.expanded = this.attrs.posts.length <= 3;
    this.dismissed = false;
  }

  view() {
    if (this.dismissed) return null;

    const posts = this.attrs.posts;
    const shown = this.expanded ? posts : posts.slice(0, 3);

    return (
      <section className="Since-strip" aria-label={app.translator.trans('ernestdefoe-since.forum.strip.title', { count: posts.length })}>
        <header className="Since-strip-header">
          <Icon name="fas fa-clock-rotate-left" className="Since-strip-icon" />
          <span className="Since-strip-title">{app.translator.trans('ernestdefoe-since.forum.strip.title', { count: posts.length })}</span>
          <Button
            className="Button Button--link Since-strip-dismiss"
            icon="fas fa-times"
            aria-label={app.translator.trans('ernestdefoe-since.forum.strip.dismiss')}
            onclick={() => {
              this.dismissed = true;
            }}
          />
        </header>

        <ul className="Since-strip-list">
          {shown.map((post) => (
            <li key={post.id()}>
              <a
                href={app.route.discussion(post.discussion(), post.number())}
                className="Since-strip-item"
                onclick={(e) => {
                  e.preventDefault();
                  m.route.set(app.route.discussion(post.discussion(), post.number()));
                }}
              >
                <span className="Since-strip-who">{post.user() ? username(post.user()) : app.translator.trans('ernestdefoe-since.forum.strip.someone')}</span>
                <span className="Since-strip-when">
                  {app.translator.trans('ernestdefoe-since.forum.strip.edited', { time: humanTime(post.editedAt()) })}
                </span>
              </a>
            </li>
          ))}
        </ul>

        {posts.length > shown.length ? (
          <Button className="Button Button--link Since-strip-more" onclick={() => (this.expanded = true)}>
            {app.translator.trans('ernestdefoe-since.forum.strip.show_all', { count: posts.length })}
          </Button>
        ) : null}
      </section>
    );
  }
}
