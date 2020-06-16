var active = false;

var start = function activate(overlay) {
    active = true;
    overlay.remove();
}

var timer;

function showText() {
    var helpText = document.querySelector('.help-text');
    if (helpText.classList.contains('show')) {
        helpText.classList.remove('show');
    } else {
        helpText.classList.add('show');
        clearTimeout(timer);
        timer = setTimeout(function () {
            helpText.classList.remove('show');
        }, 5000);
    }
}



// keyboard piano
const keys = document.querySelectorAll('.key');
const noteVisualizer = document.querySelector('.note-visual');

var notePressed;

var velocity = 0;

function playNote(e) {
    const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`),
        key = document.querySelector(`.key[data-key="${e.keyCode}"]`);

    if (!key) return;
    if (e.repeat) return;

    key.classList.add('playing');

    const keyNote = key.getAttribute('data-note');
    noteVisualizer.innerHTML = keyNote;

    if (!key.classList.contains('fired')) {

        audio.volume = .2;
        audio.currentTime = -50;
        audio.play();
        notePressed = key.getAttribute('data-midi');
        key.classList.add('fired');
        velocity = 1;
    }
}

function removeTransition(e) {
    const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);

    if (!key) return;

    key.classList.remove('playing');
    key.classList.remove('fired');
}

//keys.forEach(key => key.addEventListener('keyReleased', removeTransition));

window.addEventListener('keydown', playNote);

window.addEventListener('keyup', removeTransition);

// sliders
var noiseValue, noiseSize;
var noiseSlider = document.getElementById('noise');
noiseSlider.value = 20;

var colorValue;
var colorSlider = document.getElementById('color');
colorSlider.value = 50;

var randomValue;
var randomSlider = document.getElementById('random');
randomSlider.value = 1;

var speedValue;
var speedSlider = document.getElementById('speed');
speedSlider.value = 50;




noiseSlider.addEventListener('change', function () {
    noiseSize = mapNoiseSize(this.value);
    noiseValue = mapNoise(this.value);
});

colorSlider.addEventListener('change', function () {
    colorValue = mapColor(this.value);
});
randomSlider.addEventListener('change', function () {
    randomValue = mapRandom(this.value);
});

speedSlider.addEventListener('change', function () {
    speedValue = mapSpeed(this.value);
});

function mapNoise(val) {
    return map(val, 1, 100, 0.0002, 0.0015);
}

function mapNoiseSize(val) {
    return map(val, 1, 100, 0, pg.width - 900);
}

function mapColor(val) {
    return map(val, 1, 100, -0.01, 0.01);
}

function mapRandom(val) {
    return map(val, 1, 100, 0, 80);
}

function mapSpeed(val) {
    return map(val, 1, 100, -15, 20);
}

// switches
var landscapeView = true;

function toggleSwitch(element) {
    if (element.classList.contains('left')) {
        element.parentElement.children[0].classList.add('active');
        element.parentElement.children[1].classList.remove('active');
        landscapeView = true;

    } else if (element.classList.contains('right')) {
        element.parentElement.children[1].classList.add('active');
        element.parentElement.children[0].classList.remove('active');
        landscapeView = false;
    }
}


var r, g, b;
var s1, s2, s3;
var rangeR, rangeG, rangeB;
var Xpos = 0.0;
var x = 0.0;
var randomSeed1, randomSeed2, randomSeed3;
var rSeed, gSeed, bSeed;


var amountPressed = 0;

var offset = 0;

var moveSpeed;

let pg;

var pianoSound = [];

function preload() {
    for (var i = 1; i <= 25; i++) {
        pianoSound[i] = loadSound('./sounds/piano' + i + '.wav');
    }
}

function setup() {
    var cnv = createCanvas(1000, 1000);
    cnv.parent("canvas");
    pg = createGraphics(2000, 2000);
    pg.background(0);
    pg.smooth();
    r = random(0, 0.001);
    g = random(0, 0.001);
    b = random(0, 0.001);
    s1 = random(0.001, 0.01);
    s2 = random(0.001, 0.01);
    s3 = random(0.001, 0.01);
    rangeR = random(0, 127);
    rangeG = random(0, 127);
    rangeB = random(0, 127);
    randomSeed1 = random(1000);
    randomSeed2 = random(1000);
    randomSeed3 = random(1000);
    rSeed = random(100);
    gSeed = random(100);
    bSeed = random(100);
    moveSpeed = 0;
    offset = 0;
    Xpos = 0;
    x = 0;
    velocity = 0;

    //sliders
    noiseSlider.value = random(1,100);
    colorSlider.value = random(1,100);
    randomSlider.value = 1;
    speedSlider.value = random(1,100);
    
    noiseValue = mapNoise(noiseSlider.value);
    noiseSize = 1;
    colorValue = mapColor(colorSlider.value);
    randomValue = mapRandom(randomSlider.value);
    speedValue = mapSpeed(speedSlider.value);

    ////
    //Setting up MIDI
    ////
    WebMidi.enable(function (err) { //check if WebMidi.js is enabled

        if (err) {
            console.log("WebMidi could not be enabled.", err);
        } else {
            console.log("WebMidi enabled!");
        }

        if (!WebMidi.inputs.length) return;

        console.log("---");
        console.log("Inputs Ports: ");
        for (i = 0; i < WebMidi.inputs.length; i++) {
            console.log(i + ": " + WebMidi.inputs[i].name);
        }

        console.log("---");
        console.log("Output Ports: ");
        for (i = 0; i < WebMidi.outputs.length; i++) {
            console.log(i + ": " + WebMidi.outputs[i].name);

        }

        inputSoftware = WebMidi.inputs[0];

        inputSoftware.addListener('noteoff', "all",
            function (e) {
                amountPressed -= 1;
            }
        );


        inputSoftware.addListener('noteon', "all",
            function (e) {
                velocity = map(e.velocity, 0, 1, 0.5, 1);
                notePressed = e.note.number;
                pianoSound[((notePressed + 2) % 25) + 1].play(0, 1, .2);
                amountPressed += 1;
                noteVisualizer.innerHTML = e.note.name;
            }
        );
    });
    //
    //end of MIDI setup
    //

}

function draw() {
    if (active) {

        if (amountPressed == 0) {
            velocity = lerp(velocity, 0, 0.06);
        } else {
            velocity = lerp(velocity, 0, 0.0065);
        }

        offset += (velocity * 2);
        moveSpeed = (18 + speedValue) * velocity;
        Xpos += (-moveSpeed / 2) + noise(randomSeed1 + offset * 0.0008) * moveSpeed;



        for (var y = 0; y < pg.height; y++) {
            // noprotect
            pg.noStroke();

            var c = color(127 + rangeR * sin(rSeed + y * (r) + (offset * (s1 + colorValue))),
                127 + rangeG * sin(gSeed + y * (g) + (offset * (s2 + colorValue))),
                127 + rangeB * sin(bSeed + y * (b) + (offset * (s3 + colorValue)))
            );

            pg.fill(c);

            x = (noise(randomSeed2 + y * noiseValue + offset * noiseValue) * (pg.width - noiseSize) + noise(randomSeed3 + y * 0.00025 + offset * 0.0007) * pg.width + noise(y) * (randomValue * randomValue)) + Xpos;

            if (x > pg.width) {
                x = x % pg.width;
            } else if (x < 0.0) {
                x = (x % pg.width) + pg.width;
            }

            if (velocity > 0.0077) {
                if (landscapeView) {
                    pg.ellipse(y, x, 20, 20);
                } else {
                    pg.ellipse(x, y, 20, 20);
                }
            }
        }

        // draw graphics buffer to the screen
        image(pg, 0, 0, width, height);

    }
}

// options
function downloadCanvas() {
    var canvas = document.getElementById("defaultCanvas0");
    //var img = canvas.toDataURL("image/jpeg");
    saveCanvas('myCanvas', 'jpg');
}

function print_canvas() {
    var dataUrl = document.getElementById('defaultCanvas0').toDataURL(); //attempt to save base64 string to server using this var  
    var windowContent = '<!DOCTYPE html>';
    windowContent += '<html>'
    windowContent += '<head><title>Print canvas</title></head>';
    windowContent += '<body>'
    windowContent += '<img src="' + dataUrl + '">';
    windowContent += '</body>';
    windowContent += '</html>';
    var printWin = window.open();
    printWin.document.write(windowContent);

    printWin.document.addEventListener('load', function () {
        printWin.focus();
        printWin.print();
    }, true);
}

function renewCanvas() {
    setup();
}
