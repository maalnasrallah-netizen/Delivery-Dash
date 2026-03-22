import { BaseScene } from './BaseScene';

export class GameOverScene extends BaseScene {
	constructor(key: string, options: any) {
		super('GameOverScene');
	}

	public create(data: { score: number }): void {
		const w = this.scale.gameSize.width;
		const h = this.scale.gameSize.height;

		// same layout as TitleScene
		this.add.image(0, 0, 'kuwait-bg').setOrigin(0, 0).setDisplaySize(w, h).setDepth(0);
		this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.55).setDepth(1);
		this.add.image(w / 2, h * 0.38, 'rider').setDisplaySize(130, 178).setDepth(2);

		this.add.bitmapText(w / 2, h * 0.60, 'impact', 'DELIVERY\nDASH', 32)
			.setOrigin(0.5, 0.5)
			.setTint(0xffaa00)
			.setCenterAlign()
			.setDepth(2);

		this.add.bitmapText(w / 2, h * 0.74, 'impact', 'GAME OVER', 22)
			.setOrigin(0.5, 0.5)
			.setTint(0xff3333)
			.setDepth(2);

		this.add.bitmapText(w / 2, h * 0.82, 'impact', `${data.score}m`, 28)
			.setOrigin(0.5, 0.5)
			.setTint(0xffdd00)
			.setDepth(2);

		const restartText = this.add.bitmapText(w / 2, h * 0.91, 'impact', 'TAP TO RESTART', 18)
			.setOrigin(0.5, 0.5)
			.setTint(0xffffff)
			.setDepth(2);

		this.tweens.add({
			targets: restartText,
			alpha: 0.2,
			duration: 700,
			yoyo: true,
			repeat: -1,
		});

		const restart = () => this.scene.start('GameScene');
		this.input.once('pointerdown', restart);
		this.input.keyboard.once('keydown', restart);
	}
}
