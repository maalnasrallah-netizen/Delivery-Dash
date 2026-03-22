import { BaseScene } from './BaseScene';
import { GameScene } from './GameScene';

export class RaceUiScene extends BaseScene {
	private scoreText: Phaser.GameObjects.BitmapText;
	private gameScene: GameScene;

	constructor(key: string, options: any) {
		super('RaceUiScene');
	}

	public create(gameScene: GameScene): void {
		this.gameScene = gameScene;
		const cx = this.scale.gameSize.width / 2;
		this.scoreText = this.add.bitmapText(cx, 18, 'impact', '0', 28).setOrigin(0.5, 0).setTint(0xffdd00).setDepth(100);
	}

	public update(): void {
		if (this.gameScene) {
			this.scoreText.setText(Math.floor(this.gameScene.score) + 'm');
		}
	}
}
