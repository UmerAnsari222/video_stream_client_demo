import React, { useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  const captureAndSendPhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto();
        console.log("Captured Photo:", photo);  // Log the captured photo data

        // Read the image file from the path provided by `takePhoto`
        const filePath = photo.path;
        const fileData = await RNFS.readFile(filePath, 'base64');  // Read the file as a Base64 encoded string

        if (!fileData) {
          console.error("Failed to read the image file.");
          return;
        }

        // Send the Base64 data to the Flask server
        const response = await fetch('http://192.168.100.58:5000/video_feed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: fileData,  // Send the Base64-encoded image data
        });

        if (!response.ok) {
          console.error('Server Error:', response.status, response.statusText);
          return;
        }

        const textResponse = await response.text();
        console.log("Raw Response:", textResponse);

        try {
          const result = JSON.parse(textResponse);
          console.log(result);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      } catch (error) {
        console.error('Error capturing or sending photo:', error);
      }
    }
  };

  useEffect(() => {
    const intervalId = setInterval(captureAndSendPhoto, 2000);  // Capture and send a photo every 2 seconds

    return () => clearInterval(intervalId);
  }, [device]);

  if (!hasPermission) return requestPermission();
  if (device == null) return <Text style={{ color: '#000' }}>No Device</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        photo={true}  // Enable photo capture
      />
    </View>
  );
}
