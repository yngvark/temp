document.addEventListener("DOMContentLoaded", function () {
    const doorSoundOpen = new Audio('depart.mp3');

    document.addEventListener('keydown', function (event) {
        if (event.code == 'ArrowRight') {
            doorSoundOpen.play()
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
    });
});

