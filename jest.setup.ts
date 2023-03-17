import 'react-native-gesture-handler/jestSetup';

const setup = (): void => {
    jest.mock('react-native-reanimated', () => {
        const Reanimated = require('react-native-reanimated/mock');
        Reanimated.default.call = () => { };
        return Reanimated;
    });

    jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

}
export default setup;