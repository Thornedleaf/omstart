const imageFiles = [
    'images/1.png',
    'images/2.png',
    'images/3.png',
    'images/12.png',
    'images/16.jpg',
    'images/27.png',
    'images/74.webp',
];

const startTestBtn = document.getElementById('startTestBtn');
const nextBtn = document.getElementById('nextBtn');
const lastBtn = document.getElementById('lastBtn');
const imageContainer = document.getElementById('imageContainer');
const numberPanel = document.getElementById('numberPanel');
const randomBtn1 = document.getElementById('randomBtn1');
const randomBtn2 = document.getElementById('randomBtn2');
const indexBtn = document.getElementById('indexBtn');

let shuffledImages = [];
let currentImageIndex = 0;

function shuffleArray(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function verifyImageFiles(urls) {
    const checks = urls.map((url) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ url, valid: true });
        img.onerror = () => resolve({ url, valid: false });
        img.src = url;
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
    randomBtn1.textContent = createRandomNumber();
    randomBtn2.textContent = createRandomNumber();
    indexBtn.textContent = String(index + 1);
    numberPanel.classList.remove('hidden');
}

function showImageAt(index) {
    const imageFile = shuffledImages[index];
    if (!imageFile) {
        imageContainer.innerHTML = '<p>Test completed. Try again to shuffle a new order.</p>';
        nextBtn.classList.add('hidden');
        lastBtn.classList.add('hidden');
        if (numberPanel) numberPanel.classList.add('hidden');
        return;
    }

    imageContainer.innerHTML = `
        <img src="${imageFile}" alt="Random test image">
        <p>Image ${index + 1} of ${shuffledImages.length}</p>
    `;

    updateNumberPanel(index);

    const atFirstImage = index <= 0;
    const atLastImage = index >= shuffledImages.length - 1;
    lastBtn.classList.toggle('hidden', atFirstImage);
    nextBtn.classList.toggle('hidden', atLastImage);
    saveTestState();
}

async function startTest() {
    imageContainer.innerHTML = '<p>Checking images…</p>';
    const verified = await verifyImageFiles(imageFiles);
    const validImages = verified.filter((item) => item.valid).map((item) => item.url);

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
        currentImageIndex += 1;
        showImageAt(currentImageIndex);
    });

    lastBtn.addEventListener('click', () => {
        currentImageIndex -= 1;
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


