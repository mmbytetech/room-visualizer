<template>
  <div ref="sceneContainer" class="scene-container"></div>
  <button @click="changeDimensions">Change Dimensions</button>
  <button @click="addNewObject">New Object</button>
  <div v-if="currentDimensions">
    <p>Current Dimensions - Length: {{ currentDimensions.length }} | Width: {{ currentDimensions.width }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; 

let scene, camera, renderer, controls;
let roomShape = null; 
let edges = null; 
let scaleFactor = 1;
let currentRoomIndex = 0; 
let currentDimensions = ref({ length: 0, width: 0 });

const roomFiles = ["simple.json", "t_shape.json", "triangle.json"]; 

export default {
  setup() {
    const sceneContainer = ref(null);

    onMounted(async () => {
      initScene();
      await addNewObject();
      animate();
    });

    function initScene() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
      camera.position.set(0, 300, 800);
      camera.lookAt(0, 0, 0);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(200, 300, 200);
      directionalLight.castShadow = true;
      scene.add(ambientLight, directionalLight);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x333333); 

      if (sceneContainer.value) {
        sceneContainer.value.appendChild(renderer.domElement);
      } else {
        console.error("Scene container missing");
      }

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.screenSpacePanning = true;
      controls.minDistance = 200;
      controls.maxDistance = 2000;
      controls.maxPolarAngle = Math.PI / 2;
    }

    async function addNewObject() {
      const currentFile = roomFiles[currentRoomIndex]; 
      currentRoomIndex = (currentRoomIndex + 1) % roomFiles.length;

      try {
        const response = await fetch(`/rooms/${currentFile}`);
        if (!response.ok) throw new Error(`Failed to load ${currentFile}, Status: ${response.status}`);

        const roomData = await response.json();
        clearScene(); 
        drawRoom(roomData.corners);
      } catch (error) {
        console.error("Error loading room:", error);
      }
    }

    function drawRoom(corners) {
      const shape = new THREE.Shape();
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      corners.forEach(corner => {
        minX = Math.min(minX, corner.x);
        maxX = Math.max(maxX, corner.x);
        minY = Math.min(minY, corner.y);
        maxY = Math.max(maxY, corner.y);
      });

      let centerX = (minX + maxX) / 2;
      let centerY = (minY + maxY) / 2;
      let roomWidth = maxX - minX;
      let roomHeight = maxY - minY;

      currentDimensions.value = { length: roomWidth, width: roomHeight };

      let maxDimension = Math.max(roomWidth, roomHeight);
      scaleFactor = 500 / maxDimension;

      shape.moveTo((corners[0].x - centerX) * scaleFactor, (corners[0].y - centerY) * scaleFactor);
      for (let i = 1; i < corners.length; i++) {
        shape.lineTo((corners[i].x - centerX) * scaleFactor, (corners[i].y - centerY) * scaleFactor);
      }
      shape.lineTo((corners[0].x - centerX) * scaleFactor, (corners[0].y - centerY) * scaleFactor);

      const extrudeSettings = { depth: 100, bevelEnabled: true, bevelSize: 5, bevelThickness: 10 };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.castShadow = true;
      geometry.receiveShadow = true;

      const wallColors = [0xd4af37, 0x8b4513, 0x2e8b57, 0x4682b4, 0xb22222];
      const selectedColor = wallColors[currentRoomIndex];

      const material = new THREE.MeshStandardMaterial({
        color: selectedColor,
        roughness: 0.5, 
        metalness: 0.2,
        emissive: new THREE.Color(0x111111), 
      });

      roomShape = new THREE.Mesh(geometry, material);
      roomShape.castShadow = true;
      roomShape.receiveShadow = true;
      scene.add(roomShape);

      const edgeGeometry = new THREE.EdgesGeometry(geometry);
      edges = new THREE.LineSegments(
        edgeGeometry,
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }) 
      );
      scene.add(edges);

      roomShape.rotation.x = -Math.PI / 2;
      edges.rotation.x = -Math.PI / 2;
      roomShape.position.set(0, 0, 0);
      edges.position.set(0, 0, 0);
    }

    function setRandomDimensions() {
      if (!roomShape) return;

      let newScale = Math.random() * 1.5 + 0.5;
      roomShape.scale.set(newScale, 1, newScale);
      edges.scale.set(newScale, 1, newScale);

      console.log(`🔄 Updated dimensions.`);
    }

    function changeDimensions() {
      setRandomDimensions();
    }

    function clearScene() {
      if (roomShape) {
        scene.remove(roomShape);
        roomShape.geometry.dispose();
        roomShape.material.dispose();
        roomShape = null;
      }
      if (edges) {
        scene.remove(edges);
        edges.geometry.dispose();
        edges.material.dispose();
        edges = null;
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    return { sceneContainer, changeDimensions, addNewObject, currentDimensions };
  },
};
</script>

<style>
.scene-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}
button {
  position: absolute;
  top: 10px;
  left: 10px;
  margin-right: 10px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}
button:nth-child(2) {
  left: 160px;
}
</style>
