<script setup lang="ts">
import { Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, AmbientLight, Color } from 'three';
import { CSS2DRenderer, OrbitControls, TransformControls } from 'three/examples/jsm/Addons.js';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const three = ref()
const renderer2D = new CSS2DRenderer();

let scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  transformControl: TransformControls,
  controls: OrbitControls;
let init_scene = async () => {
  const dom = three.value as HTMLDivElement
  const width = dom.clientWidth
  const height = dom.clientHeight
  scene = new Scene();
  scene.background = new Color('rgb(238,240,243)')
  camera = new PerspectiveCamera(60, width / height, 1, 1000);
  camera.position.set(0, 0, 230)
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  three.value.appendChild(renderer.domElement);
  window.addEventListener("resize", () => {
    const dom = three.value as HTMLDivElement
    const width = dom.clientWidth
    const height = dom.clientHeight
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer2D.setSize(width, height);

    renderer.setSize(width, height);
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
  renderer2D.setSize(width, height);
  renderer2D.domElement.style.top = '0px'
  renderer2D.domElement.style.left = '0px'
  renderer2D.domElement.style.pointerEvents = 'none'
  renderer2D.domElement.style.position = 'absolute'
  three.value.appendChild(renderer2D.domElement)
};
onMounted(() => {
  init_scene()
  logic()
  render()
})
import Experience from './Experience';
let experience: Experience
const logic = () => {
  experience = new Experience(scene)
  transformControl.attach(experience.controlBox)
  transformControl.addEventListener('change', function () {
    let number = experience.change_medium_line()
    slider_value.value = number
  })
  experience.cut_face.visible = show_cut_face.value
  experience.cut_face_deep.visible = show_cut_face.value

  scene.add(transformControl)
}

let rf: number;
const render = () => {
  renderer.render(scene, camera);
  renderer2D.render(scene, camera)
  rf = requestAnimationFrame(render);
};
onBeforeUnmount(() => {
  cancelAnimationFrame(rf);
});


let show_cut_face = ref(false), slider_value = ref(100)
const change_cut_face = () => {
  experience.cut_face.visible = show_cut_face.value
  experience.cut_face_deep.visible = show_cut_face.value
}
const slider_change = () => {
  experience.change_medium_line(slider_value.value)
}
</script>

<template>
  <div class="container">
    <div class="three-container" ref="three">
    </div>
    <div class="right">
      <div class="info-panel">
        <div class="cut-face-con">
          <span>横截面显示</span>
          <el-checkbox style="margin-left: 10px;" v-model="show_cut_face" size="large" @change="change_cut_face()" />
        </div>
        <div class="slider-con">
          <span style="width: 10%;">Xb</span>
          <div style="width: 80%;">
            <el-slider v-model="slider_value" show-input @input="slider_change()" />
          </div>

        </div>
        <div class="echart-con">echart</div>
      </div>
    </div>
  </div>


</template>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  display: flex;
}

.three-container {
  position: relative;
  width: 70%;
  background-color: rgb(238, 240, 243);

}

.right {
  width: 30%;
  background-color: rgb(238, 240, 243);
  display: grid;
  place-items: center;
}

.info-panel {
  height: 95%;
  width: 95%;
  border: 1px solid black;
  color: black;
  border-radius: 15px;
  background-color: rgb(226, 245, 248);
  display: grid;
  grid-template-rows: 10% 15% 1fr;
}

.cut-face-con {
  display: flex;
  align-items: center;
  padding-left: 5%;
}

.slider-con {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
