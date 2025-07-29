const config = {
    google_sheet_url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRc9UwMNGjcRB8gOEwpynC3_yvw5tXNYAYk5fTWxfCyiBFRSLeNS5o1tLsR2qPvhcxpcLRa8GGosPDS/pub?output=csv' // Replace with your URL
};

// DOM elements
const resultDiv = document.getElementById('result');
const scannerStatus = document.getElementById('scanner-status');
const retryButton = document.getElementById('retry-button');

// Initialize scanner
function initScanner() {
    try {
        // Clear status message
        scannerStatus.innerHTML = '';

        // Create scanner instance
        const html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: 250,
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
            },
            /* verbose= */ false
        );

        // Render scanner
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);

        // Hide retry button
        retryButton.style.display = 'none';

    } catch (error) {
        console.error('Scanner initialization failed:', error);
        scannerStatus.innerHTML = `Scanner error: ${error.message}`;
        retryButton.style.display = 'block';
    }
}

// Scan success handler
function onScanSuccess(decodedText) {
    console.log(`Scanned barcode: ${decodedText}`);
    fetchProductInfo(decodedText);
}

// Scan failure handler
function onScanFailure(error) {
    // Don't show common "not found" errors
    if (!error || error === '') return;

    console.warn(`Scan error: ${error}`);
    scannerStatus.innerHTML = `Error: ${error}`;
}

// Product lookup function
async function fetchProductInfo(barcode) {
    resultDiv.innerHTML = 'Searching...';

    try {
        // Add cache-buster to URL
        const url = `${config.google_sheet_url}&t=${new Date().getTime()}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('Network response was not OK');

        const data = await response.text();
        const rows = data.split('\n').filter(row => row.trim() !== '');

        if (rows.length < 2) throw new Error('No products in database');

        const headers = rows[0].split(',');
        let productFound = false;

        for (let i = 1; i < rows.length; i++) {
            const rowData = rows[i].split(',');
            if (rowData[0].trim() === barcode) {
                const productName = rowData[1] || 'Unknown Product';
                const price = rowData[2] || 'N/A';
                resultDiv.innerHTML = `<strong>${productName}</strong><br>Price: ${price}`;
                productFound = true;
                break;
            }
        }

        if (!productFound) {
            resultDiv.innerHTML = 'Product not found in database';
        }

    } catch (error) {
        console.error('Fetch error:', error);
        resultDiv.innerHTML = 'Error: Could not load product data';
    }
}

// Retry button handler
retryButton.addEventListener('click', () => {
    resultDiv.innerHTML = '';
    scannerStatus.innerHTML = 'Trying to access camera...';
    initScanner();
});

// Initialize scanner when page loads
document.addEventListener('DOMContentLoaded', initScanner);
