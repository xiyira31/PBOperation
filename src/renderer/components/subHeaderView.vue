<template>
<v-card>
  <v-container fluid fill-height>
    <v-layout>
      <v-flex xs4>
        <v-icon medium color="blue">
          bookmark
        </v-icon>
        <label class="word">
          {{subTitle}}
        </label>
      </v-flex>
      <v-flex xs4>
        <v-icon large color="blue">
          alarm
        </v-icon>
        <label class="word">
          {{currentTime}}
        </label>
      </v-flex>
      <v-flex xs4>
        <v-icon large color="blue">
          timeline
        </v-icon>
        <label class="word">
          {{currentPres + ' MPa'}}
        </label>
      </v-flex>
    </v-layout>
  </v-container>
</v-card>
</template>

<script>
export default {
  props: {
    subTitle: String,
    currentPres: Number,
    currentTime: String
  }
}
</script>

<style scoped>
.word {
  font-size: 20px;
}
</style>