const PROCESSING_FEE = 5000; // Rp 5.000 per ekor ayam
let chickenPrice = 0;
let grandTotal = 0;
let history = JSON.parse(localStorage.getItem('chickenCalcHistory')) || [];

// DOM Elements
const historyBtn = document.getElementById('historyBtn');
const historyPanel = document.getElementById('historyPanel');
const closeHistory = document.getElementById('closeHistory');
const historyList = document.getElementById('historyList');
const clearHistory = document.getElementById('clearHistory');
const soundToggle = document.getElementById('soundToggle');
const successSound = document.getElementById('successSound');
const errorSound = document.getElementById('errorSound');
const coinSound = document.getElementById('coinSound');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    
    // Check if sound should be enabled
    const soundEnabled = localStorage.getItem('soundEnabled');
    if (soundEnabled === 'false') {
        soundToggle.checked = false;
    }
});
// Tambahkan ini setelah event listener yang ada
document.addEventListener('click', (e) => {
 if (!historyPanel.contains(e.target) && e.target !== historyBtn) {
   historyPanel.classList.remove('active');
  }
});
// Toggle history panel
historyBtn.addEventListener('click', () => {
    historyPanel.classList.add('active');
});

closeHistory.addEventListener('click', () => {
    historyPanel.classList.remove('active');
});

// Clear history
clearHistory.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat?')) {
        history = [];
        localStorage.setItem('chickenCalcHistory', JSON.stringify(history));
        renderHistory();
    }
});

// Toggle sound
soundToggle.addEventListener('change', (e) => {
    localStorage.setItem('soundEnabled', e.target.checked);
});

function playSound(sound) {
    if (soundToggle.checked) {
        sound.currentTime = 0;
        sound.play();
    }
}

function calculateChickenPrice() {
    // Ambil nilai input
    const weight = parseFloat(document.getElementById('weight').value);
    const pricePerKg = parseFloat(document.getElementById('price-per-kg').value);
    
    // Validasi input
    if (!weight || weight <= 0) {
        showError("Masukkan berat ayam yang valid!");
        return;
    }
    
    if (!pricePerKg || pricePerKg <= 0) {
        showError("Masukkan harga per kg yang valid!");
        return;
    }
    
    // Hitung harga ayam
    chickenPrice = weight * pricePerKg;
    
    // Tampilkan harga ayam
    document.getElementById('chicken-price-display').textContent = formatRupiah(chickenPrice);
    
    // Pindah ke step 2
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    
    // Sembunyikan hasil sebelumnya
    document.getElementById('result').style.display = 'none';
    document.getElementById('insufficient-funds').style.display = 'none';
    
    // Reset input uang yang dibayarkan
    document.getElementById('amount-paid').value = '';
    
    // Play sound
    playSound(successSound);
}

function calculateTotal() {
    // Ambil nilai input
    const bubutQuantity = parseInt(document.getElementById('bubut-quantity').value) || 0;
    const amountPaid = parseFloat(document.getElementById('amount-paid').value);
    
    // Validasi input
    if (!amountPaid || amountPaid <= 0) {
        showError("Masukkan jumlah uang yang valid!");
        return;
    }
    
    // Hitung biaya bubut
    const processingFee = bubutQuantity * PROCESSING_FEE;
    
    // Hitung total keseluruhan
    grandTotal = chickenPrice + processingFee;
    
    // Hitung kembalian
    const change = amountPaid - grandTotal;
    
    // Sembunyikan semua hasil terlebih dahulu
    document.getElementById('result').style.display = 'none';
    document.getElementById('insufficient-funds').style.display = 'none';
    
    // Jika uang cukup, tampilkan hasil dengan animasi
    if (change >= 0) {
        document.getElementById('chicken-price').textContent = formatRupiah(chickenPrice);
        document.getElementById('processing-fee').textContent = formatRupiah(processingFee);
        document.getElementById('grand-total').textContent = formatRupiah(grandTotal);
        document.getElementById('paid-amount').textContent = formatRupiah(amountPaid);
        document.getElementById('change-amount').textContent = formatRupiah(change);
        document.getElementById('change-amount').className = 'change positive';
        
        // Tampilkan hasil dengan animasi
        const resultBox = document.getElementById('result');
        resultBox.style.display = 'block';
        resultBox.style.animation = 'none';
        void resultBox.offsetWidth; // Trigger reflow
        resultBox.style.animation = 'fadeInScale 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        
        // Reset animasi item
        const items = document.querySelectorAll('.result-item');
        items.forEach((item, index) => {
            item.style.animation = 'none';
            void item.offsetWidth;
            item.style.animation = `itemReveal 0.4s ease-out ${index * 0.1 + 0.2}s forwards`;
        });
        
        // Animasi koin untuk kembalian
        if (change > 0) {
            createCoinAnimation(change);
            playSound(coinSound);
        } else {
            createConfettiAnimation();
            playSound(successSound);
        }
    } else {
        // Jika uang tidak cukup, tampilkan pesan dengan animasi
        const insufficientFunds = document.getElementById('insufficient-funds');
        const amountNeeded = document.getElementById('amount-needed');
        const neededAmount = Math.abs(change);
        
        amountNeeded.textContent = formatRupiah(neededAmount);
        insufficientFunds.style.display = 'block';
        insufficientFunds.style.animation = 'none';
        void insufficientFunds.offsetWidth;
        insufficientFunds.style.animation = 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
        
        // Highlight input uang yang dibayarkan
        const amountPaidInput = document.getElementById('amount-paid');
        amountPaidInput.style.borderColor = 'var(--danger)';
        amountPaidInput.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.2)';
        
        // Set focus ke input uang
        amountPaidInput.focus();
        
        // Play error sound
        playSound(errorSound);
        
        // Reset highlight setelah 3 detik
        setTimeout(() => {
            amountPaidInput.style.borderColor = '#e0e0e0';
            amountPaidInput.style.boxShadow = 'none';
        }, 3000);
    }
}

function backToStep1() {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    document.getElementById('result').style.display = 'none';
    document.getElementById('insufficient-funds').style.display = 'none';
}

function formatRupiah(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function showError(message) {
    alert(message);
    playSound(errorSound);
}

function createCoinAnimation(amount) {
    const button = document.querySelector('.btn-secondary');
    const changeAmount = document.getElementById('change-amount');
    const coinsCount = Math.min(Math.floor(amount / 5000), 10); // Max 10 coins
    
    for (let i = 0; i < coinsCount; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'coin-animation';
            document.body.appendChild(coin);
            
            // Position coin
            const buttonRect = button.getBoundingClientRect();
            const changeRect = changeAmount.getBoundingClientRect();
            
            const startX = buttonRect.left + buttonRect.width / 2;
            const startY = buttonRect.top + buttonRect.height / 2;
            const endX = changeRect.left + changeRect.width / 2;
            const endY = changeRect.top + changeRect.height / 2;
            
            coin.style.left = `${startX}px`;
            coin.style.top = `${startY}px`;
            coin.style.opacity = '1';
            
            // Animate coin
            const duration = 800 + Math.random() * 400;
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            const controlX1 = startX + Math.cos(angle) * distance;
            const controlY1 = startY + Math.sin(angle) * distance - 100;
            const controlX2 = endX + Math.cos(angle + Math.PI) * distance;
            const controlY2 = endY + Math.sin(angle + Math.PI) * distance - 50;
            
            const keyframes = [
                { 
                    transform: 'scale(0.5)',
                    left: `${startX}px`,
                    top: `${startY}px`,
                    opacity: 1
                },
                { 
                    transform: 'scale(1)',
                    left: `${controlX1}px`,
                    top: `${controlY1}px`,
                    opacity: 1
                },
                { 
                    transform: 'scale(0.8)',
                    left: `${controlX2}px`,
                    top: `${controlY2}px`,
                    opacity: 1
                },
                { 
                    transform: 'scale(1)',
                    left: `${endX}px`,
                    top: `${endY}px`,
                    opacity: 0
                }
            ];
            
            const options = {
                duration: duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            };
            
            coin.animate(keyframes, options).onfinish = () => {
                coin.remove();
            };
        }, i * 150);
    }
}

function createConfettiAnimation() {
    const resultBox = document.getElementById('result');
    const rect = resultBox.getBoundingClientRect();
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            document.body.appendChild(confetti);
            
            // Random color
            const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.backgroundColor = randomColor;
            
            // Random shape
            const shapes = ['circle', 'square', 'triangle'];
            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
            
            if (randomShape === 'circle') {
                confetti.style.borderRadius = '50%';
            } else if (randomShape === 'triangle') {
                confetti.style.width = '0';
                confetti.style.height = '0';
                confetti.style.borderLeft = '5px solid transparent';
                confetti.style.borderRight = '5px solid transparent';
                confetti.style.borderBottom = `10px solid ${randomColor}`;
                confetti.style.backgroundColor = 'transparent';
            }
            
            // Random size
            const size = Math.random() * 10 + 5;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            
            // Start position (top of result box)
            const startX = rect.left + Math.random() * rect.width;
            const startY = rect.top;
            
            // End position (random)
            const endX = startX + (Math.random() - 0.5) * 200;
            const endY = startY + 200 + Math.random() * 100;
            
            confetti.style.left = `${startX}px`;
            confetti.style.top = `${startY}px`;
            confetti.style.opacity = '1';
            
            // Rotation
            const rotation = Math.random() * 360;
            
            // Animate
            const duration = 1000 + Math.random() * 1000;
            
            const keyframes = [
                { 
                    transform: `translate(0, 0) rotate(0deg)`,
                    opacity: 1
                },
                { 
                    transform: `translate(${endX - startX}px, ${endY - startY}px) rotate(${rotation}deg)`,
                    opacity: 0
                }
            ];
            
            const options = {
                duration: duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            };
            
            confetti.animate(keyframes, options).onfinish = () => {
                confetti.remove();
            };
        }, i * 50);
    }
}

function saveToHistory() {
    const weight = parseFloat(document.getElementById('weight').value);
    const pricePerKg = parseFloat(document.getElementById('price-per-kg').value);
    const bubutQuantity = parseInt(document.getElementById('bubut-quantity').value) || 0;
    const amountPaid = parseFloat(document.getElementById('amount-paid').value);
    const change = amountPaid - grandTotal;
    
    const historyItem = {
        date: new Date().toLocaleString(),
        weight: weight,
        pricePerKg: pricePerKg,
        bubutQuantity: bubutQuantity,
        total: grandTotal,
        paid: amountPaid,
        change: change
    };
    
    history.unshift(historyItem);
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem('chickenCalcHistory', JSON.stringify(history));
    renderHistory();
    
    // Show success message
    alert('Perhitungan berhasil disimpan ke riwayat!');
    playSound(successSound);
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-history"><i class="fas fa-history fa-2x" style="margin-bottom: 10px;"></i><p>Belum ada riwayat</p></div>';
        return;
    }
    
    historyList.innerHTML = '';
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 5px;">${item.date}</div>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span>${item.weight} kg × Rp ${item.pricePerKg.toLocaleString('id-ID')}</span>
                <span>Rp ${item.total.toLocaleString('id-ID')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-top: 5px;">
                <span>${item.bubutQuantity} ekor bubut</span>
                <span class="${item.change >= 0 ? 'change positive' : 'change negative'}">
                    ${item.change >= 0 ? '+' : ''}Rp ${Math.abs(item.change).toLocaleString('id-ID')}
                </span>
            </div>
        `;
        
        historyItem.addEventListener('click', () => {
            loadHistoryItem(index);
            historyPanel.classList.remove('active');
        });
        
        historyList.appendChild(historyItem);
    });
}

function loadHistoryItem(index) {
    const item = history[index];
    
    // Set values
    document.getElementById('weight').value = item.weight;
    document.getElementById('price-per-kg').value = item.pricePerKg;
    document.getElementById('bubut-quantity').value = item.bubutQuantity;
    document.getElementById('amount-paid').value = item.paid;
    
    // Calculate and show results
    chickenPrice = item.weight * item.pricePerKg;
    document.getElementById('chicken-price-display').textContent = formatRupiah(chickenPrice);
    
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    
    calculateTotal();
}

// ... (previous code remains the same until renderHistory function)

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-history"><i class="fas fa-history fa-2x" style="margin-bottom: 10px;"></i><p>Belum ada riwayat</p></div>';
        return;
    }
    
    historyList.innerHTML = '';
    
    // Add export selected button if not exists
    if (!document.getElementById('exportSelectedBtn')) {
        const exportSelectedBtn = document.createElement('button');
        exportSelectedBtn.id = 'exportSelectedBtn';
        exportSelectedBtn.className = 'btn btn-primary';
        exportSelectedBtn.innerHTML = '<i class="fas fa-download"></i> Export Selected';
        exportSelectedBtn.style.margin = '10px 0';
        exportSelectedBtn.style.display = 'none';
        exportSelectedBtn.onclick = exportSelectedItems;
        historyList.parentNode.insertBefore(exportSelectedBtn, historyList);
    }
    
    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                <input type="checkbox" class="history-checkbox" data-index="${index}" style="margin-right: 10px;">
                <div style="flex-grow: 1;">
                    <div style="font-weight: 600;">${item.date}</div>
                    <div style="font-size: 13px;">Pembeli: ${item.buyer}</div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span>${item.weight} kg × Rp ${item.pricePerKg.toLocaleString('id-ID')}</span>
                <span>Rp ${item.total.toLocaleString('id-ID')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-top: 5px;">
                <span>${item.bubutQuantity} ekor bubut</span>
                <span class="${item.change >= 0 ? 'change positive' : 'change negative'}">
                    ${item.change >= 0 ? '+' : ''}Rp ${Math.abs(item.change).toLocaleString('id-ID')}
                </span>
            </div>
        `;
        
        // Add click event to the entire item (except checkbox)
        const contentPart = historyItem.querySelector('div > div:last-child');
        contentPart.addEventListener('click', () => {
            loadHistoryItem(index);
            historyPanel.classList.remove('active');
        });
        
        // Add checkbox event
        const checkbox = historyItem.querySelector('.history-checkbox');
        checkbox.addEventListener('change', function() {
            const exportBtn = document.getElementById('exportSelectedBtn');
            const checkedItems = document.querySelectorAll('.history-checkbox:checked');
            
            if (checkedItems.length > 0) {
                exportBtn.style.display = 'block';
            } else {
                exportBtn.style.display = 'none';
            }
        });
        
        historyList.appendChild(historyItem);
    });
}

function exportSelectedItems() {
    const checkedItems = document.querySelectorAll('.history-checkbox:checked');
    if (checkedItems.length === 0) return;
    
    // Create a menu for export options
    const exportMenu = document.createElement('div');
    exportMenu.className = 'export-menu';
    exportMenu.style.position = 'fixed';
    exportMenu.style.top = '50%';
    exportMenu.style.left = '50%';
    exportMenu.style.transform = 'translate(-50%, -50%)';
    exportMenu.style.backgroundColor = 'white';
    exportMenu.style.padding = '20px';
    exportMenu.style.borderRadius = '8px';
    exportMenu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    exportMenu.style.zIndex = '1000';
    
    exportMenu.innerHTML = `
        <h3 style="margin-top: 0; margin-bottom: 15px;">Export ${checkedItems.length} Selected Items</h3>
        <button class="export-option-btn" data-type="pdf-individual" style="display: block; width: 100%; margin-bottom: 10px; padding: 8px;">
            <i class="fas fa-file-pdf"></i> Export as separate PDF files
        </button>
        <button class="export-option-btn" data-type="pdf-combined" style="display: block; width: 100%; margin-bottom: 10px; padding: 8px;">
            <i class="fas fa-file-pdf"></i> Export as single PDF
        </button>
        <button class="export-option-btn" data-type="csv-individual" style="display: block; width: 100%; margin-bottom: 10px; padding: 8px;">
            <i class="fas fa-file-csv"></i> Export as separate CSV files
        </button>
        <button class="export-option-btn" data-type="csv-combined" style="display: block; width: 100%; padding: 8px;">
            <i class="fas fa-file-csv"></i> Export as single CSV
        </button>
        <button id="cancelExportBtn" style="display: block; width: 100%; margin-top: 15px; padding: 8px; background: #f5f5f5;">
            Cancel
        </button>
    `;
    
    document.body.appendChild(exportMenu);
    
    // Add event listeners to options
    exportMenu.querySelectorAll('.export-option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const exportType = this.getAttribute('data-type');
            const indices = Array.from(checkedItems).map(item => parseInt(item.getAttribute('data-index')));
            
            if (exportType.includes('pdf')) {
                if (exportType === 'pdf-individual') {
                    indices.forEach(index => exportHistoryItemToPDF(index));
                } else {
                    exportCombinedPDF(indices);
                }
            } else {
                if (exportType === 'csv-individual') {
                    indices.forEach(index => exportHistoryItemToCSV(index));
                } else {
                    exportCombinedCSV(indices);
                }
            }
            
            document.body.removeChild(exportMenu);
        });
    });
    
    // Add cancel button event
    exportMenu.querySelector('#cancelExportBtn').addEventListener('click', function() {
        document.body.removeChild(exportMenu);
    });
}

function exportHistoryItemToPDF(index) {
    const item = history[index];
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('My Chicken Calculator - Invoice', 105, 15, { align: 'center' });
    
    // Add buyer info
    doc.setFontSize(12);
    doc.text(`Nama Pembeli: ${item.buyer}`, 14, 25);
    doc.text(`Tanggal: ${item.date}`, 14, 32);
    
    // Add table
    doc.autoTable({
        startY: 40,
        head: [['Item', 'Detail', 'Harga']],
        body: [
            ['Berat Ayam', item.weight + ' kg', formatRupiah(item.weight * item.pricePerKg)],
            ['Harga per kg', '', item.pricePerKg.toLocaleString('id-ID') + '/kg'],
            ['Jumlah Bubut', item.bubutQuantity + ' ekor', formatRupiah(item.bubutQuantity * PROCESSING_FEE)],
            ['Total', '', formatRupiah(item.total)],
            ['Dibayar', '', formatRupiah(item.paid)],
            ['Kembalian', '', formatRupiah(item.change)]
        ],
        theme: 'grid',
        headStyles: {
            fillColor: [255, 123, 37],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 60 },
            2: { cellWidth: 'auto' }
        }
    });
    
    // Save the PDF
    doc.save(`Invoice_${item.buyer}_${item.date.replace(/[/:\\]/g, '_')}.pdf`);
    playSound(successSound);
}

function exportHistoryItemToCSV(index) {
    const item = history[index];
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += "My Chicken Calculator - Invoice\n";
    csvContent += `Nama Pembeli,${item.buyer}\n`;
    csvContent += `Tanggal,${item.date}\n\n`;
    
    // Add table header
    csvContent += "Item,Detail,Harga\n";
    
    // Add table content
    csvContent += `Berat Ayam,${item.weight} kg,${formatRupiah(item.weight * item.pricePerKg)}\n`;
    csvContent += `Harga per kg,,${item.pricePerKg.toLocaleString('id-ID')}/kg\n`;
    csvContent += `Jumlah Bubut,${item.bubutQuantity} ekor,${formatRupiah(item.bubutQuantity * PROCESSING_FEE)}\n`;
    csvContent += `Total,,${formatRupiah(item.total)}\n`;
    csvContent += `Dibayar,,${formatRupiah(item.paid)}\n`;
    csvContent += `Kembalian,,${formatRupiah(item.change)}\n`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Invoice_${item.buyer}_${item.date.replace(/[/:\\]/g, '_')}.csv`);
    document.body.appendChild(link);
    
    // Download the file
    link.click();
    document.body.removeChild(link);
    playSound(successSound);
}

function exportCombinedPDF(indices) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPos = 20;
    
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Multiple Invoices - My Chicken Calculator', 105, yPos, { align: 'center' });
    yPos += 15;
    
    indices.forEach((index, i) => {
        const item = history[index];
        
        if (i > 0) {
            doc.addPage();
            yPos = 20;
        }
        
        // Add invoice header
        doc.setFontSize(14);
        doc.text(`Invoice #${i + 1}`, 14, yPos);
        yPos += 10;
        
        // Add buyer info
        doc.setFontSize(12);
        doc.text(`Nama Pembeli: ${item.buyer}`, 14, yPos);
        yPos += 7;
        doc.text(`Tanggal: ${item.date}`, 14, yPos);
        yPos += 10;
        
        // Add table
        doc.autoTable({
            startY: yPos,
            head: [['Item', 'Detail', 'Harga']],
            body: [
                ['Berat Ayam', item.weight + ' kg', formatRupiah(item.weight * item.pricePerKg)],
                ['Harga per kg', '', item.pricePerKg.toLocaleString('id-ID') + '/kg'],
                ['Jumlah Bubut', item.bubutQuantity + ' ekor', formatRupiah(item.bubutQuantity * PROCESSING_FEE)],
                ['Total', '', formatRupiah(item.total)],
                ['Dibayar', '', formatRupiah(item.paid)],
                ['Kembalian', '', formatRupiah(item.change)]
            ],
            theme: 'grid',
            headStyles: {
                fillColor: [255, 123, 37],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 60 },
                2: { cellWidth: 'auto' }
            }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
    });
    
    // Save the PDF
    doc.save(`Combined_Invoices_${new Date().toISOString().slice(0,10)}.pdf`);
    playSound(successSound);
}

function exportCombinedCSV(indices) {
    let csvContent = "data:text/csv;charset=utf-8,";
    const date = new Date().toLocaleString();
    
    // Add header
    csvContent += "Multiple Invoices - My Chicken Calculator\n";
    csvContent += `Generated on,${date}\n`;
    csvContent += `Total Invoices,${indices.length}\n\n`;
    
    indices.forEach((index, i) => {
        const item = history[index];
        
        // Add invoice header
        csvContent += `Invoice #${i + 1}\n`;
        csvContent += `Nama Pembeli,${item.buyer}\n`;
        csvContent += `Tanggal,${item.date}\n`;
        
        // Add table header
        csvContent += "Item,Detail,Harga\n";
        
        // Add table content
        csvContent += `Berat Ayam,${item.weight} kg,${formatRupiah(item.weight * item.pricePerKg)}\n`;
        csvContent += `Harga per kg,,${item.pricePerKg.toLocaleString('id-ID')}/kg\n`;
        csvContent += `Jumlah Bubut,${item.bubutQuantity} ekor,${formatRupiah(item.bubutQuantity * PROCESSING_FEE)}\n`;
        csvContent += `Total,,${formatRupiah(item.total)}\n`;
        csvContent += `Dibayar,,${formatRupiah(item.paid)}\n`;
        csvContent += `Kembalian,,${formatRupiah(item.change)}\n\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Combined_Invoices_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Download the file
    link.click();
    document.body.removeChild(link);
    playSound(successSound);
}

// ... (rest of the existing code remains the same)