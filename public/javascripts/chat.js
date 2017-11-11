class Chat {
    constructor() {
        this.messages = [];
        this.loggedUsers = 0;
        this.newMessage = '';
        this.username = '';
        this.avatarSrc = '';
        this.socket = io();

        this.socket.on('new message', this.addMessage.bind(this));
        this.socket.on('user joined', this.updateUsersCounter.bind(this));
        this.socket.on('user left', this.updateUsersCounter.bind(this));
        this.socket.on('login', this.updateUsersCounter.bind(this));

        this.messages.push = (response) => {
            Array.prototype.push.apply(this.messages, [response]);
            this.updateChatbox(response);
        };

        this.loadUserData();
        this.joinChat();
    }
    
    loadUserData() {
        this.username = sessionStorage.username;
        
        if (isDefined(sessionStorage.userImage)) {
            this.avatarSrc = `../images/uploads/${sessionStorage.userImage}`;
        } else {
            this.avatarSrc = '../images/Default-avatar.jpg';
        }
    }
    
    updateChatbox(response) {
        let messages = document.getElementById('messages');

        let content = `
            <div class="media-left">
                <a href="">
                    <img class="media-object img-circle" src="${response.user.avatar}" alt="Avatar">
                </a>
            </div>
            <div class="media-body clearfix">
                <div class="media-heading">
                    <div class="pull-left">
                        <a href="">
                            ${response.user.username}
                        </a>
                    </div>
                    <div class="pull-right clearfix">
                        <span class="glyphicon glyphicon-time"></span> ${response.date}
                    </div>
                </div>
                <p>${response.message}</p>
            </div>
            <hr />
        `;

        let newMessage = document.createElement('li');
        newMessage.classList = 'media';
        newMessage.innerHTML = content;

        messages.appendChild(newMessage);

        let chatBox = document.getElementsByClassName('chat-box')[0];
        chatBox.scrollTop = chatBox.scrollHeigh;
    }

    updateUsersCounter(data) {
        this.loggedUsers = data.loggedUsers;

        let usersCounter = document.getElementById('usersCounter');
        usersCounter.innerHTML = `
            <span class="glyphicon glyphicon-user"></span> 
            ${this.loggedUsers} user(s)
        `;
    }

    addMessage(data) {
        this.messages.push(data);
    }

    send() {
        if (this.newMessage === '') {
            return;
        }

        this.socket.emit('new message', { message: this.newMessage, avatar: this.avatarSrc });

        this.addMessage({
            user: { username: this.username, avatar: this.avatarSrc },
            message: this.newMessage,
            date: new Date().toUTCString()
        });

        this.newMessage = '';
    }

    sendMessage() {
        let input = document.getElementById('input');

        this.newMessage = input.value;
        this.send();

        input.value = this.newMessage;
    }

    joinChat() {
        if (this.username !== '' && this.username.length > 3) {
            this.socket.emit('add user', this.username);
        }
    }
}

let chat = new Chat();
