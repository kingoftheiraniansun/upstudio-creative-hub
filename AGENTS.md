<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# UP Studio — architecture rules

- Studio contact info and media paths live only in `src/lib/studio.ts` — single source of truth.
- Native features go through `src/lib/native.ts` (Capacitor plugins with web fallback) — keeps web standalone.
- AI replies go through `AssistantAdapter` in `src/lib/assistant.ts` — swap in real AI code without touching UI.
- Booking submission goes through `submitBooking` in `src/lib/booking.ts` — future booking API plugs in there.
- `/sw.js` is registered only from `src/lib/sw-register.ts` and never in dev/preview/iframes — avoids stale preview caches.
- Media assets in `public/media/`; intro uses `reel-muted.mp4` (audio stripped with ffmpeg -an) — intro must be silent.
- Capacitor config in `capacitor.config.json` (webDir dist/client); wallpaper/LiveActivity need custom native plugins named `Wallpaper` / `LiveActivity`.
