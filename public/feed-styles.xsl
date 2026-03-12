<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  exclude-result-prefixes="atom content">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <!-- RSS 2.0 -->
  <xsl:template match="/rss">
    <html lang="en">
      <xsl:call-template name="head">
        <xsl:with-param name="title" select="channel/title" />
      </xsl:call-template>
      <body>
        <xsl:call-template name="styles" />
        <main>
          <header>
            <h1><xsl:value-of select="channel/title" /></h1>
            <p class="subtitle"><xsl:value-of select="channel/description" /></p>
            <xsl:call-template name="feed-notice" />
          </header>
          <section>
            <h2>Recent Articles</h2>
            <xsl:for-each select="channel/item">
              <article>
                <h3>
                  <a>
                    <xsl:attribute name="href"><xsl:value-of select="link" /></xsl:attribute>
                    <xsl:value-of select="title" />
                  </a>
                </h3>
                <xsl:if test="description">
                  <p class="description"><xsl:value-of select="description" /></p>
                </xsl:if>
                <time><xsl:value-of select="pubDate" /></time>
              </article>
            </xsl:for-each>
          </section>
        </main>
      </body>
    </html>
  </xsl:template>

  <!-- Atom 1.0 -->
  <xsl:template match="/atom:feed">
    <html lang="en">
      <xsl:call-template name="head">
        <xsl:with-param name="title" select="atom:title" />
      </xsl:call-template>
      <body>
        <xsl:call-template name="styles" />
        <main>
          <header>
            <h1><xsl:value-of select="atom:title" /></h1>
            <p class="subtitle"><xsl:value-of select="atom:subtitle" /></p>
            <xsl:call-template name="feed-notice" />
          </header>
          <section>
            <h2>Recent Articles</h2>
            <xsl:for-each select="atom:entry">
              <article>
                <h3>
                  <a>
                    <xsl:attribute name="href"><xsl:value-of select="atom:link[@rel='alternate']/@href" /></xsl:attribute>
                    <xsl:value-of select="atom:title" />
                  </a>
                </h3>
                <xsl:if test="atom:summary">
                  <p class="description"><xsl:value-of select="atom:summary" /></p>
                </xsl:if>
                <time><xsl:value-of select="atom:published" /></time>
              </article>
            </xsl:for-each>
          </section>
        </main>
      </body>
    </html>
  </xsl:template>

  <xsl:template name="head">
    <xsl:param name="title" />
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title><xsl:value-of select="$title" /> — Feed</title>
    </head>
  </xsl:template>

  <xsl:template name="feed-notice">
    <div class="notice">
      <p>
        <strong>This is a web feed</strong>, also known as an RSS or Atom feed.
        Subscribe by copying the URL into your feed reader.
      </p>
      <p>
        New to feeds? Visit
        <a href="https://aboutfeeds.com/">About Feeds</a>
        to learn more.
      </p>
      <div class="feed-links">
        <a href="/feed.xml">RSS</a>
        <a href="/atom.xml">Atom</a>
        <a href="/feed.json">JSON</a>
      </div>
    </div>
  </xsl:template>

  <xsl:template name="styles">
    <style>
      :root {
        --bg: #111115;
        --fg: #fafafa;
        --muted: #888;
        --border: #2a2a2e;
        --accent: #c4b5fd;
      }

      @media (prefers-color-scheme: light) {
        :root {
          --bg: #fafafa;
          --fg: #111115;
          --muted: #666;
          --border: #e5e5e5;
          --accent: #7c3aed;
        }
      }

      * { margin: 0; padding: 0; box-sizing: border-box; }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: var(--bg);
        color: var(--fg);
        line-height: 1.6;
        max-width: 680px;
        margin: 0 auto;
        padding: 3rem 1.5rem;
      }

      header { margin-bottom: 2.5rem; }

      h1 {
        font-size: 1.75rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        margin-bottom: 0.25rem;
      }

      .subtitle {
        color: var(--muted);
        font-size: 0.95rem;
      }

      .notice {
        margin-top: 1.5rem;
        padding: 1rem 1.25rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 0.875rem;
        color: var(--muted);
      }

      .notice strong { color: var(--fg); }

      .notice p + p { margin-top: 0.5rem; }

      .notice a {
        color: var(--accent);
        text-decoration: none;
      }

      .notice a:hover { text-decoration: underline; }

      .feed-links {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.75rem;
      }

      .feed-links a {
        padding: 0.25rem 0.75rem;
        border: 1px solid var(--border);
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--fg);
        text-decoration: none;
        transition: border-color 0.15s;
      }

      .feed-links a:hover { border-color: var(--accent); }

      h2 {
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
        margin-bottom: 1rem;
      }

      section article {
        padding: 1rem 0;
        border-bottom: 1px solid var(--border);
      }

      section article:last-child { border-bottom: none; }

      h3 {
        font-size: 1rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
      }

      h3 a {
        color: var(--fg);
        text-decoration: none;
      }

      h3 a:hover { color: var(--accent); }

      .description {
        color: var(--muted);
        font-size: 0.875rem;
        margin-bottom: 0.25rem;
      }

      time {
        color: var(--muted);
        font-size: 0.8rem;
      }
    </style>
  </xsl:template>
</xsl:stylesheet>
