#!/usr/bin/env node
/**
 * MCP Server generated from OpenAPI spec for processout-api v1.0.3
 * Generated on: 2025-10-23T15:21:53.764Z
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
  type CallToolResult,
  type CallToolRequest
} from "@modelcontextprotocol/sdk/types.js";
import { setupWebServer } from "./web-server.js";

import { z, ZodError } from 'zod';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';

/**
 * Type definition for JSON objects
 */
type JsonObject = Record<string, any>;

/**
 * Interface for MCP Tool Definition
 */
interface McpToolDefinition {
    name: string;
    description: string;
    inputSchema: any;
    method: string;
    pathTemplate: string;
    executionParameters: { name: string, in: string }[];
    requestBodyContentType?: string;
    securityRequirements: any[];
}

/**
 * Server configuration
 */
export const SERVER_NAME = "processout-api";
export const SERVER_VERSION = "1.0.3";
export const API_BASE_URL = "https://api.processout.com";

/**
 * MCP Server instance
 */
const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
);

/**
 * Map of tool definitions by name
 */
const toolDefinitionMap: Map<string, McpToolDefinition> = new Map([

  ["create-an-invoice", {
    name: "create-an-invoice",
    description: `Create an invoice`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"requestBody":{"type":"object","required":["name","amount","currency"],"properties":{"name":{"type":"string","description":"Name of the invoice (often an internal ID code from the merchant’s systems)."},"amount":{"type":"string","description":"Amount to be paid. Maximum 4 decimal places supported as per ISO 4217."},"tax":{"type":"object","description":"Tax information for the invoice.","properties":{"amount":{"type":"string","description":"Amount is zero or a positive number representing the tax included in the amount."},"rate":{"type":"string","description":"Rate is a percentage (0 to 100) representing the rate of tax included in the amount."}}},"currency":{"type":"string","description":"Currency for payment of the invoice, in ISO 4217 format (for example, USD). Must be a valid ISO 4217 currency code with 3 characters"},"order_id":{"type":"string","description":"Your unique identifier for the order associated with this invoice. This field is displayed in the Dashboard and ProcessOut uses it to deduplicate invoices and transactions."},"customer_id":{"type":"string","description":"**_Resource expandable_**<br>Customer linked to the invoice (generally the one making the purchase)."},"verification":{"type":"boolean","description":"Tags an invoice to be used as an verification invoice. When this is set to true, we will attempt to automatically utilise the lowest amount applicable for a given PSP & Currency. Otherwise, we will default to utilising the invoice amount provided."},"expires_at":{"type":"string","description":"Expiry date for the invoice","format":"date"},"auto_capture_at":{"type":"string","description":"Optional if you want us to auto capture for you. Expected value is a date and time in ISO 8601 format.","format":"date"},"details":{"type":"object","description":"Details of the items or products that are being purchased.","required":["name","amount"],"properties":{"name":{"type":"string","description":"Name of the item or product, which represents an item on a receipt.<br>_Maximum 80 characters long_"},"amount":{"type":"string","description":"Amount charged for this item or product."},"type":{"type":"string","description":"Item or product type. Set this to anything suitable.<br>_Maximum 30 characters long_"},"quantity":{"type":"number","description":"Quantity of the item or product. Default value is 0.","format":"int32"},"metadata":{"type":"object","description":"Metadata related to the invoice detail, in the form of key-value pairs (string - string).","properties":{}},"category":{"type":"string","description":"Category of the item or product. Can be `food`, `entertainment`, `home`, `appliance`, `bidding`, `gift`, `technology`, `media`, `communication`, `health`, `sport`, `personal-service`, `professional-service`, `clothing`, `travel`, `tickets`, `transport` or `other`."},"reference":{"type":"string","description":"Reference of the item or product.<br>_Maximum 255 characters long_"},"description":{"type":"string","description":"Description of the item or product.<br>_Maximum 255 characters long_"},"brand":{"type":"string","description":"Brand of the item or product.<br>_Maximum 80 characters long_"},"model":{"type":"string","description":"Model of the item or product.<br>_Maximum 80 characters long_"},"discount_amount":{"type":"string","description":"Discount amount (when the discount is listed as a separate item on a receipt)."},"condition":{"type":"string","description":"Condition of the product. Can be `new`, `refurbished`, `used` or `other`."},"marketplace_merchant":{"type":"string","description":"Marketplace merchant ID of the item or product."},"marketplace_merchant_is_business":{"type":"boolean","description":"Denotes whether or not the marketplace merchant is a business."},"marketplace_merchant_created_at":{"type":"string","description":"Date and time when the merchant was created.<br>_RFC1123 date or timestamp_","format":"date"}}},"risk":{"type":"object","description":"Risk assessment for the invoice.","properties":{"score":{"type":"string","description":"Scoring of the invoice. No validation done on this field because it is used to forward risk information to compatible payment providers.<br>_Maximum 12 characters long_"},"is_legit":{"type":"boolean","description":"Denotes whether or not the invoice is legitimate."},"skip_gateway_rules":{"type":"boolean","description":"Flag to skip payment gateway fraud engine rules. (This is only available on certain compatible gateways. Contact us for more information.)"}}},"device":{"type":"object","description":"Information about the device and channel used by the customer to initiate the payment.","properties":{"id":{"type":"string","description":"ID of the device. This can be anything but would usually be a UUID generated by a third-party anti-fraud solution.<br>_Maximum 100 characters long_"},"channel":{"type":"string","description":"Channel used by the device. Must be `web`, `ios`, `android` or `other`. Note: Please only set this field to `ios` or `android` if you are utilising our mobile SDKs."},"ip_address":{"type":"string","description":"IP address of the device.<br>_Must be a valid IP address_"}}},"external_fraud_tools":{"type":"object","description":"Information to forward to external fraud tools.","properties":{"forter":{"type":"string","description":"Information for the Forter fraud prevention service.","format":"json"},"signifyd":{"type":"string","description":"Information for the Signifyd fraud prevention service.","format":"json"},"ravelin":{"type":"string","description":"Information for the Ravelin fraud prevention service.","format":"json"}}},"shipping":{"type":"object","description":"Shipping information for the invoice.","properties":{"amount":{"type":"string","description":"Amount charged for shipping."},"method":{"type":"string","description":"Delivery method. Can be `web`, `collect-at-shop`, `relay`, `travel-station`, `home`, `shipping`, `locker` or `other`."},"provider":{"type":"string","description":"Delivery provider.<br>_Maximum 32 characters long_"},"delay":{"type":"string","description":"Shipment delay. Can be `express`, `priority`, `standard` or `other`."},"address1":{"type":"string","description":"First line of the delivery address.<br>_Maximum 255 characters long_"},"address2":{"type":"string","description":"Second line of the delivery address.<br>_Maximum 255 characters long_"},"state":{"type":"string","description":"State or county of the delivery address.<br>_Maximum 80 characters long_"},"city":{"type":"string","description":"City of the delivery address.<br>_Maximum 80 characters long_"},"country_code":{"type":"string","description":"Country code (`US`, `FR`...) of the delivery address.<br>_Must be a valid ISO 3166 country code with 2 characters_"},"zip":{"type":"string","description":"ZIP code of the delivery address.<br>_Maximum 16 characters long_"},"phone_number":{"type":"object","description":"Phone number of the shipment recipient","properties":{}},"expects_shipping_at":{"type":"string","description":"Expected date of delivery.<br>_RFC1123 date or timestamp_","format":"date"},"relay_store_name":{"type":"string","description":"Name of the store that the order must be collected from.<br>_Maximum 100 characters long_"},"email":{"type":"string","description":"Shipping email address.<br>_Must be a valid email_"},"first_name":{"type":"string","description":"First name of the shipping address.<br>_Maximum 80 characters long_"},"last_name":{"type":"string","description":"Last name of the shipping address.<br>_Maximum 80 characters long_"}}},"billing":{"type":"object","description":"Billing information for the invoice. This address will be used to populate the Customer and Card address if empty.","properties":{"address1":{"type":"string","description":"First line of the billing address.<br/>_Maximum 255 characters long_"},"address2":{"type":"string","description":"Second line of the billing address.<br/>_Maximum 255 characters long_"},"state":{"type":"string","description":"State or county of the billing address.<br/>_Maximum 80 characters long_"},"city":{"type":"string","description":"City of the billing address.<br/>_Maximum 80 characters long_"},"country_code":{"type":"string","description":"Country code (`US`, `FR`...) of the address."},"zip":{"type":"string","description":"ZIP code of the address.<br/>_Maximum 16 characters long_"}}},"statement_descriptor":{"type":"string","description":"Item that will be listed for this purchase on the customer’s bank statement.<br>_Maximum 25 characters long, should only contain letters, numbers, spaces, dots, asterisks and forward slashes_"},"statement_descriptor_phone":{"type":"string","description":"Support phone number for this purchase on the customer’s bank statement."},"statement_descriptor_city":{"type":"string","description":"City shown for this purchase on the customer’s bank statement. Maximum 22 characters long. Should only contain letters and numbers."},"statement_descriptor_company":{"type":"string","description":"Your company name to show on the customer’s bank statement."},"statement_descriptor_url":{"type":"string","description":"Support URL for this purchase on the customer’s bank statement."},"initiation_type":{"type":"string","description":"Represent the initiation type of the transaction which can be Customer Initiated Transaction (`cit`) or Merchant Initiated Transaction (`mit`).<br>_Allowed values are: `cit` or `mit`_"},"payment_intent":{"type":"string","description":"The type of payment flow that generated the transaction.<br>_Allowed values are: `one-off`, `recurring`, `recurring-standing-order`, `recurring-subscription`, `installment`, `unscheduled`, `unscheduled-delayed-charge`, `unscheduled-resubmission`, `unscheduled-no-show` or `unscheduled-reauthorization`_. <br><br>This field should be used in combination with the `initiation_type` field to tag scenarios such as initial CIT of a recurring sequence."},"payment_type":{"type":"string","description":"Optional information about the payment type<br>_Allowed values are “moto” or “ecommerce”_"},"return_url":{"type":"string","description":"For [APMs](../docs/alternative-payment-methods), this is the URL to return to the app after payment is accepted.<br>_Must be a valid URL_"},"webhook_url":{"type":"string","description":"Custom [webhook](/webhooks) URL for this purchase.<br>_Must be a valid URL_"},"sca_exemption_reason":{"type":"string","description":"Optional reason for requesting SCA exemption (Note: This must also be supported by the PSP. Please contact us for more information.)<br>_Allowed values are: `low-value`, `trusted-beneficiary` or `transaction-risk-analysis`_"},"challenge_indicator":{"type":"string","description":"Optional challenge indicator field when requesting 3DS2 (Note: This must also be supported by the PSP. Please contact us for more information.)<br>_Allowed values are: `no-preference`, `no-challenge-requested`, `challenge-requested`, `challenge-requested-mandate`, `no-challenge-requested-tra-performed`, `no-challenge-requested-data-share-only`, `no-challenge-requested-sca-performed`, `no-challenge-requested-whitelist-exemption`, `challenge-requested-whitelist-prompt` or `cb-scoring`_"},"unsupported_feature_bypass":{"type":"object","description":"Bypass payment provider unsupported features set in the transaction","properties":{"incremental_authorization":{"type":"boolean","description":"Ignore incremental authorization requests on PSP that do not support it","default":false}}},"metadata":{"type":"string","description":"Custom key/value pair (string/string) metadata that can be used to identify the transaction. This information is passed to upstream payment providers that support similar metadata objects. Do not include personal data in this field.","default":"{}","format":"json"},"gateway_data":{"type":"string","description":"Used for custom logics / data sent to payment providers.<br>This field <b>is not standard</b> across providers.","default":"{}","format":"json"}},"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/invoices",
    executionParameters: [{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"sec0":[]}]
  }],
  ["fetch-an-invoice", {
    name: "fetch-an-invoice",
    description: `Fetch an invoice`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"invoice_id":{"type":"string","description":"The invoice ID generated by ProcessOut during the invoice creation"}},"required":["invoice_id"]},
    method: "get",
    pathTemplate: "/invoices/{invoice_id}",
    executionParameters: [{"name":"Idempotency-Key","in":"header"},{"name":"invoice_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["delete-an-invoice", {
    name: "delete-an-invoice",
    description: `Delete invoices that have not had a payment started yet.`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"invoice_id":{"type":"string","description":"The invoice ID generated by ProcessOut during the invoice creation"}},"required":["invoice_id"]},
    method: "delete",
    pathTemplate: "/invoices/{invoice_id}",
    executionParameters: [{"name":"Idempotency-Key","in":"header"},{"name":"invoice_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["void-an-invoice", {
    name: "void-an-invoice",
    description: `Void an invoice`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"invoice_id":{"type":"string","description":"The invoice ID generated by ProcessOut during the invoice creation"},"requestBody":{"type":"object","properties":{"amount":{"type":"string","description":"Amount used for partial void (optional)"}},"description":"The JSON request body."}},"required":["invoice_id"]},
    method: "post",
    pathTemplate: "/invoices/{invoice_id}/void",
    executionParameters: [{"name":"Idempotency-Key","in":"header"},{"name":"invoice_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"sec0":[]}]
  }],
  ["refund-an-invoice", {
    name: "refund-an-invoice",
    description: `Refund an invoice`,
    inputSchema: {"type":"object","properties":{"invoice_id":{"type":"string","description":"The invoice ID generated by ProcessOut during the invoice creation"},"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"requestBody":{"type":"object","required":["amount"],"properties":{"amount":{"type":"string","description":"Refund amount applied to the transaction."},"reason":{"type":"string","description":"Reason for the refund (`customer_request`, `duplicate`, `fraud` or `other`).","default":"other"},"metadata":{"type":"object","description":"Metadata related to the refund, in the form of key-value pairs (string - string).","properties":{}}},"description":"The JSON request body."}},"required":["invoice_id"]},
    method: "post",
    pathTemplate: "/invoices/{invoice_id}/refunds",
    executionParameters: [{"name":"invoice_id","in":"path"},{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"sec0":[]}]
  }],
  ["payout-1", {
    name: "payout-1",
    description: `Send money to a payment method`,
    inputSchema: {"type":"object","properties":{"invoice_id":{"type":"string","description":"The invoice ID generated by ProcessOut during the invoice creation"},"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"requestBody":{"type":"object","required":["source"],"properties":{"source":{"type":"string","description":"The card in which the payout is directed towards. This can be a card ID, or a customer token ID which is linked to a card."},"force_gateway_configuration_id":{"type":"string","description":"The gateway you wish to use to send the payment"}},"description":"The JSON request body."}},"required":["invoice_id"]},
    method: "post",
    pathTemplate: "/invoices/{invoice_id}/payout",
    executionParameters: [{"name":"invoice_id","in":"path"},{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"sec0":[]}]
  }],
  ["creating-a-customer", {
    name: "creating-a-customer",
    description: `Creating a customer`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"requestBody":{"type":"object","properties":{"first_name":{"type":"string","description":"First name of the customer.<br>_Maximum 80 characters long_"},"last_name":{"type":"string","description":"Last name of the customer.<br>_Maximum 80 characters long_"},"email":{"type":"string","description":"Customer’s email address.<br>_Must be a valid email_"},"address1":{"type":"string","description":"First line of the customer’s address.<br>_Maximum 80 characters long_"},"address2":{"type":"string","description":"Second line of the customer’s address.<br>_Maximum 80 characters long_"},"city":{"type":"string","description":"City of the customer’s address.<br>_Maximum 80 characters long_"},"state":{"type":"string","description":"State or county of the customer’s address.<br>_Maximum 80 characters long_"},"zip":{"type":"string","description":"ZIP code of the customer’s address.<br>_Maximum 16 characters long_"},"country_code":{"type":"string","description":"Country code of the customer's address  (`US`, `FR`...).<br>_Must be a valid ISO 3166 country code with 2 characters_"},"phone":{"type":"object","description":"Phone number of the customer.","properties":{"number":{"type":"string","description":"Phone number without the dialing code.<br>_Maximum 14 characters long_"},"dialing_code":{"type":"string","description":"International dialing code (Note: “+” will be treated as “00”)"}}},"legal_document":{"type":"string","description":"Legal document number (required in some countries).<br>_Maximum 255 characters long; example for a CPF document in Brazil: 853.513.468-93_"},"ip_address":{"type":"string","description":"IP address of the customer.<br>_Must be a valid IPv4 or IPv6 address_"},"sex":{"type":"string","description":"Sex of the customer. Can be `male` or `female`."},"date_of_birth":{"type":"string","description":"Customer’s date of birth.<br>_RFC1123 date or timestamp_","format":"date"},"is_business":{"type":"boolean","description":"Denotes whether or not the customer represents a business."},"metadata":{"type":"string","description":"Metadata related to the customer, in the form of key-value pairs (string - string).","default":"{}","format":"json"},"registered_at":{"type":"string","description":"Date when the customer was registered on your platform. This defaults to the same date as `created_at` if you omit it.<br>_RFC1123 date or timestamp_","format":"date"}},"description":"The JSON request body."}}},
    method: "post",
    pathTemplate: "/customers",
    executionParameters: [{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"sec0":[]}]
  }],
  ["fetching-a-customer", {
    name: "fetching-a-customer",
    description: `Fetching a customer`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"customer_id":{"type":"string","description":"ID of your customer"}},"required":["customer_id"]},
    method: "get",
    pathTemplate: "/customers/{customer_id}",
    executionParameters: [{"name":"Idempotency-Key","in":"header"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["updating-a-customer", {
    name: "updating-a-customer",
    description: `Updating a customer`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"customer_id":{"type":"string","description":"ID of your customer"},"requestBody":{"type":"object","properties":{"first_name":{"type":"string","description":"First name of the customer.<br>_Maximum 80 characters long_"},"last_name":{"type":"string","description":"Last name of the customer.<br>_Maximum 80 characters long_"},"email":{"type":"string","description":"Customer’s email address.<br>_Must be a valid email_"},"address1":{"type":"string","description":"First line of the customer’s address.<br>_Maximum 80 characters long_"},"address2":{"type":"string","description":"Second line of the customer’s address.<br>_Maximum 80 characters long_"},"city":{"type":"string","description":"City of the customer’s address.<br>_Maximum 80 characters long_"},"state":{"type":"string","description":"State or county of the customer’s address.<br>_Maximum 80 characters long_"},"zip":{"type":"string","description":"ZIP code of the customer’s address.<br>_Maximum 16 characters long_"},"country_code":{"type":"string","description":"Country code of the customer's address  (`US`, `FR`...).<br>_Must be a valid ISO 3166 country code with 2 characters_"},"phone":{"type":"object","description":"Phone number of the customer.","properties":{"number":{"type":"string","description":"Phone number without the dialing code.<br>_Maximum 14 characters long_"},"dialing_code":{"type":"string","description":"International dialing code (Note: “+” will be treated as “00”)"}}},"legal_document":{"type":"string","description":"Legal document number (required in some countries).<br>_Maximum 255 characters long; example for a CPF document in Brazil: 853.513.468-93_"},"ip_address":{"type":"string","description":"IP address of the customer.<br>_Must be a valid IPv4 or IPv6 address_"},"sex":{"type":"string","description":"Sex of the customer. Can be `male` or `female`."},"date_of_birth":{"type":"string","description":"Customer’s date of birth.<br>_RFC1123 date or timestamp_","format":"date"},"is_business":{"type":"boolean","description":"Denotes whether or not the customer represents a business."},"metadata":{"type":"object","description":"Metadata related to the customer, in the form of key-value pairs (string - string).","properties":{}},"registered_at":{"type":"string","description":"Date when the customer was registered on your platform. This defaults to the same date as `created_at` if you omit it.<br>_RFC1123 date or timestamp_","format":"date"}},"description":"The JSON request body."}},"required":["customer_id"]},
    method: "put",
    pathTemplate: "/customers/{customer_id}",
    executionParameters: [{"name":"Idempotency-Key","in":"header"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"sec0":[]}]
  }],
  ["deleting-a-customer", {
    name: "deleting-a-customer",
    description: `Deleting a customer`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"customer_id":{"type":"string","description":"ID of your customer"}},"required":["customer_id"]},
    method: "delete",
    pathTemplate: "/customers/{customer_id}",
    executionParameters: [{"name":"Idempotency-Key","in":"header"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["listing-a-customer-transactions", {
    name: "listing-a-customer-transactions",
    description: `Listing a customer transactions`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"customer_id":{"type":"string","description":"ID of your customer"}},"required":["customer_id"]},
    method: "get",
    pathTemplate: "/customers/{customer_id}/transactions",
    executionParameters: [{"name":"Idempotency-Key","in":"header"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["listing-a-customer-tokens", {
    name: "listing-a-customer-tokens",
    description: `Listing a tokens of a customer`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"customer_id":{"type":"string","description":"ID of your customer"}},"required":["customer_id"]},
    method: "get",
    pathTemplate: "/customers/{customer_id}/tokens",
    executionParameters: [{"name":"Idempotency-Key","in":"header"},{"name":"customer_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["fetching-a-token", {
    name: "fetching-a-token",
    description: `Fetching a token`,
    inputSchema: {"type":"object","properties":{"customer_id":{"type":"string","description":"ID of your customer"},"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"token_id":{"type":"string","description":"ID of the customer token"}},"required":["customer_id","token_id"]},
    method: "get",
    pathTemplate: "/customers/{customer_id}/tokens/{token_id}",
    executionParameters: [{"name":"customer_id","in":"path"},{"name":"Idempotency-Key","in":"header"},{"name":"token_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["deleting-a-token", {
    name: "deleting-a-token",
    description: `Deleting a token`,
    inputSchema: {"type":"object","properties":{"customer_id":{"type":"string","description":"ID of your customer"},"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"},"token_id":{"type":"string","description":"ID of the customer token"}},"required":["customer_id","token_id"]},
    method: "delete",
    pathTemplate: "/customers/{customer_id}/tokens/{token_id}",
    executionParameters: [{"name":"customer_id","in":"path"},{"name":"Idempotency-Key","in":"header"},{"name":"token_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["fetch-a-token-balance", {
    name: "fetch-a-token-balance",
    description: `Fetch a token balance`,
    inputSchema: {"type":"object","properties":{"token_id":{"type":"string","description":"ID of the customer token"}},"required":["token_id"]},
    method: "get",
    pathTemplate: "/balances/tokens/{token_id}",
    executionParameters: [{"name":"token_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["fetching-a-transaction", {
    name: "fetching-a-transaction",
    description: `Fetching a transaction`,
    inputSchema: {"type":"object","properties":{"transaction_id":{"type":"string","description":"ID of the transaction"},"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"}},"required":["transaction_id"]},
    method: "get",
    pathTemplate: "/transactions/{transaction_id}",
    executionParameters: [{"name":"transaction_id","in":"path"},{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["listing-payouts", {
    name: "listing-payouts",
    description: `Listing payouts`,
    inputSchema: {"type":"object","properties":{"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"}}},
    method: "get",
    pathTemplate: "/payouts",
    executionParameters: [{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["fetching-a-payout", {
    name: "fetching-a-payout",
    description: `Fetching a payout`,
    inputSchema: {"type":"object","properties":{"payout_id":{"type":"string","description":"ID of the payout, received via webhooks or fetched with the API"},"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"}},"required":["payout_id"]},
    method: "get",
    pathTemplate: "/payouts/{payout_id}",
    executionParameters: [{"name":"payout_id","in":"path"},{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["deleting-payout", {
    name: "deleting-payout",
    description: `Deleting payout`,
    inputSchema: {"type":"object","properties":{"payout_id":{"type":"string","description":"ID of the payout"},"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"}},"required":["payout_id"]},
    method: "delete",
    pathTemplate: "/payouts/{payout_id}",
    executionParameters: [{"name":"payout_id","in":"path"},{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["listing-payout-items", {
    name: "listing-payout-items",
    description: `Listing payout items`,
    inputSchema: {"type":"object","properties":{"payout_id":{"type":"string","description":"ID of the payout, received via webhooks or fetched with the API"},"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"}},"required":["payout_id"]},
    method: "get",
    pathTemplate: "/payouts/{payout_id}/items",
    executionParameters: [{"name":"payout_id","in":"path"},{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["fetching-report", {
    name: "fetching-report",
    description: `Fetching report`,
    inputSchema: {"type":"object","properties":{"report_id":{"type":"string","description":"ID of the report"},"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"}},"required":["report_id"]},
    method: "get",
    pathTemplate: "/uploads/reports/{report_id}",
    executionParameters: [{"name":"report_id","in":"path"},{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
  ["deleting-uploaded-report", {
    name: "deleting-uploaded-report",
    description: `Deleting uploaded report`,
    inputSchema: {"type":"object","properties":{"report_id":{"type":"string","description":"ID of the uploaded report"},"Idempotency-Key":{"type":"string","description":"Unique key to your request that will be used for idempotency"}},"required":["report_id"]},
    method: "delete",
    pathTemplate: "/uploads/reports/{report_id}",
    executionParameters: [{"name":"report_id","in":"path"},{"name":"Idempotency-Key","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"sec0":[]}]
  }],
]);

/**
 * Security schemes from the OpenAPI spec
 */
const securitySchemes =   {
    "sec0": {
      "type": "http",
      "scheme": "basic"
    }
  };


server.setRequestHandler(ListToolsRequestSchema, async () => {
  const toolsForClient: Tool[] = Array.from(toolDefinitionMap.values()).map(def => ({
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema
  }));
  return { tools: toolsForClient };
});


server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
  const { name: toolName, arguments: toolArgs } = request.params;
  const toolDefinition = toolDefinitionMap.get(toolName);
  if (!toolDefinition) {
    console.error(`Error: Unknown tool requested: ${toolName}`);
    return { content: [{ type: "text", text: `Error: Unknown tool requested: ${toolName}` }] };
  }
  return await executeApiTool(toolName, toolDefinition, toolArgs ?? {}, securitySchemes);
});



/**
 * Type definition for cached OAuth tokens
 */
interface TokenCacheEntry {
    token: string;
    expiresAt: number;
}

/**
 * Declare global __oauthTokenCache property for TypeScript
 */
declare global {
    var __oauthTokenCache: Record<string, TokenCacheEntry> | undefined;
}

/**
 * Acquires an OAuth2 token using client credentials flow
 * 
 * @param schemeName Name of the security scheme
 * @param scheme OAuth2 security scheme
 * @returns Acquired token or null if unable to acquire
 */
async function acquireOAuth2Token(schemeName: string, scheme: any): Promise<string | null | undefined> {
    try {
        // Check if we have the necessary credentials
        const clientId = process.env[`OAUTH_CLIENT_ID_SCHEMENAME`];
        const clientSecret = process.env[`OAUTH_CLIENT_SECRET_SCHEMENAME`];
        const scopes = process.env[`OAUTH_SCOPES_SCHEMENAME`];
        
        if (!clientId || !clientSecret) {
            console.error(`Missing client credentials for OAuth2 scheme '${schemeName}'`);
            return null;
        }
        
        // Initialize token cache if needed
        if (typeof global.__oauthTokenCache === 'undefined') {
            global.__oauthTokenCache = {};
        }
        
        // Check if we have a cached token
        const cacheKey = `${schemeName}_${clientId}`;
        const cachedToken = global.__oauthTokenCache[cacheKey];
        const now = Date.now();
        
        if (cachedToken && cachedToken.expiresAt > now) {
            console.error(`Using cached OAuth2 token for '${schemeName}' (expires in ${Math.floor((cachedToken.expiresAt - now) / 1000)} seconds)`);
            return cachedToken.token;
        }
        
        // Determine token URL based on flow type
        let tokenUrl = '';
        if (scheme.flows?.clientCredentials?.tokenUrl) {
            tokenUrl = scheme.flows.clientCredentials.tokenUrl;
            console.error(`Using client credentials flow for '${schemeName}'`);
        } else if (scheme.flows?.password?.tokenUrl) {
            tokenUrl = scheme.flows.password.tokenUrl;
            console.error(`Using password flow for '${schemeName}'`);
        } else {
            console.error(`No supported OAuth2 flow found for '${schemeName}'`);
            return null;
        }
        
        // Prepare the token request
        let formData = new URLSearchParams();
        formData.append('grant_type', 'client_credentials');
        
        // Add scopes if specified
        if (scopes) {
            formData.append('scope', scopes);
        }
        
        console.error(`Requesting OAuth2 token from ${tokenUrl}`);
        
        // Make the token request
        const response = await axios({
            method: 'POST',
            url: tokenUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            },
            data: formData.toString()
        });
        
        // Process the response
        if (response.data?.access_token) {
            const token = response.data.access_token;
            const expiresIn = response.data.expires_in || 3600; // Default to 1 hour
            
            // Cache the token
            global.__oauthTokenCache[cacheKey] = {
                token,
                expiresAt: now + (expiresIn * 1000) - 60000 // Expire 1 minute early
            };
            
            console.error(`Successfully acquired OAuth2 token for '${schemeName}' (expires in ${expiresIn} seconds)`);
            return token;
        } else {
            console.error(`Failed to acquire OAuth2 token for '${schemeName}': No access_token in response`);
            return null;
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error acquiring OAuth2 token for '${schemeName}':`, errorMessage);
        return null;
    }
}


/**
 * Executes an API tool with the provided arguments
 * 
 * @param toolName Name of the tool to execute
 * @param definition Tool definition
 * @param toolArgs Arguments provided by the user
 * @param allSecuritySchemes Security schemes from the OpenAPI spec
 * @returns Call tool result
 */
async function executeApiTool(
    toolName: string,
    definition: McpToolDefinition,
    toolArgs: JsonObject,
    allSecuritySchemes: Record<string, any>
): Promise<CallToolResult> {
  try {
    // Validate arguments against the input schema
    let validatedArgs: JsonObject;
    try {
        const zodSchema = getZodSchemaFromJsonSchema(definition.inputSchema, toolName);
        const argsToParse = (typeof toolArgs === 'object' && toolArgs !== null) ? toolArgs : {};
        validatedArgs = zodSchema.parse(argsToParse);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const validationErrorMessage = `Invalid arguments for tool '${toolName}': ${error.errors.map(e => `${e.path.join('.')} (${e.code}): ${e.message}`).join(', ')}`;
            return { content: [{ type: 'text', text: validationErrorMessage }] };
        } else {
             const errorMessage = error instanceof Error ? error.message : String(error);
             return { content: [{ type: 'text', text: `Internal error during validation setup: ${errorMessage}` }] };
        }
    }

    // Prepare URL, query parameters, headers, and request body
    let urlPath = definition.pathTemplate;
    const queryParams: Record<string, any> = {};
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    let requestBodyData: any = undefined;

    // Apply parameters to the URL path, query, or headers
    definition.executionParameters.forEach((param) => {
        const value = validatedArgs[param.name];
        if (typeof value !== 'undefined' && value !== null) {
            if (param.in === 'path') {
                urlPath = urlPath.replace(`{${param.name}}`, encodeURIComponent(String(value)));
            }
            else if (param.in === 'query') {
                queryParams[param.name] = value;
            }
            else if (param.in === 'header') {
                headers[param.name.toLowerCase()] = String(value);
            }
        }
    });

    // Ensure all path parameters are resolved
    if (urlPath.includes('{')) {
        throw new Error(`Failed to resolve path parameters: ${urlPath}`);
    }
    
    // Construct the full URL
    const requestUrl = API_BASE_URL ? `${API_BASE_URL}${urlPath}` : urlPath;

    // Handle request body if needed
    if (definition.requestBodyContentType && typeof validatedArgs['requestBody'] !== 'undefined') {
        requestBodyData = validatedArgs['requestBody'];
        headers['content-type'] = definition.requestBodyContentType;
    }


    // Apply security requirements if available
    // Security requirements use OR between array items and AND within each object
    const appliedSecurity = definition.securityRequirements?.find(req => {
        // Try each security requirement (combined with OR)
        return Object.entries(req).every(([schemeName, scopesArray]) => {
            const scheme = allSecuritySchemes[schemeName];
            if (!scheme) return false;
            
            // API Key security (header, query, cookie)
            if (scheme.type === 'apiKey') {
                return !!process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            }
            
            // HTTP security (basic, bearer)
            if (scheme.type === 'http') {
                if (scheme.scheme?.toLowerCase() === 'bearer') {
                    return !!process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                }
                else if (scheme.scheme?.toLowerCase() === 'basic') {
                    return !!process.env[`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`] && 
                           !!process.env[`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                }
            }
            
            // OAuth2 security
            if (scheme.type === 'oauth2') {
                // Check for pre-existing token
                if (process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]) {
                    return true;
                }
                
                // Check for client credentials for auto-acquisition
                if (process.env[`OAUTH_CLIENT_ID_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`] &&
                    process.env[`OAUTH_CLIENT_SECRET_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]) {
                    // Verify we have a supported flow
                    if (scheme.flows?.clientCredentials || scheme.flows?.password) {
                        return true;
                    }
                }
                
                return false;
            }
            
            // OpenID Connect
            if (scheme.type === 'openIdConnect') {
                return !!process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            }
            
            return false;
        });
    });

    // If we found matching security scheme(s), apply them
    if (appliedSecurity) {
        // Apply each security scheme from this requirement (combined with AND)
        for (const [schemeName, scopesArray] of Object.entries(appliedSecurity)) {
            const scheme = allSecuritySchemes[schemeName];
            
            // API Key security
            if (scheme?.type === 'apiKey') {
                const apiKey = process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                if (apiKey) {
                    if (scheme.in === 'header') {
                        headers[scheme.name.toLowerCase()] = apiKey;
                        console.error(`Applied API key '${schemeName}' in header '${scheme.name}'`);
                    }
                    else if (scheme.in === 'query') {
                        queryParams[scheme.name] = apiKey;
                        console.error(`Applied API key '${schemeName}' in query parameter '${scheme.name}'`);
                    }
                    else if (scheme.in === 'cookie') {
                        // Add the cookie, preserving other cookies if they exist
                        headers['cookie'] = `${scheme.name}=${apiKey}${headers['cookie'] ? `; ${headers['cookie']}` : ''}`;
                        console.error(`Applied API key '${schemeName}' in cookie '${scheme.name}'`);
                    }
                }
            } 
            // HTTP security (Bearer or Basic)
            else if (scheme?.type === 'http') {
                if (scheme.scheme?.toLowerCase() === 'bearer') {
                    const token = process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    if (token) {
                        headers['authorization'] = `Bearer ${token}`;
                        console.error(`Applied Bearer token for '${schemeName}'`);
                    }
                } 
                else if (scheme.scheme?.toLowerCase() === 'basic') {
                    const username = process.env[`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    const password = process.env[`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    if (username && password) {
                        headers['authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
                        console.error(`Applied Basic authentication for '${schemeName}'`);
                    }
                }
            }
            // OAuth2 security
            else if (scheme?.type === 'oauth2') {
                // First try to use a pre-provided token
                let token = process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                
                // If no token but we have client credentials, try to acquire a token
                if (!token && (scheme.flows?.clientCredentials || scheme.flows?.password)) {
                    console.error(`Attempting to acquire OAuth token for '${schemeName}'`);
                    token = (await acquireOAuth2Token(schemeName, scheme)) ?? '';
                }
                
                // Apply token if available
                if (token) {
                    headers['authorization'] = `Bearer ${token}`;
                    console.error(`Applied OAuth2 token for '${schemeName}'`);
                    
                    // List the scopes that were requested, if any
                    const scopes = scopesArray as string[];
                    if (scopes && scopes.length > 0) {
                        console.error(`Requested scopes: ${scopes.join(', ')}`);
                    }
                }
            }
            // OpenID Connect
            else if (scheme?.type === 'openIdConnect') {
                const token = process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                if (token) {
                    headers['authorization'] = `Bearer ${token}`;
                    console.error(`Applied OpenID Connect token for '${schemeName}'`);
                    
                    // List the scopes that were requested, if any
                    const scopes = scopesArray as string[];
                    if (scopes && scopes.length > 0) {
                        console.error(`Requested scopes: ${scopes.join(', ')}`);
                    }
                }
            }
        }
    } 
    // Log warning if security is required but not available
    else if (definition.securityRequirements?.length > 0) {
        // First generate a more readable representation of the security requirements
        const securityRequirementsString = definition.securityRequirements
            .map(req => {
                const parts = Object.entries(req)
                    .map(([name, scopesArray]) => {
                        const scopes = scopesArray as string[];
                        if (scopes.length === 0) return name;
                        return `${name} (scopes: ${scopes.join(', ')})`;
                    })
                    .join(' AND ');
                return `[${parts}]`;
            })
            .join(' OR ');
            
        console.warn(`Tool '${toolName}' requires security: ${securityRequirementsString}, but no suitable credentials found.`);
    }
    

    // Prepare the axios request configuration
    const config: AxiosRequestConfig = {
      method: definition.method.toUpperCase(), 
      url: requestUrl, 
      params: queryParams, 
      headers: headers,
      ...(requestBodyData !== undefined && { data: requestBodyData }),
    };

    // Log request info to stderr (doesn't affect MCP output)
    console.error(`Executing tool "${toolName}": ${config.method} ${config.url}`);
    
    // Execute the request
    const response = await axios(config);

    // Process and format the response
    let responseText = '';
    const contentType = response.headers['content-type']?.toLowerCase() || '';
    
    // Handle JSON responses
    if (contentType.includes('application/json') && typeof response.data === 'object' && response.data !== null) {
         try { 
             responseText = JSON.stringify(response.data, null, 2); 
         } catch (e) { 
             responseText = "[Stringify Error]"; 
         }
    } 
    // Handle string responses
    else if (typeof response.data === 'string') { 
         responseText = response.data; 
    }
    // Handle other response types
    else if (response.data !== undefined && response.data !== null) { 
         responseText = String(response.data); 
    }
    // Handle empty responses
    else { 
         responseText = `(Status: ${response.status} - No body content)`; 
    }
    
    // Return formatted response
    return { 
        content: [ 
            { 
                type: "text", 
                text: `API Response (Status: ${response.status}):\n${responseText}` 
            } 
        ], 
    };

  } catch (error: unknown) {
    // Handle errors during execution
    let errorMessage: string;
    
    // Format Axios errors specially
    if (axios.isAxiosError(error)) { 
        errorMessage = formatApiError(error); 
    }
    // Handle standard errors
    else if (error instanceof Error) { 
        errorMessage = error.message; 
    }
    // Handle unexpected error types
    else { 
        errorMessage = 'Unexpected error: ' + String(error); 
    }
    
    // Log error to stderr
    console.error(`Error during execution of tool '${toolName}':`, errorMessage);
    
    // Return error message to client
    return { content: [{ type: "text", text: errorMessage }] };
  }
}


/**
 * Main function to start the server
 */
async function main() {
// Set up Web Server transport
  try {
    await setupWebServer(server, 3000);
  } catch (error) {
    console.error("Error setting up web server:", error);
    process.exit(1);
  }
}

/**
 * Cleanup function for graceful shutdown
 */
async function cleanup() {
    console.error("Shutting down MCP server...");
    process.exit(0);
}

// Register signal handlers
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the server
main().catch((error) => {
  console.error("Fatal error in main execution:", error);
  process.exit(1);
});

/**
 * Formats API errors for better readability
 * 
 * @param error Axios error
 * @returns Formatted error message
 */
function formatApiError(error: AxiosError): string {
    let message = 'API request failed.';
    if (error.response) {
        message = `API Error: Status ${error.response.status} (${error.response.statusText || 'Status text not available'}). `;
        const responseData = error.response.data;
        const MAX_LEN = 200;
        if (typeof responseData === 'string') { 
            message += `Response: ${responseData.substring(0, MAX_LEN)}${responseData.length > MAX_LEN ? '...' : ''}`; 
        }
        else if (responseData) { 
            try { 
                const jsonString = JSON.stringify(responseData); 
                message += `Response: ${jsonString.substring(0, MAX_LEN)}${jsonString.length > MAX_LEN ? '...' : ''}`; 
            } catch { 
                message += 'Response: [Could not serialize data]'; 
            } 
        }
        else { 
            message += 'No response body received.'; 
        }
    } else if (error.request) {
        message = 'API Network Error: No response received from server.';
        if (error.code) message += ` (Code: ${error.code})`;
    } else { 
        message += `API Request Setup Error: ${error.message}`; 
    }
    return message;
}

/**
 * Converts a JSON Schema to a Zod schema for runtime validation
 * 
 * @param jsonSchema JSON Schema
 * @param toolName Tool name for error reporting
 * @returns Zod schema
 */
function getZodSchemaFromJsonSchema(jsonSchema: any, toolName: string): z.ZodTypeAny {
    if (typeof jsonSchema !== 'object' || jsonSchema === null) { 
        return z.object({}).passthrough(); 
    }
    try {
        const zodSchemaString = jsonSchemaToZod(jsonSchema);
        const zodSchema = eval(zodSchemaString);
        if (typeof zodSchema?.parse !== 'function') { 
            throw new Error('Eval did not produce a valid Zod schema.'); 
        }
        return zodSchema as z.ZodTypeAny;
    } catch (err: any) {
        console.error(`Failed to generate/evaluate Zod schema for '${toolName}':`, err);
        return z.object({}).passthrough();
    }
}
