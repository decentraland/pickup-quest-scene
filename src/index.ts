import { engine, executeTask } from '@dcl/sdk/ecs'
import mitt from 'mitt'
import { Action, QuestInstance, createQuestsClient } from '@dcl/quests-client'
import { QuestUI, createQuestHUD } from '@dcl/quests-client/dist/hud'
import { updateFromState } from './modules/quests'
import { questsTriggerSystem, setupScene } from './modules/setup'

export const questEventsObservable = mitt<{ message: Action }>()
export const questStartObservable = mitt()

export const QUEST_ID = '11f6445c-0e16-4fff-b303-dd04c5825ae5'
export let questInstanceId: string
export let questStarted = false

const hud = createQuestHUD({
  hudBox: {
    position: { top: '12%' }
  },
  backgoundHexColor: '#ff2d5379'
})

function generateQuestUI(questInstance: QuestInstance): QuestUI {
  console.log('QuestInstance > ', questInstance)
  const steps: QuestUI['steps'] = []
  const nextSteps = []
  if (questInstance.quest.definition?.steps) {
    for (const step of questInstance.quest.definition?.steps) {
      if (questInstance.state.currentSteps[step.id]) {
        const content = questInstance.state.currentSteps[step.id]
        const newTasks = step.tasks.map((task) => {
          return {
            description: task.description,
            done: !!content.tasksCompleted.find((t) => t.id == task.id)
          }
        })
        steps.push({ name: step.description, tasks: newTasks })
        nextSteps.push(
          ...questInstance.quest.definition?.connections
            .filter((conn) => conn.stepFrom === step.id)
            .map(
              (conn) => questInstance.quest.definition?.steps.find((step) => step.id === conn.stepTo)?.description || ''
            )
        )
      }
    }
  }
  const ui = { name: questInstance.quest.name, steps, nextSteps }
  console.log('UI > ', ui)
  return ui
}

setupScene()

executeTask(async () => {
  // retrieve websocket url from env
  const ws = 'wss://quests-rpc.decentraland.zone'

  // create quests client
  try {
    const quests = await createQuestsClient(ws, '11f6445c-0e16-4fff-b303-dd04c5825ae5')
    console.log('SCENE QUESTS > connected')

    const startedQuestInstance = quests.getInstances().find((instance) => instance.quest.id === QUEST_ID)
    console.log('SCENE QUESTS > definition', startedQuestInstance)
    if (startedQuestInstance) {
      questInstanceId = startedQuestInstance.id
      updateFromState(startedQuestInstance.state)
      hud.upsert(generateQuestUI(startedQuestInstance))
      questStarted = true
    } else {
      engine.addSystem(questsTriggerSystem)
    }

    questEventsObservable.on('message', async (action) => {
      await quests.sendEvent({ action })
    })

    questStartObservable.on('start', async () => {
      await quests.startQuest()
    })

    quests.onStarted((questInstance) => {
      console.log('SCENE QUESTS > definition', JSON.stringify(questInstance.quest.definition))
      if (questInstance.quest.id === QUEST_ID) {
        questInstanceId = questInstance.id
        updateFromState(questInstance.state)
        hud.upsert(generateQuestUI(questInstance))
        questStarted = true
      }
    })

    quests.onUpdate((questInstance) => {
      console.log('SCENE QUESTS > definition', JSON.stringify(questInstance.quest.definition))
      if (questInstance.id === questInstanceId) {
        updateFromState(questInstance.state)
        hud.upsert(generateQuestUI(questInstance))
      }
    })
  } catch (e) {
    console.error(`[Quests Scene] connection failed! ${ws} - ${e}`)
  }
})

export * from '@dcl/sdk'
