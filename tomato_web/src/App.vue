<script setup>
const topic = ref('')
const addTomato = () => {
  console.log(topic.value)
}
</script>

<template>
  <div style="display: flex; width: 30%;">
    <el-input v-model="topic" placeholder="Topic"/>
    <el-button @click="addTomato" style="margin-left: 2%;" type="success">add tomato</el-button>
  </div>
</template>
 