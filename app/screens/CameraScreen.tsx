import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {
  Camera,
  Frame,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';

export default function CameraScreen() {
  const device = useCameraDevice('front');
  const {hasPermission, requestPermission} = useCameraPermission();

  const frameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet';

    console.log(`You're looking at a ${frame}.`);
  }, []);

  if (!hasPermission) return requestPermission();
  if (device == null) return <Text style={{color: '#000'}}>No Device</Text>;

  return (
    <View style={{flex: 1}}>
      <Camera
        style={{flex: 1}}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
    </View>
  );
}
