# Since — see what changed while you were away (Built using AI)

Flarum tells a returning reader what is **new**. It says nothing about what **moved**.

A post you read last week that has since been rewritten sits exactly where it was, with the timestamp it always had, wearing core's "Edited" label — which says only *that* it was edited, not that it happened after you had read it. In a thread that settles something — a date, a price, a rule, a decision — that is the difference between having read the thread and knowing what it says.

Since is the missing half, and it runs entirely in the browser on data the page already has.

![A discussion with two posts edited since the reader last looked](https://raw.githubusercontent.com/ernestdefoe/since/main/screenshots/since-discussion.png)

## What people get

A strip in the discussion sidebar: who changed what, and when. Each line jumps to that post. It collapses past three and can be dismissed.

![The strip](https://raw.githubusercontent.com/ernestdefoe/since/main/screenshots/since-strip.png)

And a quiet mark on each post that changed after this reader had already read it:

![The mark on a post](https://raw.githubusercontent.com/ernestdefoe/since/main/screenshots/since-badge.png)

A post only counts if it is at or before the reader's read mark **and** was edited after their read time. A post edited before they last looked carries no mark — they saw it; it isn't news.

## How it works

The whole trick is a snapshot. Flarum `PATCH`es your read state as you scroll, which overwrites the very attributes this compares against — so reading a discussion destroys the record of what you had already read. Since captures the arriving values once per page load and then leaves them alone. A refresh legitimately loses the strip: you have now read those posts.

There is no backend to it. No tables, no settings, no migrations — `extend.php` registers a stylesheet, a bundle and a locale, and nothing else.

## What it deliberately does not do

- **Posts in the loaded stream only.** It issues no extra requests; a changed post a hundred replies further down and not loaded yet is not in the strip.
- **Signed-in members who have read the discussion before.** For anybody else the whole thread is new, which core's unread divider already says better.
- **It does not show you the diff.** It says a post moved and takes you to it.

## Install

```
composer require ernestdefoe/since
```

Enable it; there is nothing to configure.

- **GitHub:** https://github.com/ernestdefoe/since
- **Packagist:** https://packagist.org/packages/ernestdefoe/since
- **Support:** https://ernestdefoe.online/d/92
- **Licence:** MIT

Bug reports and ideas welcome — particularly from anyone running a theme that replaces `DiscussionPage`, since that is where the strip lives.
