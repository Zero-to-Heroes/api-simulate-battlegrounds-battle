import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 8605 }, defender: { entityId: 7802 } },
		{ attacker: { entityId: 8628 }, defender: { entityId: 6133 } },
	];
};
