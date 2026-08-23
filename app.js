const BUSINESS = {
  name: "FadeLab Barbers",
  phone: "(206) 555-0198",
  address: "123 Example Ave, Seattle, WA",
  hours: "Monday–Saturday, 9 AM–7 PM; Sunday closed",
  services: [
    { name: "Classic Cut", price: 35, desc: "Scissor or clipper cut with a clean finish." },
    { name: "Skin Fade", price: 45, desc: "Tight skin fade with a sharp lineup." },
    { name: "Cut + Beard", price: 60, desc: "Full haircut plus beard trim and lineup." },
    { name: "Kids Cut", price: 30, desc: "Fresh cut for kids 12 and under." },
    { name: "Beard Shape-Up", price: 25, desc: "Trim, shape, hot-towel finish." },
    { name: "Premium Cut", price: 75, desc: "Cut, beard, hot towel and styling." }
  ],
  reviews: [
    ["Marcus R.", "Best fade I've had in Seattle. Super clean every time."],
    ["Jayden T.", "Booking took like 30 seconds. Cut was exactly what I asked for."],
    ["Amin K.", "Great barbers, good vibes, never left disappointed."]
  ]
};

const $ = selector => document.querySelector(selector);
const serviceGrid = $("#serviceGrid");
const serviceSelect = $("#serviceSelect");
const reviewGrid = $("#reviewGrid");
const leadForm = $("#leadForm");
const dateInput = $("#bookingDate");
const timeInput = $("#bookingTime");
const summaryService = $("#summaryService");
const summaryTime = $("#summaryTime");
const formMessage = $("#formMessage");

BUSINESS.services.forEach((service, index) => {
  serviceGrid.innerHTML += `<article class="service"><div class="service-top"><h3>${service.name}</h3><span class="price">$${service.price}</span></div><p>${service.desc}</p><button data-book="${index}">Book this</button></article>`;
  serviceSelect.innerHTML += `<option value="${service.name}">${service.name} — $${service.price}</option>`;
});
BUSINESS.reviews.forEach(review => {
  reviewGrid.innerHTML += `<article class="review"><div class="stars">★★★★★</div><p>"${review[1]}"</p><strong>${review[0]}</strong></article>`;
});

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}
function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function refreshSummary() {
  summaryService.textContent = serviceSelect.value || "Choose a service";
  const day = formatDate(dateInput.value);
  summaryTime.textContent = day && timeInput.value ? `${day} · ${timeInput.value}` : "Choose a day and time";
}
function selectDate(value, clickedChip) {
  dateInput.value = value;
  document.querySelectorAll(".date-chip").forEach(chip => chip.classList.toggle("active", chip === clickedChip));
  refreshSummary();
}

dateInput.min = localDate();
dateInput.value = localDate();
document.querySelectorAll(".date-chip").forEach((chip, index) => {
  const value = localDate(index);
  chip.dataset.value = value;
  chip.addEventListener("click", () => selectDate(value, chip));
});
dateInput.addEventListener("change", () => {
  document.querySelectorAll(".date-chip").forEach(chip => chip.classList.toggle("active", chip.dataset.value === dateInput.value));
  refreshSummary();
});
serviceSelect.addEventListener("change", refreshSummary);
document.querySelectorAll(".time-slot").forEach(slot => {
  slot.addEventListener("click", () => {
    document.querySelectorAll(".time-slot").forEach(button => button.classList.remove("active"));
    slot.classList.add("active");
    timeInput.value = slot.textContent.trim();
    refreshSummary();
  });
});
refreshSummary();

document.querySelectorAll("[data-book]").forEach(button => {
  button.addEventListener("click", () => {
    serviceSelect.selectedIndex = Number(button.dataset.book);
    refreshSummary();
    location.hash = "book";
  });
});

leadForm.addEventListener("submit", event => {
  event.preventDefault();
  formMessage.className = "form-message";
  if (!timeInput.value) {
    formMessage.textContent = "Pick an available time before sending your request.";
    formMessage.classList.add("error");
    document.querySelector(".time-slots").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const data = Object.fromEntries(new FormData(leadForm).entries());
  const request = { ...data, createdAt: new Date().toISOString(), status: "requested" };
  const leads = JSON.parse(localStorage.getItem("fadelab_leads") || "[]");
  leads.push(request);
  localStorage.setItem("fadelab_leads", JSON.stringify(leads));
  formMessage.textContent = `Request received for ${data.service} on ${formatDate(data.date)} at ${data.time}. We’ll text ${data.phone} to confirm.`;
  formMessage.classList.add("success");
  leadForm.querySelectorAll("input, select, textarea, button").forEach(element => { if (!element.classList.contains("date-chip")) element.disabled = true; });
});

const modal = $("#assistantModal");
const chat = $("#chat");
function openAssistant() { modal.classList.remove("hidden"); }
function closeAssistant() { modal.classList.add("hidden"); }
$("#openAssistant").onclick = openAssistant;
$("#assistantBubble").onclick = openAssistant;
$("#closeAssistant").onclick = closeAssistant;

function answer(question) {
  const text = question.toLowerCase();
  if (text.includes("price") || text.includes("cost") || text.includes("how much")) return "Cuts start at $30. A skin fade is $45, and Cut + Beard is $60. Want to book?";
  if (text.includes("hour") || text.includes("open") || text.includes("close")) return `We're open ${BUSINESS.hours}.`;
  if (text.includes("where") || text.includes("location") || text.includes("address")) return `We're at ${BUSINESS.address}.`;
  if (text.includes("book") || text.includes("appointment") || text.includes("schedule")) return "Easy — choose your service, day, and time in the booking section, then send your request.";
  if (text.includes("walk")) return "Yep, walk-ins are welcome when a barber is available. Booking ahead is safest.";
  if (text.includes("beard")) return "Beard Shape-Up is $25, Cut + Beard is $60, and Premium Cut is $75.";
  return "I can help with prices, services, hours, location, walk-ins, or booking.";
}
function sendMessage(text) {
  if (!text.trim()) return;
  chat.innerHTML += `<div class="msg user">${text}</div>`;
  setTimeout(() => {
    chat.innerHTML += `<div class="msg bot">${answer(text)}</div>`;
    chat.scrollTop = chat.scrollHeight;
  }, 250);
  chat.scrollTop = chat.scrollHeight;
}
$("#chatForm").addEventListener("submit", event => {
  event.preventDefault();
  sendMessage($("#chatInput").value);
  $("#chatInput").value = "";
});
document.querySelectorAll(".quick button").forEach(button => button.onclick = () => sendMessage(button.dataset.q));