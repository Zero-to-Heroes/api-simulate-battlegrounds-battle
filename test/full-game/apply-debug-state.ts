import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 7578 }, defender: { entityId: 10070 } },
		{ attacker: { entityId: 10064 }, defender: { entityId: 7605 } },
		{ attacker: { entityId: 7584 }, defender: { entityId: 10065 } },
		{ attacker: { attack: 2, health: 3 }, defender: { entityId: 7596 } },
		{ attacker: { entityId: 8378 }, defender: { entityId: 10073 } },
		{ attacker: { entityId: 10068 }, defender: { entityId: 7589 } },
		{ attacker: { entityId: 10073 }, defender: { entityId: 7584 } },
		{ attacker: { entityId: 10075 }, defender: { entityId: 7589 } },
	];
};
