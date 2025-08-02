
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

  create() {
    const wallColor = 0x6678b8; // Primary color
    const playerColor = 0xf7b733; // Accent color
    const npcColor = 0x374151; // Gray-700
    
    // World bounds
    this.physics.world.setBounds(0, 0, 800, 600);

    // World objects
    const walls = this.physics.add.staticGroup();
    walls.add(this.add.rectangle(400, 50, 700, 20, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(400, 550, 700, 20, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(50, 300, 20, 420, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(750, 300, 20, 420, wallColor).setOrigin(0.5));
    walls.add(this.add.rectangle(400, 300, 100, 100, wallColor).setOrigin(0.5));
    
    // Player
    this.player = this.add.circle(200, 200, 10, playerColor);
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
    this.cameras.main.setBounds(0, 0, 800, 600);

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
