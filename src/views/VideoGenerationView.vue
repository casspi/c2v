<script setup lang="ts">
import { ref } from 'vue'

const prompt = ref('')
const isGenerating = ref(false)
const generatedVideoUrl = ref('')
const error = ref('')

const progress = ref(0)
const statusMessage = ref('')

const generateVideo = async () => {
  if (!prompt.value.trim()) {
    error.value = '请输入视频描述'
    return
  }

  error.value = ''
  isGenerating.value = true
  generatedVideoUrl.value = ''
  progress.value = 0
  statusMessage.value = '正在提交任务...'

  try {
    // 1. Submit task
    const response = await fetch('https://dev.pkstar.cn/c2v/api/v1/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_subject: prompt.value,
        video_script: 'light,fun,happy',
        // video_terms: 'string',
        // video_aspect: '9:16',
        // video_concat_mode: 'random',
        // video_transition_mode: 'None',
        // video_clip_duration: 5,
        // video_count: 1,
        // video_source: 'pexels',
        // video_materials: [
        //   {
        //     provider: 'pexels',
        //     url: '',
        //     duration: 0,
        //   },
        // ],
        // custom_audio_file: 'string',
        // video_language: '',
        // voice_name: '',
        // voice_volume: 1,
        // voice_rate: 1,
        // bgm_type: 'random',
        // bgm_file: '',
        // bgm_volume: 0.2,
        // subtitle_enabled: true,
        // subtitle_position: 'bottom',
        // custom_position: 70,
        // font_name: 'STHeitiMedium.ttc',
        // text_fore_color: '#FFFFFF',
        // text_background_color: true,
        // font_size: 60,
        // stroke_color: '#000000',
        // stroke_width: 1.5,
        // n_threads: 2,
        // paragraph_number: 1,
      }),
    })

    if (!response.ok) {
      throw new Error('提交任务失败')
    }

    const data = await response.json()
    const taskId = data.data.task_id

    if (!taskId) {
      throw new Error('未获取到任务ID')
    }

    // 2. Poll for status
    await pollTaskStatus(taskId)
  } catch (e) {
    console.error(e)
    error.value = e instanceof Error ? e.message : '生成视频失败，请重试。'
    isGenerating.value = false
  }
}

const pollTaskStatus = async (taskId: string) => {
  const poll = async () => {
    try {
      const response = await fetch(`https://dev.pkstar.cn/c2v/api/v1/tasks/${taskId}`)
      const res = await response.json()

      if (res.status !== 200) {
        throw new Error(res.message || '获取任务状态失败')
      }

      const taskData = res.data
      const state = taskData.state
      progress.value = taskData.progress || 0

      // Log for debugging
      console.log('Task Status:', taskData)

      if (state === 1) {
        // Success
        // Assuming the videos array contains the result, or we construct the URL
        if (taskData.videos && taskData.videos.length > 0) {
          // If the URL is absolute, use it. If relative, use proxy.
          // Usually it returns a path like /tasks/...
          generatedVideoUrl.value = taskData.videos[0]
        } else {
          // Fallback construction if needed, based on common patterns
          // But let's hope videos is populated.
          // If not, maybe check if there is a 'url' field
          throw new Error('视频生成成功，但无法获取播放地址')
        }
        isGenerating.value = false
        statusMessage.value = '生成完成！'
        return
      } else if (state === -1) {
        // Failed
        throw new Error('任务执行失败')
      } else {
        // Processing
        statusMessage.value = `正在生成中... ${progress.value}%`
        setTimeout(poll, 2000)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '查询状态失败'
      isGenerating.value = false
    }
  }

  await poll()
}

const downloadVideo = () => {
  if (!generatedVideoUrl.value) return

  const a = document.createElement('a')
  a.href = generatedVideoUrl.value
  a.download = `ai-video-${Date.now()}.mp4`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>

<template>
  <div class="video-generation-container">
    <div class="content-wrapper">
      <h1 class="title">AI 视频生成器</h1>
      <p class="subtitle">用 AI 将你的创意转化为现实</p>

      <div class="input-section">
        <textarea
          v-model="prompt"
          class="prompt-input"
          placeholder="描述你想生成的视频（例如：日落时分，未来城市的飞行汽车...）"
          rows="4"
        ></textarea>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button @click="generateVideo" class="generate-btn" :disabled="isGenerating">
          <span v-if="isGenerating" class="loader"></span>
          {{ isGenerating ? statusMessage : '生成视频' }}
        </button>
      </div>

      <div v-if="generatedVideoUrl" class="result-section">
        <div class="video-wrapper">
          <video controls :src="generatedVideoUrl" class="preview-video"></video>
        </div>
        <div class="actions">
          <button @click="downloadVideo" class="download-btn">下载视频</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-generation-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  justify-content: center;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

.content-wrapper {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 1280px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(45deg, #2196f3, #00bcd4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.subtitle {
  color: #666;
  font-size: 16px;
  margin-bottom: 10px;
}

.input-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.prompt-input {
  width: 100%;
  padding: 1.2rem;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
  resize: none;
  background: #f8f9fa;
  color: #333;
}

.prompt-input:focus {
  outline: none;
  border-color: #2196f3;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.1);
}

.generate-btn {
  background: linear-gradient(45deg, #2196f3, #00bcd4);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(33, 150, 243, 0.3);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #ff5252;
  font-size: 0.9rem;
  margin-top: -1rem;
}

.result-section {
  width: 100%;
  animation: fadeIn 0.5s ease;
}

.video-wrapper {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  background: #000;
}

.preview-video {
  width: 100%;
  display: block;
}

.actions {
  display: flex;
  justify-content: center;
}

.download-btn {
  background: white;
  color: #2196f3;
  border: 2px solid #2196f3;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.download-btn:hover {
  background: #2196f3;
  color: white;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
