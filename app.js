const config = {
    google_sheet_url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRc9UwMNGjcRB8gOEwpynC3_yvw5tXNYAYk5fTWxfCyiBFRSLeNS5o1tLsR2qPvhcxpcLRa8GGosPDS/pub?output=csv' // Replace with your URL
};

function onScanSuccess(decodedText, decodedResult) {
    // `decodedText` is the scanned barcode number
    console.log(`Code matched = ${decodedText}`, decodedResult);
    fetchProductInfo(decodedText);
}

function onScanFailure(error) {
    console.warn(`Code scan error = ${error}`);
}

let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess, onScanFailure);

async function fetchProductInfo(barcode) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Searching...';

    try {
        const response = await fetch(config.google_sheet_url);
        const data = await response.text();
        const rows = data.split('\n');
        const headers = rows[0].split(',');

        let productFound = false;
        for (let i = 1; i < rows.length; i++) {
            const rowData = rows[i].split(',');
            if (rowData[0] === barcode) { // Assuming barcode is in the first column
                const productName = rowData[1]; // Assuming product name is in the second column
                const price = rowData[2]; // Assuming price is in the third column
                resultDiv.innerHTML = `<strong>${productName}</strong><br>Price: $${price}`;
                productFound = true;
                break;
            }
        }

        if (!productFound) {
            resultDiv.innerHTML = 'Product not found.';
        }

    } catch (error) {
        console.error('Error fetching product info:', error);
        resultDiv.innerHTML = 'Error looking up product.';
    }
}
