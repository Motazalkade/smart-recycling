import api from './api'

const recyclingService = {
  processItem: (formData) => api.post('/recycling/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getLocations: (params) => api.get('/recycling/locations', { params }),
  getUserHistory: () => api.get('/recycling/history'),
  getUserStats: () => api.get('/users/stats')
}

export default recyclingService