import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 13557 }, defender: { entityId: 15005 } },
		{ attacker: { entityId: 14997 }, defender: { entityId: 13596 } },
		{ attacker: { entityId: 13571 }, defender: { entityId: 15017 } },
		{ attacker: { entityId: 15002 }, defender: { entityId: 13596 } },
		{ attacker: { entityId: 13577 }, defender: { entityId: 15017 } },
		{ attacker: { attack: 18, health: 17 }, defender: { entityId: 13581 } },
		{ attacker: { entityId: 13585 }, defender: { entityId: 15015 } },
		{ attacker: { attack: 46, health: 46 }, defender: { entityId: 13581 } },
		{ attacker: { entityId: 15251 }, defender: { entityId: 13581 } },
		{ attacker: { entityId: 13589 }, defender: { entityId: 15009 } },
		{ attacker: { entityId: 13557 }, defender: { attack: 3, health: 3 } },
		{ attacker: { entityId: 13557 }, defender: { entityId: 15017 } },
	];
};
