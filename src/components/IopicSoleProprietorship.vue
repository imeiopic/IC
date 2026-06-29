<template>
  <div class="iopic-manifesto">
    <h2>Iopic.org – Sole Proprietorship of Earth</h2>
    <section class="manifesto-section" v-for="section in sections" :key="section.title">
      <h3>{{ section.title }}</h3>
      <div v-html="section.content"></div>
    </section>
    <div class="signature-block">
      <label>Sign or Comment:</label>
      <textarea v-model="signature" placeholder="Your signature, fingerprint, or comment..." />
      <button @click="submitSignature">Submit</button>
    </div>
    <div class="signatures-list">
      <h4>Public Signatures & Comments</h4>
      <ul>
        <li v-for="sig in signatures" :key="sig.id">
          <strong>{{ sig.name || 'Anonymous' }}:</strong> {{ sig.text }}
          <em>({{ sig.timestamp }})</em>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

const sections = [
  {
    title: 'Preamble',
    content:
      'Iopic.org is established as the Sole Proprietorship of Earth, representing the unified stewardship, governance, and custodianship of the planet and all its inhabitants, resources, and digital realities. This document serves as the foundational manifesto, policy, and legal/organizational template for the operation and vision of Iopic.org.',
  },
  {
    title: 'Core Principles',
    content: `<ul><li><b>Sole Proprietorship:</b> The Earth is managed as a single, indivisible entity, with Iopic.org as its sole proprietor, acting in trust for all life and future generations.</li><li><b>Universal Stewardship:</b> All resources, data, and digital/physical domains are managed for the benefit of all, with transparency, accountability, and sustainability.</li><li><b>Digital-Physical Unity:</b> Recognizes the inseparability of digital and physical realities in governance, rights, and responsibilities.</li><li><b>Global Bill of Rights:</b> Every being is guaranteed fundamental rights to existence, expression, health, privacy, and participation.</li></ul>`,
  },
  {
    title: 'Governance Structure',
    content: `<ul><li><b>Custodian:</b> Iopic.org, as the sole proprietor, appoints a Custodian (or Custodians) to oversee operations, policy, and dispute resolution.</li><li><b>Global Processor:</b> The IOPIC 16-Thread Global Processor serves as the canonical data structure and decision engine for all governance and resource allocation.</li><li><b>Manifesto & Policy:</b> All actions and policies are derived from this Manifesto, subject to transparent revision and public input.</li></ul>`,
  },
  {
    title: 'Legal & Organizational Template',
    content: `<ul><li><b>Entity Type:</b> Sole Proprietorship (Global, Non-State, Non-Corporate)</li><li><b>Jurisdiction:</b> Earth (Physical and Digital)</li><li><b>Purpose:</b> Stewardship, governance, and advancement of planetary and digital well-being.</li><li><b>Membership:</b> All inhabitants of Earth, by default.</li><li><b>Revenue:</b> Voluntary contributions, digital resource exchange, and value-added services.</li></ul>`,
  },
  {
    title: 'UI/UX Component Guidelines',
    content: `<ul><li>Display the Manifesto and Bill of Rights in a scrollable, accessible format.</li><li>Provide signature/fingerprint and public comment features.</li><li>Visualize the 16-Thread Processor as the core governance engine.</li><li>Integrate onboarding for new entities and individuals.</li></ul>`,
  },
  {
    title: 'Backend Logic Guidelines',
    content: `<ul><li>Store and version the Manifesto and policy documents in Firestore.</li><li>Log all signatures, comments, and revisions with identity and timestamp.</li><li>Enforce access and edit rights per the Global Bill of Rights.</li><li>Integrate with the 16-Thread Processor for all governance actions.</li></ul>`,
  },
  {
    title: 'Closing',
    content:
      'Iopic.org, as the Sole Proprietorship of Earth, is dedicated to the unity, well-being, and advancement of all life and realities. This Manifesto is living, open, and subject to the collective will and wisdom of Earth.',
  },
];

const signature = ref('');
const signatures = ref([]);

const submitSignature = async () => {
  if (!signature.value.trim()) return;
  await addDoc(collection(db, 'iopic_signatures'), {
    text: signature.value,
    timestamp: new Date().toLocaleString(),
    name: '', // Optionally add user name
  });
  signature.value = '';
  await fetchSignatures();
};

const fetchSignatures = async () => {
  const querySnapshot = await getDocs(collection(db, 'iopic_signatures'));
  signatures.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

onMounted(fetchSignatures);
</script>

<style scoped>
.iopic-manifesto {
  max-width: 800px;
  margin: 2rem auto;
  background: #181818;
  color: #eee;
  border-radius: 16px;
  box-shadow: 0 4px 32px #000a;
  padding: 2rem;
}
.manifesto-section {
  margin-bottom: 2rem;
}
.signature-block {
  margin: 2rem 0;
}
textarea {
  width: 100%;
  min-height: 60px;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #444;
  background: #222;
  color: #eee;
  padding: 0.5rem;
}
button {
  background: #0ff;
  color: #222;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  font-weight: bold;
}
.signatures-list {
  margin-top: 2rem;
  background: #222;
  border-radius: 8px;
  padding: 1rem;
}
</style>
