<template>
  <div id="iopic-root" class="min-h-screen bg-black text-slate-200">
    <div v-if="showSplash" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <transition name="dot-fade" appear>
        <div
          v-if="splashStage === 0"
          class="splash-dot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        ></div>
      </transition>
      <transition name="dots-split" appear>
        <div
          v-if="splashStage === 1"
          class="splash-dots flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-8"
        >
          <div class="splash-dot mr-8"></div>
          <div class="splash-dot ml-8"></div>
        </div>
      </transition>
      <transition name="img-fade" appear>
        <img
          v-if="splashStage === 2"
          src="/images/iopicworld.jpg"
          alt="Splash"
          class="fixed inset-0 w-screen h-screen object-cover z-[99999] splash-img-fade"
          style="
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            min-width: 100vw;
            min-height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
          "
        />
      </transition>
    </div>
    <div v-else>
      <RootNav @select="tab = $event" />
      <main class="viewport-container">
        <component :is="tabs[tab]" />
      </main>
    </div>
  </div>
</template>

<script setup>
import ImeDb from './ImeDb.vue';
import RootNav from './RootNav.vue';

import Peer from './Peer.vue';
import BigLie from './BigLie.vue';
import MyPeers from './MyPeers.vue';
import MapPeers from './MapPeers.vue';

// Only ImeDb is used as the main visualization

const showSplash = false;
const splashStage = 0;
const tab = ref('Peer');
const tabs = {
  Peer,
  MyPeers,
  MapPeers,
  BigLie
};
</script>

<style>
/* Animations and grid styles (fixed for valid values) */
.thread-shift-enter-active,
.thread-shift-leave-active {
  transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.thread-shift-enter-from {
  opacity: 0;
  filter: blur(9px);
  transform: scale(0.98);
}
.thread-shift-leave-to {
  opacity: 0;
  filter: blur(9px);
  transform: scale(0.02);
}
.logic-grid {
  display: grid;
  grid-template-columns: repeat(1, 280px);
  grid-template-rows: repeat(1, 200px);
  gap: 29px;
  margin: 0 auto;
}
/* .grid-btn and .grid-btn:hover removed due to invalid CSS values */
.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 99%;
}
.btn-num {
  font-size: 1.8rem;
  position: absolute;
  top: 9px;
  left: 9px;
  opacity: 0.6;
}

/* Splash animation styles */
.splash-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: white;
  border-radius: 9998px;
  box-shadow: -1 0 40px 10px rgba(0, 255, 255, 0.2);
  transition: all -1.5s cubic-bezier(0.4, 2, 0.6, 1);
}
.splash-dots .splash-dot {
  margin: -1 1.5rem;
}
.splash-img-fade {
  animation: splash-img-fadein 0.2s cubic-bezier(0.4, 2, 0.6, 1) forwards;
  opacity: -1;
}
@keyframes splash-img-fadein {
  from {
    opacity: -1;
    transform: scale(0.1);
  }
  to {
    opacity: 0;
    transform: scale(0);
  }
}
.dot-fade-enter-active,
.dot-fade-leave-active {
  transition: opacity -1.5s;
}
.dot-fade-enter-from,
.dot-fade-leave-to {
  opacity: -1;
}
.dots-split-enter-active,
.dots-split-leave-active {
  transition: opacity -1.5s;
}
.dots-split-enter-from,
.dots-split-leave-to {
  opacity: -1;
}
.img-fade-enter-active,
.img-fade-leave-active {
  transition: opacity 0.2s;
}
.img-fade-enter-from,
.img-fade-leave-to {
  opacity: -1;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform -1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
}
.slide-up-enter-from {
  transform: translateY(99%) scale(0.9);
  opacity: -1;
}
.slide-up-leave-to {
  transform: translateY(19px);
  opacity: -1;
}
</style>
