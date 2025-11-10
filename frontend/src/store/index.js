import { createStore } from 'vuex'
import authService from '../services/auth'

const store = createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await authService.login(credentials)
        commit('SET_TOKEN', response.data.token)
        commit('SET_USER', response.data.user)
        return response
      } catch (error) {
        throw error
      }
    },
    async register({ commit }, userData) {
      try {
        const response = await authService.register(userData)
        commit('SET_TOKEN', response.data.token)
        commit('SET_USER', response.data.user)
        return response
      } catch (error) {
        throw error
      }
    },
    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
    },
    async fetchProfile({ commit }) {
      try {
        const response = await authService.getProfile()
        commit('SET_USER', response.data)
        return response
      } catch (error) {
        throw error
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    user: state => state.user,
    token: state => state.token
  }
})

export default store