function updateCurrentTime() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  const total = h * 3600 + m * 60 + s;
  const percent = (total / 86400) * 100;
  document.getElementById("currentTime").style.left = percent + "%";
}

updateCurrentTime();
setInterval(updateCurrentTime, 60000);

const events = document.querySelectorAll(".event");
const popup = document.getElementById("popupBox");
const title = document.getElementById("popupTitle");
const time = document.getElementById("popupTime");
const timeline = document.getElementById("timeline");

events.forEach(e => {
  e.addEventListener("click", (event) => {
    event.stopPropagation();
    title.textContent = e.dataset.title;
    time.textContent = e.dataset.time;

    const rect = e.getBoundingClientRect();
    const containerRect = timeline.getBoundingClientRect();
    const offsetX = rect.left - containerRect.left + rect.width / 2;

    popup.style.left = offsetX + containerRect.left + "px";
    popup.style.top = containerRect.top - 10 + "px";
    popup.classList.add("show");

    setTimeout(() => popup.classList.remove("show"), 3000);
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("event") && !popup.contains(e.target)) {
    popup.classList.remove("show");
  }
});
