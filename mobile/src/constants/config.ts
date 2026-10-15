import { Platform } from 'react-native';

/**
 * For Android physical devices connected via USB, run:
 *   adb reverse tcp:5000 tcp:5000
 * which maps http://localhost:5000 directly to your PC's backend.
 *
 * For wireless testing on the same Wi-Fi network, you can use your PC's LAN IP:
 *   e.g. 'http://192.168.1.42:5000/api'
 */
export const API_BASE_URL = Platform.select({
  android: 'http://localhost:5000/api',
  ios: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
});
