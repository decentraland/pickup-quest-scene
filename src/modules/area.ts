import { Vector3 } from '@dcl/sdk/math'

export function isPositionInsideArea(
  targetPosition: Vector3,
  detectionAreaCenter: Vector3,
  detectionAreaSize: Vector3
): boolean {
  const halfSize = Vector3.scale(detectionAreaSize, 0.5)
  const areaMinPosition = Vector3.create(
    detectionAreaCenter.x - halfSize.x,
    detectionAreaCenter.y - halfSize.y,
    detectionAreaCenter.z - halfSize.z
  )
  const areaMaxPosition = Vector3.create(
    detectionAreaCenter.x + halfSize.x,
    detectionAreaCenter.y + halfSize.y,
    detectionAreaCenter.z + halfSize.z
  )

  return (
    targetPosition.x > areaMinPosition.x &&
    targetPosition.y > areaMinPosition.y &&
    targetPosition.z > areaMinPosition.z &&
    targetPosition.x < areaMaxPosition.x &&
    targetPosition.y < areaMaxPosition.y &&
    targetPosition.z < areaMaxPosition.z
  )
}
