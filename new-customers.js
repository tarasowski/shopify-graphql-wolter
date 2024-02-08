require('dotenv').config();
const moment = require('moment');

const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;

const startDate = moment('2024-01-01');
const endDate = moment('2024-02-09');
const numberOfCustomers = 5;

const headers = {
  'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
  'Content-Type': 'application/json',
};

const query = `
{
  customers(first: ${numberOfCustomers}, reverse: true) { 
    edges {
      node {
        id
        displayName
        createdAt
      }
    }
  }
}
`;

fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({ query: query }),
})
  .then(response => response.json())
  .then(data => console.log(JSON.stringify(data, null, 4)) || data)
  .then(data => {
    const customers = data.data.customers.edges.map(edge => edge.node);
    const newCustomers = customers.filter(customer => {
      const createdAt = moment(customer.createdAt);
      return createdAt.isBetween(startDate, endDate);
    });
    return newCustomers;
  })
  .then(newCustomers => console.log(JSON.stringify(newCustomers, null, 4)) || newCustomers)
  .catch(error => console.error('Error:', error));