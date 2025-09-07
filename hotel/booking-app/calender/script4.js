let currentDate = new Date();
console.log(`Current Date from <1>: ${currentDate.toDateString()}`);

function generateWeekDates(startDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
    }
    return dates;
}

function formatDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

function generateCalendar2(startDate) {
    const weekDates = generateWeekDates(startDate);
    const calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = '';

    const table = document.createElement('table');
    
    // Add day names row
    const dayNamesRow = table.insertRow();
    dayNamesRow.innerHTML = '<th>Room</th>' + weekDates.map(date => `<th>${getDayName(date)}</th>`).join('');

    // Add date row
    const dateRow = table.insertRow();
    dateRow.innerHTML = '<th></th>' + weekDates.map(date => `<th>${formatDate(date)}</th>`).join('');

    // Sample room data - replace with your actual data
    const rooms = ['101', '102', '103', '104', '105'];

    rooms.forEach(room => {
        const row = table.insertRow();
        row.innerHTML = `<td>${room}</td>` + weekDates.map(() => '<td><div class="half-day"></div><div class="half-day"></div></td>').join('');
    });

    calendarDiv.appendChild(table);
    updateBookings();
}

function updateBookings2() {
    // Sample booking data - replace with your actual booking data
    const bookings = [
        { room: '101', checkIn: new Date(2024, 9-1, 2, 15, 0), checkOut: new Date(2024, 9-1, 3, 15, 0) },
        { room: '101', checkIn: new Date(2023, 7, 20, 15, 0), checkOut: new Date(2023, 7, 22, 10, 0) },
        { room: '102', checkIn: new Date(2023, 7, 16, 15, 0), checkOut: new Date(2023, 7, 19, 10, 0) },
        { room: '103', checkIn: new Date(2023, 7, 17, 13, 0), checkOut: new Date(2023, 7, 20, 12, 0) },
    ];

    const cells = document.querySelectorAll('td');
    cells.forEach(cell => {
        const halfDays = cell.querySelectorAll('.half-day');
        halfDays.forEach(halfDay => {
            halfDay.classList.remove('booked', 'available');
            halfDay.classList.add('available');
            halfDay.innerHTML = '';
        });
    });

    bookings.forEach(booking => {
        const roomRow = Array.from(document.querySelectorAll('tr')).find(row => row.firstChild.textContent === booking.room);
        if (roomRow) {
            const dateCells = roomRow.querySelectorAll('td:not(:first-child)');
            dateCells.forEach((cell, index) => {
                const cellDate = new Date(currentDate);
                cellDate.setDate(currentDate.getDate() + index);
                const halfDays = cell.querySelectorAll('.half-day');

                const bookingStart = new Date(booking.checkIn);
                bookingStart.setHours(0, 0, 0, 0);
                const bookingEnd = new Date(booking.checkOut);
                bookingEnd.setDate(bookingEnd.getDate() + 1);
                bookingEnd.setHours(0, 0, 0, 0);

                if (cellDate >= bookingStart && cellDate < bookingEnd) {
                    halfDays[0].classList.remove('available');
                    halfDays[0].classList.add('booked');
                    halfDays[1].classList.remove('available');
                    halfDays[1].classList.add('booked');
                }

                if (cellDate.toDateString() === booking.checkIn.toDateString()) {
                    halfDays[0].innerHTML += `<span class="tooltip">Check-in: ${booking.checkIn.getHours()}:${String(booking.checkIn.getMinutes()).padStart(2, '0')}</span>`;
                }

                if (cellDate.toDateString() === booking.checkOut.toDateString()) {
                    halfDays[1].innerHTML += `<span class="tooltip">Check-out: ${booking.checkOut.getHours()}:${String(booking.checkOut.getMinutes()).padStart(2, '0')}</span>`;
                }
            });
        }
    });
}

function generateCalendar(startDate) {
    const weekDates = generateWeekDates(startDate);
    const calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = '';

    const table = document.createElement('table');
    
    // Add day names row
    const dayNamesRow = table.insertRow();
    dayNamesRow.innerHTML = '<th>Room</th>' + weekDates.map(date => `<th>${getDayName(date)}</th>`).join('');

    // Add date row
    const dateRow = table.insertRow();
    dateRow.innerHTML = '<th></th>' + weekDates.map(date => `<th>${formatDate(date)}</th>`).join('');

    // Sample room data - replace with your actual data
    const rooms = ['101', '102', '103', '104', '105'];

    rooms.forEach(room => {
        const row = table.insertRow();
        row.innerHTML = `<td>${room}</td>` + weekDates.map(() => {
            let hourCells = '';
            for (let i = 0; i < 24; i++) {
                hourCells += `<div class="hour-cell" data-hour="${i}"></div>`;
            }
            return `<td>${hourCells}</td>`;
        }).join('');
    });

    calendarDiv.appendChild(table);
    updateBookings();
}

function updateBookings() {
    const today = new Date();

    const roomBookings = {
    101: [
        {
            guestName: "John Doe",
            checkIn: new Date(2024, 8, 1, 14, 0), 
            checkOut: new Date(2024, 8, 4, 11, 0)
        }
    ],
    101: [
        {
            guestName: "Johny Doel",
            checkIn: new Date(2024, 8, 1, 14, 0), 
            checkOut: new Date(2024, 8, 4, 11, 0)
        }
    ],
    102: [
        {
            guestName: "Alice Johnson",
            checkIn: new Date(2024, 8, 1, 14, 0), 
            checkOut: new Date(2024, 8, 4, 11, 0)
        }
    ]
    // Add more rooms and bookings as needed
};
    
    const bookings = [
        { 
            room: '101', 
            checkIn: new Date(2024, 8, 1, 2, 0), 
            checkOut: new Date(2024, 8, 3, 4, 0) 
        },
        { room: '101', checkIn: new Date(2024, 8, 6, 14, 0), checkOut: new Date(2024, 8, 9, 14, 0) },
        { room: '102', checkIn: new Date(2024, 7, 16, 15, 0), checkOut: new Date(2024, 7, 19, 10, 0) },
        { room: '103', checkIn: new Date(2024, 7, 17, 13, 0), checkOut: new Date(2024, 7, 20, 12, 0) },
    ];

    bookings.forEach(booking => {
        const roomRow = Array.from(document.querySelectorAll('tr')).find(row => row.firstChild.textContent === booking.room);
        if (roomRow) {
            const dateCells = roomRow.querySelectorAll('td:not(:first-child)');
            dateCells.forEach((cell, index) => {
                const cellDate = new Date(currentDate);
                cellDate.setDate(currentDate.getDate() + index);

                if (cellDate >= booking.checkIn && cellDate <= booking.checkOut) {
                    const hourCells = cell.querySelectorAll('.hour-cell');
                    hourCells.forEach((hourCell, hour) => {
                        if (cellDate.toDateString() === booking.checkIn.toDateString() && hour < booking.checkIn.getHours()) {
                            return;
                        }
                        if (cellDate.toDateString() === booking.checkOut.toDateString() && hour >= booking.checkOut.getHours()) {
                            return;
                        }
                        hourCell.classList.add('booked');
                    });
                }
            });
        }
    });
}


function getDayName(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}

function updateMonthDisplay() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('currentMonth').textContent = monthNames[currentDate.getMonth()];
}

function populateMonthSelect() {
    const monthSelect = document.getElementById('monthSelect');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthNames.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    monthSelect.value = currentDate.getMonth();
}

document.getElementById('prevWeek').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 7);
    generateCalendar(currentDate);
    updateMonthDisplay();
});

document.getElementById('nextWeek').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 7);
    generateCalendar(currentDate);
    updateMonthDisplay();
});

document.getElementById('monthSelect').addEventListener('change', (e) => {
    currentDate.setMonth(parseInt(e.target.value));
    generateCalendar(currentDate);
    updateMonthDisplay();
});

// Initialize the calendar
populateMonthSelect();
generateCalendar(currentDate);
updateMonthDisplay();
