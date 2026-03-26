import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class ScrapingAnt implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ScrapingAnt',
		name: 'scrapingAnt',
		icon: 'file:scrapingant.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Scrape websites and extract data using ScrapingAnt API',
		defaults: {
			name: 'ScrapingAnt',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'scrapingAntApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'AI Extract',
						value: 'aiExtract',
						description: 'Extract structured data from a webpage using AI',
						action: 'Extract data from a webpage using AI',
					},
					{
						name: 'Get Markdown',
						value: 'getMarkdown',
						description: 'Scrape a webpage and return its content as Markdown (LLM-ready)',
						action: 'Get a webpage as markdown',
					},
					{
						name: 'Get Usage',
						value: 'getUsage',
						description: 'Get API credit usage information',
						action: 'Get API credit usage',
					},
					{
						name: 'Scrape',
						value: 'scrape',
						description: 'Scrape a webpage and return its HTML content',
						action: 'Scrape a webpage',
					},
				],
				default: 'scrape',
			},

			// ------ Scrape parameters ------
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://example.com',
				description: 'The URL of the webpage to scrape',
				displayOptions: {
					show: {
						operation: ['scrape'],
					},
				},
			},
			{
				displayName: 'Browser Rendering',
				name: 'browser',
				type: 'boolean',
				default: true,
				description: 'Whether to use headless Chrome for rendering (costs 10 credits when enabled, 1 when disabled)',
				displayOptions: {
					show: {
						operation: ['scrape'],
					},
				},
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['scrape'],
					},
				},
				options: [
					{
						displayName: 'JavaScript Snippet',
						name: 'js_snippet',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Custom JavaScript code to execute on the page before returning the result (will be Base64-encoded automatically)',
					},
					{
						displayName: 'Proxy Country',
						name: 'proxy_country',
						type: 'string',
						default: '',
						placeholder: 'us',
						description: 'Two-letter country code for the proxy location (e.g. us, gb, de)',
					},
					{
						displayName: 'Proxy Type',
						name: 'proxy_type',
						type: 'options',
						options: [
							{
								name: 'Datacenter',
								value: 'datacenter',
							},
							{
								name: 'Residential',
								value: 'residential',
							},
						],
						default: 'datacenter',
						description: 'Type of proxy to use (residential costs 25 credits per request)',
					},
					{
						displayName: 'Return Page Source',
						name: 'return_page_source',
						type: 'boolean',
						default: false,
						description: 'Whether to return the raw page source instead of rendered HTML',
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						type: 'number',
						typeOptions: {
							minValue: 5,
							maxValue: 60,
						},
						default: 30,
						description: 'Request timeout in seconds (5-60)',
					},
				],
			},

			// ------ Get Markdown parameters ------
			{
				displayName: 'URL',
				name: 'markdownUrl',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://example.com',
				description: 'The URL of the webpage to convert to Markdown',
				displayOptions: {
					show: {
						operation: ['getMarkdown'],
					},
				},
			},
			{
				displayName: 'Additional Options',
				name: 'markdownOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['getMarkdown'],
					},
				},
				options: [
					{
						displayName: 'Browser Rendering',
						name: 'browser',
						type: 'boolean',
						default: true,
						description: 'Whether to use headless Chrome for rendering',
					},
					{
						displayName: 'Proxy Country',
						name: 'proxy_country',
						type: 'string',
						default: '',
						placeholder: 'us',
						description: 'Two-letter country code for the proxy location (e.g. us, gb, de)',
					},
					{
						displayName: 'Proxy Type',
						name: 'proxy_type',
						type: 'options',
						options: [
							{
								name: 'Datacenter',
								value: 'datacenter',
							},
							{
								name: 'Residential',
								value: 'residential',
							},
						],
						default: 'datacenter',
						description: 'Type of proxy to use (residential costs 25 credits per request)',
					},
				],
			},

			// ------ AI Extract parameters ------
			{
				displayName: 'URL',
				name: 'extractUrl',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://example.com/product',
				description: 'The URL of the webpage to extract data from',
				displayOptions: {
					show: {
						operation: ['aiExtract'],
					},
				},
			},
			{
				displayName: 'Extract Properties',
				name: 'extract_properties',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'product title, price, description',
				description: 'Comma-separated list of data properties to extract (e.g. "title, price, full description, reviews(list: review title, review content)")',
				displayOptions: {
					show: {
						operation: ['aiExtract'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'scrape') {
					const url = this.getNodeParameter('url', i) as string;
					const browser = this.getNodeParameter('browser', i) as boolean;
					const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

					const qs: IDataObject = {
						url,
						browser,
					};

					if (additionalOptions.proxy_type) {
						qs.proxy_type = additionalOptions.proxy_type;
					}
					if (additionalOptions.proxy_country) {
						qs.proxy_country = additionalOptions.proxy_country;
					}
					if (additionalOptions.return_page_source !== undefined) {
						qs.return_page_source = additionalOptions.return_page_source;
					}
					if (additionalOptions.js_snippet) {
						qs.js_snippet = Buffer.from(additionalOptions.js_snippet as string).toString('base64');
					}
					if (additionalOptions.timeout) {
						qs.timeout = additionalOptions.timeout;
					}

					const requestOptions: IHttpRequestOptions = {
						method: 'GET',
						url: 'https://api.scrapingant.com/v2/general',
						qs,
						encoding: 'text',
						json: false,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'scrapingAntApi',
						requestOptions,
					);

					returnData.push({
						json: {
							html: response as string,
						},
					});
				} else if (operation === 'getMarkdown') {
					const url = this.getNodeParameter('markdownUrl', i) as string;
					const markdownOptions = this.getNodeParameter('markdownOptions', i) as IDataObject;

					const qs: IDataObject = { url };

					if (markdownOptions.browser !== undefined) {
						qs.browser = markdownOptions.browser;
					}
					if (markdownOptions.proxy_type) {
						qs.proxy_type = markdownOptions.proxy_type;
					}
					if (markdownOptions.proxy_country) {
						qs.proxy_country = markdownOptions.proxy_country;
					}

					const requestOptions: IHttpRequestOptions = {
						method: 'GET',
						url: 'https://api.scrapingant.com/v2/markdown',
						qs,
						json: true,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'scrapingAntApi',
						requestOptions,
					);

					returnData.push({
						json: response as IDataObject,
					});
				} else if (operation === 'aiExtract') {
					const url = this.getNodeParameter('extractUrl', i) as string;
					const extractProperties = this.getNodeParameter('extract_properties', i) as string;

					const requestOptions: IHttpRequestOptions = {
						method: 'GET',
						url: 'https://api.scrapingant.com/v2/extract',
						qs: {
							url,
							extract_properties: extractProperties,
						},
						json: true,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'scrapingAntApi',
						requestOptions,
					);

					returnData.push({
						json: response as IDataObject,
					});
				} else if (operation === 'getUsage') {
					const requestOptions: IHttpRequestOptions = {
						method: 'GET',
						url: 'https://api.scrapingant.com/v2/usage',
						json: true,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'scrapingAntApi',
						requestOptions,
					);

					returnData.push({
						json: response as IDataObject,
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
