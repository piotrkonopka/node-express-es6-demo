class LoginHelp extends UserInterface {
    constructor() {
        super();
        super.noSubmitingFormName('user');
        super.labels = [
            { innerText: 'Reset password', name: 'panel-title' },
            { innerText: 'Go back to ',    name: 'go-back-paragraph' },
            { innerText: 'Login page',     name: 'go-back-link' }
        ];
        super.loadLabels();
    }
    
    sendResetPasswordRequest() {
        this.makeRequest('POST', '/user/reset/password');
    } 
}

let loginHelp = new LoginHelp();
