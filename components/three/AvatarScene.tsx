"use client";

/**
 * Escena 3D del portafolio: una sola instancia del GLB de Antigravity.
 *
 * El modelo conserva su armature, su animación Idle_Animation y sus materiales.
 * La escena solo gestiona encuadre, iluminación y composición: no genera otro
 * personaje ni sustituye el GLB por una imagen. El lienzo ocupa el lateral
 * derecho en escritorio y la zona superior en móvil, de modo que las tarjetas
 * de información no tapen el cuerpo ni el rostro.
 */

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  PerspectiveCamera,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const BEIGE = new THREE.Color("#f5efe6");
const BLUE = new THREE.Color("#052e87");
const BACKGROUND = new THREE.Color();

/** Ruta pública de la exportación de Antigravity (cp006). */
const MODEL_URL = "/assets/avatar/avatar.glb" as const;

/** Umbral usado por el canvas, que es más estrecho que el viewport en escritorio. */
const COMPACT_CANVAS = 640;

/** Carga, anima y orienta la cabeza del modelo real. */
function GLTFCharacter({ modelUrl }: { modelUrl: string }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, group);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        if (!material || !(material as THREE.MeshStandardMaterial).isMeshStandardMaterial) return;
        const mat = material as THREE.MeshStandardMaterial;
        mat.envMapIntensity = 1;
        mat.roughness = Math.max(0.2, mat.roughness ?? 0.5);
      });
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    const actionNames = Object.keys(actions);
    if (actionNames.length === 0) return;
    const mainAction = actions[actionNames[0]];
    mainAction?.reset().fadeIn(0.5).play();
    return () => {
      mainAction?.fadeOut(0.5);
    };
  }, [actions]);

  useFrame(() => {
    const head =
      clonedScene.getObjectByName("Head") ||
      clonedScene.getObjectByName("mixamorigHead") ||
      clonedScene.getObjectByName("head") ||
      clonedScene.getObjectByName("Neck");
    if (!head) return;
    head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, pointer.x * 0.35, 0.08);
    head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -pointer.y * 0.2, 0.08);
  });

  return (
    <group ref={group}>
      <primitive object={clonedScene} />
    </group>
  );
}

/** Fallback ligero mientras termina de descargarse el GLB. */
function HologramPlaceholder() {
  const portalRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (portalRef.current) {
      portalRef.current.rotation.y = THREE.MathUtils.lerp(
        portalRef.current.rotation.y,
        pointer.x * 0.18,
        0.06,
      );
      portalRef.current.rotation.x = THREE.MathUtils.lerp(
        portalRef.current.rotation.x,
        -pointer.y * 0.1,
        0.06,
      );
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 0.25;
      ringsRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <group ref={portalRef} position={[0, 0.25, 0]} scale={0.9}>
      <mesh position={[0, 0, -0.02]} castShadow>
        <boxGeometry args={[1.1, 1.35, 0.04]} />
        <meshPhysicalMaterial
          color="#0d131f"
          roughness={0.15}
          metalness={0.8}
          transmission={0.4}
          thickness={0.5}
        />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.98, 1.2]} />
        <meshStandardMaterial
          color="#061226"
          emissive="#00f0ff"
          emissiveIntensity={0.12}
          roughness={0.3}
        />
      </mesh>
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <torusGeometry args={[1.3, 0.006, 8, 80]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 1.7, 0.4, 0]}>
          <torusGeometry args={[1.55, 0.004, 8, 80]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Escala y posición del personaje. El GLB mide ~1.63 unidades de alto; con esta
 * transformación ocupa la mayor parte del alto del lienzo sin recortar la cabeza.
 */
function CharacterStage() {
  const group = useRef<THREE.Group>(null);
  const clock = useRef(0);
  const { size, pointer } = useThree();
  const compact = size.width < COMPACT_CANVAS;

  useFrame((_, delta) => {
    if (!group.current) return;
    clock.current += delta;

    const s = sceneState;
    const breathe = Math.sin(clock.current * 1.4) * 0.012;
    const baseScale = (compact ? 1.22 : 1.34) * THREE.MathUtils.lerp(0.96, 1, s.aboutIn);

    group.current.scale.setScalar(baseScale * s.scale);
    group.current.position.set(
      s.positionX + pointer.x * 0.025 * (1 - s.contactIn),
      (compact ? -0.92 : -0.98) + s.positionY + breathe,
      0,
    );
    group.current.rotation.y = s.rotationY + pointer.x * 0.035 * (1 - s.contactIn);
    group.current.rotation.x = s.rotationX - pointer.y * 0.018 * (1 - s.contactIn);
  });

  return (
    <>
      <group ref={group}>
        <Suspense fallback={<HologramPlaceholder />}>
          <GLTFCharacter modelUrl={MODEL_URL} />
        </Suspense>
      </group>
      <ContactShadows
        position={[0, -0.98, 0]}
        opacity={0.38}
        scale={4}
        blur={2.6}
        far={2.6}
        resolution={512}
        color="#031033"
      />
    </>
  );
}

/** Cámara y luces de estudio ajustadas al tamaño real del lienzo. */
function SceneSetup() {
  const { pointer, size } = useThree();
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const compact = size.width < COMPACT_CANVAS;
  const focusY = compact ? 0.1 : 0.16;

  useFrame(() => {
    BACKGROUND.copy(BEIGE).lerp(BLUE, THREE.MathUtils.clamp(Math.max(sceneState.aboutIn - sceneState.aboutOut * 0.25, sceneState.contactIn), 0, 1));

    const current = camera.current;
    if (!current) return;
    const parallaxX = pointer.x * 0.09 * (1 - sceneState.contactIn * 0.5);
    const parallaxY = pointer.y * 0.05;
    current.position.x += (parallaxX - current.position.x) * 0.05;
    current.position.y += (focusY + parallaxY - current.position.y) * 0.05;
    current.lookAt(0, focusY, 0);
  });

  return (
    <>
      <primitive object={BACKGROUND} attach="background" />
      <PerspectiveCamera
        ref={camera}
        makeDefault
        position={[0, focusY, compact ? 4.1 : 3.7]}
        fov={compact ? 38 : 36}
        near={0.1}
        far={100}
      />

      {/* Iluminación de estudio: more claridad en rostro y silueta sin cambiar la paleta */}
      <hemisphereLight args={["#f4fbff", "#052e87", 0.5]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3.2, 5.2, 4]}
        intensity={1.9}
        color="#fff5ea"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-2.8, 2.4, 4.2]} intensity={1.05} color="#eef4ff" />
      <directionalLight position={[-3.5, 3.5, -3]} intensity={0.8} color="#8beaff" />
      <directionalLight position={[3.5, 2.5, -3]} intensity={0.4} color="#38bdf8" />
      <spotLight
        position={[0, 3.2, 4.4]}
        angle={0.42}
        penumbra={0.9}
        intensity={0.55}
        color="#fff1e0"
      />

      <CharacterStage />
    </>
  );
}

export default function AvatarScene() {
  const reduced = useReducedMotion();

  return (
    <div className="scene-canvas" aria-hidden>
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.18,
        }}
        dpr={[1, 1.75]}
        shadows
        frameloop={reduced ? "demand" : "always"}
      >
        <SceneSetup />
      </Canvas>
    </div>
  );
}
