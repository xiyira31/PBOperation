<template>
  <v-card>
    <div :id="id"></div>
  </v-card>
</template>
<script>
  import G2 from 'g2'
  export default {
    data () {
      return {
        chart: null
      }
    },
    props: {
      charData: {
        type: Array
      },
      id: String
    },
    mounted: function () {
    //  this.drawChart()       // 第一步想到的是创建的时候更新图表，但是这个不适用于异步请求接口获取相关数据，所以采用下面的监听的方式
    },
    beforeUpdate: function () {
    //  this.drawChart()
    },
    watch: {
      charData: function (val, oldVal) {
        if (this.chart) {
          this.chart.changeData(val)
        } else {
          this.drawChart(val)
        }
      }
    },
    methods: {
      drawChart: function (datas) {
        // 如果图形存在则删除再创建，这个地方感觉稍微有点坑
        // 具体的G2 api函数说明请看上面提供的官网地址，此处不再逐一说明
        this.chart && this.chart.destroy()
        let data = datas
        this.chart = new G2.Chart({
          id: this.id,
          forceFit: true,
          height: 550
        })
        this.chart.source(data, {
          time: {
            alias: '时间',
            type: 'time',
            mask: 'HH:MM:ss',
            tickCount: 10
          },
          pres: {
            alias: '压力(MPa)',
            min: 0,
            max: 25
          }
        })
        this.chart.line().position('time*pres').shape('spline').size(2)
        this.chart.animate(true)
        this.chart.render()
      }
    }
  }
</script>
