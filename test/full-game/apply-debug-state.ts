import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOff = [
		{ attacker: { entityId: 9513 }, defender: { entityId: 10733 } },
		{ attacker: { entityId: 10737 }, defender: { entityId: 8038 } },
	];
};
