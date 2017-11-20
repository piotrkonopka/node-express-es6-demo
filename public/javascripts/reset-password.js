class ResetPassword extends UserInterface {
    constructor() {
        super();
        super.noSubmitingFormName('user');
        super.labels = [
            { innerText: 'Set a new password',     name: 'panel-title' },
            { innerText: 'Go back to ',            name: 'go-back-paragraph' },
            { innerText: 'Login page',             name: 'go-back-link' }
        ];
        super.loadLabels();
    }
    
    postNewPassword() {
        this.makeRequest('PUT', window.location.pathname);
    }
}

let resetPassword = new ResetPassword();
