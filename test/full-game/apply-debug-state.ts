import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 22456 }, defender: { entityId: 23959 } },
		{ attacker: { entityId: 22456 }, defender: { entityId: 23962 } },
	];
};
