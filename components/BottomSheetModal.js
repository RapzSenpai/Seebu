import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetHandle } from '@gorhom/bottom-sheet';
import { useTheme } from '../ThemeContext';

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

  const handleBackdropPress = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={initialSnap}
      snapPoints={snapPoints}
      enablePanDownToClose={enablePanDownToClose}
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
      handleIndicatorStyle={showHandle ? styles.handleIndicator : styles.hidden}
      style={[styles.container, { backgroundColor: colors.card }]}
    >
      {showHandle && (
        <BottomSheetHandle
          containerStyle={styles.handleContainer}
          indicatorStyle={styles.handleIndicator}
        />
      )}

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
  handleContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  hidden: {
    display: 'none',
  },
});

export default BottomSheetModal;
