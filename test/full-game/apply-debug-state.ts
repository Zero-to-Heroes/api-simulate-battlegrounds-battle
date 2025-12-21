import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 18679 }, defender: { entityId: 17124 } },
		{ attacker: { entityId: 18679 }, defender: { entityId: 18173 } },
	];
};
