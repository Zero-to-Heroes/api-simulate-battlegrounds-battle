import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 8937 }, defender: { entityId: 11435 } },
		{ attacker: { entityId: 8937 }, defender: { entityId: 11433 } },
		{ attacker: { entityId: 11427 }, defender: { entityId: 8974 } },
		{ attacker: { entityId: 8944 }, defender: { entityId: 11435 } },
	];
};
