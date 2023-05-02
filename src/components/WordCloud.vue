
<template>
  <div class="w-full h-full"  ref="divRef"></div>
</template>

<script lang='ts'>
import { defineComponent, ref, computed, watch } from 'vue'
import type { PropType } from 'vue'
import cloud from 'd3-cloud'
import { renderWordCloud, updateWordCloud  }from '../utils/d3Functions'

interface WordCountObj {
  [key: string]: WordObj
}
interface WordObj {
  text: string
  size: number
}

export default defineComponent({
  props: {
    wordCountObj: {
      type: Object as PropType<WordCountObj | {}>, 
      default: () => {}
    },
    nodeArray: {
      type: Array as PropType<WordObj[] | []>,
      default: () => []
    },
    allWords: {
      type: Array as PropType<string []>,
      default: () => []
    }
  },
  setup (props) {
    const containerWidth = ref(800)
    const containerHeight = ref(600)
    const svgStyleClasses = computed(() => {
      return `w-max h-max`
    })
    const svgRef = ref<HTMLDivElement | null>(null) 
    const divRef = ref<HTMLDivElement | null>(null)
    const nodesFromProps = computed<WordObj[]>((() => {
      let min = 3
      if (props.nodeArray.length > 500) {
        min = (props.allWords.length / props.nodeArray.length)  
      } 
      return props.nodeArray.filter(node => {
        return node.size > min
      })
    }))

    // initialize d3 cloud layout
    const cloudLayout = ref(cloud().size([800, 600]))
    const isLoaded = ref(false)

    const d3InitFunction = () => {
      renderWordCloud(cloudLayout.value, divRef.value, nodesFromProps.value)
    }
    const updateD3Function = () => {
      updateWordCloud(cloudLayout.value, nodesFromProps.value)
    }

    watch(() => props.wordCountObj, () => {
      if (!isLoaded.value) {
        d3InitFunction()
        isLoaded.value = true
      } else {
        updateD3Function()
      }
    }, { deep: true })
    return {
      containerWidth,
      containerHeight,
      svgRef, 
      divRef,
      svgStyleClasses
    }
  }
})
</script>
