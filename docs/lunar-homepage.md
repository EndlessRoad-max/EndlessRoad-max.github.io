# 星空之下，月面之上

Scope: dark homepage opening only. Navigation, copy, content data, light-theme layout, and primary/secondary actions are retained.

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

Browser checks: 375px, 768px, and 1440px viewports; image decoding; no horizontal overflow; static stars under reduced motion; lunar imagery hidden in light mode. Screenshots inspected at desktop/mobile sizes. Source imagery is intentionally illustrative rather than geologically exact.
