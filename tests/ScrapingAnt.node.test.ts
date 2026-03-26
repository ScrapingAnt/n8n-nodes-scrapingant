import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
} from 'n8n-workflow';
import { ScrapingAnt } from '../nodes/ScrapingAnt/ScrapingAnt.node';

const API_KEY = process.env.SCRAPINGANT_API_KEY || '';

function createMockExecuteFunctions(params: Record<string, unknown>): IExecuteFunctions {
	return {
		getInputData: () => [{ json: {} }],
		getNodeParameter: (name: string) => params[name],
		getNode: () => ({ name: 'ScrapingAnt', typeVersion: 1, type: 'n8n-nodes-scrapingant.scrapingAnt' }),
		continueOnFail: () => false,
		helpers: {
			httpRequestWithAuthentication: {
				call: async (_thisArg: unknown, _credType: string, options: IHttpRequestOptions) => {
					const url = new URL(options.url);
					const qs = options.qs as IDataObject;
					if (qs) {
						for (const [k, v] of Object.entries(qs)) {
							if (v !== undefined && v !== null) {
								url.searchParams.set(k, String(v));
							}
						}
					}
					url.searchParams.set('x-api-key', API_KEY);

					const response = await fetch(url.toString(), { method: options.method || 'GET' });

					if (!response.ok) {
						const body = await response.text();
						throw new Error(`HTTP ${response.status}: ${body}`);
					}

					if (options.json === false) {
						return await response.text();
					}
					return await response.json();
				},
			},
		},
	} as unknown as IExecuteFunctions;
}

const node = new ScrapingAnt();

describe('ScrapingAnt Node', () => {
	beforeAll(() => {
		if (!API_KEY) {
			throw new Error('SCRAPINGANT_API_KEY env var is required to run tests');
		}
	});

	describe('description', () => {
		it('should have correct metadata', () => {
			expect(node.description.name).toBe('scrapingAnt');
			expect(node.description.displayName).toBe('ScrapingAnt');
			expect(node.description.usableAsTool).toBe(true);
		});

		it('should have 4 operations', () => {
			const opParam = node.description.properties.find((p) => p.name === 'operation');
			expect(opParam).toBeDefined();
			const options = (opParam as { options: Array<{ value: string }> }).options;
			const values = options.map((o) => o.value);
			expect(values).toContain('scrape');
			expect(values).toContain('getMarkdown');
			expect(values).toContain('aiExtract');
			expect(values).toContain('getUsage');
		});
	});

	describe('getUsage', () => {
		it('should return credit usage information', async () => {
			const mockFn = createMockExecuteFunctions({ operation: 'getUsage' });
			const result: INodeExecutionData[][] = await node.execute.call(mockFn);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);

			const json = result[0][0].json;
			expect(json).toHaveProperty('plan_name');
			expect(json).toHaveProperty('remained_credits');
			expect(json).toHaveProperty('plan_total_credits');
			console.log('  Usage:', JSON.stringify(json, null, 2));
		});
	});

	describe('scrape', () => {
		it('should scrape a webpage and return HTML', async () => {
			const mockFn = createMockExecuteFunctions({
				operation: 'scrape',
				url: 'https://example.com',
				browser: false,
				additionalOptions: {},
			});
			const result = await node.execute.call(mockFn);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);

			const html = result[0][0].json.html as string;
			expect(html).toBeDefined();
			expect(html).toContain('Example Domain');
			console.log('  HTML length:', html.length);
		}, 30000);
	});

	describe('getMarkdown', () => {
		it('should return page content as markdown', async () => {
			const mockFn = createMockExecuteFunctions({
				operation: 'getMarkdown',
				markdownUrl: 'https://example.com',
				markdownOptions: {},
			});
			const result = await node.execute.call(mockFn);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);

			const json = result[0][0].json;
			expect(json).toHaveProperty('markdown');
			expect(typeof json.markdown).toBe('string');
			expect(json.markdown as string).toContain('Example Domain');
			console.log('  Markdown length:', (json.markdown as string).length);
		}, 30000);
	});

	describe('aiExtract', () => {
		it('should extract structured data from a webpage', async () => {
			const mockFn = createMockExecuteFunctions({
				operation: 'aiExtract',
				extractUrl: 'https://example.com',
				extract_properties: 'title, description',
			});
			const result = await node.execute.call(mockFn);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);

			const json = result[0][0].json;
			expect(json).toHaveProperty('title');
			console.log('  Extracted:', JSON.stringify(json, null, 2));
		}, 60000);
	});
});
