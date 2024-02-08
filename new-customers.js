require('dotenv').config();

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

async function getCustomers() {
  let customers = [];
  let afterCursor = null;

  while (true) {
    const result = await fetchCustomers(afterCursor);
    for (let edge of result.edges) {
      const customer = edge.node;
      customers.push(customer);
    }
    console.log({customers: customers.reverse()})
    if (!result.pageInfo.hasNextPage) break;
    afterCursor = result.edges[result.edges.length - 1].cursor;

    // Wait for 2 second to respect the API rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return customers;
}

getCustomers()
  .then(customers => console.log(customers.length) || customers)
  .then(customers => console.log(customers))