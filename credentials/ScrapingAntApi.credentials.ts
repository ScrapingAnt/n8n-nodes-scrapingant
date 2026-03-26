import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ScrapingAntApi implements ICredentialType {
	name = 'scrapingAntApi';

	displayName = 'ScrapingAnt API';

	icon = { light: 'file:../nodes/ScrapingAnt/scrapingant.svg', dark: 'file:../nodes/ScrapingAnt/scrapingant.svg' } as const;

	documentationUrl = 'https://docs.scrapingant.com';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your ScrapingAnt API key from <a href="https://app.scrapingant.com" target="_blank">app.scrapingant.com</a>',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.scrapingant.com',
			url: '/v2/usage',
			method: 'GET',
		},
	};
}
