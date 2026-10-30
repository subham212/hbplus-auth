import { Image, StyleSheet } from 'react-native';

export default function BrandLogo({ size = 50 }: { size?: number }) {
  return (
    <Image
      source={require('../assets/logo.png')}
      style={[styles.logo, { width: size, height: size }]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="HB+ Fit"
    />
  );
}

const styles = StyleSheet.create({
  logo: { flexShrink: 0 },
});
