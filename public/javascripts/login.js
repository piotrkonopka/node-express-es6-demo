class Login extends UserInterface {
    constructor() {
        super();
        super.noSubmitingFormName('user');
        super.labels = [
            { innerText: 'Login',                       name: 'panel-title' },
            { innerText: 'Forgot password?',            name: 'panel-link' },
            { innerText: 'Don\'t have an account? ',    name: 'sign-up-paragraph' },
            { innerText: 'Sign Up',                     name: 'sign-up-link' }
        ];
        super.loadLabels();
    }
    
    postLoginData() {
        this.makeRequest('POST', '/user/login');
    }
}

let login = new Login();
