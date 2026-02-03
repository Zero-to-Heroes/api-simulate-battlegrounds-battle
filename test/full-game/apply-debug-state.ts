import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 0;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 12259 }, defender: { entityId: 9579 } },
		{ attacker: { attack: 3, health: 1 }, defender: { entityId: 7712 } },
	];
};
