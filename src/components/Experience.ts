import { Box3, BoxGeometry, BufferGeometry, Color, CylinderGeometry, DoubleSide, Group, Line, LineBasicMaterial, LineCurve3, LineDashedMaterial, Mesh, MeshBasicMaterial, RingGeometry, Scene, Shape, ShapeGeometry, Vector2, Vector3 } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export default class Experience {
    scene: Scene
    // 横截面points
    radius = 40
    height = 200
    cut_face_points!: Vector3[];
    // 左右圆形的中心点 left_center x轴负方向
    centerPoints!: { left_center: Vector3; right_center: Vector3; center: Vector3 };
    center_line!: LineCurve3;
    cylinderGroup: any;
    boxPoint: number | undefined;
    controlBox!: Mesh;
    medium_line!: Line;
    left_len!: CSS2DObject;
    right_len!: CSS2DObject;
    cut_face!: Mesh;
    cut_face_deep!: Mesh;
    constructor(scene: Scene, boxPoint?: number) {
        this.scene = scene
        this.boxPoint = boxPoint
        this.add_cylinder_and_base()
        this.sign_distance(this.cylinderGroup)
        this.add_cut_face_line()
        // 横截面
        this.create_face()
        // 深色面
        this.create_face_deep()
        // 中线
        this.create_center_line()
        // 虚线的中间截断线
        this.add_medium_line(0)

        this.add_three_testBox()
        this.compute_length()
    }
    add_cylinder_and_base = () => {
        // add_helper(scene)
        let group = new Group(), cylinderGroup = new Group()
        let radius = this.radius
        let height = this.height
        const cylinder_g = new CylinderGeometry(radius, radius, height, 64)
        const material = new MeshBasicMaterial({
            transparent: true, opacity: 0.1, color: new Color('rgb(89,138,234)'), side: DoubleSide
        })
        const cylinder = new Mesh(cylinder_g, material)
        cylinderGroup.add(cylinder)
        //创建轮廓
        const ringMaterial = new MeshBasicMaterial({
            color: new Color('rgb(89,138,234)'),
            wireframe: false,
            side: DoubleSide
        });
        const topRing = new RingGeometry(radius, radius + 1, 64)
        const topMesh = new Mesh(topRing, ringMaterial);
        topMesh.position.y = height / 2;  // 上圆位置
        topMesh.rotation.x = Math.PI / 2;  // 上圆位置
        cylinderGroup.add(topMesh)
        // 下圆
        const bottomRing = new RingGeometry(radius, radius + 1, 64);  // 使用稍大半径以创建轮廓
        const bottomMesh = new Mesh(bottomRing, ringMaterial);
        bottomMesh.position.y = -height / 2;  // 下圆位置
        bottomMesh.rotation.x = Math.PI / 2;  // 上圆位置
        cylinderGroup.add(bottomMesh)
        cylinder.renderOrder = 3
        const base = this.add_base()
        group.add(base)
        group.add(cylinderGroup)
        this.cylinderGroup = cylinderGroup
        group.rotation.z = -Math.PI / 2
        group.updateMatrixWorld(true)
        this.scene.add(group)
    }

    //基座
    add_base = () => {
        let height = 8
        const boxG = new BoxGeometry(100, height, 100)
        const materials = [
            new MeshBasicMaterial({ color: 0xffffff }), // 前面
            new MeshBasicMaterial({ color: 0xffffff }), // 后面
            new MeshBasicMaterial({ color: new Color('rgb(194,194,132)') }), // 上面
            new MeshBasicMaterial({ color: new Color('rgb(194,194,132)') }), // 下面
            new MeshBasicMaterial({ color: 0xffffff }), // 左面
            new MeshBasicMaterial({ color: 0xffffff }), // 右面
        ];
        const cube = new Mesh(boxG, materials);
        cube.position.set(0, -(100 + height / 2 + 0.1), 0)
        return cube
    }

    // 横截线
    add_cut_face_line = () => {
        const box = new Box3()
        box.setFromObject(this.cylinderGroup)
        const center = box.getCenter(new Vector3())
        const size = box.getSize(new Vector3())
        const left_center = center.clone().sub(new Vector3(size.x / 2, 0, 0))
        const right_center = center.clone().add(new Vector3(size.x / 2, 0, 0))
        let centerPoints = {
            left_center: left_center.clone(),
            right_center: right_center.clone(),
            center: center.clone()
        }
        let line1Point = [left_center.clone().add(new Vector3(0, size.y / 2, 0)), right_center.clone().add(new Vector3(0, size.y / 2, 0))]
        let line2Point = [right_center.clone().sub(new Vector3(0, size.y / 2, 0)), left_center.clone().sub(new Vector3(0, size.y / 2, 0))]

        const material_l = new LineBasicMaterial({
            color: new Color('rgb(104,155,237)'),
            linewidth: 1,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin: 'round' //ignored by WebGLRenderer
        });
        const geometry_t = new BufferGeometry().setFromPoints(line1Point)
        const geometry_b = new BufferGeometry().setFromPoints(line2Point)
        const line1 = new Line(geometry_t, material_l)
        const line2 = new Line(geometry_b, material_l)
        let cl_group = new Group()
        cl_group.add(line1)
        cl_group.add(line2)
        this.scene.add(cl_group)
        this.cut_face_points = [...line1Point, ...line2Point]
        this.centerPoints = centerPoints
    }
    sign_distance = (mesh: Group) => {
        mesh.updateMatrixWorld()
        const box = new Box3()
        box.setFromObject(mesh)
        const center = box.getCenter(new Vector3())
        const size = box.getSize(new Vector3())
        let group = new Group()
        let offset = 1
        const left = new Vector3(center.x - size.x / 2, center.y + size.y / 2 + offset, 0)
        const right = new Vector3(center.x + size.x / 2, center.y + size.y / 2 + offset, 0)
        // 两端实线
        let pointsArr_l = [left.clone().sub(new Vector3(0, 1, 0)), left.clone().add(new Vector3(0, 2, 0))]
        let pointsArr_r = [right.clone().sub(new Vector3(0, 1, 0)), right.clone().add(new Vector3(0, 2, 0))]
        const material_l = new LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin: 'round' //ignored by WebGLRenderer
        });
        const geometry_l = new BufferGeometry().setFromPoints(pointsArr_l)
        const geometry_r = new BufferGeometry().setFromPoints(pointsArr_r)
        const l = new Line(geometry_l, material_l)
        const r = new Line(geometry_r, material_l)
        group.add(l)
        group.add(r)
        // 虚线
        const geometry = new BufferGeometry().setFromPoints([left, right])
        // 创建材质，设置为黑色虚线
        const line_material = new LineDashedMaterial({
            color: 0x000000,
            linewidth: 2,
            dashSize: 3,
            gapSize: 1
        });
        const line = new Line(geometry, line_material)
        line.computeLineDistances(); // 计算虚线的距离
        group.add(line)

        this.scene.add(group)
    }
    create_face() {
        const new_v2Arr = this.cut_face_points.map(v3 => {
            return new Vector2(v3.x, v3.y)
        })
        const shape = new Shape(new_v2Arr)
        shape.closePath()
        const geometry = new ShapeGeometry(shape);
        const material = new MeshBasicMaterial({
            transparent: true, opacity: 0.2, color: new Color('rgb(255,138,234)'), side: DoubleSide
        })
        const face = new Mesh(geometry, material)
        this.cut_face = face
        this.cut_face.renderOrder = 2
        this.scene.add(face)
    }
    create_face_deep() {
        let deepArr = [
            this.centerPoints.left_center.clone().add(new Vector3(0, this.radius, 0)),
            this.centerPoints.left_center.clone().sub(new Vector3(0, this.radius, 0)),
            new Vector3(0, -this.radius, 0),
            new Vector3(0, this.radius, 0),
        ]
        const new_v2Arr = deepArr.map(v3 => {
            return new Vector2(v3.x, v3.y)
        })
        const shape = new Shape(new_v2Arr)
        shape.closePath()
        const geometry = new ShapeGeometry(shape);
        const material = new MeshBasicMaterial({
            transparent: true, opacity: 0.5, color: new Color('rgb(255,0,234)'), side: DoubleSide
        })
        const face = new Mesh(geometry, material)
        face.translateZ(0.1)
        this.cut_face_deep = face
        this.cut_face_deep.renderOrder = 1
        this.scene.add(face)
    }
    update_face_deep() {
        let deepArr = [
            this.centerPoints.left_center.clone().add(new Vector3(0, this.radius, 0)),
            this.centerPoints.left_center.clone().sub(new Vector3(0, this.radius, 0)),
            new Vector3(this.controlBox.position.x, -this.radius, 0),
            new Vector3(this.controlBox.position.x, this.radius, 0),
        ]
        const new_v2Arr = deepArr.map(v3 => {
            return new Vector2(v3.x, v3.y)
        })
        const shape = new Shape(new_v2Arr);
        shape.closePath();
        this.cut_face_deep.geometry.dispose();  // 先清除旧的几何体数据
        const geometry = new ShapeGeometry(shape);  // 创建新的几何体
        this.cut_face_deep.geometry = geometry;  // 更新 Mesh 的几何体
        // this.cut_face_deep.translateZ(0.1)

    }
    create_center_line() {
        const curve = new LineCurve3(this.centerPoints.left_center, this.centerPoints.right_center)
        this.center_line = curve
    }

    add_medium_line(vectorx: number) {
        const newVector3 = new Vector3(vectorx, this.radius, 0)
        const newVector3_2 = newVector3.clone().add(new Vector3(0, 4, 0))
        const geometry = new BufferGeometry().setFromPoints([newVector3, newVector3_2])
        const material_l = new LineBasicMaterial({
            color: 0x000000,
            linewidth: 1,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin: 'round' //ignored by WebGLRenderer
        });
        const medium_line = new Line(geometry, material_l)
        this.medium_line = medium_line
        this.scene.add(medium_line)
    }

    change_medium_line(number?: number) {
        let newPos: Vector3
        if (number) {
            let vectorx = number - 100
            newPos = new Vector3(vectorx, this.medium_line.position.y, this.medium_line.position.z)
            this.controlBox.position.copy(new Vector3(vectorx, 0, 0))
        } else {
            newPos = new Vector3(this.controlBox.position.x, this.medium_line.position.y, this.medium_line.position.z)
        }
        this.medium_line.position.copy(newPos)
        this.update_css2_obj()
        this.update_face_deep()
        return (newPos.x + 100)
    }
    // 根据新中线更显 css2object的位置
    update_css2_obj() {
        const left_part_len = this.controlBox.position.distanceTo(this.centerPoints.left_center).toFixed(2)
        const right_part_len = this.controlBox.position.distanceTo(this.centerPoints.right_center).toFixed(2)
        let left_c_x = ((this.controlBox.position.x + this.centerPoints.left_center.x) / 2).toFixed(2)
        let right_c_x = ((this.controlBox.position.x + this.centerPoints.right_center.x) / 2).toFixed(2)
        let left_part_center = new Vector3(Number(left_c_x), this.radius, 0)
        let right_part_center = new Vector3(Number(right_c_x), this.radius, 0)

        this.left_len.position.copy(left_part_center)
        this.right_len.position.copy(right_part_center)
        this.updateTextInCSS2DObject(this.left_len, `${left_part_len}m`)
        this.updateTextInCSS2DObject(this.right_len, `${right_part_len}m`)

    }


    updateTextInCSS2DObject(css2DObject: CSS2DObject, newText: string) {
        // 更新文本内容
        const div = css2DObject.element;  // 获取内部的 div 元素
        div.textContent = newText;  // 更新文本
    }

    compute_length() {
        // 长度
        const left_part_len = this.controlBox.position.distanceTo(this.centerPoints.left_center).toFixed(2)
        const right_part_len = this.controlBox.position.distanceTo(this.centerPoints.right_center).toFixed(2)
        let left_c_x = ((this.controlBox.position.x + this.centerPoints.left_center.x) / 2).toFixed(2)
        let right_c_x = ((this.controlBox.position.x + this.centerPoints.right_center.x) / 2).toFixed(2)
        // 长度显示位置
        let left_part_center = new Vector3(Number(left_c_x), this.radius, 0)

        let right_part_center = new Vector3(Number(right_c_x), this.radius, 0)

        this.left_len = createCSS2DText(`${left_part_len}m`, left_part_center)
        this.right_len = createCSS2DText(`${right_part_len}m`, right_part_center)
        this.scene.add(this.left_len, this.right_len)
    }
    add_three_testBox() {
        const box1 = addBox(this.centerPoints.left_center)
        const box2 = addBox(this.centerPoints.right_center)
        this.controlBox = addBox(this.centerPoints.center)
        this.scene.add(box1, box2, this.controlBox)
    }
}

function addBox(p: Vector3) {
    const boxG = new BoxGeometry(3, 3, 3)
    const material = new MeshBasicMaterial({
        color: 'red'
    })
    const mesh = new Mesh(boxG, material)
    mesh.position.copy(p)
    return mesh
}

// 创建文本标签
function createCSS2DText(text: string, position: Vector3) {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = text;
    div.style.color = 'black';
    div.style.fontSize = '16px';
    div.style.position = 'absolute';
    const cssObject = new CSS2DObject(div);
    cssObject.position.copy(position);
    return cssObject
}