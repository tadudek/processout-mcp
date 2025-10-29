# ProcessOut MCP Server

A Model Context Protocol (MCP) server that provides access to the ProcessOut payment orchestrator API. This server enables AI assistants and other MCP-compatible clients to interact with ProcessOut's comprehensive payment processing capabilities.

## ⚠️ Beta Status

**This MCP server is currently in BETA**

- Features may change without notice
- API compatibility is not guaranteed between versions
- Use in production environments at your own risk
- Feedback and bug reports are welcome

## 🚀 Key Features

- **MCP Server for ProcessOut Payment Orchestrator API** - Direct access to ProcessOut's payment processing infrastructure
- **Basic Authentication** - Secure access using `BASIC_USERNAME_SEC0` and `BASIC_PASSWORD_SEC0` environment variables
- **Operational APIs** - Focused on essential payment operations (fetch invoices, manage payouts, process transactions)
- **Web Server Support** - HTTP-based communication with Server-Sent Events (SSE)

## 📋 Available API Endpoints

### Invoice Management
- **`create-an-invoice`** - Create payment invoices with detailed item information, customer data, and payment settings
- **`fetch-an-invoice`** - Retrieve invoice details, status, and payment information
- **`delete-an-invoice`** - Delete invoices that haven't had payments started
- **`void-an-invoice`** - Void invoices (with optional partial void amounts)
- **`refund-an-invoice`** - Process refunds with reason codes and metadata

### Customer Management
- **`creating-a-customer`** - Create customer profiles with personal information, addresses, and contact details
- **`fetching-a-customer`** - Retrieve customer information and profile data
- **`updating-a-customer`** - Update customer details and information
- **`deleting-a-customer`** - Remove customer records from the system
- **`listing-a-customer-transactions`** - Get transaction history for specific customers
- **`listing-a-customer-tokens`** - Retrieve payment tokens associated with customers
- **`fetching-a-token`** - Get detailed information about specific payment tokens
- **`deleting-a-token`** - Remove payment tokens from customer accounts

### Transaction Processing
- **`fetching-a-transaction`** - Retrieve detailed transaction information and status
- **`pay-to-card`** - Send money to payment methods (cards or customer tokens)
- **`fetch-a-token-balance`** - Check available balances for payment tokens

### Payout Management
- **`listing-payouts`** - Get list of all payouts with filtering options
- **`fetching-a-payout`** - Retrieve detailed payout information
- **`deleting-payout`** - Cancel or delete payout transactions
- **`listing-payout-items`** - Get detailed breakdown of payout items

### Reporting & Analytics
- **`fetching-report`** - Download and access transaction reports
- **`deleting-uploaded-report`** - Remove uploaded reports from the system

## 🔧 Installation & Configuration

### Prerequisites
- Node.js 20.0.0 or higher
- ProcessOut API credentials

### Installation
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the web server
npm run start:web
```

### Environment Configuration
Create a `.env` file with your ProcessOut credentials:

```bash
# Required: ProcessOut API credentials
BASIC_USERNAME_SEC0=proj_your_project_id
BASIC_PASSWORD_SEC0=your_api_key
```

### MCP Client Configuration
For MCP clients like Cursor, add to your MCP configuration:

```json
{
  "mcpServers": {
      "processout": {
          "type": "sse",
          "url": "http://localhost:3000/sse",
          "env": {
            "BASIC_USERNAME_SEC0": "proj_your_project_id",
            "BASIC_PASSWORD_SEC0": "your_api_key"
        }
      }
  }
}
```

## 🌐 Web Server Features

The server supports HTTP-based communication:

### HTTP Endpoints
- **`GET /health`** - Health check endpoint
- **`GET /sse`** - Server-Sent Events connection for real-time communication
- **`POST /api/messages`** - Send MCP messages to the server
- **`GET /*`** - Static file serving for web clients

## 🛠️ Development

### Project Structure
```
processout-mcp/
├── mcp-server/           # Main MCP server implementation
│   ├── src/
│   │   ├── index.ts      # Server entry point with all API endpoints
│   │   └── web-server.ts  # HTTP/SSE transport implementation
│   ├── build/            # Compiled JavaScript
│   └── package.json      # Dependencies and scripts
├── open-api-specs/       # ProcessOut OpenAPI specification
└── README.md
```

## 📚 API Documentation

This server is auto-generated from ProcessOut's OpenAPI specification and provides access to their comprehensive payment processing API. For detailed API documentation, refer to [ProcessOut's official documentation](https://docs.processout.com/).
