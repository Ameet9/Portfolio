import { ref, computed } from 'vue'

// Fuzzy search algorithm (subsequence matching)
// Returns true if all characters in 'query' appear in 'text' in the same order
function fuzzyMatch(text, query) {
  text = text.toLowerCase()
  query = query.toLowerCase()
  
  let i = 0
  let j = 0
  
  while (i < text.length && j < query.length) {
    if (text[i] === query[j]) {
      j++
    }
    i++
  }
  
  return j === query.length
}

export function useCommandPalette() {
  const query = ref('')
  const selectedIndex = ref(0)
  const isOpen = ref(false)

  const commands = [
    { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', action: () => console.log('Navigated to Dashboard') },
    { id: 'profile', label: 'View Profile', category: 'Navigation', action: () => console.log('Viewing Profile') },
    { id: 'settings', label: 'Open Settings', category: 'Preferences', action: () => console.log('Opened Settings') },
    { id: 'dark-mode', label: 'Toggle Dark Mode', category: 'Preferences', action: () => console.log('Toggled Dark Mode') },
    { id: 'projects', label: 'Search Projects', category: 'Actions', action: () => console.log('Searching Projects') },
    { id: 'new-file', label: 'Create New File', category: 'Actions', action: () => console.log('Creating New File') },
    { id: 'logout', label: 'Log Out', category: 'Account', action: () => console.log('Logged Out') },
    { id: 'billing', label: 'Billing Details', category: 'Account', action: () => console.log('Viewing Billing Details') },
    { id: 'help', label: 'Help & Documentation', category: 'Support', action: () => console.log('Opening Help') },
    { id: 'contact', label: 'Contact Support', category: 'Support', action: () => console.log('Contacting Support') }
  ]

  const filteredCommands = computed(() => {
    if (!query.value.trim()) return commands
    return commands.filter(cmd => fuzzyMatch(cmd.label, query.value) || fuzzyMatch(cmd.category, query.value))
  })

  // Group commands by category for UI rendering while preserving the flat order for indexing
  const groupedCommands = computed(() => {
    const groups = []
    let currentCategory = null
    let globalIndex = 0

    for (const cmd of filteredCommands.value) {
      if (cmd.category !== currentCategory) {
        currentCategory = cmd.category
        groups.push({ category: currentCategory, items: [] })
      }
      
      groups[groups.length - 1].items.push({
        ...cmd,
        globalIndex: globalIndex++
      })
    }
    return groups
  })

  function moveDown() {
    if (filteredCommands.value.length === 0) return
    selectedIndex.value = (selectedIndex.value + 1) % filteredCommands.value.length
  }

  function moveUp() {
    if (filteredCommands.value.length === 0) return
    selectedIndex.value = (selectedIndex.value - 1 + filteredCommands.value.length) % filteredCommands.value.length
  }

  function executeSelected() {
    if (filteredCommands.value.length === 0) return
    const cmd = filteredCommands.value[selectedIndex.value]
    if (cmd && cmd.action) {
      cmd.action()
      close()
    }
  }

  function open() {
    isOpen.value = true
    query.value = ''
    selectedIndex.value = 0
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    if (isOpen.value) close()
    else open()
  }

  return {
    query,
    selectedIndex,
    isOpen,
    filteredCommands,
    groupedCommands,
    moveDown,
    moveUp,
    executeSelected,
    open,
    close,
    toggle
  }
}
