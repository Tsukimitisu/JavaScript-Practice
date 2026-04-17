const root = document.documentElement;
const yearEl = document.getElementById("year");
const paletteBtn = document.getElementById("palette-btn");
const exploreBtn = document.getElementById("explore-btn");
const contactForm = document.getElementById("contact-form");
const emailInput = document.getElementById("email");
const formMessage = document.getElementById("form-message");

const palettes = [
  {
    accent: "#da4d2f",
    accent2: "#155c93"
  },
  {
    accent: "#0f7b6c",
    accent2: "#9a4119"
  },
  {
    accent: "#bc2a66",
    accent2: "#2f5b9b"
  }
];

let paletteIndex = 0;

function applyPalette(index) {
  const palette = palettes[index];
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-2", palette.accent2);
}

paletteBtn.addEventListener("click", () => {
  paletteIndex = (paletteIndex + 1) % palettes.length;
  applyPalette(paletteIndex);
});

exploreBtn.addEventListener("click", () => {
  document.getElementById("work").scrollIntoView({ behavior: "smooth" });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!emailInput.checkValidity()) {
    formMessage.textContent = "Enter a valid email so we can contact you.";
    formMessage.style.color = "#bc2a66";
    return;
  }

  formMessage.textContent = "Thanks. We will send a proposal soon.";
  formMessage.style.color = "#0f7b6c";
  contactForm.reset();
});

yearEl.textContent = String(new Date().getFullYear());
applyPalette(paletteIndex);
