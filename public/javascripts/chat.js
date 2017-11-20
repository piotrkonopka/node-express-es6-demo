class Chat extends UserInterface {
    constructor() {
        super();
        super.loadNavigationBarData();
        super.labels = [
            { innerText: ' Chat', name: 'panel-title' }
        ];
        super.loadLabels();
        
        this.messages = [];
        this.loggedUsers = 0;
        this.newMessage = '';
        this.username = '';
        this.avatarSrc = '';
        this.socket = io();

        this.socket.on('new message', this.addMessage.bind(this));
        this.socket.on('user joined', this.updateUsersCounter.bind(this));
        this.socket.on('user left', this.updateUsersCounter.bind(this));
        this.socket.on('login', this.login.bind(this));

        this.messages.push = (response) => {
            Array.prototype.push.apply(this.messages, [response]);
            this.updateChatbox(response);
        };

        this.noSubmiting();
        this.bindEnterKeyWithSendBtn();
        this.loadUserData();
        this.joinChat();
    }
    
    noSubmiting() {
        document.getElementById('form')
            .addEventListener('submit', (event) => {
                event.preventDefault();
            });
    }
    
    bindEnterKeyWithSendBtn() {
        let ENTER_KEY_CODE = 13;
        
        document.getElementById('input')
            .addEventListener('keyup', (event) => {
                event.preventDefault();
        
                if (event.keyCode === ENTER_KEY_CODE) {
                    document.getElementById('send').click();
                }
            });
    }
    
    loadUserData() {
        this.username = sessionStorage.username;
        
        if (this.isDefined(sessionStorage.userImage)) {
            this.avatarSrc = `../images/uploads/${sessionStorage.userImage}`;
        } else {
            this.avatarSrc = '../images/Default-avatar.jpg';
        }
    }
    
    updateChatbox(response) {
        let messages = document.getElementById('messages');
        let profileLink = `/profile?token=${sessionStorage.userToken}&username=${response.user.username}`;

        let content = `
            <div class="media-left">
                <a href="${profileLink}">
                    <img class="media-object img-circle" src="${response.user.avatar}" alt="Avatar">
                </a>
            </div>
            <div class="media-body clearfix">
                <div class="media-heading">
                    <div class="pull-left">
                        <a href="${profileLink}">
                            ${response.user.username}
                        </a>
                    </div>
                    <div class="pull-right clearfix">
                        <span class="glyphicon glyphicon-time"></span> ${response.date}
                    </div>
                </div>
                <p>${ xssFilters.inHTMLData(response.message) }</p>
            </div>
            <hr />
        `;

        let newMessage = document.createElement('li');
        newMessage.classList = 'media';
        newMessage.innerHTML = content;

        messages.appendChild(newMessage);

        let chatBox = document.getElementsByClassName('chat-box')[0];
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    updateUsersCounter(data) {
        this.loggedUsers = data.loggedUsers;

        let usersCounter = document.getElementById('usersCounter');
        usersCounter.innerHTML = `
            <span class="glyphicon glyphicon-user"></span> 
            ${this.loggedUsers} ${this.loggedUsers === 1 ? 'user' : 'users'}
        `;
    }
    
    login(data) {
        this.updateUsersCounter(data);
        
        if(this.isDefined(data.chatHistory)) {
            let length = data.chatHistory.length;
            for(let i = 0; i < length; i++) {
                this.updateChatbox(data.chatHistory[i]);
            }
        }
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
