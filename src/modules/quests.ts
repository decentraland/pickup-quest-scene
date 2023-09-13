import { QuestState } from '@dcl/quests-client'
import { spawnItemsToPickup } from './items'
import { spawnZone } from './zone'

export function onQuestStart() {
  if (step !== 'prepare-for') {
    spawnItemsToPickup()
    step = 'prepare-for'
  }
}

export function onAllItemsPickedUp() {
  if (step !== 'go-to-zone') {
    spawnZone()
    step = 'go-to-zone'
  }
}

export function onQuestComplete() {
  if (step !== 'completed') {
    // Just completed the quest
    step = 'completed'
  }
}

type Step = 'prepare-for' | 'go-to-zone' | 'completed'

export let step: Step

export function updateFromState(state: QuestState) {
  if (state.stepsLeft === 0) {
    console.log('> QUESTS SCENE > UPDATE FROM STEP > === 0')
    onQuestComplete()
  } else if (state.stepsCompleted.length === 0) {
    console.log('> QUESTS SCENE > UPDATE FROM STEP > START')
    onQuestStart()
  } else if (state.stepsCompleted.includes('prepare-for')) {
    console.log('> QUESTS SCENE > UPDATE FROM STEP > prepare for')
    onAllItemsPickedUp()
  }
}
