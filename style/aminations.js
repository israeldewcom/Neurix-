/* ChangeX Neurix - Animations */

/* Keyframes */
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

@keyframes slideInDown {
    from {
        transform: translateY(-100%);
    }
    to {
        transform: translateY(0);
    }
}

@keyframes slideInLeft {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes pulse {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
    100% {
        opacity: 1;
    }
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

@keyframes shake {
    0%, 100% {
        transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
    }
    20%, 40%, 60%, 80% {
        transform: translateX(5px);
    }
}

@keyframes neuronPulse {
    0%, 100% {
        transform: translateX(-50%) scale(1);
        opacity: 1;
    }
    50% {
        transform: translateX(-50%) scale(1.5);
        opacity: 0.5;
    }
}

@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

@keyframes gradientShift {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

@keyframes typing {
    from {
        width: 0;
    }
    to {
        width: 100%;
    }
}

@keyframes blink {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}

/* Animation Classes */
.animate-fade-in {
    animation: fadeIn var(--transition-base);
}

.animate-fade-in-up {
    animation: fadeInUp var(--transition-base);
}

.animate-fade-in-down {
    animation: fadeInDown var(--transition-base);
}

.animate-fade-in-left {
    animation: fadeInLeft var(--transition-base);
}

.animate-fade-in-right {
    animation: fadeInRight var(--transition-base);
}

.animate-scale-in {
    animation: scaleIn var(--transition-base);
}

.animate-spin {
    animation: spin 1s linear infinite;
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce {
    animation: bounce 1s infinite;
}

.animate-shake {
    animation: shake 0.5s ease-in-out;
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}

.animate-gradient {
    background-size: 200% 200%;
    animation: gradientShift 3s ease infinite;
}

.animate-typing {
    overflow: hidden;
    white-space: nowrap;
    animation: typing 3s steps(40, end);
}

.animate-blink {
    animation: blink 1s step-end infinite;
}

/* Staggered Animations */
.stagger-children > * {
    opacity: 0;
    animation: fadeInUp 0.5s ease forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
.stagger-children > *:nth-child(5) { animation-delay: 0.5s; }
.stagger-children > *:nth-child(6) { animation-delay: 0.6s; }
.stagger-children > *:nth-child(7) { animation-delay: 0.7s; }
.stagger-children > *:nth-child(8) { animation-delay: 0.8s; }

/* Hover Animations */
.hover-lift {
    transition: transform var(--transition-base);
}

.hover-lift:hover {
    transform: translateY(-4px);
}

.hover-glow {
    transition: box-shadow var(--transition-base);
}

.hover-glow:hover {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.hover-scale {
    transition: transform var(--transition-base);
}

.hover-scale:hover {
    transform: scale(1.05);
}

.hover-rotate {
    transition: transform var(--transition-base);
}

.hover-rotate:hover {
    transform: rotate(5deg);
}

/* Loading Animations */
.loading-dots::after {
    content: '';
    animation: loadingDots 1.5s infinite;
}

@keyframes loadingDots {
    0%, 20% {
        content: '.';
    }
    40% {
        content: '..';
    }
    60%, 100% {
        content: '...';
    }
}

/* Progress Animation */
@keyframes progress-bar-stripes {
    from {
        background-position: 1rem 0;
    }
    to {
        background-position: 0 0;
    }
}

.progress-bar-animated {
    animation: progress-bar-stripes 1s linear infinite;
}

/* Ripple Effect */
.ripple {
    position: relative;
    overflow: hidden;
}

.ripple::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10, 10);
    opacity: 0;
    transition: transform 0.5s, opacity 1s;
}

.ripple:active::after {
    transform: scale(0, 0);
    opacity: 0.3;
    transition: 0s;
}

/* Scroll Animations */
.reveal-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
}

.reveal-on-scroll.revealed {
    opacity: 1;
    transform: translateY(0);
}

/* Text Gradient Animation */
.text-gradient-animated {
    background: linear-gradient(90deg, 
        var(--primary-400), 
        var(--primary-500), 
        var(--primary-600), 
        var(--primary-400));
    background-size: 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: gradientShift 3s ease infinite;
}

/* Button Press Animation */
.btn-press {
    transition: transform 0.1s ease;
}

.btn-press:active {
    transform: scale(0.95);
}

/* Card Flip Animation */
.card-flip {
    perspective: 1000px;
}

.card-flip-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s;
    transform-style: preserve-3d;
}

.card-flip.flipped .card-flip-inner {
    transform: rotateY(180deg);
}

.card-flip-front,
.card-flip-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
}

.card-flip-back {
    transform: rotateY(180deg);
}

/* Typewriter Effect */
.typewriter {
    overflow: hidden;
    border-right: 0.15em solid var(--primary-500);
    white-space: nowrap;
    margin: 0 auto;
    letter-spacing: 0.15em;
    animation: typing 3.5s steps(40, end), blink 0.75s step-end infinite;
}

/* Neural Network Animation */
.neural-network {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
}

.neuron {
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--primary-500);
    border-radius: 50%;
    animation: neuronPulse 2s ease-in-out infinite;
}

.connection {
    position: absolute;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--primary-500), transparent);
    transform-origin: left center;
    animation: connectionFlow 3s linear infinite;
}

@keyframes connectionFlow {
    0% {
        transform: scaleX(0);
        opacity: 0;
    }
    50% {
        transform: scaleX(1);
        opacity: 1;
    }
    100% {
        transform: scaleX(0);
        opacity: 0;
    }
}

/* AI Processing Animation */
.ai-processing {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
}

.ai-processing-dot {
    width: 8px;
    height: 8px;
    background: var(--primary-500);
    border-radius: 50%;
    animation: processingDots 1.4s ease-in-out infinite;
}

.ai-processing-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.ai-processing-dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes processingDots {
    0%, 60%, 100% {
        transform: translateY(0);
    }
    30% {
        transform: translateY(-10px);
    }
}

/* Page Transitions */
.page-transition-enter {
    opacity: 0;
    transform: translateY(20px);
}

.page-transition-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 300ms, transform 300ms;
}

.page-transition-exit {
    opacity: 1;
}

.page-transition-exit-active {
    opacity: 0;
    transition: opacity 300ms;
}

/* Theme Transition */
.theme-transition * {
    transition: background-color var(--transition-base), 
                border-color var(--transition-base),
                color var(--transition-base) !important;
}

/* Responsive Animation Adjustments */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
