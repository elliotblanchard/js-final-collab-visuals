			//Three.js lib import
			import * as THREE from './build/three.module.js';
			import Stats from './jsm/libs/stats.module.js';
			import { GUI } from './jsm/libs/dat.gui.module.js';			
			import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
			import { RenderPass } from './jsm/postprocessing/RenderPass.js';
			import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';	

			//Three.js
			let container, stats;
			let camera, scene, renderer, composer;
			let pointLight;
			//let objects = [], materials = [];

			let params = {
				exposure: 1,
				bloomStrength: 3,
				bloomThreshold: 0.25,
				bloomRadius: 0.1
			};		
			
			const endPoint = "http://localhost:3000/api/v1/"			

			//Define overall class for the cells matrix
			class Cell {
				constructor(material, hue, sat, lum, age, neighbors) {
					this._material = material;
    				this._hue = hue;
					this._sat = sat;
					this._lum = lum;
					this._age = age;
					this._neighbors = neighbors;
  				}	

				get material() {
    				return this._material;
  				}				  
				get hue() {
    				return this._hue;
  				}
				get sat() {
    				return this._sat;
  				}	
				get lum() {
    				return this._lum;
  				}				  
				get age() {
    				return this._age;
  				}	
				get neighbors() {
    				return this._neighbors;
  				}				  
				set material(newMaterial) {
    				this._material = newMaterial;
 				}					 	
				set hue(newHue) {
    				this._hue = newHue;
 				}	
				set sat(newSat) {
    				this._sat = newSat;
 				}	
				set lum(newLum) {
    				this._lum = newLum;
 				}			 	
				set age(newAge) {
    				this._age = newAge;
 				}	
				set neighbors(newNeighbors) {
    				this._neighbors = newNeighbors;
 				}				 		 			 			  		  			  
			}

			
			class Seed {
				constructor(id, name, matrix, userId) {
					this._id = id
    				this._name = name
					this._matrix = matrix
					this._userId = userId
  				}	

				get id() {
    				return this._id
  				}				  
				get name() {
    				return this._name
  				}
				get matrix() {
    				return this._matrix
  				}	
				get user_id() {
    				return this._user_id
  				}				  			  
				set id(newId) {
    				this._id = newId
 				}					 	
				set name(newName) {
    				this._name = newName
 				}	
				set matrix(newMatrix) {
    				this._matrix = newMatrix
 				}	
				set userId(newUserId) {
    				this._userId = newUserId
 				}			 					 		 			 			  		  			  
			}			

			//Define overall class for the cells matrix
			class CellEcosystem {
				constructor(gridDimension,cellDimension,cellDepth,cellLife) {
					this._gridDimension = gridDimension;
					this._cellDimension = cellDimension;
					this._cellDepth = cellDepth;
					this._cellLife = cellLife;	
					this._edges = { topRow: [], rightRow: [], bottomRow: [], leftRow: [] };	
					this._cellsMatrix = Array(this.gridDimension ** 2);	
					this._currentSeed;	
					this._playingSeed;
					this.applyToggle = true;
					this._rowNumber = 0;
					this._lumCutoff = 0.5; //Minimum luminance to be counted as a neighbor 

					//Init the matrix (how do you return an object in a map)
					for (let i = 0; i < this._cellsMatrix.length; i++) {
						this._cellsMatrix[i] = new Cell(
							new THREE.MeshLambertMaterial( {color: 0x202020} ), 
							0.0, 
							0.0, 
							0.0, 
							0,
							0
							);
						let mesh = new THREE.Mesh( new THREE.CylinderGeometry( this._cellDepth, this._cellDepth, this._cellDepth, 32 ), this._cellsMatrix[i].material );
						mesh.position.x = ( (i) % this._gridDimension ) * (this._cellDimension*1.1) - 400;
						mesh.position.z = Math.floor( (i) / this._gridDimension ) * (this._cellDimension*1.1) - 400;
						scene.add( mesh );
					}	
					this._edges = this.setEdges(this._edges);																										
				}

				setEdges(edges) {	
					//how to do as a map since you need to keep track of iteration?		
					for (let i = 0; i < (this._gridDimension ** 2); i++) {
						let j = i+1;
						if (i < this._gridDimension) {
							edges.topRow.push(i)
						}
						if (i > ((this._gridDimension ** 2)-this._gridDimension)) {
							edges.bottomRow.push(i)
						}
						if (j % this._gridDimension === 0) {
							edges.rightRow.push(i)
						}
						if (i % this._gridDimension === 0) {
							edges.leftRow.push(i)
						}					
					}
					return edges
				}

				testEdges() {				
					const allEdges = [...this._edges.topRow, ...this._edges.rightRow, ...this._edges.bottomRow, ...this._edges.leftRow];
					for (let i = 0; i < (this._gridDimension ** 2); i++) {
						if (allEdges.includes(i)) {	
							this._cellsMatrix[i].material.emissive.setHSL(0.0, 0.0, 1.0)
						}
						else {
							this._cellsMatrix[i].material.emissive.setHSL(0.0, 0.0, 0.0)
						}
					}
				}	

				randomColor(probability) {
					//Sets a percentage of the cells to a random color.
					//Probability is the chance of the change being applied to a cell (0-1)
					//This should be a map() - but how do you do a map when each item is an object you're modifying object variables?
					for (let i = 0; i < this._cellsMatrix.length; i++) {
						if (Math.random() > probability) {
							this._cellsMatrix[i].hue = Math.random();
							this._cellsMatrix[i].sat = 0.0;
							this._cellsMatrix[i].lum = Math.random();
							this._cellsMatrix[i].age = 0;
							this._cellsMatrix[i].material.emissive.setHSL(this._cellsMatrix[i].hue, this._cellsMatrix[i].sat, this._cellsMatrix[i].lum)
						}
					}
				}

				setSeed(seed) {
					this._currentSeed = seed
				}

				/*
				00 01 02 03 04 05 06 07
				08 09 10 11 12 13 14 15
				16 17 18 19 20 21 22 23
				24 25 26 27 28 29 30 31
				this._gridDimension
				*/
				
				applySeed() {
					if (this._currentSeed) {
						if (!this._playingSeed) {
							this._playingSeed = this._currentSeed
						}
						//Applies ONE row
						for (let i = this._rowNumber; i < (this._rowNumber+this._gridDimension); i=i+4) {
							//inner loop A: 4 part loop for each row
							let blockCount = 0					
							for (let j = 0; j < 4; j++) {
								//inner loop B: 4 part loop for each cell in a row
								for (let k = 0; k < 4; k++) {
									let currentIndex = (i+(j*this._gridDimension))+k
									if (this._applyToggle) {
										//Only apply every other time so not so hectic
										this._cellsMatrix[currentIndex].hue = Math.random()
										this._cellsMatrix[currentIndex].sat = 0.0
										if (this._playingSeed.matrix[blockCount] == "1") {
											this._cellsMatrix[currentIndex].lum = this.randomRange(0.10,1.0)
										}
										else {
											this._cellsMatrix[currentIndex].lum = 0.0
										}
										this._cellsMatrix[currentIndex].age = 0
										this._cellsMatrix[currentIndex].material.emissive.setHSL(this._cellsMatrix[currentIndex].hue, this._cellsMatrix[currentIndex].sat, this._cellsMatrix[currentIndex].lum)
									}
									blockCount++
								}
							}	
						}		
						this._rowNumber = this._rowNumber+(this._gridDimension*4)
						if (this._rowNumber == this._cellsMatrix.length) {
							this._rowNumber = 0
							if (this._applyToggle == true) {
								this._applyToggle = false
							}
							else {
								this._applyToggle = true
							}
							this._playingSeed = this._currentSeed
							console.log(`Current seed is: ${this._playingSeed.name} ${this._playingSeed.matrix}`)
						}	
					}
					/*				
					if (this._blockCount == 16) {
						this._blockCount = 0
					}					
					this._blockNumber = this._blockNumber + 4
					console.log(`Row number is: ${this._rowNumber}`)
					if (this._blockNumber == (this._rowNumber+this._gridDimension)) {
						this._rowNumber = this._rowNumber+(this._gridDimension*4)
						this._blockNumber = this._rowNumber
						if (this._rowNumber == this._cellsMatrix.length) {
							this._rowNumber = 0
							this._playingSeed = this._currentSeed
						}
					}
					*/
				}					

					//this._currentSeed;	
					//this._playingSeed;
					//this._blockNumber = 0;
					/*
					for (let h = 0; h < this._cellsMatrix.length; h=h+(this._gridDimension*4) ) {
						for (let i = h; i < (h+this._gridDimension); i=i+4) {
							//inner loop A: 4 part loop for each row
							let blockCount = 0
							for (let j = 0; j < 4; j++) {
								//inner loop B: 4 part loop for each cell in a row
								for (let k = 0; k < 4; k++) {
									//console.log(`blockCount is: ${blockCount}`)
									//console.log(`seed digit is: ${this._currentSeed.matrix[blockCount]}`)
									//each cell: matrix definition
									//but for now, each cell gets a seperate hue (in steps of .0625)
									//just to see what's going on
									let currentIndex = (i+(j*this._gridDimension))+k
									//console.log(`Current index is ${currentIndex}`)
									this._cellsMatrix[currentIndex].hue = Math.random()
									this._cellsMatrix[currentIndex].sat = 0.0
									if (this._playingSeed.matrix[blockCount] == "1") {
										this._cellsMatrix[currentIndex].lum = this.randomRange(0.5,1.0)
									}
									else {
										this._cellsMatrix[currentIndex].lum = 0.0
									}
									this._cellsMatrix[currentIndex].age = 0
									this._cellsMatrix[currentIndex].material.emissive.setHSL(this._cellsMatrix[i].hue, this._cellsMatrix[i].sat, this._cellsMatrix[i].lum)
									blockCount++
								}
							}
						}
						this._playingSeed = this._currentSeed
						//console.log("------")
						*/


				/*
				setGeo(materials) {
					//This should be a map() (?)
					//This should basically go away once you store the actual material objects in the cell classes
					//So don't worry about referencing global vars for now
					for (let i = 0; i < this._cellsMatrix.length; i++) {
						this._cellsMatrix[i].material.emissive.setHSL(this._cellsMatrix[i].hue, this._cellsMatrix[i].sat, this._cellsMatrix[i].lum)
					}
				}
				*/

				minMax(val) {
					if (val < 0) {
						return 0
					}
					else if (val > (this._cellsMatrix.length - 1)){
						return (this._cellsMatrix.length - 1)
					}
					else {
						return val
					}
				}

				randomRange(min,max) {
					return Math.random() * (max - min) + min;
				}

				ageCells() {
					//Stamp a seed
					this.applySeed()

					//Updates cell ages for all active cells and dims their luminosity
					//Also checks for neighbors to evolve system
					//Should be map

					//find # neighbors who have lum over a certian cutoff, update neighbors field in cell (need to add)
					//grid counting starts at the BOTTOM and counts from LEFT to RIGHT
					
					for (let i = 0; i < this._cellsMatrix.length; i++) {
						this._cellsMatrix[i]._neighbors = 0;
						//North (i-dimension)
						if (this._cellsMatrix[this.minMax(i-this._gridDimension)]._lum > this._lumCutoff) {
							this._cellsMatrix[i]._neighbors++
						}
						//North West (i-(dimension-1))
						if ( (this._cellsMatrix[this.minMax(i-(this._gridDimension-1))]._lum > this._lumCutoff) && !this._edges.rightRow.includes(i) ) {
							this._cellsMatrix[i]._neighbors++
						}	
						//West (i+1)
						if ((this._cellsMatrix[this.minMax(i+1)]._lum > this._lumCutoff) && !this._edges.rightRow.includes(i) ) {
							this._cellsMatrix[i]._neighbors++
						}		
						//South West (i+(dimension+1))
						if ((this._cellsMatrix[this.minMax(i+(this._gridDimension+1))]._lum > this._lumCutoff) && !this._edges.rightRow.includes(i) ) {
							this._cellsMatrix[i].neighbors++
						}			
						//South (i+dimension)
						if (this._cellsMatrix[this.minMax(i+this._gridDimension)]._lum > this._lumCutoff) {
							this._cellsMatrix[i]._neighbors++
						}
						//South East (i+(dimension-1))
						if ((this._cellsMatrix[this.minMax(i+(this._gridDimension-1))]._lum > this._lumCutoff) && !this._edges.leftRow.includes(i) ) {
							this._cellsMatrix[i]._neighbors++
						}	
						//East (i-1)
						if ((this._cellsMatrix[this.minMax(i-1)]._lum > this._lumCutoff) && !this._edges.leftRow.includes(i) ) {
							this._cellsMatrix[i]._neighbors++
						}	
						//North East (i-(dimension+1))
						if ((this._cellsMatrix[this.minMax(i-(this.gridDimension+1))]._lum > this._lumCutoff) && !this._edges.leftRow.includes(i) ) {
							this._cellsMatrix[i]._neighbors++
						}
						//console.log(`Cell ${i} has ${this._cellsMatrix[i].neighbors} neighbors.`);
						//debugger;	
						//console.log(this._cellsMatrix[i].neighbors);						
					}

					//update cells based on # of neighbors, rules, age				
					for (let i = 0; i < this._cellsMatrix.length; i++) {
						//Normal aging
						this._cellsMatrix[i].age++;
						if (this._cellsMatrix[i].lum > 0) {
							this._cellsMatrix[i].lum -= (1.0 / this._cellLife)
						}
						//Turn on/off according to neighbor count/rules
						//If a cell is on,  and has three or more neighbors, it turns off
						//If a cell is off, and has no neighbors,            it turns on 
						if ((this._cellsMatrix[i].neighbors == 0)){
							this._cellsMatrix[i].lum = this._cellsMatrix[i].lum / 2;
							//this._cellsMatrix[i].age = 0;
						}
						else if ( (this._cellsMatrix[i].neighbors == 4) && (this._cellsMatrix[i].lum > 0.1) ){
							this._cellsMatrix[i].lum = this.randomRange(0.15,0.65);
						}	
						else if ((this._cellsMatrix[i].neighbors == 2) || (this._cellsMatrix[i].neighbors == 2)) {
							//console.log("More than one neighbor.");
							this._cellsMatrix[i].hue = this.randomRange(0.67,0.88);
							this._cellsMatrix[i].sat = 1.0;
							this._cellsMatrix[i].lum = this.randomRange(0.15,0.65);
							this._cellsMatrix[i].age = 0;
						}
						this._cellsMatrix[i].material.emissive.setHSL(this._cellsMatrix[i].hue, this._cellsMatrix[i].sat, this._cellsMatrix[i].lum);					
					}
					
				}
																	
				/*
				evolveCells() {
					//If a cell is on,  and has three or more neighbors, it turns off
					//If a cell is off, and has no neighbors,            it turns on 

					
						0  1  2  3
						4  5  6  7
						8  9  10 11
						12 13 14 15

						0  1  2  3  4
						5  6  7  8  9
						10 11 12 13 14
						15 16 17 18 19
						20 21 22 23 24
					

					let neighborsMatrix = [];

					for (let i = 0; i < 16; i++) {
						//Get number of neighbors for this cell
						let neighbors = 0;
						//North (i-dimension)
						if (this._cellsMatrix[i-4] == 1) {
							neighbors++
						}
						//North West (i-(dimension-1))
						if ( (this._cellsMatrix[i-3] == 1) && !rightRow.includes(i) ) {
							neighbors++
						}	
						//West (i+1)
						if ((this._cellsMatrix[i+1] == 1) && !rightRow.includes(i) ) {
							neighbors++
						}		
						//South West (i+(dimension+1))
						if ((this._cellsMatrix[i+5] == 1) && !rightRow.includes(i) ) {
							neighbors++
						}			
						//South (i+dimension)
						if (this._cellsMatrix[i+4] == 1) {
							neighbors++
						}
						//South East (i+(dimension-1))
						if ((this._cellsMatrix[i+3] == 1) && !leftRow.includes(i) ) {
							neighbors++
						}	
						//East (i-1)
						if ((this._cellsMatrix[i-1] == 1) && !leftRow.includes(i) ) {
							neighbors++
						}	
						//North East (i-(dimension+1))
						if ((this._cellsMatrix[i-5] == 1) && !leftRow.includes(i) ) {
							neighbors++
						}	

						neighborsMatrix[i] = neighbors																														
					}

					for (let i = 0; i < 16; i++) {
						//Update matrix
						if ((this._cellsMatrix[i] == 1) && (neighborsMatrix[i] > 2)) {
							this._cellsMatrix[i] = 0
						}	
						if ((this._cellsMatrix[i] == 0) && (neighborsMatrix[i] == 0)) {
							this._cellsMatrix[i] = 1
						}
					}
				}	
				*/

				get gridDimension() {
    				return this._gridDimension;
  				}		
				set gridDimension(newGridDimension) {
    				this._gridDimension = newGridDimension;
 				}
				get cellDimension() {
    				return this._cellDimension;
  				}		
				set cellDimension(newCellDimension) {
    				this._cellDimension = newCellDimension;
 				}		
				get cellDepth() {
    				return this._cellDepth;
  				}		
				set cellDepth(newCellDepth) {
    				this._cellDepth = newCellDepth;
 				}				 	
				get cellLife() {
    				return this._cellLife;
  				}		
				set cellLife(newCellLife) {
    				this._cellLife = newCellLife;
				}	
				get currentSeed() {
					return this._currentSeed;
				}	
				set currentSeed(newCurrentSeed) {
    				this._currentSeed = newCurrentSeed;
				}
				get playingSeed() {
					return this._playingSeed;
				}	
				set playingSeed(newPlayingSeed) {
    				this._playingSeed = newPlayingSeed;
				}	
				get rowNumber() {
					return this._rowNumber;
				}	
				set rowNumber(newRowNumber) {
    				this._rowNumber = newRowNumber;
				}																						 
			}

			CellEcosystem.cellEcosystem;

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.set( 0, 800, 0 );
				camera.up = new THREE.Vector3(-0.5,0,-0.5);
				camera.lookAt(new THREE.Vector3(0,0,0));
				
				scene = new THREE.Scene();

				CellEcosystem.cellEcosystem = new CellEcosystem(48,15,2,100); //Dimension should be multiple of 4
				//constructor(gridDimension,cellDimension,cellDepth,cellLife)				

				/*
				// Materials (this needs to be moved into the class - and the materials array)
				for (let i = 0; i < (cellEcosystem.gridDimension ** 2); i++) {
					materials.push( new THREE.MeshLambertMaterial( { color: 0x202020 } ) )
				}

				// Geometry (this should also be in the class, as it deals with the cells)
				let geometry = new THREE.CylinderGeometry( cellEcosystem.cellDepth, cellEcosystem.cellDepth, cellEcosystem.cellDepth, 16 );
                //let geometry = new THREE.BoxGeometry(tileDimension,tileDepth,tileDimension);

				// Also should be in the class
				for ( let i = 0, l = materials.length; i < l; i ++ ) {
					addMesh(geometry, materials[i],cellEcosystem); //addMesh should be a class method
				}
				*/

				// Grid
				/*
				var helper = new THREE.GridHelper( 1000, 75, 0x101010, 0x101010 );
				helper.position.y = - 75;
				scene.add( helper );
				*/

				// Lights
				scene.add( new THREE.AmbientLight( 0x111111 ) );

				let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.125 );

				directionalLight.position.x = Math.random() - 0.5;
				directionalLight.position.y = Math.random() - 0.5;
				directionalLight.position.z = Math.random() - 0.5;
				directionalLight.position.normalize();

				scene.add( directionalLight );

				pointLight = new THREE.PointLight( 0xffffff, 1 );
				scene.add( pointLight );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				let renderScene = new RenderPass( scene, camera );

				let bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = params.bloomThreshold;
				bloomPass.strength = params.bloomStrength;
				bloomPass.radius = params.bloomRadius;

				composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );				
				var gui = new GUI();

				gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

					bloomPass.threshold = Number( value );

				} );

				gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

					bloomPass.strength = Number( value );

				} );

				gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

					bloomPass.radius = Number( value );

				} );		

				//
				stats = new Stats();
				container.appendChild( stats.dom );

				//
				window.addEventListener( 'resize', onWindowResize, false );

				//return cellEcosystem;

			}

			function addMesh(geometry, material, cellEcosystem) {
				let mesh = new THREE.Mesh( geometry, material );

				mesh.position.x = ( objects.length % cellEcosystem.gridDimension ) * (cellEcosystem.cellDimension*1.1) - 280;
				mesh.position.z = Math.floor( objects.length / cellEcosystem.gridDimension ) * (cellEcosystem.cellDimension*1.1) - 280;
				
				//mesh.rotation.x = 45;
				//mesh.rotation.y = 90;
				//mesh.rotation.z = 45;

				objects.push( mesh );

				scene.add( mesh );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			//

			function animate() {

				requestAnimationFrame( animate );

				//why do these have to be called as a global to work?
				//if class is passed in - gives this error:
				//Uncaught TypeError: cellEcosystem.ageCells is not a function
				//debugger;
				//CellEcosystem.cellEcosystem.ageCells();
				render();
				stats.update();
				composer.render();				

			}

			function render() {

				let timer = 0.0001 * Date.now();


				pointLight.position.x = Math.sin( timer * 7 ) * 300;
				pointLight.position.y = 100;
				pointLight.position.z = Math.cos( timer * 3 ) * 300;

				renderer.render( scene, camera );

			}

			//These are keyboard commands for testing
			document.addEventListener('keydown', function(event) {
				if (event.code == 'KeyA') {
					CellEcosystem.cellEcosystem.ageCells();
				}
				if (event.code == 'KeyR') {
					CellEcosystem.cellEcosystem.randomColor(0.75);
				}	
				if (event.code == 'KeyS') {
					CellEcosystem.cellEcosystem.applySeed()
				}							
			});	

			//Timed actions
			//let pulseVar = setInterval(bpmPulse, 750); //Interval to add seed	
			let ageVar = setInterval(ageInt, 42); //Interval to age ceels - roughly 24 FPS
			let playlistVar = setInterval(playlistFetch, 10000); //Interval to fetch new seed

			function bpmPulse() {
				CellEcosystem.cellEcosystem.randomColor(0.75);
			}	

			function ageInt() {
				CellEcosystem.cellEcosystem.ageCells();
			}	
			
			function playlistFetch() {		
				
				fetch(endPoint+"playlists", {
					method: 'GET',
					//headers: {
					//  Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
					//}
				  })
				  .then(response => response.json())
				  .then(json => {
					//Put first seed info into cell ecosystem's current seed var
					const firstSeed = json.playlist.data[0].attributes.seed
					
					let newSeed = new Seed(
						firstSeed.id, 
						firstSeed.name, 
						firstSeed.matrix, 
						firstSeed.user_id
						)
					CellEcosystem.cellEcosystem.setSeed(newSeed)

					//Set playlist.now_playing = seed_id (needs new route) (also destroys seed from playlist)
					nowplayingFetch(json.playlist.data[0].id)
					
				  })				
			}

			function nowplayingFetch(id) {		

				const bodyData = {playlist: { id } }
			  
				fetch(endPoint+"nowplaying", {
				  method: "POST",
				  headers: {
					"Content-Type": "application/json",
				  },
				  body: JSON.stringify(bodyData)
				})
				.then(response => response.json())
				.then(json => {
					//console.log(json)
				})
			}			
			
			
			init();
			animate();							
		
