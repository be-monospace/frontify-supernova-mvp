import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import 'dotenv/config';

// Block type IDs confirmed from the Frontify beta API
const BLOCK_TYPE = {
  TEXT:          'cl5wda7mi00010tw8zxxf6g0c',
  CALLOUT:       'cl5w86f8700010sw8yvfasdhx',
  IMAGE:         'cldju6bkp0001a8w43x1fgzzu',
  DO_DONT:       'cl5wa92p800010kw8fhpwvbjh',
  COLOR_PALETTE: 'cmmjcf0ap00041axpbsaemyi5',
  TABLE:         'cmmjcf0ap000j1axp665bysnr',
};

const guidelineId = process.env.FRONTIFY_GUIDELINE_ID;
const useMock = process.env.USE_MOCK === 'true' || !guidelineId;

const rawPath = useMock
  ? 'output/guideline-mock.json'
  : `output/guideline-${guidelineId.slice(0, 12)}.json`;

if (useMock) console.log('Using mock data:', rawPath);

let raw;
try {
  raw = JSON.parse(readFileSync(rawPath, 'utf8'));
} catch {
  console.error(`Could not read ${rawPath}.`);
  if (!useMock) console.error('Run `npm run explore` first, or set USE_MOCK=true.');
  process.exit(1);
}

const pages = raw?.node?.pages?.items ?? [];
if (!pages.length) {
  console.error('No pages found in saved file.');
  process.exit(1);
}

function blockToMarkdown(block) {
  const typeId = block.type?.id;
  const content = block.content;

  // null content = API could not serialize this block type
  if (content === null || content === undefined) {
    return `<!-- unsupported block (type: ${typeId}) -->`;
  }

  switch (typeId) {
    case BLOCK_TYPE.TEXT:
      return content;

    case BLOCK_TYPE.CALLOUT:
      return `> ${content}`;

    case BLOCK_TYPE.IMAGE: {
      const previewUrl = block.assetSettings?.items
        ?.find(s => s.settingName === 'image')
        ?.assets?.items?.[0]?.previewUrl;
      return previewUrl
        ? `![${content}](${previewUrl})`
        : `<!-- image: ${content} (previewUrl unavailable) -->`;
    }

    case BLOCK_TYPE.DO_DONT:
      // API merges do/don't into a single string with no separator
      return `<!-- do/don't block (structure lost in API serialization): ${content} -->`;

    case BLOCK_TYPE.COLOR_PALETTE:
      // Format: "Name, #hex\nName, #hex" — parse into a markdown table
      return colorPaletteToMarkdown(content);

    case BLOCK_TYPE.TABLE:
      // API returns fully flattened comma-separated text — structure is lost
      return `<!-- table block (structure lost in API serialization): ${content} -->`;

    default:
      // Unknown block type with content — pass through as plain text
      return content;
  }
}

function colorPaletteToMarkdown(content) {
  const rows = content
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [name, hex] = line.split(',').map(s => s.trim());
      return `| ${name} | ${hex} |`;
    });

  if (!rows.length) return content;
  return [
    '| Color | Hex |',
    '|-------|-----|',
    ...rows,
  ].join('\n');
}

function pageToMarkdown(page) {
  const lines = [`# ${page.title}`, ''];
  for (const section of page.sections.items) {
    for (const el of section.elements.items) {
      if (el.__typename === 'GuidelinePageHeading') {
        lines.push(`## ${el.title}`, '');
      } else if (el.__typename === 'GuidelinePageBlock') {
        lines.push(blockToMarkdown(el), '');
      } else if (el.__typename === 'GuidelinePageBlockReference') {
        lines.push(blockToMarkdown(el.block), '');
      }
    }
  }
  return lines.join('\n');
}

mkdirSync('output', { recursive: true });

for (const page of pages) {
  const markdown = pageToMarkdown(page);
  const slug = page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const outPath = `output/${slug}.md`;
  writeFileSync(outPath, markdown);
  console.log(`Wrote ${outPath}`);
}

console.log(`\nDone — ${pages.length} page(s) converted.`);
