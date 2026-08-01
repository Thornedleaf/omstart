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
const imageContainer = document.getElementById('imageContainer');

if (startTestBtn && imageContainer) {
    startTestBtn.addEventListener('click', () => {
        const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        imageContainer.innerHTML = `<img src="${randomImage}" alt="Random test image">`;
    });
}