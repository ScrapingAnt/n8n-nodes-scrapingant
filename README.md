# n8n-nodes-scrapingant

[n8n](https://n8n.io/) community node for the [ScrapingAnt](https://scrapingant.com) web scraping API.

Scrape websites, convert pages to Markdown, extract structured data with AI, and monitor API usage — all from your n8n workflows. Works as an **AI Agent tool** out of the box.

## Installation

### In n8n Cloud / Desktop

1. Go to **Settings** > **Community Nodes**
2. Enter `n8n-nodes-scrapingant`
3. Click **Install**

### Self-hosted

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
| Browser Rendering | boolean | `true` | Use headless Chrome (10 credits when on, 1 when off) |
| Proxy Type | options | `datacenter` | `datacenter` or `residential` (25 credits) |
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

| Configuration | Credits per Request |
|---------------|-------------------|
| Browser rendering + datacenter proxy | 10 |
| No browser rendering | 1 |
| Residential proxy | 25 |
| Markdown output | 1 per 30 characters + base cost |
| AI extraction | Based on page + output size |

## Resources

- [ScrapingAnt Documentation](https://docs.scrapingant.com)
- [ScrapingAnt API Reference](https://docs.scrapingant.com/request-response-format)
- [Credit Cost Reference](https://docs.scrapingant.com/credits-cost)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
