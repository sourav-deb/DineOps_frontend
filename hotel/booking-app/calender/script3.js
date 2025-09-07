let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Sample room data with guest bookings
const roomBookings = {
    101: [
        {
            guestName: "John Doe",
            checkInDate: new Date("2023-07-25T14:00:00"),
            checkOutDate: new Date("2023-07-28T11:00:00")
        }
    ],
    102: [
        {
            guestName: "Alice Johnson",
            checkInDate: new Date("2023-07-16T13:45:00"),
            checkOutDate: new Date("2023-07-19T12:00:00")
        }
    ]
    // Add more rooms and bookings as needed
};

// Helper function to get the start of the week
function startOfWeek(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust if day is Sunday
    return new Date(date.setDate(diff));
}

// Function to check if a room is booked during a specific 12-hour period and calculate the colspan
function getBookingSpan(roomBookings, startTime, endTime) {
    console.log(`Room bookings from <6>: ${roomBookings}`);
    for (const booking of roomBookings) {
        if (startTime < booking.checkOutDate && endTime > booking.checkInDate) {
            const checkIn = booking.checkInDate > startTime ? booking.checkInDate : startTime;
            const checkOut = booking.checkOutDate < endTime ? booking.checkOutDate : endTime;

            // Calculate the number of half-day cells to span
            const span = eath.ceil((checkOut - checkIn) / (12 * 60 * 60 * 1000));

            return {
                status: 'booked',
                guestName: booking.guestName,
                colspan: 3,
                nextTime: checkIn.getTime() + span * 12 * 60 * 60 * 1000
            };
        }
    }
    return { status: 'available', guestName: null, colspan: 1, nextTime: endTime.getTime() };
}

// Helper function to generate the week view with room booking statuses
function generateWeekCalendar(date) {
    console.log(`Date from <2>: ${currentDate.toDateString()}`);
    const calendarDiv = document.getElementById('calendar');
    const start = startOfWeek(date);
    console.log(`Start of weekfrom <3>: ${start.toDateString()}`);
    const daysInWeek = 7;

    let calendar = '<table>';

    // Table header with room numbers and day names
    calendar += '<tr><th rowspan="2">Room</th>';
    for (let i = 0; i < daysInWeek; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        calendar += `<th colspan="2">${day.toDateString().slice(0, 3)} ${day.getDate()}</th>`;
    }
    calendar += '</tr>';

    // console.log(calendar);
    console.log(`Days in week from <4>: ${daysInWeek}`);

    // Second row for 12-hour periods
    calendar += '<tr>';
    for (let i = 0; i < daysInWeek; i++) {
        calendar += '<th>12 AM - 12 PM</th><th>12 PM - 12 AM</th>';
    }
    calendar += '</tr>';

    // Generate rows for each room
    Object.keys(roomBookings).forEach(room => {
        calendar += `<tr><td>${room}</td>`;

        let currentTime = start.getTime();
        console.log(`Current time from <5>: ${currentTime}`);

        while (currentTime < start.getTime() + daysInWeek * 24 * 60 * 60 * 1000) {
            const startTime = new Date(currentTime);
            const endTime = new Date(currentTime + 12 * 60 * 60 * 1000); // 12 hours later

            console.log(`Rooms : ${room} , Start time: ${startTime.toLocaleTimeString()}, End time: ${endTime.toLocaleTimeString()}`);
            const bookingSpan = getBookingSpan(roomBookings[room], startTime, endTime);

            calendar += `
                <td class="${bookingSpan.status}" colspan="${bookingSpan.colspan}">
                    ${bookingSpan.status === 'booked' ? `Booked (${bookingSpan.guestName})` : 'Available'}
                </td>
            `;

            // Move the currentTime to the next time block after the colspan
            currentTime = bookingSpan.nextTime;
        }

        calendar += '</tr>';
    });

    calendar += '</table>';
    calendarDiv.innerHTML = calendar;

    // Update the month heading
    updateMonthHeading(start, date);
}

// Function to update the month heading based on the start and end of the week
function updateMonthHeading(start, end) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const startMonth = start.getMonth();
    const endMonth = end.getMonth();
    let monthHeading = monthNames[startMonth];

    // If the week spans two months, show both months
    if (startMonth !== endMonth) {
        monthHeading += ` - ${monthNames[endMonth]}`;
    }

    document.getElementById('currentMonth').textContent = monthHeading;
}

// Function to update the calendar
function updateCalendar() {
    console.log(`Current Date from <1>: ${currentDate.toDateString()}`);
    generateWeekCalendar(currentDate);
}

// Event listeners for the controls
document.getElementById('prevWeek').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 7);
    updateCalendar();
});

document.getElementById('nextWeek').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 7);
    updateCalendar();
});

document.getElementById('monthSelect').addEventListener('change', (event) => {
    currentMonth = parseInt(event.target.value, 10);
    currentDate = new Date(currentYear, currentMonth, 1);
    updateCalendar();
});

// Initialize the month select
const monthSelect = document.getElementById('monthSelect');

for (let i = 0; i < 12; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.text = new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' });
    monthSelect.add(option);
}

monthSelect.value = currentMonth;

// Generate the initial calendar for the current week
updateCalendar();
