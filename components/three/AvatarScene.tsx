"use client";

/**
 * Escena 3D Profesional del Portafolio — Arquitectura de Estudio y Carga GLTF/GLB.
 *
 * Esta implementación sigue los estándares de la industria (Three.js, R3F, GLTF PBR):
 * 1. Pipeline de carga para modelos 3D externos (GLB/GLTF) con rigging, huesos y animaciones.
 * 2. Cero figuras grotescas construidas con geometrías primitivas en código.
 * 3. Renderizado PBR con ACESFilmicToneMapping, sombras de contacto suaves (ContactShadows)
 *    e iluminación de estudio en 3 puntos (Key, Fill, Rim) más rebote de pantalla.
 * 4. Estación de trabajo arquitectónica (escritorio biselado, laptop slim, silla ergonómica).
 * 5. Si no hay un modelo 'avatar.glb' en /public/models/, presenta un entorno tecnológico
 *    estéticamente impecable con terminal holográfico e indicaciones claras para importar el modelo.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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

/* Paleta PBR para la estación de trabajo */
const MAT_DESK = "#1a1d24";
const MAT_METAL = "#8b949e";
const MAT_CHAIR = "#161b26";
const MAT_LAPTOP = "#252932";
const MAT_SCREEN_GLOW = "#00f0ff";
const MAT_MUG = "#eaeef2";

/**
 * Componente que carga y anima un modelo GLTF/GLB real.
 * Si el modelo tiene armature (huesos), vincula la cabeza con el ratón.
 * Si tiene animaciones, las reproduce suavemente.
 */
function GLTFCharacter({ modelUrl }: { modelUrl: string }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, group);

  // Optimizar mallas y sombras del modelo
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.envMapIntensity = 1.0;
          mat.roughness = Math.max(0.2, mat.roughness ?? 0.5);
        }
      }
    });
    return clone;
  }, [scene]);

  // Reproducir primera animación disponible (ej. Idle / Typing)
  useEffect(() => {
    const actionNames = Object.keys(actions);
    if (actionNames.length > 0) {
      const mainAction = actions[actionNames[0]];
      mainAction?.fadeIn(0.5).play();
      return () => {
        mainAction?.fadeOut(0.5);
      };
    }
  }, [actions]);

  // Seguimiento suave de la cabeza hacia el ratón
  useFrame(() => {
    if (!clonedScene) return;
    const head =
      clonedScene.getObjectByName("Head") ||
      clonedScene.getObjectByName("mixamorigHead") ||
      clonedScene.getObjectByName("head") ||
      clonedScene.getObjectByName("Neck");

    if (head) {
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, pointer.x * 0.45, 0.08);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -pointer.y * 0.25, 0.08);
    }
  });

  return (
    <group ref={group} position={[0, -0.65, 0.15]} scale={1.15}>
      <primitive object={clonedScene} />
    </group>
  );
}

/**
 * Escenario tecnológico limpio cuando aún no se ha colocado un modelo 'avatar.glb'.
 * En lugar de un muñeco deforme, muestra un holograma de desarrollo elegante y minimalista.
 */
function HologramPlaceholder() {
  const portalRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (portalRef.current) {
      portalRef.current.rotation.y = THREE.MathUtils.lerp(
        portalRef.current.rotation.y,
        pointer.x * 0.22,
        0.06,
      );
      portalRef.current.rotation.x = THREE.MathUtils.lerp(
        portalRef.current.rotation.x,
        -pointer.y * 0.14,
        0.06,
      );
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 0.25;
      ringsRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <group ref={portalRef} position={[0, 0.28, 0]}>
      {/* Monolito flotante de cristal estilizado */}
      <mesh position={[0, 0, -0.02]} castShadow>
        <boxGeometry args={[1.28, 1.42, 0.04]} />
        <meshPhysicalMaterial
          color="#0d131f"
          roughness={0.15}
          metalness={0.8}
          transmission={0.4}
          thickness={0.5}
        />
      </mesh>

      {/* Núcleo de datos cian */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.14, 1.28]} />
        <meshStandardMaterial
          color="#061226"
          emissive="#00f0ff"
          emissiveIntensity={0.12}
          roughness={0.3}
        />
      </mesh>

      {/* Anillos orbitales tecnológicos */}
      <group ref={ringsRef} position={[0, 0, 0]}>
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <torusGeometry args={[1.45, 0.006, 8, 80]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 1.7, 0.4, 0]}>
          <torusGeometry args={[1.72, 0.004, 8, 80]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Puesto de trabajo moderno con modelado proporcionado y materiales PBR.
 */
function Workstation({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.MeshStandardMaterial>(null);
  const clock = useRef(0);

  // Partículas ambientales sutiles
  const particleGeo = useMemo(() => {
    const count = 40;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = (Math.random() - 0.5) * 4.2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.8 - 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    clock.current += delta;

    const s = sceneState;
    const breathe = Math.sin(clock.current * 1.5) * 0.014 * (0.6 + s.idle * 0.4);

    group.current.position.x = s.positionX;
    group.current.position.y = s.positionY + breathe;
    group.current.rotation.y = s.rotationY;
    group.current.rotation.x = s.rotationX;
    group.current.scale.setScalar(s.scale);

    if (screenRef.current) {
      screenRef.current.emissiveIntensity =
        0.5 + Math.sin(clock.current * 3) * 0.08 + s.wake * 0.4;
    }
  });

  return (
    <group ref={group}>
      {/* Avatar o Contenido central */}
      {children}

      {/* ESCRITORIO CON BISEL ELEGANTE */}
      <mesh position={[0, -0.72, 0.42]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 0.08, 1.3]} />
        <meshStandardMaterial
          color={MAT_DESK}
          roughness={0.35}
          metalness={0.25}
        />
      </mesh>
      {/* Patas metálicas tubulares */}
      {[-1.16, 1.16].map((x) => (
        <mesh key={x} position={[x, -1.28, 0.42]} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 1.05, 16]} />
          <meshStandardMaterial color={MAT_METAL} roughness={0.4} metalness={0.8} />
        </mesh>
      ))}

      {/* SILLA ERGONÓMICA DE ESTUDIO */}
      <group position={[0, -0.68, -0.65]}>
        {/* Asiento con acolchado */}
        <mesh position={[0, -0.42, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.96, 0.1, 0.82]} />
          <meshStandardMaterial color={MAT_CHAIR} roughness={0.7} />
        </mesh>
        {/* Respaldo curvado */}
        <mesh position={[0, 0.12, -0.28]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.92, 0.95, 0.08]} />
          <meshStandardMaterial color={MAT_CHAIR} roughness={0.7} />
        </mesh>
        {/* Base metálica central */}
        <mesh position={[0, -0.75, 0.1]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.58, 16]} />
          <meshStandardMaterial color={MAT_METAL} roughness={0.35} metalness={0.85} />
        </mesh>
      </group>

      {/* PORTÁTIL PRO (16:10) */}
      <group position={[0, -0.66, 0.44]}>
        {/* Chasis de aluminio anodizado */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.74, 0.034]} />
          <meshStandardMaterial
            color={MAT_LAPTOP}
            metalness={0.85}
            roughness={0.22}
          />
        </mesh>
        {/* Tapa abierta en ángulo ergonómico */}
        <mesh position={[0, 0.35, -0.34]} rotation={[-0.22, 0, 0]} castShadow>
          <boxGeometry args={[1.2, 0.76, 0.034]} />
          <meshStandardMaterial
            color={MAT_LAPTOP}
            metalness={0.85}
            roughness={0.22}
          />
        </mesh>
        {/* Pantalla emisiva (Luz cian hacia arriba) */}
        <mesh position={[0, 0.35, -0.315]} rotation={[-0.22, 0, 0]}>
          <planeGeometry args={[1.06, 0.62]} />
          <meshStandardMaterial
            ref={screenRef}
            color="#001833"
            emissive={MAT_SCREEN_GLOW}
            emissiveIntensity={0.55}
            roughness={0.2}
          />
        </mesh>
        {/* Luz puntual de la pantalla */}
        <pointLight
          position={[0, 0.42, 0.08]}
          intensity={0.75}
          color={MAT_SCREEN_GLOW}
          distance={2.4}
          decay={2}
        />
        {/* Teclado slim */}
        <mesh position={[0, 0.02, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.96, 0.38]} />
          <meshStandardMaterial color="#121418" roughness={0.85} />
        </mesh>
      </group>

      {/* TAZA DE CERÁMICA */}
      <group position={[0.92, -0.62, 0.48]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.068, 0.058, 0.13, 20]} />
          <meshStandardMaterial color={MAT_MUG} roughness={0.18} />
        </mesh>
        <mesh position={[0.072, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.038, 0.011, 8, 16]} />
          <meshStandardMaterial color={MAT_MUG} roughness={0.18} />
        </mesh>
      </group>

      {/* PARTÍCULAS ESPACIALES AMBIENTALES */}
      <points geometry={particleGeo}>
        <pointsMaterial
          size={0.032}
          color={MAT_SCREEN_GLOW}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* SOMBRAS DE CONTACTO SUAVES (GROUND CONTACT) */}
      <ContactShadows
        position={[0, -1.25, 0.3]}
        opacity={0.7}
        scale={10}
        blur={2.4}
        far={3.8}
        resolution={1024}
        color="#050810"
      />
    </group>
  );
}

/** Rig de Cámara y Luces de Estudio Three.js */
function SceneSetup({ hasCustomModel }: { hasCustomModel: boolean }) {
  const { pointer } = useThree();
  const camera = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    const s = sceneState;
    const t = THREE.MathUtils.clamp(
      Math.max(s.aboutIn - s.aboutOut * 0.25, s.contactIn),
      0,
      1,
    );
    BACKGROUND.copy(BEIGE).lerp(BLUE, t);

    const current = camera.current;
    if (!current) return;
    const parallaxX = pointer.x * 0.16 * (1 - s.contactIn * 0.5);
    const parallaxY = pointer.y * 0.1;
    current.position.x += (parallaxX - current.position.x) * 0.05;
    current.position.y += (parallaxY - current.position.y) * 0.05;
    current.lookAt(0, -0.15 + s.contactIn * 0.35, 0);
  });

  return (
    <>
      <primitive object={BACKGROUND} attach="background" />
      <PerspectiveCamera
        ref={camera}
        makeDefault
        position={[0, 0.15, 5.2]}
        fov={40}
        near={0.1}
        far={100}
      />

      {/* ILUMINACIÓN DE ESTUDIO EN 3 PUNTOS */}
      {/* Luz ambiental suave */}
      <ambientLight intensity={0.75} />
      {/* Key Light (Luz principal con sombras suaves) */}
      <directionalLight
        position={[3.2, 5.2, 4]}
        intensity={1.7}
        color="#fff5ea"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      {/* Fill Light (Luz de relleno suave) */}
      <directionalLight position={[-2.8, 2.4, 4.2]} intensity={0.7} color="#eef4ff" />
      {/* Rim Light (Luz de recorte cian/azul para despegar la silueta) */}
      <directionalLight position={[-3.5, 3.5, -3]} intensity={1.1} color="#00f0ff" />
      <directionalLight position={[3.5, 2.5, -3]} intensity={0.6} color="#38bdf8" />

      {/* Estación de trabajo */}
      <Workstation>
        {hasCustomModel ? (
          <Suspense fallback={<HologramPlaceholder />}>
            <GLTFCharacter modelUrl="/models/avatar.glb" />
          </Suspense>
        ) : (
          <HologramPlaceholder />
        )}
      </Workstation>
    </>
  );
}

export default function AvatarScene() {
  const host = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hasCustomModel, setHasCustomModel] = useState<boolean>(false);

  // Verificar si el usuario ya colocó su modelo 3D en /public/models/avatar.glb
  useEffect(() => {
    fetch("/models/avatar.glb", { method: "HEAD" })
      .then((res) => {
        if (res.ok) {
          setHasCustomModel(true);
        }
      })
      .catch(() => {
        setHasCustomModel(false);
      });
  }, []);

  return (
    <div className="scene-canvas" ref={host} aria-hidden>
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 1.5]}
        shadows
        frameloop={reduced ? "demand" : "always"}
      >
        <SceneSetup hasCustomModel={hasCustomModel} />
      </Canvas>
    </div>
  );
}
