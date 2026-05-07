import 'dotenv/config';
import { GraphQLClient } from 'graphql-request';

const subdomain = process.env.FRONTIFY_SUBDOMAIN;
const token = process.env.FRONTIFY_TOKEN;

if (!subdomain || !token) {
  console.error('Missing FRONTIFY_SUBDOMAIN or FRONTIFY_TOKEN in .env');
  console.error('Copy .env.example to .env and fill in your values.');
  process.exit(1);
}

const endpoint = `https://${subdomain}.frontify.com/graphql`;

export const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  },
});

export { endpoint };
