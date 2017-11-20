class Signup extends UserInterface {
    constructor() {
        super();
        super.noSubmitingFormName('user');
        super.labels = [
            { innerText: 'Create an account',                   name: 'panel-title' },
            { innerText: 'Do you allready have an account? ',   name: 'go-back-paragraph' },
            { innerText: 'Log In',                              name: 'go-back-link' }
        ];
        super.loadLabels();
    }
    
    postSignUpData() {
        this.makeRequest('POST', '/user/signup');
    }
}

let signup = new Signup();
