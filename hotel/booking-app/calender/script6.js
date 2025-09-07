let currentDate = new Date();

const roomBookings = {
    101: [
        {
            guestName: "John Doe",
            age: 25,
            email: "john.doe@example.com",
            phoneNumber: "1234567890",
            checkIn: new Date(2024, 8, 1, 12, 0),
            checkOut: new Date(2024, 8, 4, 11, 0)
        },
        {
            guestName: "Amit Dev",
            age: 25,
            email: "john.doe@example.com",
            phoneNumber: "1234567890",
            checkIn: new Date(2024, 8, 6, 12, 0),
            checkOut: new Date(2024, 8, 7, 11, 0)
        }
    ],
    102: [
        {
            guestName: "Alice Johnson",
            age: 25,
            email: "john.doe@example.com",
            phoneNumber: "1234567890",
            checkIn: new Date(2024, 8, 4, 14, 0),
            checkOut: new Date(2024, 8, 7, 11, 0)
        },
        {
            guestName: "Alice Johnson",
            age: 25,
            email: "john.doe@example.com",
            phoneNumber: "1234567890",
            checkIn: new Date(2024, 7, 24, 14, 0),
            checkOut: new Date(2024, 7, 27, 11, 0)
        }
    ]
};


function generateCalendar(startDate) {
    const calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create header row with dates and day names
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Room</th>';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dayName = dayNames[date.getDay()];
        headerRow.innerHTML += `<th>${dayName}<br>${date.getDate()}/${date.getMonth() + 1}</th>`;
    }
    thead.appendChild(headerRow);

    // Create rows for each room
    for (const roomNumber in roomBookings) {
        const roomRow = document.createElement('tr');
        roomRow.innerHTML = `<td>${roomNumber}</td>`;

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const cellContent = generateDayCells(roomNumber, date);
            roomRow.innerHTML += `<td>${cellContent}</td>`;
        }

        tbody.appendChild(roomRow);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    calendarDiv.appendChild(table);
}

function generateDayCells2(roomNumber, date) {
    let cellContent = '';
    for (let hour = 0; hour < 24; hour++) {
        const cellDate = new Date(date);
        cellDate.setHours(hour);
        const isBooked = checkBookingStatus(roomNumber, cellDate);
        const cellClass = isBooked ? 'booked' : 'available';
        cellContent += `<div class="hour-cell ${cellClass}"></div>`;
    }
    return cellContent;
}

function generateDayCells3(roomNumber, date) {
    let cellContent = '<div class="day-cell">';
    for (let hour = 0; hour < 24; hour++) {
        const cellDate = new Date(date);
        cellDate.setHours(hour);
        const isBooked = checkBookingStatus(roomNumber, cellDate);
        const cellClass = isBooked ? 'booked' : 'available';
        cellContent += `<div class="hour-cell ${cellClass}"></div>`;
    }
    cellContent += '</div>';
    return cellContent;
}

function generateDayCells4(roomNumber, date) {
    let cellContent = '<div class="day-cell">';
    for (let hour = 0; hour < 24; hour++) {
        const cellDate = new Date(date);
        cellDate.setHours(hour);
        const bookingInfo = getBookingInfo(roomNumber, cellDate);
        const cellClass = bookingInfo ? 'booked' : 'available';
        const tooltipContent = bookingInfo ? `Guest: ${bookingInfo.guestName}\nCheck-in: ${formatDate(bookingInfo.checkIn)}\nCheck-out: ${formatDate(bookingInfo.checkOut)}` : '';
        cellContent += `<div class="hour-cell ${cellClass}" data-tooltip="${tooltipContent}"></div>`;
    }
    cellContent += '</div>';
    return cellContent;
}

function generateDayCells(roomNumber, date) {
    let cellContent = '<div class="day-cell">';
    for (let hour = 0; hour < 24; hour++) {
        const cellDate = new Date(date);
        cellDate.setHours(hour);
        const { isBooked, isPast } = checkBookingStatus(roomNumber, cellDate);
        let cellClass = 'available';
        if (isBooked) {
            cellClass = isPast ? 'past-booked' : 'booked';
            const bookingInfo = getBookingInfo(roomNumber, cellDate);
            const tooltipContent = bookingInfo ? 
                `Guest: ${bookingInfo.guestName}\nAge: ${bookingInfo.age}\nPhone: ${bookingInfo.phoneNumber}\nCheck-in: ${formatDate(bookingInfo.checkIn)}\nCheck-out: ${formatDate(bookingInfo.checkOut)}` : '';
            cellContent += `<div class="hour-cell ${cellClass}" data-tooltip="${tooltipContent}" onclick="showBookingModal(${roomNumber}, '${cellDate.toISOString()}')"></div>`;
        } else {
            cellContent += `<div class="hour-cell ${cellClass}"></div>`;
        }
    }
    cellContent += '</div>';
    return cellContent;
}


function generateDayCells(roomNumber, date) {
    let cellContent = '<div class="day-cell">';
    for (let hour = 0; hour < 24; hour++) {
        const cellDate = new Date(date);
        cellDate.setHours(hour);
        const { isBooked, isPast } = checkBookingStatus(roomNumber, cellDate);
        let cellClass = 'available';
        if (isBooked) {
            cellClass = isPast ? 'past-booked' : 'booked';
            const bookingInfo = getBookingInfo(roomNumber, cellDate);
            const tooltipContent = bookingInfo ? `Guest: ${bookingInfo.guestName}\nCheck-in: ${formatDate(bookingInfo.checkIn)}\nCheck-out: ${formatDate(bookingInfo.checkOut)}` : '';
            cellContent += `<div class="hour-cell ${cellClass}" data-tooltip="${tooltipContent}" onclick="showBookingModal(${roomNumber}, '${cellDate.toISOString()}')"></div>`;
        } else {
            cellContent += `<div class="hour-cell ${cellClass}"></div>`;
        }
    }
    cellContent += '</div>';
    return cellContent;
}


function getBookingInfo(roomNumber, date) {
    const bookings = roomBookings[roomNumber];
    if (!bookings) return null;

    return bookings.find(booking => date >= booking.checkIn && date < booking.checkOut);
}

function formatDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function checkBookingStatus2(roomNumber, date) {
    const bookings = roomBookings[roomNumber];
    if (!bookings) return false;

    return bookings.some(booking => {
        return date >= booking.checkIn && date < booking.checkOut;
    });
}

function checkBookingStatus(roomNumber, date) {
    const bookings = roomBookings[roomNumber];
    if (!bookings) return { isBooked: false, isPast: false };

    const now = new Date();
    for (const booking of bookings) {
        if (date >= booking.checkIn && date < booking.checkOut) {
            return { isBooked: true, isPast: booking.checkOut < now };
        }
    }
    return { isBooked: false, isPast: false };
}

function updateCalendar() {
    generateCalendar(currentDate);
    updateCurrentMonth();

    // Update the selected month in the dropdown
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.value = currentDate.getMonth();
}

function updateCurrentMonth() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    document.getElementById('currentMonth').textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

document.getElementById('prevWeek').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 7);
    updateCalendar();
});

document.getElementById('nextWeek').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 7);
    updateCalendar();
});

const monthSelect = document.getElementById('monthSelect');
for (let i = 0; i < 12; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = new Date(2024, i, 1).toLocaleString('default', { month: 'long' });
    monthSelect.appendChild(option);
}

monthSelect.addEventListener('change', (e) => {
    currentDate.setMonth(parseInt(e.target.value));
    currentDate.setDate(1);
    updateCalendar();
});

updateCalendar();

// Show booking modal
function showBookingModal(roomNumber, dateString) {
    const date = new Date(dateString);
    const bookingInfo = getBookingInfo(roomNumber, date);
    
    if (bookingInfo) {
        const modalContent = `
            <h2>Booking Details</h2>
            <p><strong>Room Number:</strong> ${roomNumber}</p>
            <p><strong>Guest Name:</strong> ${bookingInfo.guestName}</p>
            <p><strong>Age:</strong> ${bookingInfo.age}</p>
            <p><strong>Email:</strong> ${bookingInfo.email}</p>
            <p><strong>Phone Number:</strong> ${bookingInfo.phoneNumber}</p>
            <p><strong>Check-in:</strong> ${formatDate(bookingInfo.checkIn)}</p>
            <p><strong>Check-out:</strong> ${formatDate(bookingInfo.checkOut)}</p>
        `;
        
        const modal = document.getElementById('bookingModal');
        const modalBody = modal.querySelector('.modal-body');
        setTimeout(() => modal.classList.add('show'), 10);

        modalBody.innerHTML = modalContent;
        
        modal.style.display = 'block';
    }
}

document.querySelector('.close').onclick = function() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}