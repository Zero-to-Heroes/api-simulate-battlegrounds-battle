import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { attack: 1, health: 2 }, defender: { entityId: 1416 } },
		{ attacker: { entityId: 1086 }, defender: { entityId: 1417 } },
		{ attacker: { entityId: 1416 }, defender: { attack: 1, health: 2 } },
		{ attacker: { entityId: 867 }, defender: { entityId: 1416 } },
		{ attacker: { entityId: 1417 }, defender: { entityId: 1088 } },
	];
};
