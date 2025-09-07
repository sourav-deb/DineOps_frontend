

document.querySelector('.load-table-blocks').textContent = 'No Table Found';

// Retrieve tableList from localStorage
async function getTableListFromLocalStorage() {
    const storedTableList = localStorage.getItem('tablesList');
    console.log('Stored Table List:', storedTableList);
    return storedTableList ? JSON.parse(storedTableList) : [];
}

console.log('Table List:', getTableListFromLocalStorage());

// Function to render the table list in HTML
async function renderTableList() {
    const tableList = await getTableListFromLocalStorage();

    if (tableList.length === 0) {
        await Promise.all([getTablesData()]);
        tableList = await getTableListFromLocalStorage();
    }

    const tableContainer = document.querySelector('.load-table-blocks');

    tableContainer.innerHTML = '';

    const tableListHead = document.createElement('div');
    tableListHead.classList.add('table-list-head');
    tableListHead.innerHTML = '<div class="table-list-head-text">Table List</div>';
    tableContainer.appendChild(tableListHead);


    tableList.forEach(table => {
        const tableElement = document.createElement('div');
        tableElement.classList.add('table-item');
        tableElement.innerHTML = `
            <div class="table-block" id= "${table.id}">T ${table.table_number}</div>
        `;
        tableContainer.appendChild(tableElement);
    });
}
renderTableList();


// API - POST Request to add a new table
async function addTable(tableData) {
    const tableList = await getTableListFromLocalStorage();
    const existingTable = tableList.find(table => table.table_number === tableData.table_number);

    if (!existingTable) {

        const option = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getCookie('access_token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tableData)
        }

        const url = `${baseURL}foods/tables/`;

        refreshAccessToken2(url, option)
            // .then(response => response.json())
            .then(async data => {
                console.log('Data:', data);
                alert(`Table ${data.table_number} added successfully`, 'success');

                await Promise.all([getTablesData()]);
            })
            .catch(error => {
                console.log('Error fetching data:', error);
                alert('Table not added', 'error');
            });

        await coldReload();

        // tableList.push(tableData);
        localStorage.setItem('tablesList', JSON.stringify(tableList));
        renderTableList();
    } else {
        alert(`Table ${tableData.table_number} already exists.`, 'warning');
        console.log(`Table ${tableData.table_number} already exists.`);
    }
}

// Take table input and pass to POST method
document.getElementById('add-table').addEventListener('click', async function (e) {
    e.preventDefault();

    const tableLocal = getTableListFromLocalStorage();

    const tableNumInput = document.getElementById('tableNumberInput').value;

    if (tableNumInput === '') {
        alert('Please enter a table number');
    } else {
        const tableData = {
            table_number: parseInt(tableNumInput),
        };
        await addTable(tableData);
    }
});

async function coldReload() {
    const page = document.getElementById('nav-item-tabelArea');
    if (page) {
        page.click();
        page.click();
    }
    else {
        page.click();
        page.click();
    }
}


function refreshCategoryList() {
    const button = document.querySelector('#refresh-btn');
    button.classList.add('spinning');
    console.log('Refreshing Category List');
    
    // Call your existing category fetch function here
    getTablesData()
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