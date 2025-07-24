import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 2642 }, defender: { entityId: 1898 } },
		{ attacker: { entityId: 2643 }, defender: { entityId: 2303 } },
	];
};
