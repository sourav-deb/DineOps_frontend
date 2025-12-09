
// Putting Options in category list

// Putting Options in category list
async function putCategoryInSelect() {
    let selectCategory = document.getElementById('new-item-catg');     // Create
    const categoryData = await getServiceCategoryListFromStorage() || [];
    console.log('Items.js called........')
    // console.table(categoryData);

    // Insert options in selectCategory
    if (selectCategory) {
        selectCategory.innerHTML = '<option value="" disabled selected>Select Category</option>';
        categoryData.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            selectCategory.appendChild(option);
        });
    }


    // Put in Modal Select
    let editModalCategory = document.getElementById('editCategory');  // Modal
    const categoryDataModal = await getServiceCategoryListFromStorage() || [];
    console.log('Items.js called........')
    // console.table(categoryData);

    // Insert options in selectCategory
    if (editModalCategory) {
        editModalCategory.innerHTML = '<option value="" disabled selected>Select Category</option>';
        categoryDataModal.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            editModalCategory.appendChild(option);
        });
    }

}

putCategoryInSelect();

// Add New Item to List
async function addItemToList(name, price, categoryid, description, status, id) {
    // console.log(name, price, categoryid, description, status, id);
    const itemsContainer = document.querySelector('.all-list-table-items');
    if (!itemsContainer) return;

    // get category name from category id from local storage serviceList
    const categoryData = await localforage.getItem('serviceCategoryList') || [];
    const category = categoryData.find(cat => cat.id === categoryid);
    const categoryName = category ? category.name : 'Unknown';
    // console.log(categoryName); 

    const itemHTML = `
        <div class="record-row">
            <div class="col-2" id="name">${name}</div>
            <div class="col-1" id="price">${price}</div>
            <div class="col-2" id="category">${categoryName}</div>
            <div class="col-2" id="description">${description}</div>
            <div class="col-2" id="itemStatus">${status}</div>
            <div class="col-1">
                <i class="edit-btn fa-solid fa-pen-to-square"></i>
                <i class="fa fa-trash delete-btn" onclick=deleteFood(${id}); aria-hidden="true"></i>
            </div>
        </div>
        
    `;

    itemsContainer.insertAdjacentHTML('beforeend', itemHTML);

    // Get the last added record-row
    const lastAddedRow = itemsContainer.lastElementChild;

    // Add event listener to the edit button of the last added row
    const editButton = lastAddedRow.querySelector('.edit-btn');
    editButton.addEventListener('click', () => {
        openEditModal(name, price, categoryid, description, status, id);
    });
}


// API Call to delete food item - DELETE
function deleteFood(id) {
    const option = {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }
    const url = `${baseURL}foods/fooditems/${id}/`;
    refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(data => {
            console.log('Data Deleted:', data);
            getFooditems();
            alert('Item Deleted Successfully');
            coldReload();
        })
        .catch(error => {
            console.log('Error fetching data:', error);
        });

}

// Local Storage Call to get Category ID by Category Name from localStorage
// Deprecated/Unused or needs async if used.
// function getCatgIdByName(name) { ... } 

// Open Update Modal
async function openEditModal(name, price, categoryId, description, status, id) {
    const modal = document.getElementById('editModal');
    const editName = document.getElementById('editName');
    const editPrice = document.getElementById('editPrice');
    const editCategory = document.getElementById('editCategory');
    const editDescription = document.getElementById('editDescription');
    const editStatus = document.getElementById('editStatus');
    const editStatusText = document.getElementById('statusModalText');

    // Check if itemId input already exists
    let itemIdInput = modal.querySelector('#itemId');
    if (itemIdInput) {
        // If it exists, update its value
        itemIdInput.value = id;
    } else {
        // If it doesn't exist, create a new one
        itemIdInput = document.createElement('input');
        itemIdInput.type = 'hidden';
        itemIdInput.name = 'itemId';
        itemIdInput.id = 'itemId';
        itemIdInput.value = id;
        modal.appendChild(itemIdInput);
    }

    editName.value = name;
    editPrice.value = price;

    // categoryId is passed directly now, checking if we need to fetch name or just set value
    // Assuming editCategory is the Select element populated with IDs
    editCategory.value = categoryId;

    // Legacy support if categoryId passed was a name (unlikely based on usage)
    if (!editCategory.value && typeof categoryId === 'string') {
        // Attempt to find by name if setting by ID failed
        const categoryData = await getServiceCategoryListFromStorage() || [];
        const cat = categoryData.find(c => c.name === categoryId);
        if (cat) editCategory.value = cat.id;
    }


    editDescription.value = description;
    editStatusText.textContent = status;


    console.log(status);

    if (status === true || status === 'true') {
        console.log(status);
        editStatus.checked = true;
        // var statusText = 'enabled';
    } else {
        // var statusText = 'disabled';
        editStatus.checked = false;
    }

    // Pre-select logic is handled by assigning .value above, but double check
    // const categoryOptions = editCategory.options; ...

    modal.style.display = 'block';
}

// Close modal when clicking on the close button or outside of the modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        document.getElementById('editModal').style.display = 'none';
    }
});


function updateModalStatus(checkbox) {
    document.getElementById('statusModalText').textContent = checkbox.checked ? 'True' : 'False';
}


// PATCH API call after click(Update button)
document.getElementById('update-item').addEventListener('click', function (e) {
    e.preventDefault();
    // Get the item details from the form
    const itemId = document.getElementById('itemId').value;
    const itemName = document.getElementById('editName').value;
    const itemPrice = document.getElementById('editPrice').value;
    const itemDescription = document.getElementById('editDescription').value;
    const itemCategory = document.getElementById('editCategory').value;
    const itemStatus = document.getElementById('editStatus');

    // Create an object with the updated item details
    const updatedItem = {
        name: itemName,
        price: itemPrice,
        description: itemDescription,
        category_id: itemCategory,
        status: itemStatus.checked ? true : false,
        id: itemId,
    };

    console.table(updatedItem);

    updateItem(updatedItem);

    function updateItem(updatedItem) {
        option = {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: updatedItem.name,
                price: updatedItem.price,
                description: updatedItem.description,
                category: updatedItem.category_id,
                status: updatedItem.status,
                veg: updatedItem.veg
            })
        }

        const url = `${baseURL}hotel/services/${updatedItem.id}/`

        // Send a PATCH request to update the item

        refreshAccessToken2(url, option)
            // .then(response => response.json())
            .then(data => {
                console.log('Service updated successfully:', data);
                return getServiceList();   // Return the promise from getServiceList()
            })
            .then(() => { // This will execute after getServiceList() completes
                alert("Food Service Created Successfully", 'success');
                document.querySelector('.close').click();
                coldReload();
            })
            .catch(error => {
                console.error('Error updating Service:', error);
                alert('Service not updated', 'error');
            });
    }
});




// getFooditems();
// getAllFoodListFromStorage();


async function initServiceList() {
    const foodData = await getServiceListFromStorage();
    if (foodData) {
        console.log('Food Data:', foodData);
        await passToFoodList(foodData);
    } else {
        console.log('No data in storage');
    }
}
initServiceList();

async function passToFoodList(data) {
    for (const item of data) {
        // console.log(item);
        await addItemToList(item.name, item.price, item.category, item.description, item.status, item.id);
    }
}

// API Call POST Food Items - Create
document.getElementById('add-item').addEventListener('click', function (e) {
    e.preventDefault();

    const itemName = document.querySelector('#new-item-name').value;
    const itemPrice = document.querySelector('#new-item-price').value;
    const itemCategory = document.querySelector('#new-item-catg').value;
    const itemDescription = document.querySelector('#new-item-desc').value;
    const itemStatus = document.querySelector('#itemStatus');

    // Status Enabled - Disabled
    if (itemStatus.checked === true) {
        var statusText = true;
        // alert('Status:', statusText);
    } else {
        var statusText = false;
        // alert('Status:', statusText);
    }


    const itemData = {
        name: itemName,
        price: itemPrice,
        category: itemCategory,
        description: itemDescription,
        status: statusText,
    };

    createFood(itemData);
});

// Change Checkbox text on Checkbox Change on Modal
function updateStatus(checkbox) {
    document.getElementById('statusText').textContent = checkbox.checked ? 'True' : 'False';
}


// API Call POST Food Items - Create
function createFood(itemData) {
    console.log(itemData);
    const option = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            category: itemData.category,
            status: itemData.status
        })
    }

    const url = `${baseURL}hotel/services/`;

    refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(data => {
            console.log('Data:', data);
            console.table(data);
            getServiceList();
            alert("Service Created Successfully", 'success');
            coldReload();
        })

        .catch(error => {
            console.log('Error fetching data:', error);
            alert('Service not created', 'error');
        });
}


// Function to capitalize the first letter of a string
function capitalizeFirstLetter2(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
// Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    if (typeof string !== 'string') {
        console.error('Input is not a string:', string); // Log an error if input is not a string
        return ''; // Return an empty string or handle as needed
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

function coldReload() {
    const page = document.getElementById('nav-item-services');
    if (page) {
        page.click();
    }
    else {
        page.click();
    }
}

function refreshCategoryList() {
    const button = document.querySelector('#refresh-btn');
    button.classList.add('spinning');
    console.log('Refreshing Category List');

    // Call your existing category fetch function here
    getServiceList()
        .then(() => {
            console.log('Category List Refreshed');
            // Remove spinning class after refresh
            setTimeout(() => {
                button.classList.remove('spinning');
            }, 1000);
        })
        .catch(error => {
            console.error('Error refreshing categories:', error);
            button.classList.remove('spinning');
        });


}

document.getElementById('refresh-btn').addEventListener('click', refreshCategoryList);