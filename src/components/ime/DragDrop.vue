<template>
  <div
    class="drag-drop-area p-4 border-2 border-dashed rounded-lg text-center cursor-pointer"
    :class="{ 'border-info': !isDragging, 'border-success bg-zinc-800': isDragging }"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <input
      type="file"
      ref="fileInput"
      :multiple="multiple"
      :accept="accept"
      class="hidden"
      @change="handleFileChange"
    />
    <div v-if="!files.length">
      <i class="bi bi-cloud-arrow-up-fill text-info text-4xl mb-2"></i>
      <p class="text-lg font-black">
        Drag & Drop files here or <span class="text-info underline">click to browse</span>
      </p>
      <p v-if="accept" class="text-sm text-zinc-400">Accepted types: {{ accept }}</p>
    </div>
    <div v-else>
      <p class="text-lg font-black">Selected Files:</p>
      <ul class="list-disc list-inside text-left mx-auto max-w-xs">
        <li
          v-for="fileItem in files"
          :key="fileItem.file.name"
          class="text-sm d-flex align-items-center mb-2"
        >
          <div class="file-preview me-2">
            <img
              v-if="fileItem.previewUrl"
              :src="fileItem.previewUrl"
              alt="File preview"
              class="img-thumbnail"
              style="width: 40px; height: 40px; object-fit: cover"
            />
            <i v-else class="bi bi-file-earmark text-info fs-4"></i>
          </div>
          <span>{{ fileItem.file.name }} ({{ (fileItem.file.size / 1024).toFixed(2) }} KB)</span>
        </li>
      </ul>
      <CButton color="danger" variant="outline" class="mt-3" @click.stop="clearFiles"
        >Clear Files</CButton
      >
    </div>
    <div v-if="error && error.length" class="text-danger mt-2">
      <p v-for="(err, index) in error" :key="index">{{ err }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'; // Added 'computed' and removed unused 'watch'
import { CButton } from '@coreui/vue'; // Assuming CoreUI components are available

interface Props {
  multiple?: boolean;
  accept?: string;
  maxFileSize?: number; // in bytes
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  accept: '',
  maxFileSize: 5 * 1024 * 1024 // 5MB default
});

const emit = defineEmits(['files-selected', 'file-error']);

// Define a new interface for file items to include preview URL
interface FileItem {
  file: File;
  previewUrl: string | null;
}
const isDragging = ref(false);
const files = ref<FileItem[]>([]); // Update files ref to use FileItem interface
const error = ref<string[] | null>(null); // Changed to array to hold multiple errors
const fileInput = ref<HTMLInputElement | null>(null);

// Computed property for accepted file type checkers to optimize regex creation
const acceptedTypeCheckers = computed(() => {
  if (!props.accept) return [];
  return props.accept.split(',').map((type) => {
    const trimmedType = type.trim();
    return {
      regex: new RegExp(trimmedType.replace(/\./g, '\\.').replace(/\*/g, '.*')),
      isExtension: trimmedType.startsWith('.'),
      originalType: trimmedType
    };
  });
});

const handleDragOver = () => {
  isDragging.value = true;
  error.value = null; // Clear error on drag over
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer) {
    processFiles(event.dataTransfer.files); // This is now async
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    processFiles(target.files); // This is now async
  }
};

const processFiles = async (fileList: FileList) => {
  // Make function async
  error.value = null; // Clear previous errors
  const newFileItems: FileItem[] = [];
  const currentFileErrors: string[] = []; // Collect errors for this batch

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];

    // Validate file type
    if (props.accept) {
      const isFileTypeAccepted = acceptedTypeCheckers.value.some((checker) => {
        return (
          checker.regex.test(file.type) ||
          (checker.isExtension && file.name.endsWith(checker.originalType))
        );
      });
      if (!isFileTypeAccepted) {
        currentFileErrors.push(`File type not accepted: ${file.name}`);
        continue; // Skip to next file, don't add to newFileItems
      }
    }
    if (props.maxFileSize && file.size > props.maxFileSize) {
      currentFileErrors.push(
        `File too large: ${file.name} (max ${props.maxFileSize / (1024 * 1024)}MB)`
      );
      continue; // Skip to next file, don't add to newFileItems
    }

    // If no validation errors for this file, add it to the list for processing
    newFileItems.push({ file, previewUrl: null });
  }

  if (currentFileErrors.length > 0) {
    error.value = currentFileErrors;
    emit('file-error', currentFileErrors); // Emit all collected errors
  }

  // Generate previews for image files asynchronously for files that passed validation
  const fileItemPromises = newFileItems.map(async (fileItem) => {
    if (fileItem.file.type.startsWith('image/')) {
      return new Promise<FileItem>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ file: fileItem.file, previewUrl: e.target?.result as string });
        };
        reader.readAsDataURL(fileItem.file);
      });
    }
    return Promise.resolve(fileItem); // Non-image files
  });

  const resolvedFileItems = await Promise.all(fileItemPromises);

  // Update files.value based on 'multiple' prop, even if resolvedFileItems is empty
  if (props.multiple) {
    files.value = [...files.value, ...resolvedFileItems];
  } else {
    files.value = resolvedFileItems; // Replace existing files, could be an empty array
  }

  emit('files-selected', files.value);

  // Reset file input to allow selecting the same file again
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const clearFiles = () => {
  files.value = [];
  error.value = null;
  emit('files-selected', []);
};
</script>

<style scoped>
.drag-drop-area {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
}
.drag-drop-area.border-info {
  border-color: rgba(0, 229, 255, 0.5);
}
.drag-drop-area.border-success {
  border-color: #28a745;
}
.drag-drop-area.bg-zinc-800 {
  background-color: #27272a;
}
.hidden {
  display: none;
}
.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}
.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}
.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.text-zinc-400 {
  color: #a1a1aa;
}
</style>
