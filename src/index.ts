import { engine, executeTask } from '@dcl/sdk/ecs'
import mitt from 'mitt'
import { createQuestsClient } from '@dcl/quests-client'
import { createQuestHUD } from '@dcl/quests-client/dist/hud'
import { Action } from '@dcl/quests-client/dist/protocol/decentraland/quests/definitions.gen'
import { updateFromState } from './modules/quests'
import { questsTriggerSystem, setupScene } from './modules/setup'

export const questEventsObservable = mitt<{ message: Action }>()
export const questStartObservable = mitt()

export const QUEST_ID = '11f6445c-0e16-4fff-b303-dd04c5825ae5'
export let questInstanceId: string
export let questStarted = false

const hud = createQuestHUD({
  autoRender: true,
  leftSidePanel: {
    position: { top: '8%' }
  }
})

setupScene()

executeTask(async () => {
  // retrieve websocket url from env
  const ws = 'wss://quests-rpc.decentraland.zone'

  // create quests client
  try {
    const quests = await createQuestsClient(ws, QUEST_ID)
    console.log('SCENE QUESTS > connected')

    const startedQuestInstance = quests.getInstances().find((instance) => instance.quest.id === QUEST_ID)
    if (startedQuestInstance) {
      questInstanceId = startedQuestInstance.id
      updateFromState(startedQuestInstance.state)
      hud.upsert(startedQuestInstance)
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
        hud.upsert(questInstance)
        questStarted = true
      }
    })

    quests.onUpdate((questInstance) => {
      console.log('SCENE QUESTS > definition', JSON.stringify(questInstance.quest.definition))
      if (questInstance.id === questInstanceId) {
        updateFromState(questInstance.state)
        hud.upsert(questInstance)
      }
    })
  } catch (e) {
    console.error(`[Quests Scene] connection failed! ${ws} - ${e}`)
  }
})

export * from '@dcl/sdk'
