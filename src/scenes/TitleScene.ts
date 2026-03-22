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
		this.add.image(w / 2, h * 0.38, 'rider').setDisplaySize(130, 178).setDepth(2);

		// title
		this.add.bitmapText(w / 2, h * 0.60, 'impact', 'DELIVERY\nDASH', 32)
			.setOrigin(0.5, 0.5)
			.setTint(0xffaa00)
			.setCenterAlign()
			.setDepth(2);

		// iOS 13+ requires explicit user gesture to enable DeviceOrientation
		const needsPermission = typeof (DeviceOrientationEvent as any).requestPermission === 'function';

		// canStartGame is false on iOS until the tilt button is pressed (granted or not)
		let canStartGame = !needsPermission;

		if (needsPermission) {
			// push tap-to-play lower and add a tilt permission button above it
			const tiltBg = this.add.rectangle(w / 2, h * 0.76, w * 0.72, 46, 0x002244, 0.85)
				.setDepth(2)
				.setStrokeStyle(2, 0x00aaff);

			const tiltBtn = this.add.bitmapText(w / 2, h * 0.76, 'impact', 'ENABLE TILT CONTROLS', 15)
				.setOrigin(0.5, 0.5)
				.setTint(0x00ccff)
				.setDepth(3)
				.setInteractive({ useHandCursor: true });

			tiltBtn.on('pointerdown', () => {
				(DeviceOrientationEvent as any).requestPermission()
					.then((result: string) => {
						if (result === 'granted') {
							tiltBtn.setText('TILT ENABLED   OK').setTint(0x00ff88);
							tiltBg.setStrokeStyle(2, 0x00ff88);
						} else {
							tiltBtn.setText('TILT DENIED').setTint(0xaaaaaa);
							tiltBg.setStrokeStyle(2, 0x888888);
						}
					})
					.catch(() => {
						tiltBtn.setText('TILT UNAVAILABLE').setTint(0x888888);
					})
					.finally(() => {
						canStartGame = true;
					});
			});

			const tapText = this.add.bitmapText(w / 2, h * 0.90, 'impact', 'TAP TO PLAY', 18)
				.setOrigin(0.5, 0.5)
				.setTint(0xffffff)
				.setAlpha(0.4)
				.setDepth(2);

			this.tweens.add({ targets: tapText, alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
		} else {
			// non-iOS: tilt auto-detected in game, just show tap to play
			const tapText = this.add.bitmapText(w / 2, h * 0.83, 'impact', 'TAP TO PLAY', 18)
				.setOrigin(0.5, 0.5)
				.setTint(0xffffff)
				.setDepth(2);

			this.tweens.add({ targets: tapText, alpha: 0.2, duration: 700, yoyo: true, repeat: -1 });
		}

		this.input.on('pointerdown', () => {
			if (canStartGame) this.scene.start('GameScene');
		});
		this.input.keyboard.once('keydown', () => this.scene.start('GameScene'));
	}
}
