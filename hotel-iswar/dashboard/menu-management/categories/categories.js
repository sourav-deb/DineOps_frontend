
function addCatgeoryToList(name, description, status, imageSrc, id) {
    const itemsContainer = document.querySelector('.all-list-table-items');

    const itemHTML = `
        <div class="record-row">
            <div class="col-2" id="name">${name}</div>
            <div class="col-3" id="description">${description}</div>
            <div class="col-3" id="status">
                <label class="switch">
                    <input type="checkbox" class="listStatus" id="categoryStatus" ${status === 'enabled' ? 'checked' : ''} disabled>
                    <span class=" slider sliderList round"></span>
                </label>
                <span id="statusDisableText">${capitalizeFirstLetter(status)}</span>

            </div>
            <div class="col-2" id="imagesrc"><img src="${imageSrc}" alt="${name}" width="50"></div>
            <div class="col-2">
                <i class="edit-btnn fa-solid fa-pen-to-square"></i>
                <i class="fa fa-trash delete-btn" onclick=deleteCategory(${id}); aria-hidden="true"></i>
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
        console.log(name, description, status, imageSrc, id);
        openUpdateModal(name, description, status, imageSrc, id);
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
    const url = `${baseURL}foods/categories/${id}/`;
    refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(response => {
            console.log(`Status: ${response.status}`);
        })
        .then(data => {
            console.log('Data:', data);
            getCategoryList();
            alert("Category Deleted Successfully", 'success');
            
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            alert("Category not deleted", 'error');
        });

}

// Open Update Category Modal
function openUpdateModal(name, description, status, imageSrc, id) {
    const modal = document.getElementById('editModal');
    const editName = document.getElementById('editCatgName');
    const editDescription = document.getElementById('editCatgDescription');
    const editStatus = document.getElementById('editCatgStatus');
    const statusModalText = document.getElementById('statusModalText');
    const editImage = document.getElementById('editCatgImg');

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
    // editImage.value = imageSrc;
    statusModalText.textContent = capitalizeFirstLetter(status);


    // if (status === 'enabled') {
    //     editStatus.checked = true;
    //     statusModalText.textContent = 'Enabled';
    // } else {
    //     editStatus.checked = false;
    //     statusModalText.textContent = 'Disabled';
    // }

    if (status === 'enabled') {
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


// Handle form submission for updating item
// document.getElementById('editForm').addEventListener('submit', (e) => {
//     e.preventDefault();
//     // Handle the update logic here
//     // You can access the updated values using the form elements
//     // After updating, close the modal
//     document.getElementById('editModal').style.display = 'none';
// });

// addCatgeoryToList('South Indian', 'Veg', 'Enabled', 'https://via.placeholder.com/150');
// addCatgeoryToList('North Indian', 'Veg', 'Disabled', 'https://via.placeholder.com/150');
// addCatgeoryToList('Chinese', 'Veg', 'Enabled', 'https://via.placeholder.com/150');
// addCatgeoryToList('Italian', 'Veg', 'Disabled', 'https://via.placeholder.com/150');



// document.addEventListener('DOMContentLoaded', function() {
//     const checkbox = document.getElementById('categoryStatus');
//     const statusText = document.getElementById('statusText');

// });

function updateCatgStatus(checkbox) {
    document.getElementById('statusText').textContent = checkbox.checked ? 'Enabled' : 'Disabled';
}

function updateCatgModalStatus(checkbox) {
    document.getElementById('statusModalText').textContent = checkbox.checked ? 'Enabled' : 'Disabled';
}

function updateDisableStatus(checkbox) {
    document.getElementById('statusDisableText').textContent = checkbox.checked ? 'Enabled' : 'Disabled';
}

// API Call GET Category List - Read

// function getCategoryList_notusing() {
//     const option = {
//         method: 'GET',
//         headers: {
//             'Authorization': 'Bearer ' + getCookie('access_token'),
//             'Content-Type': 'application/json'
//         }
//     }

//     const url = 'http://127.0.0.1:8000/api/foods/categories/';

//     refreshAccessToken2(url, option)
//         // .then(response => response.json())
//         .then(data => {
//             console.log('Data:', data);
//             passToList(data);
//         })
//         .catch(error => {
//             console.log('Error fetching data:', error);
//         });

//     function passToList(data) {
//         data.forEach(item => {
//             addCatgeoryToList(item.name, item.description, item.status, '', item.id);
//         });
//     }
// };



// getCategoryList();
// getCategoryListFromStorage();

if (categoryData = getCategoryListFromStorage()) {
    passToCategoryList(categoryData);
} else {
    console.log('No data in storage');
}

function passToCategoryList(data) {
    data.forEach(item => {
        addCatgeoryToList(item.name, item.description, item.status, '', item.id);
    });
}

// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// EventListener to POST Category Items - Create

document.getElementById('add-category').addEventListener('click', function (e) {
    e.preventDefault();

    const catgName = document.querySelector('#catgName').value;
    const catgDescription = document.querySelector('#catgDescription').value;
    const catgStatus = document.querySelector('#catgStatus');
    const catgImg = document.querySelector('#catgImg').value;

    if (catgStatus.checked) {
        var catgStatusText = 'enabled';
        // alert('Status:', statusText);
    } else {
        var catgStatusText = 'disabled';
        // alert('Status:', statusText);
    }

    const catgData = {
        name: catgName,
        description: catgDescription,
        status: catgStatusText,
        image: catgImg
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
            description: catgData.description,
            status: catgData.status,
            image: ''
        })
    }

    const url = `${baseURL}foods/categories/`;

    refreshAccessToken(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('Category:', data);
            console.table(data);
            await Promise.all([getCategoryList()]);
            // addItemToList(data.name, data.price, data.category_id, data.description, '', data.status);
            alert("Category Created Successfully", 'success');
            // coldReload();
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            alert('Category not created ', 'error');
        });
}

// API Call PUT Category Items - Update

document.getElementById('update-category').addEventListener('click', function (e) {
    e.preventDefault();

    const catgId = document.querySelector('#catgId').value;
    const catgName = document.querySelector('#editCatgName').value;
    const catgDescription = document.querySelector('#editCatgDescription').value;
    const catgStatus = document.querySelector('#editCatgStatus');
    const catgImg = document.querySelector('#editCatgImg').value;

    const updatedCatgData = {
        id: catgId,
        name: catgName,
        description: catgDescription,
        status: catgStatus.checked ? 'enabled' : 'disabled',
        image: catgImg
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


        const url = `${baseURL}foods/categories/${updatedCatgData.id}/`

        // Send a PATCH request to update the item

        refreshAccessToken(url, option)
            // .then(response => response.json())
            .then(async data => {
                console.log("Category Updated Successfully")
                await Promise.all([getCategoryList()]);
                console.log('Category updated successfully:', data);
                alert('Category updated successfully', 'success');
                // coldReload();
                // Optionally, update the UI or show a success message
            })
            .catch(error => {
                console.error('Error updating item:', error);
                alert('Category not updated', 'error');
                // Handle the error, show an error message to the user
            });
    }

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