// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAjWtpKAuv0yF1lLr5WHJKADMyD0XyzIqY",
  authDomain: "tegelased-7951a.firebaseapp.com",
  databaseURL: "https://tegelased-7951a.firebaseio.com",
  projectId: "tegelased-7951a",
  storageBucket: "tegelased-7951a.appspot.com",
  messagingSenderId: "408125653212",
  appId: "1:408125653212:web:dad17b444f9b530dfeb419"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


class Tegelane {
  constructor(nimi, x, y) {
    this.nimi = nimi;
    this.x = x;
    this.y = y;
  };

  joonistaPea = function() {
    circle(this.x, this.y, 20);
  }

  joonistaKere = function() {
    rect(this.x - 15, this.y + 10, 30, 40);
  }

  joonistaKäed = function() {
    rect(this.x - 25, this.y + 10, 10, 20);
    rect(this.x + 15, this.y + 10, 10, 20);
  }

  joonistaJalad = function() {
    rect(this.x - 15, this.y + 50, 15, 20);
    rect(this.x, this.y + 50, 15, 20);
  }

  joonista = function() {
    this.joonistaPea();
    this.joonistaKere();
    this.joonistaKäed();
    this.joonistaJalad();

    text(this.nimi, this.x, this.y - 15);
  }
}


let minuTegelane;
let minuTegelaseRef;

function init() {
  let minuTegelaseNimi = prompt("Sisesta nimi");
  if (!minuTegelaseNimi) minuTegelaseNimi = "ei taha nime panna" + Math.floor(Math.random() * 100);
  minuTegelane = new Tegelane(minuTegelaseNimi, 640, 360);
  minuTegelaseRef = firebase.database().ref(`tegelased/${minuTegelaseNimi}`);
};
document.addEventListener("DOMContentLoaded", init);


let tegelasedMassiiv = [];
let ajadSurmaniMassiiv = [];
function tegelasedRefresh(snapshot) {
  tegelasedMassiiv.forEach(tegelane => delete tegelane);
  tegelasedMassiiv = [];
  let tegelased = snapshot.val();
  for (tegelaseNimi in tegelased) {
    if (tegelaseNimi == minuTegelane.nimi) {}
    else if (ajadSurmaniMassiiv[tegelaseNimi]) ajadSurmaniMassiiv[tegelaseNimi] -= 1;
    else ajadSurmaniMassiiv[tegelaseNimi] = 2000;

    if (ajadSurmaniMassiiv[tegelaseNimi] < 1) {
      console.log(ajadSurmaniMassiiv);
      firebase.database().ref(`tegelased/${tegelaseNimi}`).set(null);
      continue;
    };

    let tegelane = new Tegelane(tegelaseNimi, tegelased[tegelaseNimi].x, tegelased[tegelaseNimi].y);
    if (tegelane.nimi != minuTegelane.nimi) tegelasedMassiiv.push(tegelane);
  };
};

let tegelasedRef = firebase.database().ref("tegelased");


function setup() {
  createCanvas(1280, 720);
  background("gray");
  textAlign(CENTER);
  frameRate(50);
}

let counter = 0;
function draw() {
  counter += 1;
  if (counter == 40) {
    counter = 0;
    tegelasedRef.once('value', tegelasedRefresh);

    minuTegelaseRef.set({
      x: minuTegelane.x,
      y: minuTegelane.y
    }); 
  }


  background("gray")

  let keyDown = false;

  if (keyIsDown(LEFT_ARROW)) {
    minuTegelane.x -= 5;
    keyDown = true;
  };
  if (keyIsDown(RIGHT_ARROW)) {
    minuTegelane.x += 5;
    keyDown = true;
  };
  if (keyIsDown(UP_ARROW)) {
    minuTegelane.y -= 5;
    keyDown = true;
  };
  if (keyIsDown(DOWN_ARROW)) {
    minuTegelane.y += 5;
    keyDown = true;
  };


  if (keyDown) {
       
  }


  minuTegelane.joonista();

  tegelasedMassiiv.forEach(tegelane => tegelane.joonista());
}