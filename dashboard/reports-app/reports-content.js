// Set default date to today
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').value = today;
    generateReport();
});

function generateReport() {
    const selectedDate = document.getElementById('reportDate').value;
    const ordersList = JSON.parse(localStorage.getItem('ordersList') || '[]');
    const billingList = JSON.parse(localStorage.getItem('billingList') || '[]');
    const paymentsList = JSON.parse(localStorage.getItem('paymentsList') || '[]');
    
    // Filter orders for selected date
    const dailyOrders = ordersList.filter(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
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