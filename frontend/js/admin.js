// API Configuration - Change this when deploying to production
const API_BASE = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) 
  ? API_BASE_URL 
  : 'http://localhost:5000/api';
let allUsers = [];
let currentEditingUserId = null;

// Check authentication and admin status
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    const userData = JSON.parse(user);
    if (!userData.isAdmin) {
        showMessage('Accès refusé. Privilèges administrateur requis.', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return;
    }
    
    document.getElementById('adminWelcome').textContent = `Admin: ${userData.firstName} ${userData.lastName}`;
    loadUsers();
}

// Load all users
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Token manquant. Veuillez vous reconnecter.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        const response = await fetch(`${API_BASE}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            allUsers = await response.json();
            displayUsers(allUsers);
        } else if (response.status === 403) {
            showMessage('Accès refusé. Privilèges administrateur requis.', 'error');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else if (response.status === 401) {
            showMessage('Session expirée. Veuillez vous reconnecter.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            const errorData = await response.json().catch(() => ({}));
            showMessage(errorData.message || 'Erreur lors du chargement des utilisateurs', 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showMessage('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré sur le port 5000.', 'error');
        } else {
            showMessage('Erreur de connexion au serveur: ' + error.message, 'error');
        }
    }
}

// Display users
function displayUsers(users) {
    const container = document.getElementById('usersList');
    
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
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
            fetch(`${API_BASE}/admin/users/${userId}/transactions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
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
            
            // Display transactions
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
        } else {
            showMessage('Erreur lors du chargement des détails', 'error');
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
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Annuler</button>
            </div>
        </form>
    `;
    document.getElementById('userTransactions').style.display = 'none';
    document.getElementById('userModal').style.display = 'block';
    
    // Handle form submission
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
            closeModal();
            await loadUsers();
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
            await loadUsers();
        } else {
            const data = await response.json();
            showMessage(data.message || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    }
}

// Close modal
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userTransactions').style.display = 'block';
    currentEditingUserId = null;
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const filtered = allUsers.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.accountNumber.toLowerCase().includes(searchTerm)
    );
    displayUsers(filtered);
}

// Show message
function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Event listeners
document.getElementById('refreshUsersBtn').addEventListener('click', loadUsers);
document.getElementById('searchUsers').addEventListener('input', searchUsers);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
});

