import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 3112 }, defender: { entityId: 2114 } },
		{ attacker: { entityId: 2112 }, defender: { entityId: 3122 } },
		{ attacker: { entityId: 3113 }, defender: { entityId: 4117 } },
	];
};
