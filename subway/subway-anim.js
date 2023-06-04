document.addEventListener("DOMContentLoaded", function () {
    const doorSoundOpen = new Audio('depart.mp3');

    function moveTrain() {
        doorSoundOpen.play();
        var subwayCar = document.getElementById('subway-car');
        subwayCar.classList.add('moving-out');

        setTimeout(function () {
            subwayCar.classList.remove('moving-out');
            subwayCar.classList.add('moving-in');
            setTimeout(function () {
                subwayCar.classList.remove('moving-in');
            }, 2000); // Remove the moving-in class after the animation is done
        }, 2000); // Wait for the moving-out animation to finish before starting the moving-in animation
    }

    document.addEventListener('keydown', function (event) {
        if (event.code == 'ArrowRight') {
            moveTrain();
        }
    });

    // Track the horizontal start and end points of the touch
    var touchstartX = 0;
    var touchendX = 0;

    function handleTouchStart(event) {
        touchstartX = event.changedTouches[0].screenX;
    }

    function handleTouchEnd(event) {
        touchendX = event.changedTouches[0].screenX;
        handleSwipe();
    }

    // Trigger the train move function if a swipe right is detected
    function handleSwipe() {
        if (touchendX > touchstartX) {
            moveTrain();
        }
    }

    // Add event listeners for the touch events
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);
});
