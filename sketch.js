//Create variables here
var database;
var bedroom,garden,washroom;
var dog, happyDog, database, foodS, foodStock;
var feed, addFood;
var fedTime, lastFed;
var foodObj;
var canvas;
var gameState;

function preload()
{
  //load images here
  dogImg = loadImage("images/dog.png");
  happyDogImg = loadImage("images/happyDog.png");
  bedroom = loadImage("virtual pet images/Bed Room.png");
  garden = loadImage("virtual pet images/Garden.png");
  washroom = loadImage("virtual pet images/Wash Room.png");
}

function setup() {
   database = firebase.database();

   foodStock = database.ref('Food');
   foodStock.on("value",readStock);

   readState = database.ref('gameState');
   readState.on("value",function(data){
     gameState=data.val();
   });

 canvas = createCanvas(450,500);

  foodObj = new Food();

  dog = createSprite(200,400,150,150);
  dog.addImage(dogImg);
  dog.scale = 0.2;

  feed=createButton("Feed the Dog");
  feed.position(500,95);
  feed.mousePressed(feedDog);

  addFood=createButton("Add Food");
  addFood.position(600,95);
  addFood.mousePressed(addFoods);
}


function draw() { 
  background(46, 139, 87); 
  
  foodObj.display();

  fill(255,255,254);
  textSize(15);
  if(lastFed>=12)
  {
    text("Last Fed: "+lastFed%12 + "PM", 200,30);
  }else if(lastFed==0){
    text("Last Fed : 12 AM", 200,30)
  }

  if(gameState!="Hungry"){
    feed.hide();
    addFood.hide();
    dog.remove();
  }else{
    feed.show();
    addFood.show();
    dog.addImage(dogImg);
  }

  currentTime=hour();
  if(currentTime==(lastFed+1))
  {
    update("Playing");
    foodObj.garden();
  }else if(currentTime==(lastFed+2)){
    update("Sleeping");
    foodObj.bedroom();
  }else if(currentTime>(lastFed+2)&&currentTime<=(lastFed+4)){
    update("Bathing");
    foodObj.washroom();
  }else{
    update("Hungry");
    foodObj.display();
  }

  fedTime=database.ref('FeedTime');
  fedTime.on("value",function(data){
    lastFed=data.val();
  });

  drawSprites();
}

function readStock(data){
  foodS=data.val();
  foodObj.updateFoodStock(foodS);
}

function writeStock(x){

  if(x<=0){
    x=0;
  }else{
    x=x-1;
  }

  database.ref('/').update({
    Food:x
  })
}

function feedDog()
{
  dog.addImage(happyDogImg);

  foodObj.updateFoodStock(foodObj.getFoodStock()-1);
  database.ref('/').update({
    Food:foodObj.getFoodStock(),
    FeedTime: hour()
  });
}

function addFoods()
{
  foodS++;
  database.ref('/').update({
    Food: foodS
  });

}

function update(state){
  database.ref('/').update({
    gameState: state
  });
}