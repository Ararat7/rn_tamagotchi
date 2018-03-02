import React, {Component} from 'react';
import {
    View,
    Text,
    Modal,
    TouchableHighlight,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import styles from './styles';
import {white} from '../../helpers/colors';
import Action from './action';

export default class ActionsOverlay extends Component {

    handleActionHome = () => this.props.onActionPress('home');
    handleActionWork = () => this.props.onActionPress('work');
    handleActionASMT = () => this.props.onActionPress('asmt');
    handleActionSoft = () => this.props.onActionPress('soft');
    handleActionHard = () => this.props.onActionPress('hard');
    handleActionDocs = () => this.props.onActionPress('docs');


    render() {
        const {username, actionsVisible, closeActions} = this.props;

        return (
            <Modal
                // transparent={true}
                visible={actionsVisible}
                animationType={'slide'}
                onRequestClose={closeActions}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.innerContainer}>
                        <View style={styles.crossIconWrapper}>
                            <TouchableHighlight
                                style={{padding: 5}}
                                onPress={closeActions}>
                                <Icon name="ios-close-circle-outline" size={40} color={white}/>
                            </TouchableHighlight>
                        </View>
                        <View>
                            <Text style={styles.title}>
                                <Text style={styles.blue}>{'<'} </Text>
                                {username}
                                <Text style={styles.blue}> {'>'}</Text>
                            </Text>
                            <Text style={styles.subtitle}>
                                Software Engineer
                            </Text>
                        </View>
                        <View>
                            <View style={styles.iconsWrapper}>
                                <Action
                                    onPress={this.handleActionHome}
                                    iconName={'md-home'}
                                    iconSize={50}
                                    iconText={'Home'}
                                />
                                <Action
                                    onPress={this.handleActionWork}
                                    state={'active'}
                                    iconName={'md-briefcase'}
                                    iconSize={46}
                                    iconText={'Work'}
                                />
                                <Action
                                    onPress={this.handleActionASMT}
                                    state={'inactive'}
                                    iconName={'md-star'}
                                    iconSize={50}
                                    iconText={'ASMT'}
                                />
                                <Action
                                    onPress={this.handleActionSoft}
                                    iconName={'md-chatbubbles'}
                                    iconSize={44}
                                    iconText={'Soft'}
                                />
                                <Action
                                    onPress={this.handleActionHard}
                                    iconName={'md-code-working'}
                                    iconSize={50}
                                    iconText={'Hard'}
                                />
                                <Action
                                    onPress={this.handleActionDocs}
                                    iconName={'md-document'}
                                    iconSize={48}
                                    iconText={'Docs'}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}