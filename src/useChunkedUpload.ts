import { ref, onMounted } from 'vue';
import { apiFetch } from '../api';

export interface UploadMetadata {
  filename: string;
  size: number;
  uploadId: string;
  chunksUploaded: number;
}

const STORAGE_KEY = 'spice_upload_session';

export function useChunkedUpload() {
  const uploadProgress = ref(0);
  const isUploading = ref(false);
  const error = ref<string | null>(null);
  const savedSessionMetadata = ref<UploadMetadata | null>(null);

  // On initialization, check if there's a pending upload to resume
  onMounted(() => {
    const session = localStorage.getItem(STORAGE_KEY);
    if (session) {
      try {
        savedSessionMetadata.value = JSON.parse(session);
      } catch (err) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  });

  /**
   * Handles the chunked upload process with retry logic.
   */
  const uploadFile = async (file: File) => {
    isUploading.value = true;
    error.value = null;
    uploadProgress.value = 0;

    const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    try {
      let uploadId = '';
      let startChunk = 0;

      // Determine if we are resuming an existing session
      if (
        savedSessionMetadata.value &&
        savedSessionMetadata.value.filename === file.name &&
        savedSessionMetadata.value.size === file.size
      ) {
        uploadId = savedSessionMetadata.value.uploadId;
        startChunk = savedSessionMetadata.value.chunksUploaded;
      } else {
        // Initialize a new upload session with the backend
        const initResponse = await apiFetch('upload/init', {
          method: 'POST',
          body: JSON.stringify({ filename: file.name, size: file.size }),
          headers: { 'Content-Type': 'application/json' },
        });
        const initData = await initResponse.json();
        uploadId = initData.uploadId;
      }

      for (let i = startChunk; i < totalChunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

        // Perform chunk upload with built-in retry and exponential backoff
        await performChunkUploadWithRetry(uploadId, i, chunk);

        // Progress tracking and state persistence
        const chunksUploaded = i + 1;
        uploadProgress.value = Math.round((chunksUploaded / totalChunks) * 100);
        
        const metadata: UploadMetadata = {
          filename: file.name,
          size: file.size,
          uploadId,
          chunksUploaded,
        };
        savedSessionMetadata.value = metadata;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
      }

      // Finalize the upload sequence
      const finalizeResponse = await apiFetch('upload/finalize', {
        method: 'POST',
        body: JSON.stringify({ uploadId }),
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await finalizeResponse.json();

      // Cleanup after successful upload
      localStorage.removeItem(STORAGE_KEY);
      savedSessionMetadata.value = null;

      return result;
    } catch (err: any) {
      error.value = err.message || 'An unexpected error occurred during the upload process.';
      throw err;
    } finally {
      isUploading.value = false;
    }
  };

  /**
   * Internal helper to upload a chunk with exponential backoff retries.
   */
  const performChunkUploadWithRetry = async (uploadId: string, index: number, chunk: Blob, maxRetries = 5) => {
    let attempt = 0;
    let delay = 1000; // Initial delay of 1 second

    while (attempt < maxRetries) {
      try {
        const formData = new FormData();
        formData.append('uploadId', uploadId);
        formData.append('index', index.toString());
        formData.append('chunk', chunk);

        const response = await apiFetch('upload/chunk', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Chunk ${index} upload failed with status ${response.status}`);
        }

        return; // Success
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(`Upload failed for chunk ${index} after ${maxRetries} attempts.`);
        }

        // Exponential backoff calculation with added jitter for network variance
        const backoffTime = delay * Math.pow(2, attempt - 1) + Math.random() * 200;
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      }
    }
  };

  /**
   * Manually cancels an ongoing or pending upload session.
   */
  const cancelUpload = async (uploadId: string) => {
    try {
      await apiFetch('upload/cancel', {
        method: 'POST',
        body: JSON.stringify({ uploadId }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      localStorage.removeItem(STORAGE_KEY);
      savedSessionMetadata.value = null;
      uploadProgress.value = 0;
    } catch (err: any) {
      error.value = `Failed to cancel upload: ${err.message}`;
    }
  };

  return {
    uploadFile,
    uploadProgress,
    isUploading,
    error,
    savedSessionMetadata,
    cancelUpload,
  };
}
