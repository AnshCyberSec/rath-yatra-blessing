// ================================================================
// RATH YATRA - COMPLETE JAVASCRIPT WITH AUTO-TRANSITION & AUDIO
// ================================================================

let currentScreen = 1;
let totalScreens = 3;
let isTransitioning = false;
let autoTransitionTimer = null;
let cartCheckInterval = null;

// ===== AUDIO VARIABLE =====
let audio = null;
let isAudioPlaying = false;

const screens = {
    1: document.getElementById('screen1'),
    2: document.getElementById('screen2'),
    3: document.getElementById('screen3')
};

const dots = document.querySelectorAll('.dot-simple');
const magicBtn = document.getElementById('magicBtn');

// ================================================================
// AUDIO FUNCTIONS
// ================================================================
function initAudio() {
    audio = document.getElementById('bgAudio');
    if (!audio) {
        console.warn('⚠️ Audio element not found!');
        return;
    }
    
    // Set volume (0 to 1)
    audio.volume = 0.5;
    
    // Load audio
    audio.load();
    
    console.log('🎵 Audio initialized');
}

function playAudio() {
    if (!audio) return;
    
    // Check if audio is already playing
    if (isAudioPlaying) return;
    
    // Try to play
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                isAudioPlaying = true;
                console.log('🎵 Audio started playing');
            })
            .catch((error) => {
                console.log('⚠️ Audio autoplay blocked:', error);
                // User interaction required - will play on button click
            });
    }
}

function stopAudio() {
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
    isAudioPlaying = false;
    console.log('🎵 Audio stopped');
}

// ================================================================
// NAVIGATION
// ================================================================
function goToScreen(screenNumber) {
    if (isTransitioning || screenNumber === currentScreen) return;
    isTransitioning = true;

    console.log('🔄 Going to screen:', screenNumber);

    if (autoTransitionTimer) {
        clearTimeout(autoTransitionTimer);
        autoTransitionTimer = null;
    }
    if (cartCheckInterval) {
        clearInterval(cartCheckInterval);
        cartCheckInterval = null;
    }

    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });

    const target = screens[screenNumber];
    if (target) {
        target.classList.add('active');
        console.log('✅ Screen', screenNumber, 'activated');
    } else {
        console.error('❌ Screen', screenNumber, 'not found!');
        isTransitioning = false;
        return;
    }

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index + 1 === screenNumber);
    });

    currentScreen = screenNumber;

    if (screenNumber === 2) {
        resetCarts();
        startCartCompletionCheck();
        // Play audio when screen 2 opens
        playAudio();
    } else if (screenNumber === 3) {
        // Keep audio playing on screen 3
    } else if (screenNumber === 1) {
        // Stop audio when returning to screen 1
        stopAudio();
    }

    setTimeout(() => {
        isTransitioning = false;
    }, 800);
}

// ================================================================
// CART COMPLETION CHECK
// ================================================================
function startCartCompletionCheck() {
    if (cartCheckInterval) {
        clearInterval(cartCheckInterval);
    }

    const cart3 = document.getElementById('cart3');
    let maxDuration = 9000;
    
    if (cart3) {
        const style = window.getComputedStyle(cart3);
        const animDuration = style.animationDuration;
        if (animDuration) {
            const durationInSeconds = parseFloat(animDuration);
            if (!isNaN(durationInSeconds)) {
                maxDuration = durationInSeconds * 1000;
            }
        }
    }

    console.log('⏱️ Cart animation will complete in:', maxDuration, 'ms');

    autoTransitionTimer = setTimeout(() => {
        console.log('🚀 Carts completed! Opening Screen 3...');
        if (currentScreen === 2) {
            goToScreen(3);
        }
    }, maxDuration + 500);

    let checkCount = 0;
    cartCheckInterval = setInterval(() => {
        checkCount++;
        const cartElement = document.getElementById('cart3');
        if (cartElement) {
            const transform = window.getComputedStyle(cartElement).transform;
            if (transform && transform !== 'none') {
                const matrix = transform.match(/matrix.*\((.+)\)/);
                if (matrix) {
                    const values = matrix[1].split(', ');
                    const translateX = parseFloat(values[4] || values[12] || 0);
                    if (translateX > window.innerWidth * 0.3) {
                        // Cart is moving
                    }
                }
            }
        }
        
        if (checkCount > 20) {
            clearInterval(cartCheckInterval);
            cartCheckInterval = null;
        }
    }, 1000);
}

// ================================================================
// RESET CARTS
// ================================================================
function resetCarts() {
    const carts = document.querySelectorAll('.rath-group');
    carts.forEach(cart => {
        cart.style.animation = 'none';
        void cart.offsetHeight;
        cart.style.animation = '';
    });
}

// ================================================================
// BUTTON CLICK
// ================================================================
if (magicBtn) {
    magicBtn.addEventListener('click', function(e) {
        // Try to play audio on user interaction (required for autoplay)
        if (!isAudioPlaying && audio) {
            playAudio();
        }
        
        this.disabled = true;
        this.style.opacity = '0.7';

        setTimeout(() => {
            this.disabled = false;
            this.style.opacity = '1';
            goToScreen(2);
        }, 400);
    });
}

// ================================================================
// DOTS CLICK
// ================================================================
dots.forEach((dot) => {
    dot.addEventListener('click', function() {
        const screenNum = parseInt(this.dataset.screen);
        if (!isNaN(screenNum) && screenNum !== currentScreen) {
            // If user manually goes to screen 2, play audio
            if (screenNum === 2 && !isAudioPlaying) {
                playAudio();
            }
            // If user goes to screen 1, stop audio
            if (screenNum === 1 && isAudioPlaying) {
                stopAudio();
            }
            goToScreen(screenNum);
        }
    });
});

// ================================================================
// KEYBOARD
// ================================================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        const next = currentScreen < totalScreens ? currentScreen + 1 : 1;
        goToScreen(next);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = currentScreen > 1 ? currentScreen - 1 : totalScreens;
        goToScreen(prev);
    }
});

// ================================================================
// SWIPE
// ================================================================
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    const diffX = touchStartX - e.changedTouches[0].screenX;
    const diffY = Math.abs(touchStartY - e.changedTouches[0].screenY);
    
    if (Math.abs(diffX) > 50 && diffY < 100) {
        if (diffX > 0) {
            const next = currentScreen < totalScreens ? currentScreen + 1 : 1;
            goToScreen(next);
        } else {
            const prev = currentScreen > 1 ? currentScreen - 1 : totalScreens;
            goToScreen(prev);
        }
    }
}, { passive: true });

// ================================================================
// PHOTO FALLBACK
// ================================================================
const bgPhoto = document.querySelector('.bg-full');
if (bgPhoto) {
    bgPhoto.addEventListener('error', function() {
        console.warn('⚠️ background.png not found');
        this.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.style.cssText = `
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            background: radial-gradient(circle, #1a0a1a, #0a0612);
            color: #f5d78a;
            z-index: 1;
        `;
        fallback.textContent = '🌅';
        this.parentNode.insertBefore(fallback, this.nextSibling);
    });
}

// ================================================================
// CART IMAGE FALLBACK
// ================================================================
document.querySelectorAll('.cart-img').forEach(img => {
    img.addEventListener('error', function() {
        console.warn('⚠️ Cart image not found:', this.src);
        this.style.display = 'none';
    });
});

// ================================================================
// INIT
// ================================================================
function init() {
    // Initialize audio
    initAudio();
    
    console.log('✨ Rath Yatra - With Audio!');
    console.log('🙏 Jai Jagannath!');
    console.log('📍 Current screen:', currentScreen);
    console.log('💡 Carts will auto-open Screen 3 when finished!');
    console.log('🎵 Audio will play on Screen 2');
}

// Start the app
init();