<template>
  <div class="homepage" :style="backgroundStyle">
    <RootNav @select="handleTabSelect" />

    <div class="bg-layer bg-scanlines" :class="{ 'glow-active': isHoveringEnter }"></div>

    <main class="hero-content">
      <transition name="fade-overlay" mode="out-in">
        
        <div v-if="activeTab === 'Default'" class="portal-view">
          <h1 class="glitch" data-text="WELCOME TO THE IOPIC AGE">WELCOME TO THE IOPIC AGE</h1>
          <h2 class="subtitle">The Virtually Real Earth is Now Active.</h2>

          <a
            v-if="!showNameInput"
            class="enter-io-portal"
            href="#"
            @click.prevent="showNameInput = true"
            @mouseenter="isHoveringEnter = true"
            @mouseleave="isHoveringEnter = false"
          >
            <div class="portal-frame">
              <img src="/images/enterio.png" alt="Enter IO" class="enter-asset" />
              <div class="enter-label">ENTER_THE_WORLD</div>
            </div>
          </a>

          <div v-if="showNameInput" class="onboarding-gate">
            <template v-if="!isIOsticAcknowledged">
              <button @click="handleAcknowledge" class="acknowledge-btn">
                I ACKNOWLEDGE MY EXISTENCE
              </button>
            </template>
            <template v-else>
              <div class="name-entry-wrapper">
                <input
                  v-model="username"
                  type="text"
                  placeholder="ENTER SOVEREIGN NAME"
                  @keyup.enter="tryRoute"
                  class="sovereign-input"
                />
                <button @click="tryRoute" class="init-btn">INITIALIZE_NODE</button>
              </div>
            </template>
          </div>
        </div>

        <div v-else-if="activeTab === 'BigLie'" class="component-view">
          <BigLie @close="activeTab = 'Default'" />
        </div>
        
        <div v-else class="component-view placeholder-text">
          <h2 class="text-glow">{{ activeTab.toUpperCase() }}_THREAD_ACTIVE</h2>
          <p>Handshaking with Cleveland Cluster...</p>
          <button @click="activeTab = 'Default'" class="back-btn">EXIT_TO_ROOT</button>
        </div>

      </transition>
    </main>

    <footer class="home-footer">
      <span>LAT: 41.4989° N | LONG: 81.6944° W</span>
      <span class="v-status">VELOCITY: 8.09V</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import RootNav from './RootNav.vue';
import BigLie from './BigLie.vue'; // Assuming the component we built earlier

const router = useRouter();
const showNameInput = ref(false);
const username = ref('');
const isIOsticAcknowledged = ref(false);
const isHoveringEnter = ref(false);
const activeTab = ref('Default');

const backgroundStyle = computed(() => ({
  backgroundImage: `url('/images/iosplashgod.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}));

const handleTabSelect = (tabName) => {
  activeTab.value = tabName;
  // If user selects 'BigLie', ensure the background dims for clarity
  isHoveringEnter.value = (tabName === 'BigLie');
};

const handleAcknowledge = () => {
  isIOsticAcknowledged.value = true;
};

const tryRoute = () => {
  if (username.value.trim()) {
    router.push('/onboarding');
  }
};
</script>

<style scoped>
/* Scoped Layout for Rootnav Integration */
.homepage {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: #000;
  overflow: hidden;
  position: relative;
  font-family: 'Space Mono', monospace;
  color: #fff;
}

.hero-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.component-view {
  width: 100%;
  max-width: 900px;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid #00e5ff;
  backdrop-filter: blur(20px);
}

.placeholder-text {
  text-align: center;
  border-color: #7fff00;
}

.back-btn {
  background: transparent;
  border: 1px solid #7fff00;
  color: #7fff00;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: 2rem;
}

/* Transitions */
.fade-overlay-enter-active, .fade-overlay-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-overlay-enter-from, .fade-overlay-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Reusing your established aesthetics */
.logo-pulse { width: 40px; animation: schumann-pulse 1.28s infinite; }
.v-status { color: #7fff00; margin-left: 20px; }
.text-glow { color: #00e5ff; text-shadow: 0 0 10px #00e5ff; }
/* ... existing portal styles ... */
</style>