import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NamecheapApi implements ICredentialType {
	name = 'namecheapApi';
	displayName = 'Namecheap API';

	documentationUrl = 'https://www.namecheap.com/support/api/';

	properties: INodeProperties[] = [
		{
			displayName: 'API User',
			name: 'apiUser',
			type: 'string',
			default: '',
			description: 'Your Namecheap API username',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your Namecheap API key',
			required: true,
		},
		{
			displayName: 'Username',
			name: 'userName',
			type: 'string',
			default: '',
			description: 'Your Namecheap account username',
			required: true,
		},
		{
			displayName: 'Client IP',
			name: 'clientIp',
			type: 'string',
			default: '',
			description: 'Your whitelisted IP address for API access',
			required: true,
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Sandbox',
					value: 'sandbox',
				},
			],
			default: 'production',
			description: 'API environment to use',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				ApiUser: '={{ $credentials.apiUser }}',
				ApiKey: '={{ $credentials.apiKey }}',
				UserName: '={{ $credentials.userName }}',
				ClientIP: '={{ $credentials.clientIp }}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ $credentials.environment === "sandbox" ? "https://api.sandbox.namecheap.com" : "https://api.namecheap.com" }}',
			url: '/xml.response',
			method: 'GET',
			qs: {
				ApiUser: '={{ $credentials.apiUser }}',
				ApiKey: '={{ $credentials.apiKey }}',
				UserName: '={{ $credentials.userName }}',
				ClientIP: '={{ $credentials.clientIp }}',
				Command: 'namecheap.users.getBalances',
				ResponseType: 'JSON',
			},
		},
	};
}
