//////////////////// system variables

var angle = 0;
var cameraAngle = 0;
var stop = false;
var rX;
var rY;
var x;
var y;
var col;
var translateMax;
var sizeMax;

var light = false;

var circleSize;
var circleSizes;
var lerpCircle;
var noiseV, noiseS;

var offset;





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
var circleValue;
var circleSlider = document.getElementById('slider1');
circleSlider.value = 50;

var noiseValue;
var noiseSize;
var noiseSlider = document.getElementById('slider2');
noiseSlider.value = 50;

var speedValue;
var speedSlider = document.getElementById('slider4');
speedSlider.value = 50;


circleSlider.addEventListener('change', function () {
    circleValue = mapCircle(this.value);
});

noiseSlider.addEventListener('change', function () {
    noiseSize = mapNoiseSize(this.value);
    noiseValue = mapNoise(this.value);
});

speedSlider.addEventListener('change', function () {
    speedValue = mapSpeed(this.value);
});

function mapCircle(val) {
    return map(val, 1, 100, 0.25, 10);
}

function mapNoise(val) {
    return map(val, 1, 100, 0.001, 0.06);
}

function mapNoiseSize(val) {
    return map(val, 1, 100, 1, 2);
}

function mapSpeed(val) {
    return map(val, 1, 100, 0.0095, 0.06);
}

////////////////////////////////////////////////////////////////// switches

function toggleSwitch(element) {
    if (element.classList.contains('left')) {
        element.parentElement.children[0].classList.add('active');
        element.parentElement.children[1].classList.remove('active');
        light = false;

    } else if (element.classList.contains('right')) {
        element.parentElement.children[1].classList.add('active');
        element.parentElement.children[0].classList.remove('active');
        light = true;
    }
}

//////////////////////////////////////////////////////////////////// keyboard key events
const keys = document.querySelectorAll('.key');
const noteVisualizer = document.querySelector('.note-visual');

var notePressed = 0;

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



        // necessary
        audio.volume = .2;
        audio.currentTime = -50;
        audio.play();
        notePressed = 4 + parseInt(key.getAttribute('data-midi'));
        amountPressed += 1;
        key.classList.add('fired');

        // custom
        lerpCircle += circleValue * notePressed;
    }
}

function removeTransition(e) {
    const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);

    if (!key) return;

    key.classList.remove('playing');
    key.classList.remove('fired');
    amountPressed -= 1;

    if (amountPressed == 0) {
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
    var cnv = createCanvas(1000, 1000, WEBGL);
    cnv.parent("canvas");
    background(0);

    frameRate(30);
    rX = random(0, 360);
    rY = random(0, 360);
    colorMode(HSB, 255);
    col = color(random(255), 200, 255);
    translateMax = (width + height) / 6;
    console.log(translateMax);
    sizeMax = (width + height) / 10;
    angle = 0;
    circleSize = 0;
    circleSizes = [];
    noiseV = [];
    noiseS = [];
    lerpCircle = 0;
    offset = 0;


    // sliders
    circleSlider.value = random(1, 100);
    noiseSlider.value = random(1, 100);
    speedSlider.value = random(1, 100);
    
    circleValue = mapCircle(circleSlider.value);
    noiseValue = mapNoise(noiseSlider.value);
    noiseSize = mapNoiseSize(noiseSlider.value);
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
                    notePressed = 0;
                }
            }
        );


        inputSoftware.addListener('noteon', "all",
            function (e) {


                // necessary
                notePressed = e.note.number;
                pianoSound[((notePressed + 2) % 25) + 1].play(0, 1, .2);
                amountPressed += 1;
                noteVisualizer.innerHTML = e.note.name;

                // custom
                lerpCircle += circleValue * notePressed;

            }
        );
    });
    //
    //end of MIDI setup
    //

}

function draw() {
    if (active) {
        
        
        if (light) {
            background(255);
            stroke(0, 10);
        } else {
            background(0);
            stroke(255, 10);
        }
        rotateY(cameraAngle);
        cameraAngle += 0.01;
        noFill();
        angle = 0;

        lerpCircle = lerp(lerpCircle, 0, speedValue*3);
        
        circleSize = constrain(lerp(circleSize, lerpCircle, speedValue),1, circleValue*40 + (circleValue*circleValue) );
        if (circleSize > 3) {
            offset += 1;
        }
        circleSizes[offset] = circleSize;
        noiseV[offset] = noiseValue;
        noiseS[offset] = noiseSize;
        for (var i = 0; i < offset; i++) {
            // noprotect
            x = -100 + noise(3282 + i * 0.005) * translateMax;
            y = -100 + noise(1562 + i * 0.005) * translateMax;
            push();
            rotateX(angle * 2 + rX);
            rotateY(angle * 0.5 + rY);
            rotateZ(angle);
            col.setAlpha(10);

            var ellipseSize = circleSizes[i] + noise(100 + (i * noiseV[i])) * (circleSizes[i] * noiseS[i]);

            ellipse(x, y, ellipseSize, ellipseSize, 50);
            angle += 0.01;
            pop();
        }
    }
}



// options
function downloadCanvas() {
    var canvas = document.getElementById("defaultCanvas0");
    //var img = canvas.toDataURL("image/jpeg");
    saveCanvas('myCanvas', 'png');
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
