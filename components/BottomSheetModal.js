import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetHandle } from '@gorhom/bottom-sheet';
import { useTheme } from '../ThemeContext';
import { useColorScheme } from '../lib/useColorScheme';

const BottomSheetModal = ({
  visible,
  onClose,
  title,
  children,
  showHandle = true,
  backdropOpacity = 0.5,
  snapPoints = ['50%', '75%'],
  initialSnap = 0,
  enablePanDownToClose = true
}) => {
  const bottomSheetRef = useRef(null);
  const { colors } = useTheme();
  const { colors: full } = useColorScheme();

  const handleBackdropPress = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!visible) return null;

  const indicatorStyle = [styles.handleIndicatorBase, { backgroundColor: full.mutedForeground }];

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={initialSnap}
      snapPoints={snapPoints}
      enablePanDownToClose={enablePanDownToClose}
      // ponytail: swipe-down sets index -1 without unmounting; report it so
      // visible flips false and the next open actually reopens.
      onChange={(index) => {
        if (index === -1) onClose();
      }}
      // bottom-sheet v5 enables dynamic sizing by default, which hides the
      // sheet until content/handle heights are measured (they never are for
      // plain View content). Keep the fixed snapPoints behavior from v4.
      enableDynamicSizing={false}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          opacity={backdropOpacity}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          onPress={handleBackdropPress}
        />
      )}
      handleComponent={showHandle ? undefined : null}
      handleIndicatorStyle={indicatorStyle}
      backgroundStyle={{ backgroundColor: colors.card }}
      style={[styles.container, { backgroundColor: colors.card }]}
    >
      <View style={styles.content}>
        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
        {children}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 15,
    textAlign: 'center',
  },
  handleIndicatorBase: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
});

export default BottomSheetModal;
