import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";

import useHeroTyping from "../utils/animations";

export default function LaptopAnime({ onIntroDone }) {
  const { scene, nodes } = useGLTF("/3d/MacbookPro.glb");

  const group = useRef();
  const screenRef = useRef();
  const htmlGroupRef = useRef();
  const { camera } = useThree();

  const heroText = useHeroTyping();

  const screenMesh = useMemo(() => {
    return nodes?.laptop_lid || null;
  }, [nodes]);

  useEffect(() => {
    const el = document.getElementById("typing-text");
    if (el) el.textContent = heroText;
  }, [heroText]);

  useLayoutEffect(() => {
    if (!group.current) return;

    group.current.traverse((obj) => {
      if (obj.material) {
        obj.material.transparent = true;
        if (obj.material.opacity === undefined) obj.material.opacity = 1;
      }
    });

    group.current.scale.set(1, 1, 1);
    group.current.position.set(0, -0.3, 0);

    if (screenMesh) {
      screenRef.current = screenMesh;
    } else {
      screenRef.current = group.current;
    }
  }, [screenMesh]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.3) * 0.15;
      group.current.rotation.x = -0.08 + Math.sin(t * 0.2) * 0.02;
    }

    if (screenRef.current && htmlGroupRef.current) {
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();

      screenRef.current.matrixWorld.decompose(position, quaternion, scale);

      
      
      const localOffset = new THREE.Vector3(-0.036, 0.085, 1.085);
      localOffset.multiply(scale);
      localOffset.applyQuaternion(quaternion);
      position.add(localOffset);

      htmlGroupRef.current.position.copy(position);

      
      const localRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
      const targetQuaternion = quaternion.clone().multiply(localRotation);
      htmlGroupRef.current.quaternion.copy(targetQuaternion);

      htmlGroupRef.current.scale.set(
        scale.x * 0.47,
        scale.y * 0.47,
        scale.z * 0.47
      );
    }
  });

  useEffect(() => {
    if (!group.current) return;

    const setOpacity = (v) => {
      group.current.traverse((o) => {
        if (o.material && "opacity" in o.material) o.material.opacity = v;
      });
    };

    setOpacity(0);

    const lid = screenRef.current;
    if (lid) lid.rotation.x = 0;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => onIntroDone && onIntroDone(),
    });

    tl.to(
      { v: 0 },
      {
        v: 1,
        duration: 0.9,
        onUpdate() {
          setOpacity(this.targets()[0].v);
        },
      }
    )
      .fromTo(
        group.current.scale,
        { x: 0.85, y: 0.85, z: 0.85 },
        { x: 1, y: 1, z: 1, duration: 0.9 },
        "<"
      )

      .to(group.current.position, { y: 0, duration: 0.8 }, "-=0.2")
      .to(group.current.rotation, { x: -0.06, y: 0, duration: 0.8 }, "<")

      .to(
        lid.rotation,
        {
          x: -1.92,
          duration: 1.0,
          ease: "power2.inOut",
        },
        "-=0.2"
      )

      .add(() => {
        const text = document.querySelector("#screen-text");

        if (text) {
          gsap.fromTo(
            text,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
            }
          );

          gsap.to(text, {
            opacity: 0,
            delay: 1.8,
            duration: 0.6,
            ease: "power2.inOut",
          });
        }
      }, "-=0.1")

      .add(() => {
        const target = new THREE.Vector3();
        screenRef.current.getWorldPosition(target);
        const targetZ = target.z + 0.28;

        gsap.to(camera.position, {
          x: target.x,
          y: target.y,
          z: targetZ,
          duration: 1.2,
          ease: "power3.inOut",
        });
      }, "+=0.4")

      .to({}, { duration: 0.2 })
      .to(
        { v: 1 },
        {
          v: 0,
          duration: 0.6,
          onUpdate() {
            setOpacity(this.targets()[0].v);
          },
        }
      );
  }, [camera]);

  return (
    <>
      <primitive
        ref={group}
        object={scene}
        scale={1.2}
        position={[0, -2.5, 0]}
        rotation={[Math.PI / 4, 0, 0]}
      />

      <group ref={htmlGroupRef}>
        <Html transform center wrapperClass="select-none">
          <div
            id="screen-text"
            className="w-[324px] h-[216px] bg-[#070708] text-white flex flex-col p-4 border border-white/10 rounded-lg relative overflow-hidden font-mono select-none shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] opacity-0"
            style={{
              pointerEvents: "none",
            }}
          >
            
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(16,185,129,0.03),rgba(6,182,212,0.01),rgba(16,185,129,0.03))] bg-[size:100%_3px,3px_100%] z-20"></div>

            
            <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3 text-[7px] text-white/30 select-none">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/50"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
              </div>
              <span className="text-[8px] font-bold text-emerald-400 animate-pulse">DECRYPTING_GATEWAY_NODE</span>
              <span>subhendu@core: ~</span>
            </div>

            
            <div className="flex-1 flex flex-col gap-1.5 text-[8px] text-emerald-500 select-none">
              <p className="text-white/30">&gt;&gt;&gt; Syncing server compilation decks...</p>
              <p className="text-cyan-400">[  OK  ] Core TCP sockets compiler loaded.</p>
              <p className="text-cyan-400">[  OK  ] Concurrency file system relays mounted.</p>
              
              <div className="mt-1.5 p-2 border border-white/5 bg-black/40 rounded-md flex items-center justify-between">
                <div>
                  <p className="text-[6px] text-white/30">CPU STACK METRIC</p>
                  <p className="text-[9px] font-bold text-white leading-none mt-0.5">99.9% CACHE ACTIVE</p>
                </div>
                <div className="flex gap-1 items-end h-5">
                  <span className="w-1 h-2 bg-emerald-500 animate-pulse"></span>
                  <span className="w-1 h-4 bg-emerald-500 animate-pulse"></span>
                  <span className="w-1 h-3 bg-emerald-500 animate-pulse"></span>
                </div>
              </div>
              
              <div className="mt-auto flex flex-col gap-0.5 border-t border-white/5 pt-2 select-none">
                <p className="text-[6px] text-white/20">CORE ENGINE ARCHITECT</p>
                <div className="flex items-center gap-1 text-[13px] font-bold text-white uppercase tracking-wider font-sans leading-none">
                  <span className="text-emerald-400 font-mono">&lt;</span>
                  <span id="typing-text"></span>
                  <span className="text-emerald-400 font-mono">/&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </Html>
      </group>
    </>
  );
}
