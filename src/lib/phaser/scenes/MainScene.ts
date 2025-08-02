
import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.GameObjectWithBody & Phaser.GameObjects.Shape;
  private npc!: Phaser.Types.Physics.Arcade.GameObjectWithBody & Phaser.GameObjects.Shape;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private nearZone!: Phaser.GameObjects.Zone;
  private isNear = false;

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: { startX: number, startY: number }) {
    this.playerStartX = data.startX || 200;
    this.playerStartY = data.startY || 200;
  }

  private playerStartX = 200;
  private playerStartY = 200;

  create() {
    const wallColor = 0x6678b8; // Primary color
    const playerColor = 0xf7b733; // Accent color
    const npcColor = 0x374151; // Gray-700
    const portalColor = 0x4ade80; // Green-400
    
    // World bounds
    this.physics.world.setBounds(0, 0, 800, 1200);

    // --- Room definitions ---
    // Lounge
    this.add.rectangle(225, 200, 350, 300).setStrokeStyle(2, wallColor, 0.3);
    this.add.text(65, 65, 'Lounge', { font: '24px Inter', color: '#6678b8' });

    // Focus Zone
    this.add.rectangle(575, 400, 350, 300).setStrokeStyle(2, wallColor, 0.3);
    this.add.text(420, 265, 'Focus Zone', { font: '24px Inter', color: '#6678b8' });
    
    // Coffee Room
    this.add.rectangle(400, 900, 700, 500).setStrokeStyle(2, wallColor, 0.3);
    this.add.text(80, 665, 'Coffee Room', { font: '24px Inter', color: '#6678b8' });
    this.add.circle(150, 800, 30, 0x8c5e3c).setStrokeStyle(2, 0x6f4e37); // Table
    this.add.circle(650, 1000, 30, 0x8c5e3c).setStrokeStyle(2, 0x6f4e37); // Table

    // World objects
    const walls = this.physics.add.staticGroup();
    // Main Area walls
    walls.add(this.add.rectangle(400, 50, 700, 20, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(400, 550, 700, 20, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(50, 300, 20, 420, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(750, 300, 20, 420, wallColor).setOrigin(0.5));
    // Coffee Room walls
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

    // Near Zone for NPC
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
        this.player.body.position.x = 375;
        this.player.body.position.y = 680;
    });
    this.add.text(180, 500, 'To Coffee Room', { font: '12px Inter', color: '#ffffff' });

    const toLoungePortal = this.add.rectangle(400, 680, 100, 10, portalColor);
    this.physics.add.existing(toLoungePortal);
    (toLoungePortal.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (toLoungePortal.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    this.physics.add.overlap(this.player, toLoungePortal, () => {
        this.player.body.position.x = 200;
        this.player.body.position.y = 480;
    });
    this.add.text(355, 660, 'To Lounge', { font: '12px Inter', color: '#ffffff' });


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
  }
  
  onPlayerNear() {
    if (!this.isNear) {
      this.isNear = true;
      const onNearCallback = this.game.registry.get('onPlayerNear');
      if (onNearCallback) onNearCallback();
    }
  }

  update() {
    const speed = 200;
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.body.velocity.x = -speed;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.body.velocity.x = speed;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.body.velocity.y = -speed;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.body.velocity.y = speed;
    }

    this.player.body.velocity.normalize().scale(speed);

    const isOverlapping = this.physics.overlap(this.player, this.nearZone);
    if (this.isNear && !isOverlapping) {
      this.isNear = false;
      const onFarCallback = this.game.registry.get('onPlayerFar');
      if (onFarCallback) onFarCallback();
    }
  }
}
