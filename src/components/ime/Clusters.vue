<template>
  <div class="p-4 bg-zinc-900 border border-zinc-800 rounded">
    <h5 class="font-black italic text-info mb-3">ACTIVE_THREADS</h5>
    <p class="tiny text-zinc-500">Sighting all geographical grounding points...</p>

    <ImeDragDrop
      :multiple="true"
      accept="image/*,application/pdf"
      :max-file-size="10 * 1024 * 1024"
      @files-selected="handleFilesSelected"
      @file-error="handleFileError"
      class="mt-4"
    />
    <div v-if="filesToUpload.length" class="mt-3 text-white">
      <p>Files ready for processing:</p>
      <ul class="list-disc list-inside">
        <li v-for="fileItem in filesToUpload" :key="fileItem.id">
          {{ fileItem.file.name }} ({{ (fileItem.file.size / 1024).toFixed(2) }} KB) -
          <span
            :class="{
              'text-info': fileItem.status === 'pending',
              'text-warning': fileItem.status === 'uploading',
              'text-success': fileItem.status === 'success',
              'text-danger': fileItem.status === 'error'
            }"
          >
            {{
              fileItem.status === 'uploading'
                ? `${fileItem.progress.toFixed(0)}%`
                : fileItem.status.toUpperCase()
            }}
          </span>
          <span v-if="fileItem.errorMessage" class="text-danger ms-2">{{
            fileItem.errorMessage
          }}</span>
        </li>
      </ul>
      <CButton
        color="primary"
        class="mt-2"
        @click="uploadFilesToFirebase"
        :disabled="
          isUploading ||
          filesToUpload.filter((f) => f.status === 'pending' || f.status === 'error').length === 0
        "
      >
        {{ isUploading ? 'Uploading...' : 'Upload to Cluster' }}
      </CButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CButton } from '@coreui/vue';
import ImeDragDrop from './ImeDragDrop.vue'; // Assuming ImeDragDrop is in the same directory
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';

import type { AuthUser } from '@/types/auth'; // Import AuthUser from the shared types file
interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  downloadURL?: string;
}

const props = defineProps<{ user: AuthUser | null }>();
const emit = defineEmits(['update:globalError']);

const storage = getStorage();
const filesToUpload = ref<UploadingFile[]>([]);
const isUploading = ref(false);

const handleFilesSelected = (selectedFiles: File[]) => {
  filesToUpload.value = selectedFiles.map((file) => ({
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    file,
    progress: 0,
    status: 'pending'
  }));
  emit('update:globalError', '');
};

const handleFileError = (errorMessage: string) => {
  emit('update:globalError', errorMessage);
};

const uploadFilesToFirebase = async () => {
  const pendingOrErrorFiles = filesToUpload.value.filter(
    (f) => f.status === 'pending' || f.status === 'error'
  );
  if (pendingOrErrorFiles.length === 0) {
    emit('update:globalError', 'No files selected for upload or all files already processed.');
    return;
  }
  if (!props.user?.uid) {
    emit('update:globalError', 'User not authenticated. Cannot upload files.');
    return;
  }

  isUploading.value = true;
  emit('update:globalError', '');
  const uploadPromises: Promise<string>[] = [];

  for (const fileItem of pendingOrErrorFiles) {
    fileItem.status = 'uploading';
    const file = fileItem.file;
    const filePath = `uploads/${props.user.uid}/${file.name}`;
    const fileStorageRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileStorageRef, file);

    const promise = new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          fileItem.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          fileItem.status = 'error';
          fileItem.errorMessage = `Failed: ${error.message}`;
          emit('update:globalError', `Failed to upload ${file.name}: ${error.message}`);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          fileItem.status = 'success';
          fileItem.progress = 100;
          fileItem.downloadURL = downloadURL;
          resolve(downloadURL);
        }
      );
    });
    uploadPromises.push(promise);
  }

  try {
    await Promise.all(uploadPromises);
    emit('update:globalError', 'All files uploaded successfully!');
  } catch (error) {
    console.error('Error during file uploads:', error);
    emit('update:globalError', 'One or more files failed to upload.');
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>
.font-black {
  font-weight: 900;
}
.italic {
  font-style: italic;
}
.tiny {
  font-size: 0.65rem;
}
</style>
