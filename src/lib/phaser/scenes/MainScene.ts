
import Phaser from 'phaser';
import * as Tone from 'tone';
import type ChatService from '@/services/ChatService';

interface PlayerData {
  avatar: Phaser.GameObjects.Shape;
  nameTag: Phaser.GameObjects.Text;
  panner?: Tone.Panner3D;
  playerNode?: Tone.Player;
}

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.GameObjectWithBody & Phaser.GameObjects.Shape;
  private npc!: Phaser.Types.Physics.Arcade.GameObjectWithBody & Phaser.GameObjects.Shape;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private nearZone!: Phaser.GameObjects.Zone;
  private isNear = false;
  private lastSentPosition = { x: 0, y: 0 };
  private otherPlayers: Map<string, PlayerData> = new Map();
  private chatService!: typeof ChatService;
  private myClientId!: string;
  private myEmail!: string;
  private isAudioReady = false;


  constructor() {
    super({ key: 'MainScene' });
  }
  
  preload() {
    this.load.audio('synth', '/assets/synth.mp3');
  }

  init(data: { startX: number, startY: number, email: string, clientId: string, chatService: typeof ChatService }) {
    this.playerStartX = data.startX || 200;
    this.playerStartY = data.startY || 200;
    this.myEmail = data.email;
    this.myClientId = data.clientId;
    this.chatService = data.chatService;

    window.addEventListener('start-audio', this.initAudio, { once: true });
    window.addEventListener('beforeunload', this.savePosition);
  }

  private initAudio = async () => {
     if (this.isAudioReady) return;
    
    await Tone.start();
    
    // Set listener position
    const { x, y } = this.player.body.position;
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
      const { x, y } = this.player.body.position;
      // Use sendBeacon as it's more reliable for requests during page unload
      navigator.sendBeacon('/api/world/update-position', JSON.stringify({ x, y }));
    }
  }

  private playerStartX = 200;
  private playerStartY = 200;

  create() {
    const wallColor = 0x553a99; // Primary color
    const playerColor = 0xe040fb; // Accent color
    const otherPlayerColor = 0x38bdf8; // sky-400
    const npcColor = 0x9ca3af; // Gray-400
    const portalColor = 0x4ade80; // Green-400
    const textColor = '#e5e7eb';
    
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

    // World objects
    const walls = this.physics.add.staticGroup();
    walls.add(this.add.rectangle(400, 50, 700, 20, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(400, 550, 700, 20, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(50, 300, 20, 420, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(750, 300, 20, 420, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(400, 650, 700, 20, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(400, 1150, 700, 20, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(50, 900, 20, 500, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(750, 900, 20, 500, wallColor).setOrigin(0.5));
    
    // Player
    this.player = this.add.circle(this.playerStartX, this.playerStartY, 10, playerColor);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    
    // NPC
    this.npc = this.add.circle(600, 400, 10, npcColor);
    this.physics.add.existing(this.npc);
    this.npc.body.setImmovable(true);

    this.nearZone = this.add.zone(this.npc.body.x + 10, this.npc.body.y + 10, 150, 150);
    this.physics.world.enable(this.nearZone);
    (this.nearZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this.nearZone.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    (this.nearZone.body as Phaser.Physics.Arcade.Body).setCircle(75);

    // --- Portals ---
    const toCoffeeRoomPortal = this.add.rectangle(225, 520, 100, 10, portalColor);
    this.physics.add.existing(toCoffeeRoomPortal);
    (toCoffeeRoomPortal.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (toCoffeeRoomPortal.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    this.physics.add.overlap(this.player, toCoffeeRoomPortal, () => {
        (this.player.body as Phaser.Physics.Arcade.Body).setPosition(375, 680);
    });
    this.add.text(180, 500, 'To Coffee Room', { font: '16px VT323', color: '#ffffff' });

    const toLoungePortal = this.add.rectangle(400, 680, 100, 10, portalColor);
    this.physics.add.existing(toLoungePortal);
    (toLoungePortal.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (toLoungePortal.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    this.physics.add.overlap(this.player, toLoungePortal, () => {
        (this.player.body as Phaser.Physics.Arcade.Body).setPosition(200, 480);
    });
    this.add.text(355, 660, 'To Lounge', { font: '16px VT323', color: '#ffffff' });


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
    this.physics.add.overlap(this.player, this.nearZone, this.onPlayerNear, undefined, this);

    this.time.addEvent({
      delay: 100,
      callback: this.sendPosition,
      callbackScope: this,
      loop: true,
    });
  }

  private sendPosition() {
    const { x, y } = this.player.body.position;
    if (x !== this.lastSentPosition.x || y !== this.lastSentPosition.y) {
       this.chatService.broadcastPlayerPosition(x, y, this.myEmail, this.myClientId);
       this.lastSentPosition = { x, y };
    }
  }
  
  onPlayerNear() {
    if (!this.isNear) {
      this.isNear = true;
      const onNearCallback = this.game.registry.get('onPlayerNear');
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
      playerData.nameTag.setPosition(x, y - 15);
    } else {
      const otherPlayerColor = 0x38bdf8;
      const avatar = this.add.circle(x + 10, y + 10, 10, otherPlayerColor);
      this.physics.add.existing(avatar);
      (avatar.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      
      const nameTag = this.add.text(x, y - 15, email, { 
        font: '12px VT323', 
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x:2, y: 1 }
      }).setOrigin(0.5);

      const newPlayerData = { avatar, nameTag };
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

    const isOverlapping = this.physics.overlap(this.player, this.nearZone);
    if (this.isNear && !isOverlapping) {
      this.isNear = false;
      const onFarCallback = this.game.registry.get('onPlayerFar');
      if (onFarCallback) onFarCallback();
    }
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
