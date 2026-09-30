<script setup lang="ts">
import { useForm } from './composables/useForm'

const { values, errors, isSubmitting, isValidatingUsername, submitForm } = useForm()

const isFormInvalid = () => {
  return !!errors.username || !!errors.email || !values.username || !values.email || isValidatingUsername.value || isSubmitting.value
}
</script>

<template>
  <div class="form-container">
    <h2>Smart Form (Vue 3)</h2>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="username">Username</label>
        <div class="input-wrapper">
          <input 
            id="username" 
            v-model="values.username" 
            type="text" 
            placeholder="Type 'admin' to see taken error"
          />
          <span v-if="isValidatingUsername" class="loading-spinner">Validating...</span>
        </div>
        <span class="error" v-if="errors.username">{{ errors.username }}</span>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email" 
          v-model="values.email" 
          type="email" 
          placeholder="user@example.com"
        />
        <span class="error" v-if="errors.email">{{ errors.email }}</span>
      </div>
      
      <button type="submit" :disabled="isFormInvalid()">
        {{ isSubmitting ? 'Submitting...' : 'Submit' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  font-family: sans-serif;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.input-wrapper {
  position: relative;
}

.loading-spinner {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: #666;
}

.error {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
