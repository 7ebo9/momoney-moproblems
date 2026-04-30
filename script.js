let content = {};
let points = [];

const slider = document.getElementById("money-slider");
const title = document.getElementById("site-title");
const subtitle = document.getElementById("site-subtitle");
const tierName = document.getElementById("tier-name");
const tierCaption = document.getElementById("tier-caption");
const curvePath = document.getElementById("curve-path");
const currentDot = document.getElementById("current-dot");
const sweetLineLeft = document.getElementById("sweet-line-left");
const sweetLineRight = document.getElementById("sweet-line-right");
const sweetLineBottom = document.getElementById("sweet-line-bottom");
const sweetArrowLeft = document.getElementById("sweet-arrow-left");
const sweetArrowRight = document.getElementById("sweet-arrow-right");
const sweetDot = document.getElementById("sweet-dot");
const sweetLabel = document.getElementById("sweet-label");
const problemsList = document.getElementById("problems-list");
const sweetMessage = document.getElementById("sweet-message");
const finalMessage = document.getElementById("final-message");
const musicEmbed = document.getElementById("music-embed");
const shareButton = document.getElementById("share-button");
const visitorCount = document.getElementById("visitor-count");

init();

async function init() {
  const response = await fetch("content.json", { cache: "no-store" });
  content = await response.json();

  applyContent();
  buildGraph();
  update(Number(slider.value));
  loadVisitorCounter();

  slider.addEventListener("input", () => update(Number(slider.value)));
  shareButton.addEventListener("click", sharePage);
}

function applyContent() {
  title.innerText = content.title;
  subtitle.innerText = content.subtitle;
  musicEmbed.innerHTML = content.musicEmbedHtml || "";
  slider.min = 0;
  slider.max = content.tiers.length - 1;
  slider.step = 1;
  slider.value = 0;
}

function buildGraph() {
  const left = 150, right = 780, top = 105, bottom = 356;
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
  const bracketY = 406;
  const bracketHalfWidth = 155;
  const leftX = sweet.x - bracketHalfWidth;
  const rightX = sweet.x + bracketHalfWidth;

  sweetDot.setAttribute("cx", sweet.x);
  sweetDot.setAttribute("cy", sweet.y);

  sweetLineLeft.setAttribute("x1", leftX);
  sweetLineLeft.setAttribute("x2", leftX);
  sweetLineLeft.setAttribute("y1", bracketY - 58);
  sweetLineLeft.setAttribute("y2", bracketY + 12);

  sweetLineRight.setAttribute("x1", rightX);
  sweetLineRight.setAttribute("x2", rightX);
  sweetLineRight.setAttribute("y1", bracketY - 58);
  sweetLineRight.setAttribute("y2", bracketY + 12);

  sweetLineBottom.setAttribute("x1", leftX + 8);
  sweetLineBottom.setAttribute("x2", rightX - 8);
  sweetLineBottom.setAttribute("y1", bracketY);
  sweetLineBottom.setAttribute("y2", bracketY);

  sweetArrowLeft.setAttribute("points", `${leftX + 8},${bracketY} ${leftX + 22},${bracketY - 8} ${leftX + 22},${bracketY + 8}`);
  sweetArrowRight.setAttribute("points", `${rightX - 8},${bracketY} ${rightX - 22},${bracketY - 8} ${rightX - 22},${bracketY + 8}`);

  sweetLabel.setAttribute("x", sweet.x);
  sweetLabel.setAttribute("y", bracketY - 19);
}

function makeSmoothPath(pts) {
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

  renderProblems(point.tier.questions || [], isSweet);
}

function renderProblems(questions, isSweet) {
  problemsList.innerHTML = "";

  if (!questions.length) {
    const li = document.createElement("li");
    li.className = "peace";
    li.textContent = isSweet ? "No major financial questions." : "No problems listed.";
    problemsList.appendChild(li);
    return;
  }

  questions.forEach((question, index) => {
    const li = document.createElement("li");
    li.textContent = question;
    li.style.animationDelay = `${index * 70}ms`;
    problemsList.appendChild(li);
  });
}

async function sharePage() {
  const shareData = { title: document.title, text: content.subtitle, url: window.location.href };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {}
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

async function loadVisitorCounter() {
  const key = "mmmp_unique_visitor_counted_v1";
  const namespace = content.counterNamespace || "mo-money-mo-problems";
  const counterKey = content.counterKey || "unique-visitors";

  try {
    if (!localStorage.getItem(key)) {
      const hit = await fetch(`https://api.countapi.xyz/hit/${namespace}/${counterKey}`);
      const data = await hit.json();
      localStorage.setItem(key, "true");
      visitorCount.textContent = formatCount(data.value);
      return;
    }

    const get = await fetch(`https://api.countapi.xyz/get/${namespace}/${counterKey}`);
    const data = await get.json();
    visitorCount.textContent = formatCount(data.value || 0);
  } catch (error) {
    visitorCount.textContent = "—";
  }
}

function formatCount(value) {
  return Number(value || 0).toLocaleString("en-US");
}
