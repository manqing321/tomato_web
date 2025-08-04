<script setup>
import { ref } from 'vue'
import { get_tomatoes, create_tomato, delete_tomato } from '@/apis/tomato.js'

const topic = ref('')
const timeinfo = ref('')
const tomato_list = ref([])

// 添加时间格式化函数
const formatTableTime = (timeString) => {
  if (!timeString) return ''
  // 将 2025-07-31T21:59:00 格式转换为 2025-07-31 21:59
  return timeString.replace('T', ' ').substring(0, 16)
}

const addTomato = () => {
  const now = new Date()
  const endTime = new Date(now.getTime() + 30 * 60 * 1000)

  const formatTime = (date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  }
  
  let toamto_name = topic.value
  let starttime = formatTime(now)
  let stoptime = formatTime(endTime)
  let minutes = 30
  let user = "yajun"
  timeinfo.value = `【${topic.value}】 from ${starttime} to ${stoptime}` + '\n' + timeinfo.value

  create_tomato({
    "name": toamto_name,
    starttime,
    stoptime,
    minutes,
    user
  }).then(res => {
    console.log(res);
    searchTomato();
  }).catch(err => {
    console.log(err)
  })
}

const searchTomato = () => {
  get_tomatoes().then(res => {
    tomato_list.value = res.data.reverse()
  }).catch(err => {
    console.log(err);
  })
}

const confirmDelete = (id) => {
  ElMessageBox.confirm(
    'Are you sure you want to delete this tomato?',
    'Delete tomato!',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    delete_tomato({"tomato_id": id}).then(res => {
      if (res.data.ok) {
        searchTomato();
        ElMessage({
          type: 'success',
          message: 'Deleted successfully',
        });
      } else {
        console.log(res);
      }
    });    
  }).catch(e => {
    console.log(e);
    console.log('Canceled');
  });
}

const currentPage = ref(1)
const pageSize = ref(10)

const paginatedTomatoList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tomato_list.value.slice(start, end)
})

const handlePageChange = (page) => {
  currentPage.value = page
}

searchTomato();
</script>

<template>
  <div class="container">
    <div class="header">
      <h2>🍅 Pomodoro Timer</h2>
    </div>

    <div class="add-section">
      <h3>Add New Pomodoro</h3>
      <div class="input-group">
        <el-input 
          v-model="topic" 
          placeholder="Please enter task topic" 
          class="topic-input"
          clearable
        />
        <el-button 
          @click="addTomato" 
          type="success" 
          round
          :disabled="!topic"
        >
          Start Pomodoro
        </el-button>
      </div>
    </div>

    <div class="time-info" v-if="timeinfo">
      <h3>Current Task Time</h3>
      <el-card class="time-card">
        <pre>{{ timeinfo }}</pre>
      </el-card>
    </div>

    <div class="list-section">
      <h3>Pomodoro History</h3>
      <el-table 
        :data="paginatedTomatoList" 
        border 
        style="width: 100%;"
        stripe
        class="tomato-table"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="Task Topic" />
        <el-table-column prop="starttime" label="Start Time" width="200">
          <template #default="scope">
            {{ formatTableTime(scope.row.starttime) }}
          </template>
        </el-table-column>
        <el-table-column prop="stoptime" label="End Time" width="200">
          <template #default="scope">
            {{ formatTableTime(scope.row.stoptime) }}
          </template>
        </el-table-column>
        <el-table-column prop="minutes" label="Minutes" width="80" />
        <el-table-column prop="user" label="User" width="100" />

        <el-table-column label="Actions" width="200" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" plain>Edit</el-button>
            <el-button size="small" type="danger" plain @click="confirmDelete(scope.row.id)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination 
          :current-page="currentPage"
          :page-size="pageSize" 
          :total="tomato_list.length" 
          @current-change="handlePageChange"
          layout="prev, pager, next, jumper, total" 
          background 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.header h2 {
  color: #67c23a;
  font-size: 28px;
  margin: 0;
}

.add-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 78%;
  margin-left: auto;
  margin-right: auto;
}

.add-section h3 {
  margin-top: 0;
  color: #333;
}

.input-group {
  display: flex;
  gap: 15px;
  align-items: center;
}

.topic-input {
  flex: 1;
}

.time-info {
  margin-bottom: 30px;
  width: 78%;
  margin-left: auto;
  margin-right: auto;
}

.time-info h3 {
  color: #333;
  margin-bottom: 15px;
}

.time-card {
  background: #fff;
  border: 1px solid #ebeef5;
}

.time-card pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Consolas', 'Monaco', monospace;
  line-height: 1.5;
}

.list-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
}

.list-section h3 {
  margin-top: 0;
  color: #333;
}

.tomato-table {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .add-section,
  .time-info {
    width: 100%;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .topic-input {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .el-table :deep(.el-table__cell) {
    padding: 8px 0;
  }
}
</style>