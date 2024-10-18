import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		// { attacker: { entityId: 5868 }, defender: { entityId: 7744 } },
	];
};
