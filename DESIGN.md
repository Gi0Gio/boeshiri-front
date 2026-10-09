---
name: Boesh Irí
description: La casa de un colectivo cultural de Chiriquí; sitio público y panel de miembros en la misma selva.
colors:
  jungle: "#002420"
  jungle-deep: "#00110e"
  rainforest: "#00735e"
  caribbean: "#00e6bc"
  tea: "#d9f2c2"
  terracotta: "#d67a63"
  candy: "#e60035"
  cream: "#f6fbef"
  jungle-line: "#00342c"
  junta-surface: "#003a33"
  mio-surface: "#ffffff"
  mio-terracotta: "#a3452d"
  mio-candy: "#c8002e"
  group-caribe-tint: "#d4f8ef"
  group-caribe-ink: "#00594a"
  group-terracota-tint: "#f8e3dc"
  group-terracota-ink: "#8f3b26"
  group-te-solid: "#9fd47a"
  group-te-tint: "#e9f6dc"
  group-te-ink: "#335c17"
  group-candy-tint: "#fcdbe2"
  group-candy-ink: "#a10026"
  group-selva-tint: "#d2e9e3"
  group-selva-ink: "#00473a"
  group-neutral-solid: "#7f9a90"
  group-neutral-tint: "#e8efe9"
  group-neutral-ink: "#2c403a"
typography:
  display:
    fontFamily: "'Oswald Variable', 'Alegre Sans', sans-serif"
    fontSize: "clamp(3rem, 8vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "0.025em"
  headline:
    fontFamily: "'Oswald Variable', 'Alegre Sans', sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.025em"
  title:
    fontFamily: "'Oswald Variable', 'Alegre Sans', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.025em"
  body:
    fontFamily: "'Montserrat Variable', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "'Montserrat Variable', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Oswald Variable', 'Alegre Sans', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.14em"
  figure:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "0.12em"
rounded:
  input: "12px"
  card: "16px"
  sheet: "24px"
  pill: "9999px"
spacing:
  list-gap: "10px"
  page-x-phone: "16px"
  card-pad: "20px"
  card-pad-wide: "24px"
  section-gap: "40px"
  page-x-desktop: "40px"
  touch-min: "44px"
  rail-width: "72px"
  rail-width-open: "256px"
components:
  button-primary-mio:
    backgroundColor: "{colors.rainforest}"
    textColor: "{colors.mio-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    height: "44px"
  button-primary-junta:
    backgroundColor: "{colors.caribbean}"
    textColor: "{colors.junta-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    height: "44px"
  button-next-step-mio:
    textColor: "{colors.rainforest}"
    typography: "{typography.body-small}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  button-destructive-mio:
    backgroundColor: "{colors.mio-candy}"
    textColor: "{colors.mio-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    height: "44px"
  card-mio:
    backgroundColor: "{colors.mio-surface}"
    textColor: "{colors.jungle}"
    rounded: "{rounded.card}"
    padding: "20px"
  card-junta:
    backgroundColor: "{colors.junta-surface}"
    textColor: "{colors.tea}"
    rounded: "{rounded.card}"
    padding: "20px"
  input-mio:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.jungle}"
    typography: "{typography.body-small}"
    rounded: "{rounded.input}"
    padding: "10px 16px"
  chip:
    typography: "{typography.figure}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  group-tag-caribe:
    backgroundColor: "{colors.group-caribe-tint}"
    textColor: "{colors.group-caribe-ink}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  group-card-terracota:
    backgroundColor: "{colors.group-terracota-tint}"
    textColor: "{colors.group-terracota-ink}"
    rounded: "{rounded.sheet}"
    padding: "20px"
  hat-switch-active:
    backgroundColor: "{colors.caribbean}"
    textColor: "{colors.junta-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "44px"
  tab-bar-phone:
    backgroundColor: "{colors.mio-surface}"
    textColor: "{colors.jungle}"
    height: "64px"
  rail-desktop:
    backgroundColor: "{colors.junta-surface}"
    textColor: "{colors.tea}"
    width: "72px"
---

# Design System: Boesh Irí

## Overview

**Creative North Star: "Dos sombreros en la misma casa"**

Boesh Irí is one house with two rooms. The public site is the jungle at night: deep green grounds carrying the Dorace sun-and-spiral pattern, cream and tea type, caribbean green as the one bright voice, Oswald in tall uppercase. The member panel lives in that same house and wears one of two hats. «Lo mío» (every member, every day) inverts the palette to the site's cream paper with white surfaces and jungle ink; «Junta» (the board, running the collective) stays in the night jungle with the Dorace pattern behind it. Switching hats recolours the whole ground in under half a second; nothing else animates.

The panel is phone-first and reads top to bottom in one column. It shows what is yours first, keeps every item in exactly one place, and lets colour carry meaning: each commission owns a fixed tint-and-ink pair that follows its tasks, cards and headers, candy red speaks only for alerts and destruction, and the green accent marks the next thing you can do. Density stays low; when there is nothing, the panel says so in a dashed empty box instead of filling the space.

The panel paints with palette names and lets each hat reassign them, so the same page source serves both rooms. Read class names in panel code as roles, not colours (see Colors).

**Key Characteristics:**
- One palette, two grounds: cream-and-white «Lo mío», jungle-and-Dorace «Junta».
- Oswald uppercase for titles and buttons; Montserrat for reading; JetBrains Mono only for figures, dates and counts.
- Pills for everything you press; 16px-rounded flat cards; 24px-rounded group cards and sheets.
- Commission colour is identity, never decoration: tint for ground, ink for text, solid for dots.
- Thumb-sized everything (44px minimum), nothing under 12px.
- Line-art SVG icons from one set, one stroke weight.

## Colors

A deep-jungle palette with one electric green voice, a warm terracotta and an alarm red, used as two inverted grounds.

### Primary
- **Caribbean Green** (caribbean): the action and accent colour. Primary buttons, active tab, active hat, links, selection, the outer focus ring, the frog mark. In «Lo mío» the panel remaps it to Tropical Rain Forest so it passes AA on white.
- **Tropical Rain Forest** (rainforest): the action colour of «Lo mío» (buttons, links, active nav) and the darker green of gradients and secondary fills on the public site.

### Secondary
- **Terracota** (terracotta): warm secondary for "needs attention but not an alarm" (missing coordinator, PDF type, pending states). «Lo mío» uses the darkened **Terracota Quemada** (mio-terracotta) so it reads as text.

### Tertiary
- **Medium Candy Apple Red** (candy): alerts, unread badges, counts waiting for a decision, error boxes, destructive buttons. «Lo mío» uses **Candy Oscuro** (mio-candy) for AA text.

### Neutral
- **Medium Jungle Green** (jungle): the brand's dark. Public-site ink on cream and dark section grounds; the «Junta» ground; the fixed ink on every group tint.
- **Jungle Nocturno** (jungle-deep): the deepest public-site ground and table header band.
- **Selva Alta** (junta-surface): «Junta» card, rail and bar surfaces, one step up from the patterned ground.
- **Tea Green** (tea): body ink on dark grounds; hairlines at 10 to 25% opacity; quiet fills at 5 to 15%.
- **Cream** (cream): the public-site page and «Lo mío» ground; headline ink on dark grounds.
- **Blanco** (mio-surface): «Lo mío» card, rail and bar surfaces.
- **Jungle Line** (jungle-line): baked into the Dorace pattern SVG only; never a UI colour.

### Group colours
Five fixed triples (solid, tint, ink) in `src/panel/colores.js`, assigned by alphabetical order of commission name (caribe, terracota, te, candy, selva); teams inherit their parent commission's triple; anything unassigned falls to the neutral sage triple. Applied through `--g-solido`, `--g-tinte`, `--g-tinta`. Tint grounds a group's card or header, ink colours its name and tag text, solid draws its dot and hairline (at 20 to 40%). Every ink passes AA on its tint and on white. Secondary text on a tint is literal jungle, not the remapped ink, because tints are light in both hats.

### Named Rules
**The Hat Remap Rule.** Inside the panel, palette class names are roles: `jungle-deep` is the ground, `jungle` is the surface, `tea` is body ink, `cream` is heading ink, `caribbean` is action. «Junta» sets ground jungle and surface Selva Alta; «Lo mío» sets ground cream, surface white, both inks jungle, action rainforest, and swaps terracotta and candy for their dark versions. Write panel pages with these names and never hard-code a hat's hex, except for an element that must look like the other hat (the Junta notice on «Lo mío» uses literal jungle, tea and caribbean with the Dorace pattern).

**The Red Means Stop Rule.** Candy is reserved for alerts, unread and waiting counts, error states and destructive actions. It is not a category colour and not a CTA colour.

**The Colour Is a Name Rule.** A commission's tint-and-ink pair appears wherever that commission's things appear (task tag, group card, group header) and nowhere else. Gritos are recognised by the megaphone icon and slot dots, not by a colour block.

## Typography

**Display Font:** Oswald Variable (stand-in for Alegre Sans, then sans-serif)
**Body Font:** Montserrat Variable (sans-serif)
**Label/Mono Font:** JetBrains Mono Variable (ui-monospace)

**Character:** Tall condensed uppercase Oswald gives the posters' voice to titles and buttons; Montserrat is the plain, friendly reading text; the mono only ever holds numbers.

### Hierarchy
- **Display** (600, 3rem rising to 4.5rem or more, 1.05, uppercase): public-site hero and section heads only.
- **Headline** (600, 1.875rem phone / 2.25rem desktop, uppercase, tracking 0.025em): one page title per panel page, including the «Hola, nombre» greeting and group headers.
- **Title** (600, 1.25rem section / 1.125rem item, uppercase): panel section heads («Tus tareas»), grito and publication titles.
- **Body** (400 to 500, 1rem, 1.5): task titles, list rows, sheet links.
- **Body small** (400, 0.875rem): secondary lines, descriptions, form text; descriptions capped at max-w-2xl.
- **Label** (600, 0.875rem, uppercase, tracking 0.12 to 0.15em): buttons, hat switch, pill tabs. Chips use the same face at 0.75rem, tracking 0.08em.
- **Figure** (mono, 0.75rem, tracking 0.12 to 0.15em): counts, badges, money, table headers, dates in data.

### Named Rules
**The Mono Is Numbers Rule.** JetBrains Mono appears only for figures, counts, dates and table headers. Prose and buttons never use it.

**The Twelve Pixel Floor Rule.** The smallest text anywhere is 0.75rem (12px). No arbitrary smaller sizes.

## Layout

Phone first, one reading column. Panel content sits in a single centred column (max-w-3xl, 768px) in both hats and at every width. Page padding is 16px on phones, 24px from 640px, 40px from 1024px; content clears a 112px bottom pad on phones for the tab bar. Sections are separated by 40px; list rows stack with a 10px gap; cards pad 20px (24px from 640px).

Navigation changes form at 1024px. Below it: a sticky top bar (frog link, the «Lo mío | Junta» switch for board members or the house name for others, avatar opening «Tu cuenta») and a fixed bottom tab bar of 64px-tall items with icon over label: Inicio, Grupos, Publicar, Avisos in «Lo mío»; Pendientes, Personas, Comisiones, Agenda plus «Más» in «Junta». Occasional destinations live in a bottom sheet, not the bar. From 1024px the bars become a fixed left rail with the same items, then «Lo tuyo» or «Más» and «Sistema» groups, and the account at the foot. The rail rests compact at 72px (icons only) and opens to 256px over the content on hover or keyboard focus; the content never moves.

**The Thumb Rule.** Every interactive target is at least 44px tall (bottom-bar items 64px, sheet rows 48px). Wide tables keep their first column sticky so a row's name stays visible while scrolling to its actions.

## Elevation & Depth

Flat by default; depth comes from tonal steps (ground, surface, tint) and hairlines in the ink colour at 10% opacity. Chrome that floats over content (top bar, tab bar) uses 95% surface with backdrop blur; the bottom sheet and dialogs sit over a 70% ground scrim with a small blur. Shadows appear only as state.

### Shadow Vocabulary
- **Caribbean lift** (`box-shadow: 0 8px 24px rgba(0,230,188,0.3)` with a 2px rise): primary button hover.
- **Sticky column edge** (`box-shadow: 6px 0 8px -6px rgba(0,0,0,0.5)`): the fixed first column of a scrolled table.
- **Focus double ring** (`outline: 3px solid caribbean; outline-offset: 2px; box-shadow: 0 0 0 2px jungle`): every keyboard focus; form fields use their own caribbean ring instead.

### Named Rules
**The Lift Is a Response Rule.** Nothing rests on a shadow. Lifts appear on hover of primary actions; everything else stays flat.

## Shapes

Soft and round. Everything you press is a full pill (buttons, tabs, the hat switch, chips, badges, avatars). Containers round at 16px (cards, list rows, tables, error and empty boxes); inputs and rail links at 12px; group cards, group headers and the bottom sheet's top edge at 24px. Empty states use a dashed hairline border; errors use a candy hairline at 30%. Group tints are full-bleed grounds, never edge stripes.

## Components

### Buttons
Confident Oswald pills.
- **Shape:** full pill, 44px minimum height.
- **Primary:** action green fill (caribbean in «Junta», rainforest in «Lo mío») with surface-coloured text, uppercase label face, 10px by 20px.
- **Hover / Focus:** 2px rise plus the caribbean lift; keyboard focus shows the double ring.
- **Ghost:** transparent with an ink hairline at 25%; hover turns border and text to the action green.
- **Next step:** in task rows, an outlined action-green pill (Montserrat semibold, 0.875rem) naming the next state («Empezar», «Entregar», «Dar por hecha»); hover fills it.
- **Destructive:** candy fill, white text; hover shifts to terracotta.
- **Text link:** action green semibold, underline on hover, 44px tall hit area.

### Chips
- **Style:** pill, Oswald 0.75rem uppercase, tracking 0.08em, translucent fill of its tone (15 to 20%) with the tone as text.
- **Group tag:** the commission's tint as fill and its ink as text, Montserrat semibold 0.75rem, not uppercase.
- **On photos:** opaque (ground at 80% with blur, or solid caribbean) because translucent tones vanish on light images.

### Cards / Containers
- **Corner Style:** 16px; group cards and headers 24px.
- **Background:** the hat's surface (white or Selva Alta); group cards use the group tint with a solid hairline at 40% and a white wash under nested team rows.
- **Shadow Strategy:** none at rest (see Elevation & Depth).
- **Border:** ink hairline at 10%.
- **Internal Padding:** 20px, 24px from 640px; list rows 14px by 16px.

### Inputs / Fields
- **Style:** 12px radius, ink hairline at 15%, ground at 60% as fill, 10px by 16px, 0.875rem; placeholder ink at 35%. Labels are semibold 0.875rem in heading ink.
- **Focus:** border turns action green plus a 2px action-green ring at 25%.

### Navigation
- **Hat switch:** two links (not a toggle) in a pill track with a 15% hairline; the active hat is a filled caribbean pill, the other is 70% ink. Each hat has its own landing page and back works.
- **Bottom tab bar (phone):** fixed, 95% surface with blur, top hairline, safe-area padding; items 64px tall, icon 22px over a 0.75rem semibold label; active is action green, inactive 70% ink. The Avisos tab carries the only unread badge: a candy circle with mono white count, «9+» above nine.
- **Rail (desktop):** 72px surface with a right hairline, icons centred; opens to 256px over the content after a 150ms hover pause (or on keyboard focus; Escape folds it), width eased in 0.22s with a soft shadow as state, labels fading in. Links 44px, 12px radius, 20px icons; active has a 12% action-green wash and green semibold text. Folded, group titles become a hairline, the Avisos count becomes a candy dot, the account becomes its avatar, and the hat switch becomes a vertical capsule of two icon pills: leaf («Lo mío») and sun («Junta»).
- **Bottom sheet:** rises from the edge in 0.28s with no bounce, 24px top radius, a 40px grab handle, max 80vh; Escape and scrim tap close it; it holds «Más», «Sistema» and «Tu cuenta».

### Task row (signature)
A rounded row on the surface: the task title in body weight, then the group tag and the state name, with the next-step pill at the right. Ordered in progress, pending, in review. In a group's board the same rows are grouped by state under a filter pill track (Activas, Mías, Hechas) with mono counts.

### Groups map
«Grupos» lists every commission of the collective, not only yours. Yours come first as full-tint group cards (role pill, your task count, who coordinates) with ALL their teams hanging inside: your teams on a white wash with a solid dot and a «Tu equipo» tag, the others flush on the tint with a hollow ring. Commissions you are not in follow under «Otras comisiones» as quiet surface cards with a solid dot, their teams named in one line, and an outlined «Pedir entrar» pill (it turns into «Pedida» with a clock after sending). Each team has its own page under its commission (back link names the commission), with its own task board and people.

### Sharing a group
Commission and team headers carry a «Compartir» pill (white at 60% on the group tint, group ink, share icon) that opens the phone's native share tray, or copies the panel link where there is none. The link is the panel URL itself with the site's generic preview, so the group name is not exposed. Opening it without a session goes through the login («Entra con tu cuenta para abrir el enlace que te compartieron») and returns to the group; the login only returns to /panel routes. A visitor who is not in the group sees, inside the header, why and what to do: «Pedir entrar» (jungle pill) for the commission, or the leader to ask for a team.

### Assigning tasks
Active tasks with nobody in charge open the board in their own «Sin responsable» section (terracotta dot and title; the row gets a terracotta hairline at 35%). For whoever coordinates or leads, a task's assignees are a button: tapping it opens an inline face picker under the row (pills with avatar, first name and a mono count of that person's active tasks); each tap saves. «Personas» shows each member's active-task count in mono under their name, and links to the unassigned tasks.

### Composer (Publicar)
The «Publicar» tab opens the composer directly (/panel/publicar; editing is /panel/publicar/:id); «Mis publicaciones» is a separate list under «Lo tuyo». A row of type pills with icons (Escrito, Fotos, Video, Música, Noticia when allowed) sits on top; Video and Música start with the link field, which recognises YouTube, Spotify and SoundCloud, switches the type if needed with a one-line caribbean note, and plays the embed inline. Photos go in a dashed drop zone (several at once, drag and drop), shown as a 3-column grid where the first carries a «Portada» tag and round icon buttons reorder or remove. Tags are chips with suggestions from the tags the collective already uses (case- and accent-insensitive); the first chip is filled in action green and the line below spells out «Tipo · etiqueta». Visibility is a two-option segmented pill («Todo el mundo | Solo miembros»). The live preview is the Mural piece itself (same component) on a jungle wall with the Dorace pattern, wrapped in .colores-sitio so it keeps the public palette inside «Lo mío»; it sits in a 224px sticky column from 1024px and just above the Publicar button on phones. Drafts autosave to the device and come back through a caribbean-tinted notice («Seguir con él | Descartar»). After publishing, a centred success view shows the piece with «Ver en el Mural», «Compartir» (public posts only), «Publicar otra» and «Mis publicaciones».

**The Other World Rule.** A piece of the public site shown inside the panel (the composer preview) wears .colores-sitio, which restores the real palette that the «Lo mío» hat remaps.

### Open calls (Convocatorias)
Junta: «Convocatorias» under «Más» (permission convocatorias.gestionar). The list puts open calls and unreviewed responses first, with the response count in mono and a candy count pill for the new ones. The editor builds questions as numbered cards: a label, optional help, a pill row for the type (Texto corto, Texto largo, Enlace, Monto, each with its icon), an «Obligatoria» checkbox and round icon buttons to reorder or remove. An empty call offers the «tallerista» template. Once responses exist, a question can't change type or be removed (both locked, with a reason in the title). The call page carries its state chip, a primary state action («Abrir convocatoria», «Cerrar», «Reabrir»), «Compartir», «Ver como el público» and «Editar». Responses are collapsible cards (new ones with a candy hairline, the compared amount in mono at the right), filterable by state, sortable «Por llegada» or by the amount question. Inside each card are all answers, mail and WhatsApp links, and a «Evaluación de la Junta» box with a four-state radio row and a private note.
Public page (/convocatorias/:id, light site world): a tea strip under the navbar invites outsiders to join («Quiero unirme», «Ya soy miembro: entrar», which returns to the call) or tells a logged-in person that their profile data is used. Then a jungle Dorace hero, the description, and a white form card. Name, mail and WhatsApp are asked only without a session. Amount fields carry a «$» prefix and mono digits; a hidden honeypot catches bots; the candy «Enviar propuesta» button follows the public site's CTA convention. The confirmation replaces the form and is scrolled into view.

### Gritos card (signature)
A surface card with a megaphone in a quiet circle, the author line, the title in Oswald, date, time and place, then slot dots: filled cream dots for taken places, hairline rings for free ones, followed by «N de M van».

## Do's and Don'ts

### Do:
- **Do** write panel pages with palette role names (`bg-jungle`, `text-tea`, `text-cream`, `bg-caribbean`) so one page renders correctly in both hats.
- **Do** carry a commission's tint, ink and solid through `varsDeColor()` wherever its tasks, cards or header appear, and let teams inherit the parent's triple.
- **Do** take every panel icon from `src/panel/Ico.jsx` (24px viewBox, 1.7 stroke, round caps), including arrows, plus and chevrons; a missing glyph (such as close) is added to that set, not typed.
- **Do** keep every target at least 44px and every text at least 12px.
- **Do** use the Dorace pattern on dark grounds only: public dark sections and the «Junta» ground.
- **Do** honour prefers-reduced-motion: the hat transition, sheet rise, reveal and toast slides all switch off.
- **Do** say plainly when there is nothing or an error, in a dashed or candy-hairline box with a way forward.

### Don't:
- **Don't** use candy for categories, file types, decoration or primary actions.
- **Don't** mark a group, state or notice with a coloured edge stripe; use the tint as a ground or a solid dot.
- **Don't** use Unicode characters as icons (✓, ✕, →, +, ▾) in the panel.
- **Don't** add a second home for notices: unread lives only on the Avisos tab badge and the Avisos page, never in a bell or a dashboard list too.
- **Don't** put a small uppercase label above a page or card title to restate the section; the navigation already says where you are.
- **Don't** hard-code hat hexes in panel pages, except for an element deliberately showing the other hat.
- **Don't** add rows of counter tiles as a landing view; lead with what the person has to do.
