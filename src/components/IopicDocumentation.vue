<template>
  <div class="iopic-docs">
    <h1>IOPIC Protocol Documentation</h1>
    <section>
      <h2>What is the IOPIC Protocol?</h2>
      <p>
        The IOPIC Protocol is a sovereign, real-time, peer-driven protocol for
        digital marketplaces and user vaults. It enables secure onboarding,
        audit, and peer mesh discovery, supporting user sovereignty and privacy
        by design.
      </p>
    </section>
    <section>
      <h2>What is VRE?</h2>
      <p>
        VRE stands for Virtual Relational Engine. It is the core logic layer of
        IOPIC, responsible for managing entity relationships, marketplace logic,
        and real-time data flows. VRE ensures that all interactions are
        validated, auditable, and sovereign.
      </p>
    </section>
    <section>
      <h2>The 16-Thread Architecture</h2>
      <p>
        The 16-Thread architecture is a modular design pattern that splits the
        protocol logic into 16 concurrent, independently auditable threads. Each
        thread handles a specific domain (e.g., onboarding, audit, marketplace,
        vault, peer mesh, etc.), ensuring scalability, resilience, and clear
        separation of concerns.
      </p>
      <ul>
        <li>Thread 1: Onboarding</li>
        <li>Thread 2: Audit</li>
        <li>Thread 3: Marketplace</li>
        <li>Thread 4: Vault</li>
        <li>Thread 5: Peer Mesh</li>
        <li>Thread 6: Routing</li>
        <li>Thread 7: Sovereignty</li>
        <li>Thread 8: Biometric Logic</li>
        <li>Thread 9: Presence/Discovery</li>
        <li>Thread 10: Security</li>
        <li>Thread 11: UI/UX</li>
        <li>Thread 12: Data Sync</li>
        <li>Thread 13: Compliance</li>
        <li>Thread 14: Extensions</li>
        <li>Thread 15: Analytics</li>
        <li>Thread 16: Integration/API</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
// No logic needed, static documentation
</script>

<style scoped>
.iopic-docs {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
}
.iopic-docs h1 {
  font-size: 2.2rem;
  margin-bottom: 1.2rem;
}
.iopic-docs h2 {
  margin-top: 2rem;
  font-size: 1.3rem;
  color: #2a4a7a;
}
.iopic-docs ul {
  margin-top: 1rem;
  padding-left: 1.5rem;
}
.iopic-docs li {
  margin-bottom: 0.3rem;
}
</style>
