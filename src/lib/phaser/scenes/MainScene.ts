
import Phaser from 'phaser';
import * as Tone from 'tone';
import type { RealtimeService, PlayerUpdateData } from '@/services/RealtimeService';
import type { UserRole } from '@/models/User';

interface PlayerData {
  avatar: Phaser.GameObjects.Container;
  nameTag: Phaser.GameObjects.Text;
  panner?: Tone.Panner3D;
  playerNode?: Tone.Player;
  email: string;
}

interface PrivateZone {
  zone: Phaser.GameObjects.Zone;
  id: string;
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerAvatar!: Phaser.GameObjects.Shape;
  private npc!: Phaser.Types.Physics.Arcade.GameObjectWithBody & Phaser.GameObjects.Shape;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private nearZone!: Phaser.GameObjects.Zone;
  private isNearNpc = false;
  private lastSentPosition = { x: 0, y: 0 };
  private otherPlayers: Map<string, PlayerData> = new Map();
  private realtimeService!: InstanceType<typeof RealtimeService>;
  private myClientId!: string;
  private myEmail!: string;
  private myRole!: UserRole;
  private isAudioReady = false;
  private nearbyPlayer: { clientId: string, email: string } | null = null;
  private restrictionMessage!: Phaser.GameObjects.Text;

  private privateZones: PrivateZone[] = [];
  private currentZoneId: string = 'pixel-space';

  private followingClientId: string | null = null;
  private emoteText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainScene' });
  }
  
  preload() {
    this.load.audio('synth', '/assets/synth.mp3');
  }

  init(data: { startX: number, startY: number, email: string, clientId: string, role: UserRole, realtimeService: InstanceType<typeof RealtimeService> }) {
    this.playerStartX = data.startX || 200;
    this.playerStartY = data.startY || 200;
    this.myEmail = data.email;
    this.myClientId = data.clientId;
    this.myRole = data.role;
    this.realtimeService = data.realtimeService;

    window.addEventListener('start-audio', this.initAudio, { once: true });
    window.addEventListener('beforeunload', this.savePosition);

    this.realtimeService.subscribeToChannelEvent('pixel-space', 'emote', (message) => {
      const { clientId, emote } = message.data;
      this.showPlayerEmote(clientId, emote);
    });
  }

  private initAudio = async () => {
     if (this.isAudioReady) return;
    
    await Tone.start();
    
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    Tone.Listener.positionX.value = body.x;
    Tone.Listener.positionY.value = body.y;
    Tone.Listener.positionZ.value = 5;
    
    this.otherPlayers.forEach((playerData) => {
        this.setupPlayerAudio(playerData);
    });
    
    this.isAudioReady = true;
    console.log('Audio engine ready and attached to players.');
  }

  private savePosition = () => {
    if (this.player && this.player.body) {
      const { x, y } = this.player.body;
      navigator.sendBeacon('/api/world/update-position', JSON.stringify({ x, y }));
    }
  }

  private playerStartX = 200;
  private playerStartY = 200;

  private createPrivateZone(x: number, y: number, width: number, height: number, id: string): void {
      const zone = this.add.zone(x + width / 2, y + height / 2, width, height);
      this.physics.world.enable(zone);
      (zone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      (zone.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      this.privateZones.push({ zone, id });
      
      this.physics.add.overlap(this.player, zone, () => {
        if (this.currentZoneId !== id) {
          this.handleZoneChange(id);
        }
      });
  }

  private handleZoneChange(newZoneId: string) {
    this.currentZoneId = newZoneId;
    const onZoneChangeCallback = this.game.registry.get('onZoneChange');
    if (onZoneChangeCallback) {
        onZoneChangeCallback(newZoneId);
    }
  }

  create() {
    const wallColor = 0x6678B8;
    const playerColor = 0xF7B733;
    const otherPlayerColor = 0x38bdf8;
    const npcColor = 0x9ca3af;
    const portalColor = 0x4ade80;
    const interactiveObjectColor = 0xfacc15;
    const textColor = 'hsl(var(--foreground))';
    
    this.physics.world.setBounds(0, 0, 800, 1200);

    // --- Room definitions ---
    this.add.rectangle(225, 200, 350, 300).setStrokeStyle(2, wallColor, 0.3);
    this.add.text(65, 65, 'Lounge', { font: '24px "Press Start 2P"', color: textColor });

    this.add.rectangle(575, 400, 350, 300).setStrokeStyle(2, wallColor, 0.3);
    this.add.text(420, 265, 'Focus Zone', { font: '24px "Press Start 2P"', color: textColor });
    
    this.add.rectangle(400, 900, 700, 500).setStrokeStyle(2, wallColor, 0.3);
    this.add.text(80, 665, 'Coffee Room', { font: '24px "Press Start 2P"', color: textColor });
    this.add.circle(150, 800, 30, 0x8c5e3c).setStrokeStyle(2, 0x6f4e37);
    this.add.circle(650, 1000, 30, 0x8c5e3c).setStrokeStyle(2, 0x6f4e37);

    this.add.rectangle(225, 525, 350, 250).setStrokeStyle(2, 0xfb923c, 0.5); // Orange border
    this.add.text(65, 410, 'Admin Lounge', { font: '24px "Press Start 2P"', color: textColor });
    this.createPrivateZone(50, 400, 350, 250, 'private-admin-lounge');

    const bulletinBoard = this.add.rectangle(80, 200, 20, 100, interactiveObjectColor);
    bulletinBoard.setInteractive({ useHandCursor: true });
    bulletinBoard.on('pointerdown', () => {
        window.dispatchEvent(new Event('show-announcements'));
    });
    this.add.text(70, 260, 'Board', { font: '14px VT323', color: textColor }).setAngle(-90);

    const walls = this.physics.add.staticGroup();
    walls.add(this.add.rectangle(225, 50, 350, 20, wallColor).setOrigin(0.5)); // Top
    walls.add(this.add.rectangle(50, 200, 20, 300, wallColor).setOrigin(0.5)); // Left
    walls.add(this.add.rectangle(400, 200, 20, 300, wallColor).setOrigin(0.5)); // Right
    walls.add(this.add.rectangle(575, 250, 350, 20, wallColor).setOrigin(0.5)); // Top
    walls.add(this.add.rectangle(575, 550, 350, 20, wallColor).setOrigin(0.5)); // Bottom
    walls.add(this.add.rectangle(750, 400, 20, 300, wallColor).setOrigin(0.5)); // Right
    walls.add(this.add.rectangle(400, 650, 700, 20, wallColor).setOrigin(0.5)); // Top
    walls.add(this.add.rectangle(400, 1150, 700, 20, wallColor).setOrigin(0.5)); // Bottom
    walls.add(this.add.rectangle(50, 900, 20, 500, wallColor).setOrigin(0.5)); // Left
    walls.add(this.add.rectangle(750, 900, 20, 500, wallColor).setOrigin(0.5)); // Right
    walls.add(this.add.rectangle(225, 400, 350, 20, wallColor).setOrigin(0.5)); // Top
    walls.add(this.add.rectangle(225, 650, 350, 20, wallColor).setOrigin(0.5)); // Bottom
    walls.add(this.add.rectangle(50, 525, 20, 250, wallColor).setOrigin(0.5)); // Left
    walls.add(this.add.rectangle(400, 525, 20, 250, wallColor).setOrigin(0.5)); // Right
    
    // Player
    this.playerAvatar = this.add.circle(0, 0, 10, playerColor);
    this.emoteText = this.add.text(0, -25, '', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    this.player = this.add.container(this.playerStartX, this.playerStartY, [this.playerAvatar, this.emoteText]);
    this.physics.add.existing(this.player);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCircle(10);
    playerBody.setCollideWorldBounds(true);
    
    // NPC - Alex
    this.npc = this.add.circle(600, 400, 10, npcColor);
    this.physics.add.existing(this.npc);
    this.npc.body.setImmovable(true);
    this.add.text(585, 370, 'Alex', { font: '14px VT323', color: textColor });

    this.nearZone = this.add.zone(this.npc.body.x + 10, this.npc.body.y + 10, 150, 150);
    this.physics.world.enable(this.nearZone);
    (this.nearZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this.nearZone.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    (this.nearZone.body as Phaser.Physics.Arcade.Body).setCircle(75);

    const toFocusZonePortal = this.add.rectangle(350, 320, 10, 80, portalColor);
    this.physics.add.existing(toFocusZonePortal, true);
    this.physics.add.overlap(this.player, toFocusZonePortal, () => { playerBody.setPosition(430, 400); });
    this.add.text(320, 360, 'To Focus', { font: '16px VT323', color: '#ffffff' }).setAngle(-90);

    const toCoffeeRoomPortal = this.add.rectangle(225, 620, 100, 10, portalColor);
    this.physics.add.existing(toCoffeeRoomPortal, true);
    this.physics.add.overlap(this.player, toCoffeeRoomPortal, () => { playerBody.setPosition(375, 680); });
    this.add.text(180, 600, 'To Coffee Room', { font: '16px VT323', color: '#ffffff' });

    const toLoungeFromCoffeePortal = this.add.rectangle(400, 680, 100, 10, portalColor);
    this.physics.add.existing(toLoungeFromCoffeePortal, true);
    this.physics.add.overlap(this.player, toLoungeFromCoffeePortal, () => { playerBody.setPosition(200, 580); });
    this.add.text(355, 660, 'To Lounge', { font: '16px VT323', color: '#ffffff' });

    const toLoungeFromAdminPortal = this.add.rectangle(225, 430, 100, 10, portalColor);
    this.physics.add.existing(toLoungeFromAdminPortal, true);
    this.physics.add.overlap(this.player, toLoungeFromAdminPortal, () => { playerBody.setPosition(225, 320); });
    this.add.text(180, 410, 'To Lounge', { font: '16px VT323', color: '#ffffff' });

    const toAdminLoungePortal = this.add.rectangle(225, 370, 100, 10, portalColor);
    this.physics.add.existing(toAdminLoungePortal, true);
    this.physics.add.overlap(this.player, toAdminLoungePortal, () => {
        if (this.myRole === 'Admin') playerBody.setPosition(225, 430);
        else this.showRestrictionMessage();
    });
    this.add.text(180, 350, 'Admin Area', { font: '16px VT323', color: '#facc15' });
    
    this.restrictionMessage = this.add.text(0, 0, 'Restricted Area', {
        font: '16px VT323', color: '#ef4444', backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, this.npc);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
        up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(0, 0, 800, 1200);

    this.physics.add.overlap(this.player, this.nearZone, this.onPlayerNearNpc, undefined, this);

    this.time.addEvent({
      delay: 100,
      callback: this.sendPosition,
      callbackScope: this,
      loop: true,
    });
  }
  
  private showRestrictionMessage() {
      const { x, y } = this.player.body as Phaser.Physics.Arcade.Body;
      this.restrictionMessage.setPosition(x, y - 30).setVisible(true);
      this.time.delayedCall(2000, () => {
        this.restrictionMessage.setVisible(false);
      });
  }

  private sendPosition() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const { x, y } = body;
    if (x !== this.lastSentPosition.x || y !== this.lastSentPosition.y) {
       this.realtimeService.broadcastPlayerPosition(x, y, this.myEmail, this.myClientId);
       this.lastSentPosition = { x, y };
    }
  }
  
  onPlayerNearNpc() {
    if (!this.isNearNpc) {
      this.isNearNpc = true;
      const onNearCallback = this.game.registry.get('onPlayerNearNpc');
      if (onNearCallback) onNearCallback();
    }
  }
  
  private setupPlayerAudio(playerData: PlayerData) {
    if (!this.isAudioReady || playerData.panner) return;

    const panner = new Tone.Panner3D({
        panningModel: 'HRTF', distanceModel: 'inverse', refDistance: 20, maxDistance: 10000,
        rolloffFactor: 2.5, coneInnerAngle: 360, coneOuterAngle: 360, coneOuterGain: 0,
    }).toDestination();

    const playerNode = new Tone.Player({
        url: this.cache.audio.get('synth'), loop: true, autostart: true, fadeOut: 0.1,
    }).connect(panner);

    playerData.panner = panner;
    playerData.playerNode = playerNode;
  }

  public updatePlayer(clientId: string, x: number, y: number, email: string) {
    let playerData = this.otherPlayers.get(clientId);
    
    if (playerData) {
      this.physics.moveToObject(playerData.avatar, { x, y }, 200);
      playerData.nameTag.setPosition(0, -25);
    } else {
      const otherPlayerAvatar = this.add.circle(0, 0, 10, 0x38bdf8);
      otherPlayerAvatar.setInteractive({ useHandCursor: true });
      otherPlayerAvatar.on('pointerdown', () => { this.realtimeService.sendKnock(clientId, this.myEmail); });
      
      const otherPlayerEmote = this.add.text(0, -25, '', { fontSize: '20px' }).setOrigin(0.5);

      const container = this.add.container(x, y, [otherPlayerAvatar, otherPlayerEmote]);
      this.physics.add.existing(container);
      const body = container.body as Phaser.Physics.Arcade.Body;
      body.setCircle(10);
      body.setImmovable(true);

      const nameTag = this.add.text(0, -25, email, { 
        font: '12px VT323', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', padding: { x:2, y: 1 }
      }).setOrigin(0.5);
      container.add(nameTag);

      const newPlayerData = { avatar: container, nameTag, email };
      this.otherPlayers.set(clientId, newPlayerData);
      this.setupPlayerAudio(newPlayerData);
    }
  }

  public removePlayer(clientId: string) {
      if(this.otherPlayers.has(clientId)) {
          const playerData = this.otherPlayers.get(clientId)!;
          playerData.avatar.destroy();
          playerData.nameTag.destroy();
          if(playerData.playerNode) { playerData.playerNode.stop(); playerData.playerNode.dispose(); }
          if(playerData.panner) { playerData.panner.dispose(); }
          this.otherPlayers.delete(clientId);
      }
  }
  
  private checkPlayerProximity() {
    const PROXIMITY_RADIUS = 75;
    let foundNearbyPlayer = null;
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    for (const [clientId, otherPlayer] of this.otherPlayers.entries()) {
        const otherPlayerBody = otherPlayer.avatar.body as Phaser.Physics.Arcade.Body;
        const distance = Phaser.Math.Distance.Between(playerBody.x, playerBody.y, otherPlayerBody.x, otherPlayerBody.y);
        if (distance < PROXIMITY_RADIUS) {
            foundNearbyPlayer = { clientId, email: otherPlayer.email };
            break;
        }
    }

    if (foundNearbyPlayer && this.nearbyPlayer?.clientId !== foundNearbyPlayer.clientId) {
        this.nearbyPlayer = foundNearbyPlayer;
        const onPlayerNear = this.game.registry.get('onPlayerNear');
        if (onPlayerNear) onPlayerNear(this.nearbyPlayer.clientId, this.nearbyPlayer.email);
    } else if (!foundNearbyPlayer && this.nearbyPlayer) {
        this.nearbyPlayer = null;
        const onPlayerFar = this.game.registry.get('onPlayerFar');
        if (onPlayerFar) onPlayerFar();
    }
  }

  public followPlayer(clientId: string) {
    this.followingClientId = clientId;
  }

  public showEmote(emote: string) {
    this.emoteText.setText(emote);
    this.realtimeService.publishToChannel('pixel-space', 'emote', { clientId: this.myClientId, emote });
    this.time.delayedCall(2000, () => {
      this.emoteText.setText('');
      this.realtimeService.publishToChannel('pixel-space', 'emote', { clientId: this.myClientId, emote: '' });
    });
  }

  private showPlayerEmote(clientId: string, emote: string) {
    const playerData = this.otherPlayers.get(clientId);
    if (playerData) {
      const emoteText = playerData.avatar.getAt(1) as Phaser.GameObjects.Text;
      emoteText.setText(emote);
    }
  }

  update() {
    const speed = 200;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.followingClientId) {
      const targetPlayer = this.otherPlayers.get(this.followingClientId);
      if (targetPlayer) {
        this.physics.moveToObject(this.player, targetPlayer.avatar, speed);
      } else {
        this.followingClientId = null; // Stop following if target is gone
      }
    } else {
      if (this.cursors.left.isDown || this.wasd.left.isDown) body.setVelocityX(-speed);
      else if (this.cursors.right.isDown || this.wasd.right.isDown) body.setVelocityX(speed);

      if (this.cursors.up.isDown || this.wasd.up.isDown) body.setVelocityY(-speed);
      else if (this.cursors.down.isDown || this.wasd.down.isDown) body.setVelocityY(speed);

      body.velocity.normalize().scale(speed);
    }

    if (this.input.keyboard?.checkDown(this.cursors.left, 1) || this.input.keyboard?.checkDown(this.cursors.right, 1) || this.input.keyboard?.checkDown(this.cursors.up, 1) || this.input.keyboard?.checkDown(this.cursors.down, 1) ||
        this.input.keyboard?.checkDown(this.wasd.left, 1) || this.input.keyboard?.checkDown(this.wasd.right, 1) || this.input.keyboard?.checkDown(this.wasd.up, 1) || this.input.keyboard?.checkDown(this.wasd.down, 1)) {
      this.followingClientId = null;
    }

    if (this.isAudioReady) {
        Tone.Listener.positionX.value = body.position.x;
        Tone.Listener.positionY.value = body.position.y;
    }

    let inAnyPrivateZone = false;
    for (const { zone, id } of this.privateZones) {
        if (this.physics.overlap(this.player, zone)) {
            inAnyPrivateZone = true;
            if (this.currentZoneId !== id) this.handleZoneChange(id);
            break; 
        }
    }

    if (!inAnyPrivateZone && this.currentZoneId !== 'pixel-space') this.handleZoneChange('pixel-space');

    this.otherPlayers.forEach(playerData => {
        const remoteBody = playerData.avatar.body as Phaser.Physics.Arcade.Body;
        if (Phaser.Math.Distance.Between(remoteBody.x, remoteBody.y, remoteBody.center.x, remoteBody.center.y) < 4) {
            remoteBody.setVelocity(0);
        }
        if (this.isAudioReady && playerData.panner) {
            playerData.panner.positionX.value = remoteBody.position.x;
            playerData.panner.positionY.value = remoteBody.position.y;
        }
    });

    const isOverlappingNpc = this.physics.overlap(this.player, this.nearZone);
    if (this.isNearNpc && !isOverlappingNpc) {
      this.isNearNpc = false;
      const onFarCallback = this.game.registry.get('onPlayerFarNpc');
      if (onFarCallback) onFarCallback();
    }
    
    this.checkPlayerProximity();
  }
  
  destroy() {
    window.removeEventListener('start-audio', this.initAudio);
    window.removeEventListener('beforeunload', this.savePosition);
    this.savePosition();
    this.otherPlayers.forEach(p => {
        if (p.playerNode) { p.playerNode.stop(); p.playerNode.dispose(); }
        if (p.panner) p.panner.dispose();
    });
    this.otherPlayers.clear();
    this.isAudioReady = false;
    this.time.removeAllEvents();
  }
}
