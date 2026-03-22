export const Colors = {
	ROAD_LIGHT: new Phaser.Display.Color(127, 127, 127, 1),
	ROAD_DARK: new Phaser.Display.Color(123, 123, 123, 1),

	// pavement tiles — two shades create horizontal tile-row bands in perspective
	GRASS_LIGHT: new Phaser.Display.Color(139, 125, 107, 1),  // warm sandy-beige tile surface
	GRASS_DARK:  new Phaser.Display.Color(108,  97,  82, 1),  // darker grout-line row

	LANE_MARKER: new Phaser.Display.Color(220, 220, 220, 1),

	// Gulf highway kerb: yellow / black alternating
	RUMBLE_LIGHT: new Phaser.Display.Color(220, 180,   0, 1),  // yellow
	RUMBLE_DARK:  new Phaser.Display.Color( 20,  20,  20, 1),  // black

	SKY: new Phaser.Display.Color(127, 127, 255, 1),
};

export const DarkColors = {
	ROAD: Colors.ROAD_DARK.color,
	GRASS: Colors.GRASS_DARK.color,
	RUMBLE: Colors.RUMBLE_LIGHT.color,
};

export const LightColors = {
	ROAD: Colors.ROAD_LIGHT.color,
	GRASS: Colors.GRASS_LIGHT.color,
	RUMBLE: Colors.RUMBLE_DARK.color,
	LANE: Colors.LANE_MARKER.color,
};
