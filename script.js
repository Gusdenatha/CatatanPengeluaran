// Inisialisasi data dari LocalStorage atau array kosong jika belum ada data
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const dateInput = document.getElementById('date');
const itemInput = document.getElementById('item');
const amountInput = document.getElementById('amount');
const receiptInput = document.getElementById('receipt');
const expenseList = document.getElementById('expense-list');
const filterMonth = document.getElementById('filter-month');
const monthlyTotalDisplay = document.getElementById('monthly-total');
const formTitle = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit');
const receiptModal = document.getElementById('receipt-modal');
const receiptModalImage = document.getElementById('receipt-modal-image');
const receiptModalClose = document.getElementById('receipt-modal-close');
let editingExpenseId = null;

// Set default tanggal hari ini pada input formulir dan filter bulan
const today = new Date();
dateInput.value = today.toISOString().split('T')[0];
filterMonth.value = today.toISOString().slice(0, 7); // Format: YYYY-MM

// Fungsi format mata uang Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

function formatAmountInput(value) {
    const digits = value.replace(/\D/g, '');
    return digits ? new Intl.NumberFormat('id-ID').format(Number(digits)) : '';
}

function getAmountValue() {
    return Number(amountInput.value.replace(/\D/g, ''));
}

function compressReceipt(file) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);
        image.onload = () => {
            const maxSize = 1000;
            const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);
            canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(objectUrl);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Foto bukti tidak dapat dibaca.'));
        };
        image.src = objectUrl;
    });
}

amountInput.addEventListener('input', function() {
    const cursor = amountInput.selectionStart;
    const digitsBeforeCursor = amountInput.value.slice(0, cursor).replace(/\D/g, '').length;
    amountInput.value = formatAmountInput(amountInput.value);

    let newCursor = 0;
    let digitsFound = 0;
    while (newCursor < amountInput.value.length && digitsFound < digitsBeforeCursor) {
        if (/\d/.test(amountInput.value[newCursor])) digitsFound++;
        newCursor++;
    }
    amountInput.setSelectionRange(newCursor, newCursor);
});

// Menampilkan riwayat sesuai periode yang dipilih dan totalnya
function renderData() {
    expenseList.innerHTML = '';
    const selectedMonth = filterMonth.value;
    const monthlyExpenses = expenses
        .filter(expense => expense.date.startsWith(selectedMonth))
        .sort((a, b) => b.date.localeCompare(a.date));

    monthlyExpenses.forEach((expense) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(`${expense.date}T00:00:00`).toLocaleDateString('id-ID')}</td>
            <td>${expense.item}</td>
            <td>${formatRupiah(expense.amount)}</td>
            <td>${expense.receipt ? `<button type="button" class="receipt-preview" onclick="showReceipt('${expense.id}')" aria-label="Lihat foto bukti"><img class="receipt-thumbnail" src="${expense.receipt}" alt="Lihat foto bukti"></button>` : '—'}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editExpense('${expense.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteExpense('${expense.id}')">Hapus</button>
            </td>
        `;
        expenseList.appendChild(row);
    });

    const total = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    monthlyTotalDisplay.textContent = formatRupiah(total);
}

function showReceipt(id) {
    const expense = expenses.find(entry => entry.id === id);
    if (!expense?.receipt) return;
    receiptModalImage.src = expense.receipt;
    receiptModal.hidden = false;
}

function closeReceipt() {
    receiptModal.hidden = true;
    receiptModalImage.removeAttribute('src');
}

receiptModalClose.addEventListener('click', closeReceipt);
receiptModal.addEventListener('click', function(event) {
    if (event.target === receiptModal) closeReceipt();
});
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !receiptModal.hidden) closeReceipt();
});

// Simpan catatan baru atau perubahan pada catatan yang sedang diedit
expenseForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const existingExpense = expenses.find(expense => expense.id === editingExpenseId);
    let receipt = existingExpense?.receipt || '';
    if (receiptInput.files[0]) {
        try {
            receipt = await compressReceipt(receiptInput.files[0]);
        } catch (error) {
            alert(error.message);
            return;
        }
    }

    const expenseData = {
        date: dateInput.value,
        item: itemInput.value.trim(),
        amount: getAmountValue(),
        receipt
    };

    if (editingExpenseId) {
        expenses = expenses.map(expense => expense.id === editingExpenseId
            ? { ...expense, ...expenseData }
            : expense);
    } else {
        expenses.push({ id: Date.now().toString(), ...expenseData });
    }
    
    // Simpan ke LocalStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    resetExpenseForm();
    renderData();
});

function editExpense(id) {
    const expense = expenses.find(entry => entry.id === id);
    if (!expense) return;

    editingExpenseId = id;
    dateInput.value = expense.date;
    itemInput.value = expense.item;
    amountInput.value = formatAmountInput(String(expense.amount));
    formTitle.textContent = 'Edit Pengeluaran';
    submitButton.textContent = 'Simpan Perubahan';
    cancelEditButton.hidden = false;
    expenseForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetExpenseForm() {
    editingExpenseId = null;
    itemInput.value = '';
    amountInput.value = '';
    formTitle.textContent = 'Tambah Pengeluaran Baru';
    submitButton.textContent = 'Simpan Catatan';
    cancelEditButton.hidden = true;
    receiptInput.value = '';
}

cancelEditButton.addEventListener('click', resetExpenseForm);

// Fungsi menghapus item pengeluaran
function deleteExpense(id) {
    if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderData();
    }
}

// Event listener saat filter bulan diubah
filterMonth.addEventListener('change', renderData);

// Jalankan fungsi render pertama kali saat halaman dimuat
renderData();
