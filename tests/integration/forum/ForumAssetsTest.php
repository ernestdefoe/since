<?php

namespace ErnestDefoe\Since\Tests\integration\forum;

use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * Since is all front end: it reads read state and edit times core already
 * serves. What the server must get right is shipping it — a stylesheet that
 * fails to compile takes the whole forum down, not just the strip.
 */
class ForumAssetsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('ernestdefoe-since');
    }

    /**
     * The forum page, and the compiled assets it links to.
     *
     * @return array<string, string> asset contents, keyed by file name
     */
    private function forum(string ...$files): array
    {
        $response = $this->send($this->request('GET', '/'));

        $this->assertSame(200, $response->getStatusCode(), 'The forum renders with Since enabled');

        $disk = $this->app()->getContainer()->make('filesystem')->disk('flarum-assets');
        $assets = [];

        foreach ($files as $file) {
            $this->assertMatchesRegularExpression('~/assets/'.preg_quote($file).'\?v=~', (string) $response->getBody(), "The forum page links $file");
            $assets[$file] = (string) $disk->get($file);
        }

        return $assets;
    }

    #[Test]
    public function the_stylesheet_compiles_into_the_forum_css()
    {
        $css = $this->forum('forum.css')['forum.css'];

        $this->assertStringContainsString('.Since-strip', $css);
        $this->assertStringContainsString('.Since-badge', $css);
    }

    #[Test]
    public function the_script_ships_with_the_forum()
    {
        $js = $this->forum('forum.js')['forum.js'];

        $this->assertStringContainsString('initializers.add("ernestdefoe-since"', $js);
    }
}
