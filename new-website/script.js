const root = document.documentElement;
const yearEl = document.getElementById("year");
const paletteBtn = document.getElementById("palette-btn");
const exploreBtn = document.getElementById("explore-btn");
const contactForm = document.getElementById("contact-form");
const emailInput = document.getElementById("email");
const formMessage = document.getElementById("form-message");

const palettes = [
  {
    name: "Ember",
    accent: "#da4d2f",
    accent2: "#155c93"
  },
  {
    name: "Evergreen",
    accent: "#0f7b6c",
    accent2: "#9a4119"
  },
  {
    name: "Berry",
    accent: "#bc2a66",
    accent2: "#2f5b9b"
  }
];

const savedPaletteIndex = Number.parseInt(localStorage.getItem("palette-index") ?? "0", 10);
let paletteIndex = savedPaletteIndex >= 0 && savedPaletteIndex < palettes.length
  ? savedPaletteIndex
  : 0;

function applyPalette(index) {
  const palette = palettes[index];
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-2", palette.accent2);
  paletteBtn.setAttribute(
    "aria-label",
    `Current palette: ${palette.name}. Change website color palette.`
  );
}

paletteBtn.addEventListener("click", () => {
  paletteIndex = (paletteIndex + 1) % palettes.length;
  localStorage.setItem("palette-index", String(paletteIndex));
  applyPalette(paletteIndex);
});

exploreBtn.addEventListener("click", () => {
  document.getElementById("work").scrollIntoView({ behavior: "smooth" });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!emailInput.checkValidity()) {
    emailInput.setAttribute("aria-invalid", "true");
    formMessage.textContent = "Enter a valid email so we can contact you.";
    formMessage.dataset.state = "error";
    emailInput.focus();
    return;
  }

  emailInput.removeAttribute("aria-invalid");
  formMessage.textContent = "Thanks. We will send a proposal soon.";
  formMessage.dataset.state = "success";
  contactForm.reset();
});

emailInput.addEventListener("input", () => {
  emailInput.removeAttribute("aria-invalid");
  formMessage.textContent = "";
  delete formMessage.dataset.state;
});

yearEl.textContent = String(new Date().getFullYear());
applyPalette(paletteIndex);
