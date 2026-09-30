import { ref, reactive, watch } from 'vue'

export function useForm() {
  const values = reactive({
    username: '',
    email: ''
  })
  
  const errors = reactive({
    username: '',
    email: ''
  })
  
  const isSubmitting = ref(false)
  const isValidatingUsername = ref(false)
  
  let abortController: AbortController | null = null
  let timeoutId: number | null = null

  // Async username validation with debouncing and AbortController (race condition handling)
  watch(() => values.username, (newUsername) => {
    // Clear previous timeout for debouncing
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Cancel ongoing API request if any
    if (abortController) {
      abortController.abort()
    }

    errors.username = '' // Reset error while typing
    
    if (!newUsername) {
      isValidatingUsername.value = false
      return
    }

    isValidatingUsername.value = true

    // Debounce the validation by 500ms
    timeoutId = window.setTimeout(async () => {
      abortController = new AbortController()
      const signal = abortController.signal
      
      try {
        // Simulate a slow API call taking 1 second
        const isTaken = await simulateCheckUsername(newUsername, signal)
        
        if (isTaken) {
          errors.username = 'Username is already taken'
        } else if (newUsername.length < 3) {
           errors.username = 'Username must be at least 3 characters'
        } else {
          errors.username = ''
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log(`Validation for "${newUsername}" aborted.`)
        } else {
          console.error('Validation error:', err)
          errors.username = 'Error validating username'
        }
      } finally {
        if (signal && !signal.aborted) {
            isValidatingUsername.value = false
        }
      }
    }, 500)
  })

  // Simple sync validation for email
  watch(() => values.email, (newEmail) => {
    if (!newEmail) {
      errors.email = 'Email is required'
    } else if (!/^\\S+@\\S+\\.\\S+$/.test(newEmail)) {
      errors.email = 'Email format is invalid'
    } else {
      errors.email = ''
    }
  })

  const submitForm = async () => {
    if (errors.username || errors.email || !values.username || !values.email || isValidatingUsername.value) {
      return
    }
    
    isSubmitting.value = true
    
    try {
      // Simulate API submit
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('Form submitted successfully!')
    } finally {
      isSubmitting.value = false
    }
  }
  
  return {
    values,
    errors,
    isSubmitting,
    isValidatingUsername,
    submitForm
  }
}

// Simulated API Call
async function simulateCheckUsername(username: string, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const takenUsernames = ['admin', 'root', 'user']
      resolve(takenUsernames.includes(username.toLowerCase()))
    }, 1000)

    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}
