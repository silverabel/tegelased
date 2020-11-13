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
  constructor(nimi, uusX, uusY, värv) {
    this.nimi = nimi;
    this.x = uusX;
    this.y = uusY;
    this.uusX = uusX;
    this.uusY = uusY;
    this.värv = värv;
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
    fill(this.värv);
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
  minuTegelane = new Tegelane(minuTegelaseNimi, 640, 360, "white");
  minuTegelaseRef = firebase.database().ref(`tegelased/${minuTegelaseNimi}`);
};
document.addEventListener("DOMContentLoaded", init);


let tegelasedMassiiv = [];
let ajadSurmaniMassiiv = [];
function tegelasedRefresh(snapshot) {
  let tegelased = snapshot.val();
  for (tegelaseNimi in tegelased) {
    if (tegelaseNimi == minuTegelane.nimi) {}
    else if (ajadSurmaniMassiiv[tegelaseNimi]) ajadSurmaniMassiiv[tegelaseNimi] -= 1;
    else ajadSurmaniMassiiv[tegelaseNimi] = 60;

    if (ajadSurmaniMassiiv[tegelaseNimi] < 1) {
      firebase.database().ref(`tegelased/${tegelaseNimi}`).set(null);
      delete tegelasedMassiiv[tegelaseNimi];
      delete ajadSurmaniMassiiv[tegelaseNimi];
      continue;
    };


    if (tegelaseNimi == minuTegelane.nimi) continue;

    if (tegelasedMassiiv[tegelaseNimi]) {
      tegelasedMassiiv[tegelaseNimi].uusX = tegelased[tegelaseNimi].x;
      tegelasedMassiiv[tegelaseNimi].uusY = tegelased[tegelaseNimi].y;
      tegelasedMassiiv[tegelaseNimi].värv = tegelased[tegelaseNimi].värv;
    }
    else tegelasedMassiiv[tegelaseNimi] = new Tegelane(tegelaseNimi, tegelased[tegelaseNimi].x, tegelased[tegelaseNimi].y, tegelased[tegelaseNimi].värv);
  };
};

let tegelasedRef = firebase.database().ref("tegelased");

let canvas;
let värvideVorm;
function setup() {
  canvas = createCanvas(1280, 720);
  background("gray");
  textAlign(CENTER);
  frameRate(50);

  document.värvideVorm.hidden = false;
  värvideVorm = new p5.Element(document.värvideVorm);
  
}

let counter = 0;
function draw() {
  counter += 1;
  if (counter == 40) {
    counter = 0;
    tegelasedRef.once('value', tegelasedRefresh);

    minuTegelaseRef.set({
      x: minuTegelane.x,
      y: minuTegelane.y,
      värv: minuTegelane.värv
    }); 
  }


  background("gray");
  
  värvideVorm.position(canvas.position().x + 1100, canvas.position().y + 30);

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


  minuTegelane.joonista();

  for (tegelaseNimi in tegelasedMassiiv) {
    let x = tegelasedMassiiv[tegelaseNimi].x;
    let y = tegelasedMassiiv[tegelaseNimi].y;
    let uusX = tegelasedMassiiv[tegelaseNimi].uusX;
    let uusY = tegelasedMassiiv[tegelaseNimi].uusY;

    if (x != uusX || y != uusY) ajadSurmaniMassiiv[tegelaseNimi] = 100;

    if (uusX - x >= 5) tegelasedMassiiv[tegelaseNimi].x += 5;
    else if (uusX - x <= -5) tegelasedMassiiv[tegelaseNimi].x -= 5;
    else tegelasedMassiiv[tegelaseNimi].x = uusX;

    if (uusY - y >= 5) tegelasedMassiiv[tegelaseNimi].y += 5;
    else if (uusY - y <= -5) tegelasedMassiiv[tegelaseNimi].y -= 5;
    else tegelasedMassiiv[tegelaseNimi].y = uusY;
    
    tegelasedMassiiv[tegelaseNimi].joonista();
  }
}


var värviNupud = document.getElementsByName("värvid");
värviNupud.forEach (värviNupp => värviNupp.style.backgroundColor = värviNupp.value);

document.värvideVorm.onclick = function() {
  var checkedVärviNuppElement = document.querySelector('input[name = värvid]:checked')
  minuTegelane.värv = checkedVärviNuppElement.value;
}