import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 12287 }, defender: { entityId: 10601 } },
		{ attacker: { entityId: 12287 }, defender: { attack: 2, health: 3 } },
		{ attacker: { entityId: 10597 }, defender: { entityId: 12297 } },
	];
};
