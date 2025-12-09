
// baseURL = 'http://backend.hoteliswar.in:8001/api/';
baseURL = 'https://iswar-d.pserver.codeartisanriz.me/api/';
// Disable all console statements
// terminateConsole();

// console.log(baseURL);

// Add this at the beginning of your file, after baseURL declaration
function checkTokensAndRedirect() {
    // Check if current page is login page
    if (window.location.pathname.includes('/login/login.html')) {
        return; // Skip redirect if already on login page
    }

    const accessToken = getCookie('access_token');
    const refreshToken = getCookie('refresh_token');

    if (!accessToken || !refreshToken) {
        const rootPath = window.location.origin;
        window.location.href = `${rootPath}/login/login.html`;
    }
}


// Call this function immediately
// checkTokensAndRedirect();

// Helper function to save a cookie value
function setCookie2(name, value, minutes) {
    const d = new Date();
    d.setTime(d.getTime() + (minutes * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function setCookie(name, value, minutes) {
    const d = new Date();
    d.setTime(d.getTime() + (minutes * 60 * 1000));
    const offsetIST = 5.5 * 60 * 60 * 1000; // Offset in milliseconds
    d.setTime(d.getTime() + offsetIST);
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}


// Helper function to get a cookie value
function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

function refreshAccessToken(url, option) {
    console.log(' refreshAccessToken() called !!');

    return fetch(url, option)
        .then(response => {
            console.log(response.status);
            if (response.status === 401) {
                console.log('Status: 401');
                fetch(`${baseURL}accounts/token/refresh/`, {
                    // fetch('http://127.0.0.1:8000/api/accounts/token/refresh/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        refresh: getCookie('refresh_token')
                    })
                })
                    .then(response => {
                        if (response.status == 401) {
                            window.location.href = 'index.html';
                        }
                        else if (response.status == 200) {
                            // access update
                            console.log('Access Token:', accessToken);
                            console.log('Refresh Token:', refreshToken);
                            console.log('Refresh Status: 200');
                            // if(data.access){
                            //     setCookie('access_token', data.access, 5);
                            // }
                        }
                        return response.json();
                        // refreshAccessToken(url, option);
                    })
                    .then(data => {
                        console.log(data.access);
                        if (data.access) {
                            setCookie('access_token', data.access, 5);
                        }
                        if (response.status === 200) {
                            refreshAccessToken(url, option);
                        }
                        // refreshAccessToken(url, option);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
            else if (response.status === 200) {
                console.log('Status: 200 okay');
                return response.json();
            }
            else if (response.status === 201) {
                console.log('Status: 201 okay');
                return response.json();
            }
            else {
                console.log(`Unexpected status code: ${response.status}`);
                return response.json().then(err => {
                    throw new Error(err.message);
                });
            }
        });
}

async function refreshAccessToken22(url, option) {
    // try {
    const response = await fetch(url, option);
    // if (!response.ok) {
    if (response.status === 401) {
        console.log(`Status: ${response.status}`);
        fetch(`${baseURL}accounts/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh: getCookie('refresh_token')
            })
        })
            .then(response => {
                if (response.status == 401) {
                    window.location.href = 'index.html';
                }
                else if (response.status == 200) {
                    // access update
                    console.log('Access Token:', getCookie('access_token'));
                    console.log('Refresh Token:', getCookie('refresh_token'));
                    console.log('Refresh Status: 200');
                    // if(data.access){
                    //     setCookie('access_token', data.access, 5);
                    // }
                }
                return response.json();
                // refreshAccessToken(url, option);
            })
            .then(data => {
                console.log(data.access);
                if (data.access) {
                    setCookie('access_token', data.access, 5);
                }
                if (response.status === 200) {
                    refreshAccessToken2(url, option);
                }
                // refreshAccessToken(url, option);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    else if (response.ok) {
        // else if (response.status =) {
        console.log('Statuss: ', response.status);
        return response.json();

    }
    // } catch (error) {
    //     console.error('Error:', error);
    // }
}

async function refreshAccessToken2(url, option) {
    try {
        const response = await fetch(url, option);
        console.log(`Status: ${response.status}`);

        if (response.status === 401) {
            // Handle unauthorized access
            const refreshResponse = await fetch(`${baseURL}accounts/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh: getCookie('refresh_token')
                })
            });

            if (refreshResponse.status === 401) {
                // Refresh token is also invalid, redirect to login
                window.location.href = 'index.html';
                // logout();
                return;
            } else if (refreshResponse.status === 200) {
                const data = await refreshResponse.json();
                if (data.access) {
                    setCookie('access_token', data.access, 5);
                    console.log('Access Token refreshed');
                    // Retry the original request with the new token
                    return refreshAccessToken2(url, {
                        ...option,
                        headers: {
                            ...option.headers,
                            'Authorization': `Bearer ${data.access}`
                        }
                    });
                }
            }
        } else if (response.status === 400) {
            // Handle bad request
            console.error('Bad Request:', await response.text());
            throw new Error('Bad Request');
        } else if (response.status === 403) {
            // Handle forbidden
            console.error('Forbidden:', await response.text());
            throw new Error('Forbidden');
        } else if (response.status === 404) {
            // Handle not found
            console.error('Not Found:', await response.text());
            throw new Error('Not Found');
        } else if (response.status === 500) {
            // Handle server error
            console.error('Server Error:', await response.text());
            throw new Error('Server Error');
        } else if (response.status === 204) {
            const data = ['Deleted successfully'];
            return data;
        } else if (response.ok) {
            // Handle successful response
            console.log('Status:', response.status);
            return response.json();
        } else {
            // Handle any other status codes
            console.error('Unexpected Status:', response.status, await response.text());
            throw new Error(`Unexpected Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error in refreshAccessToken2:', error);
        throw error;
    }
}

async function refreshAccessToken3(url, option) {
    console.log('refreshAccessToken() called !!');

    try {
        const response = await fetch(url, option);

        if (response.status === 401) {
            console.log('Status: 401');
            const refreshResponse = await fetch(`${baseURL}accounts/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh: getCookie('refresh_token')
                })
            });

            if (refreshResponse.status === 401) {
                window.location.href = 'index.html';
            } else if (refreshResponse.status === 200) {
                console.log('Access Token:', getCookie('access_token'));
                console.log('Refresh Token:', getCookie('refresh_token'));
                console.log('Refresh Status: 200');

                const data = await refreshResponse.json();
                if (data.access) {
                    setCookie('access_token', data.access, 5);
                }

                return refreshAccessToken3(url, option);
            }
        } else if (response.status === 200 || response.status === 201 || response.ok) {
            console.log(`Status: ${response.status} OK`);
            console.log(response.json());
            return response.json();
        } else {
            console.log(`Unexpected status code: ${response.status}`);
            const err = await response.json();
            throw new Error(err.message);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


// Refresh Category List
function getCategoryListRefresh() {

    return new Promise((resolve, reject) => {
        const url = `${baseURL}foods/categories/`;
        const option = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
            }
        };

        refreshAccessToken2(url, option)
            .then(async data => {
                console.log('Categories Data:', data);
                await localforage.setItem('categoryList', data);
                await getCategoryListFromStorage();
                resolve(data);
            })
            .catch(error => {
                console.error('Error in getCategoryList:', error);
                reject(error);
            });
    });
}

function getFoodListRefresh() {
    return new Promise((resolve, reject) => {
        const url = `${baseURL}foods/fooditems/`;
        const option = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
            }
        };

        refreshAccessToken2(url, option)
            .then(async data => {
                console.log('Categories Data:', data);
                await localforage.setItem('allFoodList', data);
                await getAllFoodListFromStorage();
                resolve(data);
            })
            .catch(error => {
                console.error('Error in getCategoryList:', error);
                reject(error);
            });
    });
}

function getOrdersListRefresh() {
    return new Promise((resolve, reject) => {
        const url = `${baseURL}orders/order/`;
        const option = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
            }
        };

        refreshAccessToken2(url, option)
            .then(async data => {
                console.log('Orders Data:', data);
                await localforage.setItem('ordersList', data);
                await getAllOrdersFromStorage();
                resolve(data);
            })
            .catch(error => {
                console.error('Error in getOrdersList:', error);
                reject(error);
            });
    });
}

function getCompleteBooking() {
    return new Promise((resolve, reject) => {
        const url = `${baseURL}hotel/bookings/`;
        const option = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
            }
        };

        refreshAccessToken2(url, option)
            .then(async data => {
                console.log('Booking Data:', data);
                await localforage.setItem('bookingsList', data);
                await getAllBookingsFromStorage();
                resolve(data);
            })
            .catch(error => {
                console.error('Error in bookingsList:', error);
                reject(error);
            });
    });
}


// API Call GET Category List - Read
function getCategoryList() {
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }

    const url = `${baseURL}foods/categories/`;

    return refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('Data:', data);
            // Save the data to local storage
            await localforage.setItem('categoryList', data);
            // await getCategoryListFromStorage(); // Avoid circular dependency/redundant call
            return data;
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            throw error;
        });
};

async function getCategoryListFromStorage() {
    const categoryList = await localforage.getItem('categoryList');
    if (categoryList && categoryList !== 'undefined') {
        console.log('Category list from local storage:', categoryList);
        return categoryList;
    } else {
        console.log('No category list found in local storage, fetching from API...');
        return await getCategoryList();
    }
}


// API Call GET Food Items
function getFooditems() {
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }
    const url = `${baseURL}foods/fooditems/`;

    return refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('Data:', data);
            await localforage.setItem('allFoodList', data);
            // await getAllFoodListFromStorage();
            return data;
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            throw error;
        });
};

async function getAllFoodListFromStorage() {
    const foodList = await localforage.getItem('allFoodList');
    if (foodList && foodList !== 'undefined') {
        console.log('Food list from local storage:', foodList);
        return foodList;
    } else {
        console.log('No food list found in local storage, fetching from API...');
        return await getFooditems();
    }
}


// API Call to GET Tables data
function getTablesData() {
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }
    const url = `${baseURL}foods/tables/`;
    return refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('Data:', data);
            await localforage.setItem('tablesList', data);
            // await getTablesListFromStorage();
            return data;
        })
        .catch(error => {
            console.log('Error fetching table:', error);
            throw error;
        });
}

async function getTablesListFromStorage() {
    const tablesList = await localforage.getItem('tablesList');
    if (tablesList && tablesList !== 'undefined') {
        console.log('Table list from local storage:', tablesList);
        return tablesList;
    } else {
        console.log('No table list found in local storage, fetching from API...');
        return await getTablesData();
    }
}


// API Call to GET Rooms data
async function getRoomsData() {
    const url = `${baseURL}hotel/rooms/`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await refreshAccessToken2(url, options);
        // Save the updated room data to local storage
        await localforage.setItem('roomsList', response);
        console.log('Rooms data updated in local storage');
        return response;
    } catch (error) {
        console.log('Error fetching rooms data:', error);
        throw error;
    }
}

async function getRoomsListFromStorage() {
    const roomsList = await localforage.getItem('roomsList');
    if (roomsList && roomsList !== 'undefined') {
        console.log('Room list from local storage:', roomsList);
        return roomsList;
    } else {
        console.log('No room list found in local storage, fetching from API...');
        return await getRoomsData();
    }
}


// API Call GET Category List - Read
// API Call GET Service Category List - Read
function getServiceCategoryList() {
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }

    const url = `${baseURL}hotel/service-categories/`;

    return refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('Data:', data);
            // Save the data to local storage
            await localforage.setItem('serviceCategoryList', data);
            // await getServiceCategoryListFromStorage();
            return data;
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            throw error;
        });
};

async function getServiceCategoryListFromStorage() {
    const categoryList = await localforage.getItem('serviceCategoryList');
    if (categoryList && categoryList !== 'undefined') {
        console.log('Service Category list from local storage:', categoryList);
        return categoryList;
    } else {
        console.log('No service category list found in local storage, fetching from API...');
        return await getServiceCategoryList();
    }
}


// API Call GET Service List - Read
function getServiceList() {
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }

    const url = `${baseURL}hotel/services/`;

    return refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('Data:', data);
            // Save the data to local storage
            await localforage.setItem('serviceList', data);
            // await getServiceListFromStorage();
            return data;
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            throw error;
        });
};


async function getServiceListFromStorage() {
    const categoryList = await localforage.getItem('serviceList');
    if (categoryList && categoryList !== 'undefined') {
        console.log('Service List from local storage:', categoryList);
        return categoryList;
    } else {
        console.log('No service list found in local storage, fetching from API...');
        return await getServiceList();
    }
}


// API Call GET All Bookings - Read
// API Call GET All Bookings - Read
async function getAllBookings() {
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }

    const url = `${baseURL}hotel/bookings/`;

    return refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('All BookingsData:', data);
            // Save the data to local storage
            await localforage.setItem('bookingsList', data);
            // await getAllBookingsFromStorage();
            return data;
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            throw error;
        });

};


async function getAllBookingsFromStorage() {
    const categoryList = await localforage.getItem('bookingsList');
    if (categoryList && categoryList !== 'undefined') {
        console.log('Booking list from local storage:', categoryList);
        return categoryList;
    } else {
        console.log('No Booking list found in local storage, fetching from API...');
        return await getAllBookings();
    }
}


// API Call GET All Billings - Read
// API Call GET All Billings - Read
async function getAllBilling() {
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }

    const url = `${baseURL}billing/bills/`;

    return refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('All Billing Data:', data);
            // Save the data to local storage
            await localforage.setItem('billingList', data);
            // await getAllBillingFromStorage();
            return data;
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            throw error;
        });

};

async function getAllBillingFromStorage() {
    const categoryList = await localforage.getItem('billingList');
    if (categoryList && categoryList !== 'undefined') {
        console.log('Billing list from local storage:', categoryList);
        return categoryList;
    } else {
        console.log('No Billing list found in local storage, fetching from API...');
        return await getAllBilling();
    }
}


// API Call GET All Orders - Read
// API Call GET All Orders - Read
async function getAlllOrders() {
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }

    const url = `${baseURL}orders/order/`;

    return refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('All Orders Data:', data);
            // Save the data to local storage
            await localforage.setItem('ordersList', data);
            // await getAllOrdersFromStorage();
            return data;
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            throw error;
        });

};

async function getAllOrdersFromStorage() {
    const ordersList = await localforage.getItem('ordersList');
    if (ordersList && ordersList !== 'undefined') {
        console.log('Orders list from local storage:', ordersList);
        return ordersList;
    } else {
        console.log('No Orders list found in local storage, fetching from API...');
        return await getAlllOrders();
    }
}

// API Call GET All Orders - Read
// API Call GET All Payments - Read
async function getAllPayments() {
    const option = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + getCookie('access_token'),
            'Content-Type': 'application/json'
        }
    }

    const url = `${baseURL}billing/bill-payments/`;

    return refreshAccessToken2(url, option)
        // .then(response => response.json())
        .then(async data => {
            console.log('All Payments Data:', data);
            // Save the data to local storage
            await localforage.setItem('paymentsList', data);
            // await getAllPaymentsFromStorage();
            return data;
        })
        .catch(error => {
            console.log('Error fetching data:', error);
            throw error;
        });

};

async function getAllPaymentsFromStorage() {
    const paymentsList = await localforage.getItem('paymentsList');
    if (paymentsList && paymentsList !== 'undefined') {
        console.log('Payments list from local storage:', paymentsList);
        return paymentsList;
    } else {
        console.log('No Payments list found in local storage, fetching from API...');
        return await getAllPayments();
    }
}


// Disable all console statements
// console.log = function() {};
// console.table = function() {};
// alert = function() {};

// Custom alert function
function customAlert(message, type = 'info') {
    // Create alert container
    const alertContainer = document.createElement('div');
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '40px';
    alertContainer.style.right = '20px';
    alertContainer.style.padding = '15px';
    alertContainer.style.borderRadius = '5px';
    alertContainer.style.maxWidth = '300px';
    alertContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    alertContainer.style.zIndex = '9999';
    alertContainer.style.transition = 'opacity 0.3s ease-in-out';
    alertContainer.style.zIndex = '100002';

    // Set color based on alert type
    switch (type) {
        case 'success':
            alertContainer.style.backgroundColor = '#4CAF50';
            alertContainer.style.color = 'white';
            break;
        case 'error':
            alertContainer.style.backgroundColor = '#f44336';
            alertContainer.style.color = 'white';
            break;
        case 'warning':
            alertContainer.style.backgroundColor = '#ff9800';
            alertContainer.style.color = 'white';
            break;
        default:
            alertContainer.style.backgroundColor = '#2196F3';
            alertContainer.style.color = 'white';
    }

    // Set message
    alertContainer.textContent = message;

    // Add close button
    const closeButton = document.createElement('span');
    closeButton.textContent = '×';
    closeButton.style.float = 'right';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginLeft = '15px';
    closeButton.onclick = function () {
        document.body.removeChild(alertContainer);
    };
    alertContainer.insertBefore(closeButton, alertContainer.firstChild);

    // Add to body
    document.body.appendChild(alertContainer);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alertContainer.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(alertContainer)) {
                document.body.removeChild(alertContainer);
            }
        }, 300);
    }, 5000);
}


// Override default alert
alert = customAlert;

// Disable all console statements
// terminateConsole();

function terminateConsole() {
    console.log = function () { }
    console.table = function () { }
    console.warn = function () { }
    console.error = function () { }
}


if (document.getElementById('logout')) {
    const liLogout = document.getElementById('logout');
    liLogout.style.cursor = 'pointer';
    // color on hover
    liLogout.addEventListener('mouseover', function () {
        liLogout.style.color = 'rgb(255, 175, 2)'; //hover color
    });
    liLogout.addEventListener('mouseout', function () {
        liLogout.style.color = 'black'; //default color
    });


    document.getElementById('logout').onclick = function () {
        clearCookies();
        // clearLocalStorage();
        const rootPath = window.location.origin;
        window.location.href = `${rootPath}/login/login.html`;
    }

}

// onclick function for logout on logout clear all cookies and local storage
// and redirect to login page

// document.getElementById('logout').onclick = function () {
//     clearCookies();
//     clearLocalStorage();
//     // window.location.href = './login/login.html';
//     const rootPath = window.location.origin;
//     window.location.href = `${rootPath}/hotel-iswar/login/login.html`;
//     // window.location.href = `${rootPath}/hotel_iswar_frontend/hotel-iswar/login/login.html`;
// }

function clearCookies() {
    const cookies = document.cookie.split(';');

    cookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

}

function clearLocalStorage() {
    // localStorage.clear();
    localforage.clear();
}




// Global variable to track loading state
let globalLoadingOverlay = null;

function showLoading() {
    // If loading is already shown, don't create another one
    if (globalLoadingOverlay) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '100000';
    overlay.style.cursor = 'wait';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // Create spinner container
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'spinner-container';
    spinnerContainer.style.position = 'relative';
    spinnerContainer.style.width = '50px';
    spinnerContainer.style.height = '50px';

    // Create spinner
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.position = 'absolute';
    spinner.style.width = '100%';
    spinner.style.height = '100%';
    spinner.style.border = '5px solid #f3f3f3';
    spinner.style.borderTop = '5px solid #3498db';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';

    // Add spinner animation styles if not already added
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Assemble the elements
    spinnerContainer.appendChild(spinner);
    overlay.appendChild(spinnerContainer);
    document.body.appendChild(overlay);

    // Disable all clicks
    document.body.style.pointerEvents = 'none';
    overlay.style.pointerEvents = 'all';

    // Store reference globally
    globalLoadingOverlay = overlay;
}

function hideLoading() {
    if (globalLoadingOverlay) {
        document.body.style.pointerEvents = 'all';
        if (document.body.contains(globalLoadingOverlay)) {
            document.body.removeChild(globalLoadingOverlay);
        }
        globalLoadingOverlay = null;
    }
}


async function callAllApi() {
    console.log("Calling All API");
    const apiData = await Promise.all([
        getCategoryList(),
        getFooditems(),
        getTablesData(),
        getRoomsData(),
        getServiceCategoryList(),
        getServiceList(),
        getAllBookings(),
        getAllBilling(),
        getAlllOrders(),
        getAllPayments()
    ]);

    console.log("Call Completed.")
}

async function callAllApi2() {
    console.log("Calling All API");
    try {
        await getCategoryList();
        customAlert('1/10 - Categories loaded', 'success');

        await getFooditems();
        customAlert('2/10 - Food items loaded', 'success');

        await getTablesData();
        customAlert('3/10 - Tables loaded', 'success');

        await getRoomsData();
        customAlert('4/10 - Rooms loaded', 'success');

        await getServiceCategoryList();
        customAlert('5/10 - Service categories loaded', 'success');

        await getServiceList();
        customAlert('6/10 - Services loaded', 'success');

        await getAllBookings();
        customAlert('7/10 - Bookings loaded', 'success');

        await getAllBilling();
        customAlert('8/10 - Billing loaded', 'success');

        await getAlllOrders();
        customAlert('9/10 - Orders loaded', 'success');

        await getAllPayments();
        customAlert('10/10 - Payments loaded', 'success');

        customAlert('All data loaded successfully!', 'success');
    } catch (error) {
        console.error("Error loading data:", error);
        customAlert('Error loading data', 'error');
    }
    console.log("Call Completed.");
}

// Custom confirm function that creates and manages its own HTML/CSS
function customConfirm(message) {
    return new Promise((resolve) => {
        // Create the CSS styles
        const styleId = 'custom-confirm-styles';
        if (!document.getElementById(styleId)) {
            const styleSheet = document.createElement('style');
            styleSheet.id = styleId;
            styleSheet.textContent = `
                .custom-confirm-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    justify-content: center;
                    align-items: center;
                }
                
                .custom-confirm-box {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    width: 300px;
                    text-align: center;
                }
                
                .confirm-title {
                    margin: 0 0 15px 0;
                    color: #333;
                }
                
                .confirm-content {
                    margin-bottom: 20px;
                }
                
                .confirm-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                }
                
                .confirm-btn {
                    padding: 8px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.2s;
                }
                
                .yes-btn {
                    background-color: #dc3545;
                    color: white;
                }
                
                .yes-btn:hover {
                    background-color: #c82333;
                }
                
                .no-btn {
                    background-color: #6c757d;
                    color: white;
                }
                
                .no-btn:hover {
                    background-color: #5a6268;
                }
            `;
            document.head.appendChild(styleSheet);
        }

        // Create the dialog HTML
        const dialog = document.createElement('div');
        dialog.id = 'customConfirmDialog';
        dialog.className = 'custom-confirm-overlay';
        dialog.innerHTML = `
            <div class="custom-confirm-box">
                <div class="confirm-content">
                    <h3 class="confirm-title">Confirm Delete</h3>
                    <p id="confirmMessage">${message}</p>
                </div>
                <div class="confirm-buttons">
                    <button id="confirmYes" class="confirm-btn yes-btn">Yes</button>
                    <button id="confirmNo" class="confirm-btn no-btn">No</button>
                </div>
            </div>
        `;

        // Add dialog to document
        document.body.appendChild(dialog);

        // Show dialog
        dialog.style.display = 'flex';

        // Get button elements
        const yesButton = dialog.querySelector('#confirmYes');
        const noButton = dialog.querySelector('#confirmNo');

        function cleanup() {
            dialog.remove();
            resolve(false);
        }

        function handleYes() {
            dialog.remove();
            resolve(true);
        }

        function handleNo() {
            cleanup();
        }

        // Add event listeners
        yesButton.addEventListener('click', handleYes);
        noButton.addEventListener('click', handleNo);

        // Close on click outside
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                cleanup();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                cleanup();
                document.removeEventListener('keydown', handler);
            }
        });
    });
}

// add a element to the top of body to show a marquee text
function addMarqueeText() {
    // Remove any existing marquee element
    const existingMarquee = document.getElementById('custom-marquee-container');
    if (existingMarquee) {
        existingMarquee.remove();
    }

    // Create container
    const container = document.createElement('div');
    container.id = 'custom-marquee-container';

    // Create text element
    const text = document.createElement('div');
    text.id = 'custom-marquee-text';
    text.textContent = 'Note: Please clear all the outstanding payments before 31st January 2025 to avoid software interruptions.';

    // Add elements to DOM
    container.appendChild(text);
    document.body.insertBefore(container, document.body.firstChild);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #custom-marquee-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(45deg, #ff9800, #ff5722);
            color: white;
            padding: 8px 0;
            overflow: hidden;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        #custom-marquee-text {
            white-space: nowrap;
            display: inline-block;
            padding-left: 100%;
            animation: marquee 20s linear infinite;
            font-family: Arial, sans-serif;
            font-weight: bold;
        }

        @keyframes marquee {
            0% {
                transform: translateX(0);
            }
            100% {
                transform: translateX(-100%);
            }
        }

        /* Pause animation on hover */
        #custom-marquee-container:hover #custom-marquee-text {
            animation-play-state: paused;
        }

        /* Adjust body padding to account for fixed marquee */
        body {
            padding-top: 40px;
        }
    `;

    document.head.appendChild(style);
}

// Call the function after DOM is loaded
// document.addEventListener('DOMContentLoaded', addMarqueeText);
