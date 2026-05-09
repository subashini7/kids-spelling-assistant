## Kids Spelling Assistant

A simple browser-based spelling practice app:
- Click **Next word** to get a new word
- Click **Hear a word** to repeat the current word
- Type the spelling and press **Enter** to check
- Shows memory tips when incorrect and a daily summary

### Run locally
Because browsers block module scripts on `file://`, run a local server:

```bash
cd "/Users/subas/Documents/SpellCheckTransformer"
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
