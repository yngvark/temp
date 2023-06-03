document.addEventListener("DOMContentLoaded", function() {
    var subway = document.getElementById('subway');
    var leftButton = document.getElementById('left-button');
    var rightButton = document.getElementById('right-button');
    var doorSoundOpen = new Audio('Sliding-Closet-Door-Open-A2-www.fesliyanstudios.com.mp3');
    var doorSoundClose = new Audio('Sliding-Closet-Door-Close-A1-www.fesliyanstudios.com.mp3');

    function toggleDoors() {
        if (subway.classList.contains('open')) {
            subway.classList.remove('open');
            doorSoundClose.play();
        } else {
            subway.classList.add('open');
            doorSoundOpen.play();
        }
    }

    leftButton.addEventListener('click', toggleDoors);
    rightButton.addEventListener('click', toggleDoors);

    window.addEventListener('keydown', function(event) {
        if (event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            toggleDoors();
        }
    });
});