let folders = {};
let currentFolder = null;
let rotationInterval = null;
let scanner = null;

// Inicializar la aplicación
window.onload = function() {
    loadData();
    renderFolders();
};

// Gestión de datos
function loadData() {
    const savedData = localStorage.getItem('folders');
    if (savedData) {
        folders = JSON.parse(savedData);
    }
}

function saveData() {
    localStorage.setItem('folders', JSON.stringify(folders));
}

// Renderizado de carpetas
function renderFolders() {
    const grid = document.getElementById('qrGrid');
    grid.innerHTML = '';
    
    Object.keys(folders).forEach(folderId => {
        const div = document.createElement('div');
        div.className = 'qr-item';
        div.onclick = () => openFolder(folderId);
        
        const qrDiv = document.createElement('div');
        new QRCode(qrDiv, {
            text: folderId,
            width: 128,
            height: 128
        });
        
        const label = document.createElement('div');
        label.className = 'qr-label';
        label.textContent = folderId;
        
        div.appendChild(qrDiv);
        div.appendChild(label);
        grid.appendChild(div);
    });
}

// Gestión de carpetas
function showAddFolderDialog() {
    const folderId = `F${Date.now().toString().slice(-6)}`;
    folders[folderId] = {
        items: []
    };
    saveData();
    renderFolders();
}

function openFolder(folderId) {
    currentFolder = folderId;
    document.getElementById('mainView').classList.add('hidden');
    document.getElementById('folderView').classList.remove('hidden');
    document.getElementById('viewTitle').textContent = 'Ventana dentro de carpeta';
    startRotation();
}

// Rotación de datos
function startRotation() {
    const folder = folders[currentFolder];
    let currentIndex = -1;
    const qrDisplay = document.getElementById('qrDisplay');
    
    function showNext() {
        currentIndex = (currentIndex + 1) % (folder.items.length * 2);
        qrDisplay.innerHTML = '';
        
        if (currentIndex % 2 === 0) {
            // Mostrar QR de la carpeta
            new QRCode(qrDisplay, {
                text: currentFolder,
                width: 256,
                height: 256
            });
            const label = document.createElement('div');
            label.className = 'qr-label';
            label.textContent = currentFolder;
            qrDisplay.appendChild(label);
        } else {
            // Mostrar dato
            const itemIndex = Math.floor(currentIndex / 2);
            new QRCode(qrDisplay, {
                text: folder.items[itemIndex],
                width: 256,
                height: 256
            });
        }
    }
    
    showNext();
    rotationInterval = setInterval(showNext, 3000);
}

// Scanner
function startScanner() {
    document.getElementById('scannerView').classList.remove('hidden');
    scanner = new Html5QrcodeScanner("reader", { 
        fps: 10,
        qrbox: {width: 250, height: 250}
    });
    
    scanner.render((decodedText) => {
        handleScan(decodedText);
        stopScanner();
    });
}

function stopScanner() {
    if (scanner) {
        scanner.clear();
        scanner = null;
    }
    document.getElementById('scannerView').classList.add('hidden');
}

function handleScan(scannedData) {
    folders[currentFolder].items.push(scannedData);
    saveData();
    stopRotation();
    startRotation();
}

function stopRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
    }
}

// Event Listeners
window.addEventListener('beforeunload', () => {
    stopRotation();
    stopScanner();
});