# Mo Money, Mo Problems: The Graph

Static website. No build step. Netlify-ready.

## Files

- `index.html` — page structure
- `style.css` — visual styling
- `script.js` — graph, slider, animations, share button
- `content.json` — the file you edit most often

## How to edit tiers/questions

Open `content.json`.

Each tier looks like this:

```json
{
  "name": "Survival Mode",
  "caption": "Money is not abstract here.",
  "value": 10,
  "questions": [
    "Can I pay rent?",
    "Can I cover bills?"
  ]
}
```

### What each field does

- `name`: tier title shown above the graph
- `caption`: short text under the tier title
- `value`: how high the curve is at this tier. Higher number = more problems.
- `questions`: the popup questions that fade in over the graph

## Sweet Spot

This line controls which tier is the Sweet Spot:

```json
"sweetSpotIndex": 5
```

The count starts from 0, so index 5 means the 6th tier.

## Music embed

Edit this field:

```json
"musicEmbedHtml": "..."
```

Paste a Spotify or YouTube embed iframe there.

## Local preview

Because the site loads `content.json`, open it through a tiny local server instead of double-clicking the HTML file.

If you have Python:

```bash
python3 -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## Deploy on Netlify

1. Zip or upload these files to a GitHub repo.
2. Go to Netlify.
3. Add new site.
4. Choose “Deploy manually” or connect GitHub.
5. No build command needed.
6. Publish directory is the root folder.
