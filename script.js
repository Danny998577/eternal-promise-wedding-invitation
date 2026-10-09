const entryScreen = document.getElementById("entryScreen");
const invitation = document.getElementById("invitation");
const openButton = document.getElementById("openInvitation");
const mainMusicToggle = document.getElementById("mainMusicToggle");
const bgm = document.getElementById("bgm");
const musicButtons = document.querySelectorAll(".music-toggle");

let musicOn = false;

function updateMusicButtons() {
    if (!bgm) return;

    bgm.volume = 0.28;

    musicButtons.forEach((button) => {
        const label = musicOn ? "Turn background music off" : "Turn background music on";
        button.setAttribute("aria-label", label);
        button.title = label;

        if (musicOn) {
            button.classList.remove("is-muted");
            button.textContent = "♫ Song On";
        } else {
            button.classList.add("is-muted");
            button.textContent = "♫ Song Off";
        }
    });
}

async function toggleMusic() {
    if (!bgm) return;

    if (musicOn || !bgm.paused) {
        musicOn = false;
        bgm.pause();
        updateMusicButtons();
        return;
    }

    try {
        const playback = bgm.play();
        musicOn = true;
        updateMusicButtons();
        await playback;
        musicOn = !bgm.paused;
    } catch (error) {
        console.log("Audio play was blocked until user interaction.");
        musicOn = false;
    }

    updateMusicButtons();
}

musicButtons.forEach((button) => {
    button.addEventListener("click", toggleMusic);
});

function openInvitation() {
    if (invitation.classList.contains("visible")) return;

    invitation.classList.add("visible");
    mainMusicToggle.hidden = false;
    entryScreen.classList.add("opened");
    document.body.style.overflowY = "auto";
    window.removeEventListener("wheel", handleEntryWheel);

    if (!musicOn) {
        toggleMusic();
    }
}
entryScreen.addEventListener("click", openInvitation);

let startY = 0;

entryScreen.addEventListener("touchstart", function(event) {
    startY = event.touches[0].clientY;
}, { passive: true });

entryScreen.addEventListener("touchend", function(event) {
    const endY = event.changedTouches[0].clientY;
    if (startY - endY > 70) {
        openInvitation();
    }
}, { passive: true });

function handleEntryWheel(event) {
    if (event.deltaY > 30) {
        openInvitation();
    }
}

window.addEventListener("wheel", handleEntryWheel, { passive: true });

document.body.style.overflow = "hidden";
updateMusicButtons();

const countdownDate = new Date("2026-10-16T10:30:00");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
    const now = new Date();
    const diff = countdownDate - now;

    if (diff <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

const galleryStories = document.querySelectorAll("#gallery .gallery-story");

if (galleryStories.length) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
        galleryStories.forEach((story) => story.classList.add("is-visible"));
    } else {
        const galleryObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });

        galleryStories.forEach((story, index) => {
            story.style.setProperty("--story-delay", `${(index % 3) * 110}ms`);
            galleryObserver.observe(story);
        });
    }
}

const closingSection = document.getElementById("closing");

if (closingSection) {
    const reduceClosingMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceClosingMotion || !("IntersectionObserver" in window)) {
        closingSection.classList.add("is-visible");
    } else {
        const closingObserver = new IntersectionObserver((entries, observer) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                closingSection.classList.add("is-visible");
                observer.disconnect();
            }
        }, { threshold: 0.2 });

        closingObserver.observe(closingSection);
    }
}

const familyBlessings = document.getElementById("family-blessings");

if (familyBlessings) {
    const reduceFamilyMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceFamilyMotion || !("IntersectionObserver" in window)) {
        familyBlessings.classList.add("is-visible");
    } else {
        const familyObserver = new IntersectionObserver((entries, observer) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                familyBlessings.classList.add("is-visible");
                observer.disconnect();
            }
        }, { threshold: 0.15 });

        familyObserver.observe(familyBlessings);
    }

    if (!reduceFamilyMotion) {
        let parallaxFrame = 0;

        function updateChurchParallax() {
            parallaxFrame = 0;
            const sectionBounds = familyBlessings.getBoundingClientRect();

            if (sectionBounds.bottom < 0 || sectionBounds.top > window.innerHeight) return;

            const progress = (window.innerHeight - sectionBounds.top) / (window.innerHeight + sectionBounds.height);
            const offset = (progress - 0.5) * 18;
            familyBlessings.style.setProperty("--family-parallax", `${offset.toFixed(1)}px`);
        }

        function scheduleChurchParallax() {
            if (!parallaxFrame) {
                parallaxFrame = window.requestAnimationFrame(updateChurchParallax);
            }
        }

        window.addEventListener("scroll", scheduleChurchParallax, { passive: true });
        window.addEventListener("resize", scheduleChurchParallax, { passive: true });
        scheduleChurchParallax();
    }
}
