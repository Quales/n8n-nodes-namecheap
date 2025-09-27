import { IExecuteFunctions, IHttpRequestOptions, NodeOperationError } from 'n8n-workflow';
import { parseString } from 'xml2js';

export interface NamecheapApiResponse {
	success: boolean;
	errors?: string[];
	data?: any;
}

export interface NamecheapRequestOptions {
	command: string;
	parameters?: Record<string, any>;
	responseType?: 'JSON' | 'XML';
}

export class NamecheapRequest {
	private executeFunctions: IExecuteFunctions;
	private credentials: any;

	constructor(executeFunctions: IExecuteFunctions, credentials: any) {
		this.executeFunctions = executeFunctions;
		this.credentials = credentials;
	}

	private getBaseUrl(): string {
		return this.credentials.environment === 'sandbox'
			? 'https://api.sandbox.namecheap.com'
			: 'https://api.namecheap.com';
	}

	private async parseXmlResponse(xmlData: string): Promise<any> {
		return new Promise((resolve, reject) => {
			parseString(xmlData, { explicitArray: false, mergeAttrs: true }, (err, result) => {
				if (err) {
					reject(new NodeOperationError(this.executeFunctions.getNode(), `Failed to parse XML response: ${err.message}`));
				} else {
					resolve(result);
				}
			});
		});
	}

	private async makeRequest(options: NamecheapRequestOptions, retryCount = 0): Promise<NamecheapApiResponse> {
		const maxRetries = 3;
		const baseDelay = 1000; // 1 second

		try {
			console.log("base url", this.getBaseUrl());
			const requestOptions: IHttpRequestOptions = {
				method: 'GET',
				url: `${this.getBaseUrl()}/xml.response`,
				qs: {
					ApiUser: this.credentials.apiUser,
					ApiKey: this.credentials.apiKey,
					UserName: this.credentials.userName,
					ClientIP: this.credentials.clientIp,
					Command: options.command,
					ResponseType: options.responseType || 'JSON',
					...options.parameters,
				},
			};

			const response = await this.executeFunctions.helpers.httpRequest(requestOptions);

			// Handle XML response
			if (options.responseType === 'XML' || typeof response === 'string') {
				const xmlData = typeof response === 'string' ? response : JSON.stringify(response);
				const parsedData = await this.parseXmlResponse(xmlData);

				// Extract the main response data
				const apiResponse = parsedData.ApiResponse || parsedData;
				console.log(apiResponse);
				console.log(apiResponse.Errors?.Error)
				const status = apiResponse.Status || apiResponse.Status;
				const errors = apiResponse.Errors?.Error || [];

				return {
					success: status === 'OK',
					errors: Array.isArray(errors) ? errors : errors ? [errors] : [],
					data: apiResponse.CommandResponse || apiResponse,
				};
			}

			// Handle JSON response
			return {
				success: response.ApiResponse?.Status === 'OK',
				errors: response.ApiResponse?.Errors?.Error || [],
				data: response.ApiResponse?.CommandResponse || response,
			};

		} catch (error: any) {
			// Handle rate limiting (429) and other retryable errors
			if (error.statusCode === 429 || (error.statusCode >= 500 && error.statusCode < 600)) {
				if (retryCount < maxRetries) {
					const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
					await new Promise(resolve => setTimeout(resolve, delay));
					return this.makeRequest(options, retryCount + 1);
				}
			}

			throw new NodeOperationError(
				this.executeFunctions.getNode(),
				`Namecheap API request failed: ${error.message}`
			);
		}
	}

	async execute(options: NamecheapRequestOptions): Promise<NamecheapApiResponse> {
		return this.makeRequest(options);
	}

	// Helper methods for common operations
	async getDomains(): Promise<NamecheapApiResponse> {
		return this.execute({
			command: 'namecheap.domains.getList',
			parameters: {
				PageSize: 100,
				SortBy: 'NAME',
			},
		});
	}

	async getDomainInfo(domain: string): Promise<NamecheapApiResponse> {
		return this.execute({
			command: 'namecheap.domains.getInfo',
			parameters: {
				DomainName: domain,
			},
		});
	}

	async getDnsHosts(domain: string): Promise<NamecheapApiResponse> {
		return this.execute({
			command: 'namecheap.domains.dns.getHosts',
			parameters: {
				DomainName: domain,
			},
		});
	}

	async setDnsHosts(domain: string, hosts: any[]): Promise<NamecheapApiResponse> {
		return this.execute({
			command: 'namecheap.domains.dns.setHosts',
			parameters: {
				DomainName: domain,
				...this.formatDnsHosts(hosts),
			},
		});
	}

	async setCustomDns(domain: string, nameservers: string[]): Promise<NamecheapApiResponse> {
		return this.execute({
			command: 'namecheap.domains.dns.setCustom',
			parameters: {
				DomainName: domain,
				Nameservers: nameservers.join(','),
			},
		});
	}

	async getSslList(): Promise<NamecheapApiResponse> {
		return this.execute({
			command: 'namecheap.ssl.getList',
		});
	}

	async getBalances(): Promise<NamecheapApiResponse> {
		return this.execute({
			command: 'namecheap.users.getBalances',
		});
	}

	async getPricing(productType?: string, actionName?: string): Promise<NamecheapApiResponse> {
		return this.execute({
			command: 'namecheap.users.getPricing',
			parameters: {
				...(productType && { ProductType: productType }),
				...(actionName && { ActionName: actionName }),
			},
		});
	}

	private formatDnsHosts(hosts: any[]): Record<string, any> {
		const result: Record<string, any> = {};

		hosts.forEach((host, index) => {
			result[`HostName${index + 1}`] = host.hostname || host.name || '@';
			result[`RecordType${index + 1}`] = host.type || host.recordType;
			result[`Address${index + 1}`] = host.address || host.value;
			result[`MXPref${index + 1}`] = host.priority || host.mxPref || '10';
			result[`TTL${index + 1}`] = host.ttl || '1800';
		});

		return result;
	}
}
