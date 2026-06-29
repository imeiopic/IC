<template>
  <div class="file-uploader-container">
    <h2>File Uploader (SPICE Protocol)</h2>

    <input type="file" @change="handleFileSelect" :disabled="isUploading" ref="fileInput" />
    <button @click="startUpload" :disabled="!selectedFile || isUploading">
      {{ isUploading ? 'Uploading...' : 'Upload File' }}
    </button>

    <!-- Resume Upload Section -->
    <div v-if="savedSessionMetadata && !isUploading" class="resume-section">
      <p>
        <strong>Resumable upload detected:</strong>
        <br />
        File: {{ savedSessionMetadata.filename }} ({{
          (savedSessionMetadata.size / (1024 * 1024)).toFixed(2)
        }}
        MB)
      </p>
      <button @click="promptResumeUpload" class="resume-button">Resume</button>
      <button @click="cancelUpload(savedSessionMetadata!.uploadId)" class="cancel-button">Discard</button>
    </div>

    <div v-if="resumePromptMessage" class="info-message mt-2">
      {{ resumePromptMessage }}
    </div>

    <div v-if="isUploading" class="progress-section">
      <progress :value="uploadProgress" max="100"></progress>
      <p>Progress: {{ uploadProgress }}%</p>
    </div>

    <div v-if="error" class="error-message">
      Error: {{ error }}
    </div>

    <div v-if="uploadResult" class="success-message">
      <p>Upload Complete! Download URL: <a :href="uploadResult.downloadUrl" target="_blank" rel="noopener noreferrer">{{ uploadResult.downloadUrl }}</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useChunkedUpload } from './useChunkedUpload';

const { uploadFile, uploadProgress, isUploading, error, savedSessionMetadata, cancelUpload } = useChunkedUpload();

const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const uploadResult = ref<any | null>(null);

const resumePromptMessage = ref<string | null>(null);

watch(selectedFile, (newFile) => {
  if (newFile) {
    resumePromptMessage.value = null; // Clear message when a new file is selected
  }
});

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
    uploadResult.value = null; // Reset result on new file selection
  }
};

const startUpload = async () => {
  if (selectedFile.value) {
    try {
      uploadResult.value = await uploadFile(selectedFile.value);
      // In a production build, console.log statements should be removed or replaced with a proper logging service.
      // console.log('Upload successful:', uploadResult.value);
    } catch (err) {
      // In a production build, console.error statements should be handled by an error tracking service.
      // console.error('Upload failed:', err);
    }
  }
};

const promptResumeUpload = () => {
  if (savedSessionMetadata.value) {
    resumePromptMessage.value = `Please re-select the file "${savedSessionMetadata.value.filename}" to resume the upload.`;
    // Programmatically click the file input to prompt the user to select the file
    fileInput.value?.click();
  }
};
</script>

<style scoped>
.file-uploader-container {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  max-width: 600px;
  margin: 20px auto;
}
button {
  margin-left: 10px;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}
button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.resume-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px dashed #007bff;
  border-radius: 8px;
  background-color: #e9f5ff;
}
.resume-button {
  background-color: #28a745; /* Green for resume */
}
.resume-button:hover {
  background-color: #218838;
}
.cancel-button {
  background-color: #dc3545; /* Red for discard */
}
.cancel-button:hover {
  background-color: #c82333;
}
.progress-section {
  margin-top: 20px;
}
progress {
  width: 100%;
}
.error-message {
  color: red;
  margin-top: 10px;
}
.success-message {
  color: green;
  margin-top: 10px;
}
.info-message {
  color: #007bff;
  background-color: #e9f5ff;
  padding: 8px;
  border-radius: 4px;
}
</style>
