# MeteoSocial — current delivery

## Social community increment — September 11, 2026

The shared D1 feed now has Post and vertical Stories views, actual MP4/WebM uploads to R2 (8 MB maximum, 4 upload attempts per hour), public profiles, following/saved/city/search filters, public post permalinks, and threaded comments with in-session draft retention. City circles come from real feed content; no synthetic public accounts, media, engagement, or trends are seeded. Posts remain chronological. Every post distinguishes its user observation from the separately sourced forecast.

A compact navy/cyan navigation, coherent outline icons, glass panels and a collapsible discovery panel in Stories follow the supplied visual references. Mobile bottom navigation exposes Globe, Map, Weather, Community, AI and Profile; supplementary modules remain reachable from Profile. The existing vector globe and quick reporting are preserved. Videos start muted under user control, pause when offscreen/hidden, and only one video plays at a time. Reactions do not remount the video player.

New endpoints: `/api/network/feed`, `/member`, `/comments`, `/clip`, `/video/:id`. Migration 0004 adds the nullable video reference. Feed pagination uses created timestamp plus ID to avoid losing posts with tied timestamps. Auth, same-origin writes, ownership, upload bounds and byte ranges are enforced. Deleted/expired posts are excluded; video/photo responses are not cached. Video signatures are checked but files are not transcoded or certified. Codec support depends on the browser.

Verification: 91 existing checks and 41 new backend checks passed. Local browser QA covered 390/320 px layouts, a generated local-only WebM upload and complete playback, comment draft reopening and submission, saving/removing a saved post, empty-filter recovery and console errors. This is responsive browser QA, not testing on physical phones.

OpenAI is still unconfigured: live translations, roast generation and image assessments are not claimed operational. No external social videos are scraped or imported. Radar ingestion, critical push delivery, historical risk calibration and native car/satellite/widget integrations remain unconnected as documented below.

## Vector globe and quick-report refinement

The globe now uses a tessellated land surface and coastline vectors derived from public-domain Natural Earth data, with custom atmospheric rim shading. No active storm fronts are displayed: a trusted radar/nowcast source is still missing. Geographic illumination is decorative and conveys no hazard level.

The report grid gives a short category-colored selection response and opens a photo composer. Existing optional haptics apply on supported browsers. Photos are checked locally for size, signature and successful decoding; this is not event verification. Draft city, text and photo survive closing and reopening the dialog during the current page session. Publication requires a separate explicit action. Optional OpenAI assessment is offered only when the backend exposes vision capability, with explicit sending consent.

Target panels use 25px backdrop blur, 6% fill and gradient borders; lightweight/Eco/high-contrast modes use solid fills. 91 automated checks passed. Local browser tests covered rendering, oversized and undecodable images, valid preview and draft restoration. Actual radar fronts and live AI calls remain unavailable.

## Sensory and offline increment

Added optional synthesized weather ambience, optional browser vibration, bounded touch highlights, scroll-driven Story depth, automatic low-battery quality reduction with hysteresis, and explicit offline shelter snapshots. Public application assets are cached by a service worker after an online visit; API, identity, user media and external requests are excluded. Shelters are saved only by an explicit action, with timestamp and stale-copy warnings. Offline data is not a live hazard feed or a routing service. Browser storage may be evicted.

The web app cannot read device temperature or provide native satellite, car telemetry, home automation or native home-screen widgets. Battery and vibration APIs are feature-detected and may be unavailable. No raw microphone capture is used by the ambience generator.

80 automated checks passed across the existing backend and new snapshot, battery and service-worker tests. Desktop browser checks confirmed audio activation, snapshot saving and mobile-width layout. These are not physical-device, thermal, satellite or real-world offline-emergency certifications.

The deployed product is a web application backed by a Worker, D1 and R2. Flutter widgets and the PostgreSQL proposal are architectural references, not a connected native application.

This delivery adds a geographic 3D globe on the home page, real community pins, a discreet assistant entry, large report/shelter controls, persistent lightweight/reduced-motion preferences, weather reactions, independent request cancellation/cache handling and a public service-status endpoint. The globe renders on interaction and resize, without a permanent animation loop; resources are disposed on navigation. It is not a weather radar.

OpenAI-powered translation and image screening require a configured server-side key. No model result proves authenticity or measures hail diameter. Radar cell ingestion, calibrated historical scores, push delivery, licensed social imports, car telemetry, smart-home bridges, native widgets and partner rewards remain unconnected. The service-status page exposes these limitations explicitly.

Validation covers authentication, ownership, request origin, media validation, expiry, database persistence, reaction idempotency, stale asynchronous requests and missing-service behavior. Browser inspection confirmed the new home loads and receives weather. Physical-device thermal profiling, microphone recording on real phones, native accessibility and actual AI-provider calls remain unverified.
