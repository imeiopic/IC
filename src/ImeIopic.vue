<template>
  <div class="container py-5">
    <h2>Root Stewards List Editor</h2>
    <div v-if="loading" class="my-4 text-info">Loading...</div>
    <div v-else>
      <ul class="list-group mb-3">
        <li
          v-for="(name, idx) in stewards"
          :key="idx"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <input v-model="stewards[idx]" class="form-control me-2" />
          <button class="btn btn-danger btn-sm" @click="removeSteward(idx)">
            Remove
          </button>
        </li>
      </ul>
      <div class="input-group mb-3">
        <input
          v-model="newSteward"
          class="form-control"
          placeholder="Add new steward..."
          @keyup.enter="addSteward"
        />
        <button class="btn btn-success" @click="addSteward">Add</button>
      </div>
      <button class="btn btn-primary" @click="saveStewards" :disabled="saving">
        Save List
      </button>
      <span v-if="saving" class="ms-3 text-info">Saving...</span>
      <span v-if="success" class="ms-3 text-success">Saved!</span>
      <span v-if="error" class="ms-3 text-danger">{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db, auth } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const stewards = ref([]);
const newSteward = ref("");
const loading = ref(true);
const saving = ref(false);
const success = ref(false);
const error = ref("");

const defaultStewards = ["Noland S Newton", "John E Howard", "Meryl E Newton"];

async function loadStewards() {
  loading.value = true;
  error.value = "";
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const ref = doc(db, `nodes/${user.uid}`);
    const snap = await getDoc(ref);
    let list =
      snap.exists() && snap.data().rootStewards?.list
        ? snap.data().rootStewards.list
        : defaultStewards;
    stewards.value = [...list];
  } catch (e) {
    error.value = e.message || "Failed to load.";
  } finally {
    loading.value = false;
  }
}

function addSteward() {
  if (newSteward.value.trim()) {
    stewards.value.push(newSteward.value.trim());
    newSteward.value = "";
  }
}
function removeSteward(idx) {
  stewards.value.splice(idx, 1);
}

async function saveStewards() {
  saving.value = true;
  success.value = false;
  error.value = "";
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const ref = doc(db, `nodes/${user.uid}`);
    await setDoc(
      ref,
      { rootStewards: { list: stewards.value } },
      { merge: true },
    );
    success.value = true;
  } catch (e) {
    error.value = e.message || "Failed to save.";
  } finally {
    saving.value = false;
    setTimeout(() => (success.value = false), 2000);
  }
}

onMounted(loadStewards);
</script>

<style scoped>
.list-group-item input {
  flex: 1 1 auto;
}
</style>
