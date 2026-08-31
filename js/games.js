// PixelDeck game registry.
// To add a new game later: append one object here. Nothing else in the
// project needs to change — index.html and play.html both read this file.
//
// fields:
//   slug   - unique id, used in the URL as play.html?g=<slug>
//   title  - card title / page title
//   desc   - one-line description shown on the card
//   icon   - emoji glyph used as the card thumbnail (or set `thumb` below)
//   thumb  - optional path to a real image (assets/thumbs/xxx.png); if set,
//            it's used instead of `icon`
//   url    - the game's live, independently-deployed GitHub Pages URL
//   accent - hex color used for the card's border/glow

window.PIXELDECK_GAMES = [
  {
    slug: "basketball",
    title: "Basketball Shooter",
    desc: "Aim, shoot, and rack up baskets against the clock.",
    icon: "🏀",
    url: "https://shoaibul0926.github.io/My-first-game/",
    accent: "#ff6b35"
  },
  {
    slug: "space-shooter",
    title: "Space Shooter",
    desc: "Blast waves of enemy ships and dodge incoming fire.",
    icon: "🚀",
    url: "https://shoaibul0926.github.io/space-shooter-game/",
    accent: "#00e5ff"
  },
  {
    slug: "mario",
    title: "Mario-Style Platformer",
    desc: "Run, jump, and stomp your way through side-scrolling levels.",
    icon: "🍄",
    url: "https://shoaibul0926.github.io/my-mario-game/",
    accent: "#ff3860"
  },
  {
    slug: "car-racing",
    title: "Car Racing",
    desc: "Weave through traffic and set your best lap time.",
    icon: "🏎️",
    url: "https://shoaibul0926.github.io/car-racing-game/",
    accent: "#ffdd57"
  },
  {
    slug: "flappy-bird",
    title: "Flappy Bird Clone",
    desc: "Tap to flap and squeeze through the pipes.",
    icon: "🐦",
    url: "https://shoaibul0926.github.io/flappybird-game/",
    accent: "#7ee787"
  },
  {
    slug: "snake",
    title: "Snake",
    desc: "Classic grid-crawling snake — eat, grow, don't crash.",
    icon: "🐍",
    url: "https://shoaibul0926.github.io/snake-game/",
    accent: "#39d353"
  },
  {
    slug: "sudoku",
    title: "Sudoku",
    desc: "Fill the grid, one logical deduction at a time.",
    icon: "🔢",
    url: "https://shoaibul0926.github.io/Sudoku-game/",
    accent: "#b39cff"
  }
];
