import { debugState } from '../../src/debug-state';

export const applyDebugState = () => {
	const state = debugState;
	state.active = false;
	state.forcedCurrentAttacker = 1;
	state.forcedFaceOffBase = [
		{ attacker: { entityId: 1652 }, defender: { entityId: 1148 } },
		{ attacker: { entityId: 1148 }, defender: { attack: 3, health: 2 } },
	];
};
