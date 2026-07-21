import { defineStore } from 'pinia'
import api, { uploadWithProgress } from '../services/api.js'

export const useTimesheetStore = defineStore('timesheet', {
  state: () => ({
    entries: [],
    loading: false,
    error: null,
    total: 0,
    pendingUploads: [], // { id, timesheetId, file, progress, status, message }
  }),

  actions: {
    async fetchEntries(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get('/timesheet', { params })
        this.entries = data.data || []
        this.total = data.total || 0
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async createEntry(payload) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.post('/timesheet', payload)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateEntry(id, payload) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.put(`/timesheet/${id}`, payload)
        // Update local entry if it exists
        const idx = this.entries.findIndex((e) => e.id === id)
        if (idx !== -1 && data.data) {
          this.entries.splice(idx, 1, data.data)
        }
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteEntry(id) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.delete(`/timesheet/${id}`)
        this.entries = this.entries.filter((e) => e.id !== id)
        this.total = Math.max(0, this.total - 1)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteEvidence(timesheetId, evidenceId) {
      this.error = null
      try {
        const { data } = await api.delete(`/timesheet/${timesheetId}/evidence/${evidenceId}`)
        // Update local entry evidence list
        const entry = this.entries.find((e) => e.id === timesheetId)
        if (entry && entry.evidence) {
          entry.evidence = entry.evidence.filter((ev) => ev.file_name !== evidenceId)
        }
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      }
    },

    async uploadEvidenceToEntry(timesheetId, files) {
      this.error = null
      const uploads = files.map((file, index) => ({
        id: `${timesheetId}-edit-${index}-${Date.now()}`,
        timesheetId,
        file,
        progress: 0,
        status: 'pending',
        message: '',
      }))
      this.pendingUploads.push(...uploads)

      const uploadedFiles = []
      for (const upload of uploads) {
        const pending = this.pendingUploads.find((u) => u.id === upload.id)
        if (!pending) continue

        pending.status = 'uploading'
        pending.progress = 0

        const formData = new FormData()
        formData.append('evidence', pending.file)

        try {
          const { data } = await uploadWithProgress(
            `/timesheet/${pending.timesheetId}/evidence`,
            formData,
            (percent) => {
              pending.progress = percent
            }
          )

          pending.status = 'done'
          pending.message = data.message || 'Upload selesai'
          uploadedFiles.push(data)
        } catch (err) {
          pending.status = 'error'
          pending.message = err.response?.data?.message || err.message || 'Upload gagal'
        }
      }

      // Refresh entries
      await this.fetchEntries({ limit: 50 })
      return uploadedFiles
    },

    addPendingUpload(timesheetId, files) {
      const uploads = files.map((file, index) => ({
        id: `${timesheetId}-${index}`,
        timesheetId,
        file,
        progress: 0,
        status: 'pending', // pending | uploading | done | error
        message: '',
      }))
      this.pendingUploads.push(...uploads)
    },

    async uploadPendingFile(pendingId) {
      const pending = this.pendingUploads.find((u) => u.id === pendingId)
      if (!pending) return

      pending.status = 'uploading'
      pending.progress = 0

      const formData = new FormData()
      formData.append('evidence', pending.file)

      try {
        const { data } = await uploadWithProgress(
          `/timesheet/${pending.timesheetId}/evidence`,
          formData,
          (percent) => {
            pending.progress = percent
          }
        )

        pending.status = 'done'
        pending.message = data.message || 'Upload selesai'

        // Refresh entries agar evidence muncul di dashboard
        await this.fetchEntries({ limit: 10 })
      } catch (err) {
        pending.status = 'error'
        pending.message = err.response?.data?.message || err.message || 'Upload gagal'
      }
    },

    removePendingUpload(id) {
      const idx = this.pendingUploads.findIndex((u) => u.id === id)
      if (idx !== -1) this.pendingUploads.splice(idx, 1)
    },

    clearDoneUploads() {
      this.pendingUploads = this.pendingUploads.filter((u) => u.status !== 'done')
    },
  },
})
