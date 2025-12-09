
function addCatgeoryToList(name, description, status, id) {
    const itemsContainer = document.querySelector('.all-list-table-items');

    if (status === true) {
        var statusText = 'True';
    } else {
        var statusText = 'False';
    }

    const itemHTML = `
        <div class="record-row">
            <div class="col-2" id="name">${name}</div>
            <div class="col-3" id="description">${description}</div>
            <div class="col-3" id="status">
                <label class="switch">
                    <input type="checkbox" class="listStatus" id="categoryStatus" ${status === true ? 'checked' : ''} disabled>
                    <span class=" slider sliderList round"></span>
                </label>
                <span id="statusDisableText">${statusText}</span>

            </div>
            <div class="col-2">
                <i class="edit-btnn fa-solid fa-pen-to-square"></i>
                <i class="fa fa-trash delete-btn"  aria-hidden="true" onclick="deleteCategory(${id})"></i>
            </div>
        </div>
        
    `;

    imageSrc = 'blank';

    itemsContainer.insertAdjacentHTML('beforeend', itemHTML);

    // Get the last added record-row
    const lastAddedRow = itemsContainer.lastElementChild;

    // Add event listener to the edit button of the last added row
    const editButton = lastAddedRow.querySelector('.edit-btnn');
    editButton.addEventListener('click', () => {
        console.log("Edit button clicked");
        console.log(name, description, status, id);

        // Warning message
        alert('Servcie Category Update Not Available currently.');

        // Because of no PATCH Call
        // openUpdateModal(name, description, status, id); 
    });
}

// API Call to delete category - DELETE
function deleteCategory(id) {
    const option = {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }
    const url = `${baseURL}hotel/service-categories/${id}/`;
    refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(data => {
            console.log('Service Category Data:', data);
            getServiceCategoryList();
            alert("Service Category Deleted", 'success');
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            alert('Service Category not deleted', 'error');
        });

}

// Open Update Category Modal
function openUpdateModal(name, description, status, id) {
    const modal = document.getElementById('editModal');
    const editName = document.getElementById('editCatgName');
    const editDescription = document.getElementById('editCatgDescription');
    const editStatus = document.getElementById('editCatgStatus');
    const statusModalText = document.getElementById('statusModalText');

    // Check if itemId input already exists
    let catgIdInput = modal.querySelector('#catgId');
    if (catgIdInput) {
        // If it exists, update its value
        catgIdInput.value = id;
    } else {
        const catgId = document.createElement('input');
        catgId.type = 'hidden';
        catgId.id = 'catgId';
        catgId.value = id;
        modal.appendChild(catgId);
    }

    console.log('Name in Open Update Modal:', name);
    console.log('ID in Open Update Modal:', id);

    editName.value = name;
    editDescription.value = description;
    statusModalText.textContent = status;


    // if (status === 'enabled') {
    //     editStatus.checked = true;
    //     statusModalText.textContent = 'Enabled';
    // } else {
    //     editStatus.checked = false;
    //     statusModalText.textContent = 'Disabled';
    // }

    if (status === true) {
        console.log(status);
        editStatus.checked = true;
        // var statusText = 'enabled';
    } else {
        // var statusText = 'disabled';
    }

    modal.style.display = 'block';
}

// Close modal when clicking on the close button or outside the modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        document.getElementById('editModal').style.display = 'none';
    }
});


function updateCatgStatus(checkbox) {
    document.getElementById('statusText').textContent = checkbox.checked ? 'True' : 'False';
}

function updateCatgModalStatus(checkbox) {
    document.getElementById('statusModalText').textContent = checkbox.checked ? 'True' : 'False';
}

function updateDisableStatus(checkbox) {
    document.getElementById('statusDisableText').textContent = checkbox.checked ? 'True' : 'False';
}


// getCategoryList();
// getCategoryListFromStorage();

// Create getServiceCategoryListFromStorage() in common.js

// Create getServiceCategoryListFromStorage() in common.js
async function loadServiceCategories() {
    let categoryData = await getServiceCategoryListFromStorage();
    if (categoryData) {
        passToCategoryList(categoryData);
    } else {
        console.log('No data in storage');
    }
}
loadServiceCategories();

function passToCategoryList(data) {
    data.forEach(item => {
        addCatgeoryToList(item.name, item.description, item.status, item.id);
    });
}

// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// EventListener to POST Category Items - Create
document.getElementById('add-services').addEventListener('click', function (e) {
    e.preventDefault();

    const catgName = document.querySelector('#catgName').value;
    // const subCatgName = document.querySelector('#subCatgName').value;
    const catgDescription = document.querySelector('#catgDescription').value;
    const catgStatus = document.querySelector('#catgStatus');

    if (catgStatus.checked) {
        var catgStatusText = true;
        // alert('Status:', statusText);
    } else {
        var catgStatusText = false;
        // alert('Status:', statusText);
    }

    const catgData = {
        name: catgName,
        // sub_category: subCatgName,
        description: catgDescription,
        status: catgStatusText
    };
    console.table(catgData);

    createCategory(catgData);
});

// API Call POST Food Items - Create
function createCategory(catgData) {
    console.log(catgData);
    const option = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: catgData.name,
            // sub_category: catgData.sub_category,
            description: catgData.description,
            status: catgData.status
        })
    }

    const url = `${baseURL}hotel/service-categories/`;

    refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('Service Category:', data);
            console.table(data);
            await Promise.all([getServiceCategoryList()]);
            alert("Service Category Created Successfully", 'success');
            // coldReload();
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            alert('Service Category not created', 'error');
        });
}

// API Call PATCH Category Items - Update 
// Here correct ID is update-category which is removed because no PATCH
document.getElementById('no-patch').addEventListener('click', function (e) {
    e.preventDefault();

    const catgId = document.querySelector('#catgId').value;
    const catgName = document.querySelector('#editCatgName').value;
    const catgDescription = document.querySelector('#editCatgDescription').value;
    const catgStatus = document.querySelector('#editCatgStatus');

    const updatedCatgData = {
        id: catgId,
        name: catgName,
        description: catgDescription,
        status: catgStatus.checked ? true : false
    };

    console.table(updatedCatgData);

    updatedCatg(updatedCatgData);

    function updatedCatg(updatedCatgData) {
        option = {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: updatedCatgData.name,
                description: updatedCatgData.description,
                status: updatedCatgData.status
            })
        }

        console.log(updatedCatgData.id);
        console.log(catgId);
        console.log(updatedCatgData.status);


        const url = `${baseURL}hotel/service-categories/${updatedCatgData.id}/`

        // Send a PATCH request to update the item

        refreshAccessToken2(url, option)
            // .then(response => response.json())
            .then(async data => {
                console.log("Category Updated Successfully")
                await Promise.all([getServiceCategoryList()]);
                console.log('Category updated successfully:', data);
                alert('Category updated successfully:', data);
                coldReload();
                // Optionally, update the UI or show a success message
            })
            .catch(error => {
                console.error('Error updating item:', error);
                alert('Category not updated ', error);
                // Handle the error, show an error message to the user
            });
    }

});

document.getElementById('update-category').addEventListener('click', function (e) {
    e.preventDefault();
    alert('Servcie Category Update Not Available currently.');
});


function coldReload() {
    const page = document.getElementById('nav-item-categories');
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
    getServiceCategoryList()
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