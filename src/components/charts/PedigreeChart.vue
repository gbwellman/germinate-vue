<template>
  <div v-if="plotData">
    <BaseChart :width="() => 1280" :height="() => 600" :sourceFile="baseSourceFile" :filename="baseFilename" chartType="d3.js" v-on:resize="update" :supportsPngDownload="false"  v-on:force-redraw="update">
      <div slot="chart" ref="pedigreeChart" />
    </BaseChart>
    <!-- Export button -->
    <b-button @click="downloadPedigree()"><i class="mdi mdi-18px fix-alignment mdi-download" /> {{ $t('buttonDownloadForHelium') }}</b-button>
    <!-- Information about the export formats -->
    <p><span class="text-muted" v-html="$t('pageExportFormatsHeliumText')" />&nbsp;<router-link :to="{ name: 'about-export-formats-specific', params: { format: 'pedigree' } }" v-b-tooltip.hover :title="$t('tooltipExportFormatLearnMore')"> <i class="mdi mdi-18px fix-alignment mdi-information-outline"/></router-link> </p>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import { EventBus } from '@/plugins/event-bus.js'
import { pedigreeChart } from '@/plugins/charts/d3-dagre-chart.js'
import germplasmApi from '@/mixins/api/germplasm.js'

const d3Select = require('d3-selection')
const d3Dsv = require('d3-dsv')
const d3Shape = require('d3-shape')
const dagreD3 = require('dagre-d3')

export default {
  props: {
    germplasm: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      plotData: null
    }
  },
  computed: {
    baseSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.baseFilename,
        extension: 'helium'
      }
    },
    baseFilename: function () {
      return 'pedigree-' + this.germplasm.id
    }
  },
  components: {
    BaseChart
  },
  mixins: [ germplasmApi ],
  methods: {
    update: function () {
      this.$nextTick(() => {
        while (this.$refs.pedigreeChart.firstChild) {
          this.$refs.pedigreeChart.firstChild.remove()
        }

        if (this.plotData) {
          const reader = new FileReader()
          reader.onload = () => {
            // Remove the first row (Helium header)
            const dirtyTsv = reader.result
            const firstEOL = dirtyTsv.indexOf('\n')
            const parsedTsv = d3Dsv.tsvParse(dirtyTsv.substring(firstEOL + 1))

            let nodes = {}
            let connections = []

            // First, add the parents (important for layout)
            parsedTsv.forEach(function (d) {
              nodes[d.Parent] = null
            })

            // Then the children and the edges
            parsedTsv.forEach(function (d) {
              nodes[d.LineName] = null

              let edgeStyle = ''
              let headStyle = ''

              if (d.ParentType === 'F') {
                edgeStyle = 'stroke: #e74c3c;'
                headStyle = 'fill: #e74c3c;'
              } else if (d.ParentType === 'M') {
                edgeStyle = 'stroke: #2980b9;'
                headStyle = 'fill: #2980b9;'
              }

              connections.push({
                from: d.Parent,
                to: d.LineName,
                edgeStyle: edgeStyle,
                headStyle: headStyle
              })
            })

            let data = []

            for (let node in nodes) {
              if (nodes.hasOwnProperty(node)) {
                data.push({
                  label: node,
                  class: node === this.germplasm.accenumb ? 'node-primary' : null
                })
              }
            }

            d3Select.select(this.$refs.pedigreeChart)
              .datum(data)
              .call(pedigreeChart(dagreD3)
                .margin({ left: 50, right: 50, top: 30, bottom: 30 })
                .width(this.$refs.pedigreeChart.offsetWidth)
                .height(600)
                .nodeStyle('node')
                .connections(connections)
                .nodeShape('circle')
                .onClick(d => {
                  this.navigateToPassportPage(d)
                })
                .interpolate(d3Shape.curveBundle))
          }
          reader.readAsText(this.plotData)
        }
      })
    },
    navigateToPassportPage: function (germplasmName) {
      // Send a query to get the germplasm id
      const request = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'germplasmName',
          comparator: 'equals',
          operator: 'and',
          values: [germplasmName]
        }]
      }
      this.apiPostGermplasmTable(request, result => {
        if (result && result.data && result.data.length > 0) {
          // Then navigate to the passport page
          this.$router.push({ name: 'passport', params: { germplasmId: result.data[0].germplasmId } })
        }
      })
    },
    downloadPedigree: function () {
      EventBus.$emit('show-loading', true)
      const request = {
        individualIds: [this.germplasm.id],
        levelsUp: 3,
        levelsDown: 3
      }
      this.apiPostPedigreeExport(request, result => {
        this.downloadBlob({
          blob: result,
          filename: this.getFilename(),
          extension: 'helium'
        })
        EventBus.$emit('show-loading', false)
      }, {
        codes: [404],
        callback: () => {
          // Do nothing here, it just means there is no data.
        }
      })
    }
  },
  mounted: function () {
    const request = {
      individualIds: [this.germplasm.id]
    }
    this.apiPostPedigreeExport(request, result => {
      this.plotData = result
      this.update()
    }, {
      codes: [404],
      callback: () => {
        // Do nothing here, it just means there is no data.
      }
    })
  }
}
</script>

<style>
.node rect:hover,
.node circle:hover,
.node ellipse:hover,
.node polygon:hover {
  cursor: pointer;
  fill: lightgray !important  ;
}
.node-primary circle {
  fill: var(--primary) !important;
}
</style>
