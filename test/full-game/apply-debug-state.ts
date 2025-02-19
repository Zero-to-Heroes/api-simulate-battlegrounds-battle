import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	// state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 1349 }, defender: { entityId: 608 } },
		{ attacker: { entityId: 608 }, defender: { entityId: 1352 } },
		{ attacker: { entityId: 1351 }, defender: { entityId: 608 } },
	];
};
