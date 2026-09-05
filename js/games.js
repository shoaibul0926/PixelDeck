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
    url: "https://shoaibul0926.github.io/new-mario-game/",
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
  },
  {
    slug: "brick-breaker",
    title: "Brick Breaker",
    desc: "Bounce, break, and chain combos through neon brick walls.",
    icon: "🧱",
    url: "https://shoaibul0926.github.io/brick-breaker-game/",
    accent: "#b46bff"
  },
  {
    slug: "fruit-slice",
    title: "Fruit Slice",
    desc: "Swipe to slice fruit, chain combos, and dodge the bombs.",
    icon: "🍉",
    url: "https://shoaibul0926.github.io/fruit-slice-game/",
    accent: "#ff8c42"
  },
  {
    slug: "bubble-pop",
    title: "Bubble Pop",
    desc: "Aim and shoot to match 3+ bubbles before they reach the line.",
    icon: "🫧",
    url: "https://shoaibul0926.github.io/bubble-pop-game/",
    accent: "#4fc3f7"
  },
  {
    slug: "bird-hunt",
    title: "Bird Hunt",
    desc: "Aim, reload, and shoot waves of birds — just don't hit the decoy.",
    icon: "🦅",
    url: "https://shoaibul0926.github.io/bird-hunt-game/",
    accent: "#ffb347"
  },
  {
    slug: "whack-a-mole",
    title: "Whack-A-Mole",
    desc: "Whack moles before they retreat — watch out for the bombs.",
    icon: "🔨",
    url: "https://shoaibul0926.github.io/whack-a-mole-game/",
    accent: "#8bc34a"
  },
  {
    slug: "block-stacker",
    title: "Block Stacker",
    desc: "Rotate and stack falling blocks to clear lines before they pile up.",
    icon: "🧊",
    url: "https://shoaibul0926.github.io/block-stacker-game/",
    accent: "#5b6ee1"
  },
  {
    slug: "number-merge",
    title: "Number Merge",
    desc: "Slide and merge matching tiles to reach the target number.",
    icon: "🔢",
    url: "https://shoaibul0926.github.io/number-merge-game/",
    accent: "#ffb400"
  },
  {
    slug: "simon-sequence",
    title: "Simon Sequence",
    desc: "Watch the pattern, repeat it back — one slip ends the streak.",
    icon: "🔵",
    url: "https://shoaibul0926.github.io/simon-sequence-game/",
    accent: "#cf6bff"
  },
  {
    slug: "road-crosser",
    title: "Road Crosser",
    desc: "Dodge traffic and ride logs across the river to reach home.",
    icon: "🐸",
    url: "https://shoaibul0926.github.io/road-crosser-game/",
    accent: "#3ddc6a"
  }
];
