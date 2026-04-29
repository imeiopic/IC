<template>
  <CContainer fluid class="py-4">
    <CRow>
      <CCol md="12">
        <CCard class="mb-4">
          <CCardHeader>Crypto Wallet (MetaMask)</CCardHeader>
          <CCardBody>
            <div v-if="!walletAddress">
              <button @click="connectWallet" class="btn btn-primary">Connect MetaMask</button>
            </div>
            <div v-else>
              <div><strong>Wallet Address:</strong> {{ walletAddress }}</div>
              <div v-if="isImeIopic">
                <strong>ETH Balance:</strong> {{ ethBalance }} ETH
              </div>
              <div class="mt-2">
                <input v-model="sendTo" placeholder="Recipient Address" class="form-control" style="margin-bottom:0.5rem;" />
                <input v-model="sendAmount" placeholder="Amount (ETH)" type="number" class="form-control" style="margin-bottom:0.5rem;" />
                <button @click="sendEth" class="btn btn-success">Send ETH</button>
              </div>
              <div class="mt-2">
                <button @click="copyAddress" class="btn btn-secondary">Copy My Address (for receiving)</button>
                <span v-if="copySuccess" style="color:green; margin-left:0.5rem;">Copied!</span>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CRow>
      <CCol md="3">
        <CCard class="mb-4">
          <CCardHeader>Ime Iopic Profile</CCardHeader>
          <CCardBody>
            <div class="text-center mb-3">
              <CImage src="../assets/images/imeiopic.png" roundedCircle width="96" height="96" />
              <h5 class="mt-2">{{ person.name }}</h5>
              <p class="text-muted">{{ person.description }}</p>
            </div>
            <div><strong>IOWB:</strong> {{ person.iowb.accountNumber }} ({{ person.iowb.balance }} IO$)</div>
            <div><strong>Bank:</strong> {{ person.realWorldBank?.bankName }}</div>
            <div><strong>Payment Methods:</strong>
              <ul>
                <li v-for="pm in person.paymentMethods" :key="pm.label">
                  <strong>{{ pm.label }}:</strong> {{ pm.details }}
                </li>
              </ul>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md="9">
        <CCard>
          <CCardHeader>Admin Dashboard</CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md="4">
                <CCard class="mb-3 bg-info text-white">
                  <CCardBody>
                    <h6>CoinX Count</h6>
                    <h3>{{ person.coinxs.length }}</h3>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol md="4">
                <CCard class="mb-3 bg-success text-white">
                  <CCardBody>
                    <h6>IOWB Balance</h6>
                    <h3>{{ person.iowb.balance }} IO$</h3>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol md="4">
                <CCard class="mb-3 bg-warning text-dark">
                  <CCardBody>
                    <h6>Bank</h6>
                    <h3>{{ person.realWorldBank?.bankName }}</h3>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <CRow>
              <CCol>
                <CCard class="mb-3">
                  <CCardHeader>CoinX List</CCardHeader>
                  <CCardBody>
                    <ul>
                      <li v-for="coinx in person.coinxs" :key="coinx.id">
                        {{ coinx.id }} ({{ coinx.contract.type }})
                      </li>
                    </ul>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CRow>
      <CCol md="12">
        <MyWorld />
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CImage } from '@coreui/vue';
import MyWorld from './MyWorld.vue';
import { person01 } from '../personModel';
const person = person01;

const walletAddress = ref<string | null>(null);
const ethBalance = ref<string>('0');
const sendTo = ref('');
const sendAmount = ref('');
const copySuccess = ref(false);
const isImeIopic = computed(() => person.name && person.name.trim().toLowerCase() === 'ime iopic');

async function connectWallet() {
  if ((window as any).ethereum) {
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      walletAddress.value = accounts[0];
      getBalance();
    } catch (err) {
      alert('MetaMask connection failed.');
    }
  } else {
    alert('MetaMask not detected. Please install MetaMask.');
  }
}

async function getBalance() {
  if ((window as any).ethereum && walletAddress.value) {
    const provider = new (window as any).ethers.providers.Web3Provider((window as any).ethereum);
    const balance = await provider.getBalance(walletAddress.value);
    ethBalance.value = (parseFloat((window as any).ethers.utils.formatEther(balance))).toFixed(4);
  }
}

async function sendEth() {
  if (!sendTo.value || !sendAmount.value) {
    alert('Enter recipient and amount.');
    return;
  }
  try {
    const provider = new (window as any).ethers.providers.Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();
    const tx = await signer.sendTransaction({
      to: sendTo.value,
      value: (window as any).ethers.utils.parseEther(sendAmount.value)
    });
    alert('Transaction sent! Hash: ' + tx.hash);
    getBalance();
  } catch (e) {
    alert('Transaction failed.');
  }
}

function copyAddress() {
  if (walletAddress.value) {
    navigator.clipboard.writeText(walletAddress.value);
    copySuccess.value = true;
    setTimeout(() => (copySuccess.value = false), 1500);
  }
}

onMounted(() => {
  if ((window as any).ethereum && (window as any).ethereum.selectedAddress) {
    walletAddress.value = (window as any).ethereum.selectedAddress;
    getBalance();
  }
});
</script>

<style scoped>
.bg-info {
  background-color: #39f !important;
}
.bg-success {
  background-color: #28a745 !important;
}
.bg-warning {
  background-color: #ffc107 !important;
}
</style>
