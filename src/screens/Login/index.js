import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    TouchableOpacity,
    AsyncStorage,
    Alert,
    ActivityIndicator,
    Keyboard,
} from 'react-native';

import styles from './styles';
import {green} from '../../helpers/colors';
import {setUsername, setPassword, setLoading,} from '../../actions/loginScreenActions';

class LoginScreen extends Component {
    static navigationOptions = {
        header: false,
    };

    init = async () => {
        try {
            const username = await AsyncStorage.getItem('user');
            const {navigation, setLoading} = this.props;

            if (username) {
                navigation.navigate('Main', {username});
            } else {
                setLoading(false);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    login = async () => {
        try {
            const {username, password, navigation} = this.props;
            if (username && password) {
                await AsyncStorage.setItem('user', username);
                Keyboard.dismiss();
                navigation.navigate('Main', {username});
            } else {
                Alert.alert('Login error', 'Please fill in the fields.');
            }
        } catch (error) {
            Alert.alert('Login error', error.message);
        }
    };

    handlePasswordRef = (input) => this.passwordInput = input;

    passwordInputFocus = () => this.passwordInput.focus();

    componentDidMount() {
        this.init();
    }

    render() {
        const {loading, setUsername, setPassword} = this.props;

        if (loading) {
            return (
                <KeyboardAvoidingView behavior={'padding'} style={styles.wrapper}>
                    <ActivityIndicator size="large" color={green}/>
                </KeyboardAvoidingView>
            );
        }

        return (
            <KeyboardAvoidingView behavior={'padding'} style={styles.wrapper}>
                <View style={styles.logoContainer}>
                    <Text style={[styles.header]}>
                        <Text style={styles.blue}>{'<'} </Text>
                        epamer
                        <Text style={styles.blue}> {'>'}</Text>
                    </Text>
                </View>
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder='Username'
                        onChangeText={setUsername}
                        underlineColorAndroid='transparent'
                        autoCorrect={false}
                        autoCapitalize='none'
                        returnKeyType='next'
                        onSubmitEditing={this.passwordInputFocus}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder='Password'
                        onChangeText={setPassword}
                        underlineColorAndroid='transparent'
                        autoCorrect={false}
                        autoCapitalize='none'
                        secureTextEntry={true}
                        returnKeyType='go'
                        ref={this.handlePasswordRef}
                        onSubmitEditing={this.login}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.login}>
                        <Text style={styles.buttonText}>LOGIN</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const mapStateToProps = (state) => {
    return {...state.loginScreen};
};

const mapDispatchToProps = (dispatch) => {
    return {
        setUsername: (username) => dispatch(setUsername(username)),
        setPassword: (password) => dispatch(setPassword(password)),
        setLoading: (loading) => dispatch(setLoading(loading)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);