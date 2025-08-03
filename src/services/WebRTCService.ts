
'use client';

import { realtimeService, type WebRTCSignalData } from './RealtimeService';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

class WebRTCService {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private onRemoteStreamCallback: ((clientId: string, stream: MediaStream, clientEmail: string) => void) | null = null;
  private onConnectionCloseCallback: ((clientId: string) => void) | null = null;
  private peerEmails: Map<string, string> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    realtimeService.onWebRTCSignal(this.handleSignal.bind(this));
  }

  setLocalStream(stream: MediaStream) {
    this.localStream = stream;
  }
  
  onRemoteStream(callback: (clientId: string, stream: MediaStream, clientEmail: string) => void) {
    this.onRemoteStreamCallback = callback;
  }

  onConnectionClose(callback: (clientId: string) => void) {
    this.onConnectionCloseCallback = callback;
  }

  private async handleSignal(data: WebRTCSignalData) {
    const { from, type, payload } = data;
    let pc = this.peerConnections.get(from);

    if (type === 'offer') {
      if (!pc) {
        pc = this.createPeerConnection(from);
      }
      await pc.setRemoteDescription(new RTCSessionDescription(payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      realtimeService.sendWebRTCSignal({ from: realtimeService.getClientId(), to: from, type: 'answer', payload: answer });
    } else if (type === 'answer') {
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
      }
    } else if (type === 'candidate') {
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(payload));
      }
    }
  }

  private createPeerConnection(clientId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    this.localStream?.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream!);
    });

    pc.onicecandidate = event => {
      if (event.candidate) {
        realtimeService.sendWebRTCSignal({ from: realtimeService.getClientId(), to: clientId, type: 'candidate', payload: event.candidate });
      }
    };

    pc.ontrack = event => {
      const stream = event.streams[0];
      if(stream) {
          this.remoteStreams.set(clientId, stream);
          const email = this.peerEmails.get(clientId) || 'Unknown User';
          if (this.onRemoteStreamCallback) {
            this.onRemoteStreamCallback(clientId, stream, email);
          }
      }
    };

    pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed' || pc.connectionState === 'failed') {
            this.closeConnection(clientId);
        }
    };


    this.peerConnections.set(clientId, pc);
    return pc;
  }

  async call(clientId: string, clientEmail: string) {
    if (this.peerConnections.has(clientId)) return;

    this.peerEmails.set(clientId, clientEmail);
    const pc = this.createPeerConnection(clientId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    realtimeService.sendWebRTCSignal({ from: realtimeService.getClientId(), to: clientId, type: 'offer', payload: offer });
  }

  closeConnection(clientId: string) {
    const pc = this.peerConnections.get(clientId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(clientId);
      this.remoteStreams.delete(clientId);
      this.peerEmails.delete(clientId);
      if (this.onConnectionCloseCallback) {
        this.onConnectionCloseCallback(clientId);
      }
    }
  }

  closeAllConnections() {
    this.peerConnections.forEach((pc, clientId) => {
      this.closeConnection(clientId);
    });
  }
}

export const webRTCService = new WebRTCService();

    