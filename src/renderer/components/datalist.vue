<template>
  <v-container>
    <v-layout>
      <v-dialog v-model="dialog" presistent max-width="290">
        <v-card>
          <v-card-title class="headline">删除实验历史:{{toDeletedName}}</v-card-title>
          <v-card-text>是否删除实验历史?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" flat="flat" @click.native="dialog = false; toDeletedName=''">否</v-btn>
            <v-btn color="green darken-1" flat="flat" @click.native="toRemove();dialog = false">是</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-flex xs12>
        <v-list>
          <v-subheader>
            实验历史
          </v-subheader>
          <template v-for="(history, index) in histories">
            <v-list-tile avatar  v-bind:key="index">
              <v-list-tile-avatar>
                <v-icon>assignment</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ history.name }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ wrapDate(history.start) }}</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn icon ripple :disabled="isWorking" @click.native="$emit('load', history.name)">
                  <v-icon color="blue">input</v-icon>
                </v-btn>
                <v-btn icon ripple @click.native="chooseToRemove(history.name)" :disabled="isWorking">
                  <v-icon color="gray">delete</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider v-if="index + 1 < histories.length" :key="index"></v-divider>
          </template>
        </v-list>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import moment from 'moment'
export default {
  data () {
    return {
      toDeletedName: '',
      dialog: false,
      items: Array
    }
  },
  props: {
    histories: Array,
    isWorking: Boolean
  },
  methods: {
    wrapDate (date) {
      const d = moment(date)
      return d.format('YYYY-MM-DD HH:mm')
    },
    chooseToRemove (name) {
      const that = this
      that.toDeletedName = name
      that.dialog = true
    },
    toRemove () {
      const that = this
      if (!that.toDeletedName) {
        return
      }
      that.$db.remove({name: that.toDeletedName}, function (err, numRemoved) {
        if (err) {
          console.log(err)
          return
        }
        if (numRemoved > 0) {
          that.$emit('update')
        }
      })
      that.toDeletedName = ''
    }
  }
}
</script>

<style scoped>
</style>