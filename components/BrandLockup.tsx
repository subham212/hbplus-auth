import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts } from '../constants/theme';

export default function BrandLockup({
  caption = 'MEMBER ACCESS',
  compact = false,
}: {
  caption?: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.row, compact && styles.compactRow]}>
      <Image
        source={require('../assets/logo.png')}
        style={[styles.logo, compact && styles.compactLogo]}
        resizeMode="contain"
        accessible={false}
      />
      <View>
        <Text style={[styles.name, compact && styles.compactName]}>HB+ Fit</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  compactRow: { gap: 10 },
  logo: { width: 50, height: 50 },
  compactLogo: { width: 40, height: 40 },
  name: { fontFamily: Fonts.sansBold, fontSize: 17, letterSpacing: -0.2, color: Colors.onSurface },
  compactName: { fontSize: 15 },
  caption: { marginTop: 3, fontFamily: Fonts.sansMedium, fontSize: 10, letterSpacing: 1.1, color: Colors.primary },
});
