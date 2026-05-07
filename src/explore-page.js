import { client } from './client.js';
import { writeFileSync, mkdirSync } from 'node:fs';

const guidelineId = process.env.FRONTIFY_GUIDELINE_ID;

if (!guidelineId) {
  console.error('Missing FRONTIFY_GUIDELINE_ID in .env');
  process.exit(1);
}

const query = `
  query GuidelinePages($id: ID!) {
    node(id: $id) {
      ... on Guideline {
        id
        name
        url
        pages {
          items {
            id
            title
            url
            sections {
              items {
                id
                elements {
                  items {
                    __typename
                    ... on GuidelinePageHeading {
                      id
                      title
                    }
                    ... on GuidelinePageBlock {
                      id
                      type { id }
                      content
                      assetSettings {
                        items {
                          settingName
                          assets {
                            items {
                              previewUrl
                            }
                          }
                        }
                      }
                    }
                    ... on GuidelinePageBlockReference {
                      id
                      block {
                        id
                        type { id }
                        content
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const data = await client.request(query, { id: guidelineId });

console.log('Raw response:');
console.log(JSON.stringify(data, null, 2));

mkdirSync('output', { recursive: true });
writeFileSync(`output/guideline-${guidelineId.slice(0, 12)}.json`, JSON.stringify(data, null, 2));
console.log(`\nSaved to output/guideline-${guidelineId.slice(0, 12)}.json`);

const pages = data?.node?.pages?.items ?? [];
console.log(`\n--- Shape summary: ${pages.length} pages ---`);
for (const page of pages) {
  const elements = page.sections.items.flatMap(s => s.elements.items);
  const headings = elements.filter(e => e.__typename === 'GuidelinePageHeading');
  const blocks   = elements.filter(e => e.__typename === 'GuidelinePageBlock');
  const refs     = elements.filter(e => e.__typename === 'GuidelinePageBlockReference');
  console.log(`  [${page.title}] ${headings.length} headings, ${blocks.length} blocks, ${refs.length} refs`);
  const blockTypes = [...new Set(blocks.map(b => b.type?.id))];
  if (blockTypes.length) console.log(`    block types: ${blockTypes.join(', ')}`);
}
