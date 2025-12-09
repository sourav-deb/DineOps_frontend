
getAllOrders();

function getAllOrders2() {
    url = `${baseURL}orders/order/`;

    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }
    // console.log(allData.push("hello"));

    refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(data => {
            console.log('Get Orders Data:', data);
            renderOrders(data);

        })
        .catch(error => {
            console.log('Error fetching data:', error);
        });
}

async function getAllOrders() {
    // get ordersList from local storage
    let ordersList = await localforage.getItem('ordersList') || [];
    await renderOrders(ordersList);
}


function renderOrders2(reversedOrders) {
    // ... (This function looks unused/duplicate, leaving it but ideally should remove)
    // For safety, I will comment it out or leave as is but it's using old logic. 
    // I will replace it with a dummy or updated version if needed.
    // Actually best to update it to async too.
}

function getOrderTypeDisplay(order, roomsList = [], tablesList = []) {
    // Get lists passed as arguments

    // Format order type
    let displayText = order.order_type.replace('_', ' ').toUpperCase();

    // Only add table/room info for dine_in and hotel orders
    if (order.order_type === 'dine_in' && order.tables?.length > 0) {
        // Find table name from tablesList
        const table = tablesList.find(t => t.id === order.tables[0]);
        displayText += table ? ` -T${table.table_number}` : ` -T ${order.tables[0]}`;
    } else if (order.order_type === 'hotel' && order.room_id) {
        // Find room name from roomsList
        const room = roomsList.find(r => r.id === order.room_id);
        displayText += room ? ` -R${room.room_number}` : ` -R ${order.room_id}`;
    }

    return displayText;
}

async function renderOrders(reversedOrders) {

    const orders = [...reversedOrders].reverse();

    // Fetch dependencies once
    const roomsList = await localforage.getItem('roomsList') || [];
    const tablesList = await localforage.getItem('tablesList') || [];

    const ordersContainer = document.querySelector('.load-orders');
    ordersContainer.innerHTML = '';

    orders.forEach(order => {
        let displayOrderType;
        switch (order.order_type) {
            case 'dine_in':
                displayOrderType = 'DINE IN';
                break;
            case 'take_away':
                displayOrderType = 'TAKE AWAY';
                break;
            case 'delivery':
                displayOrderType = 'DELIVERY';
                break;
            case 'hotel':
                displayOrderType = 'HOTEL';
                break;
            default:
                displayOrderType = order.order_type.toUpperCase();
        }

        const orderElement = document.createElement('div');
        orderElement.classList.add('order-item');

        // calculate total price with GST 5%
        const totalPrice = parseFloat(order.total) + (parseFloat(order.total) * 0.05);

        orderElement.innerHTML = `
            <div class="order-item-col col-1">${order.id}</div>
            <div class="order-item-col col-2">${order.phone ? order.phone : 'N/A'}</div>
            <div class="order-item-col col-2">${new Date(order.created_at).toLocaleDateString()}</div>
            <div class="order-item-col col-2"> ${getOrderTypeDisplay(order, roomsList, tablesList)}</div>
            <div class="order-item-col col-2">${totalPrice}</div>
            <div class="order-item-col col-2">
                <div class="status-${order.status}">
                    ${order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1).toLowerCase()}
                </div>
            </div>
            <div class="order-item-col col-1">
                <!-- <i class="fas fa-eye col-4" id="view-btn" onclick="viewOrder(JSON.stringify(${JSON.stringify(order)}))"></i> -->
                <i class="fas fa-eye col-4" id="view-btn" onclick="viewOrder(${order.id})"></i>
            </div>
        `;

        ordersContainer.appendChild(orderElement);
    });
}

async function viewOrder(orderId) {
    // get order details from local storage with orderId
    const ordersList = await localforage.getItem('ordersList') || [];
    const order = ordersList.find(order => order.id === orderId);
    await renderDataModal(order);
}

function viewOrder3(orderId) {
    // ... (This function uses API, seemingly fine as is for now, but not using local storage for order list)
    // Keeping viewOrder3 logic but it calls renderDataModal which I'm making async.
    // So caller chain would need update if awaited.
    const modalContainer = document.querySelector('.modal-container');
    const modal = document.getElementById('orderModal');
    const orderDetails = document.getElementById('orderDetails');
    const closeBtn = document.querySelector('.close');

    // Fetch order details
    const url = `${baseURL}orders/order/${orderId}/`;
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    };

    refreshAccessToken2(url, option)
        .then(async data => {
            await renderDataModal(data);
        })
        .catch(error => {
            console.log('Error fetching order details:', error);
            orderDetails.innerHTML = 'Error loading order details';
        });
}

function viewOrder2(orderString) {
    const order = JSON.parse(orderString);
    console.log(order);
    renderDataModal(order); // renderDataModal is async now, but viewOrder2 logic itself seems unused or old.
}

async function renderDataModal(data) {
    const orderDetails = document.getElementById('orderDetails');

    // Fetch food list and helper lists first
    const allFoodsList = await localforage.getItem('allFoodList') || [];
    const roomsList = await localforage.getItem('roomsList') || [];
    const tablesList = await localforage.getItem('tablesList') || [];


    const foodItemsHTML = data.food_items.map((foodId, index) => {
        const foodName = allFoodsList.find(food => food.id === foodId)?.name || 'Unknown Food';
        const quantity = data.quantity[index];
        return `<div class="food-item"><div class="food-item-qty">${quantity}x</div><div class="food-item-name"> ${foodName} </div></div>`;
    }).join('');

    orderDetails.innerHTML = `
        <div class="order-detail-item">
            <span class="detail-label">Order ID:</span>
            <span class="detail-value">000${data.id}</span>
        </div>
        <div class="order-detail-item">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${data.phone ? data.phone : 'N/A'}</span>
        </div>
        <div class="order-detail-item">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${new Date(data.created_at).toLocaleDateString()}</span>
        </div>
        <div class="order-detail-item">
            <span class="detail-label">Order Type:</span>
            <span class="detail-value">${getOrderTypeDisplay(data, roomsList, tablesList)}</span>
        </div>
        
        <div class="order-detail-item">
            <span class="detail-label">Food Items:</span>
            <span class="detail-value">
                ${foodItemsHTML}
            </span>
        </div>


        <div class="order-detail-item">
            <span class="detail-label">Total:</span>
            <span class="detail-value">₹${parseFloat(data.total)}</span>
        </div>
        <div class="order-detail-item">
            <span class="detail-label">Net Total (inc. GST):</span>
            <span class="detail-value">₹${parseFloat(data.total) + parseFloat(data.total) * 0.05}</span>
        </div>
        <div class="order-detail-item">
            <span class="detail-label">Order Status:</span>
            <span class="detail-value">
                ${data.status === 'in_progress' ? 'In Progress' :
            data.status === 'hold' ? 'Hold' :
                data.status === 'kot' ? 'KOT' :
                    data.status === 'settled' ? 'Settled' :
                        data.status === 'cancelled' ? 'Cancelled' :
                            data.status}
            </span>
        </div>
        
        <div class="order-detail-item">
            <span class="detail-label">Payment Status:</span>
            <span class="detail-value">${data.status === 'settled' ? 'Paid' : data.status === 'cancelled' ? 'Cancelled' : 'Pending'}</span>
        </div>
    `;

    if (data.status === 'cancelled') {
        return;
    } else {
        checkBillStatus(data.id);
    }

    // const billBtn = document.createElement('button');
    // billBtn.classList.add('bill-btn');
    // billBtn.innerHTML = 'View Bill';
    // billBtn.onclick = () => {
    //     checkBillStatus(data.id);
    // };
    // orderDetails.appendChild(billBtn);


    // Check if order_id exists in billing endpoint and display button to open bill
    function checkBillStatus2(orderId) {
        const url = `${baseURL}billing/bills/`;
        const option = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
            }
        };
        refreshAccessToken2(url, option)
            .then(data => {
                console.log(data);
                const bills = data.filter(bill => bill.order_id == orderId);
                console.log('Bills found:', bills);
                checkBill(bills);

            })
            .catch(error => {
                console.log('Error fetching bill status:', error);
            });

        function checkBill(bills) {
            if (bills.length > 0) {

                const orderDetails = document.getElementById('orderDetails');
                const billBtn = document.createElement('button');
                billBtn.classList.add('bill-btn');
                billBtn.innerHTML = 'View Bill';
                billBtn.onclick = () => {
                    // checkBillStatus(data.id);
                    openBill(bills[0]);
                };
                orderDetails.appendChild(billBtn);


                console.log('Latest bill found for order:', bills[0]);
                // openBill(bills[0]);
                makepayment(bills[0]);
            } else if (bills.length == 0) {

                const orderDetails = document.getElementById('orderDetails');
                const billBtn = document.createElement('button');
                billBtn.classList.add('bill-btn');
                billBtn.innerHTML = 'Bill Not Generated Yet';
                billBtn.onclick = () => {
                    alert('Bill not generated yet for this order');
                    // checkBillStatus(data.id);
                    // openBill(bills[0]);
                };
                orderDetails.appendChild(billBtn);

                console.log('No bill found for order:', orderId);
                // alert('Bill not generated yet for this order');
                // document.querySelector('.bill-btn').textContent = 'Bill Not Generated Yet';
            }
        }

        function makepayment(bill) {
            const orderDetails = document.getElementById('orderDetails');
            console.log('Making payment for bill:', bill);

            if (bill.status == 'paid') {
                console.log('BLOCK IF')
                // alert('Bill already settled');
                return;
            } else {
                console.log('BLOCK ELSE')
                const paymentBtn = document.createElement('button');
                paymentBtn.classList.add('payment-btn');
                paymentBtn.innerHTML = 'Make Payment';
                paymentBtn.onclick = () => {
                    console.log('Payment made for bill:', bill);
                    openPaymentModal(bill);
                };
                orderDetails.appendChild(paymentBtn);

            }

            // const paymentBtn = document.createElement('button');
            // paymentBtn.classList.add('payment-btn');
            // paymentBtn.innerHTML = 'Make Payment';
            // paymentBtn.onclick = () => {
            //     console.log('Payment made for bill:', bill);
            //     openPaymentModal(bill);
            // };
            // orderDetails.appendChild(paymentBtn);



        }

        function openPaymentModal(bill) {
            console.log('Opening payment modal for bill:', bill);
            const settleModal = document.getElementById('paymentModal');
            const settleModalContainer = document.querySelector('.modal-container2');
            const modalBodySettle = settleModal.querySelector('.modal-body');

            // Change display to flex for centering
            settleModalContainer.style.display = 'flex';
            settleModal.style.display = 'block';
            setTimeout(() => settleModal.classList.add('show'), 10);

            // Populate the modal with bill data
            populatePaymentModal(bill);

            const paymentBtnSubmit = document.getElementById('payment-btn');
            paymentBtnSubmit.onclick = () => {
                console.log('Payment made for bill:', bill);
                paymentPOST(bill);

            };
        }

        function populatePaymentModal(bill) {
            console.log('Populating payment modal with bill:', bill);

            const orderId = document.getElementById('order-id');
            orderId.value = bill.order_id;

            const netAmt = document.getElementById('net-amt');
            netAmt.value = bill.net_amount;
        }

        function paymentPOST(bill) {
            console.log('Payment POST');

            const paidAmt = document.getElementById('paid-amt').value;
            const paymentMessage = document.getElementById('payment-message').value;
            // const paymentMethod = document.getElementById('payment-method').value;
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

            paymentPOSTcall(paymentData);

            function paymentPOSTcall(paymentData) {
                console.log('Payment POST call');
                const url = `${baseURL}billing/bill-payments/`;
                const option = {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + getCookie('access_token'),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(paymentData)
                }

                refreshAccessToken2(url, option)
                    .then(data => {
                        console.log(data);
                        window.location.reload();
                    })
                    .catch(error => {
                        console.log('Error in payment POST call:', error);
                    });
            }
        }
    }

    // Check if order_id exists in billing endpoint and display button to open bill
    async function checkBillStatus(orderId) {

        // get billingList from local storage and check if order_data exists with orderId
        const billingList = await localforage.getItem('billingList') || [];
        const bills = billingList.filter(bill => bill.order_id == orderId);
        console.log('Bill found:', bills);
        checkBill(bills);

        function checkBill(bills) {
            if (bills.length > 0) {

                const orderDetails = document.getElementById('orderDetails');
                const billBtn = document.createElement('button');
                billBtn.classList.add('bill-btn');
                billBtn.innerHTML = 'View Bill';
                billBtn.onclick = () => {
                    // checkBillStatus(data.id);
                    openBill(bills[0]);
                };
                orderDetails.appendChild(billBtn);


                console.log('Latest bill found for order:', bills[0]);
                // openBill(bills[0]);
                makepayment(bills[0]);
            } else if (bills.length == 0) {

                const orderDetails = document.getElementById('orderDetails');
                const billBtn = document.createElement('button');
                billBtn.classList.add('bill-btn');
                billBtn.innerHTML = 'Bill Not Generated Yet';
                billBtn.onclick = () => {
                    alert('Bill not generated yet for this order');
                    // checkBillStatus(data.id);
                    // openBill(bills[0]);
                };
                orderDetails.appendChild(billBtn);

                console.log('No bill found for order:', orderId);
                // alert('Bill not generated yet for this order');
                // document.querySelector('.bill-btn').textContent = 'Bill Not Generated Yet';
            }
        }

        function makepayment(bill) {
            const orderDetails = document.getElementById('orderDetails');
            console.log('Making payment for bill:', bill);

            if (bill.status == 'paid') {
                console.log('BLOCK IF')
                // alert('Bill already settled');
                return;
            } else {
                console.log('BLOCK ELSE')
                const paymentBtn = document.createElement('button');
                paymentBtn.classList.add('payment-btn');
                paymentBtn.innerHTML = 'Make Payment';
                paymentBtn.onclick = () => {
                    console.log('Payment made for bill:', bill);
                    openPaymentModal(bill);
                };
                orderDetails.appendChild(paymentBtn);

            }

            // const paymentBtn = document.createElement('button');
            // paymentBtn.classList.add('payment-btn');
            // paymentBtn.innerHTML = 'Make Payment';
            // paymentBtn.onclick = () => {
            //     console.log('Payment made for bill:', bill);
            //     openPaymentModal(bill);
            // };
            // orderDetails.appendChild(paymentBtn);



        }

        function openPaymentModal(bill) {
            console.log('Opening payment modal for bill:', bill);
            const settleModal = document.getElementById('paymentModal');
            const settleModalContainer = document.querySelector('.modal-container2');
            const modalBodySettle = settleModal.querySelector('.modal-body');

            // Change display to flex for centering
            settleModalContainer.style.display = 'flex';
            settleModal.style.display = 'block';
            setTimeout(() => settleModal.classList.add('show'), 10);

            // Populate the modal with bill data
            populatePaymentModal(bill);

            const paymentBtnSubmit = document.getElementById('payment-btn');
            paymentBtnSubmit.onclick = () => {
                console.log('Payment made for bill:', bill);
                paymentPOST(bill);

            };
        }

        function populatePaymentModal(bill) {
            console.log('Populating payment modal with bill:', bill);

            const orderId = document.getElementById('order-id');
            orderId.value = bill.order_id;

            const netAmt = document.getElementById('net-amt');
            netAmt.value = bill.net_amount;
        }

        function paymentPOST(bill) {
            console.log('Payment POST');

            const paidAmt = document.getElementById('paid-amt').value;
            const paymentMessage = document.getElementById('payment-message').value;
            // const paymentMethod = document.getElementById('payment-method').value;
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

            paymentPOSTcall(paymentData);

            function paymentPOSTcall(paymentData) {
                showLoading();
                console.log('Payment POST call');
                const url = `${baseURL}billing/bill-payments/`;
                const option = {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + getCookie('access_token'),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(paymentData)
                }

                refreshAccessToken2(url, option)
                    .then(async data => {
                        console.log(data);

                        // Update billingList, ordersList, and tablesList in localForage
                        let billingList = await localforage.getItem('billingList') || [];
                        let ordersList = await localforage.getItem('ordersList') || [];
                        let tablesList = await localforage.getItem('tablesList') || [];

                        // Update bill status
                        billingList = billingList.map(bill => {
                            if (bill.id === data.bill_id) {
                                // Find the corresponding order
                                const order = ordersList.find(o => o.id === bill.order_id);

                                // Update order status
                                ordersList = ordersList.map(o => {
                                    if (o.id === bill.order_id) {
                                        // Update table status if it's a dine-in order
                                        if (o.tables && o.tables[0]) {
                                            tablesList = tablesList.map(table => {
                                                if (table.id === o.tables[0]) {
                                                    return { ...table, occupied: false, order: null };
                                                }
                                                return table;
                                            });
                                        }
                                        return { ...o, status: 'settled' };
                                    }
                                    return o;
                                });

                                return { ...bill, status: 'paid' };
                            }
                            return bill;
                        });

                        // Save all updated lists
                        await localforage.setItem('billingList', billingList);
                        await localforage.setItem('ordersList', ordersList);
                        await localforage.setItem('tablesList', tablesList);

                        hideLoading();
                        // window.location.reload();
                        document.querySelector('.close-payment').click();
                        document.querySelector('.close').click();
                        document.getElementById('orders').click();


                    })
                    .catch(error => {
                        console.log('Error in payment POST call:', error);
                    });
            }
        }
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

document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'view-btn') {
        const newOrderModal = document.getElementById('orderModal');
        if (newOrderModal) {
            setTimeout(() => newOrderModal.classList.add('show'), 10);
            newOrderModal.style.display = 'block';
        }
    }
});

document.querySelector('.close').onclick = function () {
    const newOrderModal = document.getElementById('orderModal');
    newOrderModal.classList.remove('show');
    setTimeout(() => newOrderModal.style.display = 'none', 300);
}

// Filter Orders
document.getElementById('filterType').addEventListener('click', function () {
    const filterType = document.getElementById('filterType');
    const filterInputs = document.getElementById('filterInputs');
    const mobileInput = document.getElementById('mobileInput');
    const dateInputs = document.getElementById('dateInputs');
    const orderTypeSelect = document.getElementById('orderTypeSelect');

    filterType.addEventListener('change', function () {
        mobileInput.style.display = 'none';
        dateInputs.style.display = 'none';
        orderTypeSelect.style.display = 'none';

        switch (this.value) {
            case 'mobile':
                mobileInput.style.display = 'block';
                break;
            case 'date':
                dateInputs.style.display = 'block';
                break;
            case 'orderType':
                orderTypeSelect.style.display = 'block';
                break;
            case 'reset':
                resetFilter();
                break;
        }

        console.log('Filter type changed:', this.value);
    });

    mobileInput.addEventListener('input', filterOrders);
    document.getElementById('startDate').addEventListener('change', filterOrders);
    document.getElementById('endDate').addEventListener('change', filterOrders);
    orderTypeSelect.addEventListener('change', filterOrders);
});

function filterOrders2() {
    const filterType = document.getElementById('filterType').value;
    const mobileInput = document.getElementById('mobileInput').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const orderType = document.getElementById('orderTypeSelect').value;

    const url = `${baseURL}orders/order/`;
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    };

    refreshAccessToken2(url, option)
        .then(data => {
            let filteredOrders = data;

            switch (filterType) {
                case 'mobile':
                    filteredOrders = data.filter(order => order.phone && order.phone.includes(mobileInput));
                    break;
                case 'date':
                    filteredOrders = data.filter(order => {
                        const orderDate = new Date(order.created_at);
                        return (!startDate || orderDate >= new Date(startDate)) &&
                            (!endDate || orderDate <= new Date(endDate));
                    });
                    break;
                case 'orderType':
                    filteredOrders = data.filter(order => order.order_type === orderType);
                    break;
            }

            renderOrders(filteredOrders);
        })
        .catch(error => {
            console.log('Error fetching data:', error);
        });
}

async function filterOrders() {
    const filterType = document.getElementById('filterType').value;
    const mobileInput = document.getElementById('mobileInput').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const orderType = document.getElementById('orderTypeSelect').value;

    // get all orders from local storage
    // const ordersList = JSON.parse(localStorage.getItem('ordersList') || '[]');
    const data = await localforage.getItem('ordersList') || [];

    let filteredOrders = data;

    switch (filterType) {
        case 'mobile':
            filteredOrders = data.filter(order => order.phone && order.phone.includes(mobileInput));
            break;
        case 'date':
            filteredOrders = data.filter(order => {
                const orderDate = new Date(order.created_at);
                return (!startDate || orderDate >= new Date(startDate)) &&
                    (!endDate || orderDate <= new Date(endDate));
            });
            break;
        case 'orderType':
            filteredOrders = data.filter(order => order.order_type === orderType);
            break;
    }

    await renderOrders(filteredOrders);
}


function resetFilter() {
    document.getElementById('filterType').selectedIndex = 0;
    document.getElementById('mobileInput').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('orderTypeSelect').selectedIndex = 0;

    // Hide all filter inputs
    document.getElementById('mobileInput').style.display = 'none';
    document.getElementById('dateInputs').style.display = 'none';
    document.getElementById('orderTypeSelect').style.display = 'none';

    // Fetch and display all orders
    getAllOrders();
}

function openBill(bill) {
    generatePrintableBill(bill);
}

async function getOrderById(billDataOrderId) {
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }
    const url = `${baseURL}orders/order/${billDataOrderId}/`;

    try {
        const data = await refreshAccessToken2(url, option);
        console.log('Order Data:', data);
        return data;  // Make sure to return the data
    } catch (error) {
        console.log('Error fetching order data:', error);
        throw error;
    }
}


async function generatePrintableBill(billData) {
    try {
        console.log('Bill Data:', billData);
        const orderData = await getOrderById(billData.order_id);

        if (!orderData) {
            throw new Error('Failed to get order data');
        }

        console.log('Order Data:', orderData);

        // Create new window
        const billWindow = window.open('', '_blank');
        const doc = billWindow.document;

        // Add CSS
        const cssLink = doc.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = './../order_bill/order_bill.css';
        doc.head.appendChild(cssLink);



        function generateBillHeader() {
            return `
                <header class="bill-header">
                    <div class="header-content">
                        <div class="logo">
                            <img src="./../order_bill/logo.png" alt="Restaurant Logo" class="restaurant-logo">
                        </div>
                        <div class="restaurant-details">
                            <h3>Hotel Iswar & Family Restaurant</h3>
                            <p> Central Road, Silchar, Assam, 788001</p>
                            <p> +91 38423 19540 / +91 6003704064</p>
                            <p> www.hoteliswar.in</p>
                            <p>GST No: 18BDXPS2451N1ZK</p>
                        </div>
                    </div>
                </header>
            `;
        }

        function generateInvoiceSection() {
            return `
                <section class="invoice-customer-info">
                    <div class="invoice-info">
                        <h3>Invoice</h3>
                        <div>Bill No: <span id="bill-number"> </span></div>
                        <div>GST Bill No: <span id="gst-bill-number"> </span></div>
                        <!-- <div>Date: <span id="bill-date"></span></div> -->
                        <div>Table: <span id="table-number"> </span></div>
                        <div>Order Type: <span id="order-type"> </span></div>
                    </div>

                    <div class="bill-details">
                        <h3>Customer Details</h3>
                        <div>Name: <span id="customer-name">  </span></div>
                        <div>Email: <span id="customer-email">  </span></div>
                        <div>Phone: <span id="customer-phone">  </span></div>
                        <div>GST No.: <span id="customer-gstno">  </span></div>
                    </div>
                </section>
            `;
        }

        function generateItemsSection() {
            return `
                <section class="bill-items">
                    <table>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody id="bill-items-body">
                            <!-- Items will be added here -->
                        </tbody>
                    </table>
                </section>
            `;
        }

        function generateFooter() {
            return `
            
                <footer class="bill-footer">
                    <div class="kot-section">
                        <div class="kot-head">Kot Nos #</div>
                        <div class="kot-nos"></div>
                    </div>

                    <div class="cashier-info">
                        <div class="cashier-name">Cashier: </div>
                        <div class="name"></div>
                        <div class="cashier-date"></div>
                    </div>

                    <div class="license-nos">
                        <div class="fssai">FSSAI LICENSE NO: 10324025000094</div>
                    </div>

                    <div class="bill-footer-text">
                        * * * Thank you for Dining with us! * * *
                    </div>
                </footer>
            `;
        }

        // <div class="blank-page">
        //         <!-- First page intentionally left blank -->
        //     </div>

        // Use in generatePrintableBill
        doc.body.innerHTML = `
            
            <div class="bill-wrapper">
                <div class="bill-container">
                    ${generateBillHeader()}
                    ${generateInvoiceSection()}
                    ${generateItemsSection()}
                    ${generateFooter()}
                </div>
            </div>
        `;

        // Add number-to-words script
        const script = doc.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/number-to-words';
        script.onload = function () {
            populateBillData(billWindow, billData, orderData);
        };
        doc.head.appendChild(script);

    } catch (error) {
        console.error('Error in generatePrintableBill:', error);
    }
}

function populateBillData(billWindow, billData, orderData) {
    const doc = billWindow.document;

    // Transform food items data
    const allFoodList = JSON.parse(localStorage.getItem('allFoodList'));
    const orderBillItems = orderData.food_items.map((foodId, index) => {
        const foodItem = allFoodList.find(item => item.id === foodId);
        return {
            foodId: foodId,
            itemName: foodItem.name,
            quantity: orderData.quantity[index],
            rate: parseFloat(foodItem.price),
            total: parseFloat(foodItem.price) * orderData.quantity[index]
        };
    });

    console.log('Order Bill Items:', orderBillItems);

    // Basic Info
    doc.getElementById('bill-number').textContent = billData.bill_no;
    // doc.getElementById('bill-date').textContent = new Date(billData.created_at).toLocaleDateString();
    doc.getElementById('table-number').textContent = orderData.tables?.[0] || '-';
    doc.getElementById('order-type').textContent = orderData.order_type;
    doc.getElementById('gst-bill-number').textContent = billData.gst_bill_no;

    // Customer Details
    doc.getElementById('customer-name').textContent = `${orderData.customer?.first_name || 'NA'} ${orderData.customer?.last_name || ''}`;
    doc.getElementById('customer-email').textContent = orderData.customer?.email || 'NA';
    doc.getElementById('customer-phone').textContent = orderData.customer?.phone || 'NA';
    doc.getElementById('customer-gstno').textContent = billData?.customer_gst || 'NA';

    // Bill Items
    const billItemsBody = doc.getElementById('bill-items-body');

    // // Add items
    orderBillItems.forEach(item => {
        const row = doc.createElement('tr');
        row.innerHTML = `
            <td>${item.itemName}</td>
            <td>${item.quantity}</td>
            <td>${item.rate.toFixed(2)}</td>
            <td>${item.total.toFixed(2)}</td>
        `;
        billItemsBody.appendChild(row);
    });

    // Add totals
    const totalsHTML = `
        <tr><td></td></tr>
        <tr class="bill-total total">
            <td></td>
            <td>Total</td>
            <td></td>
            <td>${billData.total}</td>
        </tr>
        <tr class="bill-total discount">
            <td></td>
            <td>Discount</td>
            <td></td>
            <td>${billData.discount}</td>
        </tr>
        <tr class="bill-total gst">
            <td></td>
            <td>Central GST</td>
            <td>2.50%</td>
            <td>${(billData.cgst_amount)}</td>
        </tr>
        <tr class="bill-total gst">
            <td></td>
            <td>State GST</td>
            <td>2.50%</td>
            <td>${(billData.sgst_amount)}</td>
        </tr>
        <tr class="bill-total net-amount">
            <td></td>
            <td>Net Amount</td>
            <td class="inr-symbol">INR ₹</td>
            <td>${billData.net_amount}</td>
        </tr>
        <tr class="bill-total amount-in-words">
            <td>Amount in Words (INR) : </td>
            <td colspan="3"><i>${capitalizeFirstLetter(billWindow.numberToWords.toWords(Math.floor(billData.net_amount)).replace(/-/g, ' '))} Rupees Only</i></td>
        </tr>
    `;
    billItemsBody.insertAdjacentHTML('beforeend', totalsHTML);

    // Footer info
    doc.querySelector('.kot-nos').textContent = orderData.kot_count || '0';
    doc.querySelector('.name').textContent = billData.cashier_by || '';
    doc.querySelector('.cashier-date').textContent = new Date(billData.created_at).toLocaleString();

    // Trigger print after a short delay
    // setTimeout(() => {
    //     billWindow.print();
    // }, 500);


    setTimeout(() => {
        try {
            const printSettings = {
                pageRanges: [{ from: 2, to: 2 }], // Only print page 2
                silent: false,
                printBackground: true,
                deviceName: ''
            };
            console.log('Printing...');
            billWindow.print(printSettings);
        } catch (e) {
            // Fallback to CSS method if print settings not supported
            console.log('Fallback to CSS method');
            billWindow.print();
        }
    }, 500);



}

function capitalizeFirstLetter(str) {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}


function refreshOrdersList() {

    showLoading();
    alert('Syncing Orders List', 'info');
    const button = document.querySelector('#refresh-btn-orders');
    button.classList.add('spinning');
    console.log('Refreshing Orders List');

    // Call your existing category fetch function here
    getOrdersListRefresh()
        .then(() => {
            console.log('Orders List Refreshed');
            // Remove spinning class after refresh
            setTimeout(() => {
                button.classList.remove('spinning');
            }, 1000);
            document.getElementById('orders').click();
            hideLoading();
            alert('Orders List Synced', 'success');
        })
        .catch(error => {
            console.error('Error refreshing orders:', error);
            button.classList.remove('spinning');
            alert('Error Syncing Orders List', 'error');
            hideLoading();
        });
}

// Add event listener for tooltip and refresh button
document.querySelector('#refresh-btn-orders')?.addEventListener('click', refreshOrdersList);

