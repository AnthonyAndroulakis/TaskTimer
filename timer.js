//t = new Timer({duration: {minutes:5, seconds: 24}, pastZero: true});
//t.start();

class Timer {
  /**
   * Creates a new `Timer`.
   * 
   * @param {Object}  duration duration of countdown timer
   * @param {Number}  duration.hours hours
   * @param {Number}  duration.minutes minutes
   * @param {Number}  duration.seconds seconds
   * @param {Object}  [options] extra options
   * @param {Boolean} [options.pastZero] go past zero, defaults to true
   * @param {Number}  [options.startTime] start time in unix seconds. Defaults to (new Date().getTime())/1000.
   */
    constructor(duration, options) {
        this.options = options || {};
        this.pastZero = !!this.options.pastZero;

        //convert duration to seconds
        var hours = duration.hours || 0;
        var minutes = duration.minutes || 0;
        var seconds = duration.seconds || 0;
        this.duration = this.seconds = hours * 3600 + minutes * 60 + seconds;

        //start time in unix seconds + time elapsed in seconds
        if (this.options.startTime) {
            this.startTime = this.options.startTime;
            this.elapsed = (new Date().getTime())/1000 - this.startTime;
            this.seconds -= this.elapsed;
            if (!this.pastZero && this.seconds < 0) {
                this.elapsed = this.duration;
                this.seconds = 0;
            }
        } else {
            this.startTime = (new Date().getTime())/1000;
            this.elapsed = 0;
        }

        //interval timer
        this.timer;

        //bug fix
        this._countdown = this._countdown.bind(this);
    }

    /**
     * @private
     * dispatch secondsUpdated event
     */
    _dispatchSecondsUpdated() {
        var event = new CustomEvent('secondsUpdated', { detail: { seconds: this.seconds } });
        document.dispatchEvent(event);
    }

    /**
     * @private
     * countdown function
    */
    _countdown() {
        this.seconds--;
        this.elapsed++;
        this._dispatchSecondsUpdated();
        if (this.seconds == 0 && !this.pastZero) {
            this.pause();
        }
    }

    /**
     * Start the timer.
    */
    start() {
        this._dispatchSecondsUpdated();
        if (this.seconds == 0 && !this.pastZero)
            return;
        this.timer = setInterval(this._countdown, 1000);
    }

    /**
     * Pause/Stop the timer.
     */
    pause() {
        clearInterval(this.timer);
    }

    /**
     * Convert the seconds to a string.
     * 
     * @param {String} [format] format of string. "long" or "short". Defaults to "long".
     * @returns {String} string of time
    */
    toString(format = "long") {
        //convert seconds to hours, minutes, seconds and return string with : between
        var posSeconds = Math.floor(Math.abs(this.seconds));
        var hours = Math.floor(posSeconds / 3600);
        var minutes = Math.floor((posSeconds - hours * 3600) / 60);
        var seconds = posSeconds - hours * 3600 - minutes * 60;
        var ret;
        
        //add leading 0 if needed
        var formatted = [hours, minutes, seconds].map(n => n.toLocaleString('en-US', {minimumIntegerDigits:2}))

        //format string long/short
        if (format == "short") {
            if (hours > 0)
                ret = `${formatted[0]}:${formatted[1]}:${formatted[2]}`;
            else if (minutes > 0)
                ret = `${formatted[1]}:${formatted[2]}`;
            else
                ret = `${formatted[2]}`;
        } else {
            ret = `${formatted[0]}:${formatted[1]}:${formatted[2]}`;
        }

        //add negative sign if time is negative
        if (this.seconds < 0)
            ret = '-' + ret;
        return ret;
    }
}
