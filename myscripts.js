(function () {
	// Modal elements
	const modalOverlay = document.getElementById('modalOverlay');
	if (!modalOverlay) return; // nothing to do if page doesn't have the modal

	const modalImage = document.getElementById('modalImage');
	const modalTitle = document.getElementById('modalTitle');
	const modalBand = document.getElementById('modalBand');
	const modalYear = document.getElementById('modalYear');
	const modalDesc = document.getElementById('modalDesc');
	const modalExtra = document.getElementById('modalExtra');
	const modalClose = modalOverlay.querySelector('.modal-close');
	const modalPrev = modalOverlay.querySelector('.modal-prev');
	const modalNext = modalOverlay.querySelector('.modal-next');

	// Build an ordered list of album images
	const albumImgList = Array.from(document.querySelectorAll('.album-container img'));
	let currentIndex = -1;

	// Open modal and populate content
	function openModal({ imgEl, band, album, year, desc, index = -1 }) {
		if (modalImage && imgEl) {
			modalImage.src = imgEl.src;
			modalImage.alt = `${album || ''} — ${band || ''}`;
		}

		if (modalTitle) modalTitle.textContent = album || '';
		if (modalBand) modalBand.textContent = band || '';
		if (modalYear) modalYear.textContent = year || '';
		if (modalDesc) modalDesc.textContent = desc || imgEl.getAttribute('data-desc') || '';
		if (modalExtra) modalExtra.innerHTML = ''; // reserved for future use

		modalOverlay.classList.add('open');
		modalOverlay.setAttribute('aria-hidden', 'false');

		// Prevent background scroll while modal open
		document.body.style.overflow = 'hidden';

		// Move focus to close button for accessibility
		if (modalClose) modalClose.focus();

		// Set current index if provided
		if (typeof index === 'number' && index >= 0) {
			currentIndex = index;
		}
	}

	function closeModal() {
		modalOverlay.classList.remove('open');
		modalOverlay.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
		// Clear image src so any large images don't remain loaded in memory
		if (modalImage) modalImage.src = '';
		currentIndex = -1;
	}

	function showAt(index) {
		if (!albumImgList.length) return;
		const len = albumImgList.length;
		const idx = ((index % len) + len) % len; // wrap
		const img = albumImgList[idx];
		if (!img) return;
		const container = img.closest('.album-container');
		const band = container?.querySelector('.band-name')?.textContent?.trim() || '';
		const album = container?.querySelector('.album-name')?.textContent?.trim() || '';
		const year = container?.querySelector('.album-year')?.textContent?.trim() || '';
		const desc = img.getAttribute('data-desc') || '';

		openModal({ imgEl: img, band, album, year, desc, index: idx });
	}

	function showPrev() {
		if (currentIndex < 0) return;
		showAt(currentIndex - 1);
	}

	function showNext() {
		if (currentIndex < 0) return;
		showAt(currentIndex + 1);
	}

	// Attach click handlers to album images
	albumImgList.forEach((img, idx) => {
		// make it obviously clickable
		img.style.cursor = 'pointer';

		img.addEventListener('click', () => {
			const container = img.closest('.album-container');
			const band = container?.querySelector('.band-name')?.textContent?.trim() || '';
			const album = container?.querySelector('.album-name')?.textContent?.trim() || '';
			const year = container?.querySelector('.album-year')?.textContent?.trim() || '';
			const desc = img.getAttribute('data-desc') || '';

			openModal({ imgEl: img, band, album, year, desc, index: idx });
		});
	});

	// Close handlers
	if (modalClose) modalClose.addEventListener('click', closeModal);

	// Navigation button handlers
	if (modalPrev) modalPrev.addEventListener('click', (e) => {
		e.stopPropagation();
		showPrev();
	});
	if (modalNext) modalNext.addEventListener('click', (e) => {
		e.stopPropagation();
		showNext();
	});

	// Click outside modal-content closes the modal
	modalOverlay.addEventListener('click', (e) => {
		if (e.target === modalOverlay) closeModal();
	});

	// Keyboard controls: Escape to close, left/right to navigate
	document.addEventListener('keydown', (e) => {
		if (modalOverlay.getAttribute('aria-hidden') === 'false') {
			if (e.key === 'Escape') {
				closeModal();
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				showPrev();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				showNext();
			}
		}
	});

	// Ensure modal is hidden from AT when page loads
	modalOverlay.setAttribute('aria-hidden', 'true');

	// Expose for debugging or programmatic use
	window.__albumModal = { open: openModal, close: closeModal, showAt };

})();

