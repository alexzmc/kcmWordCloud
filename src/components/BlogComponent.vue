
<template>
  <div class="column" style="width: 800px"> 
    <div class="row items-center justify-evenly bg-blue-grey-10 text-indigo-3">
      <div class="column col-4">
        <DropdownMenu 
          class="row"
          :options="categories"
          title="Categories"
          @option-selected="categorySelected"
        />
        <span class="row">Posts Limit</span> 
        <q-slider 
          v-model="requestLimit" 
          :markerLabels="rangeLabelArray"
          :min="0" 
          :max="1000"
          label
          label-text-color="blue-grey-10"
          class="slider row"
          color="blue-4"
        ></q-slider>
      </div>
    <div class="column col-4">
      <q-btn @click="showDateRanges=true" class="">
        Date Ranges
      </q-btn>
      <DatePicker 
        v-if="showDateRanges"
        @new-start-date="updateStartDate"
        @new-end-date="updateEndDate"
        @close-datepicker="showDateRanges=false"
      />
      <span>Range of Posts</span> 
      <q-range 
        v-model="rangeOfPosts" 
        :min="0" 
        :max="blogData.length"
        class="slider"
        markers
        :markerLabels="noPostsLabelArray"
        dragRange
        color="blue-4"
        label-text-color="blue-4"
      ></q-range>
    </div>
  </div>
    <word-cloud 
      :wordCountObj="wordCountObj" 
      :nodeArray="Object.values(wordCountObj)" 
      :allWords="allWords"
    ></word-cloud>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue'
import WordCloud from './WordCloud.vue'
import DatePicker from './DatePicker.vue'
import DropdownMenu from './DropdownMenu.vue'
import { date as qdate} from 'quasar'
import { breakContents, formatISO, reduceWords, toISO } from '../utils/contentHelper'
import axios from 'axios'

interface Blog {
  contents: string
}
interface CleanedBlog { // for after data cming back has kept important traits
  contents: string[]
  publishedDate: string
  categories: Array<Category>
}
interface Category {
  name: string
  id: number
  selected?: boolean
}
interface Categories {
  [key: string]: Category
}
interface Content {
  categories: Array<Category>
  contents: string 
  published_at: string
  content_type: string
}

export default defineComponent({
  components: { WordCloud, DatePicker, DropdownMenu },
  setup() {
    const blogs = ref<Array<Blog>>([])
    const wordCountObj = ref<{}>({}) 
    const categories = ref<Categories>({}) 
    const blogData = ref<Array<CleanedBlog>>([]) 
    const allWords = ref<string[]>([]) 
    const loaded = ref(false)
    const startDateObj = new Date()
    startDateObj.setMonth(startDateObj.getMonth() - 1)
    const startDateObjRef = ref<Date>(startDateObj)
    const startDate = ref(qdate.formatDate(startDateObj, 'YYYY/MM/DD'))
    const nowDate = new Date()
    const endDate = ref(qdate.formatDate(nowDate, 'YYYY/MM/DD'))
    
    const noPostsLabelArray = computed(() => [
        { value: 0, label: 'recent posts', style: { fontSize: '12px' } },
        { value: blogData.value.length, label: 'older posts', style: { fontSize: '12px' } },
      ])
    const rangeLabelArray = [
        { value: 0, label: '0', style: { fontSize: '12px' } },
        { value: 1000, label: '1000', style: { fontSize: '12px' } },
      ]

    // keep track of what the lower limit of each req was
    const publishedAtLowerLim = ref(startDateObjRef.value.toISOString())

    const numberOfPosts = ref(200)
    const rangeOfPosts = ref({ min: 0, max: 200 }) // min corresponds to 0 index i.e. more recent posts
    const requestLimit = ref(200)

    const showDateRanges = ref(false)
  
    const fetchContents = async (dateISO: string, beforeISO: string, page = 0) => {
      const contents = []
      const limit = Math.min(requestLimit.value, 200) // docs say limit at 200
      const baseURL = import.meta.env.VITE_BASE_URL
      const pw = import.meta.env.VITE_PASSWORD
      const username = import.meta.env.VITE_USERNAME
     
      const options = {
        method: 'GET',
        url: baseURL, 
        params: { 
          sort_by: 'published_at', 
          sort_dir: 'desc',
          published_since: dateISO,
          published_before: beforeISO,
          limit: 200,
          page: page,
          types:'blog'
        },
        auth: {
          username: username, 
          password: pw
        }
	    }

      const { data } = await axios.request(options)
      contents.push(...data.content)
      let hasMore = data.has_more 
      let left = requestLimit.value - limit
      while (hasMore === true && left > 0) { // pagination
        options.params.page += 1
        options.params.limit = Math.max(left, limit)
        const response = await axios.request(options)
        hasMore = response.data.has_more
        contents.push(...response.data.content)
        left -= limit
      }
      publishedAtLowerLim.value = dateISO
      rangeOfPosts.value.max = contents.length
      return contents
    }
    const retrieveContents = async (startISO?: string | undefined, beforeISO?: string | undefined, page = 0) => { 
      if (!startISO) startISO = startDateObjRef.value.toISOString()
      if (!beforeISO) { // make this iso for tomorrow
        const before = new Date()
        before.setDate(before.getDate() + 1)
        beforeISO = before.toISOString()
      }
      const contentData = await fetchContents(startISO, beforeISO, page)
      const mappedData: CleanedBlog[] = []
      const categoryData: { [key: string]: Category } = {}
      contentData.forEach((content: Content) => {
        if (content.content_type === 'blog' && typeof content.contents === 'string' && content.contents.length) {
          mappedData.push({ 
            contents: breakContents(content.contents),
             publishedDate: formatISO(content.published_at),
             categories: content.categories
          })
        }
        content.categories.forEach((category: Category): void => {
        if (!categoryData[category.name]) {
            categoryData[category.name] = {
            name: category.name,
            id: category.id,
            selected: true
          }
        }
      })
    })
    blogData.value.push( ...mappedData)
    categories.value = { ...categories.value, ...categoryData }
    return setAllWords(mappedData)
  }

    const setAllWords = (data: CleanedBlog[]) => {
      const words: string[] = []
      data.forEach(blog => {
        words.push(...blog.contents)
      })
      allWords.value = allWords.value.concat(words)
      return words
    }

    const updateAllWords = (data: CleanedBlog[]) => {
      const words: string[] = []
      data.forEach(blog => {
        // make sure it is part of selected categories
        for (let i = 0; i < blog.categories.length; i++) {
          if (categories.value[blog.categories[i].name]?.selected === true) {
            break
          }
          if (i === blog.categories.length - 1) return
        }
        if (blog.publishedDate >= startDate.value && blog.publishedDate <= endDate.value) {
          words.push(...blog.contents)
        }
      })
      allWords.value = words
      return words
    }

    
    // filters from selecting filters
    const categorySelected = (cat: Category, bool: boolean) => { 
      cat.selected = bool
    }

    const updateStartDate = (newStartDate: string) => {
      startDate.value = newStartDate
    }
    const updateEndDate = (newEndDate: string) => {
      endDate.value = newEndDate
    }

    onMounted(async() => {
      const words = await retrieveContents()
      const reduced = reduceWords(words)
      wordCountObj.value = reduced
      loaded.value = true   
    })

    const updateAndReduce = () => {
      const blog = [...blogData.value]
        allWords.value = updateAllWords(blog)
        const reduced = reduceWords(allWords.value)
        wordCountObj.value = reduced
    }

    // ** watchers for selectors **//
    watch(() => categories, () => {
      if (loaded.value) {
        updateAndReduce()
      }
    }, { deep: true })

    watch([startDate, endDate], async () => {
      if (loaded.value) {
        if (startDate.value < formatISO(publishedAtLowerLim.value)) {
          retrieveContents(toISO(startDate.value), publishedAtLowerLim.value)
        }
        updateAndReduce()
      }
    })

    watch(numberOfPosts, () => {
      if (numberOfPosts.value < blogData.value.length) {
        const blog = [...blogData.value]
        allWords.value = updateAllWords(blog.slice(0, numberOfPosts.value))
        const reduced = reduceWords(allWords.value)
        wordCountObj.value = reduced
      } 
    })

    watch(rangeOfPosts, () => {
      const blog = [...blogData.value]
      allWords.value = updateAllWords(blog.slice(rangeOfPosts.value.min, rangeOfPosts.value.max))
      const reduced = reduceWords(allWords.value)
      wordCountObj.value = reduced
    })

    return {
      blogs,
      blogData,
      wordCountObj,
      allWords,
      categories,
      categorySelected,
      updateStartDate,
      updateEndDate,
      startDate,
      endDate,
      numberOfPosts,
      noPostsLabelArray,
      requestLimit,
      rangeLabelArray,
      showDateRanges,
      publishedAtLowerLim,
      rangeOfPosts
    }
  }
})
</script>
