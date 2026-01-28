import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 17926 }, defender: { entityId: 16018 } },
		{ attacker: { entityId: 16018 }, defender: { entityId: 17941 } },
	];
};
