import { Schemas, engine } from '@dcl/sdk/ecs'

export const PickableItem = engine.defineComponent('PickableItem', {
  id: Schemas.String,
  playerDetectionArea: Schemas.Vector3
})

export const Zone = engine.defineComponent('Zone', {
  playerDetectionArea: Schemas.Vector3
})
