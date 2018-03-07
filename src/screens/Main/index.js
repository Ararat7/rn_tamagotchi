import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
    View,
    Text,
    Image,
    AsyncStorage,
    TouchableHighlight,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
    Alert,
} from 'react-native';
import Permissions from 'react-native-permissions';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import BackgroundTask from 'react-native-background-task';

import ActionsOverlay from '../../components/Actions';
import Progressbar from '../../components/Progressbar';
import styles from './styles';
import {green, raspberry, white, lightGrey, BUTTON_COLORS, BACKGROUND_COLORS} from '../../helpers/colors';
import {
    openActions,
    closeActions,
    logout,
    changeProgress,
    changeImage,
} from '../../actions/mainScreenActions';
import {setPosition, fetchWeather} from '../../actions/commonActions';

const WINDOW_WIDTH = Dimensions.get('window').width;

class MainScreen extends Component {
    // redux was added for handling state from static method
    static navigationOptions = ({navigation}) => {
        const username = navigation.state.params.username || 'unknown';

        return {
            title: 'epamer',
            headerLeft: null,
            headerRight: (
                <TouchableHighlight onPress={() => {
                    navigation.navigate('About', {username})
                }}>
                    <Icon name="ios-contact-outline" size={32} color={white}/>
                </TouchableHighlight>
            ),
            headerTitle: (
                <Text style={styles.headerTitle}>
                    <Text style={styles.blue}>{'<'} </Text>
                    epamer
                    <Text style={styles.blue}> {'>'}</Text>
                </Text>
            ),
            headerStyle: {
                backgroundColor: 'rgba(0, 0, 0, .7)',
                paddingHorizontal: 12,
            },
            headerTitleStyle: {
                color: white,
                marginLeft: 0,
                textAlign: 'center',
            },
            headerTintColor: white,
        };
    };

    constructor(props) {
        super(...arguments);

        const position = new Animated.ValueXY();
        const initialPosition = JSON.parse(JSON.stringify(position));   // save initial position

        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({x: gesture.dx, y: gesture.dy,});
            },
            onPanResponderRelease: (event, gesture) => {
                Animated.spring(position, {
                    toValue: {x: initialPosition.x, y: initialPosition.y,}
                }).start();
            },
        });

        const bgColorInterpolated = position.x.interpolate({
            inputRange: [-WINDOW_WIDTH, 0, WINDOW_WIDTH],
            outputRange: [raspberry, BACKGROUND_COLORS[props.theme] || lightGrey, green]
        });

        this.position = position;
        this.panResponder = panResponder;
        this.bgColorInterpolated = bgColorInterpolated;
        this.defaultImage = require('../../assets/images/development.png');
    }

    getImageStyle = () => {
        return this.position.getLayout();
    };

    onActionPress = (action) => {   // temporary
        let progress;
        switch (action) {
            case 'home':
                progress = {personal: 90};
                break;
            case 'work':
                progress = {projectActivities: 95};
                break;
            case 'soft':
                progress = {softSkills: 100};
                break;
            case 'hard':
                progress = {hardSkills: 80};
                break;
            default:
                break;
        }

        return progress && this.props.changeProgress(progress);
    };

    pickImage = () => {
        ImagePicker.showImagePicker({
            cameraType: 'front',
            mediaType: 'photo',
            maxWidth: 512,
            maxHeight: 512,
            quality: .5,
            allowsEditing: true,
            storageOptions: {
                skipBackup: true,
                path: 'rn_tamagotchi',
            },
        }, (response) => {
            if (response.didCancel) {
                // User cancelled image picker
            } else if (response.error) {
                Alert.alert('Error', response.error);
            } else if (response.customButton) {
                // User tapped custom button: response.customButton
            } else {
                AsyncStorage.setItem('imageURI', response.uri);
                this.props.changeImage(response.uri);
            }
        });
    };

    async getPosition() {
        const status = await Permissions.request('location', {type: 'always'});
        this.hasLocationPermission = status === 'authorized';

        return new Promise((resolve, reject) => {
            if (!this.hasLocationPermission) {
                reject(new Error('No location permission!'));
            }

            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position);
            }, (error) => {
                reject(error);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 1000,
            });
        });
    }

    async initProgress() {
        let progress = await AsyncStorage.getItem('progress');

        if (progress) {
            progress = JSON.parse(progress);
        } else {
            progress = {
                personal: 50,
                projectActivities: 50,
                softSkills: 50,
                hardSkills: 50,
            };
        }

        this.updateProgress(progress);
    }

    async updateProgress(progress) {
        await AsyncStorage.setItem('progress', JSON.stringify(progress));
        this.props.changeProgress(progress);
    }

    static async checkStatus() {
        const status = await BackgroundTask.statusAsync();

        if (status.available) {
            // Everything's fine
            return
        }

        const reason = status.unavailableReason;
        if (reason === BackgroundTask.UNAVAILABLE_DENIED) {
            Alert.alert('Denied', 'Please enable background "Background App Refresh" for this app');
        } else if (reason === BackgroundTask.UNAVAILABLE_RESTRICTED) {
            Alert.alert('Restricted', 'Background tasks are restricted on your device');
        }
    }

    logout = async () => {
        await AsyncStorage.setItem('user', '');
        this.props.navigation.navigate('Login');
        this.props.logout();
    };

    async componentWillMount() {
        try {
            const imageURI = await AsyncStorage.getItem('imageURI');
            imageURI && this.props.changeImage(imageURI);

            const status = await Permissions.request('camera', {type: 'always'});
            this.hasCameraPermission = status === 'authorized';

            const position = await this.getPosition();
            if (position) {
                this.props.setPosition(position);
                this.props.fetchWeather(position);
            }

            await this.initProgress();
            BackgroundTask.schedule({
                period: 900,    // 15 min
            });
            // Optional: Check if the device is blocking background tasks or not
            MainScreen.checkStatus();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    }

    render() {
        const {
            actionsVisible,
            personal,
            projectActivities,
            softSkills,
            hardSkills,
            closeActions,
            openActions,
            navigation,
            imageURI,
            theme,
        } = this.props;
        const imageSrc = imageURI ? {uri: imageURI} : this.defaultImage;

        return (
            <Animated.View
                style={[styles.container, {backgroundColor: BACKGROUND_COLORS[theme]}, {backgroundColor: this.bgColorInterpolated}]}>
                <ActionsOverlay
                    onActionPress={this.onActionPress}
                    username={navigation.state.params.username}
                    actionsVisible={actionsVisible}
                    closeActions={closeActions}
                />
                <View style={styles.content}>
                    <View style={styles.imageWrapper}>
                        <Animated.View
                            style={this.getImageStyle()}
                            {...this.panResponder.panHandlers}
                        >
                            <Image
                                style={{width: 256, height: 256}}
                                source={imageSrc}
                            />
                        </Animated.View>
                    </View>
                    <View style={styles.progressWrapper}>
                        <Progressbar label={'Personal'} value={personal} theme={theme}/>
                        <Progressbar label={'Project activities'} value={projectActivities} theme={theme}/>
                        <Progressbar label={'Soft skills'} value={softSkills} theme={theme}/>
                        <Progressbar label={'Hard skills'} value={hardSkills} theme={theme}/>
                    </View>
                    <View style={styles.buttonsWrapper}>
                        <TouchableOpacity
                            style={[styles.button, {backgroundColor: BUTTON_COLORS[theme]}]}
                            onPress={openActions}>
                            <Text style={styles.buttonText}>Actions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, {backgroundColor: BUTTON_COLORS[theme]}]}
                            onPress={this.pickImage}
                        >
                            <Text style={styles.buttonText}>Change image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, {backgroundColor: BUTTON_COLORS[theme]}]}
                            onPress={this.logout}>
                            <Text style={styles.buttonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    }
}

const mapStateToProps = (state) => {
    return {...state.mainScreen, ...state.common};
};

const mapDispatchToProps = (dispatch) => {
    return {
        openActions: () => dispatch(openActions()),
        closeActions: () => dispatch(closeActions()),
        logout: () => dispatch(logout()),
        changeProgress: (progress) => dispatch(changeProgress(progress)),
        changeImage: (imageURI) => dispatch(changeImage(imageURI)),
        setPosition: (position) => dispatch(setPosition(position)),
        fetchWeather: (position) => dispatch(fetchWeather(position)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);