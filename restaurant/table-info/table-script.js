document.addEventListener('DOMContentLoaded', function () {

    function getBrowserHeaderHeight() {
        const screenHeight = window.screen.height; // Total screen height
        const viewportHeight = window.innerHeight; // Viewport height (excluding browser UI)
        const headerHeight = screenHeight - viewportHeight;
        const string = `Screen height: ${screenHeight}px, Viewport height: ${viewportHeight}px, Browser header height: ${headerHeight}px`;
        document.body.style.height = (viewportHeight - 1) + 'px';
        return string;
    }
    // console.log(getBrowserHeaderHeight());



    // getAllOrders();

    getTablesData();

    getAllTablesRooms();

    function getAllTablesRooms() {
        const tableInfo = JSON.parse(localStorage.getItem('tablesList')) || [];

        const tableInfo2 = [
            {
                id: 1,
                table_number: 1,
                occupied: true,
                order_id: 2,
                order_time: '2024-09-19T23:23:00',
            },
            {
                id: 2,
                table_number: 2,
                occupied: false,
                order_id: null,
                order_time: null,
            },
            {
                id: 3,
                table_number: 3,
                occupied: false,
                order_id: null,
                order_time: null,
            },
            {
                id: 4,
                table_number: 4,
                occupied: false,
                order_id: null,
                order_time: null,
            },
            {
                id: 5,
                table_number: 5,
                occupied: false,
                order_id: null,
                order_time: null,
            }
        ];

        const tableViewRow = document.querySelector('.table-view-row');

        tableInfo.forEach((table) => {
            const tableViewCell = document.createElement('div');
            tableViewCell.classList.add('table-view-cell');

            // Uncomment after connection to database
            // if (table.occupied && table.order_id && table.order_time) {
            if (table.occupied) {
                tableViewCell.classList.add('occupied-table');

                // Create eye button
                const eyeButton = document.createElement('button');
                eyeButton.classList.add('eye-button');
                eyeButton.innerHTML = '<i class="fas fa-eye"></i>';
                eyeButton.style.position = 'absolute';
                eyeButton.style.bottom = '5px';
                eyeButton.style.right = '5px';
                eyeButton.style.background = 'transparent';
                eyeButton.style.border = 'none';
                eyeButton.style.color = 'rgb(150,0,0)';
                eyeButton.style.cursor = 'pointer';

                eyeButton.addEventListener('click', function (event) {
                    event.stopPropagation(); // Prevent triggering the tableViewCell click event
                    window.location.href = `./../takeorder/takeorder.html?orderId=${table.order}`;
                    // window.location.href = `./../takeorder/takeorder.html?orderId=1`;
                });

                tableViewCell.appendChild(eyeButton);
            }
            // 👁️ eye
            tableViewCell.addEventListener('click', function () {
                if (!table.occupied) {
                    window.location.href = `./../takeorder/takeorder.html?table=${table.table_number}&orderType=dine_in`;
                }
            });

            const tableText = document.createElement('div');
            tableText.classList.add('text');

            const orderMin = document.createElement('div');
            orderMin.id = 'order-min';
            const tableNo = document.createElement('div');
            tableNo.id = 'table-no';
            const amount = document.createElement('div');
            amount.id = 'amount';

            tableNo.textContent = table.table_number;
            amount.textContent = table.amount || '';

            if (table.order_time) {
                const orderTime = new Date(table.order_time);
                const currentTime = new Date();
                console.log(currentTime);
                const timeDiff = Math.floor((currentTime - orderTime) / 60000); // Difference in minutes
                orderMin.textContent = `${timeDiff} Min`;
            } else {
                orderMin.textContent = '';
            }

            tableText.appendChild(orderMin);
            tableText.appendChild(tableNo);
            tableText.appendChild(amount);
            tableViewCell.appendChild(tableText);
            tableViewRow.appendChild(tableViewCell);
        });

        const roomInfo = [
            {
                room_number: 101,
                occupied: true,
            },
            {
                room_number: 202,
                occupied: false,
            },
            {
                room_number: 103,
                occupied: false,
            },
            {
                room_number: 107,
                occupied: false,
            },
            {
                room_number: 204,
                occupied: false,
            }
        ];

        const roomViewRow = document.querySelector('.room-view-row');

        roomInfo.forEach((room) => {
            const roomViewCell = document.createElement('div');
            roomViewCell.classList.add('room-view-cell');

            if (!room.occupied) {
                roomViewCell.classList.add('occupied-room');
            }

            roomViewCell.addEventListener('click', function () {
                if (room.occupied) {
                    window.location.href = `./../takeorder/takeorder.html?room=${room.room_number}&orderType=room_service`;
                }
            });

            const roomText = document.createElement('div');
            roomText.classList.add('text');

            const roomNo = document.createElement('div');
            roomNo.id = 'room-no';

            roomNo.textContent = room.room_number;

            roomText.appendChild(roomNo);
            roomViewCell.appendChild(roomText);
            roomViewRow.appendChild(roomViewCell);
        });


    }

    // Onclick Enable/Disable on Table/Room block
    document.querySelector('.order-type-info').addEventListener('click', function (event) {
        if (event.target.classList.contains('type-selectable')) {
            // Remove 'type-selected' class from all buttons
            this.querySelectorAll('.type-selectable').forEach(button => {
                button.classList.remove('type-selected');
            });

            // Add 'type-selected' class to the clicked button
            event.target.classList.add('type-selected');

            // Get the selected type
            const selectedType = event.target;

            if (selectedType) {
                if (selectedType.textContent === 'DELIVERY') {
                    // Action for DELIVERY
                    document.querySelectorAll('.table-view-cell').forEach(element => {
                        element.style.cursor = 'not-allowed';
                        element.disabled = true;
                    });
                    document.querySelectorAll('.room-view-cell').forEach(element => {
                        element.style.cursor = 'not-allowed';
                        element.disabled = true;
                    });
                    document.addEventListener('click', function (event) {
                        if (event.target.id.includes('delivery')) {
                            window.location.href = `./../takeorder/takeorder.html?orderType=delivery`;
                        }
                    });
                } else if (selectedType.textContent === 'TAKEAWAY') {
                    // Action for TAKEAWAY
                    document.querySelectorAll('.table-view-cell').forEach(element => {
                        element.style.cursor = 'not-allowed';
                        element.disabled = true;
                    });
                    document.querySelectorAll('.room-view-cell').forEach(element => {
                        element.style.cursor = 'not-allowed';
                        element.disabled = true;
                    });
                    document.addEventListener('click', function (event) {
                        if (event.target.id.includes('take_away')) {
                            window.location.href = `./../takeorder/takeorder.html?orderType=take_away`;
                        }
                    });
                } else {
                    // Default action or handling for other cases
                }
            }
        }
    });

    function getAllOrders2() {
        const option = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
            }
        }

        const url = `${baseURL}orders/order/`;

        refreshAccessToken2(url, option)
            // .then(response => response.json())
            .then(data => {
                console.log('Data:', data);
                console.table(data);
                // Save data in local storage
                localStorage.setItem('order_data', JSON.stringify(data));
                delivery_pickup(data);
                // alert("GET: All Order Received");
            })
            .catch(error => {
                console.log('Error Saving Order:', error);
            });
    }

    function getAllOrders() {
        // get ordersList from local storage
        let ordersList = JSON.parse(localStorage.getItem('ordersList') || '[]');
        delivery_pickup(ordersList);
    }

    getAllOrders();

    function delivery_pickup(data) {
        const validStatuses = ['in_progress', 'kot', 'hold'];
        const filteredOrders = data.filter(order =>
            (order.order_type === 'delivery' || order.order_type === 'take_away') &&
            validStatuses.includes(order.status)
        );

        console.log('Filtered Delivery and Takeaway Orders:', filteredOrders);

        const deliveryOrders = filteredOrders.filter(order => order.order_type === 'delivery');
        const pickupOrders = filteredOrders.filter(order => order.order_type === 'take_away');

        console.log('Delivery Orders:', deliveryOrders);
        console.log('Takeaway Orders:', pickupOrders);

        if (deliveryOrders.length > 0) {
            console.log('There are multiple delivery orders');
            const deliveryView = document.querySelector('.delivery-view-row');

            const deliveryRow = document.createElement('div');
            deliveryRow.classList.add('row-caption');
            deliveryRow.id = 'delivery-row';
            deliveryRow.textContent = 'Delivery';

            deliveryView.appendChild(deliveryRow);

            deliveryOrders.forEach(order => {
                const deliveryCell = document.createElement('div');
                deliveryCell.classList.add('delivery-view-cell');
                deliveryCell.id = `delivery-${order.id}`;

                const deliveryText = document.createElement('div');
                deliveryText.classList.add('text');

                const deliveryOrderId = document.createElement('div');
                deliveryOrderId.classList.add('order-id');
                deliveryOrderId.textContent = `Order #${order.id}`;

                const deliveryOrderMin = document.createElement('div');
                deliveryOrderMin.classList.add('order-min');
                const orderDate = new Date(order.created_at);
                const currentTime = new Date();
                const timeDiff = Math.floor((currentTime - orderDate) / 60000);
                deliveryOrderMin.textContent = `${timeDiff} Min`;

                deliveryText.appendChild(deliveryOrderMin);
                deliveryText.appendChild(deliveryOrderId);

                // Create eye button
                const eyeButton = document.createElement('button');
                eyeButton.classList.add('eye-button');
                eyeButton.innerHTML = '<i class="fas fa-eye"></i>';
                eyeButton.style.position = 'absolute';
                eyeButton.style.bottom = '5px';
                eyeButton.style.right = '5px';
                eyeButton.style.background = 'transparent';
                eyeButton.style.border = 'none';
                eyeButton.style.color = 'rgb(150,0,0)';
                eyeButton.style.cursor = 'pointer';

                eyeButton.addEventListener('click', function (event) {
                    event.stopPropagation();
                    window.location.href = `./../takeorder/takeorder.html?orderId=${order.id}&orderType=delivery`;
                });

                deliveryCell.appendChild(deliveryText);
                deliveryCell.appendChild(eyeButton);
                deliveryView.appendChild(deliveryCell);
            });
        }

        if (pickupOrders.length > 0) {
            console.log('There are multiple Takeaway orders');
            const pickupView = document.querySelector('.pickup-view-row');
        
            const pickupRow = document.createElement('div');
            pickupRow.classList.add('row-caption');
            pickupRow.id = 'pickup-row';
            pickupRow.textContent = 'Takeaway';
        
            pickupView.appendChild(pickupRow);
        
            pickupOrders.forEach(order => {
                const pickupCell = document.createElement('div');
                pickupCell.classList.add('pickup-view-cell');
                pickupCell.id = `pickup-${order.id}`;
        
                const pickupText = document.createElement('div');
                pickupText.classList.add('text');
        
                const pickupOrderId = document.createElement('div');
                pickupOrderId.classList.add('order-id');
                pickupOrderId.textContent = `Order #${order.id}`;
        
                const pickupOrderMin = document.createElement('div');
                pickupOrderMin.classList.add('order-min');
                const orderDate = new Date(order.created_at);
                const currentTime = new Date();
                const timeDiff = Math.floor((currentTime - orderDate) / 60000);
                pickupOrderMin.textContent = `${timeDiff} Min`;
        
                pickupText.appendChild(pickupOrderMin);
                pickupText.appendChild(pickupOrderId);
        
                // Create eye button
                const eyeButton = document.createElement('button');
                eyeButton.classList.add('eye-button');
                eyeButton.innerHTML = '<i class="fas fa-eye"></i>';
                eyeButton.style.position = 'absolute';
                eyeButton.style.bottom = '5px';
                eyeButton.style.right = '5px';
                eyeButton.style.background = 'transparent';
                eyeButton.style.border = 'none';
                eyeButton.style.color = 'rgb(150,0,0)';
                eyeButton.style.cursor = 'pointer';
        
                eyeButton.addEventListener('click', function (event) {
                    event.stopPropagation();
                    window.location.href = `./../takeorder/takeorder.html?orderId=${order.id}&orderType=take_away`;
                });
        
                pickupCell.appendChild(pickupText);
                pickupCell.appendChild(eyeButton);
                pickupView.appendChild(pickupCell);
            });
        }
        
    }

    document.querySelector('#refresh').addEventListener('click', function () {
        window.location.reload();
    });


});
