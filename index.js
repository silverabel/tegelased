// Your web app's Firebase configuration
let firebaseConfig = {
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
  constructor(nimi, uusX, uusY, värv, kiirus) {
    this.nimi = nimi;
    this.x = uusX;
    this.y = uusY;
    this.uusX = uusX;
    this.uusY = uusY;
    this.värv = värv;
    this.kiirus = kiirus;
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
    text(ajadSurmani[this.nimi], this.x, this.y - 25)
  }
}


let tegelasedMap = new Map();
let ajadSurmani = {};
let eluAegKaadrites = 3600;
let tegelasedRef = firebase.database().ref("tegelased");
tegelasedRef.on("child_added", (snapshot) => {
  if (snapshot.key === minuTegelane.nimi) return;
  tegelasedMap.set(snapshot.key, new Tegelane(snapshot.key, snapshot.val().x, snapshot.val().y, snapshot.val().värv, snapshot.val().kiirus));
  ajadSurmani[snapshot.key] = eluAegKaadrites;
  
  tegelasedRef.child(snapshot.key).on("value", onChildValueChanged);
});

function onChildValueChanged(snapshot) {
  if (!snapshot.val()) return;
  let tegelane = tegelasedMap.get(snapshot.key);
  tegelane.uusX = snapshot.val().x;
  tegelane.uusY = snapshot.val().y;
  tegelane.värv = snapshot.val().värv;
  tegelane.kiirus = snapshot.val().kiirus;
  console.log(tegelane.uusX);
}

tegelasedRef.on("child_removed", (snapshot) => {
  tegelasedMap.delete(snapshot.key);
  delete ajadSurmani[snapshot.key];
});


let minuTegelane;
let canvas;
let värvideVorm;
let p5Prompt;
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  background("gray");
  textAlign(CENTER);
  
  värvideVorm = new p5.Element(document.värvideVorm);
  värvideVorm.position(windowWidth - 180, 30);
  document.värvideVorm.hidden = false;

  minuTegelane = new Tegelane("Nimetu", 50, 50, "white", 1);

  let prompt = document.getElementById("prompt");
  p5Prompt = new p5.Element(prompt);
  p5Prompt.position(windowWidth / 2 - 111, 200);
  prompt.hidden = false;
  document.getElementById("promptInput").focus();
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  värvideVorm.position(windowWidth - 180, 30);
  p5Prompt.position(windowWidth / 2 - 111, 200);
}

let freeToSend = true;
function draw() {
  background("gray");

  let keyDown = false;
  
  if (keyIsDown(LEFT_ARROW)) {
    minuTegelane.x -= minuTegelane.kiirus;
    keyDown = true;
  };
  if (keyIsDown(RIGHT_ARROW)) {
    minuTegelane.x += minuTegelane.kiirus;
    keyDown = true;
  };
  if (keyIsDown(UP_ARROW)) {
    minuTegelane.y -= minuTegelane.kiirus;
    keyDown = true;
  };
  if (keyIsDown(DOWN_ARROW)) {
    minuTegelane.y += minuTegelane.kiirus;
    keyDown = true;
  };

  if (minuTegelane.x > 110) minuTegelane.x = -10;
  if (minuTegelane.x < -10) minuTegelane.x = 110;
  if (minuTegelane.y > 115) minuTegelane.y = -15;
  if (minuTegelane.y < -15) minuTegelane.y = 115;



  if (keyDown && freeToSend) {
    freeToSend = false;
    tegelasedRef.child(minuTegelane.nimi).set({
      x: minuTegelane.x,
      y: minuTegelane.y,
      värv: minuTegelane.värv,
      kiirus: minuTegelane.kiirus
    }, () => freeToSend = true);
  }

  let xProtsendinaLaiusest = minuTegelane.x;
  let yProtsendinaKõrgusest = minuTegelane.y;
  minuTegelane.x = minuTegelane.x / 100 * windowWidth;
  minuTegelane.y = minuTegelane.y / 100 * windowHeight;

  minuTegelane.joonista();

  minuTegelane.x = xProtsendinaLaiusest;
  minuTegelane.y = yProtsendinaKõrgusest;
  
  for (let [tegelaseNimi, tegelane] of tegelasedMap) {
    if (ajadSurmani[tegelaseNimi] < 1) {
      tegelasedRef.child(tegelaseNimi).off();
      tegelasedRef.child(tegelaseNimi).remove();
      continue;
    };

    if (Math.abs(tegelane.x - tegelane.uusX) > 100) tegelane.x = tegelane.uusX;
    if (Math.abs(tegelane.y - tegelane.uusY) > 100) tegelane.y = tegelane.uusY;

    let x = tegelane.x;
    let y = tegelane.y;
    let uusX = tegelane.uusX;
    let uusY = tegelane.uusY;

    if (x != uusX || y != uusY) ajadSurmani[tegelaseNimi] = eluAegKaadrites;
    else ajadSurmani[tegelaseNimi] -= 1;


    if (uusX - x >= tegelane.kiirus) tegelane.x += tegelane.kiirus;
    else if (uusX - x <= -tegelane.kiirus) tegelane.x -= tegelane.kiirus;
    else tegelane.x = uusX;

    if (uusY - y >= tegelane.kiirus) tegelane.y += tegelane.kiirus;
    else if (uusY - y <= -tegelane.kiirus) tegelane.y -= tegelane.kiirus;
    else tegelane.y = uusY;
    
    let xProtsendinaLaiusest = tegelane.x;
    let yProtsendinaKõrgusest = tegelane.y;
    tegelane.x = tegelane.x / 100 * windowWidth;
    tegelane.y = tegelane.y / 100 * windowHeight;

    tegelane.joonista();

    tegelane.x = xProtsendinaLaiusest;
    tegelane.y = yProtsendinaKõrgusest;
  }
}


function keyReleased() {
  if (![LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW].includes(keyCode)) return;
  
  tegelasedRef.child(minuTegelane.nimi).update({
    x: minuTegelane.x,
    y: minuTegelane.y,
    värv: minuTegelane.värv,
    kiirus: minuTegelane.kiirus
  });
}

let mouseDownTarget;
let värviNupud = document.getElementsByName("värvid");
for (let värviNupp of värviNupud) {
  värviNupp.style.backgroundColor = värviNupp.value;
  värviNupp.onclick = function() {
    minuTegelane.värv = this.value;
  }
  värviNupp.onmousedown = function() {
    mouseDownTarget = this;
  }
}

function mouseReleased(event) {
  if (event.target === mouseDownTarget) tegelasedRef.child(minuTegelane.nimi).update({värv: mouseDownTarget.value});
  mouseDownTarget = null;
}


function onPromptButtonClick(shouldTakeInputValue) {
  if (!shouldTakeInputValue) minuTegelane.nimi = "ei taha nime panna" + Math.floor(Math.random() * 100);
  else {
    let inputValue = document.getElementById("promptInput").value.replace(/[\.\#\$\[\]\/]/g, "");
    minuTegelane.nimi = inputValue || "ei taha nime panna" + Math.floor(Math.random() * 100);
  }
  tegelasedRef.child(minuTegelane.nimi).set({
    x: minuTegelane.x,
    y: minuTegelane.y,
    värv: minuTegelane.värv
  });
  p5Prompt.hide();
}

function onPromptInputKeyup(event) {
  if (event.key === "Enter") onPromptButtonClick(true);
  if (event.key === "Escape") onPromptButtonClick(false);
}