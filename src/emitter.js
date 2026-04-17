const emitter = {
    events: {},

    on(event, cb) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(cb);
    },

    off(event, cb) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(fn => fn !== cb);
        }
    },

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(function(fn) {
                fn(data);
            });
        }
    }
};

export default emitter;