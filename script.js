var running = false;
var timer;

var taskInputEl = document.getElementById('theInput');
var timeInputEl = document.getElementById('timeInput');
var timerEl = document.getElementById('timer');
var buttonEl = document.getElementById('theButton');
var stopButtonEl = document.getElementById('stopButton');
var pauseButtonEl = document.getElementById('pauseButton');
var ftEl = document.getElementById('FT');
var vtEl = document.getElementById('VT');
var ftvtTable = document.getElementById('ftvtTable');
var pointsEl = document.getElementById('points');

var h = document.getElementById('hours');
var m = document.getElementById('minutes');
var s = document.getElementById('seconds');

var points = Number(localStorage.getItem('points')) || 0;
renderPoints();

document.addEventListener('secondsUpdated', (e) => renderTime(e.seconds));

if (localStorage.getItem('task')) { //if was running before
  var task = JSON.parse(localStorage.getItem('task'));
  taskInputEl.value = task.name;
  ftEl.checked = task.FT;
  vtEl.checked = !task.FT;
  timer = new Timer({seconds: task.duration}, {startTime: task.startTime, pastZero: !task.FT});
  start();
} else if (!localStorage.getItem('lastStopped')) { //if was not running before && was not stopped before (ie, first time running)
  localStorage.setItem('lastStopped', ((new Date()).getTime()/1000).toString());
}

function clearInputs() {
  taskInputEl.value = "";
  h.value = "";
  m.value = "";
  s.value = "";
  ftEl.checked = false;
  vtEl.checked = true;
}

function showHide(el, show=true) {
  if (show) {
    el.classList.remove("hidden");
    el.classList.add("shown");
  } else {
    el.classList.add("hidden");
    el.classList.remove("shown");
  }
}

function switchElements() {
  showHide(timeInputEl, !running);
  showHide(timerEl, running);
  showHide(stopButtonEl, running);
  showHide(pauseButtonEl, running);

  taskInputEl.disabled = running;
  buttonEl.value = running ? "Done" : "Go";
}

function cancel() {
  running = false;

  switchElements();
  buttonEl.disabled = false;

  //remove task from localstorage
  localStorage.removeItem('task');
  //add lastStopped to localstorage
  localStorage.setItem('lastStopped', ((new Date()).getTime()/1000).toString());

  //set styling back to normal
  ftEl.disabled = false;
  vtEl.disbled = false;
  ftvtTable.style.backgroundColor = 'transparent';
  ftvtTable.style.opacity = 1;

  //clear inputs
  clearInputs();

  //stop timer
  timer.pause()
  document.title = "Task Timer";
  console.log('Seconds elapsed:', timer.elapsed);
}

function pause() {
  if (running) {
    buttonEl.disabled = true;
    timer.pause();
    document.title = "paused";
    pauseButtonEl.value = "Resume";
    localStorage.setItem('lastStopped', ((new Date()).getTime()/1000).toString());
  } else {
    buttonEl.disabled = false;
    timer.start();
    pauseButtonEl.value = "Pause";
    localStorage.removeItem('lastStopped');
  }
  running = !running;
}

function updatePoints(pts) {
  points = pts;
  localStorage.setItem('points', pts.toString());
  renderPoints();
}

function renderPoints() {
  rounded = Math.round(points * 10) / 10;
  pointsEl.textContent = rounded.toFixed(1);
}

function renderTime() {
  timerEl.innerHTML = timer.toString()
  document.title = timer.toString("short");
}

function score() {
  var elapsedMinutes = timer.elapsed / 60;
  var estimateMinutes = timer.duration / 60;
  if (estimateMinutes == 0)
    estimateMinutes = 1/60;
  if (ftEl.checked) {
    points += elapsedMinutes;
  } else {
    var efficiency = (1 - (elapsedMinutes / (estimateMinutes))) * estimateMinutes;
    var effectiveness = 2; //todo figure out how to set/calculate this
    points += efficiency * effectiveness + 1/60;
  }
  if (points < 0)
    points = 0;
  updatePoints(points);
}

function start() {
  var duration = {
    hours: Number(h.value) || 0,
    minutes: Number(m.value) || 0,
    seconds: Number(s.value) || 0
  }

  //if timer is not running, task is not in localstorage, and duration in seconds is 0, exit
  //if timer is not in localstorage, this means that there was no task previously running
  if (!running && !localStorage.getItem('task') && Object.values(duration).reduce((a,b)=>a+b) == 0) {
    return
  }

  running = !running;

  switchElements();

  if (running) {
    //create timer if task does not exist in localstorage
    if (!localStorage.getItem('task')) {
      timer = new Timer(duration, { countdown: true, pastZero: !ftEl.checked });
      //save task to localstorage
      var currentTask = {
        name: taskInputEl.value,
        duration: timer.duration,
        startTime: timer.startTime,
        FT: ftEl.checked
      }
      localStorage.setItem('task', JSON.stringify(currentTask));
    }
    //set styling
    ftEl.disabled = true;
    vtEl.disbled = true;
    ftvtTable.style.backgroundColor = '#d8dcdc';
    ftvtTable.style.opacity = 0.7;

    //start timer
    timer.start();

    //remove lastStopped from localstorage
    localStorage.removeItem('lastStopped');
  } else {
    //remove task from localstorage
    localStorage.removeItem('task');

    //set styling back to normal
    ftEl.disabled = false;
    vtEl.disbled = false;
    ftvtTable.style.backgroundColor = 'transparent';
    ftvtTable.style.opacity = 1;

    //clear inputs
    clearInputs();

    //stop timer
    timer.pause()
    document.title = "Task Timer";

    //score task
    console.log('Seconds elapsed:', timer.elapsed);
    score();
    
    //add lastStopped to localstorage
    localStorage.setItem('lastStopped', ((new Date()).getTime()/1000).toString());
  }
}

//to incentivise doing tasks and penalize taking too long breaks
//points are lost at a rate of ~2 per minute if not doing a task
(function check() {
  if (!running) {
    var lastStopped = Number(localStorage.getItem('lastStopped'));
    var now = (new Date()).getTime()/1000;
    var diff = Math.floor((now - lastStopped) / 60);
    var currPoints = Number(localStorage.getItem('points'))
    localStorage.setItem('lastStopped', now.toString());
    console.log(currPoints, diff)
    updatePoints(Math.max(currPoints - diff*2, 0));
  }
  setTimeout(check, 1000*60);
})();