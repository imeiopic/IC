<template>
  <div>
    <div id="paypal-container-4MNRLGQXZWL2C"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  // Dynamically load the PayPal SDK script
  const script = document.createElement('script');
  script.src =
    'https://www.paypal.com/sdk/js?client-id=BAA6TOhnmJX_kjOHkJrOA-L1XDuJENPkh1vgwtzaJ6p1QfyyggiCMVHEfaTvRzZ5IMPaBE8qGWfuBFU4Y8&components=hosted-buttons&enable-funding=venmo&currency=USD';
  script.onload = () => {
    // @ts-ignore
    if (window.paypal && window.paypal.HostedButtons) {
      // @ts-ignore
      window.paypal
        .HostedButtons({
          hostedButtonId: '4MNRLGQXZWL2C'
        })
        .render('#paypal-container-4MNRLGQXZWL2C');
    }
  };
  document.body.appendChild(script);
});
</script>

<style scoped>
#paypal-container-4MNRLGQXZWL2C {
  margin: 2rem auto;
  max-width: 400px;
}
</style>
