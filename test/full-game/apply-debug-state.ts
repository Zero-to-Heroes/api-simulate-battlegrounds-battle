import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		// { attacker: { entityId: 4193 }, defender: { entityId: 4988 } },
		// { attacker: { entityId: 3535 }, defender: { entityId: 4985 } },
		// { attacker: { entityId: 4978 }, defender: { entityId: 3541 } },
	];
};
