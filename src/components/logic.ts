import { AxesHelper, Box3, BufferGeometry, Color, CylinderGeometry, DoubleSide, Group, Line, LineBasicMaterial, LineDashedMaterial, Mesh, MeshBasicMaterial, RingGeometry, Scene, Vector3 } from "three"

export const add_cylinder = (scene: Scene) => {
    console.log("版权所有：nico");
    add_helper(scene)
    let group = new Group()
    let radius = 40
    let height = 200
    const cylinder_g = new CylinderGeometry(radius, radius, height, 64)
    const material = new MeshBasicMaterial({
        transparent: true, opacity: 0.1, color: new Color('rgb(89,138,234)'), side: DoubleSide
    })
    const cylinder = new Mesh(cylinder_g, material)
    group.add(cylinder)
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
    group.add(topMesh)
    // 下圆
    const bottomRing = new RingGeometry(radius, radius + 1, 64);  // 使用稍大半径以创建轮廓
    const bottomMesh = new Mesh(bottomRing, ringMaterial);
    bottomMesh.position.y = -height / 2;  // 下圆位置
    bottomMesh.rotation.x = Math.PI / 2;  // 上圆位置
    group.add(bottomMesh)
    group.rotation.z = -Math.PI / 2
    // group.rotation.y = -Math.PI / 2
    scene.add(group)
    return group
}

// 距离表示

export const sign_distance = (mesh: Group) => {

    mesh.updateMatrixWorld()
    const box = new Box3()
    box.setFromObject(mesh)
    const center = box.getCenter(new Vector3())
    const size = box.getSize(new Vector3())

    // 
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