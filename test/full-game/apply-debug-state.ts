import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 10095 }, defender: { entityId: 8733 } },
		{ attacker: { entityId: 10095 }, defender: { entityId: 9021 } },
	];
};
