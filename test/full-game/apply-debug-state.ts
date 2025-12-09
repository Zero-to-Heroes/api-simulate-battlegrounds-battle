import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 7483 }, defender: { entityId: 6587 } },
		{ attacker: { entityId: 5489 }, defender: { entityId: 7484 } },
		{ attacker: { attack: 7, health: 1 }, defender: { entityId: 5505 } },
		{ attacker: { entityId: 5493 }, defender: { entityId: 8130 } },
		{ attacker: { entityId: 8130 }, defender: { entityId: 5501 } },
		{ attacker: { entityId: 8130 }, defender: { entityId: 5505 } },
		{ attacker: { entityId: 5497 }, defender: { entityId: 7486 } },
		{ attacker: { entityId: 7488 }, defender: { entityId: 5489 } },
		{ attacker: { entityId: 6587 }, defender: { entityId: 7492 } },
		{ attacker: { entityId: 7491 }, defender: { entityId: 5497 } },
		{ attacker: { entityId: 5497 }, defender: { entityId: 7488 } },
	];
};
