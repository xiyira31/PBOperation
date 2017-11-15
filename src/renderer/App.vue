<template>
  <v-app id="inspire" light>
    <v-snackbar
      :timeout="timeout"
      :top="true"
      v-model="snackbarShow"
      :color="snackbar.color">
      {{snackbar.msg}}
    </v-snackbar>
    <v-navigation-drawer
      clipped
      persistent
      v-model="drawer"
      enable-resize-watcher
      app
    >
      <v-container>
        <v-layout row wrap>
          <v-flex xs12>
            <v-switch
              v-model="stats.on"
              :label="onOffLabel"
              @click.native="onOff">
            </v-switch>  
          </v-flex>
          <v-flex xs12>
            <v-select
              label="COM端口"
              v-bind:items="coms"
              v-model="currentCom"
              item-text="comName"
              item-value="comName"
              @change="comChange"
            ></v-select>
          </v-flex>
          <v-flex xs10>
            <v-text-field
              label="排量(L/min)"
              v-model="flow"
              suffix="L/min"
              type="number"
            ></v-text-field>
          </v-flex>
          <v-flex xs2>
            <v-btn flat icon @click="setFlow">
              <v-icon>check_circle</v-icon>
            </v-btn>
          </v-flex>
          <v-flex xs10>
            <v-text-field
              label="定时(s)"
              v-model="timeDelay"
              suffix="s"
              type="number"
            ></v-text-field>
          </v-flex>
          <v-flex xs2>
            <v-btn flat icon @click="setTimeDelay">
              <v-icon>check_circle</v-icon>
            </v-btn>
          </v-flex>
          <v-flex xs10>
            <v-text-field
              label="体积(L)"
              v-model="volumn"
              suffix="L"
              type="number"
            ></v-text-field>
          </v-flex>
          <v-flex xs2>
            <v-btn flat icon @click="setVolumn">
              <v-icon>check_circle</v-icon>
            </v-btn>
          </v-flex>
          <v-flex xs12>
            <v-btn block @click="setVolumn" :disabled="usedCom === null">
              读取压力
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>{{appTitle}}</v-toolbar-title>
    </v-toolbar>
    <main>
      <v-content>
        <v-container fluid fill-height>
          <v-layout justify-center align-center>
            
          </v-layout>
        </v-container>
      </v-content>
    </main>
    <v-footer app fixed>
      <span>&copy; 2017</span>
    </v-footer>
  </v-app>
</template>

<script>
  import SerialPort from 'serialport'
  import ComUtil from './utils/ComUtil'
  import Comtypes from './utils/Comtypes'
  export default {
    data: () => ({
      appTitle: 'PB平流泵操作软件',
      drawer: true,
      currentCom: null,
      coms: [],
      usedCom: null,
      snackbarShow: false,
      timeout: 2000,
      flow: 10,
      timeDelay: 120,
      volumn: 10,
      stats: {
        on: false
      },
      snackbar: {
        msg: '',
        color: 'blue'
      }
    }),
    computed: {
      onOffLabel: function () {
        if (this.stats.on) {
          return '开'
        } else {
          return '关'
        }
      },
      snackMsgs: function () {
        return {
          comErr: {
            msg: '未设置COM端口或者COM端口已被占用',
            color: 'red'
          },
          setFlow: {
            msg: '成功设置流量为' + this.flow + 'L/min',
            color: 'blue'
          },
          setVolumn: {
            msg: '成功设置定排量为' + this.volumn + 'L',
            color: 'blue'
          },
          setTimeDelay: {
            msg: '成功设置定时为' + this.timeDelay + 's',
            color: 'blue'
          }
        }
      }
    },
    mounted () {
      const that = this
      SerialPort.list().then(function (ports) {
        if (ports) {
          console.log(ports)
          that.coms = ports
        }
      })
    },
    methods: {
      onOff: function () {
        let on = this.stats.on
        if (on) {
          this.sendCommand('', Comtypes.start)
        } else {
          this.sendCommand('', Comtypes.stop)
        }
      },
      comChange: function (value) {
        this.initCom(value)
      },
      initCom: function (comName) {
        const that = this
        const com = new SerialPort(comName, { autoOpen: false })
        com.open(function (err) {
          if (err) {
            that.currentCom = null
            that.closeCom(that.usedCom)
            return
          }
          that.closeCom(that.usedCom)
          com.on('data', function (data) {
            let doc = {
              time: new Date(),
              data: data
            }
            that.$db.insert(doc)
          })
          that.usedCom = com
        })
      },
      closeCom: function (port) {
        if (port !== null && port !== undefined && port.isOpen === true) {
          port.close(function () {
            console.log(port.path + ' is closed.')
          })
        }
      },
      setFlow: function () {
        const that = this
        that.sendCommand(that.flow, Comtypes.flow).then(() => {
          that.showSnackbar(that.snackMsgs.setFlow)
        }).catch((err) => {
          if (err) {
            console.log(err)
          }
        })
      },
      setVolumn: function () {
        const that = this
        that.sendCommand(that.flow, Comtypes.volumn).then(() => {
          that.showSnackbar(that.snackMsgs.setVolumn)
        }).catch((err) => {
          if (err) {
            console.log(err)
          }
        })
      },
      setTimeDelay: function () {
        const that = this
        that.sendCommand(that.flow, Comtypes.destTime).then(() => {
          that.showSnackbar(that.snackMsgs.setTimeDelay)
        }).catch((err) => {
          if (err) {
            console.log(err)
          }
        })
      },
      sendCommand: function (msg, comType) {
        const that = this
        return new Promise(function (resolve, reject) {
          const port = that.usedCom
          if (port !== null && port !== undefined && port.isOpen === true) {
            const command = ComUtil.makeCommand(msg, comType.code)
            console.log(command)
            port.write(command, 'ascii')
            resolve()
          } else {
            that.showSnackbar(that.snackMsgs.comErr)
            reject(new Error('Com连接失败'))
          }
        })
      },
      showSnackbar: function (type) {
        this.snackbar = type
        this.snackbarShow = true
      }
    }
  }
</script>

<style lang="stylus">
  @import './assets/stylus/main.styl'
</style>


<style>
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons');
  /* Global CSS */
</style>
