import { Car } from './Car';
import { Road } from './Road';
import { gameSettings } from '../config/GameSettings';
import { GameScene } from '../scenes/GameScene';
import { Util } from './Util';

export class CarManager {
	public scene: GameScene;
	public cars: Set<Car> = new Set<Car>();

	private road: Road;
	private spawnDistAccum: number = 0;

	constructor(scene: GameScene, road: Road) {
		this.scene = scene;
		this.road = road;
	}

	public resetCars(): void {
		this.destroy();
		this.spawnDistAccum = 0;
	}

	// distance-based spawning: one car every N road-units, N shrinks over time
	public update(delta: number, playerTrackPos: number, elapsedMs: number, playerSpeed: number): void {
		const dlt = delta * 0.01;
		this.spawnDistAccum += dlt * playerSpeed;

		// interval starts at 12000 road-units apart, floors at 5000 after ~90 seconds
		const spawnDist = Math.max(5000, 12000 - (elapsedMs / 90000) * 7000);

		if (this.spawnDistAccum >= spawnDist) {
			this.spawnDistAccum = 0;
			if (this.cars.size < 3) {
				this.spawnOncoming(playerTrackPos);
			}
		}

		// move all cars along the track
		for (const car of this.cars) {
			const oldSegment = this.road.findSegmentByZ(car.trackPosition);
			car.trackPosition = Util.increase(car.trackPosition, dlt * car.speed, this.road.trackLength);
			car.percent = Util.percentRemaining(car.trackPosition, gameSettings.segmentLength);

			const newSegment = this.road.findSegmentByZ(car.trackPosition);
			if (newSegment.index !== oldSegment.index) {
				oldSegment.cars.delete(car);
				newSegment.cars.add(car);
			}
		}

		// cleanup cars the player has passed (> 10 segments behind)
		const toRemove: Car[] = [];
		for (const car of this.cars) {
			const dist = (playerTrackPos - car.trackPosition + this.road.trackLength) % this.road.trackLength;
			if (dist > 10 * gameSettings.segmentLength && dist < this.road.trackLength * 0.5) {
				toRemove.push(car);
			}
		}
		for (const car of toRemove) {
			const seg = this.road.findSegmentByZ(car.trackPosition);
			seg.cars.delete(car);
			car.destroy();
			this.cars.delete(car);
		}
	}

	public hideAll(): void {
		this.cars.forEach((car: Car) => car.sprite.setVisible(false));
	}

	public destroy(): void {
		this.cars.forEach((car: Car) => {
			try {
				const seg = this.road.findSegmentByZ(car.trackPosition);
				seg.cars.delete(car);
			} catch (e) { /* segment may not exist on reset */ }
			car.destroy();
		});
		this.cars.clear();
	}

	private spawnOncoming(playerTrackPos: number): void {
		// spawn 80–180 segments ahead so player catches up within a few seconds
		const segments = Phaser.Math.Between(80, 180);
		const spawnPos = Util.increase(playerTrackPos, segments * gameSettings.segmentLength, this.road.trackLength);
		const roadOffset = Phaser.Math.FloatBetween(-0.75, 0.75);
		const spriteKey = this.getRandomCarType();

		const car = new Car(this.scene, this.road, roadOffset, spawnPos, spriteKey, gameSettings.maxSpeed * 0.1);
		const seg = this.road.findSegmentByZ(spawnPos);
		seg.cars.add(car);
		this.cars.add(car);
	}

	private getRandomCarType(): string {
		const types = ['car-army', 'car-yellow', 'car-red', 'car-green', 'car-blue'];
		return types[Phaser.Math.Between(0, types.length - 1)];
	}
}
