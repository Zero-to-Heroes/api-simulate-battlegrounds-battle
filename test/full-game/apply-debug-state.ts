import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 3469 }, defender: { entityId: 4701 } },
		{ attacker: { entityId: 4701 }, defender: { entityId: 3472 } },
		{ attacker: { entityId: 4701 }, defender: { entityId: 3474 } },
		{ attacker: { entityId: 3467 }, defender: { attack: 21, health: 21 } },
	];
};
