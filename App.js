import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import BackgroundTask from 'react-native-background-task';

import AppReducer from './src/reducers/appReducer';
import AppWithNavigationState, {middleware} from './src/AppNavigator';
import {AsyncStorage} from "react-native";

const DECREASE_AMOUNT = 5;

BackgroundTask.define(async () => {
    let isProgressCritical = false;
    let progress = await AsyncStorage.getItem('progress');

    if (!progress) {
        return;
    }

    progress = JSON.parse(progress);

    for (let key of progress) {
        if (progress[key]) {
            if (progress[key] >= DECREASE_AMOUNT) {
                progress[key] -= DECREASE_AMOUNT;
            }
            if (progress[key] < 3 * DECREASE_AMOUNT) {
                isProgressCritical = true;
            }
        }
    }

    if (isProgressCritical) {
        // show notification
    }

    await AsyncStorage.setItem('progress', JSON.stringify(progress));

    BackgroundTask.finish();
});

class App extends React.Component {
    constructor(props) {
        super(props);
        this.store = createStore(AppReducer, applyMiddleware(middleware, thunk));
    }

    render() {
        return (
            <Provider store={this.store}>
                <AppWithNavigationState />
            </Provider>
        );
    }
}

export default App;