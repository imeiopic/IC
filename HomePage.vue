<template>
  <Navbar />
  <div class="home-page">
    <header class="hero">
      <h1>Welcome to Our Application</h1>
      <p>
        This is the start of something amazing. Build your next big thing with our modern stack.
      </p>
      <div class="actions">
        <button @click="getStarted" class="btn primary">Get Started</button>
        <button @click="learnMore" class="btn secondary">Learn More</button>
      </div>
    </header>

    <section class="features">
      <div v-for="feature in features" :key="feature.title" class="feature-card">
        <span class="icon">{{ feature.icon }}</span>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Navbar from '@components/Navbar.vue';

/**
 * Reactive list of features to display on the home page.
 */
const features = ref([
  { title: 'Fast', description: 'Optimized for performance and speed.', icon: '⚡' },
  { title: 'Secure', description: 'Built with security in mind from day one.', icon: '🛡️' },
  { title: 'Scalable', description: 'Grows with your user base effortlessly.', icon: '📈' },
]);

const getStarted = () => {
  console.log('Get Started clicked');
  // Implement navigation or modal logic here
};

const learnMore = () => {
  console.log('Learn More clicked');
  // Implement scroll to section or navigation logic here
};
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  border-radius: 16px;
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 1.5rem;
  font-weight: 800;
}

.hero p {
  font-size: 1.25rem;
  opacity: 0.95;
  max-width: 600px;
  margin: 0 auto 2.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn.primary {
  background-color: white;
  color: #6e8efb;
}

.btn.secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2.5rem;
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: #6e8efb;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
}

.icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}
</style>
