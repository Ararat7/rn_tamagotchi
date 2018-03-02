const initialState = {
    username: '',
    password: '',
    loading: true,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USERNAME':
            return {...state, username: action.username,};
        case 'SET_PASSWORD':
            return {...state, password: action.password,};
        case 'SET_LOADING':
            return {...state, loading: action.loading,};
        case 'LOGOUT':
            return {...state, username: '', password: '',};
        default:
            return state;
    }
};