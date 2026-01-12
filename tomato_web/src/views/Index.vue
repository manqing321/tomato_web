<script setup>
import { ref, computed, watch, nextTick, reactive, onMounted } from 'vue'
import { get_tomatoes, create_tomato, delete_tomato, update_tomato, stat_day, stat_month, stat_name } from '@/apis/tomato.js'
import * as echarts from 'echarts'
import TomatoIcon from '@/assets/Tomato.svg'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled, CircleCheckFilled } from '@element-plus/icons-vue'

// 统计相关的响应式变量
const activeStatisticsTab = ref('day')
const dayResult = ref('')
const monthResult = ref('')
const nameResult = ref('')
const dayChart = ref(null)
const monthChart = ref(null)
const nameChart = ref(null)

// 天统计数据
const dayData = ref({})
// 月统计数据
const monthData = ref({})
// 总计统计数据
const nameData = ref({})

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
  const deleteDialog = ref(false)
  const deleteTomatoId = ref(null)
  const successDialog = ref(false)
  const successMessage = ref('')
 
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

  const confirmDelete = (id) => {
    deleteTomatoId.value = id
    deleteDialog.value = true
  }

  const executeDelete = () => {
    if (deleteTomatoId.value) {
      delete_tomato({"tomato_id": deleteTomatoId.value}).then(res => {
        if (res.data.ok) {
          if (deleteTomatoId.value == current_tomato_id.value) {
            timeinfo.value = ``
          }
          searchTomato();
          successMessage.value = 'Deleted successfully';
          successDialog.value = true;
        } else {
          console.log(res);
        }
      });
      deleteDialog.value = false
      deleteTomatoId.value = null
    }
  }

const searchTomato = () => {
  get_tomatoes().then(res => {
    tomato_list.value = res.data
  }).catch(err => {
    console.log(err);
  })
}

const showDeleteConfirm = (id) => {
  ElMessageBox({
    title: 'Delete tomato!',
    message: 'Are you sure you want to delete this tomato?',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    customClass: 'delete-confirm-dialog',
    closeOnClickModal: false,
    closeOnPressEscape: false,
  }).then(() => {
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
const activeTab = ref('history')

const paginatedTomatoList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tomato_list.value.slice(start, end)
})

const handlePageChange = (page) => {
  currentPage.value = page
}


searchTomato()

// 初始化图表
const initCharts = () => {
  if (dayChart.value) {
    dayChart.value = echarts.init(dayChart.value)
  }
  if (monthChart.value) {
    monthChart.value = echarts.init(monthChart.value)
  }
  if (nameChart.value) {
    nameChart.value = echarts.init(nameChart.value)
  }
}

// 更新天统计图表
const updateDayChart = () => {
  if (!dayChart.value || !dayData.value) return
  
  const chart = echarts.getInstanceByDom(dayChart.value)
  if (!chart) return
  
  const dates = Object.keys(dayData.value)
  const values = Object.values(dayData.value)
  
  const option = {
    title: {
      text: 'Daily Tomato Statistics',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: 'Tomato Count'
    },
    series: [{
      name: 'Tomato Count',
      type: 'bar',
      data: values,
      itemStyle: {
        color: '#67c23a'
      }
    }]
  }
  
  chart.setOption(option)
}

// 更新月统计图表
const updateMonthChart = () => {
  if (!monthChart.value || !monthData.value) return
  
  const chart = echarts.getInstanceByDom(monthChart.value)
  if (!chart) return
  
  const months = Object.keys(monthData.value)
  const values = Object.values(monthData.value)
  
  const option = {
    title: {
      text: 'Monthly Tomato Statistics',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: 'Tomato Count'
    },
    series: [{
      name: 'Tomato Count',
      type: 'bar',
      data: values,
      itemStyle: {
        color: '#409eff'
      }
    }]
  }
  
  chart.setOption(option)
}

// 更新总计统计图表
const updateNameChart = () => {
  if (!nameChart.value || !nameData.value) return
  
  const chart = echarts.getInstanceByDom(nameChart.value)
  if (!chart) return
  
  const names = Object.keys(nameData.value)
  const values = Object.values(nameData.value)
  
  const option = {
    title: {
      text: 'Task Type Statistics',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: 'Tomato Count'
    },
    series: [{
      name: 'Tomato Count',
      type: 'bar',
      data: values,
      itemStyle: {
        color: '#e6a23c'
      }
    }]
  }
  
  chart.setOption(option)
}

// 获取所有统计数据
const fetchAllStatistics = async () => {
  try {
    // 获取天统计
    const dayResponse = await stat_day()
    dayData.value = dayResponse.data
    dayResult.value = JSON.stringify(dayResponse.data, null, 2)
    
    // 获取月统计
    const monthResponse = await stat_month()
    monthData.value = monthResponse.data
    monthResult.value = JSON.stringify(monthResponse.data, null, 2)
    
    // 获取总计统计
    const nameResponse = await stat_name()
    nameData.value = nameResponse.data
    nameResult.value = JSON.stringify(nameResponse.data, null, 2)
    
    // 更新图表
    setTimeout(() => {
      updateDayChart()
      updateMonthChart()
      updateNameChart()
      
      // 主动触发图表重新渲染，确保尺寸正确
      triggerChartsResize()
    }, 100)
    
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 主动触发图表重新渲染的方法
const triggerChartsResize = () => {
  nextTick(() => {
    if (dayChart.value) {
      const chart = echarts.getInstanceByDom(dayChart.value)
      if (chart) {
        chart.resize()
      }
    }
    if (monthChart.value) {
      const chart = echarts.getInstanceByDom(monthChart.value)
      if (chart) {
        chart.resize()
      }
    }
    if (nameChart.value) {
      const chart = echarts.getInstanceByDom(nameChart.value)
      if (chart) {
        chart.resize()
      }
    }
  })
}


// 组件挂载时初始化
onMounted(() => {
  initCharts()
  fetchAllStatistics()
})

// 窗口大小改变时重新渲染图表
window.addEventListener('resize', () => {
  if (dayChart.value) {
    const chart = echarts.getInstanceByDom(dayChart.value)
    if (chart) chart.resize()
  }
  if (monthChart.value) {
    const chart = echarts.getInstanceByDom(monthChart.value)
    if (chart) chart.resize()
  }
  if (nameChart.value) {
    const chart = echarts.getInstanceByDom(nameChart.value)
    if (chart) chart.resize()
  }
})

// 在组件载入时就获取所有统计信息
const fetchStatisticsOnLoad = async () => {
  try {
    // 直接调用统计接口
    const [dayResponse, monthResponse, nameResponse] = await Promise.all([
      stat_day(),
      stat_month(),
      stat_name()
    ])
    
    // 更新数据
    dayData.value = dayResponse.data
    monthData.value = monthResponse.data
    nameData.value = nameResponse.data
    dayResult.value = JSON.stringify(dayResponse.data, null, 2)
    monthResult.value = JSON.stringify(monthResponse.data, null, 2)
    nameResult.value = JSON.stringify(nameResponse.data, null, 2)
    
    // 更新图表
    nextTick(() => {
      updateDayChart()
      updateMonthChart()
      updateNameChart()
      triggerChartsResize()
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 在组件载入时就获取统计信息
fetchStatisticsOnLoad()

// 监听主 Tab 切换，切换到统计 Tab 时更新图表
watch(activeTab, (newTab) => {
  if (newTab === 'statistics') {
    // 如果数据已经存在，只更新图表显示
    nextTick(() => {
      if (dayData.value) {
        updateDayChart()
      }
      if (monthData.value) {
        updateMonthChart()
      }
      if (nameData.value) {
        updateNameChart()
      }
      
      // 触发图表重新渲染，确保尺寸正确
      triggerChartsResize()
    })
  }
})

// 监听统计 Tab 内部切换，更新对应图表
watch(activeStatisticsTab, (newTab) => {
  if (newTab === 'day' && dayData.value) {
    updateDayChart()
    triggerChartsResize()
  } else if (newTab === 'month' && monthData.value) {
    updateMonthChart()
    triggerChartsResize()
  } else if (newTab === 'name' && nameData.value) {
    updateNameChart()
    triggerChartsResize()
  }
})

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

  <!-- 删除确认弹窗 -->
  <el-dialog
    title="Delete tomato!"
    v-model="deleteDialog"
    draggable
    width="450px"
    class="delete-confirm-dialog"
    :close-on-click-modal="false"
  >
    <div class="dialog-content">
      <div class="delete-message">
        <el-icon class="warning-icon" color="#f56c6c"><WarningFilled /></el-icon>
        <p>Are you sure you want to delete this tomato?</p>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <div class="action-buttons">
          <el-button @click="deleteDialog = false">
            Cancel
          </el-button>
          <el-button
            type="danger"
            @click="executeDelete"
          >
            Delete
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 成功消息弹窗 -->
  <el-dialog
    title="Success"
    v-model="successDialog"
    draggable
    width="400px"
    class="success-dialog"
    :close-on-click-modal="false"
  >
    <div class="dialog-content">
      <div class="success-message">
        <el-icon class="check-icon" color="#67c23a"><CircleCheckFilled /></el-icon>
        <text style="margin-left: 30px;">{{ successMessage }}</text>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <div class="action-buttons">
          <el-button
            type="primary"
            @click="successDialog = false"
          >
            OK
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
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Tomato History" name="history">
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
        </el-tab-pane>
        
        <el-tab-pane label="Tomato Statistics" name="statistics">
          <div class="statistics-container">
            <el-tabs v-model="activeStatisticsTab">
              <el-tab-pane label="Day" name="day">
                <div class="chart-container" ref="dayChart"></div>
              </el-tab-pane>
              
              <el-tab-pane label="Month" name="month">
                <div class="chart-container" ref="monthChart"></div>
              </el-tab-pane>
              
              <el-tab-pane label="Total" name="name">
                <div class="chart-container" ref="nameChart"></div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-tab-pane>
      </el-tabs>
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

/* 删除确认弹窗样式 */
.delete-confirm-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.delete-confirm-dialog :deep(.el-dialog__header) {
  background-color: #f5f7fa;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.delete-confirm-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #303133;
}

.delete-confirm-dialog :deep(.el-dialog__body) {
  padding: 25px 30px;
}

.delete-confirm-dialog :deep(.el-dialog__footer) {
  padding: 15px 30px 20px;
  background-color: #f5f7fa;
  border-top: 1px solid #ebeef5;
}

.dialog-content {
  padding: 10px 0;
}

.delete-message {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #606266;
  font-size: 14px;
}

.warning-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.delete-message p {
  margin: 0;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.delete-confirm-dialog :deep(.el-button--danger) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.delete-confirm-dialog :deep(.el-button--default) {
  background-color: #fff;
  border-color: #dcdfe6;
  color: #606266;
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

.statistics-container {
  width: 100%;
  min-width: 0; /* 确保flex容器中的子元素可以收缩 */
}

.chart-container {
  width: 100%;
  height: 400px;
  min-width: 0; /* 确保flex容器中的子元素可以收缩 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics-container {
    padding: 15px;
  }
  
  .chart-container {
    height: 300px;
  }
}
</style>