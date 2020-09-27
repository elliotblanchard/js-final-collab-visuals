//// Project Planning

// MVP User Story
Live music has been especially hard hit during the coronavirus pandemic. With most performance venues closed, DJs and musicians have turned to virtual concerts https://www.billboard.com/articles/columns/pop/9335531/coronavirus-quarantine-music-events-online-streams 

But virtual concerns lack the energy and intimacy between crowd and performers that a live event delivers. And it can be a letdown to trade the club experience for a Zoom feed of a performer's living room. 

Collab-visuals builds on my background in animation and concert visuals https://invisiblelightnetwork.com/ to make the virtual concert more collaborative, more fun - and better looking using the THREE.JS visual framework. 

Fans will be able to share visual SEEDS that create unique generative animations for all virtual concert attendees. Fans will be notified when their SEED is about to play on the main screen. 

The VJ will be able to manage the main screen, changing the BPM of the visual SEEDS submitted by Fans and triggering transition visuals. 

// Stetch goals
Give the VJ more capabilities to change the rules driving the generative animation of the SEEDS on the fly. 


// Classes
* A USER has a name and a password. A USER has many SEEDS. Logged in users check the seed queue periodically to see their seed's place in the queue.
* A SEED has a name and a definition matrix. A SEED belongs to a USER. 
* A QUEUE that holds a list of seed to play. Has methods to add to queue?
* A CELL ECOSYSTEM is the main generative matrix that creates the visuals. SEEDS create visuals according to the rules of the CELL ECOSYSTEM. The CELL ECOSYSTEM is a complex class inspired by John Horton Conway's 1970 Game of Life https://en.wikipedia.org/wiki/Conway's_Game_of_Life On it's most fundamental level, the CELL ECOSYSTEM contains and manages a matrix of CELLs to create the visual animations.
* A CELL is an individual generative unit. It contains information on cell state including material, hue, saturation, luminance, age, and number of neighbors. 