import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function GlowingCross() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.35;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
    }
  });

  // Cross arms
  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Vertical beam */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[0.55, 3.6, 0.55]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={1}
          roughness={0.18}
          emissive="#3a2a08"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Horizontal beam */}
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[2.2, 0.55, 0.55]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={1}
          roughness={0.18}
          emissive="#3a2a08"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Inner inlay (maroon) */}
      <mesh position={[0, 0.2, 0.281]}>
        <boxGeometry args={[0.18, 3.3, 0.02]} />
        <meshStandardMaterial color="#800000" metalness={0.4} roughness={0.5} emissive="#400000" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.9, 0.281]}>
        <boxGeometry args={[1.95, 0.18, 0.02]} />
        <meshStandardMaterial color="#800000" metalness={0.4} roughness={0.5} emissive="#400000" emissiveIntensity={0.2} />
      </mesh>
      {/* Halo ring behind */}
      <mesh position={[0, 0.9, -0.6]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.6, 0.04, 32, 128]} />
        <meshStandardMaterial color="#006400" emissive="#0e6b0e" emissiveIntensity={0.7} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Floating gold orbs */}
      {[...Array(6)].map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.4, 0.9 + Math.sin(a) * 0.6, Math.sin(a) * 2.4]}>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshStandardMaterial color="#f0cf5e" emissive="#d4af37" emissiveIntensity={1.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function ParticleDust() {
  const ref = useRef<THREE.Points>(null);
  const count = 220;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#d4af37" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.2, 6.5], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#0a0405", 8, 18]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 6, 5]} intensity={1.4} color="#fff5d6" castShadow />
      <pointLight position={[-4, 2, -4]} intensity={1.2} color="#800000" />
      <pointLight position={[4, -2, 2]} intensity={0.9} color="#006400" />
      <spotLight position={[0, 6, 0]} angle={0.4} intensity={1.6} color="#f0cf5e" penumbra={0.8} />

      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.6}>
          <GlowingCross />
        </Float>
        <ParticleDust />
        <ContactShadows
          position={[0, -1.7, 0]}
          opacity={0.55}
          scale={8}
          blur={2.6}
          far={4}
          color="#000"
        />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
}
