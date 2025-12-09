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

async function initializeDashboard() {
    const container = document.getElementById('dashboardContainer');
    console.log('Dashboard Container:', container);

    if (!container) {
        console.error('dashboardContainer element not found');
        return;
    }

    try {
        // Get data from localForage
        console.log('Fetching dashboard data...');
        const foodItems = await localforage.getItem('allFoodList') || [];
        const services = await localforage.getItem('serviceList') || [];
        const tables = await localforage.getItem('tablesList') || [];
        const rooms = await localforage.getItem('roomsList') || [];

        console.log('Data fetched:', {
            foodItems: foodItems.length,
            services: services.length,
            tables: tables.length,
            rooms: rooms.length
        });

        // Create and append cards with icons
        container.innerHTML = ''; // Clear container before appending to avoid duplicates
        container.appendChild(createCard('Food Items', foodItems.length, 'fas fa-utensils'));
        container.appendChild(createCard('Services', services.length, 'fas fa-concierge-bell'));
        container.appendChild(createCard('Tables', tables.length, 'fas fa-chair'));
        container.appendChild(createCard('Rooms', rooms.length, 'fas fa-bed'));

        await updateAvailabilityCounts();
        await updateTotalBills();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Initialize dashboard when page loads
// Initialize dashboard when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

console.log('dashboard-content.js loaded');

async function updateAvailabilityCounts() {
    const tables = await localforage.getItem('tablesList') || [];
    const rooms = await localforage.getItem('roomsList') || [];

    const availableTables = tables.filter(table => !table.occupied).length;
    const availableRooms = rooms.filter(room => !room.isOccupied).length;

    const tablesCountEl = document.getElementById('availableTablesCount');
    const roomsCountEl = document.getElementById('availableRoomsCount');

    if (tablesCountEl) tablesCountEl.textContent = availableTables;
    if (roomsCountEl) roomsCountEl.textContent = availableRooms;
}

async function updateTotalBills() {
    const billingList = await localforage.getItem('billingList') || [];
    const paymentsList = await localforage.getItem('paymentsList') || [];
    const ordersList = await localforage.getItem('ordersList') || [];

    // Helper to get date string in IST (+5:30)
    const getISTDateString = (dateInput) => {
        const date = dateInput ? new Date(dateInput) : new Date();
        // Add 5 hours and 30 minutes in milliseconds
        const offset = (5 * 60 + 30) * 60 * 1000;
        const istDate = new Date(date.getTime() + offset);
        return istDate.toISOString().split('T')[0];
    };

    const today = getISTDateString();

    const dailyOrders = ordersList.filter(order => {
        const orderDate = getISTDateString(order.created_at);
        return orderDate === today;
    });

    // Filter bills associated with today's orders
    const dailyBills = billingList.filter(bill => {
        const order = dailyOrders.find(o => o.id === bill.order_id);
        return order !== undefined;
    });

    // Calculate total received amount for these bills
    const totalReceived = dailyBills.reduce((sum, bill) => {
        const payment = paymentsList.find(p => p.bill_id === bill.id);
        return sum + (payment ? parseFloat(payment.paid_amount) : 0);
    }, 0);

    const totalBillsEl = document.getElementById('totalBillsCount');
    if (totalBillsEl) totalBillsEl.textContent = `₹${totalReceived.toFixed(2)}`;
}

// Update counts periodically
setInterval(async () => {
    await updateAvailabilityCounts();
    await updateTotalBills();
}, 60000);

async function syncAllData() {
    showLoading();
    const syncButton = document.getElementById('syncDataBtn');
    try {
        syncButton.classList.add('syncing');
        syncButton.disabled = true;

        await callAllApi();

        alert('All data synced successfully!', 'success');
        hideLoading();
        // Refresh dashboard by re-clicking the dashboard link or re-init
        // initializeDashboard(); // Better to just re-init or reload
        document.getElementById('dashboard').click();
    } catch (error) {
        console.error('Sync failed:', error);
        alert('Failed to sync data. Please try again.', 'error');
        hideLoading();
    } finally {
        syncButton.classList.remove('syncing');
        syncButton.disabled = false;
    }
}

document.getElementById('syncDataBtn')?.addEventListener('click', syncAllData);
