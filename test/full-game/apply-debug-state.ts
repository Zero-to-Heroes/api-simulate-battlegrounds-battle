import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 5640 }, defender: { entityId: 7493 } },
		{ attacker: { entityId: 10537 }, defender: { entityId: 13370 } },
	];
};
