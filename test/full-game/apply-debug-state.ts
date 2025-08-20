import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 2157 }, defender: { entityId: 2413 } },
		{ attacker: { entityId: 2411 }, defender: { entityId: 1683 } },
	];
};
