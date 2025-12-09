
// ----------------Body
document.addEventListener('DOMContentLoaded', function () {
    // baseURL = 'https://dineops.onrender.com/api/';
    let finalBillItems = [];

    // Helper function to get a cookie value
    function getCookie(name) {
        let value = "; " + document.cookie;
        let parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

    // Initialize as empty arrays first
    let allFoodItems = [];
    let allCatgItems = [];
    let enabledFoodItems = [];
    let enabledCatgItems = [];
    let categorizedItems = {};
    let distinctCategories = [];

    // Async function to initialize data
    async function initializeData() {
        // Get all items from Local Storage
        allFoodItems = await getAllFoodListFromStorage() || [];
        console.table(allFoodItems);
        // Get all categories from Local Storage
        allCatgItems = await getCategoryListFromStorage() || [];
        console.table(allCatgItems);

        // Filter enabled items
        enabledFoodItems = allFoodItems.filter(item => item.status === "enabled");
        console.table(enabledFoodItems);
        enabledCatgItems = allCatgItems.filter(item => item.status === "enabled");
        console.table(enabledCatgItems);

        // Process categories
        distinctCategories = [];
        enabledCatgItems.forEach(item => {
            if (item.name && !distinctCategories.includes(item.name)) {
                distinctCategories.push(item.name);
            }
        });
        console.table(`distinctCategories : ${distinctCategories}`);

        // Process food items
        categorizedItems = {};
        enabledFoodItems.forEach(item => {
            if (item.category_name) {
                if (!categorizedItems[item.category_name]) {
                    categorizedItems[item.category_name] = [];
                }
                categorizedItems[item.category_name].push({
                    id: item.id,
                    name: item.name,
                    price: item.price
                });
            }
        });

        console.log(categorizedItems);

        // Render UI after data is loaded
        renderMenuCategories();
        // Set up other UI elements that depend on data
        setupUI();
    }

    // Call init function
    initializeData();

    // console.table(allFoodItems.map(item => item.name));

    let billItems = [];



    // Put Category names in the menu category section & manage the items adding in bill
    function renderMenuCategories() {
        const categoryDiv = document.querySelector('.menu-category');
        categoryDiv.innerHTML = ''; // Clear existing
        distinctCategories.forEach(category => {
            const categoryDivItems = document.createElement('div');
            categoryDivItems.classList.add('menu-category-item');
            const categoryDivItemsName = document.createElement('div');
            categoryDivItemsName.classList.add('category-name');
            categoryDivItemsName.textContent = category;
            categoryDivItems.appendChild(categoryDivItemsName);
            categoryDiv.appendChild(categoryDivItems);
        });

        // Re-attach event listeners since we recreated elements
        const menuCategories = document.querySelectorAll('.menu-category-item');
        menuCategories.forEach(category => {
            category.addEventListener('click', function () {
                menuCategories.forEach(cat => cat.classList.remove('selected'));
                this.classList.add('selected');
                const categoryName = this.querySelector('.category-name').textContent.trim();
                loadMenuItems(categoryName);
            });
        });

        // Select first category by default
        selectFirstCategory();
    }

    // Moved setup logic into a function to be called after async init
    function setupUI() {
        // Put Foods in the menu items section
        // Note: These variables need to be re-queried or accessible in this scope
        const menuItemsContainer = document.querySelector('.menu-items');

        // Update the global menuItems reference to use the populated categorizedItems
        // menuItems = categorizedItems; // If menuItems is used elsewhere

        // Initialize search
        document.getElementById('search-input').addEventListener('input', searchItems);

        // Initialize Order Type Handlers
        initializeOrderTypeHandlers();
    }


    // Put Foods in the menu items section
    const menuCategories = document.querySelectorAll('.menu-category-item');
    const menuItemsContainer = document.querySelector('.menu-items');
    const billContainer = document.querySelector('.bill-container');
    const billTotal = document.querySelector('.ta-price');
    const netTotal = document.querySelector('.na-price');
    const discBox = document.querySelector('.disc-box');

    // menuItems will be accessed from categorizedItems directly in functions
    // const menuItems = categorizedItems; 
    // console.warn(menuItems);

    // Adding click on Category Div
    // Logic moved to renderMenuCategories to handle async loading

    // Removing synchronous execution block
    /*
    menuCategories.forEach(category => {
        category.addEventListener('click', function () {
            menuCategories.forEach(cat => cat.classList.remove('selected'));
            this.classList.add('selected');
            const categoryName = this.querySelector('.category-name').textContent.trim();
            loadMenuItems(categoryName);
        });
    });
    */

    document.getElementById('search-input').addEventListener('input', searchItems);

    function searchItems() {
        // Add search functionality
        const searchInput = document.getElementById('search-input');

        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();

            if (searchTerm === '') {
                // If search is empty and a category is selected, show that category's items
                const selectedCategory = document.querySelector('.menu-category-item.selected');
                if (selectedCategory) {
                    const categoryName = selectedCategory.querySelector('.category-name').textContent.trim();
                    loadMenuItems(categoryName);
                }
                return;
            }

            // Clear current menu items
            menuItemsContainer.innerHTML = '';

            // Search through all items in categorizedItems
            Object.values(categorizedItems).flat().forEach(item => {
                if (item.name.toLowerCase().includes(searchTerm)) {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('menu-item');

                    const itemNameDiv = document.createElement('div');
                    itemNameDiv.classList.add('item-name');
                    itemNameDiv.textContent = item.name;
                    itemNameDiv.dataset.id = item.id;
                    itemNameDiv.dataset.price = item.price;
                    itemNameDiv.addEventListener('click', () => disableButtons());

                    const itemPriceDiv = document.createElement('div');
                    itemPriceDiv.classList.add('item-price');
                    itemPriceDiv.textContent = `₹${item.price}`;

                    itemElement.appendChild(itemNameDiv);
                    // itemElement.appendChild(itemPriceDiv);
                    menuItemsContainer.appendChild(itemElement);

                    itemElement.addEventListener('click', function () {
                        addItemToBill(item.id, item.name, item.price);
                    });
                }
            });

            // Remove selected state from categories when searching
            menuCategories.forEach(cat => cat.classList.remove('selected'));
        });
    }

    // Load Food Items on click at Category Div
    function loadMenuItems(category) {
        const items = categorizedItems[category] || [];

        menuItemsContainer.innerHTML = '';
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('menu-item');

            const itemNameDiv = document.createElement('div');
            itemNameDiv.classList.add('item-name');
            itemNameDiv.textContent = item.name;
            itemNameDiv.dataset.id = item.id;
            itemNameDiv.dataset.price = item.price;
            itemNameDiv.addEventListener('click', () => disableButtons());

            const itemPriceDiv = document.createElement('div');
            itemPriceDiv.classList.add('item-price');
            itemPriceDiv.textContent = `₹${item.price}`;

            itemElement.appendChild(itemNameDiv);
            // itemElement.appendChild(itemPriceDiv);
            menuItemsContainer.appendChild(itemElement);

            itemElement.addEventListener('click', function () {
                addItemToBill(item.id, item.name, item.price);
            });
        });
    }

    // Add Food Item to Bill Container
    function addItemToBill(itemId, itemName, itemPrice) {
        // console.log(`bill items: ${billItems}`);
        const existingItem = billItems.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            billItems.push({ id: itemId, name: itemName, price: itemPrice, quantity: 1 });
        }
        // console.log(`Current bill items:`, billItems);
        sendDataToSave();
        renderBillItems();
    }

    function sendDataToSave() {
        // finalBillItems = []
        finalBillItems = [...billItems];
        // finalBillItems = [...finalBillItems, ...billItems];

        console.warn(`Final bill items 1:`, finalBillItems);
    }

    // Update Quantity of Food Item in Bill Container
    function updateItemQuantity(itemId, change) {
        const item = billItems.find(item => item.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeItemFromBill(itemId);
            } else {
                renderBillItems();
            }
        }
        console.warn(`Bill items after update: ${JSON.stringify(billItems)}`);
    }

    // Configure plus/minus delete buttons in Bill Container
    // and also calculate Total and Net Total

    function renderBillItems() {
        billContainer.innerHTML = '';

        billItems.forEach(item => {
            // console.log(billItems);
            const billItemElement = document.createElement('div');
            billItemElement.classList.add('bill-item');

            const itemNameDiv = document.createElement('div');
            itemNameDiv.classList.add('bill-item-name');
            itemNameDiv.textContent = item.name;

            const minusButton = document.createElement('button');
            minusButton.classList.add('minus-btn');
            minusButton.textContent = '-';
            // minusButton.addEventListener('click', () => updateItemQuantity(item.id, -1));
            minusButton.addEventListener('click', () => {
                updateItemQuantity(item.id, -1);
                disableButtons();
            });

            const itemQtyDiv = document.createElement('div');
            itemQtyDiv.classList.add('bill-item-qty');
            itemQtyDiv.textContent = item.quantity;

            const plusButton = document.createElement('button');
            plusButton.classList.add('plus-btn');
            plusButton.textContent = '+';
            // plusButton.addEventListener('click', () => updateItemQuantity(item.id, 1));
            plusButton.addEventListener('click', () => {
                updateItemQuantity(item.id, 1);
                disableButtons();
            });

            const itemPriceDiv = document.createElement('div');
            itemPriceDiv.classList.add('bill-item-price');
            itemPriceDiv.textContent = `₹${(item.price * item.quantity).toFixed(2)}`;

            const deleteIcon = document.createElement('div');
            deleteIcon.classList.add('delete-icon');
            deleteIcon.innerHTML = '&#10006;'; // X symbol
            // deleteIcon.addEventListener('click', () => removeItemFromBill(item.id));
            deleteIcon.addEventListener('click', () => {
                removeItemFromBill(item.id);
                disableButtons();
            });



            billItemElement.appendChild(itemNameDiv);

            billItemElement.appendChild(minusButton);
            billItemElement.appendChild(itemQtyDiv);
            billItemElement.appendChild(plusButton);

            billItemElement.appendChild(itemPriceDiv);
            billItemElement.appendChild(deleteIcon);

            billContainer.appendChild(billItemElement);
        });

        console.warn(`Bill items: ${billItems}`);

        // Update the bill total
        billTotal.textContent = `₹${calculateTotal()}`;
        discBox.addEventListener('input', updateNetTotal);
        updateNetTotal();
    }

    // Calculate Total Amount
    function calculateTotal() {
        return billItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    }

    // Remove Food Item from Bill Container on Delete btn click
    function removeItemFromBill(itemId) {
        const index = billItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            billItems.splice(index, 1);
            renderBillItems();
        }
    }

    // Calculate Net Total Amount wrt Discount Percentage
    function updateNetTotal2() {
        const totalAmount = parseFloat(calculateTotal());
        const discountPercentage = parseFloat(discBox.value) || 0;

        let netAmount = totalAmount;
        if (discountPercentage > 0) {
            const discountAmount = totalAmount * (discountPercentage / 100);
            netAmount = totalAmount - discountAmount;
        }
        else if (discountPercentage === null) {
            const discountAmount = totalAmount * (discountPercentage / 100);
            netAmount = totalAmount - discountAmount;
        }

        netTotal.textContent = `₹${netAmount.toFixed(2)}`;
    }

    // Calculate Net Total Amount wrt Discount Amount
    function updateNetTotal() {
        const totalAmount = parseFloat(calculateTotal());
        const discountAmount = parseFloat(discBox.value) || 0;

        let netAmount = totalAmount - discountAmount;
        if (netAmount < 0) netAmount = 0; // Ensure net amount doesn't go below zero

        netTotal.textContent = `₹${netAmount.toFixed(2)}`;
    }

    // Select first category on page load
    function selectFirstCategory() {
        // Re-query as elements are created dynamically
        const menuCategories = document.querySelectorAll('.menu-category-item');
        const firstCategory = menuCategories[0];
        if (firstCategory) {
            firstCategory.classList.add('selected');
            const categoryName = firstCategory.querySelector('.category-name').textContent.trim();
            loadMenuItems(categoryName);
        }
    }

    // selectFirstCategory(); // Called in renderMenuCategories

    // Add selected class on category items
    const buttons = document.querySelectorAll('.selectable');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            console.log(`Selected button: ${button.textContent}`);
        });
    });

    function getSelectedButton() {
        const selectedButton = document.querySelector('.selectable.selected');
        return selectedButton ? selectedButton.textContent : null;
    }

    // document.querySelector('.button-group').addEventListener('click', () => {
    //     const selected = getSelectedButton();
    //     console.log(`Currently selected button: ${selected}`);
    // });


    // Get Browser Header Height
    function getBrowserHeaderHeight() {
        const screenHeight = window.screen.height; // Total screen height
        const screenWidth = window.screen.width; // Total screen width
        const viewportHeight = window.innerHeight; // Viewport height (excluding browser UI)
        const headerHeight = screenHeight - viewportHeight;
        const string = `Screen height: ${screenHeight}px, Viewport height: ${viewportHeight}px, Browser header height: ${headerHeight}px`;
        const string2 = `Screen width: ${screenWidth}px`;
        document.body.style.height = (viewportHeight - 1) + 'px';
        return string;
    }

    console.log(getBrowserHeaderHeight());

    // Configuring More Button
    document.getElementById('moreButton').addEventListener('click', function () {
        console.log('MORE button clicked');
        document.getElementById('morePopup').style.display = 'flex';
    });

    const getOrderType = document.querySelector('.get-order-type');
    const getOrderTypeInfo = document.querySelector('.get-order-type-info');
    const doneButton = document.querySelector('.doneButton');

    doneButton.addEventListener('click', function (e) {

        const selectedOrderType = document.querySelector('.type-selected');
        const mobileInput = document.getElementById('mobile');
        const nameInput = document.getElementById('name');
        const addressInput = document.getElementById('address');

        if (selectedOrderType && selectedOrderType.textContent === 'DELIVERY') {
            if (!mobileInput.value || !nameInput.value || !addressInput.value) {
                e.preventDefault();
                alert('For delivery orders, please provide mobile number, name, and address.');
                return;
            }
        }

        if (selectedOrderType && selectedOrderType.textContent === 'take_away') {
            if (!mobileInput.value || !nameInput.value) {
                e.preventDefault();
                alert('For delivery orders, please provide mobile number and name.');
                return;
            }
        }

        const selectElement = document.querySelector('.order-type-option-select');
        if (selectElement && selectElement.value === "") {
            e.preventDefault();
            alert('Please select a table or room before proceeding');
            console.log('Please select a table or room before proceeding');
            // Optionally, you can add some visual feedback here
        } else if (selectElement && selectElement.value !== "") {
            e.preventDefault();

            getOrderType.textContent = document.querySelector('.type-selected').textContent;
            // getOrderTypeInfo.textContent = selectElement.value;
            // getOrderTypeInfo.textContent = selectElement.textContent;

            // const selectedOption = roomSelect.options[roomSelect.selectedIndex].textContent;
            // document.querySelector('.get-order-type-info').textContent = selectedOption;

            // alert('Selected a table or room before proceeding');
            document.getElementById('morePopup').style.display = 'none';
            document.getElementById('overlay').style.display = 'none';
            // Optionally, you can add some visual feedback here
        } else {
            console.log('Done button clicked');
            getOrderType.textContent = document.querySelector('.type-selected').textContent;
            getOrderTypeInfo.textContent = '';
            document.getElementById('morePopup').style.display = 'none';
            document.getElementById('overlay').style.display = 'none';
        }

    });

    // Put Mobile Number from More to Main
    var mobileInput = document.getElementById('mobile');
    var mobileInputCopy = document.getElementById('mobile-input');

    function validateAndSyncMobile(input, target) {
        // Remove any non-digit characters
        input.value = input.value.replace(/\D/g, '');

        // Limit to 10 digits
        if (input.value.length > 10) {
            input.value = input.value.slice(0, 10);
        }

        // Sync with the other input
        target.value = input.value;
    }

    mobileInput.addEventListener('input', function () {
        validateAndSyncMobile(this, mobileInputCopy);
    });

    mobileInputCopy.addEventListener('input', function () {
        validateAndSyncMobile(this, mobileInput);
    });

    // Display the Table/Room list upon selction of Order Type
    let tableNumbersAppended = false;
    let roomNumbersAppended = false;
    // document.addEventListener('DOMContentLoaded', function () {
    function initializeOrderTypeHandlers() {
        const buttons2 = document.querySelectorAll('.type-selectable');
        const orderTypeOptions = document.querySelector('.order-type-options');

        buttons2.forEach(button => {
            button.addEventListener('click', async function () {
                console.log('Button clicked:', this.textContent);

                // Remove 'selected' class from all buttons
                buttons2.forEach(btn => btn.classList.remove('type-selected'));

                // Add 'selected' class to clicked button
                this.classList.add('type-selected');

                // Update order-type-options based on selection
                switch (this.textContent) {
                    case 'DINE-IN':
                        // orderTypeOptions.appendChild(getAllTableNumbers());
                        if (!tableNumbersAppended) {
                            orderTypeOptions.innerHTML = '';
                            roomNumbersAppended = false;
                            const tableOptions = await getAllTableNumbers(); // Now async
                            orderTypeOptions.appendChild(tableOptions);
                            tableNumbersAppended = true;
                        }
                        break;
                    case 'HOTEL':
                        // orderTypeOptions.innerHTML = getAllRoomNumbers();
                        if (!roomNumbersAppended) {
                            orderTypeOptions.innerHTML = '';
                            tableNumbersAppended = false;
                            const roomOptions = await getAllRoomNumbers(); // Now async
                            orderTypeOptions.appendChild(roomOptions);
                            roomNumbersAppended = true;
                        }
                        break;
                    case 'DELIVERY':
                    case 'TAKE-AWAY':
                        orderTypeOptions.innerHTML = '';
                        tableNumbersAppended = false;
                        roomNumbersAppended = false;
                        orderTypeOptions.innerHTML = '';
                        break;
                }
            });
        });
    }
    // });

    // Get all Table Numbers for Dine-In
    async function getAllTableNumbers() {
        // Get all tables to add
        // const tableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const tableNumbers = await getTablesListFromStorage();

        function createDineInOptions2() {
            return tableNumbers.map(number =>
                `<button class="table-button" data-table="${number}">Table ${number}</button>`
            ).join('');
        }

        function createDineInOptions() {
            return `<select id="table-select" class="order-type-option-select" required>
            <option value="" disabled selected>Select a table</option>
            ${tableNumbers.map(table =>
                `<option value="${table.id}" ${table.occupied ? 'disabled' : ''}>Table ${table.table_number} ${table.occupied ? ' (Occupied)' : ''}</option>`
            ).join('')}
        </select>`;
        }

        // Usage
        const orderTypeOptions = document.createElement('div');
        orderTypeOptions.className = 'table-numbers-group';
        orderTypeOptions.innerHTML = createDineInOptions();

        return orderTypeOptions;
    }

    // Get all Room Numbers for Hotel
    async function getAllRoomNumbers() {
        // Get all tables to add
        // Array of table numbers
        // const roomNumbers2 = [101, 201, 301, 401];

        // Room numbers list from local storage roomsList
        const roomsList = await localforage.getItem('roomsList') || [];
        const roomNumbers = roomsList.map(room => room.room_number);

        // Room id list from local storage roomsList respectively
        const roomIds = roomsList.map(room => room.id);

        // Create a dictionary mapping roomIds to roomNumbers
        const roomDictionary = {};
        roomIds.forEach((id, index) => {
            roomDictionary[id] = roomNumbers[index]; // Map roomId to roomNumber
        });


        console.warn('Room Numbers:', roomNumbers);
        console.warn('Room IDs:', roomIds);
        console.warn('Room Dictionary:', roomDictionary);

        function createRoomServiceOptions2() {
            return roomNumbers.map(number =>
                `<button class="room-button" data-table="${number}">Room ${number}</button>`
            ).join('');
        }

        function createRoomServiceOptions3() {
            return `<select id="room-select" class="order-type-option-select" required disabled>    
            <option value="">Select a room</option>
            ${roomNumbers.map(number =>
                `<option value="${number}">Room ${number}</option>`
            ).join('')}
        </select>`;
        }

        function createRoomServiceOptions() {
            return `<select id="room-select" class="order-type-option-select" required disabled>    
                <option value="">Select a room</option>
                ${Object.keys(roomDictionary).map(roomId =>
                `<option value="${roomId}">Room ${roomDictionary[roomId]}</option>` // Use roomId as value and roomNumber as text
            ).join('')}
            </select>`;
        }

        // Usage
        const orderTypeOptions = document.createElement('div');
        orderTypeOptions.className = 'table-numbers-group';
        orderTypeOptions.innerHTML = createRoomServiceOptions();

        return orderTypeOptions;
    }


    // Get data from Parameters of URL & using helper functions to set order type and select table/room
    // Parse URL parameters

    const urlParams = new URLSearchParams(window.location.search);
    const tableNumber = urlParams.get('table');
    const roomNumber = urlParams.get('room');
    const orderType = urlParams.get('orderType');
    const orderId = urlParams.get('orderId');
    const bookingId = urlParams.get('bookingId');
    const mobile = urlParams.get('mobile');
    const name = urlParams.get('name');
    const email = urlParams.get('email');

    // Use the parameters as needed
    if (tableNumber && orderType === 'dine_in') {
        console.warn('BLOCK 1');
        console.log(`Dine-in order for table ${tableNumber}`);
        setOrderType('DINE-IN');
        selectTable(tableNumber);
    } else if (roomNumber && orderId && orderType === "hotel") {
        console.warn('BLOCK 4');
        console.log(`Hotel order for roomid ${roomNumber} with orderid: ${orderId}`);
        setOrderType('HOTEL');
        selectRoom(roomNumber);
        getDataEditOrder(orderId);
        setOrderType('HOTEL');
    }

    else if (orderId && orderType) {
        console.warn('BLOCK 2');
        document.querySelector('.cancelled-btn').disabled = false;
        console.log(`Order ID: ${orderId}`);
        getDataEditOrder(orderId);
    } else if (orderId) {
        console.warn('BLOCK 3');
        document.querySelector('.cancelled-btn').disabled = false;
        console.log(`Order ID: ${orderId}`);
        getDataEditOrder(orderId);
        // } else if (roomNumber && bookingId) {
    } else if (roomNumber && orderId && orderType) {
        console.warn('BLOCK 4');
        console.log(`Hotel order for room ${roomNumber} with booking ID: ${bookingId}`);
        setOrderType('HOTEL');
        selectRoom(roomNumber);
    } else if (orderType === 'take_away') {
        console.warn('BLOCK 5');
        console.log(`Takeaway`);
        document.getElementById('moreButton').click();
        setOrderType('TAKE-AWAY');
        document.querySelector('.get-order-type').textContent = 'TAKE-AWAY';
    } else if (orderType === 'delivery') {
        console.warn('BLOCK 6');
        console.log(`Delivery`);
        document.getElementById('moreButton').click();
        setOrderType('DELIVERY');
        document.querySelector('.get-order-type').textContent = 'DELIVERY';
    }

    if (mobile && name && email && roomNumber) {
        document.getElementById('mobile').value = mobile;
        document.getElementById('mobile-input').value = mobile;
        document.getElementById('name').value = name;
        document.getElementById('email').value = email;

        const typeButtons = document.querySelectorAll('.type-selectable');

        const hotelButton = Array.from(typeButtons).find(button => button.textContent === 'HOTEL');
        if (hotelButton) {
            hotelButton.classList.add('type-selected');
        }
        hotelButton.click();


        // document.getElementById('room-select').disabled = false;
        const roomSelect = document.getElementById('room-select');
        roomSelect.value = String(roomNumber);
        // get the text content of the selected option
        const selectedOption = roomSelect.options[roomSelect.selectedIndex].textContent;
        document.querySelector('.get-order-type-info').textContent = selectedOption;
        document.querySelector('.get-order-type').textContent = 'HOTEL';
    }


    // Helper functions to set order type and select table/room
    function setOrderType(type) {
        const typeButtons = document.querySelectorAll('.type-selectable');
        typeButtons.forEach(button => {
            if (button.textContent === type) {
                button.click();
                button.click(); // Double click to ensure active state?
            }
        });
    }

    async function selectTable(number) {
        const tablesList = await localforage.getItem('tablesList') || [];
        const table = tablesList.find(table => table.table_number == number);
        if (table) {
            const tableId = table.id;
            console.log('Table Id:', tableId);
            const tableSelect = document.getElementById('table-select');
            if (tableSelect) {
                tableSelect.value = tableId;
            }
        }

        const getOrderType = document.querySelector('.get-order-type');
        const getOrderTypeInfo = document.querySelector('.get-order-type-info');
        getOrderType.textContent = 'DINE-IN';
        getOrderTypeInfo.textContent = number;
    }

    function selectRoom(number) {
        console.log('Select Room Working:', number);
        const getOrderType = document.querySelector('.get-order-type');
        const getOrderTypeInfo = document.querySelector('.get-order-type-info');

        // We might need to handle roomSelect populating if not already done,
        // but typically the order type click handler populates it.
        const roomSelect = document.getElementById('room-select');
        if (roomSelect) {
            // Accessing value might be tricky if options aren't loaded yet, but usually they are.
            // We can try to set it by text or value if we have the ID.
            // Here we assume number passed is the room number logic requires.
            // Actually, room-select usually expects ID.
            // If number is room_number, we might need to find ID.
            // For now, let's just set the info text.
        }

        getOrderType.textContent = 'HOTEL';
        getOrderTypeInfo.textContent = number;
    }


    // Close button for the More Modal
    const closeBtn = document.querySelector('.close-btn');
    const morePopup = document.getElementById('morePopup');

    closeBtn.addEventListener('click', function () {
        morePopup.style.display = 'none';
    });

    // More Button for the More Modal to Open & Close
    const moreButton = document.getElementById('moreButton');
    // const morePopup = document.getElementById('morePopup');
    // const closeBtn = document.querySelector('.close-btn');
    const overlay = document.getElementById('overlay');

    moreButton.addEventListener('click', function () {
        morePopup.classList.add('show');
        overlay.style.display = 'block';
    });

    closeBtn.addEventListener('click', function () {
        morePopup.classList.remove('show');
        overlay.style.display = 'none';
    });

    // GET basic order details: Name, Phone, Order Type, Email, Address, Tbale/Room
    function getOrderDetails() {
        const mobileNumber = document.getElementById('mobile-input').value || document.getElementById('mobile').value;
        // const orderType = document.querySelector('.get-order-type').textContent;


        let orderType = document.querySelector('.get-order-type').textContent;
        if (orderType === 'DINE-IN') {
            orderType = 'dine_in';
        } else if (orderType === 'HOTEL') {
            orderType = 'hotel';
        } else if (orderType === 'TAKE-AWAY') {
            orderType = 'take_away';
        } else if (orderType === 'DELIVERY') {
            orderType = 'delivery';
        }

        // let tableOrRoom = document.querySelector('.get-order-type-info').textContent;

        var tableOrRoom;
        if (document.getElementById('table-select')) {
            tableOrRoom = document.getElementById('table-select').value;
            // document.querySelector('.get-order-type-info').textContent = tableOrRoom;
        }

        const name = document.getElementById('name').value;
        const lname = document.getElementById('lname').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;


        const roomSelect2 = document.getElementById('room-select');
        const tableSelect2 = document.getElementById('table-select');

        let roomNumber2, bookingId2, tableOrRoom2;

        if (roomSelect2) {
            let roomNumber2 = roomSelect2.value;
            let bookingId2 = urlParams.get('bookingId');
            let tableOrRoom2 = null;
        }
        if (tableSelect2) {
            let tableOrRoom2 = tableSelect2.value;
            let roomNumber2 = null;
            let bookingId2 = null;
        }

        console.log(`mobileNumber: ${mobileNumber}`);
        console.log(`orderType: ${orderType}`);
        console.log(`name: ${name}`);
        console.log(`email: ${email}`);
        console.log(`address: ${address}`);
        console.log('tableOrRoom2:', tableOrRoom2);
        console.log('roomNumber2:', roomNumber2);
        console.log('bookingId2:', bookingId2);

        return {
            mobileNumber,
            orderType,
            tableOrRoom,
            roomNumber,
            bookingId,
            name,
            lname,
            email,
            address
        };
    }

    globalThis.takeDataToKOT = [];


    // SAVE: Getting all items data that are in bill after clicking Save Button
    const savebtn = document.querySelector('.save-btn')
    savebtn.addEventListener('click', async function (e) {
        e.preventDefault();
        console.log('save button clicked');
        if (savebtn.click) {
            console.log('save button clicked');
            console.table(finalBillItems);
            const orderDetails = getOrderDetails();
            console.table('Order Details:', orderDetails);

            const totalAmount = parseFloat(document.querySelector('.ta-price').textContent.replace('₹', ''));
            const netTotalAmount = parseFloat(document.querySelector('.na-price').textContent.replace('₹', ''));
            const discountAmount = parseFloat(document.querySelector('.disc-box').value) || 0;
            const notes = document.getElementById('order-note').value;

            let orderTypeVal
            let orderType = document.querySelector('.type-selected').textContent;
            if (orderType == 'DELIVERY') {
                orderTypeVal = 'delivery';
            } else if (orderType == 'TAKE-AWAY') {
                orderTypeVal = 'take_away';
            }

            console.warn(`Final bill items: ${JSON.stringify(finalBillItems)}`);


            var orderData = {
                phone: orderDetails.mobileNumber,
                email: orderDetails.email,
                first_name: orderDetails.name,
                last_name: orderDetails.lname,
                address_line_1: orderDetails.address,
                // if orderDetails.orderType is empty then use orderTypeVal

                order_type: orderDetails.orderType || orderTypeVal,
                tables: [parseInt(orderDetails.tableOrRoom)],
                status: 'in_progress',
                food_items: finalBillItems.map(item => item.id),
                quantity: finalBillItems.map(item => item.quantity),
                // total_price: totalAmount,
                // discount: discountAmount,
                room_id: parseInt(orderDetails.roomNumber),
                booking_id: parseInt(orderDetails.bookingId),
                notes: notes
            };

            const orderData2 = {
                "phone": "1674564521",
                "email": "sourav@example.com",
                "dob": "2024-06-03",
                "address_line_1": "",
                "address_line_2": "",
                "first_name": "Sourav",
                "order_type": "dine_in",
                "table": 8,
                "food_items": [1, 2, 3, 4],
                "quantity": [5],
                "status": "in_progress",
                "notes": "zubi zubi",
                "coupon_used": ["69"]
            }

            console.log('Order Data:', orderData);
            console.table(orderData);

            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('orderId');
            const table = urlParams.get('table');
            const urlorderType = urlParams.get('orderType');

            const hiddenOrderId = document.getElementById('hidden-order-id');

            if (orderData.order_type === 'delivery') {
                delete orderData.tables;
            } else if (orderData.order_type === 'take_away') {
                delete orderData.tables;
            }
            // else if (orderData.order_type === 'hotel') {
            //     delete orderData.tables;
            //     delete orderData.booking_id;
            //     delete orderData.room_id;
            // }

            if (table) {
                console.warn('IF BLOCK 1');
                const tableNumber = parseInt(table);
                console.log('Looking for table number:', tableNumber);

                const tablesList = await localforage.getItem('tablesList') || [];
                console.log('Table Data:', tablesList);

                const tableInfo = tablesList.find(t => t.table_number === tableNumber);
                console.log('Found table:', tableInfo);

                if (tableInfo && tableInfo.order != null) {
                    console.log('Table Order:', tableInfo.order);
                    const orderId2 = tableInfo.order;

                    saveOrderPATCH(orderData, orderId2);
                } else {
                    saveOrderPOST(orderData);
                }
            } else if (orderId && urlorderType === "hotel") {

                if (orderData.order_type === 'hotel') {
                    delete orderData.tables;
                    delete orderData.booking_id;
                    delete orderData.room_id;
                }

                console.warn('ELSE IF BLOCK 2');
                saveOrderPATCH(orderData, orderId);
            }
            else if (orderId) {
                console.warn('ELSE IF BLOCK 3');
                saveOrderPATCH(orderData, orderId);
                // document.querySelector('.cancelled-btn').disabled = false;
                // document.querySelector('.hold-btn').disabled = false;
                // document.querySelector('.kot-btn').disabled = false;

            } else if (hiddenOrderId) {
                if (orderData.order_type === 'hotel') {
                    delete orderData.tables;
                    delete orderData.booking_id;
                    delete orderData.room_id;
                }
                console.warn('ELSE IF BLOCK 4');
                const orderId = parseInt(hiddenOrderId.value);
                saveOrderPATCH(orderData, orderId);
                // saveOrderPOST(orderData);
                // document.querySelector('.hold-btn').disabled = false;
                // document.querySelector('.kot-btn').disabled = false;

            } else {
                console.warn('ELSE BLOCK 5');
                saveOrderPOST(orderData);
            }

        }

        async function saveOrderPOST(orderData) {
            console.table(orderData);
            showLoading();
            const option = {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('access_token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            }

            const url = `${baseURL}orders/order/`;

            refreshAccessToken2(url, option)
                // .then(response => response.json())
                .then(async data => {
                    console.log('Data:', data);
                    console.table(data);
                    takeDataToKOT = data;
                    alert("Success: Saved Order Successfully", 'success');
                    // getALlOrders();
                    // getTablesData();

                    // add data in local storage
                    let ordersList = await localforage.getItem('ordersList') || [];
                    ordersList.push(data);
                    await localforage.setItem('ordersList', ordersList);
                    // localStorage.setItem('ordersList', JSON.stringify(ordersList));

                    // update payload in local storage for tablesList where table_number is data.tables[0] and order is data.id
                    let tablesList = await localforage.getItem('tablesList') || [];
                    let tableInfo = tablesList.find(t => t.table_number == data.tables[0]);
                    if (tableInfo) {
                        tableInfo.order = data.id;
                        tableInfo.occupied = true;
                        await localforage.setItem('tablesList', tablesList);
                    }
                    // localStorage.setItem('tablesList', JSON.stringify(tablesList));

                    // enable buttons
                    document.querySelector('.cancelled-btn').disabled = false;
                    document.querySelector('.hold-btn').disabled = false;
                    document.querySelector('.kot-btn').disabled = false;

                    if (data.order_type == 'hotel') {
                        document.querySelector('.settle-btn').disabled = true;
                    } else {
                        document.querySelector('.settle-btn').disabled = false;
                    }

                    passOrderId = data.id;
                    passOrderKotCount = data.kot_count;

                    const createOrderId = document.createElement('input');
                    createOrderId.value = data.id;
                    createOrderId.type = 'hidden';
                    createOrderId.name = 'order-id';
                    createOrderId.id = 'hidden-order-id';
                    document.body.appendChild(createOrderId);
                    hideLoading();

                })
                .catch(error => {
                    console.log('Error Saving Order:', error);
                    alert('Error: Order not saved', 'error');
                    hideLoading();
                });

        }


        async function saveOrderPATCH(orderData, orderId) {
            showLoading();
            console.table(`PATCH: Order Data:`, orderData);
            const option = {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('access_token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            }

            console.log(option.body)

            const url = `${baseURL}orders/order/${orderId}/`;
            refreshAccessToken2(url, option)
                // .then(response => response.json())
                .then(async data => {
                    console.log('Data:', data);
                    takeDataToKOT = data;
                    console.table(data);
                    alert("Success: Order Updated Successfully", 'success');

                    // getTablesData();

                    // update ordersList in local storage where id is data.id
                    let ordersList = await localforage.getItem('ordersList') || [];
                    ordersList = ordersList.map(order => {
                        if (order.id === data.id) {
                            return data;  // Replace the matching order with new data
                        }
                        return order;
                    });
                    await localforage.setItem('ordersList', ordersList);
                    // localStorage.setItem('ordersList', JSON.stringify(ordersList));

                    // enable buttons
                    document.querySelector('.cancelled-btn').disabled = false;
                    document.querySelector('.hold-btn').disabled = false;
                    document.querySelector('.kot-btn').disabled = false;

                    if (data.order_type == 'hotel') {
                        document.querySelector('.settle-btn').disabled = true;
                    } else {
                        document.querySelector('.settle-btn').disabled = false;
                    }

                    const createOrderId = document.createElement('input');
                    createOrderId.value = data.id;
                    createOrderId.type = 'hidden';
                    createOrderId.name = 'order-id';
                    createOrderId.id = 'hidden-order-id';
                    document.body.appendChild(createOrderId);
                    hideLoading();
                })
                .catch(error => {
                    console.log('Error Saving Order:', error);
                    alert('Error: Order not updated', 'error');
                    hideLoading();
                })
        }

        function getOrderType2(orderId) {
            const option = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('access_token'),
                    'Content-Type': 'application/json'
                }
            }

            const url = `${baseURL}orders/order/${orderId}/`;

            refreshAccessToken2(url, option)
                // .then(response => response.json())
                .then(data => {
                    console.log('Data:', data);
                    console.table(data);
                    return data.order_type;
                })
                .catch(error => {
                    console.log('Error Getting Order Type:', error);
                });
        }

        async function getOrderType(orderId) {
            // get order type from ordersList in local storage where id is orderId
            let ordersList = await localforage.getItem('ordersList') || [];
            let orderInfo = ordersList.find(o => o.id == orderId);
            return orderInfo ? orderInfo.order_type : null;
        }
    });

    // HOLD: Getting all items data that are in bill after clicking Hold Button
    const holdbtn = document.querySelector('.hold-btn')
    holdbtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (holdbtn.click) {
            console.log('hold button clicked');
            console.table(finalBillItems);
            const orderDetails = getOrderDetails();
            console.table('Order Details:', orderDetails);

            const urlParams = new URLSearchParams(window.location.search);
            // console.log('Order Data:', orderData);
            const orderId = urlParams.get('orderId');
            console.log('Order ID:', orderId);
            const hiddenOrderId = document.getElementById('hidden-order-id');

            if (orderId) {
                holdOrder(orderId);
            } else if (hiddenOrderId) {
                const hiddenOrderId = document.getElementById('hidden-order-id').value;
                holdOrder(hiddenOrderId);
            }
        }

        async function holdOrder(orderId) {
            showLoading();
            const option = {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('access_token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'on_hold'
                })
            }

            console.log(option.body)

            const url = `${baseURL}orders/order/${orderId}/`;
            refreshAccessToken2(url, option)
                // .then(response => response.json())
                .then(async data => {
                    console.log('Data:', data);
                    console.table(data);
                    alert("Order on Hold", 'success');

                    // update data in local storage with orderId as id, status as on_hold
                    let ordersList = await localforage.getItem('ordersList') || [];
                    let orderInfo = ordersList.find(o => o.id == orderId);
                    if (orderInfo) {
                        orderInfo.status = 'on_hold';
                        await localforage.setItem('ordersList', ordersList);
                    }
                    // localStorage.setItem('ordersList', JSON.stringify(ordersList));

                    hideLoading();
                })
                .catch(error => {
                    console.log('Error Holding Order:', error);
                    alert('Error: Order not on hold', 'error');
                    hideLoading();
                })
        }
    });

    // KOT: Getting all items data that are in bill after clicking KOT Button
    const kotbtn = document.querySelector('.kot-btn')
    kotbtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (kotbtn.click) {
            console.log('KOT button clicked');
            console.table(finalBillItems);
            const orderDetails = getOrderDetails();
            // console.table('Order Details:', orderDetails);

            // const urlParams = new URLSearchParams(window.location.search);
            // const orderId = urlParams.get('orderId');
            console.log('Order ID:', orderId);
            console.log(`takeDataToKOT:`, takeDataToKOT);


            if (orderId) {
                if (takeDataToKOT.kot_count > 1) {
                    // Show Re-KOT confirmation
                    if (confirm('This is a Re-KOT. Do you want to proceed?')) {
                        kotOrder(orderId);
                    }
                } else {
                    console.log('1st KOT!');
                    kotOrder(orderId);
                }
            } else {
                // get order id from passOrderId
                const passedOrderId = passOrderId;
                const passedOrderKotCount = passOrderKotCount;
                console.log('Order ID:', passedOrderId);
                if (passedOrderKotCount > 1) {
                    // Show Re-KOT confirmation
                    if (confirm('This is a Re-KOT. Do you want to proceed??')) {
                        kotOrder(passedOrderId);
                    }
                } else {
                    console.log('1st KOT');
                    kotOrder(passedOrderId);
                }
            }
        }


        async function kotOrder(orderId) {
            showLoading();
            const option = {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('access_token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'kot'
                })
            }

            console.log(option.body)

            const url = `${baseURL}orders/order/${orderId}/`;
            refreshAccessToken2(url, option)
                // .then(response => response.json())
                .then(async data => {
                    console.log('Data:', data);
                    console.table(data);
                    alert("Order KOT Successfully", 'success');
                    // alert("PATCH: Order KOT Successfully");
                    hideLoading();

                    // Update data in local storage
                    let ordersList = await localforage.getItem('ordersList') || [];
                    const index = ordersList.findIndex(o => o.id === data.id);
                    if (index !== -1) {
                        ordersList[index] = data;
                        await localforage.setItem('ordersList', ordersList);
                    } else {
                        // Optional: If for some reason it's not in the list, you might want to add it
                        // ordersList.push(data);
                        // await localforage.setItem('ordersList', ordersList);
                    }


                    // Print KOT
                    printKOT(data);
                })
                .catch(error => {
                    console.log('Error KOT Order:', error);
                    alert('Error: Order KOT not done', 'error');
                    hideLoading();
                })
        }

        async function printKOT(orderData) {
            let kotHead = ``;
            if (orderData.kot_count > 1) {
                kotHead = `<h5>Re-KOT: #${orderData.kot_count}</h5>`;
            } else if (orderData.kot_count == 1) {
                kotHead = `<h5>KOT: #${orderData.kot_count}</h5>`;
            } else {
                console.log('Error: Invalid kot_count value');
            }

            // Need to fetch food items for names if not available
            // In typical flow, allFoodItems is available in scope or needs to be fetched
            // Ensuring we have food items mapping
            const allFoodList = await localforage.getItem('allFoodList') || [];

            // const kotHead = `<h5>Re-KOT: #${orderData.kot_count}</h5>`;
            const kotContent = `
                <div>
                    <h5>Hotel Iswar & Family Restaurants</h5>
                    <p class="orderId">Order ID: 00${orderData.id}</p>
                    <h5>${kotHead}</h5>
                    <p class="table-room">Table/Room No: ${orderData.tables[0] || orderData.room || '-'}</p>
                    <p class="table-room">Order Type: ${orderData.order_type || '-'}</p>
                    <p>Date: ${new Date().toLocaleString()}</p>
                    <table>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                        </tr>
                        ${orderData.food_items.map((item, index) => {
                const food = allFoodList.find(f => f.id === item);
                return `
                            <tr>
                                <td>${food ? food.name : 'Unknown Item'}</td>
                                <td>x ${orderData.quantity[index]}</td>
                            </tr>
                        `}).join('')}
                    </table>

                    <h5>* * * *</h5>
                </div>
            `;

            printJS({
                printable: kotContent,
                type: 'raw-html',
                style: `
                    body { font-family: Arial, sans-serif; }
                    h4, h5 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 0px solid black; padding: 5px; text-align: left; }
                    .orderId { font-size: 10px; font-weight: bold; text-align: center; }
                    .table-room { display: inline-block; width: 45%;  }
                `,
                targetStyles: ['*'],
                documentTitle: 'Kitchen Order Ticket',
                onPrintDialogClose: () => {
                    console.log('KOT printed successfully');
                },
                onError: (error) => {
                    console.error('Error printing KOT:', error);
                }
            });
        }




    });

    // CANC: Clicking Cancel Button to cancel the order
    const cancbtn = document.querySelector('.cancelled-btn')
    cancbtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (cancbtn.click) {
            console.log('cancel button clicked');
            console.table(finalBillItems);
            const orderDetails = getOrderDetails();
            console.table('Order Details:', orderDetails);

            const urlParams = new URLSearchParams(window.location.search);
            // console.log('Order Data:', orderData);
            const orderId = urlParams.get('orderId');
            console.log('Order ID:', orderId);

            const hiddenOrderId = document.getElementById('hidden-order-id');



            if (orderId) {
                cancOrder(orderId);
            } else if (hiddenOrderId) {
                const hiddenOrderId = document.getElementById('hidden-order-id').value;
                cancOrder(hiddenOrderId);
            } else {
                console.log("OrderId not found")
            }

        }

        // API Call for Order Cancel
        function cancOrder(orderId) {
            showLoading();
            const option = {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('access_token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'cancelled'
                })
            }

            console.log(option.body)

            const url = `${baseURL}orders/order/${orderId}/`;
            refreshAccessToken2(url, option)
                // .then(response => response.json())
                .then(data => {
                    console.log('Data:', data);
                    console.table(data);
                    alert("Order Cancelled Successfully", 'success');
                    window.location.href = './../table-info/neworder.html';
                    hideLoading();
                })
                .catch(error => {
                    console.log('Error Cancelling Order:', error);
                    alert('Error: Order not cancelled', 'error');
                    hideLoading();
                })
        }

    });

    // SETLLE: Clicking Settle Button to settle the order
    const settlebtn = document.querySelector('.settle-btn')
    settlebtn.addEventListener('click', async function (e) {
        e.preventDefault();
        const paymentMethod = getSelectedPaymentMethod();

        // if (settlebtn.click) {
        //     console.log('settle button clicked');
        //     console.table('final bill items', finalBillItems);
        //     const orderDetails = getOrderDetails();
        //     console.table('Order Details:', orderDetails);
        //     console.log('takeOrderData:', takeDataToKOT);
        //     // console.log('Order ID:', orderId);
        //     // console.log('Selected payment method:', paymentMethod);

        //     // settleOrder(orderId, paymentMethod);
        // }

        const settleModal = document.getElementById('settleModal');
        const settleModalContainer = document.querySelector('.modal-container');
        const modalBodySettle = settleModal.querySelector('.modal-body');

        // setTimeout(() => settleModal.classList.add('show'), 10);
        // // modalBodySettle.innerHTML = modalContent;
        // settleModalContainer.style.display = 'block';
        // settleModal.style.display = 'block';

        // Change display to flex for centering
        settleModalContainer.style.display = 'flex';
        settleModal.style.display = 'block';
        setTimeout(() => settleModal.classList.add('show'), 10);

        const billNoInput = document.getElementById('bill-no');
        const subTotalInput = document.getElementById('sub-total');
        const discountInput = document.getElementById('bill-discount');
        const netTotalInput = document.getElementById('net-total');
        const cgstInput = document.getElementById('cgst');
        const sgstInput = document.getElementById('sgst');
        const netAmtInput = document.getElementById('net-amt');
        const customerGstInput = document.getElementById('customer_gst');

        const naPrice = document.querySelector('.na-price').textContent;
        console.log('naPrice:', naPrice);
        // remove the ruppe symbol the 1st character
        const naPriceWithoutRupee = naPrice.substring(1);
        console.log('naPriceWithoutRupee:', naPriceWithoutRupee);

        const urlParams = new URLSearchParams(window.location.search);
        var orderId = urlParams.get('orderId');
        const tabelNumber = urlParams.get('table');

        const hiddenOrderId = document.getElementById('hidden-order-id');

        if (tabelNumber) {
            const parsedTableData = await localforage.getItem('tablesList') || [];
            // find order for table number
            const tableOrder = parsedTableData.find(table => table.table_number == tabelNumber);
            console.log('tableOrder:', tableOrder);
            if (tableOrder) {
                orderId = tableOrder.order;
                console.log('orderId:', orderId);
            }
        } else if (hiddenOrderId) {
            orderId = hiddenOrderId.value;
            console.log('orderId:', orderId);
        }

        billNoInput.value = orderId;

        // netTotalInput.value = parseFloat(naPriceWithoutRupee).toFixed(2);
        // const displayNetAmt = (naPriceWithoutRupee * 0.05) + naPriceWithoutRupee;
        // netAmtInput.value = parseFloat(displayNetAmt).toFixed(2);

        calculateBillAmounts();
        discountInput.addEventListener('input', calculateBillAmounts);

        function calculateBillAmounts() {
            // Get subtotal (original price before discount)
            const subTotal = parseFloat(naPriceWithoutRupee);
            subTotalInput.value = subTotal.toFixed(2);

            // Get discount amount from discount input
            const discountAmount = parseFloat(discountInput.value) || 0;

            // Calculate net total (subtotal - discount)
            const netTotal = subTotal - discountAmount;
            netTotalInput.value = netTotal.toFixed(2);

            // Calculate GST (5% of net total)
            const gstRate = 0.05;
            const gstAmount = netTotal * gstRate;

            // Update CGST and SGST (each 2.5%)
            const halfGstAmount = gstAmount / 2;
            cgstInput.value = halfGstAmount.toFixed(2);
            sgstInput.value = halfGstAmount.toFixed(2);

            // Calculate final net amount (net total + GST)
            const netAmount = netTotal + gstAmount;
            netAmtInput.value = netAmount.toFixed(2);
        }


        subTotalInput.value = parseFloat(naPriceWithoutRupee).toFixed(2);
        cgstInput.value = "2.5%";
        sgstInput.value = "2.5%";

        if (discountInput.value == "") {
            discountInput.value = 0;
        }

        var settlePayLoad = {
            order_id: parseInt(orderId),
            bill_type: "RES",
            order_discount: parseFloat(discountInput.value),
            customer_gst: customerGstInput.value
        }

        // Update settlePayload when discount changes
        discountInput.addEventListener('input', function () {
            settlePayLoad = {
                ...settlePayLoad,
                order_discount: parseFloat(this.value) || 0
            };
            console.log('Updated settlePayLoad:', settlePayLoad);
        });


        // Update on customer GST change
        customerGstInput.addEventListener('input', function () {
            settlePayLoad = {
                ...settlePayLoad,
                customer_gst: this.value
            };
            console.log('Updated settlePayLoad:', settlePayLoad);
        });

        // console.log('settlePayLoad:', settlePayLoad);

        const printBillBtn = document.getElementById('print-bill-btn');
        printBillBtn.addEventListener('click', function () {
            // e.preventDefault();
            console.log('printBillBtn clicked');
            console.log('settlePayLoad:', settlePayLoad);
            billOrder(settlePayLoad);
        });


        async function billOrder(settlePayLoad) {
            showLoading();
            const option = {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('access_token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settlePayLoad)
            }
            const url = `${baseURL}billing/bills/`;
            refreshAccessToken2(url, option)
                // .then(response => response.json())
                .then(async data => {
                    console.log('Data:', data);
                    console.table(data);
                    alert("Success: Order Billed Successfully", 'success');

                    // update billingList in local storage with order_id as settlePayLoad.order_id
                    let billingList = await localforage.getItem('billingList') || [];
                    const existingBillIndex = billingList.findIndex(bill => bill.order_id === settlePayLoad.order_id);

                    if (existingBillIndex !== -1) {
                        // Update existing bill
                        billingList[existingBillIndex] = { ...billingList[existingBillIndex], ...data };
                    } else {
                        // Add new bill at the beginning of the array
                        billingList.unshift(data);
                    }

                    await localforage.setItem('billingList', billingList);
                    // localStorage.setItem('billingList', JSON.stringify(billingList));

                    // close settle modal
                    document.querySelector('.close-settle').click();
                    document.querySelector('.settle-btn').disabled = true;
                    hideLoading();

                    generatePrintableBill(data);
                })
                .catch(error => {
                    console.log('Error Billing Order:', error);
                    alert('Error: Order not billed', 'error');
                    hideLoading();
                })
        }

        async function generatePrintableBill2(billData) {
            console.log('generatePrintableBill clicked');
            console.log('billData:', billData);

            // Open bill in new window
            const billWindow = window.open('../../order_bill/order_bill.html', '_blank');

            var billDataOrderId2;
            await getOrderById(billData.order_id);
            console.log('billDataOrderId:', billDataOrderId2);

            billWindow.onload = function () {
                // Populate bill data
                const doc = billWindow.document;

                console.log('billData:', billData.bill_no);

                // Basic Info
                doc.getElementById('bill-number').textContent = '';
                doc.getElementById('bill-date').textContent = new Date(billData.created_at).toLocaleDateString();
                doc.getElementById('table-number').textContent = '';

                // Customer Details
                doc.getElementById('customer-name').textContent = '';
                doc.getElementById('customer-email').textContent = '';
                doc.getElementById('customer-phone').textContent = '';

                // Bill Items
                const billItemsBody = doc.getElementById('bill-items-body');
                billItemsBody.innerHTML = ''; // Clear sample data

                // Add items
                billData.items.forEach(item => {
                    const row = doc.createElement('tr');
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${(item.quantity * item.price).toFixed(2)}</td>
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
                        <td>${billData.total_amount.toFixed(2)}</td>
                    </tr>
                    <tr class="bill-total discount">
                        <td></td>
                        <td>Discount</td>
                        <td></td>
                        <td>${billData.discount_amount.toFixed(2)}</td>
                    </tr>
                    <tr class="bill-total gst">
                        <td></td>
                        <td>Central GST</td>
                        <td>2.50%</td>
                        <td>${(billData.gst_amount / 2).toFixed(2)}</td>
                    </tr>
                    <tr class="bill-total gst">
                        <td></td>
                        <td>State GST</td>
                        <td>2.50%</td>
                        <td>${(billData.gst_amount / 2).toFixed(2)}</td>
                    </tr>
                    <tr class="bill-total net-amount">
                        <td></td>
                        <td>Net Amount</td>
                        <td class="inr-symbol">INR ₹</td>
                        <td>${billData.net_amount.toFixed(2)}</td>
                    </tr>
                    <tr class="bill-total amount-in-words">
                        <td>Amount in Words (INR) :</td>
                        <td colspan="3">${numberToWords(billData.net_amount)} Rupees Only</td>
                    </tr>
                `;
                billItemsBody.insertAdjacentHTML('beforeend', totalsHTML);

                // KOT and Cashier info
                doc.querySelector('.kot-nos').textContent = billData.kot_numbers.join(', ');
                doc.querySelector('.cashier-name').textContent = 'Cashier: ' + billData.cashier_name;
                doc.querySelector('.cashier-date').textContent = new Date(billData.created_at).toLocaleString();

                // Trigger print
                setTimeout(() => {
                    billWindow.print();
                }, 500);
            };


            async function getOrderById(billDataOrderId) {
                const option = {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + getCookie('access_token'),
                        'Content-Type': 'application/json'
                    }
                }
                const url = `${baseURL}orders/order/${billDataOrderId}/`;
                await refreshAccessToken2(url, option)
                    // .then(response => response.json())
                    .then(data => {
                        console.log('Data:', data);
                        console.table(data);
                        billDataOrderId2 = data;
                        return data;
                    })
                    .catch(error => {
                        console.log('Error fetching order data:', error);
                    })
            }
        }

        async function generatePrintableBill3(billData) {
            try {
                // Get order data first
                const orderData = await getOrderById(billData.order_id);
                console.log('Order Data:', orderData);

                // Then open the bill window and set up the load handler
                const billWindow = window.open('../../order_bill/order_bill.html', '_blank');

                billWindow.onload = function () {
                    // Add number-to-words script
                    const script = billWindow.document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/number-to-words';
                    script.onload = function () {
                        // Use orderData here to populate the bill
                        populateBillData(billData, orderData, billWindow);
                    };
                    billWindow.document.head.appendChild(script);
                };

            } catch (error) {
                console.error('Error in generatePrintableBill:', error);
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
                await refreshAccessToken2(url, option)
                    // .then(response => response.json())
                    .then(data => {
                        console.log('Data:', data);
                        console.table(data);
                        billDataOrderId2 = data;
                        return data;
                    })
                    .catch(error => {
                        console.log('Error fetching order data:', error);
                    })
            }
        }

        function populateBillData3(billData, orderData, billWindow) {
            const doc = billWindow.document;

            // Basic Info
            doc.getElementById('bill-number').textContent = billData.bill_number;
            doc.getElementById('bill-date').textContent = new Date(billData.created_at).toLocaleDateString();
            doc.getElementById('table-number').textContent = orderData.tables?.[0] || '-';

            // Customer Details
            doc.getElementById('customer-name').textContent = `${orderData.customer.first_name} ${orderData.customer.last_name}`;
            doc.getElementById('customer-email').textContent = orderData.customer.email;
            doc.getElementById('customer-phone').textContent = orderData.customer.phone;

            // Rest of your bill population code...

            // Trigger print after a short delay
            setTimeout(() => {
                billWindow.print();
            }, 500);
        }

        // Helper function to convert number to words
        function numberToWords2(number) {
            const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

            if (number === 0) return 'Zero';

            function convertLessThanThousand(n) {
                if (n === 0) return '';

                if (n < 10) return ones[n];

                if (n < 20) return teens[n - 10];

                if (n < 100) {
                    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
                }

                return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertLessThanThousand(n % 100) : '');
            }

            const num = Math.floor(number);
            const decimal = Math.round((number - num) * 100);

            let result = '';

            if (num >= 100000) {
                result += convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh ';
                num %= 100000;
            }

            if (num >= 1000) {
                result += convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand ';
                num %= 1000;
            }

            result += convertLessThanThousand(num);

            return result.trim();
            // console.warn(`Result: ${result.trim()}`);

            // return capitalizeFirstLetter(result.trim());
        }

        // 

        async function getOrderById2(billDataOrderId) {
            const option = {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('access_token'),
                    'Content-Type': 'application/json'
                }
            }
            const url = `${baseURL}orders/order/${billDataOrderId}/`;
            await refreshAccessToken2(url, option)
                // .then(response => response.json())
                .then(data => {
                    console.log('Data:', data);
                    console.table(data);
                    billDataOrderId2 = data;
                    return data;
                })
                .catch(error => {
                    console.log('Error fetching order data:', error);
                })
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

        // Usage in generatePrintableBill
        async function generatePrintableBill3(billData) {

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
                cssLink.href = './../../order_bill/order_bill.css';
                doc.head.appendChild(cssLink);



                function generateBillHeader() {
                    return `
                        <header class="bill-header">
                            <div class="header-content">
                                <div class="logo">
                                    <img src="./../../order_bill/logo.png" alt="Restaurant Logo" class="restaurant-logo">
                                </div>
                                <div class="restaurant-details">
                                    <h2>Hotel Iswar & Family Restaurant</h2>
                                    <p>Address: Central Road, Silchar, Assam, 788001</p>
                                    <p>Contact: +91 38423 19540 / +91 6003704064</p>
                                    <p>Website: www.hoteliswar.in</p>
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
                                        <th>Total</th>
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
                                <div class="fssai">FSSAI LICENSE NO: 1234567890</div>
                            </div>
        
                            <div class="bill-footer-text">
                                * * * Thank you for Dining with us! * * *
                            </div>
                        </footer>
                    `;
                }

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

        async function populateBillData3(billWindow, billData, orderData) {

            console.warn(orderData);

            const doc = billWindow.document;

            // Transform food items data
            const allFoodList = await localforage.getItem('allFoodList') || [];
            const orderBillItems = orderData.food_items.map((foodId, index) => {
                const foodItem = allFoodList.find(item => item.id === foodId);
                return {
                    foodId: foodId,
                    itemName: foodItem ? foodItem.name : 'Unknown Item',
                    quantity: orderData.quantity[index],
                    rate: foodItem ? parseFloat(foodItem.price) : 0,
                    total: foodItem ? parseFloat(foodItem.price) * orderData.quantity[index] : 0
                };
            });

            console.log('Order Bill Items:', orderBillItems);
            console.warn(orderBillItems.length);

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
            // orderData.items.forEach(item => {
            //     const row = doc.createElement('tr');
            //     row.innerHTML = `
            //         <td>${item.name}</td>
            //         <td>${item.quantity}</td>
            //         <td>${item.price.toFixed(2)}</td>
            //         <td>${(item.quantity * item.price).toFixed(2)}</td>
            //     `;
            //     billItemsBody.appendChild(row);
            // });

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
            setTimeout(() => {
                billWindow.print();
            }, 500);
        }

        // new 

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
                cssLink.href = './../../order_bill/order_bill.css';
                doc.head.appendChild(cssLink);

                // Add print-specific styles
                const style = doc.createElement('style');
                // style.textContent = `
                //     @media print {
                //         .page-break {
                //             page-break-before: always;
                //         }
                //         .bill-wrapper {
                //             page-break-after: avoid;
                //         }
                //         .page-number {
                //             text-align: center;
                //             margin-top: 10px;
                //             font-size: 12px;
                //             color: #666;
                //         }
                //         .bill-container {
                //             display: flex;
                //             flex-direction: column;
                //             min-height: 100vh;
                //         }
                //         .bill-items {
                //             flex: 1;
                //         }
                //         .bill-footer {
                //             margin-top: auto;
                //         }
                //         .page-subtotal td {
                //             padding-top: 10px;
                //             font-weight: bold;
                //             border-top: 1px solid #ddd;
                //         }
                //     }
                // `;
                doc.head.appendChild(style);

                // Transform food items data
                const allFoodList = await localforage.getItem('allFoodList') || [];
                const orderBillItems = orderData.food_items.map((foodId, index) => {
                    const foodItem = allFoodList.find(item => item.id === foodId);
                    return {
                        foodId: foodId,
                        itemName: foodItem ? foodItem.name : 'Unknown Item',
                        quantity: orderData.quantity[index],
                        rate: foodItem ? parseFloat(foodItem.price) : 0,
                        total: foodItem ? parseFloat(foodItem.price) * orderData.quantity[index] : 0
                    };
                });

                const ITEMS_PER_PAGE = 10;
                const totalPages = Math.ceil(orderBillItems.length / ITEMS_PER_PAGE);

                // Generate content for all pages
                let pagesHTML = '';
                for (let page = 1; page <= totalPages; page++) {
                    pagesHTML += `
                        ${page > 1 ? '<div class="page-break"></div>' : ''}
                        <div class="bill-wrapper">
                            <div class="bill-container">
                                ${generateBillHeader()}
                                ${generateInvoiceSection()}
                                ${generateItemsSection(page, totalPages)}
                                ${generateFooter()}
                            </div>
                        </div>
                    `;
                }

                // Set the HTML content
                doc.body.innerHTML = pagesHTML;

                // Add number-to-words script
                const script = doc.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/number-to-words';
                script.onload = function () {
                    populateBillData(billWindow, billData, orderData, orderBillItems);
                };
                doc.head.appendChild(script);

            } catch (error) {
                console.error('Error in generatePrintableBill:', error);
            }
        }

        function generateBillHeader() {
            return `
                <header class="bill-header">
                    <div class="header-content">
                        <div class="logo">
                            <img src="./../../order_bill/logo.png" alt="Restaurant Logo" class="restaurant-logo">
                        </div>
                        <div class="restaurant-details">
                            <h2>Hotel Iswar & Family Restaurant</h2>
                            <p>Address: Central Road, Silchar, Assam, 788001</p>
                            <p>Contact: +91 38423 19540 / +91 6003704064</p>
                            <p>Website: www.hoteliswar.in</p>
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

        function generateItemsSection(pageNumber, totalPages) {
            return `
                <section class="bill-items">
                    <table>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody id="bill-items-body-${pageNumber}">
                            <!-- Items will be added here -->
                        </tbody>
                    </table>
                    <div class="page-number">Page ${pageNumber} of ${totalPages}</div>
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

        function populateBillData(billWindow, billData, orderData, orderBillItems) {
            const doc = billWindow.document;

            // Basic Info
            doc.getElementById('bill-number').textContent = billData.bill_no;
            doc.getElementById('table-number').textContent = orderData.tables?.[0] || '-';
            doc.getElementById('order-type').textContent = orderData.order_type;
            doc.getElementById('gst-bill-number').textContent = billData.gst_bill_no;

            // Customer Details
            doc.getElementById('customer-name').textContent = `${orderData.customer?.first_name || 'NA'} ${orderData.customer?.last_name || ''}`;
            doc.getElementById('customer-email').textContent = orderData.customer?.email || 'NA';
            doc.getElementById('customer-phone').textContent = orderData.customer?.phone || 'NA';
            doc.getElementById('customer-gstno').textContent = billData?.customer_gst || 'NA';

            // Split items into pages
            const ITEMS_PER_PAGE = 10;
            const totalPages = Math.ceil(orderBillItems.length / ITEMS_PER_PAGE);

            for (let page = 1; page <= totalPages; page++) {
                const startIndex = (page - 1) * ITEMS_PER_PAGE;
                const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, orderBillItems.length);
                const pageItems = orderBillItems.slice(startIndex, endIndex);

                const billItemsBody = doc.getElementById(`bill-items-body-${page}`);

                // Add items for this page
                pageItems.forEach(item => {
                    const row = doc.createElement('tr');
                    row.innerHTML = `
                        <td>${item.itemName}</td>
                        <td>${item.quantity}</td>
                        <td>${item.rate.toFixed(2)}</td>
                        <td>${item.total.toFixed(2)}</td>
                    `;
                    billItemsBody.appendChild(row);
                });

                // Add totals only to the last page
                if (page === totalPages) {
                    const totalsHTML = `
                        <tr><td colspan="4">&nbsp;</td></tr>
                        <tr class="bill-total total">
                            <td colspan="2"></td>
                            <td>Total</td>
                            <td>${billData.total}</td>
                        </tr>
                        <tr class="bill-total discount">
                            <td colspan="2"></td>
                            <td>Discount</td>
                            <td>${billData.discount}</td>
                        </tr>
                        <tr class="bill-total gst">
                            <td colspan="2"></td>
                            <td>CGST (2.50%)</td>
                            <td>${billData.cgst_amount}</td>
                        </tr>
                        <tr class="bill-total gst">
                            <td colspan="2"></td>
                            <td>SGST (2.50%)</td>
                            <td>${billData.sgst_amount}</td>
                        </tr>
                        <tr class="bill-total net-amount">
                            <td colspan="2"></td>
                            <td>Net Amount</td>
                            <td>₹${billData.net_amount}</td>
                        </tr>
                        <tr class="bill-total amount-in-words">
                            <td colspan="4">Amount in Words: 
                                <i>${capitalizeFirstLetter(billWindow.numberToWords.toWords(Math.floor(billData.net_amount)).replace(/-/g, ' '))} Rupees Only</i>
                            </td>
                        </tr>
                    `;
                    billItemsBody.insertAdjacentHTML('beforeend', totalsHTML);
                }
            }

            // Footer info
            doc.querySelector('.kot-nos').textContent = orderData.kot_count || '0';
            doc.querySelector('.name').textContent = billData.cashier_by || '';
            doc.querySelector('.cashier-date').textContent = new Date(billData.created_at).toLocaleString();

            // Trigger print after a short delay
            setTimeout(() => {
                billWindow.print();
            }, 500);
        }

        // Helper function to capitalize first letter
        function capitalizeFirstLetter2(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

    });

    function capitalizeFirstLetter(str) {
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    function getDataEditOrder2(orderId) {

        const option = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
            }
        }

        const url = `${baseURL}orders/order/${orderId}/`;

        refreshAccessToken2(url, option)
            // .then(response => response.json())
            .then(data => {
                console.log('Getting Data with OrderID:', data);
                // alert("Data received with OrderID");

                populateMoreModal(data);
                populateBillContainer(data);
                // coldReload();
            })

            .catch(error => {
                console.log('Error fetching data:', error);
            });
    }

    async function getDataEditOrder(orderId) {
        // get order data from ordersList with orderId as id
        let ordersList = await localforage.getItem('ordersList') || [];
        let orderInfo = ordersList.find(o => o.id == orderId);

        if (orderInfo) {
            populateMoreModal(orderInfo);
            populateBillContainer(orderInfo);
        }

        // return orderInfo;
    }

    function populateMoreModal2(data) {
        // Populate the "more" modal input fields
        document.getElementById('mobile').value = data.phone || '';
        document.getElementById('name').value = data.first_name || '';
        document.getElementById('address').value = data.address_line_1 || '';
        document.getElementById('email').value = data.email || '';

        // Set order type
        const orderTypeButtons = document.querySelectorAll('.type-selectable');
        orderTypeButtons.forEach(button => {
            if (button.textContent.toLowerCase() === data.order_type.replace('_', '-')) {
                button.classList.add('type-selected');
            }
        });

        // Set table or room number based on order type
        const orderTypeOptions = document.querySelector('.order-type-options');
        if (data.order_type === 'dine_in') {
            orderTypeOptions.innerHTML = `<select id="table-select" class="order-type-option-select">
            <option value="${data.table_number}">Table ${data.table}</option>
        </select>`;
        } else if (data.order_type === 'hotel') {
            orderTypeOptions.innerHTML = `<select id="room-select" class="order-type-option-select">
            <option value="${data.table}">Room ${data.table}</option>
        </select>`;
        }
    }

    function populateMoreModal(data) {
        // Populate the "more" modal input fields
        document.getElementById('mobile').value = data.phone || '';
        document.getElementById('mobile-input').value = data.phone || '';
        document.getElementById('name').value = data.customer.first_name || '';
        document.getElementById('lname').value = data.customer.last_name || '';
        document.getElementById('address').value = data.customer.address_line_1 || '';
        document.getElementById('email').value = data.customer.email || '';
        document.getElementById('discount').value = data.discount || '';
        document.getElementById('order-note').value = data.notes || '';

        // Set order type
        const orderTypeButtons = document.querySelectorAll('.type-selectable');
        orderTypeButtons.forEach(button => {
            if (button.textContent.toLowerCase() === data.order_type.replace('_', '-')) {
                button.classList.add('type-selected');
                button.click();
            } else {
                button.classList.remove('type-selected');
            }
        });


        console.warn('Order Type:', data.order_type);
        console.log(`table_number: ${data.table_number}`);

        // Set table or room number based on order type
        if (data.order_type === 'dine_in') {
            const tableSelect = document.getElementById('table-select');
            if (tableSelect) {
                tableSelect.value = data.tables[0];
            }
            document.querySelector('.doneButton').click();
        } else if (data.order_type === 'hotel') {
            const roomSelect = document.getElementById('room-select');
            if (roomSelect) {
                roomSelect.value = data.room;
            }
        }
    }

    function populateBillContainer(orderData) {

        console.log('Populating Bill Container with Order Data:', orderData);
        billItems = []; // Clear existing billItems

        orderData.food_items.forEach((foodId, index) => {
            const foodItem = allFoodItems.find(item => item.id === foodId);
            if (foodItem) {
                const quantity = orderData.quantity[index];
                billItems.push({
                    id: foodId,
                    name: foodItem.name,
                    price: foodItem.price,
                    quantity: quantity
                });
            }
        });

        sendDataToSave();
        renderBillItems();
        updateNetTotal();

    }

    function getSelectedPaymentMethod() {
        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        return selectedPaymentMethod ? selectedPaymentMethod.value : null;
    }

    // Close the settle modal
    document.querySelector('.close-settle').onclick = function () {
        const settleModal = document.getElementById('settleModal');
        const modalContainer = document.querySelector('.modal-container');

        settleModal.classList.remove('show');
        setTimeout(() => {
            modalContainer.style.display = 'none';
            settleModal.style.display = 'none';
        }, 300);
    }

    // Disable buttons
    function disableButtons() {
        const kotBtn = document.querySelector('.kot-btn');
        const holdBtn = document.querySelector('.hold-btn');
        const settleBtn = document.querySelector('.settle-btn');

        // Check if elements exist before disabling
        if (kotBtn) kotBtn.disabled = true;
        if (holdBtn) holdBtn.disabled = true;
        if (settleBtn) settleBtn.disabled = true;

        console.log('Buttons disabled'); // For debugging
    }




});

// const orderbillItems = [
//     {
//         foodId: 1,
//         itemName: 'Item 1',
//         quantity: 2,
//         rate: 100,
//         total: 200
//     },
//     {
//         foodId: 2,
//         itemName: 'Item 2',
//         quantity: 1,
//         rate: 150,
//         total: 150
//     },
//     {
//         foodId: 3,
//         itemName: 'Item 3',
//         quantity: 3,
//         rate: 200,
//         total: 600
//     }
// ]