//////////////////// light system variables
var v = 0;
var mappedP = 0;
var mappedV = 0;

var pressLS;
var releaseLS;
var lerpStep = 0.0;
var lerpPitch = 0;

var r = 0.0;
var a = 0.0;

var aVel = 1.0;
var aAcc = 0.0;

var randomColor;
var iterations;
var aStep, ampl;
var opac;

var lines = true;


/////////////////////// overlay for user gesture

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

/////////////////////////////////////////////////////////////////////// sliders
var lerpValue;
var lerpSlider = document.getElementById('slider1');
lerpSlider.value = 50;

var noiseValue;
var noiseSize;
var noiseSlider = document.getElementById('slider2');
noiseSlider.value = 50;

var colorValue;
var colorSlider = document.getElementById('slider3');
colorSlider.value = 50;

var speedValue;
var speedSlider = document.getElementById('slider4');
speedSlider.value = 50;


lerpSlider.addEventListener('change', function () {
    lerpValue = mapLerp(this.value);
});

noiseSlider.addEventListener('change', function () {
    noiseSize = mapNoiseSize(this.value);
    noiseValue = mapNoise(this.value);
});

colorSlider.addEventListener('change', function () {
    colorValue = mapColor(this.value);
});

speedSlider.addEventListener('change', function () {
    speedValue = mapSpeed(this.value);
});

function mapLerp(val) {
    return map(val, 1, 100, 0.002, 0.01);
}

function mapNoise(val) {
    return map(val, 1, 100, 0.0001, 0.02);
}

function mapNoiseSize(val) {
    return map(val, 1, 100, 100, 400);
}

function mapColor(val) {
    return map(val, 1, 100, 0, 40);
}

function mapSpeed(val) {
    return map(val, 1, 100, 0.0075, 0.03);
}

////////////////////////////////////////////////////////////////// switches

function toggleSwitch(element) {
    if (element.classList.contains('left')) {
        element.parentElement.children[0].classList.add('active');
        element.parentElement.children[1].classList.remove('active');
        lines = true;

    } else if (element.classList.contains('right')) {
        element.parentElement.children[1].classList.add('active');
        element.parentElement.children[0].classList.remove('active');
        lines = false;
    }
}

//////////////////////////////////////////////////////////////////// keyboard key events
const keys = document.querySelectorAll('.key');
const noteVisualizer = document.querySelector('.note-visual');

var notePressed = 0;

var keypress = false;

function playNote(e) {
    const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`),
        key = document.querySelector(`.key[data-key="${e.keyCode}"]`);

    if (!key) return;
    if (e.repeat) return;

    key.classList.add('playing');
    keypress = true;

    const keyNote = key.getAttribute('data-note');
    noteVisualizer.innerHTML = keyNote;

    if (!key.classList.contains('fired')) {
        // custom
        keypress = true;
        v = 1;
        lerpStep = lerpValue * 5;

        // necessary
        audio.volume = .2;
        audio.currentTime = -50;
        audio.play();
        notePressed = 4 + parseInt(key.getAttribute('data-midi'));
        amountPressed += 1;
        key.classList.add('fired');


    }
}

function removeTransition(e) {
    const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);

    if (!key) return;

    key.classList.remove('playing');
    key.classList.remove('fired');
    amountPressed -= 1;

    if (amountPressed == 0) {
        lerpStep = lerpValue;
        notePressed = 0;
    }
}
window.addEventListener('keydown', playNote);
window.addEventListener('keyup', removeTransition);





// necessary for each system
var amountPressed = 0;
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
    background(0);

    colorMode(HSB, 255);
    randomColor = random(255);
    background(0);
    aStep = random(0.001, 0.05);
    ampl = random(0.001, 0.05);
    opac = random(20, 45);
    aVel = random(0.01, 0.05);
    iterations = int(random(2000, 10000));
    v = 0;
    lerpStep = 0;
    lerpPitch = 0;
    r = 0;
    keypress = false;


    // sliders
    lerpSlider.value = random(1,100);
    noiseSlider.value = random(1,100);
    colorSlider.value = random(1,100);
    speedSlider.value = random(1,100);
    lerpValue = mapLerp(lerpSlider.value);
    noiseValue = mapNoise(noiseSlider.value);
    noiseSize = mapNoiseSize(noiseSlider.value);
    colorValue = mapColor(colorSlider.value);
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

                if (amountPressed == 0) {
                    // custom
                    lerpStep = lerpValue;
                    
                    // necessary
                    notePressed = 0;
                }
            }
        );


        inputSoftware.addListener('noteon', "all",
            function (e) {
                // custom
                keypress = true;
                v = map(e.velocity, 0, 1, 0.5, 1);
                lerpStep = lerpValue * 5;

                // necessary
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
        translate(width / 2, height / 2);
        mappedP = constrain(map(notePressed, 48, 72, 0, 1), 0, 1);

        lerpPitch = lerp(lerpPitch, mappedP, lerpStep);


        r = (lerpPitch * height / 4) + (noise(frameCount * noiseValue) * ((noiseSize) * lerpPitch));
        console.log(noiseSize);

        //aVel = noise(frameCount*aStep)*(ampl);
        //println(aVel);

        a += speedValue;

        var x = sin(a) * r;
        var y = cos(a) * r;


        if (keypress) {
            if (lines) {
                drawLines(x, y);
            } else {
                drawCircles(x, y);
            }
        }
    }
}

function drawLines(_x, _y) {
    strokeWeight(2);
    stroke(((randomColor + r / 10) + (sin(frameCount * 0.0095) * colorValue)) % 255, 255, 255, opac);
    line(0, 0, _x, _y);
}

function drawCircles(_x, _y) {
    stroke(((randomColor + r / 10) + (sin(frameCount * 0.0095) * colorValue)) % 255, 255, 255, opac);
    strokeWeight(1 + (noise((100 + frameCount) * 0.01) * (r * 0.005)));
    //fill((randomColor + frameCount/200)%255, 255, 255, opac);
    noFill();
    var ellipseSize = constrain(r / 2, 80, 90);
    ellipse(_x, _y, ellipseSize, ellipseSize);
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
