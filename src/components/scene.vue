<script setup lang="ts">
import { Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, AmbientLight, Color } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { onBeforeUnmount, onMounted, ref } from 'vue';
const three = ref()
let scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  controls: OrbitControls;
let init_scene = async () => {
  scene = new Scene();
  scene.background = new Color('rgb(238,240,243)')
  camera = new PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(0, 0, 230)
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  three.value.appendChild(renderer.domElement);
  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();
  let light = new DirectionalLight(0xffffff, 0.25);
  light.position.setScalar(1);
  scene.add(light, new AmbientLight(0xffffff, 0.75));
  // add_helper();
};
onMounted(() => {
  init_scene()
  logic()
  render()
})
import { add_cylinder, sign_distance } from './logic';
const logic = () => {
  const cylinder = add_cylinder(scene)
  const line = sign_distance(cylinder)
  scene.add(line)
}


let rf: number;
const render = () => {
  renderer.render(scene, camera);
  rf = requestAnimationFrame(render);
};
onBeforeUnmount(() => {
  cancelAnimationFrame(rf);
});


</script>

<template>
  <div class="three-container" ref="three">

  </div>
</template>

<style scoped></style>
