class timerCountDown {
    constructor(callback) {
        this.countdowns = [];
        this.callback = callback;
        this.timer = null;
        this.running = false;
    }

    init() {
        document.querySelectorAll('div.iweb-countdown').forEach(el => {
            const maxValue = parseInt(el.getAttribute('data-value'));
            const direction = el.getAttribute('data-direction') ?? 'down';
            const distance = direction === 'down' ? maxValue : 0;

            this.countdowns.push({
                el,
                maxValue,
                direction,
                distance,
                done: false
            });

            this.updateDisplay(el, distance);
        });

        this.start();
    }

    start() {
        if (this.timer) clearInterval(this.timer);
        this.running = true;

        this.timer = setInterval(() => {
            let allDone = true;

            this.countdowns.forEach(item => {
                if (item.done) return;

                if (item.direction === 'down') {
                    if (item.distance > 0) item.distance--;
                } else {
                    if (item.distance < item.maxValue) item.distance++;
                }

                this.updateDisplay(item.el, item.distance);

                if ((item.direction === 'down' && item.distance <= 0) ||
                    (item.direction === 'up' && item.distance >= item.maxValue)) {
                    item.done = true;
                    if (typeof this.callback === 'function') {
                        this.callback(item);
                    }
                }

                if (!item.done) allDone = false;
            });

            if (allDone) this.pause();
        }, 1000);
    }

    pause() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            this.running = false;
        }
    }

    resume() {
        if (!this.running) {
            this.start();
        }
    }

    reset(el) {
        const item = this.countdowns.find(c => c.el === el);
        if (item) {
            item.distance = item.direction === 'down' ? item.maxValue : 0;
            item.done = false;
            this.updateDisplay(item.el, item.distance);
            if (!this.running) this.resume();
        }
    }

    resetAll() {
        this.countdowns.forEach(item => {
            item.distance = item.direction === 'down' ? item.maxValue : 0;
            item.done = false;
            this.updateDisplay(item.el, item.distance);
        });
        if (!this.running) this.resume();
    }

    updateDisplay(el, distance) {
        let days = Math.floor(distance / (60 * 60 * 24));
        let hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
        let minutes = Math.floor((distance % (60 * 60)) / 60);
        let seconds = Math.floor(distance % 60);

        days = days < 10 ? '0' + days : days;
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        el.querySelector('.day > span').textContent = days;
        el.querySelector('.hour > span').textContent = hours;
        el.querySelector('.minute > span').textContent = minutes;
        el.querySelector('.second > span').textContent = seconds;
    }
}