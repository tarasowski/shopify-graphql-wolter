require('dotenv').config();
const moment = require('moment');

// includes the start date and excludes the end date
const startDate = moment('2022-01-01'); // starting from this date
const endDate = moment('2023-02-03'); // excluding this date

const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;

const headers = {
  'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
  'Content-Type': 'application/json',
};

async function fetchCustomers(afterCursor) {
  const query = `
    {
      customers(first: 100, after: ${afterCursor ? `"${afterCursor}"` : null}) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            displayName
            createdAt
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: query }),
  });

  const data = await response.json();
  return data.data.customers;
}

async function getCustomers(startDate) {
  let customers = [];
  let afterCursor = null;

  while (true) {
    const result = await fetchCustomers(afterCursor);
    for (let edge of result.edges) {
      const customer = edge.node;
      /*
      const createdAt = moment(customer.createdAt);
      if (createdAt.isBefore(startDate)) {
        return customers;
      }
      */
      customers.push(customer);
    }
    if (!result.pageInfo.hasNextPage) break;
    afterCursor = result.edges[result.edges.length - 1].cursor;

    // Wait for 2 second to respect the API rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return customers;
}

getCustomers(startDate)
  .then(customers => console.log(customers.length) || customers)
  .then(customers => console.log(customers))