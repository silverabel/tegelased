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
let eluAegKaadrites = 3600;
let tegelasedRef = firebase.database().ref("tegelased");

tegelasedRef.on("child_added", (snapshot) => {
  if (snapshot.key == minuTegelane.nimi) return;
  tegelasedMassiiv[snapshot.key] = new Tegelane(snapshot.key, snapshot.val().x, snapshot.val().y, snapshot.val().värv);
  ajadSurmaniMassiiv[snapshot.key] = eluAegKaadrites;
  
  tegelasedRef.child(snapshot.key).on("value", onValueChanged);
});

function onValueChanged(snapshot) {
  if (!snapshot.val()) return;
  tegelasedMassiiv[snapshot.key].uusX = snapshot.val().x;
  tegelasedMassiiv[snapshot.key].uusY = snapshot.val().y;
  tegelasedMassiiv[snapshot.key].värv = snapshot.val().värv;
}


tegelasedRef.on("child_removed", (snapshot) => {
  delete tegelasedMassiiv[snapshot.key];
  delete ajadSurmaniMassiiv[snapshot.key];
  tegelasedRef.child(snapshot.key).off();
});



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

let freeToSend = true;
function draw() {
  let keyDown = false;

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

  if (keyDown && freeToSend) {
    freeToSend = false;
    minuTegelaseRef.set({
      x: minuTegelane.x,
      y: minuTegelane.y,
      värv: minuTegelane.värv
    }, () => freeToSend = true);
  }


  minuTegelane.joonista();

  for (tegelaseNimi in tegelasedMassiiv) {

    if (ajadSurmaniMassiiv[tegelaseNimi] < 1) {
      firebase.database().ref(`tegelased/${tegelaseNimi}`).remove();
      continue;
    };


    let x = tegelasedMassiiv[tegelaseNimi].x;
    let y = tegelasedMassiiv[tegelaseNimi].y;
    let uusX = tegelasedMassiiv[tegelaseNimi].uusX;
    let uusY = tegelasedMassiiv[tegelaseNimi].uusY;

    if (x != uusX || y != uusY) ajadSurmaniMassiiv[tegelaseNimi] = eluAegKaadrites;
    else ajadSurmaniMassiiv[tegelaseNimi] -= 1;

    
    if (uusX - x >= 5) tegelasedMassiiv[tegelaseNimi].x += 5;
    else if (uusX - x <= -5) tegelasedMassiiv[tegelaseNimi].x -= 5;
    else tegelasedMassiiv[tegelaseNimi].x = uusX;

    if (uusY - y >= 5) tegelasedMassiiv[tegelaseNimi].y += 5;
    else if (uusY - y <= -5) tegelasedMassiiv[tegelaseNimi].y -= 5;
    else tegelasedMassiiv[tegelaseNimi].y = uusY;
    
    tegelasedMassiiv[tegelaseNimi].joonista();
  }
}


function keyReleased() {
  minuTegelaseRef.set({
    x: minuTegelane.x,
    y: minuTegelane.y,
    värv: minuTegelane.värv
  });
}


var värviNupud = document.getElementsByName("värvid");
värviNupud.forEach (värviNupp => värviNupp.style.backgroundColor = värviNupp.value);

document.värvideVorm.onclick = function() {
  var checkedVärviNuppElement = document.querySelector('input[name = värvid]:checked')
  minuTegelane.värv = checkedVärviNuppElement.value;
}
