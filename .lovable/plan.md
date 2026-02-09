

## Improve Resume Experience (Best Possible with Current Providers)

Since no free embed provider supports a start time/seek parameter (confirmed via documentation review of Vidsrc, SuperEmbed, VikingEmbed, and Embed-API), we cannot auto-resume playback. However, we can significantly improve the experience so users know exactly where they left off.

### Changes

**1. Add a "Resume Info" overlay in the Video Player**
When the user plays something from "Continue Watching," show a brief overlay (auto-dismisses after 5 seconds) telling them:
- "You were at 45% -- use the player's seek bar to jump ahead"
- This gives users a clear reference point to manually seek

**2. Add progress percentage on Continue Watching cards**
- Show a tooltip or text label like "45% watched" on hover
- The progress bar already exists; this adds a readable percentage

**3. Add a 3rd server option: VikingEmbed (vembed.stream)**
- Free, no API key needed, supports both IMDB and TMDB IDs
- Provides an additional fallback if Server 1 or 2 are down
- Endpoint: `https://vembed.stream/play/{tmdb_id}` for movies
- Endpoint: `https://vembed.stream/play/{tmdb_id}/{season}/{episode}` for TV

### Technical Details

**Files to modify:**

- `src/lib/vidsrc.ts` -- Add VikingEmbed as Server 3 with URL builders
- `src/types/media.ts` -- Update `ServerType` to include `'vikingembed'`
- `src/features/player/VideoPlayer.tsx` -- Add resume info overlay that reads stored progress and displays it briefly when playback starts
- `src/components/ContinueWatchingSection.tsx` -- Add percentage text label on hover
- `src/lib/watchHistory.ts` -- Add a helper to retrieve progress for a specific media item

### Limitations (Transparent)

- True auto-resume from a timestamp is **not possible** with any free embed provider
- The only way to achieve this would be self-hosting video content with a custom HTML5 player, which is outside the scope of these providers
- The resume overlay is the best UX improvement available given these constraints

