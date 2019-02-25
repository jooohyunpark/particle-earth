   var container = document.querySelector(".container");
   var scene = new THREE.Scene();
   var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
   camera.position.set(1.25, 7, 17);
   camera.lookAt(scene.position);
   var renderer = new THREE.WebGLRenderer({
       antialias: true
   });
   renderer.setClearColor(0x000000);
   renderer.setSize(window.innerWidth, window.innerHeight);
   container.appendChild(renderer.domElement);

   var controls = new THREE.OrbitControls(camera, renderer.domElement);
   controls.enableDamping = true;
   controls.dampingFactor = 0.88;
   controls.screenSpacePanning = false;
   controls.enablePan = false;
   controls.enableZoom = false;

   var geom = new THREE.SphereBufferGeometry(5, 120, 60);

   var colors = [];
   var color = new THREE.Color();
   for (let i = 0; i < geom.attributes.position.count; i++) {
       color.set(getRandomColor());
       color.toArray(colors, i * 3);
   }
   geom.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

   var loader = new THREE.TextureLoader();
   loader.setCrossOrigin('');
   var texture = loader.load('http://learningthreejs.com/data/2013-09-16-how-to-make-the-earth-in-webgl/demo/bower_components/threex.planets/images/earthspec1k.jpg');
   texture.wrapS = THREE.RepeatWrapping;
   texture.wrapT = THREE.RepeatWrapping;
   texture.repeat.set(1, 1);
   var disk = loader.load('https://threejs.org/examples/textures/sprites/circle.png');

   var points = new THREE.Points(geom, new THREE.ShaderMaterial({
       vertexColors: THREE.VertexColors,
       uniforms: {
           visibility: {
               value: texture
           },
           shift: {
               value: 0
           },
           shape: {
               value: disk
           },
           size: {
               value: 0.125
           },
           scale: {
               value: window.innerHeight / 2
           }
       },
       vertexShader: `
  				
      uniform float scale;
      uniform float size;
      
      varying vec2 vUv;
      varying vec3 vColor;
      
      void main() {
      
        vUv = uv;
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = size * ( scale / length( mvPosition.xyz ) );
        gl_Position = projectionMatrix * mvPosition;

      }
  `,
       fragmentShader: `
      uniform sampler2D visibility;
      uniform float shift;
      uniform sampler2D shape;
      
      varying vec2 vUv;
      varying vec3 vColor;
      

      void main() {
      	
        vec2 uv = vUv;
        uv.x += shift;
        vec4 v = texture2D(visibility, uv);
        if (length(v.rgb) > 1.0) discard;

        gl_FragColor = vec4( vColor, 1.0 );
        vec4 shapeData = texture2D( shape, gl_PointCoord );
        if (shapeData.a < 0.5) discard;
        gl_FragColor = gl_FragColor * shapeData;
		
      }
  `,
       transparent: true
   }));
   scene.add(points);

   var blackGlobe = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({
       color: 0x000000
   }));
   blackGlobe.scale.setScalar(0.99);
   points.add(blackGlobe);

   run();

   function run() {
       requestAnimationFrame(run);
       controls.update();
       render();
   }

   function render() {
       points.rotation.y += 0.001;
       renderer.render(scene, camera);
   }

   window.addEventListener('resize', onWindowResize, false);

   function onWindowResize() {
       camera.aspect = window.innerWidth / window.innerHeight;
       camera.updateProjectionMatrix();
       renderer.setSize(window.innerWidth, window.innerHeight);
   }

   function getRandomColor() {
       let letters = "0123456789ABCDEF";
       let color = "#";
       for (let i = 0; i < 6; i++) {
           color += letters[Math.floor(Math.random() * 16)];
       }
       return color;
   }
