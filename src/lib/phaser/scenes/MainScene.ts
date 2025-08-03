
import Phaser from 'phaser';
import * as Tone from 'tone';
import type { RealtimeService, PlayerUpdateData } from '@/services/RealtimeService';
import type { UserRole } from '@/models/User';

interface PlayerData {
  avatar: Phaser.GameObjects.Shape;
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
  private player!: Phaser.Types.Physics.Arcade.GameObjectWithBody & Phaser.GameObjects.Shape;
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
  }

  private initAudio = async () => {
     if (this.isAudioReady) return;
    
    await Tone.start();
    
    // Set listener position
    const { x, y } = this.player.body;
    Tone.Listener.positionX.value = x;
    Tone.Listener.positionY.value = y;
    Tone.Listener.positionZ.value = 5; // Ears are slightly above the ground
    
    // Set up audio for existing players
    this.otherPlayers.forEach((playerData, clientId) => {
        this.setupPlayerAudio(playerData);
    });
    
    this.isAudioReady = true;
    console.log('Audio engine ready and attached to players.');
  }

  private savePosition = () => {
    if (this.player) {
      const { x, y } = this.player.body;
      // Use sendBeacon as it's more reliable for requests during page unload
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
    const wallColor = 0x6678B8; // Primary color
    const playerColor = 0xF7B733; // Accent color
    const otherPlayerColor = 0x38bdf8; // sky-400
    const npcColor = 0x9ca3af; // Gray-400
    const portalColor = 0x4ade80; // Green-400
    const interactiveObjectColor = 0xfacc15; // yellow-400
    const textColor = 'hsl(var(--foreground))';
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
    
    // World bounds
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

    // --- Private Zone ---
    this.add.rectangle(225, 525, 350, 250).setStrokeStyle(2, 0xfb923c, 0.5); // Orange border
    this.add.text(65, 410, 'Admin Lounge', { font: '24px "Press Start 2P"', color: textColor });
    this.createPrivateZone(50, 400, 350, 250, 'private-admin-lounge');


    // --- Interactive Objects ---
    const bulletinBoard = this.add.rectangle(80, 200, 20, 100, interactiveObjectColor);
    bulletinBoard.setInteractive({ useHandCursor: true });
    bulletinBoard.on('pointerdown', () => {
        window.dispatchEvent(new Event('show-announcements'));
    });
    this.add.text(70, 260, 'Board', { font: '14px VT323', color: textColor }).setAngle(-90);


    // World objects
    const walls = this.physics.add.staticGroup();
    // Lounge Walls
    walls.add(this.add.rectangle(225, 50, 350, 20, wallColor).setOrigin(0.5)); // Top
    walls.add(this.add.rectangle(50, 200, 20, 300, wallColor).setOrigin(0.5)); // Left
    walls.add(this.add.rectangle(400, 200, 20, 300, wallColor).setOrigin(0.5)); // Right
    
    // Focus Zone Walls
    walls.add(this.add.rectangle(575, 250, 350, 20, wallColor).setOrigin(0.5)); // Top
    walls.add(this.add.rectangle(575, 550, 350, 20, wallColor).setOrigin(0.5)); // Bottom
    walls.add(this.add.rectangle(750, 400, 20, 300, wallColor).setOrigin(0.5)); // Right
    
    // Coffee Room Walls
    walls.add(this.add.rectangle(400, 650, 700, 20, wallColor).setOrigin(0.5)); // Top
    walls.add(this.add.rectangle(400, 1150, 700, 20, wallColor).setOrigin(0.5)); // Bottom
    walls.add(this.add.rectangle(50, 900, 20, 500, wallColor).setOrigin(0.5)); // Left
    walls.add(this.add.rectangle(750, 900, 20, 500, wallColor).setOrigin(0.5)); // Right

    // Admin Lounge Walls
    walls.add(this.add.rectangle(225, 400, 350, 20, wallColor).setOrigin(0.5)); // Top
    walls.add(this.add.rectangle(225, 650, 350, 20, wallColor).setOrigin(0.5)); // Bottom
    walls.add(this.add.rectangle(50, 525, 20, 250, wallColor).setOrigin(0.5)); // Left
    walls.add(this.add.rectangle(400, 525, 20, 250, wallColor).setOrigin(0.5)); // Right
    

    // Player
    this.player = this.add.circle(this.playerStartX, this.playerStartY, 10, playerColor);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    
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

    // --- Portals ---
    const toFocusZonePortal = this.add.rectangle(350, 320, 10, 80, portalColor);
    this.physics.add.existing(toFocusZonePortal, true);
    this.physics.add.overlap(this.player, toFocusZonePortal, () => {
        this.player.body.x = 430;
        this.player.body.y = 400;
    });
    this.add.text(320, 360, 'To Focus', { font: '16px VT323', color: '#ffffff' }).setAngle(-90);

    const toCoffeeRoomPortal = this.add.rectangle(225, 620, 100, 10, portalColor);
    this.physics.add.existing(toCoffeeRoomPortal, true);
    this.physics.add.overlap(this.player, toCoffeeRoomPortal, () => {
        this.player.body.x = 375;
        this.player.body.y = 680;
    });
    this.add.text(180, 600, 'To Coffee Room', { font: '16px VT323', color: '#ffffff' });

    const toLoungeFromCoffeePortal = this.add.rectangle(400, 680, 100, 10, portalColor);
    this.physics.add.existing(toLoungeFromCoffeePortal, true);
    this.physics.add.overlap(this.player, toLoungeFromCoffeePortal, () => {
        this.player.body.x = 200;
        this.player.body.y = 580;
    });
    this.add.text(355, 660, 'To Lounge', { font: '16px VT323', color: '#ffffff' });

    const toLoungeFromAdminPortal = this.add.rectangle(225, 430, 100, 10, portalColor);
    this.physics.add.existing(toLoungeFromAdminPortal, true);
    this.physics.add.overlap(this.player, toLoungeFromAdminPortal, () => {
      this.player.body.x = 225;
      this.player.body.y = 320;
    });
    this.add.text(180, 410, 'To Lounge', { font: '16px VT323', color: '#ffffff' });


    const toAdminLoungePortal = this.add.rectangle(225, 370, 100, 10, portalColor);
    this.physics.add.existing(toAdminLoungePortal, true);
    this.physics.add.overlap(this.player, toAdminLoungePortal, () => {
        if (this.myRole === 'Admin') {
            this.player.body.x = 225;
            this.player.body.y = 430;
        } else {
            this.showRestrictionMessage();
        }
    });
    this.add.text(180, 350, 'Admin Area', { font: '16px VT323', color: '#facc15' });
    
    this.restrictionMessage = this.add.text(0, 0, 'Restricted Area', {
        font: '16px VT323',
        color: '#ef4444',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(100).setVisible(false);


    // Physics
    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, this.npc);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
        up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(0, 0, 800, 1200);

    // Proximity check
    this.physics.add.overlap(this.player, this.nearZone, this.onPlayerNearNpc, undefined, this);

    this.time.addEvent({
      delay: 100,
      callback: this.sendPosition,
      callbackScope: this,
      loop: true,
    });
  }
  
  private showRestrictionMessage() {
      const { x, y } = this.player.body;
      this.restrictionMessage.setPosition(x, y - 30).setVisible(true);
      this.time.delayedCall(2000, () => {
        this.restrictionMessage.setVisible(false);
      });
  }

  private sendPosition() {
    const { x, y } = this.player.body;
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
        panningModel: 'HRTF',
        distanceModel: 'inverse',
        refDistance: 20,
        maxDistance: 10000,
        rolloffFactor: 2.5,
        coneInnerAngle: 360,
        coneOuterAngle: 360,
        coneOuterGain: 0,
    }).toDestination();

    const playerNode = new Tone.Player({
        url: this.cache.audio.get('synth'),
        loop: true,
        autostart: true,
        fadeOut: 0.1,
    }).connect(panner);

    playerData.panner = panner;
    playerData.playerNode = playerNode;
  }

  public updatePlayer(clientId: string, x: number, y: number, email: string) {
    let playerData = this.otherPlayers.get(clientId);
    
    if (playerData) {
      this.physics.moveTo(playerData.avatar, x + 10, y + 10, undefined, 100);
      playerData.nameTag.setPosition(x + 10, y - 15);
    } else {
      const otherPlayerColor = 0x38bdf8;
      const avatar = this.add.circle(x + 10, y + 10, 10, otherPlayerColor);
      avatar.setInteractive({ useHandCursor: true });
      avatar.on('pointerdown', () => {
          this.realtimeService.sendKnock(clientId, this.myEmail);
      });

      this.physics.add.existing(avatar);
      (avatar.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      
      const nameTag = this.add.text(x, y - 15, email, { 
        font: '12px VT323', 
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x:2, y: 1 }
      }).setOrigin(0.5);

      const newPlayerData = { avatar, nameTag, email };
      this.otherPlayers.set(clientId, newPlayerData);
      this.setupPlayerAudio(newPlayerData);
    }
  }

  public removePlayer(clientId: string) {
      if(this.otherPlayers.has(clientId)) {
          const playerData = this.otherPlayers.get(clientId)!;
          playerData.avatar.destroy();
          playerData.nameTag.destroy();
          
          if(playerData.playerNode) {
              playerData.playerNode.stop();
              playerData.playerNode.dispose();
          }
          if(playerData.panner) {
              playerData.panner.dispose();
          }
          
          this.otherPlayers.delete(clientId);
      }
  }
  
  private checkPlayerProximity() {
    const PROXIMITY_RADIUS = 75;
    let foundNearbyPlayer = null;

    for (const [clientId, otherPlayer] of this.otherPlayers.entries()) {
        const distance = Phaser.Math.Distance.Between(
            this.player.body.x,
            this.player.body.y,
            otherPlayer.avatar.body.x,
            otherPlayer.avatar.body.y
        );

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

  update() {
    const speed = 200;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      body.setVelocityY(speed);
    }

    body.velocity.normalize().scale(speed);

    if (this.isAudioReady) {
        Tone.Listener.positionX.value = body.position.x;
        Tone.Listener.positionY.value = body.position.y;
    }

    let inAnyPrivateZone = false;
    for (const { zone, id } of this.privateZones) {
        if (this.physics.overlap(this.player, zone)) {
            inAnyPrivateZone = true;
            if (this.currentZoneId !== id) {
                this.handleZoneChange(id);
            }
            break; 
        }
    }

    if (!inAnyPrivateZone && this.currentZoneId !== 'pixel-space') {
        this.handleZoneChange('pixel-space');
    }

    this.otherPlayers.forEach(playerData => {
        const remoteBody = playerData.avatar.body as Phaser.Physics.Arcade.Body;
        const distance = Phaser.Math.Distance.Between(remoteBody.x, remoteBody.y, remoteBody.center.x, remoteBody.center.y);
        
        if (distance < 4) {
            remoteBody.setVelocity(0);
        }
        playerData.nameTag.setPosition(remoteBody.x, remoteBody.y - 20);

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

    this.savePosition(); // Try to save one last time on destroy

    this.otherPlayers.forEach(p => {
        if (p.playerNode) {
            p.playerNode.stop();
            p.playerNode.dispose();
        }
        if (p.panner) p.panner.dispose();
    });
    this.otherPlayers.clear();
    this.isAudioReady = false;
    
    // Clean up scene resources
    this.time.removeAllEvents();
  }
}
