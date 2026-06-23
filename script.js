document.addEventListener("DOMContentLoaded", () => {
  const CONFIG = {
    nombre: "el amor de mi vida",
    tituloPlaylist: "Canciones para nosotros",
    spotifyTracks: [
      "https://open.spotify.com/intl-es/track/2HG211v1GC0BIrswyq9wXC?si=c5551da0bae34cec",
      "https://open.spotify.com/intl-es/track/1I0Iy4cNukQByI9fQcj34O?si=32bdf6eed31c403a",
      "https://open.spotify.com/intl-es/track/0Q0egBtCgVcWe9xB2krgvo?si=7f08be7755774105",
      "https://open.spotify.com/intl-es/track/0EtKYKwFSztzIKw3DM9GGF?si=9857f559af6b48ea"
    ],
    carta: [
      "En tanto que de rosa y de azucena",
      "muestra la blanca frente al mundo vano,",
      "y que en valor, en actitud soberana,",
      "eres abeja que en los labios sana,",
      "",
      "goza cuello, cabello, labio y frente",
      "antes que lo que fue en tu edad dorada",
      "oro bruñido, se convierta en nada.",
      "",
      "En tus ojos encuentro mi razón,",
      "el latido que da sentido a mi pecho,",
      "la eternidad en cada gesto hecho",
      "con el don precioso de tu corazón.",
      "",
      "— Garcilaso de la Vega"
    ].join("\n"),
    fotos: [
      { src: "1782200762353.jpeg", caption: "Nuestro primer recuerdo" },
      { src: "1782200762328.jpg", caption: "Un dia bonito" },
      { src: "1782200762334.jpg", caption: "Tu sonrisa favorita" },
      { src: "1782200762341.jpg", caption: "Nosotros" },
      { src: "1782200762347.jpg", caption: "Otro momento" },
      { src: "1782200762321.jpg", caption: "Para recordar siempre" }
    ]
  };

  const coverName = document.getElementById("coverName");
  const loveLetter = document.getElementById("loveLetter");
  const playlistTitle = document.getElementById("playlistTitle");
  const spotifyEmbed = document.getElementById("spotifyEmbed");

  const openAlbumHero = document.getElementById("openAlbumHero");
  const openAlbumCover = document.getElementById("openAlbumCover");
  const viewer = document.getElementById("bookViewer");
  const leftPage = document.getElementById("leftPage");
  const rightPage = document.getElementById("rightPage");
  const flippingPage = document.getElementById("flippingPage");
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");
  const closeViewer = document.getElementById("closeViewer");
  const pageIndicator = document.getElementById("pageIndicator");
  const pageTotal = document.getElementById("pageTotal");
  const bookStage = document.getElementById("bookStage");

  let pageIndex = 0;
  let isTurning = false;
  let dragStartX = 0;

  coverName.textContent = `Para ${CONFIG.nombre}`;
  loveLetter.textContent = CONFIG.carta;
  if (playlistTitle) playlistTitle.textContent = CONFIG.tituloPlaylist;

  renderSpotify();
  renderBook();

  openAlbumHero.addEventListener("click", openBook);
  openAlbumCover.addEventListener("click", openBook);
  closeViewer.addEventListener("click", closeBook);
  viewer.querySelector("[data-close-viewer]").addEventListener("click", closeBook);
  prevPage.addEventListener("click", () => turnPage("prev"));
  nextPage.addEventListener("click", () => turnPage("next"));

  // Tap pages to turn: touch/click left for previous, right for next
  leftPage.addEventListener("click", (e) => {
    if (!viewer.classList.contains("open") || isTurning) return;
    if (pageIndex > 0) turnPage("prev");
  });
  rightPage.addEventListener("click", (e) => {
    if (!viewer.classList.contains("open") || isTurning) return;
    const pages = getPages();
    if (pageIndex + 2 < pages.length) turnPage("next");
  });

  document.addEventListener("keydown", event => {
    if (!viewer.classList.contains("open")) return;
    if (event.key === "Escape") closeBook();
    if (event.key === "ArrowRight") turnPage("next");
    if (event.key === "ArrowLeft") turnPage("prev");
  });

  bookStage.addEventListener("pointerdown", event => {
    dragStartX = event.clientX;
  });

  bookStage.addEventListener("pointerup", event => {
    const delta = event.clientX - dragStartX;
    if (Math.abs(delta) < 48) return;
    turnPage(delta < 0 ? "next" : "prev");
  });

  function renderSpotify() {
    const spotifySongs = CONFIG.spotifyTracks
      .map(parseSpotify)
      .filter(Boolean);

    if (!spotifySongs.length) {
      spotifyEmbed.innerHTML = `<div class="spotify-empty">Canciones de Spotify</div>`;
      return;
    }

    spotifyEmbed.innerHTML = spotifySongs.map(song => (
      `<iframe src="https://open.spotify.com/embed/${song.type}/${song.id}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`
    )).join("");
  }

  function parseSpotify(value) {
    if (!value) return null;

    let type = "track";
    let id = value.trim();

    try {
      const url = new URL(id);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const known = ["track", "playlist", "album", "artist", "episode", "show"];
        const index = parts.findIndex(part => known.includes(part));
        if (index >= 0 && parts.length > index + 1) {
          type = parts[index];
          id = parts[index + 1];
        }
      }
    } catch (error) {
      const parts = id.split(":");
      if (parts.length >= 3 && parts[0] === "spotify") {
        type = parts[1];
        id = parts[2];
      }
    }

    id = id.split("?")[0].trim();
    if (!id) return null;
    return { type, id };
  }

  function openBook() {
    pageIndex = 0;
    renderBook();
    viewer.classList.add("open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeBook() {
    viewer.classList.remove("open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function getPages() {
    return [
      { type: "message", title: "Para ti", text: "Estas paginas guardan algunos de mis recuerdos favoritos contigo." },
      ...CONFIG.fotos.map((photo, index) => ({
        type: "image",
        src: photo.src,
        fallback: `Foto ${index + 1}`
      })),
      { type: "message", title: "Y faltan mas", text: "Porque lo bonito de nosotros es que todavia quedan muchas paginas por llenar." }
    ];
  }

  function renderBook() {
    const pages = getPages();
    pageIndex = Math.max(0, Math.min(pageIndex, Math.max(0, pages.length - 1)));
    leftPage.innerHTML = buildPageMarkup(pages[pageIndex]);
    rightPage.innerHTML = buildPageMarkup(pages[pageIndex + 1] || blankPage());
    bindPageImageFallbacks();
    pageIndicator.textContent = String(Math.floor(pageIndex / 2) + 1);
    pageTotal.textContent = String(Math.max(1, Math.ceil(pages.length / 2)));
    prevPage.disabled = pageIndex <= 0 || isTurning;
    nextPage.disabled = pageIndex + 2 >= pages.length || isTurning;
  }

  function blankPage() {
    return { type: "message", title: "", text: "" };
  }

  function buildPageMarkup(page) {
    if (!page || page.type === "message") {
      return `<div class="page-message"><div><strong>${escapeHTML(page?.title || "")}</strong><span>${escapeHTML(page?.text || "")}</span></div></div>`;
    }

    return `
      <img src="${escapeHTML(page.src)}" alt="${escapeHTML(page.fallback)}" data-fallback="${escapeHTML(page.fallback)}">
    `;
  }

  function bindPageImageFallbacks() {
    [leftPage, rightPage, flippingPage].forEach(container => {
      container.querySelectorAll("img[data-fallback]").forEach(image => {
        image.addEventListener("error", () => {
          const text = image.dataset.fallback || "Foto";
          image.parentElement.innerHTML = `<div class="page-message"><div><strong>${escapeHTML(text)}</strong><span>Esta pagina esta lista para tu foto.</span></div></div>`;
        }, { once: true });
      });
    });
  }

  function turnPage(direction) {
    const pages = getPages();
    if (isTurning) return;
    if (direction === "next" && pageIndex + 2 >= pages.length) return;
    if (direction === "prev" && pageIndex <= 0) return;

    isTurning = true;
    const visiblePage = direction === "next" ? pages[pageIndex + 1] : pages[pageIndex];
    flippingPage.innerHTML = buildPageMarkup(visiblePage);
    bindPageImageFallbacks();
    flippingPage.className = `flipping-page ${direction}`;
    playPageSound();

    window.setTimeout(() => {
      pageIndex += direction === "next" ? 2 : -2;
      flippingPage.className = "flipping-page";
      flippingPage.innerHTML = "";
      isTurning = false;
      renderBook();
    }, 680);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function playPageSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = window.__albumAudioContext || new AudioContext();
      window.__albumAudioContext = ctx;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(420, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.22);
    } catch (error) {
      // La pagina funciona igual si el navegador bloquea el audio.
    }
  }
});
