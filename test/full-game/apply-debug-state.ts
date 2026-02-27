import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 22456 }, defender: { entityId: 23959 } },
		{ attacker: { entityId: 22456 }, defender: { entityId: 23962 } },
	];
};
