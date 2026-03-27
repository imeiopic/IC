<template>
  <h1></h1>
  <div class="about">
    <router-link to="/" class="back-link">← Back</router-link>
    <iframe id="scaled-frame" src="https://docs.google.com/document/d/e/2PACX-1vQQUrr7_lYbk-K5KHV3rizHPhCi_Ovxujgx3g2PLyvhg8ciFkC7x4mr7X0YnJl-T4beHy2PcTAbAxmL/pub?embedded=true" width="100%" height="600" frameborder="0" style="border:none;"></iframe>
  </div>
</template>

<script setup lang="ts">
// No script logic needed for static about page
</script>

<style scoped>
.about {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  padding: 0;
  overflow: hidden;
  background: #fff;
  color: #222;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}
.back-link:hover {
  text-decoration: underline;
}

#scaled-frame {
  width: 100vw;
  min-width: 100%;
  height: 80vh;
  border: none;
  outline: none;
  display: block;
  margin-left: auto;
  margin-right: auto;
  /* Responsive scaling */
  zoom: 1;
  -webkit-transform: none;
  -moz-transform: none;
  -o-transform: none;
  transform: none;
}
.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}
.back-link:hover {
  text-decoration: underline;
}
@media (max-width: 900px) {
  .about {
    width: 100vw;
    min-width: 0;
  }
  #scaled-frame {
    width: 100vw;
    min-width: 0;
    height: 60vh;
  }
}
</style>
