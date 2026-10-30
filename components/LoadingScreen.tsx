import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import BrandLogo from './BrandLogo';
import { Colors, Fonts } from '../constants/theme';

export default function LoadingScreen({ message = 'Restoring your session…' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <BrandLogo size={40} />
      <ActivityIndicator
        size="small"
        color={Colors.primary}
        accessibilityLabel={message}
      />
      <Text style={styles.message} accessibilityRole="text">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 180,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 24,
  },
  message: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    color: '#5D554D',
    textAlign: 'center',
  },
});
