import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NamecheapRequest } from '../nodes/utils/namecheapRequest';

// Mock n8n-workflow
vi.mock('n8n-workflow', () => ({
	NodeOperationError: class extends Error {
		constructor(node: any, message: string, options?: any) {
			super(message);
			this.name = 'NodeOperationError';
		}
	},
}));

// Mock xml2js
vi.mock('xml2js', () => ({
	parseString: vi.fn((xml, options, callback) => {
		// Mock successful XML parsing
		callback(null, {
			ApiResponse: {
				$: { Status: 'OK' },
				CommandResponse: {
					DomainGetListResult: {
						Domain: [
							{ $: { Name: 'example.com' } }
						]
					}
				}
			}
		});
	})
}));

describe('NamecheapRequest', () => {
	let mockExecuteFunctions: any;
	let mockCredentials: any;
	let namecheapRequest: NamecheapRequest;

	beforeEach(() => {
		mockCredentials = {
			apiUser: 'testuser',
			apiKey: 'testkey',
			userName: 'testuser',
			clientIp: '127.0.0.1',
			environment: 'sandbox'
		};

		mockExecuteFunctions = {
			helpers: {
				httpRequest: vi.fn()
			},
			getNode: vi.fn(() => ({ name: 'test-node' }))
		};

		namecheapRequest = new NamecheapRequest(mockExecuteFunctions, mockCredentials);
	});

	describe('getDomains', () => {
		it('should call the correct API endpoint', async () => {
			const mockResponse = {
				ApiResponse: {
					$: { Status: 'OK' },
					CommandResponse: {
						DomainGetListResult: {
							Domain: [
								{ $: { Name: 'example.com' } }
							]
						}
					}
				}
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await namecheapRequest.getDomains();

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					url: 'https://api.sandbox.namecheap.com/xml.response',
					qs: expect.objectContaining({
						ApiUser: 'testuser',
						ApiKey: 'testkey',
						UserName: 'testuser',
						ClientIP: '127.0.0.1',
						Command: 'namecheap.domains.getList',
						ResponseType: 'JSON',
						PageSize: 100,
						SortBy: 'NAME'
					})
				})
			);

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
		});
	});

	describe('getDomainInfo', () => {
		it('should call the correct API endpoint with domain name', async () => {
			const mockResponse = {
				ApiResponse: {
					$: { Status: 'OK' },
					CommandResponse: {
						DomainGetInfoResult: {
							$: { Name: 'example.com' }
						}
					}
				}
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await namecheapRequest.getDomainInfo('example.com');

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					qs: expect.objectContaining({
						Command: 'namecheap.domains.getInfo',
						DomainName: 'example.com'
					})
				})
			);

			expect(result.success).toBe(true);
		});
	});

	describe('getDnsHosts', () => {
		it('should call the correct API endpoint for DNS hosts', async () => {
			const mockResponse = {
				ApiResponse: {
					$: { Status: 'OK' },
					CommandResponse: {
						DomainDNSGetHostsResult: {
							Host: [
								{ $: { Name: '@', Type: 'A', Address: '192.168.1.1' } }
							]
						}
					}
				}
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await namecheapRequest.getDnsHosts('example.com');

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					qs: expect.objectContaining({
						Command: 'namecheap.domains.dns.getHosts',
						DomainName: 'example.com'
					})
				})
			);

			expect(result.success).toBe(true);
		});
	});

	describe('setDnsHosts', () => {
		it('should format DNS hosts correctly', async () => {
			const mockResponse = {
				ApiResponse: {
					$: { Status: 'OK' },
					CommandResponse: {
						DomainDNSSetHostsResult: {
							$: { IsSuccess: 'true' }
						}
					}
				}
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const hosts = [
				{
					hostname: '@',
					type: 'A',
					address: '192.168.1.1',
					ttl: 1800
				},
				{
					hostname: 'www',
					type: 'CNAME',
					address: 'example.com',
					ttl: 1800
				}
			];

			const result = await namecheapRequest.setDnsHosts('example.com', hosts);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					qs: expect.objectContaining({
						Command: 'namecheap.domains.dns.setHosts',
						DomainName: 'example.com',
						HostName1: '@',
						RecordType1: 'A',
						Address1: '192.168.1.1',
						TTL1: 1800,
						HostName2: 'www',
						RecordType2: 'CNAME',
						Address2: 'example.com',
						TTL2: 1800
					})
				})
			);

			expect(result.success).toBe(true);
		});
	});

	describe('getBalances', () => {
		it('should call the correct API endpoint for balances', async () => {
			const mockResponse = {
				ApiResponse: {
					$: { Status: 'OK' },
					CommandResponse: {
						UserGetBalancesResult: {
							$: { AccountBalance: '100.00' }
						}
					}
				}
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await namecheapRequest.getBalances();

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					qs: expect.objectContaining({
						Command: 'namecheap.users.getBalances'
					})
				})
			);

			expect(result.success).toBe(true);
		});
	});

	describe('error handling', () => {
		it('should handle API errors correctly', async () => {
			const mockResponse = {
				ApiResponse: {
					$: { Status: 'ERROR' },
					Errors: {
						Error: 'Invalid API key'
					}
				}
			};

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await namecheapRequest.getDomains();

			expect(result.success).toBe(false);
			expect(result.errors).toContain('Invalid API key');
		});

		it('should handle network errors with retry logic', async () => {
			const networkError = new Error('Network error');
			(networkError as any).statusCode = 500;

			mockExecuteFunctions.helpers.httpRequest
				.mockRejectedValueOnce(networkError)
				.mockRejectedValueOnce(networkError)
				.mockResolvedValue({
					ApiResponse: {
						$: { Status: 'OK' },
						CommandResponse: {}
					}
				});

			const result = await namecheapRequest.getDomains();

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledTimes(3);
			expect(result.success).toBe(true);
		});
	});
});
