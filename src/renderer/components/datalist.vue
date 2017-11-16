<template>
  <v-container>
    <v-layout>
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
                <v-btn icon ripple>
                  <v-icon color="blue">input</v-icon>
                </v-btn>
                <v-btn icon ripple>
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
  props: {
    histories: Array
  },
  methods: {
    wrapDate (date) {
      const d = moment(date)
      return d.format('YYYY-MM-DD HH:mm')
    }
  }
}
</script>

<style scoped>
</style>