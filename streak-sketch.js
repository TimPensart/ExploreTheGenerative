//////////////////// system variables
var r, g, b;
var rot;

var landscapeView = true;

var speed;
var offset;

var opacity;
var maxOpacity = 0.1;
var size;



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
var noiseValue;
var noiseSize;
var noiseSlider = document.getElementById('slider2');
noiseSlider.value = 50;

var speedValue;
var speedSlider = document.getElementById('slider4');
speedSlider.value = 50;


noiseSlider.addEventListener('change', function () {
    noiseSize = mapNoiseSize(this.value);
    noiseValue = mapNoise(this.value);
});

speedSlider.addEventListener('change', function () {
    speedValue = mapSpeed(this.value);
});


function mapNoise(val) {
    return map(val, 1, 100, 0.005, 0.03);
}

function mapNoiseSize(val) {
    return map(val, 1, 100, 100, 400);
}


function mapSpeed(val) {
    return map(val, 1, 100, 0.001, 0.01);
}

////////////////////////////////////////////////////////////////// switches

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
        notePressed = parseInt(key.getAttribute('data-midi'));
        amountPressed += 1;
        key.classList.add('fired');

        // custom
        speed += speedValue * notePressed;
        opacity += maxOpacity * notePressed;

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

    r = random(0.005, 0.01);
    g = random(0.005, 0.01);
    b = random(0.005, 0.01);
    speed = 0;
    offset = 0;
    opacity = 0;
    size = 1;
    background(0);
    noStroke();


    // sliders
    noiseSlider.value = random(1, 100);
    speedSlider.value = random(1, 100);
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
                speed += speedValue * notePressed;
                opacity += maxOpacity * notePressed;
            }
        );
    });
    //
    //end of MIDI setup
    //

}

function draw() {
    if (active) {
        speed = constrain(lerp(speed, 0, 0.03), 0, 10);
        offset += speed;
        opacity = lerp(opacity, 0, 0.03);

        for (var x = map(notePressed,48,64,width-50,0); x < map(notePressed,48,64,width-50,0)+150; x += size) {
            // no protect

            fill(noise(x * noiseValue + offset * r) * 255,
                noise(x * noiseValue + offset * g) * 255,
                noise(x * noiseValue + offset * b) * 255, opacity
            );

            if (landscapeView) {
                rect(0, x, height, size);
            } else {
                rect(x, 0, size, height);
            }
        }

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
