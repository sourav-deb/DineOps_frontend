document.addEventListener('DOMContentLoaded', function() {
    // initializeHome();
    updateStats();
});



async function updateStats() {
    // Get all required data from localStorage
    const rooms = JSON.parse(localStorage.getItem('roomsList') || '[]');
    const bookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
    const orders = JSON.parse(localStorage.getItem('allOrders') || '[]');

    // Get current date for comparison
    const now = new Date();

    // 1. Available Rooms Calculation
    const availableRooms = rooms.filter(room => {
        // Check if room status is available
        if (room.status !== 'available') return false;

        // Check if room has any active bookings for current date
        if (room.bookings && room.bookings.length > 0) {
            return !room.bookings.some(booking => {
                const startDate = new Date(booking.booking.start_date);
                const endDate = new Date(booking.booking.end_date);
                return booking.booking.is_active && 
                       now >= startDate && 
                       now <= endDate;
            });
        }
        
        // If no bookings, room is available
        return true;
    }).length;

    const totalRooms = rooms.length;

    // 2. Current Guests Calculation
    const currentGuests = rooms.reduce((count, room) => {
        if (room.bookings && room.bookings.length > 0) {
            const activeBooking = room.bookings.find(booking => {
                const startDate = new Date(booking.booking.start_date);
                const endDate = new Date(booking.booking.end_date);
                return booking.booking.is_active && 
                       now >= startDate && 
                       now <= endDate;
            });
            return count + (activeBooking ? 1 : 0);
        }
        return count;
    }, 0);

    // 3. Today's Bookings
    const todayBookings = rooms.reduce((count, room) => {
        if (room.bookings && room.bookings.length > 0) {
            const todayBookingsCount = room.bookings.filter(booking => {
                const bookingDate = new Date(booking.booking.start_date);
                return bookingDate.toDateString() === now.toDateString();
            }).length;
            return count + todayBookingsCount;
        }
        return count;
    }, 0);

    // 4. Active Orders
    const activeOrders = orders.filter(order => {
        return order.status === 'pending' || 
               order.status === 'confirmed' || 
               order.status === 'preparing';
    }).length;

    // Update DOM with formatted numbers
    document.getElementById('availableRooms').innerHTML = `
        <span class="number">${availableRooms}</span>
        <span class="total">/ ${totalRooms}</span>
    `;
    // document.getElementById('currentGuests').innerHTML = `
    //     <span class="number">${currentGuests}</span>
    // `;
    // document.getElementById('todayBookings').innerHTML = `
    //     <span class="number">${todayBookings}</span>
    // `;
    // document.getElementById('activeOrders').innerHTML = `
    //     <span class="number">${activeOrders}</span>
    // `;

    // Add detailed tooltips
    const availableRoomsCard = document.querySelector('.stat-card:nth-child(1)');
    availableRoomsCard.title = `Available Rooms: ${availableRooms}
Total Rooms: ${totalRooms}
Occupied Rooms: ${totalRooms - availableRooms}`;

    const currentGuestsCard = document.querySelector('.stat-card:nth-child(2)');
    currentGuestsCard.title = `Current Active Bookings: ${currentGuests}`;

    const todayBookingsCard = document.querySelector('.stat-card:nth-child(3)');
    todayBookingsCard.title = `New Check-ins Today: ${todayBookings}`;

    const activeOrdersCard = document.querySelector('.stat-card:nth-child(4)');
    activeOrdersCard.title = `Active Orders: ${activeOrders}
(Pending, Confirmed, or Preparing)`;

    // Set up auto-refresh every 30 seconds
    setTimeout(updateStats, 30000);
}

updateStats();

// Initialize the stats and refresh button when the page loads
// document.addEventListener('DOMContentLoaded', function() {
//     updateStats();
    
//     // Add refresh button if it doesn't exist
//     if (!document.querySelector('.refresh-stats-btn')) {
//         const statsContainer = document.querySelector('.stats-container');
//         const refreshButton = document.createElement('button');
//         refreshButton.className = 'refresh-stats-btn';
//         refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
//         refreshButton.onclick = updateStats;
//         statsContainer.parentElement.insertBefore(refreshButton, statsContainer.nextSibling);
//     }
// });
