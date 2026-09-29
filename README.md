# Chauka

*Chauka* is an interactive data story blending sea-level rise data with storytelling from Manus Island, Papua New Guinea.

Built with **Next.js, React and Three.js**, data visualization, local storytelling and sound to create a layered way of engaging with climate data.

The project was created in collaboration with **Bertha Ngahan** (Storytelling) from Manus Island for the **Pacific Dataviz Challenge**.

🎧 **Sound on for the full experience.**

## About the story

Chauka is a bird endemic to Manus Island and deeply embedded in local culture. In many tales, it appears as a timekeeper or a warning that change is coming.

The experience moves between storytelling and analytical spaces. As natural disasters intensify, floods begin to overlap charts and text, deliberately disrupting the viewer's ability to focus. Acts of resistance eventually push back, before both become stars in an inverted night sky.

The final scene asks us to consider our role as navigators of our own future and that of generations to come.

## Tech

Next.js · React · Three.js · JavaScript

## Running it locally

    npm install
    npm run dev

Then open http://localhost:3000. There are no environment variables and no
database: every chart reads a CSV from `public/`.

    npm run build     # production build, the same one Vercel runs
    npm run lint

## How the page is put together

`src/app/page.jsx` is the whole story: a scroll-snap container with the hero,
the title section, six story sections, the star sky (section 7) and the
method section (section 8).

| Piece | Where |
| --- | --- |
| One story section (header, text, chart, caption) | `src/components/sections/SegmentTemplate.jsx` |
| Title section with the Spilhaus map | `src/components/sections/TitleSection.jsx` |
| The five charts | `src/app/components/*Chart*.jsx` |
| The dots over sections 1-6 | `src/app/components/StoryDots.jsx` |
| Where the dots come from and how they are laid out | `src/app/components/storyDotsData.js` |
| The two star skies | `src/app/components/InteractiveStarGlobe*.jsx` |
| Shared CSS, including the responsive rules | `src/app/globals.css` |

### The dots

Blue dots are climate hazards recorded in the Pacific, read from
`public/Disaster_Dataset_with_Summaries_fixed.csv`. Yellow dots are acts of
climate resistance, from `public/Climate_Resistance_Tooltips.csv`.

A dot's vertical position is its year on a shared 1900 - today scale, given in
percent of the overlay. The overlay covers story sections 1 to 6, so hazards
start sparse at the beginning of the story and pile up towards section 6 -
that is the data, not a setting: 1 recorded event in the 1910s, 84 in the
2000s. Resistance dots only exist from 1990 on and stop where section 7
begins. The thin line on the right with four year marks is the same scale.

### Keeping it responsive

Two rules that the layout depends on:

1. Anything that sits on top of artwork is positioned in **percent of that
   artwork**, never in pixels - see `.scene-stage` / `.scene-box` in
   `globals.css`. That is what keeps the bird button on the bird.
2. Anything that spans several sections is a **child of those sections**,
   not a box placed at a fixed offset - see how `StoryDots` is mounted in
   `page.jsx`.
