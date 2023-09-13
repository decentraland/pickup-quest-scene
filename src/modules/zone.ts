import { AudioSource, Material, MeshRenderer, Transform, VisibilityComponent, engine } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { step } from './quests'
import { Zone } from '../definitions'
import { isPositionInsideArea } from './area'
import { Action } from '@dcl/quests-client'
import { questEventsObservable } from '..'

export function spawnZone() {
  const tileEntity = engine.addEntity()

  MeshRenderer.setPlane(tileEntity)

  Transform.create(tileEntity, {
    position: Vector3.create(13.25, 0.1, 13.25),
    rotation: Quaternion.fromEulerDegrees(90, 0, 0),
    scale: Vector3.create(4, 4, 4)
  })

  Material.setPbrMaterial(tileEntity, {
    albedoColor: { a: 0.9, r: 1, g: 0.0, b: 0.0 },
    metallic: 0
  })

  Zone.create(tileEntity, {
    playerDetectionArea: Vector3.create(3.5, 2, 3.5)
  })

  VisibilityComponent.create(tileEntity).visible = true
  AudioSource.create(tileEntity, {
    audioClipUrl: 'sounds/ready.mp3',
    playing: false,
    loop: false
  })
}

let lastPlayerPos: Vector3 | undefined = undefined
export function zoneSystem() {
  if (step !== 'go-to-zone') return
  console.log(`step: ${step}`)
  if (!Transform.has(engine.PlayerEntity)) return

  const playerPos = Transform.get(engine.PlayerEntity).position
  const moved = playerPos != lastPlayerPos

  if (!moved) return
  for (const [entity] of engine.getEntitiesWith(Zone)) {
    const zoneComponent = Zone.get(entity)
    const transformComp = Transform.get(entity)

    const detectionAreaCenter = transformComp.position
    const detectionAreaSize = zoneComponent.playerDetectionArea
    if (isPositionInsideArea(playerPos, detectionAreaCenter, detectionAreaSize)) {
      AudioSource.getMutable(entity).playing = true
      const action: Action = {
        type: 'LOCATION',
        parameters: {
          x: '1',
          y: '1'
        }
      }
      questEventsObservable.emit('message', action)
      VisibilityComponent.getMutable(entity).visible = false
    }
  }

  lastPlayerPos = playerPos
}
