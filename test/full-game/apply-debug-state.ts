import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 2698 }, defender: { entityId: 1793 } },
		{ attacker: { entityId: 2341 }, defender: { attack: 1, health: 1 } },
		{ attacker: { attack: 1, health: 1 }, defender: { entityId: 1793 } },
		{ attacker: { entityId: 1795 }, defender: { entityId: 2699 } },
	];
};
