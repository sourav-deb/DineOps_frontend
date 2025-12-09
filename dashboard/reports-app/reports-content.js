// Set default date to today
document.addEventListener('DOMContentLoaded', () => {
    // const today = new Date().toISOString().split('T')[0];
    // Use IST date for default
    const getISTDateString = (dateInput) => {
        const date = dateInput ? new Date(dateInput) : new Date();
        const offset = (5 * 60 + 30) * 60 * 1000;
        const istDate = new Date(date.getTime() + offset);
        return istDate.toISOString().split('T')[0];
    };

    document.getElementById('reportDate').value = getISTDateString();
    generateReport();
});

async function generateReport() {
    // Helper to get date string in IST (+5:30)
    const getISTDateString = (dateInput) => {
        const date = dateInput ? new Date(dateInput) : new Date();
        const offset = (5 * 60 + 30) * 60 * 1000;
        const istDate = new Date(date.getTime() + offset);
        return istDate.toISOString().split('T')[0];
    };

    const selectedDate = document.getElementById('reportDate').value;
    const ordersList = await localforage.getItem('ordersList') || [];
    const billingList = await localforage.getItem('billingList') || [];
    const paymentsList = await localforage.getItem('paymentsList') || [];

    // Filter orders for selected date
    const dailyOrders = ordersList.filter(order => {
        const orderDate = getISTDateString(order.created_at);
        return orderDate === selectedDate;
    });

    // Get bills for these orders
    const dailyBills = billingList.filter(bill => {
        const order = dailyOrders.find(o => o.id === bill.order_id);
        return order !== undefined;
    });

    // Calculate totals
    const totalOrders = dailyOrders.length;
    const totalBilled = dailyBills.reduce((sum, bill) => sum + parseFloat(bill.net_amount), 0);

    // Calculate total received from payments
    const totalReceived = dailyBills.reduce((sum, bill) => {
        const payment = paymentsList.find(p => p.bill_id === bill.id);
        return sum + (payment ? parseFloat(payment.paid_amount) : 0);
    }, 0);

    const avgOrderValue = totalOrders > 0 ? totalBilled / totalOrders : 0;

    // Update summary cards
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalBilled').textContent = `₹${totalBilled.toFixed(2)}`;
    document.getElementById('totalReceived').textContent = `₹${totalReceived.toFixed(2)}`;
    document.getElementById('avgOrderValue').textContent = `₹${avgOrderValue.toFixed(2)}`;

    // Populate orders table
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';

    dailyOrders.forEach(order => {
        const row = document.createElement('tr');
        const time = new Date(order.created_at).toLocaleTimeString();

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${time}</td>
            <td>${order.order_type.replace('_', ' ').toUpperCase()}</td>
            <td>${order.food_items.length} items</td>
            <td>₹${parseFloat(order.total).toFixed(2)}</td>
            <td class="status-${order.status}">${order.status.toUpperCase()}</td>
        `;

        tableBody.appendChild(row);
    });
}


function refreshReportsData() {
    showLoading();
    const button = document.querySelector('#refresh-btn-reports');
    if (button) button.classList.add('spinning');

    // Show loading or alert
    alert('Syncing Reports Data', 'info');

    // Fetch billing data
    const billingUrl = `${baseURL}billing/bills/`;
    const paymentsUrl = `${baseURL}billing/bill-payments/`;

    const options = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    };

    // Fetch both billing and payments data
    Promise.all([
        refreshAccessToken2(billingUrl, options),
        refreshAccessToken2(paymentsUrl, options)
    ])
        .then(async ([billingData, paymentsData]) => {
            // Update localForage
            await localforage.setItem('billingList', billingData);
            await localforage.setItem('paymentsList', paymentsData);

            // Regenerate report with new data
            await generateReport();

            // Remove spinning class and show success
            setTimeout(() => {
                if (button) button.classList.remove('spinning');
                alert('Reports Data Synced', 'success');
            }, 1000);
            // alert('Reports Data Synced', 'success');
            hideLoading();
        })
        .catch(error => {
            console.error('Error refreshing reports data:', error);
            button.classList.remove('spinning');
            alert('Error Syncing Reports Data', 'error');
            hideLoading();
        });
}

// Add event listener
document.querySelector('#refresh-btn-reports')?.addEventListener('click', refreshReportsData);

