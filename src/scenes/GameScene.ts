import { BaseScene } from './BaseScene';
import { Input } from 'phaser';
import { gameSettings } from '../config/GameSettings';
import { Util } from '../Components/Util';
import { Player } from '../Components/Player';
import { Road } from '../Components/Road';
import { Renderer } from '../Components/Renderer';
import { TrackSegment } from '../Components/TrackSegment';
import { CarManager } from '../Components/CarManager';

export class GameScene extends BaseScene {
	public player: Player;
	public road: Road;
	public renderer: Renderer;
	public carManager: CarManager;
	public score: number = 0;

	public debugText: Phaser.GameObjects.BitmapText;
	public sky: Phaser.GameObjects.Image;

	public camera: Phaser.Cameras.Scene2D.Camera;
	public cameraAngle: number = 0;

	public cursors: Input.Keyboard.CursorKeys;

	public tiltGamma: number = 0;
	public tiltActive: boolean = false;

	private elapsedMs: number = 0;
	private touchLeft: boolean = false;
	private touchRight: boolean = false;
	private tiltCalibration: number = 0;
	private orientationHandler: (e: DeviceOrientationEvent) => void;

	constructor(key: string, options: any) {
		super('GameScene');
	}

	public create(): void {
		this.scene.launch('RaceUiScene', this);

		const gameWidth = this.scale.gameSize.width;
		const gameHeight = this.scale.gameSize.height;

		this.score = 0;
		this.elapsedMs = 0;

		this.cursors = this.input.keyboard.createCursorKeys();
		this.camera = this.cameras.main;

		// touch: hold left half = steer left, hold right half = steer right
		this.touchLeft = false;
		this.touchRight = false;
		this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
			if (pointer.x < gameWidth / 2) { this.touchLeft = true; } else { this.touchRight = true; }
		});
		this.input.on('pointerup', () => { this.touchLeft = false; this.touchRight = false; });

		this.road = new Road(this);
		this.carManager = new CarManager(this, this.road);

		// sky anchored to road horizon: horizon y = (height - projectYCompensation) / 2
		const horizonY = Math.round((gameHeight - gameSettings.projectYCompensation) / 2);
		this.sky = this.add.image(0, horizonY, 'kuwait-bg').setOrigin(0, 1).setDepth(0).setDisplaySize(gameWidth, horizonY + 10);

		this.renderer = new Renderer(this, 5);
		this.player = new Player(this, 0, gameHeight - 5, gameSettings.cameraHeight * gameSettings.cameraDepth + 300);

		// start at 35% of max speed; ramps up automatically
		this.player.speed = gameSettings.maxSpeed * 0.35;

		this.debugText = this.add.bitmapText(5, 5, 'retro', '', 16).setTint(0xff0000).setDepth(200);

		// Generate street lamp texture in code (only once — texture persists across restarts)
		if (!this.textures.exists('lamp-post')) {
			const g = this.make.graphics({ x: 0, y: 0, add: false });
			const tw = 24, th = 128;

			// outer glow halo
			g.fillStyle(0xFF8800, 0.07); g.fillCircle(tw / 2, 13, 18);
			g.fillStyle(0xFF8800, 0.14); g.fillCircle(tw / 2, 13, 12);
			g.fillStyle(0xFFAA00, 0.35); g.fillCircle(tw / 2, 13, 7);
			g.fillStyle(0xFFCC44, 0.70); g.fillCircle(tw / 2, 13, 4);

			// lamp head — warm orange ellipse
			g.fillStyle(0xFF9900, 1);
			g.fillEllipse(tw / 2, 15, 16, 8);

			// short arm connecting lamp to pole
			g.fillStyle(0x1a1a1a, 1);
			g.fillRect(tw / 2 - 2, 18, 4, 6);

			// pole — tall dark column
			g.fillStyle(0x222222, 1);
			g.fillRect(tw / 2 - 2, 24, 4, th - 24);

			g.generateTexture('lamp-post', tw, th);
			g.destroy();
		}

		this.setupTiltControls();

		this.road.resetRoad();
		this.carManager.resetCars();

		this.pasuuna.loadSongFromCache('dream-candy', true);
		this.pasuuna.setVolume(0.70);
	}

	public update(time: number, delta: number): void {
		const dlt = delta * 0.01;

		this.elapsedMs += delta;
		this.score += dlt * this.player.speed * 0.003; // score = meters traveled

		// auto speed: ramps from 35% to 100% of maxSpeed over ~90 seconds
		this.player.speed = Math.min(
			gameSettings.maxSpeed * 0.35 + (this.elapsedMs / 90000) * gameSettings.maxSpeed * 0.65,
			gameSettings.maxSpeed,
		);

		const playerSegment = this.road.findSegmentByZ(this.player.trackPosition + this.player.z);
		const playerPercent = Util.percentRemaining(this.player.trackPosition + this.player.z, gameSettings.segmentLength);
		const speedMultiplier = this.player.speed / gameSettings.maxSpeed;
		const dx = dlt * speedMultiplier;

		this.handleInput(delta, playerSegment);

		this.player.y = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
		this.player.x = this.player.x - (dx * speedMultiplier * playerSegment.curve * gameSettings.centrifugal);

		this.player.speed = Phaser.Math.Clamp(this.player.speed, 0, gameSettings.maxSpeed);

		// edge bounce: hitting road edge reverses turn toward center
		if (this.player.x >= gameSettings.roadWidthClamp) {
			this.player.x = gameSettings.roadWidthClamp;
			this.player.turn = -0.6;
		} else if (this.player.x <= -gameSettings.roadWidthClamp) {
			this.player.x = -gameSettings.roadWidthClamp;
			this.player.turn = 0.6;
		}

		this.player.turn = Phaser.Math.Clamp(this.player.turn, -gameSettings.maxTurn, gameSettings.maxTurn);
		this.player.trackPosition = Util.increase(this.player.trackPosition, dlt * this.player.speed, this.road.trackLength);

		this.player.pitch = (playerSegment.p1.world.y - playerSegment.p2.world.y) * 0.002;

		// world-space collision: same/adjacent segment + lateral overlap in road coords
		// original behaviour: push rider back behind the car and halve speed
		for (let i = 0; i <= 0; i++) {
			const seg = this.road.segments[(playerSegment.index + i) % this.road.segments.length];
			for (const car of seg.cars) {
				if (Math.abs(this.player.x - car.offset) < 0.2) {
					this.player.collide('car');
					this.player.trackPosition = Util.increase(car.trackPosition, -this.player.z, this.road.trackLength);
					this.player.speed = this.player.speed / 2;
				}
			}
		}

		this.road.hideAllProps();
		this.carManager.hideAll();

		// draw road
		this.renderer.update(time, delta);

		// spawn / update oncoming cars
		this.carManager.update(delta, this.player.trackPosition, this.elapsedMs, this.player.speed);

		// update player visuals
		this.player.update(delta, dx);

		// camera tilt
		this.cameraAngle = Phaser.Math.Clamp(this.cameraAngle, -6, 6);
		this.camera.setAngle(this.cameraAngle);
	}

	public get tiltNormalized(): number {
		if (!this.tiltActive) return 0;
		return Phaser.Math.Clamp((this.tiltGamma - this.tiltCalibration) / 25, -1, 1);
	}

	// private ------------------------------------
	private triggerGameOver(): void {
		this.player.collide('car');
		this.scene.stop('RaceUiScene');
		this.scene.pause();
		this.scene.launch('GameOverScene', { score: Math.floor(this.score) });
	}

	private setupTiltControls(): void {
		if (!window.DeviceOrientationEvent) return;

		this.tiltActive = false;
		this.tiltGamma = 0;

		this.orientationHandler = (e: DeviceOrientationEvent) => {
			if (e.gamma === null) return;
			if (!this.tiltActive) {
				this.tiltCalibration = e.gamma;
				this.tiltActive = true;
			}
			this.tiltGamma = e.gamma;
		};

		window.addEventListener('deviceorientation', this.orientationHandler);

		this.events.once('shutdown', () => {
			if (this.orientationHandler) {
				window.removeEventListener('deviceorientation', this.orientationHandler);
			}
		});
	}

	private handleInput(delta: number, playerSegment: TrackSegment): void {
		const dlt = delta * 0.01;
		const curveMultiplier = Math.abs(playerSegment.curve) > 0.1 ? 0.5 : 0.25;

		if (this.tiltActive) {
			// tilt controls: gamma = left/right phone tilt, calibrated to holding position
			const tiltAngle = this.tiltGamma - this.tiltCalibration;
			const deadZone = 3;   // degrees of ignored dead zone
			const maxTilt = 25;   // degrees = full turn rate
			const absAngle = Math.abs(tiltAngle);

			if (absAngle > deadZone) {
				const strength = Phaser.Math.Clamp((absAngle - deadZone) / (maxTilt - deadZone), 0, 1);
				const dir = Math.sign(tiltAngle);
				this.player.turn += dlt * curveMultiplier * dir * strength;
				this.cameraAngle -= dlt * dir * strength;
			} else {
				this.player.turn = Math.abs(this.player.turn) < 0.01 ? 0 : Util.interpolate(this.player.turn, 0, gameSettings.turnResetMultiplier);
				this.cameraAngle = Math.abs(this.cameraAngle) < 0.02 ? 0 : Util.interpolate(this.cameraAngle, 0, gameSettings.cameraAngleResetMultiplier);
			}
		} else if (this.cursors.left.isDown || this.touchLeft) {
			this.player.turn -= dlt * curveMultiplier;
			this.cameraAngle += dlt;
		} else if (this.cursors.right.isDown || this.touchRight) {
			this.player.turn += dlt * curveMultiplier;
			this.cameraAngle -= dlt;
		} else {
			this.player.turn = Math.abs(this.player.turn) < 0.01 ? 0 : Util.interpolate(this.player.turn, 0, gameSettings.turnResetMultiplier);
			this.cameraAngle = Math.abs(this.cameraAngle) < 0.02 ? 0 : Util.interpolate(this.cameraAngle, 0, gameSettings.cameraAngleResetMultiplier);
		}
	}
}
