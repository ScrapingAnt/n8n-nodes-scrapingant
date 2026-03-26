# n8n-nodes-scrapingant

[n8n](https://n8n.io/) community node for the [ScrapingAnt](https://scrapingant.com) web scraping API.

Scrape websites, convert pages to Markdown, extract structured data with AI, and monitor API usage — all from your n8n workflows. Works as an **AI Agent tool** out of the box.

## Installation

### n8n Cloud / Desktop

1. Open any workflow and click **+** (or press **N**) to open the nodes panel
2. Search for **ScrapingAnt**
3. Look for the **"More from the community"** section at the bottom of the results
4. Click the **ScrapingAnt** node and hit **Install**

> **Note:** Only verified community nodes are available on n8n Cloud. If ScrapingAnt does not appear yet, it may still be pending verification.

### Self-hosted

Install from the n8n UI: **Settings** > **Community Nodes** > enter `n8n-nodes-scrapingant` > **Install**

Or via npm:

```bash
npm install n8n-nodes-scrapingant
```

## Credentials

1. Sign up at [app.scrapingant.com](https://app.scrapingant.com)
2. Copy your API key from the dashboard
3. In n8n: **Credentials** > **Add Credential** > **ScrapingAnt API**
4. Paste your API key and save

The credential is validated automatically against the ScrapingAnt API.

## Operations

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| **Scrape** | `/v2/general` | Scrape a webpage and return raw HTML. Supports headless Chrome, datacenter/residential proxies, custom JS snippets, and country targeting. |
| **Get Markdown** | `/v2/markdown` | Convert a webpage to clean Markdown — optimized for LLM and RAG pipelines. |
| **AI Extract** | `/v2/extract` | Extract structured data from any page using natural language. Describe what you need (e.g., `"title, price, reviews"`) and get back JSON. |
| **Get Usage** | `/v2/usage` | Check your plan name, total credits, remaining credits, and billing period. |

### Scrape Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| URL | string | — | Target webpage URL (required) |
| Browser Rendering | boolean | `true` | Use headless Chrome for JavaScript rendering |
| Proxy Type | options | `datacenter` | `datacenter` or `residential` |
| Proxy Country | string | — | Two-letter country code (e.g., `us`, `gb`, `de`) |
| Return Page Source | boolean | `false` | Return raw page source instead of rendered HTML |
| JavaScript Snippet | string | — | Custom JS to execute on the page before returning (auto Base64-encoded) |
| Timeout | number | `30` | Request timeout in seconds (5–60) |

### Get Markdown Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| URL | string | — | Target webpage URL (required) |
| Browser Rendering | boolean | `true` | Use headless Chrome |
| Proxy Type | options | `datacenter` | `datacenter` or `residential` |
| Proxy Country | string | — | Two-letter country code |

### AI Extract Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| URL | string | Target webpage URL (required) |
| Extract Properties | string | Comma-separated list of properties to extract (required). Supports nested structures, e.g., `"title, price(number), reviews(list: author, text)"` |

## AI Agent Tool

This node has `usableAsTool` enabled, so it can be connected directly to the **n8n AI Agent** node. The agent can autonomously scrape pages, extract data, and check usage.

## Credit Costs

Credit costs vary by operation, rendering mode, and proxy type. See the [official credit cost reference](https://docs.scrapingant.com/credits-cost) for current pricing.

## Resources

- [ScrapingAnt Documentation](https://docs.scrapingant.com)
- [ScrapingAnt API Reference](https://docs.scrapingant.com/request-response-format)
- [Credit Cost Reference](https://docs.scrapingant.com/credits-cost)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
