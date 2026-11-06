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

The common layout retains the original night-theme dimensions. Daylight hides and pauses stars after their fade completes. The moon remains transparent until decoded, showing a theme-appropriate curved placeholder if loading is slow or fails. Because themes share the asset, theme switching requires no image replacement or second image download. Both day/night shade layers remain available for opacity crossfades.

## Daybreak horizon revision (2026-11-06)

Page-boundary correction: the homepage now uses a white base plus a fixed dark backing whose opacity follows the same duration/easing as the night scene. This avoids mixing a page background-color interpolation with a scene opacity interpolation at the 690px boundary. The browser check additionally samples actual shared-clock transitions at 80/240/480ms in both directions, without normalizing each animation's current time; it checks the same seam pixels on desktop and mobile.

Transition compositing correction: the complete night scene (sky, image backing, moon and full night shade) now fades as one group over an opaque daylight base. Fading these layers independently exposed the black image rim and a dark horizontal band. The two scene-edge masks were also removed because they blended the animated page background a second time. Both backgrounds reach the page color before the scene box ends. Daytime moon hiding is asserted through the parent scene opacity; night shade stays fully composed internally. The motion check samples pixels at y=655, 670, 685 and 695 against the page at y=710 in both transition directions, allowing at most three RGB levels of difference.

The current light theme replaces the silver lunar treatment above with an independent CSS horizon. The entire lunar surface (image, backing and sweep) fades to zero opacity in daylight. The sky blends from #F5F8FB to white. A blurred, shallow arc starts at 570px on desktop and 590px below 640px viewport width, with pale blue-grey shading and #E8D5AF at approximately 12% opacity. The scene fades out before the reading area and has no continuous animation. Night geometry, imagery and final shading are unchanged. The existing 800ms manual transition now crossfades between these separate scenes.

Validation includes explicit whole-moon hiding and daybreak-layer visibility assertions, horizon placement, and the existing five responsive widths. Light-theme sampled contrast is at least 5.50:1. Before/after night screenshots have identical pixels in the central moon/content region (middle 50% of each viewport, y=430–980px) at all five widths; random star placement outside this region can vary between builds. Desktop/mobile intermediate transition screenshots and interaction checks pass.

## Lunar twilight transition (2026-11-06)

Manual switching with the homepage sky in view uses an 800ms eased sky/shade crossfade and a clipped, reversible light/shadow band across the lunar surface. Stars enter after 200ms and fade out before being hidden and paused. A 40px bottom mask blends the sky into the reading surface during intermediate frames. Other pages, system changes, and offscreen sky use 300ms paint transitions. The button shows the target theme with a rotating sun/moon crossfade; its label and title update together. Initial load and reduced-motion mode do not animate. Rapid clicks reverse CSS transitions and replace the cleanup timer; unavailable storage retains the manual preference in memory.

`scripts/check-theme-motion.mjs` adds desktop/mobile intermediate-frame screenshots and traces, keyboard switching, interrupted transitions, offscreen/inner-page behavior, reduced motion, and unavailable-storage checks. It accepts the same runtime variables as the daylight check and defaults to static preview port 4331. Artifacts are in `test-results/theme-motion/`. Run against a built preview to exclude development hot-reload requests from image counts.

Validation: `scripts/check-daylight.mjs` uses an installed Playwright runtime (`PLAYWRIGHT_MODULE`, optional `CHROMIUM_PATH`, optional `TEST_URL`, default preview port 4330). It checks 360, 390, 768, 1440 and 1920px widths, light/dark screenshots, stable component coordinates, overflow, image-request reuse, persisted preferences, automatic system theme, slow/failed imagery, reduced motion, normal star animation, and navigation actions. Outputs are saved under `test-results/daylight/` (ignored by Git).

Measured results: zero coordinate differences between themes for navigation, motto, name, actions and introduction; lowest sampled light-theme text/background contrast 5.16:1 across navigation, Chinese motto, greeting, name, subtitle, buttons and introduction. Contrast uses a screenshot of the actual composed background with text hidden, sampled over text/element bounds; it is a targeted check, not a full-site accessibility certification. The normal day/night screenshots were visually reviewed at all five widths for the daylight layout and compared with the retained nighttime composition. Astro checks and static build checks pass.


## Afternoon sunlight and reversible curtain (2026-11-06)

The homepage daylight scene now uses an offscreen upper-right warm source, three blurred diagonal rays (two on mobile), and a 20-second ambient cycle. The scene fades to the white reading area before the first notes. No image assets or animation dependencies were added.

Manual homepage toggles use a 1100ms reversible animation frame clock. `--night-progress` drives the page backing, daylight opacity, stars and the lower-left-to-upper-right night mask; reversing retains the current progress. The moon geometry is unchanged and the former horizontal sweep is removed. Content colors use 450ms transitions, inner pages use 300ms, and reduced motion resolves immediately. Initial theme restoration does not animate.

Verification: Astro check (69 files, no diagnostics), production build and Pagefind, build integrity (18 pages), daylight checks at 360/390/768/1440/1920px (minimum static sampled contrast 4.99:1), and theme-motion desktop/mobile screenshots, reversal, keyboard, offscreen, storage and reduced-motion checks. Motion screenshots sample real scene progress rather than the old opacity CSS transition. Static contrast results do not claim every animation frame meets the same ratio.


## Directional daylight revision (2026-11-06)

`DaylightScene.astro` replaces the pale parallel CSS stripes with inline SVG fans sharing an offscreen source at 96% width / -60px. Desktop has three main shafts and five filaments; mobile has its own two-shaft, three-filament composition. Local blue-gray shadow wedges provide contrast on a near-white base. Light cores, atmospheric spill and shadow edges use separate gradients/filters; the old yellow wash and horizon are removed. No external image or animation dependency is required.

Each shaft breathes independently over 18–24 seconds, never falling below 78% opacity. The existing reversible theme clock and reduced-motion behavior are retained. Daylight contrast testing samples the minimum ambient-light opacity, with slightly deeper secondary text to protect readability; screenshot inspection is required in addition to the structural assertions.


## Broad distant sunlight (2026-11-06, current design)

The visible convergence point is removed. Three wide near-parallel fields enter across the desktop top/right edge (40–47 degrees from vertical), with four subdued filaments; mobile uses two independent fields and two filaments. Curved field boundaries, asymmetric brightness profiles and blue-gray shadow regions replace triangular fans. Illumination extends toward the buttons and fades before the introduction.

Fixed-seed SVG noise attenuates light density by 0–8%; a separate 5-unit displacement only affects the blurred spill layer. No noise/filter parameters animate. Two soft cloud masks translate with 26/37-second cycles. IntersectionObserver and document visibility pause both sunlight and stars offscreen/in the background; reduced motion removes cloud animation. Existing theme progress remains unchanged.

Contrast QA additionally attenuates the whole illuminated field to 60%, a conservative bound below the two cloud masks' combined minimum transmission (0.78²), rather than claiming a single cloud position is the worst case. Motion tests cover offscreen pause/resume and the document visibility handler as well as the existing theme scenarios.


## Distinct cores within the broad fields (2026-11-06)

Retained the distant, wide-area geometry. Reduced the full-width light wash and added separate asymmetric primary cores, narrower secondary shafts and faint filaments inside each field. Soft local backlight supplies contrast around those cores instead of narrowing the overall coverage. Cloud masks and accessibility behavior are unchanged. Minimum conservative sampled text contrast: 5.15:1 across the five tested viewport widths.


## Full-viewport identity cover (2026-11-06)

The homepage now groups the reduced-size handwritten motto, larger name, tagline and existing actions inside `.home-cover`. Its minimum height is the dynamic viewport minus the measured sticky header. A native “向下探索” anchor leads to `#home-introduction`, with a new “关于这个空间” heading. Intro/notes/projects/contact remain in normal document flow below the cover. Short/landscape views may grow naturally rather than clip content.

ResizeObserver synchronizes header and cover layout heights with the two background scenes. The moon retains its original aspect ratio and its crest follows the name position; a local shade protects identity text. Measurements use layout units so CSS zoom does not double the scene. Viewport resizing does not reset scroll position or theme.

`check-cover.mjs` verifies seven viewport sizes, including 375×667, 844×390 and 720×450, plus 200% CSS zoom, anchor clearance/hash reload and identical theme geometry. Motion seam checks now sample the actual scene boundary after scrolling it inside the viewport; full-page screenshots cannot reliably sample the fixed backing outside the viewport. Browser-native zoom has not been automated; reduced viewport and CSS zoom cover reflow behavior.


## Circular scroll cue (2026-11-06)

The native introduction anchor now combines a 12px spaced label with a 48px desktop / 44px mobile outlined circle and a 20px SVG arrow. Hover/focus adds a subtle fill and 3px arrow movement over 220ms; reduced motion disables movement. Touch/pen pointer state supplies reliable press-only fill and clears on release, cancellation or window blur. No repeating animation or scroll interception is introduced.

Verified cover geometry at seven viewport sizes, Enter activation, hash reload, hover/focus stability, reduced motion, and an emulated touch press/release/tap. Whole-cover and day/night cue crops are in `test-results/cover/`.


## Compact capsule cue and anchor offset fix (2026-11-06)

Replaced the vertical outlined ring with a neutral filled capsule: inline label/chevron, 48px desktop / 44px mobile height, subtle hover and press feedback. The existing touch-release handling remains.

The lingering cue after navigation was caused by document scroll padding plus section scroll margin plus section top padding. The unchanged `#home-introduction` URL now targets the heading, which owns a single measured-header + 24px scroll margin. Homepage document scroll padding is zero; other pages keep their existing offset. Heading is programmatically focusable for native keyboard anchor navigation. Cover tests assert the cue is above the sticky header bottom and the heading is precisely 24px below it after activation.


## Downward cue with scroll-controlled visibility (2026-11-06)

Restored a vertical label/chevron composition without a container fill. The 48×36 SVG has a 40px-wide broad chevron and a 10px downward travel over a 2.6s cycle: move down, pause, and gently return. The experimental light dot and vertical trail have been removed; the cue uses the existing neutral text color without a ring, fill, or glow. Reduced motion keeps it static. Opacity is driven by scroll position: normally fully visible through 24px, then fades to hidden at 120–160px depending on viewport height. Short or zoomed covers delay this range until the cue can enter the viewport. Hidden cues retain layout space but become invisible, noninteractive, inert and aria-hidden. Passive scrolling uses one animation frame update; resize/pageshow recalculate visibility.

Verified partial fade, full hiding, reverse reveal, reduced motion, hash reload and existing seven-size cover/anchor tests.
