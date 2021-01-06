var renderer, scene, camera, pointLight, spotLight

var fieldWidth = 400, fieldHeight = 200

var paddleWidth, paddleHeight, paddleDepth, paddleQuality
var paddleDirY = 0, paddleSpeed = 3

var ball, paddle
var ballDirX = 1, ballDirY = 1, ballSpeed = 2

var score1= 0, score = 0

var maxScore = 7

var difficulty = 0.2

var ballTexture = new THREE.ImageUtils.loadTexture("./img/ball/ball1.jpg")
var paddleTexture = new THREE.ImageUtils.loadTexture("./img/paddle/paddle1.jpg")
//var bubbleMaterial = [0xf6ff9f,0xffce96,0xf78686,0xf739a6,0xc031b5]
var bubbleMaterial = ["red" , "blue","yellow","black"]
var planeColor = 0x00FF00
var bubbleLocation = undefined

var bubbleLimit = 50,ballBurst = 50
var radius = 8
var lives = 3
var pauseGame = false


function setup() {
   
    score1 = 0
    createScene()

    draw()
}

function createScene() {
    var WIDTH = window.innerWidth
    var HEIGHT = window.innerHeight 

    var VIEW_ANGLE = 50
    var ASPECT = WIDTH / HEIGHT
    var NEAR = 0.1
    var FAR = 10000

    var c = document.getElementById("gameCanvas")

    renderer = new THREE.WebGLRenderer()
    camera = new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    )

    scene = new THREE.Scene()

    scene.add(camera)

    camera.position.z = 480
    camera.rotation.z = -Math.PI/2

    renderer.setSize(WIDTH, HEIGHT)

    c.appendChild(renderer.domElement)

    var planetWidth = fieldWidth
    var planetHeight = fieldHeight
    var planeQuality = 10


    var paddleMaterial = new THREE.MeshPhongMaterial({map:paddleTexture})

    var planeMaterial = new THREE.MeshLambertMaterial({
        color: planeColor
    })

    var tableMaterial = new THREE.MeshLambertMaterial({
        color: 0x111111
    })

    var groundMaterial = new THREE.MeshLambertMaterial({
        color: 0x888888
    })

    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(
            planetWidth * 0.95,
            planetHeight,
            planeQuality,
            planeQuality),
            planeMaterial
    )

    scene.add(plane)
    plane.receiveShadow = true

    var table = new THREE.Mesh(
        new THREE.CubeGeometry(
            planetWidth * 1.05,
            planetHeight * 1.03,
            100,
            planeQuality,
            planeQuality,
            1),
            tableMaterial
    )

    table.position.z = -51
    scene.add(table)
    table.receiveShadow = true

    var radius = 5
    var segments = 6
    var rings = 6

     var sphereMaterial = new THREE.MeshPhongMaterial({
        map: ballTexture
    })

    ball = new THREE.Mesh(
        new THREE.SphereGeometry(
            radius,
            segments,
            rings),
            sphereMaterial
    )

    scene.add(ball)

   // ball.material.mesh = THREE.ImageUtils.loadTexture("./img/ball3.jpg");
    ball.position.x = -100
    ball.position.y = 0
    ball.position.z = radius
    ball.receiveShadow = true
    ball.castShadow = true
   // console.log(ball)
    paddleWidth = 10
    paddleHeight = 30
    paddleDepth = 10
    paddleQuality = 1

    paddle = new THREE.Mesh(
        new THREE.CubeGeometry(
            paddleWidth,
            paddleHeight,
            paddleDepth,
            paddleQuality,
            paddleQuality,
            paddleQuality),
            paddleMaterial
    )

   // scene.add(paddle)
    paddle.receiveShadow = true
    paddle.castShadow = true


    addBubbles()
    
    paddle.position.x = -fieldWidth / 2 + paddleWidth
    paddle.position.z = paddleDepth
    
 
    var ground = new THREE.Mesh(
        new THREE.CubeGeometry(
            1000,
            1000,
            3,
            1,
            1,
            1),
            groundMaterial
    )

    ground.position.z = -132
    ground.receiveShadow = true
    scene.add(ground)

    pointLight = new THREE.PointLight(0xF8D898)

    pointLight.position.x = -1000
    pointLight.position.y = 0
    pointLight.position.z = 1000
    pointLight.intensity = 2.9
    pointLight.distance = 10000
    scene.add(pointLight)

    spotLight = new THREE.SpotLight(0xF8D898)
    spotLight.position.set(0, 0, 460)
    spotLight.intensity = 1.5
    spotLight.castShadow = true
    scene.add(spotLight)

    renderer.shadowMapEnabled = true


    addwheels()
  
}

function addwheels()
{

    var wheelRadius = 3.5;
    var wheelThickness = 0.8625;
    var wheelSegments = 10;

    var wheelGeometry = new THREE.CylinderGeometry(
        wheelRadius,     // top radius
        wheelRadius,     // bottom radius
        wheelThickness,  // height of cylinder
        wheelSegments);
    var wheelMaterial = new THREE.MeshPhongMaterial({map:paddleTexture});
    var wheelPositions = [
      [ -paddleHeight/3 ,(paddleWidth) ,  2 ],
      [ paddleHeight/3,-(paddleWidth),  2 ],
      [ paddleHeight/3,(paddleWidth) , 2],
      [ -paddleHeight/3,-(paddleWidth), 2],
     ];
    count=0
    var wheelMeshes = wheelPositions.map((position) => {
      var mesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
      mesh.position.set(...position);
      mesh.rotation.z = Math.PI * .5;
      mesh.castShadow = true;
      mesh.name="wheel"+count
      count+=1
      paddle.add(mesh);
      return mesh;
    });
    scene.add(paddle)
}



function draw() {
    renderer.render(scene, camera)

    requestAnimationFrame(draw)
    playerPaddleMovement()
    paddlePhysics()
    console.log("Pause : ",pauseGame)
    if (pauseGame)
    {
    ballPhysics()
    ballHittingBubbles()
    }
}

var rot=0.1;
function ballPhysics() {
    if(ball.position.x <= -fieldWidth / 2) {
        score--
        document.getElementById("scores").innerHTML = "Scores: "+ score 
        resetBall() 
    }

   
    if(ball.position.y <= -fieldHeight / 2) {
        ballDirY = -ballDirY
    }

    if(ball.position.y >= fieldHeight / 2) {
        ballDirY = -ballDirY
    }
    if(ball.position.x >=fieldWidth/2)
        {
            ballDirX = -ballDirX
            translateBubble()
        }
    ball.position.x += ballDirX * ballSpeed
    ball.position.y += ballDirY * ballSpeed

    if(ballDirY > ballSpeed * 2) {
        ballDirY = ballSpeed * 2
    } else if(ballDirY < -ballSpeed * 2) {
        ballDirY = -ballSpeed * 2
    }

if (rot>100)
    rot=0.01
rot+=0.5
 ball.rotation.y = rot
 ball.rotation.z = rot

//console.log(rot)
}




function playerPaddleMovement() {
    if(Key.isDown(Key.A) || Key.isDown(Key.R)) {
        if(paddle.position.y < fieldHeight * 0.45) {
            paddleDirY = paddleSpeed * 0.5
        } else {
            paddleDirY = 0
            paddle.scale.z += (10 - paddle.scale.z) * 0.2
        }
    pauseGame=true
    } 
    else if(Key.isDown(Key.D) || Key.isDown(Key.L)) {
        if (paddle.position.y > -fieldHeight * 0.45) {
            paddleDirY = -paddleSpeed * 0.5
        } else {
            paddleDirY = 0
            paddle.scale.z += (10 - paddle.scale.z) * 0.2
        }
            pauseGame=true
    }
     else {
        paddleDirY = 0
    }

    paddle.scale.y += (1 - paddle.scale.y) * 0.2
    paddle.scale.z += (1 - paddle.scale.z) * 0.2
    paddle.position.y += paddleDirY


    rotateWheel(paddle)

}


function paddlePhysics() {
    if(ball.position.x <= paddle.position.x + paddleWidth &&
        ball.position.x >= paddle.position.x) {
            if(ball.position.y <= paddle.position.y + paddleHeight / 2 &&
                ball.position.y >= paddle.position.y - paddleHeight / 2) {
                    if(ballDirX < 0) {
                        paddle.scale.y = 15
                        ballDirX = -ballDirX
                        ballDirY = paddleDirY * 0.7
                    }
                }
        }
}

function resetBall() {
    ball.position.x = -fieldWidth/2 + paddleHeight
    ball.position.y = 0

    ballDirY = 1
    paddle.position.x = -fieldWidth / 2 + paddleWidth
    paddle.position.y=0
    pauseGame = false
    lives--
    document.getElementById("lives").innerHTML = "Lives : "+ lives 
    if (lives ==0)
        finishGame()
}




function rotateWheel(paddleObject)
{

    for(s=0;s<4;s++)
    {

        wheelObject = paddleObject.getObjectByName("wheel"+s)
        last_rot = wheelObject.rotation.x
        last_rot+=0.04
        if (last_rot>15)
            last_rot=0
        wheelObject.rotation.x=last_rot;
        }
    return;
}

function addBubbles()
{
 var paddleMaterial = new THREE.MeshLambertMaterial({
        color: bubbleMaterial
    })


    bubbleLocation = Array(bubbleLimit*2)
    movementLimit = fieldHeight-paddleHeight
    //console.log(movementLimit)
    nextLine=0
    for (i=0;i<bubbleLimit*2;i+=2)
    {    
    var bubble = new THREE.Mesh(
              new THREE.SphereGeometry(
                radius,5,6),
                new THREE.MeshLambertMaterial({color:bubbleMaterial[(i/2)%4]})
        )
        bubble.name="Bubble"+i
        if (i%10==0)
            nextLine+=1

        xpos = (Math.random()*180)
        bubble.position.x = xpos
        ypos = (Math.random()*(90))

        if((i/2)%2!=0)
            ypos =-ypos

        bubble.position.y = ypos
        
        bubble.position.z = 0
    
        scene.add(bubble)
        bubbleLocation[i] = xpos
        bubbleLocation[i+1] = ypos

        bubble.receiveShadow = true
        bubble.castShadow = true
    }

}

function ballHittingBubbles()
{

    x = ball.position.x
    y = ball.position.y
    //console.log("ballHittingBubbles")
    for(i=0;i<=(bubbleLimit*2);i+=2)
    {
    if((x<=(bubbleLocation[i]+radius) && x>=(bubbleLocation[i]-radius)   )
            &&
             (y<=(bubbleLocation[i+1]+radius) && y>=(bubbleLocation[i+1]-radius)))
                {
            scene.remove(scene.getObjectByName("Bubble"+i))
            bubbleLocation[i]=-fieldWidth
            bubbleLocation[i+1]=-fieldHeight
            score++
            document.getElementById("scores").innerHTML = "Scores: "+ score 
            ballBurst -=1
            if (ballBurst==0)
                finishGame()
            //console.log(i)
        }

    }
}

function translateBubble()
{

    for (i=0;i<bubbleLimit*2;i+=2)
    {
        if(bubbleLocation[i]!=-fieldWidth && bubbleLocation[i+1]!=-fieldHeight)
        {
                  bubble = scene.getObjectByName("Bubble"+i)
                   
                   /* if (x < (-fieldWidth/2)+paddleWidth)
                        finishGame()
                    */
                    bubble.position.x = bubble.position.x -0.5
                    bubbleLocation[i]=bubbleLocation[i]-0.5
        }
    }

}

function finishGame()
{

    alert("Game Finish, Please Click Restart to Play Again")

    while(scene.children.length > 0){ 
    scene.remove(scene.children[0]);
      document.getElementById("scores").innerHTML = "Scores:0 " 
        document.getElementById("lives").innerHTML = "Lives:0"  
}
   //setup()       
}