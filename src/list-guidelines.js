import { client, endpoint } from './client.js';

console.log(`Querying: ${endpoint}\n`);

const query = `
  query ListBrandsAndGuidelines {
    brands {
      id
      name
    }
  }
`;

try {
  const data = await client.request(query);
  console.log('Brands available on this account:');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n---');
  console.log('Next step: pick a brand ID and explore its guidelines.');
  console.log('The Frontify GraphQL schema uses `guidelinePage(id:...)` (Beta)');
  console.log('to fetch a specific page. Open the Playground at:');
  console.log(`  ${endpoint}`);
  console.log('and explore the schema to find your target page ID.');
} catch (err) {
  console.error('Query failed:');
  console.error(err.response?.errors || err.message);
  console.error('\nCommon causes:');
  console.error('- Token missing required scopes (need at least basic:read)');
  console.error('- GraphQL Beta not enabled on this account tier');
  console.error('- Wrong subdomain in .env');
}
