import { BaseScene } from './BaseScene';

export class GameOverScene extends BaseScene {
	constructor(key: string, options: any) {
		super('GameOverScene');
	}

	public create(data: { score: number }): void {
		const w = this.scale.gameSize.width;
		const h = this.scale.gameSize.height;

		// semi-transparent overlay over the paused GameScene
		this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.65).setDepth(0);

		// game over
		this.add.bitmapText(w / 2, h * 0.35, 'impact', 'GAME OVER', 32)
			.setOrigin(0.5, 0.5)
			.setTint(0xff3333)
			.setDepth(1);

		// score
		this.add.bitmapText(w / 2, h * 0.48, 'impact', `${data.score}m`, 24)
			.setOrigin(0.5, 0.5)
			.setTint(0xffdd00)
			.setDepth(1);

		// restart prompt — pulse tween
		const restartText = this.add.bitmapText(w / 2, h * 0.62, 'impact', 'TAP TO RESTART', 18)
			.setOrigin(0.5, 0.5)
			.setTint(0xffffff)
			.setDepth(1);

		this.tweens.add({
			targets: restartText,
			alpha: 0.2,
			duration: 700,
			yoyo: true,
			repeat: -1,
		});

		const restart = () => {
			this.scene.stop('GameOverScene');
			this.scene.stop('GameScene');
			this.scene.start('GameScene');
		};

		this.input.once('pointerdown', restart);
		this.input.keyboard.once('keydown', restart);
	}
}
