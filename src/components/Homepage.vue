<template>
  <div class="homepage">
    <h1>Welcome to the IOPIC.WORLD</h1>
    <h2>The beginning of logical digital reality</h2>
     <img class="logo" src="../assets/images/iologo.png" alt="IOPIC Logo" style="width:100px; margin-bottom:8rem;" />
    
   
    <a class="enter-io" @click.prevent="onEnter" href="#"><img class="enter-image" src="../assets/images/entertheworld.png" alt="Enter the World" /></a>
    <div class="auth-options">
      <router-link to="/login" class="auth-link">Login</router-link>
      <span class="divider">or</span>
      <router-link to="/signup" class="auth-link">Sign Up</router-link>
    </div>
    <div style="margin-top:2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
      <router-link to="/about" class="about-link">About</router-link>
      <router-link to="/connections" class="connections-link" style="display:inline-block;">
        <img src="../assets/images/myworld.png" alt="My World" style="width:160px; height:160; object-fit:contain; display:block; margin:0 auto;" />
        <span style="display:block; text-align:center; color:#fff; margin-top:0.5rem;">My World</span>
      </router-link>
    </div>
    <!-- Removed QR code for myIdentifier: not defined in this component -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'Homepage',
  setup() {
    const router = useRouter();
    const onEnter = () => {
      router.push('/myworld');
    };
    return { onEnter };
  }
});
</script>

<style scoped>
  .homepage {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 80vh;
    background: url('../assets/images/iocreation.png') no-repeat center center;
    background-size: cover;
    padding-top: 3rem;
  }
  .homepage h1 {
    color: #fff;
    margin-bottom: 1rem;
    text-shadow: 0 2px 8px #000a;
  }
  .homepage h2 {
    color: #eee;
    margin-bottom: 2rem;
    text-shadow: 0 1px 4px #0007;
  }
  .enter-image {
    width: 250px;
    max-width: 90vw;
    border-radius: 12px;
    margin-bottom: 2rem;
    margin-top: 1rem;
    box-shadow: 0 4px 24px #0004;
  }
  .enter-btn {
    padding: 1rem 2.5rem;
    font-size: 1.3rem;
    background: #1a73e8;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px #0002;
    transition: background 0.2s;
  }
  .enter-btn:hover {
    background: #155ab6;
  }
  .auth-options {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .auth-link {
    color: #fff;
    background: #222a;
    padding: 0.5rem 1.2rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: background 0.2s;
  }
  .auth-link:hover {
    background: #1a73e8;
    color: #fff;
  }
  .divider {
    color: #fff;
    font-size: 1.1rem;
    opacity: 0.7;
  }
</style>

<link rel="preload" as="doc" href="https://docs.google.com/document/d/e/2PACX-1vQQUrr7_lYbk-K5KHV3rizHPhCi_Ovxujgx3g2PLyvhg8ciFkC7x4mr7X0YnJl-T4beHy2PcTAbAxmL/pub?embedded=true" />
