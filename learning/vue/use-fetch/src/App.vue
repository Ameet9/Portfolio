<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFetch } from './composables/useFetch';

const postId = ref(1);
const shouldBreakUrl = ref(false);

// Reactive URL string based on user toggle
const url = computed(() => 
  shouldBreakUrl.value 
    ? `https://jsonplaceholder.typicode.com/invalid-endpoint/${postId.value}`
    : `https://jsonplaceholder.typicode.com/posts/${postId.value}`
);

interface Post {
  id: number;
  title: string;
  body: string;
}

const { data, error, isFetching } = useFetch<Post>(url);

const nextPost = () => {
  postId.value++;
};
const prevPost = () => {
  if (postId.value > 1) postId.value--;
};
</script>

<template>
  <div class="app-container">
    <h1>Vue 3 useFetch Composable</h1>
    
    <div class="controls">
      <button @click="prevPost" :disabled="postId === 1">Previous</button>
      <span class="post-id">Post ID: {{ postId }}</span>
      <button @click="nextPost">Next</button>
    </div>
    
    <div class="error-toggle">
      <label>
        <input type="checkbox" v-model="shouldBreakUrl" />
        Break URL (to demonstrate retry & backoff)
      </label>
    </div>
    
    <div class="status">
      <span v-if="isFetching" class="fetching">Fetching data in background...</span>
    </div>

    <div class="content">
      <div v-if="error" class="error">
        Error: {{ error.message }}
      </div>
      
      <div v-else-if="data" class="post-card">
        <h2>{{ data.title }}</h2>
        <p>{{ data.body }}</p>
      </div>
      
      <div v-else-if="!isFetching" class="no-data">
        No data available.
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  padding: 2rem;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.post-id {
  font-weight: bold;
}

.error-toggle {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f8d7da;
  border-radius: 4px;
}

.status {
  height: 24px;
  margin-bottom: 1rem;
}

.fetching {
  color: #0c5460;
  background-color: #d1ecf1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.content {
  min-height: 200px;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
}

.error {
  color: #721c24;
}

.post-card h2 {
  margin-top: 0;
  text-transform: capitalize;
}

.no-data {
  color: #666;
  font-style: italic;
}
</style>
