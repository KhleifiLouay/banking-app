// API Configuration - Use dynamic port detection
const API_BASE = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) 
  ? API_BASE_URL 
  : (() => {
      // Fallback: construct from current location
      const hostname = window.location.hostname;
      const port = window.location.port;
      const protocol = window.location.protocol;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return port ? `${protocol}//${hostname}:${port}/api` : `${protocol}//${hostname}:5000/api`;
      }
      return '/api';
    })();
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
    
    console.log('Displaying users:', users.length);
    
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
                <button class="btn btn-small btn-primary" data-action="view" data-user-id="${user.id}" type="button" onclick="window.viewUserDetails(${user.id})">Voir</button>
                <button class="btn btn-small btn-secondary" data-action="edit" data-user-id="${user.id}" type="button" onclick="window.editUser(${user.id})">Modifier</button>
                <button class="btn btn-small btn-danger" data-action="delete" data-user-id="${user.id}" type="button" onclick="if(!this.disabled) window.deleteUser(${user.id})" ${user.isAdmin ? 'disabled' : ''}>Supprimer</button>
            </div>
        </div>
    `).join('');
    
    console.log('Users displayed, buttons should be clickable now');
}

// View user details - make globally accessible
window.viewUserDetails = async function(userId) {
    console.log('viewUserDetails called with userId:', userId);
    console.log('API_BASE:', API_BASE);
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Token manquant. Veuillez vous reconnecter.', 'error');
            return;
        }
        
        const userUrl = `${API_BASE}/admin/users/${userId}`;
        const transactionsUrl = `${API_BASE}/admin/users/${userId}/transactions`;
        
        console.log('Fetching user from:', userUrl);
        console.log('Fetching transactions from:', transactionsUrl);
        
        const [userResponse, transactionsResponse] = await Promise.all([
            fetch(userUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }),
            fetch(transactionsUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
        ]);
        
        console.log('User response status:', userResponse.status);
        console.log('Transactions response status:', transactionsResponse.status);
        
        if (userResponse.ok && transactionsResponse.ok) {
            const user = await userResponse.json();
            const transactions = await transactionsResponse.json();
            
            document.getElementById('modalTitle').textContent = `Détails: ${user.firstName} ${user.lastName}`;
            document.getElementById('userDetails').innerHTML = `
                <div class="detail-item">
                    <label>ID:</label>
                    <span>${user.id}</span>
                </div>
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

// Edit user - make globally accessible
window.editUser = async function(userId) {
    console.log('editUser called with userId:', userId);
    console.log('Available users:', allUsers);
    
    currentEditingUserId = userId;
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) {
        console.error('User not found in allUsers array:', userId);
        showMessage('Utilisateur non trouvé', 'error');
        return;
    }
    
    console.log('Editing user:', user);
    
    document.getElementById('modalTitle').textContent = `Modifier: ${user.firstName} ${user.lastName}`;
    document.getElementById('userDetails').innerHTML = `
        <form id="editUserForm" class="edit-user-form">
            <div class="form-group">
                <label for="editId">ID:</label>
                <input type="text" id="editId" value="${user.id}" readonly style="background-color: #f0f0f0; cursor: not-allowed;">
                <small style="color: #666;">L'ID ne peut pas être modifié</small>
            </div>
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
                <label for="editPassword">Nouveau mot de passe:</label>
                <input type="password" id="editPassword" placeholder="Laisser vide pour ne pas changer">
                <small style="color: #666;">Laisser vide si vous ne voulez pas changer le mot de passe</small>
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
                <button type="button" class="btn btn-secondary" id="cancelEditBtn">Annuler</button>
            </div>
        </form>
    `;
    document.getElementById('userTransactions').style.display = 'none';
    document.getElementById('userModal').style.display = 'block';
    
    // Handle form submission
    const form = document.getElementById('editUserForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveUserChanges();
        });
    }
    
    // Handle cancel button
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
}

// Save user changes
async function saveUserChanges() {
    try {
        const password = document.getElementById('editPassword').value.trim();
        const updateData = {
            firstName: document.getElementById('editFirstName').value.trim(),
            lastName: document.getElementById('editLastName').value.trim(),
            email: document.getElementById('editEmail').value.trim(),
            balance: parseFloat(document.getElementById('editBalance').value),
            isAdmin: document.getElementById('editIsAdmin').checked
        };
        
        // Only include password if it's not empty
        if (password) {
            updateData.password = password;
        }
        
        // Validate inputs
        if (!updateData.firstName || !updateData.lastName || !updateData.email) {
            showMessage('Tous les champs obligatoires doivent être remplis', 'error');
            return;
        }
        
        if (updateData.balance < 0) {
            showMessage('Le solde ne peut pas être négatif', 'error');
            return;
        }
        
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

// Delete user - make globally accessible
window.deleteUser = async function(userId) {
    console.log('deleteUser called with userId:', userId);
    
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        console.error('User not found for deletion:', userId);
        showMessage('Utilisateur non trouvé', 'error');
        return;
    }
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName}? Cette action est irréversible.`)) {
        console.log('User cancelled deletion');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Token manquant. Veuillez vous reconnecter.', 'error');
            return;
        }
        
        const deleteUrl = `${API_BASE}/admin/users/${userId}`;
        console.log('Deleting user from:', deleteUrl);
        
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Delete response status:', response.status);
        
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

// Close modal - make globally accessible
window.closeModal = function() {
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

// Event delegation for user action buttons (works with dynamically added content)
document.addEventListener('click', function(e) {
    // Check if clicked element or its parent is a button with data-action
    let button = e.target;
    while (button && button !== document.body) {
        if (button.tagName === 'BUTTON' && button.hasAttribute('data-action')) {
            break;
        }
        button = button.parentElement;
    }
    
    if (!button || !button.hasAttribute('data-action')) return;
    
    const container = document.getElementById('usersList');
    if (!container || !container.contains(button)) return;
    
    const action = button.getAttribute('data-action');
    const userId = parseInt(button.getAttribute('data-user-id'));
    
    console.log('Admin button clicked:', { action, userId, button });
    
    if (!userId || isNaN(userId)) {
        console.error('Invalid user ID:', userId);
        return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    switch(action) {
        case 'view':
            console.log('Calling viewUserDetails for user:', userId);
            viewUserDetails(userId);
            break;
        case 'edit':
            console.log('Calling editUser for user:', userId);
            editUser(userId);
            break;
        case 'delete':
            if (!button.disabled) {
                console.log('Calling deleteUser for user:', userId);
                deleteUser(userId);
            } else {
                console.log('Delete button is disabled for user:', userId);
            }
            break;
        default:
            console.warn('Unknown action:', action);
    }
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
    console.log('Admin page loaded, API_BASE:', API_BASE);
    checkAdminAuth();
    
    // Test: Log when any button in usersList is clicked
    setTimeout(() => {
        const container = document.getElementById('usersList');
        if (container) {
            console.log('Users list container found, setting up click test');
            container.addEventListener('click', function(e) {
                console.log('Click detected in usersList:', e.target, e.target.tagName);
            });
        }
    }, 1000);
});

