
<template>
    <div 
      class="absolute modalBg"
      @click.stop="closeMenu"
    ></div>
    <div class="absolute" style="z-index:50;">
      <q-date 
        id="fromPicker"
        style="max-height: 250px; max-width: 250px; top: 5em;"
        color="indigo-4"
        text-color="light-blue-1"
        class="bg-blue-grey-10"
        dark
        v-model="startDate" 
        :navigation-max-year-month="endDate.slice(0,-3)"
        :navigation-min-year-month="minStartDate"
        :no-unset="true"
        minimal
      ></q-date>
      <q-date 
        id="toPicker"
        style="max-height: 250px; max-width: 250px; top: 5em;"
        minimal
        color="indigo-4"
        text-color="light-blue-1"
        class="bg-blue-grey-10"
        dark
        v-model="endDate" 
        :navigation-max-year-month="maxEndDate"
        :navigation-min-year-month="startDate.slice(0, -3)"
        :no-unset="true"
      ></q-date>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { date as qdate} from 'quasar'

export default defineComponent({
  emits: ['new-start-date', 'new-end-date', 'close-datepicker'],
  setup(_, { emit }) {
    const date = ref(null)
    const startDateObj = new Date()
    startDateObj.setMonth(startDateObj.getMonth() - 1)
    const startDate = ref(qdate.formatDate(startDateObj, 'YYYY/MM/DD'))
    const endDate = ref(qdate.formatDate(new Date(), 'YYYY/MM/DD'))
    const maxEndDate = ref(qdate.formatDate(new Date(), 'YYYY/MM'))
    const minStartDate = '2013/01'
    const maxEndFromPicker = computed(() => endDate.value.slice(0,-3))
    watch(startDate, () => {
      emit('new-start-date', startDate.value)
    })
    watch(endDate, () => {
      emit('new-end-date', endDate.value)
    })
    const closeMenu = () => {
      emit('close-datepicker')
    }
    return {
      date,
      startDate,
      endDate,
      maxEndDate,
      minStartDate,
      maxEndFromPicker,
      closeMenu
    }
  }
})

</script>

