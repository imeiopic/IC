<template>
  <nav :class="['navbar', { 'navbar-scrolled': isScrolled, 'navbar-open': isMenuOpen }]">
    <div class="navbar-brand">
      <img src="/logo.svg" alt="ModernStack Logo" class="navbar-logo" />
      <span class="brand-text">ModernStack</span>
    </div>

    <button class="navbar-toggle" @click="isMenuOpen = !isMenuOpen" aria-label="Toggle navigation">
      <span class="hamburger-bar"></span>
      <span class="hamburger-bar"></span>
      <span class="hamburger-bar"></span>
    </button>

    <ul :class="['nav-links', { 'is-open': isMenuOpen }]">
      <li><a href="#home" @click="isMenuOpen = false">Home</a></li>
      <li><a href="#features" @click="isMenuOpen = false">Features</a></li>
      <li><a href="#about" @click="isMenuOpen = false">About</a></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isScrolled = ref(false);
const isMenuOpen = ref(false);

const handleScroll = () => {
  // Change state if scrolled more than 20px
  isScrolled.value = window.scrollY > 20;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.navbar-scrolled {
  background-color: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(0, 229, 255, 0.1);
}

.navbar-scrolled .navbar-toggle .hamburger-bar {
  background-color: #ffffff;
}

.navbar-scrolled .nav-links a {
  color: #ffffff;
}

.navbar-scrolled .navbar-brand {
  color: #00e5ff;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.navbar-logo {
  height: 24px; /* Default size for mobile devices */
  width: auto;
  /* This forces a dark logo to appear white on the transparent hero background */
  filter: brightness(0) invert(1);
  transition: all 0.3s ease;
  animation: logoEntrance 0.8s ease-out forwards;
}

@media (min-width: 1024px) {
  .navbar-logo {
    height: 40px; /* Larger size for desktop screens */
  }
}

.navbar-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger-bar {
  width: 100%;
  height: 3px;
  background-color: #ffffff;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-links li {
  opacity: 0;
  animation: navLinkFade 0.5s ease forwards;
}

.nav-links li:nth-child(1) {
  animation-delay: 0.2s;
}
.nav-links li:nth-child(2) {
  animation-delay: 0.3s;
}
.nav-links li:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes navLinkFade {
  from {
    opacity: 0;
    transform: translateY(-15px);
    text-shadow: none;
  }
  70% {
    text-shadow: 0 0 15px rgba(0, 229, 255, 0.7);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    text-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
  }
}

@keyframes logoEntrance {
  from {
    opacity: 0;
    transform: scale(0.3);
    filter: brightness(0) invert(1) drop-shadow(0 0 0 rgba(0, 229, 255, 0));
  }
  70% {
    transform: scale(1.1);
    filter: brightness(0) invert(1) drop-shadow(0 0 20px rgba(0, 229, 255, 0.8));
  }
  to {
    opacity: 1;
    transform: scale(1);
    filter: brightness(0) invert(1) drop-shadow(0 0 10px rgba(0, 229, 255, 0.4));
  }
}

@media (max-width: 1023px) {
  .navbar-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 80%;
    height: 100vh;
    background-color: rgba(5, 5, 5, 0.98);
    backdrop-filter: blur(15px);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  }

  .nav-links.is-open {
    right: 0;
  }

  .nav-links a {
    color: #ffffff;
    font-size: 1.5rem;
  }

  /* Animate hamburger to X when open */
  .navbar-open .hamburger-bar:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
    background-color: #00e5ff;
  }
  .navbar-open .hamburger-bar:nth-child(2) {
    opacity: 0;
  }
  .navbar-open .hamburger-bar:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
    background-color: #00e5ff;
  }
}

.nav-links a {
  text-decoration: none;
  color: #ffffff;
  font-weight: 500;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.nav-links a:hover {
  color: #00e5ff;
  text-shadow: 0 0 12px rgba(0, 229, 255, 0.8);
}

.navbar-scrolled .navbar-logo {
  filter: none; /* Returns the logo to its original colors on the white background */
}
</style>
