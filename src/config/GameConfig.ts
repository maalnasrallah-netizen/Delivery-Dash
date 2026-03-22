import { PasuunaPlugin } from '@pinkkis/phaser-plugin-pasuuna';

// phaser game config
export const gameConfig: GameConfig = {
	type: Phaser.AUTO,
	scale: {
		parent: 'game-container',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 480,
		height: 854,
	},
	render: {
		pixelArt: false,
	},
	plugins: {
		global: [
			{
				key: 'PasuunaPlayerPlugin',
				plugin: PasuunaPlugin,
				start: true,
				mapping: 'pasuuna',
			},
		] as any[],
	},
};
