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
    text(ajadSurmani[this.nimi], this.x, this.y - 25)
  }
}


let tegelasedMap = new Map();
let ajadSurmani = {};
let eluAegKaadrites = 600;
let tegelasedRef = firebase.database().ref("tegelased");
tegelasedRef.on("child_added", (snapshot) => {
  if (snapshot.key == minuTegelane.nimi) return;
  tegelasedMap.set(snapshot.key, new Tegelane(snapshot.key, snapshot.val().x, snapshot.val().y, snapshot.val().värv));
  ajadSurmani[snapshot.key] = eluAegKaadrites;
  
  tegelasedRef.child(snapshot.key).on("value", onChildValueChanged);
});

function onChildValueChanged(snapshot) {
  let tegelane = tegelasedMap.get(snapshot.key);
  tegelane.uusX = snapshot.val().x;
  tegelane.uusY = snapshot.val().y;
  tegelane.värv = snapshot.val().värv;
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
  canvas = createCanvas(1280, 720);
  background("gray");
  textAlign(CENTER);
  
  värvideVorm = new p5.Element(document.värvideVorm);
  värvideVorm.position(canvas.position().x + 1100, canvas.position().y + 30);
  document.värvideVorm.hidden = false;

  minuTegelane = new Tegelane("Nimetu", 640, 360, "white");

  let prompt = new PromptDialog();
  p5Prompt = new p5.Element(prompt.el);
  p5Prompt.position(canvas.position().x + 540, canvas.position().y + 200);

  prompt.show('Sisesta nimi')
    .waitForUser()
    .then(function(nimi) {
      document.getElementsByTagName("body")[0].focus();
      minuTegelane.nimi = nimi || "ei taha nime panna" + Math.floor(Math.random() * 100);
      tegelasedRef.child(minuTegelane.nimi).set({
        x: minuTegelane.x,
        y: minuTegelane.y,
        värv: minuTegelane.värv
      });
    })
    .catch(function(error) {
      console.log("Error: ", error);
    })
    .finally(function() {
      prompt.hide();
    });
}


function windowResized() {
  värvideVorm.position(canvas.position().x + 1100, canvas.position().y + 30);
  p5Prompt.position(canvas.position().x + 540, canvas.position().y + 200);
}


let freeToSend = true;
function draw() {
  background("gray");

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

  if (keyDown && freeToSend) {
    freeToSend = false;
    tegelasedRef.child(minuTegelane.nimi).set({
      x: minuTegelane.x,
      y: minuTegelane.y,
      värv: minuTegelane.värv
    }, () => freeToSend = true);
  }


  minuTegelane.joonista();

  
  for (let [tegelaseNimi, tegelane] of tegelasedMap) {

    if (ajadSurmani[tegelaseNimi] < 1) {
      tegelasedRef.child(tegelaseNimi).off();
      tegelasedRef.child(tegelaseNimi).remove();
      continue;
    };

    let x = tegelane.x;
    let y = tegelane.y;
    let uusX = tegelane.uusX;
    let uusY = tegelane.uusY;

    if (x != uusX || y != uusY) ajadSurmani[tegelaseNimi] = eluAegKaadrites;
    else ajadSurmani[tegelaseNimi] -= 1;

    
    if (uusX - x >= 5) tegelane.x += 5;
    else if (uusX - x <= -5) tegelane.x -= 5;
    else tegelane.x = uusX;

    if (uusY - y >= 5) tegelane.y += 5;
    else if (uusY - y <= -5) tegelane.y -= 5;
    else tegelane.y = uusY;
    
    tegelane.joonista();
  }
}


function keyReleased() {
  if (![LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW].includes(keyCode)) return;
  
  tegelasedRef.child(minuTegelane.nimi).update({
    x: minuTegelane.x,
    y: minuTegelane.y,
    värv: minuTegelane.värv
  });
}


var värviNupud = document.getElementsByName("värvid");
for (let värviNupp of värviNupud) {
  värviNupp.style.backgroundColor = värviNupp.value
  värviNupp.onclick = function() {
    minuTegelane.värv = this.value;
  }
  värviNupp.onmousedown = function() {
    this.onmouseup = function() {
      tegelasedRef.child(minuTegelane.nimi).update({
        värv: this.value
      })
      this.onmouseup = null;
    }
  }
}




var noop = function() {
  return this;
};

function Dialog() {
  this.setCallbacks(noop, noop);
}
Dialog.prototype.setCallbacks = function(okCallback, cancelCallback) {
  this._okCallback     = okCallback;
  this._cancelCallback = cancelCallback;
  return this;
};
Dialog.prototype.waitForUser = function() {
  var _this = this;
  return new Promise(function(resolve, reject) {
    _this.setCallbacks(resolve, reject);
  });
};
Dialog.prototype.show = noop;
Dialog.prototype.hide = noop;


function PromptDialog() {
  Dialog.call(this);
  this.el           = document.getElementById('dialog');
  this.inputEl      = this.el.querySelector('input');
  this.messageEl    = this.el.querySelector('.message');
  this.okButton     = this.el.querySelector('button.ok');
  this.cancelButton = this.el.querySelector('button.cancel');
  this.attachDomEvents();
}
PromptDialog.prototype = Object.create(Dialog.prototype);
PromptDialog.prototype.attachDomEvents = function() {
  var _this = this;
  this.okButton.addEventListener('click', function() {
    _this._okCallback(_this.inputEl.value);
  });
  this.cancelButton.addEventListener('click', function() {
    _this._cancelCallback();
  });
  this.inputEl.addEventListener('keyup', function(event) {
    if (event.key === "Enter") _this._okCallback(_this.inputEl.value);
  });
};
PromptDialog.prototype.show = function(message) {
  this.messageEl.innerHTML = String(message);
  this.el.className = '';
  this.inputEl.focus();
  return this;
};
PromptDialog.prototype.hide = function() {
  this.el.className = 'hidden';
  return this;
};