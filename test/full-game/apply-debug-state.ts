import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = true;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 19344 }, defender: { entityId: 20503 } },
		{ attacker: { entityId: 20486 }, defender: { entityId: 19352 } },
		{ attacker: { entityId: 20486 }, defender: { entityId: 19538 } },
		{ attacker: { attack: 8, health: 5561 }, defender: { entityId: 19538 } },
	];
};
