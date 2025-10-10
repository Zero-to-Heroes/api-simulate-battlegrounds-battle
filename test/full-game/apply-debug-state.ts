import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 3453 }, defender: { entityId: 4959 } },
		{ attacker: { entityId: 4956 }, defender: { attack: 4, health: 3 } },
		{ attacker: { entityId: 3454 }, defender: { entityId: 4963 } },
		{ attacker: { entityId: 4960 }, defender: { attack: 4, health: 3 } },
		{ attacker: { attack: 5, health: 5 }, defender: { entityId: 4963 } },
	];
};
