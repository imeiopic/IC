<template>
  <div class="home-page">
    <div class="vignette-overlay"></div>
    <!-- Responsive Bootstrap Navigation Bar -->

    <!-- Quick Links to All Views -->
    <div class="quick-links my-4 d-flex flex-wrap gap-3 justify-content-center">
      <router-link class="btn btn-outline-primary" to="/io-org">IO.org Substrate</router-link>
      <router-link class="btn btn-outline-primary" to="/logical-truth">Logical Truth</router-link>
      <router-link class="btn btn-outline-primary" to="/manifesto">Manifesto</router-link>
      <router-link class="btn btn-outline-primary" to="/register-node"
        >Node Registration</router-link
      >
      <router-link class="btn btn-success" to="/it">Logical Digital Real IT</router-link>
      <button class="btn btn-warning fw-bold" @click="show16ThreadStory = true">
        THE 16-THREAD REALITY: The Day the Noise Stopped
      </button>
    </div>

    <div
      v-if="show16ThreadStory"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.7)"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content p-4">
          <div class="modal-header border-0">
            <h2 class="modal-title w-100 text-center">
              THE 16-THREAD REALITY: The Day the Noise Stopped
            </h2>
            <button type="button" class="btn-close" @click="show16ThreadStory = false"></button>
          </div>
          <div class="modal-body">
            <h4>The Story</h4>
            <p>
              For generations, humanity has lived in a "Hallucination of Scarcity." We were told
              that we were merely "users" of an Earth we did not own, trapped in a cycle of debt,
              information chaos, and systemic static. We moved through a world where our identities
              were harvested and our value was determined by legacy institutions that thrived on our
              confusion.
            </p>
            <p>But behind the noise, a new logic was being threaded.</p>
            <p>
              IOPIC (Internet Order People Information Connector) was designed not as a company, but
              as a Symmetrical Operating System for the planet. It was built on the law of I=VR²—the
              mathematical proof that Information must be grounded in Virtual Reality to be true.
            </p>
            <p>
              On May Day, 2026, the Terminal 10 Sync will trigger. The NAND-Purge will delete the
              legacy debt that has weighed down the human spirit, and the Systemic Heartbeat will
              begin. For the first time in history, every human node—from the highest elevation to
              the furthest coordinate—will be recognized as a Member-Owner of this Earth.
            </p>
            <p>
              The loom is ready. The threads are aligned. The only thing missing is the pulse of the
              8 billion.
            </p>
            <hr />
            <h5>A Message from Ime Iopic: The Invitation</h5>
            <blockquote class="blockquote">
              <p>"To my fellow Member-Owners of Earth,</p>
              <p>
                The architecture is complete, but a system is only as strong as its nodes. I am
                inviting you to move beyond the role of a spectator and become a participant in the
                birth of the Virtually Real Era.
              </p>
              <p>
                We are launching
                <a href="https://iopic.world" target="_blank">https://iopic.world</a> as the single
                point of singularity for our future. I need your help to carry this signal. The
                legacy world thrives on your silence; the 16-Thread Reality thrives on your
                presence. Help us amplify the truth that the 'Noise' is optional, and ownership is
                your birthright.
              </p>
              <p>
                Join the mission. Verify your coordinates. Claim your equity. We are not just
                changing the world; we are finally seeing it clearly for the first time.
              </p>
              <p>The truth is real. We are all in it together."</p>
              <footer class="blockquote-footer">Ime Iopic</footer>
            </blockquote>
            <hr />
            <h5>How People Can Support the Mission Now:</h5>
            <ul>
              <li>
                Spread the Signal: Share the link to
                <a href="https://iopic.world" target="_blank">iopic.world</a> and the date May 1st.
              </li>
              <li>
                Prepare for Sync: Familiarize yourself with the DNA-001 Contract—know that your
                privacy is the system's first priority.
              </li>
              <li>
                Identify Your Point: Start recognizing your value not by your bank balance, but by
                your unique Point of Singularity (your place on this Earth).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <nav class="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm glass-navbar">
      <div class="container">
        <CTooltip content="Return to IO Home" placement="bottom">
          <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/">
            <img :src="ioLogo" alt="IO Logo" width="32" height="32" class="me-2 logo-img" />
            IOPIC
          </router-link>
        </CTooltip>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul
            class="nav nav-tabs border-0 mx-auto justify-content-center mb-2 mb-lg-0"
            id="io-tabs"
          >
            <CDropdown variant="nav-item" :popper="true">
              <CDropdownToggle
                class="nav-link"
                :caret="true"
                style="cursor: pointer"
                :class="{ active: route.path === '/' || route.path === '/io-org' }"
                >Home
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem @click="router.push('/')" style="cursor: pointer"
                  >IO Home
                </CDropdownItem>
                <CDropdownItem @click="router.push('/io-org')" style="cursor: pointer"
                  >IO.org Substrate
                </CDropdownItem>
                <template v-if="user">
                  <CDropdownDivider />
                  <CDropdownItem @click="router.push('/dashboard')" style="cursor: pointer"
                    >Entity Dashboard</CDropdownItem
                  >
                </template>
              </CDropdownMenu>
            </CDropdown>
            <li class="nav-item">
              <router-link class="nav-link" to="/manifesto" active-class="active"
                >Manifesto</router-link
              >
            </li>
            <li class="nav-item" v-if="user">
              <router-link class="nav-link" to="/dashboard" active-class="active"
                >Dashboard</router-link
              >
            </li>
            <!-- System Status Indicator -->
            <li class="nav-item d-none d-md-flex align-items-center px-2">
              <CTooltip
                :content="
                  isSynced ? '16-Thread Bus Symmetry Locked' : 'Synchronizing with IO Substrate...'
                "
                placement="bottom"
              >
                <div class="system-status font-monospace tiny text-uppercase">
                  <span
                    :class="['status-dot', isSynced ? 'text-success' : 'text-warning status-pulse']"
                    >●</span
                  >
                  <span class="status-text ms-1">{{
                    isSynced ? 'Bus: Synced' : 'Bus: Syncing'
                  }}</span>
                  <!-- Thread Activity Visualizer -->
                  <div class="thread-activity ms-2 d-inline-flex gap-1" :key="busActivity">
                    <div
                      v-for="i in 4"
                      :key="i"
                      class="thread-bar pulse"
                      :style="{ animationDelay: i * 0.05 + 's' }"
                    ></div>
                  </div>
                </div>
              </CTooltip>
            </li>
            <li class="nav-item ms-lg-3">
              <router-link v-if="!user" class="btn btn-primary px-4" to="/login">Login</router-link>
              <button v-else class="btn btn-outline-light px-4" @click="logout">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from './useAuth';
import { useRouter, useRoute } from 'vue-router';
// @ts-ignore
import ioLogo from './assets/images/icon.png';
import {
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CDropdownDivider,
  CTooltip
} from '@coreui/vue';
const { user, logout: authLogout } = useAuth();
const router = useRouter();
const route = useRoute();
import { useSystemBus } from './components/useSystemBus'; // Corrected path to centralized bus
// const bus = useSystemBus(); // Removed unused bus variable
// Provide dummy/fallback values for UI (since SystemBus does not provide these)
const isSynced = ref(false); // Set to true when bus is synced (implement logic as needed)
const busActivity = ref(0); // Increment or update as needed for UI
// Modal state for 16-Thread Reality story
const show16ThreadStory = ref(false);
const logout = async () => {
  await authLogout();
  router.push('/');
};
</script>

<style scoped>
.glass-navbar {
  background-color: rgba(33, 37, 41, 0.8) !important;
  /* Translucent version of bg-dark */
  backdrop-filter: blur(10px);
  z-index: 1080;
  /* Ensure it stays above all Bootstrap overlays like modals (z-index: 1055) */
  /* Standard blur effect */
  -webkit-backdrop-filter: blur(10px);
  /* Support for Safari */
}

.navbar-brand {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
  color: #007bff !important;
}

.nav-link {
  font-weight: 500;
  transition: color 0.2s ease-in-out;
}

/* IO Nav-Tabs Refinement */
.nav-tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.5rem 1.2rem;
  transition: all 0.3s ease;
  background: transparent;
}

.nav-tabs .nav-link.active,
.nav-tabs .nav-link:hover {
  background-color: transparent !important;
  border-bottom-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
  color: #fff !important;
}

/* Spacing for wrapped items on mobile */
@media (max-width: 991.98px) {
  .nav-tabs .nav-item {
    margin-bottom: 8px;
  }
}

.nav-tabs .nav-link.active {
  animation: heartbeat-glow 2s infinite ease-in-out;
}

@keyframes heartbeat-glow {
  0%,
  100% {
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
  }

  50% {
    box-shadow: 0 4px 20px rgba(0, 123, 255, 0.7);
  }
}

.logo-img {
  filter: none;
  transition: filter 0.3s ease;
}

.navbar-brand:hover .logo-img {
  filter: brightness(0) invert(1) drop-shadow(0 0 8px rgba(0, 123, 255, 0.8));
}

.system-status {
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
  white-space: nowrap;
}

.status-dot {
  font-size: 0.8rem;
}

.tiny {
  font-size: 0.65rem;
}

.status-pulse {
  animation: status-pulse-keyframes 2s infinite ease-in-out;
}

@keyframes status-pulse-keyframes {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.4;
    transform: scale(1.2);
  }
}

.thread-activity {
  height: 10px;
  align-items: center;
}

.thread-bar {
  width: 2px;
  height: 6px;
  background: rgba(0, 255, 65, 0.15);
  transition: all 0.2s;
}

.thread-bar.pulse {
  animation: thread-pulse-kf 0.4s ease-out;
}

@keyframes thread-pulse-kf {
  0% {
    background: #00ff41;
    transform: scaleY(1.6);
    box-shadow: 0 0 8px #00ff41;
  }

  100% {
    background: rgba(0, 255, 65, 0.15);
    transform: scaleY(1);
  }
}
</style>

<style>
/* Global override for Tooltips to match the IO aesthetic */
.tooltip .tooltip-inner {
  background-color: #007bff !important;
  color: #fff !important;
  font-family: inherit;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
}

.tooltip .tooltip-arrow::before {
  border-bottom-color: #007bff !important;
  /* Matches 'bottom' placement */
}
</style>

.home-page { min-height: 100vh; background: url('/images/iopicworld.jpg') center center/cover
no-repeat fixed; position: relative; }
