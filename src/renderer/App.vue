<template>
  <v-app id="inspire" light>
    <v-snackbar
      :timeout="timeout"
      :top="true"
      v-model="snackbarShow"
      :color="snackbar.color">
      {{snackbar.msg}}
    </v-snackbar>
    <v-dialog v-model="dialog" presistent max-width="290">
      <v-card>
        <v-card-title class="headline">已有该实验名称</v-card-title>
        <v-card-text>选择是将会继续在该实验下读取数据，选择否则会退出。</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat="flat" @click.native="dialog = false">否</v-btn>
          <v-btn color="green darken-1" flat="flat" @click.native="startLoad();dialog = false">是</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-navigation-drawer
      fixed
      v-model="drawer"
      enable-resize-watcher
      clipped
      left
      app
    >
      <v-container>
        <v-layout row wrap>
          <v-flex xs4>
            平流泵开关 
          </v-flex>
          <v-flex xs8>
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
            <v-text-field
              label="实验名称"
              v-model="savedName"
              :disabled="toSave"
            ></v-text-field>
          </v-flex>
          <v-flex xs12>
            <v-btn block @click="loadPres" :disabled="usedCom === null || savedName === '' || toSave === true">
              读取压力
            </v-btn>
          </v-flex>
          <v-flex xs12>
            <v-btn block @click.native="stopLoad" :disabled="!toSave">
              暂停读取
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>{{appTitle}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-side-icon @click.stop="rightDrawer = !rightDrawer"></v-toolbar-side-icon>
    </v-toolbar>
    <main>
      <v-content>
        <v-container fluid fill-height>
          <v-layout wrap>
            <v-navigation-drawer
              clipped
              right
              v-model="rightDrawer"
              enable-resize-watcher
              app
            >
              <v-flex xs12>
                <data-list :histories="histories" :isWorking="toSave" v-on:update="updateHistories" v-on:load="inputData"></data-list>
              </v-flex>
            </v-navigation-drawer>
            <v-flex xs12>
              <sub-header-view :subTitle="savedName" :currentPres="currentPres" :currentTime="currentTime"></sub-header-view>
            </v-flex>
            <v-flex xs12 fill-height>
              <chart-view :charData="items" id="test"></chart-view>
            </v-flex>
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
  import datalist from './components/datalist'
  import DBUtil from './utils/DBUtil'
  import subHeaderView from './components/subHeaderView'
  import chartView from './components/chartView'
  import moment from 'moment'
  export default {
    components: {
      'data-list': datalist,
      'sub-header-view': subHeaderView,
      'chart-view': chartView
    },
    data: () => ({
      appTitle: 'PB平流泵操作软件',
      drawer: true,
      rightDrawer: true,
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
      },
      items: [],
      toSave: false,
      savedName: '',
      intervalRead: null,
      dialog: false,
      currentTime: '',
      currentPres: 0,
      histories: [],
      readingData: false
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
          },
          inputName: {
            msg: '请输入实验名称',
            color: 'red'
          }
        }
      }
    },
    mounted () {
      const that = this
      SerialPort.list().then(function (ports) {
        if (ports) {
          that.coms = ports
        }
      })
      setInterval(function () {
        const date = moment()
        that.currentTime = date.format('HH : mm : ss')
      }, 1000)
      that.updateHistories()
    },
    methods: {
      updateHistories: function () {
        const that = this
        that.$db.find({ isExper: true }).sort({ start: 0 }).exec(function (err, docs) {
          if (err) {
            console.log(err)
            return
          }
          that.histories = docs
        })
      },
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
          that.usedCom = com
        })
      },
      onReadData: function (com) {
        const that = this
        that.readingData = true
        com.on('data', function (data) {
          let pres = data.toString()
          pres = pres.substring(7)
          pres = Number(pres)
          if (Number.isNaN(pres)) {
            return
          }
          that.currentPres = pres
          if (that.readingData) {
            let doc = {
              time: new Date(),
              pres: pres
            }
            that.items.push(doc)
            if (that.toSave && that.savedName) {
              DBUtil.savePressure(that.$db, {name: that.savedName}, doc)
            }
          }
        })
      },
      unReadData: function () {
        this.readingData = false
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
      },
      loadPres: function () {
        const that = this
        const savedName = that.savedName
        if (savedName) {
          DBUtil.dbCount(that.$db, {name: savedName}).then((count) => {
            if (count > 0) {
              that.dialog = true
            } else {
              that.insertDoc()
              that.startLoad()
            }
          })
        }
      },
      startLoad: function () {
        this.setLoadInterval()
        this.onReadData(this.usedCom)
      },
      stopLoad: function () {
        const that = this
        clearInterval(that.intervalRead)
        that.unReadData()
        that.toSave = false
        that.updateHistories()
      },
      setLoadInterval () {
        const that = this
        that.intervalRead = setInterval(function () {
          that.sendCommand('', Comtypes.readPrs).catch(function (err) {
            if (err) {
              console.log(err)
            }
            clearInterval(that.intervalRead)
          })
        }, 1000)
        that.toSave = true
      },
      insertDoc () {
        const that = this
        that.$db.insert({
          name: that.savedName,
          start: new Date(),
          isExper: true,
          data: []
        }, (err) => {
          if (err) {
            console.log(err)
          }
        })
      },
      inputData (name) {
        const that = this
        if (that.toSave) {
          console.log('正在工作,无法导入历史数据')
          return
        }
        that.$db.findOne({name: name}, function (err, doc) {
          if (err) {
            console.log(err)
            return
          }
          if (doc.data && doc.data.length > 0) {
            that.items = doc.data
          }
          that.savedName = name
        })
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
