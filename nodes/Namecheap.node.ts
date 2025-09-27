import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { NamecheapRequest } from './utils/namecheapRequest';

export class Namecheap implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Namecheap',
		name: 'namecheap',
		icon: 'file:namecheap.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Namecheap API for domain, DNS, SSL, and user management',
		defaults: {
			name: 'Namecheap',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'namecheapApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Domain',
						value: 'domain',
					},
					{
						name: 'DNS',
						value: 'dns',
					},
					{
						name: 'SSL',
						value: 'ssl',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'domain',
			},
			// Domain Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['domain'],
					},
				},
				options: [
					{
						name: 'Get List',
						value: 'getList',
						description: 'Get list of domains',
						action: 'Get list of domains',
					},
					{
						name: 'Get Info',
						value: 'getInfo',
						description: 'Get domain information',
						action: 'Get domain information',
					},
					{
						name: 'Renew',
						value: 'renew',
						description: 'Renew domain',
						action: 'Renew domain',
					},
				],
				default: 'getList',
			},
			// DNS Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['dns'],
					},
				},
				options: [
					{
						name: 'Get Hosts',
						value: 'getHosts',
						description: 'Get DNS records for domain',
						action: 'Get DNS records',
					},
					{
						name: 'Set Hosts',
						value: 'setHosts',
						description: 'Update DNS records for domain',
						action: 'Update DNS records',
					},
					{
						name: 'Set Custom DNS',
						value: 'setCustom',
						description: 'Set custom nameservers',
						action: 'Set custom nameservers',
					},
				],
				default: 'getHosts',
			},
			// SSL Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['ssl'],
					},
				},
				options: [
					{
						name: 'Get List',
						value: 'getList',
						description: 'Get list of SSL certificates',
						action: 'Get SSL certificates',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create new SSL certificate order',
						action: 'Create SSL certificate',
					},
				],
				default: 'getList',
			},
			// User Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Get Balances',
						value: 'getBalances',
						description: 'Get account balances',
						action: 'Get account balances',
					},
					{
						name: 'Get Pricing',
						value: 'getPricing',
						description: 'Get pricing information',
						action: 'Get pricing information',
					},
				],
				default: 'getBalances',
			},
			// Domain fields
			{
				displayName: 'Domain Name',
				name: 'domainName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['domain'],
						operation: ['getInfo', 'renew'],
					},
				},
				default: '',
				required: true,
				description: 'The domain name to get information for',
			},
			{
				displayName: 'Years',
				name: 'years',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['domain'],
						operation: ['renew'],
					},
				},
				default: 1,
				required: true,
				description: 'Number of years to renew the domain for',
			},
			// DNS fields
			{
				displayName: 'Domain Name',
				name: 'domainName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['dns'],
					},
				},
				default: '',
				required: true,
				description: 'The domain name to manage DNS for',
			},
			{
				displayName: 'DNS Records',
				name: 'dnsRecords',
				type: 'fixedCollection',
				displayOptions: {
					show: {
						resource: ['dns'],
						operation: ['setHosts'],
					},
				},
				default: {},
				options: [
					{
						name: 'records',
						displayName: 'Record',
						values: [
							{
								displayName: 'Hostname',
								name: 'hostname',
								type: 'string',
								default: '@',
								description: 'Hostname (use @ for root domain)',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{ name: 'A', value: 'A' },
									{ name: 'AAAA', value: 'AAAA' },
									{ name: 'CNAME', value: 'CNAME' },
									{ name: 'MX', value: 'MX' },
									{ name: 'TXT', value: 'TXT' },
									{ name: 'NS', value: 'NS' },
								],
								default: 'A',
							},
							{
								displayName: 'Address/Value',
								name: 'address',
								type: 'string',
								default: '',
								description: 'IP address or value for the record',
							},
							{
								displayName: 'Priority (MX only)',
								name: 'priority',
								type: 'number',
								default: 10,
								description: 'Priority for MX records',
							},
							{
								displayName: 'TTL',
								name: 'ttl',
								type: 'number',
								default: 1800,
								description: 'Time to live in seconds',
							},
						],
					},
				],
			},
			{
				displayName: 'Nameservers',
				name: 'nameservers',
				type: 'fixedCollection',
				displayOptions: {
					show: {
						resource: ['dns'],
						operation: ['setCustom'],
					},
				},
				default: {},
				options: [
					{
						name: 'servers',
						displayName: 'Nameserver',
						values: [
							{
								displayName: 'Nameserver',
								name: 'nameserver',
								type: 'string',
								default: '',
								description: 'Nameserver address',
							},
						],
					},
				],
			},
			// SSL fields
			{
				displayName: 'Domain Name',
				name: 'domainName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['ssl'],
						operation: ['create'],
					},
				},
				default: '',
				required: true,
				description: 'Domain name for SSL certificate',
			},
			{
				displayName: 'Years',
				name: 'years',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['ssl'],
						operation: ['create'],
					},
				},
				default: 1,
				required: true,
				description: 'Number of years for SSL certificate',
			},
			// User fields
			{
				displayName: 'Product Type',
				name: 'productType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['getPricing'],
					},
				},
				options: [
					{ name: 'DOMAIN', value: 'DOMAIN' },
					{ name: 'SSLCERTIFICATE', value: 'SSLCERTIFICATE' },
					{ name: 'WHOISGUARD', value: 'WHOISGUARD' },
				],
				default: 'DOMAIN',
			},
			{
				displayName: 'Action Name',
				name: 'actionName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['getPricing'],
					},
				},
				default: '',
				description: 'Specific action name for pricing (optional)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				const credentials = await this.getCredentials('namecheapApi');
				const namecheapRequest = new NamecheapRequest(this, credentials);

				let response;

				switch (resource) {
					case 'domain':
						response = await Namecheap.handleDomainOperations(this, namecheapRequest, operation, itemIndex);
						break;
					case 'dns':
						response = await Namecheap.handleDnsOperations(this, namecheapRequest, operation, itemIndex);
						break;
					case 'ssl':
						response = await Namecheap.handleSslOperations(this, namecheapRequest, operation, itemIndex);
						break;
					case 'user':
						response = await Namecheap.handleUserOperations(this, namecheapRequest, operation, itemIndex);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}

				if (response.success) {
					returnData.push({
						json: response.data,
						pairedItem: { item: itemIndex },
					});
				} else {
					throw new NodeOperationError(this.getNode(), `API Error: ${response.errors?.join(', ')}`);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: itemIndex },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}

	private static async handleDomainOperations(
		executeFunctions: IExecuteFunctions,
		namecheapRequest: NamecheapRequest,
		operation: string,
		itemIndex: number,
	) {
		switch (operation) {
			case 'getList':
				return await namecheapRequest.getDomains();
			case 'getInfo':
				const domainName = executeFunctions.getNodeParameter('domainName', itemIndex) as string;
				return await namecheapRequest.getDomainInfo(domainName);
			case 'renew':
				const renewDomain = executeFunctions.getNodeParameter('domainName', itemIndex) as string;
				const years = executeFunctions.getNodeParameter('years', itemIndex) as number;
				return await namecheapRequest.execute({
					command: 'namecheap.domains.renew',
					parameters: {
						DomainName: renewDomain,
						Years: years,
					},
				});
			default:
				throw new NodeOperationError(executeFunctions.getNode(), `Unknown domain operation: ${operation}`);
		}
	}

	private static async handleDnsOperations(
		executeFunctions: IExecuteFunctions,
		namecheapRequest: NamecheapRequest,
		operation: string,
		itemIndex: number,
	) {
		const domainName = executeFunctions.getNodeParameter('domainName', itemIndex) as string;

		switch (operation) {
			case 'getHosts':
				return await namecheapRequest.getDnsHosts(domainName);
			case 'setHosts':
				const dnsRecords = executeFunctions.getNodeParameter('dnsRecords', itemIndex) as any;
				const records = dnsRecords.records || [];
				return await namecheapRequest.setDnsHosts(domainName, records);
			case 'setCustom':
				const nameservers = executeFunctions.getNodeParameter('nameservers', itemIndex) as any;
				const servers = nameservers.servers || [];
				const serverList = servers.map((s: any) => s.nameserver).filter(Boolean);
				return await namecheapRequest.setCustomDns(domainName, serverList);
			default:
				throw new NodeOperationError(executeFunctions.getNode(), `Unknown DNS operation: ${operation}`);
		}
	}

	private static async handleSslOperations(
		executeFunctions: IExecuteFunctions,
		namecheapRequest: NamecheapRequest,
		operation: string,
		itemIndex: number,
	) {
		switch (operation) {
			case 'getList':
				return await namecheapRequest.getSslList();
			case 'create':
				const domainName = executeFunctions.getNodeParameter('domainName', itemIndex) as string;
				const years = executeFunctions.getNodeParameter('years', itemIndex) as number;
				return await namecheapRequest.execute({
					command: 'namecheap.ssl.create',
					parameters: {
						DomainName: domainName,
						Years: years,
					},
				});
			default:
				throw new NodeOperationError(executeFunctions.getNode(), `Unknown SSL operation: ${operation}`);
		}
	}

	private static async handleUserOperations(
		executeFunctions: IExecuteFunctions,
		namecheapRequest: NamecheapRequest,
		operation: string,
		itemIndex: number,
	) {
		switch (operation) {
			case 'getBalances':
				return await namecheapRequest.getBalances();
			case 'getPricing':
				const productType = executeFunctions.getNodeParameter('productType', itemIndex) as string;
				const actionName = executeFunctions.getNodeParameter('actionName', itemIndex) as string;
				return await namecheapRequest.getPricing(productType, actionName);
			default:
				throw new NodeOperationError(executeFunctions.getNode(), `Unknown user operation: ${operation}`);
		}
	}
}
