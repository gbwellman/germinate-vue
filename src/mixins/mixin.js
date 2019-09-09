import axios from 'axios'
import { mapState } from 'vuex'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  computed: {
    ...mapState([
      'baseUrl',
      'helpKey',
      'hiddenColumns',
      'locale',
      'markedIds',
      'originalTarget',
      'serverSettings',
      'tableFiltering',
      'tablePerPage',
      'token'
    ])
  },
  data: function () {
    return {
      MAX_JAVA_INTEGER: 2147483647,
      entityTypes: {
        'Accession': {
          icon: 'mdi-sprout',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('entityTypeAccession')
        },
        'Plant/Plot': {
          icon: 'mdi-grid',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('entityTypePlantPlot')
        },
        'Sample': {
          icon: 'mdi-leaf',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('entityTypeSample')
        }
      },
      groupTypes: {
        germinatebase: {
          icon: 'mdi-sprout',
          apiName: 'germplasm',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeGerminatebase')
        },
        markers: {
          icon: 'mdi-dna',
          apiName: 'markers',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeMarker')
        },
        locations: {
          icon: 'mdi-map-marker',
          apiName: 'locations',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeLocation')
        }
      },
      markedItemTypes: {
        germplasm: {
          icon: 'mdi-sprout',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeGerminatebase')
        },
        markers: {
          icon: 'mdi-dna',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeMarker')
        },
        locations: {
          icon: 'mdi-map-marker',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('groupTypeLocation')
        }
      },
      imageTypes: {
        germinatebase: {
          icon: 'mdi-sprout',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('imageTypeGerminatebase')
        },
        compounds: {
          icon: 'mdi-flask',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('imageTypeCompounds')
        },
        phenotypes: {
          icon: 'mdi-tag-text-outline',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('imageTypePhenotypes')
        }
      },
      locationTypes: {
        trialsite: {
          icon: 'mdi-shovel',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('locationTypeTrialsite')
        },
        collectingsites: {
          icon: 'mdi-basket-fill',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('locationTypeCollectingsite')
        },
        datasets: {
          icon: 'mdi-database',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('locationTypeDataset')
        }
      },
      experimentTypes: {
        allelefreq: {
          icon: 'mdi-pulse',
          color: () => this.serverSettings.colorsTemplate[0 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeAllelefreq')
        },
        climate: {
          icon: 'mdi-weather-snowy-rainy',
          color: () => this.serverSettings.colorsTemplate[1 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeClimate')
        },
        compound: {
          icon: 'mdi-flask',
          color: () => this.serverSettings.colorsTemplate[2 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeCompound')
        },
        genotype: {
          icon: 'mdi-dna',
          color: () => this.serverSettings.colorsTemplate[3 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeGenotype')
        },
        trials: {
          icon: 'mdi-shovel',
          color: () => this.serverSettings.colorsTemplate[4 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeTrials')
        },
        unknown: {
          icon: 'mdi-help-box',
          color: () => this.serverSettings.colorsTemplate[5 % this.serverSettings.colorsTemplate.length],
          text: () => this.$t('datasetTypeUnknown')
        }
      }
    }
  },
  methods: {
    toUrlString: function (params) {
      return Object.keys(params).map(function (key) {
        return params[key] ? (key + '=' + encodeURIComponent(params[key])) : ''
      }).join('&')
    },
    uuidv4: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0
        var v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    getPaginationTexts () {
      return {
        count: this.$t('paginationCount'),
        first: this.$t('paginationFirst'),
        last: this.$t('paginationLast'),
        filter: this.$t('paginationFilter'),
        filterPlaceholder: this.$t('paginationFilterPlaceholder'),
        limit: this.$t('paginationLimit'),
        page: this.$t('paginationPage'),
        noResults: this.$t('paginationNoResult'),
        filterBy: this.$t('paginationFilterBy'),
        loading: this.$t('paginationLoading'),
        defaultOption: this.$t('paginationDefaultOption'),
        columns: this.$t('paginationColumns')
      }
    },
    /**
     * This is the default error method that gets called if no other error handler is defined for the error code that caused it.
     * @param {*} error The error response object
     */
    handleError (error) {
      var variant = 'danger'
      var title = this.$t('genericError')
      var message = error.statusText
      switch (error.status) {
        case 400:
          message = this.$t('httpErrorFourOO')
          break
        case 401:
          message = this.$t('httpErrorFourOOne')
          break
        case 403:
          message = this.$t('httpErrorFourOThree')
          this.$store.dispatch('ON_TOKEN_CHANGED', null)
          var authMode = this.$store.getters.serverSettings.authMode
          if (authMode === 'FULL') {
            this.$router.push('/g8/login')
          } else if (authMode === 'SELECTIVE') {
            EventBus.$emit('on-show-login-form')
          }
          return
        case 404:
          message = this.$t('httpErrorFourOFour')
          break
        case 405:
          message = this.$t('httpErrorFourOFour')
          break
        case 408:
          message = this.$t('httpErrorFourOEight')
          break
        case 409:
          message = this.$t('httpErrorFourONine')
          break
        case 410:
          message = this.$t('httpErrorFourTen')
          break
        case 500:
          message = this.$t('httpErrorFiveOO')
          break
        case 501:
          message = this.$t('httpErrorFiveOOne')
          break
        case 503:
          message = this.$t('httpErrorFiveOThree')
          break
      }

      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        autoHideDelay: 5000,
        appendToast: true
      })
    },
    authForm ({ url = null, formData, success = null, error = { codes: [], callback: this.handleError } }) {
      var vm = this

      const promise = axios.post(url, formData, {
        crossDomain: true,
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + this.getToken()
        }
      })

      promise.then(function (result) {
        var t = vm.$store.getters.token

        // Check if the token is still valid. Renew it if so.
        if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
          t.createdOn = new Date().getTime()
          vm.$store.dispatch('ON_TOKEN_CHANGED', t)
        }

        if (success) {
          success(result.data)
        }
      })

      promise.catch(function (err) {
        if (err.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          // Log the user out if the result is forbidden and no error method has been provided
          // Otherwise, we assume that the calling method takes care of the error
          if (!error) {
            if (err.response.status === 403) {
              vm.$store.dispatch('ON_TOKEN_CHANGED', null)
              var authMode = vm.$store.getters.serverSettings.authMode
              if (authMode === 'FULL') {
                vm.$router.push('/g8/login')
              } else if (authMode === 'SELECTIVE') {
                EventBus.$emit('on-show-login-form')
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.error(err)
            }
          } else if (error && error.callback) {
            if (error.codes.length === 0 || error.codes.includes(error.status)) {
              error.callback(err.response)
            } else {
              vm.handleError(err.response)
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.error(error)
          }
        } else if (err.request) {
          // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
          if (err.request.textStatus === 'timeout') {
            vm.$bvToast.toast('Request to the server timed out.', {
              title: 'Error',
              variant: 'danger',
              autoHideDelay: 5000,
              appendToast: true
            })
          }
        } else {
          // Something happened in setting up the request that triggered an Error
          if (process.env.NODE_ENV === 'development') {
            console.error(err)
          }
        }
      })

      return promise
    },
    authAjax ({ url = null, method = 'GET', data = null, formData = null, dataType = 'json', contentType = 'application/json; charset=utf-8', success = null, error = { codes: [], callback: this.handleError } }) {
      var vm = this
      var requestData = null
      var requestParams = null

      // Stringify the data object for non-GET requests
      if (data !== null || data !== undefined) {
        if (method === 'GET') {
          requestParams = data
        } else {
          requestData = data
        }
      }

      const promise = axios({
        url: url,
        method: method,
        data: requestData,
        formData: formData,
        params: requestParams,
        crossDomain: true,
        responseType: dataType,
        withCredentials: true,
        headers: {
          'Content-Type': contentType,
          'Authorization': 'Bearer ' + this.getToken()
        }
      })

      promise.then(function (result) {
        var t = vm.$store.getters.token

        // Check if the token is still valid. Renew it if so.
        if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
          t.createdOn = new Date().getTime()
          vm.$store.dispatch('ON_TOKEN_CHANGED', t)
        }

        if (success) {
          success(result.data)
        }
      })

      promise.catch(function (err) {
        if (err.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          // Log the user out if the result is forbidden and no error method has been provided
          // Otherwise, we assume that the calling method takes care of the error
          if (!error) {
            if (err.response.status === 403) {
              vm.$store.dispatch('ON_TOKEN_CHANGED', null)
              var authMode = vm.$store.getters.serverSettings.authMode
              if (authMode === 'FULL') {
                vm.$router.push('/g8/login')
              } else if (authMode === 'SELECTIVE') {
                EventBus.$emit('on-show-login-form')
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.error(err)
            }
          } else if (error && error.callback) {
            if (error.codes.length === 0 || error.codes.includes(error.status)) {
              error.callback(err.response)
            } else {
              vm.handleError(err.response)
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.error(error)
          }
        } else if (err.request) {
          // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
          if (err.request.textStatus === 'timeout') {
            vm.$bvToast.toast('Request to the server timed out.', {
              title: 'Error',
              variant: 'danger',
              autoHideDelay: 5000,
              appendToast: true
            })
          }
        } else {
          // Something happened in setting up the request that triggered an Error
          if (process.env.NODE_ENV === 'development') {
            console.error(err)
          }
        }
      })

      return promise
    },
    unauthAjax ({ url = null, method = 'GET', data = null, dataType = 'json', success = null, error = { codes: [], callback: this.handleError } }) {
      var vm = this
      var requestData = null
      var requestParams = null

      // Stringify the data object for non-GET requests
      if (data !== null || data !== undefined) {
        if (method === 'GET') {
          requestParams = data
        } else {
          requestData = data
        }
      }

      return axios({
        url: url,
        method: method,
        data: requestData,
        params: requestParams,
        crossDomain: true,
        responseType: dataType,
        headers: {
          'content-type': 'application/json; charset=utf-8'
        }
      })
        .then(function (result) {
          if (success) {
            success(result.data)
          }
        })
        .catch(function (err) {
          if (err.response) {
            // The request was made and the server responded with a status code that falls out of the range of 2xx
            if (error && error.callback) {
              if (error.codes.length === 0 || error.codes.includes(err.status)) {
                error.callback(err.response)
              } else {
                vm.handleError(err.response)
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.error(err)
            }
          } else if (err.request) {
            // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
            if (err.request.textStatus === 'timeout') {
              vm.$bvToast.toast('Request to the server timed out.', {
                title: 'Error',
                variant: 'danger',
                autoHideDelay: 5000,
                appendToast: true
              })
            }
          } else {
            // Something happened in setting up the request that triggered an Error
            if (process.env.NODE_ENV === 'development') {
              console.error(err)
            }
          }
        })
    },
    getToken () {
      var t = this.$store.getters.token

      // Check if the token is still valid
      if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) > t.lifetime)) {
        t = null
        this.$store.dispatch('ON_TOKEN_CHANGED', t)
      }

      return t ? t.token : null
    }
  }
}
