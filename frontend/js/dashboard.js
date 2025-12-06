// API Configuration - Change this when deploying to production
const API_BASE = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) 
  ? API_BASE_URL 
  : 'http://localhost:5000/api';
let currentUser = null;

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(user);
    
    // Refresh user data from server to get latest admin status
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            localStorage.setItem('user', JSON.stringify(userData));
        }
    } catch (error) {
        console.error('Error refreshing user data:', error);
    }
    
    updateUI();
    loadDashboardData();
}

// Update UI with user data
function updateUI() {
    if (currentUser) {
        document.getElementById('userWelcome').textContent = `Bonjour, ${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('profileName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profileAccountNumber').textContent = currentUser.accountNumber;
        document.getElementById('profileJoinDate').textContent = new Date().toLocaleDateString('fr-FR');
        
        // Show admin button and sidebar tab if user is admin
        const adminBtn = document.getElementById('adminBtn');
        const adminSidebarBtn = document.getElementById('adminSidebarBtn');
        
        // Check if user is admin (handle both boolean and integer)
        // SQLite returns 0 or 1, JSON might convert to boolean
        const isAdminValue = currentUser.isAdmin;
        const isAdmin = isAdminValue === true || 
                       isAdminValue === 1 || 
                       isAdminValue === '1' || 
                       isAdminValue === 'true' ||
                       String(isAdminValue) === 'true';
        
        console.log('Admin check:', {
            raw: isAdminValue,
            type: typeof isAdminValue,
            string: String(isAdminValue),
            result: isAdmin,
            fullUser: currentUser
        });
        
        if (isAdmin) {
            if (adminBtn) {
                adminBtn.style.display = 'inline-block';
                console.log('✓ Admin button displayed');
            }
            if (adminSidebarBtn) {
                adminSidebarBtn.style.display = 'block';
                console.log('✓ Admin sidebar tab displayed');
            }
        } else {
            if (adminBtn) {
                adminBtn.style.display = 'none';
            }
            if (adminSidebarBtn) {
                adminSidebarBtn.style.display = 'none';
            }
            console.log('✗ User is not admin');
        }
    }
}

// Load dashboard data
async function loadDashboardData() {
    await loadBalance();
    await loadTransactions();
}

// Load account balance
async function loadBalance() {
    try {
        const response = await fetch(`${API_BASE}/banking/balance`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('currentBalance').textContent = `${data.balance.toFixed(2)} €`;
            document.getElementById('accountNumber').textContent = currentUser.accountNumber;
        } else {
            console.error('Balance load failed');
        }
    } catch (error) {
        console.error('Error loading balance:', error);
    }
}

// Load transactions
async function loadTransactions() {
    try {
        console.log('Loading transactions...');
        const response = await fetch(`${API_BASE}/banking/transactions`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const transactions = await response.json();
            console.log('Transactions loaded:', transactions);
            displayTransactions(transactions);
        } else {
            console.error('Transactions load failed');
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Display transactions
function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    container.innerHTML = '';

    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<div class="transaction-item">Aucune transaction trouvée</div>';
        return;
    }

    transactions.forEach(transaction => {
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item';
        
        const amountClass = transaction.amount >= 0 ? 'positive' : 'negative';
        const amountSign = transaction.amount >= 0 ? '+' : '';
        
        transactionEl.innerHTML = `
            <div class="transaction-info">
                <strong>${transaction.description}</strong>
                <div class="transaction-date">${new Date(transaction.date).toLocaleDateString('fr-FR')} ${new Date(transaction.date).toLocaleTimeString('fr-FR')}</div>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountSign}${transaction.amount.toFixed(2)} €
            </div>
            <div class="transaction-balance">
                Solde: ${transaction.balanceAfter.toFixed(2)} €
            </div>
        `;
        
        container.appendChild(transactionEl);
    });
}

// Handle transfer form
if (document.getElementById('transferForm')) {
    document.getElementById('transferForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            recipientAccount: document.getElementById('recipientAccount').value,
            amount: parseFloat(document.getElementById('transferAmount').value),
            description: document.getElementById('transferDescription').value
        };
        
        console.log('Transfer form submitted:', formData);
        
        try {
            const response = await fetch(`${API_BASE}/banking/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Virement effectué avec succès!', 'success');
                document.getElementById('transferForm').reset();
                
                // Update the current user balance
                currentUser.balance = data.newBalance;
                localStorage.setItem('user', JSON.stringify(currentUser));
                
                // Reload dashboard data
                await loadDashboardData();
            } else {
                showMessage(data.message);
            }
        } catch (error) {
            console.error('Transfer error:', error);
            showMessage('Erreur lors du virement');
        }
    });
}

// Function to switch tabs - make it globally accessible
function switchTab(tabId) {
    console.log('Switching to tab:', tabId);
    // Remove active class from all items
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    // Add active class to clicked item
    document.querySelectorAll('.sidebar-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        }
    });
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    // Show selected tab content
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Reload data when switching to transactions tab
    if (tabId === 'transactions') {
        loadTransactions();
    }
    
    // Load admin users when switching to admin tab
    if (tabId === 'admin') {
        loadAdminUsers();
    }
}

// Make switchTab globally accessible
window.switchTab = switchTab;

// Tab navigation
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        switchTab(tabId);
    });
});

// Handle action buttons in quick actions - make it work immediately
function setupActionButtons() {
    const actionButtons = document.querySelectorAll('.action-btn[data-tab]');
    console.log('Setting up action buttons, found:', actionButtons.length);
    actionButtons.forEach(btn => {
        // Remove any existing onclick
        btn.removeAttribute('onclick');
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tabId = this.getAttribute('data-tab');
            console.log('Action button clicked, tabId:', tabId);
            if (tabId) {
                switchTab(tabId);
            }
            return false;
        };
    });
    console.log('Action buttons configured');
}

// Logout function
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Download statement function - make it globally accessible
async function downloadStatement() {
    try {
        console.log('Download statement called');
        
        // Check if jsPDF is already loaded
        const checkJsPDF = () => {
            return typeof window.jspdf !== 'undefined' || 
                   typeof jspdf !== 'undefined' ||
                   (window.jspdf && window.jspdf.jsPDF) ||
                   (typeof jspdf !== 'undefined' && jspdf.jsPDF);
        };
        
        // Load transactions
        const response = await fetch(`${API_BASE}/banking/transactions`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            showMessage('Erreur lors du chargement des transactions', 'error');
            return;
        }
        
        let transactions;
        try {
            transactions = await response.json();
        } catch (jsonError) {
            showMessage('Erreur: Réponse invalide du serveur', 'error');
            return;
        }
        
        if (!transactions || transactions.length === 0) {
            showMessage('Aucune transaction à imprimer', 'error');
            return;
        }
        
        // Check if jsPDF is loaded, if not, load it
        if (!checkJsPDF()) {
            console.log('Loading jsPDF library...');
            showMessage('Chargement de la bibliothèque PDF...', 'success');
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = () => {
                    console.log('jsPDF loaded successfully');
                    // Wait a bit for the library to fully initialize
                    setTimeout(() => {
                        generatePDF(transactions);
                        resolve();
                    }, 300);
                };
                script.onerror = () => {
                    showMessage('Erreur: Impossible de charger la bibliothèque PDF. Vérifiez votre connexion internet.', 'error');
                    reject(new Error('Failed to load jsPDF'));
                };
                document.head.appendChild(script);
            });
        }
        
        // Generate PDF immediately if library is already loaded
        // Add small delay to ensure library is ready
        setTimeout(() => generatePDF(transactions), 100);
    } catch (error) {
        console.error('Error generating PDF:', error);
        showMessage('Erreur lors de la génération du PDF: ' + (error.message || 'Erreur inconnue'), 'error');
    }
}

// Make it globally accessible
window.downloadStatement = downloadStatement;

// Separate PDF generation function
function generatePDF(transactions) {
    try {
        console.log('Generating PDF with', transactions.length, 'transactions');
        console.log('Checking for jsPDF library...');
        console.log('window.jspdf:', typeof window.jspdf, window.jspdf);
        console.log('typeof jspdf:', typeof jspdf);
        
        // Get jsPDF from the loaded library - handle different loading methods
        let jsPDF;
        
        // The CDN version loads as window.jspdf.jsPDF
        if (window.jspdf && window.jspdf.jsPDF) {
            jsPDF = window.jspdf.jsPDF;
            console.log('Found jsPDF via window.jspdf.jsPDF');
        } else if (window.jspdf && typeof window.jspdf === 'object') {
            // Try accessing directly
            jsPDF = window.jspdf.jsPDF || window.jspdf;
            console.log('Found jsPDF via window.jspdf');
        } else if (typeof jspdf !== 'undefined') {
            // Global jspdf variable
            if (jspdf.jsPDF) {
                jsPDF = jspdf.jsPDF;
            } else {
                jsPDF = jspdf;
            }
            console.log('Found jsPDF via global jspdf');
        } else {
            // Try to access from window directly
            const possibleNames = ['jsPDF', 'jspdf'];
            for (const name of possibleNames) {
                if (window[name]) {
                    if (window[name].jsPDF) {
                        jsPDF = window[name].jsPDF;
                    } else if (typeof window[name] === 'function') {
                        jsPDF = window[name];
                    }
                    if (jsPDF) {
                        console.log('Found jsPDF via window.' + name);
                        break;
                    }
                }
            }
        }
        
        if (!jsPDF || typeof jsPDF !== 'function') {
            showMessage('Erreur: Bibliothèque PDF non disponible. Veuillez recharger la page.', 'error');
            console.error('jsPDF not found. Available globals:', Object.keys(window).filter(k => k.toLowerCase().includes('pdf')));
            console.error('window.jspdf:', window.jspdf);
            console.error('typeof jspdf:', typeof jspdf);
            // Try to reload the library
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                console.log('jsPDF reloaded, retrying...');
                setTimeout(() => generatePDF(transactions), 200);
            };
            document.head.appendChild(script);
            return;
        }
        
        console.log('Creating PDF document...');
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(18);
        doc.text('Relevé de Compte', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Client: ${currentUser.firstName} ${currentUser.lastName}`, 20, 35);
        doc.text(`Compte: ${currentUser.accountNumber}`, 20, 42);
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 49);
        doc.text(`Solde actuel: ${currentUser.balance.toFixed(2)} €`, 20, 56);
        
        // Table header
        let y = 70;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Date', 20, y);
        doc.text('Description', 50, y);
        doc.text('Montant', 150, y);
        doc.text('Solde', 175, y);
        
        y += 5;
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 5;
        
        // Transactions
        doc.setFont(undefined, 'normal');
        transactions.slice(0, 30).forEach((transaction, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            const date = new Date(transaction.date).toLocaleDateString('fr-FR');
            const description = transaction.description.substring(0, 40);
            const amount = transaction.amount >= 0 ? `+${transaction.amount.toFixed(2)}` : transaction.amount.toFixed(2);
            const balance = transaction.balanceAfter.toFixed(2);
            
            doc.setFontSize(9);
            doc.text(date, 20, y);
            doc.text(description, 50, y);
            doc.text(amount, 150, y);
            doc.text(balance, 175, y);
            
            y += 7;
        });
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
        }
        
        // Save PDF
        const fileName = `releve_${currentUser.accountNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
        console.log('Saving PDF as:', fileName);
        
        try {
            doc.save(fileName);
            console.log('PDF saved successfully');
            showMessage('Relevé téléchargé avec succès!', 'success');
        } catch (saveError) {
            console.error('Error saving PDF:', saveError);
            showMessage('Erreur lors de l\'enregistrement du PDF: ' + saveError.message, 'error');
        }
    } catch (error) {
        console.error('Error in generatePDF:', error);
        console.error('Error stack:', error.stack);
        showMessage('Erreur lors de la génération du PDF: ' + (error.message || 'Erreur inconnue'), 'error');
    }
}

// Show message function
function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Admin functionality (integrated into dashboard)
let allUsers = [];
let currentEditingUserId = null;

// Load admin users
async function loadAdminUsers() {
    const usersList = document.getElementById('usersList');
    if (!usersList) return; // Admin tab not loaded yet
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            allUsers = await response.json();
            displayAdminUsers(allUsers);
        } else if (response.status === 403) {
            showMessage('Accès refusé. Privilèges administrateur requis.', 'error');
        } else {
            showMessage('Erreur lors du chargement des utilisateurs', 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    }
}

// Display admin users
function displayAdminUsers(users) {
    const container = document.getElementById('usersList');
    if (!container) return;
    
    if (!users || users.length === 0) {
        container.innerHTML = '<div class="no-users">Aucun utilisateur trouvé</div>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-card" data-user-id="${user.id}">
            <div class="user-info">
                <div class="user-name">${user.firstName} ${user.lastName}</div>
                <div class="user-email">${user.email}</div>
                <div class="user-account">Compte: ${user.accountNumber}</div>
                <div class="user-balance">Solde: ${parseFloat(user.balance).toFixed(2)} €</div>
                ${user.isAdmin ? '<span class="admin-badge">👑 Admin</span>' : ''}
            </div>
            <div class="user-actions">
                <button class="btn btn-small btn-primary" onclick="viewUserDetails(${user.id})">Voir</button>
                <button class="btn btn-small btn-secondary" onclick="editUser(${user.id})">Modifier</button>
                <button class="btn btn-small btn-danger" onclick="deleteUser(${user.id})" ${user.isAdmin ? 'disabled' : ''}>Supprimer</button>
            </div>
        </div>
    `).join('');
}

// View user details
async function viewUserDetails(userId) {
    try {
        const [userResponse, transactionsResponse] = await Promise.all([
            fetch(`${API_BASE}/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            }),
            fetch(`${API_BASE}/admin/users/${userId}/transactions`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
        ]);
        
        if (userResponse.ok && transactionsResponse.ok) {
            const user = await userResponse.json();
            const transactions = await transactionsResponse.json();
            
            document.getElementById('modalTitle').textContent = `Détails: ${user.firstName} ${user.lastName}`;
            document.getElementById('userDetails').innerHTML = `
                <div class="detail-item">
                    <label>Nom complet:</label>
                    <span>${user.firstName} ${user.lastName}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${user.email}</span>
                </div>
                <div class="detail-item">
                    <label>Numéro de compte:</label>
                    <span>${user.accountNumber}</span>
                </div>
                <div class="detail-item">
                    <label>Solde:</label>
                    <span class="balance-amount">${parseFloat(user.balance).toFixed(2)} €</span>
                </div>
                <div class="detail-item">
                    <label>Date de création:</label>
                    <span>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="detail-item">
                    <label>Administrateur:</label>
                    <span>${user.isAdmin ? 'Oui' : 'Non'}</span>
                </div>
            `;
            
            const transactionsContainer = document.getElementById('transactionsContainer');
            if (transactions && transactions.length > 0) {
                transactionsContainer.innerHTML = transactions.map(t => `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <strong>${t.description}</strong>
                            <div class="transaction-date">${new Date(t.date).toLocaleDateString('fr-FR')} ${new Date(t.date).toLocaleTimeString('fr-FR')}</div>
                        </div>
                        <div class="transaction-amount ${t.amount >= 0 ? 'positive' : 'negative'}">
                            ${t.amount >= 0 ? '+' : ''}${parseFloat(t.amount).toFixed(2)} €
                        </div>
                        <div class="transaction-balance">
                            Solde: ${parseFloat(t.balanceAfter).toFixed(2)} €
                        </div>
                    </div>
                `).join('');
            } else {
                transactionsContainer.innerHTML = '<div class="no-transactions">Aucune transaction</div>';
            }
            
            document.getElementById('userModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading user details:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    }
}

// Edit user
async function editUser(userId) {
    currentEditingUserId = userId;
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('modalTitle').textContent = `Modifier: ${user.firstName} ${user.lastName}`;
    document.getElementById('userDetails').innerHTML = `
        <form id="editUserForm" class="edit-user-form">
            <div class="form-group">
                <label for="editFirstName">Prénom:</label>
                <input type="text" id="editFirstName" value="${user.firstName}" required>
            </div>
            <div class="form-group">
                <label for="editLastName">Nom:</label>
                <input type="text" id="editLastName" value="${user.lastName}" required>
            </div>
            <div class="form-group">
                <label for="editEmail">Email:</label>
                <input type="email" id="editEmail" value="${user.email}" required>
            </div>
            <div class="form-group">
                <label for="editBalance">Solde (€):</label>
                <input type="number" id="editBalance" step="0.01" value="${user.balance}" required>
            </div>
            <div class="form-group">
                <label for="editIsAdmin">Administrateur:</label>
                <input type="checkbox" id="editIsAdmin" ${user.isAdmin ? 'checked' : ''}>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Enregistrer</button>
                <button type="button" class="btn btn-secondary" onclick="closeAdminModal()">Annuler</button>
            </div>
        </form>
    `;
    document.getElementById('userTransactions').style.display = 'none';
    document.getElementById('userModal').style.display = 'block';
    
    document.getElementById('editUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUserChanges();
    });
}

// Save user changes
async function saveUserChanges() {
    try {
        const updateData = {
            firstName: document.getElementById('editFirstName').value,
            lastName: document.getElementById('editLastName').value,
            email: document.getElementById('editEmail').value,
            balance: parseFloat(document.getElementById('editBalance').value),
            isAdmin: document.getElementById('editIsAdmin').checked
        };
        
        const response = await fetch(`${API_BASE}/admin/users/${currentEditingUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            showMessage('Utilisateur mis à jour avec succès!', 'success');
            closeAdminModal();
            await loadAdminUsers();
        } else {
            const data = await response.json();
            showMessage(data.message || 'Erreur lors de la mise à jour', 'error');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName}? Cette action est irréversible.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            showMessage('Utilisateur supprimé avec succès!', 'success');
            await loadAdminUsers();
        } else {
            const data = await response.json();
            showMessage(data.message || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    }
}

// Close admin modal
function closeAdminModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userTransactions').style.display = 'block';
    currentEditingUserId = null;
}

// Search users
function searchAdminUsers() {
    const searchTerm = document.getElementById('searchUsers')?.value.toLowerCase();
    if (!searchTerm) {
        displayAdminUsers(allUsers);
        return;
    }
    const filtered = allUsers.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.accountNumber.toLowerCase().includes(searchTerm)
    );
    displayAdminUsers(filtered);
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Setup action buttons immediately
    setTimeout(() => {
        setupActionButtons();
    }, 100);
    
    // Also try after page fully loads
    window.addEventListener('load', () => {
        setupActionButtons();
    });
    
    // Admin tab event listeners
    setTimeout(() => {
        const refreshBtn = document.getElementById('refreshUsersBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadAdminUsers);
        }
        
        const searchInput = document.getElementById('searchUsers');
        if (searchInput) {
            searchInput.addEventListener('input', searchAdminUsers);
        }
        
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', closeAdminModal);
        }
        
        // Close modal when clicking outside
        const modal = document.getElementById('userModal');
        if (modal) {
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    closeAdminModal();
                }
            });
        }
        
        // Load admin users when admin tab is clicked
        const adminSidebarBtn = document.getElementById('adminSidebarBtn');
        if (adminSidebarBtn) {
            adminSidebarBtn.addEventListener('click', function() {
                setTimeout(() => {
                    if (document.getElementById('admin') && document.getElementById('admin').classList.contains('active')) {
                        loadAdminUsers();
                    }
                }, 100);
            });
        }
    }, 500);
});