//be only able to do 1 task at a time
//- way to add new tasks onto "queue"
//- should save items todo in json, items already done do not need to be saved, score can be saved but not in json
//- should have some sort of simple js timer

var running = false;
var timer = new easytimer.Timer();

var taskInputEl = document.getElementById('theInput');
var timeInputEl = document.getElementById('timeInput');
var timerEl = document.getElementById('timer');
var buttonEl = document.getElementById('theButton');
var isFixedEl = document.getElementById('isFixed');
var pointsEl = document.getElementById('points');
var cancelTaskDiv = document.getElementById('cancelTaskDiv');

var h = document.getElementById('hours');
var m = document.getElementById('minutes');
var s = document.getElementById('seconds');

var startSeconds = 0;
var totalSecondsTaken = 0;
var points = Number(localStorage.getItem('points')) || 0;
renderPoints();

timer.addEventListener('secondsUpdated', function(e) {
  renderTime();
  var seconds = timer.getTotalTimeValues().seconds;
  if (seconds == 0) {
    timer.stop()
    if (!isFixedEl.checked) {
      totalSecondsTaken += startSeconds;
      timer.start({ countdown: false });
    }
  }
});

function showHide(el) {
  if (el.classList.contains("hidden")) {
    el.classList.remove("hidden");
    el.classList.add("shown");
  } else {
    el.classList.add("hidden");
    el.classList.remove("shown");
  }
}

function switchElements(started) {
  showHide(timeInputEl);
  showHide(timerEl);
  showHide(cancelTaskDiv);

  isFixedEl.disabled = started;
  taskInputEl.disabled = started;
  buttonEl.value = started ? " Done " : " Go ";
}

function cancelTask() {
  running = false;

  switchElements(running);

  timer.stop();
  document.title = "Task Timer";
  h.value = '';
}

function resetPoints() {
  if (confirm('Are you sure you want to reset your points?')) {
    points = 0;
    localStorage.setItem('points', points.toString());
    renderPoints();
  }
}

function renderPoints() {
  rounded = Math.round(points * 100) / 100;
  pointsEl.textContent = rounded.toFixed(2);
}

function renderTime() {
  var c = timer.getConfig().countdown;
  var timerText = timer.getTimeValues().toString()
  var seconds = timer.getTotalTimeValues().seconds;
  timerEl.innerHTML = c ? timerText : '-' + timerText;
  if (seconds / 3600 > 1) {
    timerText = timerText;
  } else if (seconds / 60 > 1) {
    timerText = timerText.slice(3);
  } else {
    timerText = timerText.slice(6);
  }
  document.title = c ? timerText : '-' + timerText;
}

function score(timeTaken, estimate, isFixed) {
  var timeTakenMinutes = timeTaken / 60;
  var estimateMinutes = estimate / 60;
  if (isFixed) {
    var isMeditation = taskInputEl.value.trim().toLowerCase() == "meditate" || taskInputEl.value.trim().toLowerCase() == "meditation";
    var mulitplier = isMeditation ? 10 : 1;
    points += timeTakenMinutes * mulitplier;
  } else {
    var efficiency = (1 - (timeTakenMinutes / (estimateMinutes))) * estimateMinutes + 1 / 60;
    var effective = 4;
    points += efficiency * effective;
  }
  if (points < 0)
    points = 0;
  localStorage.setItem('points', points.toString());
  renderPoints()
}

function start() {
  running = !running;

  var hours = Number(h.value);
  var minutes = Number(m.value);
  var seconds = Number(s.value);

  if (hours + minutes + seconds == 0) {
    running = !running;
    return
  }

  switchElements(running);

  if (running) {
    //if start task
    timer.start({ countdown: true, startValues: { hours: hours, minutes: minutes, seconds: seconds } });
    startSeconds = timer.getTotalTimeValues().seconds;
    renderTime();
  } else {
    //if stop task
    if (totalSecondsTaken == 0) {
      totalSecondsTaken = startSeconds - timer.getTotalTimeValues().seconds;
    } else {
      totalSecondsTaken += timer.getTotalTimeValues().seconds;
    }
    timer.stop()
    document.title = "Task Timer";
    console.log('Seconds elapsed:', totalSecondsTaken);
    score(totalSecondsTaken, startSeconds, isFixedEl.checked)
    totalSecondsTaken = 0;
    h.value = '';
  }
}

setInterval(() => {
  if (!running) {
    points -= 40 / 60;
    if (points < 0)
      points = 0;
    localStorage.setItem('points', points.toString());
    renderPoints()
  }
}, 20 * 1000)