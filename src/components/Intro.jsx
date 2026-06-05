import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import React, { useState, useEffect, Suspense } from "react";

import Loader from "./Loader";
import LaptopAnime from "./LaptopAnime";

export default function Intro({ onFinish }) {
  const [ready, setReady] = useState(false);
  const [use3D, setUse3D] = useState(true);
  const [checkedNetwork, setCheckedNetwork] = useState(false);
  
  useEffect(() => {
    if (navigator.connection) {
      const conn = navigator.connection;
      
      if (conn.saveData || ["2g", "3g", "slow-2g"].includes(conn.effectiveType) || conn.downlink < 1.5) {
        setUse3D(false);
      }
    }
    setCheckedNetwork(true);
  }, []);
  
  useEffect(() => {
    if (use3D) {
      try {
        useGLTF.preload("/3d/MacbookPro.glb");
      } catch (e) {}
    }
  }, [use3D]);

  if (!checkedNetwork) {
    return <div className="fixed inset-0 z-[9999] bg-black"></div>;
  }
  
  if (!use3D) {
    return <Loader is2D={true} onLoaded={onFinish} />;
  }
  
  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <Canvas camera={{ position: [0, 0.9, 3.4], fov: 75 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[4, 5, 6]} intensity={2.2} />
        <OrbitControls enabled={false} />

        <Suspense fallback={null}>
          {!ready && <Loader onLoaded={() => setReady(true)} />}
          {ready && <LaptopAnime onIntroDone={onFinish} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
