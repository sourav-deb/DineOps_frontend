function createCard(title, count, iconClass) {
    const card = document.createElement('div');
    card.className = 'card';
    // another class for card
    card.classList.add(`card-${title.replace(/\s+/g, '').toLowerCase()}`);
    
    card.innerHTML = `
        <i class="${iconClass} card-icon"></i>
        <div class="card-title">${title}</div>
        <div class="count">${count}</div>
    `;
    
    return card;
}

function initializeDashboard() {
    const container = document.getElementById('dashboardContainer');
    console.log(container);
    
    // Get data from localStorage
    const foodItems = JSON.parse(localStorage.getItem('allFoodList') || '[]');
    const services = JSON.parse(localStorage.getItem('serviceList') || '[]');
    const tables = JSON.parse(localStorage.getItem('tablesList') || '[]');
    const rooms = JSON.parse(localStorage.getItem('roomsList') || '[]');

    // const foodItems = [{name: 'Food Item 1'}, {name: 'Food Item 2'}, {name: 'Food Item 3'}];
    // const services = [{name: 'Service 1'}, {name: 'Service 2'}, {name: 'Service 3'}];
    // const tables = [{name: 'Table 1'}, {name: 'Table 2'}, {name: 'Table 3'}];
    // const rooms = [{name: 'Room 1'}, {name: 'Room 2'}, {name: 'Room 3'}];

    // Create and append cards with icons
    container.appendChild(createCard('Food Items', foodItems.length, 'fas fa-utensils'));
    container.appendChild(createCard('Services', services.length, 'fas fa-concierge-bell'));
    container.appendChild(createCard('Tables', tables.length, 'fas fa-chair'));
    container.appendChild(createCard('Rooms', rooms.length, 'fas fa-bed'));

    updateAvailabilityCounts();
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);

console.log('dashboard-content.js loaded');
initializeDashboard();


function updateAvailabilityCounts() {
    const tables = JSON.parse(localStorage.getItem('tablesList') || '[]');
    const rooms = JSON.parse(localStorage.getItem('roomsList') || '[]');
    
    // Count available tables (assuming there's a status or isOccupied property)
    const availableTables = tables.filter(table => !table.occupied).length;
    
    // Count available rooms (assuming there's a status or isOccupied property)
    const availableRooms = rooms.filter(room => !room.isOccupied).length;
    
    // Update the counts in the UI
    document.getElementById('availableTablesCount').textContent = availableTables;
    document.getElementById('availableRoomsCount').textContent = availableRooms;
}


// Optionally, update counts periodically
setInterval(updateAvailabilityCounts, 60000);

async function syncAllData() {
    showLoading();
    const syncButton = document.getElementById('syncDataBtn');
    try {
        // Add syncing class for visual feedback
        syncButton.classList.add('syncing');
        syncButton.disabled = true;
        
        // Call the sync function
        await callAllApi();
        
        // Refresh dashboard data
        // initializeDashboard();
        
        // Show success message
        alert('All data synced successfully!', 'success');
        hideLoading();
        document.getElementById('dashboard').click();
        // document.querySelector('.selected').click();
    } catch (error) {
        console.error('Sync failed:', error);
        alert('Failed to sync data. Please try again.', 'error');
        hideLoading();
    } finally {
        // Remove syncing class and re-enable button
        syncButton.classList.remove('syncing');
        syncButton.disabled = false;
    }
}

document.getElementById('syncDataBtn').addEventListener('click', syncAllData);
