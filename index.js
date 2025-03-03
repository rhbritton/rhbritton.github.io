let modal = document.getElementById('modal');
let modalContentContainer = document.getElementById('content-container');
let isMouseOverModal = false;
modal.addEventListener('mouseover', () => {
    isMouseOverModal = true;
});
modal.addEventListener('mouseout', () => {
    isMouseOverModal = false;
});

let startY = null; 
modal.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    isMouseOverModal = true;
}, { passive: false });
modal.addEventListener('touchend', () => {
    startY = null;
    isMouseOverModal = false;
});


function checkSign(num) {
    if (Object.is(num, -0)) {
      return -1;
    } else if (Math.sign(num) === 1) {
      return +1;
    } else if (Math.sign(num) === -1) {
      return -1;
    } else {
      return +1;
    }
  }


let scrollFn = function(e) { /*console.log('scrollFn');*/ };
let inActiveScrollFn = function(e) { /*console.log('inActiveScrollFn');*/ };
let activeScrollFn = function(e) {
    if (!isMouseOverModal) {
        e.preventDefault();
        e.stopPropagation();
    } else {
        let touchEvent = false;
        let deltaY = e.deltaY;
        if (deltaY === undefined) {
            touchEvent = true;
            const currentY = e.touches[0].clientY;
            deltaY = -1 * checkSign(currentY - startY);

            startY = currentY;
        }

        const scrollTop = modalContentContainer.scrollTop;
        const scrollHeight = modalContentContainer.scrollHeight;
        const clientHeight = modalContentContainer.clientHeight;

        const isAtTop = scrollTop === 0;
        const isAtBottom = Math.ceil(scrollTop) + clientHeight + 1 >= scrollHeight;

        if (deltaY < 0 && isAtTop && e.cancelable) {
            e.preventDefault();
            e.stopPropagation();
        } else if (deltaY > 0 && isAtBottom && e.cancelable) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}

// TODO: on mobile and modal, dragging up at top then down will scroll background, same with opposite for bottom
document.body.addEventListener('scroll', function(e) { scrollFn(e) }, { passive: false }); // Important for touchmove
document.body.addEventListener('mousewheel', function(e) { scrollFn(e) }, { passive: false });
document.body.addEventListener('touchmove', function(e) { scrollFn(e) }, { passive: false });



// hash links
window.addEventListener('hashchange', function(event) {
    const links = document.querySelectorAll('.navigation a'); // Select all links in the nav
    links.forEach(link => link.classList.remove('active'));

    const hash = window.location.hash;

    if (hash) {
        const activeLink = document.querySelector('.navigation a[href="' + hash + '"]');
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
});

window.dispatchEvent(new Event('hashchange'));



// learn more modal
let modal_container = document.querySelector('#modal_container');
let closeEl = document.querySelector('#close');

document.querySelectorAll('[data-modal-click]').forEach(function(doc) {
    doc.addEventListener('click', function(event) {
        let modalId = doc.getAttribute('data-modal-click');
        let modalTitle = doc.getAttribute('data-modal-title');
        let modalIconStyles = doc.getAttribute('data-modal-icon-styles');
        let modalIcon = doc.getAttribute('data-modal-icon');
        let modalContent = document.querySelector('[data-modal-content="'+modalId+'"]').innerHTML;
        openModal(modalTitle, modalContent, modalIcon, modalIconStyles);
    });
});

function openModal(title, content, icon, modalIconStyles) {
    modal_container.querySelector('#modal_icon').innerHTML = icon ? '<img style="'+modalIconStyles+'" src="'+icon+'" />' : '';
    modal_container.querySelector('#modal_title').innerHTML = title;
    modal_container.querySelector('#content').innerHTML = content;
    modal_container.classList.add('active');
    // document.body.style.overflowY = 'hidden';
    scrollFn = activeScrollFn;
}

function closeModal() {
    modal_container.classList.remove('active');
    // document.body.style.overflowY = 'auto';
    scrollFn = inActiveScrollFn;
}

closeEl.addEventListener('click', function(e) {
    closeModal()
});

modal_container.addEventListener('click', function(e) {
    if (e.target.id == 'modal_container')
        closeModal()
});


// copy email
let copiedConfirm = document.querySelector('.contact__text.email .copiedConfirm');

function showNotification(message) {
    // // 1. Create the notification element
    // const notification = document.createElement('div');
    // notification.classList.add('notification'); // Add a CSS class
    // notification.textContent = message;

    // // 2. Add it to the page (e.g., at the top or bottom)
    // document.body.appendChild(notification);  // Or append to a specific container

    // // 3. Style the notification (CSS)
    // notification.style.cssText = `
    //     position: fixed; /* Or absolute, depending on your layout */
    //     top: 20px; /* Adjust position as needed */
    //     left: 50%;
    //     transform: translateX(-50%);
    //     background-color: #4CAF50; /* Green for success, or other colors */
    //     color: white;
    //     padding: 10px 15px;
    //     border-radius: 5px;
    //     opacity: 0.9;
    //     z-index: 9999; /* Ensure it's on top */
    //     transition: opacity 0.3s ease-in-out; /* Add a smooth fade effect */
    // `;


    // 4. Remove the notification after a delay (e.g., 3 seconds)
    copiedConfirm.classList.add('active');
    setTimeout(() => {
        setTimeout(() => {
            copiedConfirm.classList.remove('active');
        }, 300);
    }, 700);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        showNotification('Copied to clipboard!')
        console.log('Async: Copying to clipboard was successful!');

    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

let copy = document.querySelector('.contact__text.email');
let emailText = document.querySelector('.contact__text.email .text').textContent;

copy.addEventListener('click', function(event) {
    copyTextToClipboard(emailText);
});


// canvas
const canvas = document.querySelector('.clouds');
const ctx = canvas.getContext('2d');

canvas.width  = window.innerWidth + 500;
canvas.style.left = -500;
canvas.height = window.innerHeight;

let clouds = [];

let minDarkCloudValue = 80;
let cloudFrequency = 0.95; // lower is more
let secondsOfCloudExistence = 60;

var minSpeed = 0.1;
var maxSpeed = 0.35;
var speedDiff = maxSpeed - minSpeed;

function getRandomCloudSize() {
    return Math.random() * 50 + 20;
}

function drawCloud(x, y, r, l, width, height) {
    if (x - r < 0) x = r + 1;
    else if (x + r > width) x = width - r - 1;
    if (y - r < 0) y = r + 1;
    else if (y + r > height) y = height - r - 1;
    if (r <= 0) return true;
    if (l < 0) l = 0;
    else if (l > 100) l = 100;

    l = ((l / 100) * 10) + minDarkCloudValue;

    ctx.fillStyle = 'hsl(0, 0%, ' + l + '%)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

// let highestY;
// let lowestY;

function createCloud(xLast, yLast, rLast, lLast, existingSpeed, timestamp) {
    rLast = (rLast || 50) // default 50
    lLast = lLast || Math.random() * 25 + 75; // default between 75 and 100
    var x = (xLast || 250) + Math.random() * (2 * rLast) - rLast / 1, // x axis, displace based on previous size
        y = (yLast || 250) + Math.random() * (1 * rLast) - rLast / 1.5, // y axis, displace based on previous size
        r = (rLast) + Math.random() * 10 - 7.5,
        l = (lLast)+10;

    // if (highestY === undefined || y > highestY) {
    //     highestY = y;
    //     console.log('h', highestY)
    //     console.log('l', lowestY)
    // }

    // if (lowestY === undefined || y < lowestY) {
    //     lowestY = y;
    //     console.log('h', highestY)
    //     console.log('l', lowestY)
    // }


    var speed = existingSpeed || ((Math.random() * (speedDiff)) + minSpeed);

    var width = canvas.width;
    var height = canvas.height;
    
    clouds.push({ 
        x, y, r, l, width, height, speed, 
        lastTimeStamp: (timestamp || 0), 
        removeAtTimestamp: (timestamp || 0) + (secondsOfCloudExistence * 1000)
    });
    
    let stopCreation = drawCloud(x, y, r, l, width, height);

    if (stopCreation || Math.random < 0.01) return;
    
    createCloud(x, y, r, l, speed, timestamp || 0);
}

function initializeCloud(overrideX, overrideY, overrideSize, timestamp) {
    let x = overrideX !== undefined ? overrideX : Math.random() * canvas.width;
    let y = overrideY !== undefined ? overrideY : Math.random() * (canvas.height / (3/2));
    let size = overrideSize !== undefined ? overrideSize : getRandomCloudSize();

    createCloud(x, y, size, size, undefined, timestamp);
}

function initializeClouds() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 35; i++) { 
        initializeCloud();
    }
}

function generateClouds() {
    let currentTime = (new Date()).getTime();

    let removeIndices = [];
    clouds.forEach(function(cloud, i) {
        if (cloud.x > canvas.width)
            return removeIndices.push(i);

        // drawCloud(cloud.x + cloud.speed, cloud.y, cloud.r, cloud.l, canvas.width, canvas.height);

        // let timeDiff = cloud.lastTimestamp !== undefined ? timestamp - cloud.lastTimestamp : 5;
        // let moveBy = ((timeDiff)/10) * cloud.speed;

        // clouds[i].x += moveBy;
        if (clouds[i].x > canvas.width + 500)
            return removeIndices.push(i);

        // clouds[i].lastTimestamp = timestamp;
    });

    removeIndices.length && removeIndices.reverse().forEach(function(i) {
        clouds.splice(i, 1);
    });

    if (Math.random() > cloudFrequency) {
        let cloudSize = getRandomCloudSize();
        initializeCloud(-cloudSize, undefined, cloudSize, currentTimestamp)
    }
}

setInterval(generateClouds, 200);

let currentTimestamp;

function animateClouds(timestamp) {
    currentTimestamp = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // let currentTime = (new Date()).getTime();

    // let removeIndices = [];
    clouds.forEach(function(cloud, i) {
        // if (cloud.x > canvas.width)
        //     return removeIndices.push(i);

        drawCloud(cloud.x + cloud.speed, cloud.y, cloud.r, cloud.l, canvas.width, canvas.height);

        let timeDiff = cloud.lastTimestamp !== undefined ? timestamp - cloud.lastTimestamp : 5;
        let moveBy = ((timeDiff)/10) * cloud.speed;

        clouds[i].x += moveBy;
        // if (clouds[i].x > canvas.width + 2000)
        //     return removeIndices.push(i);

        clouds[i].lastTimestamp = timestamp;
    });

    // removeIndices.length && removeIndices.reverse().forEach(function(i) {
    //     clouds.splice(i, 1);
    // });

    // if (Math.random() > cloudFrequency) {
    //     // let cloudSize = getRandomCloudSize();
    //     // initializeCloud(-cloudSize, undefined, cloudSize, timestamp)
    // }

    requestAnimationFrame(animateClouds); // Loop for continuous animation
}

initializeClouds();
animateClouds();




