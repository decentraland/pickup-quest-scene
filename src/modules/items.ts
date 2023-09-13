import { engine, GltfContainer, VisibilityComponent, Transform, AudioSource } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { PickableItem } from '../definitions'
import { questEventsObservable } from '..'
import { Action, Task } from '@dcl/quests-client/dist/protocol/decentraland/quests/definitions.gen'
import { step } from './quests'
import { isPositionInsideArea } from './area'

function instantiatePickableItem(modelPath: string, pos: Vector3, sfxPath: string, id: string) {
  const entity = engine.addEntity()
  GltfContainer.create(entity, {
    src: modelPath
  })

  VisibilityComponent.create(entity).visible = true

  Transform.create(entity, {
    position: pos
  })

  AudioSource.create(entity, {
    audioClipUrl: sfxPath,
    playing: false,
    loop: false
  })

  PickableItem.create(entity, {
    id,
    playerDetectionArea: Vector3.create(1.5, 3, 1.5)
  })
}

let lastPlayerPos: Vector3 | undefined = undefined
export function itemPickupSystem() {
  if (step !== 'prepare-for') return
  if (!Transform.has(engine.PlayerEntity)) return

  const playerPos = Transform.get(engine.PlayerEntity).position
  const moved = playerPos != lastPlayerPos

  if (!moved) return
  for (const [entity] of engine.getEntitiesWith(PickableItem)) {
    const visibilityComp = VisibilityComponent.getMutable(entity)

    if (visibilityComp.visible) {
      const pickableItemComp = PickableItem.get(entity)
      const transformComp = Transform.get(entity)

      const detectionAreaCenter = transformComp.position
      const detectionAreaSize = pickableItemComp.playerDetectionArea
      if (isPositionInsideArea(playerPos, detectionAreaCenter, detectionAreaSize)) {
        // Pick item
        visibilityComp.visible = false
        AudioSource.getMutable(entity).playing = true

        const action: Action = {
          type: 'CUSTOM',
          parameters: {
            kind: 'PickUp',
            id: pickableItemComp.id
          }
        }
        questEventsObservable.emit('message', action)
      }
    }
  }

  lastPlayerPos = playerPos
}

export function spawnItemsToPickup(completedTasks: Task[]) {
  // Instantiate items bases
  const redBaseEntity = engine.addEntity()
  GltfContainer.create(redBaseEntity, {
    src: 'models/spawnBaseRed.glb'
  })
  Transform.create(redBaseEntity, {
    position: Vector3.create(4, 0, 6)
  })

  const greenBaseEntity = engine.addEntity()
  GltfContainer.create(greenBaseEntity, {
    src: 'models/spawnBaseGreen.glb'
  })
  Transform.create(greenBaseEntity, {
    position: Vector3.create(8, 0, 10)
  })

  const blueBaseEntity = engine.addEntity()
  GltfContainer.create(blueBaseEntity, {
    src: 'models/spawnBaseBlue.glb'
  })
  Transform.create(blueBaseEntity, {
    position: Vector3.create(12, 0, 6)
  })

  if (!completedTasks.find((t) => t.id === 'pick-up-medikit')) {
    instantiatePickableItem('models/medikit.glb', Vector3.create(4, 0.75, 6), 'sounds/medikitPickup.mp3', 'medikit')
  }

  if (!completedTasks.find((t) => t.id === 'pick-up-ammo')) {
    instantiatePickableItem('models/ammo.glb', Vector3.create(8, 0.75, 10), 'sounds/ammoPickup.mp3', 'ammo')
  }

  if (!completedTasks.find((t) => t.id === 'pick-up-armor')) {
    instantiatePickableItem('models/armor.glb', Vector3.create(12, 0.75, 6), 'sounds/armorPickup.mp3', 'armor')
  }
}
