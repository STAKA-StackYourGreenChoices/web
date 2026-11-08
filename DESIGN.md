# STAKA design system: "Hang tag"

The subject is clothing you already own. Shoppers scan the barcode on a garment's tag, and STAKA gives that tag a second, digital life. The physical hang tag (card stock, a punched hole, a string, care-label type) is the vocabulary the whole interface borrows from.

- **Audience:** shoppers aged 18–35 who already buy sustainable fashion; brand and catalog admins.
- **Primary job:** scan → see the product's tag → keep it. For admins: keep the catalog accurate.

## Colour

| Token | Hex | Role |
|---|---|---|
| Paper | `#FBFAF7` | Page background. Cool off-white, like uncoated card stock (deliberately not cream). |
| Forest | `#1F3D2B` | Primary actions, the app bar, large brand panels. |
| Moss | `#7C8B4F` | Secondary accents: progress, verified marks, focus halo tint. |
| Indigo | `#2E3F66` | Links and selected states, like denim thread. |
| Ink | `#1A1F1C` | Text. A green-black that belongs with Forest, not a generic `#111`. |

Supporting neutrals are mixed from Ink over Paper (`ink/70`, `ink/50`, `ink/12`, `ink/6`). Feedback colours are muted to sit with the palette: error `#A23B2A` (rust), warning `#8F6312` (ochre), success uses Forest text with a Moss mark.

Measured contrast on Paper: Ink 16.0:1, Forest 11.4:1, Indigo 10.0:1, Rust 6.3:1, Ochre 5.1:1. Paper on Forest is 11.4:1. Moss is 3.6:1, so it is only for icons, borders and large text, never body text.

## Type

- **Bricolage Grotesque** for headings and the product name on a tag. Its slightly irregular, inky letterforms feel printed. Set tight (`-0.02em`) at display sizes, at weights 600–700.
- **Inter** for body, labels, tables and forms, at weights 400/500/600. Tabular numerals for every number in tables and on tags.
- The scale is a 1.25 modular ratio from 16px: 13 / 16 / 20 / 25 / 31 / 39 / 49. Body line-height 1.55, headings 1.1. Measure 60–72ch.
- Sentence case everywhere: no all-caps labels, no tracked-out eyebrows.

## Shape and depth

Radius encodes hierarchy, so one radius is never applied to everything:

- Inputs and buttons: 10px.
- Panels and dialogs: 16px.
- Chips: full pill.
- The hang tag has its own silhouette: clipped top corners, a punched hole, a dashed stitch line.

Depth is flat by default, with 1px `ink/12` borders. Only the hang tag casts a shadow, a soft offset like card stock hanging off a garment. Nothing else floats.

## Layout

**Auth pages:** a split screen. The Forest panel holds a real product's hang tag swinging on its string; the form sits on Paper. On phones, the panel collapses into a short Forest band showing the tag's top edge and hole, with the form below. Forms are left-aligned and single-column, at most 420px wide.

```
desktop                                   phone
+------------------+--------------------+  +----------------------+
|  Forest          |  Sign in to STAKA  |  | Forest band  ( o )   |
|      |  string   |  [ email        ]  |  +----------------------+
|   .------.       |  [ password     ]  |  | Sign in to STAKA     |
|   | (o)  |       |  [ Sign in      ]  |  | [ email            ] |
|   | Tee  |       |  Forgot password?  |  | [ password         ] |
|   '------'       |                    |  | [ Sign in          ] |
+------------------+--------------------+  +----------------------+
```

**Admin:** a Forest app bar with the wordmark and Products / Brands / Import. Content is left-aligned on Paper, max width 1120px.

- **Product list:** a real table on desktop that collapses to stacked rows on phones. Rows are not separate cards.
- **Product form:** single column, with a live hang-tag preview pinned beside it on wide screens and below it on phones. The admin sees exactly what shoppers will see.
- **Import:** a three-step sequence (choose file, review, import). Numbering is used here because the content really is a sequence.

## Principles

1. **The tag is the only bold element.** Everything around it stays quiet: no gradients, no decorative shadows, no hover lifts on rows.
2. **Every number names its unit.** "2.1 kg CO₂e", "80% recyclable".
3. **Brand-stated and verified figures always look different.** Verified figures carry the certifier's name; brand-stated ones say so plainly.
4. **Motion only answers an action.** The tag swings once when it first appears and when a scan succeeds. Everything respects `prefers-reduced-motion`.
5. **Quality floor:**
   - Tap targets of at least 44×44px.
   - Visible focus rings (2px Indigo plus a 2px Paper gap).
   - Correct at 360, 768, 1024 and 1440px wide.
   - Text resizes to 200% without breaking.
   - Errors say what happened and how to fix it.

## Avoided on purpose
Cream with a serif and clay accent. All-caps eyebrows. Middle-dot meta strings. Monospace data labels. Arrows appended to buttons. Identical rounded cards with the same grey shadow.

## Home page (`/`)

**Job:** a first-time visitor understands what STAKA does within one screen and creates an account. Signing in comes second. Signed-in visitors get "Open my wardrobe" instead.

**Research it follows:**
- [NN/g homepage principles](https://www.nngroup.com/articles/homepage-design-principles/):
  - logo top-left, and a tagline that says what we do
  - real examples instead of stock imagery
  - specific labels, no "Learn more"
  - no carousels, no animated headline, no false floors
- **One primary action** per page.
- **EU EmpCo Directive (in force 27 Sep 2026):** no generic environmental claims ("sustainable", "eco-friendly", "green"). STAKA only states measured figures and says who checked them. That is also the product's point of view.
- **Performance:** the headline is the largest element on first load and is never animated or hidden.
- **WCAG 2.2:** targets of at least 24px (we use 44), focus never hidden by the sticky header (`scroll-padding-top`), reduced motion respected.

**The memorable thing:** a clothes rail. A Forest rail runs across the hero, with three real tags hanging from it on strings of different lengths. They swing once on load, like a rack someone just walked past. Elsewhere the rail returns quietly, as the line the "How it works" steps hang from.

```
desktop
+-------------------------------------------------------------+
| staka   How it works  For brands  Questions   Sign in [Join] |
+-------------------------------------------------------------+
| Your clothes, with their          ============rail========= |
| footprint attached.                  |        |          |   |
| Scan a label to see a piece's     [tag]    [TAG*]    [tag]  |
| footprint, prove you bought it,             front           |
| and keep its tag.                                            |
| [Create an account]  Sign in                                 |
+-------------------------------------------------------------+
  How it works   (1)----(2)----(3)   steps hang from a rail
  What's on a tag   callouts | big tag | callouts
  [Forest band] No vague green labels. The numbers, and who stands behind them.
  Share what you can prove   text | link-preview mock
  For brands    Questions (accordion)    Final call to action    Footer
```

On phones: the text comes first, then the rail with the front tag, and the two side tags peek in. Steps become a vertical line with the step marks on the left.

**Copy rules:**
- Sentence case, specific verbs.
- Numbers keep their units.
- Never "sustainable" or "eco-friendly" as a claim.
- No price claims ("free") until pricing is decided.
