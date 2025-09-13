import { useAi } from "@/hooks/useAi";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export function useMemos() {
  const { sendAudioMessage, isLoading } = useAi();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status: micStatus } = await Audio.requestPermissionsAsync();
        if (micStatus !== "granted") {
          Alert.alert(
            "Permission required",
            "Please allow microphone access to record memos."
          );
        }
      } catch (err) {
        console.error("Permission check failed", err);
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: ".m4a",
        },
      });

      recordingRef.current = recording;
      setIsRecording(true);
      setElapsedSeconds(0);
      // start timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000) as unknown as number;
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    setIsRecording(false);

    // stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current as unknown as number);
      timerRef.current = null;
    }

    const seconds = elapsedSeconds;

    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();

      let duration = `0:00`;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      duration = `${mins}:${secs.toString().padStart(2, "0")}`;

      if (uri) {
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // sendAudioMessage now returns the updated messages array from useAi
        const message = await sendAudioMessage(base64Audio);
        return { duration, uri, message };
      }

      return { duration, uri };
    } catch (err) {
      console.error("Failed to stop recording", err);
      return undefined;
    } finally {
      recordingRef.current = null;
      setElapsedSeconds(0);
    }
  };

  return {
    isRecording,
    isLoading,
    elapsedSeconds,
    startRecording,
    stopRecording,
  };
}

export default useMemos;
