/**
 * Estado mutable compartido entre GSAP (scroll) y la escena 3D.
 * Se mantienen objetos planos para animar sin provocar re-renders de React.
 */
export interface SceneState {
  heroOut: number;
  aboutIn: number;
  aboutOut: number;
  contactIn: number;
  contactOut: number;
  progress: number;
  scale: number;
  positionY: number;
  positionX: number;
  rotationY: number;
  rotationX: number;
  idle: number;
  wake: number;
}

export const sceneState: SceneState = {
  heroOut: 0,
  aboutIn: 0,
  aboutOut: 0,
  contactIn: 0,
  contactOut: 0,
  progress: 0,
  scale: 1,
  positionY: 0,
  positionX: 0,
  rotationY: -0.5,
  rotationX: 0,
  idle: 0,
  wake: 0,
};
