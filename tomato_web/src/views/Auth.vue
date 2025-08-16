<script setup>
import { ref, computed } from 'vue'
import { register, login } from '@/apis/user'
import router from '@/routers/route'
import TomatoIcon from '@/assets/Tomato.svg'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const isRegister = ref(false)
const message = ref('')

const toggleMode = () => {
  isRegister.value = !isRegister.value
  message.value = ''
  // 切换模式时清空表单
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
}

// 密码确认校验
const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value
})

const handleSubmit = async () => {
  // 注册时校验密码确认
  if (isRegister.value && !passwordsMatch.value) {
    message.value = '两次输入的密码不一致'
    return
  }

  try {
    if (isRegister.value) {
      await register({ username: username.value, password: password.value })
      message.value = '账户创建成功，请登录'
      setTimeout(() => {
        isRegister.value = false
        message.value = ''
        // 清空表单
        username.value = ''
        password.value = ''
        confirmPassword.value = ''
      }, 1500)
    } else {
      const res = await login({ username: username.value, password: password.value })
      localStorage.setItem('access_token', res.data.access_token)
      localStorage.setItem('token_type', res.data.token_type)
      router.push('/')
    }
  } catch (error) {
    message.value = error.response?.data?.detail || 
                   (isRegister.value ? '创建用户失败' : '登录失败')
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="header">
        <h2>
          <img :src="TomatoIcon" class="tomato-icon" alt="Tomato" />
          {{ isRegister ? '创建账户' : '用户登录' }}
        </h2>
        <p class="subtitle">{{ isRegister ? '创建新账户以开始使用' : '登录您的账户' }}</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label>用户名</label>
          <input 
            type="text" 
            v-model="username" 
            required 
            :placeholder="'请输入您的用户名'"
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input 
            type="password" 
            v-model="password" 
            required 
            :placeholder="'请输入您的密码'"
            class="form-input"
          >
        </div>
        
        <!-- 注册时显示确认密码字段 -->
        <div class="form-group" v-if="isRegister">
          <label>确认密码</label>
          <input 
            type="password" 
            v-model="confirmPassword" 
            required 
            :placeholder="'请再次输入您的密码'"
            class="form-input"
            :class="{ 'error': confirmPassword && !passwordsMatch }"
          >
          <p v-if="confirmPassword && !passwordsMatch" class="error-message">两次输入的密码不一致</p>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isRegister && !passwordsMatch">
          {{ isRegister ? '创建账户' : '登录' }}
        </button>
      </form>
      
      <div class="toggle-section">
        <p class="toggle-text" @click="toggleMode">
          {{ isRegister ? '已有账户？点击登录' : '没有账户？点击创建' }}
        </p>
      </div>
      
      <p v-if="message" class="message" :class="{ success: !message.includes('失败') && !message.includes('错误') }">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.auth-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 450px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
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

.subtitle {
  color: #909399;
  margin-top: 8px;
  font-size: 14px;
}

.auth-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #606266;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #67c23a;
}

.form-input.error {
  border-color: #f56c6c;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 0;
}

.submit-btn {
  width: 100%;
  background-color: #67c23a;
  border: none;
  color: white;
  padding: 12px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #5daf34;
}

.submit-btn:disabled {
  background-color: #b3e19d;
  cursor: not-allowed;
}

.toggle-section {
  text-align: center;
  margin-top: 20px;
}

.toggle-text {
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  margin: 0;
}

.toggle-text:hover {
  text-decoration: underline;
}

.message {
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  font-size: 14px;
}

.message.success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 20px;
  }
  
  .header h2 {
    font-size: 24px;
  }
}
</style>