export default {
  methods: {
    apiPostDatasetClimates: function (datasetIds, onSuccess, onError) {
      const queryData = {
        datasetIds: datasetIds
      }
      return this.authAxios({ url: 'dataset/climate', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostClimateTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostClimates: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostClimateOverlays: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: '/climate/overlay', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostClimateDataTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'dataset/data/climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostClimateDataTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: 'dataset/data/climate/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostClimateDatasetTable: function (climateId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `climate/${climateId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
