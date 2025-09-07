document.addEventListener('DOMContentLoaded', function () {
    const dashboardContent = document.getElementById('hotel-content');
    const navItems = document.querySelectorAll('.dash-nav-item');
    const insertAllModal = document.querySelector('.insert-all-modal');

    loadContent('HOME');   // Load the default content
    navItems[0].classList.add('selected');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(nav => nav.classList.remove('selected'));
            this.classList.add('selected');

            const navName = this.querySelector('.nav-name').textContent.trim();
            loadContent(navName);
        });
    });

    function loadContent2(navName) {
        let fileName;
        switch (navName) {
            case 'HOME':
                fileName = './home-app/home';
                break;
            case 'ROOM':
                fileName = './room-app/room';
                break;
            case 'BOOKING':
                fileName = './booking-app/booking';
                break;
            case 'GUEST':
                fileName = './guest-app/guest';
                break;
            case 'CONFIGURATION':
                fileName = './configuration-app/configuration';
                break;
            case 'USER MANAGEMENT':
                fileName = './user-management/user-management';
                break;
            default:
                fileName = 'not-found';
        }

        let currentScript = null;
        function handleItemClick(scriptUrl) {
            // Remove the old script if it exists
            if (currentScript) {
                document.body.removeChild(currentScript);
            }

            // Create and append the new script
            const script = document.createElement('script');
            script.src = scriptUrl;
            document.body.appendChild(script);

            // Update the reference to the current script
            currentScript = script;
        }

        fetch(`${fileName}.html`)
            .then(response => response.text())
            .then(data => {
                dashboardContent.innerHTML = data;
                // Load and execute the associated JavaScript file
                const script = document.createElement('script');
                script.src = `${fileName}.js`;
                scriptUrl = `${fileName}.js`;
                script.onload = function () {
                    // This will run after the script has loaded and executed
                    console.log(`${fileName}.js loaded and executed`);
                };
                // document.body.appendChild(script);
                handleItemClick(scriptUrl);
            })
            .catch(error => {
                console.error('Error loading content:', error);
                dashboardContent.innerHTML = '<h2>Error Loading Content</h2>';
            });
    }

    let currentScript = null;

    function loadContent(navName) {
        let fileName;
        switch (navName) {
            case 'HOME':
                fileName = './home-app/home';
                break;
            case 'ROOM':
                fileName = './room-app/room';
                break;
            case 'BOOKING':
                fileName = './booking-app/booking';
                break;
            case 'BILLING':
                fileName = './billing-app/billing';
                break;
            case 'GUEST':
                fileName = './guest-app/guest';
                break;
            case 'CONFIGURATION':
                fileName = './configuration-app/configuration';
                break;
            case 'USER MANAGEMENT':
                fileName = './user-management/user-management';
                break;
            default:
                fileName = 'not-found';
        }

        fetch(`${fileName}.html`)
            .then(response => response.text())
            .then(data => {
                dashboardContent.innerHTML = data;
                // console.log(data);

                // // Move the modal out of hotel-content to the body
                // const modal = document.getElementById('bookingModal');
                // if (modal) {
                //     // Remove it from the current parent (hotel-content)
                //     dashboardContent.removeChild(modal);
                //     insertAllModal.appendChild(modal); // Moves the modal to the body
                // }

                // Remove the previous script if it exists
                if (currentScript) {
                    document.body.removeChild(currentScript);
                }


                // Create and append the new script
                const script = document.createElement('script');
                script.src = `${fileName}.js`;
                document.body.appendChild(script);
                console.log(`${fileName}.js loaded and executed`);

                // Update the reference to the current script
                currentScript = script;
            })
            .catch(error => {
                console.error('Error loading content:', error);
                dashboardContent.innerHTML = '<h2>Error Loading Content</h2>';
            });
    }

    document.getElementById('hotel-bill').addEventListener('click', function (e) {
        e.preventDefault();
        try {
            showLoading();
            getAllBilling();
            hideLoading();
        } catch (error) {
            console.log('Error in getAllBilling:', error);
        }
    });

});


// Landscape Alert
function checkOrientation() {
    if (window.innerWidth <= 900) {
        let overlay = document.getElementById('orientationOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'orientationOverlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
            overlay.style.zIndex = '9998';
            document.body.appendChild(overlay);

            let alertBox = document.createElement('div');
            alertBox.id = 'orientationAlert';
            alertBox.style.position = 'fixed';
            alertBox.style.top = '50%';
            alertBox.style.left = '50%';
            alertBox.style.transform = 'translate(-50%, -50%)';
            alertBox.style.padding = '40px';
            alertBox.style.backgroundColor = 'white';
            alertBox.style.color = 'black';
            alertBox.style.textAlign = 'center';
            alertBox.style.zIndex = '9999';
            alertBox.style.borderRadius = '10px';
            alertBox.style.boxShadow = '0 0 10px rgba(255,255,255,0.5)';
            alertBox.textContent = "For the best experience, please use in landscape mode in Desktop or Tablet.";
            overlay.appendChild(alertBox);
        }
    } else {
        let overlay = document.getElementById('orientationOverlay');
        if (overlay) {
            overlay.remove();
        }
    }
}