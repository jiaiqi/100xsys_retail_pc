const state = {
  // key: service@use_type, value is a promise resolved to service response
  cache: {},
}

// getters
const getters = {
  getSrvCols: (state) => (service, useType) => {
    let key = service + "@" + useType
    return state.cache[key]
  },

}

// mutations
const mutations = {
  addSrvCols(state, {service, useType, response}) {
    let key = service + "@" + useType
    state.cache[key] = response
  },
}

export default {
  state,
  getters,
  mutations
}