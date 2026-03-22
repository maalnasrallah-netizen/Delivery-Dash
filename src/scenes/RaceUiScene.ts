import { BaseScene } from './BaseScene';
import { GameScene } from './GameScene';

export class RaceUiScene extends BaseScene {
	private scoreText: Phaser.GameObjects.BitmapText;
	private gameScene: GameScene;
	private tiltContainer: Phaser.GameObjects.Container;
	private tiltNeedle: Phaser.GameObjects.Rectangle;

	constructor(key: string, options: any) {
		super('RaceUiScene');
	}

	public create(gameScene: GameScene): void {
		this.gameScene = gameScene;
		const w = this.scale.gameSize.width;
		const h = this.scale.gameSize.height;

		this.scoreText = this.add.bitmapText(w / 2, 18, 'impact', '0', 28).setOrigin(0.5, 0).setTint(0xffdd00).setDepth(100);

		// Tilt indicator: horizontal spirit-level bar at bottom center
		// Shown only when tilt controls are active
		const barW = 90, barH = 8;
		const bg = this.add.rectangle(0, 0, barW, barH, 0x000000, 0.55).setStrokeStyle(1, 0x00aaff);
		const label = this.add.bitmapText(0, -16, 'impact', 'TILT', 11).setOrigin(0.5, 0.5).setTint(0x00ccff);
		this.tiltNeedle = this.add.rectangle(0, 0, 10, barH + 6, 0x00ccff);
		this.tiltContainer = this.add.container(w / 2, h - 26, [bg, label, this.tiltNeedle])
			.setDepth(100)
			.setVisible(false);
	}

	public update(): void {
		if (!this.gameScene) return;

		this.scoreText.setText(Math.floor(this.gameScene.score) + 'm');

		if (this.gameScene.tiltActive) {
			this.tiltContainer.setVisible(true);
			// needle position: ±(barW/2 - needle_half_width) = ±40
			this.tiltNeedle.setX(this.gameScene.tiltNormalized * 40);
		}
	}
}
