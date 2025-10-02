import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 7480 }, defender: { entityId: 9913 } },
		{ attacker: { entityId: 9905 }, defender: { entityId: 7481 } },
		{ attacker: { entityId: 7481 }, defender: { entityId: 9917 } },
		{ attacker: { entityId: 9909 }, defender: { entityId: 7485 } },
	];
};
