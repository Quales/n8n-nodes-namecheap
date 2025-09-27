# n8n-nodes-namecheap

This package contains n8n community nodes for Namecheap API integration. [n8n](https://n8n.io/) is a extendable workflow automation tool.

[n8n's community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

The node uses the following credentials. You can find information about how to obtain them at [Namecheap API Documentation](https://www.namecheap.com/support/api/).

### Namecheap API

- **API User**: Your Namecheap API username
- **API Key**: Your Namecheap API key
- **Username**: Your Namecheap account username
- **Client IP**: Your whitelisted IP address for API access
- **Environment**: Choose between Production or Sandbox

## Supported Operations

### Domain Management
- **Get List**: Retrieve all domains in your account
- **Get Info**: Get detailed information about a specific domain
- **Renew**: Renew a domain for specified years

### DNS Management
- **Get Hosts**: Retrieve DNS records for a domain
- **Set Hosts**: Update DNS records for a domain
- **Set Custom DNS**: Configure custom nameservers

### SSL Certificate Management
- **Get List**: List all SSL certificates
- **Create**: Create new SSL certificate orders

### User/Account Management
- **Get Balances**: Check account balances
- **Get Pricing**: Get pricing information for products

## Example Workflows

### Update DNS Record
1. Add a Namecheap node
2. Select "DNS" resource and "Set Hosts" operation
3. Configure domain name and DNS records
4. Execute to update DNS settings

### Get Domain Information
1. Add a Namecheap node
2. Select "Domain" resource and "Get Info" operation
3. Enter the domain name
4. Execute to retrieve domain details

### Check Account Balance
1. Add a Namecheap node
2. Select "User" resource and "Get Balances" operation
3. Execute to check account balance

## Features

- **XML to JSON Conversion**: Automatically converts Namecheap's XML responses to JSON
- **Retry Logic**: Handles rate limiting with exponential backoff
- **Error Handling**: Comprehensive error handling with detailed messages
- **Sandbox Support**: Test with Namecheap's sandbox environment
- **Type Safety**: Full TypeScript support with proper typing

## Development

### Prerequisites
- Node.js >= 20.15
- npm or yarn

### Setup
```bash
npm install
```

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Lint
```bash
npm run lint
```

## License

[MIT](https://github.com/n8n-io/n8n-nodes-namecheap/blob/master/LICENSE.md)