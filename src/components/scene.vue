<script setup lang="ts">
import { Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, AmbientLight, Color, BoxGeometry, LineCurve3, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { OrbitControls, TransformControls } from 'three/examples/jsm/Addons.js';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const three = ref()
let scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  transformControl: TransformControls,
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

  transformControl = new TransformControls(camera, renderer.domElement)
  // transformControl.addEventListener('change', render);
  // transformControl.size = 150

  transformControl.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
  });
  transformControl.setSize(0.5)
  transformControl.setMode('translate')
  transformControl.setSpace('local')
  transformControl.axis = "X"
  transformControl.showX = true
  transformControl.showY = false
  transformControl.showZ = false

  // const arrowLength = 50;
  // const arrowColor = 0xff0000;  // 红色
  // const direction = new Vector3(1, 0, 0); // 指向 X 轴正方向
  // const origin = new Vector3(0, 0, 0);   // 箭头起点
  // const arrowHelper = new ArrowHelper(direction, origin, arrowLength, arrowColor);
  // scene.add(arrowHelper);


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
  const { cylinderGroup, center_line } = add_cylinder(scene)
  const line = sign_distance(cylinderGroup)
  test(center_line)
  scene.add(line)
}
const test = (curve: LineCurve3) => {
  const start = curve.getPointAt(0)
  console.log(start);

  const end = curve.getPointAt(1)
  const some_p = curve.getPointAt(0.4)
  function addBox(p: Vector3) {
    const boxG = new BoxGeometry(3, 3, 3)
    const material = new MeshBasicMaterial({
      color: 'red'
    })
    const mesh = new Mesh(boxG, material)
    mesh.position.copy(p)
    return mesh
  }
  scene.add(addBox(start))
  scene.add(addBox(end))
  let controlBox = addBox(some_p)
  console.log('controlBox', controlBox);

  scene.add(controlBox)
  console.log(transformControl);

  transformControl.attach(controlBox)

  scene.add(transformControl)
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
