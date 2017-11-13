class MessagesHistory {
    constructor(max_length) {
        this.messages = [];
        this.max_length = max_length;
    }
    
    get length() {
        return this.messages.length;
    }

    get all() {
        return this.messages;
    }

    add(message) {
        if(this.messages.length >= this.max_length) {
            this.remove_oldest();
        }
        
        this.messages.push(message);
    }

    remove_oldest() {
        return this.messages.shift();
    }
};

module.exports = MessagesHistory;
