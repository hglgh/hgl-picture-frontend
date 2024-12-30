<template>
  <div id="homePage">
    <!--    搜索框-->
    <div class="search-bar">
      <a-input-search
        v-model:value="queryParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="onSearch"
      />
    </div>
    <!--    分类和标签筛选-->
    <a-tabs v-model:active-key="selectedCategory" @change="onSearch">
      <a-tab-pane key="all" tab="全部"/>
      <a-tab-pane v-for="category in categoryList" :tab="category" :key="category"/>
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签:</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTags[index]"
          @change="onSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>

    <!--    图片列表-->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!--          单张图片-->
          <a-card hoverable @click="doClickPicture(picture)">
            <template #cover>
              <img
                :alt="picture.name"
                :src="picture.url"
                style="height: 180px; object-fit: cover"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
//定义数据
const dataList = ref<API.PictureVO[]>([])
const total = ref<number>(0)

//搜索条件
const queryParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

//分页参数
const pagination = computed(() => {
  return {
    current: queryParams.current,
    pageSize: queryParams.pageSize,
    total: total.value,
    onChange: (page: number, pageSize: number) => {
      queryParams.current = page
      queryParams.pageSize = pageSize
      fetchData()
    },
  }
})

//获取数据
const fetchData = async () => {
  loading.value = true
  //转换搜索参数
  const params = {
    ...queryParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all'){
    params.category = selectedCategory.value
  }
  selectedTags.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败')
  }
  loading.value = false
}

const doTableChange = (page: any) => {
  queryParams.current = page.current
  queryParams.pageSize = page.pageSize
  fetchData()
}
//页面加载时请求一次获取数据
onMounted(() => {
  fetchData()
})

/**
 * 搜索图片
 */
const onSearch = () => {
  //重置页码
  queryParams.current = 1
  fetchData()
}
//标签和分类列表
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTags = ref<boolean[]>([])
/**
 * 获取标签和分类选项
 */
const getTagCategoryOpations = async () => {
  const response = await listPictureTagCategoryUsingGet()
  if (response.data.code === 0 && response.data.data) {
    tagList.value = response.data.data.tagList ?? [];
    categoryList.value = response.data.data.categoryList ?? [];
  } else {
    message.error('获取标签和分类选项失败,' + response.data.message)
  }
}
onMounted(() => {
  getTagCategoryOpations()
})

/**
 * 点击图片跳转到图片详情页
 * @param picture
 */
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
    // query: {
    //   id: picture.id,
    // },
  })
}
</script>

<style scoped>
#homePage {
  margin-bottom: 16px;
}
#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}
#homePage .tag-bar {
  margin-bottom: 16px;
}
</style>
