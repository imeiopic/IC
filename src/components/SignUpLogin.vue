<template>
  <div class="signup-login-page">
    <div class="gateway-card">
      <img src="../assets/images/iologo.png" alt="IOPIC Logo" class="logo" />
      <h1 class="glitch" data-text="Identity Required">Identity Required</h1>
      <p 
        class="description rgb-text" 
        data-text="You have reached the threshold of the Iopic World. Please authenticate to proceed into the logical digital reality."
      >
        You have reached the threshold of the Iopic World. 
        Please authenticate to proceed into the logical digital reality.
      </p>
      
      <div class="actions">
        <router-link to="/login" class="auth-btn login">Log In</router-link>
        <router-link to="/signup" class="auth-btn signup">Sign Up</router-link>
      </div>
      
      <router-link to="/" class="back-link">← Return to Gate</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Logic for the Gateway page
</script>

<style scoped>
.signup-login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  width: 100vw;
  background: #000 url('../assets/images/iocreation.png') no-repeat center center;
  background-size: contain;
  color: white;
  text-align: center;
  overflow: hidden;
  position: relative;
}

.signup-login-page::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.15) 50%
  );
  background-size: 100% 4px;
  z-index: 10;
  pointer-events: none;
  animation: flicker 0.15s infinite;
}

@keyframes flicker {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

.gateway-card {
  background: rgba(0, 0, 0, 0.85);
  padding: clamp(1.5rem, 5vw, 3rem);
  border-radius: 16px;
  border: 1px solid #1a73e8;
  width: 90%;
  max-width: 500px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(26, 115, 232, 0.3);
}

.logo {
  width: 80px;
  margin-bottom: 1.5rem;
}

.glitch {
  position: relative;
  font-size: clamp(1.5rem, 6vw, 2.2rem);
  color: #fff;
  margin-bottom: 1rem;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
}
.glitch::before {
  color: #0ff;
  z-index: -1;
  animation: glitch-anim 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
}
.glitch::after {
  color: #f0f;
  z-index: -2;
  animation: glitch-anim 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both infinite;
}

@keyframes glitch-anim {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

.description {
  margin: 1rem 0 2rem;
  font-size: 1rem;
  color: #ccc;
  line-height: 1.5;
}

/* Subtle Chromatic Aberration (RGB Shift) */
.rgb-text {
  position: relative;
  display: inline-block;
}
.rgb-text::before,
.rgb-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.6;
}
.rgb-text::before {
  color: #ff0000; /* Red shift */
  animation: rgb-breathe-red 3s ease-in-out infinite;
  z-index: -1;
}
.rgb-text::after {
  color: #00ffff; /* Cyan shift */
  animation: rgb-breathe-cyan 3s ease-in-out infinite;
  z-index: -2;
}

@keyframes rgb-breathe-red {
  0%, 100% { transform: translateX(-1.2px); opacity: 0.6; }
  50% { transform: translateX(-2.5px); opacity: 0.3; }
}

@keyframes rgb-breathe-cyan {
  0%, 100% { transform: translateX(1.2px); opacity: 0.6; }
  50% { transform: translateX(2.5px); opacity: 0.3; }
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.auth-btn {
  padding: 0.8rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.2s;
}
.login { background: #1a73e8; color: white; }
.signup { border: 1px solid #1a73e8; color: #1a73e8; }
.auth-btn:hover { transform: scale(1.05); }
.back-link { color: #666; text-decoration: none; font-size: 0.85rem; }
</style>