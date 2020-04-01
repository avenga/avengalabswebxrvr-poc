import * as THREE from 'three';

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import { PointLight } from 'three';
import { WebXRManager } from 'three/src/renderers/webxr/WebXRManager';


var clock = new THREE.Clock();

var container;
var camera, scene, raycaster, renderer;

var room;

// Avenga value boxes
const maxNumberOfBoxes = 50;
const boxSize = 3.0;

var controller, controllerGrip, tempMatrix = new THREE.Matrix4();
var INTERSECTED;

init();
animate();

function avengaValue (id, name, color, textureImage, texture) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.textureImage = textureImage;
        this.texture = texture;
}

function init() {

    // avenga values - id, label, RGB color, texture file name, texture (null)
    var avengaValues = [
        new avengaValue(0, "leadership", 0xe750bc, "leadership.jpg", null),
        new avengaValue(1, "shippability", 0x181818, "shippability.jpg", null),
        new avengaValue(2, "quality", 0xf5c43a, "quality.jpg", null),
        new avengaValue(3, "responsibility", 0xe646a1, "responsibility.jpg", null),
        new avengaValue(4, "trust", 0x122bb9, "trust.jpg", null),
        new avengaValue(5, "improvement", 0x4db2f9, "improvement.jpg", null),
        new avengaValue(6, "sustainability", 0x3b8825, "sustainability.jpg", null)
    ];

    // create scene
    scene = new THREE.Scene();

    // with dark gray background
    scene.background = new THREE.Color( 0x111111 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 ); // changed to wider camera
    camera.position.set( 0, 1.6, 3 );
    scene.add( camera );

    // grid background
    room = new THREE.LineSegments(
        new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
        new THREE.LineBasicMaterial( { color: 0x00ff00 } ) // green lines
    );
    scene.add( room );

    // load avenga values textures
    var avengaValuesTextures = [];
    avengaValues.forEach(element => {
        element.texture = new THREE.TextureLoader().load( "resources/" + element.textureImage ); 
    });

    // load avenga dark texture
    var avengaDarkTexture = new THREE.TextureLoader().load("resources/logo-negative-color.jpg");

    // load wao product texture
    var waoTexture = new THREE.TextureLoader().load("resources/wao320.jpg");

    // main light
    scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

    //SUGGESTION:  additional lights?
/*     scene.add( new THREE.DirectionalLight(0x00ff00, 1)); 
    scene.add( new PointLight(0xffffff, 1, 5, 2)); // decay == 2 for more realistic light

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light ); */ 

    var geometry = new THREE.BoxBufferGeometry( 0.15, 0.15, 0.15 );
    var material = new THREE.MeshBasicMaterial( { color: 0xff0000 }); // red for visual debuggin only

    var meshColor = 0xffffff;
    var currentAvengaValue = 0;
    var avengaValueBoxesExpectedCount = 4; // 4 boxes of each Avenga value
    var avengaBoxesTotalCount = avengaValueBoxesExpectedCount * avengaValues.length;

    // create objects - initialize boxes
    for ( var i = 0; i < maxNumberOfBoxes; i ++ ) {

        currentAvengaValue = i % avengaValues.length;
        meshColor = avengaValues[currentAvengaValue].color;

        // some boxes are solid, some boxes have descriptions, some have avenga dark logo
        if (i < avengaBoxesTotalCount) {
            material = new THREE.MeshBasicMaterial( { map: avengaValues[currentAvengaValue].texture, side: THREE.DoubleSide } );
        }
        else if ((i % 3) == 1) {
            material = new THREE.MeshPhongMaterial( { color : avengaValues[currentAvengaValue].color, emissive : 50, side: THREE.DoubleSide })
            //SUGGESTION: material = new THREE.MeshBasicMaterial( { map: waoTexture, side: THREE.DoubleSide } );
        } 
        else
        {
            material = new THREE.MeshBasicMaterial( { map: avengaDarkTexture, side: THREE.DoubleSide } );
        }
        
        // create objects, with xyz positions and rotation
        var object = new THREE.Mesh( geometry, material); 

        object.position.x = Math.random() * 4 - 2;
        object.position.y = Math.random() * 4;
        object.position.z = Math.random() * 4 - 2;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        // identical sizes 
        object.scale.x = boxSize;
        object.scale.y = boxSize;
        object.scale.z = boxSize;

        object.userData.velocity = new THREE.Vector3();
        object.userData.velocity.x = Math.random() * 0.01 - 0.005;
        object.userData.velocity.y = Math.random() * 0.01 - 0.005;
        object.userData.velocity.z = Math.random() * 0.01 - 0.005;

        room.add( object );

    }

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;
    //container.appendChild( renderer.domElement ); <-- div has beeen removed
    document.body.appendChild(renderer.domElement);

    //
    function onSelectStart() {

        this.userData.isSelecting = true;

    }

    function onSelectEnd() {

        this.userData.isSelecting = false;

    }

    controller = renderer.xr.getController( 0 );
    controller.addEventListener( 'selectstart', onSelectStart );
    controller.addEventListener( 'selectend', onSelectEnd );
    controller.addEventListener( 'connected', function ( event ) {

        this.add( buildController( event.data ) );

    } );
    controller.addEventListener( 'disconnected', function () {

        this.remove( this.children[ 0 ] );

    } );
    scene.add( controller );

    var controllerModelFactory = new XRControllerModelFactory();

    controllerGrip = renderer.xr.getControllerGrip( 0 );
    controllerGrip.add( controllerModelFactory.createControllerModel( controllerGrip ) );
    scene.add( controllerGrip );

    window.addEventListener( 'resize', onWindowResize, false );

    // VR button is critical to initalize VR experience
    document.body.appendChild( VRButton.createButton( renderer ) );

}

function buildController( data ) {

    switch ( data.targetRayMode ) {

        case 'tracked-pointer':

            var geometry = new THREE.BufferGeometry();
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
            geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

            var material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );

            return new THREE.Line( geometry, material );

        case 'gaze':

            var geometry = new THREE.RingBufferGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
            var material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
            return new THREE.Mesh( geometry, material );

    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    renderer.setAnimationLoop( render );

}

function render() {

    var delta = clock.getDelta() * 60;

    if ( controller.userData.isSelecting === true ) {

        var cube = room.children[ 0 ];
        room.remove( cube );

        cube.position.copy( controller.position );
        cube.userData.velocity.x = 0; 
        cube.userData.velocity.y = 0; 
        cube.userData.velocity.z = 0; 
        
        room.add( cube );

    }

    // Keep cubes inside room

    for ( var i = 0; i < room.children.length; i ++ ) {

        var cube = room.children[ i ];

        cube.userData.velocity.multiplyScalar( 1 - ( 0.001 * delta ) ); //todo: causes the boxes to slow down

        cube.position.add( cube.userData.velocity );

        if ( cube.position.x < - 3 || cube.position.x > 3 ) {

            cube.position.x = THREE.MathUtils.clamp( cube.position.x, - 3, 3 );
            cube.userData.velocity.x = -1 * cube.userData.velocity.x; 
        }

        if ( cube.position.y < 0 || cube.position.y > 6 ) {

            cube.position.y = THREE.MathUtils.clamp( cube.position.y, 0, 6 );
            cube.userData.velocity.y = -1 * cube.userData.velocity.y;

        }

        if ( cube.position.z < - 3 || cube.position.z > 3 ) {

            cube.position.z = THREE.MathUtils.clamp( cube.position.z, - 3, 3 );
            cube.userData.velocity.z = -1 * cube.userData.velocity.z;

        } 

        cube.rotation.x += cube.userData.velocity.x * 2 * delta;
        cube.rotation.y += cube.userData.velocity.y * 2 * delta;
        cube.rotation.z += cube.userData.velocity.z * 2 * delta;

        // prevent cubes from complete stop
        if ((Math.abs(cube.userData.velocity.x) + Math.abs(cube.userData.velocity.y) + Math.abs(cube.userData.velocity.z)) < 0.0001)
        {
            // almost stopped - give it a kick
            console.log("Had to kick object " + cube);
            
            cube.userData.velocity.x = Math.random() * 0.01 - 0.005;
            cube.userData.velocity.y = Math.random() * 0.01 - 0.005;
            cube.userData.velocity.z = Math.random() * 0.01 - 0.005;
        }

    }

    renderer.render( scene, camera );

}
