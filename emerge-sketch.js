//////////////////// lines system variables
var x = [];
var y = [];

var r, g, b;
var s;
var speed;
var rangeR, rangeG, rangeB;

var offset;


/////////////////////// overlay for user gesture
var active = false;

var start = function activate(overlay) {
    active = true;
    overlay.remove();
}


///////////////////// info text
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

var s;
var sizeSlider = document.getElementById('slider2');
sizeSlider.value = 50;

var colorValue;
var colorSlider = document.getElementById('slider3');
colorSlider.value = 50;

var amountValue;
var amountSlider = document.getElementById('slider4');
amountSlider.value = 50;


sizeSlider.addEventListener('change', function () {
    s = mapSize(this.value);
});

colorSlider.addEventListener('change', function () {
    colorValue = mapColor(this.value);
    console.log(colorValue);
});

amountSlider.addEventListener('change', function () {
    amountValue = mapAmount(this.value);
});

function mapSize(val) {
    return map(val, 1, 100, 0.3, 1);
}

function mapColor(val) {
    return map(val, 1, 100, 0.4, 1.8);
}

function mapAmount(val) {
    return parseInt(map(val, 1, 100, 5, 10));
}


///////////////////////////////////////////////////////// keyboard key events
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

        // necessary
        audio.volume = .2;
        audio.currentTime = -50;
        audio.play();
        notePressed = 4 + parseInt(key.getAttribute('data-midi'));
        amountPressed += 1;
        key.classList.add('fired');

        // custom
        speed += (0.00008 * notePressed);


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
    var cnv = createCanvas(1000, 1000);
    cnv.parent("canvas");
    background(0);


    // custom
    var iterations = 10;
    r = random(0.01, 0.03);
    g = random(0.01, 0.03);
    b = random(0.01, 0.03);
    rangeR = random(0, 255);
    rangeG = random(0, 255);
    rangeB = random(0, 255);
    for (var i = 0; i < iterations; i++) {
        x[i] = random(200, width - 200);
        y[i] = random(200, height - 200);
    }
    strokeW = 7;
    offset = 0;
    speed = 0;



    // sliders
    sizeSlider.value = random(1, 100);
    colorSlider.value = random(1, 100);
    amountSlider.value = random(1, 100);

    s = mapSize(sizeSlider.value);
    colorValue = mapColor(colorSlider.value);
    amountValue = mapAmount(amountSlider.value);


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

                // custom

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
                speed += (0.00008 * notePressed);

            }
        );
    });
    //
    //end of MIDI setup
    //

}

function draw() {
    if (active) {
        noFill();
        strokeWeight(strokeW);

        speed = constrain(lerp(speed, 0, 0.03), 0, 0.003);
        offset += speed;


        beginShape();
        for (var i = 0; i < amountValue; i++) {
            if (color) {
                stroke(rangeR + sin((frameCount * colorValue) * r) * ((255 - rangeR) / 2),
                    rangeG + sin((frameCount * colorValue) * g) * ((255 - rangeG) / 2),
                    rangeB + sin((frameCount * colorValue) * b) * ((255 - rangeB) / 2), 255);
            }
            if (speed > 0.0002) {

                curveVertex(x[i] + (-(x[i] * s) + noise((i * 100) + offset) * ((width) * s)),
                    y[i] + (-(y[i] * s) + noise((i * 500) + offset) * ((height) * s)));
            }
        }
        endShape();
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
