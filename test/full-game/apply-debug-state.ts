import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 10634 }, defender: { entityId: 12076 } },
		{ attacker: { entityId: 12287 }, defender: { attack: 2, health: 3 } },
		{ attacker: { entityId: 10597 }, defender: { entityId: 12297 } },
	];
};
