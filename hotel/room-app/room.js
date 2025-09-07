// const openRoomModal = document.getElementById('openAddModal');
// const hotelArea = document.getElementById('hotel-content');
// hotelArea.addEventListener('DOMContentLoaded', function (e) {
//     e.preventDefault();
//     console.log('hotelArea loaded');
// })


document.addEventListener('click', function (e) {
    if (e.target.id === 'openAddModal') {
        showAddModal();
    }
});

// Show Add Room modal
function showAddModal() {

    resetRoomForm();

    const modal = document.getElementById('roomModal');
    // const modalBody = modal.querySelector('.modal-body');
    setTimeout(() => modal.classList.add('show'), 10);

    // modalBody.innerHTML = modalContent;

    modal.style.display = 'block';
}

function resetRoomForm() {

    document.querySelector('.model-content-title').textContent = 'Add Room';
    const actionBtn = document.querySelector('.add-room-save-btn');
    actionBtn.value = 'Submit';
    actionBtn.id = 'add-room-save-btn';

    
    // Reset all input fields
    document.getElementById('roomNumber').value = '';
    document.getElementById('roomPrice').value = '';
    document.getElementById('roomType').value = '';
    document.getElementById('bedType').value = '';
    document.getElementById('roomStatus').value = '';
    
    // Uncheck all amenities checkboxes
    const amenityCheckboxes = document.querySelectorAll('input[name="amenities"]');
    amenityCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Close Add Modal
document.querySelector('.close').onclick = function () {
    const modal = document.getElementById('roomModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

// add images

// let uploadedImages = [];

// document.getElementById('roomImage').addEventListener('change', function (event) {
//     const files = event.target.files;

//     for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         const reader = new FileReader();

//         reader.onload = function (e) {
//             uploadedImages.push(e.target.result);
//             updateImagePreview();
//         }

//         reader.readAsDataURL(file);
//     }
// });

function updateImagePreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = ''; // Clear existing previews

    uploadedImages.forEach((imageSrc, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-container';

        const img = document.createElement('img');
        img.src = imageSrc;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'x';
        removeBtn.onclick = function () {
            uploadedImages.splice(index, 1);
            updateImagePreview();
        };

        imgContainer.appendChild(img);
        imgContainer.appendChild(removeBtn);
        preview.appendChild(imgContainer);
    });
}

renderRoomData();

// Get All Rooms from local storage and put in Table
function renderRoomData() {
    console.log('renderRoomData');
    const roomList = JSON.parse(localStorage.getItem('roomsList')) || [];
    console.log(roomList);

    const appendRoom = document.querySelector('.append-all-room');

    // for each item in roomList
    roomList.forEach(room => {

        let roomTypeValue = '';

        if(room.room_type == 'deluxe'){
            roomTypeValue = 'Deluxe AC';
        } else if (room.room_type == 'suite') {
            roomTypeValue = 'Suite AC';
        } else if (room.room_type == 'standard' || room.room_type == 'Standard') {
            roomTypeValue = 'Standard AC';
        } else if (room.room_type == 'super-deluxe') {
            roomTypeValue = 'Super Deluxe AC';
        } else if (room.room_type == 'standard-nonac') {
            roomTypeValue = 'Standard Non AC';
        } else {
            roomTypeValue = 'NA';
        }

        if(room.beds == 'double'){
            bedTypeValue = 'Double Bed';
        } else if (room.beds == 'double-separated') {
            bedTypeValue = 'Double Bed (Separated)';
        } else if (room.beds == 'king') {
            bedTypeValue = 'King Size Bed (Front View)';
        }

        const roomRow = document.createElement('div');
        roomRow.classList.add('room-list-table');
        roomRow.classList.add('room-row');
        const roomNumber = document.createElement('div');
        roomNumber.classList.add('col-2');
        roomNumber.textContent = room.room_number;

        const roomPrice = document.createElement('div');
        roomPrice.classList.add('col-2');
        roomPrice.textContent = room.price;

        const roomType = document.createElement('div');
        roomType.classList.add('col-2');
        roomType.textContent = roomTypeValue

        // const description = document.createElement('div');
        // description.classList.add('col-2');
        // description.textContent = room.description;

        const bedType = document.createElement('div');
        bedType.classList.add('col-3');
        bedType.textContent = bedTypeValue;

        const actions = document.createElement('div');
        actions.classList.add('col-1');
        actions.innerHTML = `<i class="fas fa-eye view-room-eye" data-room-id="${room.id}"></i>`;
        actions.addEventListener('click', function () {
            // alert('View button clicked');
            viewRoomModal(room.id);
        });
        // actions.textContent = 'View';


        roomRow.appendChild(roomNumber);
        roomRow.appendChild(roomPrice);
        roomRow.appendChild(roomType);
        // roomRow.appendChild(description);
        roomRow.appendChild(bedType);
        roomRow.appendChild(actions);
        appendRoom.appendChild(roomRow);
    })
}

function viewRoomModal(roomid) {
    // Change Heading and Button
    document.querySelector('.model-content-title').textContent = 'View Room';
    const actionBtn = document.querySelector('.add-room-save-btn');
    actionBtn.value = 'Update';
    actionBtn.id = 'update-room-btn';

    console.log('viewRoomModal', roomid);
    // Get roomsList from localstorage and fetch records with roomid
    const roomsList = JSON.parse(localStorage.getItem('roomsList')) || [];
    const roomData = roomsList.find(room => room.id === roomid);
    console.log('roomData', roomData);

    // Open the modal and display the room data
    const modal = document.getElementById('roomModal');
    modal.style.display = 'block';
    modal.classList.add('show');

    // Display room data in modal
    const roomNumber = document.getElementById('roomNumber');
    roomNumber.value = roomData.room_number;

    const roomPrice = document.getElementById('roomPrice');
    roomPrice.value = roomData.price;

    const roomType = document.getElementById('roomType');
    roomType.value = roomData.room_type;

    const roomBedType = document.getElementById('bedType');
    roomBedType.value = roomData.beds;

    const roomStatus = document.getElementById('roomStatus');
    roomStatus.value = roomData.status;

    // const roomImages = document.getElementById('roomImages');
    // roomImages.value = roomData.images;

    // Description is amenities which stored as concatatenated checkbox values

    // const roomAmenities = document.getElementById('amenities-container');

    // Handle amenities checkboxes
    // const amenities = roomData.description.split(',').map(item => item.trim());
    // const checkboxes = document.querySelectorAll('input[name="amenities"]');

    // checkboxes.forEach(checkbox => {
    // checkbox.checked = amenities.includes(checkbox.value);
    // });

    const amenityCheckboxes = document.querySelectorAll('input[name="amenities"]');

    // Check boxes that match values in roomData.amenities
    amenityCheckboxes.forEach(checkbox => {
        if (roomData.amenities && roomData.amenities.includes(checkbox.value)) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;  // Optional: uncheck others
        }
    });


    updateRoomModal();




}

function updateRoomModal() {
    document.getElementById('update-room-btn').addEventListener('click', function (e) {
        e.preventDefault();
        if (e.target.id === 'update-room-btn') {
            const roomNumber = document.getElementById('roomNumber').value;
            const roomPrice = document.getElementById('roomPrice').value;
            const roomType = document.getElementById('roomType').value;
            const roomBedType = document.getElementById('bedType').value;
            const roomStatus = document.getElementById('roomStatus').value;
            const roomDescription = document.querySelectorAll('input[name="amenities"]:checked');
            const selectedAmenities = Array.from(roomDescription).map(cb => cb.value);

            const roomData = {
                room_number: roomNumber,
                price: roomPrice,
                room_type: roomType,
                beds: roomBedType,
                status: roomStatus,
                amenities: selectedAmenities,
            }

            // const formData = new FormData();
            // formData.append('room_number', roomNumber);
            // formData.append('price', roomPrice);
            // formData.append('room_type', roomType);
            // formData.append('beds', roomBedType);
            // formData.append('status', roomStatus);
            // formData.append('description', selectedAmenities);

            // console.log('FormData entries:');
            // for (let [key, value] of formData.entries()) {
            //     console.log(key, value);
            // }

            // const formDataObj = Object.fromEntries(formData.entries());
            // console.log('FormData as object:', formDataObj);

            updateRoom(roomData);
            // updateRoom(formData);
            document.querySelector('.close').click();

            function updateRoom(roomData) {
                // find id for roomData from local storage
                const roomsList = JSON.parse(localStorage.getItem('roomsList')) || [];
                const roomId = roomsList.find(room => room.room_number === roomData.room_number).id;
                showLoading();

                const url = `${baseURL}hotel/rooms/${roomId}/`;
                const options = {
                    method: 'PATCH',
                    headers: {
                        'Authorization': 'Bearer ' + getCookie('access_token'),
                        'Content-Type': 'application/json'
                        // Remove 'Content-Type' header when sending FormData
                    },
                    body: JSON.stringify(roomData),
                    // body: roomData,
                };
                console.log(roomData);
                refreshAccessToken2(url, options)
                    // .then(response => response.json())
                    .then(data => {
                        console.log('Data:', data);
                        console.table(data);
                        alert("Room Updated Successfully");
                        getRoomsData();
                        return getRoomsData();
                    })
                    .then(() => {
                        alert("Room Updated Successfully");
                        document.querySelector('.append-all-room').innerHTML = '';
                        
                        // update the local storage roomsList
                        const roomsList = JSON.parse(localStorage.getItem('roomsList')) || [];
                        const roomIndex = roomsList.findIndex(room => room.id === roomData.id);
                        roomsList[roomIndex] = roomData;
                        localStorage.setItem('roomsList', JSON.stringify(roomsList));
                        
                        hideLoading();
                        renderRoomData();
                    })
                    .catch(error => {
                        console.log('Error fetching data:', error);
                        hideLoading();
                    });
            }
        }
    });
}

// const updateRoomModal = document.getElementById('update-room-btn');

// Update Room
// if (updateRoomModal) {
//     document.getElementById('update-room-btn').addEventListener('click', function (e) {
//         e.preventDefault();
//         if (e.target.id === 'update-room-btn') {
//             const roomNumber = document.getElementById('roomNumber').value;
//             const roomPrice = document.getElementById('roomPrice').value;
//             const roomType = document.getElementById('roomType').value;
//             const roomBedType = document.getElementById('bedType').value;
//             const roomStatus = document.getElementById('roomStatus').value;
//             const roomDescription = document.querySelectorAll('input[name="amenities"]:checked');
//             const selectedAmenities = Array.from(roomDescription).map(cb => cb.value);

//             const formData = new FormData();
//             formData.append('room_number', roomNumber);
//             formData.append('price', roomPrice);
//             formData.append('room_type', roomType);
//             formData.append('beds', roomBedType);
//             formData.append('status', roomStatus);
//             formData.append('description', selectedAmenities);

//             console.log('FormData entries:');
//             for (let [key, value] of formData.entries()) {
//                 console.log(key, value);
//             }

//             const formDataObj = Object.fromEntries(formData.entries());
//             console.log('FormData as object:', formDataObj);

//             updateRoom(formData);
//             document.querySelector('.close').click();

//             function updateRoom(roomData) {
//             }
//         }
//     });
// }


// Add New Room
document.getElementById('add-room-save-btn').addEventListener('click', function (e) {
    e.preventDefault();
    if (e.target.id === 'add-room-save-btn') {
        const roomNumber = document.getElementById('roomNumber').value;
        const roomPrice = document.getElementById('roomPrice').value;
        const roomType = document.getElementById('roomType').value;
        const roomBedType = document.getElementById('bedType').value;
        const roomStatus = document.getElementById('roomStatus').value;
        // const roomDescription = document.getElementById('amenities').value;
        const roomDescription = document.querySelectorAll('input[name="amenities"]:checked');
        const selectedAmenities = Array.from(roomDescription).map(cb => cb.value);
        // const roomImage = document.getElementById('roomImage').value;

        console.log('selectedAmenities', selectedAmenities);


        const roomData = {
            room_number: roomNumber,
            price: roomPrice,
            room_type: roomType,
            beds: roomBedType,
            status: roomStatus,
            amenities: selectedAmenities,
        }

        // const formData = new FormData();
        // formData.append('room_number', roomNumber);
        // formData.append('price', roomPrice);
        // formData.append('room_type', roomType);
        // formData.append('beds', roomBedType);
        // formData.append('status', roomStatus);
        // formData.append('amenities', selectedAmenities);


        // console.log('FormData entries:');
        // for (let [key, value] of formData.entries()) {
        //     console.log(key, value);
        //     // To display the formData need to iterate over the Object
        // }

        // const formDataObj = Object.fromEntries(formData.entries());
        // console.log('FormData as object:', formDataObj);

        addNewRoom(roomData);
        // addNewRoom(formData);
        document.querySelector('.close').click();
    }
    // POST CALL TO API to add new room
    function addNewRoom(roomData) {
        showLoading();
        const url = `${baseURL}hotel/rooms/`;
        const options = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
                // Remove 'Content-Type' header when sending FormData
            },
            body: JSON.stringify(roomData),
            // body: roomData,
        };
        console.log(roomData);
        refreshAccessToken2(url, options)
            // .then(response => response.json())
            .then(data => {
                console.log('Data:', data);
                console.table(data);
                alert("Room Created Successfully");
                // getRoomsData();
                // return getRoomsData();

                // save the data in the local storage roomsList
                const roomsList = JSON.parse(localStorage.getItem('roomsList')) || [];
                roomsList.push(data);
                localStorage.setItem('roomsList', JSON.stringify(roomsList));
                document.getElementById('room').click();
                hideLoading();
            })
            .catch(error => {
                console.log('Error fetching data:', error);
                hideLoading();
            });
    }


})



