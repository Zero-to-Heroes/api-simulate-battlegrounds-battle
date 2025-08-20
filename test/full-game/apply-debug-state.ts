import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 7673 }, defender: { entityId: 5843 } },
		{ attacker: { entityId: 6732 }, defender: { entityId: 7695 } },
		{ attacker: { entityId: 7678 }, defender: { entityId: 6683 } },
		{ attacker: { entityId: 5846 }, defender: { entityId: 7692 } },
		{ attacker: { attack: 8, health: 8 }, defender: { entityId: 6683 } },
		{ attacker: { entityId: 5850 }, defender: { attack: 9, health: 9 } },
		{ attacker: { attack: 10, health: 10 }, defender: { entityId: 7866 } },
	];
};
