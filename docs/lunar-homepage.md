# 星空之下，月面之上

Scope: homepage lunar opening in dark and light themes. Navigation, copy, content data, and primary/secondary actions are retained. The shared composition follows the original dark-theme layout.

## Asset provenance

The lunar visual was created specifically for this project with OpenAI's built-in image-generation tool on 2026-11-04. It is an AI-generated artistic visualization, not NASA imagery, a scientific lunar map, or a documentary photograph. No third-party photograph or texture was incorporated. It is supplied as a generated project asset, not represented as a separately licensed NASA/public-domain image.

Original generation: `exec-4ee0ec8e-8c2c-4167-8f86-0068e5357156.png`.

Delivered files:
- `public/images/lunar-horizon.webp`: 1536 × 1024, 109258 bytes.
- `public/images/lunar-horizon-mobile.webp`: 960 × 640, 43286 bytes.

WebP compression: Sharp, quality 82, effort 6. No remote image dependency or live 3D runtime.

Generation prompt:

> Create a photorealistic lunar horizon background asset for a monochrome personal website. Landscape 3:2 or wide format, maximum detail. No text, no stars, no graphics, no atmosphere. Background solid near-black #101010. A gigantic moon occupies lower 80% of frame: its convex upper limb apex at x=50%, y=20%, limb at left/right edges at y=42%. The rest of the sphere extends far below frame. True spherical projection: craters become strongly foreshortened toward curved horizon. Many believable overlapping impact craters, dark lunar maria patches, fine regolith detail. Hard directional sunlight from upper left; left surface silver grey detailed, right side falling into charcoal shadow. Crater rims consistently illuminated upper-left, shadows lower-right. A very thin discontinuous illuminated limb on left only, no uniform glowing outline. Detail strongest in first 20% beneath horizon; below that the surface progressively darkens toward #101010 at bottom. Central lower area subdued so white website heading can sit over it. Realistic orbital lunar photography, cinematic restrained contrast, exclusively neutral greys, no blue, no gold. It must unmistakably read as a giant curved lunar surface, not flat rocky terrain. Output asset only.

## Composition and performance

The image already contains spherical perspective and directional lighting. A matching opaque clipped backing hides moving stars even before the image loads. An overlay quiets the center and fades all texture before the reading area. The background is confined to the opening 690px rather than fixed behind the article. Mobile displays 48 stars; desktop displays 140 with varied brightness and 55–115 second transform animations. Offscreen animation pauses; reduced-motion disables it.

Original night-theme browser checks: 375px, 768px, and 1440px viewports; image decoding; no horizontal overflow; static stars under reduced motion. Screenshots inspected at desktop/mobile sizes. Source imagery is intentionally illustrative rather than geologically exact.


## Daylight implementation (2026-11-04)

No new imagery or dependency is added. Both themes use the exact same responsive WebP and clipped lunar geometry. Daylight uses brightness(1.25), contrast(.65), 55% image opacity over a light-grey backing, and a uniform vertical fade to white (no radial white patch behind the content). This preserves crater locations and lighting direction without inversion. The sky is #F4F6F8, the reading surface is #FFFFFF, text is #1B1D20, and secondary text is #60656D; the greeting and hero subtitle use #33373C for contrast over continuous lunar detail.

The common layout retains the original night-theme dimensions. Daylight disables and hides stars entirely. The moon remains transparent until decoded, showing a theme-appropriate curved placeholder if loading is slow or fails. Because themes share the asset, theme switching requires no image replacement or second image download. Theme transitions are enabled only after a user/system change, last 200ms, and are disabled under reduced motion. Both day/night shade layers remain available for opacity crossfades.

Validation: `scripts/check-daylight.mjs` uses an installed Playwright runtime (`PLAYWRIGHT_MODULE`, optional `CHROMIUM_PATH`, optional `TEST_URL`, default preview port 4330). It checks 360, 390, 768, 1440 and 1920px widths, light/dark screenshots, stable component coordinates, overflow, image-request reuse, persisted preferences, automatic system theme, slow/failed imagery, reduced motion, normal star animation, and navigation actions. Outputs are saved under `test-results/daylight/` (ignored by Git).

Measured results: zero coordinate differences between themes for navigation, motto, name, actions and introduction; lowest sampled light-theme text/background contrast 5.16:1 across navigation, Chinese motto, greeting, name, subtitle, buttons and introduction. Contrast uses a screenshot of the actual composed background with text hidden, sampled over text/element bounds; it is a targeted check, not a full-site accessibility certification. The normal day/night screenshots were visually reviewed at all five widths for the daylight layout and compared with the retained nighttime composition. Astro checks and static build checks pass.
