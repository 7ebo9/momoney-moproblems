const SVG_NS = "http://www.w3.org/2000/svg";

const defaultContent = {
  title: "MO MONEY\nMO PROBLEMS",
  subtitle: "Money solves problems… until it invents new ones.",
  sweetSpotIndex: 5,
  sweetSpotMessage:
    "Congratulations. You made it to The Sweet Spot. Your wealth level has gifted you stress relief, answered most of life’s financial worries, and given you and your children stability. You are now free to use your disposable time and income to do what you truly love.",
  finalMessage: "What was the point again?",
  musicEmbedHtml:
    "<iframe height=\"152\" src=\"https://open.spotify.com/embed/track/4INDiWSKvqSKDEu7mh8HFz?utm_source=generator\" allow=\"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture\" loading=\"lazy\"></iframe>",
  tiers: [
    {
      name: "Survival Mode",
      caption: "Money is not abstract here. It is rent, food, transport, and breathing room.",
      value: 10,
      questions: [
        "Can I pay rent?",
        "Can I cover bills?",
        "What if I get sick?",
        "Can I fix the car?",
        "Can I make it to next month?",
        "What can I delay?",
        "Is there anything left after food?"
      ]
    },
    {
      name: "Bills Covered",
      caption: "The emergency siren is quieter, but still plugged in.",
      value: 8,
      questions: [
        "Can I save anything?",
        "What if a bill doubles?",
        "Can I afford insurance?",
        "Is this stability or just a good month?",
        "Can I say yes to dinner?"
      ]
    },
    {
      name: "Stable Ground",
      caption: "Life stops feeling like a trap door every morning.",
      value: 6,
      questions: [
        "How much should I save?",
        "Can I take a small trip?",
        "What if work slows down?",
        "Should I finally fix that thing?"
      ]
    },
    {
      name: "Comfortable",
      caption: "A little oxygen enters the room.",
      value: 5,
      questions: [
        "Can I invest now?",
        "What is the sensible next step?",
        "How much buffer is enough?"
      ]
    },
    {
      name: "Secure",
      caption: "The future starts looking less like a threat.",
      value: 4.4,
      questions: [
        "How do I protect this?",
        "What should I build next?"
      ]
    },
    {
      name: "The Sweet Spot",
      caption: "Comfortable home, passive income, future secured for children, freedom of time.",
      value: 3.8,
      questions: []
    },
    {
      name: "Extra Comfortable",
      caption: "The answers are still useful, but new questions have entered the chat.",
      value: 4.5,
      questions: [
        "Should I buy another property?",
        "Do I need to rebalance investments?",
        "Why am I checking markets daily?"
      ]
    },
    {
      name: "Asset Weather",
      caption: "The portfolio has moods now.",
      value: 6,
      questions: [
        "Who manages all this?",
        "Is my accountant worried?",
        "Do I need another advisor?",
        "Is this enough for three generations?",
        "Why does my peer have more?"
      ]
    },
    {
      name: "Admin Dynasty",
      caption: "You escaped scarcity and entered scheduling.",
      value: 8,
      questions: [
        "Which entity owns which thing?",
        "Did I optimize the structure correctly?",
        "Are my children too comfortable?",
        "Why do I have six calendars?",
        "Who manages the person who manages this?"
      ]
    },
    {
      name: "Endless Tabs Open",
      caption: "Wealth unlocked: endless tabs open.",
      value: 10,
      questions: [
        "Should the yacht have a gym?",
        "Which tax jurisdiction matches my mood?",
        "Do I need a retreat to recover from the retreat?",
        "Why does the second chef need a consultant?",
        "Am I diversified emotionally?"
      ]
    },
    {
      name: "Fully Detached From the Human Experience",
      caption: "The curve has become a mirror and nobody likes that.",
      value: 12,
      questions: [
        "Which assistant manages the assistants?",
        "Should I buy privacy or silence?",
        "Why does everyone want a meeting?",
        "Is the island too visible?",
        "What was the point again?"
      ]
    }
  ]
};

let content = defaultContent;
let points = [];
let questionTimer = null;

const slider = document.getElementById("money-slider");
const title = document.getElementById("site-title");
const subtitle = document.getElementById("site-subtitle");
const tierName = document.getElementById("tier-name");
const tierCaption = document.getElementById("tier-caption");
const curvePath = document.getElementById("curve-path");
const currentDot = document.getElementById("current-dot");
const sweetLine = document.getElementById("sweet-line");
const sweetDot = document.getElementById("sweet-dot");
const sweetLabel = document.getElementById("sweet-label");
const questionLayer = document.getElementById("question-layer");
const sweetMessage = document.getElementById("sweet-message");
const finalMessage = document.getElementById("final-message");
const musicEmbed = document.getElementById("music-embed");
const shareButton = document.getElementById("share-button");

init();

async function init() {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    if (response.ok) {
      content = await response.json();
    }
  } catch (err) {
    console.warn("Using default content because content.json could not be loaded.", err);
  }

  applyContent();
  buildGraph();
  update(Number(slider.value));

  slider.addEventListener("input", () => update(Number(slider.value)));
  shareButton.addEventListener("click", sharePage);
}

function applyContent() {
  title.innerText = content.title || defaultContent.title;
  subtitle.innerText = content.subtitle || defaultContent.subtitle;
  musicEmbed.innerHTML = content.musicEmbedHtml || "";
  slider.min = 0;
  slider.max = content.tiers.length - 1;
  slider.step = 1;
  slider.value = 0;
}

function buildGraph() {
  const left = 150;
  const right = 780;
  const top = 105;
  const bottom = 392;
  const maxValue = Math.max(...content.tiers.map(t => t.value));
  const minValue = Math.min(...content.tiers.map(t => t.value));
  const range = maxValue - minValue || 1;

  points = content.tiers.map((tier, index) => {
    const x = left + (index / (content.tiers.length - 1)) * (right - left);
    const normalized = (tier.value - minValue) / range;
    const y = bottom - normalized * (bottom - top);
    return { x, y, tier, index };
  });

  curvePath.setAttribute("d", makeSmoothPath(points));

  const sweet = points[content.sweetSpotIndex];
  sweetDot.setAttribute("cx", sweet.x);
  sweetDot.setAttribute("cy", sweet.y);
  sweetLine.setAttribute("x1", sweet.x);
  sweetLine.setAttribute("x2", sweet.x);
  sweetLine.setAttribute("y1", sweet.y);
  sweetLine.setAttribute("y2", 430);
  sweetLabel.setAttribute("x", sweet.x);
  sweetLabel.setAttribute("y", sweet.y + 42);
}

function makeSmoothPath(pts) {
  if (!pts.length) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

function update(index) {
  const point = points[index];
  if (!point) return;

  tierName.textContent = point.tier.name;
  tierCaption.textContent = point.tier.caption || "";
  currentDot.setAttribute("cx", point.x);
  currentDot.setAttribute("cy", point.y);

  const isSweet = index === content.sweetSpotIndex;
  const isFinal = index === content.tiers.length - 1;

  sweetMessage.hidden = !isSweet;
  sweetMessage.textContent = isSweet ? content.sweetSpotMessage : "";

  finalMessage.hidden = !isFinal;
  finalMessage.textContent = isFinal ? content.finalMessage : "";

  startQuestions(index);
}

function startQuestions(index) {
  clearInterval(questionTimer);
  questionLayer.innerHTML = "";

  const tier = content.tiers[index];
  if (!tier.questions || tier.questions.length === 0) return;

  const quantity = Math.min(tier.questions.length, Math.max(2, Math.round(tier.value / 1.6)));
  spawnBatch(tier.questions, quantity);

  questionTimer = setInterval(() => {
    spawnBatch(tier.questions, Math.max(1, Math.round(quantity / 2)));
  }, 2300);
}

function spawnBatch(questions, quantity) {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  shuffled.slice(0, quantity).forEach((text, i) => {
    setTimeout(() => spawnQuestion(text), i * 180);
  });
}

function spawnQuestion(text) {
  const el = document.createElement("div");
  el.className = "question";
  el.textContent = text;

  const x = 15 + Math.random() * 70;
  const y = 18 + Math.random() * 62;

  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  el.style.setProperty("--duration", `${3.8 + Math.random() * 2.4}s`);

  questionLayer.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 6800);
}

async function sharePage() {
  const shareData = {
    title: document.title,
    text: content.subtitle,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      // user cancelled or browser blocked it
    }
  }

  try {
    await navigator.clipboard.writeText(window.location.href);
    shareButton.textContent = "Link copied";
    setTimeout(() => (shareButton.textContent = "Share"), 1600);
  } catch (err) {
    shareButton.textContent = "Copy failed";
    setTimeout(() => (shareButton.textContent = "Share"), 1600);
  }
}
