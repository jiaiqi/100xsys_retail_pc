import Vue from 'vue'

const state = {
  // key: table name, value is the data as listmap
  tables: {},
}

// getters
const getters = {
  getTableData: (state) => (table) => {
    return state.tables[table]
  },

}

// mutations
const mutations = {
  addTableData(state, {table, data}) {
    Vue.set(state.tables, table, data)
  },
}

export default {
  state,
  getters,
  mutations
}