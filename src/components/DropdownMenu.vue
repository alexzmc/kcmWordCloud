
<template>
  <div 
    v-if="showMenu"
    class="absolute modalBg"
    @click.stop="closeMenu"
  ></div>
  <q-btn 
    @click="showMenu=true"
    text-color="indigo-3"
    :style="{ marginLeft: '20px' }"
  >{{ title }}</q-btn>
  <div 
    class="menu absolute"
    :style="{ display : showMenu ? 'block' : 'none', top: '48px', marginLeft: '20px' }"
    color="indigo-4"
    text-color="light-blue-1"
  >
    <div
      v-for="option in Object.keys(options)"
      :class="options[option].selected ? 'bg-blue-grey-10' :'bg-indigo-4'"
      class="menuOption text-indigo-2"
      :key="options[option].id"
      @click="selectOption(options[option])"
    >{{ options[option].name }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import type { PropType } from 'vue'

interface Option {
  id: number
  name: string
  selected?: boolean
}
interface Options {
  [key: string]: Option
}
export default defineComponent({
  props: {
    options: {
      type: Object as PropType<Options>, 
      default: () => {}
    },
    title: {
      type: String 
    }
  },
  emits: ['option-selected'],
  setup(_, { emit }) {
    const showMenu = ref(false)

    const closeMenu = () => {
      showMenu.value = false
    }
    const selectOption = (e: Option) => {
      emit('option-selected', e, !e.selected)
    }
    return {
      selectOption,
      closeMenu,
      showMenu  
    } 
  }
})
</script>

<style scoped>
.menu {
  z-index: 50;
  color: white;
  overflow-y: scroll;
  max-height: 300px;
  scrollbar-width: thin;
}
.menuOption {
  padding: 5px 10px 5px 10px;
}
.menuOption:hover {
  background-color: #404950 !important; 
}
</style>
