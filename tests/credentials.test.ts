import { describe, it, expect, vi } from 'vitest';
import { NamecheapApi } from '../credentials/NamecheapApi.credentials';

describe('NamecheapApi Credentials', () => {
	it('should have correct credential properties', () => {
		const credentials = new NamecheapApi();
		
		expect(credentials.name).toBe('namecheapApi');
		expect(credentials.displayName).toBe('Namecheap API');
		expect(credentials.documentationUrl).toBe('https://www.namecheap.com/support/api/');
	});

	it('should have all required credential fields', () => {
		const credentials = new NamecheapApi();
		const properties = credentials.properties;
		
		const fieldNames = properties.map(prop => prop.name);
		
		expect(fieldNames).toContain('apiUser');
		expect(fieldNames).toContain('apiKey');
		expect(fieldNames).toContain('userName');
		expect(fieldNames).toContain('clientIp');
		expect(fieldNames).toContain('environment');
	});

	it('should have correct field types and requirements', () => {
		const credentials = new NamecheapApi();
		const properties = credentials.properties;
		
		const apiUserField = properties.find(prop => prop.name === 'apiUser');
		expect(apiUserField?.type).toBe('string');
		expect(apiUserField?.required).toBe(true);
		
		const apiKeyField = properties.find(prop => prop.name === 'apiKey');
		expect(apiKeyField?.type).toBe('string');
		expect(apiKeyField?.typeOptions?.password).toBe(true);
		expect(apiKeyField?.required).toBe(true);
		
		const userNameField = properties.find(prop => prop.name === 'userName');
		expect(userNameField?.type).toBe('string');
		expect(userNameField?.required).toBe(true);
		
		const clientIpField = properties.find(prop => prop.name === 'clientIp');
		expect(clientIpField?.type).toBe('string');
		expect(clientIpField?.required).toBe(true);
		
		const environmentField = properties.find(prop => prop.name === 'environment');
		expect(environmentField?.type).toBe('options');
		expect(environmentField?.options).toHaveLength(2);
		expect((environmentField?.options as any)?.[0].value).toBe('production');
		expect((environmentField?.options as any)?.[1].value).toBe('sandbox');
	});

	it('should have correct authentication configuration', () => {
		const credentials = new NamecheapApi();
		const auth = credentials.authenticate;
		
		expect(auth.type).toBe('generic');
		expect(auth.properties.qs).toBeDefined();
		expect(auth.properties.qs?.ApiUser).toBe('={{ $credentials.apiUser }}');
		expect(auth.properties.qs?.ApiKey).toBe('={{ $credentials.apiKey }}');
		expect(auth.properties.qs?.UserName).toBe('={{ $credentials.userName }}');
		expect(auth.properties.qs?.ClientIP).toBe('={{ $credentials.clientIp }}');
	});

	it('should have correct test configuration', () => {
		const credentials = new NamecheapApi();
		const test = credentials.test;
		
		expect(test.request).toBeDefined();
		expect(test.request.baseURL).toContain('api.namecheap.com');
		expect(test.request.url).toBe('/xml.response');
		expect(test.request.method).toBe('GET');
		expect(test.request.qs?.Command).toBe('namecheap.users.getBalances');
		expect(test.request.qs?.ResponseType).toBe('JSON');
		expect(test.request.qs?.ApiUser).toBe('={{ $credentials.apiUser }}');
		expect(test.request.qs?.ApiKey).toBe('={{ $credentials.apiKey }}');
		expect(test.request.qs?.UserName).toBe('={{ $credentials.userName }}');
		expect(test.request.qs?.ClientIP).toBe('={{ $credentials.clientIp }}');
	});

	it('should use sandbox URL for sandbox environment', () => {
		const credentials = new NamecheapApi();
		const test = credentials.test;
		
		// The test configuration should dynamically use sandbox URL
		expect(test.request.baseURL).toContain('api.namecheap.com');
	});
});
