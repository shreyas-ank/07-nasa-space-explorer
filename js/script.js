// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const fetchButton = document.getElementById('fetchButton');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const modalVideo = document.getElementById('modalVideo');
const modalVideoLink = document.getElementById('modalVideoLink');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Replace this placeholder with your NASA API key from the email.
const apiKey = 'crgpj7dtekHtBt6oax5wOQEISm1dB0arrjVb2Vkl';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

function showPlaceholder(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔭</div>
      <p>${message}</p>
    </div>
  `;
}

function renderImages(images) {
  gallery.innerHTML = '';

  if (!images || images.length === 0) {
    showPlaceholder('No images found for that date range. Try a different range.');
    return;
  }

  // Show newest images first.
  images.sort((a, b) => new Date(b.date) - new Date(a.date));

  images.forEach((image) => {
    const card = document.createElement('div');
    card.className = 'gallery-item';

    if (image.media_type === 'video') {
      const videoLink = document.createElement('a');
      videoLink.href = image.url;
      videoLink.target = '_blank';
      videoLink.rel = 'noopener noreferrer';
      videoLink.textContent = 'View video on NASA APOD';
      card.appendChild(videoLink);
    } else {
      const img = document.createElement('img');
      img.src = image.url;
      img.alt = image.title || 'NASA Astronomy Picture of the Day';
      img.loading = 'lazy';
      card.appendChild(img);
    }

    const info = document.createElement('div');
    info.className = 'gallery-item-info';

    const title = document.createElement('h3');
    title.textContent = image.title || 'Untitled';

    const date = document.createElement('p');
    date.className = 'date';
    date.textContent = image.date || '';

    info.appendChild(title);
    info.appendChild(date);
    card.appendChild(info);
    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        return;
      }
      openModal(image);
    });
    gallery.appendChild(card);
  });
}

function renderError(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">⚠️</div>
      <p>${message}</p>
    </div>
  `;
}

function openModal(item) {
  if (item.media_type === 'video') {
    modalImage.classList.add('hidden');
    modalVideo.classList.remove('hidden');
    modalVideoLink.href = item.url;
    modalVideoLink.textContent = 'Open video on NASA APOD';
  } else {
    modalImage.classList.remove('hidden');
    modalVideo.classList.add('hidden');
    modalImage.src = item.url;
    modalImage.alt = item.title || 'NASA image';
  }

  modalTitle.textContent = item.title || 'Untitled';
  modalDate.textContent = item.date || '';
  modalExplanation.textContent = item.explanation || '';
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  modalImage.src = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

async function fetchNasaImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    renderError('Please choose both a start date and an end date.');
    return;
  }

  fetchButton.disabled = true;
  fetchButton.textContent = ' 🔄 Loading space photos...';

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to load NASA images.');
    }

    const data = await response.json();
    renderImages(data);
  } catch (error) {
    renderError(error.message);
  } finally {
    fetchButton.disabled = false;
    fetchButton.textContent = 'Get Space Images';
  }
}

fetchButton.addEventListener('click', fetchNasaImages);

// Start with a friendly placeholder on page load.
showPlaceholder('Select a date range and click "Get Space Images" to explore the cosmos!');
