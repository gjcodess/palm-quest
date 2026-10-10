# PALMQuest Creative Studio

Run `npm run dev`, then open `/promo-generator/` on the local URL printed by Vite. The studio is a separate web page; the game still opens at `/`.

## Make a Google Play set

1. Choose an export format and color palette.
2. Edit the headline and description under each template. Line breaks are supported, and the canvas fits text to its allotted space.
3. Use **Replace screenshot** to choose a PNG, JPEG, or WebP capture from your APK. The studio preserves the full screenshot without cropping it. Default screenshots come from the current web game, with a generic student name.
4. Use **Include** to select images for the set. Download one PNG per card or download the selected images together in a ZIP.
5. Choose **Feature graphic** and export the banner separately.

Enable **Screenshot only** for images that focus entirely on gameplay. This preserves the full captured screen and omits the promotional captions and artwork; use landscape format for the game’s landscape screenshots. For tablet listings, use this mode with captures from the corresponding tablet layout. Feature graphics always use the promotional layout.

Presets: landscape 1920 × 1080, portrait 1080 × 1920, tall portrait poster 1772 × 3840, landscape tablet 2560 × 1440, and feature graphic 1024 × 500. The PNG encoder writes RGB color type 2: 24-bit color with no alpha channel. The preview and export use the same canvas.

Both portrait presets use separate screenshots captured at the real 800 × 360 phone breakpoint. The game plays in landscape on phones; the poster keeps that landscape screen intact inside the portrait composition. Text and artwork retain their proportions at every export size. Replacement screenshots still take precedence over the defaults.

The 1772 × 3840 poster is for other promotional uses: its long side exceeds twice its short side, so it does not meet Google Play's screenshot aspect-ratio limit. Use 1080 × 1920 for the portrait listing gallery.

Tall posters stack two different mobile game screenshots. Each card has independent replacement controls for screenshot 1 and screenshot 2; both uploads stay only in the current tab. The headline, description, and smaller supporting artwork leave room for both screens without stretching or cropping them. Screenshot-only mode continues to export a single full screen.

Caption drafts and selected cards are saved under `palmquest_promo_drafts_v1` in this browser. Replacement screenshots are held only in the current tab and are never sent to a server by the generator. Reloading restores the default screenshots while retaining captions. **Reset captions & images** restores the original six templates after an inline confirmation.

## Build and hosting

`npm run build` builds both `dist/index.html` and `dist/promo-generator/index.html`. Vercel rewrites explicitly route `/promo-generator` and `/promo-generator/` to the studio. Other static hosts should serve the directory index at `/promo-generator/`. Assets are local, including fonts, so the generator does not require an image service or API key.

The generator is for store marketing. It does not modify game progress, assessments, or Android permissions. Its source entry and stylesheet are separate from the game entry.

## Validation

`node --test src/promo/export.test.js` independently decodes the output with Sharp to check exact pixels, dimensions, and the absence of an alpha channel. Also check downloads in the browser and extract the ZIP with an archive utility before publishing.

Review your selected images against the [Google Play preview asset guidelines](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en). Correct dimensions and file formats do not guarantee store approval. For games, Google recommends at least three screenshots in either 1920 × 1080 landscape or 1080 × 1920 portrait, and recommends showing actual gameplay prominently. The gallery must contain at least two screenshots. The feature graphic is a separate required 1024 × 500 asset.
