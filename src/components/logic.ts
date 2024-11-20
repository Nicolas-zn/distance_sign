import { AxesHelper, Box3, BoxGeometry, BufferGeometry, Color, CylinderGeometry, DoubleSide, Group, Line, LineBasicMaterial, LineCurve3, LineDashedMaterial, Mesh, MeshBasicMaterial, RingGeometry, Scene, Shape, ShapeGeometry, Vector2, Vector3 } from "three"

export const add_cylinder = (scene: Scene) => {
    console.log("版权所有：nico");
    add_helper(scene)
    let group = new Group(), cylinderGroup = new Group()
    let radius = 40
    let height = 200
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
    cylinder.renderOrder = 2
    // group.rotation.z = -Math.PI / 2
    const base = add_base()
    group.add(base)
    group.add(cylinderGroup)
    group.rotation.z = -Math.PI / 2
    scene.add(group)
    group.updateMatrixWorld(true)
    let { cl_group, points, centerPoints } = cut_face_line(cylinderGroup)
    scene.add(cl_group)
    const face = create_face(points)
    scene.add(face)
    const center_line = create_center_line(centerPoints)
    scene.add(center_line)
    return cylinderGroup
}

//基座
const add_base = () => {
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

    // 创建长方体 Mesh 并将材质应用到各个面
    const cube = new Mesh(boxG, materials);
    cube.position.set(0, -(100 + height / 2 + 0.1), 0)
    return cube
    // // 将长方体添加到场景中
    // scene.add(cube);
}

// 距离表示
export const sign_distance = (mesh: Group) => {
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

    return group
}

const add_helper = (scene: Scene) => {
    const axes = new AxesHelper(100)
    scene.add(axes)
}

// 横截面
const cut_face_line = (object3d: Group) => {
    const box = new Box3()
    box.setFromObject(object3d)
    const center = box.getCenter(new Vector3())
    const size = box.getSize(new Vector3())
    const left_center = center.clone().sub(new Vector3(size.x / 2, 0, 0))
    const right_center = center.clone().add(new Vector3(size.x / 2, 0, 0))
    let centerPoints = [left_center.clone(), right_center.clone()]
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
    return { cl_group, points: [...line1Point, ...line2Point], centerPoints }
}
function create_face(points: Vector3[]) {

    const new_v2Arr = points.map(v3 => {
        return new Vector2(v3.x, v3.y)
    })
    console.log(new_v2Arr);

    const shape = new Shape(new_v2Arr)
    shape.closePath()
    const geometry = new ShapeGeometry(shape);
    const material = new MeshBasicMaterial({
        transparent: true, opacity: 0.2, color: new Color('rgb(255,138,234)'), side: DoubleSide
    })
    const face = new Mesh(geometry, material)
    return face
}

function create_center_line(centerPoints: Vector3[]) {
    // throw new Error("Function not implemented.");
    console.log(centerPoints);
    const curve = new LineCurve3(centerPoints[0], centerPoints[1])
    const start = curve.getPointAt(0)
    const end = curve.getPointAt(1)
    const some_p = curve.getPointAt(0.4)
    let group = new Group()
    function addBox(p: Vector3) {
        const boxG = new BoxGeometry(3, 3, 3)
        const material = new MeshBasicMaterial({
            color: 'red'
        })
        const mesh = new Mesh(boxG, material)
        mesh.position.copy(p)
        return mesh
    }
    let b = addBox(start)
    group.add(b)
    group.add(addBox(end))
    group.add(addBox(some_p))
    return group
}

