# Frontify → Supernova MVP

Mini proof-of-concept for the BI pilot proposal.
Fetches a Frontify Guideline page and explores converting its content to markdown.

## Goal

Validate the assumption in the proposal: that Frontify's Guidelines API returns
content in a format compatible with `@frontify/fondue`'s RTE markdown serializer.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the env template and fill in your values:
   ```
   cp .env.example .env
   ```
   Edit `.env` with your Frontify subdomain and Personal Developer Token.
   Generate the token at `https://<subdomain>.frontify.com/api/developer/token`.

   **Never commit `.env` or share your token.** It's gitignored by default.

## Running

The scripts are intended to run in order as a discovery workflow.

### Step 1: List brands
```
npm run list
```
Confirms the token works and shows which brands/guidelines are accessible.

### Step 2: Explore a page
Add a `FRONTIFY_PAGE_ID` to `.env`, then:
```
npm run explore
```
Fetches the page, prints the raw response, saves it to `output/`, and gives a
first read on whether the content shape matches what we expected.

### Step 3: Convert to markdown
```
npm run convert
```
Placeholder. The approach depends on what Step 2 reveals:
- Structured JSON → Fondue RTE serializer
- HTML string → `turndown` fallback
- Already markdown → just clean up

## Revoking the token

If the token is ever exposed:
1. Go to your Frontify account → Developer → Applications / Tokens
2. Revoke the compromised token
3. Generate a new one and update `.env`
