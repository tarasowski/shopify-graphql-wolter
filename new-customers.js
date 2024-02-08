require('dotenv').config();
const moment = require('moment');

// includes the start date and excludes the end date
const startDate = moment('2024-02-01'); // starting from this date
const endDate = moment('2024-02-03'); // excluding this date

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
      customers(first: 100, reverse: true, after: ${afterCursor ? `"${afterCursor}"` : null}) {
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

const filterByDate = (customers, startDate, endDate) => {
    const newCustomers = customers.filter(customer => {
      const createdAt = moment(customer.createdAt);
      return createdAt.isBetween(startDate, endDate);
    });
    return newCustomers;
}

async function getCustomers(numberOfCustomers) {
  let customers = [];
  let afterCursor = null;

  while (customers.length < numberOfCustomers) {
    const result = await fetchCustomers(afterCursor);
    customers = customers.concat(result.edges.map(edge => edge.node));
    if (!result.pageInfo.hasNextPage) break;
    afterCursor = result.edges[result.edges.length - 1].cursor;
  }

  // If we fetched more customers than needed due to pagination, trim the array down to the desired size
  if (customers.length > numberOfCustomers) {
    customers = customers.slice(0, numberOfCustomers);
  }

  return customers;
}

const numberOfCustomers = 200; // Change this to the number of customers you want to fetch

getCustomers(numberOfCustomers)
  .then(customers => console.log(customers.length) || customers)
  .then(customers => filterByDate(customers, startDate, endDate))
  .then(customers => console.log(customers.length) || customers)
  .then(customers => console.log(customers))