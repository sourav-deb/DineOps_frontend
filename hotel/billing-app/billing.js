// billingDisplay();

// getAllBilling();



async function billingDisplay() {

    const billingData = await getAllBillingFromStorage();
    const bookingData = await getAllBookingsFromStorage();

    // const billingList = JSON.parse(billingData);
    // const bookingList = JSON.parse(bookingData);

    const billingList = billingData;
    const bookingList = bookingData;

    console.log('Billing Data:', billingList);
    console.log('Booking Data:', bookingData);

    console.log('Billing List:', billingList);
    console.log('Booking List:', bookingList);

    const combinedData = billingList.map(billing => {
        const booking = bookingList.find(booking => booking.id === billing.booking_id);
        return {
            ...billing,
            bookingData: booking || null
        };
    }).filter(item => item.bookingData !== null);

    console.log('Combined Data:', combinedData);

    return combinedData;
}

async function billingDisplayUI() {

    const displayArea = document.querySelector('.append-all-room');

    displayArea.innerHTML = '';

    const allBilling = localStorage.getItem('billingList');

    const combinedData = await billingDisplay();

    combinedData.forEach(item => {
        console.log(item);

        const billingRow = document.createElement('div');
        billingRow.classList.add('room-list-table');
        billingRow.classList.add('room-row');

        const billingId = document.createElement('div');
        billingId.classList.add('col-1');
        billingId.textContent = item.bill_no;

        const bookingId = document.createElement('div');
        bookingId.classList.add('col-1');
        bookingId.textContent = item.booking_id;

        // const billingId = document.createElement('div');
        // billingId.classList.add('col-1');
        // billingId.textContent = item.bill_no;

        const guestName = document.createElement('div');
        guestName.classList.add('col-3');
        guestName.textContent = item.bookingData.guest_detail[0].first_name + ' ' + item.bookingData.guest_detail[0].last_name;

        const billedAmount = document.createElement('div');
        billedAmount.classList.add('col-2');
        billedAmount.textContent = item.net_amount;

        const paymentStatus = document.createElement('div');
        paymentStatus.classList.add('col-2');
        paymentStatus.textContent = item.status;

        const actions = document.createElement('div');
        actions.classList.add('col-1');
        actions.innerHTML = `<i class="fas fa-eye view-room-eye" data-room-id="${item.id}"></i>`;
        actions.addEventListener('click', function () {
            viewOrderModal(item);
        });

        billingRow.appendChild(billingId);
        billingRow.appendChild(bookingId);
        billingRow.appendChild(guestName);
        billingRow.appendChild(billedAmount);
        billingRow.appendChild(paymentStatus);
        billingRow.appendChild(actions);
        displayArea.appendChild(billingRow);

    });

}

billingDisplayUI();

function viewOrderModal(item) {

    const roomsData = JSON.parse(localStorage.getItem('roomsList'));

    const modal = document.getElementById('roomModal');
    // const modalBody = modal.querySelector('.modal-body');
    setTimeout(() => modal.classList.add('show'), 10);

    // modalBody.innerHTML = modalContent;
    modal.style.display = 'block';


    console.log(item);

    const modalBody = document.querySelector('.modal-body');

    let modalContent = `
            <div class="booking-modal-data">
            <p><div class="booking-data-head">Billing Id:</div>  ${item.bill_no}</p>
                <p><div class="booking-data-head">Booking Id:</div>  ${item.booking_id}</p>
                <p><div class="booking-data-head">Rooms:</div>
                 ${item.bookingData.rooms.map(room => {
        const roomDetail = roomsData.find(r => r.id == room.room);
        return roomDetail ? roomDetail.room_number : 'N/A';
    }).join(', ')} 
                </p>
                <p><div class="booking-data-head">GST Bill No:</div>  ${item.gst_bill_no}</p>
                <p><div class="booking-data-head">Guest Name:</div>  ${item.bookingData.guest_detail[0].first_name} ${item.bookingData.guest_detail[0].last_name}</p>
                <p><div class="booking-data-head">Customer GST No:</div>  ${item.customer_gst || 'N/A'}</p>
                <p><div class="booking-data-head">Billed Amount:</div>  ${item.net_amount}</p>
                <p><div class="booking-data-head">Payment Status:</div>  ${item.status}</p>
            </div>
    `;

    if (item.status == 'paid') {
        modalContent += `
        <button class= "view-bill-btn" id="view-bill-btn">View Bill</button>
        `;

    }
    if (item.status == 'unpaid') {
        modalContent += `
        <button class="view-bill-btn" id="view-bill-btn">View Bill</button>
        <button class="pay-bill-btn" id="pay-bill-btn">Pay Bill</button>
        `;

    }
    modalBody.innerHTML = modalContent;



    const viewBillBtn = document.getElementById('view-bill-btn');
    const payBillBtn = document.getElementById('pay-bill-btn');

    if (viewBillBtn) {
        document.getElementById('view-bill-btn').addEventListener('click', function () {
            viewBillModal(item);
        });
    }


    if (payBillBtn) {
        payBillBtn.addEventListener('click', function () {
            payBillModal(item);
        });
    }


}

// Close Add Modal
document.querySelector('.close').onclick = function () {
    const modal = document.getElementById('roomModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

async function viewBillModal(item) {
    console.log('view bill modal');
    console.log(item);
    getAlllOrders();
    generatePrintableBill(item);

}

async function getBillById(billId) {

    const url = `${baseURL}billing/bills/${billId}/`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }

    // return refreshAccessToken2(url, options)
    //     .then(data => {
    //         console.log(data);
    //         // return data;
    //     })  
    //     .catch(error => {
    //         console.log('Error in getBillById:', error);
    //     });


    const data = await refreshAccessToken2(url, options);
    console.log('Raw response:', data);  // Debug log
    return data;

}


function payBillModal(item) {
    console.log('pay bill modal');
    console.log(item);

    const settleModal = document.getElementById('paymentModal');
    const settleModalContainer = document.querySelector('.modal-container2');
    const modalBodySettle = settleModal.querySelector('.modal-body');

    // Change display to flex for centering
    settleModalContainer.style.display = 'flex';
    settleModal.style.display = 'block';
    setTimeout(() => settleModal.classList.add('show'), 10);

    // Populate the modal with bill data
    populatePaymentModal(item);
}

function populatePaymentModal(bill) {
    console.log('populate payment modal');
    console.log(bill);

    const billNo = document.getElementById('order-id');
    billNo.value = bill.bill_no;

    const netAmount = document.getElementById('net-amt');
    netAmount.value = bill.net_amount;

    const paymentBtn = document.getElementById('payment-btn');
    paymentBtn.addEventListener('click', function () {
        paymentPOST(bill);
    });
}

function paymentPOST(bill) {
    console.log('payment post');
    console.log(bill);

    const paidAmt = document.getElementById('paid-amt').value;
    const paymentMessage = document.getElementById('payment-message').value;
    // Get selected payment method
    function getSelectedPaymentMethod() {
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        return selectedPayment ? selectedPayment.value : null;
    }
    const paymentMethod = getSelectedPaymentMethod();

    console.log(paidAmt, paymentMessage, paymentMethod);

    const paymentDetails = {
        'message': paymentMessage,
    }

    const paymentData = {
        'bill_id': bill.id,
        'paid_amount': paidAmt,
        'payment_method': paymentMethod,
        'payment_details': paymentDetails,
        'status': 'paid'
    }
    console.log(paymentData);

    if (paidAmt && paymentMethod) {
        paymentPOSTcall(paymentData);
    } else {
        alert('Please enter the payment amount and select a payment method', 'error');
    }


    function paymentPOSTcall(paymentData) {
        showLoading();
        console.log('payment post call');
        console.log(paymentData);

        const url = `${baseURL}billing/bill-payments/`;

        const options = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        }

        refreshAccessToken2(url, options)
            .then(data => {
                console.log(data);
                alert('Payment Successful', 'success');

                // Update billing status in localStorage
                let billingList = JSON.parse(localStorage.getItem('billingList') || '[]');
                billingList = billingList.map(bill => {
                    if (bill.id === paymentData.bill_id) {
                        return { ...bill, status: 'paid' };
                    }
                    return bill;
                });
                localStorage.setItem('billingList', JSON.stringify(billingList));


                // document.getElementById('paymentModal').classList.remove('show');
                // document.querySelector('.modal-container2').style.display = 'none';
                document.querySelector('.close-payment').click();
                document.querySelector('.close').click();
                hideLoading();
                document.querySelector('#hotel-bill').click();
            })
            .catch(error => {
                console.log('Error in payment POST call:', error);
                alert('Payment Failed', 'error');
            });

    }

}

// Close the settle modal
document.querySelector('.close-payment').onclick = function () {
    const settleModal = document.getElementById('paymentModal');
    const modalContainer = document.querySelector('.modal-container2');

    settleModal.classList.remove('show');
    setTimeout(() => {
        modalContainer.style.display = 'none';
        settleModal.style.display = 'none';
    }, 300);
}

async function generatePrintableBill(item) {
    // Get required data from localStorage
    const foodItems = getAllFoodListFromStorage();
    const orders = getAllOrdersFromStorage();

    // Create bill container
    const billContainer = document.createElement('div');
    billContainer.className = 'bill-container';

    // Page 1: Room and Service Details
    const page1 = createRoomServiceBillPage(item);
    billContainer.appendChild(page1);

    // Page 2+: Order Details (multiple pages if needed)
    const orderPages = createOrderBillPages(item, orders, foodItems);
    orderPages.forEach(page => billContainer.appendChild(page));

    // Page Last: Add summary page at the end
    const summaryPage = createSummaryPage(item);
    billContainer.appendChild(summaryPage);

    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Hotel Bill - ${item.gst_bill_no}</title>
                <style>
                    ${getBillStyles()}
                </style>
            </head>
            <body>
                ${billContainer.outerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function createRoomServiceBillPage(item) {
    const page = document.createElement('div');
    page.className = 'bill-page';

    const pageContainer = document.createElement('div');
    pageContainer.className = 'page-container';

    // Get rooms list from localStorage
    const roomsList = getRoomsListFromStorage();

    // Helper function to format date and time
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return `
            <div class="date-line">${date.toISOString().split('T')[0]}</div>
            <div class="time-line">${date.toISOString().split('T')[1].split('.')[0]}</div>
        `;
    };

    // Add header
    pageContainer.appendChild(createBillHeader(item));

    // Room Details Section
    const roomSection = document.createElement('div');
    roomSection.className = 'bill-section';
    roomSection.innerHTML = `
        <h3>Room Details</h3>
        <table class="bill-table">
            <thead>
                <tr>
                    <th>Room No</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Price/Day</th>
                    <th>Days</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${item.room_details.map(room => {
        // Find the room details from roomsList
        const roomDetails = roomsList.find(r => r.id === room.room_id);

        // Find the room booking details from bookingData
        const roomBooking = item.bookingData.rooms.find(r => r.room === room.room_id);

        return `
                        <tr>
                            <td>${roomDetails ? roomDetails.room_number : room.room_id}</td>
                            <td class="datetime-cell">
                                ${formatDateTime(roomBooking?.check_in_details?.check_in_date)}
                            </td>
                            <td class="datetime-cell">
                                ${formatDateTime(roomBooking?.end_date)}
                            </td>
                            <td>${room.room_price.toFixed(2)}</td>
                            <td>${room.days_stayed}</td>
                            <td>${room.total.toFixed(2)}</td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;

    // Service Details Section
    const serviceSection = document.createElement('div');
    serviceSection.className = 'bill-section';
    serviceSection.innerHTML = `
        <h3>Service Details</h3>
        <table class="bill-table">
            <thead>
                <tr>
                    <th>Room No</th>
                    <th>Service</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                 ${item.service_details.map(service => {
        // Find the room details from roomsList
        const roomDetails = roomsList.find(r => r.id === service.room_id);
        return `
                        <tr>
                            <td>${roomDetails ? roomDetails.room_number : service.room_id}</td>
                            <td>${service.service_name}</td>
                            <td class="amount-cell">₹ ${service.price.toFixed(2)}</td>
                        </tr>
                    `;
    }).join('')}
                <tr class="total-row">
                    <td colspan="2" class="text-right"><strong>Total Service Charges:</strong></td>
                    <td class="amount-cell"><strong>₹ ${item.service_details.reduce((sum, service) => sum + parseFloat(service.price), 0).toFixed(2)
        }</strong></td>
                </tr>
            </tbody>
        </table>
    `;

    pageContainer.appendChild(roomSection);
    pageContainer.appendChild(serviceSection);

    // Add footer
    pageContainer.appendChild(createBillFooter(item));

    page.appendChild(pageContainer);

    return page;
}

function createOrderBillPages(item, orders, foodItems) {

    console.log(item);
    console.log(orders);
    console.log(foodItems);

    const pages = [];
    const itemsPerPage = 10;

    // Process each order
    item.order_details.forEach((order, orderIndex) => {
        const orderData = orders.find(o => o.id === order.order_id);
        if (!orderData) return;

        const orderItems = orderData.food_items.map((foodId, index) => {
            const foodItem = foodItems.find(f => f.id === foodId);
            return {
                name: foodItem ? foodItem.name : 'Unknown Item',
                quantity: orderData.quantity[index],
                price: foodItem ? foodItem.price : 0
            };
        });

        // Calculate total for this order
        const orderTotal = orderItems.reduce((sum, item) =>
            sum + (item.quantity * item.price), 0);

        // Split items into chunks for pagination
        const chunks = [];
        for (let i = 0; i < orderItems.length; i += itemsPerPage) {
            chunks.push(orderItems.slice(i, i + itemsPerPage));
        }

        chunks.forEach((chunk, chunkIndex) => {
            const isLastChunk = chunkIndex === chunks.length - 1;

            const page = document.createElement('div');
            page.className = 'bill-page';

            const pageContainer = document.createElement('div');
            pageContainer.className = 'page-container';

            // Add header
            pageContainer.appendChild(createBillHeader(item));

            // Order Details Section
            const orderSection = document.createElement('div');
            orderSection.className = 'bill-section';
            orderSection.innerHTML = `
                <h3>Order Details - #${order.order_id}</h3>
                <table class="bill-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="center-cell">Quantity</th>
                            <th class="amount-cell">Price</th>
                            <th class="amount-cell">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chunk.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td class="center-cell">${item.quantity}</td>
                                <td class="amount-cell">₹ ${item.price}</td>
                                <td class="amount-cell">₹ ${(item.quantity * item.price)}</td>
                            </tr>
                        `).join('')}
                        ${isLastChunk ? `
                            <tr class="total-row">
                                <td colspan="3" class="text-right"><strong>Order Total:</strong></td>
                                <td class="amount-cell"><strong>₹ ${orderTotal.toFixed(2)}</strong></td>
                            </tr>
                            ${orderIndex === item.order_details.length - 1 ? `
                                <tr class="grand-total-row">
                                    <td colspan="3" class="text-right"><strong>Total Food Charges:</strong></td>
                                    <td class="amount-cell"><strong>₹ ${item.order_details.reduce((sum, order) => sum + parseFloat(order.total), 0).toFixed(2)
                        }</strong></td>
                                </tr>
                            ` : ''}
                        ` : ''}
                    </tbody>
                </table>
                ${isLastChunk && chunks.length > 1 ? `
                    <div class="page-number">Page ${chunkIndex + 1} of ${chunks.length}</div>
                ` : ''}
            `;

            pageContainer.appendChild(orderSection);

            // Add footer
            pageContainer.appendChild(createBillFooter(item));

            page.appendChild(pageContainer);
            pages.push(page);
        });
    });

    return pages;
}

function createBillHeader(item) {
    const header = document.createElement('div');
    header.className = 'bill-header';
    header.innerHTML = `
        <header class="bill-header">
            <div class="header-content">
                <div class="logo">
                    <img src="./../order_bill/logo.png" alt="Restaurant Logo" class="restaurant-logo">
                </div>
                <div class="restaurant-details">
                    <h3>Hotel Iswar & Family Restaurant</h3>
                    <p>Central Road, Silchar, Assam, 788001</p>
                    <p>+91 38423 19540 / +91 6003704064</p>
                    <p>www.hoteliswar.in</p>
                    <p>GST No: 18BDXPS2451N1ZK (HSN: 996311) </p>
                </div>
            </div>
        </header>

        <section class="invoice-customer-info">
            <div class="invoice-info">
                <h3>Invoice</h3>
                <div>Bill No: <span id="bill-number">${item.bill_no}</span></div>
                <div>GST Bill No: <span id="gst-bill-number">${item.gst_bill_no}</span></div>
                <div>Date: <span id="bill-date">${new Date(item.created_at).toLocaleDateString()}</span></div>
                <div>Order Type: <span id="order-type">${item.bill_type}</span></div>
            </div>

            <div class="bill-details">
                <h3>Customer Details</h3>
                <div>Name: <span id="customer-name">${item.bookingData.guest_detail[0].first_name} ${item.bookingData.guest_detail[0].last_name}</span></div>
               <div>Address: <span id="customer-email">${item.bookingData.guest_detail[0].address_line_1}</span></div>
                <div>Phone: <span id="customer-phone">${item.bookingData.guest_detail[0].phone}</span></div>
                <div>GST No.: <span id="customer-gstno">${item.customer_gst || 'N/A'}</span></div>
            </div>
        </section>
    `;
    return header;
}

function createBillFooter(item) {
    const footer = document.createElement('div');
    footer.className = '';
    footer.innerHTML = `
        <footer class="bill-footer">
            <div class="kot-line">
                <span class="kot-head">Kot Nos #</span>
                <span class="kot-nos">-</span>
            </div>

            <div class="cashier-line">
                <div class="cashier-left">
                    <span class="cashier-name">Cashier: </span>
                    <!--<span class="name">${item.created_by}</span>-->
                </div>
                <div class="cashier-right">
                    ${new Date(item.created_at).toLocaleString()}
                </div>
            </div>

            <div class="license-nos">
                <div class="fssai">FSSAI LICENSE NO: 10324025000094</div>
            </div>

            <div class="bill-footer-text">
                * * * Thank you for choosing Hotel Iswar & Family Restaurant! * * *
            </div>
        </footer>
    `;
    return footer;
}

function createSummaryPage(item) {
    const page = document.createElement('div');
    page.className = 'bill-page';

    const pageContainer = document.createElement('div');
    pageContainer.className = 'page-container';

    // Add header
    pageContainer.appendChild(createBillHeader(item));

    // Create summary content
    const summaryContent = document.createElement('div');
    summaryContent.className = 'summary-content';

    // Calculate totals
    const roomTotal = item.room_details.reduce((sum, room) => sum + parseFloat(room.total), 0);
    const roomGST = parseFloat(item.room_cgst) + parseFloat(item.room_sgst);

    const serviceTotal = item.service_details.reduce((sum, service) => sum + parseFloat(service.price), 0);
    const serviceGST = parseFloat(item.service_cgst) + parseFloat(item.service_sgst);

    const foodTotal = item.order_details.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const foodGST = parseFloat(item.order_cgst) + parseFloat(item.order_sgst);

    const advance = parseFloat(item.bookingData.advance) || 0.00;

    const payable_amount = parseFloat(item.net_amount) - advance;

    summaryContent.innerHTML = `
        <h2 class="summary-title">Bill Summary</h2>
        
        <div class="summary-section">
            <h4>Room Charges</h4>
            <table class="summary-table">
                <tr>
                    <td>Room Total:</td>
                    <td class="amount">₹ ${roomTotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>GST 5% (CGST + SGST):</td>
                    <td class="amount">₹ ${roomGST.toFixed(2)}</td>
                </tr>
                <tr class="subtotal">
                    <td>Subtotal with GST:</td>
                    <td class="amount">₹ ${(roomTotal + roomGST).toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="summary-section">
            <h4>Service Charges</h4>
            <table class="summary-table">
                <tr>
                    <td>Service Total:</td>
                    <td class="amount">₹ ${serviceTotal.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="summary-section">
            <h4>Food Charges</h4>
            <table class="summary-table">
                <tr>
                    <td>Food Total:</td>
                    <td class="amount">₹ ${foodTotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>GST 5% (CGST + SGST):</td>
                    <td class="amount">₹ ${foodGST.toFixed(2)}</td>
                </tr>
                <tr class="subtotal">
                    <td>Subtotal with GST:</td>
                    <td class="amount">₹ ${(foodTotal + foodGST).toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="summary-section grand-total">
            <h4>Grand Total</h4>
            <table class="summary-table">
                <tr>
                    <td>Total Amount:</td>
                    <td class="amount">₹ ${parseFloat(item.total).toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Discount:</td>
                    <td class="amount">₹ ${parseFloat(item.discount).toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Total GST:</td>
                    <td class="amount">₹ ${(parseFloat(item.cgst_amount) + parseFloat(item.sgst_amount)).toFixed(2)}</td>
                </tr>
                <tr class="final-total">
                    <td><strong>Net Amount:</strong></td>
                    <td class="amount"><strong>₹ ${parseFloat(item.net_amount).toFixed(2)}</strong></td>
                </tr>
                <tr class="advance-paid">
                    <td>Advance Paid:</td>
                    <td class="amount"><strong>₹ ${advance}</strong></td>
                </tr>
                <tr class="payable-amount">
                    <td><strong>Payable Amount:</strong></td>
                    <td class="amount"><strong>₹ ${payable_amount}</strong></td>
                </tr>
            </table>
        </div>
        <div class="bill-footer-text">${new Date(item.created_at).toLocaleString()}<br>
                * * * Thank you for choosing Hotel Iswar & Family Restaurant! * * *
        </div>

    `;

    pageContainer.appendChild(summaryContent);
    // page.appendChild(createBillFooter(item));

    page.appendChild(pageContainer);
    return page;
}

function getBillStyles() {
    return `
        @page {
            size: A4;
            margin: 0;
        }

        .bill-container {
            font-family: Arial, sans-serif;
            width: 210mm; /* A4 width */
            margin: 0 auto;
        }

        .bill-page {
            position: relative;
            width: 210mm;
            height: 297mm;
            padding: 10mm;
            page-break-after: always;
            box-sizing: border-box;
            background: white;
        }

        .page-container {
            position: relative;
            height: 100%;
            border: 1px solid #000;
            padding: 8px;
            box-sizing: border-box;
        }

        .bill-content {
            position: relative;
            min-height: calc(297mm - 40mm - 80mm); /* Full height minus margins minus footer */
            padding-bottom: 80mm; /* Space for footer */
        }

        .bill-header {
            text-align: center;
            margin-bottom: 0px;
        }

        .header-content {
            display: flex;
            align-items: flex-start;  /* Changed from center to flex-start */
            justify-content: space-between;  /* Changed from center to space-between */
            padding: 0 20px;
            margin-bottom: 20px;
        }

        .logo {
            flex: 0 0 auto;  /* Prevents logo from growing or shrinking */
        }

        .restaurant-logo {
            width: 100px;
            height: auto;
        }

        .restaurant-details {
            text-align: right;  /* Changed from center to right */
            flex: 1;  /* Allows details to take remaining space */
            margin-left: 20px;  /* Space between logo and details */
        }

        .restaurant-details h3 {
            margin: 0;
            color: #333;
            font-size: 1.5em;
            text-align: right;  /* Ensure heading is also right-aligned */
        }

        .restaurant-details p {
            margin: 5px 0;
            font-size: 0.9em;
            text-align: right;  /* Ensure paragraphs are right-aligned */
        }

        .invoice-customer-info {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 10px;
            border-top: 2px solid #999;
            border-bottom: 2px solid #999;
            gap: 20px;  /* Add space between the two sections */
        }

        .invoice-info, .bill-details {
            flex: 1;
            text-align: left;  /* Ensure left alignment */
        }

        .invoice-info h3, .bill-details h3 {
            margin: 0 0 10px 0;
            font-size: 1.2em;
            text-align: left;
            border-bottom: none;
            padding-bottom: 5px;
        }

        .invoice-info h3 {
            margin-bottom: 3px;
        }

        .invoice-info div, .bill-details div {
            margin: 5px 0;
            text-align: left;
            font-size: 0.9em;
        }

        .invoice-info span, .bill-details span {
            display: inline-block;
            margin-left: 5px;
            font-weight: 500;
        }

        .bill-section {
            margin: 20px 0;
        }

        .bill-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }

        .bill-table th, .bill-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        .bill-table th {
            background-color: #f5f5f5;
        }

        .bill-summary {
            margin-top: 20px;
            text-align: right;
        }

        .bill-summary table {
            margin-left: auto;
            width: 300px;
        }

        .bill-summary td {
            padding: 5px;
        }

        .bill-footer {
            position: absolute;
            bottom: 4mm;
            left: 5mm;
            right: 5mm;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }

        .kot-line {
            text-align: left;
            margin: 0;
            padding: 0;
            line-height: 1.5;
        }

        .kot-head {
            font-weight: 500;
            margin-right: 5px;
        }

        .cashier-line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0 0 0;
            padding: 0;
        }

        .cashier-left {
            text-align: left;
        }

        .cashier-right {
            text-align: right;
        }

        .license-nos {
            text-align: center;
            margin: 15px 0;
            font-size: 0.9em;
            font-weight: 500;
            color: #333;
        }

        .bill-footer-text {
            text-align: center;
            margin-top: 15px;
            font-weight: bold;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
                background: white;
            }

            .bill-page {
                margin: 0;
                border: none;
                width: 210mm;
                height: 297mm;
                page-break-after: always;
            }

            .restaurant-logo {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }

        .summary-content {
            padding: 0 0;
        }

        .summary-content h4{
            margin: 0;
        }

        .summary-title {
            text-align: center;
            font-size: 1.5em;
            color: #333;
            margin: 0;
        }

        .summary-section {
            margin-bottom: 15px;
        }

        .summary-section h4 {
            border-bottom: 2px solid #333;
            padding-bottom: 5px;
            margin-bottom: 5px;
        }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }

        .summary-table td {
            padding: 5px;
            border-bottom: 1px solid #ddd;
        }

        .summary-table .amount {
            text-align: right;
            font-family: monospace;
            font-size: 1.1em;
        }

        .subtotal {
            background-color: #f8f8f8;
            font-weight: 500;
        }

        .grand-total {
            margin-top: 10px;
        }

        .grand-total h3 {
            color: #333;
            border-bottom-color: #333;
        }

        .final-total {
            font-size: 0.9em;
            background-color: #f0f0f0;
            border-top: 2px solid #333;
        }
        
        .advance-paid {
            font-size: 0.8em;
        }

        .payable-amount {
            font-size: 1em;
        }

        .final-total td {
            padding: 12px 8px;
        }

            

    `;
}




