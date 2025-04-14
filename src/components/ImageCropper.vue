<template>
  <a-modal
    class="image-cropper"
    v-model:visible="visible"
    title="编辑图片"
    :footer="false"
    @cancel="closeModal"
  >
    <vue-cropper
      ref="cropperRef"
      :img="imageUrl"
      :autoCrop="true"
      :fixedBox="false"
      :centerBox="true"
      :canMoveBox="true"
      :info="true"
      outputType="png"
    />
    <div style="margin-bottom: 16px" />
    <!--    图片操作-->
    <div class="image-cropper-actions">
      <a-space>
        <a-button @click="rotateLeft">向左旋转</a-button>
        <a-button @click="rotateRight">向右旋转</a-button>
        <a-button @click="changeScale(1)">放大</a-button>
        <a-button @click="changeScale(-1)">缩小</a-button>
        <a-button type="primary" :loading="loading" @click="handleConfirm">确认</a-button>
      </a-space>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { defineExpose, ref } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const loading = ref<boolean>(false)
// 编辑器组件的引用
const cropperRef = ref()
// 向左旋转
const rotateLeft = () => {
  cropperRef.value.rotateLeft()
}
// 向右旋转
const rotateRight = () => {
  cropperRef.value.rotateRight()
}

// 放大缩小
const changeScale = (num: number) => {
  cropperRef.value.changeScale(num)
}

const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    // blob 为已裁切的二进制文件
    const newPictureName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], newPictureName, { type: blob.type })
    // 上传图片
    handleUpload({ file })
  })
}
const handleUpload = async ({file}: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const response = await uploadPictureUsingPost(params, {}, file)
    if (response.data.code === 0 && response.data.data) {
      message.success('图片上传成功')
      props.onSuccess?.(response.data.data)
      closeModal()
    } else {
      message.error('上传失败')
    }
  } catch (error) {
    message.error('上传失败')
  } finally {
    loading.value = false
  }
}
const visible = ref(false)
// 打开模态框
const openModal = () => {
  visible.value = true
}
// 关闭模态框
const closeModal = () => {
  visible.value = false
}
// 暴露方法给父组件调用
defineExpose({
  openModal,
})
</script>
<style scoped>
.image-cropper {
  text-align: center;
}

.image-cropper .vue-cropper {
  height: 400px;
}
</style>
