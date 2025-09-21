<script setup>
import { ref } from 'vue'
import { get_tomatoes, create_tomato, delete_tomato, update_tomato } from '@/apis/tomato.js'
import TomatoIcon from '@/assets/Tomato.svg'

const topic = ref('')
const timeinfo = ref('')
const tomato_list = ref([])
const current_tomato_id = ref(0)

const formatTableTime = (timeString) => {
  if (!timeString) return ''
  return timeString.replace('T', ' ').substring(0, 16)
}

const formatTime = (date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  }

const addTomato = () => {
  const now = new Date()
  const endTime = new Date(now.getTime() + 30 * 60 * 1000)
  let toamto_name = topic.value
  let starttime = formatTime(now)
  let stoptime = formatTime(endTime)
  let minutes = 30
  let user = "yajun"
  timeinfo.value = `【${topic.value}】 from ${starttime} to ${stoptime}`

  create_tomato({
    "name": toamto_name,
    starttime,
    stoptime,
    minutes,
    user
  }).then(res => {
    // console.log(res);
    current_tomato_id.value = res.data.id;
    searchTomato();
  }).catch(err => {
    console.log(err)
  })
}
 
  const dialog = ref(false)
 
  const edit_form_data = reactive({
    tomato: {},
    topic: "",
    start_time: ""
  })
  const submitEdit = () => {
    const starttime = new Date()
    
    if (edit_form_data.start_time) {
      const [hours, minutes] = edit_form_data.start_time.split(':').map(Number);
      starttime.setHours(hours);
      starttime.setMinutes(minutes);
      starttime.setSeconds(0);
    }
    const stoptime = new Date(starttime.getTime() + 30 * 60 * 1000)    
    let minutes = 30
    let user = ""
    update_tomato(edit_form_data.tomato.id, 
    {
      "name": edit_form_data.topic,
      "starttime": formatTime(starttime),
      "stoptime": formatTime(stoptime),
      minutes,
      user
    }
  ).then(res => {
      // console.log(res);
      let starttimeStr = formatTime(starttime)
      let stoptimeStr = formatTime(stoptime)
      if (res.data.id === current_tomato_id.value) {
        timeinfo.value = `【${edit_form_data.topic}】 from ${starttimeStr} to ${stoptimeStr}`
      }
      searchTomato();
    }).catch(err => {
      console.log(err)
    })
    
    dialog.value = false
  }
  const resetEdit = () => {
    edit_form_data.topic = edit_form_data.tomato.name
    const timePart = edit_form_data.tomato.starttime.split('T')[1]
    edit_form_data.start_time = timePart
  }

  const startEdit = (tomato) => {
    edit_form_data.tomato = tomato
    edit_form_data.topic = tomato.name    
    const timePart = tomato.starttime.split('T')[1]
    edit_form_data.start_time = timePart
    dialog.value = true
  }

const searchTomato = () => {
  get_tomatoes().then(res => {
    tomato_list.value = res.data
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
        if (id == current_tomato_id.value) {
          timeinfo.value = ``
        }
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


searchTomato()

</script>

<template>
  <el-dialog 
    title="Edit Tomato" 
    v-model="dialog" 
    draggable 
    width="550px"
    class="edit-tomato-dialog"
    :close-on-click-modal="false"
  >
    <div class="dialog-content">
      <el-form 
        :model="edit_form_data" 
        label-width="120px" 
        class="edit-form"
      >
        
        <el-form-item label="ID">
          <el-text>{{ edit_form_data.tomato.id }}</el-text>
        </el-form-item>

        <el-form-item label="Task Topic">
          <el-input 
            v-model="edit_form_data.topic" 
            placeholder="Enter task topic"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="Start Time">
          <el-time-picker 
            v-model="edit_form_data.start_time"
            value-format="HH:mm" 
            format="HH:mm" 
            placeholder="Select start time"
            class="time-picker"
          />
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resetEdit">
          Reset
        </el-button>
        <div class="action-buttons">
          <el-button @click="dialog = false">
            Cancel
          </el-button>
          <el-button 
            type="primary" 
            @click="submitEdit"
          >
            Confirm
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
  
  <div class="container">
    <div class="header">
      <h2>
        <img :src="TomatoIcon" class="tomato-icon" alt="Tomato" />
        Tomato-Clock
      </h2>
    </div>

    <div class="add-section">
      <h3>Add New Tomato</h3>
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
          Start Tomato
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
      <h3>Tomato History</h3>
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
        <el-table-column prop="stoptime" label="Stop Time" width="200">
          <template #default="scope">
            {{ formatTableTime(scope.row.stoptime) }}
          </template>
        </el-table-column>
        <el-table-column prop="minutes" label="Minutes" width="80" />
        <el-table-column prop="user" label="User" width="100" />

        <el-table-column label="Actions" width="200" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="startEdit(scope.row)">Edit</el-button>
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.tomato-icon {
  width: 32px;
  height: 32px;
  vertical-align: middle;
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

/* 编辑弹窗样式 */
.edit-tomato-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.edit-tomato-dialog :deep(.el-dialog__header) {
  background-color: #f5f7fa;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.edit-tomato-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #303133;
}

.edit-tomato-dialog :deep(.el-dialog__body) {
  padding: 25px 30px;
}

.edit-tomato-dialog :deep(.el-dialog__footer) {
  padding: 15px 30px 20px;
  background-color: #f5f7fa;
  border-top: 1px solid #ebeef5;
}

.dialog-content {
  padding: 10px 0;
}

.edit-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.edit-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.time-picker {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .edit-tomato-dialog :deep(.el-dialog) {
    width: 90% !important;
    margin: 0 auto !important;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons {
    width: 100%;
  }
}
</style>