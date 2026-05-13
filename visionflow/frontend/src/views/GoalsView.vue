<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-0 py-8">
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <span class="text-indigo-500 flex-shrink-0" v-html="icon('goals', 'w-7 h-7')" />
          My Goals
        </h1>
        <p class="text-slate-500 text-sm mt-1">{{ goalStore.goals.length }} goal{{ goalStore.goals.length !== 1 ? 's' : '' }} total</p>
      </div>
      <button @click="showForm = true" class="btn-primary btn">+ New Goal</button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="cat in ['All', ...categories]"
        :key="cat"
        @click="filterCategory = cat === 'All' ? '' : cat"
        class="btn text-sm py-1.5 px-3"
        :class="(filterCategory === '' && cat === 'All') || filterCategory === cat ? 'btn-primary' : 'btn-secondary'"
      >{{ cat }}</button>
    </div>

    <LoadingSpinner v-if="goalStore.loading" />

    <div v-else-if="filteredGoals.length === 0" class="text-center py-20">
      <div class="flex justify-center mb-4">
        <span class="text-indigo-200" v-html="icon('goals', 'w-16 h-16')" />
      </div>
      <h3 class="text-lg font-semibold text-slate-700 mb-2">No goals yet</h3>
      <p class="text-slate-400 mb-6">Start by creating your first goal</p>
      <button @click="showForm = true" class="btn-primary btn">+ New Goal</button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <GoalCard
        v-for="goal in filteredGoals"
        :key="goal._id"
        :goal="goal"
        @delete="handleDelete"
      />
    </div>

    <GoalForm
      v-if="showForm"
      @done="closeForm"
      @close="closeForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGoalStore } from '../stores/goalStore'
import GoalCard from '../components/goals/GoalCard.vue'
import GoalForm from '../components/goals/GoalForm.vue'
import LoadingSpinner from '../components/shared/LoadingSpinner.vue'
import { icon } from '../utils/icons'

const goalStore = useGoalStore()
const showForm = ref(false)
const filterCategory = ref('')
const categories = ['Health', 'Career', 'Finance', 'Education', 'Personal', 'Other']

const filteredGoals = computed(() =>
  filterCategory.value
    ? goalStore.goals.filter(g => g.category === filterCategory.value)
    : goalStore.goals
)

const closeForm = () => { showForm.value = false }

const handleDelete = async (id: string) => {
  if (confirm('Delete this goal?')) await goalStore.deleteGoal(id)
}

onMounted(() => goalStore.fetchGoals())
</script>
