import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableHighlight,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import styles from './styles';
import {white, blue, grey} from '../../helpers/colors';

const STATE_COLORS = {
    active: blue,
    inactive: grey,
    default: white,
};

export default class Action extends Component {
    render() {
        const {onPress, iconName, iconText, iconSize, state} = this.props;
        const color = STATE_COLORS[state] || white;

        return (
            <TouchableHighlight
                style={styles.iconContainer}
                onPress={onPress}
            >
                <View>
                    <View style={[styles.icon, {borderColor: color,}]}>
                        <Icon name={iconName} size={iconSize} color={color}/>
                    </View>
                    <View>
                        <Text style={styles.iconText}>{iconText}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }
}