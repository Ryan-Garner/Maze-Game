let maze = []

let moveCodes = [87, 73, 38, 65, 74, 37, 83, 75, 40, 68, 76, 39]

let mazeCreated = false

let drawBread = false

let drawPath = false

let drawHint = false

let size = 5

prevtime = performance.now()

let visited = []

let inputStage = {}

let currPath = []


function newFive(){
    mazeCreated = false
    currPath = []
    maze = []
    visited = []
    mazegame.time = 0
    mazegame.score = 0
    mazegame.endgame = false
    mazegame.highScoreUpdated = false
    mazegame.drawScore = false
    size = 5
}

function newTen(){
    mazeCreated = false
    maze = []
    currPath = []
    visited = []
    mazegame.time = 0
    mazegame.score = 0
    mazegame.endgame = false
    mazegame.highScoreUpdated = false
    mazegame.drawScore = false
    size = 10
}

function newFifteen(){
    mazeCreated = false
    maze = []
    currPath = []
    visited = []
    mazegame.time = 0
    mazegame.score = 0
    mazegame.endgame = false
    mazegame.highScoreUpdated = false
    mazegame.drawScore = false
    size = 15
}

function newTwenty(){
    
    mazeCreated = false
    maze = []
    currPath = []
    visited = []
    mazegame.time = 0
    mazegame.score = 0
    mazegame.endgame = false
    mazegame.highScoreUpdated = false
    mazegame.drawScore = false
    size = 20
}

let imgFloor = new Image()
imgFloor.isReady = false
imgFloor.onload = function() {
	this.isReady = true
};
imgFloor.src = 'grass.png'

let imgSmile = new Image()
imgSmile.isReady = false
imgSmile.onload = function() {
	this.isReady = true
};
imgSmile.src = 'smile.png'

let imgFinish = new Image()
imgFinish.isReady = false
imgFinish.onload = function() {
	this.isReady = true
};
imgFinish.src = 'finish.png'

let imgStart = new Image()
imgStart.isReady = false
imgStart.onload = function() {
	this.isReady = true
};
imgStart.src = 'start.png'

let imgBread = new Image()
imgBread.isReady = false
imgBread.onload = function() {
	this.isReady = true
};
imgBread.src = 'breadcrumb.png'

let imgHelp = new Image()
imgHelp.isReady = false
imgHelp.onload = function() {
	this.isReady = true
};
imgHelp.src = 'help.png'

function Queue(){
    this._firstIndex = 1
    this._lastIndex = 1
    this._storage = {}
}

Queue.prototype.size = function(){
    return this._lastIndex - this._firstIndex
}

Queue.prototype.enqueue = function(data){
    this._storage[this._lastIndex] = data
    this._lastIndex++
}

Queue.prototype.dequeue = function(){
    var firstIndex = this._firstIndex,
        lastIndex = this._lastIndex,
        deletedData
    if(firstIndex !== lastIndex){
        deletedData = this._storage[firstIndex]
        delete this._storage[firstIndex]
        this._firstIndex++

        return deletedData
    }
    
}

var mazegame = {
    // add maze cells to maze
    
    time: 0,
    score: 0,
    drawScore: false,
    endgame: false,
    moved: false,
    originalPath: [],
    highScoreUpdated: false,
    highScores: {
        one: 10,
        two: 7,
        three: 5,
        four: 2,
        five: 1
    },

    createcells: function(maze, size){
        for (let row = 0; row < size; row++) {
	        maze.push([])
	        for (let col = 0; col < size; col++) {
		        maze[row].push({
			        x: col, y: row, parent: null, edges: {
				        n: null,
				        s: null,
				        w: null,
				        e: null
			        }
		        })
	        }
        }
    },

    setPath: function(cell, frontierCell){
        
        if(cell.x > frontierCell.x){
            cell.edges.w = frontierCell
            frontierCell.edges.e = cell
        }
        if(cell.x < frontierCell.x){
            cell.edges.e = frontierCell
            frontierCell.edges.w = cell
        }
        if(cell.y > frontierCell.y){
            cell.edges.n = frontierCell
            frontierCell.edges.s = cell
        }
        if(cell.y < frontierCell.y){
            cell.edges.s = frontierCell
            frontierCell.edges.n = cell
        }
    },

    getNeighbors: function(frontierCell, inMaze){
        var n = []
        if(frontierCell.x-1 >= 0 && inMaze.indexOf(maze[frontierCell.y][frontierCell.x-1]) != -1){
            n.push(maze[frontierCell.y][frontierCell.x-1])
        }
        if(frontierCell.x+1 < maze.length && inMaze.indexOf(maze[frontierCell.y][frontierCell.x+1]) != -1){
            n.push(maze[frontierCell.y][frontierCell.x+1])
        }
        if(frontierCell.y-1 >= 0 && inMaze.indexOf(maze[frontierCell.y-1][frontierCell.x]) != -1){
            n.push(maze[frontierCell.y-1][frontierCell.x])
        }
        if(frontierCell.y+1 < maze.length && inMaze.indexOf(maze[frontierCell.y+1][frontierCell.x]) != -1){
            n.push(maze[frontierCell.y+1][frontierCell.x])
        }
        return n
    },

    updateFrontier: function(x, y, frontier, inMaze){
        if(x>=0 && x < maze.length && y >= 0 && y < maze.length){
            if(frontier.indexOf(maze[y][x]) == -1 && inMaze.indexOf(maze[y][x]) == -1){
                frontier.push(maze[y][x])
            }
        }
    },

    addCell: function(frontier, inMaze, mazeCell){
        inMaze.push(mazeCell)
        mazegame.updateFrontier(mazeCell.x-1, mazeCell.y, frontier, inMaze)
        mazegame.updateFrontier(mazeCell.x+1, mazeCell.y, frontier, inMaze)
        mazegame.updateFrontier(mazeCell.x, mazeCell.y-1, frontier, inMaze)
        mazegame.updateFrontier(mazeCell.x, mazeCell.y+1, frontier, inMaze)
    },

    // using a modified prims algorithm to generate a random maze
    primGeneration: function(maze){
        var inMaze = []
        var frontier = []
        var num
        var frontierCell
        var cell
        var temp
        var mazeCell = maze[0][0]
        mazegame.addCell(frontier, inMaze, mazeCell)
        while(frontier.length != 0){
             num = Math.floor(Math.random()*frontier.length)
             frontierCell = frontier[num]
        
             n = mazegame.getNeighbors(frontierCell, inMaze)
             
             num1 = Math.floor(Math.random()*n.length)
             
             cell = n[num1]
             
             mazegame.setPath(cell, frontierCell)
             frontier.splice(num, 1)
             mazegame.addCell(frontier, inMaze, frontierCell)
        }
    },

    createCharacter: function(imgSrc, cell){
        let image = new Image();
	    image.isReady = false;
	    image.onload = function() {
		    this.isReady = true;
	    };
	    image.src = imgSrc;
	    return {
		    location: cell,
		    image: image
	    };
    },
    // draw the walls to the canvas
    drawCell: function(cell, size){

        if (imgFloor.isReady) {
		    context.drawImage(imgFloor,
		    cell.x * (1000 / size), cell.y * (1000 / size),
		    1000 / size, 1000 / size);
	    }

        if(imgStart.isReady){
		        context.drawImage(imgStart,
		        maze[0][0].x * (1000 / size), maze[0][0].y * (1000 / size), 1000/(size), 1000/(size));
        }

        if(imgFinish.isReady){
		        context.drawImage(imgFinish,
		        maze[maze.length-1][maze.length-1].x * (1000 / size), maze[maze.length-1][maze.length-1].y * (1000 / size), 1000/(size), 1000/(size));
        }

        if (cell.edges.n === null) {
		    context.moveTo(cell.x * (1000 / size), cell.y * (1000 / size));
		    context.lineTo((cell.x + 1) * (1000 / size), cell.y * (1000 / size));
	    }

        if (cell.edges.s === null) {
            context.moveTo(cell.x * (1000 / size), (cell.y + 1) * (1000 / size));
            context.lineTo((cell.x + 1) * (1000 / size), (cell.y + 1) * (1000 / size));
            
        }

        if (cell.edges.e === null) {
            context.moveTo((cell.x + 1) * (1000 / size), cell.y * (1000 / size));
            context.lineTo((cell.x + 1) * (1000 / size), (cell.y + 1) * (1000 / size));
            
        }

        if (cell.edges.w === null) {
            context.moveTo(cell.x * (1000 / size), cell.y * (1000 / size));
            context.lineTo(cell.x * (1000 / size), (cell.y + 1) * (1000 / size));
        }

         
    },

    drawSP: function(currPath, myCharacter, size){
        for(var i = 1; i < currPath.length; i++){
            if(imgSmile.isReady){
		        context.drawImage(imgSmile,
		        currPath[i].x * (1000 / size), currPath[i].y * (1000 / size), 1000/(size), 1000/(size));
            }
        }

	    

    },

    drawBread: function(visited, size){
        for(var i = 1; i < visited.length; i++){
            if(imgBread.isReady){
		        context.drawImage(imgBread,
		        visited[i].x * (1000 / size), visited[i].y * (1000 / size), 1000/(size), 1000/(size));
            }
        }
    },

    drawHint: function(){
        if(currPath.length > 0){
            if(imgHelp.isReady){
                    context.drawImage(imgHelp,
                    currPath[currPath.length-1].x * (1000 / size), currPath[currPath.length-1].y * (1000 / size), 1000/(size), 1000/(size));
            }
        }else{
            drawHint = false
        }
    },

    moveCharacter: function(input, myCharacter){
        var oldLoc = myCharacter.location
        
        if(input === 87 || input === 73 || input === 38){
            if(myCharacter.location.edges.n !== null){
                if(visited.indexOf(myCharacter.location)){
                    visited.push(myCharacter.location)
                }
                myCharacter.location = myCharacter.location.edges.n
                mazegame.moved = true
            } 
        }
        if(input === 83 || input === 75 || input === 40){
            if(myCharacter.location.edges.s !== null){
                if(visited.indexOf(myCharacter.location)){
                    visited.push(myCharacter.location)
                }
                
                myCharacter.location = myCharacter.location.edges.s
                mazegame.moved = true
            }
        }
        if(input === 65 || input === 74 || input === 37){
            if(myCharacter.location.edges.w !== null){
                if(visited.indexOf(myCharacter.location)){
                    visited.push(myCharacter.location)
                }
                
                myCharacter.location = myCharacter.location.edges.w
                mazegame.moved = true
            }
        }
        if(input === 68 || input === 76 || input === 39){
            if(myCharacter.location.edges.e !== null){
                if(visited.indexOf(myCharacter.location)){
                    visited.push(myCharacter.location)
                }
                
                myCharacter.location = myCharacter.location.edges.e
                mazegame.moved = true
            }
        }
        
        
        if(currPath.indexOf(myCharacter.location) !== -1){
            
            currPath.pop()
        }else if(currPath.indexOf(myCharacter.location.edges.w) !== -1){
            if(oldLoc !== myCharacter.location){
            
            }
            currPath.splice(currPath.indexOf(myCharacter.location.edges.w)+1, currPath.length - currPath.indexOf(myCharacter.location.edges.w)+1)
        }else if(currPath.indexOf(myCharacter.location.edges.e) !== -1){
            if(oldLoc !== myCharacter.location){
            
            }
            currPath.splice(currPath.indexOf(myCharacter.location.edges.e)+1, currPath.length - currPath.indexOf(myCharacter.location.edges.e)+1)
        }else if(currPath.indexOf(myCharacter.location.edges.n) !== -1){
            if(oldLoc !== myCharacter.location){
            
            }
            currPath.splice(currPath.indexOf(myCharacter.location.edges.n)+1, currPath.length - currPath.indexOf(myCharacter.location.edges.n)+1)
        }else if(currPath.indexOf(myCharacter.location.edges.s) !== -1){
            if(oldLoc !== myCharacter.location){
            
            }
            currPath.splice(currPath.indexOf(myCharacter.location.edges.s)+1, currPath.length - currPath.indexOf(myCharacter.location.edges.s)+1)
        }else{
            if(oldLoc !== myCharacter.location){
                
            }
            currPath.push(oldLoc)
        }
        mazegame.updateScore(mycharacter)
        
    },

    initializePath: function(cell, maze){
        var end = mazegame.bfs(cell, maze)
        currPath.push(end)
        var next = end.parent
        while(next !== cell){
            currPath.push(next)
            next = next.parent
        }
        for(i in currPath){
            mazegame.originalPath.push(currPath[i])
        }
    },

    updateScore: function(myCharacter){
        if(!mazegame.endgame){
            if(mazegame.moved){
                if(mazegame.originalPath.indexOf(myCharacter.location) !== -1){
                    mazegame.score += 5
                    mazegame.originalPath.pop()
                    mazegame.moved = false
                // }else if(currPath.indexOf() !== -1){
                //     mazegame.score += -1
                //     mazegame.moved = false
                }else{
                    mazegame.score += -2
                    mazegame.moved = false
                }
            }
        }

    },

    updateHighScore: function(){
        if(mazegame.score > mazegame.highScores.one){
            mazegame.highScores.five = mazegame.highScores.four
            mazegame.highScores.four = mazegame.highScores.three
            mazegame.highScores.three = mazegame.highScores.two
            mazegame.highScores.two = mazegame.highScores.one
            mazegame.highScores.one = mazegame.score
        }else if(mazegame.score > mazegame.highScores.two){
            mazegame.highScores.five = mazegame.highScores.four
            mazegame.highScores.four = mazegame.highScores.three
            mazegame.highScores.three = mazegame.highScores.two
            mazegame.highScores.two = mazegame.score
        }else if(mazegame.score > mazegame.highScores.three){
            mazegame.highScores.five = mazegame.highScores.four
            mazegame.highScores.four = mazegame.highScores.three
            mazegame.highScores.three = mazegame.score
        }else if(mazegame.score > mazegame.highScores.four){
            mazegame.highScores.five = mazegame.highScores.four
            mazegame.highScores.four = mazegame.score
        }else if(mazegame.score > mazegame.highScores.five){
            mazegame.highScores.five = mazegame.score
        }
        mazegame.highScoreUpdated = true
    },
    //Breadth first search, find the shortest path to the finish cell
    bfs: function(cell, maze){
        var s = []
        var q = new Queue()
        var current
        var temp

        cell.parent = null
        q.enqueue(cell)
        s.push(cell)

        while(q.size() !== 0){
            current = q.dequeue()
            if(current === maze[maze.length-1][maze.length-1]){
                return current
            }
            if(current.edges.n !== null){
                if(s.indexOf(current.edges.n) === -1){
                    temp = current.edges.n
                    s.push(current.edges.n)
                    current.edges.n.parent = current
                    q.enqueue(current.edges.n)
                }
            }
            if(current.edges.s !== null){
                if(s.indexOf(current.edges.s) === -1){
                    temp = current.edges.s
                    s.push(current.edges.s)
                    current.edges.s.parent = current
                    q.enqueue(current.edges.s)
                }
            }
            if(current.edges.e !== null){
                if(s.indexOf(current.edges.e) === -1){
                    temp = current.edges.e
                    s.push(current.edges.e)
                    current.edges.e.parent = current
                    q.enqueue(current.edges.e)
                }
            }
            if(current.edges.w !== null){
                if(s.indexOf(current.edges.w) === -1){
                    temp = current.edges.w
                    s.push(current.edges.w)
                    current.edges.w.parent = current
                    q.enqueue(current.edges.w)
                }
            }
        }
    }

}


function createMaze(size){
    mazegame.createcells(maze, size)
}

function renderCharacter(myCharacter, size){
    if (myCharacter.image.isReady) {
		context.drawImage(myCharacter.image,
		myCharacter.location.x * (1000 / size), myCharacter.location.y * (1000 / size), 1000/(size), 1000/(size));
	}
}

function renderMaze(size) {
    
	context.strokeStyle = 'rgb(0, 0, 0)'
	context.lineWidth = 8

    context.beginPath()
	for (let row = 0; row < size; row++) {
		for (let col = 0; col < size; col++) {
			mazegame.drawCell(maze[row][col], size);
		}
	}
    context.stroke()


    if(drawBread){
        mazegame.drawBread(visited, size)
    }
    if(drawPath){
        mazegame.drawSP(currPath, mycharacter, size)
    }
    if(drawHint){
        mazegame.drawHint()
    }
        var oneNode = document.getElementById("one")
        var twoNode = document.getElementById("two")
        var threeNode = document.getElementById("three")
        var fourNode = document.getElementById("four")
        var fiveNode = document.getElementById("fivef")

        oneNode.innerHTML = "1:  " + String(mazegame.highScores.one)
        twoNode.innerHTML = "2:  " + String(mazegame.highScores.two)
        threeNode.innerHTML = "3:  " + String(mazegame.highScores.three)
        fourNode.innerHTML = "4:  " + String(mazegame.highScores.four)
        fiveNode.innerHTML = "5:  " + String(mazegame.highScores.five)
    

	context.beginPath()
	context.moveTo(0, 0)
	context.lineTo(999, 0)
	context.lineTo(999, 999)
	context.lineTo(0, 999)
	context.closePath()
	context.strokeStyle = 'rgb(0, 0, 0)'
	context.stroke()
}

function render(elapsedtime){
        timeNode = document.getElementById("time"),
        scoreNode = document.getElementById("score")
        endNode = document.getElementById("endgame")
        context.clear()
        timeNode.innerHTML = String(mazegame.time.toFixed(2))
        if(mazegame.drawScore){
            scoreNode.innerHTML = String(mazegame.score)
        }else{
            scoreNode.innerHTML = ""
        }
        if(mazegame.endgame){
            endNode.innerHTML = "Game Over, Please start a new game."
        }else{
            endNode.innerHTML = ""
        }
        renderMaze(size);
        renderCharacter(mycharacter, size)   
}

function update(elapsedtime){
    endNode = document.getElementById("endgame")
    if(mazeCreated === false){
        createMaze(size)
        mazeCreated = true
        mazegame.primGeneration(maze)
        //mazegame.bfs(maze[0][0], maze)
        mazegame.initializePath(maze[0][0], maze)
        
        mycharacter = mazegame.createCharacter("bat.png", maze[0][0])
        
        
    }
    if(!mazegame.endgame){
        mazegame.time += elapsedtime/1000
    }else if(!mazegame.highScoreUpdated){
        mazegame.updateHighScore()
    }
    if(mycharacter.location === maze[size-1][size-1]){
            mazegame.endgame = true
    }


}

function processInput(){
    if(!mazegame.endgame){
        for(input in inputStage){
            if(moveCodes.indexOf[inputStage[input]] !== -1){
                mazegame.moveCharacter(inputStage[input], mycharacter)
            }
            if(inputStage[input] === 66){
                drawBread = !drawBread
            }
            if(inputStage[input] === 72){
                drawHint = !drawHint
            }
            if(inputStage[input] === 89){
                mazegame.drawScore = !mazegame.drawScore
            }
        }
        inputStage = {}
    }

}

function gameloop() {
    var elapsedtime = performance.now() - prevtime
    processInput()
    update(elapsedtime)
    render(elapsedtime)
    prevtime = performance.now()
    requestAnimationFrame(gameloop)

}

let canvas = null
let context = null
var mycharacter 

function initialize() {
    canvas = document.getElementById("canvas-main")
    context = canvas.getContext('2d')
    
    CanvasRenderingContext2D.prototype.clear = function() {
		this.save()
		this.setTransform(1, 0, 0, 1, 0, 0)
		this.clearRect(0, 0, canvas.width, canvas.height)
		this.restore()
	};

	window.addEventListener('keydown', function(event) {
		if(event.keyCode === 80){
            drawPath = true
        }

		inputStage[event.keyCode] = event.keyCode
	});
    window.addEventListener('keyup', function(event){
        if(event.keyCode === 80){
            drawPath = false
        }
    });

	requestAnimationFrame(gameloop);

}