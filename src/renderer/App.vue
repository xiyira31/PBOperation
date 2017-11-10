<template>
  <v-app id="inspire" light>
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
          ></v-select>
        </v-flex>
        <v-flex xs12>
          <v-text-field
            label="COM端口"
            v-model="currentCom"
          ></v-text-field>
        </v-flex>
      </v-layout>
    </v-container>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>开关</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Com端口</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select
              label="Select"
              v-bind:items="coms"
              v-model="currentCom"
              single-line
              item-text="comName"
              item-value="comName"
              auto
            ></v-select>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
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
  export default {
    data: () => ({
      drawer: true,
      checked: true,
      currentCom: null,
      coms: []
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
