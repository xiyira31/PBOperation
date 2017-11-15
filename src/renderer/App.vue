<template>
  <v-app id="inspire" light>
    <v-snackbar
      :timeout="timeout"
      :top="true"
      v-model="snackbarShow"
      color="red">
      未设置COM端口或者COM端口已被占用
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
              v-model="checked"
              label="开关">
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
              label="排量"
              v-model="flow"
            ></v-text-field>
          </v-flex>
          <v-flex xs2>
            <v-btn flat icon @click="setFlow">
              <v-icon>check_circle</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-toolbar>
    <main>
      <v-content>
        <v-container fluid fill-height>
          <v-layout justify-center align-center>
            <v-tooltip right>
              <v-btn icon large :href="source" target="_blank" slot="activator">
                <v-icon large>code</v-icon>
              </v-btn>
              <span>Source</span>
            </v-tooltip>
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
      drawer: true,
      checked: true,
      currentCom: null,
      coms: [],
      usedCom: null,
      snackbarShow: false,
      timeout: 2000,
      flow: 0
    }),
    props: {
      source: String
    },
    mounted () {
      const that = this
      SerialPort.list().then(function (ports) {
        if (ports) {
          that.coms = ports
        }
      })
    },
    methods: {
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
        this.sendCommand(this.flow, 'flow')
      },
      sendCommand: function (msg, type) {
        const port = this.usedCom
        const comType = Comtypes[type]
        if (port !== null && port !== undefined && port.isOpen === true) {
          const command = ComUtil.makeCommand(msg, comType.code)
          console.log(command)
          port.write(command, 'ascii')
        } else {
          this.snackbarShow = true
        }
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
