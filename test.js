function extractNumberFromFilename(path) {
    const m = path.match(/(\d+)/);
    return m ? Number(m[1]) : null;
}

const imageFiles = [
    'images/1.png',
    'images/2.png',
    'images/3.png',
    'images/12.png',
    'images/16.jpg',
    'images/27.png',
    'images/74.webp',
].map((src, i) => ({ src, index: i, number: extractNumberFromFilename(src) }));



const startTestBtn = document.getElementById('startTestBtn');
const nextBtn = document.getElementById('nextBtn');
const lastBtn = document.getElementById('lastBtn');
const imageContainer = document.getElementById('imageContainer');
const numberPanel = document.getElementById('numberPanel');
const randomBtn1 = document.getElementById('randomBtn1');
const randomBtn2 = document.getElementById('randomBtn2');
const indexBtn = document.getElementById('indexBtn');
const counterBadge = document.getElementById('counterBadge');

let shuffledImages = [];
let currentImageIndex = 0;
let topRightCounter = 0;

function shuffleArray(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function verifyImageFiles(items) {
    const checks = items.map((item) => new Promise((resolve) => {
        const src = typeof item === 'string' ? item : item.src;
        const img = new Image();
        img.onload = () => resolve({ item, src, valid: true });
        img.onerror = () => resolve({ item, src, valid: false });
        img.src = src;
    }));
    return Promise.all(checks);
}

function saveTestState() {
    sessionStorage.setItem('shuffledImages', JSON.stringify(shuffledImages));
    sessionStorage.setItem('currentImageIndex', String(currentImageIndex));
}

function createRandomNumber() {
    return String(Math.floor(Math.random() * 99) + 1);
}

function updateNumberPanel(index) {
    if (!numberPanel || !randomBtn1 || !randomBtn2 || !indexBtn) return;
    const image = shuffledImages[index];
    randomBtn1.textContent = createRandomNumber();
    randomBtn2.textContent = createRandomNumber();
    // show the parsed file number (from filename) if available, otherwise fall back to original index
    const fileNumber = (image && (image.number !== undefined && image.number !== null)) ? image.number : ((image && typeof image.index === 'number') ? image.index + 1 : index + 1);
    indexBtn.textContent = String(fileNumber);
    numberPanel.classList.remove('hidden');
}

function showImageAt(index) {
    const image = shuffledImages[index];
    if (!image) {
        imageContainer.innerHTML = '<p>Test completed. Try again to shuffle a new order.</p>';
        nextBtn.classList.add('hidden');
        lastBtn.classList.add('hidden');
        if (numberPanel) numberPanel.classList.add('hidden');
        return;
    }

    imageContainer.innerHTML = `
        <img src="${image.src}" alt="Random test image">
        <p>Image position ${index + 1} of ${shuffledImages.length}</p>
        <p>File index: ${image.index + 1} — File number: ${image.number ?? '-'} </p>
    `;

    updateNumberPanel(index);

    const atFirstImage = index <= 0;
    const atLastImage = index >= shuffledImages.length - 1;
    lastBtn.classList.toggle('hidden', atFirstImage);
    nextBtn.classList.toggle('hidden', atLastImage);
    saveTestState();
}

async function startTest() {
    // reset the top-right counter when starting a new test
    topRightCounter = 0;
    if (counterBadge) {
        counterBadge.textContent = '0';
        counterBadge.classList.add('hidden');
    }

    imageContainer.innerHTML = '<p>Checking images…</p>';
    const verified = await verifyImageFiles(imageFiles);
    const validImages = verified.filter((v) => v.valid).map((v) => {
        // preserve original index/number when available
        if (v.item && typeof v.item === 'object') {
            return { src: v.src, index: (typeof v.item.index === 'number') ? v.item.index : undefined, number: v.item.number ?? extractNumberFromFilename(v.src) };
        }
        return { src: v.src, index: undefined, number: extractNumberFromFilename(v.src) };
    });

    if (validImages.length === 0) {
        imageContainer.innerHTML = '<p>No valid images were found. Please check your files.</p>';
        nextBtn.classList.add('hidden');
        return;
    }

    shuffledImages = shuffleArray(validImages);
    currentImageIndex = 0;
    showImageAt(currentImageIndex);
}

if (startTestBtn && imageContainer && nextBtn && lastBtn) {
    startTestBtn.addEventListener('click', startTest);

    nextBtn.addEventListener('click', () => {
        // if the file-number button was selected, increment the top-right counter
        const indexSelected = indexBtn && indexBtn.classList.contains('selected-green');
        if (indexSelected) {
            topRightCounter += 1;
            if (counterBadge) {
                counterBadge.textContent = String(topRightCounter);
                counterBadge.classList.remove('hidden');
            }
        }
        currentImageIndex += 1;
        clearPanelSelection();
        showImageAt(currentImageIndex);
    });

    lastBtn.addEventListener('click', () => {
        currentImageIndex -= 1;
        clearPanelSelection();
        showImageAt(currentImageIndex);
    });

    const savedImages = sessionStorage.getItem('shuffledImages');
    const savedIndex = sessionStorage.getItem('currentImageIndex');
    if (savedImages && savedIndex !== null) {
        try {
            const parsed = JSON.parse(savedImages);
            if (Array.isArray(parsed) && parsed.length > 0) {
                shuffledImages = parsed;
                currentImageIndex = Number(savedIndex) || 0;
                showImageAt(currentImageIndex);
            }
        } catch (error) {
            sessionStorage.removeItem('shuffledImages');
            sessionStorage.removeItem('currentImageIndex');
        }
    }
}

// Panel button selection behavior: single-select with toggle
function clearPanelSelection() {
    [randomBtn1, indexBtn, randomBtn2].forEach((b) => {
        if (!b) return;
        b.classList.remove('selected');
        b.classList.remove('selected-green');
        b.classList.remove('selected-red');
    });
}

function togglePanelSelection(btn) {
    if (!btn) return;
    const wasSelected = btn.classList.contains('selected');
    clearPanelSelection();
    if (!wasSelected) {
        // indexBtn should be green, others red
        if (btn === indexBtn) {
            btn.classList.add('selected-green');
        } else {
            btn.classList.add('selected-red');
        }
        btn.classList.add('selected');
    }
}

// attach listeners (guard in case elements are missing)
[randomBtn1, indexBtn, randomBtn2].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', () => togglePanelSelection(btn));
});


