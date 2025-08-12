import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'


/**
 * Base
 */
// Debug
const gui = new GUI()
const particleFolder = gui.addFolder('Particles')
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Group
const group = new THREE.Group()
scene.add(group)

/**
 * Galaxy
 */
const parameters = {} // Create an object for lil-gui tweak

parameters.count = 100000 // add count parameter to the object
parameters.size = 0.01 // add size parameter to the object
parameters.radius = 5 // add radius parameter to the object
parameters.branches = 3 // add branches parameter to the object
parameters.spin = 1 // add spin parameter to the object
parameters.randomness = 0.2 // add random parameter to the object
parameters.randomnessPower = 3 // add power to parameter to the object
parameters.insideColor = '#ff6030' // add center color parameter to the object
parameters.outsideColor = '#1b3984' // add exterior color parameter to the object

// Initialize the variable
let geometry = null
let material = null
let points = null

const generateGalaxy = () => 
{   
    // Reset all variables
    if(points !== null) {
        geometry.dispose()
        material.dispose()
        group.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for(let i=0; i < parameters.count * 3; i++) {
        const i3 = i*3

        //Positions
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2
        
        const randomX = Math.pow(Math.random(), parameters.randomnessPower ) * (Math.random() < 0.5 ? 1 : -1) 
        const randomY = Math.pow(Math.random(), parameters.randomnessPower ) * (Math.random() < 0.5 ? 0.5 : -0.5) 
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower ) * (Math.random() < 0.5 ? 1 : -1) 

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        //Colors
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Materials
     */

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    group.add(points)
}

generateGalaxy();

// Add tweaks to gui pannel
particleFolder
    .add(parameters, 'count')
    .min(100)
    .max(1000000)
    .step(100)
    .onFinishChange(generateGalaxy)

particleFolder
    .add(parameters, 'size')
    .min(0.001)
    .max(0.1)
    .step(0.001)
    .onFinishChange(generateGalaxy)

particleFolder
    .add(parameters, 'radius')
    .min(0.01)
    .max(20)
    .step(0.01)
    .onFinishChange(generateGalaxy)

particleFolder
    .add(parameters, 'branches')
    .min(2)
    .max(20)
    .step(1)
    .onFinishChange(generateGalaxy)

particleFolder
    .add(parameters, 'spin')
    .min(-5)
    .max(5)
    .step(0.001)
    .onFinishChange(generateGalaxy)

particleFolder
    .add(parameters, 'randomness')
    .min(0)
    .max(2)
    .step(0.001)
    .onFinishChange(generateGalaxy)

particleFolder
    .add(parameters, 'randomnessPower')
    .min(1)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy)

particleFolder
    .addColor(parameters, 'outsideColor')
    .onFinishChange(generateGalaxy)

particleFolder
    .addColor(parameters, 'insideColor')
    .onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    group.rotation.y = elapsedTime * 0.2

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()