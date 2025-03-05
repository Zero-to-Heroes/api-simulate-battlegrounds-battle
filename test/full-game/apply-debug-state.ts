import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	// state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 2607 }, defender: { entityId: 3566 } },
		{ attacker: { entityId: 2607 }, defender: { entityId: 3567 } },
		// { attacker: { entityId: 1351 }, defender: { entityId: 608 } },
	];
};
