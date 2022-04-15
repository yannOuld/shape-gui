import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui';
import { DoubleSide } from 'three';
let scene, camera, renderer, controls, material, mesh, outline;

init();

function init() {
  // scene three js 
  scene = new THREE.Scene();

  //camera three js
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, -150);

  //lumiere ambiante
  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
  scene.add(ambient);

  // lumiere directionnel
  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set(1, 10, 6);
  scene.add(light);

  // rendu webgl 
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //controle orbitale de la camera autour de l'objet  
  controls = new OrbitControls(camera, renderer.domElement);

  // options pour le panneau de controle dat.gui
  const options = {
    name: 'square',
    type: 'extrude',
  }

  // initialisation du panneau de controle
  const gui = new GUI();

  // gerer les changement de parametres sur la fonction createMesh a la manipulation du panneau 
  gui.add(options, 'name', ['square', 'diamond']).onChange(value => createMesh(value, options.type));
  gui.add(options, 'type', ['plane', 'extrude', 'points', 'lines']).onChange(value => createMesh(options.name, value));
  createMesh(options.name, options.type);
  window.addEventListener('resize', resize, false);

  update();
}

//fonction de creation des formes 
function createMesh(name, type) {
  let width, height, x, y, radius;
  //condition de changement de valeur de la variable mesh pour la transition entre les formes
  if (mesh !== undefined) scene.remove(mesh);

  //variable qui contient la class shape de three js permet de tracer un objet 2D grace a des coordonées x y 
  let shape = new THREE.Shape();

  // la position sera vecteur qui comprendra l'ensemble de la forme
  const pos = new THREE.Vector3();

  // variable de la valeur de la rotation
  let rot = 0;

  // characteristique de la figure dans l'ordre (la profondeur , le biseau , le nombre de biseaux, le nombre de segments sur la profondeur , la taille des biseaux , et l'épaisseur des biseau)
  const extrudesSettings = {
    depth: 8,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 1,
    bevelThickness: 1,
  }

  //conditions de traçage de la forme 2D placement au cordonnées (x=0 y=0), ensuite traçage jusqu'au point (x=0 y=80) et ainsi de suite pour former un carré de 80 unités de cotés , recentrage de la forme avec les valeur de position x et y -40
  switch (name) {
    case 'square':
      width = 80;
      shape.moveTo(0, 0);
      shape.lineTo(0, width);
      shape.lineTo(width, width);
      shape.lineTo(width, 0);
      shape.lineTo(0, 0);
      pos.x = -40;
      pos.y = -40;
      break;
    case 'diamond':
      height = 70
      width = 50;
      shape.moveTo(-width, 0);
      shape.lineTo(0, height);
      shape.lineTo(width, 0);
      shape.lineTo(0, -height);
      shape.lineTo(-width, 0);
      break;
  }

  let geometry;

  // conditions de la class de geometrie utilisé pour variés les dimensions de la formes  
  switch (type) {
    // geometrie 3D basé sur une forme 2D
    case 'extrude':
      geometry = new THREE.ExtrudeBufferGeometry(shape, extrudesSettings);
      mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
      break;

    // geometrie plane
    case 'plane':
      geometry = new THREE.ShapeBufferGeometry(shape);
      mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ side: DoubleSide }));
      break;

    // geometrie de points des sommets avec un materiau de lignes qui trace la forme
    case 'lines':
      geometry = new THREE.BufferGeometry().setFromPoints(shape.getPoints());
      mesh = new THREE.Line(geometry, new THREE.LineBasicMaterial());
      break;

    //geometrie de points des sommets
    case 'points':
      geometry = new THREE.BufferGeometry().setFromPoints(shape.getPoints());
      mesh = new THREE.Points(geometry, new THREE.PointsMaterial({
        color: 0xffffff, size: 2
      }));
      break;
  }
  //positionnement de l'objet
  mesh.position.copy(pos);
  // rotation sur axe z mise a 0
  mesh.rotation.z = rot;

  //ajout a la scene
  scene.add(mesh);
}

// mise a jour images par images de l'animation  
function update() {
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

// gerer la taille du rendu et de la projection de la camera par rapport a la fenetre
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}