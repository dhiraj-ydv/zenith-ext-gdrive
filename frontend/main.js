if (window.Zenith) {
  // Define the Google Drive Modal Component
  const GDriveModal = {
    template: `
      <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal gdrive-modal fade-in">
          <header class="modal-header">
            <h3 class="modal-title">Google Drive Sync</h3>
            <button class="btn-icon" @click="$emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </header>

          <div class="modal-body">
            <div class="status-card" :class="status.status">
              <div class="status-icon">
                <svg v-if="status.status === 'connected'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div class="status-info">
                <p class="status-label">{{ status.status === 'connected' ? 'Connected' : 'Not Connected' }}</p>
                <p class="status-detail">{{ status.email }}</p>
              </div>
            </div>

            <div class="actions-section">
              <button v-if="status.status !== 'connected'" class="btn btn-primary" @click="connect">
                Connect Google Account
              </button>
              <button v-else class="btn btn-primary" :disabled="syncing" @click="sync">
                {{ syncing ? 'Syncing...' : 'Sync Now' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        status: { status: 'loading', email: 'Checking...' },
        syncing: false
      }
    },
    mounted() {
      this.fetchStatus()
    },
    methods: {
      async fetchStatus() {
        try {
          const res = await fetch('/api/gdrive/status')
          this.status = await res.json()
        } catch (err) {
          this.status = { status: 'error', email: 'Failed to connect to backend' }
        }
      },
      async connect() {
        // Simplified flow: just mock connection for now
        const email = prompt("Enter your Google Email to 'connect':")
        if (!email) return
        
        await fetch('/api/gdrive/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: 'mock_token', email })
        })
        this.fetchStatus()
      },
      async sync() {
        this.syncing = true
        try {
          const res = await fetch('/api/gdrive/sync', { method: 'POST' })
          const data = await res.json()
          alert(data.message)
        } catch (err) {
          alert("Sync failed: " + err.message)
        } finally {
          this.syncing = false
        }
      }
    }
  }

  // Register the modal
  window.Zenith.registerModal("gdrive-settings", GDriveModal)

  // Register the sidebar action
  window.Zenith.registerSidebarAction({
    id: "gdrive-sync",
    label: "Drive Sync",
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>`,
    onClick: () => {
      window.Zenith.openModal("gdrive-settings")
    }
  });
}

