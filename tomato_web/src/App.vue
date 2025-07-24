<script setup>
const topic = ref('')
const timeinfo = ref('')
const addTomato = () => {
  
    const now = new Date()
    const endTime = new Date(now.getTime() + 30 * 60 * 1000)
    
    const formatTime = (date) => {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    }
    
    timeinfo.value = `【${topic.value}】 from ${formatTime(now)} to ${formatTime(endTime)}`
}
</script>

<template>
  <div style="display: flex; width: 30%;">
    <el-input v-model="topic" placeholder="Topic"/>
    <el-button @click="addTomato" style="margin-left: 2%;" type="success">add tomato</el-button>
  </div>
  <div>
    <h5>{{ timeinfo }}</h5>
  </div>
</template>
 