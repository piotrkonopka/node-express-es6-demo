class UserInterface {
    constructor() {
        this.validAvatar = false;
        this.uploadedAvatar = null;
        this.labels = [];
        this.navBarLinks = {
            chat: {
                label: 'Chat',
                href: '/chat'
            },
            profile: {
                label: 'Logged as ',
                href: '/profile'
            }
        };
    }
    
    loadLabels() {
        this.labels.map((label) => {
            let element = document.getElementsByName(label.name)[0];
            element.innerText = label.innerText;
        });
    }
    
    isDefined(target) {
        return typeof(target) !== 'undefined';
    }
    
    noSubmitingFormName(form_name) {
        let form = document.getElementsByName(form_name)[0];
        form.addEventListener('submit', (event) => {
                event.preventDefault();
        });
    }
    
    login(xhttp) {
        this.saveUserData(xhttp);
        
        window.location.href = `/chat?token=${sessionStorage.userToken}`;
    }
    
    saveUserData(xhttp) {
        let response = JSON.parse(xhttp.responseText);

        if (this.isDefined(response.user.username)) {
            sessionStorage.username = response.user.username;
        }

        if (this.isDefined(response.user.email)) {
            sessionStorage.userEmail = response.user.email;
        }

        if (this.isDefined(response.user.bio)) {
            sessionStorage.userBio = response.user.bio;
        }

        if (this.isDefined(response.user.image)) {
            sessionStorage.userImage = response.user.image;
        }

        if (this.isDefined(response.user.token)) {
            sessionStorage.userToken = response.user.token;

        } else {
            console.error('Something went wrong. No token - no access, sorry.');
        }
    }
    
    postToken(method, destination) {
        let xhttp = new XMLHttpRequest();
        xhttp.open(method, destination, true);

        if(this.isDefined(Storage)) {
            xhttp.setRequestHeader('Authorization', 'Token ' + sessionStorage.userToken);
        }
        else {
            console.error('Sorry, your browser does not support web storage...');
            return;
        }

        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === XMLHttpRequest.DONE) {
                if (xhttp.status === 200) {
                    sessionStorage.removeItem('username');
                    sessionStorage.removeItem('userEmail');
                    sessionStorage.removeItem('userBio');
                    sessionStorage.removeItem('userImage');
                    sessionStorage.removeItem('userToken');

                    window.location.href = '/login';

                } else {
                    this.errorAlert(xhttp);
                }
            }
        };

        xhttp.send();
    }
    
    logout() {
        this.postToken('POST','/logout');
    }
    
    showAlert(xhttp) {
        let alert = document.getElementsByClassName('alert')[0];
        let responseObj = JSON.parse(xhttp.responseText);
        let response = responseObj.message || responseObj.messages || responseObj.errors;

        alert.className = 'alert col-sm-12 alert-danger';
        alert.style.display = 'inline';

        if(this.isDefined(responseObj.message)) {
            alert.innerHTML = `${response}`;

        } else {
            let name = Object.keys(response)[0];
            let description = Object.values(response)[0];

            alert.innerHTML = `${name}: ${description}`;

            if(this.isDefined(responseObj.messages)) {
                alert.className = 'alert col-sm-12 alert-success';
            } 
        }

    }

    customAlert(message) {
        let alert = document.getElementsByClassName('alert')[0];

        alert.innerHTML = message;
        alert.className = 'alert col-sm-12 alert-danger';
        alert.style.display = 'inline';
    }

    succesResponse(xhttp) {
        let response = JSON.parse(xhttp.responseText);

        if(this.isDefined(response.user)) {
            if(this.isDefined(response.redirectTo)){
                this.saveUserData(xhttp);
                window.location.href = `${response.redirectTo}?token=${sessionStorage.userToken}`;
            } else {
                this.login(xhttp);
            }
        } else {
            this.successAlert(xhttp);
        }
    }

    successAlert(xhttp) {
        this.showAlert(xhttp);
    }

    validationErrorAlert(xhttp) {
        this.showAlert(xhttp);
    }

    unprocessableEntityAlert(xhttp) {
        this.showAlert(xhttp);
    }

    errorAlert(xhttp) {
        console.error(xhttp.responseText);
    }

    makeRequest(method, destination) {
        let xhttp = new XMLHttpRequest();
        xhttp.open(method, destination, true);

        if(this.isDefined(Storage)) {
            if(this.isDefined(sessionStorage.userToken)) {
                xhttp.setRequestHeader('Authorization', `Token ${sessionStorage.userToken}`);
            }
        }
        else {
            console.error('Sorry, your browser does not support web storage.');
            return;
        }

        xhttp.onreadystatechange = () => {
            if(xhttp.readyState === XMLHttpRequest.DONE) {
                if (xhttp.status === 200) {
                    this.succesResponse(xhttp);

                } else if (xhttp.status === 400) {
                    this.validationErrorAlert(xhttp);

                } else if (xhttp.status === 422) {
                    this.unprocessableEntityAlert(xhttp);

                } else if (xhttp.status === 500) {
                    this.errorAlert(xhttp);
                }            
            }
        };

        let form = document.getElementsByName('user')[0];
        let fd = new FormData();

        if(this.isDefined(form.elements.username) && form.elements.username.value !== '') {
            fd.append('username', form.elements.username.value);
        }

        if(this.isDefined(form.elements.email) && form.elements.email.value !== '') {
            fd.append('email', form.elements.email.value);
        }

        if(this.isDefined(form.elements.password) && form.elements.password.value !== '') {
            fd.append('password', form.elements.password.value);
        }

        if(this.isDefined(form.elements.bio) && form.elements.bio.value !== '') {
            fd.append('bio', form.elements.bio.value);
        }

        if(this.validAvatar) {
            fd.append('avatar', this.uploadedAvatar);
        }

        if(this.isDefined(form.elements['g-recaptcha-response'])) {
            if(form.elements['g-recaptcha-response'].value !== '') {
                fd.append('g-recaptcha-response', form.elements['g-recaptcha-response'].value);
            } else {
                return this.customAlert('You forgot about reCAPTCHA');
            }
        } 

        xhttp.send(fd);
    }

    loadNavigationBarData() {
        if(this.isDefined(Storage)) {
            let pageTitle = document.getElementsByName('page-title')[0];
            let myUsername = document.getElementsByName('my-username')[0];
            let myUsernameLabel = document.getElementsByName('my-username-label')[0];
            let chatLink = document.getElementsByName('chat-link')[0];

            if (this.isDefined(sessionStorage.userToken)) {
                pageTitle.innerHTML = window.location.pathname.slice(1).replace('/', ' | ');
                chatLink.href = `${this.navBarLinks.chat.href}?token=${sessionStorage.userToken}`;
                chatLink.text = this.navBarLinks.chat.label;
                myUsername.innerHTML = `${sessionStorage.username} `;
                myUsername.href = `${this.navBarLinks.profile.href}?token=${sessionStorage.userToken}`;
                myUsernameLabel.innerText = this.navBarLinks.profile.label;

            } else {
                window.location.href = '/login';
            }
        }
    }
}

let ui = new UserInterface();
