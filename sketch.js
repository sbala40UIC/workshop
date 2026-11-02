
let x, y;
let px, py;

let brushSize = 5;
let drawColor;
let rainbow = false;

let brushType = 0;
let brushNames = ["Normal", "Spray", "Wave"];

let previousButtons = [];

let oscillator;
let audioStarted = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20);

  x = width / 2;
  y = height / 2;
  px = x;
  py = y;

  drawColor = color(255, 100, 180);

  oscillator = new p5.Oscillator(440, "sine");
  oscillator.start();
  oscillator.amp(0);

  textAlign(LEFT);
}

function draw() {
  let gamepads = navigator.getGamepads();

  let gp = Array.from(gamepads).find(
    gamepad => gamepad !== null
  );

  if (!gp) {
    background(20);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(22);
    text(
      "Connect a Gamepad and Press Any Button!",
      width / 2,
      height / 2
    );
    return;
  }

  let deadzone = 0.15;

  let dx = Math.abs(gp.axes[0]) > deadzone
    ? gp.axes[0] : 0;

  let dy = Math.abs(gp.axes[1]) > deadzone
    ? gp.axes[1] : 0;

  let speed = 8;

  px = x;
  py = y;

  x += dx * speed;
  y += dy * speed;

  x = constrain(x, 0, width);
  y = constrain(y, 0, height);

  // Rainbow mode
  if (rainbow) {
    drawColor = color(
      random(255),
      random(255),
      random(255)
    );
  }

  // Draw selected brush
  drawBrush();

  // Brush size controls
  let leftTrigger = gp.buttons[6]?.value || 0;
  let rightTrigger = gp.buttons[7]?.value || 0;

  brushSize = map(
    rightTrigger - leftTrigger,
    -1, 1, 1, 30
  );

  brushSize = constrain(brushSize, 1, 30);

  // Sound responds to brush position
  let moving = dx !== 0 || dy !== 0;

  if (audioStarted) {
    let frequency = map(y, 0, height, 200, 900);

    oscillator.freq(frequency);
    oscillator.amp(moving ? 0.08 : 0, 0.1);
  }

  // Display information
  fill(255);
  noStroke();
  textSize(18);
  textAlign(LEFT);

  text("Brush: " + brushNames[brushType], 20, 30);
  text("Size: " + Math.round(brushSize), 20, 55);
  text("Rainbow: " + (rainbow ? "ON" : "OFF"), 20, 80);

  handleButtons(gp);
}


// BRUSH TYPES
function drawBrush() {

  if (brushType === 0) {
    // Normal brush
    stroke(drawColor);
    strokeWeight(brushSize);
    strokeCap(ROUND);

    line(px, py, x, y);
  }

  else if (brushType === 1) {
    // Spray brush
    for (let i = 0; i < 15; i++) {

      noStroke();
      fill(drawColor);

      let sx = x + random(-20, 20);
      let sy = y + random(-20, 20);

      circle(sx, sy, 3);
    }
  }

  else if (brushType === 2) {
    // Wave brush
    noFill();
    stroke(drawColor);
    strokeWeight(brushSize);

    beginShape();

    for (let i = 0; i < 20; i++) {
      let waveX = x - i * 3;
      let waveY = y + sin(i * 0.5) * 12;

      vertex(waveX, waveY); // https://p5js.org/reference/p5/vertex/?utm_source=chatgpt.com   vertex x and y coords
    }

    endShape();
  }
}


// CONTROLLER BUTTONS
function handleButtons(gp) {

  gp.buttons.forEach((button, index) => {

    let currentlyPressed = button.pressed;

    let previouslyPressed =
      previousButtons[index] || false;

    if (currentlyPressed && !previouslyPressed) {

      switch (index) {

        // Random color
        case 0:
          drawColor = color(
            random(255),
            random(255),
            random(255)
          );

          rainbow = false;
          playNote(440);
          break;

        // Clear canvas
        case 1:
          background(20);
          playNote(220);
          break;

        // Rainbow mode
        case 2:
          rainbow = !rainbow;
          playNote(660);
          break;

        // Save artwork
        case 3:
          saveCanvas("sound-painting", "png");
          playNote(880);
          break;

        // Previous brush
        case 4:
          brushType--;

          if (brushType < 0) {
            brushType = 2;
          }

          playNote(330);
          break;

        // Next brush
        case 5:
          brushType++;

          if (brushType > 2) {
            brushType = 0;
          }

          playNote(550);
          break;
      }
    }

    previousButtons[index] = currentlyPressed;
  });
}


// SOUND EFFECTS
function playNote(frequency) {

  if (audioStarted) {
    oscillator.freq(frequency);
  }
}


// ENABLE AUDIO

function keyPressed() {

  if (!audioStarted) {
    userStartAudio();
    audioStarted = true;
  }
}

function mousePressed() {
  if (!audioStarted) {
    userStartAudio();
    audioStarted = true;
  }
}



