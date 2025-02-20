import * as THREE from 'three';

var container;
var camera, scene, renderer;
var mouseX = 0,
    mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Object3D ("Group") nodes and Mesh nodes
var sceneRoot = new THREE.Group();
var earthSpin = new THREE.Group();
var earthMesh;
var sunMesh;
var moonMesh;
var moonOrbit = new THREE.Group();
var earthOrbit;
var sunOrbit = new THREE.Group();
var marsMesh;
var marsOrbit = new THREE.Group();
var marsSpin = new THREE.Group();




var animation = true;

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    // mouseX, mouseY are in the range [-1, 1]
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
}

function createSceneGraph() {
    scene = new THREE.Scene();

    var sunLight = new THREE.PointLight(0xffffff, 10, 10);
    sunLight.position.set(0, 0, 0);
    sceneRoot.add(sunLight);

    earthSpin.rotation.z = THREE.MathUtils.degToRad(23.44); //jordens lutning

    // Top-level node
    scene.add(sceneRoot);

    // Sun branch
    sceneRoot.add(sunOrbit);
    sunOrbit.add(sunMesh);

    // Earth branch
    sunOrbit.add(earthSpin);
    earthMesh.position.set(3, 0, 0);
    earthSpin.add(earthMesh);

    //Mars branch
    sunOrbit.add(marsSpin);
    marsMesh.position.set(6, 0, 0);
    marsSpin.add(marsMesh);
    marsSpin.rotation.z = THREE.MathUtils.degToRad(15);
    

    // Moon branch
    moonOrbit.position.set(3, 0, 0); // Placera månen i förhållande till jorden
    moonMesh.position.set(1.2, 0, 0); // Placera månen på ett avstånd från jorden
    moonOrbit.add(moonMesh);
    earthSpin.add(moonOrbit);

    


    
}

function init() {
    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    
    var texloader = new THREE.TextureLoader();

    //moon mesh
    var geometryMoon = new THREE.SphereGeometry(0.3, 16, 16);

    var materialMoon = new THREE.MeshLambertMaterial();
    materialMoon.combine = 0;
    materialMoon.needsUpdate = true;
    materialMoon.wireframe = false; 

    //mars mesh
    var geometryMars = new THREE.SphereGeometry(0.25, 32, 32);  
    var materialMars = new THREE.MeshLambertMaterial();

    materialMoon.combine = 0;
    materialMoon.needsUpdate = true;
    materialMoon.wireframe = false; 

    //Sun mesh
    var geometrySun = new THREE.SphereGeometry(1.5, 32, 32);

    var materialSun = new THREE.MeshBasicMaterial();
    materialSun.combine = 0;
    materialSun.needsUpdate = true;
    materialSun.wireframe = false; 
    
    // Earth mesh
	var geometryEarth = new THREE.SphereGeometry(0.5, 32, 32);  

    var materialEarth = new THREE.MeshLambertMaterial();
    materialEarth.combine = 0;
    materialEarth.needsUpdate = true;
    materialEarth.wireframe = false;    


    

    //
    // Task 2: uncommenting the following two lines requires you to run this example with a (local) webserver
    //
    // For example using python:
    //    1. open a command line and go to the lab folder
    //    2. run "python -m http.server"
    //    3. open your browser and go to http://localhost:8000
    //
    // see https://threejs.org/docs/#manual/en/introduction/How-to-run-things-locally
    //
    
	const earthTexture = texloader.load('tex/2k_earth_daymap.jpg');
    const specularTexture = texloader.load('tex/2k_earth_specular_map.jpg');
    materialEarth.map = earthTexture;

    var uniforms = THREE.UniformsUtils.merge([
        { colorTexture: { value: earthTexture } },
        { specularMap: { value: specularTexture } },
        THREE.UniformsLib["lights"]
    ]);

    const sunTexture = texloader.load('tex/2k_sun.jpg');
    materialSun.map = sunTexture;

    const moonTexture = texloader.load('tex/2k_moon.jpg');
    materialMoon.map = moonTexture;
    
    const marsTexture = texloader.load('tex/2k_mars.jpg');
    materialMars.map = marsTexture;

    // Task 7: material using custom Vertex Shader and Fragment Shader
    
	var uniforms = THREE.UniformsUtils.merge( [
	    { 
	    	colorTexture : { value : new THREE.Texture() }
    	},
	    THREE.UniformsLib[ "lights" ]
	] );

	const shaderMaterial = new THREE.ShaderMaterial({
		uniforms : uniforms,
		vertexShader : document.getElementById('vertexShader').textContent.trim(),
		fragmentShader : document.getElementById('fragmentShader').textContent.trim(),
		lights : true
	});
	shaderMaterial.uniforms.colorTexture.value = earthTexture;
	
    sunMesh = new THREE.Mesh(geometrySun, materialSun);
    earthMesh = new THREE.Mesh(geometryEarth, shaderMaterial);
    moonMesh = new THREE.Mesh(geometryMoon, materialMoon);
    marsMesh = new THREE.Mesh(geometryMars, materialMars);

    createSceneGraph();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    var checkBoxAnim = document.getElementById('animation');
    animation = checkBoxAnim.checked;
    checkBoxAnim.addEventListener('change', (event) => {
    	animation = event.target.checked;
    });

	var checkBoxWireframe = document.getElementById('wireframe');
    earthMesh.material.wireframe = checkBoxWireframe.checked;
    checkBoxWireframe.addEventListener('change', (event) => {
    	earthMesh.material.wireframe = event.target.checked;
    });
}

function render() {
    // Set up the camera
    camera.position.x = mouseX * 10;
    camera.position.y = -mouseY * 10;
    camera.lookAt(scene.position);

    // Perform animations
    if (animation) {
        sunOrbit.rotation.y += (2 * Math.PI) / (365 * 600); // Earth orbits around the Sun in 365 seconds
        sunMesh.rotation.y += (2 * Math.PI) / (25 * 600); // Sun rotates every 25 seconds
        earthSpin.rotation.y += (2 * Math.PI) / 600; // Earth spins once every second
        earthMesh.rotation.y += (2 * Math.PI) / 600; // Earth rotates around its own axis once every second
        moonOrbit.rotation.y += (2 * Math.PI) / (27.3 * 60); // Moon orbits around the Earth in 27.3 seconds
        moonMesh.rotation.y += (2 * Math.PI) / 600; // Earth rotates around its own axis once every second
        marsSpin.rotation.y += (2 * Math.PI) / 1000; // Earth spins once every second
        marsMesh.rotation.y += (2 * Math.PI) / 600; // Earth rotates around its own axis once every second
    }

    // Render the scene
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate); // Request to be called again for next frame
    render();
}

init(); // Set up the scene
animate(); // Enter an infinite loop
