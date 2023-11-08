import { Component, OnInit } from '@angular/core';

interface AudioDevice {
  id: string;
  name: string;
}

@Component({
  selector: 'app-audio-processing-tool',
  templateUrl: './audio-processing-tool.component.html',
  styleUrls: ['./audio-processing-tool.component.css'],
})
export class AudioProcessingToolComponent implements OnInit {
  isRecording = false;
  microphonePermissionState: 'granted' | 'prompt' | 'denied' = 'denied';
  availableAudioDevices: AudioDevice[] = [];
  selectedAudioDevice: string | undefined = undefined;
  savedAudios: any[][] = [];

  mediaRecorder: any = undefined;

  constructor() {}

  ngOnInit() {
    // Check permissions and initialize the component here
    this.checkMicrophonePermission();
  }

  checkMicrophonePermission() {
    navigator.permissions
      .query({ name: 'microphone' as PermissionName })
      .then((queryResult) => {
        this.handlePermissionState(queryResult.state);
        queryResult.onchange = (onChangeResult) => {
          if (onChangeResult.target) {
            this.handlePermissionState(
              (onChangeResult.target as PermissionStatus).state
            );
          }
        };
      });
  }

  getAvailableAudioDevices() {
    return new Promise<AudioDevice[]>((resolve) => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const availableDevices = devices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => {
            return { id: d.deviceId, name: d.label };
          });
        resolve(availableDevices);
      });
    });
  }

  async handleClickSelectAudioDevice(id: string) {
    this.selectedAudioDevice = id;
  }

  async handleClickStartRecord() {
    if (this.selectedAudioDevice) {
      this.isRecording = true;
      const audio =
        this.selectedAudioDevice.length > 0
          ? { deviceId: this.selectedAudioDevice }
          : true;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audio,
          video: false,
        });
        const options = { mimeType: 'audio/webm' };
        const recordedChunks: any[] = [];
        this.mediaRecorder = new MediaRecorder(stream, options);

        this.mediaRecorder.addEventListener('dataavailable', (e: any) => {
          if (e.data.size > 0) recordedChunks.push(e.data);
        });

        this.mediaRecorder.addEventListener('stop', () => {
          this.savedAudios.push(recordedChunks);
          stream.getTracks().forEach(function (track: any) {
            track.stop();
          });
        });

        this.mediaRecorder.start();
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  }

  handleClickStopRecord() {
    this.isRecording = false;
    if (this.mediaRecorder) this.mediaRecorder.stop();
  }

  handleDownloadAudio(index: number) {
    const recordedChunks = this.savedAudios[index];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(recordedChunks));
    a.download = `Audio ${index + 1}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    a.remove();
  }

  getAudioRef(index: number) {
    const recordedChunks = this.savedAudios[index];
    return URL.createObjectURL(new Blob(recordedChunks));
  }

  handleDeleteAudio(index: number) {
    this.savedAudios.splice(index, 1);
  }

  // Define the handlePermissionState function here
  handlePermissionState(state: 'granted' | 'prompt' | 'denied') {
    this.microphonePermissionState = state;
    if (state == 'granted') {
      this.getAvailableAudioDevices().then((devices) => {
        this.availableAudioDevices = devices;
        this.selectedAudioDevice = devices.find(
          (device) => device.id === 'default'
        )?.id;
      });
    }
    if (state === 'denied') {
      this.handleRequestPermission();
    }
  }

  // Handle request permission
  handleRequestPermission() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(
      (stream) => {
        stream.getTracks().forEach(function (track: any) {
          track.stop();
        });
      },
      (error) => {
        console.error('Error requesting permission:', error);
      }
    );
  }
}
