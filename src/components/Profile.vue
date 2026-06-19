<template>
  <CContainer fluid class="profile-page p-4 bg-black min-vh-100 font-mono text-white">
    <header
      class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3"
    >
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-person-circle text-primary h3 m-0"></i>
        <h1 class="text-glow text-primary m-0 italic font-black">USER_PROFILE</h1>
      </div>
      <div class="equity-status text-end">
        <span class="tiny text-zinc-500 d-block">LIQUID_EQUITY</span>
        <span class="text-success fw-bold">{{ userStore.userEquity }} IO$</span>
      </div>
    </header>

    <CRow>
      <CCol lg="8" class="mx-auto">
        <CCard class="bg-zinc-900 border-primary text-white shadow-glow">
          <CCardHeader class="font-black italic text-primary">IDENTITY_MATRIX</CCardHeader>
          <CCardBody class="text-center pb-0">
            <div class="profile-picture-container mb-4">
              <img
                :src="localProfilePictureUrl || userStore.profilePictureUrl || '/default-profile.png'"
                alt="Profile Picture"
                class="profile-picture rounded-circle border border-primary"
              />
              <input
                type="file"
                ref="fileInput"
                @change="handleFileChange"
                accept="image/*"
                class="d-none"
              />
              <CButton color="primary" size="sm" variant="outline" @click="fileInput?.click()" class="mt-2">
                {{ localProfilePictureUrl ? 'CHANGE_IMAGE' : 'UPLOAD_IMAGE' }}
              </CButton>
            </div>
          </CCardBody>
          <CCardBody>
            <CForm @submit.prevent="updateProfile">
              <div class="mb-3">
                <CFormLabel class="text-zinc-400">USER_ID</CFormLabel>
                <CFormInput
                  type="text"
                  :value="userStore.currentUser?.uid"
                  class="bg-zinc-950 border-zinc-800 text-info font-mono"
                  plaintext
                  readonly
                />
              </div>
              <div class="mb-3">
                <CFormLabel class="text-zinc-400">EMAIL_ADDRESS</CFormLabel>
                <CFormInput
                  type="email"
                  :value="userStore.currentUser?.email"
                  class="bg-zinc-950 border-zinc-800 text-info font-mono"
                  plaintext
                  readonly
                />
              </div>
              <div class="mb-3">
                <CFormLabel class="text-zinc-400">ASSIGNED_ROLE</CFormLabel>
                <CFormInput
                  type="text"
                  :value="userStore.userRole?.toUpperCase()"
                  class="bg-zinc-950 border-zinc-800 text-info font-mono"
                  plaintext
                  readonly
                />
              </div>
              <div class="mb-4">
                <CFormLabel for="displayName" class="text-zinc-400">DISPLAY_NAME</CFormLabel>
                <CFormInput
                  id="displayName"
                  type="text"
                  v-model="userDisplayNameLocal"
                  placeholder="Enter your display name"
                  class="bg-zinc-950 border-zinc-800 text-info font-mono"
                />
              </div>
              <CButton color="primary" type="submit" class="w-100 py-2 font-black italic" :disabled="isProcessing">
                <span v-if="!isProcessing">UPDATE_PROFILE</span>
                <span v-else>TRANSMITTING_DATA...</span>
              </CButton>
              <CButton
                v-if="localProfilePictureUrl"
                color="success"
                type="button"
                class="w-100 py-2 font-black italic mt-2"
                @click="uploadProfilePicture"
                :disabled="isUploading"
              >
                <span v-if="!isUploading">SAVE_PROFILE_PICTURE</span>
                <span v-else>UPLOADING_IMAGE...</span>
              </CButton>
              <CButton
                v-if="userStore.profilePictureUrl && !localProfilePictureUrl"
                color="danger"
                type="button"
                class="w-100 py-2 font-black italic mt-2"
                @click="deleteProfilePicture"
                :disabled="isDeleting"
              >
                <span v-if="!isDeleting">DELETE_PROFILE_PICTURE</span>
                <span v-else>DELETING_IMAGE...</span>
              </CButton>

              <!-- Confirmation Dialog for Delete Profile Picture -->
              <CModal :visible="showConfirmDeleteDialog" @close="showConfirmDeleteDialog = false">
                <CModalHeader>
                  <CModalTitle>CONFIRM_DELETION</CModalTitle>
                </CModalHeader>
                <CModalBody>
                  ARE_YOU_SURE_YOU_WANT_TO_DELETE_YOUR_PROFILE_PICTURE? THIS_ACTION_CANNOT_BE_UNDONE.
                </CModalBody>
                <CModalFooter>
                  <CButton color="secondary" @click="showConfirmDeleteDialog = false">CANCEL</CButton>
                  <CButton color="danger" @click="confirmDeleteProfilePicture">DELETE</CButton>
                </CModalFooter>
              </CModal>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'; // Ensure computed is imported
import { db, storage, storageRef, uploadBytes, getDownloadURL, deleteObject } from '../firebase'; // Import storage functions
import { doc, updateDoc } from 'firebase/firestore';
import { useUserStore } from '../stores/userStore';
import { useErrorStore } from '../stores/error';
import { useSuccessStore } from '../stores/success'; // Import success store

const userStore = useUserStore();
const errorStore = useErrorStore();
const successStore = useSuccessStore(); // Initialize success store

const userDisplayNameLocal = ref(''); // Local ref for the input field
const isProcessing = ref(false);

// Profile Picture Upload State
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const localProfilePictureUrl = ref<string | null>(null); // For immediate preview
const isUploading = ref(false);
const showConfirmDeleteDialog = ref(false); // New state for confirmation dialog
const isDeleting = ref(false); // New state for deleting

// Initialize displayName from userStore data when component mounts or user data changes
onMounted(() => {
  if (userStore.userDisplayName) {
    userDisplayNameLocal.value = userStore.userDisplayName;
  }
});

watch(() => userStore.userDisplayName, (newDisplayName) => {
  if (newDisplayName) {
    userDisplayNameLocal.value = newDisplayName;
  }
});

const updateProfile = async () => {
  if (!userStore.currentUser) {
    errorStore.setGlobalError('AUTHENTICATION_REQUIRED: Cannot update profile.');
    return;
  }

  isProcessing.value = true;
  errorStore.clearGlobalError();
  try {
    const userRef = doc(db, 'users', userStore.currentUser.uid);
    await updateDoc(userRef, { displayName: userDisplayNameLocal.value });
    console.log('PROFILE_UPDATE_SUCCESS: User profile updated.');
    successStore.setSuccessMessage('PROFILE_UPDATE_SUCCESS: Display name updated.');
    errorStore.clearGlobalError(); // Clear any errors
    // Note: Firebase Auth's currentUser object might not immediately reflect Firestore changes.
    // The userStore's onSnapshot for the user document will eventually update it.
  } catch (error) {
    console.error('PROFILE_UPDATE_FRACTURE:', error);
    errorStore.setGlobalError('PROFILE_UPDATE_FAILED: Noise detected during profile update.');
  } finally {
    isProcessing.value = false;
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    localProfilePictureUrl.value = URL.createObjectURL(selectedFile.value); // Create local URL for preview
  } else {
    selectedFile.value = null;
    localProfilePictureUrl.value = null;
  }
};

const uploadProfilePicture = async () => {
  if (!userStore.currentUser || !selectedFile.value) {
    errorStore.setGlobalError('UPLOAD_FRACTURE: No file selected or user not authenticated.');
    return;
  }

  isUploading.value = true;
  errorStore.clearGlobalError();
  try {
    const file = selectedFile.value;
    const filePath = `profilePictures/${userStore.currentUser.uid}/${file.name}`;
    const imageRef = storageRef(storage, filePath);

    // Upload file
    await uploadBytes(imageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(imageRef);

    // Update user's Firestore document with the new URL
    const userRef = doc(db, 'users', userStore.currentUser.uid);
    await updateDoc(userRef, { profilePictureUrl: downloadURL });

    console.log('PROFILE_PICTURE_UPLOAD_SUCCESS: Profile picture updated.');
    successStore.setSuccessMessage('PROFILE_PICTURE_UPLOAD_SUCCESS: Profile picture updated.');
    errorStore.clearGlobalError(); // Clear any errors
    selectedFile.value = null; // Clear selected file
    localProfilePictureUrl.value = null; // Clear local preview
    // userStore.profilePictureUrl will be updated via onSnapshot listener
  } catch (error) {
    console.error('PROFILE_PICTURE_UPLOAD_FRACTURE:', error);
    errorStore.setGlobalError('PROFILE_PICTURE_UPLOAD_FAILED: Noise detected during image upload.');
  } finally {
    isUploading.value = false;
  }
};

// Function to open the confirmation dialog
const openDeleteConfirmation = () => {
  showConfirmDeleteDialog.value = true;
};

const deleteProfilePicture = async () => {
  if (!userStore.currentUser || !userStore.profilePictureUrl) {
    errorStore.setGlobalError('DELETE_FRACTURE: No profile picture to delete or user not authenticated.');
    return;
  }

  isDeleting.value = true;
  errorStore.clearGlobalError();
  try {
    // Extract path from URL (Firebase Storage URLs contain the path)
    const url = new URL(userStore.profilePictureUrl);
    const path = decodeURIComponent(url.pathname.split('/o/')[1]);
    const imageRef = storageRef(storage, path);

    // Delete file from Storage
    await deleteObject(imageRef);

    // Update user's Firestore document to remove the URL
    const userRef = doc(db, 'users', userStore.currentUser.uid);
    await updateDoc(userRef, { profilePictureUrl: null });

    console.log('PROFILE_PICTURE_DELETE_SUCCESS: Profile picture deleted.');
    successStore.setSuccessMessage('PROFILE_PICTURE_DELETE_SUCCESS: Profile picture deleted.');
  } catch (error) {
    console.error('PROFILE_PICTURE_DELETE_FRACTURE:', error);
    errorStore.setGlobalError('PROFILE_PICTURE_DELETE_FAILED: Noise detected during image deletion.');
  } finally {
    isDeleting.value = false;
  }
};

// Function called when user confirms deletion from the dialog
const confirmDeleteProfilePicture = async () => {
  showConfirmDeleteDialog.value = false; // Close the dialog
  await deleteProfilePicture(); // Proceed with deletion
};
</script>

<style scoped>
.profile-page .text-primary {
  color: #007bff !important; /* Example primary color */
}
.profile-page .shadow-glow {
  box-shadow: 0 0 30px rgba(0, 123, 255, 0.15) !important; /* Example glow for profile */
}
.profile-picture-container {
  width: 150px;
  height: 150px;
  margin: 0 auto 1rem;
  position: relative;
}
.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.bg-zinc-950 {
  background-color: #050505;
}
.font-black {
  font-weight: 900;
}
.fw-black {
  font-weight: 900;
}
.tiny {
  font-size: 0.65rem;
}
.italic {
  font-style: italic;
}
</style>