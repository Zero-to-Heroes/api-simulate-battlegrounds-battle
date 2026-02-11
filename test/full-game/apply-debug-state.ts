import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 8857 }, defender: { entityId: 6715 } },
		{ attacker: { entityId: 8865 }, defender: { entityId: 8032 } },
	];
};
