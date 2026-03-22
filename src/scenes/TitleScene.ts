import { BaseScene } from './BaseScene';

export class TitleScene extends BaseScene {
	constructor(key: string, options: any) {
		super('TitleScene');
	}

	public create(): void {
		const w = this.scale.gameSize.width;
		const h = this.scale.gameSize.height;

		// Kuwait City night skyline as background
		this.add.image(0, 0, 'kuwait-bg').setOrigin(0, 0).setDisplaySize(w, h).setDepth(0);

		// dark overlay so text is readable
		this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.45).setDepth(1);

		// rider sprite centered in upper portion
		this.add.image(w / 2, h * 0.42, 'rider').setDisplaySize(130, 178).setDepth(2);

		// title
		this.add.bitmapText(w / 2, h * 0.68, 'impact', 'DELIVERY\nDASH', 32)
			.setOrigin(0.5, 0.5)
			.setTint(0xffaa00)
			.setCenterAlign()
			.setDepth(2);

		// tap to play — pulse tween
		const tapText = this.add.bitmapText(w / 2, h * 0.83, 'impact', 'TAP TO PLAY', 18)
			.setOrigin(0.5, 0.5)
			.setTint(0xffffff)
			.setDepth(2);

		this.tweens.add({
			targets: tapText,
			alpha: 0.2,
			duration: 700,
			yoyo: true,
			repeat: -1,
		});

		this.input.once('pointerdown', () => this.scene.start('GameScene'));
		this.input.keyboard.once('keydown', () => this.scene.start('GameScene'));
	}
}
