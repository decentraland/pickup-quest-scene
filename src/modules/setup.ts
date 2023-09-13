import {
  GltfContainer,
  InputAction,
  MeshCollider,
  MeshRenderer,
  PointerEventType,
  PointerEvents,
  Transform,
  engine,
  inputSystem
} from '@dcl/sdk/ecs'
import { questStartObservable, questStarted } from '..'
import { itemPickupSystem } from './items'
import { zoneSystem } from './zone'

export function setupScene() {
  // Instantiate ground model
  GltfContainer.create(engine.addEntity(), {
    src: 'models/baseLight.glb'
  })
  const meshEntity = engine.addEntity()

  Transform.create(meshEntity, {
    position: { x: 2, y: 2, z: 1 }
  })
  MeshRenderer.setBox(meshEntity)
  MeshCollider.setBox(meshEntity)

  PointerEvents.create(meshEntity, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_PRIMARY,
          hoverText: questStarted ? 'Quest already started' : 'Press E to start the Quest',
          maxDistance: 100,
          showFeedback: true
        }
      }
    ]
  })

  engine.addSystem(itemPickupSystem)
  engine.addSystem(zoneSystem)
}

export function questsTriggerSystem() {
  if (!questStarted) {
    for (const [entity] of engine.getEntitiesWith(PointerEvents)) {
      if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN, entity)) {
        questStartObservable.emit('start')
      }
    }
  }
}
