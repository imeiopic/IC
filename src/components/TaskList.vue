<template>
    <div class="task-list-container">
        <h2>Project Tasks</h2>

        <!-- Create Task Form -->
        <form @submit.prevent="createTask" class="add-task-form">
            <input v-model="newTaskTitle" placeholder="Enter a new task..." required />
            <!-- In a real app, this might be a dropdown of available projects -->
            <input v-model="projectId" placeholder="Project ID (Optional)" />
            <button type="submit" :disabled="isCreating">Add Task</button>
        </form>

        <!-- Loading & Error States -->
        <div v-if="loading" class="status-msg">Loading tasks...</div>
        <div v-else-if="error" class="status-msg error">{{ error }}</div>

        <!-- Task List -->
        <ul v-else class="task-list">
            <li v-for="task in tasks" :key="task.uniqueId" class="task-item">
                <label class="task-label">
                    <input type="checkbox" :checked="task.isCompleted" @change="toggleTaskCompletion(task)" />
                    <span :class="{ completed: task.isCompleted }">
                        {{ task.title }}
                    </span>
                </label>

                <!-- Display the joined project data if it exists -->
                <span class="project-tag" v-if="task.project">
                    {{ task.project.name }}
                </span>

                <button @click="deleteTask(task.uniqueId)" class="delete-btn">
                    Delete
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTasks } from '../useTasks';

const {
    tasks,
    loading,
    error,
    isCreating,
    fetchTasks,
    createTask: apiCreateTask,
    toggleTaskCompletion: apiToggleTaskCompletion,
    deleteTask: apiDeleteTask
} = useTasks();

// Form Inputs
const newTaskTitle = ref('');
const projectId = ref('');

// POST: Create a new task
const createTask = async () => {
    if (!newTaskTitle.value) return;
    try {
        await apiCreateTask(newTaskTitle.value, projectId.value || null);
        newTaskTitle.value = '';
    } catch (e) {
        console.error(e);
        alert('Error creating task.');
    }
};

// PATCH: Update completion status
const toggleTaskCompletion = async (task) => {
    try {
        await apiToggleTaskCompletion(task);
    } catch (e) {
        console.error(e);
        alert('Could not save task status.');
    }
};

// DELETE: Remove a task
const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        await apiDeleteTask(taskId);
    } catch (e) {
        console.error(e);
        alert('Error deleting task.');
    }
};

// Load tasks immediately when the component mounts
onMounted(fetchTasks);
</script>

<style scoped>
.task-list-container {
    max-width: 600px;
    margin: 0 auto;
    font-family: sans-serif;
}

.add-task-form {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.task-list {
    list-style: none;
    padding: 0;
}

.task-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
}

.task-label {
    flex-grow: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.completed {
    text-decoration: line-through;
    color: #888;
}

.project-tag {
    background: #e0e7ff;
    color: #3730a3;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    margin-right: 15px;
}

.delete-btn {
    background: #fee2e2;
    color: #991b1b;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
}

.delete-btn:hover {
    background: #fca5a5;
}
</style>
