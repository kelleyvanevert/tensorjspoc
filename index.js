import 'react-native-gesture-handler';
import {AppRegistry, LogBox} from 'react-native';
import nl from 'date-fns/locale/nl';
import setDefaultOptions from 'date-fns/setDefaultOptions';
import {App} from './App';
import {name as appName} from './app.json';

setDefaultOptions({
  locale: nl,
});

AppRegistry.registerComponent(appName, () => App);
