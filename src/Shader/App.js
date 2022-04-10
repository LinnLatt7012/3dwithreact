import * as THREE from "three";
import React, { useRef, Suspense } from "react";
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import "./styles.scss";
import Iphone13 from "../tuto1/components/Iphone13";
import { OrbitControls } from "@react-three/drei";
const WaveShaderMaterial = shaderMaterial(
    // Uniform
    {
        uTime: 0,
        uColor: new THREE.Color(0.0, 0.0, 0.0),
        uTexture: new THREE.Texture()
    },
    // Vertex Shader
    glsl`
    precision mediump float;
 
    varying vec2 vUv;
    varying float vWave;

    uniform float uTime;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d.glsl);

    void main() {
      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 2.0;
      float noiseAmp = 0.4;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);  
    }
  `,
    // Fragment Shader
    glsl`
    precision mediump float;

    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;

    varying vec2 vUv;
    varying float vWave;

    void main() {
      float wave = vWave * 0.1;
      vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      gl_FragColor = vec4(uColor + wave, 1.0); 
    //   gl_FragColor = vec4(texture, 1.0); 
    }
  `
);

extend({ WaveShaderMaterial });

const Wave = () => {
    const ref = useRef();
    useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

    const [image] = useLoader(THREE.TextureLoader, [
        "/productShow.png"
    ]);

    return (
        <mesh>
            <planeBufferGeometry args={[0.4, 0.6, 16, 16]} />
            <waveShaderMaterial uColor={"#FF7D05"} ref={ref} uTexture={image} />
        </mesh>
    );
};

const Scene = () => {
    return (
        <>
            <Canvas className="canvas" camera={{ fov: 12, position: [0, 0, 5] }}>
                <Suspense fallback={null}>
                    <Wave />
                </Suspense>
            </Canvas>
            <Canvas className="canvas" >
                <ambientLight intensity={0.5} />
                <directionalLight position={[-2, 5, 2]} />
                <OrbitControls enableZoom={false} />
                <Suspense fallback={null}>
                    <Iphone13 scale={2} position={[0, 0, 0.1]} />
                </Suspense>
            </Canvas>
        </>
    );
};

const App = () => {
    return (
        <>
            <h1>POMADA MODELADORA</h1>
            <Scene />
        </>
    );
};

export default App;